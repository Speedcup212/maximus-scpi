import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '../src/data/scpiIndicatorHistory.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

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
  .limit(5000);

if (error) {
  console.error('[SCPI history] Export Supabase impossible :', error.message);
  process.exit(1);
}

const rows = [...(data || [])].sort((a: any, b: any) => {
  const slugCompare = String(a.scpi_slug || '').localeCompare(String(b.scpi_slug || ''), 'fr');
  if (slugCompare !== 0) return slugCompare;
  return periodSortKey(a.source_period) - periodSortKey(b.source_period);
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      source: 'Supabase scpi_indicator_history',
      rows,
    },
    null,
    2
  ) + '\n',
  'utf-8'
);

console.log(`[SCPI history] ${rows.length} snapshots exportés vers ${outputPath}`);
