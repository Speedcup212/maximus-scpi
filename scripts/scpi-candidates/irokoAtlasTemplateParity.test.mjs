// Guard the established certified SCPI catalogue, both editorial and generated.
// Iroko Atlas is only ONE example; Comète and Transitions Europe are others.
// CORUM must plug into EXISTING routes/tools without an isolated replica.
// Static wiring QA only: does not prove real browser journeys or financial signoff.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');
const catalog=JSON.parse(source('src/data/scpi_complet.json'));
const cohort=JSON.parse(source('src/data/certified_scpi_cohort.json'));
const candidate=JSON.parse(source('data-import/corum_candidates_prepublication_20261015.json'));
const normalize=x=>String(x).toLowerCase().normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const template=source('src/components/OptimizedScpiLandingPage.tsx');
const builder=source('src/utils/buildScpiLandingData.ts');
const routes=source('src/App.tsx');
const editorials=source('src/data/landingPagesData.ts');
const ext=source('src/data/scpiDataExtended.ts');

test('Multiple published SCPI examples preserve both editorial and generated routes',()=>{
 const publishedExamples=['iroko-atlas','comete','transitions-europe','iroko-zen'];
 assert.equal(cohort.count,cohort.slugs.length,'certified catalogue size must agree with its cohort');
 for(const slug of publishedExamples){
  assert.ok(cohort.slugs.includes(slug),slug+' must be in the certified cohort');
  assert.ok(catalog.some(x=>normalize(x['Nom SCPI'])===slug),slug+' must exist in public catalogue');
 }
 // Iroko Atlas is a generated fiche, while other established products are editorial.
 assert.ok(!editorials.includes("'iroko-atlas':"));
 for(const slug of ['comete','transitions-europe','iroko-zen'])
  assert.ok(editorials.includes("'"+slug+"':"),slug+' editorial example missing');
 assert.match(builder,/export function buildScpiLandingData\(/);
 assert.match(builder,/if \(!publicScpi\) return null;/);
 assert.match(builder,/isEditorial: true/);
 assert.match(builder,/isEditorial: false/);
 assert.match(template,/const built = buildScpiLandingData\(scpiKey\);/);
 assert.match(routes,/<OptimizedScpiLandingPage/);
});

test('Every new SCPI uses the existing multi-SCPI app routes, not a separate microsite',()=>{
 assert.equal(candidate.scpi.length,4);
 assert.equal(candidate.status,'private_staging_non_published');
 for(const product of candidate.scpi){
  assert.ok(product.scpi_slug.startsWith('corum-'));
  assert.equal(normalize(product.name),product.scpi_slug);
  // Candidate is private today, but must become public after real sign-off.
  // Reject partial release and source/catalog disagreement, not a valid 65-fund cohort.
  const inCohort=cohort.slugs.includes(product.scpi_slug);
  const inCatalog=catalog.some(x=>normalize(x['Nom SCPI'])===product.scpi_slug);
  assert.equal(inCohort,inCatalog,product.scpi_slug+' source/catalog mismatch');
  assert.ok(!editorials.includes("'"+product.scpi_slug+"':"),
   'CORUM-specific one-off pages must not bypass the established SCPI catalogue routes');
 }
 const published=candidate.scpi.filter(x=>cohort.slugs.includes(x.scpi_slug)).length;
 assert.ok([0,4].includes(published),'candidate cohort must be all-or-none');
 if(published===4){
  // In a genuine deployment all candidate-specific release statuses must be
  // evidenced; a mere imported name is not a completed SCPI.
  assert.ok(candidate.scpi.every(x=>x.release_ready===true &&
   x.publication_authorized===true && x.analysis_certified===true &&
   Object.values(x.surface_tests||{}).filter(v=>v==='pass').length>=10));
 }
 assert.match(routes,/scpiKey && buildScpiLandingData\(scpiKey\)/);
 assert.match(routes,/buildScpiLandingData\(slug\)/);
 assert.doesNotMatch(routes,/<StaticScpiPage/);
 assert.match(routes,/SCPI non disponible/);
});

test('Public product data is the common source for comparateur and investment simulators',()=>{
 assert.match(source('src/data/scpiData.ts'),/certified_scpi_cohort/);
 assert.match(ext,/import \{ scpiData \} from '.\/scpiData';/);
 assert.match(ext,/const newlyReleased = scpiData/);
 assert.match(ext,/certifiedScpiSlugSet/);
 assert.match(source('src/components/fintech/FintechComparator.tsx'),/scpiDataExtended/);
 assert.ok(source('src/components/ScpiSecondaryMarketSimulator.tsx').includes("from '../data/scpiData'"));
 assert.ok(template.includes('defaultYield={landingData.simulator.defaultYield}'));
});

test('Analyse, trajectoire, radar and client consume real slug-keyed data, not CORUM mock visuals',()=>{
 assert.match(source('src/utils/scpiLiveData.ts'),/scpi_indicators/);
 assert.match(source('src/components/trajectory/ScpiTrajectoryPanel.tsx'),/scpi_trajectory_pilot_history/);
 assert.match(source('src/components/trajectory/ScpiTrajectoryPanel.tsx'),/scpi_trajectory_pilot_liquidity/);
 assert.match(source('src/components/trajectory/ScpiTrajectoryPanel.tsx'),/\.eq\('scpi_slug', scpiSlug\)/);
 assert.match(source('src/app/components/ClientScpiCard.tsx'),/ScpiTrajectoryPanel/);
 assert.match(source('src/app/components/ClientPortfolioRadarTrajectory.tsx'),/GlobalPortfolioTrajectory/);
 assert.match(source('src/utils/computeClientScores.ts'),/scoreScpiBatch/);
 assert.match(source('src/components/ScpiDetailPage.tsx'),/computeClientScores/);
 assert.match(source('src/components/ScpiDetailPage.tsx'),/getLatestScore/);
});

test('Candidate preparation never masquerades as site-wide functional completion',()=>{
 assert.match(source('supabase/migrations/20261015_scpi_candidate_iroko_atlas_tool_parity.sql'),
   /scpi_candidate_tool_readiness/);
 assert.match(source('supabase/migrations/20261015_scpi_candidate_iroko_atlas_tool_parity.sql'),
   /scpi_trajectory_pilot_history/);
 assert.match(source('supabase/migrations/20261015_scpi_candidate_iroko_atlas_tool_parity.sql'),
   /scpi_bulletin_analysis/);
 assert.match(source('supabase/migrations/20261015_scpi_candidate_iroko_atlas_tool_parity.sql'),
   /scpi_trajectory_pilot_liquidity/);
 assert.match(source('supabase/migrations/20261015_scpi_candidate_iroko_atlas_tool_parity.sql'),
   /final_release_ready/);
});
