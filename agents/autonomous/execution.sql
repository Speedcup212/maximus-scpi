-- Apply after bootstrap.sql. Authorized corrective execution, private registry.
begin;
create table if not exists maximus_agents.issues (
  id uuid primary key default gen_random_uuid(),
  issue_key text not null unique,
  title text not null,
  owner_role text not null references maximus_agents.agents(role) check(owner_role in ('DATA','ANALYST','SEARCH')),
  priority integer not null default 0,
  status text not null default 'open' check(status in ('open','in_progress','implemented','qa_pass','resolved','blocked')),
  scope jsonb not null,
  acceptance text not null,
  requires_release boolean not null default true,
  implementation jsonb,
  qa_result jsonb,
  release_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table maximus_agents.issues enable row level security;
alter table maximus_agents.tasks add column if not exists kind text not null default 'audit' check(kind in ('audit','execute','verify'));
alter table maximus_agents.tasks add column if not exists issue_ids uuid[] not null default '{}';
create index if not exists issues_open_idx on maximus_agents.issues(owner_role,status,priority);

create or replace function maximus_agents.prepare_execution()
returns jsonb language plpgsql security invoker set search_path=pg_catalog,maximus_agents as $$
declare d date := (now() at time zone 'Europe/Paris')::date; r text; ids uuid[]; payload jsonb; deps uuid[];
begin
  perform pg_advisory_xact_lock(hashtext('maximus_agents:execution'));
  if not (select enabled from maximus_agents.settings where singleton) then return jsonb_build_object('enabled',false); end if;
  foreach r in array array['DATA','ANALYST','SEARCH'] loop
    select array_agg(i.id order by i.priority,i.created_at),jsonb_agg(to_jsonb(i) order by i.priority,i.created_at)
      into ids,payload from maximus_agents.issues i where i.owner_role=r and i.status='open'
      and not exists(select 1 from maximus_agents.tasks t where i.id=any(t.issue_ids) and t.kind='execute' and t.status in ('pending','running'));
    if cardinality(ids)>0 then
      insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,priority,kind,issue_ids,payload)
      values(d||':'||r||':execute',d,r,'Implémenter le lot de corrections autorisées '||r,0,'execute',ids,
        jsonb_build_object('issues',payload,'authorization','Éric 2026-10-05 : il faut exécution, fait tout ce qui doit être fait','contract','agents/autonomous/execution-contract.md'))
      on conflict(dedupe_key) do nothing;
    end if;
  end loop;
  -- One QA batch covers the executions completed in this cycle, within the same daily cap.
  select array_agg(t.id order by t.role) into deps from maximus_agents.tasks t
    where t.kind='execute' and t.cycle_date=d;
  if cardinality(deps)>0 then
    select array_agg(distinct x.id) into ids from maximus_agents.tasks t cross join lateral unnest(t.issue_ids) x(id) where t.id=any(deps);
    insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,priority,kind,issue_ids,depends_on,payload)
      values(d||':QA:verify',d,'QA','Vérifier les corrections implémentées et préparer le lot de release',1,'verify',ids,deps,
        jsonb_build_object('contract','agents/autonomous/execution-contract.md','deploy_allowed',false)) on conflict(dedupe_key) do nothing;
  end if;
  return jsonb_build_object('enabled',true,'open_issues',(select count(*) from maximus_agents.issues where status='open'),
    'pending_execution',(select count(*) from maximus_agents.tasks where kind in ('execute','verify') and status='pending'));
end $$;

-- Execution tasks survive date boundaries and take precedence over recurring audits.
create or replace function maximus_agents.claim_task(p_role text)
returns setof maximus_agents.tasks language plpgsql security invoker set search_path=pg_catalog,maximus_agents as $$
declare t maximus_agents.tasks; cfg maximus_agents.settings; token uuid;
begin
  if p_role not in ('DATA','ANALYST','SEARCH','QA') then raise exception 'Invalid worker role'; end if;
  perform pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
  select * into cfg from maximus_agents.settings where singleton;
  if not cfg.enabled or not (select enabled from maximus_agents.agents where role=p_role) then return; end if;
  if exists(select 1 from maximus_agents.tasks where role=p_role and status='running') then return; end if;
  if (select count(*) from maximus_agents.runs where role=p_role and (started_at at time zone 'Europe/Paris')::date=(now() at time zone 'Europe/Paris')::date)>=cfg.max_claims_per_role_day then return; end if;
  select * into t from maximus_agents.tasks x where x.role=p_role and x.status='pending' and x.attempts<2
    and (x.kind in ('execute','verify') or x.cycle_date=(now() at time zone 'Europe/Paris')::date)
    and not exists(select 1 from unnest(x.depends_on) dep(id) left join maximus_agents.tasks parent on parent.id=dep.id where parent.id is null or parent.status not in ('done','failed','blocked'))
    order by case when x.kind in ('execute','verify') then 0 else 1 end,x.priority,x.created_at for update skip locked limit 1;
  if t.id is null then return; end if;
  token:=gen_random_uuid();
  update maximus_agents.tasks set status='running',attempts=attempts+1,lease_token=token,
    lease_until=now()+make_interval(mins=>cfg.lease_minutes),updated_at=now() where id=t.id returning * into t;
  insert into maximus_agents.runs(task_id,role,attempt,lease_token) values(t.id,p_role,t.attempts,token);
  if t.kind='execute' then update maximus_agents.issues set status='in_progress',updated_at=now() where id=any(t.issue_ids) and status='open'; end if;
  update maximus_agents.agents set heartbeat_at=now() where role=p_role;
  return next t;
end $$;

-- Reuse proof/lease validation from bootstrap; completion is not issue resolution.
create or replace function maximus_agents.record_execution(p_task uuid,p_token uuid,p_status text,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,maximus_agents as $$
declare t maximus_agents.tasks; response jsonb; issue_verdict jsonb; previous_context text;
begin
  select * into t from maximus_agents.tasks where id=p_task for update;
  if t.id is null or t.kind not in ('execute','verify') then raise exception 'Execution/verification task required'; end if;
  if t.kind='verify' and t.role<>'QA' then raise exception 'QA role required'; end if;
  if p_status='done' and (p_result->>'verdict'='PASS' or (t.kind='verify' and jsonb_typeof(p_result->'issue_verdicts')='array' and exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v where v->>'verdict'='PASS'))) then
    if jsonb_typeof(p_result->'tests') is distinct from 'array' then raise exception 'Tests array required'; end if;
    if jsonb_array_length(p_result->'tests')=0 or exists(select 1 from jsonb_array_elements(p_result->'tests') test where test->>'status' is distinct from 'PASS' or coalesce(length(btrim(test->>'name')),0)=0) then raise exception 'Passing named tests required'; end if;
    if t.kind='execute' and coalesce(length(btrim(p_result->>'implementation_reference')),0)=0 then raise exception 'Implementation reference required'; end if;
  end if;
  if t.kind='verify' and p_status='done' then
    if jsonb_typeof(p_result->'issue_verdicts') is distinct from 'array' then raise exception 'Per-issue verdicts required'; end if;
    if exists(select 1 from unnest(t.issue_ids) x(id) where not exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v where v->>'issue_id'=x.id::text and v->>'verdict' in ('PASS','REVIEW','FAIL'))) then raise exception 'Every issue requires QA verdict'; end if;
    if jsonb_array_length(p_result->'issue_verdicts')<>cardinality(t.issue_ids) or exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v where not (v->>'issue_id'=any(select x.id::text from unnest(t.issue_ids) x(id)))) or exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v group by v->>'issue_id' having count(*)<>1) then raise exception 'Exactly one verdict per assigned issue required'; end if;
    if exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v join maximus_agents.issues i on i.id::text=v->>'issue_id' where v->>'verdict'='PASS' and i.status<>'implemented') then raise exception 'QA PASS requires implemented issue'; end if;
    if p_result->>'verdict'='PASS' and exists(select 1 from jsonb_array_elements(p_result->'issue_verdicts') v where v->>'verdict'<>'PASS') then raise exception 'Global PASS contradicts issue verdicts'; end if;
  end if;
  previous_context:=current_setting('maximus_agents.execution_record',true);
  perform set_config('maximus_agents.execution_record','on',true);
  response:=maximus_agents.finish_task(p_task,p_token,p_status,p_result);
  perform set_config('maximus_agents.execution_record',coalesce(previous_context,'off'),true);
  if t.kind='execute' then
    update maximus_agents.issues set status=case when p_status='done' and p_result->>'verdict'='PASS' then 'implemented' else 'blocked' end,
      implementation=p_result,updated_at=now() where id=any(t.issue_ids);
  elsif t.kind='verify' and p_status='done' then
    for issue_verdict in select value from jsonb_array_elements(p_result->'issue_verdicts') loop
      update maximus_agents.issues set status=case when issue_verdict->>'verdict'='PASS' then case when requires_release then 'qa_pass' else 'resolved' end else 'blocked' end,
        qa_result=p_result,updated_at=now(),resolved_at=case when issue_verdict->>'verdict'='PASS' and not requires_release then now() else null end
        where id::text=issue_verdict->>'issue_id' and id=any(t.issue_ids) and status='implemented';
    end loop;
  else update maximus_agents.issues set status='blocked',qa_result=p_result,updated_at=now() where id=any(t.issue_ids); end if;
  return response||jsonb_build_object('issues_updated',cardinality(t.issue_ids),'kind',t.kind);
end $$;

create or replace view maximus_agents.issue_dashboard with (security_invoker=true) as
select issue_key,title,owner_role,priority,status,requires_release,implementation->>'implementation_reference' as implementation_reference,
  qa_result->>'verdict' qa_verdict,release_reference,updated_at,resolved_at from maximus_agents.issues;

revoke all on all tables in schema maximus_agents from public,anon,authenticated;
revoke execute on all functions in schema maximus_agents from public,anon,authenticated;
commit;
