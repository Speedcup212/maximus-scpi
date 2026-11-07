-- RECOVERY-179: exact hard blockers in strict PASS_100, not just diagnostic counters.
-- Does not change any PASS predicate, finance, quarantine or approval.
CREATE OR REPLACE VIEW maximus_agents.scpi_strict_actual_admission_v1
WITH (security_invoker=true) AS
WITH base AS (
 SELECT v.scpi_slug,v.last_document_period AS target_period,v.crash_test_status,
        v.source_ready,v.operational_status,v.trajectory_ready,v.quarterly_blockers,
        v.annual_blockers,v.annual_uncertified,v.missing_tof,
        v.uncertified_tof_periods,v.missing_source_url,v.source_host_violations,
        v.cap_consistency_issues,v.invalid_rows,
        coalesce((
          SELECT count(*)::int
          FROM maximus_agents.scpi_bulletin_replay_documents d
          WHERE d.scpi_slug=v.scpi_slug AND d.source_period=v.last_document_period
            AND d.status='extracted' AND d.processing_complete IS TRUE
            AND d.result->>'identity_verified'='true'
            AND d.result->>'period_verified'='true'
            AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'
        ),0) AS period_matched_pdf_proofs,
        coalesce((
          SELECT count(*)::int
          FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
          WHERE q.scpi_slug=v.scpi_slug
        ),0) AS historical_tof_quarantine_records
 FROM public.scpi_crash_test_strict_v2 v
 JOIN maximus_agents.scpi_universe u USING(scpi_slug)
 WHERE u.lifecycle='existing' AND v.crash_test_status='FAIL_STRICT'
), classified AS (
 SELECT b.*,
  (b.source_ready IS TRUE
   AND b.trajectory_ready IS TRUE
   AND coalesce(b.quarterly_blockers,0)=0
   AND coalesce(b.annual_blockers,0)=0
   AND coalesce(b.annual_uncertified,0)=0
   AND coalesce(b.missing_tof,0)=0
   AND coalesce(b.uncertified_tof_periods,0)=0
   AND coalesce(b.missing_source_url,0)=0
   AND coalesce(b.source_host_violations,0)=0
   AND coalesce(b.cap_consistency_issues,0)=0
   AND b.operational_status='DONE') AS all_explicit_strict_gates_green
 FROM base b
)
SELECT c.scpi_slug,c.target_period, route.route_family,route.owner_role,
       route.priority,route.blocking_items::int AS blocking_items,
       c.period_matched_pdf_proofs,c.historical_tof_quarantine_records,
       c.invalid_rows AS diagnostic_invalid_rows_not_direct_gate,
       true::boolean AS blocks_strict_pass,
       true::boolean AS independent_qa_required,
       false::boolean AS financial_certified,
       false::boolean AS deploy_allowed,
       false::boolean AS executes_remediation
FROM classified c
CROSS JOIN LATERAL (
 VALUES
 ('SOURCE_REGISTRY','SEARCH',0,CASE WHEN c.source_ready IS TRUE THEN 0::bigint ELSE 1::bigint END),
 ('QUARTERLY_DOCUMENT_QUEUE','DATA',0,coalesce(c.quarterly_blockers,0)),
 ('ANNUAL_DOCUMENT_QUEUE','DATA',0,coalesce(c.annual_blockers,0)),
 ('ANNUAL_INDEPENDENT_QA','QA',0,coalesce(c.annual_uncertified,0)),
 ('TOF_UNJUSTIFIED_ABSENCE','SEARCH',0,coalesce(c.missing_tof,0)),
 ('TOF_INDEPENDENT_CERT','QA',0,coalesce(c.uncertified_tof_periods,0)),
 ('SOURCE_URL_MISSING','SEARCH',0,coalesce(c.missing_source_url,0)),
 ('SOURCE_HOST_REJECTED','SEARCH',0,coalesce(c.source_host_violations,0)),
 ('CAPITALISATION_MISMATCH','ANALYST',0,coalesce(c.cap_consistency_issues,0)),
 ('TRAJECTORY_NOT_READY','DATA',0,CASE WHEN c.trajectory_ready IS TRUE THEN 0::bigint ELSE 1::bigint END),
 -- Fail closed: strict FAIL with every visible gate green. In the
 -- observed 68-fund cohort, these are three unresolved TOF quarantine rows.
 -- This is a diagnosis, NOT permission to ignore archived rejections.
 ('INDEPENDENT_STRICT_EVIDENCE_GUARD','QA',0,CASE WHEN c.all_explicit_strict_gates_green THEN 1::bigint ELSE 0::bigint END)
) route(route_family,owner_role,priority,blocking_items)
WHERE route.blocking_items>0;

REVOKE ALL ON maximus_agents.scpi_strict_actual_admission_v1
 FROM PUBLIC,anon,authenticated;
COMMENT ON VIEW maximus_agents.scpi_strict_actual_admission_v1 IS
 'RECOVERY-179: actual current hard-blocking strict certification reasons. Archived invalid_rows are diagnostic and must not be mistaken for a direct PASS_100 gate. No financial writes.';

-- Refresh the existing CONTROL planning function in place. No new agent and no
-- separate scheduler: enrich the existing summary with real strict blockers.
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
   'strict_admission_gates',(
     SELECT coalesce(jsonb_agg(jsonb_build_object(
       'route_family',x.route_family,
       'owner_role',x.owner_role,
       'funds',x.funds,
       'blocking_items',x.blocking_items,
       'with_exact_period_pdf',x.with_exact_period_pdf,
       'sample_funds',to_jsonb(x.slugs[1:8]),
       'state','NEEDS_INDEPENDENT_SOURCE_QA'
     ) ORDER BY x.route_family),'[]'::jsonb)
     FROM (
       SELECT route_family,owner_role,
         count(DISTINCT scpi_slug)::int AS funds,
         sum(blocking_items)::int AS blocking_items,
         count(DISTINCT scpi_slug) FILTER (WHERE period_matched_pdf_proofs>0)::int AS with_exact_period_pdf,
         array_agg(DISTINCT scpi_slug ORDER BY scpi_slug) AS slugs
       FROM maximus_agents.scpi_strict_actual_admission_v1
       GROUP BY route_family,owner_role
     ) x
   ),
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

REVOKE ALL ON FUNCTION maximus_agents.refresh_existing_missing_metric_control() FROM PUBLIC,anon,authenticated;
