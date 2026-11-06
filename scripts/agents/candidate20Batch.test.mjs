import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 assertAuditTask,validateCandidateSnapshot,candidateSnapshotSha256,buildQAResult
} from './parallelAuditRunner.mjs';
import {verifyCandidateBinaryEvidence} from './candidateBinaryEvidence.mjs';

const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const sql=read('supabase/migrations/20261106_recovery122_candidate20.sql');
const workflow=read('.github/workflows/maximus-agent-parallel.yml');
const edge=read('supabase/functions/maximus-agent-audit-oidc/index.ts');
const now='2026-11-06T12:00:00Z';
const snapshot=slug=>({
 scpi_slug:slug,scpi_name:slug,source:'maximus_agents.scpi_candidate_pdf_validation',
 documents:[],metrics:[],captured_at:now,
 no_new_pdf_read:true,no_new_financial_qa:true,release_authorized:false
});
const scopedTask=(slug,role)=>({
 id:slug+'-'+role,role,kind:'audit',deploy_allowed:false,
 lease_token:'opaque-lease',dedupe_key:'2026-11-06:candidate20:'+slug+':'+role,
 payload:{mode:'candidate_documentary_audit',batch_mode:'candidate20',
    scpi_slug:slug,candidate_evidence:snapshot(slug)}
});
test('20 SCPI selection is idempotent; 20 x 4 role tasks and no second cohort',()=>{
 assert.match(sql,/limit_candidates constant integer := 20/);
 assert.match(sql,/IF NOT EXISTS \(/);
 assert.match(sql,/batch_mode'='candidate20'/);
 assert.match(sql,/ON CONFLICT\(dedupe_key\) DO NOTHING/g);
 assert.match(sql,/cardinality\(deps\)<>3/);
 assert.match(sql,/jsonb_array_length\(slugs\)/);
 assert.match(sql,/max_candidates_per_day',20/);
 assert.match(workflow,/slugs\.length>20/);
 assert.match(workflow,/new Set\(slugs\)\.size!==slugs\.length/);
});
test('20 per-role candidate claims are separate from 2/day correction quota',()=>{
 assert.match(sql,/candidate_claims_per_role_day integer NOT NULL DEFAULT 20/);
 assert.match(sql,/candidate_claims_per_role_day BETWEEN 1 AND 20/);
 assert.match(sql,/claimed_today >= least\(cfg\.candidate_claims_per_role_day,20\)/);
 assert.match(sql,/x\.payload->>'batch_mode'='candidate20'/);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.settings\s+SET max_claims_per_role_day/i);
 assert.match(sql,/FOR UPDATE SKIP LOCKED LIMIT 1/);
 assert.match(sql,/pg_advisory_xact_lock/);
});
test('20 independent candidate identities and QA dependencies cannot cross-contaminate',()=>{
 for(let i=0;i<20;i++){
  const slug='candidate-'+String(i+1).padStart(2,'0');
  const role=['DATA','SEARCH','ANALYST','QA'][i%4];
  const t=scopedTask(slug,role);
  assert.equal(assertAuditTask(t,role).payload.scpi_slug,slug);
  assert.equal(validateCandidateSnapshot(t).scpi_slug,slug);
  assert.notEqual(candidateSnapshotSha256(snapshot(slug)),candidateSnapshotSha256(snapshot('other-'+slug)));
  assert.throws(()=>assertAuditTask({...t,dedupe_key:t.dedupe_key.replace(slug,'other')},role),/UNEXPECTED_TASK_DEDUPE/);
  assert.throws(()=>assertAuditTask({...t,payload:{...t.payload,
     candidate_evidence:snapshot('other')}},role),/INVALID_CANDIDATE_DOCUMENT_SNAPSHOT/);
 }
 assert.match(sql,/parent\.id IS NULL OR parent\.status<>'done'/);
 assert.match(sql,/d::text\|\|':candidate20:'\|\|candidate\.scpi_slug\|\|':QA'/);
});
test('No PDF means a separate, explicit source gap; never a certified finance value',()=>{
 const slug='candidate-02';
 const t=scopedTask(slug,'QA');
 const p={status:'no_verified_documents',candidate_slug:slug,documents:[],
 financial_certified:false,deploy_allowed:false};
 assert.equal(verifyCandidateBinaryEvidence(t,p).kind,'source_gap');
 const digest=candidateSnapshotSha256(snapshot(slug));
 const upstream=['DATA','SEARCH','ANALYST'].map(role=>({
  role,id:role+'-'+slug,status:'done',verdict:'REVIEW',completed_at:now,
  result:{candidate_slug:slug,candidate_snapshot_sha256:digest,deploy_allowed:false}
 }));
 const qa=buildQAResult(t,upstream,now,p);
 assert.equal(qa.status,'done');
 assert.equal(qa.result.financial_certified,false);
 assert.equal(qa.result.binary_proof_status,'source_gap');
 assert.equal(qa.result.live_verified_pdf_count,0);
 assert.throws(()=>buildQAResult(t,upstream,now,{
    ...p,candidate_slug:'another-scpi'}),/INVALID_CANDIDATE_BINARY_PROOF_ENVELOPE/);
});
test('GitHub has 20 independent PDF jobs, three role calls and one independent QA per slug',()=>{
 assert.match(workflow,/max-parallel: 4/g);
 assert.match(workflow,/scpi_slug: \$\{\{ fromJSON\(needs\.control\.outputs\.slugs\) \}\}/);
 assert.match(workflow,/Promise\.allSettled\(\['DATA','SEARCH','ANALYST'\]\.map\(execute\)\)/);
 assert.match(workflow,/qa:\s*needs: \[control, workers, source-proof\]/);
 assert.match(workflow,/if: always\(\) && needs\.control\.result == 'success'/);
 assert.match(workflow,/candidate20-proof-\$\{\{ matrix\.scpi_slug \}\}-\$\{\{ github\.run_id \}\}/);
 assert.match(workflow,/op:'batch_claim'/);
 assert.match(workflow,/op:'batch_manifest'/);
 assert.match(workflow,/op:'batch_status'/);
 assert.match(workflow,/financial_certified:false/);
 assert.doesNotMatch(workflow,/netlify deploy|gh pr merge|supabase db push|deploy --prod/i);
});
test('OIDC bridge enforces role+slug and refuses cross-fund material',()=>{
 assert.match(edge,/payload\.workflow_ref!==workflowRef/);
 assert.match(edge,/payload\.ref!=="refs\/heads\/main"/);
 assert.match(edge,/t\.payload\?\.scpi_slug!==body\.scpi_slug/);
 assert.match(edge,/evidence\.scpi_slug!==body\.scpi_slug/);
 assert.match(edge,/Untrusted candidate PDF manifest/);
 assert.match(edge,/\["REVIEW","FAIL"\]/);
 assert.doesNotMatch(edge,/publish_scpi\s*\(|deployNetlify\s*\(/);
});
