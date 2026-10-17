-- Source-period fidelity for the two annual fields embedded in a 2026-T2 snapshot.
-- Existing 61 public SCPI rows are not modified. 2025-RA values are recorded
-- only when they reconcile with independently page-certified issuer reports.
-- Period metadata is optional and must NEVER be inferred from the quarterly row date.
ALTER TABLE public.scpi_indicators
 ADD COLUMN IF NOT EXISTS td_reference_period text,
 ADD COLUMN IF NOT EXISTS debt_reference_period text,
 ADD COLUMN IF NOT EXISTS td_reference_url text,
 ADD COLUMN IF NOT EXISTS debt_reference_url text;

DO $corum_annual$
DECLARE updated_count integer;
BEGIN
  IF EXISTS(
    SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND (u.lifecycle<>'candidate' OR u.publication_authorized OR u.analysis_certified)
  ) THEN RAISE EXCEPTION 'The target fund is not an unpublished private candidate'; END IF;

  WITH annual AS (
    SELECT i.scpi_slug,td.value_numeric AS annual_td,debt.value_numeric AS annual_debt,
      td.source_url AS td_source_url,debt.source_url AS debt_source_url
    FROM public.scpi_indicators i
    JOIN public.scpi_metric_certifications td ON td.scpi_slug=i.scpi_slug
      AND td.metric='taux_distribution' AND td.source_period='2025-RA'
      AND td.verification_status='manual_verified_official' AND td.source_page>0
      AND td.value_numeric=i.td
    JOIN public.scpi_metric_certifications debt ON debt.scpi_slug=i.scpi_slug
      AND debt.metric='endettement_pct' AND debt.source_period='2025-RA'
      AND debt.verification_status='manual_verified_official' AND debt.source_page>0
      AND debt.value_numeric=i.endettement
    WHERE i.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND i.source_period='2026-T2' AND i.ra_source_period='2025-RA'
      AND td.source_url LIKE 'https://www.corum.fr/sites/default/files/%'
      AND debt.source_url LIKE 'https://www.corum.fr/sites/default/files/%'
      AND td.source_url=debt.source_url
      AND (i.td_reference_period IS NULL OR i.td_reference_period='2025-RA')
      AND (i.debt_reference_period IS NULL OR i.debt_reference_period='2025-RA')
      AND (i.td_reference_url IS NULL OR i.td_reference_url=td.source_url)
      AND (i.debt_reference_url IS NULL OR i.debt_reference_url=debt.source_url)
  )
  UPDATE public.scpi_indicators i
    SET td_reference_period='2025-RA',
        debt_reference_period='2025-RA',
        td_reference_url=a.td_source_url,
        debt_reference_url=a.debt_source_url
  FROM annual a WHERE i.scpi_slug=a.scpi_slug AND i.source_period='2026-T2';
  GET DIAGNOSTICS updated_count=ROW_COUNT;
  IF updated_count<>4
    THEN RAISE EXCEPTION 'Annual reporting metadata not exactly verified for four candidates: %',updated_count;
  END IF;

  IF EXISTS(
    SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
    WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND final_release_ready
  ) THEN RAISE EXCEPTION 'Financial source labeling cannot authorize public release'; END IF;
END $corum_annual$;
