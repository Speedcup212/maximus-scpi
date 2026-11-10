#!/usr/bin/env python3
"""RECOVERY-200 — rapprochement du catalogue statique avec les frais prouvés.

- Un frais vérifié (DIC/note, SHA-256, page, extrait) remplace la valeur héritée du
  catalogue et y dépose sa provenance : c'est la réconciliation exigée par
  `selectProvenFee` avant tout remplacement d'une valeur héritée.
- Une valeur héritée identifiée comme coût PRIIPs du DIC (assiette « valeur de
  l'investissement », sans rapport avec la commission de gestion sur les loyers) est
  retirée lorsqu'aucune commission prouvée ne la remplace : inconnu ≠ zéro.
- Les conflits avec une valeur déjà certifiée ne sont pas touchés ; ils sont listés.
- Une non-applicabilité prouvée (variabilité du capital suspendue : plus de souscription au
  marché primaire) retire le taux affiché et dépose une provenance `not_applicable` datée et
  sourcée ; ce n'est jamais un zéro.
"""
import argparse
import json
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[3]
CATALOG = ROOT / 'src/data/scpi_complet.json'
REPORT = ROOT / 'reports/industrial-20261109'
FIELD = {'frais_souscription': 'Frais de souscription (TTC/%)', 'frais_gestion': 'Frais de gestion (HT/%)'}
SKIP_ALREADY_CERTIFIED = {('accimmo-pierre', 'frais_souscription'), ('sofidynamic', 'frais_souscription'),
                          ('sofidynamic', 'frais_gestion'), ('edr-europa', 'frais_gestion'),
                          # Décision antérieure explicite (not_certified_effective_rate) : arbitrage humain requis.
                          ('acces-valeur-pierre', 'frais_gestion'),
                          # Même écart d'arrondi qu'Accimmo (10,72 contre 10,716 % TTC) : même traitement, arbitrage humain.
                          ('acces-valeur-pierre', 'frais_souscription')}


def slugify(name: str) -> str:
    text = unicodedata.normalize('NFD', name.replace('œ', 'oe').replace('’', "'"))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--inputs', default=str(REPORT), help='dossier contenant indicator-patches.json et fee-evidence-rows.json')
    parser.add_argument('--out', default=str(REPORT), help='dossier du rapport catalog-fee-reconciliation.json')
    parser.add_argument('--not-applicable', default=None, help='preuves de non-applicabilité (fee-not-applicable.json)')
    args = parser.parse_args()
    inputs, out = pathlib.Path(args.inputs), pathlib.Path(args.out)
    catalog = json.loads(CATALOG.read_text())
    patches = json.loads((inputs / 'indicator-patches.json').read_text())
    rows = json.loads((inputs / 'fee-evidence-rows.json').read_text())
    not_applicable = json.loads(pathlib.Path(args.not_applicable).read_text())['funds'] if args.not_applicable else {}
    by_slug = {slugify(entry['Nom SCPI']): entry for entry in catalog}
    changes, conflicts = [], []
    for patch in patches:
        key = (patch['scpi_slug'], patch['column'])
        entry = by_slug.get(patch['scpi_slug'])
        if entry is None:
            conflicts.append({'slug': patch['scpi_slug'], 'metric': patch['column'], 'issue': 'absent_du_catalogue'})
            continue
        if key in SKIP_ALREADY_CERTIFIED:
            conflicts.append({'slug': key[0], 'metric': key[1], 'issue': 'valeur_deja_certifiee_conservee',
                              'catalog': entry.get(FIELD[key[1]]), 'proven': patch['value']})
            continue
        label = FIELD[patch['column']]
        before = entry.get(label)
        entry[label] = patch['value']
        provenance = dict(entry.get('maximus_metric_provenance') or {})
        provenance[patch['column']] = patch['provenance']
        entry['maximus_metric_provenance'] = provenance
        if patch['column'] == 'frais_gestion':
            entry['Frais de gestion - assiette'] = patch['provenance']['assessment_basis']
        changes.append({'slug': patch['scpi_slug'], 'metric': patch['column'], 'before': before, 'after': patch['value'],
                        'tax_label': patch['provenance']['tax_label'], 'page': patch['provenance']['source_page']})
    proven_management = {p['scpi_slug'] for p in patches if p['column'] == 'frais_gestion'}
    for row in rows:
        if row['fee_kind'] != 'gestion' or not row['catalog_value_is_priips_cost'] or row['scpi_slug'] in proven_management:
            continue
        entry = by_slug.get(row['scpi_slug'])
        if entry is None or entry.get(FIELD['frais_gestion']) is None:
            continue
        before = entry[FIELD['frais_gestion']]
        entry[FIELD['frais_gestion']] = None
        provenance = dict(entry.get('maximus_metric_provenance') or {})
        provenance['frais_gestion'] = {'verification_status': row['verification_status'], 'value_state': 'unknown',
                                       'reason': "Valeur héritée égale au coût PRIIPs du DIC (assiette : valeur de l'investissement), "
                                                 "retirée ; commission de gestion sur les loyers non encore prouvée.",
                                       'recovery_task': 'RECOVERY-200'}
        if row['verification_status'] == 'verified' and row['rate_ttc'] is not None:
            provenance['frais_gestion']['documented_rate_ttc'] = row['rate_ttc']
            provenance['frais_gestion']['documented_tax_label'] = row['tax_label']
            provenance['frais_gestion']['source_url'] = row['source_url']
            provenance['frais_gestion']['source_page'] = row['source_page']
        entry['maximus_metric_provenance'] = provenance
        changes.append({'slug': row['scpi_slug'], 'metric': 'frais_gestion', 'before': before, 'after': None,
                        'tax_label': None, 'page': None, 'action': 'retrait_cout_priips'})
    for slug, proof in sorted(not_applicable.items()):
        entry = by_slug.get(slug)
        if entry is None:
            conflicts.append({'slug': slug, 'metric': 'frais_souscription', 'issue': 'absent_du_catalogue'})
            continue
        before = entry.get(FIELD['frais_souscription'])
        entry[FIELD['frais_souscription']] = None
        provenance = dict(entry.get('maximus_metric_provenance') or {})
        provenance['frais_souscription'] = {
            'verification_status': 'verified', 'value_state': 'not_applicable', 'valid_from': proof['valid_from'],
            'source_url': proof['source_url'], 'evidence_text': proof['evidence_text'],
            'reason': 'Variabilité du capital suspendue : pas de souscription au marché primaire.',
            'recovery_task': 'RECOVERY-200'}
        entry['maximus_metric_provenance'] = provenance
        changes.append({'slug': slug, 'metric': 'frais_souscription', 'before': before, 'after': None,
                        'tax_label': None, 'page': None, 'action': 'non_applicable_variabilite_suspendue'})
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2))
    out.mkdir(parents=True, exist_ok=True)
    (out / 'catalog-fee-reconciliation.json').write_text(
        json.dumps({'changes': changes, 'conflicts': conflicts}, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps({'changes': len(changes), 'conflicts': len(conflicts),
                      'value_changed': sum(1 for c in changes if c['before'] != c['after'])}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
