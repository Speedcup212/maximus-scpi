/**
 * Agent 03 — Data SCPI
 * Compare les indicateurs nouvellement collectés avec la version publiée actuelle.
 * Produit un rapport de diff sans modifier de fichier.
 *
 * Usage :
 *   npx tsx scripts/data/diff-scpi-indicators.ts
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { collectIndicators } from './collect-scpi-indicators';
import { normalizeAll } from './normalize-scpi-indicators';
import { ScpiIndicator } from '../../src/types/scpiIndicator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const GENERATED_FILE = path.join(ROOT, 'src/data/scpiIndicators.generated.ts');

const NUMERIC_FIELDS: (keyof ScpiIndicator)[] = [
  'distribution_rate', 'share_price', 'capitalization', 'tof',
  'subscription_fees', 'enjoyment_delay', 'reconstitution_value',
  'discount_premium', 'debt_ratio',
];

interface FieldDiff {
  field: string;
  previous: number | null;
  current: number | null;
  delta: number | null;
  deltaPercent: number | null;
  flagged: boolean;
}

interface ScpiDiff {
  slug: string;
  name: string;
  diffs: FieldDiff[];
  status_changed: boolean;
  previous_status: string | null;
  current_status: string;
  requires_review: boolean;
}

function parseCurrentIndicators(): Record<string, ScpiIndicator> {
  if (!fs.existsSync(GENERATED_FILE)) return {};
  try {
    const content = fs.readFileSync(GENERATED_FILE, 'utf-8');
    const matches = [...content.matchAll(/slug:\s*'([^']+)'/g)];
    console.log(`[diff] ${matches.length} SCPI trouvées dans le fichier existant.`);
  } catch {
    console.warn('[diff] Impossible de parser le fichier existant.');
  }
  return {};
}

export function diffIndicators(
  current: ScpiIndicator[],
  previous: Record<string, ScpiIndicator>
): ScpiDiff[] {
  return current.map(ind => {
    const prev = previous[ind.slug];
    const diffs: FieldDiff[] = [];

    for (const field of NUMERIC_FIELDS) {
      const cur = ind[field] as number | null;
      const prv = prev ? (prev[field] as number | null) : null;
      if (cur === prv) continue;

      const delta = cur !== null && prv !== null ? cur - prv : null;
      const deltaPercent =
        delta !== null && prv !== null && prv !== 0
          ? Math.round((delta / Math.abs(prv)) * 1000) / 10
          : null;

      const flagged =
        (field === 'distribution_rate' && deltaPercent !== null && Math.abs(deltaPercent) > 10)
        || (field === 'tof' && delta !== null && Math.abs(delta) > 5)
        || (field === 'share_price' && deltaPercent !== null && Math.abs(deltaPercent) > 5);

      diffs.push({ field, previous: prv, current: cur, delta, deltaPercent, flagged });
    }

    return {
      slug: ind.slug,
      name: ind.name,
      diffs,
      status_changed: prev ? prev.data_status !== ind.data_status : false,
      previous_status: prev?.data_status ?? null,
      current_status: ind.data_status,
      requires_review: diffs.some(d => d.flagged) || ind.data_status === 'to_verify',
    };
  });
}

export function printDiffReport(diffs: ScpiDiff[]): void {
  const flagged = diffs.filter(d => d.requires_review);
  const clean = diffs.filter(d => !d.requires_review);

  console.log('\n=== RAPPORT DE DIFF — SCPI INDICATORS ===\n');
  console.log(`Propres    : ${clean.length}`);
  console.log(`À vérifier : ${flagged.length}`);

  for (const d of diffs) {
    const icon = d.requires_review ? '⚠️ ' : '✓  ';
    console.log(`\n${icon}${d.name} (${d.slug})`);
    console.log(`   Statut : ${d.previous_status ?? 'nouveau'} → ${d.current_status}`);
    for (const f of d.diffs) {
      const delta = f.delta !== null ? ` (Δ ${f.delta > 0 ? '+' : ''}${f.delta.toFixed(2)})` : '';
      const flag = f.flagged ? ' ← REVUE REQUISE' : '';
      console.log(`   ${f.field}: ${f.previous ?? 'null'} → ${f.current ?? 'null'}${delta}${flag}`);
    }
  }
  console.log('\n=========================================\n');
}

// ESM-compatible main guard
const isMain = process.argv[1] === __filename
  || process.argv[1]?.endsWith('diff-scpi-indicators.ts');

if (isMain) {
  const raw = collectIndicators();
  const current = normalizeAll(raw);
  const previous = parseCurrentIndicators();
  const diffs = diffIndicators(current, previous);
  printDiffReport(diffs);
}
