import test from 'node:test';
import assert from 'node:assert/strict';
import { cohortIntegrityErrors } from './cohortInvariant.mjs';
const baseline={count:3,slugs:['a','b','c']};
test('allows new funds without hard-coded future counts',()=>{
 assert.deepEqual(cohortIntegrityErrors({count:4,slugs:['a','b','c','d']},baseline),[]);
 assert.deepEqual(cohortIntegrityErrors({count:5,slugs:['a','b','c','d','e']},baseline),[]);
});
test('rejects silently replaced member despite unchanged count',()=>{
 assert.ok(cohortIntegrityErrors({count:3,slugs:['a','b','x']},baseline).includes('BASELINE_FUND_MISSING:c'));
});
test('rejects duplicate and count drift',()=>{
 assert.ok(cohortIntegrityErrors({count:3,slugs:['a','b','b']},baseline).includes('COHORT_COUNT_OR_DUPLICATE_INVALID'));
});
test('rejects a reduced cohort',()=>{
 assert.ok(cohortIntegrityErrors({count:2,slugs:['a','b']},baseline).includes('COHORT_SHRUNK'));
});
