-- RECOVERY-220: Patrimmo Commerce 2026-T3 current capitalisation.
-- Source: issuer-authored 2026-T3 PDF, archived original SHA and two
-- independent geometric readers, plus issuer website as dated cross-check.
-- The old narrative explicitly reads "passe de 460 M€ à 209 M€".
-- No financial sign-off, PASS_100 or source-registry attestation is granted.

DO $recovery220$
DECLARE
  v_url text := 'https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo+Commerce_T3_2026_VDEF.pdf/629ca819-38be-867c-8edc-181f9159bf3b?t=1793990422410';
  v_sha text := '6f685b4657e12f246a209ce30bb11c246051d2c43276922420844db7d43f65b5';
  v_pdf_count integer;
  v_history_count integer;
  v_cert_count integer;
  v_rows integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('maximus:RECOVERY-220:patrimmo-commerce:2026-T3'));

  -- Only published historical cohort; refuse category drift, stale source
  -- binaries, reinterpretation of the issuer or ambiguous archived evidence.
  IF (SELECT count(*) FROM maximus_agents.scpi_universe WHERE lifecycle='existing')<>69
     OR (SELECT count(*) FROM public.scpi_crash_test_strict_v2)<>69
     OR NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_universe
                    WHERE scpi_slug='patrimmo-commerce' AND lifecycle='existing')
  THEN RAISE EXCEPTION 'REC220_COHORT_NOT_69_EXISTING'; END IF;

  SELECT count(*) INTO v_pdf_count
  FROM maximus_agents.scpi_bulletin_replay_documents d
  JOIN public.scpi_source_registry reg ON reg.scpi_slug=d.scpi_slug
  JOIN public.scpi_source_connectors conn ON conn.scpi_slug=d.scpi_slug AND conn.enabled
  JOIN public.scpi_bulletins b ON b.scpi_slug=d.scpi_slug
     AND b.period=d.source_period AND b.pdf_sha256=d.pdf_sha256 AND b.source_url=d.source_url
  WHERE d.scpi_slug='patrimmo-commerce' AND d.source_period='2026-T3'
    AND reg.last_document_period=d.source_period AND reg.bulletin_url=v_url
    AND d.source_url=v_url AND d.pdf_sha256=v_sha AND d.page_count>=5
    AND d.status='extracted' AND d.processing_complete IS TRUE
    AND d.result->>'identity_verified'='true'
    AND d.result->>'period_verified'='true'
    AND d.result->>'sha256'=v_sha
    AND d.field_coverage->>'capitalisation'='verified'
    AND d.result->'metrics'->>'capitalisation'='209'
    AND d.result->'evidence'->'capitalisation'->>'page'='4'
    AND d.result->'evidence'->'capitalisation'->>'value_match'='true'
    AND d.result->'evidence'->'capitalisation'->>'method'='dual_pdf_geometry'
    AND d.result->'evidence'->'capitalisation'->>'text' LIKE '%209,0 M%'
    AND d.result->'evidence'->'capitalisation'->>'poppler_text' LIKE '%209,0 M%'
    AND d.result->'evidence'->'capitalisation'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
    AND lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(conn.allowed_hosts);
  IF v_pdf_count<>1 THEN RAISE EXCEPTION 'REC220_MISSING_EXACT_DUAL_PDF_PROOF: %',v_pdf_count; END IF;

  SELECT count(*) INTO v_history_count FROM public.scpi_indicator_history h
  WHERE h.scpi_slug='patrimmo-commerce' AND h.source_period='2026-T3'
    AND h.capitalisation=460 AND h.qa_status='source_verified_t3_partial_metrics'
    AND h.source_url=v_url AND h.metric_provenance->'capitalisation'->>'sha256'=v_sha
    AND h.metric_provenance->'capitalisation'->>'source_page'='2';
  SELECT count(*) INTO v_cert_count FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug='patrimmo-commerce' AND c.source_period='2026-T3'
    AND c.metric='capitalisation' AND c.value_numeric=460
    AND c.source_page=2 AND c.verification_status='auto_verified_with_evidence'
    AND c.source_url=v_url
    AND c.evidence_text ILIKE '%passe de 460 M%209 M%';
  IF v_history_count<>1 OR v_cert_count<>1 THEN
    RAISE EXCEPTION 'REC220_UNEXPECTED_PREIMAGE: history %, cert %',v_history_count,v_cert_count;
  END IF;

  -- Source value is the CURRENT T3 figure, not the prior 460 M€ quoted
  -- in the narrative. Keep financial/issuer register certification pending.
  UPDATE public.scpi_indicator_history h
  SET capitalisation=209.0,
      metric_provenance=jsonb_set(coalesce(h.metric_provenance,'{}'::jsonb),
        '{capitalisation}',
        (coalesce(h.metric_provenance->'capitalisation','{}'::jsonb) ||
         jsonb_build_object(
           'unit','MEUR','sha256',v_sha,'source_url',v_url,'source_page',4,
           'reference_date','2026-09-30','document_period','2026-T3',
           'definition','current_capitalisation_issuer_bulletin',
           'verification_method','dual_pdf_geometry',
           'independent_engines',jsonb_build_array('MuPDF','Poppler'),
           'source_status','pending_independent_financial_qa',
           'prior_misparsed_value_meur',460,
           'recovery','RECOVERY-220')),
        true)
  WHERE h.scpi_slug='patrimmo-commerce' AND h.source_period='2026-T3'
    AND h.capitalisation=460 AND h.qa_status='source_verified_t3_partial_metrics'
    AND h.source_url=v_url AND h.metric_provenance->'capitalisation'->>'sha256'=v_sha;
  GET DIAGNOSTICS v_rows=ROW_COUNT;
  IF v_rows<>1 THEN RAISE EXCEPTION 'REC220_HISTORY_CARDINALITY %',v_rows; END IF;

  UPDATE public.scpi_metric_certifications c
  SET value_numeric=209.0,
      source_page=4,
      evidence_text='RECOVERY-220 | Exact issuer PDF SHA-256 '||v_sha||
        ' | page 4: CAPITALISATION 209,0 M EUR, MuPDF/Poppler independent geometric match.'||
        ' | issuer narrative page 2 says passes FROM 460 M EUR TO 209 M EUR.'||
        ' | independent financial QA pending; no source-registry approval.',
      verification_status='review_required_independent_financial_qa',
      verification_method='dual_pdf_geometry_current_value_pending_qa',
      verified_at=now() -- timestamp of documentary reconciliation, NOT final independent financial QA
  WHERE c.scpi_slug='patrimmo-commerce' AND c.source_period='2026-T3'
    AND c.metric='capitalisation' AND c.value_numeric=460
    AND c.source_page=2 AND c.source_url=v_url
    AND c.verification_status='auto_verified_with_evidence';
  GET DIAGNOSTICS v_rows=ROW_COUNT;
  IF v_rows<>1 THEN RAISE EXCEPTION 'REC220_CERT_CARDINALITY %',v_rows; END IF;

  INSERT INTO public.scpi_ingestion_events
    (scpi_slug,status,step,message,source_page_url,bulletin_url,
     source_period,extraction_confidence,metrics_count,ended_at)
  VALUES('patrimmo-commerce','completed',
    'recovery220_current_t3_capitalisation_reconciled',
    'RECOVERY-220 exact issuer PDF '||v_sha||
    '; correction historical/certificate financial numeric 460 -> 209 M EUR.'||
    ' T3 page 4 current capitalisation, two independent readers;'||
    ' old 460 quoted in page 2 narrative. Rejected as current value.'||
    ' Financial independent QA and complete source registry remain blocked.',
    'https://contrib.praemiareim.fr/fr/scpi-patrimmo-commerce',
    v_url,'2026-T3',0.98,1,now());

  -- A numeric repair does not authorize a new certification.
  IF NOT EXISTS(SELECT 1 FROM public.scpi_crash_test_strict_v2
      WHERE scpi_slug='patrimmo-commerce' AND crash_test_status='FAIL_STRICT')
  THEN RAISE EXCEPTION 'REC220_STRICT_GATE_CHANGED_UNEXPECTEDLY'; END IF;
END;
$recovery220$;

-- Preserve the repaired 2026-T3 current figure against stale 460 M€ replay,
-- while permitting explicit invalidation and finer precision (209.00679371).
CREATE OR REPLACE FUNCTION scpi_internal.guard_patrimmo_t3_capitalisation_current_v1()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog
AS $guard$
BEGIN
  IF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='scpi_indicator_history' THEN
    IF NEW.scpi_slug='patrimmo-commerce' AND NEW.source_period='2026-T3'
       AND coalesce(NEW.qa_status,'') NOT LIKE 'invalid%'
       AND (NEW.capitalisation IS NULL OR abs(NEW.capitalisation-209.0)>0.02)
    THEN RAISE EXCEPTION 'REC220_CURRENT_CAP_REPLAY_REJECTED: require verified issuer current T3 209 M EUR'; END IF;
  ELSIF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='scpi_metric_certifications' THEN
    IF NEW.scpi_slug='patrimmo-commerce' AND NEW.source_period='2026-T3'
       AND NEW.metric='capitalisation' AND coalesce(NEW.verification_status,'') NOT LIKE 'invalid%'
       AND (NEW.value_numeric IS NULL OR abs(NEW.value_numeric-209.0)>0.02)
    THEN RAISE EXCEPTION 'REC220_CERT_CURRENT_CAP_REPLAY_REJECTED: require issuer current T3 209 M EUR'; END IF;
  END IF;
  RETURN NEW;
END;
$guard$;
REVOKE ALL ON FUNCTION scpi_internal.guard_patrimmo_t3_capitalisation_current_v1() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_recovery220_current_cap_history ON public.scpi_indicator_history;
CREATE TRIGGER trg_recovery220_current_cap_history
BEFORE INSERT OR UPDATE OF capitalisation ON public.scpi_indicator_history
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_patrimmo_t3_capitalisation_current_v1();
DROP TRIGGER IF EXISTS trg_recovery220_current_cap_certificate ON public.scpi_metric_certifications;
CREATE TRIGGER trg_recovery220_current_cap_certificate
BEFORE INSERT OR UPDATE OF value_numeric ON public.scpi_metric_certifications
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_patrimmo_t3_capitalisation_current_v1();
