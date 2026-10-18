-- Une création commerciale en 2024 ne signifie pas un exercice annuel clos 2024.
-- CORUM USA a son PREMIER exercice social de 15 mois clos le 31 décembre 2025.
-- La constitution/lancement 2024 est préservée, première année financière 2025.
BEGIN;
ALTER TABLE public.scpi_history_scope
 ADD COLUMN IF NOT EXISTS first_fiscal_year integer,
 ADD COLUMN IF NOT EXISTS first_fiscal_year_source_url text,
 ADD COLUMN IF NOT EXISTS first_fiscal_year_evidence text,
 ADD COLUMN IF NOT EXISTS first_fiscal_year_reviewed_at timestamptz;
ALTER TABLE public.scpi_history_scope
 ADD CONSTRAINT scpi_first_fiscal_year_documented CHECK (
 first_fiscal_year IS NULL OR (
 first_fiscal_year>=start_year
 AND first_fiscal_year<=start_year+3
 AND first_fiscal_year_source_url ~ '^https://'
 AND length(trim(first_fiscal_year_evidence))>=60
 AND first_fiscal_year_reviewed_at IS NOT NULL
 ));
UPDATE public.scpi_history_scope
SET first_fiscal_year=2025,
 first_fiscal_year_source_url='https://www.corum.fr/sites/default/files/2026-04/Rapport%20annuel%20CORUM%20USA%202025.pdf',
 first_fiscal_year_evidence='Premier exercice social de CORUM USA d une durée exceptionnelle de 15 mois, depuis constitution 2024 et clos au 31/12/2025. Source : rapport annuel 2025, résolutions approbation des comptes confirmées au registre légal.',
 first_fiscal_year_reviewed_at=now(),
 source_note='SCPI CORUM USA lancée en 2024; premier exercice ANNUEL officiel clos en 2025 (durée exceptionnelle de quinze mois). Pas de rapport annuel distinct 2024.',
 updated_at=now()
WHERE scpi_slug='corum-usa' AND start_year=2024
AND start_year_status='official_verified';
UPDATE public.scpi_annual_backfill_queue
SET status='not_applicable',updated_at=now()
WHERE scpi_slug='corum-usa' AND fiscal_year=2024 AND status='to_discover';
SET LOCAL search_path TO public;
CREATE OR REPLACE VIEW public.scpi_history_metric_audit_v1
WITH (security_invoker = true) AS
 WITH scope AS (
         SELECT i.scpi_slug,
            i.nom,
            COALESCE(s.first_fiscal_year, s.start_year, i.annee_creation) AS start_year,
            COALESCE(s.start_year_status,
                CASE
                    WHEN i.annee_creation IS NOT NULL THEN 'catalog_provisional'::text
                    ELSE 'missing'::text
                END) AS start_year_status
           FROM scpi_indicators i
             LEFT JOIN scpi_history_scope s USING (scpi_slug)
        ), periods AS (
         SELECT scope.scpi_slug,
            scope.nom,
            scope.start_year,
            scope.start_year_status,
            y.fiscal_year
           FROM scope
             CROSS JOIN LATERAL generate_series(scope.start_year, EXTRACT(year FROM CURRENT_DATE)::integer - 1) y(fiscal_year)
        ), metric_rows AS (
         SELECT p.scpi_slug,
            p.nom,
            p.start_year,
            p.start_year_status,
            p.fiscal_year,
            f.qa_status,
            f.source_confidence,
            f.source_url,
            r.id AS annual_report_id,
            r.qa_status AS annual_report_qa,
            m.metric,
            m.amount,
            f.evidence -> m.metric AS metric_evidence,
            e.kind AS exception_kind,
            ( SELECT count(*) AS count
                   FROM scpi_metric_certifications c
                  WHERE c.scpi_slug = p.scpi_slug AND c.source_period = (p.fiscal_year::text || '-RA'::text) AND c.value_numeric IS NOT NULL AND c.source_url ~ '^https://'::text AND c.source_page > 0 AND (c.verification_status = ANY (ARRAY['manual_verified_official'::text, 'official_issuer_statement_verified'::text])) AND (c.metric = m.metric OR m.metric = 'distribution_totale_par_part'::text AND c.metric = 'distribution_brute_par_part'::text)) AS legacy_evidence_count
           FROM periods p
             LEFT JOIN scpi_annual_fundamentals f ON f.scpi_slug = p.scpi_slug AND f.fiscal_year = p.fiscal_year
             LEFT JOIN scpi_annual_reports r ON r.scpi_slug = p.scpi_slug AND r.fiscal_year = p.fiscal_year
             CROSS JOIN LATERAL ( VALUES ('distribution_totale_par_part'::text,f.distribution_totale_par_part), ('valeur_realisation_par_part'::text,f.valeur_realisation_par_part), ('valeur_reconstitution_par_part'::text,f.valeur_reconstitution_par_part)) m(metric, amount)
             LEFT JOIN scpi_history_metric_exceptions e ON e.scpi_slug = p.scpi_slug AND e.fiscal_year = p.fiscal_year AND e.metric = m.metric
        )
 SELECT scpi_slug,
    nom,
    start_year,
    start_year_status,
    fiscal_year,
    metric,
    amount,
        CASE
            WHEN amount IS NOT NULL AND qa_status = 'manual_verified_official'::text AND COALESCE(source_confidence, 0::numeric) >= 0.95 AND source_url ~ '^https://'::text AND (metric_evidence ->> 'page'::text) ~ '^[0-9]+$'::text AND ((metric_evidence ->> 'page'::text)::integer) > 0 THEN 'verified_value'::text
            WHEN exception_kind IS NOT NULL AND amount IS NULL THEN 'documented_exception'::text
            WHEN amount IS NOT NULL THEN 'unverified_value'::text
            WHEN legacy_evidence_count > 0 THEN 'verified_elsewhere_not_reconciled'::text
            WHEN annual_report_id IS NOT NULL AND (annual_report_qa = ANY (ARRAY['source_verified'::text, 'source_verified_content'::text])) THEN 'report_found_metric_missing'::text
            WHEN annual_report_id IS NOT NULL THEN 'report_pending_qa'::text
            ELSE 'report_to_discover'::text
        END AS metric_status,
    source_url,
    metric_evidence,
    annual_report_id
   FROM metric_rows;;
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
            count(y.fiscal_year)::integer AS years_expected,
            count(y.fiscal_year) FILTER (WHERE y.all_three_verified)::integer AS years_fully_verified,
            count(y.fiscal_year) FILTER (WHERE y.all_three_documented)::integer AS years_documented,
            COALESCE(sum(y.metrics_verified), 0::bigint)::integer AS metrics_verified,
            COALESCE(sum(y.metrics_exception), 0::bigint)::integer AS exceptions_verified,
            COALESCE(sum(y.metrics_missing), 0::bigint)::integer AS metrics_missing
           FROM scpi_indicators i
             LEFT JOIN scpi_history_scope s USING (scpi_slug)
             LEFT JOIN scpi_history_year_audit_v1 y USING (scpi_slug)
          GROUP BY i.scpi_slug, i.nom, s.first_fiscal_year, s.start_year, s.start_year_status, i.annee_creation
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
            WHEN years_expected = 0 THEN 'NO_CLOSED_FINANCIAL_YEAR'::text
            WHEN years_fully_verified = years_expected THEN 'CORE_HISTORY_VERIFIED'::text
            WHEN years_documented = years_expected THEN 'CORE_HISTORY_WITH_EXCEPTIONS'::text
            WHEN metrics_verified = 0 THEN 'HISTORY_NOT_STARTED'::text
            ELSE 'HISTORY_INCOMPLETE'::text
        END AS historical_status,
    start_year_status = 'official_verified'::text AND years_expected > 0 AND years_fully_verified = years_expected AS core_historical_ready
   FROM totals;;
DO $check$
DECLARE r record;
BEGIN
 SELECT * INTO r FROM public.scpi_history_readiness_v1
 WHERE scpi_slug='corum-usa';
 IF r.years_expected<>1 OR r.years_fully_verified<>1
 OR r.historical_status<>'CORE_HISTORY_VERIFIED'
 THEN RAISE EXCEPTION 'CORUM_USA_FIRST_FISCAL_YEAR_MISMATCH: %, %, %',
  r.years_expected,r.years_fully_verified,r.historical_status; END IF;
END $check$;
COMMIT;