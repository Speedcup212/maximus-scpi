import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCandidateSet,verifyNetlifyState} from './autonomousPreparedRelease.mjs';
const C={count:3,slugs:['existing','future-alpha','future-beta']};
const D=[{'Nom SCPI':'Existing'},{'Nom SCPI':'Future Alpha'},{'Nom SCPI':'Future Beta'}];

test('generic cohort covers multiple approved candidates without issuer-specific code',()=>{
  assert.equal(validateCandidateSet(['future-alpha','future-beta'],C,D),true);
});
test('fail closed on duplicate batch, absent catalog, untrusted slug and mismatched cohort',()=>{
  for(const ids of [[],['future-alpha','future-alpha'],['not-in-cohort'],['../future-alpha'],['future-alpha','FUTURE-BETA']]){
    assert.throws(()=>validateCandidateSet(ids,C,D),/FAIL_CLOSED/);
  }
  assert.throws(()=>validateCandidateSet(['future-alpha'],{count:2,slugs:C.slugs},D),/INVALID_PUBLIC_SOURCE_COHORT/);
  assert.throws(()=>validateCandidateSet(['future-alpha'],C,[D[0],D[1],D[1]]),/NOT_IN_EXACT_DEPLOYED_SOURCE/);
});
test('verify exactly published matching Netlify release with encoded source SHA',()=>{
 const sha='a'.repeat(40),id='b'.repeat(24),siteId='site-verified';
 const site={published_deploy:{id}}, deploy={id,site_id:siteId,state:'ready',published_at:'2026-11-03T08:00:00Z',commit_message:'build: controlled Netlify source '+sha};
 assert.equal(verifyNetlifyState(site,deploy,siteId,sha),id);
 for(const wrong of [{...deploy,site_id:'other'},{...deploy,state:'building'},{...deploy,commit_message:'fake'},{...deploy,published_at:null}]){
   assert.throws(()=>verifyNetlifyState(site,wrong,siteId,sha),/NETLIFY_LIVE_DEPLOY_SHA_NOT_PROVEN/);
 }
 assert.throws(()=>verifyNetlifyState({published_deploy:{id:'c'.repeat(24)}},deploy,siteId,sha),/NETLIFY_LIVE_DEPLOY_SHA_NOT_PROVEN/);
});
