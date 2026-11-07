import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql=readFileSync(new URL('../../supabase/migrations/20261107_recovery134_tof_subcomponent_sql_guard.sql',import.meta.url),'utf8');

test('RECOVERY-134 protects TOF independently of PDF page and source plausibility',()=>{
  assert.match(sql,/CREATE OR REPLACE FUNCTION scpi_internal\.tof_value_is_vacancy_component/);
  assert.match(sql,/m := regexp_match\(/);
  assert.match(sql,/locaux\[\[:space:\]\]\+vacants/);
  assert.match(sql,/replace\(m\[1\],',','\.'\)::numeric=p_value/);
  assert.match(sql,/scpi_internal\.tof_value_is_vacancy_component\(\s*NEW\.evidence_text, NEW\.value_numeric\)/);
  assert.match(sql,/reason:='TOF_VACANCY_SUBCOMPONENT_NOT_TOTAL'/);
  assert.match(sql,/NEW\.verification_status:='invalid_tof_bulletin_source_policy'/);
  assert.match(sql,/NEW\.extraction_confidence:=0/);
});

test('RECOVERY-134 records true rejected evidence; does not invent a different occupancy rate',()=>{
  assert.match(sql,/INSERT INTO maximus_agents\.scpi_replay_provenance_quarantine/);
  assert.match(sql,/to_jsonb\(c\)/);
  assert.match(sql,/c\.scpi_slug='buroboutic-metropoles'/);
  assert.match(sql,/c\.source_period='2026-T3'/);
  assert.match(sql,/c\.value_numeric=0\.07/);
  assert.match(sql,/c\.verification_status='auto_verified_with_evidence'/);
  assert.match(sql,/IF n<>1 THEN RAISE EXCEPTION/);
  assert.doesNotMatch(sql,/SECURITY DEFINER/i);
  assert.doesNotMatch(sql,/UPDATE public\.scpi_indicator_history/i);
  assert.doesNotMatch(sql,/UPDATE public\.scpi_indicators/i);
  assert.doesNotMatch(sql,/DISABLE ROW LEVEL SECURITY/i);
});
