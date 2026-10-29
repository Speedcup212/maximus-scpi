-- Source-of-truth repair: 3 prior Patrimmo Commerce TOF certificates cited
-- later-issued 2026-T2 historical tables. Their own 2025-T3, 2025-T4,
-- 2026-T1 PDFs have now been downloaded, checked page-by-page by independent
-- MuPDF+Poppler and show exactly the same TOF, page 4.
-- Never certify other financial fields from this operation.
DO $repair$
DECLARE v record; d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 c public.scpi_metric_certifications%ROWTYPE; b public.scpi_bulletins%ROWTYPE;
 original_url text:='https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo+Commerce_T2_2026_VDEF+%281%29.pdf/99ff97ba-a933-030e-da41-1ab9f47c97cb?t=1786019920553';
 k text; snapshot jsonb;
BEGIN
 FOR v IN SELECT * FROM (VALUES
   ('2025-T3'::text,92.3::numeric,'2025-09-30'::text),
   ('2025-T4'::text,91.5::numeric,'2025-12-31'::text),
   ('2026-T1'::text,91.0::numeric,'2026-03-31'::text)
 ) x(source_period,expected_tof,source_date)
 LOOP
  SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents
   WHERE scpi_slug='patrimmo-commerce' AND source_period=v.source_period
    AND result->'discovery'->>'method'='indexed_official_praemia_reim_quarterly_pdf';
  IF d.status<>'extracted' OR d.processing_complete IS DISTINCT FROM true
      OR d.result->>'identity_verified'<>'true'
      OR d.result->>'period_verified'<>'true'
      OR d.field_coverage->>'tof'<>'verified'
      OR d.metrics->>'tof' IS NULL OR (d.metrics->>'tof')::numeric<>v.expected_tof
      OR (d.evidence->'tof'->>'value')::numeric<>v.expected_tof
      OR d.evidence->'tof'->>'reference_date'<>v.source_date
      OR (d.evidence->'tof'->>'page')::integer<>4
      OR d.evidence->'tof'->>'value_match'<>'true'
      OR d.evidence->'tof'->'independent_engines' <> '["MuPDF","Poppler"]'::jsonb
      OR d.pdf_sha256 !~ '^[0-9a-f]{64}$'
      OR NOT public.scpi_bulletin_replay_source_trusted('patrimmo-commerce',d.source_url)
  THEN RAISE EXCEPTION 'Exact publisher dual-reader TOF cannot be certified for %',v.source_period; END IF;

  SELECT * INTO STRICT c FROM public.scpi_metric_certifications
   WHERE scpi_slug='patrimmo-commerce' AND source_period=v.source_period AND metric='tof'
   FOR UPDATE;
  IF c.source_url=d.source_url AND c.verification_method='dual_pdf_geometry_exact_issuer_period'
  THEN CONTINUE; END IF;
  IF c.value_numeric<>v.expected_tof
      OR c.source_url<>original_url OR c.verification_status<>'historical_lineage_verified_official'
  THEN RAISE EXCEPTION 'Old TOF certification not as expected for %',v.source_period; END IF;

  IF v.source_period='2026-T1' THEN
    SELECT * INTO STRICT b FROM public.scpi_bulletins
     WHERE scpi_slug='patrimmo-commerce' AND period=v.source_period FOR UPDATE;
    IF b.source_url<>original_url OR b.pdf_sha256 IS NOT NULL THEN
      RAISE EXCEPTION 'Legacy 2026-T1 registered source differs; cannot reassign safely';
    END IF;
  ELSIF d.bulletin_id IS NULL THEN
    RAISE EXCEPTION 'Exact official bulletin not registered for %',v.source_period;
  END IF;

  k:='patrimmo-exact-tof-repaired-'||v.source_period;
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
  VALUES(k,'Replace later-edition historical TOF citation with issuer PDF from exact quarter',
    jsonb_build_object('old_certification',to_jsonb(c),'exact_quarter_pdf',
      jsonb_build_object('url',d.source_url,'sha256',d.pdf_sha256,'period',d.source_period,
      'page',4,'proof',d.evidence->'tof'),'old_registered_bulletin',
      CASE WHEN v.source_period='2026-T1' THEN to_jsonb(b) ELSE NULL END))
  ON CONFLICT(event_key) DO NOTHING;

  IF v.source_period='2026-T1' THEN
    -- Preserve the old replay record with its wrong T2 source for audit; it
    -- must never be claimed again or be mistaken for this period's PDF.
    UPDATE maximus_agents.scpi_bulletin_replay_documents q
      SET status='source_period_mismatch',origin='quarantined_reference',
          bulletin_id=NULL,expected_sha256=NULL,financial_complete=false,
          next_try_at='infinity'::timestamptz,updated_at=now(),
          result=q.result||jsonb_build_object('issuer_period_rejected','2026-T2',
            'audit_event',k)
    WHERE document_key=b.id::text AND q.source_url=original_url
          AND q.scpi_slug='patrimmo-commerce' AND q.source_period='2026-T1';
    UPDATE public.scpi_bulletins
      SET source_url=d.source_url,pdf_sha256=d.pdf_sha256,pdf_path=d.pdf_path,
          qa_status='auto_partial_review',processed_at=now(),
          extraction_json=jsonb_build_object('source_provenance_repaired',
             jsonb_build_object('audit_event',k,'status','exact_pdf_read_other_fields_pending'))
    WHERE id=b.id;
    UPDATE maximus_agents.scpi_bulletin_replay_documents
      SET bulletin_id=b.id,updated_at=now()
    WHERE document_key=d.document_key;
  END IF;

  UPDATE public.scpi_metric_certifications
   SET source_url=d.source_url,source_page=4,
      bulletin_id=CASE WHEN v.source_period='2026-T1' THEN b.id ELSE d.bulletin_id END,
      evidence_text='PDF émetteur original '||v.source_period||' p. 4 : '||
        (d.evidence->'tof'->>'text')||' ; MuPDF et Poppler concordants ; SHA256 '||d.pdf_sha256,
      verification_status='auto_verified_with_evidence',
      verification_method='dual_pdf_geometry_exact_issuer_period',
      extraction_confidence=1,
      verified_at=now()
   WHERE id=c.id;

  UPDATE public.scpi_indicator_history h
    SET metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)
         ||jsonb_build_object('tof',jsonb_build_object(
          'status','verified_exact_quarter_issuer_pdf','period',v.source_period,
          'source_url',d.source_url,'page',4,'sha256',d.pdf_sha256,
          'reference_date',v.source_date,'audit_event',k))
    WHERE h.scpi_slug='patrimmo-commerce' AND h.source_period=v.source_period
      AND h.tof=v.expected_tof;

  UPDATE public.scpi_backfill_queue
    SET verification_status='issuer_tof_exact_quarter_verified_other_fields_review',
        last_error='TOF recoupé sur bulletin officiel exact p. 4 avec deux moteurs ; les autres indicateurs restent en revue.',
        updated_at=now()
    WHERE scpi_slug='patrimmo-commerce' AND source_period=v.source_period
      AND source_kind='bulletin' AND status='qa_review'
      AND verification_status='exact_publisher_bulletin_pending_replay';
 END LOOP;
END $repair$;