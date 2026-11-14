DO $repair$
DECLARE before_view jsonb; after_view jsonb; new_row jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('recovery204:existing-cohort'));
 SELECT jsonb_agg(to_jsonb(v) ORDER BY scpi_slug) INTO before_view FROM public.scpi_crash_test_strict_v2 v;
 IF jsonb_array_length(before_view)<>69 OR NOT EXISTS(SELECT 1 FROM public.scpi_crash_test_strict_v2 WHERE scpi_slug='edr-europa' AND crash_test_status='FAIL_STRICT') THEN
 RAISE EXCEPTION 'UNEXPECTED_EXISTING_COHORT'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe WHERE scpi_slug='edr-europa') THEN
 RAISE EXCEPTION 'ALREADY_REGISTERED_REVIEW_REQUIRED'; END IF;
 INSERT INTO maximus_agents.scpi_universe
 (scpi_slug,name,management_company,lifecycle,stage,origin_url,origin_type,strict_pass,analysis_certified,publication_authorized,review_note,last_checked_at)
 SELECT r.scpi_slug,r.scpi_name,r.management_company,'existing','primary_source_found',r.official_scpi_page_url,'current_catalog',false,false,false,
 'RECOVERY-204 / #311: reconcile already-public EdR Europa into existing-agent supervision. Existing strict view position 66; no new SCPI, no financial approval or new publication authorization. FAIL_STRICT retained.',now()
 FROM public.scpi_source_registry r JOIN public.scpi_crash_test_strict_v2 v USING(scpi_slug)
 WHERE r.scpi_slug='edr-europa' AND r.official_scpi_page_url='https://edr-europa.com/' AND v.pilot_order=66
 RETURNING to_jsonb(scpi_universe.*) INTO new_row;
 IF new_row IS NULL THEN RAISE EXCEPTION 'MISSING_EXISTING_SOURCE_IDENTITY'; END IF;
 SELECT jsonb_agg(to_jsonb(v) ORDER BY scpi_slug) INTO after_view FROM public.scpi_crash_test_strict_v2 v;
 IF before_view IS DISTINCT FROM after_view THEN RAISE EXCEPTION 'CERTIFICATION_CHANGED_UNEXPECTEDLY'; END IF;
 IF (SELECT count(*) FROM maximus_agents.scpi_universe u JOIN public.scpi_crash_test_strict_v2 v USING(scpi_slug) WHERE lifecycle='existing')<>69 THEN RAISE EXCEPTION 'CONTROL_COHORT_NOT_69'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery204:edr-europa:existing-agent-cohort','Missing supervisor identity repaired; unchanged strict financial certification and public cohort.',
 jsonb_build_object('before_registry',NULL,'after_registry',new_row,'before_strict',before_view,'after_strict',after_view));
END $repair$;
