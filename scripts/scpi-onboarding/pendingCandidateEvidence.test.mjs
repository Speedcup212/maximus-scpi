import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync(new URL('./fixtures/sofidynamic-69-pending-financial-evidence.json',import.meta.url),'utf8'));
test('pending metrics have verifiable issuer SHA/page, never authorization',()=>{
 assert.equal(evidence.qa_status,'pending_independent_qa');
 assert.equal(evidence.publication_authorized,false);
 assert.equal(evidence.metrics.length,11);
 const docs=new Map(evidence.documents.map(d=>[d.period,d]));
 for(const m of evidence.metrics) {
  const doc=docs.get(m.period);
  assert.ok(doc,m.metric+' source missing');
  assert.match(doc.pdf_sha256,/^[0-9a-f]{64}$/);
  assert.ok(m.page>0 && m.page<=doc.page_count);
  assert.ok(Number.isFinite(m.value));
  assert.equal(m.qa_status,'pending_independent_qa');
  if(m.metric==='prix_reconstitution'||m.metric==='valeur_realisation'){
   assert.equal(m.period,'2025-RA');
   assert.equal(m.reference_date,'2025-12-31');
  }
 }
});
test('TOF was observed in rendered page rather than exact native text',()=>{
 const tof=evidence.metrics.find(m=>m.metric==='tof');
 assert.equal(tof.review_mode,'VISUAL_PAGE');
 assert.equal(tof.page,4);
 assert.equal(tof.value,97.73);
});
