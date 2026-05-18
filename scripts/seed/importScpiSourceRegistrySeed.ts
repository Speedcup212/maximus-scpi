/**
 * Agent 03 — Data SCPI MaximusSCPI — Phase 1B
 * Script d'import contrôlé du seed scpi_source_registry vers Supabase.
 *
 * Ce script ne modifie aucun fichier frontend, comparateur, scoring ou data SCPI.
 * Il n'extrait aucune donnée, ne scrape rien, ne télécharge aucun PDF.
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 * Dry-run (défaut) — validation complète, aucune insertion :
 *   npx tsx scripts/seed/importScpiSourceRegistrySeed.ts
 *
 * Import réel — upsert sur scpi_slug après validation :
 *   npx tsx scripts/seed/importScpiSourceRegistrySeed.ts --apply
 *
 * ─── Variables d'environnement requises ──────────────────────────────────────
 *
 *   SUPABASE_URL              URL de l'instance Supabase
 *   SUPABASE_SERVICE_ROLE_KEY Clé service role (jamais exposée frontend)
 *
 *   SUPABASE_ANON_KEY est refusé — ce script requiert le service role.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ─── Constantes ───────────────────────────────────────────────────────────────

const SEED_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
  'scpi_source_registry_seed.json'
);

const TABLE_NAME = 'scpi_source_registry';

const VALID_VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'incomplete',
  'broken_url',
  'conflicting_sources',
  'manual_review_required',
] as const;

const VALID_CONFIDENCE_LEVELS = [
  'high',
  'medium',
  'low',
  'unknown',
] as const;

const URL_FIELDS = [
  'official_scpi_page_url',
  'bulletin_url',
  'annual_report_url',
  'dic_url',
  'note_information_url',
  'statutes_url',
] as const;

type VerificationStatus = typeof VALID_VERIFICATION_STATUSES[number];
type ConfidenceLevel = typeof VALID_CONFIDENCE_LEVELS[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeedEntry {
  scpi_slug: string;
  scpi_name: string;
  management_company: string;
  verification_status: VerificationStatus;
  confidence_level: ConfidenceLevel;
  [key: string]: unknown;
}

interface SeedFile {
  _meta?: unknown;
  entries: unknown[];
}

interface ValidationResult {
  valid: SeedEntry[];
  errors: Array<{ index: number; slug: string | null; reasons: string[] }>;
  duplicates: string[];
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEntry(
  raw: unknown,
  index: number
): { entry: SeedEntry | null; reasons: string[] } {
  const reasons: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { entry: null, reasons: ['La ligne n\'est pas un objet JSON valide'] };
  }

  const obj = raw as Record<string, unknown>;

  // Champs obligatoires
  const requiredFields = ['scpi_slug', 'scpi_name', 'management_company', 'verification_status', 'confidence_level'];
  for (const field of requiredFields) {
    if (!obj[field] || typeof obj[field] !== 'string' || (obj[field] as string).trim() === '') {
      reasons.push(`Champ obligatoire manquant ou vide : ${field}`);
    }
  }

  // Enum verification_status
  if (
    obj.verification_status &&
    !VALID_VERIFICATION_STATUSES.includes(obj.verification_status as VerificationStatus)
  ) {
    reasons.push(
      `verification_status invalide : "${obj.verification_status}". Valeurs acceptées : ${VALID_VERIFICATION_STATUSES.join(', ')}`
    );
  }

  // Enum confidence_level
  if (
    obj.confidence_level &&
    !VALID_CONFIDENCE_LEVELS.includes(obj.confidence_level as ConfidenceLevel)
  ) {
    reasons.push(
      `confidence_level invalide : "${obj.confidence_level}". Valeurs acceptées : ${VALID_CONFIDENCE_LEVELS.join(', ')}`
    );
  }

  // URLs doivent être null en Phase 1
  for (const urlField of URL_FIELDS) {
    if (obj[urlField] !== null && obj[urlField] !== undefined) {
      reasons.push(
        `URL non-null détectée sur "${urlField}" : "${obj[urlField]}". ` +
        'En Phase 1, toutes les URLs doivent être null. ' +
        'Ajoutez --allow-urls pour forcer (non recommandé).'
      );
    }
  }

  if (reasons.length > 0) {
    return { entry: null, reasons };
  }

  return {
    entry: obj as unknown as SeedEntry,
    reasons: [],
  };
}

function detectDuplicates(entries: unknown[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const raw of entries) {
    if (raw && typeof raw === 'object') {
      const slug = (raw as Record<string, unknown>).scpi_slug as string;
      if (slug) {
        if (seen.has(slug)) duplicates.add(slug);
        else seen.add(slug);
      }
    }
  }
  return Array.from(duplicates);
}

function validateAll(entries: unknown[]): ValidationResult {
  const valid: SeedEntry[] = [];
  const errors: ValidationResult['errors'] = [];

  for (let i = 0; i < entries.length; i++) {
    const raw = entries[i];
    const slug = raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).scpi_slug as string) ?? null
      : null;

    const { entry, reasons } = validateEntry(raw, i);
    if (reasons.length > 0) {
      errors.push({ index: i + 1, slug, reasons });
    } else if (entry) {
      valid.push(entry);
    }
  }

  const duplicates = detectDuplicates(entries);
  return { valid, errors, duplicates };
}

// ─── Rapport ──────────────────────────────────────────────────────────────────

function printSeparator() {
  console.log('─'.repeat(60));
}

function printReport(
  total: number,
  result: ValidationResult,
  mode: 'dry-run' | 'apply'
) {
  printSeparator();
  console.log('Agent 03 — Import scpi_source_registry');
  console.log(`Mode        : ${mode === 'dry-run' ? '🔍 DRY-RUN (aucune insertion)' : '🚀 APPLY (upsert réel)'}`);
  printSeparator();
  console.log(`Lignes lues  : ${total}`);
  console.log(`Lignes valides : ${result.valid.length}`);
  console.log(`Erreurs        : ${result.errors.length}`);
  console.log(`Doublons slug  : ${result.duplicates.length}`);
  printSeparator();

  if (result.errors.length > 0) {
    console.error('\n❌ Erreurs de validation :');
    for (const err of result.errors) {
      console.error(`  Ligne ${err.index}${err.slug ? ` (${err.slug})` : ''} :`);
      for (const reason of err.reasons) {
        console.error(`    • ${reason}`);
      }
    }
  }

  if (result.duplicates.length > 0) {
    console.error('\n❌ Doublons scpi_slug détectés :');
    for (const dup of result.duplicates) {
      console.error(`  • ${dup}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const isApply = process.argv.includes('--apply');
  const allowUrls = process.argv.includes('--allow-urls');
  const mode: 'dry-run' | 'apply' = isApply ? 'apply' : 'dry-run';

  console.log('\nAgent 03 — Data SCPI MaximusSCPI — Phase 1B');
  console.log('Import contrôlé : scpi_source_registry_seed.json → Supabase\n');

  // ── [1] Variables d'environnement ──────────────────────────────────────────

  // Bloquer si SUPABASE_ANON_KEY est la seule clé disponible
  if (process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ BLOQUÉ : SUPABASE_ANON_KEY détectée mais SUPABASE_SERVICE_ROLE_KEY absente.');
    console.error('   Ce script requiert le service role. L\'anon key n\'a pas les droits RLS nécessaires.');
    console.error('   Ajoutez SUPABASE_SERVICE_ROLE_KEY dans votre .env et relancez.');
    process.exit(1);
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl) {
    console.error('❌ BLOQUÉ : SUPABASE_URL est absente du .env (et VITE_SUPABASE_URL non trouvée non plus).');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ BLOQUÉ : SUPABASE_SERVICE_ROLE_KEY est absente du .env.');
    console.error('   Ce script ne fonctionne pas avec SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  if (process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
    console.warn('⚠️  SUPABASE_URL absent, utilisation de VITE_SUPABASE_URL comme fallback.');
  }

  // ── [2] Lecture du fichier seed ────────────────────────────────────────────

  if (!fs.existsSync(SEED_PATH)) {
    console.error(`❌ BLOQUÉ : Fichier seed introuvable : ${SEED_PATH}`);
    process.exit(1);
  }

  let seedFile: SeedFile;
  try {
    const raw = fs.readFileSync(SEED_PATH, 'utf-8');
    seedFile = JSON.parse(raw) as SeedFile;
  } catch (err) {
    console.error(`❌ BLOQUÉ : Impossible de parser le fichier seed : ${(err as Error).message}`);
    process.exit(1);
  }

  if (!Array.isArray(seedFile.entries)) {
    console.error('❌ BLOQUÉ : Le fichier seed ne contient pas de tableau "entries" valide.');
    process.exit(1);
  }

  const entries = seedFile.entries;
  console.log(`📄 Fichier seed lu : ${entries.length} entrées trouvées`);

  // ── [3] Validation ─────────────────────────────────────────────────────────

  // Si --allow-urls, ne pas bloquer sur les URLs non-null
  // (prévu pour les phases futures — désactivé par défaut en Phase 1)
  const result = allowUrls
    ? validateAllAllowUrls(entries)
    : validateAll(entries);

  printReport(entries.length, result, mode);

  // Bloquer si doublons
  if (result.duplicates.length > 0) {
    console.error('\n❌ Import bloqué : doublons détectés. Corrigez le seed avant de relancer.');
    process.exit(1);
  }

  // Bloquer si erreurs de validation
  if (result.errors.length > 0) {
    console.error('\n❌ Import bloqué : des erreurs de validation doivent être corrigées.');
    process.exit(1);
  }

  console.log(`\n✅ Validation réussie : ${result.valid.length} lignes prêtes.`);

  // ── [4] Dry-run ────────────────────────────────────────────────────────────

  if (mode === 'dry-run') {
    console.log('\n🔍 Mode DRY-RUN — aucune donnée insérée.');
    console.log('   Pour effectuer l\'import réel, relancez avec --apply :');
    console.log('   npx tsx scripts/seed/importScpiSourceRegistrySeed.ts --apply\n');
    process.exit(0);
  }

  // ── [5] Import réel ────────────────────────────────────────────────────────

  console.log('\n🚀 Mode APPLY — upsert en cours sur scpi_source_registry...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Préparer les payloads : ne pas envoyer les champs null inutiles
  const payloads = result.valid.map((entry) => ({
    scpi_slug: entry.scpi_slug,
    scpi_name: entry.scpi_name,
    management_company: entry.management_company,
    verification_status: entry.verification_status,
    confidence_level: entry.confidence_level,
    notes: (entry.notes as string | null) ?? null,
    // Tous les champs URL restent null en Phase 1
    official_scpi_page_url: null,
    bulletin_url: null,
    annual_report_url: null,
    dic_url: null,
    note_information_url: null,
    statutes_url: null,
    source_domain: null,
    last_document_period: null,
    last_document_date: null,
    last_verified_at: null,
  }));

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(payloads, { onConflict: 'scpi_slug' })
    .select('scpi_slug');

  printSeparator();

  if (error) {
    console.error('❌ Erreur Supabase lors de l\'upsert :');
    console.error(`   Code    : ${error.code}`);
    console.error(`   Message : ${error.message}`);
    console.error(`   Détails : ${error.details ?? '—'}`);
    process.exit(1);
  }

  const upsertedCount = data?.length ?? 0;
  console.log(`✅ Upsert terminé : ${upsertedCount} lignes insérées/mises à jour.`);

  if (data && data.length > 0) {
    console.log('\nSlugs traités :');
    for (const row of data) {
      console.log(`  • ${row.scpi_slug}`);
    }
  }

  printSeparator();
  console.log('\n✅ Import Phase 1B terminé avec succès.\n');
}

// ─── Variante sans vérification URL (--allow-urls) ───────────────────────────

function validateAllAllowUrls(entries: unknown[]): ValidationResult {
  const valid: SeedEntry[] = [];
  const errors: ValidationResult['errors'] = [];

  for (let i = 0; i < entries.length; i++) {
    const raw = entries[i];
    const slug = raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).scpi_slug as string) ?? null
      : null;

    if (!raw || typeof raw !== 'object') {
      errors.push({ index: i + 1, slug: null, reasons: ['La ligne n\'est pas un objet JSON valide'] });
      continue;
    }

    const obj = raw as Record<string, unknown>;
    const reasons: string[] = [];

    const requiredFields = ['scpi_slug', 'scpi_name', 'management_company', 'verification_status', 'confidence_level'];
    for (const field of requiredFields) {
      if (!obj[field] || typeof obj[field] !== 'string' || (obj[field] as string).trim() === '') {
        reasons.push(`Champ obligatoire manquant ou vide : ${field}`);
      }
    }

    if (obj.verification_status && !VALID_VERIFICATION_STATUSES.includes(obj.verification_status as VerificationStatus)) {
      reasons.push(`verification_status invalide : "${obj.verification_status}"`);
    }

    if (obj.confidence_level && !VALID_CONFIDENCE_LEVELS.includes(obj.confidence_level as ConfidenceLevel)) {
      reasons.push(`confidence_level invalide : "${obj.confidence_level}"`);
    }

    if (reasons.length > 0) {
      errors.push({ index: i + 1, slug, reasons });
    } else {
      valid.push(obj as unknown as SeedEntry);
    }
  }

  const duplicates = detectDuplicates(entries);
  return { valid, errors, duplicates };
}

// ─── Exécution ────────────────────────────────────────────────────────────────

main().catch((err: unknown) => {
  console.error('\n❌ Erreur inattendue :');
  console.error((err as Error).message ?? err);
  process.exit(1);
});
