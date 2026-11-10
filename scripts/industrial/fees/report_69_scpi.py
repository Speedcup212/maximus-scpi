#!/usr/bin/env python3
"""RECOVERY-200 — tableau avant/après des 69 SCPI (frais, T3, anomalies) à partir des fichiers versionnés.

Entrées : tableau de la première passe (reports/industrial-20261109/RECOVERY-200-69-scpi.csv),
lignes de preuve et patchs de la seconde passe, preuves de non-applicabilité, anomalies du 10/11.
La valeur « après » reproduit la règle de projection : un frais prouvé ne remplit qu'un champ
vide ou identique ; une non-applicabilité prouvée vide le champ ; un conflit reste en l'état.
"""
import csv
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
V1 = ROOT / 'reports/industrial-20261109'
V2 = ROOT / 'reports/industrial-20261110'
FEE = {'souscription': 'frais_souscription', 'gestion': 'frais_gestion'}


def num(value):
    return None if value in ('', None) else float(value)


def fmt(value):
    return '—' if value is None else f'{value:g}'


def proof_label(row):
    if row['verification_status'] == 'verified':
        if row['value_state'] == 'zero':
            return f"verified — 0 % explicite — {row['document_kind']} p.{row['source_page']}"
        rates = ' / '.join(f"{row[k]:g} % {t}" for k, t in (('rate_ht', 'HT'), ('rate_ttc', 'TTC')) if row[k] is not None)
        return f"verified — {rates} — {row['document_kind']} p.{row['source_page']}"
    state = ' (non applicable)' if row['value_state'] == 'not_applicable' else ''
    return f"{row['verification_status']}{state} — {row['reason']}"


def main():
    first = {r['slug']: r for r in csv.DictReader((V1 / 'RECOVERY-200-69-scpi.csv').open())}
    rows = {(r['scpi_slug'], r['fee_kind']): r for r in json.loads((V2 / 'fee-evidence-rows.json').read_text())}
    patches = {(p['scpi_slug'], p['column']): p['value'] for p in json.loads((V2 / 'indicator-patches.json').read_text())}
    not_applicable = json.loads((V2 / 'fee-not-applicable.json').read_text())['funds']
    anomalies = json.loads((V2 / 'anomalies-20261110.json').read_text())
    quality = json.loads((V2 / 'public-quality-20261110.json').read_text())['per_scpi_verified_partial_blocked']
    out = []
    for slug in sorted(first):
        f = first[slug]
        line = {'slug': slug}
        for fee, column in FEE.items():
            before = num(f[f'base_avant_{fee}'])
            after = num(f[f'base_apres_{fee}'])
            guarded = column in anomalies.get('projection_blocked', {}).get('funds', {}).get(slug, [])
            arbitrated = anomalies.get('arbitrated_2026_11_10', {}).get('funds', {}).get(slug, {})
            if column in arbitrated:
                after = arbitrated[column]
            elif fee == 'souscription' and slug in not_applicable:
                after = None
            elif after is None and (slug, column) in patches and not guarded:
                after = patches[(slug, column)]
            line[f'avant_{fee}'] = before
            line[f'apres_{fee}'] = after
            line[f'etat_{fee}'] = 'non_applicable' if fee == 'souscription' and slug in not_applicable else (
                'zero' if after == 0 else ('valeur' if after is not None else 'inconnu'))
            line[f'preuve_{fee}'] = proof_label(rows[(slug, fee)])
        line['t3'] = anomalies.get('t3', {}).get(slug, f['t3'])
        v, p, b = quality.get(slug, [0, 0, 0])
        line['metriques_verified_partial_blocked'] = f'{v} / {p} / {b}'
        notes = list(anomalies.get('by_scpi', {}).get(slug, []))
        for column in anomalies.get('projection_blocked', {}).get('funds', {}).get(slug, []):
            notes.append(f"{column} prouvé ({patches.get((slug, column))!s} %) non projeté en base : instantané manuel protégé ; affiché via le catalogue après déploiement")
        line['anomalies'] = ' ; '.join(notes) or '—'
        out.append(line)
    fields = list(out[0])
    with (V2 / 'RECOVERY-200-69-scpi.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for line in out:
            writer.writerow({k: ('' if v is None else v) for k, v in line.items()})
    md = ['| SCPI | Souscription avant → après | Preuve souscription | Gestion avant → après | Preuve gestion | T3 | Métriques verified / partial / blocked | Anomalies / blocages |',
          '|---|---|---|---|---|---|---|---|']
    for line in out:
        sous_after = 'n/a' if line['etat_souscription'] == 'non_applicable' else fmt(line['apres_souscription'])
        md.append(f"| {line['slug']} | {fmt(line['avant_souscription'])} → {sous_after} | {line['preuve_souscription']} | "
                  f"{fmt(line['avant_gestion'])} → {fmt(line['apres_gestion'])} | {line['preuve_gestion']} | {line['t3']} | {line['metriques_verified_partial_blocked']} | {line['anomalies']} |")
    (V2 / 'RECOVERY-200-69-scpi-table.md').write_text('\n'.join(md) + '\n')
    count = lambda key, test: sum(1 for line in out if test(line[key]))
    summary = {
        'funds': len(out),
        'souscription_avant': count('avant_souscription', lambda v: v is not None),
        'souscription_apres_valeur': count('apres_souscription', lambda v: v is not None),
        'souscription_non_applicable': count('etat_souscription', lambda v: v == 'non_applicable'),
        'gestion_avant': count('avant_gestion', lambda v: v is not None),
        'gestion_apres_valeur': count('apres_gestion', lambda v: v is not None),
    }
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    main()
