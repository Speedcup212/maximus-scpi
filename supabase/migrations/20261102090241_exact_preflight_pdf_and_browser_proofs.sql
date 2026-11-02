-- Bind source-review readiness to the exact staged values, current official
-- PDF hash and complete browser matrix. No stale approval can certify changed data.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_browser_preflight_v3
WITH (security_invoker=true) AS
SELECT r.scpi_slug,
 coalesce(
  (r.review_evidence->'browser_smoke'->>'status')='PASS'
  AND (r.review_evidence->'browser_smoke'->>'run_url')
   LIKE 'https://github.com/Speedcup212/maximus-scpi/actions/runs/%'
  AND (r.review_evidence->'browser_smoke'->>'commit_sha') ~ '^[a-f0-9]{40}$'
  AND (r.review_evidence->'browser_smoke'->>'artifact_zip_sha256') ~ '^[a-f0-9]{64}$'
  AND (
   NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_candidate_indicator_stage s WHERE s.scpi_slug=r.scpi_slug)
   OR EXISTS (
    SELECT 1 FROM maximus_agents.scpi_candidate_indicator_stage s
    JOIN public.scpi_bulletins b ON b.scpi_slug=s.scpi_slug AND b.period=s.source_period AND b.source_url=s.source_url
    JOIN maximus_agents.scpi_candidate_pdf_validation p ON p.scpi_slug=s.scpi_slug
      AND p.source_period=s.source_period AND p.source_url=s.source_url AND p.document_kind='quarterly_bulletin'
    WHERE s.scpi_slug=r.scpi_slug AND p.document_identity_verified
      AND b.pdf_sha256=p.pdf_sha256 AND b.pdf_sha256=s.metric_provenance->>'pdf_sha256'
      AND public.scpi_is_strong_qa(b.qa_status)
      AND (to_jsonb(s)-ARRAY['staged_at','stage_note','updated_at','qa_status','source_type'])
       = ((r.review_evidence->'approved_analysis_snapshot'->'current_snapshot')
          -ARRAY['staged_at','stage_note','updated_at','qa_status','source_type'])
   )
  )
  AND NOT EXISTS (
   SELECT 1
   FROM (VALUES ('profile'),('comparator_analysis'),('radar'),('simulator'),
                ('client_card'),('trajectory')) expected(surface)
   CROSS JOIN (VALUES (1440),(390)) viewport(width)
   WHERE NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(
     CASE WHEN jsonb_typeof(r.review_evidence->'browser_smoke'->'cases')='array'
     THEN r.review_evidence->'browser_smoke'->'cases' ELSE '[]'::jsonb END) c
    WHERE c->>'slug'=r.scpi_slug AND c->>'surface'=expected.surface
      AND c->>'width'=viewport.width::text AND c->>'status'='PASS'
   )
  ),false) AS browser_contract_ready
FROM maximus_agents.scpi_candidate_final_review r;
REVOKE ALL ON maximus_agents.scpi_candidate_browser_preflight_v3 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_browser_preflight_v3 TO service_role;


CREATE OR REPLACE FUNCTION maximus_agents.restore_exact_reviewed_analysis()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path=pg_catalog,public,maximus_agents AS $$
DECLARE approved jsonb; staged jsonb;
BEGIN
 IF current_user NOT IN ('postgres','service_role') THEN RETURN NEW; END IF;
 SELECT r.review_evidence->'approved_analysis_snapshot',
        to_jsonb(s)-ARRAY['staged_at','stage_note','updated_at','qa_status','source_type']
 INTO approved,staged
 FROM maximus_agents.scpi_candidate_final_review r
 JOIN maximus_agents.scpi_candidate_indicator_stage s USING(scpi_slug)
 JOIN maximus_agents.scpi_candidate_release_circuit_v3 g USING(scpi_slug)
 JOIN public.scpi_bulletins b ON b.id=NEW.bulletin_id AND b.scpi_slug=NEW.scpi_slug
 JOIN maximus_agents.scpi_candidate_browser_preflight_v3 bp ON bp.scpi_slug=r.scpi_slug
 WHERE r.scpi_slug=NEW.scpi_slug AND s.source_period=NEW.source_period
  AND s.source_url=NEW.source_url AND g.financial_sources_ready AND g.allocations_verified
  AND g.independent_review_ready AND g.independent_audit_ready AND g.responsible_batch_ready
  AND bp.browser_contract_ready
  AND b.period=NEW.source_period AND b.source_url=NEW.source_url
  AND b.pdf_sha256=g.pdf_sha256 AND public.scpi_is_strong_qa(b.qa_status)
  AND public.scpi_is_strong_qa(NEW.qa_status) AND b.extraction_confidence>=0.95;
 IF approved IS NULL OR staged IS DISTINCT FROM
   (to_jsonb(NEW)-ARRAY['updated_at','qa_status','source_type']) THEN RETURN NEW; END IF;
 IF approved->>'current_period' IS DISTINCT FROM NEW.source_period
  OR approved->>'certified_source_url' IS DISTINCT FROM NEW.source_url
  OR approved->>'current_source_certified' IS DISTINCT FROM 'true'
  OR approved->>'certification_status' IS DISTINCT FROM 'certified'
  OR (approved->>'comparison_certified'='false' AND
     (jsonb_array_length(coalesce(approved->'improvements','[]'::jsonb))<>0
      OR jsonb_array_length(coalesce(approved->'deteriorations','[]'::jsonb))<>0
      OR jsonb_array_length(coalesce(approved->'certification_reasons','[]'::jsonb))=0))
 THEN RETURN NEW; END IF;
 UPDATE public.scpi_bulletin_analysis a SET
  current_period=q.current_period,previous_period=q.previous_period,status=q.status,
  risk_level=q.risk_level,trend_score=q.trend_score,improvements=q.improvements,
  deteriorations=q.deteriorations,alerts=q.alerts,watch_points=q.watch_points,
  current_snapshot=to_jsonb(NEW),previous_snapshot=q.previous_snapshot,
  summary=q.summary,analysis_version=q.analysis_version,generated_at=now(),
  certification_status=q.certification_status,certification_reasons=q.certification_reasons,
  current_source_certified=q.current_source_certified,comparison_certified=q.comparison_certified,
  structural_event_detected=q.structural_event_detected,certified_source_url=q.certified_source_url,
  certified_source_qa_status=NEW.qa_status,certified_at=now()
 FROM jsonb_populate_record(NULL::public.scpi_bulletin_analysis,approved) q
 WHERE a.scpi_slug=NEW.scpi_slug;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION maximus_agents.restore_exact_reviewed_analysis() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION maximus_agents.restore_exact_reviewed_analysis() TO service_role;
