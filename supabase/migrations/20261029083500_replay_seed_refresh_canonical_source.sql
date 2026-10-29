-- Seed must reconcile a canonical bulletin whose official URL/hash changed,
-- rather than inserting the same immutable bulletin UUID under a second URL.
-- Serialize concurrent replay workers and preserve the superseded source for audit.
-- Safe on existing installations, idempotent on repeat execution.
DO $migration$
DECLARE source_sql text; target_sql text; fn_oid oid;
  anchor text := E'BEGIN\n INSERT INTO maximus_agents.scpi_bulletin_replay_documents(';
  replacement text := E'BEGIN\n PERFORM pg_advisory_xact_lock(2147011029);\n UPDATE maximus_agents.scpi_bulletin_replay_documents AS d\n SET source_url=b.source_url, bulletin_id=b.id, expected_sha256=b.pdf_sha256,\n     pdf_path=b.pdf_path, pdf_sha256=NULL, status=\'queued\', next_try_at=now(),\n     parser_version=NULL, page_count=NULL, pages_read=NULL,\n     processing_complete=false, financial_complete=false,\n     field_coverage=\'{}\'::jsonb, metrics=\'{}\'::jsonb, evidence=\'{}\'::jsonb,\n     result=d.result||jsonb_build_object(\'reseed_previous_url\',d.source_url,\'reseed_reason\',\'official_document_url_changed\',\'reseed_at\',now()),\n     processed_at=NULL, claimed_at=NULL, lease_token=NULL, updated_at=now()\n FROM public.scpi_bulletins b JOIN public.scpi_trajectory_pilot p ON p.scpi_slug=b.scpi_slug AND p.enabled\n WHERE d.document_key=b.id::text AND d.status<>\'running\'\n   AND b.source_url LIKE \'https://%\' AND d.source_url IS DISTINCT FROM b.source_url\n   AND NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_bulletin_replay_documents other\n      WHERE other.scpi_slug=b.scpi_slug AND other.source_period=b.period\n        AND other.source_url=b.source_url AND other.document_key<>d.document_key);\n INSERT INTO maximus_agents.scpi_bulletin_replay_documents(';
BEGIN
 SELECT p.oid INTO STRICT fn_oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_seed';
 source_sql:=pg_get_functiondef(fn_oid);
 IF position('pg_advisory_xact_lock(2147011029)' in source_sql)>0 THEN RETURN; END IF;
 IF position(anchor in source_sql)=0 THEN
  RAISE EXCEPTION 'Replay seed entrypoint mismatch; migration aborted';
 END IF;
 target_sql:=replace(source_sql,anchor,replacement);
 EXECUTE target_sql;
END $migration$;
