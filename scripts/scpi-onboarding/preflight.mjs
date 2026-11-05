// RECOVERY-070: source-backed, read-only, issuer-independent SCPI onboarding preflight.
// This is NOT a publication approval or a substitute for private database / browser gates.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reconcileDatedValues, reportingPeriodEnd } from './datedEvidence.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SHA = /^[a-f0-9]{64}$/;
const PERIOD = /^20\d{2}-(?:T[1-4]|S[12])$/;
const ANNUAL = /^20\d{2}-RA$/;
const DAY = /^20\d{2}-\d\d-\d\d$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CORE = ['prix_souscription', 'capitalisation', 'tof'];
const DATED = ['prix_reconstitution', 'valeur_realisation'];
const ANNUAL_FIELDS = ['td'];
const OPTIONAL = ['endettement', 'walt', 'walb', 'prix_retrait'];
const MISSING = new Set(['OFFICIALLY_ABSENT', 'LAST_OFFICIAL_VALUE', 'EXTRACTION_FAILED']);

export function canonicalSlug(name) {
  return String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function validOfficialUrl(url, hosts) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
      Array.isArray(hosts) && hosts.includes(parsed.hostname.toLowerCase());
  } catch { return false; }
}
export function validDate(value) {
  if (typeof value !== 'string' || !DAY.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function financialSemanticsErrors(indicator) {
  const errors=[];
  const units={prix_souscription:'EUR_PER_PART',prix_reconstitution:'EUR_PER_PART',
    valeur_realisation:'EUR_PER_PART',prix_retrait:'EUR_PER_PART',capitalisation:'MILLION_EUR',
    td:'PERCENT',tof:'PERCENT',endettement:'PERCENT',walt:'YEARS',walb:'YEARS'};
  for(const [field,unit] of Object.entries(units)) {
    if(indicator?.[field]==null)continue;
    const proof=indicator.metric_provenance?.[field];
    // Older structural snapshots can omit units; never silently approve a
    // contradictory unit or a proof explicitly attached to another metric.
    if(proof?.unit && proof.unit!==unit)errors.push(field+':UNIT_SEMANTICS_MISMATCH');
    if(proof?.metric && proof.metric!==field)errors.push(field+':METRIC_IDENTITY_MISMATCH');
  }
  if(Number.isFinite(indicator?.walt)&&Number.isFinite(indicator?.walb)&&indicator.walb>indicator.walt)
    errors.push('WALT_WALB_ORDER_INCONSISTENT');
  return errors;
}
export function validateCohort(cohort, specs, mode = 'new') {
  const errors = [];
  const slugs = cohort?.slugs;
  if (!Array.isArray(slugs) || !Number.isSafeInteger(cohort?.count) ||
      cohort.count !== slugs?.length || new Set(slugs || []).size !== slugs?.length ||
      slugs?.some(slug => !SLUG.test(slug))) errors.push('COHORT_IDENTITY_OR_COUNT_INVALID');
  const candidateIds = specs.map(spec => spec.slug);
  if (candidateIds.length === 0 || new Set(candidateIds).size !== candidateIds.length ||
      candidateIds.some(slug => !SLUG.test(slug))) errors.push('CANDIDATE_IDENTITIES_INVALID');
  if (Array.isArray(slugs)) {
    for (const slug of candidateIds) {
      if (mode === 'new' && slugs.includes(slug)) errors.push(slug + ':ALREADY_PUBLIC');
      if (mode === 'regression' && !slugs.includes(slug)) errors.push(slug + ':NOT_PUBLIC_FOR_REGRESSION');
    }
  }
  return { errors, expected_after: mode === 'new' && Array.isArray(slugs) ?
    slugs.length + candidateIds.length : cohort?.count };
}
export function assessCandidate(spec, snapshot, catalog) {
  const errors = [], warnings = [];
  const slug = spec.slug;
  const hosts = spec.issuer_hosts;
  const i = (snapshot.indicators || []).filter(row => row.scpi_slug === slug);
  const a = (snapshot.analysis || []).filter(row => row.scpi_slug === slug);
  const history = (snapshot.history || []).filter(row => row.scpi_slug === slug);
  const rows = (catalog || []).filter(row => canonicalSlug(row['Nom SCPI']) === slug);
  if (rows.length !== 1 || rows[0]['Nom SCPI'] !== spec.name) errors.push('CATALOG_IDENTITY_MISMATCH');
  if (i.length !== 1) errors.push('INDICATOR_ROW_NOT_UNIQUE');
  if (a.length !== 1) errors.push('ANALYSIS_ROW_NOT_UNIQUE');
  if (!PERIOD.test(spec.source_period) || (spec.annual_period !== null && !ANNUAL.test(spec.annual_period))) errors.push('MANIFEST_PERIOD_INVALID');
  if (!Array.isArray(hosts) || !hosts.length || hosts.some(host => !/^[a-z0-9.-]+$/.test(host)))
    errors.push('ISSUER_HOSTS_INVALID');
  const indicator = i[0] || {};
  errors.push(...financialSemanticsErrors(indicator));
  const analysis = a[0] || {};
  if (indicator.source_period !== spec.source_period || analysis.current_period !== spec.source_period)
    errors.push('PERIOD_MISMATCH');
  if (!validOfficialUrl(indicator.source_url, hosts)) errors.push('INDICATOR_SOURCE_NOT_OFFICIAL');
  if (!validOfficialUrl(analysis.certified_source_url, hosts))
    errors.push('ANALYSIS_SOURCE_NOT_OFFICIAL');
  if (analysis.certified_source_url !== indicator.source_url)
    errors.push('ANALYSIS_INDICATOR_SOURCE_MISMATCH');
  if (typeof spec.subscription_price !== 'number' || spec.subscription_price <= 0 ||
      indicator.prix_souscription !== spec.subscription_price)
    errors.push('SUBSCRIPTION_PRICE_MISMATCH');
  if (rows.length === 1 && (rows[0].td_reference_period || null) !== (spec.annual_period || null))
    errors.push('CATALOG_ANNUAL_PERIOD_MISMATCH');

  const provenance = indicator.metric_provenance || {};
  const missing = spec.missing || {};
  for (const [field, declaration] of Object.entries(missing)) {
    if (!MISSING.has(declaration?.state)) {
      errors.push(field + ':UNKNOWN_MISSING_STATE');
    } else if (declaration.state === 'EXTRACTION_FAILED') {
      errors.push(field + ':EXTRACTION_FAILED');
    } else if (declaration.state === 'OFFICIALLY_ABSENT') {
      if (indicator[field] !== null && indicator[field] !== undefined)
        errors.push(field + ':ABSENCE_CONTRADICTS_VALUE');
      if (!validOfficialUrl(declaration.source_url, hosts) ||
          !Number.isSafeInteger(declaration.source_page) || declaration.source_page < 1 ||
          !SHA.test(declaration.pdf_sha256 || ''))
        errors.push(field + ':ABSENCE_UNPROVEN');
    } else {
      if (!Number.isFinite(declaration.value) || !validDate(declaration.reference_date) ||
          !validOfficialUrl(declaration.source_url, hosts) ||
          !Number.isSafeInteger(declaration.source_page) || declaration.source_page < 1 ||
          !SHA.test(declaration.pdf_sha256 || ''))
        errors.push(field + ':LAST_OFFICIAL_VALUE_UNPROVEN');
      if (indicator[field] != null && indicator[field] !== declaration.value)
        errors.push(field + ':LAST_OFFICIAL_VALUE_MISMATCH');
    }
  }

  function checkMetric(field, period, dated = false) {
    const value = indicator[field];
    if (value === null || value === undefined) {
      if (!missing[field]) {
        if (CORE.includes(field)) errors.push(field + ':REQUIRED_VALUE_MISSING');
        else warnings.push(field + ':NOT_REPORTED_OR_NOT_CLASSIFIED');
      }
      return;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) ||
        (CORE.includes(field) && value <= 0) ||
        (field === 'tof' && value > 100)) {
      errors.push(field + ':INVALID_NUMERIC_VALUE'); return;
    }
    const proof = provenance[field];
    if (!proof || !validOfficialUrl(proof.source_url, hosts) ||
        !Number.isSafeInteger(proof.source_page) || proof.source_page < 1 ||
        !SHA.test(proof.pdf_sha256 || '') || proof.source_period !== period ||
        (!validDate(proof.reference_date) && !(period === spec.source_period && !dated && proof.reference_date === period))) {
      errors.push(field + ':SOURCE_PAGE_DATE_SHA_MISSING'); return;
    }
    if (proof.reference_date === period && period === spec.source_period && !dated)
      warnings.push(field + ':PERIOD_ONLY_REFERENCE');
    const endOfPeriod = reportingPeriodEnd(spec.source_period);
    if (typeof proof.value_numeric === 'number' && proof.value_numeric !== value)
      errors.push(field + ':SOURCE_NUMERIC_VALUE_MISMATCH');
    if (dated && endOfPeriod && validDate(proof.reference_date) && proof.reference_date > endOfPeriod) {
      errors.push(field + ':FUTURE_VALUATION_DATE');
    }
    if (period === spec.source_period && proof.source_url !== indicator.source_url)
      errors.push(field + ':PDF_MISMATCH');
  }
  for (const field of CORE) checkMetric(field, spec.source_period);
  for (const field of DATED) checkMetric(field, spec.source_period, true);
  for (const field of ANNUAL_FIELDS) checkMetric(field, spec.annual_period, true);
  for (const field of OPTIONAL) checkMetric(field, spec.source_period);
  const historyPeriods = history.map(row => row.source_period);
  if (new Set(historyPeriods).size !== historyPeriods.length) errors.push('HISTORY_DUPLICATE_PERIOD');
  for (const row of history) {
    if (!PERIOD.test(row.source_period) || !validOfficialUrl(row.source_url, hosts))
      errors.push('HISTORY_INVALID_SOURCE_OR_PERIOD');
  }
  if (history.length < 2) warnings.push('HISTORY_INSUFFICIENT_FOR_TREND');
  if (analysis.comparison_certified !== true &&
      ((analysis.improvements || []).length || (analysis.deteriorations || []).length))
    errors.push('UNCERTIFIED_COMPARISON_LEAK');
  const releaseEvidence = analysis.current_source_certified === true &&
    ['certified', 'current_certified_history_unverified'].includes(analysis.certification_status) &&
    (analysis.certification_status !== 'current_certified_history_unverified' ||
      (analysis.comparison_certified === false &&
       !(analysis.improvements || []).length && !(analysis.deteriorations || []).length));
  if (!releaseEvidence) warnings.push('RELEASE_ANALYSIS_CERTIFICATION_INCOMPLETE');
  return { slug, errors, warnings, history_periods: historyPeriods,
    source_evidence_pass: errors.length === 0, release_analysis_ready: releaseEvidence };
}
export function assessBatch({ manifest, cohort, snapshot, catalog }) {
  const errors = [];
  const mode = manifest?.mode || 'new';
  if (!['new', 'regression'].includes(mode) ||
      manifest?.schema_version !== 1 || !Array.isArray(manifest.candidates))
    errors.push('MANIFEST_SCHEMA_INVALID');
  const specs = Array.isArray(manifest?.candidates) ? manifest.candidates : [];
  const state = validateCohort(cohort, specs, mode);
  errors.push(...state.errors);
  const candidates = specs.map(spec => {
    const report=assessCandidate(spec,snapshot,catalog);
    const indicator=(snapshot.indicators||[]).find(row=>row.scpi_slug===spec.slug);
    const history=(snapshot.history||[]).filter(row=>row.scpi_slug===spec.slug);
    const dated=indicator?reconcileDatedValues(indicator,history,{issuer_hosts:spec.issuer_hosts}):null;
    if(dated?.errors?.length)report.errors.push(...dated.errors.map(s=>'DATED:'+s));
    report.source_evidence_pass=report.errors.length===0;
    return {...report,dated_valuation:dated};
  });
  if (candidates.some(candidate => candidate.errors.length)) errors.push('CANDIDATE_SOURCE_PROOF_FAILED');
  return { task: 'RECOVERY-070', batch_id: manifest?.batch_id, phase: 'source_preflight_only',
    mode, current_cohort: cohort?.count, expected_after: state.expected_after,
    status: errors.length ? 'FAIL' : 'PASS', errors, candidates,
    publication_authorized: false,
    note: 'Structural source checks only; independent review, OIDC, browser CI, deploy SHA and atomic promotion remain mandatory.' };
}
export function runCli(args = process.argv.slice(2)) {
  const pos = args.indexOf('--manifest');
  if (pos < 0 || !args[pos + 1]) throw new Error('Usage: node scripts/scpi-onboarding/preflight.mjs --manifest <json>');
  const read = relative => {
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) throw new Error('Path outside repository');
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  };
  const manifest = read(args[pos + 1]);
  const result = assessBatch({ manifest,
    cohort: read('src/data/certified_scpi_cohort.json'),
    snapshot: read(manifest.snapshot_file),
    catalog: read('src/data/scpi_complet.json') });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'PASS') process.exitCode = 1;
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runCli(); } catch (error) { console.error(String(error)); process.exitCode = 1; }
}
