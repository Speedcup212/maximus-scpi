-- Dual-reader agreement is not enough when geometry merges separate columns
-- into a gigantic count. Fail closed before writing any integer-valued metric.
DO $guard$
DECLARE p_oid oid; sql_def text; old_gate text; new_gate text;
BEGIN
 SELECT p.oid INTO STRICT p_oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_record';
 sql_def:=pg_get_functiondef(p_oid);
 old_gate:='AND (val<0 OR val<>trunc(val)) THEN CONTINUE; END IF;';
 new_gate:='AND (val<0 OR val<>trunc(val) OR val>CASE WHEN k IN (''nombre_parts'',''parts_attente_retrait'',''retraits_executes_trimestre'') THEN 1000000000 ELSE 100000000 END) THEN conflicts:=conflicts||to_jsonb(''numeric_range_review:''||k);CONTINUE;END IF;';
 IF position(new_gate in sql_def)>0 THEN RETURN; END IF;
 IF position(old_gate in sql_def)=0 THEN RAISE EXCEPTION 'Unexpected replay integer guard; refusing unsafe migration'; END IF;
 EXECUTE replace(sql_def,old_gate,new_gate);
END $guard$;
-- Revisit only the exact known wrong geometry, not all historic bulletins.
UPDATE maximus_agents.scpi_bulletin_replay_documents
 SET status='queued',parser_version=NULL,financial_complete=false,
     next_try_at=now(),updated_at=now()
 WHERE scpi_slug='patrimmo-commerce' AND source_period IN ('2024-T1','2024-T2','2024-T4')
   AND status='canonical_guard_review'
   AND result->>'canonical_guard_error' LIKE '%out of range for type bigint%';
