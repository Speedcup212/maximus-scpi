import test from 'node:test';
import assert from 'node:assert/strict';
import {maturityRubric,evaluateMaturity} from './industrialMaturity.mjs';
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
 const assessment=evaluateMaturity({criteria,no_existing_regression:true,critical_integrity_pass:false});
 assert.equal(assessment.score,100);assert.equal(assessment.decision,'NO_GO');assert.equal(assessment.publication_authorized,false);
});
test('mandatory TypeScript failure blocks GO even with high capability score',()=>{
 const criteria=Object.fromEntries(maturityRubric.flatMap(x=>x[2].map(([id])=>[id,{status:'PASS',proofs:['test-proof']}])));
 assert.equal(evaluateMaturity({criteria,no_existing_regression:true,critical_integrity_pass:true,typecheck_pass:false}).decision,'NO_GO');
});
