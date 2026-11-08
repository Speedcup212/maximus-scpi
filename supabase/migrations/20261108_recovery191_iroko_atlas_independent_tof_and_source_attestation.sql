-- RECOVERY-191: recover an independently proven T3 TOF and retain issuer attestation.
-- No re-invention of a number and no false manual QA. Exact 1-record scope.
-- Upstream issuer original SHA/page, two different PDF readers and the
-- already archived PDF binary MUST all agree before finance changes.

CREATE OR REPLACE FUNCTION scpi_internal.preserve_same_issuer_attestation_confidence()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $fn$
BEGIN
  -- Downgrading a verified, unchanged SHA-anchored source by a crawler is not
  -- new evidence. A genuinely changed source, revoked status, changed issuer
  -- attestation or changed period still fails closed.
  IF OLD.verification_status='verified'
     AND OLD.confidence_level='high'
     AND NEW.verification_status='verified'
     AND NEW.confidence_level='medium'
     AND OLD.last_document_period=NEW.last_document_period
     AND OLD.issuer_source_period=NEW.issuer_source_period
     AND OLD.issuer_source_sha256=NEW.issuer_source_sha256
     AND OLD.issuer_source_url=NEW.issuer_source_url
     AND OLD.issuer_source_verified_at=NEW.issuer_source_verified_at
     AND OLD.issuer_source_verified_at IS NOT NULL
     AND OLD.issuer_source_sha256 ~ '^[0-9a-f]{64}$'
     AND OLD.issuer_source_period=OLD.last_document_period
     AND EXISTS (
       SELECT 1
       FROM maximus_agents.scpi_bulletin_replay_documents d
       JOIN storage.objects o ON o.bucket_id='scpi-bulletins'
            AND o.name=d.result->>'archive_path'
       WHERE d.scpi_slug=OLD.scpi_slug
         AND d.source_period=OLD.issuer_source_period
         AND d.source_url=OLD.issuer_source_url
         AND d.pdf_sha256=OLD.issuer_source_sha256
         AND d.status='extracted' AND d.processing_complete
         AND d.result->>'identity_verified'='true'
         AND d.result->>'period_verified'='true'
         AND d.result->>'archive_path'=
             d.scpi_slug||'/'||d.source_period||'/'||d.pdf_sha256||'.pdf'
         AND (o.metadata->>'size')::bigint>1000
     )
  THEN NEW.confidence_level:='high';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_zzzz_preserve_same_issuer_attestation_confidence
ON public.scpi_source_registry;
CREATE TRIGGER trg_zzzz_preserve_same_issuer_attestation_confidence
BEFORE UPDATE ON public.scpi_source_registry
FOR EACH ROW EXECUTE FUNCTION scpi_internal.preserve_same_issuer_attestation_confidence();

REVOKE ALL ON FUNCTION scpi_internal.preserve_same_issuer_attestation_confidence()
FROM PUBLIC,anon,authenticated;

DO $proof$
DECLARE
  r public.scpi_source_registry%ROWTYPE;
  c public.scpi_metric_certifications%ROWTYPE;
  d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
  prior_pass integer;
  post_pass integer;
  evidence_count integer;
  affected integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('recovery191:iroko-atlas:2026-T3'));
  SELECT count(*)::integer INTO prior_pass
   FROM public.scpi_crash_test_strict_v2 v
   JOIN maximus_agents.scpi_universe u USING(scpi_slug)
   WHERE u.lifecycle='existing' AND v.crash_test_status='PASS_100';

  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_crash_test_strict_v2
    WHERE scpi_slug='iroko-atlas' AND crash_test_status='FAIL_STRICT'
    AND uncertified_tof_periods=1 AND NOT source_ready
  ) THEN RAISE EXCEPTION 'REC191_WRONG_PRE_REPAIR_STATE'; END IF;

  SELECT * INTO STRICT r FROM public.scpi_source_registry
   WHERE scpi_slug='iroko-atlas' FOR UPDATE;
  SELECT * INTO STRICT c FROM public.scpi_metric_certifications
   WHERE id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid FOR UPDATE;

  IF r.verification_status<>'verified' OR r.confidence_level<>'medium'
    OR r.last_document_period<>'2026-T3'
    OR r.issuer_source_period<>'2026-T3'
    OR r.issuer_source_sha256<>'301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
    OR r.issuer_source_verified_at IS NULL
    OR c.scpi_slug<>'iroko-atlas' OR c.source_period<>'2026-T3'
    OR c.metric<>'tof' OR c.value_numeric<>96.65
    OR c.source_page IS NOT NULL
    OR c.verification_status<>'auto_verified_with_evidence'
    OR c.extraction_confidence>=0.95
    OR c.source_url<>'https://www.iroko.eu/bulletins-trimestriels-atlas/q3-2026'
  THEN RAISE EXCEPTION 'REC191_SOURCE_OR_CERT_CHANGED_ABORT'; END IF;

  SELECT * INTO STRICT d
  FROM maximus_agents.scpi_bulletin_replay_documents
  WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3'
    AND pdf_sha256=r.issuer_source_sha256 AND source_url=r.issuer_source_url
    AND status='extracted' AND processing_complete IS TRUE
    AND result->>'identity_verified'='true' AND result->>'period_verified'='true'
    AND result->>'archive_path'=
       scpi_slug||'/'||source_period||'/'||pdf_sha256||'.pdf';

  SELECT count(*) INTO evidence_count
  FROM storage.objects o
  JOIN public.scpi_indicator_history h ON h.scpi_slug=d.scpi_slug
    AND h.source_period=d.source_period AND h.source_url=d.source_url
  JOIN public.scpi_source_connectors s ON s.scpi_slug=d.scpi_slug
  WHERE o.bucket_id='scpi-bulletins' AND o.name=d.result->>'archive_path'
    AND o.metadata->>'size'='3971612'
    AND lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(s.allowed_hosts)
    AND h.tof=96.65 AND h.source_confidence>=0.95
    AND h.qa_status NOT LIKE 'invalid%'
    AND d.result->'evidence'->'tof'->>'method'='dual_pdf_geometry'
    AND d.result->'evidence'->'tof'->>'association'='adjacent_caption'
    AND d.result->'evidence'->'tof'->>'value_match'='true'
    AND d.result->'evidence'->'tof'->'independent_engines'=
      '["MuPDF","Poppler"]'::jsonb
    AND (d.result->'evidence'->'tof'->>'page')::integer=6
    AND (d.result->'evidence'->'tof'->>'value')::numeric=96.65
    AND d.result->'evidence'->'tof'->>'text'='TOF | 96,65 %'
    AND d.result->'evidence'->'tof'->>'reference_date'='2026-09-30'
    AND scpi_internal.tof_bulletin_source_rejection_reason(
      'iroko-atlas',d.source_url,'TOF | 96,65 %',
      'archived_issuer_pdf_two_independent_readers',
      'independent_verified_official_bulletin') IS NULL;
  IF evidence_count<>1 THEN
    RAISE EXCEPTION 'REC191_PDF_SOURCE_PAGE_GEOMETRY_INCOMPLETE_%',evidence_count;
  END IF;

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
    (event_key,reason,snapshot)
  VALUES ('recovery191:iroko-atlas:2026-T3:issuer-dual-qa',
    'Before snapshot: automatic source crawler downgraded verified unchanged issuer SHA, and certificate used HTML instead of stored independent two-reader PDF proof.',
    jsonb_build_object('registry_before',to_jsonb(r),
      'certificate_before',to_jsonb(c),
      'replay_pdf_sha256',d.pdf_sha256,
      'tof_page_evidence',d.result->'evidence'->'tof',
      'archive_path',d.result->>'archive_path',
      'financial_certification_method','independent_issuer_pdf_two_readers',
      'manual_attestation',false))
  ON CONFLICT (event_key) DO NOTHING;

  UPDATE public.scpi_source_registry
  SET confidence_level='high', updated_at=now()
  WHERE scpi_slug=r.scpi_slug AND verification_status='verified'
    AND confidence_level='medium'
    AND issuer_source_sha256=r.issuer_source_sha256
    AND issuer_source_period='2026-T3'
    AND issuer_source_url=d.source_url;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'REC191_REGISTRY_NOT_RESTORED'; END IF;

  UPDATE public.scpi_metric_certifications
  SET source_url=d.source_url,source_page=6,
      evidence_text='TOF | 96,65 %',
      verification_status='independent_verified_official_bulletin',
      verification_method='archived_issuer_pdf_two_independent_readers',
      extraction_confidence=1,verified_at=now()
  WHERE id=c.id AND value_numeric=96.65
    AND verification_status='auto_verified_with_evidence'
    AND source_page IS NULL AND extraction_confidence<0.95;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'REC191_CERT_NOT_PROMOTED'; END IF;

  SELECT count(*)::integer INTO post_pass
  FROM public.scpi_crash_test_strict_v2 v
  JOIN maximus_agents.scpi_universe u USING(scpi_slug)
  WHERE u.lifecycle='existing' AND v.crash_test_status='PASS_100';
  IF post_pass<>prior_pass+1 OR NOT EXISTS (
    SELECT 1 FROM public.scpi_crash_test_strict_v2
    WHERE scpi_slug='iroko-atlas' AND crash_test_status='PASS_100'
      AND source_ready AND uncertified_tof_periods=0
  ) THEN RAISE EXCEPTION 'REC191_POST_ADMISSION_NOT_EXACTLY_PLUS_ONE'; END IF;

  INSERT INTO public.scpi_ingestion_events
    (scpi_slug,step,status,message,source_period,bulletin_url,
     extraction_confidence,metrics_count,ended_at)
  VALUES ('iroko-atlas','recovery191_original_issuer_tof_qa',
    'completed','Source confidence high preserved from unchanged verified SHA; TOF 96.65% page 6 independently read by MuPDF/Poppler. Exact source/PDF/historic evidence. No manual attestation and no other financial value changed.',
    '2026-T3',d.source_url,1,1,now());
END;
$proof$;
