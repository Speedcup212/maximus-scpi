-- RECOVERY-212 — Iroko Atlas T3 2026: restore verified PDF evidence overwritten by HTML ingestion.
-- Evidence: official issuer CDN archive SHA 301b326b..., 3,971,612 bytes, TOF p.6 96.65%,
-- MuPDF+Poppler independent spatial read, and official capitalisation p.2 218.83 M EUR.
-- No new financial value, manual attestation, stage/QA override or forced strict PASS.
-- T3 share count is copied from T2: keep the capitalisation consistency gate FAIL CLOSED.
DO $repair$
DECLARE
  r public.scpi_source_registry%ROWTYPE;
  c public.scpi_metric_certifications%ROWTYPE;
  h public.scpi_indicator_history%ROWTYPE;
  d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
  source_hosts text[];
  n integer;
  before_pass integer;
  after_pass integer;
  gate public.scpi_crash_test_strict_v2%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('recovery212:iroko-atlas:2026-T3'));
  SELECT count(*) INTO before_pass FROM public.scpi_crash_test_strict_v2
    WHERE crash_test_status='PASS_100';
  SELECT * INTO STRICT r FROM public.scpi_source_registry
    WHERE scpi_slug='iroko-atlas' FOR UPDATE;
  SELECT * INTO STRICT c FROM public.scpi_metric_certifications
    WHERE id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid FOR UPDATE;
  SELECT * INTO STRICT h FROM public.scpi_indicator_history
    WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3' FOR UPDATE;
  SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents
    WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3'
      AND pdf_sha256='301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
      AND source_url='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf'
      AND status='extracted' AND processing_complete=true;
  SELECT allowed_hosts INTO STRICT source_hosts FROM public.scpi_source_connectors
    WHERE scpi_slug='iroko-atlas' AND enabled=true;
  IF r.verification_status<>'verified' OR r.confidence_level<>'medium'
    OR r.last_document_period<>'2026-T3'
    OR r.issuer_source_period<>d.source_period
    OR r.issuer_source_url<>d.source_url
    OR r.issuer_source_sha256<>d.pdf_sha256
    OR r.issuer_source_verified_at IS NULL
    OR c.scpi_slug<>'iroko-atlas' OR c.source_period<>'2026-T3'
    OR c.metric<>'tof' OR c.value_numeric<>96.65 OR c.unit<>'%'
    OR c.verification_status<>'auto_verified_with_evidence'
    OR c.verification_method<>'html_text_match'
    OR c.source_page IS NOT NULL
    OR c.source_url<>'https://www.iroko.eu/bulletins-trimestriels-atlas/q3-2026'
    OR h.tof<>96.65 OR h.capitalisation<>218.83 OR h.nombre_parts<>834833
    OR h.metric_provenance->'tof'->>'sha256'<>'df981cf33989eb173dd3d3e24eaa5b170f5e5983a3c25e08b7070b866a34c41d'
  THEN RAISE EXCEPTION 'REC212_CHANGED_PRECONDITION'; END IF;

  IF d.result->>'identity_verified'<>'true'
    OR d.result->>'period_verified'<>'true'
    OR d.result->>'archive_path'<>'iroko-atlas/2026-T3/'||d.pdf_sha256||'.pdf'
    OR NOT (lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(source_hosts))
    OR d.result->'evidence'->'tof'->>'text'<>'TOF | 96,65 %'
    OR (d.result->'evidence'->'tof'->>'page')::integer<>6
    OR (d.result->'evidence'->'tof'->>'value')::numeric<>96.65
    OR d.result->'evidence'->'tof'->>'reference_date'<>'2026-09-30'
    OR d.result->'evidence'->'tof'->'independent_engines'<>'["MuPDF","Poppler"]'::jsonb
    OR d.result->'evidence'->'capitalisation'->>'text'<>'Capitalisation | 218,83 M€'
    OR (d.result->'evidence'->'capitalisation'->>'page')::integer<>2
    OR (d.result->'evidence'->'capitalisation'->>'value')::numeric<>218.83
    OR d.result->'evidence'->'capitalisation'->'independent_engines'<>'["MuPDF","Poppler"]'::jsonb
    OR NOT EXISTS (
       SELECT 1 FROM storage.objects o
       WHERE o.bucket_id='scpi-bulletins'
         AND o.name=d.result->>'archive_path'
         AND (o.metadata->>'size')::bigint=3971612)
    OR scpi_internal.tof_bulletin_source_rejection_reason(
         'iroko-atlas',d.source_url,'TOF | 96,65 %',
         'archived_issuer_pdf_two_independent_readers',
         'independent_verified_official_bulletin') IS NOT NULL
  THEN RAISE EXCEPTION 'REC212_INSUFFICIENT_OFFICIAL_BINARY_PROOF'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_crash_test_strict_v2
    WHERE scpi_slug='iroko-atlas' AND crash_test_status='FAIL_STRICT'
      AND NOT source_ready AND uncertified_tof_periods=1
      AND cap_consistency_issues=1)
  THEN RAISE EXCEPTION 'REC212_UNEXPECTED_STRICT_GATE'; END IF;

  -- Before-image audit: keep the previous provenance, including incorrect HTML association.
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
  VALUES (
    'recovery212:iroko-atlas:2026-T3:proof-restore',
    'Restore SHA/page/two-reader PDF proof after weaker HTML auto-certification; T3 shares remain unverified.',
    jsonb_build_object(
      'registry_before',to_jsonb(r),
      'certification_before',to_jsonb(c),
      'history_tof_before',h.metric_provenance->'tof',
      'official_binary_sha256',d.pdf_sha256,
      'official_binary_page_evidence',d.result->'evidence'->'tof',
      'archive_path',d.result->>'archive_path',
      'financial_values_modified',false,
      'manual_attestation',false));

  UPDATE public.scpi_source_registry
    SET confidence_level='high',updated_at=now()
    WHERE id=r.id AND confidence_level='medium'
      AND verification_status='verified'
      AND issuer_source_sha256=d.pdf_sha256
      AND issuer_source_url=d.source_url;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'REC212_REGISTRY_UPDATE_NOT_UNIQUE'; END IF;

  UPDATE public.scpi_metric_certifications
    SET source_url=d.source_url,
        source_page=6,
        evidence_text='TOF | 96,65 %',
        verification_status='independent_verified_official_bulletin',
        verification_method='archived_issuer_pdf_two_independent_readers',
        extraction_confidence=1,verified_at=now()
    WHERE id=c.id AND value_numeric=96.65
      AND verification_status='auto_verified_with_evidence'
      AND source_page IS NULL;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'REC212_CERT_UPDATE_NOT_UNIQUE'; END IF;

  -- Correct ONLY the SHA pointer for an unchanged 96.65% historical TOF.
  UPDATE public.scpi_indicator_history
    SET metric_provenance=jsonb_set(metric_provenance,'{tof,sha256}',
                                   to_jsonb(d.pdf_sha256),true)
    WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3'
      AND tof=96.65 AND capitalisation=218.83 AND nombre_parts=834833;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'REC212_HISTORY_UPDATE_NOT_UNIQUE'; END IF;

  SELECT * INTO STRICT gate FROM public.scpi_crash_test_strict_v2
    WHERE scpi_slug='iroko-atlas';
  SELECT count(*) INTO after_pass FROM public.scpi_crash_test_strict_v2
    WHERE crash_test_status='PASS_100';
  -- The stale T2 share count is still blocking; this is intentionally NOT a PASS.
  IF NOT gate.source_ready OR gate.uncertified_tof_periods<>0
    OR gate.cap_consistency_issues<>1 OR gate.crash_test_status<>'FAIL_STRICT'
    OR after_pass<>before_pass
  THEN RAISE EXCEPTION 'REC212_UNEXPECTED_POST_GATE'; END IF;

  INSERT INTO public.scpi_ingestion_events(
    scpi_slug,step,status,message,source_period,bulletin_url,
    extraction_confidence,metrics_count,ended_at)
  VALUES (
    'iroko-atlas','recovery212_issuer_pdf_tof_proof_restore','completed',
    'Issuer PDF 96.65% page 6, SHA 301b326b, two independent readers; restored original provenance. T3 shares versus capitalisation mismatch remains FAIL_STRICT. No value changed or fictitious human attestation.',
    '2026-T3',d.source_url,1,1,now());
END $repair$;
