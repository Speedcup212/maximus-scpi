BEGIN;
-- RECOVERY-009: documentation hubs may wrap the issue page before the PDF.
CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_claim(p_version text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE; payload jsonb;
BEGIN
 IF p_version !~ '^all-bulletins-[a-zA-Z0-9-]+$' THEN RAISE EXCEPTION 'BAD_REPLAY_VERSION'; END IF;
 SELECT * INTO d FROM maximus_agents.scpi_bulletin_replay_documents t
 WHERE EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p WHERE p.scpi_slug=t.scpi_slug AND p.enabled)
 AND t.next_try_at<=now() AND
 ((t.status<>'running' AND (t.parser_version IS DISTINCT FROM p_version OR t.status IN ('queued','fetch_error','extraction_error','html_pending_semantic_extraction','source_reference_review','source_access_blocked') OR t.result ? 'archive_error' OR (t.status='canonical_guard_review' AND t.result->>'canonical_guard_error'='deadlock detected') OR (t.status='extracted_needs_review' AND t.result->>'source_review_version' IS DISTINCT FROM 'issuer-source-resolution-20261028-v2')))
 OR (t.status='running' AND t.claimed_at<now()-interval '60 minutes'))
 ORDER BY (t.origin='registered_bulletin') DESC,t.source_period DESC,t.attempts,t.document_key
 FOR UPDATE SKIP LOCKED LIMIT 1;
 IF d.document_key IS NULL THEN RETURN jsonb_build_object('task',NULL); END IF;
 UPDATE maximus_agents.scpi_bulletin_replay_documents SET status='running',lease_token=gen_random_uuid(),claimed_at=now(),attempts=attempts+1,updated_at=now()
 WHERE document_key=d.document_key RETURNING * INTO d;
 SELECT to_jsonb(d)||jsonb_build_object('id',d.document_key,'period',d.source_period,'scpi_name',s.scpi_name,
   'pdf_sha256',d.expected_sha256,'official_scpi_page_url',s.official_scpi_page_url,'source_domain',s.source_domain,'discovery',d.result->'discovery','qa_status',b.qa_status,'metrics',coalesce(b.extraction_json->'metrics','{}'),
   'aliases',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM public.scpi_name_aliases a WHERE a.scpi_slug=d.scpi_slug AND a.active),'[]'))
 INTO payload FROM public.scpi_source_registry s LEFT JOIN public.scpi_bulletins b ON b.id=d.bulletin_id WHERE s.scpi_slug=d.scpi_slug;
 RETURN jsonb_build_object('task',payload);
END $function$
;

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
    OR t.result ? 'archive_error' OR (t.status='canonical_guard_review' AND t.result->>'canonical_guard_error'='deadlock detected') OR (t.status='extracted_needs_review' AND t.result->>'source_review_version' IS DISTINCT FROM 'issuer-source-resolution-20261028-v2')))
   OR(t.status='running' AND t.claimed_at<now()-interval '60 minutes'))),
 'statuses',(SELECT coalesce(jsonb_object_agg(status,n),'{}'::jsonb) FROM
  (SELECT status,count(*) n FROM maximus_agents.scpi_bulletin_replay_documents GROUP BY status)s),
 'fully_read',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE processing_complete),
 'financially_complete',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE financial_complete)
);
$function$
;

UPDATE maximus_agents.scpi_bulletin_replay_documents
SET status='queued',next_try_at=now(),updated_at=now(),
 result=result||jsonb_build_object('operational_retry_reason','documentation and archive hub traversal v2')
WHERE status IN ('source_reference_review','fetch_error')
 AND result->>'source_review_version'='issuer-source-resolution-20261028-v1';
COMMIT;
