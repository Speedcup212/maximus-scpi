-- Contrôle indépendant et non destructif de la nouvelle chaîne historique.
-- Peut être lancé après chaque lot; ne modifie aucune donnée.
DO $audit$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.scpi_history_year_audit_v1
    WHERE metrics_expected<>3
       OR metrics_verified+metrics_exception+metrics_missing<>3
       OR (all_three_verified AND metrics_verified<>3)
       OR (all_three_documented AND metrics_missing<>0)
  ) THEN RAISE EXCEPTION 'HISTORY_QA: métriques annuelles ou compteurs incohérents'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_history_readiness_v1
    WHERE core_historical_ready AND (
        start_year_status<>'official_verified'
        OR years_expected<=0
        OR years_fully_verified<>years_expected
        OR metrics_missing<>0
        OR exceptions_verified<>0
    )
  ) THEN RAISE EXCEPTION 'HISTORY_QA: fausse certification historique'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_history_metric_audit_v1 a
    LEFT JOIN public.scpi_annual_fundamentals f
      ON f.scpi_slug=a.scpi_slug AND f.fiscal_year=a.fiscal_year
    WHERE a.metric_status='verified_value'
      AND (
        f.qa_status IS DISTINCT FROM 'manual_verified_official'
        OR coalesce(f.source_confidence,0)<0.95
        OR f.source_url !~ '^https://'
        OR a.amount IS NULL
        OR (a.metric_evidence->>'page') !~ '^[0-9]+$'
      )
  ) THEN RAISE EXCEPTION 'HISTORY_QA: donnée déclarée vérifiée sans preuve'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_history_metric_audit_v1
    WHERE metric_status='verified_elsewhere_not_reconciled' AND amount IS NOT NULL
  ) THEN RAISE EXCEPTION 'HISTORY_QA: fusion fictive depuis un autre registre'; END IF;
END $audit$;

SELECT scpi_slug,start_year,start_year_status,years_expected,
       years_fully_verified,metrics_verified,metrics_missing,historical_status
FROM public.scpi_history_readiness_v1
WHERE scpi_slug LIKE 'corum-%' ORDER BY scpi_slug;
