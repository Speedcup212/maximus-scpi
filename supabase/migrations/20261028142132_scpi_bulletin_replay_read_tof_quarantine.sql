BEGIN;
-- RECOVERY-009: the existing TOF certification trigger is SECURITY INVOKER.
-- It must read the private quarantine audit; no write or public permission is granted.
GRANT SELECT ON scpi_internal.tof_policy_quarantine_audit_20261028 TO service_role;

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_health(p_version text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
SELECT jsonb_build_object(
 'effective_role',current_user,
 'permissions_ok',has_schema_privilege(current_user,'maximus_agents','USAGE')
  AND has_table_privilege(current_user,'maximus_agents.scpi_candidate_document_index','SELECT')
  AND has_table_privilege(current_user,'scpi_internal.tof_policy_quarantine_audit_20261028','SELECT')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_seed()','EXECUTE')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_claim(text)','EXECUTE')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_record(jsonb,uuid)','EXECUTE'),
 'checked_at',now(),
 'enabled_scpi',(SELECT count(*) FROM public.scpi_trajectory_pilot WHERE enabled),
 'eligible_now',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents t
  WHERE EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p WHERE p.scpi_slug=t.scpi_slug AND p.enabled)
  AND t.next_try_at<=now() AND ((t.status<>'running' AND
   (t.parser_version IS DISTINCT FROM p_version OR t.status IN ('queued','fetch_error','extraction_error','html_pending_semantic_extraction','source_reference_review','source_access_blocked')
    OR t.result ? 'archive_error' OR (t.status='canonical_guard_review' AND t.result->>'canonical_guard_error'='deadlock detected') OR (t.status='extracted_needs_review' AND t.result->>'source_review_version' IS DISTINCT FROM 'issuer-source-resolution-20261028-v1')))
   OR(t.status='running' AND t.claimed_at<now()-interval '60 minutes'))),
 'statuses',(SELECT coalesce(jsonb_object_agg(status,n),'{}'::jsonb) FROM
  (SELECT status,count(*) n FROM maximus_agents.scpi_bulletin_replay_documents GROUP BY status)s),
 'fully_read',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE processing_complete),
 'financially_complete',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE financial_complete)
);
$function$
;

-- Retry only operational permission failures, preserving financial review blocks.
UPDATE maximus_agents.scpi_bulletin_replay_documents
SET status='queued',next_try_at=now(),updated_at=now(),
 result=result||jsonb_build_object('operational_retry_reason','quarantine audit SELECT granted to service_role')
WHERE status='canonical_guard_review'
 AND result->>'canonical_guard_error'='permission denied for table tof_policy_quarantine_audit_20261028';
COMMIT;
