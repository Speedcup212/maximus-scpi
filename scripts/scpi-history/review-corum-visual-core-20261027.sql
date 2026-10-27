-- Replay only AFTER corum_document_audit_20261027.json is ingested through the
-- protected RPC. 16 real PDF regions were rendered and read by Codex, with 48
-- matching MuPDF/Poppler values. This records AI source review, NOT human approval.
BEGIN;
DO $review$
DECLARE matched integer;
BEGIN
 SELECT count(*) INTO matched FROM public.scpi_indicator_history h
 JOIN maximus_agents.scpi_corum_document_runs d ON d.scpi_slug=h.scpi_slug AND d.source_period=h.source_period
 WHERE d.status='certified_core' AND h.scpi_slug LIKE 'corum-%'
   AND h.source_period IN ('2024-T4','2025-T1','2025-T2','2025-T3')
   AND h.tof=(d.payload->'metrics'->>'tof')::numeric
   AND h.nombre_parts=(d.payload->'metrics'->>'nombre_parts')::bigint
   AND h.parts_attente_retrait=(d.payload->'metrics'->>'parts_attente_retrait')::bigint;
 IF matched<>16 THEN RAISE EXCEPTION 'Visual reviewed dataset changed: expected 16, found %',matched; END IF;
END;
$review$;
UPDATE public.scpi_metric_certifications c SET
 verification_status='manual_verified_official_visual_core',
 verification_method='codex_visual_review_rendered_official_pdf_plus_mupdf_poppler_20261027'
FROM maximus_agents.scpi_corum_document_runs d
WHERE c.scpi_slug=d.scpi_slug AND c.source_period=d.source_period AND d.status='certified_core'
 AND c.source_period IN ('2024-T4','2025-T1','2025-T2','2025-T3')
 AND c.metric IN ('tof','nombre_parts','parts_attente_retrait')
 AND c.value_numeric=(d.payload->'metrics'->>c.metric)::numeric;
UPDATE public.scpi_indicator_history h SET qa_status='manual_verified_official_visual_core'
FROM maximus_agents.scpi_corum_document_runs d
WHERE h.scpi_slug=d.scpi_slug AND h.source_period=d.source_period AND d.status='certified_core'
 AND h.source_period IN ('2024-T4','2025-T1','2025-T2','2025-T3')
 AND h.tof=(d.payload->'metrics'->>'tof')::numeric
 AND h.nombre_parts=(d.payload->'metrics'->>'nombre_parts')::bigint
 AND h.parts_attente_retrait=(d.payload->'metrics'->>'parts_attente_retrait')::bigint;
COMMIT;
