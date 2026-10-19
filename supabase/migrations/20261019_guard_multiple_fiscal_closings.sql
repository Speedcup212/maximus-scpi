-- Gardien des fonds avec plusieurs clôtures sociales la même année.
-- Empêche un CORE_HISTORY_VERIFIED fictif fondé sur une unique ligne
-- par année civile. Aucune métrique de fonds n'est modifiée.
BEGIN;
ALTER TABLE public.scpi_history_scope
  ADD COLUMN IF NOT EXISTS history_periodization_status text NOT NULL DEFAULT 'calendar_year_safe';
ALTER TABLE public.scpi_history_scope
  ADD COLUMN IF NOT EXISTS history_periodization_note text;
ALTER TABLE public.scpi_history_scope
  ADD CONSTRAINT scpi_history_periodization_valid CHECK (
    history_periodization_status IN ('calendar_year_safe','multiple_closings_unmodeled','multiple_closings_reconciled')
    AND (history_periodization_status <> 'multiple_closings_unmodeled'
      OR length(trim(coalesce(history_periodization_note,''))) >= 80)
  );
UPDATE public.scpi_history_scope SET
 history_periodization_status='multiple_closings_unmodeled',
 history_periodization_note='SCPI Transitions Europe : premier exercice social clos au 31/03/2023, deuxième exercice social clos au 31/12/2023. La série annuelle par année civile n en représente qu une seule; imposer le stockage des deux dates de clôture et de leurs trois mesures avant de certifier le noyau historique.',
 updated_at=now()
WHERE scpi_slug='transitions-europe';
CREATE OR REPLACE VIEW public.scpi_history_readiness_v1
WITH (security_invoker = true) AS
 WITH totals AS (
         SELECT i.scpi_slug,
            i.nom,
            COALESCE(s.first_fiscal_year, s.start_year, i.annee_creation) AS start_year,
            COALESCE(s.start_year_status,
                CASE
                    WHEN i.annee_creation IS NOT NULL THEN 'catalog_provisional'::text
                    ELSE 'missing'::text
                END) AS start_year_status,
            (coalesce(s.history_periodization_status,'calendar_year_safe') = 'multiple_closings_unmodeled') AS blocked_fiscal_closings,
            count(y.fiscal_year)::integer AS years_expected,
            count(y.fiscal_year) FILTER (WHERE y.all_three_verified)::integer AS years_fully_verified,
            count(y.fiscal_year) FILTER (WHERE y.all_three_documented)::integer AS years_documented,
            COALESCE(sum(y.metrics_verified), 0::bigint)::integer AS metrics_verified,
            COALESCE(sum(y.metrics_exception), 0::bigint)::integer AS exceptions_verified,
            COALESCE(sum(y.metrics_missing), 0::bigint)::integer AS metrics_missing
           FROM scpi_indicators i
             LEFT JOIN scpi_history_scope s USING (scpi_slug)
             LEFT JOIN scpi_history_year_audit_v1 y USING (scpi_slug)
          GROUP BY i.scpi_slug, i.nom, s.first_fiscal_year, s.start_year, s.start_year_status, s.history_periodization_status, i.annee_creation
        )
 SELECT scpi_slug,
    nom,
    start_year,
    start_year_status,
    years_expected,
    years_fully_verified,
    years_documented,
    metrics_verified,
    exceptions_verified,
    metrics_missing,
        CASE
            WHEN start_year IS NULL THEN 'BLOCKED_START_YEAR_UNKNOWN'::text
            WHEN start_year_status <> 'official_verified'::text THEN 'BLOCKED_START_YEAR_UNVERIFIED'::text
            WHEN blocked_fiscal_closings THEN 'BLOCKED_MULTIPLE_FISCAL_CLOSINGS'::text
            WHEN years_expected = 0 THEN 'NO_CLOSED_FINANCIAL_YEAR'::text
            WHEN years_fully_verified = years_expected THEN 'CORE_HISTORY_VERIFIED'::text
            WHEN years_documented = years_expected THEN 'CORE_HISTORY_WITH_EXCEPTIONS'::text
            WHEN metrics_verified = 0 THEN 'HISTORY_NOT_STARTED'::text
            ELSE 'HISTORY_INCOMPLETE'::text
        END AS historical_status,
    start_year_status = 'official_verified'::text AND years_expected > 0 AND years_fully_verified = years_expected AND NOT blocked_fiscal_closings AS core_historical_ready
   FROM totals;;
DO $check$
DECLARE t record;
BEGIN
 SELECT * INTO t FROM public.scpi_history_readiness_v1 WHERE scpi_slug='transitions-europe';
 IF t.historical_status<>'BLOCKED_MULTIPLE_FISCAL_CLOSINGS'
 OR t.core_historical_ready THEN
 RAISE EXCEPTION 'TRANSITIONS_FISCAL_PERIODIZATION_GUARD_FAILED: %',t.historical_status;
 END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_history_readiness_v1
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa','iroko-atlas')
 AND core_historical_ready IS DISTINCT FROM true)
 THEN RAISE EXCEPTION 'PERIODIZATION_GUARD_CAUSED_FINANCIAL_REGRESSION'; END IF;
END $check$;
COMMIT;
SELECT scpi_slug,start_year,years_expected,years_fully_verified,historical_status,core_historical_ready
FROM public.scpi_history_readiness_v1 WHERE scpi_slug IN ('iroko-atlas','transitions-europe','corum-origin')
ORDER BY scpi_slug;