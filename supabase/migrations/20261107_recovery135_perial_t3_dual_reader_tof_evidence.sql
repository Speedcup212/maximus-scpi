-- RECOVERY-135: exact financial-field correction from re-fetched original.
-- Evidence: GitHub Actions run 42375137331, artifact 13575571808.
-- Both independent readers (MuPDF and Poppler) confirmed issuer, T3 2026,
-- SHA-256 and TOF 84.7% on PDF page 6. A separate visual review of that
-- same archived page confirmed the number and "Taux d'Occupation Financier".
-- This is automated dual-PDF evidence, NOT a fabricated human verification.
-- No change to unrelated values, source references or other SCPI periods.
DO $recovery135$
DECLARE
  h public.scpi_indicator_history%ROWTYPE;
  c public.scpi_metric_certifications%ROWTYPE;
  b public.scpi_bulletins%ROWTYPE;
  live public.scpi_indicators%ROWTYPE;
  k integer;
  proof jsonb;
BEGIN
  SELECT * INTO STRICT h FROM public.scpi_indicator_history
   WHERE id='8d7ae55b-b1e2-4cd1-89ca-85d9ebc47abd'::uuid
     AND scpi_slug='perial-grand-paris' AND source_period='2026-T3'
     AND tof IS NULL AND qa_status='auto_partial_review_tof_certificate_conflict';

  SELECT * INTO STRICT c FROM public.scpi_metric_certifications
   WHERE id='32aea6e3-2194-414e-a2f2-7348e3738fe6'::uuid
     AND scpi_slug=h.scpi_slug AND source_period=h.source_period
     AND metric='tof' AND value_numeric=84.7 AND source_page=6
     AND verification_status='auto_verified_with_evidence'
     AND source_url=h.source_url
     AND evidence_text ILIKE '%occupation financière 84,7 %'
     AND extraction_confidence BETWEEN 0.90 AND 0.95;

  SELECT * INTO STRICT b FROM public.scpi_bulletins
   WHERE scpi_slug=h.scpi_slug AND period=h.source_period
     AND source_url=h.source_url
     AND pdf_sha256='e9205e1d300724742c6189fdd49a5787e7e5857a5eee040a9f701ac8f2a5f8b1';

  SELECT * INTO STRICT live FROM public.scpi_indicators
   WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period
     AND tof=84.7;

  proof:=jsonb_build_object(
    'document_period','2026-T3',
    'reference_date','2026-09-30',
    'source_url',c.source_url,
    'source_page',6,
    'sha256',b.pdf_sha256,
    'value',84.7,'unit','%',
    'independent_engines',jsonb_build_array('MuPDF','Poppler'),
    'verification_type','automated_binary_page_and_visual_crosscheck',
    'verification_run','github-actions:42375137331',
    'verification_artifact','13575571808',
    'financial_human_signoff',false);

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
    (event_key,reason,snapshot)
  VALUES
    ('recovery135:perial-grand-paris-2026-T3-tof-dual-pdf',
     'Exact issuer SHA+PDF page6 confirmed TOF=84.7 via MuPDF and Poppler, visual review; old history 100 preserved in recovery134 snapshot; no manual human certification.',
     jsonb_build_object('old_history',to_jsonb(h),'old_certificate',to_jsonb(c),
                        'old_live',to_jsonb(live),'bulletin',to_jsonb(b),
                        'new_proof',proof))
  ON CONFLICT (event_key) DO NOTHING;

  UPDATE public.scpi_metric_certifications cert
  SET verification_method='pdf_page_text_match_dual_mupdf_poppler',
      extraction_confidence=0.98,
      evidence_text=cert.evidence_text ||
        E'\nRECOVERY-135: original issuer PDF binary SHA256=' ||
        b.pdf_sha256 ||
        '; page 6: L''occupation financière 84,7% / Taux d''Occupation Financier (TOF). Verified by MuPDF and Poppler, GitHub Actions 42375137331, evidence artifact 13575571808. Automated double-read, NO human-signoff.'
  WHERE cert.id=c.id AND cert.value_numeric=84.7
    AND cert.verification_status='auto_verified_with_evidence'
    AND cert.extraction_confidence BETWEEN 0.90 AND 0.95;
  GET DIAGNOSTICS k=ROW_COUNT;
  IF k<>1 THEN RAISE EXCEPTION 'PERIAL_CERTIFICATE_UPDATE_EXPECTED_1_GOT_%',k; END IF;

  UPDATE public.scpi_indicator_history hist
  SET tof=84.7,
      qa_status='auto_verified_dual_pdf_evidence',
      source_confidence=0.98,
      metric_provenance=jsonb_set(coalesce(hist.metric_provenance,'{}'::jsonb),
        '{tof}',proof,true)
  WHERE hist.id=h.id AND hist.tof IS NULL
    AND hist.qa_status='auto_partial_review_tof_certificate_conflict'
    AND hist.source_url=c.source_url;
  GET DIAGNOSTICS k=ROW_COUNT;
  IF k<>1 THEN RAISE EXCEPTION 'PERIAL_HISTORY_UPDATE_EXPECTED_1_GOT_%',k; END IF;

  UPDATE public.scpi_indicators i
  SET metric_provenance=jsonb_set(coalesce(i.metric_provenance,'{}'::jsonb),
      '{tof}',proof,true)
  WHERE i.scpi_slug=live.scpi_slug AND i.source_period=live.source_period
    AND i.tof=84.7;
  GET DIAGNOSTICS k=ROW_COUNT;
  IF k<>1 THEN RAISE EXCEPTION 'PERIAL_LIVE_PROVENANCE_EXPECTED_1_GOT_%',k; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_indicator_history hist
    JOIN public.scpi_metric_certifications cert
      ON cert.scpi_slug=hist.scpi_slug
      AND cert.source_period=hist.source_period AND cert.metric='tof'
    WHERE hist.id=h.id AND hist.tof=84.7
      AND hist.qa_status='auto_verified_dual_pdf_evidence'
      AND hist.metric_provenance->'tof'->>'sha256'=b.pdf_sha256
      AND cert.id=c.id AND cert.value_numeric=hist.tof
      AND cert.extraction_confidence>=0.95
      AND cert.verification_status='auto_verified_with_evidence'
  ) THEN RAISE EXCEPTION 'PERIAL_DUAL_PDF_POSTCONDITION_FAILED'; END IF;
END
$recovery135$;
