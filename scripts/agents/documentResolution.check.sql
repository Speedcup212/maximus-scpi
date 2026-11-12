-- Execute as the private database owner. Every mutation below is rolled back.
BEGIN;
DO $$
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
END $$;
SELECT 'PASS' AS transaction_checks;
ROLLBACK;
