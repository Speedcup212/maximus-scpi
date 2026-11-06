import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyCandidateBinaryEvidence} from './candidateBinaryEvidence.mjs';

const source={
 source_period:'2026-T3',document_kind:'quarterly_bulletin',
 source_url:'https://reim.bnpparibas-am.com/report.pdf',
 pdf_sha256:'a'.repeat(64),page_count:7
};
const task={payload:{mode:'candidate_documentary_audit',scpi_slug:'opus-real',
 candidate_evidence:{scpi_slug:'opus-real',documents:[source]}}};
const record={...source,status:'verified',reader_engines:['MuPDF','Poppler'],
 identity_verified:true,period_verified:true,
 binary_hash_matches_registered:true,financial_certified:false};
const proof={candidate_slug:'opus-real',status:'verified',
 financial_certified:false,deploy_allowed:false,documents:[record]};
test('only exact source URL, hash, page count and two readers give source proof',()=>{
 const x=verifyCandidateBinaryEvidence(task,proof);
 assert.equal(x.documents,1);
 assert.equal(x.kind,'live_binary_proof');
 assert.equal(x.financial_certified,false);
 for(const changed of [
  {pdf_sha256:'b'.repeat(64)}, {page_count:8},
  {source_url:'https://other.example/report.pdf'},
  {reader_engines:['MuPDF']},{identity_verified:false},
  {period_verified:false},{financial_certified:true},
  {binary_hash_matches_registered:false}
 ]){
   assert.throws(()=>verifyCandidateBinaryEvidence(task,{
      ...proof,documents:[{...record,...changed}]
    }),/BINARY_PDF_PROVENANCE_DISAGREEMENT/);
 }
});
test('never treat missing or incomplete publisher proof as successful QA',()=>{
 assert.throws(()=>verifyCandidateBinaryEvidence(task,null));
 assert.throws(()=>verifyCandidateBinaryEvidence(task,{...proof,status:'blocked'}),/INCOMPLETE/);
 assert.throws(()=>verifyCandidateBinaryEvidence(task,{...proof,documents:[]}),/INCOMPLETE/);
 assert.throws(()=>verifyCandidateBinaryEvidence(task,{...proof,documents:[record,record]}),/INCOMPLETE/);
 assert.throws(()=>verifyCandidateBinaryEvidence(task,{...proof,financial_certified:true}),/INVALID/);
});
test('no documents is an explicit source gap, never certification',()=>{
 const without={...task,payload:{...task.payload,
 candidate_evidence:{scpi_slug:'opus-real',documents:[]}}};
 const p={status:'no_verified_documents',candidate_slug:'opus-real',documents:[],
    financial_certified:false,deploy_allowed:false};
 assert.deepEqual(verifyCandidateBinaryEvidence(without,p),{
   required:true,kind:'source_gap',candidate_slug:'opus-real',documents:0,
   finance_certified:false,financial_certified:false
 });
 assert.throws(()=>verifyCandidateBinaryEvidence(without,proof),/UNVERIFIED_EMPTY/);
});
test('legacy non-candidate tasks do not require a publisher proof',()=>{
 assert.equal(verifyCandidateBinaryEvidence({
   payload:{mode:'parallel_readonly_audit'}
 },null).required,false);
});
