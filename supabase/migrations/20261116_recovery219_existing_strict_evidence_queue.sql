-- RECOVERY-219: exact 69-fund triage via EXISTING tasks/runs/agents; no financial update.
-- Read-only source registry/replay review; independent financial QA remains mandatory.
CREATE OR REPLACE FUNCTION maximus_agents.prepare_existing_strict_evidence_v1(p_max integer DEFAULT 29)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $fn$
DECLARE d date:=(now() at time zone 'Europe/Paris')::date;
  n_total int; n_pass int; n_fail int; n_created int; n_pending int;
BEGIN
 IF p_max NOT BETWEEN 1 AND 29 THEN RAISE EXCEPTION 'REC219_BAD_LIMIT'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:existing-strict:prepare'));
 IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false) THEN
   RETURN jsonb_build_object('created',0,'enabled',false,'financial_certified',false,'deploy_allowed',false);
 END IF;
 SELECT count(*)::int,count(*) FILTER(WHERE crash_test_status='PASS_100')::int,
   count(*) FILTER(WHERE crash_test_status='FAIL_STRICT')::int
 INTO n_total,n_pass,n_fail FROM public.scpi_crash_test_strict_v2;
 IF n_total<>69 OR n_pass+n_fail<>69 OR
 (SELECT count(*) FROM maximus_agents.scpi_universe WHERE lifecycle='existing')<>69
 OR EXISTS(SELECT 1 FROM public.scpi_crash_test_strict_v2 v
   LEFT JOIN maximus_agents.scpi_universe u USING(scpi_slug)
   WHERE u.lifecycle IS DISTINCT FROM 'existing')
 THEN RAISE EXCEPTION 'REC219_COHORT_DRIFT'; END IF;
 WITH ranked AS (
 SELECT a.*,row_number() OVER(PARTITION BY a.scpi_slug ORDER BY
   CASE a.route_family WHEN 'SOURCE_HOST_REJECTED' THEN 0
   WHEN 'SOURCE_REGISTRY' THEN 1 WHEN 'SOURCE_URL_MISSING' THEN 2
   WHEN 'TOF_UNJUSTIFIED_ABSENCE' THEN 3 WHEN 'QUARTERLY_DOCUMENT_QUEUE' THEN 4
   WHEN 'ANNUAL_DOCUMENT_QUEUE' THEN 4 WHEN 'TOF_INDEPENDENT_CERT' THEN 5
   WHEN 'ANNUAL_INDEPENDENT_QA' THEN 5 ELSE 6 END,
   a.blocking_items DESC,a.route_family) AS rn
 FROM maximus_agents.scpi_strict_actual_admission_v1 a
 JOIN public.scpi_crash_test_strict_v2 v USING(scpi_slug)
 WHERE v.crash_test_status='FAIL_STRICT' AND a.owner_role IN ('DATA','SEARCH','ANALYST','QA')
 ),selected AS (
 SELECT r.*,s.verification_status,s.issuer_source_sha256,
 md5(concat_ws('|',r.scpi_slug,r.route_family,r.target_period,r.blocking_items::text,
  coalesce(s.verification_status,''),coalesce(s.issuer_source_sha256,''))) AS fingerprint
 FROM ranked r LEFT JOIN public.scpi_source_registry s USING(scpi_slug)
 WHERE rn=1 AND NOT EXISTS(SELECT 1 FROM maximus_agents.tasks t
   WHERE t.payload->>'mode'='existing_strict_evidence'
   AND t.payload->>'scpi_slug'=r.scpi_slug AND t.status IN ('pending','running'))
 ORDER BY r.blocking_items DESC,r.scpi_slug LIMIT p_max
 ),created AS (
 INSERT INTO maximus_agents.tasks
   (dedupe_key,cycle_date,role,title,kind,status,priority,payload)
 SELECT 'strict-evidence:v1:'||scpi_slug||':'||route_family||':'||
    coalesce(target_period,'unknown')||':'||fingerprint,
 d,owner_role,'RECOVERY-219 source evidence '||scpi_slug||' / '||route_family,
 'audit','pending',2,
 jsonb_build_object('mode','existing_strict_evidence','scpi_slug',scpi_slug,
 'target_period',target_period,'route_family',route_family,
 'blocking_items',blocking_items,'period_matched_pdf_proofs',period_matched_pdf_proofs,
 'source_fingerprint',fingerprint,'source_registry_status',verification_status,
 'recorded_issuer_sha',issuer_source_sha256,'scope','existing_69_only',
 'financial_certified',false,'deploy_allowed',false,'independent_qa_required',true)
 FROM selected ON CONFLICT(dedupe_key) DO NOTHING RETURNING id
 ) SELECT count(*)::int INTO n_created FROM created;
 SELECT count(*)::int INTO n_pending FROM maximus_agents.tasks
 WHERE payload->>'mode'='existing_strict_evidence' AND status='pending';
 RETURN jsonb_build_object('strict_total',n_total,'strict_pass',n_pass,'strict_fail',n_fail,
 'created',n_created,'pending',n_pending,'financial_certified',false,'deploy_allowed',false);
END;$fn$;

CREATE OR REPLACE FUNCTION maximus_agents.claim_existing_strict_evidence_v1(p_role text)
RETURNS SETOF maximus_agents.tasks LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $fn$
DECLARE cfg maximus_agents.settings; t maximus_agents.tasks; tok uuid; 
  d date:=(now() at time zone 'Europe/Paris')::date;
BEGIN
 IF p_role NOT IN ('DATA','SEARCH','ANALYST','QA') THEN RAISE EXCEPTION 'REC219_ROLE_DENIED'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
 SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
 IF NOT FOUND OR NOT cfg.enabled OR
   NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role=p_role),false)
 THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.tasks WHERE role=p_role AND status='running') THEN RETURN; END IF;
 IF (SELECT count(*) FROM maximus_agents.runs r JOIN maximus_agents.tasks x ON x.id=r.task_id
    WHERE r.role=p_role AND (r.started_at AT TIME ZONE 'Europe/Paris')::date=d
    AND coalesce(x.payload->>'batch_mode','')<>'candidate20')>=cfg.max_claims_per_role_day
 THEN RETURN; END IF;
 SELECT x.* INTO t FROM maximus_agents.tasks x
 JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=x.payload->>'scpi_slug'
 WHERE x.role=p_role AND x.kind='audit' AND x.status='pending' AND x.attempts<2
 AND x.payload->>'mode'='existing_strict_evidence' AND v.crash_test_status='FAIL_STRICT'
 AND EXISTS(SELECT 1 FROM maximus_agents.scpi_strict_actual_admission_v1 a
   WHERE a.scpi_slug=v.scpi_slug AND a.owner_role=x.role
   AND a.route_family=x.payload->>'route_family'
   AND a.target_period IS NOT DISTINCT FROM x.payload->>'target_period')
 ORDER BY x.priority,x.created_at FOR UPDATE OF x SKIP LOCKED LIMIT 1;
 IF t.id IS NULL THEN RETURN; END IF;
 tok:=gen_random_uuid();
 UPDATE maximus_agents.tasks SET status='running',attempts=attempts+1,
 lease_token=tok,lease_until=now()+make_interval(mins=>cfg.lease_minutes),
 updated_at=now() WHERE id=t.id RETURNING * INTO t;
 INSERT INTO maximus_agents.runs(task_id,role,attempt,lease_token)
 VALUES(t.id,p_role,t.attempts,tok);
 UPDATE maximus_agents.agents SET heartbeat_at=now() WHERE role=p_role;
 RETURN NEXT t;
END;$fn$;

CREATE OR REPLACE FUNCTION maximus_agents.complete_existing_strict_evidence_v1(p_id uuid,p_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $fn$
DECLARE t maximus_agents.tasks; reg jsonb; replay jsonb; live text; nxt text; body jsonb;
BEGIN
 SELECT * INTO t FROM maximus_agents.tasks
 WHERE id=p_id AND lease_token=p_token AND status='running' AND lease_until>now()
 AND payload->>'mode'='existing_strict_evidence' AND kind='audit'
 FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'REC219_INVALID_LEASE'; END IF;
 SELECT v.crash_test_status INTO live FROM public.scpi_crash_test_strict_v2 v
 JOIN maximus_agents.scpi_universe u USING(scpi_slug)
 WHERE v.scpi_slug=t.payload->>'scpi_slug' AND u.lifecycle='existing';
 SELECT to_jsonb(s) INTO reg FROM
 (SELECT verification_status,confidence_level,issuer_source_sha256,issuer_source_period
  FROM public.scpi_source_registry WHERE scpi_slug=t.payload->>'scpi_slug' LIMIT 1) s;
 SELECT coalesce(jsonb_agg(to_jsonb(d)),'[]'::jsonb) INTO replay FROM
 (SELECT source_period,pdf_sha256,page_count,status,processing_complete,
  result->>'identity_verified' AS identity_verified,
  result->>'period_verified' AS period_verified
  FROM maximus_agents.scpi_bulletin_replay_documents
  WHERE scpi_slug=t.payload->>'scpi_slug'
  AND source_period IS NOT DISTINCT FROM t.payload->>'target_period'
  ORDER BY processed_at DESC NULLS LAST LIMIT 3) d;
 nxt:=CASE t.payload->>'route_family'
 WHEN 'SOURCE_REGISTRY' THEN 'Reverifier emetteur, domaine, periode et SHA; rapprocher registre.'
 WHEN 'SOURCE_HOST_REJECTED' THEN 'Revoir le domaine emetteur et la provenance de la source exacte.'
 WHEN 'TOF_UNJUSTIFIED_ABSENCE' THEN 'Lire page TOF du PDF officiel et faire arbitrer le conflit.'
 WHEN 'QUARTERLY_DOCUMENT_QUEUE' THEN 'Rejouer extraction trimestrielle source exacte et QA independante.'
 WHEN 'INDEPENDENT_STRICT_EVIDENCE_GUARD' THEN 'Instruire quarantaine historique et revue QA independante.'
 ELSE 'Examiner preuve PDF exacte et soumettre a QA avant tout certificat.' END;
 body:=jsonb_build_object(
  'summary','Reconciliation documentaire en base uniquement; aucune valeur ni certification financiere modifiee.',
  'verdict','REVIEW','deploy_allowed',false,'financial_certified',false,
  'independent_financial_qa_completed',false,'next_action',nxt,
  'evidence',jsonb_build_array(jsonb_build_object(
    'source','public.scpi_crash_test_strict_v2 + public.scpi_source_registry + maximus_agents.scpi_bulletin_replay_documents',
    'observed_at',now()::text,
    'finding',jsonb_build_object('scpi_slug',t.payload->>'scpi_slug',
       'period',t.payload->>'target_period','live_status',coalesce(live,'UNAVAILABLE'),
       'source_registry',coalesce(reg,'{}'::jsonb),'replay_metadata',replay,
       'pdf_pages_read',false,'no_financial_decision',true))));
 PERFORM maximus_agents.finish_task(p_id,p_token,
   CASE WHEN live='FAIL_STRICT' THEN 'blocked' ELSE 'done' END,body);
 RETURN jsonb_build_object('scpi_slug',t.payload->>'scpi_slug','role',t.role,
   'status',CASE WHEN live='FAIL_STRICT' THEN 'blocked' ELSE 'done' END,
   'verdict','REVIEW','next_action',nxt,'financial_certified',false,'deploy_allowed',false);
END;$fn$;

-- Isolate existing-evidence jobs from the generic claim worker.
CREATE OR REPLACE FUNCTION maximus_agents.claim_task(p_role text)
 RETURNS SETOF maximus_agents.tasks
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents'
AS $function$
declare t maximus_agents.tasks; cfg maximus_agents.settings; token uuid;
begin
  if p_role not in ('DATA','ANALYST','SEARCH','QA') then raise exception 'Invalid worker role'; end if;
  perform pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
  select * into cfg from maximus_agents.settings where singleton;
  if not cfg.enabled or not (select enabled from maximus_agents.agents where role=p_role) then return; end if;
  if exists(select 1 from maximus_agents.tasks where role=p_role and status='running') then return; end if;
  if (select count(*) from maximus_agents.runs r join maximus_agents.tasks counted on counted.id=r.task_id where r.role=p_role and (r.started_at at time zone 'Europe/Paris')::date=(now() at time zone 'Europe/Paris')::date and coalesce(counted.payload->>'batch_mode','')<>'candidate20')>=cfg.max_claims_per_role_day then return; end if;
  select * into t from maximus_agents.tasks x where x.role=p_role and x.status='pending' and x.attempts<2
    and coalesce(x.payload->>'batch_mode','')<>'candidate20'
    and coalesce(x.payload->>'mode','') not in ('historical_tof_source_qa','existing_strict_evidence')
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
end $function$
;
