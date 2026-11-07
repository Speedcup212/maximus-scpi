-- RECOVERY-162 — Source-bound reconciliation of seven CORUM original-bulletin TOF queue blockers.
-- These 7 historical queue rows predate actual issuer PDF independent double-reader evidence.
-- Do not change any metric, certificate, source registry, audit doctrine, or finance QA.
-- Seven explicit source periods only; other QA-requiring periods stay blocked.
DO $rec162$
DECLARE tgt record;
 v_q public.scpi_backfill_queue%ROWTYPE;
 v_b public.scpi_bulletins%ROWTYPE;
 v_h public.scpi_indicator_history%ROWTYPE;
 v_c public.scpi_metric_certifications%ROWTYPE;
 v_d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 v_count int:=0;
 v_updated int;
BEGIN
 FOR tgt IN SELECT * FROM (VALUES
  ('corum-origin','2017-T4'),('corum-origin','2018-T1'),
  ('corum-origin','2018-T2'),('corum-origin','2020-T1'),
  ('corum-xl','2018-T1'),('corum-xl','2018-T2'),('corum-xl','2020-T1')
 ) AS a(slug,period)
 LOOP
  SELECT * INTO STRICT v_q FROM public.scpi_backfill_queue q
  WHERE q.scpi_slug=tgt.slug AND q.source_period=tgt.period
  AND q.source_kind='bulletin' AND q.status='qa_review'
  AND q.verification_status='needs_review'
  AND q.last_error='["missing_core:tof"]'
  AND q.source_url LIKE 'https://www.corum.fr/%'
  FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_registry r WHERE r.scpi_slug=tgt.slug
    AND r.verification_status='verified' AND r.confidence_level='high')
  THEN RAISE EXCEPTION 'REC162_REGISTRY_NOT_READY_%_%',tgt.slug,tgt.period; END IF;
  SELECT * INTO STRICT v_b FROM public.scpi_bulletins b
  WHERE b.scpi_slug=tgt.slug AND b.period=tgt.period AND b.source_url=v_q.source_url
  AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'
  AND b.pdf_path=tgt.slug||'/'||tgt.period||'/'||b.pdf_sha256||'.pdf'
  AND b.qa_status='auto_partial_review';
  IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
   AND o.name=v_b.pdf_path AND (o.metadata->>'size')::bigint>100000)
  THEN RAISE EXCEPTION 'REC162_OFFICIAL_PDF_NOT_ARCHIVED_%_%',tgt.slug,tgt.period;END IF;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors src
   WHERE src.scpi_slug=tgt.slug AND 'www.corum.fr'=ANY(src.allowed_hosts))
  THEN RAISE EXCEPTION 'REC162_ISSUER_DOMAIN_UNAPPROVED_%',tgt.slug; END IF;
  IF EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
  WHERE q.scpi_slug=tgt.slug AND q.source_period=tgt.period)
  THEN RAISE EXCEPTION 'REC162_HISTORICAL_QUARANTINE_%_%',tgt.slug,tgt.period;END IF;
  SELECT * INTO STRICT v_h FROM public.scpi_indicator_history h
  WHERE h.scpi_slug=tgt.slug AND h.source_period=tgt.period
  AND h.source_url=v_b.source_url AND h.tof BETWEEN 50 AND 100
  AND h.source_confidence>=0.95
  AND h.qa_status='auto_verified_dual_pdf_fields'
  AND h.metric_provenance->'tof'->>'sha256'=v_b.pdf_sha256
  AND h.metric_provenance->'tof'->>'source_url'=v_b.source_url
  AND h.metric_provenance->'tof'->>'document_period'=tgt.period;
  SELECT * INTO STRICT v_c FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug=tgt.slug AND c.source_period=tgt.period
  AND c.metric='tof' AND c.value_numeric=v_h.tof
  AND c.source_url=v_b.source_url AND c.bulletin_id=v_b.id
  AND c.source_page>0 AND c.extraction_confidence>=0.95
  AND c.verification_status IN('auto_verified_with_evidence','manual_verified_official_pdf_text_review');
  IF scpi_internal.tof_bulletin_source_rejection_reason(
   v_c.scpi_slug,v_c.source_url,v_c.evidence_text,
   v_c.verification_method,v_c.verification_status) IS NOT NULL
  THEN RAISE EXCEPTION 'REC162_FORBIDDEN_TOF_SOURCE_%_%',tgt.slug,tgt.period;END IF;
  SELECT * INTO STRICT v_d FROM maximus_agents.scpi_bulletin_replay_documents d
  WHERE d.bulletin_id=v_b.id AND d.scpi_slug=tgt.slug AND d.source_period=tgt.period
  AND d.source_url=v_b.source_url AND d.pdf_path=v_b.pdf_path
  AND d.pdf_sha256=v_b.pdf_sha256 AND d.expected_sha256=v_b.pdf_sha256
  AND d.processing_complete AND d.status='extracted'
  AND d.page_count>0 AND d.pages_read=d.page_count
  AND d.field_coverage->>'tof'='verified'
  AND (d.metrics->>'tof')::numeric=v_h.tof
  AND (d.evidence->'tof'->>'value')::numeric=v_h.tof
  AND (d.evidence->'tof'->>'page')::int=v_c.source_page
  AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
  AND d.evidence->'tof'->>'definition'='reported_metric'
  AND d.evidence->'tof'->>'value_match'='true'
  AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
  VALUES('recovery162:'||tgt.slug||':'||tgt.period||':issuer-tof-queue-reconcile',
   'Previously missing sole core TOF now verified from same archived issuer original by MuPDF and Poppler, with exact history/certificate/page/period/hash. Overall bulletin may remain partial; no human QA added.',
   jsonb_build_object('queue_before',to_jsonb(v_q),'issuer_bulletin',to_jsonb(v_b),
     'history',to_jsonb(v_h),'tof_certificate',to_jsonb(v_c),
     'independent_pdf_replay',to_jsonb(v_d),'human_attestation',false,
     'bulletin_other_fields_fully_certified',false))
  ON CONFLICT(event_key) DO NOTHING;
  UPDATE public.scpi_backfill_queue q SET
   status='already_loaded',
   verification_status='issuer_tof_dual_read_reconciled_other_fields_not_certified',
   last_error=NULL,
   source_document='Historical CORUM issuer PDF, 2 independent parsers, TOF confirmed p'||v_c.source_page||'; original SHA '||v_b.pdf_sha256||'; other metrics retain original QA',
   updated_at=now()
  WHERE q.id=v_q.id AND q.status='qa_review' AND q.last_error='["missing_core:tof"]'
  AND q.source_url=v_b.source_url;
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated<>1 THEN RAISE EXCEPTION 'REC162_CONCURRENT_QUEUE_CHANGE_%_%',tgt.slug,tgt.period; END IF;
  v_count:=v_count+v_updated;
 END LOOP;
 IF v_count<>7 THEN RAISE EXCEPTION 'REC162_EXACTLY_7_EXPECTED_GOT_%',v_count;END IF;
END $rec162$;