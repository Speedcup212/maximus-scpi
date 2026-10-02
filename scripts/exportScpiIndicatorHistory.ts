import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '../src/data/scpiIndicatorHistory.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[SCPI history] Supabase non configuré : snapshot local conservé.');
  process.exit(0);
}

const periodSortKey = (period: string | null): number => {
  const p = String(period || '').trim();

  let match = p.match(/^T([1-4])\s+(\d{4})$/i);
  if (match) return Number(match[2]) * 10 + Number(match[1]);

  match = p.match(/^S([12])\s+(\d{4})$/i);
  if (match) return Number(match[2]) * 10 + (match[1] === '1' ? 2 : 4);

  match = p.match(/^(\d{4})-[TQ]([1-4])$/i);
  if (match) return Number(match[1]) * 10 + Number(match[2]);

  return 0;
};

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const parisDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

let baselineRows: any[] = [];
let baselineSource = 'Supabase scpi_indicator_history';
let baselineGeneratedAt: string | null = null;

if (fs.existsSync(outputPath)) {
  try {
    const baseline = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    baselineRows = Array.isArray(baseline?.rows) ? baseline.rows : [];
    baselineSource = String(baseline?.source || baselineSource);
    baselineGeneratedAt = baseline?.generated_at ? String(baseline.generated_at) : null;
  } catch (error) {
    console.error('[SCPI history] Snapshot local illisible : publication interrompue.', error);
    process.exit(1);
  }
}

const { data: pendingQueue, error: queueError } = await supabase
  .from('scpi_publish_queue')
  .select('scpi_slug,publish_after,change_type,published_at')
  .eq('change_type', 'trajectory_data')
  .is('published_at', null)
  .lte('publish_after', parisDate)
  .limit(5000);

if (queueError) {
  console.error('[SCPI history] Lecture de la file de publication impossible :', queueError.message);
  process.exit(1);
}

const pendingSlugs = [...new Set((pendingQueue || [])
  .map((row: any) => String(row.scpi_slug || '').trim())
  .filter(Boolean))];

if (!pendingSlugs.length) {
  console.log('[SCPI history] Aucun changement trajectory_data éligible en attente : snapshot local conservé.');
  process.exit(0);
}

const { data: crashRows, error: crashError } = await supabase
  .from('scpi_crash_test_status')
  .select('scpi_slug,crash_status')
  .in('scpi_slug', pendingSlugs)
  .limit(5000);

if (crashError) {
  console.error('[SCPI history] Lecture des crash tests impossible :', crashError.message);
  process.exit(1);
}

const passSlugs = new Set((crashRows || [])
  .filter((row: any) => String(row.crash_status || '').toUpperCase() === 'PASS')
  .map((row: any) => String(row.scpi_slug || '').trim())
  .filter(Boolean));

const eligibleSlugs = pendingSlugs.filter((slug) => passSlugs.has(slug));
const blockedSlugs = pendingSlugs.filter((slug) => !passSlugs.has(slug));

if (blockedSlugs.length) {
  console.log(`[SCPI history] ${blockedSlugs.length} SCPI non-PASS conservées sans modification : ${blockedSlugs.join(', ')}`);
}

if (!eligibleSlugs.length) {
  console.log('[SCPI history] Aucun changement PASS à publier : snapshot local conservé.');
  process.exit(0);
}

const { data, error } = await supabase
  .from('scpi_indicator_history')
  .select(
    [
      'scpi_slug',
      'source_period',
      'source_type',
      'source_document',
      'source_url',
      'td',
      'tof',
      'capitalisation',
      'prix_souscription',
      'prix_reconstitution',
      'prix_retrait',
      'valeur_realisation',
      'endettement',
      'walt',
      'walb',
      'collecte_nette',
      'nb_cessions_trimestre',
      'distribution_par_part',
      'nombre_locataires',
      'nombre_immeubles',
      'parts_attente_retrait',
    ].join(',')
  )
  .in('scpi_slug', eligibleSlugs)
  .limit(5000);

if (error) {
  console.error('[SCPI history] Export Supabase impossible :', error.message);
  process.exit(1);
}

const eligibleSet = new Set(eligibleSlugs);
const preservedRows = baselineRows.filter((row: any) => !eligibleSet.has(String(row?.scpi_slug || '')));
const refreshedRows = data || [];
const rows = [...preservedRows, ...refreshedRows].sort((a: any, b: any) => {
  const slugCompare = String(a.scpi_slug || '').localeCompare(String(b.scpi_slug || ''), 'fr');
  if (slugCompare !== 0) return slugCompare;
  return periodSortKey(a.source_period) - periodSortKey(b.source_period);
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      source: `${baselineSource} — gated by scpi_publish_queue + crash_status=PASS`,
      previous_generated_at: baselineGeneratedAt,
      published_scpis: eligibleSlugs.sort((a, b) => a.localeCompare(b, 'fr')),
      rows,
    },
    null,
    2
  ) + '\n',
  'utf-8'
);

console.log(`[SCPI history] ${refreshedRows.length} snapshots rafraîchis pour ${eligibleSlugs.length} SCPI PASS.`);
console.log(`[SCPI history] ${preservedRows.length} snapshots hors batch conservés à l'identique.`);
