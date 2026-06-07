/**
 * AUDIT GLOBAL DE TOUS LES INDICATEURS SCPI
 * ------------------------------------------------------------------
 * Contrôle, pour chaque SCPI visible du comparateur et chaque indicateur du
 * registre (src/indicators/scpiIndicatorRegistry.ts), via le résolveur unique
 * (resolveScpiIndicator) :
 *   1. donnée présente / absente
 *   2. statut QA (décote/surcote)
 *   3. source disponible / absente
 *   4. valeur affichable / non
 *   5. cohérence KPI vs textes d'analyse (décote/surcote)
 *   6. respect des règles métier (validation registre)
 *   7. statut final : OK / WARNING / CRITICAL
 *
 * Sorties :
 *   - data-import/scpi-agent/audit_all_scpi_indicators.json
 *   - reports/scpi-2026/rapport_audit_all_scpi_indicators.md
 *
 * Condition bloquante : si CRITICAL > 0 → exit code 1.
 *
 * Lecture seule. Aucune écriture front. Aucun appel API. Aucun PDF.
 *
 * Usage: npx tsx scripts/scpi-agents/audit-all-scpi-indicators.ts
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { scpiData } from '../../src/data/scpiData';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import {
  ALL_INDICATOR_IDS,
  SCPI_INDICATORS,
  IndicatorId,
} from '../../src/indicators/scpiIndicatorRegistry';
import {
  resolveScpiIndicator,
  IndicatorStatus,
} from '../../src/indicators/resolveScpiIndicator';
import {
  getScpiKeyTakeaways,
  getScpiPointsAttention,
  getScpiAnalysis,
} from '../../src/utils/scpiAnalysis';
import type { Scpi } from '../../src/types/scpi';

const ROOT = process.cwd();
const OUT_JSON = join(ROOT, 'data-import/scpi-agent/audit_all_scpi_indicators.json');
const OUT_REPORT = join(ROOT, 'reports/scpi-2026/rapport_audit_all_scpi_indicators.md');
const TOLERANCE_PCT = 0.2;

interface IndicatorResultRow {
  indicatorId: IndicatorId;
  label: string;
  criticality: string;
  value: number | string | null;
  displayValue: string;
  status: IndicatorStatus;
  confidence: number;
  source: string;
  reason: string;
  isReliable: boolean;
  components: string[];
}

interface ScpiAuditRow {
  name: string;
  indicators: IndicatorResultRow[];
  ok: number;
  warning: number;
  critical: number;
}

// --- Extraction des mentions textuelles de décote/surcote (cohérence KPI/texte) ---

function extractDiscountMentions(text: string): number[] {
  const mentions: number[] = [];
  const re = /([+-]?\d+(?:[.,]\d+)?)\s*%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1];
    const n = parseFloat(raw.replace(',', '.'));
    if (!Number.isFinite(n)) continue;
    const ctx = text.slice(Math.max(0, m.index - 25), m.index).toLowerCase();
    if (raw.startsWith('-') || raw.startsWith('+')) {
      if (/décote|surcote/.test(ctx)) mentions.push(n);
      continue;
    }
    if (/surcote/.test(ctx)) mentions.push(Math.abs(n));
    else if (/décote/.test(ctx)) mentions.push(-Math.abs(n));
  }
  return mentions;
}

function collectDiscountTextMentions(scpi: Scpi): number[] {
  const texts: string[] = [];
  try {
    texts.push(...getScpiKeyTakeaways(scpi));
  } catch {
    /* ignore */
  }
  try {
    texts.push(...getScpiPointsAttention(scpi));
  } catch {
    /* ignore */
  }
  try {
    texts.push(getScpiAnalysis(scpi));
  } catch {
    /* ignore */
  }
  return texts.flatMap((t) => extractDiscountMentions(t));
}

function round2(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function audit() {
  // SCPI VISIBLES = présentes dans scpiDataExtended (catalogue comparateur).
  const visibleNames = new Set(scpiDataExtended.map((s) => s.name.toLowerCase()));
  const visibleScpis = scpiData.filter((s) => visibleNames.has(s.name.toLowerCase()));

  const rows: ScpiAuditRow[] = [];
  const anomaliesByIndicator: Record<string, { name: string; status: IndicatorStatus; reason: string }[]> = {};

  for (const scpi of visibleScpis) {
    const indicators: IndicatorResultRow[] = [];
    let ok = 0;
    let warning = 0;
    let critical = 0;

    for (const id of ALL_INDICATOR_IDS) {
      const def = SCPI_INDICATORS[id];
      const resolved = resolveScpiIndicator(scpi, id);
      let status = resolved.status;
      let reason = resolved.reason;

      // Cohérence KPI / textes pour la décote/surcote (point 5).
      if (id === 'decote_surcote') {
        const kpi = typeof resolved.value === 'number' ? resolved.value : null;
        const mentions = collectDiscountTextMentions(scpi);
        const divergent = mentions.filter((mv) =>
          kpi == null ? true : Math.abs(mv - kpi) > TOLERANCE_PCT
        );
        if (divergent.length > 0) {
          status = 'CRITICAL';
          reason =
            `Divergence KPI / texte : KPI ${kpi == null ? 'À vérifier' : `${kpi.toFixed(1)}%`}, ` +
            `mention(s) texte ${divergent.map((v) => `${v.toFixed(1)}%`).join(', ')}`;
        }
      }

      indicators.push({
        indicatorId: id,
        label: def.label,
        criticality: def.criticality,
        value: typeof resolved.value === 'number' ? round2(resolved.value) : resolved.value,
        displayValue: resolved.displayValue,
        status,
        confidence: resolved.confidence,
        source: resolved.source,
        reason,
        isReliable: resolved.isReliable,
        components: def.components,
      });

      if (status === 'OK') ok++;
      else if (status === 'WARNING') warning++;
      else critical++;

      if (status !== 'OK') {
        (anomaliesByIndicator[id] ??= []).push({ name: scpi.name, status, reason });
      }
    }

    rows.push({ name: scpi.name, indicators, ok, warning, critical });
  }

  return { rows, anomaliesByIndicator, visibleCount: visibleScpis.length };
}

function ensureDir(file: string) {
  const dir = dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function buildReport(
  rows: ScpiAuditRow[],
  anomaliesByIndicator: Record<string, { name: string; status: IndicatorStatus; reason: string }[]>,
  visibleCount: number,
  totals: { ok: number; warning: number; critical: number; indicatorsChecked: number }
): string {
  const L: string[] = [];
  L.push('# Audit global des indicateurs SCPI');
  L.push('');
  L.push(`_Généré le ${new Date().toISOString()}_`);
  L.push('');
  L.push('Toutes les valeurs proviennent du résolveur unique `resolveScpiIndicator` (registre `scpiIndicatorRegistry`).');
  L.push('');
  L.push('## Synthèse');
  L.push('');
  L.push(`- SCPI visibles contrôlées : **${visibleCount}**`);
  L.push(`- Indicateurs au registre : **${ALL_INDICATOR_IDS.length}**`);
  L.push(`- Total contrôles (SCPI × indicateurs) : **${totals.indicatorsChecked}**`);
  L.push(`- OK : **${totals.ok}**`);
  L.push(`- WARNING : **${totals.warning}**`);
  L.push(`- CRITICAL : **${totals.critical}**`);
  L.push('');
  const validation = totals.critical === 0 ? '✅ VALIDÉ' : '⛔ NON VALIDÉ';
  L.push(`### Condition bloquante : CRITICAL = 0 → ${validation}`);
  L.push('');

  // Anomalies par indicateur
  L.push('## Anomalies par indicateur');
  L.push('');
  const anomalousIds = ALL_INDICATOR_IDS.filter((id) => (anomaliesByIndicator[id] ?? []).length > 0);
  if (anomalousIds.length === 0) {
    L.push('_Aucune anomalie._');
  } else {
    for (const id of anomalousIds) {
      const def = SCPI_INDICATORS[id];
      const list = anomaliesByIndicator[id];
      const crit = list.filter((a) => a.status === 'CRITICAL').length;
      const warn = list.filter((a) => a.status === 'WARNING').length;
      L.push(`### ${def.label} (\`${id}\` — ${def.criticality})`);
      L.push(`Surfaces : ${def.components.join(', ')}`);
      L.push(`CRITICAL : ${crit} · WARNING : ${warn}`);
      L.push('');
      for (const a of list) {
        L.push(`- **${a.name}** — ${a.status} : ${a.reason}`);
      }
      L.push('');
    }
  }

  // Anomalies par SCPI (uniquement celles avec au moins une anomalie)
  L.push('## Anomalies par SCPI');
  L.push('');
  const scpisWithIssues = rows.filter((r) => r.warning + r.critical > 0);
  if (scpisWithIssues.length === 0) {
    L.push('_Aucune anomalie._');
  } else {
    for (const r of scpisWithIssues) {
      L.push(`### ${r.name} (OK ${r.ok} · WARNING ${r.warning} · CRITICAL ${r.critical})`);
      for (const ind of r.indicators.filter((i) => i.status !== 'OK')) {
        L.push(`- \`${ind.indicatorId}\` — ${ind.status} : ${ind.reason} _(correction : ${recommendation(ind)})_`);
      }
      L.push('');
    }
  }

  return L.join('\n');
}

function recommendation(ind: IndicatorResultRow): string {
  if (ind.status === 'CRITICAL' && ind.indicatorId === 'decote_surcote') {
    return 'aligner le texte sur le KPI via resolveScpiIndicator';
  }
  if (ind.reason.startsWith('Donnée absente')) {
    return 'sourcer la donnée (bulletin/DIC) puis intégrer';
  }
  if (ind.reason.startsWith('Valeur invalide')) {
    return 'vérifier la donnée source (hors plage métier)';
  }
  return 'passer l’affichage par resolveScpiIndicator';
}

function main() {
  const { rows, anomaliesByIndicator, visibleCount } = audit();

  const totals = rows.reduce(
    (acc, r) => {
      acc.ok += r.ok;
      acc.warning += r.warning;
      acc.critical += r.critical;
      return acc;
    },
    { ok: 0, warning: 0, critical: 0 }
  );
  const indicatorsChecked = visibleCount * ALL_INDICATOR_IDS.length;

  const payload = {
    generated_at: new Date().toISOString(),
    visible_count: visibleCount,
    indicators_count: ALL_INDICATOR_IDS.length,
    totals: { ...totals, indicators_checked: indicatorsChecked },
    validation_passed: totals.critical === 0,
    rows,
    anomalies_by_indicator: anomaliesByIndicator,
  };

  ensureDir(OUT_JSON);
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf-8');

  ensureDir(OUT_REPORT);
  writeFileSync(
    OUT_REPORT,
    buildReport(rows, anomaliesByIndicator, visibleCount, { ...totals, indicatorsChecked }),
    'utf-8'
  );

  console.log('=== Audit global des indicateurs SCPI ===');
  console.log(`SCPI visibles : ${visibleCount} · Indicateurs : ${ALL_INDICATOR_IDS.length}`);
  console.log(`Contrôles : ${indicatorsChecked}`);
  console.log(`OK: ${totals.ok} | WARNING: ${totals.warning} | CRITICAL: ${totals.critical}`);
  console.log(`JSON : ${OUT_JSON}`);
  console.log(`Rapport : ${OUT_REPORT}`);

  if (totals.critical > 0) {
    console.error(`\n⛔ CRITICAL = ${totals.critical} → échec (exit 1).`);
    process.exit(1);
  }
  console.log('\n✅ CRITICAL = 0 → validé.');
}

main();
