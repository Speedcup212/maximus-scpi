import test from 'node:test';
import assert from 'node:assert/strict';
import { runQa } from './qa.js';

test('Buroboutic 0.07% vacancy subcomponent cannot be QA OK even with TD and confidence=1',()=>{
  const result=runQa({tof:0.0007,td:0.055,capitalisation:400_000_000,confidence:1});
  assert.equal(result.status,'NEEDS_REVIEW');
  assert.equal(result.warnings.some(w=>w.field==='tof'),true);
});
test('legitimate but unusually low occupancy requires independent review, not silent auto-PASS',()=>{
  assert.equal(runQa({tof:0.62,td:0.051,confidence:0.99}).status,'NEEDS_REVIEW');
});
test('TOF above 100 percent must fail closed',()=>{
  assert.equal(runQa({tof:1.01,td:0.06,confidence:1}).status,'NEEDS_REVIEW');
});
test('plausible TOF alone does not imply an inaccurate metric is certified',()=>{
  assert.equal(runQa({tof:0.847,td:0.05,confidence:0.9}).status,'OK');
  assert.equal(runQa({tof:1,td:0.05,confidence:0.9}).status,'OK');
});
test('no occupancy and no distribution never passes even at high confidence',()=>{
  assert.equal(runQa({confidence:1}).status,'NEEDS_REVIEW');
});
test('low extraction confidence keeps mandatory review',()=>{
  assert.equal(runQa({tof:0.95,td:0.05,confidence:0.1}).status,'NEEDS_REVIEW');
});
