// Regression contract: 61 existing funds are the baseline; staged funds are NOT public.
// These tests use only repository fixtures and never contact Supabase or Netlify.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(f)=>fs.readFileSync(new URL('../../'+f,import.meta.url),'utf8');
const cohort=JSON.parse(read('src/data/certified_scpi_cohort.json'));
const candidates=JSON.parse(read('data-import/corum_candidates_prepublication_20261015.json'));
const migration=read('supabase/migrations/20261016_watchdog_scope_and_expired_leases.sql');
test('Certified cohort remains internally coherent and separated from provisional CORUM',()=>{
 assert.equal(cohort.count,cohort.slugs.length);
 assert.equal(new Set(cohort.slugs).size,cohort.count);
 assert.ok(cohort.count>=61,'Never silently shrink the 61-SCPI baseline');
 assert.ok(cohort.slugs.includes('iroko-atlas'));
 for(const c of candidates.scpi)assert.ok(!cohort.slugs.includes(c.scpi_slug),'Candidate must stay unpublished: '+c.scpi_slug);
});
test('Watchdog counts only existing cohort and treats missing strict rows as failures',()=>{
 assert.match(migration,/left join public\.scpi_crash_test_strict_v2 c on c\.scpi_slug=u\.scpi_slug/i);
 assert.match(migration,/where u\.lifecycle='existing'/i);
 assert.match(migration,/c\.crash_test_status is distinct from 'PASS_100'/i);
 assert.match(migration,/v_total<61/i);
 assert.match(migration,/'candidate_count',v_candidates/);
});
test('Expired execution leases are quarantined and cannot silently pass',()=>{
 assert.match(migration,/reconcile_expired_tasks\(\)/);
 assert.match(migration,/kind='audit' AND t\.attempts<2/);
 assert.match(migration,/status='blocked',result=evidence/);
 assert.match(migration,/status='expired',finished_at=now\(\)/);
 assert.match(migration,/REVOKE ALL ON FUNCTION maximus_agents\.reconcile_expired_tasks\(\) FROM PUBLIC, anon, authenticated/);
 assert.doesNotMatch(migration,/update maximus_agents\.scpi_universe set publication_authorized=true/i);
});

test('Daily coordinator prioritizes pending execution and QA over redundant audits',()=>{
 assert.match(migration,/CREATE OR REPLACE FUNCTION maximus_agents\.prepare_cycle\(\)/);
 assert.match(migration,/audit_omitted','PENDING_EXECUTION_FIRST'/);
 assert.match(migration,/kind in \('execute','verify'\) and status in \('pending','running'\)/);
 assert.doesNotMatch(migration,/update maximus_agents\.tasks set status=case when attempts<2 then 'pending' else 'failed' end/);
});
