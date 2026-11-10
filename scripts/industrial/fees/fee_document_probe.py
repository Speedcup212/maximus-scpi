#!/usr/bin/env python3
"""RECOVERY-200 / chantier A — découverte des DIC et notes d'information, et relevé
brut des clauses de frais.

Lecture seule. Ce script ne valide AUCUN taux : il produit, pour chaque document
officiel téléchargé, l'URL finale, l'empreinte SHA-256, le nombre de pages, la nature
présumée (DIC / note / autre), le contrôle d'identité du fonds et les extraits paginés
contenant une clause de frais. La qualification (taux, assiette, HT/TTC, date de
validité) est faite ensuite par revue, puis par `build_fee_evidence.mjs`.

TLS reste toujours vérifié (aucun verify=False) ; un échec réseau devient un blocage
explicite dans le rapport, jamais une valeur.
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import hashlib
import json
import pathlib
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'agents'))
try:  # Réutilise la chaîne TLS vérifiée existante (RECOVERY-197) quand elle est disponible.
    from bulletin_source_transport import ssl_context as _verified_context  # type: ignore
    SSL_CONTEXT = _verified_context()
except Exception:  # pragma: no cover - repli sur le contexte système, toujours vérifié
    import ssl
    SSL_CONTEXT = ssl.create_default_context()

USER_AGENT = 'MaximusSCPI-fee-probe/1.0 (+https://www.maximusscpi.com/)'
MAX_PDF_BYTES = 30 * 1024 * 1024
MAX_SUBPAGES = 8
MAX_PDFS = 16
EXTRA_HOSTS = {'corpocdn.blob.core.windows.net'}

DOC_LINK = re.compile(
    r"(document[\s_%20-]*d[’'%27\s_-]*informations?[\s_%20-]*cl|\bdici?\b|\bkid\b|priips|"
    r"note[\s_%20-]*d[’'%27\s_-]*information|\bni[-_]|notice|statuts|r[ée]glementaire|documentation|documents?|t[ée]l[ée]charg)",
    re.I)
DIC_LINK = re.compile(r"(document[\s_%20-]*d[’'%27\s_-]*informations?[\s_%20-]*cl|\bdici?\b|\bkid\b|priips)", re.I)
NOTE_LINK = re.compile(r"(note[\s_%20-]*d[’'%27\s_-]*information|\bni[-_ ])", re.I)
BULLETIN_LINK = re.compile(r"(bulletin|\bbti\b|\bbt[-_ ]|reporting|trimestriel|rapport[\s_-]*annuel|newsletter)", re.I)
PDF_HREF = re.compile(r"\.pdf($|[?#])", re.I)

FEE_RE = re.compile(
    r"(?:commissions?|frais|r[ée]mun[ée]rations?)\s+(?:de\s+|d['’]\s*)"
    r"(souscription|gestion|cession|retrait|arbitrage|suivi|pilotage|acquisition|transfert|mutation)"
    r"|co[uû]ts\s+d['’]\s*(entr[ée]e|sortie)|co[uû]ts\s+(r[ée]currents|de\s+transaction)", re.I)
PERCENT_RE = re.compile(r"(\d{1,2}(?:[.,]\d{1,4})?)\s*%")
TAX_RE = re.compile(r"\b(HT|H\.T\.?|hors\s+taxes?|TTC|T\.T\.C\.?|toutes\s+taxes\s+comprises|TVA)\b", re.I)
BASIS_TAGS = {
    'prix_souscription': re.compile(r"prix\s+de\s+souscription|prix\s+d['’]\s*[ée]mission|montant\s+(?:de\s+la\s+|des\s+)?souscription|montant\s+souscrit", re.I),
    'produits_locatifs_encaisses': re.compile(r"produits\s+locatifs[^.]{0,40}encaiss|loyers[^.]{0,30}encaiss|recettes\s+locatives|revenus\s+locatifs", re.I),
    'produits_financiers': re.compile(r"produits\s+financiers", re.I),
    'actifs_valeur': re.compile(r"actif\s+brut|valeur\s+(?:v[ée]nale|d['’]\s*expertise|des\s+actifs|de\s+r[ée]alisation|globale)|capitalisation|actif\s+net|valeur\s+des\s+immeubles", re.I),
    'prix_cession': re.compile(r"prix\s+de\s+(?:cession|vente)|prix\s+net\s+vendeur", re.I),
}
MONTHS = 'janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre'
DATE_RE = re.compile(rf"\b(\d{{1,2}}(?:er)?\s+(?:{MONTHS})\s+20\d{{2}}|\d{{1,2}}[/.]\d{{1,2}}[/.]20\d{{2}}|(?:{MONTHS})\s+20\d{{2}})\b", re.I)


def norm(text: str) -> str:
    text = text.replace('œ', 'oe').replace('Œ', 'OE').replace(' ', ' ').replace('’', "'")
    text = unicodedata.normalize('NFD', text)
    text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def clean(text: str) -> str:
    text = text.replace(' ', ' ').replace(' ', ' ').replace('’', "'").replace('‐', '-').replace('‑', '-')
    return re.sub(r'\s+', ' ', text).strip()


def registrable(host: str) -> str:
    parts = (host or '').lower().split('.')
    return '.'.join(parts[-2:]) if len(parts) >= 2 else host


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []
        self.base: str | None = None
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag == 'base' and self.base is None:
            self.base = dict(attrs).get('href')
        if tag == 'a':
            attributes = dict(attrs)
            self._href = attributes.get('href')
            self._text = [attributes.get('title') or '', attributes.get('aria-label') or '']

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag == 'a' and self._href is not None:
            self.links.append((self._href, clean(' '.join(self._text))))
            self._href = None


def http_get(url: str, accept: str, limit: int) -> tuple[bytes, str, str, int]:
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != 'https':
        raise ValueError('non_https_url_refused')
    safe = urllib.parse.urlunsplit((parts.scheme, parts.netloc,
                                    urllib.parse.quote(parts.path, safe="/%:@!$&'()*+,;="),
                                    urllib.parse.quote(parts.query, safe="=&%:/?@!$'()*+,;[]"), ''))
    request = urllib.request.Request(safe, headers={'User-Agent': USER_AGENT, 'Accept': accept,
                                                    'Accept-Language': 'fr-FR,fr;q=0.9'})
    with urllib.request.urlopen(request, timeout=45, context=SSL_CONTEXT) as response:
        final = response.geturl()
        if urllib.parse.urlsplit(final).scheme != 'https':
            raise ValueError('redirect_to_non_https_refused')
        body = response.read(limit + 1)
        if len(body) > limit:
            raise ValueError('document_too_large')
        return body, final, response.headers.get('Content-Type', ''), response.status


RAW_PDF_RE = re.compile(r'''((?:https?:)?(?:\\?/){2}[^"'\s<>\\]+?\.pdf(?:\?[^"'\s<>\\]*)?|/[^"'\s<>\\]+?\.pdf)(?=["'\s<>\\])''', re.I)


def raw_pdf_links(html: str) -> list[str]:
    """Liens PDF présents hors balises <a> (JSON embarqué, scripts) — sites rendus côté client."""
    text = html.replace('\\/', '/').replace('\\u002F', '/').replace('\\u002f', '/').replace('&amp;', '&')
    return sorted({m.group(1) for m in RAW_PDF_RE.finditer(text)})


def html_title(body: bytes) -> str:
    match = re.search(rb'<title[^>]*>(.*?)</title>', body[:200000], re.I | re.S)
    return clean(match.group(1).decode('utf-8', errors='replace'))[:160] if match else ''


def allowed(url: str, seeds: set[str]) -> bool:
    host = urllib.parse.urlsplit(url).hostname or ''
    return registrable(host) in seeds or host in EXTRA_HOSTS


def score_link(href: str, text: str, aliases_norm: list[str]) -> int:
    blob = f'{urllib.parse.unquote(href)} {text}'
    score = 0
    if DIC_LINK.search(blob):
        score += 6
    if NOTE_LINK.search(blob):
        score += 6
    if any(a and a in norm(blob) for a in aliases_norm):
        score += 3
    if BULLETIN_LINK.search(blob):
        score -= 4
    return score


def classify(pages: list[str]) -> str:
    head = norm(' '.join(pages[:3]))
    first = norm(pages[0] if pages else '')
    if re.search(r"document d ?informations? cles|key information document|priips", first):
        return 'dic'
    if 'note d information' in head and ('visa' in head or 'autorite des marches financiers' in head or 'amf' in head):
        return 'note'
    if 'note d information' in first[:900] and not re.search(r"bulletin (trimestriel|semestriel)|rapport annuel 20", first[:400]):
        return 'note'
    if 'statuts' in first and 'article' in head:
        return 'statuts'
    if re.search(r"bulletin|trimestriel|reporting", first):
        return 'bulletin'
    if 'rapport annuel' in head:
        return 'rapport_annuel'
    return 'autre'


def fee_clauses(pages: list[str]) -> list[dict]:
    clauses, seen = [], set()
    for number, raw in enumerate(pages, start=1):
        text = clean(raw)
        for match in FEE_RE.finditer(text):
            start = max(0, match.start() - 160)
            snippet = text[start: match.start() + 640]
            key = (number, clean(match.group(0)).lower(), snippet[match.start() - start: match.start() - start + 200])
            if key in seen:
                continue
            seen.add(key)
            percents = []
            for p in PERCENT_RE.finditer(snippet):
                after = snippet[p.end(): p.end() + 45]
                tax = TAX_RE.search(after)
                percents.append({'raw': p.group(0), 'value': float(p.group(1).replace(',', '.')),
                                 'tax_hint': tax.group(1) if tax else None, 'after': clean(after)})
            clauses.append({'page': number, 'label': clean(match.group(0)), 'snippet': snippet,
                            'percents': percents[:12],
                            'basis_tags': sorted(t for t, rx in BASIS_TAGS.items() if rx.search(snippet))})
            if len(clauses) >= 60:
                return clauses
    return clauses


def probe_pdf(url: str, aliases_norm: list[str]) -> dict:
    result: dict = {'url': url}
    try:
        body, final, ctype, status = http_get(url, 'application/pdf,*/*;q=0.5', MAX_PDF_BYTES)
        result.update({'final_url': final, 'http_status': status, 'content_type': ctype, 'bytes': len(body)})
        if not body.startswith(b'%PDF'):
            result['error'] = 'not_a_pdf'
            result['html_title'] = html_title(body)
            if 'html' in ctype.lower():
                result['_html'] = body.decode('utf-8', errors='replace')
            return result
        result['sha256'] = hashlib.sha256(body).hexdigest()
        import fitz  # PyMuPDF
        with fitz.open(stream=body, filetype='pdf') as document:
            pages = [page.get_text('text') for page in document]
            result['metadata'] = {k: v for k, v in (document.metadata or {}).items() if v}
        result['page_count'] = len(pages)
        result['text_characters'] = sum(len(p) for p in pages)
        result['kind'] = classify(pages)
        meta_title = norm(str(result['metadata'].get('title', '')))
        hit, where = None, None
        for label, zone in (('pages_1_4', norm(' '.join(pages[:4]))), ('pages_5_10', norm(' '.join(pages[4:10]))), ('metadata_title', meta_title)):
            hit = next((a for a in aliases_norm if a and re.search(rf'(^| ){re.escape(a)}( |$)', zone)), None)
            if hit:
                where = label
                break
        result['identity_match'] = bool(hit)
        result['identity_alias'] = hit
        result['identity_where'] = where
        result['title_excerpt'] = clean(pages[0])[:400] if pages else ''
        result['dates'] = sorted({m.group(1) for m in DATE_RE.finditer(clean(' '.join(pages[:3])))})[:12]
        result['fee_clauses'] = fee_clauses(pages) if result['kind'] in ('dic', 'note', 'statuts', 'autre') else []
        fee_page_numbers = sorted({c['page'] for c in result['fee_clauses']})[:10]
        result['fee_pages'] = {str(n): clean(pages[n - 1])[:7000] for n in fee_page_numbers} if result['identity_match'] else {}
    except (urllib.error.URLError, OSError, ValueError, RuntimeError) as error:
        result['error'] = f'{type(error).__name__}: {str(error)[:300]}'
    return result


def probe_fund(fund: dict) -> dict:
    aliases = [fund['name'], *fund.get('aliases', [])]
    aliases_norm = sorted({norm(a) for a in aliases if norm(a)}, key=len, reverse=True)
    seeds = {registrable(urllib.parse.urlsplit(u).hostname or '') for u in fund['pages']}
    report = {'slug': fund['slug'], 'name': fund['name'], 'manager': fund.get('manager'), 'crawl': [], 'documents': []}
    candidates: dict[str, int] = {u: 50 for u in fund.get('known_docs', [])}
    subpages: dict[str, int] = {}
    linked_from: dict[str, str] = {}

    def crawl(url: str, depth: int):
        entry = {'url': url, 'depth': depth}
        try:
            body, final, ctype, status = http_get(url, 'text/html,application/xhtml+xml', 6 * 1024 * 1024)
            entry.update({'final_url': final, 'http_status': status})
            if 'pdf' in ctype.lower() or body.startswith(b'%PDF'):
                candidates.setdefault(final, 20)
                entry['is_pdf'] = True
                return
            html = body.decode('utf-8', errors='replace')
            parser = LinkParser()
            parser.feed(html)
            base = urllib.parse.urljoin(final, parser.base) if parser.base else final
            entry['base_href'] = parser.base
            found = 0
            links = parser.links + [(href, '') for href in raw_pdf_links(html)]
            for href, text in links:
                if not href or href.startswith(('mailto:', 'tel:', 'javascript:', '#')):
                    continue
                absolute = urllib.parse.urljoin(base, href if not href.startswith('//') else 'https:' + href).split('#')[0]
                if not absolute.startswith('https://'):
                    continue
                if not allowed(absolute, seeds):
                    # PDF hébergé hors domaine mais lié depuis une page officielle : candidat tracé.
                    if PDF_HREF.search(absolute):
                        linked_from.setdefault(absolute, final)
                        candidates[absolute] = max(candidates.get(absolute, -99), score_link(absolute, text, aliases_norm) - 1)
                        found += 1
                    continue
                score = score_link(absolute, text, aliases_norm)
                if PDF_HREF.search(absolute) or re.search(r'(dic|kid|note).{0,40}(pdf|t[ée]l[ée]charg)', text, re.I):
                    candidates[absolute] = max(candidates.get(absolute, -99), score)
                    found += 1
                elif depth == 0 and DOC_LINK.search(f'{urllib.parse.unquote(absolute)} {text}'):
                    subpages[absolute] = max(subpages.get(absolute, -99), score)
            entry['pdf_links'] = found
        except (urllib.error.URLError, OSError, ValueError, RuntimeError) as error:
            entry['error'] = f'{type(error).__name__}: {str(error)[:300]}'
        finally:
            report['crawl'].append(entry)

    for page in fund['pages']:
        crawl(page, 0)
    for url, _ in sorted(subpages.items(), key=lambda kv: -kv[1])[:MAX_SUBPAGES]:
        if url not in fund['pages']:
            crawl(url, 1)

    ranked = [u for u, s in sorted(candidates.items(), key=lambda kv: -kv[1]) if s > -4][:MAX_PDFS]
    report['candidate_count'] = len(candidates)
    seen = set(ranked)
    hop: list[str] = []
    for url in ranked:
        doc = probe_pdf(url, aliases_norm)
        html = doc.pop('_html', None)
        if url in linked_from:
            doc['linked_from'] = linked_from[url]
            doc['off_domain'] = True
        if html and allowed(doc.get('final_url', url), seeds):
            # Page HTML intermédiaire (ex. « /documentations/note-... ») : on suit ses liens PDF une fois.
            parser = LinkParser()
            parser.feed(html)
            base = urllib.parse.urljoin(doc.get('final_url', url), parser.base) if parser.base else doc.get('final_url', url)
            found = []
            for href, text in parser.links + [(h, '') for h in raw_pdf_links(html)]:
                absolute = urllib.parse.urljoin(base, href).split('#')[0]
                if absolute.startswith('https://') and PDF_HREF.search(absolute) and absolute not in seen and score_link(absolute, text, aliases_norm) > 0:
                    found.append(absolute)
                    seen.add(absolute)
                    linked_from.setdefault(absolute, doc.get('final_url', url))
            doc['followed_pdf_links'] = found[:6]
            hop.extend(found[:6])
        report['documents'].append(doc)
        time.sleep(0.3)
    for url in hop[:MAX_PDFS]:
        doc = probe_pdf(url, aliases_norm)
        doc.pop('_html', None)
        doc['linked_from'] = linked_from.get(url)
        report['documents'].append(doc)
        time.sleep(0.3)
    docs = report['documents']
    report['summary'] = {
        'dic_identity_ok': sum(1 for d in docs if d.get('kind') == 'dic' and d.get('identity_match')),
        'note_identity_ok': sum(1 for d in docs if d.get('kind') == 'note' and d.get('identity_match')),
        'fee_clauses': sum(len(d.get('fee_clauses', [])) for d in docs if d.get('identity_match')),
        'errors': sum(1 for d in docs if d.get('error')) + sum(1 for c in report['crawl'] if c.get('error')),
    }
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', default=str(pathlib.Path(__file__).with_name('fee-sources.json')))
    parser.add_argument('--out', required=True)
    parser.add_argument('--only', nargs='*')
    parser.add_argument('--workers', type=int, default=8)
    args = parser.parse_args()
    funds = json.loads(pathlib.Path(args.manifest).read_text())['funds']
    if args.only:
        funds = [f for f in funds if f['slug'] in set(args.only)]
    out = pathlib.Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    summary = []
    with cf.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for report in pool.map(probe_fund, funds):
            (out / f"{report['slug']}.json").write_text(json.dumps(report, ensure_ascii=False, indent=1) + '\n')
            summary.append({'slug': report['slug'], **report['summary'], 'documents': len(report['documents'])})
            print(json.dumps(summary[-1], ensure_ascii=False), flush=True)
    summary.sort(key=lambda r: r['slug'])
    (out / '_summary.json').write_text(json.dumps({
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'funds': len(summary),
        'with_dic': sum(1 for r in summary if r['dic_identity_ok']),
        'with_note': sum(1 for r in summary if r['note_identity_ok']),
        'rates_validated': 0,
        'rows': summary}, ensure_ascii=False, indent=1) + '\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
