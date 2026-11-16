import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decideCandidate20Dispatch} from './strictCandidateGate.mjs';
const plan=(pass,fail)=>({existing_total:69,strict_pass:pass,strict_fail:fail,deploy_allowed:false,financial_certified:false});
test('suspend candidate20 while 29 original SCPI fail',()=>{
  assert.deepEqual({...decideCandidate20Dispatch(plan(40,29))},{dispatch:false,strictPass:40,strictFail:29});
});
test('candidate20 only eligible after exact 69 PASS',()=>{
  assert.equal(decideCandidate20Dispatch(plan(69,0)).dispatch,true);
});
test('fail closed on partial, drifted, or spoofed information',()=>{
  for(const p of [null,{},plan(40,30),plan(68,0),{...plan(69,0),existing_total:68},
    {...plan(69,0),deploy_allowed:true},{...plan(69,0),financial_certified:true},
    {...plan(69,0),strict_fail:'0'},{...plan(69,0),strict_pass:70}]){
    assert.throws(()=>decideCandidate20Dispatch(p),/INVALID_STRICT_COHORT_GATE/);
  }
});
