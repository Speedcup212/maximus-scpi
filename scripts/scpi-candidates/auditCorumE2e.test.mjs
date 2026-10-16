import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditCandidate,auditSnapshot,assertIntegrationTopology} from './auditCorumE2e.mjs';
const source=JSON.parse(fs.readFileSync(new URL('../../data-import/corum_candidates_prepublication_20261015.json',import.meta.url),'utf8'));
test('4 CORUM registered, source identities and page-level financial evidence survive extraction',()=>{
 const report=auditSnapshot(source);
 assert.equal(report.length,4);
 assert.deepEqual(report.map(r=>r.slug).sort(),['corum-eurion','corum-origin','corum-usa','corum-xl']);
 for(const item of report){
  assert.ok(item.checked_metrics>=10);
  assert.ok(item.checked_documents>=2);
  assert.ok(!item.blockers.includes('identite_slug'));
  assert.ok(!item.blockers.some(x=>x.startsWith('document_empreinte_manquant:')));
  assert.ok(!item.blockers.some(x=>x.startsWith('annual_non_verifie:')));
  assert.ok(!item.blockers.some(x=>x.startsWith('t2_non_verifie:')));
 }
});
test('private candidate status is blocked, but a genuinely reviewed 65-fund cohort may pass',()=>{
 const cohort=JSON.parse(fs.readFileSync(new URL('../../src/data/certified_scpi_cohort.json',import.meta.url),'utf8'));
 const published=source.scpi.filter(c=>cohort.slugs.includes(c.scpi_slug)).length;
 assert.ok([0,4].includes(published),'CORUM batch release must be atomic');
 for(const candidate of source.scpi){
  const r=auditCandidate(candidate);
  if(published===0){
   assert.equal(r.ready,false);
   for(const blocker of ['autorisation_publication_absente','validation_finale_non_obtenue',
    'analyse_globale_non_certifiee','parcours_non_teste:seo_page','parcours_non_teste:espace_client'])
    assert.ok(r.blockers.includes(blocker),blocker);
  }else assert.equal(r.ready,true,'Live public candidate must pass all source+financial+surface gates');
 }
});
test('missing fees, risk, or liquidity blocks publication, never coerces to zero',()=>{
 for(const candidate of source.scpi){
  const r=auditCandidate({...candidate,release_ready:true,publication_authorized:true,analysis_certified:true,
   surface_tests:Object.fromEntries(['seo_page','sitemap','comparateur','liquidite','simulateur_direct','simulateur_revente','simulateur_demembrement','score_radar','espace_client','parcours_souscription'].map(k=>[k,'pass']))});
  assert.equal(r.ready,false);
  assert.ok(!r.blockers.includes('dic_risque_non_verifie:risk_sri'));
  assert.ok(!r.blockers.includes('champ_affichage_non_qualifie:risk_sri'));
  assert.ok(r.blockers.includes('champ_affichage_non_qualifie:liquidity_basis'));
  if(candidate.scpi_slug==='corum-xl') {
   assert.ok(!r.blockers.includes('champ_affichage_non_qualifie:management_fees'));
   assert.ok(!r.blockers.includes('frais_gestion_tiers_invalides'));
   const invalidFee={...candidate,publishing_fields:{...candidate.publishing_fields,
     management_fees:{...candidate.publishing_fields.management_fees,blended_rate:14}}};
   assert.ok(auditCandidate(invalidFee).blockers.includes('frais_gestion_taux_moyen_invente'));
  }else{
   assert.ok(r.blockers.includes('champ_affichage_non_qualifie:management_fees'));
  }
 }
});
test('2025 gross distribution and 2026 quarter flows are never interchangeable',()=>{
 for(const candidate of source.scpi){
  const annual=candidate.evidence.find(m=>m.period==='2025-RA'&&m.metric==='taux_distribution');
  const q=candidate.evidence.find(m=>m.period==='2026-T2'&&m.metric==='distribution_brute_par_part');
  assert.equal(annual.unit,'PERCENT');
  assert.equal(q.unit,'EUR_PER_PART');
  assert.ok(Number(annual.value)>0);
  assert.ok(Number(q.value)>0);
 }
});
test('the shared public catalog is a single switch for SEO, comparator, simulators and client',()=>{
 const t=assertIntegrationTopology();
 assert.ok(t.surfaces>=11);
 assert.equal(t.cohort,JSON.parse(fs.readFileSync(new URL('../../src/data/certified_scpi_cohort.json',import.meta.url),'utf8')).count);
 assert.ok([0,4].includes(t.released_count));
});
test('duplicated or corrupt source-page evidence is rejected',()=>{
 const base=source.scpi[0];
 const a=auditCandidate({...base,evidence:[...base.evidence,base.evidence[0]]});
 assert.ok(a.blockers.includes('indicateurs_dupliques'));
 const b=auditCandidate({...base,pdfs:[]});
 assert.ok(b.blockers.includes('document_empreinte_manquant:2025-RA'));
 assert.ok(b.blockers.includes('document_empreinte_manquant:2026-T2'));
});
test('the four DIC risk levels come from their own exact PDF fingerprints',()=>{
 const expected={'corum-origin':3,'corum-eurion':3,'corum-xl':4,'corum-usa':4};
 for(const candidate of source.scpi){
  const dic=candidate.regulatory_documents.find(x=>x.kind==='dic');
  const sri=candidate.regulatory_metrics.find(x=>x.metric==='risk_sri');
  const hold=candidate.regulatory_metrics.find(x=>x.metric==='recommended_holding_years');
  assert.equal(sri.value,expected[candidate.scpi_slug]);
  assert.equal(sri.sha256,dic.sha256);
  assert.equal(hold.value,10);
  assert.equal(hold.sha256,dic.sha256);
 }
});
