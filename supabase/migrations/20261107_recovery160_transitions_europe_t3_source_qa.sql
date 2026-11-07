-- RECOVERY-160: Transitions Europe T3 2026 issuer PDF EXISTS.
-- Correct obsolete "not published" task to QA review. Do not certify incomplete
-- valuation metrics or force source_ready/PASS.
DO $rec160$
DECLARE v_url text := 'https://www.arkea-reim.com/upload/docs/application/pdf/2026-10/te_t3-2026.pdf';
  v_sha text := '55f3596af5933891f0e94cf59356491a93931f080543d5c3ee5e8eef89ace1e1';
  v_queue public.scpi_backfill_queue%ROWTYPE;
  v_bulletin public.scpi_bulletins%ROWTYPE;
  v_replay maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
  v_certificate public.scpi_metric_certifications%ROWTYPE;
  v_history public.scpi_indicator_history%ROWTYPE;
  v_changed int;
BEGIN
  SELECT * INTO STRICT v_queue FROM public.scpi_backfill_queue AS q
    WHERE q.id='7a2b446a-a824-4865-883d-774e73813ced'::uuid
    AND q.scpi_slug='transitions-europe' AND q.source_period='2026-T3'
    AND q.source_kind='bulletin' AND q.status='not_published_yet'
    AND q.verification_status='current_period_unpublished'
    AND q.last_error='official_t3_2026_not_yet_published_as_of_2026-10-05'
    AND q.source_url IS NULL FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_registry AS r
    WHERE r.scpi_slug='transitions-europe' AND r.last_document_period='2026-T3'
    AND r.bulletin_url=v_url AND r.verification_status='incomplete'
    AND r.confidence_level='high' AND r.last_error='Extraction existante partielle')
  THEN RAISE EXCEPTION 'REC160_SOURCE_REGISTRY_CHANGED'; END IF;
  SELECT * INTO STRICT v_bulletin FROM public.scpi_bulletins AS b
    WHERE b.id='20ad2db0-f272-4dae-8535-702f7be3d844'::uuid
    AND b.scpi_slug='transitions-europe' AND b.period='2026-T3'
    AND b.source_url=v_url AND b.pdf_sha256=v_sha
    AND b.pdf_path='transitions-europe/2026-T3/'||v_sha||'.pdf'
    AND b.qa_status='auto_partial_review';
  IF NOT EXISTS (SELECT 1 FROM storage.objects AS s WHERE s.bucket_id='scpi-bulletins'
    AND s.name=v_bulletin.pdf_path AND (s.metadata->>'size')::bigint=6300510)
  THEN RAISE EXCEPTION 'REC160_OFFICIAL_ARCHIVE_ABSENT'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors AS c
    WHERE c.scpi_slug='transitions-europe' AND 'www.arkea-reim.com'=ANY(c.allowed_hosts))
  THEN RAISE EXCEPTION 'REC160_UNAPPROVED_ISSUER'; END IF;
  SELECT * INTO STRICT v_replay FROM maximus_agents.scpi_bulletin_replay_documents AS d
    WHERE d.document_key=v_bulletin.id::text AND d.bulletin_id=v_bulletin.id
    AND d.scpi_slug='transitions-europe' AND d.source_period='2026-T3'
    AND d.source_url=v_url AND d.pdf_sha256=v_sha AND d.expected_sha256=v_sha
    AND d.pdf_path=v_bulletin.pdf_path AND d.status='extracted'
    AND d.processing_complete AND d.page_count=27 AND d.pages_read=27
    AND d.field_coverage->>'tof'='verified'
    AND (d.metrics->>'tof')::numeric=97.9
    AND (d.evidence->'tof'->>'page')::integer=8
    AND (d.evidence->'tof'->>'value')::numeric=97.9
    AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
    AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
    AND d.field_coverage->>'prix_souscription'='needs_review'
    AND d.field_coverage->>'prix_reconstitution'='needs_review'
    AND d.field_coverage->>'capitalisation'='needs_review';
  SELECT * INTO STRICT v_certificate FROM public.scpi_metric_certifications AS c
    WHERE c.id='bfc7cafd-db93-45b2-91f1-00804d30b97a'::uuid
    AND c.scpi_slug='transitions-europe' AND c.source_period='2026-T3'
    AND c.metric='tof' AND c.value_numeric=97.9 AND c.source_url=v_url
    AND c.source_page=8 AND c.extraction_confidence>=.95
    AND c.verification_status='auto_verified_with_evidence';
  SELECT * INTO STRICT v_history FROM public.scpi_indicator_history AS h
    WHERE h.id='a122e52d-0cad-437b-802f-694233832711'::uuid
    AND h.scpi_slug='transitions-europe' AND h.source_period='2026-T3'
    AND h.source_url=v_url AND h.tof=97.9 AND h.source_confidence>=.95
    AND h.metric_provenance->'tof'->>'sha256'=v_sha;
  IF scpi_internal.tof_bulletin_source_rejection_reason(
      v_certificate.scpi_slug,v_certificate.source_url,v_certificate.evidence_text,
      v_certificate.verification_method,v_certificate.verification_status) IS NOT NULL
  THEN RAISE EXCEPTION 'REC160_TOF_POLICY_REJECTED'; END IF;
  IF EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 AS q
     WHERE q.scpi_slug='transitions-europe' AND q.source_period='2026-T3')
  THEN RAISE EXCEPTION 'REC160_TOF_QUARANTINE'; END IF;
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
  VALUES('recovery160:transitions-europe:2026-T3:published-but-QA-open',
    'Official 27-page T3 PDF found after stale Oct 5 assumption; TOF 97.9 proof but valuations remain needs_review, no fund PASS',
    jsonb_build_object('backfill_before',to_jsonb(v_queue),'bulletin',to_jsonb(v_bulletin),
      'replay',to_jsonb(v_replay),'tof_certificate',to_jsonb(v_certificate),
      'history',to_jsonb(v_history),'full_certification',false,'human_attestation',false))
  ON CONFLICT(event_key) DO NOTHING;
  UPDATE public.scpi_backfill_queue AS q SET
    status='qa_review',
    verification_status='issuer_pdf_tof_verified_other_fields_pending',
    source_url=v_url,
    source_document='Bulletin T3 2026 Transitions Europe PDF officiel 27 pages, SHA '||v_sha||'; TOF seul validé',
    last_error='Publisher PDF available. TOF 97.9% p8 verified; prix_souscription, prix_reconstitution and capitalisation still need independent QA.',
    updated_at=now()
  WHERE q.id=v_queue.id AND q.status='not_published_yet'
    AND q.verification_status='current_period_unpublished';
  GET DIAGNOSTICS v_changed=ROW_COUNT;
  IF v_changed<>1 THEN RAISE EXCEPTION 'REC160_CONCURRENT_QUEUE_CHANGE'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.scpi_backfill_queue q WHERE q.id=v_queue.id
    AND q.status='qa_review' AND q.source_url=v_url
    AND q.verification_status='issuer_pdf_tof_verified_other_fields_pending')
  THEN RAISE EXCEPTION 'REC160_QUEUE_READBACK_MISMATCH'; END IF;
END $rec160$;