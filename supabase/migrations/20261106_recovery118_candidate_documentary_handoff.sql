-- RECOVERY-118 — candidate source-to-agent handoff. Same maximus_agents queue.
-- Read-only evidence snapshots from existing index/PDF/metric tables.
-- No extractor replacement; no writes to financial publication or QA tables.

CREATE OR REPLACE FUNCTION maximus_agents.candidate_documentary_snapshot(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'pg_catalog','maximus_agents'
AS $fn$
DECLARE
  candidate record;
  docs jsonb;
  metrics jsonb;
  coverage jsonb;
BEGIN
  SELECT u.scpi_slug,u.name,u.management_company,u.stage,w.priority_bucket
    INTO candidate
  FROM maximus_agents.scpi_universe u
  LEFT JOIN maximus_agents.scpi_candidate_work_queue w ON w.scpi_slug=u.scpi_slug
  WHERE u.scpi_slug=p_slug AND u.lifecycle='candidate';
  IF NOT FOUND THEN RAISE EXCEPTION 'Not an unpublished candidate'; END IF;

  SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.source_period,x.document_kind),'[]'::jsonb)
  INTO docs FROM (
    SELECT d.source_period,d.document_kind,d.direct_document_url AS source_url,
           p.pdf_sha256,p.page_count,p.validated_at,
           p.document_identity_verified,
           d.status AS index_status
    FROM maximus_agents.scpi_candidate_document_index d
    JOIN maximus_agents.scpi_candidate_pdf_validation p
      ON p.scpi_slug=d.scpi_slug AND p.source_period=d.source_period
     AND p.document_kind=d.document_kind AND p.source_url=d.direct_document_url
    WHERE d.scpi_slug=p_slug AND d.source_primary=true
      AND d.status IN ('page_verified','direct_pdf_checked')
      AND p.document_identity_verified=true
      AND p.pdf_sha256 ~ '^[0-9a-fA-F]{64}$'
      AND p.page_count>0
    ORDER BY d.source_period DESC,d.document_kind
    LIMIT 8
  ) x;

  SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.source_period,x.metric),'[]'::jsonb)
  INTO metrics FROM (
    SELECT e.source_period,e.document_kind,e.metric,
      e.numeric_value::text AS numeric_value,e.unit,
      e.value_basis,e.source_page,
      left(coalesce(e.evidence_text,''),220) AS evidence_excerpt,
      e.qa_status AS existing_qa_status,
      e.source_url,p.pdf_sha256
    FROM maximus_agents.scpi_candidate_metric_evidence e
    JOIN maximus_agents.scpi_candidate_pdf_validation p
      ON p.scpi_slug=e.scpi_slug AND p.source_period=e.source_period
      AND p.document_kind=e.document_kind AND p.source_url=e.source_url
    JOIN maximus_agents.scpi_candidate_document_index d
      ON d.scpi_slug=e.scpi_slug AND d.source_period=e.source_period
      AND d.document_kind=e.document_kind AND d.direct_document_url=e.source_url
    WHERE e.scpi_slug=p_slug AND d.source_primary=true
      AND d.status IN ('page_verified','direct_pdf_checked')
      AND p.document_identity_verified=true
      AND p.pdf_sha256 ~ '^[0-9a-fA-F]{64}$'
      AND e.source_page BETWEEN 1 AND p.page_count
      AND e.numeric_value IS NOT NULL
    ORDER BY e.source_period DESC,e.metric
    LIMIT 50
  ) x;

  SELECT jsonb_build_object(
    'candidate_count',(SELECT count(*) FROM maximus_agents.scpi_universe
       WHERE lifecycle='candidate'),
    'identity_only_count',(SELECT count(*) FROM maximus_agents.scpi_candidate_work_queue
       WHERE stage='identity_only'),
    'primary_source_found_count',(SELECT count(*) FROM maximus_agents.scpi_candidate_work_queue
       WHERE stage='primary_source_found'),
    'candidate_index_rows',(SELECT count(*) FROM maximus_agents.scpi_candidate_document_index
       WHERE scpi_slug=p_slug),
    'verified_pdf_count',jsonb_array_length(docs),
    'provenance_linked_metric_count',jsonb_array_length(metrics),
    'existing_unverified_metric_rows',(SELECT count(*)
       FROM maximus_agents.scpi_candidate_metric_evidence e
       WHERE e.scpi_slug=p_slug)-jsonb_array_length(metrics)
  ) INTO coverage;

  RETURN jsonb_build_object(
    'scpi_slug',candidate.scpi_slug,'scpi_name',candidate.name,
    'management_company',candidate.management_company,
    'candidate_stage',candidate.stage,
    'source','maximus_agents.scpi_candidate_document_index+pdf_validation+metric_evidence',
    'captured_at',now(),'documents',docs,'metrics',metrics,'coverage',coverage,
    'no_new_pdf_read',true,'no_new_financial_qa',true,
    'release_authorized',false);
END
$fn$;

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

  -- Idempotent daily pilot; do not lose the identity of today's selected fund.
  SELECT payload->>'scpi_slug' INTO slug FROM maximus_agents.tasks
   WHERE dedupe_key=d::text||':candidate-evidence:DATA' LIMIT 1;

  IF slug IS NULL THEN
    SELECT u.scpi_slug INTO slug
    FROM maximus_agents.scpi_universe u
    LEFT JOIN maximus_agents.scpi_candidate_work_queue w ON w.scpi_slug=u.scpi_slug
    WHERE u.lifecycle='candidate'
      AND NOT EXISTS (
        SELECT 1 FROM maximus_agents.tasks t
        WHERE t.role='DATA' AND t.kind='audit'
         AND t.payload->>'mode'='candidate_documentary_audit'
         AND t.payload->>'scpi_slug'=u.scpi_slug
      )
    ORDER BY
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

CREATE OR REPLACE FUNCTION maximus_agents.claim_parallel_audit_task(p_role text)
RETURNS SETOF maximus_agents.tasks
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','maximus_agents'
AS $fn$
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
    AND (x.dedupe_key=d::text||':candidate-evidence:'||p_role
        OR x.dedupe_key=d::text||':parallel-audit:'||p_role)
    AND x.payload->>'mode' IN ('candidate_documentary_audit','parallel_readonly_audit')
    AND NOT EXISTS (
      SELECT 1 FROM unnest(x.depends_on) dep(id)
      LEFT JOIN maximus_agents.tasks parent ON parent.id=dep.id
      WHERE parent.id IS NULL OR parent.status<>'done'
    )
  ORDER BY CASE WHEN x.payload->>'mode'='candidate_documentary_audit' THEN 0 ELSE 1 END
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
$fn$;

REVOKE ALL ON FUNCTION maximus_agents.candidate_documentary_snapshot(text)
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.prepare_candidate_evidence_pilot()
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION maximus_agents.claim_parallel_audit_task(text)
  FROM PUBLIC,anon,authenticated;
