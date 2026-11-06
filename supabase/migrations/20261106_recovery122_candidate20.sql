-- RECOVERY-122: 20 distinct SCPI candidates/day on EXISTING maximus_agents queue.
-- Candidate-only budget does not change 2/day code correction or generic audits.
-- Pure read-only/documentary QA, never an automatic financial certification.
ALTER TABLE maximus_agents.settings
  ADD COLUMN IF NOT EXISTS candidate_claims_per_role_day integer NOT NULL DEFAULT 20;
ALTER TABLE maximus_agents.settings
  DROP CONSTRAINT IF EXISTS settings_candidate_claims_range;
ALTER TABLE maximus_agents.settings
  ADD CONSTRAINT settings_candidate_claims_range
  CHECK (candidate_claims_per_role_day BETWEEN 1 AND 20);

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

CREATE OR REPLACE FUNCTION maximus_agents.claim_candidate_batch20_task(
  p_role text,p_slug text)
RETURNS SETOF maximus_agents.tasks
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents'
AS $fn$
DECLARE
  d date := (now() at time zone 'Europe/Paris')::date;
  cfg maximus_agents.settings;
  t maximus_agents.tasks;
  token uuid;
  claimed_today integer;
BEGIN
  IF p_role NOT IN ('DATA','SEARCH','ANALYST','QA')
     OR p_slug !~ '^[a-z0-9-]{2,100}$' THEN
    RAISE EXCEPTION 'Invalid read-only candidate role or slug';
  END IF;
  PERFORM pg_advisory_xact_lock(
    hashtext('maximus_agents:candidate20:claim:'||p_role));
  SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
  IF NOT FOUND OR NOT cfg.enabled OR NOT coalesce(
    (SELECT enabled FROM maximus_agents.agents WHERE role=p_role),false)
  THEN RETURN; END IF;

  SELECT count(*) INTO claimed_today
  FROM maximus_agents.runs r
  JOIN maximus_agents.tasks x ON x.id=r.task_id
  WHERE r.role=p_role
    AND (r.started_at AT TIME ZONE 'Europe/Paris')::date=d
    AND x.payload->>'batch_mode'='candidate20';
  IF claimed_today >= least(cfg.candidate_claims_per_role_day,20) THEN RETURN; END IF;

  SELECT * INTO t FROM maximus_agents.tasks x
  WHERE x.role=p_role AND x.kind='audit' AND x.status='pending'
    AND x.cycle_date=d AND x.attempts<2
    AND x.dedupe_key=d::text||':candidate20:'||p_slug||':'||p_role
    AND x.payload->>'mode'='candidate_documentary_audit'
    AND x.payload->>'batch_mode'='candidate20'
    AND x.payload->>'scpi_slug'=p_slug
    AND NOT EXISTS (
      SELECT 1 FROM unnest(x.depends_on) dep(id)
      LEFT JOIN maximus_agents.tasks parent ON parent.id=dep.id
      WHERE parent.id IS NULL OR parent.status<>'done'
    )
  FOR UPDATE SKIP LOCKED LIMIT 1;
  IF t.id IS NULL THEN RETURN; END IF;
  token:=gen_random_uuid();
  UPDATE maximus_agents.tasks
  SET status='running',attempts=attempts+1,
    lease_token=token,lease_until=now()+make_interval(mins=>cfg.lease_minutes),
    updated_at=now()
  WHERE id=t.id RETURNING * INTO t;
  INSERT INTO maximus_agents.runs(task_id,role,attempt,lease_token)
    VALUES(t.id,p_role,t.attempts,token);
  UPDATE maximus_agents.agents SET heartbeat_at=now() WHERE role=p_role;
  RETURN NEXT t;
END
$fn$;

-- Single-system accounting: no new tables, no AUTO_PASS, no website mutation.
REVOKE ALL ON FUNCTION maximus_agents.prepare_candidate_batch20()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.claim_candidate_batch20_task(text,text)
 FROM PUBLIC,anon,authenticated;
