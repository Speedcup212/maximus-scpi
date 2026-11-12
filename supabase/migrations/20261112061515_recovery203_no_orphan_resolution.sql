-- RECOVERY-203. Reuse CONTROL, watchdog, issues and native discovery workers.
-- A tracked defect is NOT a verified number or an authorization to publish.
CREATE OR REPLACE VIEW maximus_agents.document_resolution_backlog_v1
WITH (security_invoker=true) AS
SELECT 'ocr:'||scpi_slug||':'||source_period||':'||document_kind AS source_key,
 'ocr'::text AS source_kind,scpi_slug,source_period,status AS source_state,
 CASE WHEN status LIKE 'quarantined%' THEN 'ANALYST' ELSE 'DATA' END::text AS owner_role,
 NULL::text AS source_url,coalesce(pdf_sha256,'') AS source_hash,
 'Recover archived original; verify exact fund and period before retry'::text AS required_action
FROM maximus_agents.scpi_ocr_jobs WHERE status NOT IN ('done','skipped_existing_extraction')
UNION ALL
SELECT 'replay:'||document_key,'replay',scpi_slug,source_period,status,
 CASE WHEN status IN ('fetch_error','source_access_blocked','source_reference_review') THEN 'SEARCH' ELSE 'ANALYST' END,
 source_url,coalesce(pdf_sha256,expected_sha256,''),
 'Find alternate official original or perform independent page-level QA'
FROM maximus_agents.scpi_bulletin_replay_documents
WHERE status NOT IN ('extracted','source_reference_resolved')
UNION ALL
SELECT 'metric:'||scpi_slug||':'||coalesce(target_period,'unknown')||':'||route_family,
 'metric',scpi_slug,target_period,route_family,
 CASE WHEN owner_role='QA' THEN 'ANALYST' ELSE owner_role END,NULL,'',
 'Resolve '||route_family||' with period-bound source, units, page and independent QA'
FROM maximus_agents.scpi_missing_metric_control_routes_v1
UNION ALL
SELECT 'backfill:'||id::text,'backfill',scpi_slug,source_period,status,'SEARCH',source_url,'',
 'Use existing official-source discovery; preserve rejected URL and period guard'
FROM public.scpi_backfill_queue WHERE status NOT IN ('already_loaded','not_applicable')
UNION ALL
SELECT 'annual:'||id::text,'annual',scpi_slug,fiscal_year::text||'-RA',status,'SEARCH',NULL,'',
 'Use existing annual discovery worker; inspect official report if attempts exhausted'
FROM public.scpi_annual_backfill_queue WHERE status NOT IN ('done','already_loaded','not_applicable','completed','extracted')
UNION ALL
SELECT 'registry:'||scpi_slug,'registry',scpi_slug,NULL,coalesce(last_error,'source_registry_incomplete'),
 'SEARCH',official_scpi_page_url,'','Repair official source connector or obtain issuer document'
FROM public.scpi_source_registry WHERE coalesce(error_count,0)>0 OR last_error IS NOT NULL
UNION ALL
SELECT 'task:'||id::text,'task',payload->>'scpi_slug',NULL,status,
 CASE WHEN role IN ('DATA','SEARCH','ANALYST') THEN role ELSE 'ANALYST' END,NULL,'',
 'Inspect failed execution; repair cause and verify the underlying result before closure'
FROM maximus_agents.tasks WHERE status IN ('failed','blocked')
UNION ALL
SELECT 'issue:'||id::text,'issue',scope->>'scpi_slug',scope->>'source_period',status,
 owner_role,NULL,'','Resolve original issue; retain independent QA and release requirements'
FROM maximus_agents.issues WHERE status='blocked'
 AND coalesce(scope->>'execution_mode','')<>'document_resolution'
UNION ALL
SELECT 'fee:'||scpi_slug||':'||fee_kind,'fee',scpi_slug,NULL,verification_status,'ANALYST',source_url,
 coalesce(pdf_sha256,''),'Read the contractual fee clause; distinguish HT/TTC, PRIIPs cost and effective dates'
FROM public.scpi_fee_evidence_current WHERE verification_status IS DISTINCT FROM 'verified'
UNION ALL
SELECT 'history-quarantine:'||id::text,'history_quarantine',scpi_slug,
 original_row->>'source_period',reason,'ANALYST',NULL,'',
 'Review quarantined historical source; confirm protective rejection or verify a replacement'
FROM public.scpi_history_quarantine
UNION ALL
SELECT 'provenance-quarantine:'||event_key,'provenance_quarantine',snapshot->>'scpi_slug',
 snapshot->>'source_period',reason,'ANALYST',snapshot->>'source_url','',
 'Verify quarantined provenance against archived original and exact identity'
FROM maximus_agents.scpi_replay_provenance_quarantine
UNION ALL
SELECT 'rejection:'||scpi_slug||':'||source_period||':'||metric,'rejection',scpi_slug,
 source_period,rejection_status,'ANALYST',NULL,'',
 'Obtain independent replacement evidence; never undo a reviewed rejection automatically'
FROM scpi_internal.metric_certification_rejections
UNION ALL
SELECT DISTINCT ON (scpi_slug,source_period,bulletin_url,message)
 'refusal:'||md5(concat_ws('|',scpi_slug,source_period,bulletin_url,message)),
 'refusal',scpi_slug,source_period,coalesce(message,'document_refused'),'ANALYST',bulletin_url,
 substring(message from 'sha256=([a-f0-9]{64})'),
 'Compare the refused binary with the archived certified original; verify any replacement independently'
FROM public.scpi_ingestion_events WHERE step='corum_document_refused';
REVOKE ALL ON maximus_agents.document_resolution_backlog_v1 FROM PUBLIC,anon,authenticated,service_role;

-- Positive server-side evidence, never disappearance alone. These closures concern
-- the named technical defect; the existing financial/publication gates still apply.
CREATE OR REPLACE FUNCTION maximus_agents.document_resolution_proof_v1(p_scope jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,maximus_agents AS $$
DECLARE proof jsonb;
BEGIN
 CASE p_scope->>'source_kind'
 WHEN 'ocr' THEN
  SELECT jsonb_build_object('kind','verified_ocr_completion','sha256',j.pdf_sha256,
   'pages',j.total_pages,'run_reference',j.run_reference,'financial_certified',false)
  INTO proof FROM maximus_agents.scpi_ocr_jobs j
  WHERE 'ocr:'||j.scpi_slug||':'||j.source_period||':'||j.document_kind=p_scope->>'source_key'
   AND j.status='done' AND j.pdf_sha256~'^[a-f0-9]{64}$'
   AND j.total_pages>0 AND j.pages_ocr=j.total_pages
   AND j.text_characters>0 AND j.run_reference LIKE 'https://github.com/Speedcup212/maximus-scpi/actions/runs/%';
 WHEN 'replay' THEN
  SELECT jsonb_build_object('kind','verified_replay_completion','sha256',d.pdf_sha256,
   'pages',d.page_count,'financial_certified',false) INTO proof
  FROM maximus_agents.scpi_bulletin_replay_documents d
  WHERE 'replay:'||d.document_key=p_scope->>'source_key' AND d.status='extracted'
   AND d.processing_complete IS TRUE AND d.page_count>0 AND d.pages_read>=d.page_count
   AND d.pdf_sha256~'^[a-f0-9]{64}$'
   AND d.result->>'identity_verified'='true' AND d.result->>'period_verified'='true';
 WHEN 'metric' THEN
  SELECT jsonb_build_object('kind','current_strict_admission_pass','scpi_slug',v.scpi_slug,
   'financial_certified',false) INTO proof
  FROM public.scpi_crash_test_strict_v2 v WHERE v.scpi_slug=p_scope->>'scpi_slug'
   AND v.crash_test_status='PASS_100'
   AND NOT EXISTS(SELECT 1 FROM maximus_agents.scpi_missing_metric_control_routes_v1 r
    WHERE 'metric:'||r.scpi_slug||':'||coalesce(r.target_period,'unknown')||':'||r.route_family=p_scope->>'source_key');
 WHEN 'fee' THEN
  SELECT jsonb_build_object('kind','verified_contractual_fee','sha256',f.pdf_sha256,
   'page',f.source_page,'financial_certified',false) INTO proof
  FROM public.scpi_fee_evidence_current f WHERE 'fee:'||f.scpi_slug||':'||f.fee_kind=p_scope->>'source_key'
   AND f.verification_status='verified' AND f.product_identity_verified AND f.semantic_review_verified
   AND f.pdf_sha256~'^[a-f0-9]{64}$' AND f.source_page>0 AND f.source_url LIKE 'https://%'
   AND length(f.evidence_text)>30;
 WHEN 'registry' THEN
  SELECT jsonb_build_object('kind','successful_official_source_check','url',r.official_scpi_page_url,
   'checked_at',r.last_success_at,'financial_certified',false) INTO proof
  FROM public.scpi_source_registry r WHERE 'registry:'||r.scpi_slug=p_scope->>'source_key'
   AND r.last_success_at>(p_scope->>'first_seen_at')::timestamptz
   AND r.last_error IS NULL AND coalesce(r.error_count,0)=0 AND r.official_scpi_page_url LIKE 'https://%';
 WHEN 'task' THEN
  SELECT jsonb_build_object('kind','completed_original_task','task_id',t.id,'result',t.result,
   'financial_certified',false) INTO proof FROM maximus_agents.tasks t
  WHERE 'task:'||t.id::text=p_scope->>'source_key' AND t.status='done' AND t.result->>'verdict'='PASS'
   AND jsonb_typeof(t.result->'evidence')='array' AND jsonb_array_length(t.result->'evidence')>0;
 WHEN 'refusal' THEN
  SELECT jsonb_build_object('kind','same_binary_accepted','sha256',d.pdf_sha256,
   'url',d.source_url,'status',d.status,'financial_certified',false) INTO proof
  FROM maximus_agents.scpi_corum_document_runs d WHERE d.scpi_slug=p_scope->>'scpi_slug'
   AND d.source_period=p_scope->>'source_period' AND d.source_url=p_scope->>'source_url'
   AND d.pdf_sha256=p_scope->>'source_hash' AND d.pdf_sha256~'^[a-f0-9]{64}$'
   AND d.checked_at>(p_scope->>'first_seen_at')::timestamptz
   AND d.status IN ('certified_core','source_verified','certified_core_existing');
 -- Refusals, quarantines and reviewed rejections deliberately require a scoped
 -- verifier addition with source-bound evidence. A JSON "PASS" is insufficient.
 ELSE NULL;
 END CASE;
 RETURN proof;
END $$;
REVOKE ALL ON FUNCTION maximus_agents.document_resolution_proof_v1(jsonb) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION maximus_agents.guard_document_resolution_v1()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,maximus_agents AS $$
DECLARE proof jsonb;
BEGIN
 IF TG_OP='UPDATE' AND OLD.scope->>'execution_mode'='document_resolution' THEN
  IF NEW.scope->>'execution_mode' IS DISTINCT FROM 'document_resolution'
   OR NEW.scope->>'source_key' IS DISTINCT FROM OLD.scope->>'source_key'
   OR NEW.scope->>'source_kind' IS DISTINCT FROM OLD.scope->>'source_kind'
   OR NEW.scope->>'scpi_slug' IS DISTINCT FROM OLD.scope->>'scpi_slug'
   OR NEW.scope->>'source_period' IS DISTINCT FROM OLD.scope->>'source_period'
   OR NEW.scope->>'first_seen_at' IS DISTINCT FROM OLD.scope->>'first_seen_at'
   OR NEW.scope->>'deadline_at' IS DISTINCT FROM OLD.scope->>'deadline_at' THEN
   RAISE EXCEPTION 'RESOLUTION_IDENTITY_AND_DEADLINE_IMMUTABLE';
  END IF;
 END IF;
 IF NEW.scope->>'execution_mode'='document_resolution' THEN
  IF NEW.owner_role NOT IN ('DATA','SEARCH','ANALYST') OR
   coalesce(NEW.scope->>'next_action','')='' OR coalesce(NEW.scope->>'next_review_at','')='' OR
   coalesce(NEW.scope->>'deadline_at','')='' THEN RAISE EXCEPTION 'RESOLUTION_PLAN_REQUIRED'; END IF;
  IF NEW.status IN ('resolved','qa_pass') THEN
   proof:=maximus_agents.document_resolution_proof_v1(NEW.scope);
   IF proof IS NULL THEN RAISE EXCEPTION 'RESOLUTION_VERIFIED_PROOF_REQUIRED'; END IF;
   NEW.qa_result:=jsonb_build_object('verdict','PASS','server_verified_at',now(),'proof',proof,
    'financial_certified',false,'deploy_allowed',false);
   NEW.resolved_at:=now();
  ELSE
   NEW.resolved_at:=NULL;
  END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION maximus_agents.guard_document_resolution_v1() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER guard_document_resolution_v1 BEFORE INSERT OR UPDATE ON maximus_agents.issues
FOR EACH ROW EXECUTE FUNCTION maximus_agents.guard_document_resolution_v1();

CREATE OR REPLACE FUNCTION maximus_agents.reconcile_document_resolution_v1(p_limit integer DEFAULT 8)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,maximus_agents AS $$
DECLARE x record; n integer:=0; registered integer; orphaned integer; overdue integer;
 scheduled integer:=0; escalated integer; proof jsonb; summary jsonb;
BEGIN
 IF p_limit<0 OR p_limit>8 OR p_limit IS NULL THEN RAISE EXCEPTION 'RESOLUTION_ACTION_LIMIT'; END IF;
 IF NOT EXISTS(SELECT 1 FROM maximus_agents.settings WHERE singleton AND enabled)
  OR NOT EXISTS(SELECT 1 FROM maximus_agents.agents WHERE role='CONTROL' AND enabled) THEN
  RAISE EXCEPTION 'RESOLUTION_DISABLED';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:document-resolution-v1'));
 -- Registration is comprehensive; the action budget does not hide any defects.
 INSERT INTO maximus_agents.issues(issue_key,title,owner_role,priority,status,scope,acceptance,requires_release)
 SELECT 'REC203-'||md5(b.source_key),left('Résoudre '||b.source_kind||' : '||coalesce(b.scpi_slug,b.source_key),220),
 b.owner_role,CASE WHEN b.source_kind IN ('refusal','rejection') THEN 1 ELSE 5 END,'open',
 jsonb_build_object('execution_mode','document_resolution','source_key',b.source_key,
  'source_kind',b.source_kind,'scpi_slug',b.scpi_slug,'source_period',b.source_period,
  'source_state',b.source_state,'source_url',b.source_url,'source_hash',b.source_hash,
  'first_seen_at',now(),'deadline_at',now()+interval '48 hours','next_review_at',now(),
  'next_action',b.required_action,'action_attempts',0,'stage','REGISTERED',
  'supervisor','CONTROL','escalation_owner','Eric / independent source reviewer',
  'independent_qa_required',true,'financial_certified',false,'deploy_allowed',false),
 'Positive source-bound server verification; disappearance, timeout and exhaustion never mean resolved',false
 FROM maximus_agents.document_resolution_backlog_v1 b
 ON CONFLICT(issue_key) DO UPDATE SET
  status=CASE WHEN maximus_agents.issues.status IN ('resolved','qa_pass')
    AND (maximus_agents.document_resolution_proof_v1(maximus_agents.issues.scope) IS NULL
     OR maximus_agents.issues.scope->>'source_hash' IS DISTINCT FROM excluded.scope->>'source_hash')
    THEN 'open' ELSE maximus_agents.issues.status END,
  updated_at=now(),
  scope=maximus_agents.issues.scope||jsonb_build_object('source_state',excluded.scope->'source_state',
    'source_url',excluded.scope->'source_url','source_hash',excluded.scope->'source_hash','last_seen_at',now());
 GET DIAGNOSTICS registered=ROW_COUNT;
 -- Close only defects for which a dedicated positive verifier is available.
 FOR x IN WITH live_keys AS MATERIALIZED (SELECT source_key FROM maximus_agents.document_resolution_backlog_v1)
  SELECT id,scope FROM maximus_agents.issues
  WHERE scope->>'execution_mode'='document_resolution' AND status NOT IN ('resolved','qa_pass')
   AND scope->>'source_kind' IN ('ocr','replay','metric','fee','registry','task','refusal')
   AND (scope->>'source_kind'='refusal' OR NOT EXISTS(SELECT 1 FROM live_keys b WHERE b.source_key=scope->>'source_key'))
 LOOP
  proof:=maximus_agents.document_resolution_proof_v1(x.scope);
  IF proof IS NOT NULL THEN UPDATE maximus_agents.issues SET status='resolved',updated_at=now() WHERE id=x.id; END IF;
 END LOOP;
 -- Actual native worker scheduling, bounded per fund and per day. No model call,
 -- no bypass, no repeated download of a quarantined binary, no quota reset.
 FOR x IN
  SELECT r.scpi_slug FROM public.scpi_source_registry r
  WHERE r.automation_enabled=true AND r.ingestion_driver='generic'
   AND EXISTS(SELECT 1 FROM public.scpi_source_connectors c WHERE c.scpi_slug=r.scpi_slug AND c.enabled)
   AND EXISTS(SELECT 1 FROM maximus_agents.issues i WHERE i.scope->>'execution_mode'='document_resolution'
    AND i.scope->>'scpi_slug'=r.scpi_slug AND i.status NOT IN ('resolved','qa_pass')
    AND coalesce((i.scope->>'action_attempts')::int,0)<3
    AND (i.scope->>'next_review_at')::timestamptz<=now())
   AND NOT EXISTS(SELECT 1 FROM maximus_agents.issues i WHERE i.scope->>'execution_mode'='document_resolution'
    AND i.scope->>'scpi_slug'=r.scpi_slug AND (i.scope->>'last_scheduled_at')::timestamptz>now()-interval '24 hours')
  ORDER BY r.last_checked_at NULLS FIRST,r.scpi_slug LIMIT p_limit
 LOOP
  UPDATE public.scpi_source_registry SET next_check_at=least(coalesce(next_check_at,now()),now())
   WHERE scpi_slug=x.scpi_slug;
  GET DIAGNOSTICS n=ROW_COUNT; scheduled:=scheduled+n;
  UPDATE maximus_agents.issues SET status='in_progress',updated_at=now(),scope=scope||
   jsonb_build_object('stage','OFFICIAL_DISCOVERY_SCHEDULED','last_scheduled_at',now(),
    'action_attempts',coalesce((scope->>'action_attempts')::int,0)+1,
    'attempt_history',coalesce(scope->'attempt_history','[]'::jsonb)||jsonb_build_array(jsonb_build_object(
      'scheduled_at',now(),'action','existing_official_source_worker','result','scheduled_not_verified')),
    'next_review_at',now()+interval '24 hours',
    'next_action','Read existing bulletin/discovery worker result; compare official alternate source and exact period')
  WHERE scope->>'execution_mode'='document_resolution' AND scope->>'scpi_slug'=x.scpi_slug
   AND status NOT IN ('resolved','qa_pass') AND coalesce((scope->>'action_attempts')::int,0)<3;
 END LOOP;
 -- Non-dispatchable cases remain visible and owned. Never turn exhaustion green.
 UPDATE maximus_agents.issues SET updated_at=now(),scope=scope||jsonb_build_object(
  'stage','ESCALATED_SOURCE_REVIEW','next_review_at',now()+interval '24 hours',
  'next_action','Independent source review: archived original, alternative official source, then issuer confirmation draft; keep publication blocked')
 WHERE scope->>'execution_mode'='document_resolution' AND status NOT IN ('resolved','qa_pass')
  AND (scope->>'next_review_at')::timestamptz<=now()
  AND (coalesce((scope->>'action_attempts')::int,0)>=3 OR (scope->>'deadline_at')::timestamptz<=now()
   OR NOT EXISTS(SELECT 1 FROM public.scpi_source_registry r JOIN public.scpi_source_connectors c USING(scpi_slug)
    WHERE r.scpi_slug=scope->>'scpi_slug' AND r.automation_enabled AND c.enabled AND r.ingestion_driver='generic'));
 SELECT count(*) INTO orphaned FROM maximus_agents.document_resolution_backlog_v1 b
 WHERE NOT EXISTS(SELECT 1 FROM maximus_agents.issues i WHERE i.issue_key='REC203-'||md5(b.source_key)
  AND (i.status NOT IN ('resolved','qa_pass') OR maximus_agents.document_resolution_proof_v1(i.scope) IS NOT NULL)
  AND i.owner_role IS NOT NULL
  AND coalesce(i.scope->>'next_action','')<>'' AND i.scope->>'next_review_at' IS NOT NULL);
 IF orphaned<>0 THEN RAISE EXCEPTION 'RESOLUTION_ORPHANED_DEFECTS: %',orphaned; END IF;
 SELECT count(*) INTO overdue FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution'
  AND status NOT IN ('resolved','qa_pass') AND (scope->>'deadline_at')::timestamptz<now();
 SELECT count(*) INTO escalated FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution'
  AND status NOT IN ('resolved','qa_pass') AND scope->>'stage'='ESCALATED_SOURCE_REVIEW';
 summary:=jsonb_build_object('version','recovery203-resolution-v1','observed_at',now(),
  'inventoried',registered,'orphaned',orphaned,'official_discovery_scheduled',scheduled,'overdue',overdue,'escalated',escalated,
  'unresolved',(SELECT count(*) FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution' AND status NOT IN ('resolved','qa_pass')),
  'model_calls',0,'financial_certified',false,'deploy_allowed',false);
 IF overdue>0 OR escalated>0 THEN
  INSERT INTO maximus_agents.watchdog_incidents(incident_code,evidence)
  VALUES('DOCUMENT_RESOLUTION_REQUIRES_REVIEW',summary) ON CONFLICT(incident_code) DO UPDATE
  SET active=true,last_seen=now(),occurrences=maximus_agents.watchdog_incidents.occurrences+1,
   evidence=excluded.evidence,resolved_at=NULL;
 ELSE
  UPDATE maximus_agents.watchdog_incidents SET active=false,resolved_at=now(),last_seen=now(),evidence=summary
  WHERE incident_code='DOCUMENT_RESOLUTION_REQUIRES_REVIEW' AND active;
 END IF;
 UPDATE maximus_agents.agents SET last_summary=coalesce(last_summary,'{}')||jsonb_build_object('document_resolution',summary)
 WHERE role='CONTROL' AND enabled;
 RETURN summary;
END $$;
REVOKE ALL ON FUNCTION maximus_agents.reconcile_document_resolution_v1(integer) FROM PUBLIC,anon,authenticated,service_role;
-- Extend the existing 30-minute watchdog, without another scheduler.
CREATE OR REPLACE FUNCTION maximus_agents.watchdog_tick()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents', 'public'
AS $function$
declare
 v_enabled boolean;
 v_last timestamptz;
 v_pending integer;
 v_runnable integer;
 v_blocked integer;
 v_pass integer;
 v_fail integer;
 v_state text;
 v_incident boolean;
 v_total integer;
 v_candidates integer;
 v_expired integer;
 v_details jsonb;
begin
 perform pg_advisory_xact_lock(hashtext('maximus_agents:watchdog'));
 -- Automatically quarantine expired write leases; read-only audits can be retried.
 perform maximus_agents.reconcile_expired_tasks();
 select enabled into v_enabled from maximus_agents.settings where singleton=true;
 if v_enabled is null then raise exception 'maximus_agents.settings absent'; end if;
 if v_enabled then perform maximus_agents.reconcile_document_resolution_v1(8); end if;
 select max(heartbeat_at) into v_last from maximus_agents.agents
 where role in ('DATA','ANALYST','SEARCH','QA') and enabled=true;
 select count(*) into v_pending from maximus_agents.tasks
 where status in ('pending','running');
 -- Runnable distinct from quota-exhausted/blocked/dependent work.
 select count(*) into v_runnable
 from maximus_agents.agent_operational_status a
 where a.operational_state='READY_OR_WAITING' AND a.pending_today>0;
 select count(*) into v_blocked from maximus_agents.issues
 where status='blocked';
 -- Count only published historical cohort, not provisional candidates.
 select count(*) filter (where c.crash_test_status='PASS_100'),
        count(*) filter (where c.crash_test_status is distinct from 'PASS_100'),
        count(*)
 into v_pass,v_fail,v_total
 from maximus_agents.scpi_universe u
 left join public.scpi_crash_test_strict_v2 c on c.scpi_slug=u.scpi_slug
 where u.lifecycle='existing';
 if v_total<61 then raise exception 'Historical SCPI cohort unexpectedly shrank: %',v_total; end if;
 select count(*) into v_candidates from maximus_agents.scpi_universe where lifecycle='candidate';
 select count(*) into v_expired from maximus_agents.tasks
 where status='running' and lease_until<now();
 v_state := case
   when not v_enabled then 'DISABLED'
   when v_expired>0 then 'STALE'
   when v_pending=0 then 'IDLE'
   when v_runnable=0 then 'IDLE'
   when v_last is null or v_last<now()-interval '2 hours' then 'STALE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,'runnable_roles',v_runnable,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
    'baseline_count',v_total,'candidate_count',v_candidates,'expired_tasks',v_expired,
    'runner_state',v_state,'policy_wait',v_pending>0 AND v_runnable=0,
    'note','Observation only: pg_cron does not execute AI workers, deploy or alter financial data'
 );
 insert into maximus_agents.watchdog_observations
   (control_enabled,last_worker_heartbeat,pending_tasks,blocked_issues,strict_pass,strict_fail,runner_state,details)
 values(v_enabled,v_last,v_pending,v_blocked,v_pass,v_fail,v_state,v_details);
 v_incident := v_enabled and v_state='STALE' and v_runnable>0;
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
 -- keep 90 days of monitoring; issues remain until resolved
 delete from maximus_agents.watchdog_observations
 where observed_at < now()-interval '90 days';
 return v_details;
end
$function$
;
-- Resolution issues are handled by native workers, never unsupported AI batches.
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
      and coalesce(i.scope->>'execution_mode','') NOT IN ('scoped_code_correction','document_resolution')
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
;

-- Fail the entire migration on any integration invariant violation. The successful
-- rehearsal also rolls back its own DML, leaving activation to existing CONTROL.
DO $preflight$
BEGIN
 DECLARE a jsonb; b jsonb; n bigint; before_finance text; after_finance text; victim uuid; first_deadline text;
BEGIN
 SELECT md5(string_agg(md5(to_jsonb(i)::text),'' ORDER BY i.scpi_slug)) INTO before_finance FROM public.scpi_indicators i;
 a:=maximus_agents.reconcile_document_resolution_v1(8);
 SELECT count(*) INTO n FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution';
 b:=maximus_agents.reconcile_document_resolution_v1(8);
 IF (SELECT count(*) FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution')<>n
  THEN RAISE EXCEPTION 'DEDUPE_FAILED'; END IF;
 IF a->>'orphaned'<>'0' OR b->>'orphaned'<>'0' OR (b->>'official_discovery_scheduled')::int>8
  THEN RAISE EXCEPTION 'COVERAGE_OR_DAILY_BUDGET_FAILED'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution'
  AND (scope->>'action_attempts')::int>3) THEN RAISE EXCEPTION 'ATTEMPT_BUDGET_EXCEEDED'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.issues WHERE scope->>'execution_mode'='document_resolution'
  AND (owner_role IS NULL OR coalesce(scope->>'next_action','')='' OR scope->>'deadline_at' IS NULL))
  THEN RAISE EXCEPTION 'PLAN_MISSING'; END IF;
 SELECT id,scope->>'deadline_at' INTO victim,first_deadline FROM maximus_agents.issues
 WHERE scope->>'execution_mode'='document_resolution' AND scope->>'source_kind'='ocr'
  AND scope->>'source_state' LIKE 'quarantined%' LIMIT 1;
 IF victim IS NULL THEN RAISE EXCEPTION 'EXPECTED_REAL_QUARANTINE_FIXTURE'; END IF;
 BEGIN
  UPDATE maximus_agents.issues SET status='resolved',qa_result='{"verdict":"PASS"}' WHERE id=victim;
  RAISE EXCEPTION 'FALSE_CLOSURE_ALLOWED';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'RESOLUTION_VERIFIED_PROOF_REQUIRED' THEN RAISE; END IF;
 END;
 BEGIN
  UPDATE maximus_agents.issues SET scope=scope||jsonb_build_object('deadline_at',now()+interval '10 days') WHERE id=victim;
  RAISE EXCEPTION 'DEADLINE_RESET_ALLOWED';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'RESOLUTION_IDENTITY_AND_DEADLINE_IMMUTABLE' THEN RAISE; END IF;
 END;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_ocr_jobs WHERE status='done' AND pdf_sha256 IS NULL)
  THEN RAISE EXCEPTION 'INVALID_OCR_DONE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM maximus_agents.scpi_ocr_jobs WHERE status LIKE 'quarantined%')
  THEN RAISE EXCEPTION 'QUARANTINE_ERASED'; END IF;
 IF has_function_privilege('anon','maximus_agents.reconcile_document_resolution_v1(integer)','execute')
  OR has_function_privilege('authenticated','maximus_agents.reconcile_document_resolution_v1(integer)','execute')
  OR has_table_privilege('anon','maximus_agents.document_resolution_backlog_v1','select')
  THEN RAISE EXCEPTION 'PUBLIC_PRIVILEGE_LEAK'; END IF;
 SELECT md5(string_agg(md5(to_jsonb(i)::text),'' ORDER BY i.scpi_slug)) INTO after_finance FROM public.scpi_indicators i;
 IF before_finance IS DISTINCT FROM after_finance THEN RAISE EXCEPTION 'FINANCIAL_DATA_CHANGED'; END IF;
 RAISE NOTICE 'PASS: coverage, idempotence, daily budget, false closure, immutable deadline, quarantine, privileges, financial non-mutation';

  RAISE EXCEPTION USING ERRCODE='Z0203',MESSAGE='resolution preflight passed; rollback rehearsal';
 EXCEPTION WHEN SQLSTATE 'Z0203' THEN NULL;
 END;
END $preflight$;
