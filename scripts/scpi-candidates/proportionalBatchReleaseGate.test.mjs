import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const gate=read('supabase/migrations/20261017_scpi_proportional_batch_final_validation.sql');
const draft=read('supabase/migrations/20261017_corum_one_batch_responsible_review_draft.sql');
const cohort=JSON.parse(read('src/data/certified_scpi_cohort.json'));

test('four independent external auditor signatures replaced by ONE accountable batch review',()=>{
 assert.match(gate,/CREATE TABLE IF NOT EXISTS maximus_agents\.scpi_candidate_batch_decisions/);
 assert.match(gate,/responsible_name text/);
 assert.match(gate,/decision_statement text/);
 assert.match(gate,/dossier_digest_sha256 text/);
 assert.match(gate,/decision<>'approved' OR/);
 assert.match(gate,/dossier_digest_sha256 ~ '\^\[0-9a-f\]\{64\}\$'/);
 assert.match(gate,/jsonb_typeof\(review_evidence->'financial_risk_exceptions'\)='array'/);
 assert.match(gate,/jsonb_typeof\(review_evidence->'issuer_document_checks'\)='object'/);
 assert.doesNotMatch(gate,/independent_qa_reference/);
});

test('automatically calculate objective readiness from immutable official fields and real browser proof',()=>{
 for(const important of ['annual_2025_sha_verified','quarter_2026_t2_sha_verified',
   'quarterly_core_qa_coverage>=5','regulatory_and_source_registry_verified',
   'allocations_verified','scpi_candidate_publication_draft_v1',
   'risk_warnings','liquidity_basis','td_reference_period',
   'private_chromium_acceptance_2026_10_17','checks_passed',
   'source_financial_ready','disclosure_ready','app_data_ready',
   'private_browser_proof_recorded'])
   assert.ok(gate.includes(important.replace('td_reference_period','annual_yield_reference')),important);
 assert.match(gate,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_final_release_v1/);
 assert.match(gate,/responsible_batch_approved/);
 assert.match(gate,/v\.final_release_ready/);
 assert.match(gate,/CREATE OR REPLACE FUNCTION public\.maximus_candidate_release_clearance/);
 assert.match(gate,/SELECT u\.scpi_slug, f\.final_release_ready/);
 assert.doesNotMatch(gate,/UPDATE\s+maximus_agents\.scpi_candidate_final_review/i);
});

test('a staging draft never signs off or makes any CORUM public',()=>{
 assert.match(draft,/'draft'/);
 assert.match(draft,/ON CONFLICT \(batch_id\) DO NOTHING/);
 assert.match(draft,/d\.responsible_name IS NULL/);
 assert.match(draft,/d\.decided_at IS NULL/);
 assert.match(draft,/d\.dossier_digest_sha256 IS NULL/);
 assert.match(draft,/responsible_batch_approved/);
 assert.doesNotMatch(draft,/UPDATE\s+(?:maximus_agents\.scpi_universe|public\.scpi_indicators)/i);
 assert.equal(cohort.count,61);
 for(const slug of ['corum-eurion','corum-origin','corum-usa','corum-xl'])
   assert.ok(!cohort.slugs.includes(slug),slug);
});

test('only a private service-side reviewer may write approvals, no public privileges',()=>{
 assert.match(gate,/ENABLE ROW LEVEL SECURITY/);
 assert.match(gate,/REVOKE ALL ON maximus_agents\.scpi_candidate_batch_decisions/);
 assert.match(gate,/FROM PUBLIC,anon,authenticated/);
 assert.match(gate,/WITH \(security_invoker = true\)/);
 assert.match(gate,/REVOKE ALL ON maximus_agents\.scpi_candidate_proportional_release_v2/);
});
