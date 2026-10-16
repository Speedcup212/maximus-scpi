-- DeepSeek corrective worker: reuse the existing Supabase queue, issue IDs, leases and independent QA.
-- Only exact one-issue scoped code corrections are eligible; broader financial certification stays manual.
CREATE OR REPLACE FUNCTION maximus_agents.prepare_execution()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents'
AS $function$
declare d date := (now() at time zone 'Europe/Paris')::date; r text; ids uuid[]; payload jsonb; deps uuid[];
begin
  perform pg_advisory_xact_lock(hashtext('maximus_agents:execution'));
  if not (select enabled from maximus_agents.settings where singleton) then return jsonb_build_object('enabled',false); end if;
  -- One exact-scope executable issue = one worker task. Do not add it to an unsafe role-wide batch.
  insert into maximus_agents.tasks(dedupe_key,cycle_date,role,title,priority,kind,issue_ids,payload)
  select d::text||':'||i.owner_role||':scoped:'||i.id::text,d,i.owner_role,
    'Correction DeepSeek ciblée : '||left(i.title,160),
    i.priority,'execute',array[i.id],
    jsonb_build_object('issues',jsonb_build_array(to_jsonb(i)),
      'contract','agents/autonomous/execution-contract.md',
      'mode','scoped_code_correction','deploy_allowed',false)
  from maximus_agents.issues i
  where i.status='open' and i.owner_role in ('SEARCH','DATA')
    and i.scope->>'execution_mode'='scoped_code_correction'
    and jsonb_typeof(i.scope->'files')='array'
    and case when jsonb_typeof(i.scope->'files')='array'
      then jsonb_array_length(i.scope->'files') = 1 else false end
    and not exists (
      select 1 from maximus_agents.tasks t
      where i.id=any(t.issue_ids) and t.kind='execute' and t.status in ('pending','running')
    )
  on conflict(dedupe_key) do nothing;

  foreach r in array array['DATA','ANALYST','SEARCH'] loop
    select array_agg(i.id order by i.priority,i.created_at),jsonb_agg(to_jsonb(i) order by i.priority,i.created_at)
      into ids,payload from maximus_agents.issues i where i.owner_role=r and i.status='open'
      and coalesce(i.scope->>'execution_mode','')<>'scoped_code_correction'
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
end $function$


CREATE OR REPLACE FUNCTION maximus_agents.claim_scoped_corrective_task(p_role text)
 RETURNS SETOF maximus_agents.tasks
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog','maximus_agents'
AS $body$
DECLARE t maximus_agents.tasks;
        cfg maximus_agents.settings;
        token uuid;
        paris_day date := (now() at time zone 'Europe/Paris')::date;
BEGIN
 IF p_role NOT IN ('SEARCH','DATA') THEN RAISE EXCEPTION 'Unsupported DeepSeek corrective role'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
 SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
 IF NOT FOUND OR NOT cfg.enabled
    OR NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role=p_role),false) THEN RETURN; END IF;
 IF EXISTS (SELECT 1 FROM maximus_agents.tasks WHERE role=p_role AND status='running') THEN RETURN; END IF;
 IF (SELECT count(*) FROM maximus_agents.runs r
     WHERE r.role=p_role AND (r.started_at at time zone 'Europe/Paris')::date=paris_day)
     >=cfg.max_claims_per_role_day THEN RETURN; END IF;
 -- Across both paid corrective roles: at most 3 task claims / Paris day.
 IF (SELECT count(*) FROM maximus_agents.runs r
     JOIN maximus_agents.tasks x ON x.id=r.task_id
     WHERE r.role IN ('SEARCH','DATA') AND x.kind='execute'
       AND (r.started_at at time zone 'Europe/Paris')::date=paris_day) >=3 THEN RETURN; END IF;
 SELECT x.* INTO t
 FROM maximus_agents.tasks x
 JOIN maximus_agents.issues i ON i.id=x.issue_ids[1]
 WHERE x.role=p_role AND x.kind='execute' AND x.status='pending' AND x.attempts<2
  AND cardinality(x.issue_ids)=1 AND i.owner_role=p_role AND i.status='open'
  AND i.scope->>'execution_mode'='scoped_code_correction'
  AND jsonb_typeof(i.scope->'files')='array'
  AND CASE WHEN jsonb_typeof(i.scope->'files')='array'
        THEN jsonb_array_length(i.scope->'files') = 1 ELSE FALSE END
  AND NOT EXISTS (SELECT 1 FROM unnest(x.depends_on) dep(id)
    LEFT JOIN maximus_agents.tasks parent ON parent.id=dep.id
    WHERE parent.id IS NULL OR parent.status<>'done')
 ORDER BY x.priority,x.created_at
 FOR UPDATE OF x SKIP LOCKED LIMIT 1;
 IF t.id IS NULL THEN RETURN; END IF;
 token := gen_random_uuid();
 UPDATE maximus_agents.tasks SET status='running', attempts=attempts+1,
  lease_token=token,lease_until=now()+make_interval(mins=>cfg.lease_minutes),
  updated_at=now() WHERE id=t.id RETURNING * INTO t;
 INSERT INTO maximus_agents.runs(task_id,role,attempt,lease_token)
  VALUES(t.id,p_role,t.attempts,token);
 UPDATE maximus_agents.issues SET status='in_progress',updated_at=now()
  WHERE id=t.issue_ids[1] AND status='open';
 UPDATE maximus_agents.agents SET heartbeat_at=now() WHERE role=p_role;
 RETURN NEXT t;
END
$body$;
REVOKE ALL ON FUNCTION maximus_agents.claim_scoped_corrective_task(text) FROM PUBLIC,anon,authenticated;

