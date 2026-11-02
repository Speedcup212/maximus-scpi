import test from 'node:test';
import assert from 'node:assert/strict';
import {quarterEnd,validCalendarDate,reconcileDatedValues} from './datedEvidence.mjs';
const url='https://issuer.example/bulletin.pdf';
const sha='a'.repeat(64);
const proof=(d,p='2026-T3')=>({reference_date:d,source_page:5,pdf_sha256:sha,source_url:url,source_period:p});
const sample=(d='2026-06-30')=>({
  scpi_slug:'example',source_period:'2026-T3',
  prix_reconstitution:200,valeur_realisation:160,
  metric_provenance:{prix_reconstitution:proof(d),valeur_realisation:proof(d)}
});
test('calendar date and quarter end are exact including leap years',()=>{
 assert.equal(quarterEnd('2026-T3'),'2026-09-30');
 assert.equal(quarterEnd('2024-T1'),'2024-03-31');
 assert.equal(quarterEnd('2026-X4'),null);
 assert.equal(validCalendarDate('2026-02-29'),false);
});
test('repeated historic valuation date never invents a new quarter event',()=>{
 const current=sample(),past={...sample(),source_period:'2026-T2',
   metric_provenance:{prix_reconstitution:proof('2026-06-30','2026-T2'),valeur_realisation:proof('2026-06-30','2026-T2')}};
 const result=reconcileDatedValues(current,[past],{issuer_hosts:['issuer.example']});
 assert.equal(result.status,'PASS');
 assert.equal(result.fields.prix_reconstitution.status,'LAST_OFFICIAL_VALUE');
 assert.equal(result.fields.prix_reconstitution.reference_date,'2026-06-30');
 assert.ok(result.warnings.includes('prix_reconstitution:REPEATED_REFERENCE_DATE_NOT_NEW_EVENT'));
 assert.equal(result.publication_authorized,false);
});
test('rejects contradictory value for same official date',()=>{
 const current=sample();
 const older={...sample(),prix_reconstitution:205,source_period:'2026-T2',
   metric_provenance:{prix_reconstitution:proof('2026-06-30','2026-T2'),valeur_realisation:proof('2026-06-30','2026-T2')}};
 assert.ok(reconcileDatedValues(current,[older]).errors.includes('prix_reconstitution:CONTRADICTORY_SAME_DATE'));
});
test('rejects reconstitution date later than the quarter',()=>{
 const r=reconcileDatedValues(sample('2026-12-31'),[]);
 assert.ok(r.errors.includes('prix_reconstitution:FUTURE_REFERENCE_DATE'));
});
test('rejects untrusted publisher and missing page',()=>{
 const current=sample();
 const bad=reconcileDatedValues(current,[],{issuer_hosts:['other.example']});
 assert.ok(bad.errors.includes('prix_reconstitution:UNTRUSTED_ISSUER_HOST'));
 current.metric_provenance.valeur_realisation.source_page=null;
 assert.ok(reconcileDatedValues(current).errors.includes('valeur_realisation:UNDATED_OR_UNSOURCED_VALUE'));
});
test('officially unavailable valuation remains unknown, never zero',()=>{
 const current=sample();current.prix_reconstitution=null;current.valeur_realisation=null;
 const r=reconcileDatedValues(current);
 assert.equal(r.status,'PASS');
 assert.equal(r.fields.prix_reconstitution.status,'NO_VERIFIED_VALUE');
 assert.equal(r.fields.prix_reconstitution.display_value,null);
});
test('a quarter end date is current, older report date is last known',()=>{
 const current=sample('2026-09-30');
 const r=reconcileDatedValues(current);
 assert.equal(r.fields.prix_reconstitution.status,'OFFICIAL_AT_QUARTER_END');
});

test('uncertified old snapshot is excluded, not promoted into valuation evidence',()=>{
 const current=sample();
 const old={...sample(),source_period:'2026-T2',metric_provenance:{}};
 const r=reconcileDatedValues(current,[old],{issuer_hosts:['issuer.example']});
 assert.equal(r.status,'PASS');
 assert.ok(r.warnings.includes('prix_reconstitution:HISTORY_UNVERIFIED_EXCLUDED'));
 assert.equal(r.fields.prix_reconstitution.reference_date,'2026-06-30');
 assert.equal(r.publication_authorized,false);
});
