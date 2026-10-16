import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_q1_five_exact_pdf_source_gaps.sql',import.meta.url),'utf8');

test('Q1 issue addresses precisely four old subscription prices and Origin 95.71% TOF, not 2025 appraisal',()=>{
 for(const match of [
  /'corum-origin','prix_souscription',1135\.00/,
  /'corum-eurion','prix_souscription',215\.00/,
  /'corum-usa','prix_souscription',200\.00/,
  /'corum-xl','prix_souscription',195\.00/,
  /'corum-origin','tof',95\.71/,
  /JOIN public\.scpi_bulletins b ON b\.scpi_slug=v\.scpi_slug AND b\.period='2026-T1'/,
  /d\.document_identity_verified/,
  /d\.pdf_sha256=b\.pdf_sha256/,
  /v\.source_page<=d\.page_count/
 ])assert.match(sql,match);
 assert.doesNotMatch(sql,/SET\s+prix_reconstitution\s*=/i);
});

test('New source evidence remains pending a distinct independent QA, not a fabricated manual signature',()=>{
 assert.match(sql,/'pending_independent_qa'/);
 assert.match(sql,/'source_page_verified_pending_independent_review'/);
 assert.match(sql,/a\.certification_status='certified' OR a\.current_source_certified OR a\.comparison_certified/);
 assert.match(sql,/u\.publication_authorized OR u\.analysis_certified/);
 assert.doesNotMatch(sql,/SET\s+qa_status\s*=\s*'manual_verified_official'/i);
 assert.doesNotMatch(sql,/SET\s+publication_authorized/i);
 assert.doesNotMatch(sql,/SET\s+analysis_certified/i);
 assert.doesNotMatch(sql,/independently_reviewed_by\s*=\s*'/i);
});
