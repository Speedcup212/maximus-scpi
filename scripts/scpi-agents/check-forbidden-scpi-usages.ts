/**
 * VÉRIFICATION STATIQUE DES USAGES DIRECTS INTERDITS
 * ------------------------------------------------------------------
 * Détecte les accès directs aux champs bruts d'indicateurs SCPI critiques
 * dans les composants front et les textes d'analyse, qui doivent passer par
 * `resolveScpiIndicator` / `resolveDisplayedDiscount` (source unique).
 *
 * Sévérité :
 *   - `discount` (décote/surcote) : CRITICAL — l'affichage/texte est déjà migré.
 *   - autres champs critiques (yield, tof, capitalization, valeurReconstitution…) :
 *     WARNING — migration échelonnée vers le résolveur.
 *
 * Échappatoire ligne : ajouter `indicator-allow` en commentaire sur la ligne
 * (usage légitime : alimentation du résolveur, etc.).
 *
 * Condition bloquante : CRITICAL > 0 → exit code 1.
 *
 * Usage: npx tsx scripts/scpi-agents/check-forbidden-scpi-usages.ts
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();

// Répertoires/fichiers scannés (surfaces d'affichage et textes).
const SCAN_TARGETS = [
  join(ROOT, 'src/components'),
  join(ROOT, 'src/utils/scpiAnalysis.ts'),
];

// Fichiers autorisés à accéder aux champs bruts (couche data / résolveur / scoring).
const ALLOWLIST_SUBSTRINGS = [
  'src/indicators/',
  'src/utils/formatters.ts',
  'src/utils/enrichScpiExtended.ts',
  'src/utils/scpiScoring.ts',
  'src/utils/scpiDataTransformer.ts',
  'src/utils/scpiDataCompleteness.ts',
  'src/utils/guidedJourneyLogic.ts',
  'src/utils/portfolioAnalysis.ts',
  'src/utils/portfolioAdaptation.ts',
  'src/data/',
  'src/types/',
].map((s) => s.replace(/\//g, '\\'));

type Severity = 'CRITICAL' | 'WARNING';

// Champ brut → indicateur + sévérité. Le receveur doit ressembler à une SCPI.
const FORBIDDEN_FIELDS: { field: string; indicator: string; severity: Severity }[] = [
  { field: 'discount', indicator: 'decote_surcote', severity: 'CRITICAL' },
  { field: 'valeurReconstitution', indicator: 'valeur_reconstitution', severity: 'WARNING' },
  { field: 'reconstitutionValue', indicator: 'valeur_reconstitution', severity: 'WARNING' },
  { field: 'yield', indicator: 'taux_distribution', severity: 'WARNING' },
  { field: 'tauxDistribution', indicator: 'taux_distribution', severity: 'WARNING' },
  { field: 'tof', indicator: 'tof', severity: 'WARNING' },
  { field: 'capitalization', indicator: 'capitalisation', severity: 'WARNING' },
  { field: 'capitalisation', indicator: 'capitalisation', severity: 'WARNING' },
];

// Receveur "SCPI-like" : nom de variable contenant scpi (insensible à la casse).
const fieldRegex = (field: string) =>
  new RegExp(`\\b([A-Za-z_$][\\w$]*[Ss]cpi[\\w$]*)\\.${field}\\b`, 'g');

interface Finding {
  file: string;
  line: number;
  severity: Severity;
  indicator: string;
  snippet: string;
}

function isAllowlisted(absPath: string): boolean {
  return ALLOWLIST_SUBSTRINGS.some((s) => absPath.includes(s));
}

function collectFiles(target: string): string[] {
  let st;
  try {
    st = statSync(target);
  } catch {
    return [];
  }
  if (st.isFile()) return [target];
  const out: string[] = [];
  for (const entry of readdirSync(target)) {
    const p = join(target, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...collectFiles(p));
    else if (['.ts', '.tsx'].includes(extname(p))) out.push(p);
  }
  return out;
}

function scanFile(absPath: string): Finding[] {
  if (isAllowlisted(absPath)) return [];
  const content = readFileSync(absPath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const findings: Finding[] = [];

  lines.forEach((line, i) => {
    if (line.includes('indicator-allow')) return;
    for (const { field, indicator, severity } of FORBIDDEN_FIELDS) {
      const re = fieldRegex(field);
      if (re.test(line)) {
        findings.push({
          file: relative(ROOT, absPath),
          line: i + 1,
          severity,
          indicator,
          snippet: line.trim().slice(0, 140),
        });
      }
    }
  });
  return findings;
}

function main() {
  const files = SCAN_TARGETS.flatMap(collectFiles);
  const findings = files.flatMap(scanFile);

  const critical = findings.filter((f) => f.severity === 'CRITICAL');
  const warning = findings.filter((f) => f.severity === 'WARNING');

  console.log('=== Vérification des usages directs interdits (indicateurs SCPI) ===');
  console.log(`Fichiers scannés : ${files.length}`);
  console.log(`CRITICAL : ${critical.length} | WARNING : ${warning.length}`);

  if (critical.length > 0) {
    console.log('\n⛔ CRITICAL (usage direct d’un champ critique migré) :');
    for (const f of critical) {
      console.log(`  ${f.file}:${f.line} [${f.indicator}] ${f.snippet}`);
    }
  }
  if (warning.length > 0) {
    console.log('\n⚠️  WARNING (à migrer vers resolveScpiIndicator) :');
    const byFile = new Map<string, Finding[]>();
    for (const f of warning) {
      const arr = byFile.get(f.file) ?? [];
      arr.push(f);
      byFile.set(f.file, arr);
    }
    for (const [file, list] of byFile) {
      console.log(`  ${file} (${list.length}) : ${[...new Set(list.map((l) => l.indicator))].join(', ')}`);
    }
  }

  if (critical.length > 0) {
    console.error(`\n⛔ ${critical.length} usage(s) direct(s) CRITICAL → échec (exit 1).`);
    process.exit(1);
  }
  console.log('\n✅ Aucun usage direct CRITICAL.');
}

main();
