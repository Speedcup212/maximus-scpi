-- RECOVERY-195: guard orphan manually-marked RUNNING execute tasks.
-- Original lease expiry and independent QA rules kept unchanged.
CREATE OR REPLACE FUNCTION maximus_agents.reconcile_expired_tasks()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'maximus_agents'
AS $function$
DECLARE
 t maximus_agents.tasks;
 recovered integer := 0;
 blocked integer := 0;
 evidence jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('maximus_agents:reconcile-expired'));
 FOR t IN
  SELECT * FROM maximus_agents.tasks
  WHERE status='running' AND lease_until IS NOT NULL AND lease_until<now()
  FOR UPDATE SKIP LOCKED
 LOOP
  evidence := jsonb_build_object(
   'summary','Bail expire : execution non certifiee. Relecture des preuves et de l etat actuel requise avant toute mutation.',
   'verdict','REVIEW',
   'recovery_code','LEASE_EXPIRED_RECONCILED',
   'expired_task',t.id,
   'attempts',t.attempts,
   'evidence',jsonb_build_array(jsonb_build_object(
    'source','maximus_agents.tasks.lease_until',
    'observed_at',now(),
    'finding','Bail expire; aucun succes d execution ou de QA presume'
   ))
  );
  UPDATE maximus_agents.runs
  SET status='expired',finished_at=now(),result=evidence
  WHERE task_id=t.id AND lease_token=t.lease_token AND status='running';
  IF t.kind='audit' AND t.attempts<2 THEN
   UPDATE maximus_agents.tasks SET status='pending',result=evidence,
    lease_token=null,lease_until=null,updated_at=now(),completed_at=null
   WHERE id=t.id;
   recovered := recovered+1;
  ELSE
   -- Executions that may have side effects require revalidation, not blind replay.
   UPDATE maximus_agents.tasks SET status='blocked',result=evidence,
    lease_token=null,lease_until=null,updated_at=now(),completed_at=now()
   WHERE id=t.id;
   UPDATE maximus_agents.issues SET status='blocked',updated_at=now(),qa_result=evidence
   WHERE id=ANY(t.issue_ids) AND status='in_progress';
   blocked := blocked+1;
  END IF;
 END LOOP;
 -- RECOVERY-195: manually marked RUNNING is not an execution without a claim.
 -- Preserve expiry policy, never retry, invent evidence or approve finance.
 FOR t IN SELECT orphan.* FROM maximus_agents.tasks orphan
  WHERE orphan.status='running' AND orphan.kind='execute'
    AND orphan.payload->>'manual_claim'='authorized_user_mission'
    AND orphan.attempts=0 AND orphan.lease_token IS NULL
    AND orphan.lease_until IS NULL
    AND orphan.updated_at<now()-interval '30 minutes'
    AND NOT EXISTS (SELECT 1 FROM maximus_agents.runs r WHERE r.task_id=orphan.id)
  FOR UPDATE OF orphan SKIP LOCKED
 LOOP
  evidence:=jsonb_build_object(
    'summary','Manually marked running but no lease, attempt or run. Quarantined for independent review.',
    'verdict','REVIEW','deploy_allowed',false,'financial_certified',false,
    'recovery_code','ORPHAN_RUNNING_NO_LEASE_NO_RUN','qa_required',true,
    'before_image',jsonb_build_object('status',t.status,'attempts',t.attempts,
      'lease_token',t.lease_token,'lease_until',t.lease_until,'updated_at',t.updated_at),
    'evidence',jsonb_build_array(jsonb_build_object('source','maximus_agents.tasks/runs',
      'observed_at',now(),'finding','No claim, no lease, no execution run'))
  );
  UPDATE maximus_agents.tasks SET status='blocked',result=evidence,
    lease_token=null,lease_until=null,updated_at=now(),completed_at=now()
  WHERE id=t.id;
  UPDATE maximus_agents.issues SET status='blocked',updated_at=now(),qa_result=evidence
  WHERE id=ANY(t.issue_ids) AND status='in_progress';
  blocked:=blocked+1;
 END LOOP;
 RETURN jsonb_build_object('audits_queued',recovered,'executions_blocked_for_review',blocked);
END
$function$

REVOKE ALL ON FUNCTION maximus_agents.reconcile_expired_tasks() FROM PUBLIC,anon,authenticated;
