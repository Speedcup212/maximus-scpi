import test from 'node:test';
import assert from 'node:assert/strict';
import {privatePreviewDisposition} from './privatePreviewDisposition.mjs';
const baseline=Object.freeze({count:2,slugs:['a','b']});
const catalog=[{'Nom SCPI':'A'},{'Nom SCPI':'B'}];
const candidate={'Nom SCPI':'Sofidynamic',maximus_publication_status:'certified'};
test('fresh candidate remains isolated with no static 68-cohort assumption',()=>{
 assert.equal(privatePreviewDisposition(baseline,catalog,'sofidynamic'),'PRIVATE_BROWSER_REQUIRED');
 assert.equal(privatePreviewDisposition({count:3,slugs:['a','b','c']},[...catalog,{'Nom SCPI':'C'}],'sofidynamic'),'PRIVATE_BROWSER_REQUIRED');
});
test('post-publication CI avoids duplicate preview and remains usable for SCPI 70+',()=>{
 assert.equal(privatePreviewDisposition({count:3,slugs:['a','b','sofidynamic']},[...catalog,candidate],'sofidynamic'),'ALREADY_PUBLIC_SKIPPED');
 assert.equal(privatePreviewDisposition({count:4,slugs:['a','b','c','sofidynamic']},[...catalog,{'Nom SCPI':'C'},candidate],'sofidynamic'),'ALREADY_PUBLIC_SKIPPED');
});
test('fail closed on cohort/catalog disagreement or unverified public entry',()=>{
 for(const [c,d] of [
  [{count:1,slugs:['a','b']},catalog],
  [{count:2,slugs:['a','a']},catalog],
  [{count:3,slugs:['a','b','sofidynamic']},catalog],
  [baseline,[...catalog,candidate]],
  [{count:3,slugs:['a','b','sofidynamic']},[...catalog,{...candidate,maximus_publication_status:'pending_certification'}]],
  [baseline,[...catalog,{'Nom SCPI':'Sofidynamic'},{'Nom SCPI':'Sofidynamic'}]]
 ])assert.throws(()=>privatePreviewDisposition(c,d,'sofidynamic'));
});
