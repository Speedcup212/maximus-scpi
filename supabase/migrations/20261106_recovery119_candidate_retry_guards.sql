-- RECOVERY-119: protect candidate pilot from losing an unfinished fund.
-- Reuses the same maximus_agents queue and quota, never replays executions.
CREATE OR REPLACE FUNCTION maximus_agents.prepare_candidate_evidence_pilot()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents'
AS $fn$
DECLARE
  d date := (now() at time zone 'Europe/Paris')::date;
  slug text;
  snapshot jsonb;
  role_name text;
  deps uuid[];
  mode_key text;
  focus text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:candidate-evidence-prepare'));
  IF NOT coalesce((SELECT enabled FROM maximus_agents.settings WHERE singleton),false)
    THEN RETURN jsonb_build_object('prepared',false,'reason','agents_disabled');
  END IF;
  PERFORM maximus_agents.reconcile_expired_tasks();

  -- Preserve audit history but prevent prior-day incomplete candidates from
  -- staying pending forever. Never alter running or completed worker tasks.
  UPDATE maximus_agents.tasks
    SET status='blocked',completed_at=now(),updated_at=now(),
      result=jsonb_build_object(
        'summary','Prior candidate cycle did not finish; safe replay needs new leased tasks',
        'verdict','REVIEW','deploy_allowed',false,
        'evidence',jsonb_build_array(jsonb_build_object(
          'source','maximus_agents.tasks.cycle_date','observed_at',now(),
          'finding',jsonb_build_object('expired_cycle',cycle_date,'recovery',true))))
    WHERE kind='audit' AND status='pending' AND cycle_date<d
      AND payload->>'mode'='candidate_documentary_audit';

  -- Idempotent daily pilot; do not lose the identity of today's selected fund.
  SELECT payload->>'scpi_slug' INTO slug FROM maximus_agents.tasks
   WHERE dedupe_key=d::text||':candidate-evidence:DATA' LIMIT 1;

  IF slug IS NULL THEN
    SELECT u.scpi_slug INTO slug
    FROM maximus_agents.scpi_universe u
    LEFT JOIN maximus_agents.scpi_candidate_work_queue w ON w.scpi_slug=u.scpi_slug
    WHERE u.lifecycle='candidate'
      -- REVIEW is a control outcome, but a completed QA cycle means this
      -- candidate was examined and can await the next downstream stage.
      AND NOT EXISTS (
        SELECT 1 FROM maximus_agents.tasks t
        WHERE t.role='QA' AND t.kind='audit' AND t.status='done'
          AND t.payload->>'mode'='candidate_documentary_audit'
          AND t.payload->>'scpi_slug'=u.scpi_slug
      )
      -- Bounded retries: at most 3 calendar-day attempts per candidate.
      -- There is no same-day claim reset, quota bypass or automatic PASS.
      AND (SELECT count(*) FROM maximus_agents.tasks t
        WHERE t.role='QA' AND t.kind='audit'
          AND t.payload->>'mode'='candidate_documentary_audit'
          AND t.payload->>'scpi_slug'=u.scpi_slug) < 3
    ORDER BY
      CASE WHEN EXISTS (
        SELECT 1 FROM maximus_agents.tasks t
        WHERE t.role='QA' AND t.kind='audit'
          AND t.payload->>'mode'='candidate_documentary_audit'
          AND t.payload->>'scpi_slug'=u.scpi_slug
          AND t.status<>'done'
      ) THEN 0 ELSE 1 END,
      CASE WHEN u.scpi_slug='opus-real' THEN 0 ELSE 1 END,
      CASE WHEN EXISTS (
        SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation p
        WHERE p.scpi_slug=u.scpi_slug AND p.document_identity_verified
      ) THEN 0 ELSE 1 END,
      coalesce(w.priority_bucket,999),u.scpi_slug
    LIMIT 1;
  END IF;
  IF slug IS NULL
    THEN RETURN jsonb_build_object('prepared',false,'reason','no_unevaluated_candidates');
  END IF;

  snapshot:=maximus_agents.candidate_documentary_snapshot(slug);
  FOREACH role_name IN ARRAY ARRAY['DATA','SEARCH','ANALYST'] LOOP
    focus:=CASE role_name
      WHEN 'DATA' THEN 'Cross-check recorded financial metric values, periods, units and page references against verified PDF identity. Never infer missing values.'
      WHEN 'SEARCH' THEN 'Audit official-document coverage and source gaps. Do not claim discovery or downloading without real evidence.'
      ELSE 'Analyze period consistency, data comparability, financial metrics and potential contradictions. Flag gaps without certification.'
    END;
    INSERT INTO maximus_agents.tasks
      (dedupe_key,cycle_date,role,title,priority,kind,payload)
    VALUES
      (d::text||':candidate-evidence:'||role_name,d,role_name,
       'RECOVERY-118 — candidate documentary '||role_name||' '||slug,
       5,'audit',
       jsonb_build_object(
         'mode','candidate_documentary_audit','scpi_slug',slug,
         'candidate_evidence',snapshot,'focus',focus,
         'no_financial_mutation',true,'deploy_allowed',false,
         'independent_qa_required',true))
    ON CONFLICT(dedupe_key) DO NOTHING;
  END LOOP;
  SELECT array_agg(id ORDER BY role) INTO deps
   FROM maximus_agents.tasks
   WHERE cycle_date=d AND kind='audit'
    AND dedupe_key IN (d::text||':candidate-evidence:DATA',
       d::text||':candidate-evidence:SEARCH',d::text||':candidate-evidence:ANALYST');
  IF cardinality(deps)<>3 THEN RAISE EXCEPTION 'Expected three independent candidate audits'; END IF;
  INSERT INTO maximus_agents.tasks
     (dedupe_key,cycle_date,role,title,priority,kind,depends_on,payload)
  VALUES
     (d::text||':candidate-evidence:QA',d,'QA',
      'RECOVERY-118 — independent candidate provenance review '||slug,
      6,'audit',deps,
      jsonb_build_object(
       'mode','candidate_documentary_audit','scpi_slug',slug,
       'candidate_evidence',snapshot,
       'focus','Review all three agent observations, source SHA and page references; never certify or publish.',
       'deploy_allowed',false,'independent_qa_required',true))
  ON CONFLICT(dedupe_key) DO NOTHING;
  RETURN jsonb_build_object('prepared',true,'scpi_slug',slug,
    'roles',jsonb_build_array('DATA','SEARCH','ANALYST','QA'),
    'verified_pdf_count',snapshot->'coverage'->'verified_pdf_count',
    'linked_metric_count',snapshot->'coverage'->'provenance_linked_metric_count',
    'deploy_allowed',false,'actual_inference_executed',false);
END
$fn$;


REVOKE ALL ON FUNCTION maximus_agents.prepare_candidate_evidence_pilot()
  FROM PUBLIC,anon,authenticated;
