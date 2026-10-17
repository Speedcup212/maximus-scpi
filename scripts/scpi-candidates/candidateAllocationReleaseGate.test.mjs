import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync(new URL('../../supabase/migrations/20261017_candidate_allocation_certification_release_gate.sql',import.meta.url),'utf8');
test('canonical current-period country and sector ledgers are the sole allocation provenance',()=>{
 assert.match(migration,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_allocation_certification_v1/);
 assert.match(migration,/public\.scpi_indicators/);
 assert.match(migration,/f\.source_period/);
 assert.match(migration,/public\.scpi_bulletins b/);
 assert.match(migration,/scpi_candidate_pdf_validation v/);
 assert.match(migration,/v\.document_identity_verified IS TRUE/);
 assert.match(migration,/v\.pdf_sha256=b\.pdf_sha256/);
 assert.match(migration,/a\.source_sha256=b\.pdf_sha256/);
 assert.match(migration,/a\.source_page BETWEEN 1 AND v\.page_count/);
 assert.match(migration,/a\.qa_status='qa_pass'/);
 assert.match(migration,/jsonb_typeof\(f\.expected_data->a\.label\)='number'/);
 assert.match(migration,/\(f\.expected_data->>a\.label\)::numeric=a\.pct/);
});
test('country AND sector have exact complete key sets and each sums to 100 percent',()=>{
 for(const atom of ['f.allocation_type','a.allocation_type','c.expected_count>0','c.actual_count=c.expected_count',
  'c.distinct_count=c.expected_count','c.verified_count=c.expected_count','c.pct_total=100',
  'geography_verified AND sector_verified'])assert.ok(migration.includes(atom),atom);
 assert.match(migration,/NOT coalesce\(al\.allocations_verified,false\)/);
});
test('real release gate, existing queue, and non-public status cannot be bypassed',()=>{
 assert.match(migration,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_final_release_v1/);
 assert.match(migration,/a\.audit_status='approved'/);
 assert.match(migration,/a\.evidence_digest_sha256/);
 assert.match(migration,/v\.release_ready AND coalesce\(qa\.approved,false\)/);
 assert.match(migration,/AND coalesce\(al\.allocations_verified,false\)/);
 assert.match(migration,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_work_queue/);
 assert.match(migration,/VERIFY_EXACT_PERIOD_ALLOCATIONS/);
 assert.ok(migration.indexOf('VERIFY_EXACT_PERIOD_ALLOCATIONS')<migration.indexOf('INDEPENDENT_FINANCIAL_AND_FINAL_QA'));
 assert.match(migration,/REVOKE ALL ON maximus_agents\.scpi_candidate_allocation_certification_v1/);
 assert.doesNotMatch(migration,/UPDATE\s+(?:maximus_agents\.)?scpi_universe/i);
 assert.doesNotMatch(migration,/SET\s+(?:publication_authorized|analysis_certified|qa_status)\s*=/i);
});
