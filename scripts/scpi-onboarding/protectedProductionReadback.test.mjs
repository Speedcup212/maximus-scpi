import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePublishedDeploy} from './protectedProductionReadback.mjs';
const sha='a'.repeat(40),id='deploy-1',siteid='e4f16f87-663d-4965-8de8-00f6840f1aa7';
const sample=()=>({expectedSha:sha,site:{id:siteid,published_deploy:{id}},
 deploy:{id,site_id:siteid,state:'ready',context:'production',branch:'main',
 published_at:'2026-11-05T17:00:00Z',commit_ref:sha,ssl_url:'https://maximusscpi.com'}});
test('matching currently published SHA is only proof of SHA, never a release certificate',()=>{
 const r=evaluatePublishedDeploy(sample());
 assert.equal(r.status,'PRODUCTION_SHA_MATCH');assert.equal(r.production_sha_verified,true);
 assert.equal(r.publication_authorized,false);assert.equal(r.postdeploy_100_proven,false);
});
test('stale deploy despite ready state is not currently published',()=>{
 const s=sample();s.site.published_deploy.id='newer-deploy';assert.equal(evaluatePublishedDeploy(s).status,'BLOCKED');
});
test('wrong commit/branch/context/host/identity and missing published date all fail',()=>{
 const cases=[
 s=>s.deploy.commit_ref='b'.repeat(40),s=>s.deploy.branch='preview',
 s=>s.deploy.context='deploy-preview',s=>s.deploy.state='building',
 s=>s.deploy.ssl_url='https://attacker.example',s=>s.deploy.published_at=null,
 s=>s.deploy.site_id='wrong',s=>s.site.id='wrong',s=>s.site.published_deploy=null
 ];
 for(const update of cases){const s=sample();update(s);assert.equal(evaluatePublishedDeploy(s).status,'BLOCKED');}
});
