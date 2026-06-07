/**
 * Intègre la décote/surcote QA-validée dans les données front.
 * Source UNIQUE autorisée : scpi_reconstitution_discount_validated.json
 *
 * - publishable  → met à jour `Surcote/décote (%)` + `Décote/Surcote QA = publishable`
 * - manual_review → `Décote/Surcote QA = manual_review` (indicateur neutralisé côté UI)
 * - excluded_non_scpi → ignoré (hors périmètre)
 *
 * Écrit dans : src/data/scpi_complet.json et public/SCPI_complet_avec_SFDR_Profil.json
 * N'ajoute PAS de nouvelle SCPI au catalogue (fiches complètes manquantes).
 *
 * Usage: npx tsx scripts/scpi-agents/integrate-validated-discount.ts [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const VALIDATED = join(ROOT, 'data-import/scpi-agent/scpi_reconstitution_discount_validated.json');
const COMPLET = join(ROOT, 'src/data/scpi_complet.json');
const SFDR_PUBLIC = join(ROOT, 'public/SCPI_complet_avec_SFDR_Profil.json');

const DRY_RUN = process.argv.includes('--dry-run');

/** Alias : nom dans le fichier validé → nom dans le catalogue front. */
const ALIAS: Record<string, string> = {
  'Altixia Cadence XII': 'Altixia Cadence 12',
  Buroboutic: 'Buroboutic Métropoles',
  "Cœur d'Europe": "Coeur d'Europe",
  'Coeur de régions': 'Coeur de Région',
  Edissimmo: 'Edissimo',
  Europimmo: 'LF Europimmo',
  'Grand Paris Résidentiels': 'Grand Paris Résidentiel',
  HEXA: 'Paref Hexa',
  IrokoZen: 'Iroko Zen',
  Kyaneos: 'Kyaneos Pierre',
  'LF Opportunité Immo': 'Opportunité Immo',
  'Opportunités Europe': 'Perial Opportunités Europe',
  'Selectiinvest 1': 'Selectinvest 1',
  'Selectipierre 2 Paris': 'Selectipierre 2',
  'Transition Europe': 'Transitions Europe',
  'Urban Coeur Commerce': 'Urban Coeur de Commerce',
};

function norm(s: string): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .replace(/\bxii\b/g, '12')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface ValidatedEntry {
  nom_scpi: string;
  statut_qa: 'publishable' | 'manual_review' | 'rejected' | 'excluded_non_scpi';
  decote_surcote_percent: number | null;
  valeur_reconstitution: number | null;
  valeur_reconstitution_ajustee: number | null;
}

type FrontEntry = Record<string, unknown> & { 'Nom SCPI'?: string };

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function main(): void {
  const validated = loadJson<{ scpi: ValidatedEntry[] }>(VALIDATED).scpi;
  const complet = loadJson<FrontEntry[]>(COMPLET);
  const sfdrRaw = loadJson<FrontEntry[] | { Sheet1: FrontEntry[] }>(SFDR_PUBLIC);
  const sfdr: FrontEntry[] = Array.isArray(sfdrRaw) ? sfdrRaw : sfdrRaw.Sheet1 ?? [];

  const indexByNorm = (arr: FrontEntry[]): Map<string, FrontEntry[]> => {
    const m = new Map<string, FrontEntry[]>();
    for (const e of arr) {
      const k = norm(e['Nom SCPI'] ?? '');
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  };
  const completIdx = indexByNorm(complet);
  const sfdrIdx = indexByNorm(sfdr);

  function targets(name: string, idx: Map<string, FrontEntry[]>): FrontEntry[] {
    const aliasKey = ALIAS[name] ? norm(ALIAS[name]) : null;
    if (aliasKey && idx.has(aliasKey)) return idx.get(aliasKey)!;
    if (idx.has(norm(name))) return idx.get(norm(name))!;
    return [];
  }

  const report = {
    publishableIntegrated: [] as string[],
    publishableAbsent: [] as string[],
    manualReviewNeutralized: [] as string[],
    manualReviewAbsent: [] as string[],
    excluded: [] as string[],
  };

  for (const v of validated) {
    if (v.statut_qa === 'rejected') continue;
    if (v.statut_qa === 'excluded_non_scpi') {
      report.excluded.push(v.nom_scpi);
      continue;
    }

    const inComplet = targets(v.nom_scpi, completIdx);
    const inSfdr = targets(v.nom_scpi, sfdrIdx);
    const found = inComplet.length > 0;

    if (v.statut_qa === 'publishable') {
      if (!found) {
        report.publishableAbsent.push(v.nom_scpi);
        continue;
      }
      const vrComparable = v.valeur_reconstitution_ajustee ?? v.valeur_reconstitution;
      for (const e of [...inComplet, ...inSfdr]) {
        e['Surcote/décote (%)'] = v.decote_surcote_percent;
        e['Décote/Surcote QA'] = 'publishable';
        if (vrComparable != null) e['Valeur de reconstitution par part (€)'] = vrComparable;
      }
      report.publishableIntegrated.push(v.nom_scpi);
    } else {
      // manual_review
      if (!found) {
        report.manualReviewAbsent.push(v.nom_scpi);
        continue;
      }
      for (const e of [...inComplet, ...inSfdr]) {
        e['Décote/Surcote QA'] = 'manual_review';
      }
      report.manualReviewNeutralized.push(v.nom_scpi);
    }
  }

  console.log('=== INTÉGRATION DÉCOTE/SURCOTE QA ===', DRY_RUN ? '(DRY-RUN)' : '');
  console.log(`publishable intégrées       : ${report.publishableIntegrated.length}`);
  console.log(`publishable absentes catalog: ${report.publishableAbsent.length}`);
  if (report.publishableAbsent.length) console.log('   ', report.publishableAbsent.join(', '));
  console.log(`manual_review neutralisées  : ${report.manualReviewNeutralized.length}`);
  console.log(`manual_review absentes      : ${report.manualReviewAbsent.length}`);
  if (report.manualReviewAbsent.length) console.log('   ', report.manualReviewAbsent.join(', '));
  console.log(`excluded_non_scpi           : ${report.excluded.length} (${report.excluded.join(', ')})`);

  if (!DRY_RUN) {
    writeFileSync(COMPLET, `${JSON.stringify(complet, null, 2)}\n`, 'utf8');
    const sfdrOut = Array.isArray(sfdrRaw) ? sfdr : { ...sfdrRaw, Sheet1: sfdr };
    writeFileSync(SFDR_PUBLIC, `${JSON.stringify(sfdrOut, null, 2)}\n`, 'utf8');
    console.log('\n✅ Fichiers mis à jour : src/data/scpi_complet.json, public/SCPI_complet_avec_SFDR_Profil.json');
  } else {
    console.log('\n(dry-run : aucun fichier modifié)');
  }

  // Exposé pour le rapport
  writeFileSync(
    join(ROOT, 'data-import/scpi-agent/_integration_discount_log.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
}

main();
