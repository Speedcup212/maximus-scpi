-- RECOVERY-142: recertify ONLY two Buro T1/T2 quarantined TOF fields.
-- This is a distinct INDEPENDENT-AUTOMATED evidence status, NOT manual verified.
-- Each figure has exact issuer SHA, original storage binary, page 4, quarter
-- caption geometry proven separately by MuPDF and Poppler in Actions #42381361609.
-- Prior invalid certificates (92%, 91%) and source details remain in audit.
DO $recovery142_financial$
DECLARE
 r record;
 c public.scpi_metric_certifications%ROWTYPE;
 h public.scpi_indicator_history%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE;
 ev maximus_agents.scpi_independent_tof_geometry_proofs%ROWTYPE;
 after_cert public.scpi_metric_certifications%ROWTYPE;
 after_hist public.scpi_indicator_history%ROWTYPE;
 proof jsonb;
 affected integer;
 processed integer:=0;
BEGIN
 FOR r IN
  SELECT * FROM (VALUES
    ('2026-T1'::text,'2a6d65bd-6101-416b-a16a-dd32f5d008a9'::uuid,
     'f1524977-e120-4d8c-8344-a675f77d6064'::uuid,
     92::numeric,91.78::numeric,
     'manual_verified_exact_period_issuer_bulletin_tof_not_certified'::text,
     '25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3'::text),
    ('2026-T2'::text,'7d248e32-826c-4222-a462-08f46a6257b4'::uuid,
     'daeeb4ad-5a69-4a84-9826-b6fba5778451'::uuid,
     91::numeric,91.56::numeric,
     'invalid_tof_bulletin_source_policy'::text,
     '2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba'::text)
  ) AS x(period,certificate_id,history_id,bad_value,verified_value,old_qa,sha)
 LOOP
  SELECT * INTO STRICT ev
  FROM maximus_agents.scpi_independent_tof_geometry_proofs
  WHERE certificate_id=r.certificate_id AND source_period=r.period
    AND scpi_slug='buroboutic-metropoles' AND value_percent=r.verified_value
    AND pdf_sha256=r.sha AND human_attestation=false;

  IF NOT scpi_internal.independent_tof_geometric_proof_valid(
       ev.certificate_id,ev.scpi_slug,ev.source_period,
       ev.source_url,ev.value_percent,ev.source_page
  ) THEN RAISE EXCEPTION 'INDEPENDENT_PDF_QA_PROOF_NOT_REPRODUCIBLE_%',r.period; END IF;

  SELECT * INTO STRICT b
  FROM public.scpi_bulletins
  WHERE scpi_slug=ev.scpi_slug AND period=r.period
    AND source_url=ev.source_url AND pdf_sha256=ev.pdf_sha256
    AND pdf_path='buroboutic-metropoles/'||r.period||'/'||r.sha||'.pdf';

  SELECT * INTO STRICT c
  FROM public.scpi_metric_certifications
  WHERE id=r.certificate_id AND scpi_slug=ev.scpi_slug
    AND source_period=r.period AND metric='tof'
    AND source_url=ev.source_url AND value_numeric=r.bad_value
    AND source_page=2 AND extraction_confidence=0
    AND verification_status='invalid_tof_bulletin_source_policy'
    AND verification_method='blocked_requires_manual_recertification_from_issuer_bulletin';

  SELECT * INTO STRICT h
  FROM public.scpi_indicator_history
  WHERE id=r.history_id AND scpi_slug=ev.scpi_slug
    AND source_period=r.period AND source_url=ev.source_url
    AND tof IS NULL AND qa_status=r.old_qa AND source_confidence=0;

  proof:=jsonb_build_object(
   'value',r.verified_value,'unit','%',
   'metric','tof',
   'document_period',r.period,
   'reference_date',CASE r.period WHEN '2026-T1' THEN '2026-03-31' ELSE '2026-06-30' END,
   'source_url',ev.source_url,
   'sha256',r.sha,
   'source_page',4,
   'definition','issuer_reported_taux_occupation_financier',
   'verification_type','independent_two_engine_geometric_source_page',
   'readers',jsonb_build_array('MuPDF-geometry','Poppler-bbox'),
   'mupdf_value',r.verified_value,'poppler_value',r.verified_value,
   'geometry_evidence',ev.detailed_evidence,
   'run_reference',ev.workflow_reference,
   'artifact_id',ev.artifact_id,
   'human_attestation',false,
   'regulatory_human_certification_claimed',false
  );

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
    (event_key,reason,snapshot)
  VALUES (
    'recovery142:buroboutic-'||r.period||'-independent-tof-recertification',
    'Exact original issuer PDF and geometric double-reader QA. No manual signoff asserted. Original quarantined certificate/history preserved.',
    jsonb_build_object('old_certificate',to_jsonb(c),
                       'old_history',to_jsonb(h),
                       'linked_bulletin',to_jsonb(b),
                       'independent_proof',to_jsonb(ev),
                       'new_tof_provenance',proof)
  ) ON CONFLICT(event_key) DO NOTHING;

  UPDATE public.scpi_metric_certifications
  SET value_numeric=r.verified_value,
      verification_status='independent_verified_official_geometric_pdf',
      verification_method='pdf_page_tof_dual_geometry_sha256',
      source_page=4,
      extraction_confidence=0.98,
      evidence_text=
       'Buroboutic Metropoles | bulletin trimestriel officiel '||r.period||
       ' | page 4 | Taux d''Occupation Financier (TOF) = '||
       replace(r.verified_value::text,'.',',')||' %. '||
       'Valeur du diagramme au-dessus de la legende '||r.period||
       ', distincte du diagramme adjacent et des composantes de vacance. '||
       'MuPDF + Poppler independently found the same figure at matching source-page coordinates. '||
       'SHA256='||r.sha||'; GitHub Actions 42381361609; artifact 13577252680. '||
       'Independent automated documentary evidence, not a manual human signoff.'
  WHERE id=c.id AND value_numeric=r.bad_value
    AND source_url=ev.source_url
    AND verification_status='invalid_tof_bulletin_source_policy';
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'EXACT_TOF_CERT_UPDATE_FAILED_%',r.period; END IF;

  SELECT * INTO STRICT after_cert FROM public.scpi_metric_certifications
  WHERE id=c.id;
  IF after_cert.verification_status<>'independent_verified_official_geometric_pdf'
    OR after_cert.verification_method<>'pdf_page_tof_dual_geometry_sha256'
    OR after_cert.value_numeric<>r.verified_value
    OR after_cert.extraction_confidence<0.95
    OR after_cert.source_page<>4
  THEN RAISE EXCEPTION 'CERTIFICATE_GUARD_REJECTED_INDEPENDENT_PROOF_%',r.period; END IF;

  UPDATE public.scpi_indicator_history
  SET tof=r.verified_value,
      source_confidence=0.98,
      qa_status='independent_verified_official_geometric_pdf_page4',
      metric_provenance=jsonb_set(
        coalesce(metric_provenance,'{}'::jsonb),'{tof}',proof,true)
  WHERE id=h.id AND tof IS NULL AND qa_status=r.old_qa
    AND source_url=ev.source_url;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'EXACT_TOF_HISTORY_UPDATE_FAILED_%',r.period; END IF;

  SELECT * INTO STRICT after_hist FROM public.scpi_indicator_history
  WHERE id=h.id;
  IF after_hist.tof IS DISTINCT FROM r.verified_value
    OR after_hist.qa_status<>'independent_verified_official_geometric_pdf_page4'
    OR after_hist.source_confidence<0.95
    OR after_hist.metric_provenance->'tof'->>'sha256'<>r.sha
  THEN RAISE EXCEPTION 'QUARANTINE_REPLAY_GUARD_REJECTED_INDEPENDENT_PROOF_%',r.period; END IF;
  processed:=processed+1;
 END LOOP;
 IF processed<>2 THEN RAISE EXCEPTION 'EXACTLY_TWO_QUARTERS_REQUIRED'; END IF;

 -- Do not modify public.scpi_indicators here: its current summary is T2
 -- with mixed data origin and needs a separate same-period publishing QA.
 -- No arbitrary bypass of standard source/identity or financial controls.
END $recovery142_financial$;
