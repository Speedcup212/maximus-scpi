-- Private orchestration only. Does not alter SCPI business data or existing jobs.
begin;
create schema if not exists maximus_agents;
revoke all on schema maximus_agents from public, anon, authenticated;

create table if not exists maximus_agents.settings (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default true,
  max_claims_per_role_day integer not null default 2 check(max_claims_per_role_day between 1 and 4),
  lease_minutes integer not null default 30 check(lease_minutes between 5 and 60)
);
insert into maximus_agents.settings(singleton) values(true) on conflict do nothing;
create table if not exists maximus_agents.agents (
  role text primary key check(role in ('CONTROL','DATA','ANALYST','SEARCH','QA')),
  enabled boolean not null default true,
  automation_id text,
  heartbeat_at timestamptz,
  last_summary jsonb
);
insert into maximus_agents.agents(role) values('CONTROL'),('DATA'),('ANALYST'),('SEARCH'),('QA') on conflict do nothing;
create table if not exists maximus_agents.tasks (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  cycle_date date not null default ((now() at time zone 'Europe/Paris')::date),
  role text not null references maximus_agents.agents(role),
  title text not null,
  priority integer not null default 10,
  status text not null default 'pending' check(status in ('pending','running','done','failed','blocked')),
  attempts integer not null default 0 check(attempts between 0 and 2),
  depends_on uuid[] not null default '{}',
  payload jsonb not null default '{}',
  result jsonb,
  lease_token uuid,
  lease_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_ready_idx on maximus_agents.tasks(role,status,priority,created_at);
create table if not exists maximus_agents.runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references maximus_agents.tasks(id),
  role text not null references maximus_agents.agents(role),
  attempt integer not null check(attempt between 1 and 2),
  lease_token uuid not null unique,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check(status in ('running','done','failed','blocked','expired')),
  result jsonb,
  unique(task_id,attempt)
);
alter table maximus_agents.settings enable row level security;
alter table maximus_agents.agents enable row level security;
alter table maximus_agents.tasks enable row level security;
alter table maximus_agents.runs enable row level security;

create or replace function maximus_agents.prepare_cycle()
returns jsonb language plpgsql security invoker set search_path = pg_catalog, maximus_agents as $$
declare d date := (now() at time zone 'Europe/Paris')::date; ids uuid[]; r text; snapshot jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('maximus_agents:prepare'));
  if not (select enabled from maximus_agents.settings where singleton) then
    return jsonb_build_object('enabled',false);
  end if;
  update maximus_agents.runs set status='expired',finished_at=now(),
    result=jsonb_build_object('summary','Lease expiré : exécution interrompue','verdict','REVIEW','evidence',jsonb_build_array(jsonb_build_object('source','lease_until','finding','timeout')))
    where status='running' and task_id in (select id from maximus_agents.tasks where status='running' and lease_until<now());
  update maximus_agents.tasks set status=case when attempts<2 then 'pending' else 'failed' end,
    lease_token=null,lease_until=null,updated_at=now(),
    result=jsonb_build_object('summary','Lease expiré','verdict','REVIEW','evidence',jsonb_build_array(jsonb_build_object('source','lease_until','finding','timeout')))
    where status='running' and lease_until<now();
  update maximus_agents.tasks set status='pending',updated_at=now()
    where status='failed' and attempts<2 and cycle_date=d;
  -- Never replay a stale daily audit. Historical failures remain visible in runs.
  update maximus_agents.tasks set status='blocked',completed_at=now(),updated_at=now(),
    result=jsonb_build_object('summary','Cycle dépassé : remplacer par un contrôle actuel','verdict','REVIEW','evidence',jsonb_build_array(jsonb_build_object('source','cycle_date','finding',cycle_date)))
    where cycle_date<d and status='pending';
  select to_jsonb(h) into snapshot from public.scpi_chantier_health h limit 1;
  if snapshot is null then raise exception 'SCPI health unavailable'; end if;
  foreach r in array array['DATA','ANALYST','SEARCH'] loop
    insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,payload)
      values(d||':'||r,d,r,case r when 'DATA' then 'Contrôler données et pipeline des 61 SCPI'
        when 'ANALYST' then 'Contrôler cohérence data, gates, trajectoires et analyses'
        else 'Contrôler SEO technique et extractibilité des pages publiques' end,
        jsonb_build_object('health_at_dispatch',snapshot,'scope','61 SCPI PSI','contract','agents/autonomous/worker-contract.md'))
      on conflict(dedupe_key) do nothing;
  end loop;
  select array_agg(id order by role) into ids from maximus_agents.tasks where cycle_date=d and role in ('DATA','ANALYST','SEARCH') and dedupe_key in (d||':DATA',d||':ANALYST',d||':SEARCH');
  insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,priority,depends_on,payload)
    values(d||':QA',d,'QA','Revoir résultats indépendants et décision de release',20,ids,
      jsonb_build_object('deploy_allowed',false,'contract','agents/autonomous/worker-contract.md')) on conflict(dedupe_key) do nothing;
  update maximus_agents.agents set heartbeat_at=now(),last_summary=jsonb_build_object('cycle_date',d,'health',snapshot) where role='CONTROL';
  return jsonb_build_object('enabled',true,'cycle_date',d,'health',snapshot,'tasks',
    (select jsonb_agg(jsonb_build_object('role',role,'id',id,'status',status)) from maximus_agents.tasks where cycle_date=d));
end $$;

create or replace function maximus_agents.claim_task(p_role text)
returns setof maximus_agents.tasks language plpgsql security invoker set search_path = pg_catalog, maximus_agents as $$
declare t maximus_agents.tasks; cfg maximus_agents.settings; token uuid;
begin
  if p_role not in ('DATA','ANALYST','SEARCH','QA') then raise exception 'Invalid worker role'; end if;
  perform pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
  select * into cfg from maximus_agents.settings where singleton;
  if not cfg.enabled or not (select enabled from maximus_agents.agents where role=p_role) then return; end if;
  if exists(select 1 from maximus_agents.tasks where role=p_role and status='running') then return; end if;
  if (select count(*) from maximus_agents.runs where role=p_role and (started_at at time zone 'Europe/Paris')::date=(now() at time zone 'Europe/Paris')::date)>=cfg.max_claims_per_role_day then return; end if;
  select * into t from maximus_agents.tasks x where x.role=p_role and x.status='pending' and x.attempts<2
    and x.cycle_date=(now() at time zone 'Europe/Paris')::date
    and not exists(select 1 from unnest(x.depends_on) dep(id) left join maximus_agents.tasks parent on parent.id=dep.id where parent.id is null or parent.status not in ('done','failed','blocked'))
    order by x.priority,x.created_at for update skip locked limit 1;
  if t.id is null then return; end if;
  token := gen_random_uuid();
  update maximus_agents.tasks set status='running',attempts=attempts+1,lease_token=token,
    lease_until=now()+make_interval(mins=>cfg.lease_minutes),updated_at=now() where id=t.id returning * into t;
  insert into maximus_agents.runs(task_id,role,attempt,lease_token) values(t.id,p_role,t.attempts,token);
  update maximus_agents.agents set heartbeat_at=now() where role=p_role;
  return next t;
end $$;

create or replace function maximus_agents.finish_task(p_id uuid,p_token uuid,p_status text,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path = pg_catalog, maximus_agents as $$
declare t maximus_agents.tasks;
begin
  if p_status not in ('done','failed','blocked') then raise exception 'Invalid terminal status'; end if;
  if jsonb_typeof(p_result) is distinct from 'object' or coalesce(length(p_result->>'summary'),0)=0
    or coalesce(p_result->>'verdict','') not in ('PASS','REVIEW','FAIL') then raise exception 'summary and verdict required'; end if;
  if jsonb_typeof(p_result->'evidence') is distinct from 'array' then raise exception 'Evidence array required'; end if;
  if jsonb_array_length(p_result->'evidence')=0 then raise exception 'Evidence required'; end if;
  if p_status<>'done' and p_result->>'verdict'='PASS' then raise exception 'Non-completed task cannot PASS'; end if;
  select * into t from maximus_agents.tasks where id=p_id for update;
  if t.id is null or t.status<>'running' or t.lease_token is distinct from p_token or t.lease_until<now() then
    raise exception 'Invalid or expired lease';
  end if;
  if t.role='QA' and p_result->>'verdict'='PASS' and exists(
    select 1 from unnest(t.depends_on) dep(id) join maximus_agents.tasks parent on parent.id=dep.id
    where parent.status<>'done' or coalesce(parent.result->>'verdict','')<>'PASS') then
    raise exception 'QA cannot PASS while a dependency needs review';
  end if;
  update maximus_agents.tasks set status=p_status,result=p_result,completed_at=now(),updated_at=now(),lease_until=null where id=p_id;
  update maximus_agents.runs set status=p_status,result=p_result,finished_at=now() where task_id=p_id and lease_token=p_token and status='running';
  update maximus_agents.agents set heartbeat_at=now(),last_summary=p_result where role=t.role;
  return jsonb_build_object('id',p_id,'status',p_status,'role',t.role,'verdict',p_result->>'verdict','deploy_allowed',false);
end $$;

create or replace view maximus_agents.dashboard with (security_invoker=true) as
select a.role,a.enabled,a.automation_id,a.heartbeat_at,t.cycle_date,
  case when a.role='CONTROL' then case when a.enabled then 'active' else 'paused' end else coalesce(t.status,'idle') end as status,t.attempts,
  coalesce(t.result->>'verdict',a.last_summary->>'verdict') as verdict,
  coalesce(t.result->>'summary',a.last_summary->>'summary') as summary,
  (select count(*) from maximus_agents.runs r where r.role=a.role and (r.started_at at time zone 'Europe/Paris')::date=(now() at time zone 'Europe/Paris')::date) as claims_today,
  false as deploy_allowed
from maximus_agents.agents a left join lateral (
  select * from maximus_agents.tasks t where t.role=a.role order by cycle_date desc,created_at desc limit 1
) t on true;

revoke all on all tables in schema maximus_agents from public,anon,authenticated;
revoke execute on all functions in schema maximus_agents from public,anon,authenticated;
alter default privileges in schema maximus_agents revoke all on tables from public,anon,authenticated;
alter default privileges in schema maximus_agents revoke execute on functions from public,anon,authenticated;
comment on schema maximus_agents is 'Private ChatGPT Work orchestration. No public API, no production deployment capability.';
commit;
