-- RECOVERY-184: enrich the EXISTING CONTROL heartbeat; no new queue,
-- no financial mutation, no weakening of historical proof requirements.
-- Depends on recovery184_historical_tof_diagnostics.
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
   'historical_tof_quarantine',(
     SELECT jsonb_build_object(
       'view_version','recovery184-historical-tof-v1',
       'historical_quarantine_records',coalesce(sum(s.archived_quarantines),0)::int,
       'still_blocking_periods',coalesce(sum(s.still_blocking),0)::int,
       'already_reconciled_periods',coalesce(sum(s.already_reconciled),0)::int,
       'still_blocked_funds',count(*) FILTER(WHERE s.still_blocking>0)::int,
       'dispatched_tasks',0,
       'requires_independent_qa',true,
       'funds',coalesce(jsonb_agg(jsonb_build_object(
         'scpi_slug',s.scpi_slug,
         'blocking',s.still_blocking,
         'reconciled',s.already_reconciled,
         'aspim_rejections',s.aspim_rejections,
         'issuer_host_rejections',s.source_host_rejections,
         'blocked_with_exact_pdf',s.blocked_but_has_exact_pdf,
         'remaining_periods',coalesce(to_jsonb(s.remaining_periods),'[]'::jsonb),
         'state',CASE WHEN s.still_blocking=0 THEN 'RECONCILED_WITH_PROOF'
               ELSE 'SOURCE_REVIEW_REQUIRED' END
       ) ORDER BY s.scpi_slug),'[]'::jsonb)
     )
     FROM maximus_agents.scpi_historical_tof_quarantine_summary_v1 s
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


REVOKE ALL ON FUNCTION maximus_agents.refresh_existing_missing_metric_control()
 FROM PUBLIC,anon,authenticated;
