-- Financial extraction is complete when each numeric financial field has either
-- independently verified evidence or a documented absence after a full PDF scan.
-- Structured fields remain separately unverified and must not masquerade as numeric.
-- Idempotent because the rule can be applied operationally before repo deployment.
DO $migration$
DECLARE source_sql text; target_sql text; fn_oid oid;
  old_gate text := 'c.value<>''verified''';
  absent_gate text := 'c.value NOT IN (''verified'',''not_found_after_full_read'')';
  structured_gate text := 'c.key NOT IN (''repartition_sectorielle'',''repartition_geographique'',''capital_type'',''sfdr'',''label_isr'',''versement_loyers'') AND c.value NOT IN (''verified'',''not_found_after_full_read'')';
BEGIN
 SELECT p.oid INTO STRICT fn_oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_record';
 source_sql:=pg_get_functiondef(fn_oid);
 IF position(structured_gate in source_sql)>0 THEN
   RETURN;
 ELSIF position(absent_gate in source_sql)>0 THEN
   target_sql:=replace(source_sql,absent_gate,structured_gate);
 ELSIF position(old_gate in source_sql)>0 THEN
   target_sql:=replace(source_sql,old_gate,structured_gate);
 ELSE
   RAISE EXCEPTION 'Unknown coverage gate; refusing to change replay function';
 END IF;
 EXECUTE target_sql;
END $migration$;
