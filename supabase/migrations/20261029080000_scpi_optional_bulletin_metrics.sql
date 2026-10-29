-- An indicator not published in a fully read bulletin is a documented absence,
-- not a parser disagreement. Keep existing certified dated values unchanged.
DO $migration$
DECLARE source_sql text; target_sql text; fn_oid oid;
BEGIN
 SELECT p.oid INTO STRICT fn_oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_record';
 source_sql:=pg_get_functiondef(fn_oid);
 IF position('c.value<>''verified''' in source_sql)=0 THEN
   RAISE EXCEPTION 'Expected strict coverage gate not found; refusing to alter replay function';
 END IF;
 target_sql:=replace(source_sql,'c.value<>''verified''',
   'c.value NOT IN (''verified'',''not_found_after_full_read'')');
 EXECUTE target_sql;
END $migration$;
