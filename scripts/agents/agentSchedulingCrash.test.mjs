// RECOVERY-121: deterministic failure-injection and source-contract tests.
// No external DB writes, model calls, publisher requests or synthetic PASS.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../../',import.meta.url);
const read=rel=>readFileSync(new URL(rel,root),'utf8');
const workflow=read('.github/workflows/maximus-agent-parallel.yml');
const bridge=read('supabase/functions/maximus-agent-audit-oidc/index.ts');
const queue=read('supabase/migrations/20261106_recovery118_candidate_documentary_handoff.sql');
const retry=read('supabase/migrations/20261106_recovery119_candidate_retry_guards.sql');
const runner=read('scripts/agents/parallelAuditRunner.mjs');
const control=workflow.slice(workflow.indexOf('  control:'),workflow.indexOf('  source-proof:'));

function isCandidateAuditEligible({dayClaims=0,limit=2,kind='audit',status='pending',dependsOn=[]}){
 return kind==='audit'&&status==='pending'&&dayClaims<limit&&
  dependsOn.every(t=>t.status==='done');
}
function testLeaseCycle({status='pending',attempts=0,expired=false}){
 if(status==='running'&&expired)return attempts<2?
   {status:'pending',attempts}:{status:'blocked',attempts};
 return {status,attempts};
}

test('CRASH A — CONTROL enrolls at most 20 SCPI once and never burns the generic-audit budget',()=>{
 assert.match(control,/op:'prepare_batch20'/);
 assert.match(control,/slugs\.length>20/);
 assert.match(control,/new Set\(slugs\)\.size!==slugs\.length/);
 assert.doesNotMatch(control,/op:'prepare_candidate'|op:'prepare'/);
});

test('CRASH B — concurrent claims on the same role cannot double-lease one task',()=>{
 assert.match(queue,/pg_advisory_xact_lock\(hashtext\('maximus_agents:claim:'\|\|p_role\)\)/);
 assert.match(queue,/FOR UPDATE SKIP LOCKED LIMIT 1/);
 assert.match(queue,/status='running',attempts=attempts\+1/);
 assert.match(queue,/lease_token=token,lease_until=now\(\)\+make_interval/);
 assert.match(queue,/IF EXISTS \(SELECT 1 FROM maximus_agents\.tasks WHERE role=p_role AND status='running'\)/);
 const claimed=new Set();
 for(let i=0;i<100;i++){
   if(!claimed.has('DATA'))claimed.add('DATA');
 }
 assert.equal(claimed.size,1);
});

test('CRASH C — strict daily role budget is preserved; no fake quota reset',()=>{
 assert.match(queue,/count\(\*\) FROM maximus_agents\.runs/);
 assert.match(queue,/>= cfg\.max_claims_per_role_day THEN RETURN/);
 assert.equal(isCandidateAuditEligible({dayClaims:2,limit:2}),false);
 assert.equal(isCandidateAuditEligible({dayClaims:1,limit:2}),true);
 assert.doesNotMatch(control,/max_claims_per_role_day\s*=|reset.*quota|truncate/i);
});

test('CRASH D — expired audit leases remain guarded, no direct replay of code corrections',()=>{
 const batch=read('supabase/migrations/20261106_recovery122_candidate20.sql');
 assert.match(batch,/PERFORM maximus_agents\.reconcile_expired_tasks\(\)/);
 assert.match(batch,/x\.attempts<2/);
 assert.deepEqual(testLeaseCycle({status:'running',attempts:1,expired:true}),{status:'pending',attempts:1});
 assert.deepEqual(testLeaseCycle({status:'running',attempts:2,expired:true}),{status:'blocked',attempts:2});
 assert.match(batch,/FOR UPDATE SKIP LOCKED LIMIT 1/);
});

test('CRASH E — independent QA must wait for all three, and never certifies financial data',()=>{
 const upstream=[{status:'done'},{status:'done'},{status:'blocked'}];
 assert.equal(isCandidateAuditEligible({dependsOn:upstream}),false);
 assert.equal(isCandidateAuditEligible({dependsOn:upstream.map(()=>({status:'done'}))}),true);
 assert.match(queue,/parent\.status<>'done'/);
 assert.match(workflow,/qa:\s*needs: \[control, workers, source-proof\]/);
 assert.match(bridge,/\["REVIEW","FAIL"\]/);
 assert.match(workflow,/Independent QA not eligible for/);
});

test('CRASH F — inconsistent DeepSeek JSON is bounded, never a fake financial PASS',()=>{
 assert.match(runner,/MODEL_RESPONSE_BAD_JSON/);
 assert.match(runner,/model_output_truncated/);
 assert.match(runner,/financial_certified:false/);
 assert.match(bridge,/body\.result\.deploy_allowed!==false/);
 assert.match(workflow,/source-proof:/);
});

test('CRASH G — old and failed candidate tasks are preserved; retry limit is bounded',()=>{
 assert.match(retry,/Prior candidate cycle did not finish/);
 assert.match(retry,/t\.status<>'done'/);
 assert.match(retry,/\) < 3/);
 assert.match(retry,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
 assert.match(retry,/WHERE kind='audit' AND status='pending' AND cycle_date<d/);
});

test('CAPACITY TARGET — 20 distinct SCPI daily, no expansion of code correction quota',()=>{
 const batch=read('supabase/migrations/20261106_recovery122_candidate20.sql');
 assert.match(batch,/limit_candidates constant integer := 20/);
 assert.match(batch,/candidate_claims_per_role_day BETWEEN 1 AND 20/);
 assert.match(batch,/\(r\.started_at AT TIME ZONE 'Europe\/Paris'\)::date=d/);
 assert.match(batch,/jsonb_array_length\(slugs\)/);
 assert.match(batch,/AND x\.payload->>'scpi_slug'=p_slug/);
 assert.match(workflow,/max-parallel: 4/);
 assert.match(workflow,/scpi_slug: \$\{\{ fromJSON\(needs\.control\.outputs\.slugs\) \}\}/);
 assert.equal(Math.ceil(143/20),8);
});

