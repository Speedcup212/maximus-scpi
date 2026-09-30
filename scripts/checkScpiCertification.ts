import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Generic CI (e.g. GitHub PR builds) does not receive production Supabase secrets.
  // Production/Netlify builds do: there, this check is fail-closed.
  console.warn('[SCPI certification] Supabase non configuré dans cet environnement : contrôle distant ignoré.');
  process.exit(0);
}

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await client
  .from('scpi_bulletin_analysis')
  .select('scpi_slug,current_period,previous_period,risk_level,improvements,deteriorations,alerts,watch_points,analysis_version,certification_status,certification_reasons,current_source_certified,comparison_certified,structural_event_detected,certified_source_url')
  .limit(5000);

if (error) {
  console.error('[SCPI certification] Lecture Supabase impossible :', error.message);
  process.exit(1);
}

const trendMetrics = new Set([
  'prix_reconstitution',
  'valeur_realisation',
  'tof_tendance',
  'endettement_tendance',
  'croissance_occupation',
  'capital_type',
]);
const priceGapMetrics = new Set(['surcote_reconstitution', 'decote_reconstitution']);
const violations: string[] = [];

const asArray = (value: unknown): Record<string, any>[] => Array.isArray(value) ? value as Record<string, any>[] : [];

for (const row of data || []) {
  const slug = String(row.scpi_slug || '?');
  const alerts = asArray(row.alerts);
  const watches = asArray(row.watch_points);
  const improvements = asArray(row.improvements);
  const deteriorations = asArray(row.deteriorations);

  if (row.risk_level === 'high' && row.current_source_certified !== true) {
    violations.push(`${slug}: vigilance élevée sans source courante certifiée`);
  }
  if (row.risk_level === 'high' && row.certification_status === 'review_required') {
    violations.push(`${slug}: vigilance élevée alors que la certification requiert une revue`);
  }
  if (row.current_source_certified === true && !row.certified_source_url) {
    violations.push(`${slug}: source annoncée certifiée mais URL de preuve absente`);
  }
  if (row.previous_period && row.comparison_certified !== true) {
    if (improvements.length || deteriorations.length) {
      violations.push(`${slug}: trajectoire publiée alors que l'historique n'est pas certifié`);
    }
    const leakedTrend = [...alerts, ...watches].find((signal) => trendMetrics.has(String(signal.metric || '')) && signal.quality_issue !== true);
    if (leakedTrend) {
      violations.push(`${slug}: signal de tendance ${String(leakedTrend.metric)} publié sans comparaison certifiée`);
    }
  }
  if (row.structural_event_detected === true) {
    const leakedPriceGap = [...alerts, ...watches].find((signal) => priceGapMetrics.has(String(signal.metric || '')) && signal.quality_issue !== true);
    if (leakedPriceGap) {
      violations.push(`${slug}: décote/surcote publiée malgré un événement structurel actif`);
    }
  }
  if (row.analysis_version !== '2026-09-30-v4-certified') {
    violations.push(`${slug}: version d'analyse non certifiée (${String(row.analysis_version || 'absente')})`);
  }
}

if (violations.length) {
  console.error(`[SCPI certification] ${violations.length} violation(s) bloquante(s) :`);
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

const counts = (data || []).reduce<Record<string, number>>((acc, row) => {
  const key = String(row.certification_status || 'unknown');
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log(`[SCPI certification] OK — ${(data || []).length} analyses contrôlées. ${JSON.stringify(counts)}`);
