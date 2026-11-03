import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyProgressiveCohortAttestation} from './progressiveCohortCertification.mjs';
const strict=Array.from({length:68},(_,i)=>'strict-'+i);
const baseline={count:68,slugs:strict};
const cohort={count:69,slugs:[...strict,'sofidynamic']};
const source='https://www.sofidy.com/app/uploads/2026/07/Bulletin_Trimestriel_-_Sofidynamic_OPTI.pdf';
const catalog=[{'Nom SCPI':'Sofidynamic',maximus_publication_status:'published_with_reserves',
  maximus_publication_disclosure:{status:'visible'},
  maximus_publication_reservations:['LATEST_STATUTES_UNVERIFIED','UNRECONCILED_SHARE_FLOW'],
  maximus_disabled_features:['suitability_recommendations','uncertified_history_comparison'],
  'Décote/Surcote QA':'manual_review'}];
const certified=strict.map(scpi_slug=>({scpi_slug,certification_status:'certified',
 current_source_certified:true,certified_source_url:'https://official.example.com/file.pdf'}));
const provisional={scpi_slug:'sofidynamic',certification_status:'current_certified_history_unverified',
 current_period:'2026-T2',current_source_certified:true,certified_source_url:source,
 comparison_certified:false,improvements:[],deteriorations:[],structural_event_detected:false};
test('before activation 68 certified analyses remain exact despite declared 69th public route',()=>{
 const v=verifyProgressiveCohortAttestation({baseline,cohort,catalog,analyses:certified,enabledCount:68});
 assert.equal(v.certified.length,68);assert.equal(v.partialActive,false);assert.equal(v.extension,'sofidynamic');
});
test('after activation the 69th remains explicitly provisional, not in certified cohort',()=>{
 const v=verifyProgressiveCohortAttestation({baseline,cohort,catalog,analyses:[...certified,provisional],enabledCount:69});
 assert.equal(v.certified.length,68);assert.equal(v.partialActive,true);
});
test('duplicate, unauthorized extra, or uncontained partial facts reject the attestation',()=>{
 const base={baseline,cohort,catalog,analyses:certified,enabledCount:68};
 for(const patch of [
  {analyses:[...certified,certified[0]],enabledCount:69},
  {analyses:[...certified,{...provisional,scpi_slug:'unknown'}],enabledCount:69},
  {analyses:[...certified,{...provisional,improvements:[{x:1}]}],enabledCount:69},
  {analyses:[...certified,{...provisional,certification_status:'certified'}],enabledCount:69},
  {catalog:[{...catalog[0],maximus_disabled_features:[]}]},
  {baseline:{...baseline,count:67}},
  {cohort:{...cohort,slugs:cohort.slugs.filter(s=>s!=='strict-15'),count:68}}
 ])assert.throws(()=>verifyProgressiveCohortAttestation({...base,...patch}),/PROGRESSIVE_COHORT_ATTESTATION/);
});
