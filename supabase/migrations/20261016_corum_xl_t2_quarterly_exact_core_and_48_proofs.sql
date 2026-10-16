-- Repair only the CORUM XL T2 official associates count: already verified
-- independently at PDF page 3, but omitted from extraction_json.metrics.
-- The OCR first read '94340'; independently checked PDF / issuer-backed
-- 2026-06-30 publication says 54340. Never re-OCR or auto-certify the bulletin.
WITH single_verified AS (
 SELECT b.id,e.numeric_value,b.scpi_slug
 FROM public.scpi_bulletins b
 JOIN maximus_agents.scpi_candidate_metric_evidence e
 ON e.scpi_slug=b.scpi_slug AND e.source_period=b.period AND e.source_url=b.source_url
 JOIN public.scpi_metric_certifications c
 ON c.scpi_slug=e.scpi_slug AND c.source_period=e.source_period
 AND c.metric=e.metric AND c.value_numeric=e.numeric_value
 AND c.source_url=e.source_url AND c.source_page=e.source_page
 JOIN public.scpi_indicators i ON i.scpi_slug=b.scpi_slug
 AND i.nombre_associes=e.numeric_value
 WHERE b.scpi_slug='corum-xl' AND b.period='2026-T2'
 AND b.qa_status='candidate_page_checked_partial'
 AND b.extraction_json->'metrics'->>'nombre_associes' IS NULL
 AND b.pdf_sha256='fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd'
 AND e.metric='nombre_associes' AND e.numeric_value=54340
 AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
 AND e.source_page=3 AND c.verification_status='manual_verified_official'
 AND EXISTS(SELECT 1 FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=b.scpi_slug AND o.source_period=b.period
  AND o.pdf_sha256=b.pdf_sha256 AND o.page_number=e.source_page)
), patched AS (
 UPDATE public.scpi_bulletins b
 SET extraction_json=jsonb_set(b.extraction_json,'{metrics,nombre_associes}',
   to_jsonb(v.numeric_value),true)
 FROM single_verified v WHERE b.id=v.id
 RETURNING b.scpi_slug
)
SELECT scpi_slug FROM patched;

-- Fail closed if the narrow repair or the source identity is incorrect.
DO $check$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.scpi_bulletins b
 JOIN public.scpi_indicators i ON i.scpi_slug=b.scpi_slug
 WHERE b.scpi_slug='corum-xl' AND b.period='2026-T2'
 AND (b.extraction_json->'metrics'->>'nombre_associes')::numeric=i.nombre_associes
 AND i.nombre_associes=54340 AND b.qa_status='candidate_page_checked_partial';
 IF n<>1 THEN RAISE EXCEPTION 'CORUM XL bulletin associates not matched or false full QA status'; END IF;
END $check$;

-- Eight quarter source packs, six CORE values each. A source pack is NOT a
-- complete certified financial bulletin, and cannot confer public release.
DO $gate$
DECLARE matched integer;total integer;
BEGIN
 WITH required AS (
  SELECT b.scpi_slug,b.period,b.source_url,b.pdf_sha256,b.extraction_json->'metrics' AS m,
   req.metric,req.display_field
  FROM public.scpi_bulletins b
  CROSS JOIN (VALUES
   ('distribution_brute_par_part','distribution_par_part'),
   ('nombre_associes','nombre_associes'),('nombre_parts','nombre_parts'),
   ('parts_attente_retrait','parts_attente_retrait'),
   ('prix_souscription','prix_souscription'),('tof','tof')
  ) req(metric,display_field)
  WHERE b.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND b.period IN ('2026-T1','2026-T2')
 ), evidence AS (
  SELECT r.* FROM required r
  JOIN maximus_agents.scpi_candidate_metric_evidence e
   ON e.scpi_slug=r.scpi_slug AND e.source_period=r.period AND e.metric=r.metric
   AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
   AND e.source_url=r.source_url AND e.source_page>0
   AND (r.m->>r.display_field)::numeric=e.numeric_value
  JOIN public.scpi_metric_certifications c ON c.scpi_slug=e.scpi_slug
   AND c.source_period=e.source_period AND c.metric=e.metric
   AND c.value_numeric=e.numeric_value AND c.source_url=e.source_url
   AND c.source_page=e.source_page AND c.verification_status IN
      ('manual_verified_official','ai_assisted_exact_primary_pdf_rechecked')
  WHERE EXISTS (
   SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation v
   WHERE v.scpi_slug=r.scpi_slug AND v.source_period=r.period
   AND v.document_kind='quarterly_bulletin' AND v.pdf_sha256=r.pdf_sha256
   AND v.source_url=r.source_url AND v.document_identity_verified
   AND e.source_page BETWEEN 1 AND v.page_count
  ) OR EXISTS (
   SELECT 1 FROM maximus_agents.scpi_ocr_pages o
   WHERE o.scpi_slug=r.scpi_slug AND o.source_period=r.period
   AND o.document_kind='quarterly_bulletin' AND o.pdf_sha256=r.pdf_sha256
   AND o.page_number=e.source_page
  )
 )
 SELECT (SELECT count(*) FROM required),(SELECT count(*) FROM evidence)
 INTO total,matched;
 IF total<>48 OR matched<>48
 THEN RAISE EXCEPTION 'CORUM 8 quarter PDFs six independently sourced core fields: %/%',matched,total;
 END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND (analysis_certified OR publication_authorized))
 THEN RAISE EXCEPTION 'Core 48/48 is NOT independent complete analysis approval'; END IF;
END $gate$;
