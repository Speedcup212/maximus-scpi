import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertPrimaryTieredFeeSource,assertTieredFeesMatchIndependentLedger} from './officialTieredFeeEvidence.mjs';
const candidates=JSON.parse(fs.readFileSync(new URL('../../data-import/corum_candidates_prepublication_20261015.json',import.meta.url),'utf8')).scpi;
const copy=v=>structuredClone(v);
const fee={
 kind:'geographic_tiers',basis:'HT',revenue_basis:'loyers encaissés',
 euro_zone_percent:12.4,outside_euro_zone_percent:15.9,blended_rate:null,
 source_period:'2026-T2'
};
const make=slug=>{
 const candidate=copy(candidates.find(c=>c.scpi_slug===slug));
 candidate.publishing_fields.management_fees=copy(fee);
 const primary=slug==='corum-usa'?
   candidate.regulatory_documents.find(d=>d.kind==='statutes'):
   candidate.pdfs.find(d=>d.kind==='quarterly_bulletin'&&d.period==='2026-T2');
 const page=slug==='corum-usa'?9:11;
 candidate.publishing_sources.management_fees={url:primary.url,sha256:primary.sha256,page};
 const certified=[
  ['management_fee_euro_zone_ht',12.4],
  ['management_fee_non_euro_zone_ht',15.9]
 ].map(([metric,value_numeric])=>({
 scpi_slug:slug,source_period:'2026-T2',metric,value_numeric,
 source_url:primary.url,source_page:page,verification_status:'manual_verified_official'
 }));
 return {candidate,certified};
};
test('CORUM XL validated bulletin p11 and CORUM USA statute p9 are both valid official fee sources',()=>{
 for(const slug of ['corum-xl','corum-usa']){
  const {candidate,certified}=make(slug);
  const result=assertPrimaryTieredFeeSource(candidate);
  assert.equal(result.flat,null);
  assert.equal(result.detail.source_page,slug==='corum-usa'?9:11);
  assert.equal(assertTieredFeesMatchIndependentLedger(candidate,certified),true);
 }
});
test('Reject invented legal page, wrong original issuer SHA, wrong fee amount and fake certified status',()=>{
 for(const slug of ['corum-xl','corum-usa']){
  const q=make(slug);q.candidate.publishing_sources.management_fees.page=3;
  assert.throws(()=>assertPrimaryTieredFeeSource(q.candidate));
  const w=make(slug);w.candidate.publishing_sources.management_fees.sha256='0'.repeat(64);
  assert.throws(()=>assertPrimaryTieredFeeSource(w.candidate));
  const x=make(slug);x.candidate.publishing_fields.management_fees.euro_zone_percent=14.2;
  assert.throws(()=>assertTieredFeesMatchIndependentLedger(x.candidate,x.certified),/differs/);
  const y=make(slug);y.certified[0].verification_status='pending';
  assert.throws(()=>assertTieredFeesMatchIndependentLedger(y.candidate,y.certified),/differs/);
 }
});
test('No blended geographic rate can be accepted',()=>{
 const x=make('corum-usa');x.candidate.publishing_fields.management_fees.blended_rate=14;
 assert.throws(()=>assertPrimaryTieredFeeSource(x.candidate));
});
