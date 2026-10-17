import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 auditCandidate,assertPublicReleaseConsistency
} from './auditCorumE2e.mjs';
import {hasOfficial2026Valuation} from './issuerValuationEvidence.mjs';
import {assertCanonicalFinancialEvidence} from './officialFinancialParity.mjs';
import {assertExactGeography} from './officialAllocationParity.mjs';

const read=(p)=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const privateSnapshot=read('data-import/corum_candidates_prepublication_20261015.json');
const currentCohort=read('src/data/certified_scpi_cohort.json');
const currentCatalog=read('src/data/scpi_complet.json');
const fundSlugs=privateSnapshot.scpi.map(c=>c.scpi_slug);
const slug=name=>String(name).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// The adversarial fixture starts from the immutable 61-fund baseline, even if
// the real 65-fund owner-approved release is staged in the same checkout.
const baselineCohort={...currentCohort,count:61,
 slugs:currentCohort.slugs.filter(id=>!fundSlugs.includes(id))};
const baselineCatalog=currentCatalog.filter(row=>!fundSlugs.includes(slug(row['Nom SCPI'])));
if(baselineCohort.slugs.length!==61)
 throw Error('Crash test cannot extract the original 61-fund cohort');
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
 c.release_ready=true;c.publication_authorized=false;c.analysis_certified=false;
 const names=['seo_page','sitemap','comparateur','liquidite','simulateur_direct',
  'simulateur_revente','simulateur_demembrement','score_radar','espace_client','parcours_souscription'];
 c.surface_tests=Object.fromEntries(names.map(name=>[name,'pass']));
 const a=auditCandidate(c);
 assert.ok(a.blockers.includes('campagne_navigateur_non_verifiee'));
 assert.equal(names.length,10);
});
test('CRASH-09: even a complete-looking CI reference missing identity of fund is rejected',()=>{
 const c=clone(privateSnapshot.scpi[0]);c.release_ready=true;c.publication_authorized=false;c.analysis_certified=false;
 const fake={status:'pass',scpi_slug:'wrong-fund',surface:'seo_page',
  commit_sha:'a'.repeat(40),
  run_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/12345678',
  executed_at:'2026-10-16T10:00:00Z'};
 c.surface_tests={seo_page:fake};
 assert.ok(auditCandidate(c).blockers.includes('campagne_navigateur_non_verifiee'));
});
test('CRASH-10: financial sources do NOT grant whole-product approval or site publication',()=>{
 for(const c of privateSnapshot.scpi){
  const a=auditCandidate(c);
  assert.equal(a.ready,false);
  assert.ok(a.blockers.includes('validation_finale_non_obtenue'));
  assert.ok(!a.blockers.includes('activation_publique_prematuree'));
  assert.ok(!a.blockers.includes('analyse_publique_prematuree'));
 }
});

test('CRASH-14: QA_PASS and valid official PDF URL cannot conceal a tampered numeric value',()=>{
 const c=clone(privateSnapshot.scpi[0]);
 const independentRows=c.evidence.map(e=>({
  scpi_slug:c.scpi_slug,source_period:e.period,metric:e.metric,value_numeric:String(e.value),
  source_url:e.source,source_page:e.page,verification_status:'manual_verified_official'
 }));
 assert.equal(assertCanonicalFinancialEvidence(c,independentRows),c.evidence.length);
 c.evidence[0].value+=0.01; // A small false return, still on a real official PDF page
 assert.equal(c.evidence[0].qa,'qa_pass');
 assert.throws(()=>assertCanonicalFinancialEvidence(c,independentRows),
  /audited PDF financial value\/source\/page differs/);
});

test('CRASH-15: a completed PRIVATE source review does not demand forbidden published flags',()=>{
  const c=clone(privateSnapshot.scpi[0]);
  c.release_ready=true;
  c.publication_authorized=false;
  c.analysis_certified=false;
  const result=auditCandidate(c);
  assert.ok(!result.blockers.includes('validation_finale_non_obtenue'));
  assert.ok(!result.blockers.includes('activation_publique_prematuree'));
  assert.ok(!result.blockers.includes('analyse_publique_prematuree'));
  // Other missing source/real-browser checks are intentionally still blocking.
  assert.equal(result.ready,false);
});
test('CRASH-16: pre-activating a candidate before Netlify is rejected',()=>{
  const c=clone(privateSnapshot.scpi[0]);
  c.release_ready=true;
  c.publication_authorized=true;
  c.analysis_certified=true;
  const a=auditCandidate(c);
  assert.ok(a.blockers.includes('activation_publique_prematuree'));
  assert.ok(a.blockers.includes('analyse_publique_prematuree'));
});
test('CRASH-17: a syntactically valid CI URL alone cannot prove browser execution',()=>{
  const c=clone(privateSnapshot.scpi[0]);
  const inventedRun={
    status:'pass', scpi_slug:c.scpi_slug, surface:'seo_page',
    commit_sha:'0'.repeat(40),
    run_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/12345',
    executed_at:'2026-10-16T10:00:00Z'
  };
  c.surface_tests={seo_page:inventedRun};
  // Now a valid-looking URL is insufficient; a completed CI run and real artifact are required.
  assert.ok(auditCandidate(c).blockers.includes('campagne_navigateur_non_verifiee'));
  // Counterexample proves why one VERIFIED CI matrix + artifact is needed.
  // Do not treat this unverified metadata as a valid release authorization.
});
