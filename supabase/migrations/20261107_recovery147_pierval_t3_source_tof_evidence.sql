-- RECOVERY-147 — Pierval Santé: exact independently located TOF from T3 2026.
-- Official publisher PDF: https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf
-- SHA-256: 823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1
-- 12 pages / 3,637,582 bytes; page 9: financial occupancy 91.04% and
-- a SEPARATE 8.96% unlet/vacancy figure. Report chart and main card agree.
-- Independent MuPDF/Poppler exact origin SHA and page coordinates PROVED
-- in GitHub Actions #42397568752, artifact #13584485846.
-- No false manual attestation. No other period, SCPI or metric modified.

DO $recovery147_pierval$
DECLARE
 prior public.scpi_indicator_history%ROWTYPE;
 updated public.scpi_indicator_history%ROWTYPE;
 bulletin public.scpi_bulletins%ROWTYPE;
 cert public.scpi_metric_certifications%ROWTYPE;
 new_id uuid;
 proof jsonb;
 affected int;
BEGIN
  SELECT * INTO STRICT prior
  FROM public.scpi_indicator_history
  WHERE id='3dba6c62-233f-4efa-aa1b-6ac5cc74093c'::uuid
   AND scpi_slug='pierval-sante'
   AND source_period='2026-T3' AND tof IS NULL
   AND qa_status='auto_partial_review'
   AND source_confidence=0.98
   AND source_url='https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf'
  FOR UPDATE;

  SELECT * INTO STRICT bulletin
  FROM public.scpi_bulletins
  WHERE id='596f5f03-df53-4a6c-97a9-6c53fe1af303'::uuid
    AND scpi_slug=prior.scpi_slug AND period=prior.source_period
    AND source_url=prior.source_url
    AND pdf_sha256='823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1'
    AND pdf_path='pierval-sante/2026-T3/823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1.pdf'
    AND qa_status='auto_partial_review';

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
      AND o.name=bulletin.pdf_path AND o.metadata->>'size'='3637582'
  ) THEN RAISE EXCEPTION 'PIERVAL_T3_OFFICIAL_ORIGINAL_PDF_NOT_ARCHIVED'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_source_connectors s
    WHERE s.scpi_slug='pierval-sante'
     AND 'www.euryale-am.fr'=ANY(s.allowed_hosts)
  ) THEN RAISE EXCEPTION 'PIERVAL_T3_EDITEUR_NOT_APPROVED'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug=prior.scpi_slug AND c.source_period=prior.source_period
      AND c.metric='tof'
  ) THEN RAISE EXCEPTION 'PIERVAL_T3_ALREADY_CERTIFIED_STOP_CONCURRENT_REPLAY'; END IF;

  IF EXISTS (
    SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
    WHERE q.scpi_slug=prior.scpi_slug AND q.source_period=prior.source_period
  ) THEN RAISE EXCEPTION 'PIERVAL_T3_HISTORICAL_QUARANTINE_NOT_REVIEWED'; END IF;

  proof:=jsonb_build_object(
    'status','exact_binary_independent_geometry_pass',
    'scpi_slug','pierval-sante',
    'period','2026-T3','metric','tof',
    'value_percent',91.04,'vacant_percentage',8.96,
    'document_kind','official_quarterly_issuer_bulletin',
    'reporting_basis','publisher_reported_tof_total_not_vacancy_component',
    'original_issuer_url',bulletin.source_url,
    'sha256',bulletin.pdf_sha256,
    'pdf_byte_size',3637582,'page_count',12,'source_page',9,
    'readers',jsonb_build_array('MuPDF-geometry','Poppler-bbox'),
    'mupdf_geometry',jsonb_build_object(
      'value_percent',91.04,'page',9,
      'left_tof_box',jsonb_build_array(53.1496,396.7112,111.4936,429.8552),
      'chart_tof_box',jsonb_build_array(394.6145,363.9439,426.2175,381.8969)),
    'poppler_geometry',jsonb_build_object(
      'value_percent',91.04,'page',9,
      'left_tof_box',jsonb_build_array(53.1496,396.7112,111.4936,429.8552),
      'chart_tof_box',jsonb_build_array(394.6145,363.9439,426.2175,381.8969)),
    'official_cover_period_proven',true,
    'official_cover_fund_proven',true,
    'independent_numeric_and_layout_proven',true,
    'workflow_reference','github-actions:42397568752',
    'artifact_id','13584485846',
    'human_attestation',false,'financial_certification_universal',false,
    'automatic_publication',false);

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(
     event_key,reason,snapshot)
  VALUES(
    'recovery147:pierval-sante-2026-T3-official-pdf-tof91p04',
    'Pierval 2026-T3 issuer PDF SHA/page9 verified by two engines, 91.04% TOF is not 8.96% vacant. Original history and bulletin preserved, without fabricated human certification.',
    jsonb_build_object('before_history',to_jsonb(prior),
                       'original_bulletin',to_jsonb(bulletin),
                       'independent_source_proof',proof,
                       'prior_cert_exists',false)
  ) ON CONFLICT(event_key) DO NOTHING;

  INSERT INTO public.scpi_metric_certifications
    (scpi_slug,source_period,metric,value_numeric,value_text,unit,
     source_url,source_page,evidence_text,bulletin_id,
     verification_status,verification_method,extraction_confidence)
  VALUES(
    'pierval-sante','2026-T3','tof',91.04,'91,04 %','%',
    bulletin.source_url,9,
    'Pierval Sante | bulletin trimestriel officiel T3 2026 | page PDF 9. Taux d''occupation financier global affiche 91,04 % sur la carte et le diagramme. Les 8,96 % correspondent aux locaux en recherche de locataires : cette composante de vacance N''EST PAS LE TOF. SHA256=823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1. MuPDF x=53.1496 y=396.7112 ET x=394.6145 y=363.9439 ; Poppler confirme les memes 2 boites sur la page 9. GitHub Actions #42397568752, artifact #13584485846. QA automatique independante, pas de validation humaine revendiquee.',
    bulletin.id,'auto_verified_with_evidence',
    'pdf_page_chart_tof_dual_mupdf_poppler_sha256',0.98
  ) RETURNING id INTO new_id;

  SELECT * INTO STRICT cert FROM public.scpi_metric_certifications WHERE id=new_id;
  IF cert.value_numeric<>91.04
    OR cert.verification_status<>'auto_verified_with_evidence'
    OR cert.verification_method<>'pdf_page_chart_tof_dual_mupdf_poppler_sha256'
    OR cert.source_page<>9 OR cert.extraction_confidence<0.95
    OR scpi_internal.tof_bulletin_source_rejection_reason(
       cert.scpi_slug,cert.source_url,cert.evidence_text,
       cert.verification_method,cert.verification_status) IS NOT NULL
  THEN RAISE EXCEPTION 'PIERVAL_T3_FINANCIAL_CERTIFICATION_POLICY_REJECTED'; END IF;

  INSERT INTO maximus_agents.scpi_independent_tof_geometry_proofs
    (certificate_id,scpi_slug,source_period,source_url,pdf_sha256,
     value_percent,source_page,pdf_byte_size,workflow_reference,artifact_id,
     detailed_evidence,human_attestation)
  VALUES(
    new_id,'pierval-sante','2026-T3',bulletin.source_url,bulletin.pdf_sha256,
    91.04,9,3637582,'github-actions:42397568752','13584485846',proof,false);

  UPDATE public.scpi_indicator_history h SET
    tof=91.04,
    qa_status='source_verified_independent_tof_page9',
    source_confidence=0.98,
    metric_provenance=jsonb_set(coalesce(h.metric_provenance,'{}'::jsonb),'{tof}',
      jsonb_build_object(
        'value',91.04,'unit','%',
        'definition','publisher_reported_tof_total',
        'source_url',bulletin.source_url,
        'source_page',9,'sha256',bulletin.pdf_sha256,
        'document_period','2026-T3','reference_date','2026-09-30',
        'verification_type','independent_dual_reader_pdf_chart_geometry',
        'readers',jsonb_build_array('MuPDF-geometry','Poppler-bbox'),
        'vacancy_component_distinct_percent',8.96,
        'workflow_reference','github-actions:42397568752',
        'artifact_id','13584485846','human_attestation',false
      ),true)
  WHERE h.id=prior.id AND h.tof IS NULL
    AND h.qa_status=prior.qa_status AND h.source_url=prior.source_url;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'PIERVAL_T3_UPDATE_EXPECTED_SINGLE_FIELD'; END IF;

  SELECT * INTO STRICT updated FROM public.scpi_indicator_history h
  WHERE h.id=prior.id;
  IF updated.tof IS DISTINCT FROM 91.04::numeric
    OR updated.qa_status<>'source_verified_independent_tof_page9'
    OR updated.metric_provenance->'tof'->>'sha256'<>bulletin.pdf_sha256
    OR updated.metric_provenance->'tof'->>'human_attestation'<>'false'
    OR to_jsonb(updated)-ARRAY['tof','qa_status','source_confidence','metric_provenance']
      IS DISTINCT FROM to_jsonb(prior)-ARRAY['tof','qa_status','source_confidence','metric_provenance']
  THEN RAISE EXCEPTION 'PIERVAL_T3_UNRELATED_HISTORY_FIELDS_MUTATED'; END IF;
END $recovery147_pierval$;
