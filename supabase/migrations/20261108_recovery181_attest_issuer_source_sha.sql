-- RECOVERY-181 — Source *provenance* is distinct from parser field coverage.
-- A previously issuer-linked exact PDF with two independent readers can
-- attest official document origin even if the generic parser captures <10 fields.
-- Do NOT change metric values, independent financial QA or strict PASS_100 rules.
ALTER TABLE public.scpi_source_registry
  ADD COLUMN IF NOT EXISTS issuer_source_sha256 text,
  ADD COLUMN IF NOT EXISTS issuer_source_period text,
  ADD COLUMN IF NOT EXISTS issuer_source_url text,
  ADD COLUMN IF NOT EXISTS issuer_source_publisher_url text,
  ADD COLUMN IF NOT EXISTS issuer_source_verified_at timestamptz;

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.scpi_source_registry'::regclass AND conname='scpi_source_registry_independent_pdf_shape') THEN
   ALTER TABLE public.scpi_source_registry
     ADD CONSTRAINT scpi_source_registry_independent_pdf_shape CHECK (
       issuer_source_sha256 IS NULL OR (
         issuer_source_sha256 ~ '^[0-9a-f]{64}$'
         AND issuer_source_period ~ '^20[0-9]{2}-T[1-4]$'
         AND issuer_source_url ~ '^https://[^/]+/'
         AND issuer_source_publisher_url ~ '^https://[^/]+/'
         AND issuer_source_verified_at IS NOT NULL
       )
     );
 END IF;
END $$;

CREATE OR REPLACE FUNCTION maximus_agents.attest_verified_issuer_source_v1(p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $function$
DECLARE outcome jsonb;
BEGIN
 IF p_limit<1 OR p_limit>10 THEN RAISE EXCEPTION 'RECOVERY181_LIMIT_REJECTED'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:attest_verified_issuer_source_v1'));
 WITH eligible AS MATERIALIZED (
 SELECT DISTINCT ON(r.id)
  r.id,r.scpi_slug,r.verification_status AS previous_status,
  r.confidence_level AS previous_confidence,r.last_document_period,
  r.bulletin_url,d.pdf_sha256,
  x.result->'source_resolution'->>'publisher_page' AS issuer_publisher_page,
  c.value_numeric AS certified_tof,c.source_page AS tof_page,
  (d.result->'metrics'->>'capitalisation')::numeric AS extracted_capitalisation
 FROM public.scpi_source_registry r
 JOIN maximus_agents.scpi_universe u ON u.scpi_slug=r.scpi_slug AND u.lifecycle='existing'
 JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=r.scpi_slug
      AND v.crash_test_status='FAIL_STRICT' AND v.last_document_period=r.last_document_period
 JOIN maximus_agents.scpi_bulletin_replay_documents d ON
      d.scpi_slug=r.scpi_slug AND d.source_period=r.last_document_period
      AND d.source_url=r.bulletin_url AND d.status='extracted'
      AND d.processing_complete IS TRUE
      AND d.result->>'identity_verified'='true'
      AND d.result->>'period_verified'='true'
      AND d.result->>'sha256'=d.pdf_sha256
      AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'
      AND d.field_coverage->>'tof'='verified'
      AND d.field_coverage->>'capitalisation'='verified'
      AND d.result->'evidence'->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
      AND d.result->'evidence'->'capitalisation'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
      AND d.result->'evidence'->'tof'->>'value_match'='true'
      AND d.result->'evidence'->'capitalisation'->>'value_match'='true'
 JOIN maximus_agents.scpi_bulletin_replay_documents x ON
      x.scpi_slug=r.scpi_slug AND x.source_period=r.last_document_period
      AND x.status='source_reference_resolved'
      AND x.result->'source_resolution'->>'linked_url'=r.bulletin_url
      AND x.result->'source_resolution'->>'sha256'=d.pdf_sha256
 JOIN public.scpi_source_connectors allowed ON allowed.scpi_slug=r.scpi_slug
 JOIN public.scpi_metric_certifications c ON c.scpi_slug=r.scpi_slug
      AND c.source_period=r.last_document_period AND c.metric='tof'
      AND c.source_url=r.bulletin_url
      AND c.verification_status='auto_verified_with_evidence'
      AND c.extraction_confidence>=0.95 AND c.source_page>0
 JOIN public.scpi_indicator_history h ON h.scpi_slug=r.scpi_slug
      AND h.source_period=r.last_document_period
      AND h.qa_status NOT LIKE 'invalid%'
      AND h.tof=c.value_numeric
      AND h.metric_provenance->'tof'->>'sha256'=d.pdf_sha256
      AND h.metric_provenance->'capitalisation'->>'sha256'=d.pdf_sha256
      AND h.metric_provenance->'tof'->>'source_page'=c.source_page::text
 WHERE r.verification_status='verified' AND r.confidence_level='medium'
      AND r.last_error IS NULL AND r.issuer_source_sha256 IS NULL
      AND r.bulletin_url LIKE 'https://%'
      AND lower(split_part(split_part(r.bulletin_url,'://',2),'/',1))=ANY(allowed.allowed_hosts)
      AND lower(split_part(split_part(x.result->'source_resolution'->>'publisher_page','://',2),'/',1))=ANY(allowed.allowed_hosts)
      AND jsonb_typeof(d.result->'metrics'->'tof')='number'
      AND jsonb_typeof(d.result->'metrics'->'capitalisation')='number'
      AND CASE WHEN jsonb_typeof(d.result->'metrics'->'tof')='number' THEN (d.result->'metrics'->>'tof')::numeric ELSE NULL END=c.value_numeric
      AND CASE WHEN jsonb_typeof(d.result->'metrics'->'capitalisation')='number' THEN (d.result->'metrics'->>'capitalisation')::numeric ELSE NULL END=h.capitalisation
      AND d.result->'evidence'->'tof'->>'page'=c.source_page::text
      AND h.metric_provenance->'capitalisation'->>'source_page'=d.result->'evidence'->'capitalisation'->>'page'
      AND position(d.pdf_sha256 IN coalesce(c.evidence_text,''))>0
      AND c.evidence_text ILIKE '%MuPDF%' AND c.evidence_text ILIKE '%Poppler%'
      AND scpi_internal.tof_bulletin_source_rejection_reason(
        c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 quarantine
        WHERE quarantine.scpi_slug=r.scpi_slug AND quarantine.source_period=r.last_document_period
      )
 ORDER BY r.id,c.verified_at DESC NULLS LAST,x.processed_at DESC NULLS LAST
 LIMIT p_limit
 ), changed AS (
  UPDATE public.scpi_source_registry r
  SET confidence_level='high',
      issuer_source_sha256=e.pdf_sha256,
      issuer_source_period=e.last_document_period,
      issuer_source_url=e.bulletin_url,
      issuer_source_publisher_url=e.issuer_publisher_page,
      issuer_source_verified_at=now(),
      last_verified_at=now(),updated_at=now()
  FROM eligible e
  WHERE r.id=e.id AND r.verification_status=e.previous_status
      AND r.confidence_level=e.previous_confidence
      AND r.last_document_period=e.last_document_period
      AND r.bulletin_url=e.bulletin_url
      AND r.issuer_source_sha256 IS NULL
  RETURNING r.id,r.scpi_slug,r.last_document_period
 ), audit AS (
  INSERT INTO public.scpi_ingestion_events
   (scpi_slug,status,step,message,source_page_url,bulletin_url,
    source_period,extraction_confidence,metrics_count,ended_at)
  SELECT e.scpi_slug,'completed','recovery181_issuer_source_attested',
    'RECOVERY-181 issuer source evidence before: verified/medium, after verified/high;'||
    ' PDF sha256='||e.pdf_sha256||
    '; TOF='||e.certified_tof::text||' page='||e.tof_page::text||
    '; cap='||e.extracted_capitalisation::text||
    '; page and two engines verified for both. No financial data/QA changes.',
    e.issuer_publisher_page,e.bulletin_url,e.last_document_period,0.98,2,now()
  FROM eligible e JOIN changed w ON w.id=e.id
  RETURNING scpi_slug,source_period
 )
 SELECT jsonb_build_object('updated',count(*)::int,
   'funds',coalesce(jsonb_agg(jsonb_build_object('scpi_slug',scpi_slug,'period',source_period)),'[]'::jsonb),
   'metrics_updated',0,'certificates_inserted',0,
   'independent_source_provenance_verified',true,
   'financial_QA_changed',false,
   'deploy_allowed',false) INTO outcome FROM audit;
 RETURN outcome;
END
$function$;

REVOKE ALL ON FUNCTION maximus_agents.attest_verified_issuer_source_v1(integer)
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.attest_verified_issuer_source_v1(integer) IS
 'Private one-shot official-source provenance attestation with issuer HTML-to-PDF SHA and two independent PDF readers, not financial certification.';
