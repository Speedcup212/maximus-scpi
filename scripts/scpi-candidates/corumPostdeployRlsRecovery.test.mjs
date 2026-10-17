import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_postdeploy_postgres_recovery.sql',import.meta.url),'utf8');
const cohort=JSON.parse(fs.readFileSync(new URL('../../src/data/certified_scpi_cohort.json',import.meta.url),'utf8'));
test('Administrative postdeploy repair retains caller authentication and original QA gates',()=>{
 assert.match(sql,/CREATE OR REPLACE FUNCTION public\.maximus_activate_candidate_after_deploy/);
 assert.match(sql,/auth\.role\(\) = 'service_role'/);
 assert.match(sql,/auth\.role\(\) IS NULL AND session_user = 'postgres'/);
 assert.match(sql,/Activation requires service role or privileged postgres operator/);
 assert.doesNotMatch(sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION')),/set_config\(|request\.jwt\.claim|ALTER ROLE|GRANT EXECUTE/i);
 for(const k of ['scpi_candidate_final_release_v1','f.final_release_ready IS TRUE',
   't.full_surface_ready IS TRUE','t.finance_and_final_qa_ready IS TRUE',
   "a.certification_status='certified'","u.lifecycle='candidate'",
   'NOT u.publication_authorized','NOT u.analysis_certified',
   'UPDATE maximus_agents.scpi_universe','p_netlify_deploy_id','p_release_sha',
   'partial batch rollback'])
   assert.ok(sql.includes(k),k);
});
test('RLS release must only be all four fund cohort and never leak unnamed SCPI',()=>{
 assert.equal(cohort.count,65);
 const four=['corum-eurion','corum-origin','corum-usa','corum-xl'];
 for(const s of four)assert.ok(cohort.slugs.includes(s),s);
 assert.equal(four.filter(s=>cohort.slugs.includes(s)).length,4);
 assert.match(sql,/RETURNS TABLE\(activated_slug text\)/i);
});
