import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
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
const liquidityMetrics = new Set(['liquidite_retraits', 'parts_attente_retrait', 'parts_en_attente_de_retrait']);
const acceptedAnalysisVersions = new Set([
  '2026-09-30-v4-certified',
  '2026-09-30-v5-liquidity',
]);
const violations: string[] = [];

const asArray = (value: unknown): Record<string, any>[] => Array.isArray(value) ? value as Record<string, any>[] : [];

const validateEmbeddedProof = (slug: string, metric: string, alert: Record<string, any>) => {
  const certification = alert.certification && typeof alert.certification === 'object'
    ? alert.certification as Record<string, any>
    : null;

  if (!certification || certification.status !== 'certified_with_field_evidence') {
    violations.push(`${slug}: alerte élevée ${metric} sans certification de champ`);
    return;
  }
  if (certification.evidence_version !== '2026-09-30-v1-page-proof') {
    violations.push(`${slug}: alerte élevée ${metric} avec version de preuve invalide`);
  }

  const proofs = asArray(certification.proofs);
  if (!proofs.length) {
    violations.push(`${slug}: alerte élevée ${metric} sans preuve exploitable`);
    return;
  }

  for (const proof of proofs) {
    const proofMetric = String(proof.metric || '');
    const method = String(proof.method || '');
    const sourceUrl = String(proof.source_url || '');
    const page = Number(proof.page);

    if (!proofMetric) violations.push(`${slug}: alerte élevée ${metric} avec preuve sans métrique`);
    if (!/^https?:\/\//i.test(sourceUrl)) violations.push(`${slug}: alerte élevée ${metric} avec preuve sans URL source`);
    if (method === 'pdf_page_text_match' && (!Number.isFinite(page) || page < 1)) {
      violations.push(`${slug}: alerte élevée ${metric} avec preuve PDF sans page`);
    } else if (method !== 'pdf_page_text_match' && method !== 'html_text_match' && !method.startsWith('manual_verified_plus_')) {
      violations.push(`${slug}: alerte élevée ${metric} avec méthode de preuve inconnue (${method || 'absente'})`);
    }
  }
};

for (const row of data || []) {
  const slug = String(row.scpi_slug || '?');
  const version = String(row.analysis_version || '');
  const alerts = asArray(row.alerts);
  const watches = asArray(row.watch_points);
  const improvements = asArray(row.improvements);
  const deteriorations = asArray(row.deteriorations);
  const highAlerts = alerts.filter((signal) => signal.severity === 'high');

  if (row.risk_level === 'high' && row.current_source_certified !== true) {
    violations.push(`${slug}: vigilance élevée sans source courante certifiée`);
  }
  if (row.risk_level === 'high' && row.certification_status === 'review_required') {
    violations.push(`${slug}: vigilance élevée alors que la certification requiert une revue`);
  }
  if (row.risk_level === 'high' && highAlerts.length === 0) {
    violations.push(`${slug}: vigilance élevée sans alerte élevée certifiée`);
  }

  for (const alert of highAlerts) {
    const metric = String(alert.metric || '?');

    // Doctrine v5 : les alertes de liquidité sont reconstruites côté base après
    // contrôle documentaire du ratio. Elles n'embarquent plus l'ancien objet
    // `certification` v4 dans le JSON de l'alerte. On contrôle donc ici les
    // invariants v5 visibles : source courante certifiée + ratio >= 5 %.
    if (version === '2026-09-30-v5-liquidity' && liquidityMetrics.has(metric)) {
      const ratio = Number(alert.ratio_pct);
      if (row.current_source_certified !== true) {
        violations.push(`${slug}: alerte liquidité v5 sans source courante certifiée`);
      }
      if (!Number.isFinite(ratio) || ratio < 5) {
        violations.push(`${slug}: alerte liquidité v5 élevée sans ratio >= 5 %`);
      }
      continue;
    }

    validateEmbeddedProof(slug, metric, alert);
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
  if (!acceptedAnalysisVersions.has(version)) {
    violations.push(`${slug}: version d'analyse non certifiée (${version || 'absente'})`);
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