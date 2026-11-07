-- RECOVERY-145 — Accimmo Pierre T2 2026: exact issuer TOF (one field).
-- Official BNP REIM original PDF (7 pages; 1,273,352 bytes):
-- https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCIMMO%20PIERRE_BT_FR_T2%202026_DEF.pdf
-- SHA256 2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20
-- GitHub real source probe run #42390022740 artifact #13580978353.
-- MuPDF and Poppler independent PDF word geometry page 2 BOTH locate 87,44
-- at [130.96,435.63,152.91,448.43] next to "ce trimestre un taux
-- d'occupation financier de". The 87,03% "indicateurs clés" on the same
-- page is a distinct issuer figure and MUST NOT be substituted.
-- This operation is not a human manual signoff and DOES NOT recertify any
-- other metric in this bulletin, currently marked auto_partial_review.

DO $recovery145_accimmo$
DECLARE
  original_history public.scpi_indicator_history%ROWTYPE;
  edited_history public.scpi_indicator_history%ROWTYPE;
  official_bulletin public.scpi_bulletins%ROWTYPE;
  new_cert public.scpi_metric_certifications%ROWTYPE;
  new_cert_id uuid;
  one_row integer;
  independent_proof jsonb;
BEGIN
  SELECT * INTO STRICT original_history
  FROM public.scpi_indicator_history
  WHERE id='97301791-9f71-4350-9048-caf6ebce3dcc'::uuid
    AND scpi_slug='accimmo-pierre'
    AND source_period='2026-T2'
    AND tof=87.44
    AND qa_status='source_verified_delegated_review'
    AND source_confidence=1
    AND source_url='https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCIMMO%20PIERRE_BT_FR_T2%202026_DEF.pdf'
    AND metric_provenance->'tof'->>'source_page'='2'
  FOR UPDATE;

  SELECT * INTO STRICT official_bulletin
  FROM public.scpi_bulletins
  WHERE id='497c6e39-0565-475d-a330-c63ccfcba98e'::uuid
    AND scpi_slug=original_history.scpi_slug
    AND period=original_history.source_period
    AND source_url=original_history.source_url
    AND pdf_sha256='2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20'
    AND pdf_path='accimmo-pierre/2026-T2/2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20.pdf'
    AND qa_status='auto_partial_review';

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id='scpi-bulletins'
      AND o.name=official_bulletin.pdf_path
      AND o.metadata->>'size'='1273352'
  ) THEN RAISE EXCEPTION 'ACCIMMO_T2_OFFICIAL_PDF_NOT_ARCHIVED_EXACT_BYTES'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_metric_certifications
    WHERE scpi_slug='accimmo-pierre' AND source_period='2026-T2' AND metric='tof'
  ) THEN RAISE EXCEPTION 'ACCIMMO_T2_TOF_ALREADY_CERTIFIED_OR_CONCURRENT_CHANGE'; END IF;

  IF EXISTS (
    SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028
    WHERE scpi_slug='accimmo-pierre' AND source_period='2026-T2'
  ) THEN RAISE EXCEPTION 'ACCIMMO_T2_QUARANTINE_REQUIRES_SEPARATE_GOVERNED_ADMISSION'; END IF;

  independent_proof:=jsonb_build_object(
    'status','independent_geometric_qa_pass',
    'metric','tof','scpi_slug','accimmo-pierre','period','2026-T2',
    'reporting_basis','taux_occupation_financier_ce_trimestre',
    'value_percent',87.44,
    'distinct_publisher_key_figure',87.03,
    'distinct_publisher_figure_basis','indicateurs_cles_au_2026_06_30',
    'source_page',2,'page_count',7,'pdf_byte_size',1273352,
    'issuer_url',official_bulletin.source_url,
    'sha256',official_bulletin.pdf_sha256,
    'word_context','ce trimestre un taux d''occupation financier de 87,44 %',
    'source_labeled_quarter','2eme_trimestre_2026',
    'readers',jsonb_build_array('MuPDF-geometry','Poppler-bbox'),
    'mupdf_geometry',jsonb_build_object(
       'value_percent',87.44,'page',2,'word_rect',
       jsonb_build_array(130.96,435.63,152.91,448.43)
    ),
    'poppler_geometry',jsonb_build_object(
       'value_percent',87.44,'page',2,'word_rect',
       jsonb_build_array(130.96,435.63,152.91,448.43),
       'parse_mode','poppler_bbox_strict_word_recovery'
    ),
    'workflow_reference','github-actions:42390022740',
    'artifact_id','13580978353',
    'financial_certification_universal',false,
    'human_attestation',false
  );

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
   (event_key,reason,snapshot)
  VALUES (
   'recovery145:accimmo-pierre-2026-T2-tof-exact-quarterly-issuer-pdf',
   'A single TOF was missing a certificate despite correct source history; official publisher PDF page 2 explicitly says ce trimestre 87,44%. Two independent readers match exact geometry. The same page also displays a distinct 87,03% key figure. No unrelated metrics certified.',
   jsonb_build_object('old_history',to_jsonb(original_history),
    'source_bulletin',to_jsonb(official_bulletin),
    'independent_proof',independent_proof,
    'old_tof_certificate_exists',false)
  ) ON CONFLICT(event_key) DO NOTHING;

  INSERT INTO public.scpi_metric_certifications(
    scpi_slug,source_period,metric,value_numeric,value_text,unit,
    source_url,source_page,evidence_text,bulletin_id,
    verification_status,verification_method,extraction_confidence)
  VALUES(
    'accimmo-pierre','2026-T2','tof',87.44,'87,44 %','%',
    official_bulletin.source_url,2,
    'SCPI Accimmo Pierre, bulletin officiel 2eme trimestre 2026, PDF page 2. Le commentaire de gestion indique explicitement : ce trimestre un taux d''occupation financier de 87,44 %, en progression de 0,82 point par rapport au trimestre precedent. Taux trimestriel distinct du taux de synthese 87,03 % affiche dans les indicateurs cles au 30 juin 2026. Deux moteurs independants MuPDF et Poppler: meme mot et position [130.96,435.63,152.91,448.43]. SHA256=2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20 ; run GitHub 42390022740 ; artifact 13580978353. Verification documentaire automatisee independante sans attestation humaine.',
    official_bulletin.id,
    'auto_verified_with_evidence','pdf_page_text_match_dual_mupdf_poppler',0.98
  ) RETURNING id INTO new_cert_id;

  SELECT * INTO STRICT new_cert
  FROM public.scpi_metric_certifications WHERE id=new_cert_id;
  IF new_cert.value_numeric<>87.44
    OR new_cert.verification_status<>'auto_verified_with_evidence'
    OR new_cert.verification_method<>'pdf_page_text_match_dual_mupdf_poppler'
    OR new_cert.source_page<>2 OR new_cert.extraction_confidence<0.95
    OR scpi_internal.tof_bulletin_source_rejection_reason(
      new_cert.scpi_slug,new_cert.source_url,new_cert.evidence_text,
      new_cert.verification_method,new_cert.verification_status) IS NOT NULL
  THEN RAISE EXCEPTION 'ACCIMMO_T2_TOF_CERT_GUARD_DID_NOT_APPROVE'; END IF;

  INSERT INTO maximus_agents.scpi_independent_tof_geometry_proofs(
    certificate_id,scpi_slug,source_period,source_url,pdf_sha256,
    value_percent,source_page,pdf_byte_size,workflow_reference,artifact_id,
    detailed_evidence,human_attestation
  ) VALUES (
    new_cert_id,'accimmo-pierre','2026-T2',
    official_bulletin.source_url,official_bulletin.pdf_sha256,
    87.44,2,1273352,'github-actions:42390022740','13580978353',
    independent_proof,false
  );
  GET DIAGNOSTICS one_row=ROW_COUNT;
  IF one_row<>1 THEN RAISE EXCEPTION 'ACCIMMO_T2_PRIVATE_PROOF_INSERT_FAILED'; END IF;

  -- The existing historical QA status remains "delegated review"; only
  -- the one TOF field gets an exact independent SHA/page provenance update.
  UPDATE public.scpi_indicator_history h
  SET metric_provenance=jsonb_set(
    COALESCE(h.metric_provenance,'{}'::jsonb),'{tof}',
    jsonb_build_object(
      'value',87.44,'unit','%',
      'definition','publisher_reported_tof_ce_trimestre',
      'source_url',official_bulletin.source_url,
      'source_page',2,'sha256',official_bulletin.pdf_sha256,
      'document_period','2026-T2',
      'reference_date','2026-06-30',
      'verification_type','independent_dual_pdf_page_geometry',
      'readers',jsonb_build_array('MuPDF-geometry','Poppler-bbox'),
      'workflow_reference','github-actions:42390022740',
      'artifact_id','13580978353','human_attestation',false
    ),true)
  WHERE h.id=original_history.id AND h.tof=87.44
    AND h.qa_status='source_verified_delegated_review'
    AND h.source_url=official_bulletin.source_url;
  GET DIAGNOSTICS one_row=ROW_COUNT;
  IF one_row<>1 THEN RAISE EXCEPTION 'ACCIMMO_T2_HISTORY_PROVENANCE_UPDATE_FAILED'; END IF;

  SELECT * INTO STRICT edited_history FROM public.scpi_indicator_history
  WHERE id=original_history.id;
  IF edited_history.metric_provenance->'tof'->>'sha256'<>official_bulletin.pdf_sha256
    OR edited_history.metric_provenance->'tof'->>'human_attestation'<>'false'
    OR to_jsonb(edited_history)-'metric_provenance'
       IS DISTINCT FROM to_jsonb(original_history)-'metric_provenance'
  THEN RAISE EXCEPTION 'ACCIMMO_T2_UNRELATED_HISTORY_FIELDS_CHANGED'; END IF;
END $recovery145_accimmo$;
