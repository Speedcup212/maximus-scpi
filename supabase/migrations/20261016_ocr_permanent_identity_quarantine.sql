-- Quarantine mismatched official PDF identity without converting it into false QA PASS.
-- A rejected document MUST NOT be silently retried as if it were a transient HTTP failure.
-- Keep all row evidence, source URL and actual attempts; do not invent two fake retries.
ALTER TABLE maximus_agents.scpi_ocr_jobs
 DROP CONSTRAINT IF EXISTS scpi_ocr_jobs_status_check;
ALTER TABLE maximus_agents.scpi_ocr_jobs
 ADD CONSTRAINT scpi_ocr_jobs_status_check
 CHECK(status=ANY(ARRAY[
 'queued','running','done','failed','skipped_existing_verified',
 'skipped_existing_extraction','quarantined_identity_mismatch'
 ]::text[]));

-- Strictly match the single observed 2026-10-16 failure and its unchanged index.
WITH quarantined AS (
 UPDATE maximus_agents.scpi_ocr_jobs j
 SET status='quarantined_identity_mismatch',finished_at=coalesce(j.finished_at,now()),
     lease_token=NULL,
     result_note='Document identity not demonstrated after OCR, 2026-10-16 GitHub run 38882374406. Source requires independent human review; no financial metrics published. Previous error: '||coalesce(j.result_note,'')
 WHERE j.scpi_slug='pierval-sante'
   AND j.source_period='2022-T4'
   AND j.document_kind='quarterly_bulletin'
   AND j.status='failed' AND j.attempts=1
   AND j.result_note LIKE '%document identity mismatch%'
 RETURNING j.scpi_slug,j.source_period,j.document_kind
)
UPDATE maximus_agents.scpi_candidate_document_index d
SET status='rejected',
    review_note=concat(coalesce(d.review_note,''),' | QUARANTINE 2026-10-16: OCR could not confirm Pierval Santé identity from supplied 2022-T4 PDF. Retain source for human investigation, never certify or automatically retry.')
FROM quarantined q
WHERE d.scpi_slug=q.scpi_slug
 AND d.source_period=q.source_period
 AND d.document_kind=q.document_kind
 AND d.status IN ('publisher_index_visible','direct_pdf_checked');
