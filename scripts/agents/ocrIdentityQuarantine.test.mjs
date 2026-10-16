import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const fromRoot=(path)=>fs.readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const py=fromRoot('scripts/agents/scpi_ocr_worker.py');
const edge=fromRoot('supabase/functions/maximus-scpi-ocr-oidc/index.ts');
const migration=fromRoot('supabase/migrations/20261016_ocr_permanent_identity_quarantine.sql');

test('Unverified identity triggers permanent private quarantine with zero financial publication',()=>{
 assert.match(py,/def identity_failure_is_permanent\(/);
 assert.match(py,/failure_code": "document_identity_mismatch"/);
 assert.match(py,/response\.get\("status"\) == "quarantined_identity_mismatch"/);
 assert.match(py,/manual identity review required/);
 assert.match(edge,/body\.failure_code==="document_identity_mismatch"/);
 assert.match(edge,/ValueError: document identity mismatch/);
 assert.match(edge,/await sql\.begin\(async\(tx\)=>\{/);
 assert.match(edge,/status='quarantined_identity_mismatch'/);
 assert.match(edge,/status='rejected'/);
 assert.doesNotMatch(edge,/SET\s+publication_authorized\s*=\s*true/i);
 assert.doesNotMatch(edge,/SET\s+qa_status\s*=\s*'qa_pass'/i);
});
test('Transient OCR errors are still retriable and never mislabeled',()=>{
 assert.match(edge,/next_try_at=now\(\)\+interval '2 hours'/);
 assert.match(edge,/return Response\.json\(\{ok:true,status:"failed"\}\)/);
 assert.match(py,/raise\s*\n/);
});
test('Historical invalid Pierval record quarantined with actual attempt preserved',()=>{
 assert.match(migration,/pierval-sante/);
 assert.match(migration,/2022-T4/);
 assert.match(migration,/attempts=1/);
 assert.match(migration,/status='rejected'/);
 assert.match(migration,/ADD CONSTRAINT scpi_ocr_jobs_status_check/);
 assert.doesNotMatch(migration,/SET\s+attempts=3/i);
});
