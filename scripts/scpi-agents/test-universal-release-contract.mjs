import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root = new URL('../../',import.meta.url);
const read = path => readFileSync(new URL(path,root),'utf8');
const promotion=read('supabase/migrations/20261031125000_candidate_atomic_promotion_generic_batch.sql');
const oidc=read('supabase/functions/scpi-release-certification-oidc/index.ts');
const cohort=JSON.parse(read('src/data/certified_scpi_cohort.json'));
const candidates=JSON.parse(read('src/data/bnpp_candidates_67_68.json'));
test('release uses dynamic batch count, not legacy minimum 66',()=>{
  assert.doesNotMatch(promotion,/p_expected_before\s*<\s*66/);
  assert.match(promotion,/p_expected_after<>p_expected_before\+cardinality\(v_slugs\)/);
  assert.match(promotion,/v_count<>p_expected_before/);
});
test('atomic promotion enforces exact updated row counts',()=>{
  assert.match(promotion,/enabled % pilots for % candidates/);
  assert.match(promotion,/updated % universe rows for % candidates/);
  assert.match(promotion,/GET DIAGNOSTICS v_updated = ROW_COUNT/g);
});
test('OIDC attests exact active identities and full analysis coverage',()=>{
  assert.match(oidc,/active_slugs:\[\.\.\.allowed\]\.sort\(\)/);
  assert.match(oidc,/observed\.size!==allowed\.size/);
  assert.doesNotMatch(oidc,/allowed\.size<66/);
});
test('unapproved BNP candidates remain excluded from certified public cohort',()=>{
  assert.equal(cohort.count,cohort.slugs.length);
  for(const c of candidates.candidates){
    if(!c.release_ready) assert.equal(cohort.slugs.includes(c.scpi_slug),false);
  }
});
