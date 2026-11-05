import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reconcilePartsFlow,verifyFeeBasis} from './sourceFinancialSemantics.mjs';
const evidence=JSON.parse(fs.readFileSync(new URL('./fixtures/sofidynamic-2026-source-semantics.json',import.meta.url),'utf8'));

test('real Sofidynamic T1 to T2 numbers preserve unexplained 15-share variance',()=>{
  const a=reconcilePartsFlow(evidence.source_reconciliation);
  assert.equal(a.status,'REQUIRES_PRIMARY_SOURCE_EXPLANATION');
  assert.equal(a.computed_closing,773729);
  assert.equal(a.unexplained_difference_parts,-15);
  assert.equal(a.publication_authorized,false);
});
test('financial reconciliation never invents adjustments',()=>{
  const good={opening_period:'2026-T1',closing_period:'2026-T2',opening:100,subscribed:20,withdrawn:2,closing:118};
  assert.equal(reconcilePartsFlow(good).status,'ARITHMETICALLY_RECONCILED');
  assert.equal(reconcilePartsFlow({...good,closing:120}).status,'REQUIRES_PRIMARY_SOURCE_EXPLANATION');
  assert.equal(reconcilePartsFlow({...good,opening:-1}).status,'INVALID_SOURCE_FACTS');
});
test('fees preserve HT/TTC, period and source-specific bases without granting financial QA',()=>{
  const result=verifyFeeBasis(evidence.fees);
  assert.equal(result.status,'TECHNICAL_PROVENANCE_ONLY');
  assert.equal(result.independently_certified,false);
  assert.equal(result.publication_authorized,false);
  const bad=structuredClone(evidence.fees);
  bad[1].basis='subscription_price_gross';
  assert.ok(verifyFeeBasis(bad).issues.some(x=>x.includes('INCORRECT_BASE')));
  bad[1].basis='rental_income_ht_plus_financial_income_adjusted';
  bad[1].ttc_percent=12;
  assert.ok(verifyFeeBasis(bad).issues.some(x=>x.includes('INCOHERENT_HT_TTC')));
});
test('share flows require consecutive increasing quarters including year boundaries',()=>{
 const base={opening:100,subscribed:20,withdrawn:2,closing:118};
 for(const [opening_period,closing_period] of [['2026-T2','2026-T1'],['2026-T1','2026-T3']])
  assert.equal(reconcilePartsFlow({...base,opening_period,closing_period}).status,'INVALID_SOURCE_FACTS');
 assert.equal(reconcilePartsFlow({...base,opening_period:'2025-T4',closing_period:'2026-T1'}).status,'ARITHMETICALLY_RECONCILED');
});
