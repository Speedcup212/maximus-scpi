import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const p=new URL('../../supabase/migrations/20261102150657_candidate_allocation_rounded_sum_tolerance.sql',import.meta.url);
const migration=fs.readFileSync(p,'utf8');
const allowed=(values,decimalPlaces=1)=>Math.abs(values.reduce((a,b)=>a+b,0)-100)<=values.length*0.5*10**(-decimalPlaces)+0.000001;
test('99.9 percent from five issuer-printed one-decimal buckets passes rounding error',()=>{
 assert.equal(allowed([8.2,36.9,15.5,9.9,29.4]),true);
 assert.equal(allowed([12,1.4,37.2,26.7,22,0.7]),true);
});
test('invalid aggregate and missing allocations cannot pass',()=>{
 assert.equal(allowed([8.2,36.9,15.5,9.9,25]),false);
 assert.equal(allowed([50,48]),false);
 assert.equal(allowed([]),false);
});
test('database view keeps every other gate and caller-side RLS',()=>{
 assert.match(migration,/old_count = 2/);
 assert.match(migration,/0\.05::numeric \* a_1\.row_count/);
 assert.match(migration,/security_invoker=true/);
 assert.match(migration,/revoke all.*public, anon, authenticated/);
 assert.doesNotMatch(migration,/grant select.*to anon/i);
});
