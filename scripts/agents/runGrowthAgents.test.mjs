import test from 'node:test';
import assert from 'node:assert/strict';
import {ROLES,BATCHES,rolesFor,htmlMeta,reviewFlags} from './runGrowthAgents.mjs';

test('twelve roles are distinct, assigned exactly once per week and at most three per day',()=>{
 const all=Object.values(BATCHES).flat();
 assert.equal(Object.keys(ROLES).length,12);
 assert.equal(all.length,12);
 assert.equal(new Set(all).size,12);
 for(const keys of Object.values(BATCHES)){
   assert.ok(keys.length<=3);
   for(const key of keys)assert.ok(ROLES[key]);
 }
 assert.deepEqual(rolesFor('schedule','Fri'),[]);
 assert.deepEqual(rolesFor('schedule','Mon'),BATCHES.Mon);
 assert.deepEqual(rolesFor('push','Mon'),['SEO_TECH']);
 assert.deepEqual(rolesFor('workflow_dispatch','Wed'),['SEO_TECH']);
});

test('only observed HTTP metadata is extracted',()=>{
 const h='<html><head><title>SCPI test</title><link rel="canonical" href="https://maximusscpi.com/"></head><body><h1>SCPI</h1></body></html>';
 assert.deepEqual(htmlMeta(h),{title:'SCPI test',canonical:'https://maximusscpi.com/',h1_count:1});
 assert.equal(htmlMeta('<div/>').h1_count,0);
});

test('claims requiring compliance verification are flagged',()=>{
 const flags=reviewFlags('Un rendement garanti de 6 % et 30 €');
 assert.deepEqual(flags,['percentage_requires_source','price_requires_source','prohibited_claim']);
 assert.deepEqual(reviewFlags('Capital non garanti et liquidité non garantie.'),[]);
});
