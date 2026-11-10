#!/usr/bin/env python3
"""Condense les preuves brutes du relevé de frais pour la revue sémantique (RECOVERY-200).

Sortie : une fiche courte par SCPI listant les documents d'identité vérifiée et les
meilleures clauses « souscription » et « gestion » (note d'information d'abord, puis DIC).
Aucune décision n'est prise ici ; la revue consigne ses décisions dans fee-review.json.
"""
import json
import pathlib
import re
import sys

PRIORITY = {'note': 0, 'dic': 1, 'statuts': 2, 'autre': 3}
METRICS = {
    'souscription': re.compile(r'souscription|co[uû]ts\s+d.\s*entr', re.I),
    'gestion': re.compile(r'gestion', re.I),
}


def best_clauses(docs, metric, limit):
    rows = []
    for doc in docs:
        if not doc.get('identity_match') or doc.get('error'):
            continue
        for clause in doc.get('fee_clauses', []):
            if not METRICS[metric].search(clause['label']):
                continue
            score = PRIORITY.get(doc.get('kind'), 4) * 10 - len(clause['percents']) - 3 * len(clause['basis_tags'])
            rows.append((score, doc, clause))
    rows.sort(key=lambda r: r[0])
    return rows[:limit]


def main(directory: str, limit: int = 3) -> None:
    for path in sorted(pathlib.Path(directory).glob('*.json')):
        if path.name.startswith('_'):
            continue
        report = json.loads(path.read_text())
        docs = report['documents']
        print(f"\n### {report['slug']} — {report['name']}")
        for i, doc in enumerate(docs):
            if doc.get('identity_match') and doc.get('kind') in ('dic', 'note'):
                print(f"  [D{i}] {doc['kind']} p={doc.get('page_count')} sha={doc.get('sha256', '')[:12]} dates={doc.get('dates', [])[:4]} url={doc.get('final_url')}")
        errors = [c for c in report['crawl'] if c.get('error')] + [d for d in docs if d.get('error')]
        if errors:
            print('  errors:', '; '.join(f"{e.get('url', '')[:70]} {e['error'][:60]}" for e in errors[:3]))
        for metric in METRICS:
            for _, doc, clause in best_clauses(docs, metric, limit):
                idx = docs.index(doc)
                pct = ', '.join(f"{p['raw']}{'/' + p['tax_hint'] if p['tax_hint'] else ''}" for p in clause['percents'][:6])
                snippet = re.sub(r'\s+', ' ', clause['snippet'])[:330]
                print(f"  {metric[:4]} D{idx}:{doc['kind']} p{clause['page']} [{pct}] {clause['basis_tags']} :: {snippet}")


if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 3)
