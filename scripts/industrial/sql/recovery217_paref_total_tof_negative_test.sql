-- Run inside BEGIN/ROLLBACK after recovery217 migration.
DO $negative$
DECLARE original jsonb; changed jsonb; k text; val jsonb;
BEGIN
 SELECT detailed_evidence INTO STRICT original FROM maximus_agents.scpi_independent_tof_geometry_proofs WHERE scpi_slug='paref-hexa' AND source_period='2026-T3';
 FOR k,val IN SELECT * FROM jsonb_each('{"sha256":"bad","source_page":4,"caption_period":"2026-T2","exact_total_caption_verified":false,"status":"invalid_occupied_component_not_total_tof","mupdf_target_box":[75.69,327.38,107.28,345.53],"poppler_target_box":[70.71,250.51,112.87,274.71],"artifact_sha256":"bad","workflow_commit":"bad","tof_candidate_percent":84.5}'::jsonb) LOOP
 UPDATE maximus_agents.scpi_independent_tof_geometry_proofs SET detailed_evidence=jsonb_set(original,ARRAY[k],val) WHERE scpi_slug='paref-hexa' AND source_period='2026-T3';
 IF scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',86,5)
 OR (SELECT crash_test_status FROM public.scpi_crash_test_strict_v2 WHERE scpi_slug='paref-hexa')<>'FAIL_STRICT'
 THEN RAISE EXCEPTION 'REC217_ACCEPTED_BAD_PROOF_%',k; END IF;
 END LOOP;
 UPDATE maximus_agents.scpi_independent_tof_geometry_proofs SET detailed_evidence=original WHERE scpi_slug='paref-hexa' AND source_period='2026-T3';
 IF scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T2',86,5)
 OR scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',86,4)
 OR scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',84.5,5)
 OR NOT scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',86,5)
 THEN RAISE EXCEPTION 'REC217_ARGUMENT_GUARD_FAILED'; END IF;
END $negative$;