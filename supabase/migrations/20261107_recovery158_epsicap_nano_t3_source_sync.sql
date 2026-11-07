-- RECOVERY-158: Epsicap Nano T3 2026 stale "not published" queue/registry despite
-- verified official issuer PDF original, SHA, page, TOF 97.98, and official annual 2025 SHA.
-- Targeted evidence-based synchronization; no strict view changes or human attestation.
DO $rec158$
DECLARE reg_old public.scpi_source_registry%ROWTYPE;
 queue_old public.scpi_backfill_queue%ROWTYPE;
 bulletin public.scpi_bulletins%ROWTYPE;
 cert public.scpi_metric_certifications%ROWTYPE;
 h public.scpi_indicator_history%ROWTYPE;
 annual2025 public.scpi_annual_reports%ROWTYPE;
 d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 sha text:='1f7efa004028d10758149d0dcd97677dc22ad679cf314768e0d682add4a4b3e7';
 url text:='https://epsicap.fr/app/uploads/2026/11/bulletin-trimestriel-epsicap-nano-t3-2026.pdf';
 n integer;
BEGIN
 SELECT * INTO STRICT reg_old FROM public.scpi_source_registry r
 WHERE r.scpi_slug='epsicap-nano' AND r.verification_status='incomplete'
  AND r.confidence_level='high' AND r.last_document_period='2026-T3'
  AND r.bulletin_url=url
  AND r.annual_report_url='https://epsicap.fr/app/uploads/2026/05/Rapport-annuel-2025-Epsicap-Nano.pdf'
  AND r.last_error='Extraction existante partielle' FOR UPDATE;
 SELECT * INTO STRICT queue_old FROM public.scpi_backfill_queue q
 WHERE q.scpi_slug='epsicap-nano' AND q.source_period='2026-T3' AND q.source_kind='bulletin'
  AND q.status='not_applicable' AND q.verification_status='official_not_yet_published'
  AND q.last_error LIKE 'Official Epsicap Nano documentation currently lists latest bulletin as 2T 2026'
 FOR UPDATE;
 SELECT * INTO STRICT bulletin FROM public.scpi_bulletins b
 WHERE b.id='2fd87718-cd56-42d2-944d-c6acbf59113a'::uuid
  AND b.scpi_slug='epsicap-nano' AND b.period='2026-T3'
  AND b.source_url=url AND b.pdf_sha256=sha
  AND b.pdf_path='epsicap-nano/2026-T3/'||sha||'.pdf';
 IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
 AND o.name=bulletin.pdf_path AND (o.metadata->>'size')::bigint=2993073)
 THEN RAISE EXCEPTION 'EPSICAP_T3_OFFICIAL_ARCHIVE_ABSENT'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors c
 WHERE c.scpi_slug='epsicap-nano' AND 'epsicap.fr'=ANY(c.allowed_hosts))
 THEN RAISE EXCEPTION 'EPSICAP_T3_PUBLISHER_NOT_APPROVED'; END IF;
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents x
 WHERE x.bulletin_id=bulletin.id AND x.scpi_slug='epsicap-nano'
  AND x.source_period='2026-T3' AND x.source_url=url
  AND x.pdf_sha256=sha AND x.expected_sha256=sha
  AND x.processing_complete=true AND x.status='extracted'
  AND x.pages_read=x.page_count AND x.page_count=11
  AND x.field_coverage->>'tof'='verified'
  AND (x.metrics->>'tof')::numeric=97.98
  AND (x.evidence->'tof'->>'value')::numeric=97.98
  AND (x.evidence->'tof'->>'page')::int=5
  AND x.evidence->'tof'->>'method'='dual_pdf_geometry'
  AND x.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
 SELECT * INTO STRICT cert FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug='epsicap-nano' AND c.source_period='2026-T3'
 AND c.metric='tof' AND c.value_numeric=97.98
 AND c.source_url=url AND c.source_page=5
 AND c.bulletin_id=bulletin.id
 AND c.verification_status='auto_verified_with_evidence'
 AND c.extraction_confidence>=.95;
 IF scpi_internal.tof_bulletin_source_rejection_reason(
  cert.scpi_slug,cert.source_url,cert.evidence_text,cert.verification_method,cert.verification_status) IS NOT NULL
 THEN RAISE EXCEPTION 'EPSICAP_TOF_POLICY_REJECTED'; END IF;
 SELECT * INTO STRICT h FROM public.scpi_indicator_history hi
 WHERE hi.scpi_slug='epsicap-nano' AND hi.source_period='2026-T3'
 AND hi.tof=97.98 AND hi.source_url=url AND hi.source_confidence>=.95
 AND hi.qa_status='source_verified_dual_reader_tof'
 AND hi.metric_provenance->'tof'->>'sha256'=sha;
 SELECT * INTO STRICT annual2025 FROM public.scpi_annual_reports a
 WHERE a.scpi_slug='epsicap-nano' AND a.fiscal_year=2025
 AND a.qa_status='source_verified_content'
 AND a.source_url=reg_old.annual_report_url AND a.extraction_confidence>=.95
 AND a.source_sha256='ee009c0d3dddcb7bf5866626bde116fbf986ef72a855f507373b99bf741e7863';
 IF EXISTS(SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
  WHERE q.scpi_slug='epsicap-nano' AND q.source_period='2026-T3')
 THEN RAISE EXCEPTION 'EPSICAP_TOF_QUARANTINE_NOT_REVIEWED'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery158:epsicap-nano:2026-T3:source-queue-readback',
  'Legacy 2026-T3 not-published assumption contradicted by verified 11-page publisher PDF and independent TOF 97.98%; registry source readiness synchronized without modifying any financial value or universal QA policy',
  jsonb_build_object('before_source_registry',to_jsonb(reg_old),'before_backfill_queue',to_jsonb(queue_old),
   'issuer_original',to_jsonb(bulletin),'replay_original',to_jsonb(d),
   'tof_certificate',to_jsonb(cert),'history_verified',to_jsonb(h),
   'annual_2025',to_jsonb(annual2025),
   'human_attestation',false,'all_financial_fields_certified',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_backfill_queue q SET
  source_url=url,source_document='Bulletin officiel Epsicap Nano T3 2026 PDF 11p SHA '||sha,
  status='already_loaded',verification_status='dual_pdf_page_evidence_verified',
  last_error=NULL,updated_at=now()
 WHERE q.id=queue_old.id AND q.status='not_applicable'
 AND q.verification_status='official_not_yet_published';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'EPSICAP_QUEUE_UPDATE_NOT_SINGLE'; END IF;
 UPDATE public.scpi_source_registry r SET
  verification_status='verified',last_error=NULL,
  last_verified_at=now(),last_success_at=now(),updated_at=now()
 WHERE r.id=reg_old.id AND r.scpi_slug='epsicap-nano'
  AND r.verification_status='incomplete' AND r.confidence_level='high'
  AND r.last_document_period='2026-T3' AND r.bulletin_url=url;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'EPSICAP_REGISTRY_UPDATE_NOT_SINGLE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_registry r
   WHERE r.id=reg_old.id AND r.verification_status='verified'
   AND r.confidence_level='high' AND r.last_error IS NULL
   AND r.bulletin_url=reg_old.bulletin_url AND r.annual_report_url=reg_old.annual_report_url)
 THEN RAISE EXCEPTION 'EPSICAP_SOURCE_READBACK_MISMATCH'; END IF;
END $rec158$;