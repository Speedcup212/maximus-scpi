-- Link the 69 independently page-verified private CORUM metrics into the
-- EXISTING public.scpi_metric_certifications schema used by all 61 SCPI.
-- No candidate can be read by anon because RLS calls maximus_scpi_is_in_public_cohort;
-- no catalog membership, analysis certification, final QA or release is granted.
-- Preserve exact source URL, source page, numeric precision and review evidence.
DO $safe$
DECLARE n integer;
BEGIN
 IF EXISTS (SELECT 1 FROM maximus_agents.scpi_universe u
   WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND (u.lifecycle<>'candidate' OR u.publication_authorized OR u.analysis_certified))
 THEN RAISE EXCEPTION 'CORUM release hold missing: refuse certification mirror'; END IF;

 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_metric_evidence e
 WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
   AND e.numeric_value IS NOT NULL AND e.source_page>0
   AND length(trim(coalesce(e.evidence_text,'')))>0
   AND e.source_url LIKE 'https://www.corum.fr/%'
   AND (
     EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation v
       WHERE v.scpi_slug=e.scpi_slug AND v.source_period=e.source_period
         AND v.document_kind=e.document_kind AND v.source_url=e.source_url
         AND v.document_identity_verified
         AND v.pdf_sha256 ~ '^[0-9a-f]{64}$'
         AND e.source_page BETWEEN 1 AND v.page_count)
     OR EXISTS (SELECT 1 FROM public.scpi_bulletins b
         JOIN maximus_agents.scpi_ocr_pages p ON p.scpi_slug=b.scpi_slug
            AND p.source_period=b.period AND p.document_kind='quarterly_bulletin'
            AND p.page_number=e.source_page AND p.pdf_sha256=b.pdf_sha256
       WHERE b.scpi_slug=e.scpi_slug AND b.period=e.source_period
         AND b.source_url=e.source_url
         AND b.pdf_sha256 ~ '^[0-9a-f]{64}$')
   );
 IF n<>69 THEN RAISE EXCEPTION 'Only % of 69 proofs have official identity + page + numeric QA; stop',n; END IF;
END
$safe$;

WITH eligible AS (
 SELECT e.*
 FROM maximus_agents.scpi_candidate_metric_evidence e
 WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
   AND e.numeric_value IS NOT NULL AND e.source_page>0
   AND length(trim(coalesce(e.evidence_text,'')))>0
   AND e.source_url LIKE 'https://www.corum.fr/%'
   AND (
     EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation v
       WHERE v.scpi_slug=e.scpi_slug AND v.source_period=e.source_period
         AND v.document_kind=e.document_kind AND v.source_url=e.source_url
         AND v.document_identity_verified
         AND v.pdf_sha256 ~ '^[0-9a-f]{64}$'
         AND e.source_page BETWEEN 1 AND v.page_count)
     OR EXISTS (SELECT 1 FROM public.scpi_bulletins b
         JOIN maximus_agents.scpi_ocr_pages p ON p.scpi_slug=b.scpi_slug
           AND p.source_period=b.period AND p.document_kind='quarterly_bulletin'
           AND p.page_number=e.source_page AND p.pdf_sha256=b.pdf_sha256
       WHERE b.scpi_slug=e.scpi_slug AND b.period=e.source_period
         AND b.source_url=e.source_url AND b.pdf_sha256 ~ '^[0-9a-f]{64}$')
   )
)
INSERT INTO public.scpi_metric_certifications
(scpi_slug,source_period,metric,value_numeric,value_text,unit,
 source_url,source_page,evidence_text,bulletin_id,verification_status,
 verification_method,extraction_confidence,verified_at)
SELECT e.scpi_slug,e.source_period,e.metric,e.numeric_value,NULL,e.unit,
 e.source_url,e.source_page,
 e.evidence_text||' | Source certifiée distincte : document_kind='||e.document_kind
   ||'; value_basis='||coalesce(e.value_basis,'non_specifie')
   ||'; vérification indépendante='||e.independently_reviewed_by||'.',
 b.id,'manual_verified_official',
 'independent_private_qa_official_pdf_exact_page_to_shared_model_20261016',
 1,e.independently_reviewed_at
FROM eligible e
LEFT JOIN LATERAL (
 SELECT x.id FROM public.scpi_bulletins x
 WHERE e.document_kind='quarterly_bulletin' AND x.scpi_slug=e.scpi_slug
   AND x.period=e.source_period AND x.source_url=e.source_url
 ORDER BY x.found_at DESC LIMIT 1
) b ON TRUE
ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;

DO $safe$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.scpi_metric_certifications
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND verification_method='independent_private_qa_official_pdf_exact_page_to_shared_model_20261016'
 AND verification_status='manual_verified_official' AND source_page>0;
 IF n<>69 THEN RAISE EXCEPTION 'Incomplete verified CORUM source bridge: %/69',n; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe WHERE
 scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND publication_authorized) THEN RAISE EXCEPTION 'candidate public publication unexpectedly enabled'; END IF;
END
$safe$;
