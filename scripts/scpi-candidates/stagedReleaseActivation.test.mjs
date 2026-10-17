import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8');
const view=read('supabase/migrations/20261016_candidate_release_gate_no_impossible_universe_flags.sql');
const activation=read('supabase/migrations/20261016_candidate_postdeploy_atomic_public_activation.sql');
const promotion=read('scripts/scpi-candidates/promoteApprovedCorum.mjs');
const privateAudit=read('scripts/scpi-candidates/auditCorumE2e.mjs');
const postdeploy=read('scripts/scpi-candidates/activateApprovedBatchAfterNetlify.mjs');

test('CRASH-11: private stage must NEVER demand forbidden public flags before deployment',()=>{
 assert.match(view,/scpi_candidate_final_release_v1 fr/);
 assert.match(view,/fr\.final_release_ready IS TRUE/);
 assert.doesNotMatch(view,/u\.analysis_certified IS TRUE AND g\.release_ready IS TRUE/);
 assert.match(promotion,/row\.publication_authorized!==false\|\|row\.analysis_certified!==false/);
 assert.match(promotion,/row\.release_ready/);
 assert.match(promotion,/t\.full_surface_ready/);
 assert.match(privateAudit,/checked\(candidate\.publication_authorized===false,'activation_publique_prematuree'\)/);
 assert.match(privateAudit,/checked\(candidate\.analysis_certified===false,'analyse_publique_prematuree'\)/);
});
test('CRASH-12: only a truly ready and site-proven batch can change candidate RLS lifecycle',()=>{
 assert.match(activation,/AUTHORIZATION|Activation requires server-side service role/i);
 assert.match(activation,/p_release_sha !~ '\^\[a-f0-9\]\{40\}\$'/);
 assert.match(activation,/p_netlify_deploy_id !~ '\^\[a-f0-9\]\{24\}\$'/);
 assert.match(activation,/f\.final_release_ready IS TRUE/);
 assert.match(activation,/t\.full_surface_ready IS TRUE/);
 assert.match(activation,/a\.certification_status='certified'/);
 assert.match(activation,/SET lifecycle='existing', stage='strict_pass', strict_pass=true/);
 assert.match(activation,/analysis_certified=true,publication_authorized=true/);
 assert.match(activation,/REVOKE ALL ON FUNCTION .*maximus_activate_candidate_after_deploy/);
 assert.match(activation,/GRANT EXECUTE ON FUNCTION .*maximus_activate_candidate_after_deploy/);
});
test('CRASH-13: verify real Netlify exact production deployment, source SHA, HTML and sitemap before public access',()=>{
 assert.match(postdeploy,/dep\.state!=='ready'/);
 assert.match(postdeploy,/!dep\.published_at/);
 assert.match(postdeploy,/site\.published_deploy\?\.id!==deployment/);
 assert.match(postdeploy,/!String\(dep\.commit_message\|\|''\)\.includes\(sha\)/);
 assert.match(postdeploy,/\/sitemap\.xml/);
 assert.match(postdeploy,/!sitemap\.includes\('<loc>'\+canonical\+'<\/loc>'\)/);
 const check=postdeploy.indexOf("maximus_activate_candidate_after_deploy");
 const sitemap=postdeploy.indexOf("sitemap.xml");
 assert.ok(check>sitemap,'Cannot activate the public RLS before site verification');
 assert.match(postdeploy,/visible\.length!==4/);
});
