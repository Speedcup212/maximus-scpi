import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildPrivateReleaseInput} from './buildCurrentCorumReleaseInput.mjs';
const old=JSON.parse(fs.readFileSync('data-import/corum_candidates_prepublication_20261015.json','utf8'));
const current=JSON.parse(fs.readFileSync('data-import/corum_private_browser_fixture_20261017.json','utf8'));
test('current four CORUM release candidates derive descriptive values from canonical private registry',()=>{
 const r=buildPrivateReleaseInput(old,current);
 assert.equal(r.scpi.length,4);
 for(const c of r.scpi){
  const source=current.scpi.find(x=>x.scpi_slug===c.scpi_slug);
  assert.deepEqual(c.publishing_fields,source.publishing_fields);
  assert.equal(c.release_ready,false);
  assert.equal(c.publication_authorized,false);
  assert.equal(c.analysis_certified,false);
  assert.equal(c.release_payload_status,'AWAITING_AUTHENTICATED_BATCH_DECISION_AND_FULL_SOURCE_PARITY');
 }
});
test('rejected when private registry has moved or contradicts verified PDF',()=>{
 const x=structuredClone(current);
 x.scpi[0].publishing_fields.risk_sri=7;
 assert.throws(()=>buildPrivateReleaseInput(old,x),/Conflicting official PDF/);
 const y=structuredClone(current);
 y.scpi[0].unresolved_field_keys=['foo'];
 assert.throws(()=>buildPrivateReleaseInput(old,y),/incomplete/);
});
test('stale source never authorizes public release even if marked as ready',()=>{
 const fake=structuredClone(old);
 fake.scpi.forEach(x=>{x.release_ready=true;x.publication_authorized=true});
 const r=buildPrivateReleaseInput(fake,current);
 assert.ok(r.scpi.every(x=>x.release_ready===false&&x.publication_authorized===false));
});
