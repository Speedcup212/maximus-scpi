-- RECOVERY-217: connect independently produced total-TOF evidence; preserve all other strict gates.
CREATE TEMP TABLE rec217_before ON COMMIT DROP AS SELECT scpi_slug,crash_test_status FROM public.scpi_crash_test_strict_v2;
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug='paref-hexa' AND source_period='2026-T3' AND metric='tof' AND value_numeric=86 AND source_page=5 AND verification_status='auto_verified_with_evidence')
 OR NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_independent_tof_geometry_proofs WHERE scpi_slug='paref-hexa' AND source_period='2026-T3' AND detailed_evidence->>'status'='invalid_occupied_component_not_total_tof')
 THEN RAISE EXCEPTION 'REC217_BASELINE_CHANGED'; END IF;
END $guard$;
INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
SELECT 'recovery217:paref-hexa:2026-T3:replace-invalid-geometry',
'Replace invalid occupied-component proof with authenticated total TOF CI artifact. Preserve prior proof, history and function.',
jsonb_build_object('geometry_before',to_jsonb(p),'history_before',to_jsonb(h),'function_before',pg_get_functiondef('scpi_internal.paref_archive_tof_proof_valid(text,text,numeric,integer)'::regprocedure),
'view_before',pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true))
FROM maximus_agents.scpi_independent_tof_geometry_proofs p JOIN public.scpi_indicator_history h ON h.scpi_slug=p.scpi_slug AND h.source_period=p.source_period
WHERE p.scpi_slug='paref-hexa' AND p.source_period='2026-T3';
UPDATE maximus_agents.scpi_independent_tof_geometry_proofs SET value_percent=86,
workflow_reference='github-actions:43767085123',artifact_id='14182876282',
detailed_evidence='{"slug":"paref-hexa","period":"2026-T3","sha256":"ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce","status":"issuer_binary_verified_candidate_geometry","readers":["MuPDF","Poppler"],"artifact_id":"14182876282","artifact_sha256":"2e3922e422c8225035aeedffa791286e72455c9b2b49d8a02f260599c2e24742","source_page":5,"mupdf_target_box":[70.71,250.51,112.87,274.71],"poppler_target_box":[70.71,250.5,112.87,274.71],"human_attestation":false,"workflow_reference":"github-actions:43767085123","original_issuer_url":"https://paref-gestion.com/wp-content/uploads/2026/10/dc0cd675-deb0-4ab0-b928-040f9aafd157-BTI-T3-2026-PAREF-Hexa.pdf","fund_period_verified":true,"tof_candidate_percent":86,"original_archive_bytes":1775561,"publication_authorized":false,"same_numeric_word_coordinates":true,"exact_total_caption_verified":true,"caption_period":"2026-T3","definition":"issuer_reported_total_tof_ASPIM","workflow_commit":"80efd0c5964955b55edb236ce72432ccbf93a99b"}'::jsonb
WHERE scpi_slug='paref-hexa' AND source_period='2026-T3';
UPDATE public.scpi_indicator_history SET qa_status='source_verified_independent_paref_archive',
metric_provenance=jsonb_set(metric_provenance,'{tof}',metric_provenance->'tof'||'{"workflow_reference":"github-actions:43767085123","artifact_id":"14182876282","recovery_task":"RECOVERY-217"}'::jsonb)
WHERE scpi_slug='paref-hexa' AND source_period='2026-T3' AND tof=86;
CREATE OR REPLACE FUNCTION scpi_internal.paref_archive_tof_proof_valid(p_slug text, p_period text, p_value numeric, p_page integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 SELECT COALESCE(EXISTS (
 SELECT 1 FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
 JOIN public.scpi_bulletins b ON b.scpi_slug=ev.scpi_slug AND b.period=ev.source_period
   AND b.source_url=ev.source_url AND b.pdf_sha256=ev.pdf_sha256
 JOIN storage.objects o ON o.bucket_id='scpi-bulletins' AND o.name=b.pdf_path
 JOIN public.scpi_metric_certifications c ON c.id=ev.certificate_id AND c.bulletin_id=b.id
   AND c.scpi_slug=ev.scpi_slug AND c.source_period=ev.source_period
   AND c.source_url=ev.source_url AND c.metric='tof' AND c.source_page=ev.source_page
   AND c.value_numeric=ev.value_percent
 JOIN public.scpi_indicator_history h ON h.scpi_slug=ev.scpi_slug
   AND h.source_period=ev.source_period AND h.source_url=ev.source_url
 WHERE ev.scpi_slug=p_slug AND ev.source_period=p_period
   AND ev.value_percent=p_value AND ev.source_page=p_page
   AND ((ev.scpi_slug='paref-evo' AND ev.source_period='2024-T4'
     AND ev.pdf_sha256='c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9'
     AND ev.value_percent=94.4 AND ev.source_page=4 AND ev.pdf_byte_size=2171159)
    OR (ev.scpi_slug='paref-hexa' AND ev.source_period='2026-T3'
     AND ev.pdf_sha256='ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce'
     AND ev.value_percent=86.0 AND ev.source_page=5 AND ev.pdf_byte_size=1775561))
   AND b.pdf_path=ev.scpi_slug||'/'||ev.source_period||'/'||ev.pdf_sha256||'.pdf'
   AND (o.metadata->>'size')::bigint=ev.pdf_byte_size
   AND ((ev.scpi_slug='paref-evo' AND ev.workflow_reference='github-actions:42401051091' AND ev.artifact_id='13585154053')
    OR (ev.scpi_slug='paref-hexa' AND ev.workflow_reference='github-actions:43767085123' AND ev.artifact_id='14182876282'
      AND ev.detailed_evidence->>'workflow_commit'='80efd0c5964955b55edb236ce72432ccbf93a99b'
      AND ev.detailed_evidence->>'artifact_sha256'='2e3922e422c8225035aeedffa791286e72455c9b2b49d8a02f260599c2e24742'
      AND ev.detailed_evidence->>'exact_total_caption_verified'='true'
      AND ev.detailed_evidence->>'caption_period'='2026-T3'
      AND ev.detailed_evidence->>'definition'='issuer_reported_total_tof_ASPIM'
      AND (ev.detailed_evidence->>'tof_candidate_percent')::numeric=86))
   AND ev.human_attestation=false
   AND ev.detailed_evidence->>'status'='issuer_binary_verified_candidate_geometry'
   AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
   AND (ev.detailed_evidence->>'source_page')::integer=ev.source_page
   AND (ev.detailed_evidence->>'original_archive_bytes')::bigint=ev.pdf_byte_size
   AND ev.detailed_evidence->>'fund_period_verified'='true'
   AND ev.detailed_evidence->>'same_numeric_word_coordinates'='true'
   AND ev.detailed_evidence->>'human_attestation'='false'
   AND ev.detailed_evidence->>'publication_authorized'='false'
   AND ev.detailed_evidence->'readers'='["MuPDF","Poppler"]'::jsonb
   AND ((ev.scpi_slug='paref-evo' AND ev.detailed_evidence->'mupdf_target_box'=ev.detailed_evidence->'poppler_target_box')
    OR (ev.scpi_slug='paref-hexa'
      AND ev.detailed_evidence->'mupdf_target_box'='[70.71,250.51,112.87,274.71]'::jsonb
      AND ev.detailed_evidence->'poppler_target_box'='[70.71,250.50,112.87,274.71]'::jsonb))
   AND h.tof=ev.value_percent AND h.qa_status='source_verified_independent_paref_archive'
   AND h.source_confidence>=0.95 AND h.metric_provenance->'tof'->>'sha256'=ev.pdf_sha256
   AND (h.metric_provenance->'tof'->>'source_page')::integer=ev.source_page
   AND h.metric_provenance->'tof'->>'human_attestation'='false'
   AND c.verification_status='auto_verified_with_evidence'
   AND c.extraction_confidence>=0.95
   AND scpi_internal.tof_bulletin_source_rejection_reason(
      c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
 ),false)
$function$
;
DO $view$
DECLARE v text; old text := 'paref_archive_tof_proof_valid(''paref-hexa''::text, ''2026-T3''::text, 84.5, 5)';
BEGIN
 v:=pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true);
 IF position(old IN v)=0 THEN RAISE EXCEPTION 'REC217_VIEW_BASELINE_CHANGED'; END IF;
 EXECUTE 'CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS '||replace(v,old,replace(old,'84.5','86.0'));
END $view$;
DO $assert$
BEGIN
 IF NOT scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',86,5)
 OR scpi_internal.paref_archive_tof_proof_valid('paref-hexa','2026-T3',84.5,5)
 THEN RAISE EXCEPTION 'REC217_PROOF_REJECTED_OR_OLD_ACCEPTED'; END IF;
 IF (SELECT crash_test_status FROM public.scpi_crash_test_strict_v2 WHERE scpi_slug='paref-hexa')<>'PASS_100'
 OR EXISTS (SELECT 1 FROM rec217_before b FULL JOIN public.scpi_crash_test_strict_v2 a USING(scpi_slug)
 WHERE coalesce(b.scpi_slug,a.scpi_slug)<>'paref-hexa' AND b.crash_test_status IS DISTINCT FROM a.crash_test_status)
 THEN RAISE EXCEPTION 'REC217_STRICT_REGRESSION'; END IF;
END $assert$;
