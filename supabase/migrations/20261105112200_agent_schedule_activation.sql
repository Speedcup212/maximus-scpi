CREATE OR REPLACE FUNCTION maximus_agents.prepare_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents'
AS $function$
declare d date := (now() at time zone 'Europe/Paris')::date; ids uuid[]; r text; snapshot jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('maximus_agents:prepare'));
  if not (select enabled from maximus_agents.settings where singleton) then
    return jsonb_build_object('enabled',false);
  end if;
  -- Central recovery handles expired leases without re-running writes blindly.
  perform maximus_agents.reconcile_expired_tasks();
  -- Execute and verify tasks always take precedence over recurring observation.
  if exists(select 1 from maximus_agents.tasks
            where kind in ('execute','verify') and status in ('pending','running')) then
    update maximus_agents.agents set heartbeat_at=now(),
      last_summary=jsonb_build_object('cycle_date',d,'audit_omitted','PENDING_EXECUTION_FIRST')
    where role='CONTROL';
    return jsonb_build_object('enabled',true,'cycle_date',d,
      'audit_omitted','PENDING_EXECUTION_FIRST',
      'pending_execution',(select count(*) from maximus_agents.tasks
         where kind in ('execute','verify') and status='pending'));
  end if;
  -- Never replay a stale daily audit. Historical failures remain visible in runs.
  update maximus_agents.tasks set status='blocked',completed_at=now(),updated_at=now(),
    result=jsonb_build_object('summary','Cycle dépassé : remplacer par un contrôle actuel','verdict','REVIEW','evidence',jsonb_build_array(jsonb_build_object('source','cycle_date','finding',cycle_date)))
    where cycle_date<d and status='pending' and kind='audit';
  select to_jsonb(h) into snapshot from public.scpi_chantier_health h limit 1;
  if snapshot is null then raise exception 'SCPI health unavailable'; end if;
  foreach r in array array['DATA','ANALYST','SEARCH'] loop
    insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,payload)
      values(d||':'||r,d,r,case r when 'DATA' then 'Contrôler les données et le pipeline de la cohorte active'
        when 'ANALYST' then 'Contrôler cohérence data, gates, trajectoires et analyses'
        else 'Contrôler SEO technique et extractibilité des pages publiques' end,
        jsonb_build_object('health_at_dispatch',snapshot,'scope','cohorte active au jour du contrôle','contract','agents/autonomous/worker-contract.md'))
      on conflict(dedupe_key) do nothing;
  end loop;
  select array_agg(id order by role) into ids from maximus_agents.tasks where cycle_date=d and role in ('DATA','ANALYST','SEARCH') and dedupe_key in (d||':DATA',d||':ANALYST',d||':SEARCH');
  insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,priority,depends_on,payload)
    values(d||':QA',d,'QA','Revoir résultats indépendants et décision de release',20,ids,
      jsonb_build_object('deploy_allowed',false,'contract','agents/autonomous/worker-contract.md')) on conflict(dedupe_key) do nothing;
  update maximus_agents.agents set heartbeat_at=now(),last_summary=jsonb_build_object('cycle_date',d,'health',snapshot) where role='CONTROL';
  return jsonb_build_object('enabled',true,'cycle_date',d,'health',snapshot,'tasks',
    (select jsonb_agg(jsonb_build_object('role',role,'id',id,'status',status)) from maximus_agents.tasks where cycle_date=d));
end $function$
;

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
   -- Evaluate each outstanding role. One manual DATA run cannot mask a stuck QA queue.
   when exists (
     select 1 from (select distinct on (role) role,status from maximus_agents.runs
       where result->>'executor'='postgres_scheduled_audit' order by role,started_at desc) recent
     where recent.status='failed'
   ) then 'STALE'
   when exists (
     select 1 from maximus_agents.tasks t
     where t.status='pending' and t.created_at < now()-interval '17 hours'
       and (t.kind <> 'audit' or t.cycle_date=(now() at time zone 'Europe/Paris')::date)

   ) then 'STALE'
   when (select count(*) from cron.job where jobname in ('maximus-agents-runtime-control',
     'maximus-agents-runtime-data','maximus-agents-runtime-analyst','maximus-agents-runtime-search',
     'maximus-agents-runtime-qa') and active) <> 5 then 'STALE'
   when exists (
     select 1 from cron.job j
     left join lateral (select r.status,r.start_time from cron.job_run_details r
       where r.jobid=j.jobid order by r.runid desc limit 1) last_run on true
     where j.jobname like 'maximus-agents-runtime-%'
       and (not j.active or last_run.start_time is null or last_run.status='failed' or last_run.start_time < now()-interval '17 hours')
   ) then 'STALE'
   when v_pending=0 then 'IDLE'
   when v_last is null or v_last<now()-interval '17 hours' then 'STALE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
    'baseline_count',v_total,'candidate_count',v_candidates,'expired_tasks',v_expired,
    'runner_state',v_state,
    'note','Watchdog observes the existing queue and scheduled jobs; runtime audits and external candidate corrections are distinct.'
 );
 insert into maximus_agents.watchdog_observations
   (control_enabled,last_worker_heartbeat,pending_tasks,blocked_issues,strict_pass,strict_fail,runner_state,details)
 values(v_enabled,v_last,v_pending,v_blocked,v_pass,v_fail,v_state,v_details);
 v_incident := v_enabled and v_state='STALE';
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
$function$
;

-- Two cycles per day, distinct transactions for each role. Idempotent named jobs.
select cron.schedule('maximus-agents-runtime-control','37 11,20 * * *',
  'select maximus_agents.control_scheduled()');
select cron.schedule('maximus-agents-runtime-data','38 11,20 * * *',
  $$select maximus_agents.run_scheduled_audit('DATA')$$);
select cron.schedule('maximus-agents-runtime-analyst','38 11,20 * * *',
  $$select maximus_agents.run_scheduled_audit('ANALYST')$$);
select cron.schedule('maximus-agents-runtime-search','38 11,20 * * *',
  $$select maximus_agents.run_scheduled_audit('SEARCH')$$);
select cron.schedule('maximus-agents-runtime-qa','40 11,20 * * *',
  $$select maximus_agents.run_scheduled_audit('QA')$$);
