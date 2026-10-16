import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 auditCandidate,assertPublicReleaseConsistency
} from './auditCorumE2e.mjs';
import {hasOfficial2026Valuation} from './issuerValuationEvidence.mjs';
import {assertExactGeography} from './officialAllocationParity.mjs';

const read=(p)=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const privateSnapshot=read('data-import/corum_candidates_prepublication_20261015.json');
const baselineCohort=read('src/data/certified_scpi_cohort.json');
const baselineCatalog=read('src/data/scpi_complet.json');
const fundSlugs=privateSnapshot.scpi.map(c=>c.scpi_slug);
const clone=x=>structuredClone(x);
const withPublicFunds=(n)=>{
 const cohort=clone(baselineCohort),catalog=clone(baselineCatalog);
 for(const c of privateSnapshot.scpi.slice(0,n)){
  if(!cohort.slugs.includes(c.scpi_slug))cohort.slugs.push(c.scpi_slug);
  catalog.push({'Nom SCPI':c.name});
 }
 cohort.count=cohort.slugs.length;
 return {cohort,catalog};
};

test('CRASH-01: 61 private is valid, while a synthetically complete 65 public cohort must also be valid',()=>{
 const base=assertPublicReleaseConsistency(baselineCohort,baselineCatalog);
 assert.equal(base.released_count,0);
 const result=withPublicFunds(4);
 const published=assertPublicReleaseConsistency(result.cohort,result.catalog);
 assert.equal(published.released_count,4);
 assert.equal(published.cohort,baselineCohort.count+4);
 // All tests operate on copies. No public SCPI added to source or production.
 assert.equal(assertPublicReleaseConsistency(baselineCohort,baselineCatalog).released_count,0);
});

test('CRASH-02: abort each partial 1/4, 2/4, 3/4 publishing state',()=>{
 for(let n=1;n<4;n++){
  const fixture=withPublicFunds(n);
  assert.throws(()=>assertPublicReleaseConsistency(fixture.cohort,fixture.catalog),
   /Partially released CORUM batch/);
 }
});
test('CRASH-03: abort 65 source cohort if catalog row missing or duplicated',()=>{
 const {cohort,catalog}=withPublicFunds(4);
 assert.throws(()=>assertPublicReleaseConsistency(cohort,catalog.slice(0,-1)),
  /Partial publication/);
 assert.throws(()=>assertPublicReleaseConsistency(cohort,[...catalog,catalog[catalog.length-1]]),
  /Duplicate public product row/);
 assert.throws(()=>assertPublicReleaseConsistency({...cohort,count:61},catalog),
  /count drift/);
});
test('CRASH-04: a QA_PASS numerical row whose URL is another document is NOT source-verified',()=>{
 const c=clone(privateSnapshot.scpi[0]);
 const target=c.evidence.find(e=>e.period==='2026-T2'&&e.metric==='prix_souscription');
 assert.ok(target);
 target.source=c.pdfs.find(d=>d.period==='2025-RA').url;
 assert.ok(auditCandidate(c).blockers.includes('t2_non_verifie:prix_souscription'));
});
test('CRASH-05: a QA_PASS row outside official PDF page range is NOT source-verified',()=>{
 const c=clone(privateSnapshot.scpi[1]);
 const target=c.evidence.find(e=>e.period==='2025-RA'&&e.metric==='taux_distribution');
 assert.ok(target);
 target.page=100000;
 assert.ok(auditCandidate(c).blockers.includes('annual_non_verifie:taux_distribution'));
});
test('CRASH-06: tampered 2025 appraisal is blocked from 2026 valuation fields',()=>{
 const c=clone(privateSnapshot.scpi[0]);
 c.publishing_fields.reconstitution_value=c.publishing_sources.reconstitution_value.historical_2025.verified_value;
 assert.equal(hasOfficial2026Valuation(c),false);
 assert.ok(auditCandidate(c).blockers.includes('preuve_affichage_absente:reconstitution_value'));
});
test('CRASH-07: 100% geographic weights with permuted country keys are blocked',()=>{
 const c=clone(privateSnapshot.scpi.find(c=>c.scpi_slug==='corum-eurion'));
 const wrong=clone(c.publishing_fields.geographic_allocation);
 const italy=wrong.Italie,portugal=wrong.Portugal;
 wrong.Italie=portugal;wrong.Portugal=italy;
 assert.equal(Object.values(wrong).reduce((s,x)=>s+x,0),100);
 assert.throws(()=>assertExactGeography(c,{repartition_geographique:wrong}),
  /country percentage mismatch/);
});
test('CRASH-08: forged surface statuses (bare "pass") never satisfy ten real UI workflows',()=>{
 const c=clone(privateSnapshot.scpi[0]);
 c.release_ready=true;c.publication_authorized=true;c.analysis_certified=true;
 const names=['seo_page','sitemap','comparateur','liquidite','simulateur_direct',
  'simulateur_revente','simulateur_demembrement','score_radar','espace_client','parcours_souscription'];
 c.surface_tests=Object.fromEntries(names.map(name=>[name,'pass']));
 const a=auditCandidate(c);
 for(const name of names)assert.ok(a.blockers.includes('parcours_non_teste:'+name),name);
});
test('CRASH-09: even a complete-looking CI reference missing identity of fund is rejected',()=>{
 const c=clone(privateSnapshot.scpi[0]);c.release_ready=true;c.publication_authorized=true;c.analysis_certified=true;
 const fake={status:'pass',scpi_slug:'wrong-fund',surface:'seo_page',
  commit_sha:'a'.repeat(40),
  run_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/12345678',
  executed_at:'2026-10-16T10:00:00Z'};
 c.surface_tests={seo_page:fake};
 assert.ok(auditCandidate(c).blockers.includes('parcours_non_teste:seo_page'));
});
test('CRASH-10: financial sources do NOT grant whole-product approval or site publication',()=>{
 for(const c of privateSnapshot.scpi){
  const a=auditCandidate(c);
  assert.equal(a.ready,false);
  assert.ok(a.blockers.includes('validation_finale_non_obtenue'));
  assert.ok(a.blockers.includes('autorisation_publication_absente'));
  assert.ok(a.blockers.includes('analyse_globale_non_certifiee'));
 }
});
