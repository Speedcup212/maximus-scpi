-- RECOVERY-126: evidence-first admission and truthful operational supervision.
-- P0: no candidate20 FINANCIAL QA quota for a fund without any verified PDF.
-- P1/P2: private provenance integrity checks; never infer financial approval.
-- P3/P4: publication and 200+ expansion remain fail closed pending live QA.
-- Existing roles, queue, caps, RLS, release gates and history unchanged.
-- Safe to re-run: CREATE OR REPLACE only; no historic task or financial mutation.
CREATE OR REPLACE FUNCTION maximus_agents.prepare_candidate_batch20()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents'
AS $fn$
DECLARE
  d date := (now() at time zone 'Europe/Paris')::date;
  candidate record;
  snapshot jsonb;
  role_name text;
  deps uuid[];
  focus text;
  prepared integer := 0;
  slugs jsonb;
  limit_candidates constant integer := 20;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:candidate20:prepare'));
  IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false)
    THEN RETURN jsonb_build_object('prepared',false,'reason','agents_disabled',
      'deploy_allowed',false);
  END IF;
  PERFORM maximus_agents.reconcile_expired_tasks();

  -- Idempotence: the first batch selected for this Paris-local date is fixed.
  -- Repeated runs never enroll another 20 candidates, nor reset any lease/quota.
  IF NOT EXISTS (
    SELECT 1 FROM maximus_agents.tasks t
    WHERE t.cycle_date=d AND t.payload->>'batch_mode'='candidate20'
  ) THEN
    FOR candidate IN
      SELECT u.scpi_slug
      FROM maximus_agents.scpi_universe u
      LEFT JOIN maximus_agents.scpi_candidate_work_queue w
        ON w.scpi_slug=u.scpi_slug
      WHERE u.lifecycle='candidate'
        -- P0: a financial review slot requires a verified primary binary.
        -- Discovery-only candidates remain in scpi_universe and source-gap queue,
        -- not the scarce 20/role/day QA review budget.
        AND EXISTS (
          SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug=u.scpi_slug AND p.document_identity_verified=true
            AND p.pdf_sha256 ~ '^[0-9a-f]{64} of the same candidate may be retried on another day, but
        -- never if its independent QA completed, and never over 3 cycles.
        AND NOT EXISTS (
          SELECT 1 FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.kind='audit' AND t.status='done'
            AND t.result->>'binary_proof_status'='live_binary_proof'
            AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug
        )
        AND (
          SELECT count(*) FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.kind='audit'
            AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug
        ) < 3
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug AND t.status<>'done'
        ) THEN 0 ELSE 1 END,
        CASE WHEN EXISTS (
          SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug=u.scpi_slug
            AND p.document_identity_verified=true
        ) THEN 0 ELSE 1 END,
        CASE WHEN w.stage='primary_source_found' THEN 0 ELSE 1 END,
        coalesce(w.priority_bucket,999),u.scpi_slug
      LIMIT limit_candidates
    LOOP
      snapshot:=maximus_agents.candidate_documentary_snapshot(candidate.scpi_slug);
      FOREACH role_name IN ARRAY ARRAY['DATA','SEARCH','ANALYST'] LOOP
        focus:=CASE role_name
          WHEN 'DATA' THEN 'Examine only the SCPI-specific recorded numerical metrics, periods, unit and actual PDF page references; mark unverified data as gap, not certified.'
          WHEN 'SEARCH' THEN 'Assess this SCPI source coverage and find missing official-document classes in supplied references. Never claim external research you did not perform.'
          ELSE 'Audit this SCPI metric comparability and potential finance inconsistencies. No auto-financial PASS or publication.'
        END;
        INSERT INTO maximus_agents.tasks
          (dedupe_key,cycle_date,role,title,priority,kind,payload)
        VALUES
          (d::text||':candidate20:'||candidate.scpi_slug||':'||role_name,
            d,role_name,
            'RECOVERY-122 candidate20 '||candidate.scpi_slug||' '||role_name,
            5,'audit',
            jsonb_build_object('mode','candidate_documentary_audit',
              'batch_mode','candidate20','scpi_slug',candidate.scpi_slug,
              'candidate_evidence',snapshot,'focus',focus,
              'no_financial_mutation',true,'deploy_allowed',false,
              'independent_qa_required',true))
        ON CONFLICT(dedupe_key) DO NOTHING;
      END LOOP;
      SELECT array_agg(t.id ORDER BY t.role) INTO deps
      FROM maximus_agents.tasks t
      WHERE t.cycle_date=d AND t.kind='audit'
        AND t.dedupe_key IN (
          d::text||':candidate20:'||candidate.scpi_slug||':DATA',
          d::text||':candidate20:'||candidate.scpi_slug||':SEARCH',
          d::text||':candidate20:'||candidate.scpi_slug||':ANALYST');
      IF cardinality(deps)<>3 THEN
        RAISE EXCEPTION 'Three independent SCPI-specific upstream tasks required';
      END IF;
      INSERT INTO maximus_agents.tasks
        (dedupe_key,cycle_date,role,title,priority,kind,depends_on,payload)
      VALUES
        (d::text||':candidate20:'||candidate.scpi_slug||':QA',
          d,'QA',
          'RECOVERY-122 candidate20 independent QA '||candidate.scpi_slug,
          6,'audit',deps,
          jsonb_build_object('mode','candidate_documentary_audit',
            'batch_mode','candidate20','scpi_slug',candidate.scpi_slug,
            'candidate_evidence',snapshot,
            'focus','Independently verify this SCPI all three upstream audit evidence and freshly downloaded source PDF provenance; never certify numbers or publish.',
            'no_financial_mutation',true,'deploy_allowed',false))
      ON CONFLICT(dedupe_key) DO NOTHING;
      prepared:=prepared+1;
    END LOOP;
  END IF;

  SELECT coalesce(jsonb_agg(x.scpi_slug ORDER BY x.scpi_slug),'[]'::jsonb)
    INTO slugs
  FROM (
    SELECT DISTINCT t.payload->>'scpi_slug' AS scpi_slug
    FROM maximus_agents.tasks t
    WHERE t.cycle_date=d AND t.role='QA' AND t.kind='audit'
      AND t.payload->>'batch_mode'='candidate20'
  ) x;
  RETURN jsonb_build_object('prepared',jsonb_array_length(slugs)>0,
    'cycle_date',d,'slugs',slugs,'candidate_count',jsonb_array_length(slugs),
    'new_candidate_count',prepared,'max_candidates_per_day',20,
    'deploy_allowed',false,'actual_inference_executed',false);
END
$fn$; AND p.page_count>0
        )
        -- The audit of the same candidate may be retried on another day, but
        -- never if its independent QA completed, and never over 3 cycles.
        AND NOT EXISTS (
          SELECT 1 FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.kind='audit' AND t.status='done'
            AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug
        )
        AND (
          SELECT count(*) FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.kind='audit'
            AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug
        ) < 3
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM maximus_agents.tasks t
          WHERE t.role='QA' AND t.payload->>'mode'='candidate_documentary_audit'
            AND t.payload->>'scpi_slug'=u.scpi_slug AND t.status<>'done'
        ) THEN 0 ELSE 1 END,
        CASE WHEN EXISTS (
          SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug=u.scpi_slug
            AND p.document_identity_verified=true
        ) THEN 0 ELSE 1 END,
        CASE WHEN w.stage='primary_source_found' THEN 0 ELSE 1 END,
        coalesce(w.priority_bucket,999),u.scpi_slug
      LIMIT limit_candidates
    LOOP
      snapshot:=maximus_agents.candidate_documentary_snapshot(candidate.scpi_slug);
      FOREACH role_name IN ARRAY ARRAY['DATA','SEARCH','ANALYST'] LOOP
        focus:=CASE role_name
          WHEN 'DATA' THEN 'Examine only the SCPI-specific recorded numerical metrics, periods, unit and actual PDF page references; mark unverified data as gap, not certified.'
          WHEN 'SEARCH' THEN 'Assess this SCPI source coverage and find missing official-document classes in supplied references. Never claim external research you did not perform.'
          ELSE 'Audit this SCPI metric comparability and potential finance inconsistencies. No auto-financial PASS or publication.'
        END;
        INSERT INTO maximus_agents.tasks
          (dedupe_key,cycle_date,role,title,priority,kind,payload)
        VALUES
          (d::text||':candidate20:'||candidate.scpi_slug||':'||role_name,
            d,role_name,
            'RECOVERY-122 candidate20 '||candidate.scpi_slug||' '||role_name,
            5,'audit',
            jsonb_build_object('mode','candidate_documentary_audit',
              'batch_mode','candidate20','scpi_slug',candidate.scpi_slug,
              'candidate_evidence',snapshot,'focus',focus,
              'no_financial_mutation',true,'deploy_allowed',false,
              'independent_qa_required',true))
        ON CONFLICT(dedupe_key) DO NOTHING;
      END LOOP;
      SELECT array_agg(t.id ORDER BY t.role) INTO deps
      FROM maximus_agents.tasks t
      WHERE t.cycle_date=d AND t.kind='audit'
        AND t.dedupe_key IN (
          d::text||':candidate20:'||candidate.scpi_slug||':DATA',
          d::text||':candidate20:'||candidate.scpi_slug||':SEARCH',
          d::text||':candidate20:'||candidate.scpi_slug||':ANALYST');
      IF cardinality(deps)<>3 THEN
        RAISE EXCEPTION 'Three independent SCPI-specific upstream tasks required';
      END IF;
      INSERT INTO maximus_agents.tasks
        (dedupe_key,cycle_date,role,title,priority,kind,depends_on,payload)
      VALUES
        (d::text||':candidate20:'||candidate.scpi_slug||':QA',
          d,'QA',
          'RECOVERY-122 candidate20 independent QA '||candidate.scpi_slug,
          6,'audit',deps,
          jsonb_build_object('mode','candidate_documentary_audit',
            'batch_mode','candidate20','scpi_slug',candidate.scpi_slug,
            'candidate_evidence',snapshot,
            'focus','Independently verify this SCPI all three upstream audit evidence and freshly downloaded source PDF provenance; never certify numbers or publish.',
            'no_financial_mutation',true,'deploy_allowed',false))
      ON CONFLICT(dedupe_key) DO NOTHING;
      prepared:=prepared+1;
    END LOOP;
  END IF;

  SELECT coalesce(jsonb_agg(x.scpi_slug ORDER BY x.scpi_slug),'[]'::jsonb)
    INTO slugs
  FROM (
    SELECT DISTINCT t.payload->>'scpi_slug' AS scpi_slug
    FROM maximus_agents.tasks t
    WHERE t.cycle_date=d AND t.role='QA' AND t.kind='audit'
      AND t.payload->>'batch_mode'='candidate20'
  ) x;
  RETURN jsonb_build_object('prepared',jsonb_array_length(slugs)>0,
    'cycle_date',d,'slugs',slugs,'candidate_count',jsonb_array_length(slugs),
    'new_candidate_count',prepared,'max_candidates_per_day',20,
    'deploy_allowed',false,'actual_inference_executed',false);
END
$fn$;

CREATE OR REPLACE VIEW maximus_agents.candidate_source_coverage
WITH (security_invoker = true) AS
SELECT u.scpi_slug,u.name,u.management_company,u.origin_url,
       u.stage,
       count(p.*) FILTER (WHERE p.document_identity_verified
         AND p.pdf_sha256 ~ '^[0-9a-f]{64}$' AND p.page_count>0) AS verified_pdf_count,
       count(d.*) FILTER (WHERE d.status='publisher_index_visible') AS indexed_only_count,
       count(d.*) FILTER (WHERE d.status='rejected') AS rejected_count,
       CASE WHEN count(p.*) FILTER (WHERE p.document_identity_verified
         AND p.pdf_sha256 ~ '^[0-9a-f]{64}$' AND p.page_count>0)>0
         THEN 'EVIDENCE_READY_FOR_READONLY_QA'
         ELSE 'SOURCE_DISCOVERY_REQUIRED' END AS next_documentary_stage,
       false AS financial_certified, false AS deploy_allowed
FROM maximus_agents.scpi_universe u
LEFT JOIN maximus_agents.scpi_candidate_pdf_validation p ON p.scpi_slug=u.scpi_slug
LEFT JOIN maximus_agents.scpi_candidate_document_index d ON d.scpi_slug=u.scpi_slug
WHERE u.lifecycle='candidate'
GROUP BY u.scpi_slug,u.name,u.management_company,u.origin_url,u.stage;
REVOKE ALL ON maximus_agents.candidate_source_coverage FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE VIEW maximus_agents.candidate_source_gap_by_manager
WITH (security_invoker = true) AS
SELECT management_company,
 count(*) AS candidate_count,
 count(*) FILTER (WHERE next_documentary_stage='SOURCE_DISCOVERY_REQUIRED') AS discovery_required,
 count(*) FILTER (WHERE next_documentary_stage='EVIDENCE_READY_FOR_READONLY_QA') AS qa_eligible,
 count(*) FILTER (WHERE origin_url IS NOT NULL) AS candidates_with_official_origin
FROM maximus_agents.candidate_source_coverage
GROUP BY management_company;
REVOKE ALL ON maximus_agents.candidate_source_gap_by_manager FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE VIEW maximus_agents.candidate_metric_provenance_integrity
WITH (security_invoker = true) AS
SELECT m.scpi_slug,m.metric,m.source_period,m.document_kind,m.source_url,m.source_page,
 m.numeric_value,m.qa_status,
 (p.pdf_sha256 ~ '^[0-9a-f]{64}$'
  AND p.document_identity_verified=true
  AND p.page_count>=m.source_page
  AND m.source_page>0
  AND m.numeric_value IS NOT NULL
  AND m.independently_reviewed_at IS NOT NULL
  AND nullif(trim(m.independently_reviewed_by),'') IS NOT NULL
  AND m.qa_status='qa_pass'
 ) AS provenance_record_complete,
 false AS live_binary_reverified_in_this_view,
 false AS financial_certification_proven,
 false AS deploy_allowed
FROM maximus_agents.scpi_candidate_metric_evidence m
LEFT JOIN maximus_agents.scpi_candidate_pdf_validation p
 ON p.scpi_slug=m.scpi_slug
 AND p.source_period=m.source_period
 AND p.document_kind=m.document_kind
 AND p.source_url=m.source_url;
REVOKE ALL ON maximus_agents.candidate_metric_provenance_integrity FROM PUBLIC,anon,authenticated;

-- Alert only on genuinely runnable work; an exhausted budget or missing QA dependency
-- must not repeatedly create AI_WORKERS_STALLED during intentional daily idle time.
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
 select max(heartbeat_at) into v_last from maximus_agents.agents
 where role in ('DATA','ANALYST','SEARCH','QA') and enabled=true;
 select count(*) into v_pending from maximus_agents.tasks
 where status in ('pending','running');
 -- The idle/quota-limited/QA-dependent backlog is not a stalled worker.
 -- Operational view excludes disabled roles and tracks exhausted quotas.
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
   when v_runnable=0 then 'WAITING_POLICY'
   when v_last is null or v_last<now()-interval '2 hours' then 'STALE'
   else 'RUNNING'
 end;
 v_details := jsonb_build_object(
    'worker_heartbeat',v_last,'pending_tasks',v_pending,'runnable_roles',v_runnable,
    'blocked_issues',v_blocked,'strict_pass',v_pass,'strict_fail',v_fail,
    'baseline_count',v_total,'candidate_count',v_candidates,'expired_tasks',v_expired,
    'runner_state',v_state,
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
$function$;
REVOKE ALL ON FUNCTION maximus_agents.watchdog_tick() FROM PUBLIC,anon,authenticated;
