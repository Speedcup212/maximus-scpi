-- RECOVERY-182: Source provenance for an exact FIRST-PARTY issuer PDF.
-- The certificate of the original document is independent of generic field
-- extraction completeness. Do not certify any missing numeric metric.
-- Reuses the RECOVERY-181 SHA attestation columns, never relaxes PASS_100.
CREATE OR REPLACE FUNCTION maximus_agents.attest_first_party_issuer_pdf_v1(p_scpi_slug text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $function$
DECLARE outcome jsonb;
BEGIN
 IF p_scpi_slug IS NULL OR p_scpi_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    THEN RAISE EXCEPTION 'RECOVERY182_SCOPED_SCPI_REQUIRED'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:attest_first_party_issuer_pdf:'||p_scpi_slug));
 WITH eligible AS MATERIALIZED (
 SELECT DISTINCT ON(r.id)
    r.id,r.scpi_slug,r.verification_status AS prior_verification,
    r.confidence_level AS prior_confidence,
    r.last_error AS prior_error,r.last_document_period AS source_period,
    r.bulletin_url AS source_url,d.pdf_sha256,
    r.official_scpi_page_url AS issuer_page,
    c.value_numeric AS tof,c.source_page AS tof_page,
    cap.value_numeric AS capitalization,cap.source_page AS cap_page
 FROM public.scpi_source_registry r
 JOIN maximus_agents.scpi_universe u ON u.scpi_slug=r.scpi_slug AND u.lifecycle='existing'
 JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=r.scpi_slug
    AND v.crash_test_status='FAIL_STRICT' AND v.last_document_period=r.last_document_period
 JOIN public.scpi_source_connectors allowed ON allowed.scpi_slug=r.scpi_slug
 JOIN public.scpi_bulletins b ON b.scpi_slug=r.scpi_slug
    AND b.period=r.last_document_period AND b.source_url=r.bulletin_url
 JOIN maximus_agents.scpi_bulletin_replay_documents d
    ON d.scpi_slug=r.scpi_slug AND d.source_period=r.last_document_period
    AND d.source_url=r.bulletin_url AND d.status='extracted'
    AND d.processing_complete IS TRUE AND d.result->>'identity_verified'='true'
    AND d.result->>'period_verified'='true'
    AND d.result->>'sha256'=d.pdf_sha256 AND d.pdf_sha256=b.pdf_sha256
    AND d.pdf_sha256 ~ '^[0-9a-f]{64}$'
    AND d.field_coverage->>'capitalisation'='verified'
    AND d.result->'evidence'->'capitalisation'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
    AND d.result->'evidence'->'capitalisation'->>'value_match'='true'
 JOIN public.scpi_metric_certifications c
    ON c.scpi_slug=r.scpi_slug AND c.source_period=r.last_document_period
    AND c.metric='tof' AND c.source_url=r.bulletin_url
    AND c.verification_status LIKE 'manual_verified_official%'
    AND c.source_page>0 AND c.extraction_confidence>=0.95
 JOIN public.scpi_metric_certifications cap
    ON cap.scpi_slug=r.scpi_slug AND cap.source_period=r.last_document_period
    AND cap.metric='capitalisation' AND cap.source_url=r.bulletin_url
    AND cap.verification_status='auto_verified_with_evidence'
    AND cap.source_page>0 AND cap.extraction_confidence>=0.95
 JOIN public.scpi_indicator_history h
    ON h.scpi_slug=r.scpi_slug AND h.source_period=r.last_document_period
    AND h.qa_status NOT LIKE 'invalid%'
    AND h.tof=c.value_numeric AND h.capitalisation=cap.value_numeric
    AND h.metric_provenance->'tof'->>'sha256'=d.pdf_sha256
    AND h.metric_provenance->'capitalisation'->>'sha256'=d.pdf_sha256
    AND h.metric_provenance->'tof'->>'source_page'=c.source_page::text
    AND h.metric_provenance->'capitalisation'->>'source_page'=cap.source_page::text
 WHERE r.scpi_slug=p_scpi_slug AND r.verification_status='incomplete'
    AND r.confidence_level='high'
    AND r.last_error='Extraction existante partielle'
    AND r.issuer_source_sha256 IS NULL
    AND r.official_scpi_page_url LIKE 'https://%'
    AND r.bulletin_url LIKE 'https://%.pdf'
    AND lower(split_part(split_part(r.bulletin_url,'://',2),'/',1))
        =lower(split_part(split_part(r.official_scpi_page_url,'://',2),'/',1))
    AND lower(split_part(split_part(r.bulletin_url,'://',2),'/',1))
        =ANY(allowed.allowed_hosts)
    AND lower(split_part(split_part(r.bulletin_url,'://',2),'/',1))
        =lower(split_part(split_part(r.source_domain,'://',2),'/',1))
    AND d.result->'evidence'->'capitalisation'->>'page'=cap.source_page::text
    AND CASE WHEN jsonb_typeof(d.result->'metrics'->'capitalisation')='number'
         THEN (d.result->'metrics'->>'capitalisation')::numeric ELSE NULL END=cap.value_numeric
    AND position(d.pdf_sha256 IN coalesce(c.evidence_text,''))>0
    AND position(d.pdf_sha256 IN coalesce(cap.evidence_text,''))>0
    AND scpi_internal.tof_bulletin_source_rejection_reason(
      c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
      WHERE q.scpi_slug=r.scpi_slug AND q.source_period=r.last_document_period
    )
    AND EXISTS (
      SELECT 1 FROM public.scpi_ingestion_events e
      WHERE e.scpi_slug=r.scpi_slug AND e.source_period=r.last_document_period
        AND e.bulletin_url=r.bulletin_url AND e.source_page_url=r.bulletin_url
        AND e.step IN ('edge_dedup','edge_staged_independent_qa')
        AND e.status IN ('unchanged','needs_review')
    )
 ORDER BY r.id,c.verified_at DESC NULLS LAST,cap.verified_at DESC NULLS LAST
 LIMIT 1
 ), changed AS (
 UPDATE public.scpi_source_registry r
 SET verification_status='verified',
     confidence_level='high',
     issuer_source_sha256=e.pdf_sha256,
     issuer_source_period=e.source_period,
     issuer_source_url=e.source_url,
     issuer_source_publisher_url=e.issuer_page,
     issuer_source_verified_at=now(),
     last_verified_at=now(),
     last_error=NULL,
     updated_at=now()
 FROM eligible e
 WHERE r.id=e.id AND r.verification_status=e.prior_verification
     AND r.confidence_level=e.prior_confidence
     AND r.last_error=e.prior_error
     AND r.last_document_period=e.source_period
     AND r.bulletin_url=e.source_url
     AND r.issuer_source_sha256 IS NULL
 RETURNING r.id,r.scpi_slug,r.last_document_period
 ), audit AS (
 INSERT INTO public.scpi_ingestion_events
   (scpi_slug,status,step,message,source_page_url,bulletin_url,
    source_period,extraction_confidence,metrics_count,ended_at)
 SELECT e.scpi_slug,'completed','recovery182_first_party_issuer_source_attested',
    'RECOVERY-182 old status='||e.prior_verification||'/'||e.prior_confidence||
    ' last_error='||e.prior_error||
    '; certified *issuer PDF provenance* only, new status verified/high;'||
    ' SHA256='||e.pdf_sha256||'; manually verified exact TOF='||e.tof::text||
    ' p'||e.tof_page::text||'; independent cap='||e.capitalization::text||
    ' p'||e.cap_page::text||
    '; generic field extraction remains partially reviewed in scpi_bulletins.',
    e.issuer_page,e.source_url,e.source_period,0.98,2,now()
 FROM eligible e JOIN changed w ON w.id=e.id
 RETURNING scpi_slug,source_period
 )
 SELECT jsonb_build_object('updated',count(*)::int,
   'funds',coalesce(jsonb_agg(jsonb_build_object('scpi_slug',scpi_slug,'period',source_period)),'[]'::jsonb),
   'financial_values_changed',false,
   'financial_certificates_created',0,
   'qa_partial_metrics_remain',true,
   'deploy_allowed',false) INTO outcome FROM audit;
 RETURN outcome;
END;
$function$;
REVOKE ALL ON FUNCTION maximus_agents.attest_first_party_issuer_pdf_v1(text)
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.attest_first_party_issuer_pdf_v1(text) IS
 'Private scoped first-party issuer document proof, manually verified TOF and dual-reader cap; no numeric QA or missing field promotion.';
