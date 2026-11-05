import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {maturityRubric,evaluateMaturity,protectedAdmissionCriteria} from './industrialMaturity.mjs';
test('weights are the user rubric, exactly 100 points',()=>{
 assert.deepEqual(maturityRubric.map(x=>x[1]),[15,15,15,20,15,10,10]);
 assert.equal(maturityRubric.reduce((s,x)=>s+x[2].reduce((t,c)=>t+c[1],0),0),100);
});
test('missing, failed or unreferenced capability earns zero points',()=>{
 assert.equal(evaluateMaturity({criteria:{registry:{status:'PASS',proofs:[]}}}).score,0);
 assert.equal(evaluateMaturity({criteria:{registry:{status:'FAIL',proofs:['failure-log']}}}).score,0);
});
test('even 100 points can never compensate a critical integrity failure',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['synthetic-test-proof-not-production']}])));
 const assessment=evaluateMaturity({criteria,no_existing_regression:true,critical_integrity_pass:false},{trustedProtectedReadback:true});
 assert.equal(assessment.score,100);assert.equal(assessment.decision,'NO_GO');assert.equal(assessment.publication_authorized,false);
});
test('mandatory TypeScript failure blocks GO even with high capability score',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['test-proof']}])));
 assert.equal(evaluateMaturity({criteria,no_existing_regression:true,critical_integrity_pass:true,typecheck_pass:false}).decision,'NO_GO');
});

test('PR cannot self-certify five high-stakes gates by changing statuses in its JSON',()=>{
 assert.equal(protectedAdmissionCriteria.length,5);
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['claim-in-PR']}])));
 const report=evaluateMaturity({criteria,typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true});
 assert.equal(report.score,75);
 assert.equal(report.decision,'NO_GO');
 assert.equal(report.constraints.protected_live_readback,false);
 for(const key of protectedAdmissionCriteria){
  const row=report.domains.flatMap(x=>x.criteria).find(x=>x.id===key);
  assert.equal(row.awarded,0);
  assert.equal(row.status,'PROTECTED_READBACK_REQUIRED');
 }
});
test('hypothetical protected proof still cannot override the TypeScript or integrity gates',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['verified-proof']}]))); 
 const checked={criteria,typecheck_pass:false,no_existing_regression:true,critical_integrity_pass:true};
 assert.equal(evaluateMaturity(checked,{trustedProtectedReadback:true}).decision,'NO_GO');
 assert.equal(evaluateMaturity({...checked,typecheck_pass:true,critical_integrity_pass:false},{trustedProtectedReadback:true}).decision,'NO_GO');
});


test('95 point hypothetical with all critical live conditions still fails 100-point user admission',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['simulated-verified-proof']}])));
 // Noncritical architecture test missing. All mandatory live constraints nevertheless pass.
 criteria.targeted_retests={status:'FAIL',proofs:['failed-retest']};
 const input={criteria,typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true};
 const assessment=evaluateMaturity(input,{trustedProtectedReadback:true});
 assert.equal(assessment.score,95);
 assert.deepEqual(Object.values(assessment.constraints).every(Boolean),true);
 assert.equal(assessment.decision,'NO_GO');
 assert.equal(assessment.publication_authorized,false);
});
test('100 points plus trusted readback and all integrity conditions is the only score-eligible state',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['synthetic-unit-evidence']}])));
 const result=evaluateMaturity({criteria,typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true},{trustedProtectedReadback:true});
 assert.equal(result.score,100);
 assert.equal(result.decision,'GO');
 assert.equal(result.publication_authorized,false,'A rubric GO never itself permits a publication');
});


test('CRASH 32/32: a PR cannot award any of five protected criteria from forged JSON',()=>{
 const skeleton=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['nonempty-string-only']}])));
 const goodFlags={typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true};
 for(let mask=0;mask<32;mask++){
  const claims=structuredClone(skeleton);
  for(let i=0;i<protectedAdmissionCriteria.length;i++){
   const key=protectedAdmissionCriteria[i];
   claims[key]={status:(mask&(1<<i))?'PASS':'BLOCKED',proofs:['claim-not-independently-read']};
  }
  const a=evaluateMaturity({...goodFlags,criteria:claims});
  assert.equal(a.score,75,'an untrusted PR must not earn any protected points');
  assert.equal(a.decision,'NO_GO');
  assert.equal(a.constraints.protected_live_readback,false);
  assert.equal(a.publication_authorized,false);
 }
});
test('CRASH 32/32: trusted hypothetical needs every protected criterion, never just 4/5',()=>{
 const skeleton=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['synthetic-not-live']}])));
 const goodFlags={typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true};
 for(let mask=0;mask<32;mask++){
  const c=structuredClone(skeleton);
  protectedAdmissionCriteria.forEach((id,i)=>{if(!(mask&(1<<i)))c[id].status='BLOCKED';});
  const report=evaluateMaturity({...goodFlags,criteria:c},{trustedProtectedReadback:true});
  const passed=protectedAdmissionCriteria.filter((_,i)=>mask&(1<<i)).length;
  assert.equal(report.score,75+5*passed);
  assert.equal(report.decision,mask===31?'GO':'NO_GO');
  assert.equal(report.publication_authorized,false);
 }
});
test('CRASH 16/16: 100 capability points are never a substitute for a missing integrity gate',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['synthetic-not-live']}])));
 for(let mask=0;mask<16;mask++){
  const report=evaluateMaturity({
    criteria,typecheck_pass:!!(mask&1),no_existing_regression:!!(mask&2),
    critical_integrity_pass:!!(mask&4)
   },{trustedProtectedReadback:!!(mask&8)});
  assert.equal(report.decision,mask===15?'GO':'NO_GO');
  assert.equal(report.publication_authorized,false);
 }
});
test('CRASH: a privileged true flag and fake nonempty proofs can mathematically assert GO without external verification',()=>{
 const fabricated=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['FAKE_NOT_AN_ATTESTATION']}])));
 const r=evaluateMaturity({criteria:fabricated,typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true},{trustedProtectedReadback:true});
 // This is a KNOWN trust-boundary defect in this isolated function, not an authorized release.
 // A protected verifier must authenticate real signed/fresh Supabase and deployment evidence
 // BEFORE it ever passes trustedProtectedReadback. Never use this function's GO alone to publish.
 assert.equal(r.score,100);
 assert.equal(r.decision,'GO');
 assert.equal(r.publication_authorized,false);
});
test('CRASH: PR workflow is structurally unable to award any of its five protected 5-point gates',()=>{
 const workflow=fs.readFileSync(new URL('../../.github/workflows/scpi-industrial-readiness.yml',import.meta.url),'utf8');
 assert.ok(workflow.includes('pull_request:'));
 assert.ok(workflow.includes('const report=evaluateMaturity(observed);'));
 assert.ok(!workflow.includes('trustedProtectedReadback:true'));
 assert.ok(workflow.includes("report.score!==100"));
 assert.ok(workflow.includes("INDUSTRIAL_NO_GO"));
});


test('CRASH: a self-declared 75 points can be filled with nonexistent evidence strings; it is NOT audited 75 percent source completeness',()=>{
 const fakeCriteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['fake://no-document-no-run-no-real-evidence']}])));
 const report=evaluateMaturity({criteria:fakeCriteria,typecheck_pass:true,no_existing_regression:true,critical_integrity_pass:true});
 assert.equal(report.score,75);
 assert.equal(report.decision,'NO_GO');
 assert.equal(report.publication_authorized,false);
 assert.ok(report.domains.flatMap(x=>x.criteria).filter(x=>x.awarded>0).every(x=>!protectedAdmissionCriteria.includes(x.id)));
});
