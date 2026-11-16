-- RECOVERY-218: truthful 69-fund watchdog and explicit no-eligible-repair-task incident.
-- Existing table, existing watchdog/cron: zero new orchestrators, zero AI/API cost.
-- No changes to financial data, PDF source gates, QA or certificate status.
-- Invocation keeps SECURITY INVOKER and original 30-minute cron cadence.
CREATE OR REPLACE FUNCTION maximus_agents.watchdog_tick()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents', 'public'
AS $function$
declare
 v_enabled boolean;
 v_last timestamptz;
 v_pending integer;
 v_runnable integer;
 v_blocked integer;
 v_pass integer;
 v_fail integer;
 v_state text;
 v_incident boolean;
 v_total integer;
 v_candidates integer;
 v_expired integer;
 v_details jsonb;
 v_unrouted boolean;
begin
 perform pg_advisory_xact_lock(hashtext('maximus_agents:watchdog'));
 -- Automatically quarantine expired write leases; read-only audits can be retried.
 perform maximus_agents.reconcile_expired_tasks();
 select enabled into v_enabled from maximus_agents.settings where singleton=true;
 if v_enabled is null then raise exception 'maximus_agents.settings absent'; end if;
 select max(heartbeat_at) into v_last from maximus_agents.agents
 where role in ('DATA','ANALYST','SEARCH','QA') and enabled=true;
 select count(*) into v_pending from maximus_agents.tasks
 where status in ('pending','running');
 -- Runnable distinct from quota-exhausted/blocked/dependent work.
 select count(*) into v_runnable
 from maximus_agents.agent_operational_status a
 where a.operational_state='READY_OR_WAITING' AND a.pending_today>0;
 select count(*) into v_blocked from maximus_agents.issues
 where status='blocked';
 -- Count only published historical cohort, not provisional candidates.
 select count(*) filter (where c.crash_test_status='PASS_100'),
        count(*) filter (where c.crash_test_status is distinct from 'PASS_100'),
        count(*)
 into v_pass,v_fail,v_total
 from maximus_agents.scpi_universe u
 left join public.scpi_crash_test_strict_v2 c on c.scpi_slug=u.scpi_slug
 where u.lifecycle='existing';
 if v_total<69 OR v_total<>(select count(*) from public.scpi_crash_test_strict_v2)
 then raise exception 'Strict SCPI cohort drift: registry %, strict %',v_total,(select count(*) from public.scpi_crash_test_strict_v2); end if;
 select count(*) into v_candidates from maximus_agents.scpi_universe where lifecycle='candidate';
 select count(*) into v_expired from maximus_agents.tasks
 where status='running' and lease_until<now();
 -- The queue must not report a healthy idle state when strict failures have no eligible owners.
 v_unrouted := v_enabled AND v_fail>0 AND v_runnable=0;
 v_state := case
   when not v_enabled then 'DISABLED'
   when v_expired>0 then 'STALE'
   when v_pending=0 then 'IDLE'
   when v_runnable=0 then 'IDLE'
   when v_last is null or v_last<now()-interval '2 hours' then 'STALE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,'runnable_roles',v_runnable,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
    'baseline_count',v_total,'candidate_count',v_candidates,'expired_tasks',v_expired,
    'runner_state',v_state,'policy_wait',v_pending>0 AND v_runnable=0,
    'strict_repair_route',CASE WHEN v_unrouted THEN 'NO_ELIGIBLE_REPAIR_TASK' WHEN v_fail>0 THEN 'ACTIVE_OR_POLICY_WAIT' ELSE 'COMPLETE' END,
    'unrouted_strict_failures',CASE WHEN v_unrouted THEN v_fail ELSE 0 END,
    'note','Observation only: pg_cron does not execute AI workers, deploy or alter financial data'
 );
 insert into maximus_agents.watchdog_observations
   (control_enabled,last_worker_heartbeat,pending_tasks,blocked_issues,strict_pass,strict_fail,runner_state,details)
 values(v_enabled,v_last,v_pending,v_blocked,v_pass,v_fail,v_state,v_details);
 v_incident := v_enabled and v_state='STALE' and v_runnable>0;
 if v_incident then
    insert into maximus_agents.watchdog_incidents(incident_code,evidence)
    values('AI_WORKERS_STALLED',v_details)
    on conflict (incident_code) do update
    set active=true,last_seen=now(),occurrences=maximus_agents.watchdog_incidents.occurrences+1,
        evidence=excluded.evidence,resolved_at=null;
 else
    update maximus_agents.watchdog_incidents set active=false,resolved_at=now(),
       last_seen=now(),evidence=v_details
    where incident_code='AI_WORKERS_STALLED' and active;
 end if;
 if v_fail>0 then
    insert into maximus_agents.watchdog_incidents(incident_code,evidence)
    values('SCPI_STRICT_FAILURES',v_details)
    on conflict (incident_code) do update
    set active=true,last_seen=now(),occurrences=maximus_agents.watchdog_incidents.occurrences+1,
       evidence=excluded.evidence,resolved_at=null;
 else
    update maximus_agents.watchdog_incidents
    set active=false,resolved_at=now(),last_seen=now(),evidence=v_details
    where incident_code='SCPI_STRICT_FAILURES' and active;
 end if;
 -- Distinguish "no eligible repair work" from a cron that successfully polled.
 -- Never fabricate claims, skip PDF QA, or reset task attempts.
 IF v_unrouted THEN
   INSERT INTO maximus_agents.watchdog_incidents(incident_code,evidence)
   VALUES('CERTIFICATION_NO_ELIGIBLE_TASKS',v_details)
   ON CONFLICT (incident_code) DO UPDATE
     SET active=true,last_seen=now(),
         occurrences=maximus_agents.watchdog_incidents.occurrences+1,
         evidence=excluded.evidence,resolved_at=null;
 ELSE
   UPDATE maximus_agents.watchdog_incidents
     SET active=false,resolved_at=now(),last_seen=now(),evidence=v_details
   WHERE incident_code='CERTIFICATION_NO_ELIGIBLE_TASKS' AND active;
 END IF;
 -- keep 90 days of monitoring; issues remain until resolved
 delete from maximus_agents.watchdog_observations
 where observed_at < now()-interval '90 days';
 return v_details;
end
$function$
;
