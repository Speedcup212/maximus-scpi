import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync(new URL('../../supabase/migrations/20261016_current_scpi_qa_source_and_bulletin_recertification.sql',import.meta.url),'utf8');
const proof=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_xl_t2_quarterly_exact_core_and_48_proofs.sql',import.meta.url),'utf8');

test('P0: current indicator QA and provenance transitions run the existing certified-analysis pipeline',()=>{
  assert.match(migration,/DROP TRIGGER IF EXISTS trg_scpi_indicators_refresh_analysis/);
  assert.match(migration,/AFTER INSERT OR UPDATE OF\s+source_period,qa_status,source_url,bulletin_id/);
  assert.match(migration,/EXECUTE FUNCTION public\.trg_refresh_scpi_bulletin_analysis\(\)/);
  assert.doesNotMatch(migration,/SET\s+qa_status\s*=/i);
  assert.doesNotMatch(migration,/SET\s+publication_authorized\s*=/i);
  assert.doesNotMatch(migration,/SET\s+analysis_certified\s*=/i);
});
test('P0: every 2026 T1/T2 official CORUM bulletin must reconcile six page-proven core metrics',()=>{
  assert.match(proof,/total<>48 OR matched<>48/);
  assert.match(proof,/scpi_candidate_metric_evidence/);
  assert.match(proof,/scpi_metric_certifications/);
  assert.match(proof,/e\.independently_reviewed_at IS NOT NULL/);
  assert.match(proof,/e\.source_url=r\.source_url/);
  assert.match(proof,/e\.source_page BETWEEN 1 AND v\.page_count/);
  assert.match(proof,/o\.pdf_sha256=r\.pdf_sha256/);
  assert.match(proof,/c\.value_numeric=e\.numeric_value/);
  assert.match(proof,/r\.m->>r\.display_field/);
});
test('P0: XL 54340 associates repopulated ONLY with independently matched issuer page and zero fake sign-off',()=>{
  assert.match(proof,/e\.metric='nombre_associes' AND e\.numeric_value=54340/);
  assert.match(proof,/AND e\.source_page=3/);
  assert.match(proof,/b\.pdf_sha256='fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd'/);
  assert.match(proof,/b\.qa_status='candidate_page_checked_partial'/);
  assert.doesNotMatch(proof,/SET\s+publication_authorized\s*=/i);
  assert.doesNotMatch(proof,/SET\s+analysis_certified\s*=/i);
  assert.doesNotMatch(proof,/SET\s+qa_status\s*=/i);
});
