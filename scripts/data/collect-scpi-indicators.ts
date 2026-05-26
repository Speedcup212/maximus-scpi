/**
 * Agent 03 — Data SCPI
 * Collecte les indicateurs SCPI depuis scpi_complet.json + bulletins trimestriels.
 * Lit également scpi_source_registry_seed.json pour enrichir les URLs sources.
 * Lit uniquement — n'écrit aucun fichier.
 *
 * Usage :
 *   npx tsx scripts/data/collect-scpi-indicators.ts
 *   npx tsx scripts/data/collect-scpi-indicators.ts --scpi=activimmo,iroko-zen
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, 'src/data');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const REGISTRY_PATH = path.join(ROOT, 'scripts/seed/scpi_source_registry_seed.json');

export const SLUG_MAP: Record<string, string> = {
  activimmo: 'Activimmo',
  comete: 'Comète',
  'iroko-zen': 'Iroko Zen',
  'remake-live': 'Remake Live',
  'transitions-europe': 'Transitions Europe',
};

const BULLETIN_MAP: Record<string, string> = {
  'iroko-zen': 'bulletin_iroko_zen_t3_2025.json',
  'remake-live': 'bulletin_remake_live_t3_2025.json',
  'transitions-europe': 'bulletin_transitions_europe_t3_2025.json',
  comete: 'bulletin_comete_t3_2025.json',
};

/** Champs clés extraits des bulletins — détermine si une donnée est official_document */
const BULLETIN_NUMERIC_FIELDS = [
  'tof', 'tauxDistribution', 'capitalisation', 'prixPart',
  'valeurReconstitution', 'endettement', 'decoteSurcote',
];

export interface RegistryEntry {
  scpi_slug: string;
  scpi_name: string;
  management_company: string;
  official_scpi_page_url: string | null;
  bulletin_url: string | null;
  last_document_period: string | null;
  verification_status: string;
}

export interface FieldProvenance {
  field: string;
  value: unknown;
  origin: 'official_document' | 'legacy_dataset' | 'missing';
  source: string;
}

export interface RawScpiData {
  slug: string;
  name: string;
  fromMainFile: Record<string, unknown>;
  fromBulletin: Record<string, unknown> | null;
  bulletinPeriod: string | null;
  bulletinPath: string | null;
  registryEntry: RegistryEntry | null;
  fieldProvenance: FieldProvenance[];
  collectStatus: 'bulletin_full' | 'bulletin_partial' | 'legacy_only' | 'no_source';
}

function loadRegistry(): RegistryEntry[] {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.warn('[collect] scpi_source_registry_seed.json non trouvé — URLs sources indisponibles.');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  return raw.entries as RegistryEntry[];
}

function computeFieldProvenance(
  mainFile: Record<string, unknown>,
  bulletin: Record<string, unknown> | null,
  slug: string,
): FieldProvenance[] {
  const result: FieldProvenance[] = [];

  for (const field of BULLETIN_NUMERIC_FIELDS) {
    const bulletinVal = bulletin?.[field];
    const mainKey = fieldToMainKey(field);
    const mainVal = mainFile[mainKey];

    if (bulletinVal !== null && bulletinVal !== undefined) {
      result.push({ field, value: bulletinVal, origin: 'official_document', source: `bulletin_${slug.replace('-', '_')}_t3_2025.json` });
    } else if (mainVal !== null && mainVal !== undefined) {
      result.push({ field, value: mainVal, origin: 'legacy_dataset', source: 'scpi_complet.json' });
    } else {
      result.push({ field, value: null, origin: 'missing', source: 'N/A' });
    }
  }

  return result;
}

function fieldToMainKey(bulletinField: string): string {
  const map: Record<string, string> = {
    tof: 'TOF (%)',
    tauxDistribution: 'Taux de distribution (%)',
    capitalisation: 'Capitalisation (M€)',
    prixPart: 'Prix de souscription (€)',
    valeurReconstitution: 'Valeur de reconstitution (€)',
    endettement: 'Endettement (%)',
    decoteSurcote: 'Surcote/décote (%)',
  };
  return map[bulletinField] ?? bulletinField;
}

function computeCollectStatus(provenance: FieldProvenance[]): RawScpiData['collectStatus'] {
  const officialCount = provenance.filter(p => p.origin === 'official_document').length;
  const missingCount = provenance.filter(p => p.origin === 'missing').length;

  if (officialCount === 0) return 'legacy_only';
  if (officialCount === provenance.length - missingCount) return 'bulletin_full';
  if (officialCount > 0) return 'bulletin_partial';
  return 'no_source';
}

export function collectIndicators(slugs?: string[]): RawScpiData[] {
  const scpiCompleteRaw = fs.readFileSync(path.join(DATA_DIR, 'scpi_complet.json'), 'utf-8');
  const scpiComplete: Record<string, unknown>[] = JSON.parse(scpiCompleteRaw);
  const registry = loadRegistry();

  const targets = slugs ?? Object.keys(SLUG_MAP);
  const results: RawScpiData[] = [];

  for (const slug of targets) {
    const scpiName = SLUG_MAP[slug];
    if (!scpiName) {
      console.warn(`[collect] Slug inconnu : ${slug}`);
      continue;
    }

    const mainEntry = scpiComplete.find((s: any) => s['Nom SCPI'] === scpiName) ?? null;
    if (!mainEntry) {
      console.warn(`[collect] SCPI non trouvée dans scpi_complet.json : ${scpiName}`);
    }

    let bulletinData: Record<string, unknown> | null = null;
    let bulletinPeriod: string | null = null;
    let resolvedBulletinPath: string | null = null;
    const bulletinFile = BULLETIN_MAP[slug];

    if (bulletinFile) {
      const bulletinFilePath = path.join(SCRIPTS_DIR, bulletinFile);
      if (fs.existsSync(bulletinFilePath)) {
        const raw = JSON.parse(fs.readFileSync(bulletinFilePath, 'utf-8'));
        bulletinData = raw;
        bulletinPeriod = raw.periode ?? null;
        resolvedBulletinPath = bulletinFilePath;
      } else {
        console.warn(`[collect] Bulletin non trouvé : ${bulletinFile}`);
      }
    }

    const registryEntry = registry.find(r => r.scpi_slug === slug) ?? null;
    const fieldProvenance = computeFieldProvenance(
      (mainEntry as Record<string, unknown>) ?? {},
      bulletinData,
      slug,
    );
    const collectStatus = computeCollectStatus(fieldProvenance);

    results.push({
      slug,
      name: scpiName,
      fromMainFile: (mainEntry as Record<string, unknown>) ?? {},
      fromBulletin: bulletinData,
      bulletinPeriod,
      bulletinPath: resolvedBulletinPath,
      registryEntry,
      fieldProvenance,
      collectStatus,
    });
  }

  return results;
}

function printCollectReport(data: RawScpiData[]): void {
  console.log('\n=== RAPPORT DE COLLECTE — SCPI INDICATORS ===\n');

  for (const d of data) {
    const statusIcon = {
      bulletin_full: '✅',
      bulletin_partial: '⚠️ ',
      legacy_only: '🔴',
      no_source: '❌',
    }[d.collectStatus];

    console.log(`${statusIcon} ${d.name} (${d.slug})`);
    console.log(`   Bulletin : ${d.bulletinPeriod ?? 'absent'}`);
    console.log(`   Registry URL : ${d.registryEntry?.official_scpi_page_url ?? 'null (à renseigner)'}`);
    console.log(`   Statut collecte : ${d.collectStatus}`);
    console.log(`   Provenance champs :`);

    for (const fp of d.fieldProvenance) {
      const icon = fp.origin === 'official_document' ? '  ✅' : fp.origin === 'legacy_dataset' ? '  ⚠️ ' : '  ⬜';
      console.log(`${icon} ${fp.field}: ${fp.value ?? 'null'} (${fp.source})`);
    }
    console.log('');
  }

  const full = data.filter(d => d.collectStatus === 'bulletin_full').length;
  const partial = data.filter(d => d.collectStatus === 'bulletin_partial').length;
  const legacy = data.filter(d => d.collectStatus === 'legacy_only').length;

  console.log(`Résumé : ${full} bulletin complet / ${partial} partiel / ${legacy} legacy uniquement`);
  console.log('\n=============================================\n');
}

// ESM-compatible main guard
const isMain = process.argv[1] === __filename
  || process.argv[1]?.endsWith('collect-scpi-indicators.ts');

if (isMain) {
  const args = process.argv.slice(2);
  const scpiArg = args.find(a => a.startsWith('--scpi='));
  const slugs = scpiArg ? scpiArg.replace('--scpi=', '').split(',') : undefined;

  const data = collectIndicators(slugs);
  printCollectReport(data);
}
