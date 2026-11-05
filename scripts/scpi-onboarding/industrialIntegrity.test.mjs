import test from 'node:test';
import assert from 'node:assert/strict';
import {financialSemanticsErrors,validateCohort} from './preflight.mjs';
import {verifyFeeBasis,reconcilePartsFlow} from './sourceFinancialSemantics.mjs';
import {verifyNetlifyState} from '../scpi-candidates/autonomousPreparedRelease.mjs';
import {safeRepairCandidate} from './autoRemediate.mjs';
import fs from 'node:fs';

test('WALT/WALB reversal, swapped provenance and EUR/M EUR mismatches fail permanently',()=>{
 const row={walt:8,walb:4,capitalisation:200,metric_provenance:{walt:{metric:'walt',unit:'YEARS'},walb:{metric:'walb',unit:'YEARS'},capitalisation:{unit:'MILLION_EUR'}}};
 assert.deepEqual(financialSemanticsErrors(row),[]);
 assert.ok(financialSemanticsErrors({...row,walt:4,walb:8}).includes('WALT_WALB_ORDER_INCONSISTENT'));
 assert.ok(financialSemanticsErrors({...row,metric_provenance:{walt:{metric:'walb',unit:'YEARS'}}}).includes('walt:METRIC_IDENTITY_MISMATCH'));
 assert.ok(financialSemanticsErrors({...row,metric_provenance:{capitalisation:{unit:'EUR'}}}).includes('capitalisation:UNIT_SEMANTICS_MISMATCH'));
 assert.deepEqual(financialSemanticsErrors({walt:null,walb:null}),[]);
});
test('HT/TTC confusion is rejected while absent contract terms are never synthesized',()=>{
 const fee={category:'subscription',ht_percent:2,ttc_percent:2.4,basis:'subscription_price_gross',effective_period:'2026-REG',source_period:'2026-REG',source_url:'https://issuer.test/doc.pdf',pdf_sha256:'a'.repeat(64),source_page:2};
 assert.equal(verifyFeeBasis([fee]).status,'TECHNICAL_PROVENANCE_ONLY');
 assert.equal(verifyFeeBasis([{...fee,ttc_percent:2}]).status,'SOURCE_FEE_EVIDENCE_INVALID');
 assert.equal(verifyFeeBasis([]).independently_certified,false);
});
test('100 future identities are additive; a preserved count cannot hide an identity replacement',()=>{
 const old=Array.from({length:69},(_,i)=>'existing-'+i),next=Array.from({length:100},(_,i)=>({slug:'next-'+i}));
 assert.equal(validateCohort({slugs:old,count:69},next).expected_after,169);
 assert.ok(validateCohort({slugs:[...old,old[0]],count:70},next).errors.includes('COHORT_IDENTITY_OR_COUNT_INVALID'));
});
test('Netlify error, wrong SHA or unpublished deploy can never authorize a release',()=>{
 const sha='a'.repeat(40),site={published_deploy_id:'b'.repeat(24)};
 const deploy={id:'b'.repeat(24),site_id:'site',state:'ready',published_at:'2026-11-04T00:00:00Z',commit_ref:sha,branch:'main',context:'production'};
 assert.equal(verifyNetlifyState(site,deploy,'site',sha),deploy.id);
 for(const patch of [{state:'error'},{commit_ref:'c'.repeat(40)},{published_at:null},{context:'deploy-preview'}])
  assert.throws(()=>verifyNetlifyState(site,{...deploy,...patch},'site',sha),/NETLIFY_LIVE_DEPLOY_SHA_NOT_PROVEN/);
});
test('15-share anomaly remains unresolved after safe repair; official stocks are immutable',()=>{
 const source=JSON.parse(fs.readFileSync(new URL('./fixtures/sofidynamic-69-staging-2026-t2.json',import.meta.url)));
 const repaired=safeRepairCandidate(source);
 assert.deepEqual(repaired.snapshot.quarterly_snapshots,source.quarterly_snapshots);
 assert.equal(reconcilePartsFlow({opening_period:'2026-T1',closing_period:'2026-T2',opening:672775,subscribed:101076,withdrawn:122,closing:773714}).unexplained_difference_parts,-15);
 assert.equal(repaired.report.financial_qa_automatically_approved,false);
});
