-- RECOVERY-117: orchestrate existing maximus_agents.tasks/runs/agents in parallel.
-- No new queue, financial writes, authorization to deploy, or automatic QA PASS.
-- Apply only after code review; all functions operate on current existing tables.

CREATE OR REPLACE FUNCTION maximus_agents.prepare_parallel_audit_cycle()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents','public'
AS $function$
DECLARE
  d date := (now() at time zone 'Europe/Paris')::date;
  health jsonb;
  role_name text;
  dependency_ids uuid[];
  summary jsonb;
  focus text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:parallel-audit:prepare'));
  IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false) THEN
    RETURN jsonb_build_object('enabled',false,'reason','settings_disabled');
  END IF;
  PERFORM maximus_agents.reconcile_expired_tasks();
  -- Prior-day snapshots cannot be audited as current evidence. Keep the audit
  -- trail but close pending-only old cycles; never touch execute/verify tasks.
  UPDATE maximus_agents.tasks
    SET status='blocked',completed_at=now(),updated_at=now(),
        result=jsonb_build_object(
          'summary','Read-only parallel audit snapshot expired before execution',
          'verdict','REVIEW','deploy_allowed',false,
          'evidence',jsonb_build_array(jsonb_build_object(
            'source','maximus_agents.tasks.cycle_date','observed_at',now(),
            'finding',jsonb_build_object('expired_cycle',cycle_date,
                'new_cycle',d,'no_model_call',true))))
  WHERE kind='audit' AND status='pending' AND attempts=0
    AND cycle_date<d AND payload->>'mode'='parallel_readonly_audit'
    AND dedupe_key LIKE '%:parallel-audit:%';
  SELECT to_jsonb(h) INTO health FROM public.scpi_chantier_health h LIMIT 1;
  IF health IS NULL THEN RAISE EXCEPTION 'Current official SCPI health snapshot unavailable'; END IF;

  FOREACH role_name IN ARRAY ARRAY['DATA','SEARCH','ANALYST'] LOOP
    focus:=CASE role_name
      WHEN 'DATA' THEN 'Identify gaps in documentary provenance, current and historical TOF, and certification. Do not extract invented values.'
      WHEN 'SEARCH' THEN 'Prioritize official source and index gaps. No claim of new internet retrieval without corresponding source evidence.'
      ELSE 'Review financial gate, signal trajectory and cohort inconsistencies only in supplied verified snapshot, with no recommendation or publication.'
    END;
    INSERT INTO maximus_agents.tasks
      (dedupe_key,cycle_date,role,title,priority,kind,payload)
    VALUES
      (d::text||':parallel-audit:'||role_name,d,role_name,
       'RECOVERY-117 / audit documentaire parallele '||role_name,
       30,'audit',
       jsonb_build_object(
         'mode','parallel_readonly_audit','role',role_name,
         'focus',focus,'health_at_dispatch',health,'snapshot_source','public.scpi_chantier_health',
         'no_financial_mutation',true,'deploy_allowed',false,
         'independent_qa_required',true))
    ON CONFLICT(dedupe_key) DO NOTHING;
  END LOOP;

  SELECT array_agg(t.id ORDER BY t.role) INTO dependency_ids
  FROM maximus_agents.tasks t
  WHERE t.cycle_date=d AND t.kind='audit'
    AND t.dedupe_key IN (
      d::text||':parallel-audit:DATA',
      d::text||':parallel-audit:SEARCH',
      d::text||':parallel-audit:ANALYST');
  IF cardinality(dependency_ids)<>3 THEN
    RAISE EXCEPTION 'Three real upstream audit tasks required';
  END IF;
  INSERT INTO maximus_agents.tasks
    (dedupe_key,cycle_date,role,title,priority,kind,depends_on,payload)
  VALUES
    (d::text||':parallel-audit:QA',d,'QA','RECOVERY-117 / revue independante des trois audits',
     40,'audit',dependency_ids,
     jsonb_build_object('mode','parallel_readonly_audit','focus','Independent audit of upstream evidence and run status; never auto-approve finance.',
       'no_financial_mutation',true,'deploy_allowed',false))
  ON CONFLICT(dedupe_key) DO NOTHING;

  summary := jsonb_build_object(
    'prepared_at',now(),'cycle_date',d,'mode','parallel_readonly_audit',
    'task_count',(SELECT count(*) FROM maximus_agents.tasks t WHERE
      t.cycle_date=d AND t.dedupe_key LIKE d::text||':parallel-audit:%'),
    'roles',jsonb_build_array('DATA','SEARCH','ANALYST','QA'),
    'deploy_allowed',false,
    'actual_inference_executed',false);
  -- CONTROL heartbeat means only that the coordinator prepared/observed the
  -- existing task queue; it never implies that workers executed an LLM call.
  UPDATE maximus_agents.agents SET heartbeat_at=now(),last_summary=summary WHERE role='CONTROL';
  RETURN summary;
END
$function$;

CREATE OR REPLACE FUNCTION maximus_agents.claim_parallel_audit_task(p_role text)
RETURNS SETOF maximus_agents.tasks
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents'
AS $function$
DECLARE
  d date := (now() at time zone 'Europe/Paris')::date;
  cfg maximus_agents.settings;
  t maximus_agents.tasks;
  token uuid;
BEGIN
  IF p_role NOT IN ('DATA','SEARCH','ANALYST','QA') THEN
    RAISE EXCEPTION 'Role not permitted for read-only audit';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
  SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
  IF NOT FOUND OR NOT cfg.enabled OR NOT coalesce(
    (SELECT enabled FROM maximus_agents.agents WHERE role=p_role),false) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM maximus_agents.tasks WHERE role=p_role AND status='running') THEN RETURN; END IF;
  IF (SELECT count(*) FROM maximus_agents.runs
       WHERE role=p_role AND (started_at at time zone 'Europe/Paris')::date=d)
     >= cfg.max_claims_per_role_day THEN RETURN; END IF;
  SELECT * INTO t FROM maximus_agents.tasks x
  WHERE x.role=p_role AND x.kind='audit' AND x.status='pending'
    AND x.cycle_date=d AND x.attempts<2
    AND x.dedupe_key=d::text||':parallel-audit:'||p_role
    AND x.payload->>'mode'='parallel_readonly_audit'
    AND NOT EXISTS (
      SELECT 1 FROM unnest(x.depends_on) dep(id)
      LEFT JOIN maximus_agents.tasks parent ON parent.id=dep.id
      WHERE parent.id IS NULL OR parent.status<>'done'
    )
  FOR UPDATE SKIP LOCKED LIMIT 1;
  IF t.id IS NULL THEN RETURN; END IF;
  token:=gen_random_uuid();
  UPDATE maximus_agents.tasks SET status='running',attempts=attempts+1,
    lease_token=token,lease_until=now()+make_interval(mins=>cfg.lease_minutes),
    updated_at=now() WHERE id=t.id RETURNING * INTO t;
  INSERT INTO maximus_agents.runs(task_id,role,attempt,lease_token)
    VALUES(t.id,p_role,t.attempts,token);
  UPDATE maximus_agents.agents SET heartbeat_at=now() WHERE role=p_role;
  RETURN NEXT t;
END
$function$;

-- Harden privileges: trusted GitHub OIDC Edge Function connects with SUPABASE_DB_URL.
REVOKE ALL ON FUNCTION maximus_agents.prepare_parallel_audit_cycle() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.claim_parallel_audit_task(text) FROM PUBLIC,anon,authenticated;
