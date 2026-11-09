import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveAlias,publicQuality,measureThroughput} from './admission.mjs';
const proof={value:0,period:'2026-T3',source_url:'https://issuer.example/b.pdf',sha256:'a'.repeat(64),page:3,text:'0 %'};
const input={identityVerified:true,securityPassed:true,requiredMetrics:['fee'],metrics:{fee:{status:'verified',value:0,period:proof.period,source_url:proof.source_url,proof,semantic_review_verified:true,product_identity_verified:true}}};
test('verified requires complete exact field evidence',()=>assert.equal(publicQuality(input),'verified'));
for(const key of ['value','period','source_url']) test(`mismatched ${key} remains partial`,()=>assert.equal(publicQuality({...input,metrics:{fee:{...input.metrics.fee,[key]:'mismatch'}}}),'partial'));
for(const status of ['rejected_wrong_product','invalid_tof_bulletin_source_policy','source_verified_no_field_evidence','auto_verified'])test(`does not resurrect ${status}`,()=>assert.equal(publicQuality({...input,metrics:{fee:{...input.metrics.fee,status}}}),'partial'));
test('unverified identity blocks',()=>assert.equal(publicQuality({...input,identityVerified:false}),'blocked'));
test('justified reservations remain partial',()=>assert.equal(publicQuality({...input,reservations:['annual valuation older than bulletin']}),'partial'));
test('empty metric requirements cannot certify anything',()=>assert.equal(publicQuality({...input,requiredMetrics:[]}),'partial'));
test('alias accents resolved, collisions blocked and historical validity respected',()=>{
 const a=[{alias:'Cœur Europe',scpi_slug:'one',active:true,valid_to:'2025-12-31'}];
 assert.equal(resolveAlias('Coeur Europe',a,'2025-01-01').slug,'one');
 assert.equal(resolveAlias('Cœur Europe',a,'2026-01-01').status,'unknown');
 assert.equal(resolveAlias('Cœur Europe',[...a,{...a[0],scpi_slug:'two'}],'2025-01-01').status,'ambiguous');
});
test('no measured duration means no claimed daily capacity',()=>assert.equal(measureThroughput([],0),null));
test('staging and mismatched production commits never count as delivered funds',()=>assert.equal(measureThroughput([{slug:'one',productionVerified:false}],1),0));
