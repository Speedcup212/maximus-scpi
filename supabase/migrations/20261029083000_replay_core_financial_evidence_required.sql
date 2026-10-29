-- A bulletin with all indicators absent has no positive financial evidence.
-- Distinguish complete page-reading from a certifiable financial observation.
DO $migration$
DECLARE source_sql text; target_sql text; fn_oid oid;
  anchor text := 'AND (SELECT count(*)>=32 FROM jsonb_each_text(coalesce(p_doc->''field_coverage'',''{}'')))';
  guard text := 'AND EXISTS(SELECT 1 FROM jsonb_each_text(coalesce(p_doc->''field_coverage'',''{}'')) c WHERE c.key IN (''tof'',''prix_souscription'',''capitalisation'',''td'') AND c.value=''verified'')';
BEGIN
 SELECT p.oid INTO STRICT fn_oid FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_record';
 source_sql:=pg_get_functiondef(fn_oid);
 IF position(guard in source_sql)>0 THEN RETURN; END IF;
 IF position(anchor in source_sql)=0 THEN RAISE EXCEPTION 'Financial evidence gate not found'; END IF;
 target_sql:=replace(source_sql,anchor,anchor||E'\n  '||guard);
 EXECUTE target_sql;
END $migration$;
