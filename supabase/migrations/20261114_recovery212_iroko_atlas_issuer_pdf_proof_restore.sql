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


-- Strengthen the EXISTING guarded TOF trigger, exact one-fund exception only.
-- No new engine, no changed approval thresholds for other SCPI.
CREATE OR REPLACE FUNCTION scpi_internal.guard_proven_tof_certificate_replay()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  h record;
  safe_new boolean;
BEGIN
  -- RECOVERY-212: protect this EXACT independent issuer-PDF TOF certificate.
  -- The ingestion crawler must not replace page-anchored PDF evidence with HTML
  -- or a certificate lacking field-level evidence. An independently verified
  -- successor can still be admitted through the original generic gate.
  IF TG_OP='UPDATE'
    AND OLD.id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid
    AND OLD.scpi_slug='iroko-atlas' AND OLD.source_period='2026-T3'
    AND OLD.metric='tof' AND OLD.value_numeric=96.65
    AND OLD.source_url='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf'
    AND OLD.source_page=6
    AND OLD.verification_status='independent_verified_official_bulletin'
    AND OLD.verification_method='archived_issuer_pdf_two_independent_readers'
    AND NEW.verification_method IN ('html_text_match','certified_bulletin_without_field_evidence')
    AND (NEW.source_url IS DISTINCT FROM OLD.source_url
      OR NEW.source_page IS DISTINCT FROM OLD.source_page
      OR NEW.verification_status IS DISTINCT FROM OLD.verification_status)
    AND EXISTS (
      SELECT 1
      FROM public.scpi_source_registry sr
      JOIN maximus_agents.scpi_bulletin_replay_documents d
        ON d.scpi_slug=sr.scpi_slug
        AND d.source_period=sr.issuer_source_period
        AND d.pdf_sha256=sr.issuer_source_sha256
        AND d.source_url=sr.issuer_source_url
      JOIN storage.objects o ON o.bucket_id='scpi-bulletins'
        AND o.name=d.result->>'archive_path'
      WHERE sr.scpi_slug=OLD.scpi_slug
        AND sr.verification_status='verified'
        AND sr.issuer_source_period='2026-T3'
        AND sr.issuer_source_sha256='301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
        AND d.processing_complete AND d.status='extracted'
        AND d.result->>'identity_verified'='true'
        AND d.result->>'period_verified'='true'
        AND (d.result->'evidence'->'tof'->>'page')::integer=6
        AND (d.result->'evidence'->'tof'->>'value')::numeric=96.65
        AND d.result->'evidence'->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
        AND (o.metadata->>'size')::bigint=3971612)
  THEN
    RETURN OLD;
  END IF;
  IF NEW.metric <> 'tof' THEN RETURN NEW; END IF;
  SELECT hist.tof,hist.source_url,hist.qa_status,hist.source_confidence,
         hist.metric_provenance->'tof'->>'sha256' AS proof_sha,
         (hist.metric_provenance->'tof'->>'source_page')::integer AS proof_page,
         b.pdf_sha256,b.source_url AS bulletin_url
  INTO h
  FROM public.scpi_indicator_history hist
  JOIN public.scpi_bulletins b
   ON b.scpi_slug=hist.scpi_slug AND b.period=hist.source_period
  WHERE hist.scpi_slug=NEW.scpi_slug AND hist.source_period=NEW.source_period
    AND (
      hist.qa_status IN ('auto_verified_dual_pdf_evidence',
        'independent_verified_official_geometric_pdf_page4')
      OR (
        hist.scpi_slug='accimmo-pierre'
        AND hist.source_period='2026-T2'
        AND hist.qa_status='source_verified_delegated_review'
        AND scpi_internal.accimmo_t2_exact_tof_proof_valid(
          hist.scpi_slug,hist.source_period,hist.source_url,hist.tof,
          (hist.metric_provenance->'tof'->>'source_page')::integer)
      )
      OR (
        hist.scpi_slug='pierval-sante'
        AND hist.source_period='2026-T3'
        AND hist.qa_status='source_verified_independent_tof_page9'
        AND scpi_internal.pierval_t3_exact_tof_proof_valid(
          hist.scpi_slug,hist.source_period,hist.source_url,hist.tof,
          (hist.metric_provenance->'tof'->>'source_page')::integer)
      )
    )
    AND hist.source_confidence>=0.95 AND hist.tof IS NOT NULL
  ORDER BY hist.snapshot_at DESC
  LIMIT 1;

  IF NOT FOUND OR h.proof_sha IS NULL
    OR h.proof_sha<>h.pdf_sha256 OR h.source_url<>h.bulletin_url
    OR h.proof_page IS NULL OR h.proof_page<1
  THEN RETURN NEW; END IF;

  safe_new:=NEW.value_numeric IS NOT DISTINCT FROM h.tof
    AND NEW.source_url=h.source_url
    AND NEW.source_page=h.proof_page
    AND NEW.verification_status IN (
      'auto_verified_with_evidence','independent_verified_official_geometric_pdf')
    AND COALESCE(NEW.extraction_confidence,0)>=0.95;

  IF NOT safe_new THEN
    -- Ignore weaker rewrites to a previously source-certified record. This
    -- protects data integrity while allowing the scheduler to continue.
    IF TG_OP='UPDATE' THEN RETURN OLD; END IF;
    -- INSERT ... ON CONFLICT executes BEFORE INSERT BEFORE deciding whether
    -- to run its UPDATE branch. Skip ONLY the stale uncertified TOF row;
    -- do not abort the entire independent financial analysis refresh.
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

-- Post-install anti-regression checks: same value+page+issuer SHA must survive
-- future HTML replays. No authorization to fabricate independent proof.
DO $guardcheck$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid=t.tgrelid
    WHERE c.oid='public.scpi_metric_certifications'::regclass
      AND t.tgname='trg_a0_guard_proven_tof_certificate_replay' AND NOT t.tgisinternal)
  THEN RAISE EXCEPTION 'REC212_MISSING_EXISTING_GUARD_TRIGGER'; END IF;
END $guardcheck$;
