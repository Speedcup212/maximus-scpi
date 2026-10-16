// Guard public RLS and invoker views without contacting production.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const load = file => fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
const row = load('supabase/migrations/20261016_public_candidate_cohort_rls_gate.sql');
const views = load('supabase/migrations/20261016_trajectory_invoker_security.sql');

test('Candidate-bearing public tables include the certified cohort filter', () => {
  for (const table of ['scpi_indicators', 'scpi_bulletins', 'scpi_bulletin_analysis',
    'scpi_indicator_history', 'scpi_metric_certifications', 'scpi_trajectory_pilot']) {
    const anchor = 'ON public.' + table + '\nUSING (';
    const start = row.indexOf(anchor);
    assert.ok(start >= 0, 'Missing policy for ' + table);
    const next = row.indexOf(';\n', start);
    assert.ok(next > start, 'Incomplete policy for ' + table);
    const policy = row.slice(start, next);
    assert.ok(policy.includes('maximus_scpi_is_in_public_cohort(scpi_slug)'),
      'Candidate exposure on ' + table);
  }
  assert.ok(row.includes("u.lifecycle='existing'"));
  assert.ok(row.includes('REVOKE ALL ON FUNCTION public.maximus_scpi_is_in_public_cohort(text) FROM PUBLIC'));
});

test('Existing source and evidence restrictions remain in force', () => {
  assert.ok(row.includes('scpi_is_strong_qa(qa_status)'));
  assert.ok(row.includes("verification_status ILIKE 'manual_verified%'"));
  assert.ok(row.includes("NULLIF(btrim(evidence_text),'') IS NOT NULL"));
});

test('All eleven potentially candidate-bearing views use the invoking role', () => {
  for (const name of [
    'scpi_trajectory_pilot_history', 'scpi_trajectory_pilot_liquidity',
    'scpi_trajectory_pilot_readiness', 'scpi_trajectory_pilot_valuation_debt',
    'scpi_trajectory_signal_gate', 'scpi_annual_backfill_progress',
    'scpi_automation_status', 'scpi_indicator_deltas',
    'scpi_trajectory_agent_progress', 'scpi_trajectory_orchestrator_status',
    'scpi_trajectory_work_plan'
  ]) {
    assert.ok(views.includes('ALTER VIEW public.' + name + ' SET (security_invoker=true);'),
      'Definer view still exposed: ' + name);
  }
  assert.ok(views.includes('maximus_scpi_is_in_public_cohort(scpi_slug)'));
});
