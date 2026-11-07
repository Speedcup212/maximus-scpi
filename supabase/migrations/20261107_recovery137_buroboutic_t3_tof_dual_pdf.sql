-- RECOVERY-137 — correction exact-issuer PDF / dual-reader / page 4.
-- Original bulletin: Buroboutic Metropoles, T3 2026.
-- SHA256 5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d
-- GitHub Actions source run: 42377472006, binary evidence archive 13575957579.
-- PDF visual page 4/6: T3 2026 TOF 91.37%; T2 2026 TOF 91.56%;
-- 0.07% describes the T3 "locaux vacants en restructuration" subcomponent.
-- No human manual certification forged. No live T2 SCPI index mixed with T3.
DO $recovery137$
DECLARE
  h public.scpi_indicator_history%ROWTYPE;
  c public.scpi_metric_certifications%ROWTYPE;
  b public.scpi_bulletins%ROWTYPE;
  k integer;
  proof jsonb;
BEGIN
  SELECT * INTO STRICT h
  FROM public.scpi_indicator_history
  WHERE id='2f9ace9b-cdff-412c-b050-6d59eda108a7'::uuid
    AND scpi_slug='buroboutic-metropoles'
    AND source_period='2026-T3' AND tof IS NULL
    AND qa_status='auto_partial_review'
    AND source_confidence=0.98;

  SELECT * INTO STRICT c
  FROM public.scpi_metric_certifications
  WHERE id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
    AND scpi_slug=h.scpi_slug AND source_period=h.source_period
    AND metric='tof' AND value_numeric=0.07 AND source_page=4
    AND verification_status='invalid_tof_bulletin_source_policy'
    AND verification_method='blocked_TOF_VACANCY_SUBCOMPONENT_NOT_TOTAL'
    AND extraction_confidence=0
    AND source_url=h.source_url
    AND evidence_text ILIKE '%Locaux vacants en restructuration%'
    AND evidence_text ILIKE '%0,07%';

  SELECT * INTO STRICT b
  FROM public.scpi_bulletins
  WHERE scpi_slug=h.scpi_slug AND period=h.source_period
    AND source_url=h.source_url
    AND pdf_sha256='5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d';

  IF h.source_url<>'https://www.fiducial-gerance.fr/content/download/544/12625?version=14'
    OR scpi_internal.tof_bulletin_source_rejection_reason(
       h.scpi_slug,h.source_url,
       'Bulletin original trimestriel 2026 T3. Taux d''Occupation Financier 91,37 % page 4.',
       'pdf_page_text_match_dual_mupdf_poppler','auto_verified_with_evidence') IS NOT NULL
  THEN RAISE EXCEPTION 'BUROBOUTIC_ISSUER_SOURCE_POLICY_NOT_SATISFIED'; END IF;

  proof:=jsonb_build_object(
    'source_url',h.source_url,
    'pdf_sha256',b.pdf_sha256,
    'sha256',b.pdf_sha256,
    'source_page',4,
    'document_period','2026-T3',
    'reference_date','2026-09-30',
    'unit','%',
    'value',91.37,
    'definition','reported_taux_occupation_financier',
    'readers',jsonb_build_array('MuPDF','Poppler'),
    'independent_engines',jsonb_build_array('MuPDF','Poppler'),
    'verification_type','automated_binary_page_and_visual_crosscheck',
    'verification_run','github-actions:42377472006',
    'verification_artifact','13575957579',
    'official_redirect_path','/content/download/544/file/BTI%20Buroboutic%20T3%202026%20WEB.pdf',
    'financial_human_signoff',false);

  -- Preserve the original 0.07% false certificate and missing TOF history
  -- as immutable snapshots. No fabricated "manual_verified" state.
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
    (event_key,reason,snapshot)
  VALUES (
    'recovery137:buroboutic-2026-T3-tof-91.37-original-issuer',
    'Correct false 0.07 percent vacancy subcategory to true T3 TOF 91.37 percent. Verified original PDF SHA, page 4 and two independent readers. Original rows preserved.',
    jsonb_build_object('old_history',to_jsonb(h),
                       'old_certificate',to_jsonb(c),
                       'bulletin',to_jsonb(b),
                       'new_proof',proof)
  ) ON CONFLICT(event_key) DO NOTHING;

  UPDATE public.scpi_metric_certifications cert
  SET value_numeric=91.37,
      verification_status='auto_verified_with_evidence',
      verification_method='pdf_page_text_match_dual_mupdf_poppler',
      extraction_confidence=0.98,
      evidence_text=
        'Buroboutic Metropoles, bulletin officiel T3 2026, page 4/6. ' ||
        'Taux d''Occupation Financier : 3eme trimestre 2026 91,37 %, ' ||
        '2eme trimestre 2026 91,56 %. ' ||
        'Les locaux vacants en restructuration (integres au TOF sous conditions) ' ||
        'representent 0,07 % au T3; ce chiffre est une composante, pas le TOF. ' ||
        'Lecture identique MuPDF + Poppler, PDF SHA256 ' || b.pdf_sha256 ||
        ', GitHub Actions 42377472006, artifact 13575957579. ' ||
        'Relecture visuelle de la page 4, validation automatique documentaire ' ||
        '(aucune attestation de validation humaine).'
  WHERE cert.id=c.id AND cert.value_numeric=0.07
    AND cert.verification_status='invalid_tof_bulletin_source_policy'
    AND cert.extraction_confidence=0;
  GET DIAGNOSTICS k=ROW_COUNT;
  IF k<>1 THEN RAISE EXCEPTION 'BUROBOUTIC_T3_CERT_UPDATE_EXPECTED_1_GOT_%',k; END IF;

  UPDATE public.scpi_indicator_history hist
  SET tof=91.37,qa_status='auto_verified_dual_pdf_evidence',
      source_confidence=0.98,
      metric_provenance=jsonb_set(coalesce(hist.metric_provenance,'{}'::jsonb),
                                  '{tof}',proof,true)
  WHERE hist.id=h.id AND hist.source_url=c.source_url
    AND hist.tof IS NULL AND hist.qa_status='auto_partial_review';
  GET DIAGNOSTICS k=ROW_COUNT;
  IF k<>1 THEN RAISE EXCEPTION 'BUROBOUTIC_T3_HISTORY_UPDATE_EXPECTED_1_GOT_%',k; END IF;

  -- The site's current summary row is still sourced from 2026-T2.
  -- Do not mutate it with a 2026-T3 field, avoiding mixed-period figures.
  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_indicator_history hist
    JOIN public.scpi_metric_certifications cert
      ON cert.scpi_slug=hist.scpi_slug AND cert.source_period=hist.source_period
       AND cert.metric='tof'
    WHERE hist.id=h.id AND hist.tof=91.37
      AND hist.qa_status='auto_verified_dual_pdf_evidence'
      AND hist.metric_provenance->'tof'->>'sha256'=b.pdf_sha256
      AND hist.metric_provenance->'tof'->>'document_period'='2026-T3'
      AND cert.id=c.id AND cert.value_numeric=hist.tof
      AND cert.verification_status='auto_verified_with_evidence'
      AND cert.extraction_confidence>=0.95
      AND cert.verification_method='pdf_page_text_match_dual_mupdf_poppler'
  ) THEN RAISE EXCEPTION 'BUROBOUTIC_T3_FINANCIAL_EVIDENCE_POSTCONDITION'; END IF;
END
$recovery137$;
