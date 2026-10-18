-- Historisation SCPI : une ligne annuelle/une file de travail ne prouve pas
-- la présence d'indicateurs financiers vérifiés. Aucun statut live modifié.
-- Nouveau standard MINIMAL : 3 séries annuelles (distribution brute,
-- réalisation et reconstitution), valeur + preuve par page + source.
-- "CORE_VERIFIED" ne signifie PAS certification intégrale de toute la SCPI.

CREATE TABLE IF NOT EXISTS public.scpi_history_scope (
  scpi_slug text PRIMARY KEY REFERENCES public.scpi_indicators(scpi_slug) ON DELETE CASCADE,
  start_year integer NOT NULL CHECK (start_year BETWEEN 1900 AND 2100),
  start_year_status text NOT NULL CHECK (
    start_year_status IN ('catalog_provisional', 'official_verified')
  ),
  source_url text,
  source_note text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scpi_history_scope_verified_evidence CHECK (
    start_year_status <> 'official_verified'
    OR (source_url ~ '^https://' AND reviewed_at IS NOT NULL
        AND length(trim(source_note)) >= 12)
  )
);
ALTER TABLE public.scpi_history_scope ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.scpi_history_scope FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.scpi_history_metric_exceptions (
  scpi_slug text NOT NULL REFERENCES public.scpi_indicators(scpi_slug) ON DELETE CASCADE,
  fiscal_year integer NOT NULL CHECK (fiscal_year BETWEEN 1900 AND 2100),
  metric text NOT NULL CHECK (
    metric IN ('distribution_totale_par_part',
      'valeur_realisation_par_part', 'valeur_reconstitution_par_part')
  ),
  kind text NOT NULL CHECK (kind IN ('official_not_reported', 'official_not_applicable')),
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  source_page integer NOT NULL CHECK (source_page > 0),
  evidence_text text NOT NULL CHECK (length(trim(evidence_text)) >= 30),
  reviewer text NOT NULL CHECK (length(trim(reviewer)) >= 3),
  reviewed_at timestamptz NOT NULL,
  PRIMARY KEY (scpi_slug,fiscal_year,metric)
);
ALTER TABLE public.scpi_history_metric_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.scpi_history_metric_exceptions FROM anon, authenticated;

CREATE OR REPLACE VIEW public.scpi_history_metric_audit_v1
WITH (security_invoker = true) AS
WITH scope AS (
  SELECT i.scpi_slug, i.nom,
    coalesce(s.start_year, i.annee_creation) AS start_year,
    coalesce(s.start_year_status,
      CASE WHEN i.annee_creation IS NOT NULL
           THEN 'catalog_provisional' ELSE 'missing' END) AS start_year_status
  FROM public.scpi_indicators i
  LEFT JOIN public.scpi_history_scope s USING(scpi_slug)
),
periods AS (
  SELECT scope.*,y.fiscal_year
  FROM scope
  CROSS JOIN LATERAL generate_series(
    scope.start_year,
    extract(year from current_date)::integer - 1
  ) y(fiscal_year)
),
metric_rows AS (
  SELECT p.*,f.qa_status,f.source_confidence,f.source_url,
    r.id AS annual_report_id, r.qa_status AS annual_report_qa,
    m.metric,m.amount,f.evidence -> m.metric AS metric_evidence,
    e.kind AS exception_kind,
    (
      SELECT count(*) FROM public.scpi_metric_certifications c
      WHERE c.scpi_slug=p.scpi_slug
        AND c.source_period=p.fiscal_year::text||'-RA'
        AND c.value_numeric IS NOT NULL
        AND c.source_url ~ '^https://'
        AND c.source_page > 0
        AND c.verification_status IN
            ('manual_verified_official','official_issuer_statement_verified')
        AND (c.metric=m.metric
             OR (m.metric='distribution_totale_par_part'
                 AND c.metric='distribution_brute_par_part'))
    ) AS legacy_evidence_count
  FROM periods p
  LEFT JOIN public.scpi_annual_fundamentals f
    ON f.scpi_slug=p.scpi_slug AND f.fiscal_year=p.fiscal_year
  LEFT JOIN public.scpi_annual_reports r
    ON r.scpi_slug=p.scpi_slug AND r.fiscal_year=p.fiscal_year
  CROSS JOIN LATERAL (VALUES
    ('distribution_totale_par_part',f.distribution_totale_par_part),
    ('valeur_realisation_par_part',f.valeur_realisation_par_part),
    ('valeur_reconstitution_par_part',f.valeur_reconstitution_par_part)
  ) m(metric,amount)
  LEFT JOIN public.scpi_history_metric_exceptions e
    ON e.scpi_slug=p.scpi_slug
   AND e.fiscal_year=p.fiscal_year AND e.metric=m.metric
)
SELECT scpi_slug,nom,start_year,start_year_status,fiscal_year,metric,amount,
  CASE
    WHEN amount IS NOT NULL
      AND qa_status='manual_verified_official'
      AND coalesce(source_confidence,0)>=0.95
      AND source_url ~ '^https://'
      AND (metric_evidence->>'page') ~ '^[0-9]+$'
      AND (metric_evidence->>'page')::integer > 0
      THEN 'verified_value'
    WHEN exception_kind IS NOT NULL AND amount IS NULL
      THEN 'documented_exception'
    WHEN amount IS NOT NULL
      THEN 'unverified_value'
    WHEN legacy_evidence_count>0
      THEN 'verified_elsewhere_not_reconciled'
    WHEN annual_report_id IS NOT NULL AND
      annual_report_qa IN ('source_verified','source_verified_content')
      THEN 'report_found_metric_missing'
    WHEN annual_report_id IS NOT NULL
      THEN 'report_pending_qa'
    ELSE 'report_to_discover'
  END AS metric_status,
  source_url,metric_evidence,annual_report_id
FROM metric_rows;

CREATE OR REPLACE VIEW public.scpi_history_year_audit_v1
WITH (security_invoker = true) AS
SELECT scpi_slug,nom,start_year,start_year_status,fiscal_year,
  count(*)::integer AS metrics_expected,
  count(*) FILTER (WHERE metric_status='verified_value')::integer AS metrics_verified,
  count(*) FILTER (WHERE metric_status='documented_exception')::integer AS metrics_exception,
  count(*) FILTER (WHERE metric_status NOT IN
      ('verified_value','documented_exception'))::integer AS metrics_missing,
  bool_and(metric_status='verified_value') AS all_three_verified,
  bool_and(metric_status IN ('verified_value','documented_exception')) AS all_three_documented,
  jsonb_object_agg(metric,metric_status) AS metric_statuses
FROM public.scpi_history_metric_audit_v1
GROUP BY scpi_slug,nom,start_year,start_year_status,fiscal_year;

CREATE OR REPLACE VIEW public.scpi_history_readiness_v1
WITH (security_invoker = true) AS
WITH totals AS (
 SELECT i.scpi_slug,i.nom,
   coalesce(s.start_year,i.annee_creation) AS start_year,
   coalesce(s.start_year_status,
     CASE WHEN i.annee_creation IS NOT NULL THEN 'catalog_provisional' ELSE 'missing' END
   ) AS start_year_status,
   count(y.fiscal_year)::integer AS years_expected,
   count(y.fiscal_year) FILTER (WHERE y.all_three_verified)::integer AS years_fully_verified,
   count(y.fiscal_year) FILTER (WHERE y.all_three_documented)::integer AS years_documented,
   coalesce(sum(y.metrics_verified),0)::integer AS metrics_verified,
   coalesce(sum(y.metrics_exception),0)::integer AS exceptions_verified,
   coalesce(sum(y.metrics_missing),0)::integer AS metrics_missing
 FROM public.scpi_indicators i
 LEFT JOIN public.scpi_history_scope s USING(scpi_slug)
 LEFT JOIN public.scpi_history_year_audit_v1 y USING(scpi_slug)
 GROUP BY i.scpi_slug,i.nom,s.start_year,s.start_year_status,i.annee_creation
)
SELECT *,
 CASE
  WHEN start_year IS NULL THEN 'BLOCKED_START_YEAR_UNKNOWN'
  WHEN start_year_status<>'official_verified' THEN 'BLOCKED_START_YEAR_UNVERIFIED'
  WHEN years_expected=0 THEN 'NO_CLOSED_FINANCIAL_YEAR'
  WHEN years_fully_verified=years_expected THEN 'CORE_HISTORY_VERIFIED'
  WHEN years_documented=years_expected THEN 'CORE_HISTORY_WITH_EXCEPTIONS'
  WHEN metrics_verified=0 THEN 'HISTORY_NOT_STARTED'
  ELSE 'HISTORY_INCOMPLETE'
 END AS historical_status,
 (start_year_status='official_verified'
  AND years_expected>0 AND years_fully_verified=years_expected) AS core_historical_ready
FROM totals;

-- Seul un contrôle des séries FINANCIÈRES, pas un compteur de documents,
-- peut produire core_historical_ready. Aucune écriture sur les statuts
-- de publication, certificats courants ou valeurs historiques existantes.
REVOKE ALL ON public.scpi_history_metric_audit_v1 FROM anon,authenticated;
REVOKE ALL ON public.scpi_history_year_audit_v1 FROM anon,authenticated;
REVOKE ALL ON public.scpi_history_readiness_v1 FROM anon,authenticated;
GRANT SELECT ON public.scpi_history_metric_audit_v1 TO service_role;
GRANT SELECT ON public.scpi_history_year_audit_v1 TO service_role;
GRANT SELECT ON public.scpi_history_readiness_v1 TO service_role;
GRANT SELECT ON public.scpi_history_scope TO service_role;
GRANT SELECT ON public.scpi_history_metric_exceptions TO service_role;
