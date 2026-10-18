/**
 * Seme des années de départ PROVISOIRES à partir du catalogue existant.
 * Jamais de "official_verified" sans PDF, jamais de déploiement, jamais d'agent.
 * Par défaut : dry-run. Écriture uniquement avec --apply.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const apply = process.argv.includes('--apply');
const catalog = JSON.parse(readFileSync(new URL('../../src/data/scpi_complet.json', import.meta.url), 'utf8'));
const slugify = (name) => String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const candidates = catalog
  .filter((row) => Number.isInteger(row['Année de création']) &&
    row['Année de création'] >= 1900 &&
    row['Année de création'] <= new Date().getFullYear())
  .map((row) => ({
    scpi_slug: slugify(row['Nom SCPI']),
    start_year: row['Année de création'],
    start_year_status: 'catalog_provisional',
    source_note: 'Année provisoire issue du catalogue MaximusSCPI. Vérifier la date de lancement commercial sur une publication officielle avant certification.',
  }));
if (new Set(candidates.map((row) => row.scpi_slug)).size !== candidates.length) {
  throw new Error('Deux SCPI partagent le même slug : arrêter sans écriture.');
}
if (!apply) {
  console.log(JSON.stringify({ mode: 'dry-run', candidates: candidates.length,
    missing_catalog_start_years: catalog.length - candidates.length,
    next_action: 'Relancer avec --apply et SUPABASE_SERVICE_ROLE_KEY seulement après revue.' }, null, 2));
  process.exit(0);
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.');
const client = createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
const {data:registered,error:readError} = await client.from('scpi_indicators')
  .select('scpi_slug').limit(5000);
if (readError) throw readError;
const existing = new Set((registered || []).map((r) => r.scpi_slug));
const rows = candidates.filter((row) => existing.has(row.scpi_slug));
if (rows.length) {
  const {error} = await client.from('scpi_history_scope')
    .upsert(rows,{onConflict:'scpi_slug',ignoreDuplicates:true});
  if (error) throw error;
}
console.log(JSON.stringify({mode:'applied',eligible_rows:rows.length,
  ignored_not_in_db:candidates.length-rows.length,
  preserved_existing_official_certifications:true},null,2));
