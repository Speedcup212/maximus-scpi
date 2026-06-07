/**
 * TEST DE COHÉRENCE KPI / TEXTE (décote/surcote) — modale Analyse détaillée
 * ------------------------------------------------------------------
 * Reproduit FIDÈLEMENT le rendu de la modale :
 *   - KPI       : resolveScpiIndicator(extEnrichi, 'decote_surcote')
 *   - Lecture rapide / Analyse : textes générés depuis buildScpiForAnalysis(...)
 *     (le MÊME helper que le composant), via getScpiKeyTakeaways / etc.
 *
 * Échoue (exit 1) si, pour une SCPI visible, une mention textuelle de
 * décote/surcote diffère du KPI de plus de 0,2 point.
 *
 * Cas verrouillé : Wemo One — KPI ≈ -3,9 % et AUCUNE mention "8,5" dans les
 * textes (régression historique).
 *
 * Lecture seule. Aucune écriture front. Aucun appel API.
 *
 * Usage: npx tsx scripts/scpi-agents/test-analysis-text-discount-consistency.ts
 */

import { scpiData } from '../../src/data/scpiData';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import { enrichScpiExtended } from '../../src/utils/enrichScpiExtended';
import { buildScpiForAnalysis } from '../../src/utils/buildScpiForAnalysis';
import { resolveScpiIndicator } from '../../src/indicators/resolveScpiIndicator';
import {
  getScpiKeyTakeaways,
  getScpiPointsAttention,
  getScpiAnalysis,
} from '../../src/utils/scpiAnalysis';
import type { Scpi } from '../../src/types/scpi';

const TOLERANCE_PCT = 0.2;

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

function collectTexts(scpi: Scpi): string[] {
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
  return texts;
}

interface Failure {
  name: string;
  kpi: number | null;
  mentions: number[];
  detail: string;
}

function main() {
  const failures: Failure[] = [];
  let checked = 0;
  let wemoChecked = false;

  for (const ext of scpiDataExtended) {
    // Objet "affiché" (prop de la modale) = SCPIExtended enrichi par scpiData.
    const enriched = enrichScpiExtended(ext, scpiData);

    // KPI = résolveur unique.
    const kpiResolved = resolveScpiIndicator(enriched, 'decote_surcote');
    const kpi = typeof kpiResolved.value === 'number' ? kpiResolved.value : null;

    // Textes = depuis l'objet d'analyse construit comme la modale.
    const scpiForAnalysis = buildScpiForAnalysis(enriched, scpiData);
    if (!scpiForAnalysis) continue;
    checked++;

    const texts = collectTexts(scpiForAnalysis);
    const mentions = texts.flatMap(extractDiscountMentions);

    // Divergence KPI / mention.
    const divergent = mentions.filter((mv) =>
      kpi == null ? true : Math.abs(mv - kpi) > TOLERANCE_PCT
    );
    if (divergent.length > 0) {
      failures.push({
        name: ext.name,
        kpi,
        mentions,
        detail:
          kpi == null
            ? `KPI "À vérifier" mais le texte mentionne ${divergent.map((v) => `${v}%`).join(', ')}`
            : `KPI ${kpi.toFixed(1)}% ≠ texte ${divergent.map((v) => `${v}%`).join(', ')}`,
      });
    }

    // Cas verrouillé : Wemo One.
    if (ext.name.toLowerCase() === 'wemo one') {
      wemoChecked = true;
      const joined = texts.join(' \u00b7 ');
      const has85 = /8[.,]5/.test(joined);
      const kpiOk = kpi != null && Math.abs(kpi - -3.9) <= 0.2;
      if (has85) {
        failures.push({
          name: 'Wemo One',
          kpi,
          mentions,
          detail: `Régression : "8,5" présent dans Lecture rapide/Analyse alors que KPI = ${kpi == null ? 'À vérifier' : `${kpi.toFixed(1)}%`}`,
        });
      }
      if (!kpiOk) {
        failures.push({
          name: 'Wemo One',
          kpi,
          mentions,
          detail: `KPI attendu ≈ -3,9 % mais obtenu ${kpi == null ? 'À vérifier' : `${kpi.toFixed(1)}%`}`,
        });
      }
    }
  }

  console.log('=== Test cohérence KPI / texte (décote/surcote) ===');
  console.log(`SCPI contrôlées : ${checked}`);
  console.log(`Wemo One contrôlée : ${wemoChecked ? 'oui' : 'NON (absente du catalogue)'}`);
  console.log(`Échecs : ${failures.length}`);

  if (failures.length > 0) {
    console.error('\n⛔ Divergences détectées :');
    for (const f of failures) {
      console.error(`  - ${f.name} : ${f.detail}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Aucune divergence KPI / texte. Wemo One cohérent (KPI ≈ -3,9 %, pas de 8,5 %).');
}

main();
