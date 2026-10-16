-- MaximusSCPI runtime recovery, applied on 2026-10-16 and mirrored to Git.
-- Publishable existing cohort is distinct from private candidate preparation.
-- Expired write leases are quarantined rather than blindly replayed.
-- No candidate publication, no Netlify deploy, no change to financial values.
CREATE OR REPLACE FUNCTION maximus_agents.reconcile_expired_tasks()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents'
AS $function$
DECLARE
 t maximus_agents.tasks;
 recovered integer := 0;
 blocked integer := 0;
 evidence jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:reconcile-expired'));
 FOR t IN
  SELECT * FROM maximus_agents.tasks
  WHERE status='running' AND lease_until IS NOT NULL AND lease_until<now()
  FOR UPDATE SKIP LOCKED
 LOOP
  evidence := jsonb_build_object(
   'summary','Bail expire : execution non certifiee. Relecture des preuves et de l etat actuel requise avant toute mutation.',
   'verdict','REVIEW',
   'recovery_code','LEASE_EXPIRED_RECONCILED',
   'expired_task',t.id,
   'attempts',t.attempts,
   'evidence',jsonb_build_array(jsonb_build_object(
    'source','maximus_agents.tasks.lease_until',
    'observed_at',now(),
    'finding','Bail expire; aucun succes d execution ou de QA presume'
   ))
  );
  UPDATE maximus_agents.runs
  SET status='expired',finished_at=now(),result=evidence
  WHERE task_id=t.id AND lease_token=t.lease_token AND status='running';
  IF t.kind='audit' AND t.attempts<2 THEN
   UPDATE maximus_agents.tasks SET status='pending',result=evidence,
    lease_token=null,lease_until=null,updated_at=now(),completed_at=null
   WHERE id=t.id;
   recovered := recovered+1;
  ELSE
   -- Executions that may have side effects require revalidation, not blind replay.
   UPDATE maximus_agents.tasks SET status='blocked',result=evidence,
    lease_token=null,lease_until=null,updated_at=now(),completed_at=now()
   WHERE id=t.id;
   UPDATE maximus_agents.issues SET status='blocked',updated_at=now(),qa_result=evidence
   WHERE id=ANY(t.issue_ids) AND status='in_progress';
   blocked := blocked+1;
  END IF;
 END LOOP;
 RETURN jsonb_build_object('audits_queued',recovered,'executions_blocked_for_review',blocked);
END
$function$;

REVOKE ALL ON FUNCTION maximus_agents.reconcile_expired_tasks() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION maximus_agents.watchdog_tick()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents', 'public'
AS $function$
declare
 v_enabled boolean;
 v_last timestamptz;
 v_pending integer;
 v_blocked integer;
 v_pass integer;
 v_fail integer;
 v_state text;
 v_incident boolean;
 v_total integer;
 v_candidates integer;
 v_expired integer;
 v_details jsonb;
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
 if v_total<61 then raise exception 'Historical SCPI cohort unexpectedly shrank: %',v_total; end if;
 select count(*) into v_candidates from maximus_agents.scpi_universe where lifecycle='candidate';
 select count(*) into v_expired from maximus_agents.tasks
 where status='running' and lease_until<now();
 v_state := case
   when not v_enabled then 'DISABLED'
   when v_expired>0 then 'STALE'
   when v_last is null or v_last<now()-interval '2 hours' then 'STALE'
   when v_pending=0 then 'IDLE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
    'baseline_count',v_total,'candidate_count',v_candidates,'expired_tasks',v_expired,
    'runner_state',v_state,
    'note','Observation only: pg_cron does not execute AI workers, deploy or alter financial data'
 );
 insert into maximus_agents.watchdog_observations
   (control_enabled,last_worker_heartbeat,pending_tasks,blocked_issues,strict_pass,strict_fail,runner_state,details)
 values(v_enabled,v_last,v_pending,v_blocked,v_pass,v_fail,v_state,v_details);
 v_incident := v_enabled and v_state='STALE' and v_pending>0;
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
 -- keep 90 days of monitoring; issues remain until resolved
 delete from maximus_agents.watchdog_observations
 where observed_at < now()-interval '90 days';
 return v_details;
end
$function$;
