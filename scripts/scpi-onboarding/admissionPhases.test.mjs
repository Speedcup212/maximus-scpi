import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {evaluatePrepublication,verifyPostdeployAttestation,PILOTS,SURFACES,REQUIRED} from './admissionPhases.mjs';
const SHA='a'.repeat(40), P='b'.repeat(64), now=Date.parse('2026-11-05T19:10:00Z');
const {privateKey,publicKey}=generateKeyPairSync('ed25519');
const pem=publicKey.export({type:'spki',format:'pem'});
function payload(){return {
 schema:'scpi-industrial-postdeploy/v1',site:'maximusscpi.com',environment:'production',
 commit_sha:SHA,issued_at:new Date(now-60000).toISOString(),expires_at:new Date(now+60000).toISOString(),
 deployment:{id:'deploy-123',state:'ready',commit_sha:SHA},
 supabase_readback:{observed_at:new Date(now-60000).toISOString(),commit_sha:SHA,protected_access:true,release_authorized:true,three_pilots_eligible:true},
 responsible_batch_decision:'APPROVED',pilots:PILOTS.map(slug=>({
 slug,...Object.fromEntries(REQUIRED.map(g=>[g,true])),reviewed_by:'analyste-habilite',
 independent_auditor:'auditeur-distinct',browser_checks:['desktop','mobile'].flatMap(device=>SURFACES.map(surface=>({device,surface,status:'PASS',commit_sha:SHA,proof_sha256:P})))
 }))};}
function issue(body=payload()){const raw=Buffer.from(JSON.stringify(body));return {payload:raw.toString('base64url'),signature:sign(null,raw,privateKey).toString('base64url')};}
function verify(a=issue(),key=pem,sha=SHA,t=now){return verifyPostdeployAttestation({attestation:a,trustedPublicKeyPem:key,expectedSha:sha,now:t});}
test('PR snapshot is explicitly non-authoritative and blocked',()=>{
 const state=evaluatePrepublication({pilot_rows:PILOTS.map(scpi_slug=>({scpi_slug,regulatory_binary_count:3,source_financial_gate:true})),publication_authorized:false});
 assert.equal(state.status,'BLOCKED');assert.equal(state.publication_authorized,false);assert.equal(state.postdeploy_100_proven,false);
});
test('fully self-claimed PR evidence still never publishes or proves 100',()=>{
 const state=evaluatePrepublication({pilot_rows:PILOTS.map(scpi_slug=>({scpi_slug,regulatory_binary_count:3,source_financial_gate:true,analysis_gate:true,independent_review_gate:true,independent_audit_gate:true,six_surface_browser_gate:true,responsible_batch_gate:true,final_release_gate:true})),publication_authorized:false});
 assert.equal(state.status,'CANDIDATE_FOR_PROTECTED_REVIEW');assert.equal(state.authoritative,false);assert.equal(state.postdeploy_100_proven,false);
});
test('signature of synthetic attestation verifies for protocol testing only; never grants publication',()=>{
 const r=verify();assert.equal(r.status,'PROTECTED_ATTESTATION_VERIFIED');assert.equal(r.postdeploy_100_proven,true);assert.equal(r.publication_authorized,false);
});
test('unsigned PR JSON, attacker-supplied public key and modified signature are rejected',()=>{
 assert.equal(verify({...payload()}).status,'NO_GO');
 const key2=generateKeyPairSync('ed25519').publicKey.export({type:'spki',format:'pem'});
 assert.equal(verify(issue(),key2).status,'NO_GO');
 const a=issue();a.signature=a.signature.slice(0,-3)+'aaa';assert.equal(verify(a).status,'NO_GO');
 assert.equal(verify(issue(),null).status,'NO_GO');
});
test('SHA mismatch between PR, Netlify and protected DB all fail',()=>{
 assert.equal(verify(issue(),pem,'c'.repeat(40)).status,'NO_GO');
 for(const path of ['deployment','supabase_readback']) {const p=payload();p[path].commit_sha='c'.repeat(40);assert.equal(verify(issue(p)).status,'NO_GO');}
});
test('expired, future or overlong attestations fail',()=>{
 assert.equal(verify(issue(),pem,SHA,now+120000).status,'NO_GO');
 assert.equal(verify(issue(),pem,SHA,now-120000).status,'NO_GO');
 const p=payload();p.expires_at=new Date(now+1200000).toISOString();assert.equal(verify(issue(p)).status,'NO_GO');
});
test('all financial, legal, independent and release gates fail closed when individually removed',()=>{
 for(const gate of REQUIRED){const p=payload();p.pilots[0][gate]=false;assert.equal(verify(issue(p)).status,'NO_GO',gate);}
 for(const gate of ['protected_access','release_authorized','three_pilots_eligible']){const p=payload();p.supabase_readback[gate]=false;assert.equal(verify(issue(p)).status,'NO_GO',gate);}
});
test('all 12 browser proof cases bind to SHA and exact surface',()=>{
 for(let i=0;i<12;i++){const p=payload();p.pilots[0].browser_checks[i].commit_sha='c'.repeat(40);assert.equal(verify(issue(p)).status,'NO_GO',String(i));}
 const p=payload();p.pilots[0].browser_checks[0].proof_sha256='nothash';assert.equal(verify(issue(p)).status,'NO_GO');
});
test('pilot replacement, duplicate pilot, missing independent auditor fail',()=>{
 const p=payload();p.pilots[1].slug='other';assert.equal(verify(issue(p)).status,'NO_GO');
 const q=payload();q.pilots[1].slug=q.pilots[0].slug;assert.equal(verify(issue(q)).status,'NO_GO');
 const r=payload();r.pilots[0].independent_auditor=r.pilots[0].reviewed_by;assert.equal(verify(issue(r)).status,'NO_GO');
});
