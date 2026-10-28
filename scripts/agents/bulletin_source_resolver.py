"""Resolve public issuer pages to an actual, same-fund, same-issue PDF.

HTML, redirects and a filename are discovery evidence, never financial proof.
The caller supplies the existing public downloader and two-reader PDF verifier.
"""
from __future__ import annotations
import hashlib, html, html.parser, re, unicodedata, urllib.parse

VERSION = 'issuer-source-resolution-20261028-v1'

def norm(value):
    value = unicodedata.normalize('NFKD', urllib.parse.unquote(str(value))).replace('œ', 'oe')
    return re.sub(r'\s+', ' ', ''.join(c for c in value if not unicodedata.combining(c))).lower()

def issue_hints(value):
    """Only explicit issue labels; an upload date alone supplies no quarter."""
    value = norm(value)
    found = set()
    for pattern, reverse in [
        (r'(20\d{2})[\s_./-]*[tq]([1-4])(?!\d)', False),
        (r'(?<![a-z0-9])[tq]([1-4])[\s_./-]*(20\d{2})(?!\d)', True),
        (r'(?<!\d)([1-4])(?:er|eme|e)?[\s_./-]*(?:trimestre|t)[\s_./-]*(20\d{2})(?!\d)', True),
        (r'(20\d{2})[\s_./-]*([1-4])[\s_./-]*t(?![a-z])', False),
    ]:
        for match in re.finditer(pattern, value):
            first, second = match.groups()
            year, quarter = (second, first) if reverse else (first, second)
            found.add(year + '-T' + quarter)
    return found

def absolute_url(base, value):
    if not value:return None
    value = html.unescape(value).replace('\\/', '/').strip()
    url = urllib.parse.urljoin(base, value)
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != 'https' or not parts.hostname or parts.username or parts.password:
        return None
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, parts.query, ''))

def document_link(url, label=''):
    path = urllib.parse.urlsplit(url).path.lower()
    return bool(re.search(r'\.pdf$', path) or '/content/download/' in path or
                ('/documents/' in path and re.search(r'bulletin|trimestr|bti', norm(label + ' ' + path))))

class SourceHTML(html.parser.HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base, self.links, self.text, self.title, self.headings = base, [], [], [], []
        self.anchor, self.hidden, self.in_title, self.in_heading = None, [], False, False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in ('script', 'style', 'noscript'):
            self.hidden.append(tag)
        if tag == 'title': self.in_title = True
        if tag in ('h1', 'h2'): self.in_heading = True
        if tag == 'a':
            self.anchor = {'url': absolute_url(self.base, values.get('href', '')),
                           'text': values.get('aria-label', '') + ' ' + values.get('title', '')}
        for name in ('src', 'data-src', 'data-download-url-value', 'data-href'):
            if name in values:
                url = absolute_url(self.base, values[name])
                if url and document_link(url, values.get('title', '')):
                    self.links.append({'url': url, 'text': values.get('title', '')})

    def handle_endtag(self, tag):
        if tag in self.hidden:
            self.hidden.remove(tag)
        if tag == 'title': self.in_title = False
        if tag in ('h1', 'h2'): self.in_heading = False
        if tag == 'a' and self.anchor:
            if self.anchor['url']: self.links.append(self.anchor)
            self.anchor = None

    def handle_data(self, text):
        if self.hidden: return
        if self.anchor: self.anchor['text'] += ' ' + text.strip()
        if self.in_title: self.title.append(text)
        if self.in_heading: self.headings.append(text)
        self.text.append(text)

def parse_html(data, url):
    parser = SourceHTML(url)
    source = data.decode('utf-8', 'replace')
    parser.feed(source)
    # Some publisher PDF links live in JSON attributes rather than anchors.
    decoded = html.unescape(source).replace('\\/', '/')
    for match in re.finditer(r'''https://[^\s"'<>\\]+\.pdf(?:\?[^\s"'<>\\]*)?''', decoded, re.I):
        candidate = absolute_url(url, match.group())
        if candidate: parser.links.append({'url': candidate, 'text': ''})
    title = ' '.join(parser.title).strip()
    blocked = bool(re.search(r'just a moment|access denied|403 forbidden|captcha|security check', norm(title))
                   or re.search(r'/\.well-known/sgcaptcha/|cf-chl-|g-recaptcha|hcaptcha', source, re.I))
    unique={}
    for link in parser.links:
        if link['url'] not in unique or (link['text'].strip() and not unique[link['url']]['text'].strip()):
            unique[link['url']]=link
    return {'url': url, 'sha256': hashlib.sha256(data).hexdigest(), 'title': title,
            'headings': ' '.join(parser.headings), 'text': ' '.join(parser.text),
            'links': list(unique.values()), 'access_blocked': blocked}

def candidates(page, period):
    """Select every matching or undated document, never another explicit issue."""
    docs, wrappers = [], []
    for link in page['links']:
        description = norm(link['text'] + ' ' + link['url'])
        hints = issue_hints(description)
        if hints and period not in hints: continue
        if (re.search(r'rapport|annuel|statuts|note[._ /-]*(?:d[._ /-]*)?information|\bdic\b|sfdr|guide|transparence|extra.financier|fiche.commerciale|taxonomie|scenario.performance|durabilite|engagement.esg', description)
                and not re.search(r'bulletin|bti|trimestr', description)):
            continue
        if document_link(link['url'], link['text']):
            docs.append(link)
        elif (urllib.parse.urlsplit(link['url']).hostname == urllib.parse.urlsplit(page['url']).hostname
              and re.search(r'bulletin|trimestr|/document/', norm(link['text'] + ' ' + link['url']))
              and (not hints or period in hints)):
            wrappers.append(link)
    docs.sort(key=lambda x: period not in issue_hints(x['text'] + ' ' + x['url']))
    return docs, wrappers

def resolve(item, initial, fetch, verify):
    """Visit registered/official pages and their issue links; report every failure.

    `fetch(url)` returns bytes and their final public URL. `verify(bytes)` must
    independently verify identity and issue with MuPDF and Poppler.
    """
    visited, errors, pages, documents = set(), [], [], []
    queue = []
    if initial:
        queue.append((initial['url'], initial['data'], 0))
    official = item.get('official_scpi_page_url')
    if official and (not initial or official != initial['url']): queue.append((official, None, 0))
    for url, data, depth in queue:
        if url in visited: continue
        visited.add(url)
        requested_url=url
        try:
            if data is None: data, url = fetch(url)
            if data.startswith(b'%PDF'):
                if verify(data):
                    return {'matched': True, 'source_url': requested_url, 'publisher_page': requested_url,
                            'sha256': hashlib.sha256(data).hexdigest(), 'pages': pages, 'errors': errors}
                continue
            page = parse_html(data, url)
            pages.append({k: v for k, v in page.items() if k not in ('links', 'text')})
            if page['access_blocked']:
                errors.append({'url': url, 'error': 'publisher_access_challenge'}); continue
            pdfs, wrappers = candidates(page, item['period'])
            for link in pdfs:
                if link['url'] in visited: continue
                visited.add(link['url'])
                try:
                    pdf, final = fetch(link['url'])
                    if pdf.startswith(b'%PDF') and verify(pdf):
                        return {'matched': True, 'source_url': link['url'], 'linked_url': link['url'],
                                'publisher_page': url, 'publisher_page_sha256': page['sha256'],
                                'link_text': link['text'], 'sha256': hashlib.sha256(pdf).hexdigest(),
                                'pages': pages, 'errors': errors}
                    documents.append({'url': link['url'], 'outcome': 'identity_or_issue_unverified' if pdf.startswith(b'%PDF') else 'download_returned_html'})
                except (OSError, ValueError, RuntimeError) as error:
                    errors.append({'url': link['url'], 'error': str(error)[:300]})
            # Documentation wrappers are followed, while a general site crawl is
            # kept out of a single document lease. A gap remains explicit.
            if depth < 1:
                queue.extend((link['url'], None, depth + 1) for link in wrappers)
        except (OSError, ValueError, RuntimeError) as error:
            errors.append({'url': url, 'error': str(error)[:300]})
    return {'matched': False, 'pages': pages, 'errors': errors, 'documents_checked': documents,
            'reason': 'no_verified_same_fund_same_issue_pdf'}
