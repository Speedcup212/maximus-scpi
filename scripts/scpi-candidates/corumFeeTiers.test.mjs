import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=f=>fs.readFileSync(new URL('../../'+f,import.meta.url),'utf8');
const pilot=JSON.parse(source('data-import/corum_candidates_prepublication_20261015.json'));
const publicCohort=JSON.parse(source('src/data/certified_scpi_cohort.json'));
const sql=source('supabase/migrations/20261016_corum_xl_tiered_management_fee_parity.sql');
const xl=pilot.scpi.find(x=>x.scpi_slug==='corum-xl');
const fees=xl.publishing_fields.management_fees;
const evidence=xl.publishing_sources.management_fees;

test('CORUM XL retains two official, non-interchangeable HT rates and no blended scalar',()=>{
 assert.equal(fees.kind,'geographic_tiers');
 assert.equal(fees.basis,'HT');
 assert.equal(fees.euro_zone_percent,12.40);
 assert.equal(fees.outside_euro_zone_percent,15.90);
 assert.equal(fees.blended_rate,null);
 assert.equal(fees.source_period,'2026-T2');
 assert.equal(evidence.page,11);
 assert.match(evidence.sha256,/^[a-f0-9]{64}$/);
 assert.match(evidence.url,/^https:\/\/www\.corum\.fr\//);
});
test('All four CORUM remain private even with completed fee evidence',()=>{
 assert.equal(pilot.status,'private_staging_non_published');
 assert.ok([61,65,66].includes(publicCohort.count));
 if(publicCohort.count===66)assert.ok(publicCohort.slugs.includes('edr-europa'));
 const published=pilot.scpi.filter(x=>publicCohort.slugs.includes(x.scpi_slug));
 assert.ok(published.length===0||published.length===4,'No partial CORUM publication');
 assert.equal(published.length,publicCohort.count>=65?4:0);
 for(const x of pilot.scpi){
  // An immutable private pilot remains historical and is never overwritten
  // to make its outdated candidate flags an artificial publication signoff.
  assert.equal(x.publication_authorized,false);
  assert.equal(x.release_ready,false);
 }
});
test('Atomic promotion never fills an invented blended management percentage',()=>{
 const p=source('scripts/scpi-candidates/promoteApprovedCorum.mjs');
 assert.match(p,/function validatedManagementFees\(/);
 assert.match(p,/fees\.blended_rate!==null/);
 assert.match(p,/'Frais de gestion \(HT\/%\)':managementFees\.flat/);
 assert.match(p,/'Frais de gestion \(détail\)':managementFees\.detail/);
 assert.doesNotMatch(p,/\(fees\.euro_zone_percent\s*\+\s*fees\.outside_euro_zone_percent\)\s*\/\s*2/);
});
test('Same shared public template and comparator carry the structured fees',()=>{
 assert.match(source('src/types/scpi.ts'),/ScpiManagementFeeDetails/);
 assert.match(source('src/data/scpiData.ts'),/parseManagementFeeDetails/);
 assert.match(source('src/data/scpiDataExtended.ts'),/managementFeeDetails: scpi\.fraisGestionDetails/);
 assert.match(source('src/components/OptimizedScpiLandingPage.tsx'),/realScpiData\.fraisGestionDetails\.euro_zone_percent/);
 assert.match(source('src/components/ScpiDetailPage.tsx'),/scpi\.fraisGestionDetails\.outside_euro_zone_percent/);
 assert.match(source('src/utils/buildScpiLandingData.ts'),/Frais de gestion géographiques distincts/);
});
test('Strict public approval gate quarantines failed histories and certifies only verified rows',()=>{
 const gate=source('supabase/migrations/20261016_p0_strict_public_approval_gate.sql');
 assert.match(gate,/u\.lifecycle='existing'/);
 assert.match(gate,/u\.strict_pass IS TRUE/);
 assert.match(gate,/u\.analysis_certified IS TRUE/);
 assert.match(gate,/u\.publication_authorized IS TRUE/);
 assert.match(gate,/'atream-hotel'/);
 assert.match(gate,/'remake-uk-2025'/);
});
test('DB gate checks both rates against identical official hash-verified bulletin',()=>{
 assert.ok(sql.includes('management_fee_euro_zone_ht'));
 assert.ok(sql.includes('management_fee_non_euro_zone_ht'));
 assert.match(sql,/e2\.source_url\s*=\s*e1\.source_url/);
 assert.match(sql,/b\.pdf_sha256\s*~/);
 assert.ok(sql.includes("'^[a-f0-9]{64}$'"));
 assert.match(sql,/e1\.qa_status\s*=\s*'qa_pass'/);
 assert.match(sql,/a\.certification_status\s*=\s*'certified'/);
 assert.match(sql,/g\.release_ready\s+IS\s+TRUE/);
});
