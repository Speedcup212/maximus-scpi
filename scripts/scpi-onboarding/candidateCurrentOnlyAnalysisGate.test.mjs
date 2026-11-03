import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync(new URL('../../supabase/migrations/20261103095500_candidate_current_only_certified_analysis_gate.sql',import.meta.url),'utf8');
test('verified current analysis survives a blocked historical comparison without fake trends',()=>{
 assert.match(migration,/current_certified_history_unverified/);
 assert.match(migration,/b\.current_source_certified AND b\.certified_source_url = c_1\.source_url/);
 assert.match(migration,/NOT b\.comparison_certified AND b\.current_snapshot IS NOT NULL/);
 assert.match(migration,/jsonb_array_length\(COALESCE\(b\.certification_reasons,'\[\]'::jsonb\)\) > 0/);
 assert.match(migration,/jsonb_array_length\(COALESCE\(b\.improvements,'\[\]'::jsonb\)\) = 0/);
 assert.match(migration,/jsonb_array_length\(COALESCE\(b\.deteriorations,'\[\]'::jsonb\)\) = 0/);
 assert.match(migration,/security_invoker = true/);
 assert.doesNotMatch(migration,/UPDATE public\.scpi_indicators/i);
});
