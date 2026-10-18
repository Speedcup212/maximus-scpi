-- Reconciliation idempotente, sans téléchargement, des 12 preuves officielles
-- CORUM 2025-RA déjà conservées dans scpi_metric_certifications.
-- Ne jamais reprendre la valeur de reconstitution 2026-T2 comme valeur 2025.
BEGIN;
DO $check$
DECLARE n integer; bad integer;
BEGIN
 SELECT count(*) INTO n FROM (
  SELECT c.scpi_slug
  FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
    AND c.source_period='2025-RA'
    AND c.metric IN ('distribution_brute_par_part','valeur_realisation_par_part',
                     'valeur_reconstitution_par_part')
    AND c.value_numeric IS NOT NULL AND c.source_page>0 AND c.source_url ~ '^https://'
    AND c.verification_status IN
     ('manual_verified_official','official_issuer_statement_verified')
  GROUP BY c.scpi_slug
  HAVING count(DISTINCT c.metric)=3 AND count(DISTINCT c.source_url)=1
 ) x;
 IF n<>4 THEN RAISE EXCEPTION 'CORUM_2025_RECONCILIATION_BLOCKED: expected 4 complete verified sets, got %',n; END IF;

 SELECT count(*) INTO bad FROM public.scpi_annual_fundamentals
 WHERE fiscal_year=2025 AND scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa');
 IF bad>0 THEN RAISE EXCEPTION 'Existing 2025 annual rows must be reconciled separately, not overwritten'; END IF;
END $check$;

WITH src AS (
 SELECT c.scpi_slug, max(c.source_url) AS source_url,
        substring(max(c.evidence_text) FILTER (
          WHERE c.metric='valeur_reconstitution_par_part')
          from 'SHA256=([0-9a-f]{64})') AS pdf_sha
 FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
   AND c.source_period='2025-RA'
   AND c.metric IN ('distribution_brute_par_part','valeur_realisation_par_part',
                    'valeur_reconstitution_par_part')
 GROUP BY c.scpi_slug
)
INSERT INTO public.scpi_annual_reports (
 scpi_slug,fiscal_year,source_url,source_document,source_sha256,
 qa_status,found_at,processed_at
)
SELECT src.scpi_slug,2025,src.source_url,
       i.nom||' - Rapport annuel 2025',src.pdf_sha,
       'source_verified_content',now(),now()
FROM src JOIN public.scpi_indicators i USING(scpi_slug)
WHERE src.pdf_sha ~ '^[0-9a-f]{64}$'
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;

WITH proofs AS (
 SELECT c.scpi_slug,
   CASE WHEN c.metric='distribution_brute_par_part'
        THEN 'distribution_totale_par_part' ELSE c.metric END AS metric,
   c.value_numeric,c.source_page,c.source_url,c.evidence_text,
   c.verification_status
 FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND c.source_period='2025-RA'
 AND c.metric IN ('distribution_brute_par_part','valeur_realisation_par_part',
                  'valeur_reconstitution_par_part')
), pivoted AS (
 SELECT scpi_slug,
   max(value_numeric) FILTER(WHERE metric='distribution_totale_par_part') AS distribution,
   max(value_numeric) FILTER(WHERE metric='valeur_realisation_par_part') AS realisation,
   max(value_numeric) FILTER(WHERE metric='valeur_reconstitution_par_part') AS reconstitution,
   jsonb_object_agg(metric,jsonb_build_object(
     'page',source_page,'value',value_numeric,
     'method','verified_metric_registry_reconciliation',
     'text',evidence_text,'basis',
      CASE WHEN metric='distribution_totale_par_part' THEN 'gross_annual_distribution'
           ELSE 'annual_year_end_per_part' END,
     'source_verification',verification_status)) AS annual_evidence
 FROM proofs GROUP BY scpi_slug
)
INSERT INTO public.scpi_annual_fundamentals (
 scpi_slug,fiscal_year,distribution_totale_par_part,
 valeur_realisation_par_part,valeur_reconstitution_par_part,
 source_url,source_document,source_report_id,qa_status,
 source_confidence,evidence
)
SELECT pivoted.scpi_slug,2025,pivoted.distribution,pivoted.realisation,
 pivoted.reconstitution,r.source_url,r.source_document,r.id,
 'manual_verified_official',0.99,pivoted.annual_evidence
FROM pivoted JOIN public.scpi_annual_reports r
 ON r.scpi_slug=pivoted.scpi_slug AND r.fiscal_year=2025
WHERE pivoted.distribution IS NOT NULL
AND pivoted.realisation IS NOT NULL
AND pivoted.reconstitution IS NOT NULL
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;

UPDATE public.scpi_annual_backfill_queue q
SET status='extracted',updated_at=now()
WHERE q.scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND q.fiscal_year=2025
 AND EXISTS (
 SELECT 1 FROM public.scpi_history_year_audit_v1 y
 WHERE y.scpi_slug=q.scpi_slug AND y.fiscal_year=2025
   AND y.all_three_verified
);

COMMIT;

SELECT scpi_slug,fiscal_year,metrics_verified,metrics_missing,metric_statuses
FROM public.scpi_history_year_audit_v1
WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
  AND fiscal_year=2025 ORDER BY scpi_slug;
