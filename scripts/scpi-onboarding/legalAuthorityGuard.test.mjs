import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const p=new URL('./fixtures/sofidynamic-69-staging-2026-t2.json',import.meta.url);
const data=JSON.parse(fs.readFileSync(p,'utf8'));
test('issuer brand must not be mistaken for legal management entity',()=>{
 assert.equal(data.legal_management_company,'Tikehau Investment Management');
 assert.equal(data.commercial_brand,'Sofidy');
 assert.equal(data.publication_authorized,false);
});
test('verified but outdated statutes cannot fulfill 2026 regulatory gate',()=>{
 const d=data.regulatory_documents;
 assert.equal(d.dic.issuer_binary_verified,true);
 assert.equal(d.note.issuer_binary_verified,true);
 assert.equal(d.statutes.issuer_binary_verified,true);
 assert.equal(d.statutes.kind_verified,false);
 assert.equal(d.statutes.verified_current_for_2026,false);
 assert.equal(data.regulatory_documents_ready,2);
 assert.equal(data.regulatory_documents_required,3);
 assert.ok(data.remaining_gates.includes('2026_STATUTES_VERIFIED'));
 assert.equal(data.publication_authorized,false);
});
test('financial values remain unapproved in private staging',()=>{
 assert.equal(data.stage_status,'pending_independent_qa');
 assert.equal(data.metric_evidence_pending,29);
 assert.equal(data.allocation_evidence_pending,11);
 assert.equal(data.financial_gate_blocked,true);
});
