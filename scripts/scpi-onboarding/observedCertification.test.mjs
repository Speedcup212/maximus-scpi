import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectObservedCertification} from './observedCertification.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const inputs={observation:read('../../docs/scpi/evidence/recovery-091-sofidynamic-readonly.json'),manifest:read('./fixtures/sofidynamic-69-second-pass.json'),cohort:read('../../src/data/certified_scpi_cohort.json'),catalog:read('../../src/data/scpi_complet.json'),issuerHosts:['www.sofidy.com']};
test('29 recorded QA rows never override real regulatory, allocation, history or deploy blockers',()=>{
 const r=inspectObservedCertification(inputs);
 assert.deepEqual(r.errors,[]);assert.equal(r.metrics.length,29);
 assert.equal(r.allocations.length,11);assert.ok(r.allocations.every(x=>x.status==='MATCHES_RECORDED_EVIDENCE'));
 assert.equal(r.status,'BLOCKED');assert.equal(r.complete_certification,false);
 for(const code of ['LATEST_STATUTES_NOT_VERIFIED','ACTIVE_RELEASE_DIFFERS_FROM_CURRENT_DEPLOY','ALLOCATION_CERTIFICATION_NOT_READY','FEWER_THAN_TWO_CERTIFIED_HISTORY_PERIODS','CURRENT_ANALYSIS_NOT_CERTIFIED'])assert.ok(r.blockers.includes(code),code);
 assert.equal(r.counts.public_indicator_rows,69);assert.equal(r.counts.universe_existing,68);
 assert.equal(r.counts.fully_certified_total,null);assert.equal(r.publication_authorized,false);
});
test('every source metric is checked, including zero and HT/TTC semantic bases',()=>{
 for(const field of ['numeric_value','unit','source_page','value_basis','source_url']) {
  const observation=structuredClone(inputs.observation);observation.metrics[0][field]='tampered';
  assert.equal(inspectObservedCertification({...inputs,observation}).status,'FAIL',field);
 }
 for(const mutate of [o=>o.metrics.pop(),o=>o.metrics.push(o.metrics[0]),o=>o.pdf_validation[0].pdf_sha256='a'.repeat(64),o=>o.allocations[0].pct=99,o=>o.allocations.pop()]) {
  const observation=structuredClone(inputs.observation);mutate(observation);
  assert.equal(inspectObservedCertification({...inputs,observation}).status,'FAIL');
 }
});
