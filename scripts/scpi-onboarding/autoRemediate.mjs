// RECOVERY-072 — Safe, bounded remediation of PRIVATE candidate staging snapshots.
// A successful repair does not grant certification or authorise publication.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectPrivateCandidate } from './candidateConsistency.mjs';
import {spawnSync} from 'node:child_process';

const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const FIXTURES = path.join(ROOT, 'scripts/scpi-onboarding/fixtures');
const STAGE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*-staging-[0-9a-z-]+\.json$/;
const SHA = /^[a-f0-9]{64}$/;
const PERIOD = /^20\d{2}-T[1-4]$/;
const MAX_PASSES = 2;
export function affectedRepairControls(actions) {
  const controls=new Set();
  for(const action of actions) {
    if(action.code==='RECALCULATE_DERIVED_CAPITALISATION_MEUR')controls.add('scripts/scpi-onboarding/candidateConsistency.test.mjs');
    else if(action.code==='ORDER_SOURCE_QUARTERS_ASC')controls.add('scripts/scpi-onboarding/datedEvidence.test.mjs');
    else throw Error('UNREGISTERED_REPAIR_CONTROL:'+action.code);
  }
  if(controls.size)controls.add('scripts/scpi-onboarding/cohortInvariant.test.mjs');
  return [...controls].sort();
}

const BLOCKER_ACTIONS = Object.freeze({
  CURRENT_STATUTES_NOT_VERIFIED: 'RECOVER_CURRENT_OFFICIAL_STATUTES_AND_VERIFY_BINARY',
  VALUATION_PRECEDES_CURRENT_QUARTER: 'PRESERVE_LAST_DATED_OFFICIAL_VALUE_AND_CHECK_NEW_REPORT',
  HISTORY_HAS_FEWER_THAN_2_TECHNICAL_SNAPSHOTS: 'RETRIEVE_OLDER_OFFICIAL_BULLETIN',
  'GEO:PUBLISHER_ROUNDING_NOT_100': 'KEEP_OFFICIAL_PERCENTAGES_AND_RECORD_ROUNDING',
  'SECTOR:PUBLISHER_ROUNDING_NOT_100': 'KEEP_OFFICIAL_PERCENTAGES_AND_RECORD_ROUNDING',
});

function trustedCore(snapshot) {
  if (snapshot?.publication_authorized !== false ||
      snapshot?.stage_status !== 'pending_independent_qa' ||
      !SHA.test(snapshot.source_pdf_sha256 || '')) return null;
  const rows = snapshot.quarterly_snapshots;
  if (!Array.isArray(rows) || !rows.length) return null;
  const periods = rows.map(r => r.source_period);
  if (new Set(periods).size !== periods.length ||
      periods.some(p => !PERIOD.test(p || ''))) return null;
  const current = rows.find(r => r.source_period === snapshot.source_period);
  if (!current || current.qa_status !== 'pending_independent_qa' ||
      current.pdf_sha256 !== snapshot.source_pdf_sha256) return null;
  // No repair can be based on an inconsistent source. Require every row's
  // independently entered source price, parts and cap to agree to the cent.
  for (const r of rows) {
    if (!SHA.test(r.pdf_sha256 || '') || r.qa_status !== 'pending_independent_qa' ||
        !Number.isSafeInteger(r.capitalisation_eur) || r.capitalisation_eur <= 0 ||
        !Number.isSafeInteger(r.nombre_parts) || r.nombre_parts <= 0 ||
        !Number.isFinite(r.prix_souscription_eur) || r.prix_souscription_eur <= 0 ||
        Math.abs(r.prix_souscription_eur * r.nombre_parts - r.capitalisation_eur) > 0.01) return null;
  }
  if (!Number.isSafeInteger(snapshot.source_capitalisation_eur) ||
      current.capitalisation_eur !== snapshot.source_capitalisation_eur) return null;
  return current;
}

export function safeRepairCandidate(input) {
  const snapshot = structuredClone(input);
  const before = inspectPrivateCandidate(snapshot);
  const actions = [], rejected = [];
  const current = trustedCore(snapshot);
  if (current) {
    const derived = current.capitalisation_eur / 1_000_000;
    if (snapshot.capitalisation_million_eur !== derived) {
      actions.push({
        code: 'RECALCULATE_DERIVED_CAPITALISATION_MEUR',
        field: 'capitalisation_million_eur',
        before: snapshot.capitalisation_million_eur ?? null,
        after: derived,
        evidence_period: current.source_period,
        evidence_sha256: current.pdf_sha256,
        proof: 'source_capitalisation_eur == verified current price * parts',
      });
      snapshot.capitalisation_million_eur = derived;
    }
    // Ordering is presentational: never alter or deduplicate source records.
    const ordered = [...snapshot.quarterly_snapshots]
      .sort((a, b) => a.source_period.localeCompare(b.source_period));
    if (ordered.some((r, i) => r !== snapshot.quarterly_snapshots[i])) {
      actions.push({ code: 'ORDER_SOURCE_QUARTERS_ASC', field: 'quarterly_snapshots',
        before: snapshot.quarterly_snapshots.map(r => r.source_period),
        after: ordered.map(r => r.source_period) });
      snapshot.quarterly_snapshots = ordered;
    }
  } else {
    rejected.push({
      code: 'NO_TRUSTED_BASIS_FOR_AUTOFIX',
      reason: 'Source hashes, period uniqueness, QA-pending flags, or arithmetic proofs do not agree',
    });
  }
  const after = inspectPrivateCandidate(snapshot);
  // Fixed fields are derived/presentational only. No source, QA, reviewer or
  // release field can be modified, including in other nested objects.
  const allowed = new Set(['capitalisation_million_eur', 'quarterly_snapshots']);
  for (const key of new Set([...Object.keys(input || {}), ...Object.keys(snapshot)])) {
    if (!allowed.has(key) && JSON.stringify(input?.[key]) !== JSON.stringify(snapshot[key])) {
      throw new Error('FORBIDDEN_AUTOFIX_FIELD:' + key);
    }
  }
  // Every quarter must be byte-for-byte unchanged and only reordered.
  const ids = rows => (rows || []).map(r => JSON.stringify(r)).sort();
  if (JSON.stringify(ids(input?.quarterly_snapshots)) !==
      JSON.stringify(ids(snapshot.quarterly_snapshots))) {
    throw new Error('SOURCE_RECORD_MUTATION_BLOCKED');
  }
  const changed = actions.length > 0;
  const remainingTechnical = [...after.errors];
  const pendingGates = [...new Set([
    ...(snapshot.remaining_gates || []),
    ...after.warnings.filter(x => !x.includes('PUBLISHER_ROUNDING_NOT_100')),
    ...(snapshot.metric_evidence_pending > 0 ? ['INDEPENDENT_METRIC_QA'] : []),
    ...(snapshot.allocation_evidence_pending > 0 ? ['INDEPENDENT_ALLOCATION_QA'] : []),
    ...(!snapshot.regulatory_documents?.statutes?.verified_current_for_2026 ? ['CURRENT_STATUTES_NOT_VERIFIED'] : []),
  ])];
  return {
    snapshot,
    report: {
      task: 'RECOVERY-072', batch_id: snapshot.batch_id,
      candidate_slug: snapshot.scpi_slug || path.basename(snapshot.batch_id || 'unknown'),
      status: remainingTechnical.length ? 'BLOCKED_TECHNICAL'
        : pendingGates.length ? 'TECHNICAL_REMEDIATED_RELEASE_BLOCKED' : 'TECHNICAL_PASS_ONLY',
      before: { status: before.status, errors: before.errors },
      after: { status: after.status, errors: after.errors },
      actions, rejected,
      affected_controls: affectedRepairControls(actions),
      remaining_technical_errors: remainingTechnical,
      pending_gates: pendingGates.map(code => ({
        code, action: BLOCKER_ACTIONS[code] || (
          code.includes('QA') || code.includes('AUDIT') ? 'COMPLETE_SOURCE_BACKED_REVIEW'
          : code.includes('STATUTES') ? 'RECOVER_CURRENT_OFFICIAL_STATUTES_AND_VERIFY_BINARY'
          : 'COMPLETE_REQUIRED_GUARD_WITH_VERIFIED_EVIDENCE'),
      })),
      changed,
      evidence_scope: 'COMMITTED_PRIVATE_SNAPSHOT_NOT_LIVE_DATABASE',
      live_certification_verified: false,
      publication_authorized: false,
      financial_qa_automatically_approved: false,
      note: 'Only derived quantities and record ordering can be repaired. No DB write, no fake QA, no production deployment.',
    },
  };
}

function safeFixture(file) {
  const resolved = path.resolve(FIXTURES, file);
  if (path.dirname(resolved) !== FIXTURES || !STAGE_NAME.test(path.basename(resolved)))
    throw new Error('UNTRUSTED_STAGE_PATH');
  return resolved;
}
export function runCli(args = process.argv.slice(2)) {
  const scan = args.includes('--scan');
  const write = args.includes('--write');
  const fileAt = args.indexOf('--file');
  const reportAt = args.indexOf('--report');
  if (scan === (fileAt >= 0)) throw new Error('Choose --scan OR --file <basename>');
  if (reportAt < 0 || !args[reportAt + 1]) throw new Error('Require --report <path>');
  const files = scan
    ? fs.readdirSync(FIXTURES).filter(n => STAGE_NAME.test(n)).sort()
    : [args[fileAt + 1]];
  if (!files.length) throw new Error('NO_CANDIDATE_STAGING_FIXTURES');
  const results = [];
  for (const name of files) {
    const filePath = safeFixture(name);
    const original = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { snapshot, report } = safeRepairCandidate(original);
    if (write && report.changed) {
      fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2) + '\n');
    }
    results.push({ file: name, ...report, write_applied: write && report.changed });
  }
  const out = { task: 'RECOVERY-072', mode: write ? 'SAFE_WRITE_ONLY' : 'DRY_RUN',
    evidence_scope: 'COMMITTED_PRIVATE_SNAPSHOT_NOT_LIVE_DATABASE',
    live_certification_verified: false,
    candidates: results, auto_repaired_count: results.filter(r => r.changed).length,
    candidates_with_pending_gates: results.filter(r => r.pending_gates.length).length,
    publication_authorized: false };
  if(args.includes('--retest')) {
    const controls=[...new Set(results.flatMap(r=>r.affected_controls))].sort();
    if(controls.length) {
      const check=spawnSync(process.execPath,['--test',...controls],{cwd:ROOT,encoding:'utf8',timeout:120000});
      out.targeted_retest={status:check.status===0&&!check.error?'PASS':'FAIL',controls,exit_code:check.status};
      process.stdout.write(check.stdout||'');process.stderr.write(check.stderr||'');
      if(out.targeted_retest.status==='FAIL')process.exitCode=1;
    } else out.targeted_retest={status:'NOT_NEEDED_NO_SAFE_CORRECTION',controls:[]};
  }
  const dest = path.resolve(ROOT, args[reportAt + 1]);
  if (!dest.startsWith(ROOT + path.sep) ||
      !dest.includes('/test-results/scpi-auto-recovery/'))
    throw new Error('REPORT_OUTSIDE_SAFE_ARTIFACT_DIR');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ mode: out.mode, auto_repaired_count: out.auto_repaired_count,
    candidates_with_pending_gates: out.candidates_with_pending_gates, report: path.relative(ROOT, dest) }) + '\n');
  // Unresolved SOURCE inconsistencies fail the workflow, while regulatory/QA
  // blockers are explicitly reported and leave the existing 68 published funds intact.
  if (results.some(r => r.remaining_technical_errors.length)) process.exitCode = 1;
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runCli(); } catch (error) { console.error(error); process.exitCode = 1; }
}
