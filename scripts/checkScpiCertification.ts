import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const required = process.env.REQUIRE_SUPABASE_CERTIFICATION === 'true';
const sourceFields = 'scpi_slug,current_period,previous_period,risk_level,improvements,deteriorations,alerts,watch_points,analysis_version,certification_status,certification_reasons,current_source_certified,comparison_certified,structural_event_detected,certified_source_url';

const oidcSnapshot = async (): Promise<Record<string, any>[]> => {
  const tokenUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  const sha = process.env.GITHUB_SHA;
  if (!tokenUrl || !requestToken || !sha || !/^[0-9a-f]{40}$/.test(sha)) {
    throw new Error('GitHub OIDC release identity unavailable');
  }
  const target = new URL(tokenUrl);
  target.searchParams.set('audience', 'maximus-scpi-release-certification-ygvsddcpohsnaowofuwc');
  const tokenResponse = await fetch(target, { headers: { Authorization: `Bearer ${requestToken}` } });
  if (!tokenResponse.ok) throw new Error(`GitHub OIDC token HTTP ${tokenResponse.status}`);
  const { value: oidc } = await tokenResponse.json() as { value?: string };
  if (!oidc) throw new Error('GitHub OIDC token missing');
  const response = await fetch('https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-release-certification-oidc', {
    method: 'POST',
    headers: { Authorization: `Bearer ${oidc}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'attest_release', sha }),
  });
  if (!response.ok) throw new Error(`Supabase OIDC certification HTTP ${response.status}: ${(await response.text()).slice(0,250)}`);
  const snapshot = await response.json() as { ok?: boolean; sha?: string; enabled_scpi?: number; analyses?: Record<string, any>[] };
  if (!snapshot.ok || snapshot.sha !== sha || snapshot.enabled_scpi !== 65 || !Array.isArray(snapshot.analyses)) {
    throw new Error('Release attestation invalid or incomplete');
  }
  return snapshot.analyses;
};

let data: Record<string, any>[];
try {
  if (required && process.env.GITHUB_ACTIONS === 'true') {
    // Attested full-cohort snapshot; no secret key in GitHub Actions.
    data = await oidcSnapshot();
  } else if (supabaseUrl && supabaseKey) {
    const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await client.from('scpi_bulletin_analysis').select(sourceFields).limit(5000);
    if (result.error) throw result.error;
    data = result.data || [];
  } else if (!required) {
    console.warn('[SCPI certification] SKIPPED_REMOTE: local code build only; no live certification claimed.');
    process.exit(0);
  } else {
    throw new Error('Required live Supabase certification unavailable');
  }
} catch (error) {
  console.error('[SCPI certification] FAIL CLOSED:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (required) {
  // The public site declares 65 funds; a short or extra data response cannot
  // silently make a production release look successfully certified.
  const expected = JSON.parse(readFileSync(new URL('../src/data/certified_scpi_cohort.json', import.meta.url), 'utf8')) as { count: number; slugs: string[] };
  const actualSlugs = new Set(data.map(row => String(row.scpi_slug)));
  const expectedSlugs = new Set(expected.slugs);
  if (expected.count !== 65 || expectedSlugs.size !== 65 || data.length !== 65 ||
      actualSlugs.size !== 65 || [...expectedSlugs].some(slug => !actualSlugs.has(slug))) {
    console.error('[SCPI certification] FAIL: actual analyses differ from the exact 65-fund certified cohort.');
    process.exit(1);
  }
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