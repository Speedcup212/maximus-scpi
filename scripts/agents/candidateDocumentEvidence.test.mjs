import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 assertAuditTask,makeEvidence,buildAuditRequest,
 validateCandidateSnapshot,candidateSnapshotSha256,
 runModelAudit,buildQAResult
} from './parallelAuditRunner.mjs';

const seen='2026-11-06T10:00:00.000Z';
const document={
 source_period:'2026-T3',document_kind:'quarterly_bulletin',
 source_url:'https://official.example.org/opus-real/t3.pdf',
 pdf_sha256:'a'.repeat(64),page_count:7,
 validated_at:seen,document_identity_verified:true,index_status:'page_verified'
};
const metric={
 source_period:'2026-T3',document_kind:'quarterly_bulletin',metric:'tof_quarterly',
 numeric_value:'91.3',unit:'PERCENT',value_basis:'reported',
 source_page:4,existing_qa_status:'qa_pass',
 source_url:document.source_url,pdf_sha256:document.pdf_sha256
};
const snapshot={
 scpi_slug:'opus-real',scpi_name:'Opus Real',management_company:'BNP Paribas REIM',
 captured_at:seen,source:'maximus_agents.scpi_candidate_document_index+pdf_validation+metric_evidence',
 documents:[document],metrics:[metric],
 coverage:{verified_pdf_count:1,provenance_linked_metric_count:1},
 no_new_pdf_read:true,no_new_financial_qa:true,release_authorized:false
};
function task(role, evidence=snapshot){
 return {id:'id-'+role,role,kind:'audit',lease_token:'lease-1',
  dedupe_key:'2026-11-06:candidate-evidence:'+role,deploy_allowed:false,
  payload:{mode:'candidate_documentary_audit',scpi_slug:'opus-real',
   focus:'Review documented source',candidate_evidence:evidence}};
}
test('Candidate pilot only accepts exact SCPI, valid PDF hash, identity and page',()=>{
 assert.equal(assertAuditTask(task('DATA'),'DATA').payload.scpi_slug,'opus-real');
 assert.equal(validateCandidateSnapshot(task('DATA')).metrics.length,1);
 assert.equal(makeEvidence(task('DATA'),seen)[0].finding.verified_pdf_count,1);
 assert.throws(()=>assertAuditTask({...task('DATA'),kind:'execute'},'DATA'));
 assert.throws(()=>assertAuditTask({...task('DATA'),dedupe_key:'bad'},'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,scpi_slug:'other'}),'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,documents:[{...document,document_identity_verified:false}]}),'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,documents:[{...document,pdf_sha256:'bad'}]}),'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,metrics:[{...metric,source_page:8}]}),'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,metrics:[{...metric,numeric_value:null}]}),'DATA'));
 assert.throws(()=>assertAuditTask(task('DATA',{...snapshot,metrics:[{...metric,source_url:'https://other.example'}]}),'DATA'));
});
test('DeepSeek sees only previously validated document evidence and cannot certify',async()=>{
 const calls=[];
 const audit=await runModelAudit(task('DATA'),{
 apiKey:'sk-'+ '9'.repeat(50), now:seen,
 fetcher:async(url,opts)=>{
  calls.push({url,body:JSON.parse(opts.body)});
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({
   observations:['Recorded TOF and source period appear coherent, but PDF binary was not independently opened.'],
   follow_up:'Re-open the official T3 PDF and verify the TOF on page 4.'
  })}}],usage:{prompt_tokens:1800,completion_tokens:160,total_tokens:1960}})};
 }});
 assert.equal(calls.length,1);
 assert.equal(calls[0].body.model,'deepseek-flash');
 assert.equal(calls[0].body.max_tokens,1100);
 assert.equal(calls[0].body.messages[1].content.includes('opus-real'),true);
 assert.equal(calls[0].body.messages[1].content.includes(document.pdf_sha256),true);
 assert.equal(audit.result.financial_certified,false);
 assert.equal(audit.result.new_pdf_files_read,0);
 assert.equal(audit.result.verdict,'REVIEW');
 assert.equal(audit.result.candidate_slug,'opus-real');
 assert.equal(audit.result.candidate_snapshot_sha256,candidateSnapshotSha256(snapshot));
 assert.equal(audit.result.usage.total_tokens,1960);
 assert.equal(JSON.stringify(audit.result).includes('sk-999'),false);
});
const liveProof={status:'verified',candidate_slug:'opus-real',
 documents:[{status:'verified',source_url:document.source_url,
   source_period:document.source_period,document_kind:document.document_kind,
   pdf_sha256:document.pdf_sha256,page_count:document.page_count,
   reader_engines:['MuPDF','Poppler'],
   binary_hash_matches_registered:true,identity_verified:true,
   period_verified:true,financial_certified:false}],
 financial_certified:false,deploy_allowed:false};

test('QA independently checks all three model responses reference the same source snapshot',()=>{
 const digest=candidateSnapshotSha256(snapshot);
 const upstream=['DATA','SEARCH','ANALYST'].map(role=>({
  id:role+'-id',role,status:'done',verdict:'REVIEW',completed_at:seen,
  result:{candidate_slug:'opus-real',candidate_snapshot_sha256:digest,deploy_allowed:false}
 }));
 const qa=buildQAResult(task('QA'),upstream,seen,liveProof);
 assert.equal(qa.status,'done');
 assert.equal(qa.result.verdict,'REVIEW');
 assert.equal(qa.result.financial_certified,false);
 assert.equal(qa.result.verified_documents,1);
 assert.equal(qa.result.linked_metrics,1);
 assert.equal(qa.result.candidate_snapshot_sha256,digest);
 assert.equal(qa.result.evidence.length,4);
 assert.equal(qa.result.binary_proof_status,'live_binary_proof');
 assert.equal(qa.result.live_verified_pdf_count,1);
 const bad=buildQAResult(task('QA'),upstream.map((x,i)=>
 i===1?{...x,result:{...x.result,candidate_snapshot_sha256:'0'.repeat(64)}}:x),seen,liveProof);
 assert.equal(bad.status,'blocked');
 assert.throws(()=>buildQAResult(task('QA'),upstream.slice(0,2),seen),/QA_UPSTREAM/);
 assert.throws(()=>buildQAResult(task('QA'),upstream,seen,null),/INVALID_CANDIDATE_BINARY_PROOF_ENVELOPE/);
});
test('SQL and OIDC contract: same queue, no finance writes or approval',()=>{
 const sql=readFileSync(new URL('../../supabase/migrations/20261106_recovery118_candidate_documentary_handoff.sql',import.meta.url),'utf8');
 assert.match(sql,/maximus_agents\.candidate_documentary_snapshot/);
 assert.match(sql,/scpi_candidate_pdf_validation/);
 assert.match(sql,/e\.source_page BETWEEN 1 AND p\.page_count/);
 assert.match(sql,/p\.document_identity_verified=true/);
 assert.match(sql,/WHERE u\.lifecycle='candidate'/);
 assert.match(sql,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
 assert.match(sql,/candidate_documentary_audit/);
 assert.match(sql,/maximus_agents\.runs/);
 assert.match(sql,/cfg\.max_claims_per_role_day/);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_candidate_(?!work_queue)/i);
 const edge=readFileSync(new URL('../../supabase/functions/maximus-agent-audit-oidc/index.ts',import.meta.url),'utf8');
 assert.match(edge,/prepare_candidate/);
 assert.match(edge,/candidate_status/);
 const retry=readFileSync(new URL('../../supabase/migrations/20261106_recovery119_candidate_retry_guards.sql',import.meta.url),'utf8');
 assert.match(retry,/Prior candidate cycle did not finish/);
 assert.match(retry,/t\.role='QA' AND t\.kind='audit' AND t\.status='done'/);
 assert.match(retry,/t\.status<>'done'/);
 const workflow=readFileSync(new URL('../../.github/workflows/maximus-agent-parallel.yml',import.meta.url),'utf8');
 assert.match(workflow,/core\.setFailed\('Candidate documentary cycle incomplete/);
 assert.match(edge,/candidate_documentary_audit/);
 assert.match(edge,/payload\.workflow_ref!==workflowRef/);
 assert.match(edge,/\["REVIEW","FAIL"\]/);
 const wf=readFileSync(new URL('../../.github/workflows/maximus-agent-parallel.yml',import.meta.url),'utf8');
 assert.match(wf,/op:'prepare_candidate'/);
 assert.match(wf,/matrix:\s*role: \[DATA, SEARCH, ANALYST\]/);
 assert.match(wf,/qa:\s*needs: \[control, workers, source-proof\]/);
 assert.doesNotMatch(wf,/deploy --prod|netlify deploy|gh pr merge/);
});
