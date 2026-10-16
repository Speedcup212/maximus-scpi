-- One-time supervised retry of one safe code-only DATA regression issue.
-- First paid claim was blocked as model_cannot_fix: missing SQL reference content.
-- Never unblocks financial/candidate tasks. The budget still limits DATA to two claims/day.
DO $guard$
DECLARE changed_issue integer; changed_task integer;
BEGIN
 UPDATE maximus_agents.issues
 SET scope=scope||jsonb_build_object('readonly_context_files',
    jsonb_build_array('supabase/migrations/20261016_p0_strict_public_approval_gate.sql')),
    status='open',
    implementation=coalesce(implementation,'{}'::jsonb)||
      jsonb_build_object('authorized_retry_reason','Source SQL now supplied to DeepSeek READ-ONLY; one explicitly supervised retry',
         'authorized_at',now(),'first_attempt_verdict','REVIEW; no candidate PR or published change'),
    updated_at=now()
 WHERE id='d76fda75-a06f-4b16-b7a1-02b6c9248e13'
   AND issue_key='DATA-P1-STRICT-PUBLIC-GATE-REGRESSION-20261016'
   AND owner_role='DATA' AND status='blocked'
   AND implementation->>'verdict'='REVIEW'
   AND scope->>'execution_mode'='scoped_code_correction'
   AND scope->'files'='["scripts/scpi-candidates/corumFeeTiers.test.mjs"]'::jsonb;
 GET DIAGNOSTICS changed_issue = ROW_COUNT;
 IF changed_issue<>1 THEN RAISE EXCEPTION 'Refuse retry: issue does not match blocked one-file baseline'; END IF;
 UPDATE maximus_agents.tasks
 SET status='pending',lease_token=NULL,lease_until=NULL,
     completed_at=NULL,updated_at=now(),
     result=coalesce(result,'{}'::jsonb)||jsonb_build_object(
       'retry_approved_at',now(),'retry_approval',
       'Second and last attempt after adding readonly SQL context; previous REVIEW retained')
 WHERE id='5fdf8777-3624-4715-9276-779afa5f63f7'
   AND role='DATA' AND kind='execute' AND status='blocked' AND attempts=1
   AND issue_ids=ARRAY['d76fda75-a06f-4b16-b7a1-02b6c9248e13'::uuid]
   AND result->>'verdict'='REVIEW'
   AND lease_until IS NULL;
 GET DIAGNOSTICS changed_task = ROW_COUNT;
 IF changed_task<>1 THEN RAISE EXCEPTION 'Refuse retry: existing DATA code task is not precisely first-attempt blocked'; END IF;
END
$guard$;
