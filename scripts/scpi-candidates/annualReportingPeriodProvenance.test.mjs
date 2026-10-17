import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const db=read('supabase/migrations/20261017_corum_annual_financial_field_provenance.sql');
const types=read('src/types/scpi.ts');
const live=read('src/utils/scpiLiveData.ts');
const catalog=read('src/data/scpiData.ts');
const helper=read('src/utils/scpiFinancialProvenance.ts');
const landing=read('src/components/OptimizedScpiLandingPage.tsx');
const faq=read('src/components/ScpiDetailPage.tsx');
const cohort=JSON.parse(read('src/data/certified_scpi_cohort.json'));

test('Every CORUM 2025 annual rate is independently reconciled with exact-value report certification',()=>{
 assert.match(db,/td\.value_numeric=i\.td/);
 assert.match(db,/debt\.value_numeric=i\.endettement/);
 assert.match(db,/td\.source_period='2025-RA'/);
 assert.match(db,/debt\.source_period='2025-RA'/);
 assert.match(db,/i\.source_period='2026-T2'/);
 assert.match(db,/i\.ra_source_period='2025-RA'/);
 assert.match(db,/td\.source_url=debt\.source_url/);
 assert.match(db,/td\.source_page>0/);
 assert.match(db,/debt\.source_page>0/);
 assert.match(db,/updated_count<>4/);
 assert.match(db,/u\.publication_authorized OR u\.analysis_certified/);
 assert.match(db,/final_release_ready/);
 assert.doesNotMatch(db,/SET\s+(?:td|endettement|publication_authorized|analysis_certified)\s*=/i);
 assert.doesNotMatch(db,/UPDATE\s+maximus_agents\.scpi_candidate_final_review/i);
});

test('Per-field provenance is carried into existing SCPI application model from issuer data',()=>{
 for(const name of ['distributionReferencePeriod','debtReferencePeriod','distributionReferenceUrl','debtReferenceUrl'])
   assert.ok(types.includes(name) && live.includes(name),name);
 for(const name of ['td_reference_period','debt_reference_period','td_reference_url','debt_reference_url'])
   assert.ok(db.includes(name) && live.includes(name),name);
 assert.match(live,/toNumber\(row\.td\) !== undefined && row\.td_reference_period/);
 assert.match(live,/toNumber\(row\.endettement\) !== undefined && row\.debt_reference_period/);
 assert.match(live,/const INDICATOR_SELECT =/);
 assert.match(catalog,/distributionReferencePeriod:/);
 assert.match(catalog,/debtReferencePeriod:/);
});

test('UI reports actual annual data year or neutral wording, with issuer link but never inferred from T2',()=>{
 assert.match(helper,/\^\(20\\d\{2\}\)-RA\$/);
 assert.match(helper,/année de référence non indiquée/);
 assert.match(helper,/date de référence non indiquée/);
 assert.match(helper,/parsed\.protocol === 'https:'/);
 assert.match(landing,/annualReferenceYear\(realScpiData\?\.distributionReferencePeriod\)/);
 assert.match(landing,/distributionYearHelp\(realScpiData\.distributionReferencePeriod\)/);
 assert.match(landing,/debtYearHelp\(realScpiData\.debtReferencePeriod\)/);
 assert.match(landing,/Rapport officiel/);
 assert.match(faq,/distributionYearLabel\(scpi\.distributionReferencePeriod\)/);
 assert.doesNotMatch(faq,/taux de distribution 2024 de la SCPI/);
 assert.doesNotMatch(landing,/annualReferenceYear\(realScpiData\?\.maximusSourcePeriode/);
});

test('Historical year labels survive either 61-public or full 65-CORUM official release',()=>{
 assert.equal(cohort.count,cohort.slugs.length);
 assert.ok([61,65].includes(cohort.count));
 const ids=['corum-eurion','corum-origin','corum-usa','corum-xl'];
 const included=ids.filter(slug=>cohort.slugs.includes(slug));
 assert.equal(included.length,cohort.count===65?4:0);
 if(included.length===4){
   const catalog=JSON.parse(read('src/data/scpi_complet.json'));
   for(const slug of included){
     const found=catalog.filter(row=>String(row['Nom SCPI']).toLowerCase().replaceAll(' ','-')===slug);
     assert.equal(found.length,1);
     assert.equal(found[0].td_reference_period,'2025-RA');
     assert.equal(found[0].debt_reference_period,'2025-RA');
     assert.match(found[0].td_reference_url,/^https:\\/\\//);
   }
 }
});
