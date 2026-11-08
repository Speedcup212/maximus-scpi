-- RECOVERY-186 bounded archive recovery; same existing task executor and publication controls.
CREATE OR REPLACE FUNCTION maximus_agents.prepare_historical_tof_proof_batch_v1(p_max integer DEFAULT 3)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $fn$
DECLARE today_paris date:=(now() at time zone 'Europe/Paris')::date;
        prepared integer:=0; active_jobs integer:=0; claims_today integer:=0;
        records jsonb;
BEGIN
 IF p_max IS NULL OR p_max<1 OR p_max>3 THEN RAISE EXCEPTION 'REC185_MAX_1_TO_3'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:historical-tof:prepare'));
 IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false)
   OR NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role='QA'),false)
 THEN RETURN jsonb_build_object('documents','[]'::jsonb,'prepared',0,
       'reason','agents_disabled','financial_certified',false,'deploy_allowed',false);
 END IF;
 SELECT count(*) INTO claims_today FROM maximus_agents.runs r
   JOIN maximus_agents.tasks t ON t.id=r.task_id
 WHERE t.payload->>'mode'='historical_tof_source_qa'
   AND (r.started_at at time zone 'Europe/Paris')::date=today_paris;
 IF claims_today>=5 THEN
   RETURN jsonb_build_object('documents','[]'::jsonb,'prepared',0,
      'reason','daily_claim_budget_exhausted','financial_certified',false,'deploy_allowed',false);
 END IF;
 SELECT count(*) INTO active_jobs FROM maximus_agents.tasks
 WHERE payload->>'mode'='historical_tof_source_qa'
   AND status IN ('pending','running');
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
   SELECT * FROM eligible WHERE rn=1 AND claims_today<3
   ORDER BY fund_period_count,source_period DESC,scpi_slug LIMIT greatest(0,p_max-active_jobs)
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
     AND attempts<2
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
             =(now() at time zone 'Europe/Paris')::date) >=5
 THEN RETURN; END IF;
 SELECT * INTO t FROM maximus_agents.tasks x
 WHERE x.role='QA' AND x.kind='audit' AND x.status='pending' AND x.attempts<2
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


-- Exact original archival retry after a documented issuer HTTP/binary failure.
-- Retains audit in maximus_agents.runs (attempt #1). No finance writes or retroactive PASS.
CREATE OR REPLACE FUNCTION maximus_agents.requeue_historical_archive_retry_v1()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents
AS $fn$
DECLARE moved integer:=0;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:historical-tof:archive-retry'));
 WITH eligible AS MATERIALIZED (
   SELECT t.id
   FROM maximus_agents.tasks t
   JOIN public.scpi_bulletins b
     ON b.scpi_slug=t.payload->>'scpi_slug'
    AND b.period=t.payload->>'source_period'
    AND b.source_url=t.payload->>'source_url'
    AND b.pdf_sha256=t.payload->>'pdf_sha256'
    AND b.pdf_path=b.scpi_slug||'/'||b.period||'/'||b.pdf_sha256||'.pdf'
   JOIN storage.objects o ON o.bucket_id='scpi-bulletins' AND o.name=b.pdf_path
   WHERE t.role='QA' AND t.kind='audit' AND t.status='blocked'
     AND t.attempts=1
     AND t.payload->>'mode'='historical_tof_source_qa'
     AND t.payload->'archive_retry_v1' IS NULL
     AND t.result->'evidence'->0->'finding'->'result'->>'error_code'='ISSUER_BINARY_PROOF_FAILED'
     AND (o.metadata->>'size')::bigint BETWEEN 1024 AND 20000000
     AND EXISTS (
       SELECT 1 FROM maximus_agents.scpi_historical_tof_quarantine_qa_v1 q
       WHERE q.scpi_slug=b.scpi_slug AND q.source_period=b.period
         AND q.still_blocks_strict_pass
     )
   ORDER BY t.created_at,t.id
   FOR UPDATE OF t SKIP LOCKED
   LIMIT 2
 ), changed AS (
   UPDATE maximus_agents.tasks t SET status='pending',
     lease_token=NULL,lease_until=NULL,completed_at=NULL,
     payload=t.payload||jsonb_build_object('archive_retry_v1',
       jsonb_build_object('authorized_at',now(),'reason',
         'publisher_unreachable_exact_original_already_stored',
         'prior_attempt',1,'next_attempt',2,
         'financial_certified',false,'deploy_allowed',false)),
     updated_at=now()
   FROM eligible e WHERE t.id=e.id
   RETURNING t.id,t.payload->>'scpi_slug' AS scpi_slug
 )
 SELECT count(*)::integer INTO moved FROM changed;
 RETURN jsonb_build_object('requeued',moved,'max_retries',2,
    'financial_certified',false,'deploy_allowed',false);
END;
$fn$;
REVOKE ALL ON FUNCTION maximus_agents.requeue_historical_archive_retry_v1()
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.prepare_historical_tof_proof_batch_v1(integer)
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.claim_historical_tof_proof_v1(text,text)
  FROM PUBLIC,anon,authenticated;
