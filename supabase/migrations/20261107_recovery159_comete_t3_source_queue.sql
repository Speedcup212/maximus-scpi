-- RECOVERY-159 — Comète 2026-T3: historical "unpublished" queue entry is stale.
-- Official publisher PDF in private archive, 11/11 pages MuPDF and Poppler original.
-- Source evidence is already present; change only the stale backfill task.
-- No changes to any financial metric, source confidence, or strict policy.
DO $recovery159$
DECLARE old_q public.scpi_backfill_queue%ROWTYPE;
  registry_row public.scpi_source_registry%ROWTYPE;
  bulletin_row public.scpi_bulletins%ROWTYPE;
  historical_row public.scpi_indicator_history%ROWTYPE;
  certificate_row public.scpi_metric_certifications%ROWTYPE;
  replay_row maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
  original_sha text := 'f6e35cd7da58404eab0ea262859a9f3a4e5b086d9fb9e4b13aa3fe883ee1ceac';
  original_url text := 'https://alderan.fr/wp-content/uploads/2026/11/BTI-T3-2026-Comete.pdf';
  changed integer;
BEGIN
  SELECT * INTO STRICT old_q FROM public.scpi_backfill_queue q
    WHERE q.id='7a3d69ec-8631-4f5f-818d-4164f19ae9b2'::uuid
      AND q.scpi_slug='comete' AND q.source_period='2026-T3'
      AND q.source_kind='bulletin' AND q.status='not_published_yet'
      AND q.verification_status='current_period_unpublished'
      AND q.last_error='official_t3_2026_not_yet_published_as_of_2026-10-05'
      AND q.source_url IS NULL
    FOR UPDATE;
  SELECT * INTO STRICT registry_row FROM public.scpi_source_registry r
    WHERE r.scpi_slug='comete' AND r.last_document_period='2026-T3'
      AND r.bulletin_url=original_url AND r.verification_status='verified'
      AND r.confidence_level='high' AND r.last_error IS NULL;
  SELECT * INTO STRICT bulletin_row FROM public.scpi_bulletins b
    WHERE b.id='92ebe3d5-0e9d-4c26-b771-ae816be4f9f7'::uuid
      AND b.scpi_slug='comete' AND b.period='2026-T3'
      AND b.source_url=original_url AND b.qa_status='auto_verified'
      AND b.pdf_sha256=original_sha
      AND b.pdf_path='comete/2026-T3/'||original_sha||'.pdf';
  IF NOT EXISTS (SELECT 1 FROM storage.objects o
      WHERE o.bucket_id='scpi-bulletins' AND o.name=bulletin_row.pdf_path
      AND (o.metadata->>'size')::bigint=5130656)
    THEN RAISE EXCEPTION 'REC159_OFFICIAL_ARCHIVE_MISSING_OR_WRONG_SIZE'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors co
      WHERE co.scpi_slug='comete' AND 'alderan.fr'=ANY(co.allowed_hosts))
    THEN RAISE EXCEPTION 'REC159_ISSUER_HOST_UNAPPROVED'; END IF;
  SELECT * INTO STRICT historical_row FROM public.scpi_indicator_history h
      WHERE h.id='fd0bb50e-001e-4b11-8817-50822ca7a2cd'::uuid
        AND h.scpi_slug='comete' AND h.source_period='2026-T3'
        AND h.qa_status='auto_verified_dual_pdf_fields'
        AND h.source_confidence>=0.95 AND h.source_url=original_url
        AND h.tof=99.5 AND h.metric_provenance->'tof'->>'sha256'=original_sha
        AND h.metric_provenance->'tof'->>'reference_date'='2026-09-30';
  SELECT * INTO STRICT certificate_row FROM public.scpi_metric_certifications c
      WHERE c.id='eb2d66f3-dbe9-4ca0-ab31-f375ea62fbed'::uuid
        AND c.scpi_slug='comete' AND c.source_period='2026-T3'
        AND c.metric='tof' AND c.value_numeric=99.5
        AND c.bulletin_id=bulletin_row.id AND c.source_url=original_url
        AND c.source_page=6 AND c.verification_status='auto_verified_with_evidence'
        AND c.extraction_confidence>=0.95;
  SELECT * INTO STRICT replay_row FROM maximus_agents.scpi_bulletin_replay_documents d
      WHERE d.document_key='92ebe3d5-0e9d-4c26-b771-ae816be4f9f7'
        AND d.bulletin_id=bulletin_row.id AND d.scpi_slug='comete'
        AND d.source_period='2026-T3'
        AND d.source_url=original_url AND d.pdf_path=bulletin_row.pdf_path
        AND d.pdf_sha256=original_sha AND d.expected_sha256=original_sha
        AND d.status='extracted' AND d.processing_complete
        AND d.page_count=11 AND d.pages_read=d.page_count
        AND d.field_coverage->>'tof'='verified'
        AND (d.metrics->>'tof')::numeric=99.5
        AND (d.evidence->'tof'->>'value')::numeric=99.5
        AND (d.evidence->'tof'->>'page')::integer=6
        AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
        AND d.evidence->'tof'->>'association'='same_line'
        AND d.evidence->'tof'->>'value_match'='true'
        AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
  IF scpi_internal.tof_bulletin_source_rejection_reason(
       certificate_row.scpi_slug,certificate_row.source_url,
       certificate_row.evidence_text,certificate_row.verification_method,
       certificate_row.verification_status) IS NOT NULL
    THEN RAISE EXCEPTION 'REC159_POLICY_REJECTED_TOF'; END IF;
  IF EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
      WHERE a.scpi_slug='comete' AND a.source_period='2026-T3')
    THEN RAISE EXCEPTION 'REC159_QUARANTINE_NOT_CLEARED'; END IF;
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
    VALUES ('recovery159:comete:2026-T3:stale-unpublished-queue',
       'Source-bound correction of stale 2026-10-05 not-published assumption; PDF published November 2026 and authenticated by existing dual-reader replay',
       jsonb_build_object('backfill_before',to_jsonb(old_q),
         'source_registry',to_jsonb(registry_row),
         'original_bulletin',to_jsonb(bulletin_row),
         'tof_history',to_jsonb(historical_row),
         'tof_certificate',to_jsonb(certificate_row),
         'dual_pdf_replay',to_jsonb(replay_row),
         'human_attestation',false,'financially_complete',false))
    ON CONFLICT (event_key) DO NOTHING;
  UPDATE public.scpi_backfill_queue q SET
      source_url=original_url,
      source_document='Bulletin officiel Comète T3 2026 — PDF 11 pages, SHA256 '||original_sha,
      status='already_loaded',
      verification_status='dual_pdf_page_evidence_verified',
      last_error=NULL,
      updated_at=now()
   WHERE q.id=old_q.id AND q.status='not_published_yet'
      AND q.verification_status='current_period_unpublished'
      AND q.source_url IS NULL;
  GET DIAGNOSTICS changed=ROW_COUNT;
  IF changed<>1 THEN RAISE EXCEPTION 'REC159_QUEUE_CONCURRENT_CHANGE'; END IF;
  IF NOT EXISTS (
      SELECT 1 FROM public.scpi_backfill_queue q
      WHERE q.id=old_q.id AND q.status='already_loaded'
        AND q.verification_status='dual_pdf_page_evidence_verified'
        AND q.source_url=original_url AND q.last_error IS NULL)
    THEN RAISE EXCEPTION 'REC159_QUEUE_READBACK_FAILED'; END IF;
END $recovery159$;