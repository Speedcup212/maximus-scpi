-- Source discovery gaps are not missing numeric data. Revisit only periodically;
-- never spend a daily replay on unchanged issuer HTML, a 403 or wrong period.
-- Registered new official PDFs are still queued immediately on insertion.
DO $migration$
DECLARE rec record; sql_def text; updated text; count_change integer;
  old_retry text := 'WHEN p_doc->>''status'' IN (''source_reference_review'',''source_access_blocked'') THEN now()+interval ''24 hours''';
  new_retry text := 'WHEN p_doc->>''status''=''source_reference_review'' THEN now()+interval ''30 days'' WHEN p_doc->>''status''=''source_access_blocked'' THEN now()+interval ''90 days''';
  old_fetch text := 'WHEN p_doc->>''status'' IN (''fetch_error'',''extraction_error'') THEN now()+least(interval ''24 hours'',interval ''1 hour''*greatest(d.attempts,1))';
  new_fetch text := 'WHEN p_doc->>''status''=''fetch_error'' AND coalesce(p_doc->>''error'','''') ~ ''(curl_http_status_403|HTTP Error 403|curl_http_status_404|HTTP Error 404)'' THEN now()+interval ''30 days'' WHEN p_doc->>''status''=''fetch_error'' THEN now()+least(interval ''7 days'',interval ''1 day''*greatest(d.attempts,1)) WHEN p_doc->>''status''=''extraction_error'' THEN now()+least(interval ''7 days'',interval ''1 day''*greatest(d.attempts,1))';
  guard text := 't.status<>''source_period_mismatch'' AND ';
BEGIN
 SELECT pg_get_functiondef(p.oid) INTO sql_def
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_record';
 IF position(new_retry in sql_def)=0 THEN
   IF position(old_retry in sql_def)=0 OR position(old_fetch in sql_def)=0 THEN RAISE EXCEPTION 'Replay record retry schema changed'; END IF;
   updated:=replace(replace(sql_def,old_retry,new_retry),old_fetch,new_fetch);
   EXECUTE updated;
 END IF;
 FOR rec IN SELECT p.proname,p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN ('scpi_bulletin_replay_claim','scpi_bulletin_replay_health')
 LOOP
   sql_def:=pg_get_functiondef(rec.oid);
   IF position(guard in sql_def)=0 THEN
      IF position('t.next_try_at<=now()' in sql_def)=0 THEN RAISE EXCEPTION 'Replay claim/health guard anchor absent: %',rec.proname; END IF;
      updated:=replace(sql_def,'t.next_try_at<=now()',guard||'t.next_try_at<=now()');
      EXECUTE updated;
   END IF;
 END LOOP;
END $migration$;
-- Retain exact gaps and proof metadata; only defer repeated identical requests.
UPDATE maximus_agents.scpi_bulletin_replay_documents
 SET next_try_at=greatest(next_try_at,coalesce(processed_at,now())+interval '30 days'),
     updated_at=now()
 WHERE status='source_reference_review' AND next_try_at<now()+interval '29 days';
UPDATE maximus_agents.scpi_bulletin_replay_documents
 SET next_try_at=greatest(next_try_at,coalesce(processed_at,now())+interval '30 days'),
     updated_at=now()
 WHERE status='fetch_error' AND coalesce(result->>'error','') ~ '(curl_http_status_403|HTTP Error 403|curl_http_status_404|HTTP Error 404)' AND next_try_at<now()+interval '29 days';
