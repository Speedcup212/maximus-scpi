// Regression guard: staged funds may be queried by service-role workers,
// but never through the anonymous SCPI Data API before cohort promotion.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const r=(file)=>fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8');
const row=r('supabase/migrations/20261016_public_candidate_cohort_rls_gate.sql');
const views=r('supabase/migrations/20261016_trajectory_invoker_security.sql');
test('Every candidate-bearing public SCPI table is cohort-gated',()=>{
 for(const table of ['scpi_indicators','scpi_bulletins','scpi_bulletin_analysis',
  'scpi_indicator_history','scpi_metric_certifications','scpi_trajectory_pilot']){
  const policy=new RegExp('ON public\\.'+table+'\\s+USING\\s*\\(([\\s\\S]*?)\\);','i');
  const hit=row.match(policy);
  assert.ok(hit,'Missing policy for '+table);
  assert.match(hit[1],/maximus_scpi_is_in_public_cohort\\(scpi_slug\\)/);
 }
 assert.match(row,/u\\.lifecycle='existing'/);
 assert.match(row,/REVOKE ALL ON FUNCTION public\\.maximus_scpi_is_in_public_cohort\\(text\\) FROM PUBLIC/);
});
test('Financial provenance remains in addition to cohort filtering',()=>{
 assert.match(row,/scpi_is_strong_qa\\(qa_status\\)/);
 assert.match(row,/verification_status ILIKE 'manual_verified%'/);
 assert.match(row,/NULLIF\\(btrim\\(evidence_text\\),''\\) IS NOT NULL/);
});
test('Trajectory public views are invoker-safe without removing private QA data',()=>{
 for(const name of ['scpi_trajectory_pilot_history','scpi_trajectory_pilot_liquidity'])
  assert.match(views,new RegExp('ALTER VIEW public\\.'+name+' SET \\(security_invoker=true\\)'));
 assert.match(views,/maximus_scpi_is_in_public_cohort\\(scpi_slug\\)/);
});
