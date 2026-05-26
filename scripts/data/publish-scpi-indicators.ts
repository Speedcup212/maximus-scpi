/**
 * Agent 03 — Data SCPI
 * Orchestre collect → normalize → diff → write.
 * Génère src/data/scpiIndicators.generated.ts
 *
 * Usage :
 *   npx tsx scripts/data/publish-scpi-indicators.ts            # dry-run
 *   npx tsx scripts/data/publish-scpi-indicators.ts --apply    # écriture effective
 *   npx tsx scripts/data/publish-scpi-indicators.ts --scpi=iroko-zen,remake-live --apply
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { collectIndicators } from './collect-scpi-indicators';
import { normalizeAll } from './normalize-scpi-indicators';
import { diffIndicators, printDiffReport } from './diff-scpi-indicators';
import { ScpiIndicator } from '../../src/types/scpiIndicator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT_FILE = path.join(ROOT, 'src/data/scpiIndicators.generated.ts');

function escapeForTs(value: unknown): string {
  return JSON.stringify(value, null, 4)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)"\s*:/g, '$1:')
    .replace(/"/g, "'");
}

function renderIndicator(ind: ScpiIndicator): string {
  const serialized = escapeForTs(ind);
  return `  '${ind.slug}': ${serialized},`;
}

function generateFileContent(indicators: ScpiIndicator[]): string {
  const today = new Date().toISOString().split('T')[0];
  const rendered = indicators.map(renderIndicator).join('\n\n');

  return `// FICHIER GÉNÉRÉ — ne pas modifier manuellement
// Généré par : scripts/data/publish-scpi-indicators.ts
// Dernière mise à jour : ${today}
// SCPI couvertes : ${indicators.length} (${indicators.map(i => i.name).join(', ')})
// Pour régénérer : npx tsx scripts/data/publish-scpi-indicators.ts --apply

import { ScpiIndicator } from '../types/scpiIndicator';

export const INDICATORS_GENERATED_AT = '${today}';
export const INDICATORS_SOURCE_VERSION = 'T3 2025';

export const scpiIndicators: Record<string, ScpiIndicator> = {
${rendered}
};

export function getIndicator(slug: string): ScpiIndicator | undefined {
  return scpiIndicators[slug];
}

export function getDataStatusLabel(status: ScpiIndicator['data_status']): string {
  switch (status) {
    case 'verified':  return 'Vérifié';
    case 'to_verify': return 'À vérifier';
    case 'missing':   return 'Donnée manquante';
  }
}

export function getDataStatusColor(status: ScpiIndicator['data_status']): string {
  switch (status) {
    case 'verified':  return 'text-green-700 bg-green-50 border-green-200';
    case 'to_verify': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'missing':   return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

export function getSourceOriginLabel(origin: ScpiIndicator['source_origin']): string {
  switch (origin) {
    case 'official_document': return 'Document officiel';
    case 'official_website':  return 'Site officiel';
    case 'legacy_dataset':    return 'Dataset legacy';
    case 'manual_entry':      return 'Saisie manuelle';
    case 'estimated':         return 'Estimé';
    case 'missing':           return 'Absent';
  }
}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const force = args.includes('--force');
  const scpiArg = args.find(a => a.startsWith('--scpi='));
  const slugs = scpiArg ? scpiArg.replace('--scpi=', '').split(',') : undefined;

  console.log(`\n[publish] Mode : ${apply ? 'APPLY' : 'DRY-RUN'}`);
  if (slugs) console.log(`[publish] SCPI ciblées : ${slugs.join(', ')}`);

  const raw = collectIndicators(slugs);
  console.log(`[publish] ${raw.length} SCPI collectées.`);

  const statusSummary = raw.map(r => `${r.slug}: ${r.collectStatus}`).join(', ');
  console.log(`[publish] Statuts : ${statusSummary}`);

  const normalized = normalizeAll(raw);

  const diffs = diffIndicators(normalized, {});
  printDiffReport(diffs);

  const needsReview = diffs.filter(d => d.requires_review);
  if (needsReview.length > 0) {
    console.warn(`[publish] ${needsReview.length} SCPI marquées to_verify (données legacy).`);
  }

  if (!apply) {
    console.log('[publish] DRY-RUN terminé. Lancez avec --apply pour écrire le fichier.');
    return;
  }

  const highRisk = diffs.filter(d => d.diffs.some(f => f.flagged));
  if (highRisk.length > 0 && !force) {
    console.error('[publish] BLOQUÉ : variations importantes détectées. Ajoutez --force pour ignorer.');
    process.exit(1);
  }

  const content = generateFileContent(normalized);
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`[publish] ✓ Fichier écrit : ${OUTPUT_FILE}`);
  console.log(`[publish] ${normalized.length} SCPI publiées.`);
}

main().catch(e => { console.error(e); process.exit(1); });
