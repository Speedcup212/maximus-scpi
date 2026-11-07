-- RECOVERY-180: reconcile a stale TOF-not-found backfill gate only when
-- source period, issuer page, original PDF SHA, TWO independent PDF readers,
-- certified value/page and canonical history all agree.
-- No number, TOF source, certificate, history QA or crash-test predicate changes.
-- The existing ingestion_events table receives the pre-image for every write.
CREATE OR REPLACE FUNCTION maximus_agents.reconcile_stale_tof_backfill_v1(p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $function$
DECLARE outcome jsonb;
BEGIN
  IF p_limit < 1 OR p_limit > 10 THEN RAISE EXCEPTION 'RECOVERY180_LIMIT_REJECTED'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:reconcile_stale_tof_backfill_v1'));
  WITH eligible AS MATERIALIZED (
    SELECT DISTINCT ON(q.id)
      q.id, q.scpi_slug, q.source_period, q.status AS prior_status,
      q.verification_status AS prior_verification_status, q.last_error AS prior_error,
      q.source_url, d.pdf_sha256, d.result->'evidence'->'tof'->>'page' AS page,
      c.value_numeric AS certified_tof,
      x.result->'source_resolution'->>'publisher_page' AS publisher_page
    FROM public.scpi_backfill_queue q
    JOIN maximus_agents.scpi_universe u ON u.scpi_slug=q.scpi_slug AND u.lifecycle='existing'
    JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=q.scpi_slug
        AND v.crash_test_status='FAIL_STRICT' AND v.last_document_period=q.source_period
    JOIN public.scpi_indicator_history h ON h.scpi_slug=q.scpi_slug
        AND h.source_period=q.source_period AND h.tof IS NOT NULL
        AND h.source_url=q.source_url AND h.source_confidence>=0.95
        AND h.qa_status NOT LIKE 'invalid%'
    JOIN public.scpi_metric_certifications c ON c.scpi_slug=q.scpi_slug
        AND c.source_period=q.source_period AND c.metric='tof'
        AND c.source_url=q.source_url AND c.value_numeric=h.tof
        AND c.verification_status='auto_verified_with_evidence'
        AND c.extraction_confidence>=0.95 AND c.source_page>0
    JOIN maximus_agents.scpi_bulletin_replay_documents d
        ON d.scpi_slug=q.scpi_slug AND d.source_period=q.source_period
        AND d.source_url=q.source_url
        AND d.status='extracted' AND d.processing_complete IS TRUE
        AND d.result->>'identity_verified'='true'
        AND d.result->>'period_verified'='true'
        AND d.field_coverage->>'tof'='verified'
        AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'
    JOIN maximus_agents.scpi_bulletin_replay_documents x
        ON x.scpi_slug=q.scpi_slug AND x.source_period=q.source_period
        AND x.status='source_reference_resolved'
        AND x.result->'source_resolution'->>'linked_url'=q.source_url
        AND x.result->'source_resolution'->>'sha256'=d.pdf_sha256
    JOIN public.scpi_source_connectors host ON host.scpi_slug=q.scpi_slug
    WHERE q.source_kind='bulletin' AND q.status='qa_review'
      AND q.verification_status='needs_review'
      AND q.last_error='tof_not_found_or_not_period_bound'
      AND lower(split_part(split_part(q.source_url,'://',2),'/',1))=ANY(host.allowed_hosts)
      AND lower(split_part(split_part(x.result->'source_resolution'->>'publisher_page','://',2),'/',1))=ANY(host.allowed_hosts)
      AND (d.result->>'sha256')=d.pdf_sha256
      AND (d.result->>'period')=q.source_period
      AND (d.result->'evidence'->'tof'->>'value_match')='true'
      AND (d.result->'evidence'->'tof'->>'definition')='reported_metric'
      AND d.result->'evidence'->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
      AND jsonb_typeof(d.result->'metrics'->'tof')='number'
      AND CASE WHEN jsonb_typeof(d.result->'metrics'->'tof')='number'
        THEN (d.result->'metrics'->>'tof')::numeric ELSE NULL END=c.value_numeric
      AND CASE WHEN jsonb_typeof(d.result->'evidence'->'tof'->'value')='number'
        THEN (d.result->'evidence'->'tof'->>'value')::numeric ELSE NULL END=c.value_numeric
      AND (d.result->'evidence'->'tof'->>'page')=c.source_page::text
      AND h.metric_provenance->'tof'->>'sha256'=d.pdf_sha256
      AND h.metric_provenance->'tof'->>'source_page'=c.source_page::text
      AND position(d.pdf_sha256 IN coalesce(c.evidence_text,''))>0
      AND c.evidence_text ILIKE '%MuPDF%'
      AND c.evidence_text ILIKE '%Poppler%'
      AND scpi_internal.tof_bulletin_source_rejection_reason(
        c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 quarantine
        WHERE quarantine.scpi_slug=q.scpi_slug AND quarantine.source_period=q.source_period
      )
    ORDER BY q.id,c.verified_at DESC NULLS LAST,d.processed_at DESC NULLS LAST,
             x.processed_at DESC NULLS LAST
    LIMIT p_limit
  ), changed AS (
    UPDATE public.scpi_backfill_queue q
    SET status='already_loaded', verification_status='dual_pdf_page_evidence_verified',
        last_error=NULL,updated_at=now()
    FROM eligible e
    WHERE q.id=e.id AND q.status=e.prior_status
      AND q.verification_status=e.prior_verification_status
      AND q.last_error=e.prior_error
    RETURNING q.id,q.scpi_slug,q.source_period
  ), audit AS (
    INSERT INTO public.scpi_ingestion_events
     (scpi_slug,status,step,message,source_page_url,bulletin_url,
      source_period,extraction_confidence,metrics_count,ended_at)
    SELECT e.scpi_slug,'completed','recovery180_stale_tof_queue_reconciled',
      'RECOVERY-180 before: status='||e.prior_status||
      ', verification='||e.prior_verification_status||
      ', error='||e.prior_error||'; after: already_loaded,'||
      ' dual_pdf_page_evidence_verified; TOF='||e.certified_tof::text||
      '; page='||e.page||'; sha256='||e.pdf_sha256||
      '; independent readers MuPDF+Poppler; QA and finance unchanged',
      e.publisher_page,e.source_url,e.source_period,0.98,1,now()
    FROM eligible e JOIN changed z ON z.id=e.id
    RETURNING scpi_slug,source_period
  )
  SELECT jsonb_build_object('updated',count(*)::int,'funds',coalesce(
    jsonb_agg(jsonb_build_object('scpi_slug',scpi_slug,'source_period',source_period)),
    '[]'::jsonb),'financial_certified',false,'deploy_allowed',false,
    'metric_changes',0) INTO outcome FROM audit;
  RETURN outcome;
END;
$function$;
REVOKE ALL ON FUNCTION maximus_agents.reconcile_stale_tof_backfill_v1(integer)
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.reconcile_stale_tof_backfill_v1(integer) IS
 'Reconcile only obsolete TOF-not-found queue statuses based on exact issuer-linked dual-reader SHA/page/value proof. No financial changes, no relaxation. Private manual invocation.';
