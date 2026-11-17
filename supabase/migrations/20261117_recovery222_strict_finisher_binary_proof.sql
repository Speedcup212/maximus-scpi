-- RECOVERY-222: FINISHER SOURCE PROOF. A task finishes only after an actual
-- live issuer-PDF download verified by MuPDF and Poppler. Never finance-certify.
-- Existing queue / OIDC bridge / QA financial gates remain unchanged.
CREATE OR REPLACE FUNCTION maximus_agents.complete_existing_strict_binary_proof_v1(
  p_id uuid, p_token uuid, p_proof jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $fn$
DECLARE
  t maximus_agents.tasks;
  r public.scpi_source_registry%rowtype;
  d maximus_agents.scpi_bulletin_replay_documents%rowtype;
  c public.scpi_source_connectors%rowtype;
  doc jsonb; valid boolean:=false; next_action text; outcome text;
  finding jsonb; body jsonb;
BEGIN
  SELECT * INTO t FROM maximus_agents.tasks
  WHERE id=p_id AND lease_token=p_token AND status='running' AND lease_until>now()
    AND kind='audit' AND payload->>'mode'='existing_strict_evidence' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'FINISHER_INVALID_LEASE'; END IF;
  IF (SELECT count(*) FROM public.scpi_crash_test_strict_v2)<>69
     OR NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_universe u
                    WHERE u.scpi_slug=t.payload->>'scpi_slug' AND u.lifecycle='existing')
  THEN RAISE EXCEPTION 'FINISHER_COHORT_DRIFT'; END IF;
  SELECT * INTO r FROM public.scpi_source_registry
    WHERE scpi_slug=t.payload->>'scpi_slug';
  SELECT * INTO c FROM public.scpi_source_connectors
    WHERE scpi_slug=t.payload->>'scpi_slug';
  SELECT * INTO d FROM maximus_agents.scpi_bulletin_replay_documents
    WHERE scpi_slug=t.payload->>'scpi_slug'
      AND source_period=t.payload->>'target_period'
      AND source_url=r.bulletin_url
      AND status='extracted' AND pdf_sha256 ~ '^[a-f0-9]{64}$'
      AND page_count>0
      AND result->>'identity_verified'='true'
      AND result->>'period_verified'='true'
    ORDER BY processed_at DESC NULLS LAST LIMIT 1;
  IF jsonb_typeof(p_proof)='object' AND jsonb_typeof(p_proof->'documents')='array'
     AND jsonb_array_length(p_proof->'documents')=1 THEN
    doc:=p_proof->'documents'->0;
  END IF;
  valid :=
    coalesce(p_proof->>'status','')='verified'
    AND coalesce(p_proof->>'candidate_slug','')=t.payload->>'scpi_slug'
    AND p_proof->'financial_certified'='false'::jsonb
    AND p_proof->'deploy_allowed'='false'::jsonb
    AND r.id IS NOT NULL AND c.scpi_slug IS NOT NULL AND d.document_key IS NOT NULL
    AND lower(split_part(split_part(r.bulletin_url,'://',2),'/',1))=ANY(c.allowed_hosts)
    AND r.bulletin_url LIKE 'https://%'
    AND coalesce(doc->>'status','')='verified'
    AND doc->>'source_url'=d.source_url
    AND doc->>'source_period'=d.source_period
    AND doc->>'pdf_sha256'=d.pdf_sha256
    AND doc->>'document_kind'='quarterly_bulletin'
    AND doc->>'page_count'=d.page_count::text
    AND doc->'reader_engines'='["MuPDF","Poppler"]'::jsonb
    AND doc->'binary_hash_matches_registered'='true'::jsonb
    AND doc->'identity_verified'='true'::jsonb
    AND doc->'period_verified'='true'::jsonb
    AND doc->'financial_certified'='false'::jsonb;
  outcome:=CASE WHEN valid THEN 'done' ELSE 'blocked' END;
  next_action:=CASE
    WHEN valid THEN 'SOURCE_PDF_VERIFIED__FINANCIAL_FIELD_QA_REQUIRED'
    WHEN d.document_key IS NULL THEN 'REGISTER_EXACT_PERIOD_OFFICIAL_PDF'
    ELSE 'RECHECK_ISSUER_PDF_SHA_PERIOD_IDENTITY_OR_HOST'
  END;
  finding:=jsonb_build_object(
    'scpi_slug',t.payload->>'scpi_slug',
    'target_period',t.payload->>'target_period',
    'route_family',t.payload->>'route_family',
    'live_pdf_independently_read',valid,
    'source_url',coalesce(d.source_url,r.bulletin_url),
    'expected_sha256',d.pdf_sha256,
    'expected_page_count',d.page_count,
    'submitted_pdf_proof',coalesce(p_proof,'{}'::jsonb),
    'financial_certified',false,'no_financial_decision',true);
  body:=jsonb_build_object(
    'summary',CASE WHEN valid
       THEN 'Original issuer PDF SHA and SCPI/period validated with MuPDF + Poppler; financial fields still need separate QA.'
       ELSE 'Official source binary cannot be verified; financial data unchanged.' END,
    'verdict','REVIEW','deploy_allowed',false,'financial_certified',false,
    'independent_financial_qa_completed',false,'next_action',next_action,
    'evidence',jsonb_build_array(jsonb_build_object(
       'source','GitHub Actions original publisher PDF + original replay ledger',
       'observed_at',now()::text,'finding',finding)));
  PERFORM maximus_agents.finish_task(p_id,p_token,outcome,body);
  RETURN jsonb_build_object('scpi_slug',t.payload->>'scpi_slug',
    'status',outcome,'verdict','REVIEW','next_action',next_action,
    'source_pdf_verified',valid,
    'financial_certified',false,'deploy_allowed',false);
END;
$fn$;

-- The scoped binary verifier is not a financial attester. Its quota is
-- independent of expensive model jobs: up to eight proofs per role / Paris day.
CREATE OR REPLACE FUNCTION maximus_agents.claim_existing_strict_evidence_v1(p_role text)
RETURNS SETOF maximus_agents.tasks LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $fn$
DECLARE cfg maximus_agents.settings; t maximus_agents.tasks; tok uuid;
  d date:=(now() at time zone 'Europe/Paris')::date;
BEGIN
  IF p_role NOT IN ('DATA','SEARCH','ANALYST','QA') THEN
    RAISE EXCEPTION 'FINISHER_ROLE_DENIED'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:claim:'||p_role));
  SELECT * INTO cfg FROM maximus_agents.settings WHERE singleton;
  IF NOT FOUND OR NOT cfg.enabled OR
     NOT coalesce((SELECT enabled FROM maximus_agents.agents WHERE role=p_role),false)
  THEN RETURN; END IF;
  IF EXISTS(SELECT 1 FROM maximus_agents.tasks
     WHERE role=p_role AND status='running') THEN RETURN; END IF;
  IF (SELECT count(*) FROM maximus_agents.runs r
      JOIN maximus_agents.tasks x ON x.id=r.task_id
      WHERE r.role=p_role AND (r.started_at AT TIME ZONE 'Europe/Paris')::date=d
      AND x.payload->>'mode'='existing_strict_evidence') >= 8
  THEN RETURN; END IF;
  SELECT x.* INTO t FROM maximus_agents.tasks x
  JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=x.payload->>'scpi_slug'
  WHERE x.role=p_role AND x.kind='audit' AND x.status='pending'
    AND x.attempts<2 AND x.payload->>'mode'='existing_strict_evidence'
    AND v.crash_test_status='FAIL_STRICT'
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
