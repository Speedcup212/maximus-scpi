-- Run the existing coordinator and task ledger on the database clock.
-- Financial writes, candidate PRs, release decisions and public data belong to their existing owners.
create or replace function maximus_agents.control_scheduled()
returns jsonb language plpgsql security invoker
set search_path = pg_catalog, maximus_agents as $$
declare
  prepared jsonb;
  cycle jsonb;
begin
  if not exists (select 1 from maximus_agents.settings where singleton and enabled)
     or not exists (select 1 from maximus_agents.agents where role='CONTROL' and enabled) then
    return jsonb_build_object('enabled', false);
  end if;
  perform maximus_agents.reconcile_expired_tasks();
  -- Only replay this runtime's read-only transport failures. All attempts remain in runs.
  update maximus_agents.tasks t set status='pending',lease_token=null,lease_until=null,
    completed_at=null,updated_at=now()
  where t.kind='audit' and t.status='failed' and t.attempts<2
    and t.cycle_date=(now() at time zone 'Europe/Paris')::date
    and t.dedupe_key=t.cycle_date::text||':'||t.role
    and t.result->>'executor'='postgres_scheduled_audit' and t.result->>'retryable'='true'
    and not exists (select from maximus_agents.tasks child where t.id=any(child.depends_on) and child.status='running');
  prepared := maximus_agents.prepare_execution();
  cycle := maximus_agents.prepare_cycle();
  return jsonb_build_object('execution',prepared,'cycle',cycle);
end $$;

-- A fixed list of public pages. Transport errors retain an observable failed run.
-- No redirects, user URLs, credentials, response bodies or retry loop.
create or replace function maximus_agents.probe_public_routes()
returns jsonb language plpgsql security invoker
set search_path = pg_catalog, extensions
set http.curlopt_timeout_ms = '4000'
set http.curlopt_connecttimeout_ms = '2000'
set http.curlopt_followlocation = '0' as $$
declare
  route record;
  response extensions.http_response;
  observations jsonb := '[]';
begin
  for route in select * from (values
    ('/',200),('/analyses/',200),('/actualites/inexistante-qa-20261015/',404)
  ) as routes(path,expected) loop
    response := extensions.http_get(('https://maximusscpi.com'||route.path)::varchar);
    observations := observations || jsonb_build_array(jsonb_build_object(
      'path', route.path, 'expected',route.expected,'status',response.status,
      'h1', case when route.expected=200 then response.content ~* '<h1[[:space:]>]' end,
      'canonical',case when route.expected=200 then response.content ~* '<link[^>]+canonical[^>]*>' end
    ));
  end loop;
  return observations;
end $$;

create or replace function maximus_agents.run_scheduled_audit(p_role text)
returns jsonb language plpgsql security invoker
set search_path = pg_catalog, maximus_agents as $$
declare
  task maximus_agents.tasks;
  observations jsonb;
  finding text;
  source text;
  verdict text := 'REVIEW';
  terminal text := 'done';
  retryable boolean := false;
  report jsonb;
begin
  if p_role not in ('DATA','ANALYST','SEARCH','QA') or p_role is null then
    raise exception 'Unsupported role';
  end if;
  if not exists (select 1 from maximus_agents.agents where role='CONTROL' and enabled) then
    return jsonb_build_object('enabled',false);
  end if;
  -- claim_task prioritises execute/verify. Roll back the entire claim (including
  -- run, issue transition and daily allowance) if another handler owns this kind.
  begin
    select * into task from maximus_agents.claim_task(p_role);
    if task.id is null then return jsonb_build_object('claimed',false); end if;
    if task.kind <> 'audit' or task.cycle_date <> (now() at time zone 'Europe/Paris')::date
       or task.dedupe_key <> task.cycle_date::text||':'||p_role then raise exception using errcode='MX001'; end if;
  exception when sqlstate 'MX001' then
    return jsonb_build_object('claimed',false,'reason','execution_or_independent_verification_first');
  end;

  begin
    case p_role
    when 'DATA' then
      with expected as (select scpi_slug from public.scpi_trajectory_pilot where enabled),
      actual as (select scpi_slug,count(*) n,bool_and(crash_test_status='PASS_100') strict_ok
        from public.scpi_crash_test_strict_v2 group by scpi_slug)
      select jsonb_build_object('baseline',count(e.scpi_slug),
        'scope_mismatches',count(*) filter(where e.scpi_slug is null or a.n is distinct from 1::bigint),
        'strict_pass',count(*) filter(where e.scpi_slug is not null and a.n=1 and a.strict_ok),
        'without_strict_pass',count(*) filter(where a.strict_ok is distinct from true))
      into observations from expected e full join actual a using(scpi_slug);
      source := 'public.scpi_trajectory_pilot + public.scpi_crash_test_strict_v2';
      finding := 'Recomputed strict documentary coverage of the enabled pilot cohort.';
      if (observations->>'baseline')::int >= 68 and (observations->>'scope_mismatches')::int=0 and (observations->>'without_strict_pass')::int=0 then verdict := 'PASS'; end if;
    when 'ANALYST' then
      select jsonb_build_object('trajectory_alerts',trajectory_qa_alert_rows,
        'ingestion_alerts',ingestion_guardrail_alert_rows,'extended_alerts',extended_guardrail_alert_rows,
        'invalid_history_tof',tof_policy_invalid_history_rows,'checked_at',checked_at)
      into strict observations from public.scpi_chantier_health;
      source := 'public.scpi_chantier_health';
      finding := 'Read current analytical, ingestion and trajectory guardrails.';
      if (observations->>'checked_at')::timestamptz between now()-interval '1 hour' and clock_timestamp()
        and (observations->>'trajectory_alerts')::int=0 and (observations->>'ingestion_alerts')::int=0
        and (observations->>'extended_alerts')::int=0 and (observations->>'invalid_history_tof')::int=0 then verdict := 'PASS'; end if;
    when 'SEARCH' then
      observations := maximus_agents.probe_public_routes();
      source := 'https://maximusscpi.com';
      finding := 'Live HTTP status, H1 and presence of a canonical link on the two indexable pages; third route is a negative control.';
      if jsonb_array_length(observations)=3 and not exists
        (select from jsonb_array_elements(observations) r where r->'status' is distinct from r->'expected'
          or (r->>'expected'='200' and (r->>'h1' is distinct from 'true' or r->>'canonical' is distinct from 'true'))) then verdict := 'PASS'; end if;
    when 'QA' then
      select jsonb_agg(jsonb_build_object('id',p.id,'role',p.role,'status',p.status,
        'verdict',p.result->>'verdict','completed_at',p.completed_at) order by p.role)
      into observations from maximus_agents.tasks p where p.id=any(task.depends_on)
        and p.role in ('DATA','ANALYST','SEARCH') and p.kind='audit' and p.cycle_date=task.cycle_date
        and p.dedupe_key=p.cycle_date::text||':'||p.role;
      source := 'maximus_agents.tasks / current cycle dependencies';
      finding := 'Independent dependency review. Only an audit of the cycle; any product release requires separate evidence.';
      -- No release or independent financial approval can be assigned by this audit.
      -- The QA worker independently checks actual product gates and the public origin.
      observations := jsonb_build_object('dependencies',observations,'public_routes',maximus_agents.probe_public_routes(),
        'quality_gate',(select to_jsonb(s) from maximus_agents.scpi_quality_gate_summary s));
      if cardinality(task.depends_on)=3 and jsonb_array_length(observations->'dependencies')=3
        and not exists (select from jsonb_array_elements(observations->'dependencies') d
          where d->>'status' is distinct from 'done' or d->>'verdict' is distinct from 'PASS')
        and (observations->'quality_gate'->>'invalid_candidate_publications')::int=0
        and jsonb_array_length(observations->'public_routes')=3 and not exists (
          select from jsonb_array_elements(observations->'public_routes') r
          where r->'status' is distinct from r->'expected'
            or (r->>'expected'='200' and (r->>'h1' is distinct from 'true' or r->>'canonical' is distinct from 'true'))
        ) then verdict := 'PASS'; end if;
    end case;
  exception when others then
    terminal := 'failed';
    retryable := p_role in ('SEARCH','QA') and SQLSTATE in ('XX000','58000','08006','57014');
    verdict := 'FAIL';
    source := 'maximus_agents.run_scheduled_audit';
    finding := 'Observation failed; SQLSTATE '||SQLSTATE||'. Inspect cron and source availability.';
    observations := null;
  end;
  report := jsonb_build_object('summary',finding,'verdict',verdict,'executor','postgres_scheduled_audit','retryable',retryable,
    'deploy_allowed',false,'evidence',jsonb_build_array(jsonb_build_object(
      'source',source,'observed_at',clock_timestamp(),'finding',finding,'observations',observations)));
  return maximus_agents.finish_task(task.id,task.lease_token,terminal,report);
end $$;

revoke all on function maximus_agents.control_scheduled(), maximus_agents.probe_public_routes(),
  maximus_agents.run_scheduled_audit(text) from public, anon, authenticated, service_role;
