import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql=readFileSync(new URL('../../supabase/migrations/20261107_recovery130_corum_service_role_review_read.sql',import.meta.url),'utf8');

test('RECOVERY-130 uses a read-only service role grant on exactly one table',()=>{
  assert.match(sql,/GRANT SELECT ON TABLE maximus_agents\.scpi_candidate_final_review\s+TO service_role;/);
  assert.match(sql,/REVOKE SELECT ON TABLE maximus_agents\.scpi_candidate_final_review\s+FROM PUBLIC, anon, authenticated;/);
  assert.equal((sql.match(/^GRANT /gm)||[]).length,1);
  assert.equal((sql.match(/^REVOKE /gm)||[]).length,1);
  assert.doesNotMatch(sql,/^\s*(?:GRANT|REVOKE)\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE)\b/gmi);
  assert.doesNotMatch(sql,/\b(?:SECURITY DEFINER|DISABLE ROW LEVEL SECURITY|ALTER POLICY|DROP POLICY)\b/gmi);
  assert.doesNotMatch(sql,/^\s*(?:UPDATE|DELETE|INSERT|TRUNCATE)\s+/gmi);
});
