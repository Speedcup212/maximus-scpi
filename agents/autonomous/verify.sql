-- All fixtures roll back. Raises on the first failed invariant.
begin;
delete from maximus_agents.runs;
delete from maximus_agents.tasks;
do $$
declare t maximus_agents.tasks; a maximus_agents.tasks; s maximus_agents.tasks; q maximus_agents.tasks;
  n integer; rejected boolean; proof jsonb := '{"summary":"transactional fixture","verdict":"PASS","evidence":[{"source":"verify.sql","finding":"fixture"}]}';
begin
  perform maximus_agents.prepare_cycle();
  perform maximus_agents.prepare_cycle();
  select count(*) into n from maximus_agents.tasks;
  if n<>4 then raise exception 'Dedupe failed: %',n; end if;
  select count(*) into n from maximus_agents.claim_task('QA');
  if n<>0 then raise exception 'QA started before dependencies'; end if;
  select * into t from maximus_agents.claim_task('DATA');
  select count(*) into n from maximus_agents.claim_task('DATA');
  if t.id is null or n<>0 then raise exception 'Exclusive lease failed'; end if;
  rejected := false;
  begin perform maximus_agents.finish_task(t.id,gen_random_uuid(),'done',proof);
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Wrong lease accepted'; end if;
  rejected := false;
  begin perform maximus_agents.finish_task(t.id,t.lease_token,'done',proof||'{"evidence":[]}');
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Missing evidence accepted'; end if;
  update maximus_agents.tasks set lease_until=now()-interval '1 minute' where id=t.id;
  rejected := false;
  begin perform maximus_agents.finish_task(t.id,t.lease_token,'done',proof);
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Expired lease accepted'; end if;
  perform maximus_agents.prepare_cycle();
  select * into t from maximus_agents.claim_task('DATA');
  if t.attempts<>2 then raise exception 'Retry failed'; end if;
  perform maximus_agents.finish_task(t.id,t.lease_token,'done',proof);
  insert into maximus_agents.tasks(dedupe_key,role,title) values('verify-budget','DATA','fixture');
  select count(*) into n from maximus_agents.claim_task('DATA');
  if n<>0 then raise exception 'Daily budget exceeded'; end if;
  select * into a from maximus_agents.claim_task('ANALYST');
  perform maximus_agents.finish_task(a.id,a.lease_token,'done',proof||'{"verdict":"REVIEW"}');
  select * into s from maximus_agents.claim_task('SEARCH');
  perform maximus_agents.finish_task(s.id,s.lease_token,'done',proof);
  select * into q from maximus_agents.claim_task('QA');
  if q.id is null then raise exception 'QA dependency terminal handling failed'; end if;
  rejected := false;
  begin perform maximus_agents.finish_task(q.id,q.lease_token,'done',proof);
  exception when others then rejected := true; end;
  if not rejected then raise exception 'QA PASS accepted over REVIEW'; end if;
  perform maximus_agents.finish_task(q.id,q.lease_token,'done',proof||'{"verdict":"REVIEW"}');
  update maximus_agents.settings set enabled=false where singleton;
  if (maximus_agents.prepare_cycle()->>'enabled')::boolean then raise exception 'Kill switch failed'; end if;
  select count(*) into n from maximus_agents.claim_task('SEARCH');
  if n<>0 then raise exception 'Kill switch claim failed'; end if;
  if has_schema_privilege('anon','maximus_agents','USAGE') or has_schema_privilege('authenticated','maximus_agents','USAGE') then
    raise exception 'Private schema exposed'; end if;
  if has_function_privilege('anon','maximus_agents.claim_task(text)','EXECUTE')
    or has_function_privilege('authenticated','maximus_agents.finish_task(uuid,uuid,text,jsonb)','EXECUTE') then
    raise exception 'Private function exposed'; end if;
end $$;
select 'PASS' as verification,'dedupe, exclusivity, dependencies, evidence, stale token, timeout, retry, budget, QA gate, kill switch, ACL' as checks;
rollback;
