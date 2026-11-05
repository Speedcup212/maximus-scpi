import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync(new URL('../../supabase/migrations/20261105135939_scpi_candidate_semester_evidence_contract_20261105.sql', import.meta.url),'utf8');
const queue = fs.readFileSync(new URL('../../supabase/migrations/20261105140854_scpi_candidate_semiannual_work_queue_20261105.sql', import.meta.url),'utf8');

test('verified semiannual source is a distinct kind and period, not a fabricated quarterly bulletin', () => {
 assert.match(contract,/semiannual_bulletin/);
 assert.ok(contract.includes("document_kind='semiannual_bulletin'"));
 assert.ok(contract.includes("source_period ~ '^20[0-9]{2}-S[12]$'"));
 assert.ok(contract.includes("source_period ~ '^20[0-9]{2}-(T[1-4]|RA)$'"));
 assert.doesNotMatch(contract,/drop table|truncate table|update public\.scpi_indicators/i);
});

test('queue advances to financial review only for verified issuer binary with an S1 source', () => {
 assert.match(queue,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_work_queue/i);
 assert.ok(queue.includes("semi.source_period='2026-S1'"));
 assert.ok(queue.includes("semi.document_kind='semiannual_bulletin'"));
 assert.ok(queue.includes("semi.document_identity_verified"));
 assert.ok(queue.includes("semi.native_text_characters > 1000"));
 assert.ok(queue.includes("maximus_agents.is_verified_candidate_issuer_source(semi.source_url)"));
 assert.ok(queue.includes("'COMPLETE_PAGINATED_METRIC_QA'"));
});

test('fix changes neither the financial release verdict nor user-facing values', () => {
 for(const sql of [contract,queue]) {
  assert.doesNotMatch(sql,/\b(?:insert|update|delete)\s+(?:into\s+|from\s+)?public\.scpi_indicators/i);
  assert.doesNotMatch(sql,/\bcreate\s+or\s+replace\s+view\s+maximus_agents\.scpi_candidate_final_release_v1\b/i);
  assert.doesNotMatch(sql,/\bgrant\s+(?:all|select|insert|update)\b/i);
 }
});

test('new publisher AEW host is an exact allowlist row with a product-page provenance', () => {
 const migration = fs.readFileSync(new URL('../../supabase/migrations/20261105141124_scpi_candidate_aew_verified_official_hostname_20261105.sql', import.meta.url),'utf8');
 assert.ok(migration.includes("('www.aewpatrimoine.com','AEW Patrimoine'"));
 assert.ok(migration.includes("https://www.aewpatrimoine.com/nos-produits/scpi-dimmobilier-dentreprise/aew-opportunites-europe"));
 assert.match(migration,/on conflict \(hostname\) do nothing/i);
 assert.doesNotMatch(migration,/\bgrant\s+(?:all|insert|update|select)\b/i);
});
