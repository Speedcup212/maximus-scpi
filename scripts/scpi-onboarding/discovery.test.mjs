import test from 'node:test';
import assert from 'node:assert/strict';
import {assessDiscovery} from './discovery.mjs';
const proposal={schema_version:1,mode:'new',batch_id:'test',candidate:{
slug:'new-scpi',issuer_hosts:['issuer.example'],
official_product_page:'https://issuer.example/product',
official_bulletins_page:'https://issuer.example/pdf',
official_annual_report:'https://issuer.example/annual',
status:'DISCOVERED_ONLY',document_sha256:null}};
test('discovered SCPI cannot be certified or published',()=>{
 const r=assessDiscovery(proposal,{count:68,slugs:[]});
 assert.equal(r.source_discovery,'PASS');
 assert.equal(r.publication_authorized,false);
 assert.ok(r.missing_steps.includes('PDF_SHA256'));
});
test('publisher impersonation and already published entries fail',()=>{
 let m=structuredClone(proposal);m.candidate.official_bulletins_page='https://issuer.example.evil.test/pdf';
 assert.equal(assessDiscovery(m,{slugs:[]}).source_discovery,'FAIL');
 assert.equal(assessDiscovery(proposal,{slugs:['new-scpi']}).source_discovery,'FAIL');
});
test('a supplied fake SHA or QA state cannot turn discovery into certification',()=>{
 const m=structuredClone(proposal);m.candidate.document_sha256='a'.repeat(64);
 assert.equal(assessDiscovery(m,{slugs:[]}).source_discovery,'FAIL');
});
