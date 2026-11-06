import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql=readFileSync(new URL('../../supabase/migrations/20261106_recovery126_evidence_first_gates.sql',import.meta.url),'utf8');
const original=readFileSync(new URL('../../supabase/migrations/20261106_recovery122_candidate20.sql',import.meta.url),'utf8');

test('P0: reuse the existing 20/day queue without spending QA slots on source discovery',()=>{
  assert.match(sql,/CREATE OR REPLACE FUNCTION maximus_agents\.prepare_candidate_batch20\(\)/);
  assert.match(sql,/WHERE u\.lifecycle='candidate'\s+-- P0:[\s\S]*?AND EXISTS \(\s+SELECT 1 FROM maximus_agents\.scpi_candidate_pdf_validation p/);
  assert.match(sql,/p\.document_identity_verified=true/);
  assert.match(sql,/p\.pdf_sha256 ~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(sql,/p\.page_count>0/);
  assert.match(sql,/candidate_claims_per_role_day/); // from unchanged existing baseline
  assert.match(sql,/limit_candidates constant integer := 20/);
  assert.match(sql,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
  assert.match(sql,/result->>'binary_proof_status'='live_binary_proof'/);
  assert.match(sql,/CREATE OR REPLACE VIEW maximus_agents\.candidate_source_gap_by_manager/);
  assert.doesNotMatch(sql,/CREATE\s+TABLE\s+maximus_agents\.tasks/i);
});

test('P1: provenance checks are private and cannot certify financial records',()=>{
  assert.match(sql,/CREATE OR REPLACE VIEW maximus_agents\.candidate_metric_provenance_integrity/);
  for(const marker of [
    'm.scpi_slug','m.source_period','m.document_kind','m.source_url',
    'm.source_page','p.page_count>=m.source_page',
    'p.document_identity_verified=true','m.independently_reviewed_at IS NOT NULL',
    'm.qa_status=\'qa_pass\'','false AS live_binary_reverified_in_this_view',
    'false AS financial_certification_proven','false AS deploy_allowed'
  ])assert.ok(sql.includes(marker),marker);
  assert.match(sql,/WITH \(security_invoker = true\)/g);
  assert.match(sql,/REVOKE ALL ON maximus_agents\.candidate_metric_provenance_integrity FROM PUBLIC,anon,authenticated/);
});

test('P2: watchdog distinguishes old heartbeats from runnable work',()=>{
  assert.match(sql,/CREATE OR REPLACE FUNCTION maximus_agents\.watchdog_tick\(\)/);
  assert.match(sql,/operational_state='READY_OR_WAITING' AND a\.pending_today>0/);
  const idle=sql.indexOf("when v_runnable=0 then 'WAITING_POLICY'");
  const stalled=sql.indexOf("when v_last is null or v_last<now()-interval '2 hours' then 'STALE'");
  assert.ok(idle>0 && stalled>idle);
  assert.match(sql,/v_incident := v_enabled and v_state='STALE' and v_runnable>0/);
  assert.match(sql,/REVOKE ALL ON FUNCTION maximus_agents\.watchdog_tick\(\) FROM PUBLIC,anon,authenticated/);
});

test('P3/P4: prohibit publication and quota bypass until independent final admission',()=>{
  assert.match(original,/candidate_claims_per_role_day BETWEEN 1 AND 20/);
  assert.match(sql,/false AS financial_certified, false AS deploy_allowed/);
  assert.doesNotMatch(sql,/\b(?:UPDATE|DELETE FROM|TRUNCATE)\s+(?:public\.scpi_indicators|maximus_agents\.tasks|maximus_agents\.scpi_universe)\b/i);
  assert.doesNotMatch(sql,/\b(?:publish_scpi|deployNetlify|netlify deploy)\b/i);
});
