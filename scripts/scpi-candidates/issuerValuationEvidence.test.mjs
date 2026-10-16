import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hasOfficial2026Valuation,assertOfficial2026Valuation} from './issuerValuationEvidence.mjs';
import {auditSnapshot} from './auditCorumE2e.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../data-import/corum_candidates_prepublication_20261015.json',import.meta.url),'utf8'));
const official={
 'corum-origin':1186.30,
 'corum-eurion':224.07,
 'corum-usa':216.34,
 'corum-xl':194.27
};
const deepCopy=x=>JSON.parse(JSON.stringify(x));
test('All four latest dated 2026 primary-issuer valuations match press release and preserve annual 2025 trail',()=>{
 assert.equal(snapshot.scpi.length,4);
 for(const c of snapshot.scpi){
  assert.equal(assertOfficial2026Valuation(c),official[c.scpi_slug]);
  assert.ok(hasOfficial2026Valuation(c));
  assert.match(c.publishing_sources.reconstitution_value.historical_2025.sha256,/^[a-f0-9]{64}$/);
  assert.equal(c.publishing_sources.reconstitution_value.source_date,'2026-09-10');
  assert.equal(c.publishing_sources.reconstitution_value.as_of,'2026-06-30');
  assert.equal(c.publishing_sources.reconstitution_value.page,undefined,'HTML press release cannot invent a PDF page');
 }
});
test('Any 2025 reconstitution or unsupported source fails current-year publication',()=>{
 for(const c of snapshot.scpi){
  for(const change of [
   z=>z.publishing_fields.reconstitution_value=z.publishing_sources.reconstitution_value.historical_2025.verified_value,
   z=>z.publishing_sources.reconstitution_value.url='https://unauthorized.example/test',
   z=>z.publishing_sources.reconstitution_value.as_of='2025-12-31',
   z=>z.publishing_sources.reconstitution_value.historical_2025.sha256='manual-no-sha'
  ]){
   const tampered=deepCopy(c);change(tampered);
   assert.equal(hasOfficial2026Valuation(tampered),false,c.scpi_slug);
   assert.throws(()=>assertOfficial2026Valuation(tampered));
  }
 }
});
test('Current issuer evidence is accepted but incomplete financial and client tests remain blocking',()=>{
 const rows=auditSnapshot(snapshot);
 assert.equal(rows.length,4);
 for(const r of rows){
  assert.ok(!r.blockers.includes('preuve_affichage_absente:reconstitution_value'),r.slug);
  assert.equal(r.ready,false,'never claim full QA from a single corrected valuation');
  assert.ok(r.blockers.includes('validation_finale_non_obtenue'),r.slug);
 }
});
