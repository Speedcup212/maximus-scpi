-- RECOVERY-185: bounded, idempotent REAL historical TOF source-proof jobs.
-- Uses existing agents/tasks/runs and the existing GitHub OIDC workflow.
-- Nothing in this migration changes a financial metric, a quarantine or PASS_100.

CREATE OR REPLACE FUNCTION maximus_agents.prepare_historical_tof_proof_batch_v1(p_max integer DEFAULT 3)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $fn$
DECLARE today_paris date:=(now() at time zone 'Europe/Paris')::date;
        prepared integer:=0; records jsonb;
BEGIN
 IF p_max<1 OR p_max>3 THEN RAISE EXCEPTION 'REC185_MAX_1_TO_3'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:historical-tof:prepare'));
 IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false)
   OR NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role='QA'),false)
 THEN RETURN jsonb_build_object('documents','[]'::jsonb,'prepared',0,
       'reason','agents_disabled','financial_certified',false,'deploy_allowed',false);
 END IF;
 WITH eligible AS (
   SELECT q.scpi_slug,q.source_period,q.repair_family,
      r.scpi_name,d.source_url,d.pdf_sha256,d.page_count,
      c.allowed_hosts,
      count(*) OVER(PARTITION BY q.scpi_slug) AS fund_period_count,
      row_number() OVER(PARTITION BY q.scpi_slug ORDER BY q.source_period DESC) AS rn
   FROM maximus_agents.scpi_historical_tof_quarantine_qa_v1 q
   JOIN public.scpi_source_registry r ON r.scpi_slug=q.scpi_slug
   JOIN public.scpi_source_connectors c ON c.scpi_slug=q.scpi_slug AND c.enabled=true
   JOIN LATERAL (
     SELECT d.source_url,d.pdf_sha256,d.page_count,d.processed_at
     FROM maximus_agents.scpi_bulletin_replay_documents d
     WHERE d.scpi_slug=q.scpi_slug AND d.source_period=q.source_period
       AND d.status='extracted' AND d.processing_complete IS TRUE
       AND d.result->>'identity_verified'='true'
       AND d.result->>'period_verified'='true'
       AND d.pdf_sha256 ~ '^[0-9a-f]{64}$'
       AND d.page_count BETWEEN 1 AND 80
       AND d.source_url LIKE 'https://%'
       AND lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(c.allowed_hosts)
     ORDER BY d.processed_at DESC NULLS LAST LIMIT 1
   ) d ON TRUE
   WHERE q.still_blocks_strict_pass AND q.has_archive_pdf_exact_period
     AND q.source_period ~ '^20[0-9]{2}-T[1-4]$'
     AND r.scpi_name IS NOT NULL
     AND NOT EXISTS (
        SELECT 1 FROM maximus_agents.tasks t
        WHERE t.dedupe_key='historical-tof-proof:'||q.scpi_slug||':'||q.source_period||':'||d.pdf_sha256
     )
 ), selected AS (
   SELECT * FROM eligible WHERE rn=1
   ORDER BY fund_period_count,source_period DESC,scpi_slug LIMIT p_max
 ), created AS (
   INSERT INTO maximus_agents.tasks
     (dedupe_key,cycle_date,role,title,kind,status,priority,payload)
   SELECT 'historical-tof-proof:'||scpi_slug||':'||source_period||':'||pdf_sha256,
     today_paris,'QA','RECOVERY-185 preuve PDF historique TOF '||scpi_slug||' '||source_period,
     'audit','pending',8,
     jsonb_build_object(
       'mode','historical_tof_source_qa','scpi_slug',scpi_slug,
       'source_period',source_period,'repair_family',repair_family,
       'candidate_name',scpi_name,'allowed_hosts',to_jsonb(allowed_hosts),
       'source_url',source_url,'pdf_sha256',pdf_sha256,
       'page_count',page_count,'document_kind','quarterly_bulletin',
       'source','maximus_agents.scpi_historical_tof_quarantine_qa_v1 + scpi_bulletin_replay_documents',
       'financial_certified',false,'deploy_allowed',false,
       'independent_qa_required',true)
   FROM selected
   ON CONFLICT(dedupe_key) DO NOTHING
   RETURNING id
 )
 SELECT count(*)::integer INTO prepared FROM created;

 SELECT coalesce(jsonb_agg(jsonb_build_object(
   'scpi_slug',t.payload->>'scpi_slug',
   'source_period',t.payload->>'source_period') ORDER BY t.created_at,t.id),'[]'::jsonb)
 INTO records FROM (
   SELECT * FROM maximus_agents.tasks
   WHERE payload->>'mode'='historical_tof_source_qa'
     AND status='pending'
     AND attempts=0
     AND created_at>=now()-interval '1 day'
   ORDER BY created_at,id LIMIT p_max
 ) t;
 RETURN jsonb_build_object('documents',records,'prepared',prepared,
   'financial_certified',false,'deploy_allowed',false,
   'worker_mode','historical_tof_source_qa');
END;
$fn$;

CREATE OR REPLACE FUNCTION maximus_agents.claim_historical_tof_proof_v1(p_slug text,p_period text)
RETURNS SETOF maximus_agents.tasks LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $fn$
DECLARE t maximus_agents.tasks; cfg maximus_agents.settings; tok uuid;
BEGIN
 IF p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
   OR p_period !~ '^20[0-9]{2}-T[1-4]$'
 THEN RAISE EXCEPTION 'REC185_INVALID_SCOPED_JOB'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:historical-tof:claim:'||p_slug||':'||p_period));
 SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
 IF NOT FOUND OR NOT cfg.enabled
   OR NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role='QA'),false)
 THEN RETURN; END IF;
 IF (SELECT count(*) FROM maximus_agents.runs r
       JOIN maximus_agents.tasks x ON x.id=r.task_id
       WHERE x.payload->>'mode'='historical_tof_source_qa'
         AND (r.started_at at time zone 'Europe/Paris')::date
             =(now() at time zone 'Europe/Paris')::date) >=3
 THEN RETURN; END IF;
 SELECT * INTO t FROM maximus_agents.tasks x
 WHERE x.role='QA' AND x.kind='audit' AND x.status='pending' AND x.attempts=0
   AND x.payload->>'mode'='historical_tof_source_qa'
   AND x.payload->>'scpi_slug'=p_slug
   AND x.payload->>'source_period'=p_period
   AND (x.payload->>'pdf_sha256') ~ '^[0-9a-f]{64}$'
   AND EXISTS (
     SELECT 1 FROM maximus_agents.scpi_historical_tof_quarantine_qa_v1 q
     WHERE q.scpi_slug=p_slug AND q.source_period=p_period AND q.still_blocks_strict_pass
   )
   AND EXISTS (
     SELECT 1 FROM maximus_agents.scpi_bulletin_replay_documents d
     WHERE d.scpi_slug=p_slug AND d.source_period=p_period
       AND d.pdf_sha256=x.payload->>'pdf_sha256'
       AND d.source_url=x.payload->>'source_url'
       AND d.status='extracted' AND d.processing_complete IS TRUE
   )
 FOR UPDATE SKIP LOCKED LIMIT 1;
 IF t.id IS NULL THEN RETURN; END IF;
 tok:=gen_random_uuid();
 UPDATE maximus_agents.tasks
 SET status='running',attempts=attempts+1,lease_token=tok,
   lease_until=now()+make_interval(mins:=greatest(cfg.lease_minutes,20)),
   updated_at=now()
 WHERE id=t.id RETURNING * INTO t;
 INSERT INTO maximus_agents.runs(task_id,role,attempt,lease_token)
 VALUES(t.id,'QA',t.attempts,tok);
 UPDATE maximus_agents.agents SET heartbeat_at=now() WHERE role='QA';
 RETURN NEXT t;
END;
$fn$;

-- Legacy generic claim MUST NOT steal the special QA job.
-- Strict fail-closed source transformation, only when the expected function is present.
DO $do$
DECLARE original text; altered text; anchor text;
BEGIN
 SELECT pg_get_functiondef(p.oid) INTO original
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='maximus_agents' AND p.proname='claim_task'
   AND pg_get_function_identity_arguments(p.oid)='p_role text';
 anchor:='and coalesce(x.payload->>''batch_mode'','''')<>''candidate20''';
 IF original IS NULL OR position(anchor IN original)=0 THEN
   RAISE EXCEPTION 'REC185_GENERIC_CLAIM_FUNCTION_CHANGED_ABORT';
 END IF;
 altered:=replace(original,anchor,anchor||
   E'\n    and coalesce(x.payload->>''mode'','''')<>''historical_tof_source_qa''');
 IF altered=original THEN RAISE EXCEPTION 'REC185_UNABLE_TO_ISOLATE_NEW_QUEUE'; END IF;
 EXECUTE altered;
END;
$do$;

REVOKE ALL ON FUNCTION maximus_agents.prepare_historical_tof_proof_batch_v1(integer)
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.claim_historical_tof_proof_v1(text,text)
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.prepare_historical_tof_proof_batch_v1(integer) IS
 'Bounded official-publisher PDF identity/SHA QA dispatch, no finance mutation';
