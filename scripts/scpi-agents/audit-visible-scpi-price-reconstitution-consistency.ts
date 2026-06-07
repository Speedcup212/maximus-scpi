/**
 * Audit global de cohérence prix / valeur de reconstitution / décote-surcote
 * sur l'ensemble des SCPI VISIBLES du comparateur.
 *
 * Le rapport distingue DEUX niveaux, sans ambiguïté :
 *   1. ANOMALIES AVANT correction  (état historique : décote snapshot + VR priorité scpiDataExtended)
 *   2. ANOMALIES APRÈS correction  (état affiché actuel : recalcul live + VR validée par part + garde-fou)
 *
 * Statuts finaux (après correction) :
 *   - OK                   : décote cohérente, jamais incohérente (ni avant ni après).
 *   - WARNING              : neutralisée pour raison QA (manual_review / excluded / VR absente), sans anomalie antérieure.
 *   - FIXED_OR_NEUTRALIZED : une incohérence existait avant et est désormais corrigée (recalcul) ou masquée (à vérifier).
 *   - CRITICAL_REMAINING   : une décote INCOHÉRENTE est ENCORE affichée → doit être 0.
 *
 * Formule unique : (prix affiché - VR affichée) / VR affichée × 100.
 * Tolérance : ±0,2 point.
 *
 * Lecture seule. Aucune écriture front. Aucun appel API. Aucun PDF.
 *
 * Usage: npx tsx scripts/scpi-agents/audit-visible-scpi-price-reconstitution-consistency.ts
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { scpiData } from '../../src/data/scpiData';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import { computeDisplayedDiscount } from '../../src/utils/formatters';

const ROOT = process.cwd();
const OUT_JSON = join(ROOT, 'data-import/scpi-agent/audit_visible_scpi_price_reconstitution_consistency.json');
const OUT_REPORT = join(ROOT, 'reports/scpi-2026/rapport_audit_coherence_prix_vr_decote_63_scpi.md');

const ECART_TOLERANCE_PCT = 0.2;

type StatusBefore = 'OK' | 'WARNING' | 'CRITICAL';
type StatusAfter = 'OK' | 'WARNING' | 'CRITICAL_REMAINING' | 'FIXED_OR_NEUTRALIZED';

interface AuditEntry {
  name: string;
  qa_status: string | null;
  price_displayed: number | null;
  // Avant correction
  reconstitution_before: number | null;
  discount_displayed_before: number | null;
  recalc_before: number | null;
  ecart_before: number | null;
  status_before: StatusBefore;
  // Après correction
  reconstitution_after: number | null;
  displayed_after: string; // "x%" ou "À vérifier"
  recalc_after: number | null;
  ecart_after: number | null;
  status_after: StatusAfter;
  decision: string;
  issues: string[];
}

function round2(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function fmtPct(n: number | null): string {
  if (n == null) return 'À vérifier';
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function posNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null;
}

/** Reproduit le matching nom de enrichScpiExtended (égalité insensible à la casse). */
function buildMatchMap() {
  const map = new Map<string, (typeof scpiData)[number]>();
  for (const s of scpiData) map.set(s.name.toLowerCase(), s);
  return map;
}

function audit(): AuditEntry[] {
  const match = buildMatchMap();

  return scpiDataExtended.map((ext): AuditEntry => {
    const matching = match.get(ext.name.toLowerCase());
    const qa = (matching?.discountQaStatus ?? undefined) as
      | 'publishable'
      | 'manual_review'
      | 'excluded_non_scpi'
      | undefined;
    const qaLabel = qa ?? null;

    const price = posNum(ext.price);
    const snapshot =
      typeof matching?.discount === 'number' && Number.isFinite(matching.discount)
        ? matching.discount
        : null;

    // VR AVANT correction : priorité à scpiDataExtended (ancien comportement enrich).
    const vrBefore = posNum(ext.reconstitutionValue ?? matching?.valeurReconstitution);
    // VR APRÈS correction : priorité à la VR validée par part (scpiData), comme discount/tof/yield.
    const vrAfter = posNum(matching?.valeurReconstitution ?? ext.reconstitutionValue);

    const recalcBefore = price != null && vrBefore != null ? ((price - vrBefore) / vrBefore) * 100 : null;
    const recalcAfter = price != null && vrAfter != null ? ((price - vrAfter) / vrAfter) * 100 : null;

    const isQaNeutral = qa === 'manual_review' || qa === 'excluded_non_scpi';

    // --- État AVANT correction : la décote affichée = snapshot (sauf manual_review masqué).
    const displayedBefore = isQaNeutral ? null : snapshot;
    const ecartBefore =
      displayedBefore != null && recalcBefore != null ? Math.abs(displayedBefore - recalcBefore) : null;

    let statusBefore: StatusBefore;
    if (displayedBefore == null) {
      statusBefore = isQaNeutral ? 'WARNING' : 'OK';
    } else if (vrBefore == null) {
      statusBefore = 'CRITICAL'; // décote affichée sans VR comparable
    } else if (ecartBefore != null && ecartBefore > ECART_TOLERANCE_PCT) {
      statusBefore = 'CRITICAL';
    } else {
      statusBefore = 'OK';
    }

    // --- État APRÈS correction : recalcul live + garde-fou legacy.
    const displayedAfterNum = computeDisplayedDiscount(price, vrAfter, qa, snapshot);
    const displayedAfter = fmtPct(displayedAfterNum);
    const ecartAfter =
      displayedAfterNum != null && recalcAfter != null ? Math.abs(displayedAfterNum - recalcAfter) : null;

    const issues: string[] = [];
    let statusAfter: StatusAfter;
    let decision: string;

    if (displayedAfterNum != null && recalcAfter != null && Math.abs(displayedAfterNum - recalcAfter) > ECART_TOLERANCE_PCT) {
      // Une décote numérique encore affichée mais incohérente avec prix/VR affichés.
      statusAfter = 'CRITICAL_REMAINING';
      decision = 'corriger';
      issues.push(
        `Décote affichée ${fmtPct(round2(displayedAfterNum))} incohérente avec prix ${price} € / VR ${vrAfter} € ` +
          `(recalcul ${fmtPct(round2(recalcAfter))}).`
      );
    } else if (statusBefore === 'CRITICAL') {
      statusAfter = 'FIXED_OR_NEUTRALIZED';
      if (qa === 'publishable') {
        decision = 'corrigé (recalcul live)';
        issues.push(
          `Avant : décote ${fmtPct(round2(displayedBefore))} incohérente (VR affichée ${vrBefore} €). ` +
            `Après : VR validée par part ${vrAfter} €, décote recalculée ${displayedAfter} cohérente avec le prix ${price} €.`
        );
      } else {
        decision = 'neutralisé (à vérifier)';
        issues.push(
          `Avant : décote ${fmtPct(round2(displayedBefore))} incohérente (VR affichée ${vrBefore} €, statut QA indéfini). ` +
            `Après : valeurs source non comparables → décote neutralisée (${displayedAfter}).`
        );
      }
    } else if (isQaNeutral) {
      statusAfter = 'WARNING';
      decision = 'à vérifier';
      issues.push(
        `Statut ${qa} : décote/surcote neutralisée ("À vérifier")` +
          (vrAfter == null ? ', VR absente.' : '.')
      );
    } else if (displayedAfterNum == null) {
      statusAfter = 'WARNING';
      decision = 'à vérifier';
      if (price == null) issues.push('Prix de souscription affiché absent.');
      if (vrAfter == null) issues.push('Valeur de reconstitution affichée absente (N/A).');
      if (issues.length === 0) issues.push('Décote non affichée (valeurs non comparables).');
    } else {
      statusAfter = 'OK';
      decision = 'aucune';
    }

    return {
      name: ext.name,
      qa_status: qaLabel,
      price_displayed: price,
      reconstitution_before: round2(vrBefore),
      discount_displayed_before: round2(displayedBefore),
      recalc_before: round2(recalcBefore),
      ecart_before: round2(ecartBefore),
      status_before: statusBefore,
      reconstitution_after: round2(vrAfter),
      displayed_after: displayedAfter,
      recalc_after: round2(recalcAfter),
      ecart_after: round2(ecartAfter),
      status_after: statusAfter,
      decision,
      issues,
    };
  });
}

function buildReport(entries: AuditEntry[]): string {
  const total = entries.length;

  const beforeCritical = entries.filter((e) => e.status_before === 'CRITICAL');
  const beforeWarning = entries.filter((e) => e.status_before === 'WARNING');
  const beforeOk = entries.filter((e) => e.status_before === 'OK');

  const afterOk = entries.filter((e) => e.status_after === 'OK');
  const afterWarning = entries.filter((e) => e.status_after === 'WARNING');
  const afterFixed = entries.filter((e) => e.status_after === 'FIXED_OR_NEUTRALIZED');
  const afterCritical = entries.filter((e) => e.status_after === 'CRITICAL_REMAINING');

  const validation = afterCritical.length === 0 ? 'VALIDÉ ✅' : 'NON VALIDÉ ❌';

  const L: string[] = [];
  L.push('# Audit de cohérence prix / valeur de reconstitution / décote-surcote');
  L.push('');
  L.push(`_Généré le ${new Date().toISOString()}_`);
  L.push('');
  L.push('## Méthode');
  L.push('');
  L.push('- Périmètre : SCPI **visibles du comparateur** (base `scpiDataExtended` enrichie par `scpiData`).');
  L.push('- Prix affiché = `scpi.price`.');
  L.push('- **Avant correction** : décote = snapshot stocké (`discount`) ; VR affichée = priorité `scpiDataExtended`.');
  L.push('- **Après correction** : décote = recalcul live `(prix - VR)/VR×100` ; VR affichée = priorité VR validée par part ; garde-fou legacy.');
  L.push(`- Tolérance : ±${ECART_TOLERANCE_PCT} point.`);
  L.push('');

  L.push('## 1. Anomalies AVANT correction');
  L.push('');
  L.push(`- SCPI contrôlées : **${total}**`);
  L.push(`- OK : **${beforeOk.length}**`);
  L.push(`- WARNING (neutralisées QA) : **${beforeWarning.length}**`);
  L.push(`- **CRITICAL (incohérences détectées) : ${beforeCritical.length}**`);
  L.push('');

  L.push('## 2. Anomalies APRÈS correction');
  L.push('');
  L.push(`- SCPI contrôlées : **${total}**`);
  L.push(`- OK : **${afterOk.length}**`);
  L.push(`- WARNING (neutralisées QA) : **${afterWarning.length}**`);
  L.push(`- FIXED_OR_NEUTRALIZED (corrigées ou masquées) : **${afterFixed.length}**`);
  L.push(`- **CRITICAL_REMAINING : ${afterCritical.length}**`);
  L.push('');
  L.push(`### Condition de validation : CRITICAL_REMAINING = 0 → **${validation}**`);
  L.push('');

  const header =
    '| SCPI | QA | Prix | VR avant | Décote avant | VR après | Affichée après | Écart avant (pt) | Décision |\n' +
    '|---|---|---|---|---|---|---|---|---|';
  const row = (e: AuditEntry) =>
    `| ${e.name} | ${e.qa_status ?? '—'} | ${e.price_displayed ?? 'N/A'} € | ` +
    `${e.reconstitution_before ?? 'N/A'} € | ${fmtPct(e.discount_displayed_before)} | ` +
    `${e.reconstitution_after ?? 'N/A'} € | ${e.displayed_after} | ${e.ecart_before ?? '—'} | ${e.decision} |`;

  if (afterCritical.length > 0) {
    L.push('## ⛔ CRITICAL_REMAINING (à corriger avant commit)');
    L.push('');
    L.push(header);
    afterCritical.forEach((e) => L.push(row(e)));
    afterCritical.forEach((e) => e.issues.forEach((i) => L.push(`- **${e.name}** : ${i}`)));
    L.push('');
  }

  L.push('## FIXED_OR_NEUTRALIZED — détail');
  L.push('');
  L.push(header);
  afterFixed.forEach((e) => L.push(row(e)));
  L.push('');
  L.push('### Justification');
  L.push('');
  afterFixed.forEach((e) => {
    L.push(`- **${e.name}** (${e.qa_status ?? 'QA indéfini'}) — décision : **${e.decision}**`);
    e.issues.forEach((i) => L.push(`  - ${i}`));
  });
  L.push('');

  L.push('## WARNING — neutralisées QA');
  L.push('');
  L.push(header);
  afterWarning.forEach((e) => L.push(row(e)));
  L.push('');

  L.push('## OK — cohérentes');
  L.push('');
  L.push(header);
  afterOk.forEach((e) => L.push(row(e)));
  L.push('');

  return L.join('\n');
}

function main() {
  const entries = audit();

  const summaryBefore = {
    ok: entries.filter((e) => e.status_before === 'OK').length,
    warning: entries.filter((e) => e.status_before === 'WARNING').length,
    critical: entries.filter((e) => e.status_before === 'CRITICAL').length,
  };
  const summaryAfter = {
    ok: entries.filter((e) => e.status_after === 'OK').length,
    warning: entries.filter((e) => e.status_after === 'WARNING').length,
    fixed_or_neutralized: entries.filter((e) => e.status_after === 'FIXED_OR_NEUTRALIZED').length,
    critical_remaining: entries.filter((e) => e.status_after === 'CRITICAL_REMAINING').length,
  };

  const payload = {
    generated_at: new Date().toISOString(),
    formula: '(prix affiché - VR affichée) / VR affichée × 100',
    tolerance_points: ECART_TOLERANCE_PCT,
    total_visible: entries.length,
    before_correction: summaryBefore,
    after_correction: summaryAfter,
    validation_passed: summaryAfter.critical_remaining === 0,
    entries,
  };

  for (const file of [OUT_JSON, OUT_REPORT]) {
    const dir = dirname(file);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  writeFileSync(OUT_REPORT, buildReport(entries), 'utf8');

  console.log('=== Audit cohérence prix / VR / décote ===');
  console.log(`SCPI visibles contrôlées : ${entries.length}`);
  console.log('--- AVANT correction ---');
  console.log(`  OK: ${summaryBefore.ok} | WARNING: ${summaryBefore.warning} | CRITICAL: ${summaryBefore.critical}`);
  console.log('--- APRÈS correction ---');
  console.log(
    `  OK: ${summaryAfter.ok} | WARNING: ${summaryAfter.warning} | ` +
      `FIXED_OR_NEUTRALIZED: ${summaryAfter.fixed_or_neutralized} | ` +
      `CRITICAL_REMAINING: ${summaryAfter.critical_remaining}`
  );
  console.log(`\nValidation (CRITICAL_REMAINING = 0) : ${payload.validation_passed ? 'VALIDÉ' : 'NON VALIDÉ'}`);

  if (summaryAfter.critical_remaining > 0) {
    console.log('\nCRITICAL_REMAINING :');
    entries
      .filter((e) => e.status_after === 'CRITICAL_REMAINING')
      .forEach((e) => console.log(`  - ${e.name} | ${e.displayed_after} | prix ${e.price_displayed} € / VR ${e.reconstitution_after} €`));
  }
  console.log(`\nJSON : ${OUT_JSON}`);
  console.log(`Rapport : ${OUT_REPORT}`);
}

main();
