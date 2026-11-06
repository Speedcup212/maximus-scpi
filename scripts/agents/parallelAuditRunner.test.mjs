import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 assertAuditTask,makeEvidence,buildAuditRequest,parseAuditOutput,
 runModelAudit,buildQAResult
} from './parallelAuditRunner.mjs';

const now='2026-11-06T00:00:00.000Z';
const health={checked_at:now,pass_count:46,fail_count:23,partial_count:5,
 active_missing_tof_rows:51,source_registry_error_rows:3,
 tof_policy_invalid_certifications:49};
function task(role){
 return {id:role+'-id',role,kind:'audit',lease_token:'test-lease-token',
   deploy_allowed:false,dedupe_key:'2026-11-06:parallel-audit:'+role,
   payload:{mode:'parallel_readonly_audit',focus:'Read-only evidence audit',
    snapshot_source:'public.scpi_chantier_health',health_at_dispatch:health}};
}
test('All three roles have exact audit-only scope; QA has no model permission',()=>{
 for(const role of ['DATA','SEARCH','ANALYST']){
   assert.equal(assertAuditTask(task(role),role).kind,'audit');
   const request=buildAuditRequest(task(role));
   assert.equal(request.model,'deepseek-flash');
   assert.equal(request.max_tokens,1100);
   assert.equal(request.stream,false);
   assert.equal(request.messages[1].role,'user');
   assert.equal(request.messages[1].content.includes('release_authorized'),true);
 }
 assert.throws(()=>buildAuditRequest(task('QA')),/QA_MUST_BE_INDEPENDENT/);
 for(const attack of [
  {...task('DATA'),kind:'execute'},
  {...task('DATA'),deploy_allowed:true},
  {...task('DATA'),role:'QA'},
  {...task('DATA'),lease_token:null},
  {...task('DATA'),dedupe_key:'fake'},
  {...task('DATA'),payload:{mode:'scoped_code_correction'}}
 ])assert.throws(()=>assertAuditTask(attack,'DATA'));
});
test('Official evidence is based on supplied source snapshot, never model assertion',()=>{
 const e=makeEvidence(task('DATA'),now);
 assert.equal(e.length,1);
 assert.equal(e[0].source,'public.scpi_chantier_health');
 assert.equal(e[0].finding.observed.pass_count,46);
 assert.equal(e[0].finding.observed.fail_count,23);
 assert.equal(e[0].finding.meaning.includes('no new extraction'),true);
 assert.throws(()=>makeEvidence({...task('DATA'),payload:{mode:'parallel_readonly_audit'}},now),/MISSING/);
});
test('DeepSeek model is one bounded API call, no source or release fabricated',async()=>{
 const calls=[];
 const r=await runModelAudit(task('DATA'),{apiKey:'sk-'+'x'.repeat(42),
   now,fetcher:async(url,init)=>{
    calls.push({url,init});
    return {ok:true,status:200,json:async()=>({
      choices:[{message:{content:JSON.stringify({
        observations:['49 historical TOF certifications warrant source review'],
        follow_up:'Cross-check 2026-T2 official documents.'})}}],
      usage:{prompt_tokens:450,completion_tokens:100,total_tokens:550}})};
   }});
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,'https://api.deepseek.com/chat/completions');
 const body=JSON.parse(calls[0].init.body);
 assert.equal(body.model,'deepseek-flash');
 assert.equal(body.max_tokens,1100);
 assert.equal(r.status,'done');
 assert.equal(r.result.verdict,'REVIEW');
 assert.equal(r.result.deploy_allowed,false);
 assert.equal(r.result.usage.total_tokens,550);
 assert.equal(r.result.evidence[0].finding.observed.pass_count,46);
 assert.match(r.result.summary,/independent verification/i);
 assert.equal(JSON.stringify(r.result).includes('sk-xxx'),false);
});
test('Reject empty, oversized, unreliable or malformed model outputs',()=>{
 for(const text of ['',JSON.stringify({observations:[],follow_up:'ok'}),
 JSON.stringify({observations:['ok'],follow_up:''}),
 JSON.stringify({observations:[42],follow_up:'ok'}),
 'not json'])assert.throws(()=>parseAuditOutput(text));
 const valid=parseAuditOutput('```json\n{"observations":["Needs verification"],"follow_up":"Check official PDF."}\n```');
 assert.equal(valid.observations.length,1);
 const bounded=parseAuditOutput(JSON.stringify({observations:['x'.repeat(450),'Second','Third','Fourth'],follow_up:'y'.repeat(500)}));
 assert.equal(bounded.observations.length,3);
 assert.equal(bounded.observations[0].length,280);
 assert.equal(bounded.follow_up.length,360);
 assert.equal(bounded.model_output_truncated,true);
});
test('Independent QA refuses missing roles and reviews all three recorded audit results',()=>{
 const upstream=['DATA','SEARCH','ANALYST'].map(role=>({
   id:role+'-id',role,kind:'audit',status:'done',attempts:1,
   verdict:'REVIEW',completed_at:now}));
 const qa=buildQAResult(task('QA'),upstream,now);
 assert.equal(qa.status,'done');
 assert.equal(qa.result.verdict,'REVIEW');
 assert.equal(qa.result.independent_qa,true);
 assert.equal(qa.result.deploy_allowed,false);
 assert.equal(qa.result.evidence.length,3);
 assert.throws(()=>buildQAResult(task('QA'),upstream.slice(1),now),/QA_UPSTREAM/);
 const incomplete=buildQAResult(task('QA'),upstream.map((x,i)=>i?x:{...x,status:'blocked'}),now);
 assert.equal(incomplete.status,'blocked');
 assert.equal(incomplete.result.verdict,'REVIEW');
});
test('Workflow contract: CONTROL, 3 true parallel roles, independent QA and no deployments',()=>{
 const yaml=fs.readFileSync(new URL('../../.github/workflows/maximus-agent-parallel.yml',import.meta.url),'utf8');
 assert.match(yaml,/Promise\.allSettled\(\['DATA','SEARCH','ANALYST'\]\.map\(execute\)\)/);
 assert.match(yaml,/qa:\s*needs: \[control, workers, source-proof\]/);
 assert.match(yaml,/github\.ref == 'refs\/heads\/main'/);
 assert.match(yaml,/maximus-agent-audit-oidc/);
 assert.match(yaml,/persist-credentials: false/);
 assert.match(yaml,/github\.event_name != 'pull_request'/);
 assert.match(yaml,/github\.run_attempt == 1/);
 assert.doesNotMatch(yaml,/netlify deploy|gh pr merge|deploy --prod|service_role|SUPABASE_DB_URL:/i);
 const migration=fs.readFileSync(new URL('../../supabase/migrations/20261106_recovery117_parallel_readonly_audits.sql',import.meta.url),'utf8');
 assert.match(migration,/prepare_parallel_audit_cycle/);
 assert.match(migration,/claim_parallel_audit_task/);
 assert.match(migration,/x\.kind='audit' AND x\.status='pending'/);
 assert.match(migration,/parent\.status<>'done'/);
 assert.match(migration,/REVOKE ALL ON FUNCTION/);
 const edge=fs.readFileSync(new URL('../../supabase/functions/maximus-agent-audit-oidc/index.ts',import.meta.url),'utf8');
 assert.match(edge,/payload\.workflow_ref!==workflowRef/);
 assert.match(edge,/payload\.ref!=="refs\/heads\/main"/);
 assert.match(edge,/\["REVIEW","FAIL"\]/);
 assert.match(edge,/kind='audit'/);
 assert.match(edge,/maximus_agents\.finish_task/);
 assert.doesNotMatch(edge,/maximus_agents\.record_execution\s*\(|publish_scpi\s*\(|deployNetlify\s*\(/);
});
