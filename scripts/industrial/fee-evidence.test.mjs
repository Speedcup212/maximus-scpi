import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectProvenFee, isProvenNotApplicable} from '../../src/utils/scpiFeeEvidence.mjs';
const proof = {verification_status:'verified',value_numeric:0,tax_basis:'TTC',assessment_basis:'prix de souscription',valid_from:'2026-09-01',source_url:'https://issuer.example/note.pdf',pdf_sha256:'a'.repeat(64),source_page:3,evidence_text:'Commission de souscription : 0 % TTC.',product_identity_verified:true,semantic_review_verified:true,reliability_rank:3};
test('explicit documented zero is retained',()=>assert.equal(selectProvenFee(0,proof,'TTC',undefined).value,0));
for (const [field,value] of Object.entries({verification_status:'source_verified_no_field_evidence',value_numeric:10,tax_basis:'HT',assessment_basis:'',valid_from:'2026-02-31',source_url:'',pdf_sha256:'',source_page:null,evidence_text:'',product_identity_verified:false,semantic_review_verified:false})) {
 test(`reject incomplete or inconsistent ${field}`,()=>assert.equal(selectProvenFee(0,{...proof,[field]:value},'TTC',10).applied,false));
}
for(const value of [null,undefined,'',NaN,-1]) test(`unknown/invalid fee ${String(value)} never becomes zero`,()=>assert.equal(selectProvenFee(value,proof,'TTC',undefined).value,undefined));
test('older or equal evidence cannot overwrite a certified fee',()=>{
 for(const valid_from of ['2026-08-01','2026-09-01']) assert.equal(selectProvenFee(5,{...proof,value_numeric:5,valid_from},'TTC',0,proof).applied,false);
});
test('newer but less reliable evidence cannot overwrite certified fee',()=>assert.equal(selectProvenFee(5,{...proof,value_numeric:5,valid_from:'2026-10-01',reliability_rank:2},'TTC',0,proof).applied,false));
test('newer reviewed evidence with same reliability can replace',()=>assert.equal(selectProvenFee(5,{...proof,value_numeric:5,valid_from:'2026-10-01'},'TTC',0,proof).value,5));

test('conflicting legacy fee remains protected until its provenance is reconciled',()=>assert.equal(selectProvenFee(0,proof,'TTC',10).reason,'existing_fee_requires_reconciliation'));

const notApplicable = {verification_status:'verified',value_state:'not_applicable',valid_from:'2026-06-23',source_url:'https://issuer.example/scpi',evidence_text:'Suspension de la variabilité du capital depuis le 23 juin 2026 ; marché secondaire.',reason:'souscription fermée'};
test('a proven non-applicable fee hides the inherited figure and is never a zero',()=>{
 const selected=selectProvenFee(null,notApplicable,'TTC',9,undefined);
 assert.equal(selected.value,null); assert.equal(selected.applied,true); assert.equal(selected.reason,'not_applicable');
});
test('an unsourced or numeric non-applicability is ignored',()=>{
 assert.equal(isProvenNotApplicable({...notApplicable,source_url:''}),false);
 assert.equal(isProvenNotApplicable({...notApplicable,value_numeric:0}),false);
 assert.equal(selectProvenFee(null,{...notApplicable,evidence_text:''},'TTC',9).value,9);
});
test('a later certified fee is not hidden by an older non-applicability',()=>{
 assert.equal(selectProvenFee(null,notApplicable,'TTC',5,{...proof,value_numeric:5,valid_from:'2026-10-01'}).value,5);
});
