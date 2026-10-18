-- Test de certification du noyau historique (3 séries annuelles seulement)
-- CORUM USA premier exercice clos 2025 malgré création 2024.
DO $qa$
DECLARE verified_funds integer; annual_periods integer; metrics integer; incomplete integer;
BEGIN
 SELECT count(*) INTO verified_funds
 FROM public.scpi_history_readiness_v1
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND core_historical_ready
 AND historical_status='CORE_HISTORY_VERIFIED';
 IF verified_funds<>4 THEN RAISE EXCEPTION 'FOUR_CORUM_CORE_NOT_VERIFIED_%',verified_funds; END IF;
 SELECT count(*) INTO annual_periods
 FROM public.scpi_history_year_audit_v1
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa') AND all_three_verified;
 IF annual_periods<>30 THEN RAISE EXCEPTION 'EXPECTED_30_ANNUAL_PERIODS_FOUND_%',annual_periods; END IF;
 SELECT count(*) INTO metrics
 FROM public.scpi_history_metric_audit_v1
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND metric_status='verified_value';
 IF metrics<>90 THEN RAISE EXCEPTION 'EXPECTED_90_VERIFIED_METRICS_FOUND_%',metrics; END IF;
 SELECT count(*) INTO incomplete
 FROM public.scpi_annual_backfill_queue
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND status='to_discover';
 IF incomplete<>0 THEN RAISE EXCEPTION 'CORUM_BACKFILL_QUEUE_UNFINISHED_%',incomplete; END IF;
 IF EXISTS(
  SELECT 1 FROM public.scpi_annual_fundamentals
  WHERE scpi_slug='corum-usa' AND fiscal_year=2024
 ) THEN RAISE EXCEPTION 'CORUM_USA_2024_SHOULD_NOT_BE_AN_ANNUAL_REPORT'; END IF;
 IF NOT EXISTS(
  SELECT 1 FROM public.scpi_annual_fundamentals f
  WHERE f.scpi_slug='corum-origin' AND f.fiscal_year=2019
  AND f.distribution_totale_par_part=67.88
  AND f.evidence->'distribution_totale_par_part'->>'editorial_discrepancy_eur_per_share'='67.53'
  AND length(f.evidence->'distribution_totale_par_part'->>'arbitration')>80
 ) THEN RAISE EXCEPTION 'ORIGIN_2019_FINANCIAL_ARBITRATION_NOT_DOCUMENTED'; END IF;
END $qa$;
SELECT scpi_slug,years_expected,years_fully_verified,metrics_verified,metrics_missing,historical_status
FROM public.scpi_history_readiness_v1
WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa') ORDER BY scpi_slug;