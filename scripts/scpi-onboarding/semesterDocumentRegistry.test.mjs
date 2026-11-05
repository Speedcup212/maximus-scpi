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


const migrationText=(name)=>fs.readFileSync(new URL('../../supabase/migrations/'+name,import.meta.url),'utf8');
test('candidate release accepts real semester reporting, never grants production rights',()=>{
 const sql=migrationText('20261105150927_scpi_candidate_current_semester_in_release_circuit_20261105.sql');
 assert.match(sql,/semiannual_bulletin/);
 assert.match(sql,/2026|20\[0-9\]/);
 assert.match(sql,/document_identity_verified/);
 assert.doesNotMatch(sql,/GRANT\s+(?:ALL|SELECT|INSERT|UPDATE)/i);
 assert.doesNotMatch(sql,/update\s+public\.scpi_indicators/i);
});
test('issuer-specific 11 core checks must be numeric-verified and structurally distinct',()=>{
 const sql=migrationText('20261105151738_scpi_issuer_capital_regime_specific_eleven_core_20261105.sql');
 assert.ok(sql.includes("secondary_market_order_book"));
 assert.ok(sql.includes("parts_inscrites_vente"));
 assert.ok(sql.includes("qa_pass"));
 assert.ok(sql.includes("independently_reviewed_at"));
 assert.ok(sql.includes("core_qa_fields"));
 assert.ok(sql.includes("count(DISTINCT"));
 assert.doesNotMatch(sql,/update\s+public\.scpi_indicators/i);
});
test('suspended capital has no fabricated primary price or capitalization',()=>{
 const sql=migrationText('20261105152205_scpi_secondary_market_app_readiness_no_fake_primary_price_20261105.sql');
 assert.ok(sql.includes("i.capital_type = 'variable_suspended'"));
 assert.ok(sql.includes("i.prix_souscription IS NULL"));
 assert.ok(sql.includes("i.capitalisation IS NULL"));
 assert.ok(sql.includes("secondary_market_order_book"));
 assert.ok(sql.includes("parts_inscrites_vente"));
 assert.ok(sql.includes("orders.qa_status='qa_pass'"));
 assert.ok(sql.includes("i.metric_provenance->>'pdf_sha256' = c_1.pdf_sha256"));
 assert.doesNotMatch(sql,/update\s+public\.scpi_indicators/i);
});


test('protected live admission reads three fixed pilots and never self-proves release',()=>{
 const sql=migrationText('20261105153141_scpi_protected_readonly_three_pilot_admission_live_20261105.sql');
 for(const claim of ['security_invoker=true','sofidynamic','opus-real','aew-opportunites-europe',
  'scpi_candidate_final_release_v1','admission_100_proven','publication_authorized_by_observation','service_role']){
  assert.ok(sql.includes(claim),claim);
 }
 assert.ok(sql.includes('false::boolean AS admission_100_proven'));
});


test('prepublication browser smoke can use exact private issuer PDF, never a fabricated deployed bulletin',()=>{
 const migration=migrationText('20261105160810_scpi_private_prepublish_six_surface_browser_evidence_20261105.sql');
 assert.ok(migration.includes("LEFT JOIN public.scpi_bulletins b"));
 assert.ok(migration.includes("semiannual_bulletin"));
 assert.ok(migration.includes("p.pdf_sha256 = (s.metric_provenance ->> 'pdf_sha256'::text)"));
 assert.ok(migration.includes("maximus_agents.is_verified_candidate_issuer_source(p.source_url)"));
 assert.ok(migration.includes("e.qa_status='qa_pass'"));
 assert.ok(migration.includes("e.independently_reviewed_at IS NOT NULL"));
 assert.ok(migration.includes("e.source_page BETWEEN 1 AND p.page_count"));
 assert.ok(migration.includes(">=12"));
 for(const field of ['source_period','source_url','source_pdf_sha256']){
  assert.ok(migration.includes("r.review_evidence->'approved_analysis_snapshot'->>'"+field+"'"));
 }
 assert.ok(migration.includes("c.value ->> 'surface'"));
 assert.ok(migration.includes("1440"));
 assert.ok(migration.includes("390"));
 assert.ok(migration.includes("scpi_is_strong_qa(b.qa_status)"),'Existing published BNP baseline must remain checked');
 assert.doesNotMatch(migration,/\b(?:update|delete|truncate)\s+public\./i);
 assert.doesNotMatch(migration,/\bgrant\s+(?:all|select|insert|update)\b/i);
});


test('share-flow reconcilation works only with verified issuer periods and distinct real share movements',()=>{
 const sql=migrationText('20261105162109_scpi_candidate_automated_share_flow_reconciliation_20261105.sql');
 assert.match(sql,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_verified_share_flow_v1/);
 assert.ok(sql.includes('document_identity_verified'));
 assert.ok(sql.includes('is_verified_candidate_issuer_source'));
 assert.ok(sql.includes("e.qa_status='qa_pass'"));
 assert.ok(sql.includes("e.independently_reviewed_at IS NOT NULL"));
 assert.ok(sql.includes('lag(closing_parts)'));
 assert.ok(sql.includes('sequence-preceding_sequence<>1'));
 assert.ok(sql.includes("subscribed-c.quarterly_withdrawn"));
 assert.ok(sql.includes("subscribed-c.subscriptions_matched-c.uncompensated_withdrawals"));
 assert.ok(sql.includes('closing_parts-expected_closing_parts'));
 assert.ok(sql.includes('PUBLISHED_SHARE_FLOW_DELTA_UNEXPLAINED'));
 assert.ok(sql.includes('SOURCE_FLOW_ARITHMETIC_RECONCILED'));
 assert.ok(sql.includes('independently_legal_certified'));
 assert.ok(sql.includes('publication_authorized'));
 assert.match(sql,/REVOKE ALL.*anon,authenticated/i);
 assert.doesNotMatch(sql,/\b(?:update|delete|truncate)\s+public\./i);
});


test('private source trajectory is never mistaken for published or legally certified history',()=>{
 const old=migrationText('20261105162332_scpi_candidate_private_source_backed_trajectory_20261105.sql');
 const latest=migrationText('20261105162422_scpi_trajectory_legacy_source_basis_allowance_20261105.sql');
 for(const sql of [old,latest]){
  assert.ok(sql.includes('scpi_candidate_private_trajectory_v1'));
  assert.ok(sql.includes('document_identity_verified'));
  assert.ok(sql.includes('is_verified_candidate_issuer_source'));
  assert.ok(sql.includes("e.qa_status='qa_pass'")||sql.includes("e.qa_status = 'qa_pass'"));
  assert.ok(sql.includes('independently_reviewed_at IS NOT NULL'));
  assert.ok(sql.includes("tof_records"));
  assert.ok(sql.includes('comparison_signoff'));
  assert.ok(sql.includes('publication_authorized'));
  assert.match(sql,/WITH \(security_invoker=true\)/i);
  assert.doesNotMatch(sql,/GRANT\s+(?:ALL|SELECT|INSERT|UPDATE)\s+ON\s+TABLE\s+[^;]+\s+TO\s+(?:anon|authenticated)\b/i);
  assert.doesNotMatch(sql,/\b(?:insert|update|delete)\s+(?:into\s+|from\s+)?public\./i);
 }
 assert.match(old,/REVOKE ALL.*anon,authenticated/i);
 assert.match(old,/GRANT SELECT.*TO service_role/i);
 assert.doesNotMatch(latest,/\bGRANT\b/i);
 assert.ok(latest.includes('verified_source_periods >= 2')||latest.includes('verified_source_periods >= 2::bigint'));
});
