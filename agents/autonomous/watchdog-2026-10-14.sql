-- MaximusSCPI — deterministic watchdog, applied to production Supabase 2026-10-14.
-- Re-runnable. Does not execute models, mutate SCPI figures or trigger Netlify.
create table if not exists maximus_agents.watchdog_observations (
 id bigint generated always as identity primary key,
 observed_at timestamptz not null default now(),
 control_enabled boolean not null,
 last_worker_heartbeat timestamptz,
 pending_tasks integer not null,
 blocked_issues integer not null,
 strict_pass integer not null,
 strict_fail integer not null,
 runner_state text not null check (runner_state in ('RUNNING','STALE','DISABLED','IDLE')),
 details jsonb not null default '{}'::jsonb
);
create index if not exists watchdog_observations_latest on maximus_agents.watchdog_observations(observed_at desc);
alter table maximus_agents.watchdog_observations enable row level security;
revoke all on maximus_agents.watchdog_observations from public, anon, authenticated;

create table if not exists maximus_agents.watchdog_incidents (
 incident_code text primary key,
 active boolean not null default true,
 first_seen timestamptz not null default now(),
 last_seen timestamptz not null default now(),
 occurrences bigint not null default 1,
 evidence jsonb not null default '{}'::jsonb,
 resolved_at timestamptz
);
alter table maximus_agents.watchdog_incidents enable row level security;
revoke all on maximus_agents.watchdog_incidents from public, anon, authenticated;

create or replace function maximus_agents.watchdog_tick()
returns jsonb language plpgsql security invoker set search_path=pg_catalog,maximus_agents,public
as $body$
declare
 v_enabled boolean;
 v_last timestamptz;
 v_pending integer;
 v_blocked integer;
 v_pass integer;
 v_fail integer;
 v_state text;
 v_incident boolean;
 v_details jsonb;
begin
 perform pg_advisory_xact_lock(hashtext('maximus_agents:watchdog'));
 select enabled into v_enabled from maximus_agents.settings where singleton=true;
 if v_enabled is null then raise exception 'maximus_agents.settings absent'; end if;
 select max(heartbeat_at) into v_last from maximus_agents.agents
 where role in ('DATA','ANALYST','SEARCH','QA') and enabled=true;
 select count(*) into v_pending from maximus_agents.tasks
 where status in ('pending','running');
 select count(*) into v_blocked from maximus_agents.issues
 where status='blocked';
 select count(*) filter (where crash_test_status='PASS_100'),
        count(*) filter (where crash_test_status <> 'PASS_100')
 into v_pass,v_fail from public.scpi_crash_test_strict_v2;
 if v_pass+v_fail<>61 then raise exception '61 SCPI expected; got %',v_pass+v_fail; end if;
 v_state := case
   when not v_enabled then 'DISABLED'
   when v_last is null or v_last<now()-interval '2 hours' then 'STALE'
   when v_pending=0 then 'IDLE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
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
 delete from maximus_agents.watchdog_observations
 where observed_at < now()-interval '90 days';
 return v_details;
end
$body$;
revoke all on function maximus_agents.watchdog_tick() from public,anon,authenticated;

-- Align with a 30-minute independent monitoring cadence. On initial install job ID was 69.
select cron.schedule(
 'maximus-agents-watchdog-30m',
 '7,37 * * * *',
 $job$ select maximus_agents.watchdog_tick(); $job$
);
