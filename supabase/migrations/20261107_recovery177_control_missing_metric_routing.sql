-- RECOVERY-177 — CONTROL consumes RECOVERY-175/176 triage, without a second queue.
-- Private, read-only routing recommendations; never grants PASS, never writes metrics.
CREATE OR REPLACE VIEW maximus_agents.scpi_missing_metric_control_routes_v1
WITH (security_invoker=true)
AS
WITH metric_gaps AS (
 SELECT t.scpi_slug,t.target_period,
   t.metric AS evidence_field,
   CASE t.evidence_status
     WHEN 'CONFLICT' THEN 'FINANCIAL_CONFLICT'
     WHEN 'EXTRACTION_REVIEW' THEN 'PARSER_REVIEW'
     WHEN 'UNCERTIFIED_EXTRACTION' THEN 'CERTIFICATE_REVIEW'
     WHEN 'EXTRACTION_FAILED' THEN 'PARSER_FAILURE'
     WHEN 'SOURCE_UNAVAILABLE' THEN 'DOCUMENT_ACCESS'
     WHEN 'UNVERIFIED_ABSENCE' THEN 'ABSENCE_NEEDS_SOURCE_PROOF'
     WHEN 'LAST_CERTIFIED_VALUE' THEN 'HISTORICAL_VALUE_REFRESH'
     ELSE 'UNRESOLVED_METRIC' END AS route_family,
   CASE WHEN t.evidence_status IN ('CONFLICT','UNCERTIFIED_EXTRACTION') THEN 'QA'
     WHEN t.evidence_status IN ('EXTRACTION_REVIEW','EXTRACTION_FAILED') THEN 'DATA'
     ELSE 'SEARCH' END AS owner_role,
   CASE t.evidence_status
     WHEN 'CONFLICT' THEN 0
     WHEN 'UNCERTIFIED_EXTRACTION' THEN 10
     WHEN 'EXTRACTION_REVIEW' THEN 12
     WHEN 'EXTRACTION_FAILED' THEN 12
     WHEN 'SOURCE_UNAVAILABLE' THEN 15
     WHEN 'UNVERIFIED_ABSENCE' THEN 18
     WHEN 'LAST_CERTIFIED_VALUE' THEN 30
     ELSE 40 END AS priority,
   1::int AS evidence_items
 FROM maximus_agents.scpi_missing_metric_triage_v1 t
 WHERE t.crash_test_status='FAIL_STRICT'
   AND t.evidence_status NOT IN ('VERIFIED','NOT_DISCLOSED','NOT_APPLICABLE')
), strict_gaps AS (
 SELECT v.scpi_slug, v.last_document_period AS target_period,
   null::text AS evidence_field, x.route_family, x.owner_role, x.priority,
   x.item_count::int AS evidence_items
 FROM public.scpi_crash_test_strict_v2 v
 JOIN maximus_agents.scpi_universe u USING(scpi_slug)
 CROSS JOIN LATERAL (VALUES
   ('INVALID_HISTORY','DATA',0,coalesce(v.invalid_rows,0)),
   ('OFFICIAL_SOURCE_HOST','SEARCH',0,coalesce(v.source_host_violations,0)),
   ('TOF_SOURCE_OR_VALUE','SEARCH',4,coalesce(v.missing_tof,0)),
   ('TOF_INDEPENDENT_QA','QA',4,coalesce(v.uncertified_tof_periods,0)),
   ('SOURCE_REGISTRY','SEARCH',8,CASE WHEN v.source_ready IS TRUE THEN 0::bigint ELSE 1::bigint END),
   ('QUARTERLY_HISTORY','DATA',12,coalesce(v.quarterly_blockers,0)),
   ('ANNUAL_HISTORY','DATA',12,coalesce(v.annual_blockers,0)+coalesce(v.annual_uncertified,0))
 ) x(route_family,owner_role,priority,item_count)
 WHERE u.lifecycle='existing' AND v.crash_test_status='FAIL_STRICT'
   AND x.item_count>0
), raw AS (
 SELECT * FROM metric_gaps
 UNION ALL
 SELECT * FROM strict_gaps
), grouped AS (
 SELECT scpi_slug,target_period,route_family,owner_role,min(priority)::int AS priority,
        sum(evidence_items)::int AS evidence_items,
        array_remove(array_agg(DISTINCT evidence_field ORDER BY evidence_field),NULL)::text[] AS affected_metrics
 FROM raw GROUP BY scpi_slug,target_period,route_family,owner_role
)
SELECT g.scpi_slug,g.target_period,g.route_family,g.owner_role,
  g.priority,g.evidence_items,g.affected_metrics,
  (SELECT count(*)::int FROM maximus_agents.tasks t
    WHERE t.status IN ('pending','running','blocked')
      AND t.payload->>'scpi_slug'=g.scpi_slug
      AND t.role=g.owner_role
   ) AS other_open_role_tasks_for_fund,
  true::boolean AS independent_qa_required,
  false::boolean AS task_dispatched,
  false::boolean AS financial_certified,
  false::boolean AS deploy_allowed
FROM grouped g;

REVOKE ALL ON maximus_agents.scpi_missing_metric_control_routes_v1 FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION maximus_agents.refresh_existing_missing_metric_control()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $function$
DECLARE summary jsonb; strict_pass integer; strict_fail integer; existing_total integer;
BEGIN
 SELECT count(*)::int, count(*) FILTER(WHERE v.crash_test_status='PASS_100')::int,
        count(*) FILTER(WHERE v.crash_test_status='FAIL_STRICT')::int
 INTO existing_total,strict_pass,strict_fail
 FROM public.scpi_crash_test_strict_v2 v
 JOIN maximus_agents.scpi_universe u USING(scpi_slug) WHERE u.lifecycle='existing';

 IF existing_total<1 OR strict_pass IS NULL OR strict_fail IS NULL OR strict_pass+strict_fail<>existing_total THEN
   RAISE EXCEPTION 'CONTROL_TRIAGE_UNEXPECTED_COHORT';
 END IF;

 SELECT jsonb_build_object(
   'version','recovery177-evidence-routing-v1',
   'observed_at',now(),
   'strategy','read_only_routing_proposal',
   'existing_total',existing_total,'strict_pass',strict_pass,'strict_fail',strict_fail,
   'new_tasks_created',0,
   'new_issues_created',0,
   'model_calls',0,
   'financial_certified',false,
   'deploy_allowed',false,
   'families',coalesce(jsonb_agg(jsonb_build_object(
       'route_family',f.route_family,
       'owner_role',f.owner_role,
       'priority',f.priority,
       'funds',f.funds,
       'evidence_items',f.evidence_items,
       'existing_role_task_overlaps',f.existing_role_task_overlaps,
       'sample_funds',to_jsonb(f.slugs[1:8]),
       'state','NOT_DISPATCHED_REQUIRES_SCOPED_PLAN'
     ) ORDER BY f.priority,f.route_family),'[]'::jsonb))
 INTO summary
 FROM (
   SELECT route_family,owner_role,min(priority)::int AS priority,
          count(DISTINCT scpi_slug)::int AS funds,
          sum(evidence_items)::int AS evidence_items,
          count(*) FILTER(WHERE other_open_role_tasks_for_fund>0)::int AS existing_role_task_overlaps,
          array_agg(DISTINCT scpi_slug ORDER BY scpi_slug) AS slugs
   FROM maximus_agents.scpi_missing_metric_control_routes_v1
   GROUP BY route_family,owner_role
 ) f;

 UPDATE maximus_agents.agents
 SET last_summary=coalesce(last_summary,'{}'::jsonb)||
       jsonb_build_object('existing_missing_metric_control',summary),
     heartbeat_at=now()
 WHERE role='CONTROL' AND enabled=true;
 IF NOT FOUND THEN RAISE EXCEPTION 'CONTROL_AGENT_UNAVAILABLE'; END IF;
 RETURN summary;
END;
$function$;

REVOKE ALL ON FUNCTION maximus_agents.refresh_existing_missing_metric_control()
  FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.refresh_existing_missing_metric_control() IS
 'Existing CONTROL heartbeat only; groups strict/metric failures by reusable cause, no queue/task insertion, no financial certification, no AI API calls.';
