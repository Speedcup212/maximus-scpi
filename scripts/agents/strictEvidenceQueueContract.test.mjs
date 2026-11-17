import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const migration=readFileSync('supabase/migrations/20261116_recovery219_existing_strict_evidence_queue.sql','utf8');
const edge=readFileSync('supabase/functions/maximus-agent-audit-oidc/index.ts','utf8');
const workflow=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');

test('REC219 strict queue covers exactly the 69 pre-existing funds only',()=>{
 assert.match(migration,/n_total<>69/);
 assert.match(migration,/lifecycle='existing'/);
 assert.match(migration,/FROM maximus_agents\.scpi_strict_actual_admission_v1/);
 assert.match(migration,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
 assert.match(migration,/p_max NOT BETWEEN 1 AND 29/);
});
test('REC219 isolates existing queue and prevents credential-free claims',()=>{
 assert.match(migration,/SECURITY INVOKER/g);
 assert.match(migration,/pg_advisory_xact_lock/);
 assert.match(migration,/cfg\.max_claims_per_role_day/);
 assert.match(migration,/FOR UPDATE OF x SKIP LOCKED/);
 assert.match(migration,/coalesce\(x\.payload->>'mode',''\) not in \('historical_tof_source_qa','existing_strict_evidence'\)/);
 assert.match(edge,/jwtVerify\(auth\.slice\(7\)/);
 for(const op of ['existing_prepare','existing_claim','existing_complete'])assert.ok(edge.includes('body.op==="'+op+'"'));
});
test('REC219 never produces PASS or approves financial provenance',()=>{
 assert.match(migration,/'verdict','REVIEW'/);
 assert.match(migration,/'financial_certified',false/);
 assert.match(migration,/'no_financial_decision',true/);
 assert.doesNotMatch(migration,/UPDATE\s+(?:public\.scpi_metric_certifications|public\.scpi_indicators|public\.scpi_source_registry)\b/i);
 assert.doesNotMatch(migration,/INSERT\s+INTO\s+public\.scpi_metric_certifications\b/i);
 assert.match(workflow,/existing-strict-evidence:/);
 assert.match(workflow,/existing_prepare/);
 assert.match(workflow,/existing_claim/);
 // RECOVERY-222 supersedes the metadata-only completion with issuer PDF proof.
 assert.match(workflow,/existing_proof_complete/);
 assert.match(edge,/body.op==="existing_complete"/);
 assert.match(workflow,/role: \[DATA, SEARCH, ANALYST, QA\]/);
});
