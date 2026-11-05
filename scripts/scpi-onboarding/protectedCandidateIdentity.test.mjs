import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateCandidatePrIdentity,verifyCurrentCandidatePr} from './protectedCandidateIdentity.mjs';
const sha='a'.repeat(40),id=1125202916;
const pr=()=>({
 number:292,state:'open',merged:false,merged_at:null,
 head:{sha,ref:'recovery/091-scpi-certification-industrialisation',
  repo:{id,full_name:'Speedcup212/maximus-scpi'}},
 base:{ref:'main',repo:{id}}
});
test('trusted runner matches current unmerged PR SHA, never authorizes publication',()=>{
 const r=evaluateCandidatePrIdentity({pr:pr(),candidateSha:sha});
 assert.equal(r.pr_identity_verified,true);
 assert.equal(r.publication_authorized,false);
});
test('SHA switch, fork, target, closed PR and merged PR are blocked',()=>{
 const cases=[
 x=>x.head.sha='b'.repeat(40),
 x=>x.head.repo.id=123,
 x=>x.head.repo.full_name='foreign/repo',
 x=>x.head.ref='main',
 x=>x.base.ref='other',
 x=>x.base.repo.id=456,
 x=>x.state='closed',
 x=>x.merged=true,
 x=>x.merged_at='2026-11-05T18:30:00Z',
 x=>x.number=291
 ];
 for(const mutate of cases){const x=pr();mutate(x);assert.equal(evaluateCandidatePrIdentity({pr:x,candidateSha:sha}).status,'BLOCKED');}
});
test('protected runner checks exact fixed GitHub endpoint and token',async()=>{
 const seen=[];
 const result=await verifyCurrentCandidatePr({candidateSha:sha,token:'synthetic-reader-token',fetchImpl:async(url,options)=>{
  seen.push([url,options.method,options.headers.Authorization]);
  return {ok:true,json:async()=>pr()};
 }});
 assert.equal(result.pr_identity_verified,true);
 assert.deepEqual(seen,[['https://api.github.com/repos/Speedcup212/maximus-scpi/pulls/292','GET','Bearer synthetic-reader-token']]);
});
test('missing token or GitHub failure does not bypass PR identity',async()=>{
 assert.equal((await verifyCurrentCandidatePr({candidateSha:sha,token:''})).status,'BLOCKED');
 assert.equal((await verifyCurrentCandidatePr({candidateSha:sha,token:'synthetic-reader-token',fetchImpl:async()=>({ok:false})})).status,'BLOCKED');
});
