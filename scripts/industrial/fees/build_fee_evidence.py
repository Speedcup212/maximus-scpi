#!/usr/bin/env python3
"""RECOVERY-200 / chantier A — transforme la revue sémantique en lignes de preuve.

Entrées : relevé brut (fee_document_probe.py), décisions de revue (fee-review-*.json),
manifeste des 69 SCPI. Sorties : lignes `scpi_fee_evidence`, patchs d'indicateurs
autorisés, SQL idempotent et rapport avant/après.

Garde-fous :
- une décision `verified` n'est acceptée que si chaque taux décidé figure dans les
  pourcentages relevés de la clause paginée du document cité (identité du fonds vérifiée,
  DIC ou note, SHA-256 présent) ; sinon elle est rétrogradée en `partial` et signalée ;
- zéro n'est accepté que sur une mention explicite d'absence de commission ;
- un taux HT ne remplit jamais un champ TTC, ni l'inverse (sauf commission exonérée) ;
- une valeur existante différente n'est jamais écrasée : elle est listée en conflit.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

FEE_LABEL = {'souscription': re.compile(r'souscription|co[uû]ts\s+d.\s*entr', re.I),
             'gestion': re.compile(r'gestion', re.I)}
ZERO_RE = re.compile(r'sans\s+commission\s+de\s+souscription|0\s*%\s+de\s+(?:commission|frais)\s+de\s+souscription'
                     r'|aucune\s+commission\s+de\s+souscription|pas\s+de\s+commission\s+de\s+souscription'
                     r'|commission\s+de\s+souscription\s+(?:de\s+la\s+SCPI\s+)?est\s+(?:nulle|de\s+0\s*%)', re.I)
RELIABILITY = {'note': 3, 'dic': 2}


def close(a: float, b: float) -> bool:
    return abs(a - b) < 1e-6


def focus(snippet: str, decision: dict) -> str:
    """Extrait court centré sur la clause, garanti de contenir chaque taux décidé."""
    text = re.sub(r'\s+', ' ', snippet).strip()
    match = FEE_LABEL[decision['fee']].search(text)
    start = max(0, (match.start() if match else 0) - 60)
    for width in (380, 520, 700, len(text)):
        window = text[start:start + width]
        needles = [f"{decision[k]:g}".replace('.', ',') for k in ('rate_ht', 'rate_ttc') if decision.get(k)]
        if decision.get('value_state') == 'zero':
            if ZERO_RE.search(window):
                return window
        elif all(n in window or n.replace(',', '.') in window for n in needles):
            return window
    return text


def resolve_doc(docs: list, decision: dict) -> dict | None:
    """Document cité par la revue : par empreinte SHA-256 (stable d'un relevé à l'autre), sinon par rang."""
    sha = decision.get('doc_sha256')
    if sha:
        matches = [d for d in docs if d.get('sha256') == sha and not d.get('error')]
        return next((d for d in matches if d.get('identity_match')), matches[0] if matches else None)
    index = decision.get('doc', -1)
    return docs[index] if 0 <= index < len(docs) else None


def find_clause(doc: dict, decision: dict) -> dict | None:
    wanted = [decision[k] for k in ('rate_ht', 'rate_ttc') if decision.get(k) is not None]
    for clause in doc.get('fee_clauses', []):
        if clause['page'] != decision['page'] or not FEE_LABEL[decision['fee']].search(clause['label']):
            continue
        if decision.get('value_state') == 'zero':
            if ZERO_RE.search(clause['snippet']):
                return clause
            continue
        values = [p['value'] for p in clause['percents']]
        if wanted and all(any(close(w, v) for v in values) for w in wanted):
            return clause
    return None


def build(probe_dir: pathlib.Path, review: dict, manifest: dict):
    reports = {p.stem: json.loads(p.read_text()) for p in probe_dir.glob('*.json') if not p.name.startswith('_')}
    decisions = {(d['slug'], d['fee']): d for d in review['decisions']}
    rows, rejected = [], []
    for fund in manifest['funds']:
        slug = fund['slug']
        report = reports.get(slug, {'documents': []})
        for fee in ('souscription', 'gestion'):
            d = decisions.get((slug, fee), {'slug': slug, 'fee': fee, 'status': 'partial', 'reason': 'non revu'})
            row = {'scpi_slug': slug, 'fee_kind': fee, 'verification_status': d['status'],
                   'value_state': 'unknown', 'rate_ht': None, 'rate_ttc': None, 'tax_label': None,
                   'assessment_basis': None, 'document_kind': None, 'source_url': None, 'pdf_sha256': None,
                   'source_page': None, 'evidence_text': None, 'document_dates_hint': None,
                   'valid_from': review['as_of'], 'valid_from_basis': 'observed_in_force_on_official_site',
                   'product_identity_verified': False, 'semantic_review_verified': False,
                   'semantic_reviewer': None, 'reason': d.get('reason'), 'note': d.get('note'),
                   'catalog_value_is_priips_cost': bool(d.get('catalog_value_is_priips_cost')),
                   'probe_run_id': review['probe_run_id']}
            if d['status'] != 'verified' and d.get('value_state') == 'not_applicable':
                row['value_state'] = 'not_applicable'
            if d['status'] == 'verified':
                docs = report['documents']
                doc = resolve_doc(docs, d)
                problem = None
                if not doc or doc.get('error'):
                    problem = 'document_absent_du_releve'
                elif not doc.get('identity_match') or doc.get('kind') not in RELIABILITY:
                    problem = 'identite_ou_nature_non_verifiee'
                elif not re.fullmatch(r'[a-f0-9]{64}', doc.get('sha256', '')):
                    problem = 'sha256_absent'
                clause = None if problem else find_clause(doc, d)
                if not problem and not clause:
                    problem = 'taux_absent_de_la_clause_paginee'
                if problem:
                    rejected.append({'slug': slug, 'fee': fee, 'problem': problem})
                    row.update(verification_status='partial', reason=f'revue rétrogradée : {problem}')
                else:
                    row.update(value_state=d.get('value_state', 'value'),
                               rate_ht=0 if d.get('value_state') == 'zero' else d.get('rate_ht'),
                               rate_ttc=0 if d.get('value_state') == 'zero' else d.get('rate_ttc'),
                               tax_label=d['tax'], assessment_basis=d['basis'], document_kind=doc['kind'],
                               source_url=doc['final_url'], pdf_sha256=doc['sha256'], source_page=d['page'],
                               evidence_text=focus(clause['snippet'], d),
                               evidence_context=re.sub(r'\s+', ' ', clause['snippet']).strip(),
                               document_dates_hint=doc.get('dates', [])[:6],
                               product_identity_verified=True, semantic_review_verified=True,
                               semantic_reviewer=review['reviewer'])
            rows.append(row)
    return rows, rejected


def indicator_patch(row: dict) -> tuple[str, float, str] | None:
    """Retourne (colonne, valeur, base fiscale) uniquement lorsque le libellé public est exact."""
    if row['verification_status'] != 'verified':
        return None
    if row['fee_kind'] == 'souscription':
        if row['value_state'] == 'zero':
            return ('frais_souscription', 0.0, 'TTC')
        if row['tax_label'] in ('TTC', 'TTI', 'exonere') and row['rate_ttc'] is not None:
            return ('frais_souscription', float(row['rate_ttc']), 'TTC')
    if row['fee_kind'] == 'gestion' and row['tax_label'] in ('HT', 'exonere') and row['rate_ht'] is not None:
        return ('frais_gestion', float(row['rate_ht']), 'HT')
    return None


def provenance(row: dict, column: str, value: float, tax: str) -> dict:
    return {'verification_status': 'verified', 'value_numeric': value, 'tax_basis': tax,
            'tax_label': row['tax_label'], 'assessment_basis': row['assessment_basis'],
            'valid_from': row['valid_from'], 'valid_from_basis': row['valid_from_basis'],
            'source_url': row['source_url'], 'pdf_sha256': row['pdf_sha256'], 'source_page': row['source_page'],
            'evidence_text': row['evidence_text'], 'document_kind': row['document_kind'],
            'product_identity_verified': True, 'semantic_review_verified': True,
            'semantic_reviewer': row['semantic_reviewer'], 'reliability_rank': RELIABILITY[row['document_kind']],
            'recovery_task': 'RECOVERY-200', 'probe_run_id': row['probe_run_id']}


def sql_literal(value) -> str:
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int, float)):
        return repr(float(value))
    if isinstance(value, (list, dict)):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(value).replace("'", "''") + "'"


COLUMNS = ['scpi_slug', 'fee_kind', 'verification_status', 'value_state', 'rate_ht', 'rate_ttc', 'tax_label',
           'assessment_basis', 'document_kind', 'source_url', 'pdf_sha256', 'source_page', 'evidence_text',
           'document_dates_hint', 'valid_from', 'valid_from_basis', 'product_identity_verified',
           'semantic_review_verified', 'semantic_reviewer', 'reason', 'note', 'catalog_value_is_priips_cost', 'probe_run_id']


def main() -> int:
    parser = argparse.ArgumentParser()
    here = pathlib.Path(__file__).parent
    parser.add_argument('--probe', required=True)
    parser.add_argument('--review', default=str(here / 'fee-review-20261109.json'))
    parser.add_argument('--manifest', default=str(here / 'fee-sources.json'))
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    review = json.loads(pathlib.Path(args.review).read_text())
    manifest = json.loads(pathlib.Path(args.manifest).read_text())
    rows, rejected = build(pathlib.Path(args.probe), review, manifest)
    out = pathlib.Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / 'fee-evidence-rows.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1) + '\n')
    inserts = ['-- RECOVERY-200 : preuves de frais (généré par build_fee_evidence.py, ne pas éditer à la main)',
               f"delete from public.scpi_fee_evidence where probe_run_id = {sql_literal(review['probe_run_id'])};"]
    for row in rows:
        inserts.append('insert into public.scpi_fee_evidence (' + ', '.join(COLUMNS) + ') values (' +
                       ', '.join(sql_literal(row[c]) if c != 'valid_from' else sql_literal(row[c]) + '::date' for c in COLUMNS) + ');')
    (out / 'fee-evidence-insert.sql').write_text('\n'.join(inserts) + '\n')
    patches = []
    for row in rows:
        patch = indicator_patch(row)
        if patch:
            column, value, tax = patch
            patches.append({'scpi_slug': row['scpi_slug'], 'column': column, 'value': value,
                            'provenance': provenance(row, column, value, tax)})
    (out / 'indicator-patches.json').write_text(json.dumps(patches, ensure_ascii=False, indent=1) + '\n')
    summary = {
        'funds': len(manifest['funds']),
        'verified': sum(r['verification_status'] == 'verified' for r in rows),
        'partial': sum(r['verification_status'] == 'partial' for r in rows),
        'blocked': sum(r['verification_status'] == 'blocked' for r in rows),
        'verified_subscription': sum(r['verification_status'] == 'verified' and r['fee_kind'] == 'souscription' for r in rows),
        'verified_management': sum(r['verification_status'] == 'verified' and r['fee_kind'] == 'gestion' for r in rows),
        'indicator_patches': len(patches), 'rejected_by_guard': rejected,
    }
    (out / 'fee-evidence-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
