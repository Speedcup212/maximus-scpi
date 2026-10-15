// Guard the existing Iroko Atlas product experience as the one-and-only
// public template. 4 CORUM candidates must use the SAME route after approval.
// This is static wiring QA, NOT proof of real data or browser completion.
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

test('Iroko Atlas is published via the generated OptimizedScpiLandingPage, not a special design',()=>{
 assert.ok(cohort.slugs.includes('iroko-atlas'));
 assert.ok(catalog.some(x=>normalize(x['Nom SCPI'])==='iroko-atlas'));
 assert.ok(!editorials.includes("'iroko-atlas':"));
 assert.match(builder,/export function buildScpiLandingData\(/);
 assert.match(builder,/if \(!publicScpi\) return null;/);
 assert.match(template,/const built = buildScpiLandingData\(scpiKey\);/);
 assert.match(routes,/<OptimizedScpiLandingPage/);
});

test('Every new SCPI resolves to the very same Iroko Atlas template on publication',()=>{
 assert.equal(candidate.scpi.length,4);
 assert.equal(candidate.status,'private_staging_non_published');
 for(const product of candidate.scpi){
  assert.ok(product.scpi_slug.startsWith('corum-'));
  assert.equal(normalize(product.name),product.scpi_slug);
  assert.ok(!cohort.slugs.includes(product.scpi_slug),
   'Candidate must not leak into public cohort without full financial and tool QA');
  assert.ok(!catalog.some(x=>normalize(x['Nom SCPI'])===product.scpi_slug));
  assert.ok(!editorials.includes("'"+product.scpi_slug+"':"),
   'Custom landing pages must not be substituted for Iroko Atlas model');
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
