-- Reclassify and reprocess ONLY the real 2026-T2 Buroboutic PDF
-- containing a subordinate 1.77% occupancy item falsely tagged as TOF.
-- The source-level result is archived before retry. The correction parser
-- must be live before production workers consume this queue.
WITH bad AS (
 SELECT d.* FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.scpi_slug='buroboutic-metropoles'
   AND d.source_period='2026-T2' AND d.status='extracted'
   AND d.processing_complete=true AND d.origin='registered_bulletin'
   AND d.field_coverage->>'tof'='verified'
   AND (d.metrics->>'tof')::numeric=1.77
   AND d.evidence->'tof'->>'text' ILIKE '%intégrés au TOF sous conditions%'
   AND d.pdf_sha256='2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba'
)
INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
 (event_key,reason,snapshot)
SELECT 'buroboutic-2026-T2-tof-subcomponent',
 '1.77 percent is a table component, not financial occupancy TOF',
 to_jsonb(bad)
FROM bad ON CONFLICT(event_key) DO NOTHING;

UPDATE maximus_agents.scpi_bulletin_replay_documents d
SET status='queued',parser_version=NULL,financial_complete=false,
    next_try_at=now(),updated_at=now(),
    result=d.result||jsonb_build_object(
      'reprocess_reason','original_T2_TOF_subcomponent_misread',
      'reprocess_audit_event','buroboutic-2026-T2-tof-subcomponent')
WHERE d.scpi_slug='buroboutic-metropoles'
  AND d.source_period='2026-T2' AND d.status='extracted'
  AND d.processing_complete=true AND d.origin='registered_bulletin'
  AND d.field_coverage->>'tof'='verified'
  AND (d.metrics->>'tof')::numeric=1.77
  AND d.evidence->'tof'->>'text' ILIKE '%intégrés au TOF sous conditions%'
  AND d.pdf_sha256='2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba';
