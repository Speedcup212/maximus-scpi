-- RECOVERY-192 / 2026-11-08. Durable read-only QA evidence from real GitHub
-- run 42469201587. Candidate geometry != financial certification.
-- NO changes to financial certifications, history, source readiness or quarantine.

CREATE TABLE IF NOT EXISTS maximus_agents.scpi_tof_candidate_geometry_qa (
  scpi_slug text NOT NULL,
  source_period text NOT NULL,
  certificate_id uuid NOT NULL REFERENCES public.scpi_metric_certifications(id),
  source_url text NOT NULL,
  pdf_sha256 text NOT NULL,
  pdf_byte_size bigint NOT NULL,
  source_page integer,
  candidate_tof_percent numeric,
  prior_invalid_value numeric NOT NULL,
  workflow_reference text NOT NULL,
  artifact_id text NOT NULL,
  artifact_json_sha256 text NOT NULL,
  review_status text NOT NULL,
  policy_rejection_reason text NOT NULL,
  paired_geometry jsonb NOT NULL,
  financial_certified boolean NOT NULL DEFAULT false CHECK (financial_certified=false),
  human_attestation boolean NOT NULL DEFAULT false CHECK (human_attestation=false),
  deploy_allowed boolean NOT NULL DEFAULT false CHECK (deploy_allowed=false),
  inserted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(scpi_slug,source_period),
  UNIQUE(artifact_id),
  CHECK (pdf_sha256 ~ '^[a-f0-9]{64}$'),
  CHECK (artifact_json_sha256 ~ '^[a-f0-9]{64}$'),
  CHECK (pdf_byte_size BETWEEN 1024 AND 20000000),
  CHECK (source_period ~ '^20[0-9]{2}-T[1-4]$'),
  CHECK (review_status IN ('BBOX_CANDIDATE_REVIEW','NEEDS_INDEPENDENT_SEMANTIC_QA')),
  CHECK (
    (review_status='BBOX_CANDIDATE_REVIEW'
      AND candidate_tof_percent BETWEEN 0 AND 100 AND source_page>0)
    OR (review_status='NEEDS_INDEPENDENT_SEMANTIC_QA'
      AND candidate_tof_percent IS NULL AND source_page IS NULL)
  )
);
ALTER TABLE maximus_agents.scpi_tof_candidate_geometry_qa ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE maximus_agents.scpi_tof_candidate_geometry_qa
 FROM PUBLIC,anon,authenticated;

DO $record$
DECLARE expected integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:recovery192:historical_tof_candidates'));

  WITH expected_cases(scpi_slug,source_period,cert_id,pdf_sha,pdf_bytes,
    page,candidate,prior_value,artifact_id,artifact_json_sha,review_status,
    geometry) AS (
   VALUES
   ('novapierre-1','2024-T4',
    '3e1056ea-ace0-4359-bce7-b3816cc3e747'::uuid,
    '3296b51f63b420914be88a4004179d40cf3b2f2bdd3baee9cd4d8e4f241f1c54',
    2945576::bigint,4,89.7::numeric,10.3::numeric,'13612802807',
    'ba5056435b47f263a40d4b2f6d7c3cbae2a224ea971ca8874e470cce5c6c050f',
    'BBOX_CANDIDATE_REVIEW',
    '{"page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml"],"pairs":[{"value":89.7,"mupdf_bbox":[77.67,172.02,125.92,188.73],"poppler_bbox":[77.67,172.02,125.92,188.73],"both_near_tof":true},{"value":89.7,"mupdf_bbox":[529.74,154.6,544.73,167.05],"poppler_bbox":[529.74,154.6,544.73,167.05],"both_near_tof":true}],"candidate_count":2,"source_annotation":"printed TOF T4 2024 89,7%; source also labels locaux vacants 10,3%","financial_certified":false}'::jsonb),
   ('novapierre-residentiel','2022-T1',
    '5f35d9e2-715f-4f3f-9ad7-be3f1eda757b'::uuid,
    '6997ac5572b2907f6ab4e3b4d1f8dce08a750e266b1431dc8dbe6dab4a450708',
    1005351::bigint,4,95.3::numeric,97.2::numeric,'13613076061',
    '8f2e5d0b10089904dab609cd4521b9b03833f57d5b6b1c3d79c1a5665c427dcf',
    'BBOX_CANDIDATE_REVIEW',
    '{"page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml","html_word_recovery"],"pairs":[{"value":95.3,"mupdf_bbox":[234.72,237.41,251.84,246.25],"poppler_bbox":[234.72,237.41,251.84,246.25],"both_near_tof":true}],"candidate_count":1,"financial_certified":false}'::jsonb),
   ('cristal-rente','2026-T2',
    'b83dd62d-d2f9-4ad8-a935-70a0ee96d89c'::uuid,
    'd3cdc6ce4955a226accf191df1c1a9a2ffda38605f1bece8d76cac9761fe680a',
    1481516::bigint,NULL::integer,NULL::numeric,99.42::numeric,
    '13611844692',
    'cde767c9fac75ac348c2a0224cbedf5cda3b40f83973a1d95a18b4924c249f35',
    'NEEDS_INDEPENDENT_SEMANTIC_QA',
    '{"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml","html_word_recovery"],"candidate_count":0,"reason":"No printed quarter-specific TOF numeric coordinate paired with a TOF label","financial_certified":false}'::jsonb)
  ), verified AS MATERIALIZED (
   SELECT e.*,c.source_url,q.rejection_reason
   FROM expected_cases e
   JOIN public.scpi_metric_certifications c
     ON c.id=e.cert_id AND c.scpi_slug=e.scpi_slug
       AND c.source_period=e.source_period AND c.metric='tof'
       AND c.verification_status LIKE 'invalid%'
       AND c.value_numeric=e.prior_value AND c.source_page IS NOT DISTINCT FROM e.page
   JOIN public.scpi_bulletins b
     ON b.scpi_slug=e.scpi_slug AND b.period=e.source_period
       AND b.source_url=c.source_url AND b.pdf_sha256=e.pdf_sha
       AND b.pdf_path=b.scpi_slug||'/'||b.period||'/'||b.pdf_sha256||'.pdf'
   JOIN storage.objects o
     ON o.bucket_id='scpi-bulletins' AND o.name=b.pdf_path
       AND o.metadata->>'size'=e.pdf_bytes::text
   JOIN maximus_agents.scpi_bulletin_replay_documents d
     ON d.scpi_slug=b.scpi_slug AND d.source_period=b.period
       AND d.pdf_sha256=b.pdf_sha256 AND d.source_url=b.source_url
       AND d.status='extracted' AND d.processing_complete
       AND d.result->>'identity_verified'='true'
       AND d.result->>'period_verified'='true'
   JOIN scpi_internal.tof_policy_quarantine_audit_20261028 q
     ON q.certificate_id=c.id AND q.scpi_slug=c.scpi_slug
       AND q.source_period=c.source_period
   JOIN public.scpi_indicator_history h
     ON h.scpi_slug=e.scpi_slug AND h.source_period=e.source_period
       AND h.source_url=c.source_url AND h.tof IS NULL
       AND h.qa_status LIKE 'invalid%'
   WHERE q.rejection_reason='TOF_ASPIM_FORBIDDEN'
     AND EXISTS (
       SELECT 1 FROM maximus_agents.tasks t
       WHERE t.payload->>'mode'='historical_tof_source_qa'
         AND t.payload->>'scpi_slug'=e.scpi_slug
         AND t.payload->>'source_period'=e.source_period
         AND t.payload->>'pdf_sha256'=e.pdf_sha
         AND t.role='QA' AND t.status='done'
         AND t.result->'evidence'->0->'finding'->>'verified_binary'='true'
         AND t.result->>'financial_certified'='false'
     )
  )
  SELECT count(*) INTO expected FROM verified;
  IF expected<>3 THEN RAISE EXCEPTION 'REC192_SOURCE_OR_QUARANTINE_DRIFT_COUNT_%',expected; END IF;

  WITH evidence(scpi_slug,source_period,cert_id,pdf_sha,pdf_bytes,page,
    candidate,old_value,artifact_id,artifact_json_sha,review_status,geometry) AS (
    VALUES
    ('novapierre-1','2024-T4','3e1056ea-ace0-4359-bce7-b3816cc3e747'::uuid,
      '3296b51f63b420914be88a4004179d40cf3b2f2bdd3baee9cd4d8e4f241f1c54',
      2945576::bigint,4,89.7::numeric,10.3::numeric,'13612802807',
      'ba5056435b47f263a40d4b2f6d7c3cbae2a224ea971ca8874e470cce5c6c050f',
      'BBOX_CANDIDATE_REVIEW',
      '{"page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml"],"pairs":[{"value":89.7,"mupdf_bbox":[77.67,172.02,125.92,188.73],"poppler_bbox":[77.67,172.02,125.92,188.73],"both_near_tof":true},{"value":89.7,"mupdf_bbox":[529.74,154.6,544.73,167.05],"poppler_bbox":[529.74,154.6,544.73,167.05],"both_near_tof":true}],"candidate_count":2,"financial_certified":false}'::jsonb),
    ('novapierre-residentiel','2022-T1','5f35d9e2-715f-4f3f-9ad7-be3f1eda757b'::uuid,
      '6997ac5572b2907f6ab4e3b4d1f8dce08a750e266b1431dc8dbe6dab4a450708',
      1005351::bigint,4,95.3::numeric,97.2::numeric,'13613076061',
      '8f2e5d0b10089904dab609cd4521b9b03833f57d5b6b1c3d79c1a5665c427dcf',
      'BBOX_CANDIDATE_REVIEW',
      '{"page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml","html_word_recovery"],"pairs":[{"value":95.3,"mupdf_bbox":[234.72,237.41,251.84,246.25],"poppler_bbox":[234.72,237.41,251.84,246.25],"both_near_tof":true}],"candidate_count":1,"financial_certified":false}'::jsonb),
    ('cristal-rente','2026-T2','b83dd62d-d2f9-4ad8-a935-70a0ee96d89c'::uuid,
      'd3cdc6ce4955a226accf191df1c1a9a2ffda38605f1bece8d76cac9761fe680a',
      1481516::bigint,NULL::integer,NULL::numeric,99.42::numeric,'13611844692',
      'cde767c9fac75ac348c2a0224cbedf5cda3b40f83973a1d95a18b4924c249f35',
      'NEEDS_INDEPENDENT_SEMANTIC_QA',
      '{"readers":["MuPDF-geometry","Poppler-bbox"],"parse_modes":["strict_xml","html_word_recovery"],"candidate_count":0,"reason":"No identifiable TOF word adjacent to a quarter-specific numeric coordinate","financial_certified":false}'::jsonb)
  )
  INSERT INTO maximus_agents.scpi_tof_candidate_geometry_qa
    (scpi_slug,source_period,certificate_id,source_url,pdf_sha256,pdf_byte_size,
    source_page,candidate_tof_percent,prior_invalid_value,workflow_reference,
    artifact_id,artifact_json_sha256,review_status,policy_rejection_reason,
    paired_geometry)
  SELECT e.scpi_slug,e.source_period,e.cert_id,c.source_url,e.pdf_sha,e.pdf_bytes,
    e.page,e.candidate,e.old_value,'github-actions:42469201587',
    e.artifact_id,e.artifact_json_sha,e.review_status,'TOF_ASPIM_FORBIDDEN',
    e.geometry
  FROM evidence e JOIN public.scpi_metric_certifications c ON c.id=e.cert_id
  ON CONFLICT(scpi_slug,source_period) DO NOTHING;

  SELECT count(*) INTO expected
  FROM maximus_agents.scpi_tof_candidate_geometry_qa
  WHERE workflow_reference='github-actions:42469201587';
  IF expected<>3 THEN RAISE EXCEPTION 'REC192_PERSISTED_PROOF_COUNT_%',expected; END IF;
END;
$record$;

CREATE OR REPLACE VIEW maximus_agents.scpi_tof_candidate_geometry_review_v1
WITH (security_invoker = true) AS
SELECT e.scpi_slug,e.source_period,e.review_status,e.candidate_tof_percent,
  e.prior_invalid_value,e.source_page,e.pdf_sha256,e.workflow_reference,
  e.artifact_id,e.policy_rejection_reason,
  q.still_blocks_strict_pass,s.verification_status AS source_registry_status,
  s.confidence_level AS source_registry_confidence,
  v.crash_test_status,e.financial_certified,e.deploy_allowed,e.inserted_at
FROM maximus_agents.scpi_tof_candidate_geometry_qa e
LEFT JOIN maximus_agents.scpi_historical_tof_quarantine_qa_v1 q
  ON q.scpi_slug=e.scpi_slug AND q.source_period=e.source_period
LEFT JOIN public.scpi_source_registry s ON s.scpi_slug=e.scpi_slug
LEFT JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=e.scpi_slug;
REVOKE ALL ON maximus_agents.scpi_tof_candidate_geometry_review_v1
 FROM PUBLIC,anon,authenticated;
