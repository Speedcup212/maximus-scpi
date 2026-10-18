-- Lot CORUM archive multi-années, aucun écrasement de valeurs certifiées.
-- Sources : rapports CORUM Origin 2021/2022 et CORUM XL 2017/2021, colonnes distinctes.
BEGIN;
CREATE TEMP TABLE _archive (
 scpi_slug text,fiscal_year integer,gross_distribution numeric,realisation numeric,
 reconstitution numeric,div_page int,valuation_page int,report_year int,
 source_url text,distribution_basis text
) ON COMMIT DROP;
INSERT INTO _archive VALUES ('corum-origin',2020,65.4,919.75,1117.1,17,17,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20Origin%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution'),
('corum-origin',2021,76.62,962.66,1177.43,17,17,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20Origin%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution'),
('corum-origin',2022,75.01,956.28,1171.9,19,24,2022,'https://www.corum.fr/sites/default/files/2023-04/CORUM%20Origin%20-%20Rapport%20Annuel%202022..pdf','gross_annual_distribution'),
('corum-xl',2017,9.13,159.36,192.17,31,31,2017,'https://www.corum.fr/sites/default/files/2019-04/CORUM%20XL%20-%20Rapport%20Annuel%202017.pdf','gross_dividend_inception_partial_year'),
('corum-xl',2018,14.85,157.9,191.28,16,16,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20XL%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution'),
('corum-xl',2019,11.83,163.71,197.36,16,16,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20XL%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution'),
('corum-xl',2020,10.69,153.11,188.85,16,16,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20XL%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution'),
('corum-xl',2021,11.03,163.63,199.25,16,16,2021,'https://www.corum.fr/sites/default/files/2022-03/CORUM%20XL%20-%20Rapport%20annuel%202021.pdf','gross_annual_distribution');
DO $guard$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n FROM _archive;
 IF n<>8 THEN RAISE EXCEPTION 'CORUM_ARCHIVE_COUNT %',n; END IF;
 IF EXISTS (SELECT 1 FROM _archive t
 WHERE t.source_url !~ '^https://www.corum.fr/' OR t.div_page<1
 OR t.valuation_page<1 OR t.fiscal_year>t.report_year OR t.fiscal_year<2012)
 THEN RAISE EXCEPTION 'CORUM_ARCHIVE_PROVENANCE_BAD'; END IF;
 IF EXISTS (SELECT 1 FROM public.scpi_annual_fundamentals f JOIN _archive a
  ON a.scpi_slug=f.scpi_slug AND a.fiscal_year=f.fiscal_year
  WHERE f.distribution_totale_par_part IS DISTINCT FROM a.gross_distribution
   OR f.valeur_realisation_par_part IS DISTINCT FROM a.realisation
   OR f.valeur_reconstitution_par_part IS DISTINCT FROM a.reconstitution
   OR f.qa_status IS DISTINCT FROM 'manual_verified_official')
 THEN RAISE EXCEPTION 'CORUM_ARCHIVE_EXISTING_VALUES_DISAGREE'; END IF;
END $guard$;
INSERT INTO public.scpi_annual_reports (
 scpi_slug,fiscal_year,source_url,source_document,qa_status,found_at,processed_at)
SELECT a.scpi_slug,a.fiscal_year,a.source_url,
 'Rapport annuel CORUM '||a.report_year||' / colonne exercice '||a.fiscal_year,
 'source_verified_content',now(),now()
FROM _archive a
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;
INSERT INTO public.scpi_annual_fundamentals (
 scpi_slug,fiscal_year,distribution_totale_par_part,valeur_realisation_par_part,
 valeur_reconstitution_par_part,source_url,source_document,source_report_id,
 qa_status,source_confidence,evidence)
SELECT a.scpi_slug,a.fiscal_year,a.gross_distribution,a.realisation,a.reconstitution,
 a.source_url,'Rapport annuel officiel '||a.report_year||', colonne '||a.fiscal_year,
 r.id,'manual_verified_official',0.99,
 jsonb_build_object(
 'distribution_totale_par_part',jsonb_build_object(
  'page',a.div_page,'value',a.gross_distribution,'source_report_year',a.report_year,
  'fiscal_year_column',a.fiscal_year,'basis',a.distribution_basis,
  'text',CASE WHEN a.fiscal_year=2017 AND a.scpi_slug='corum-xl'
         THEN 'Premier exercice d’activité : dividende brut 9,13 EUR/part réellement publié ; le taux de distribution de 6,58 % est annualisé, pas cette valeur en EUR.'
         ELSE 'Dividende brut publié pour la colonne de l exercice '||a.fiscal_year END),
 'valeur_realisation_par_part',jsonb_build_object(
  'page',a.valuation_page,'value',a.realisation,'source_report_year',a.report_year,
  'fiscal_year_column',a.fiscal_year,'reference_date',a.fiscal_year||'-12-31',
  'text','Valeur par part arrêtée au 31 décembre de l exercice indiqué'),
 'valeur_reconstitution_par_part',jsonb_build_object(
  'page',a.valuation_page,'value',a.reconstitution,'source_report_year',a.report_year,
  'fiscal_year_column',a.fiscal_year,'reference_date',a.fiscal_year||'-12-31',
  'text','Valeur de reconstitution de l exercice indiqué, et non du T2 suivant')
 )
FROM _archive a JOIN public.scpi_annual_reports r
 ON r.scpi_slug=a.scpi_slug AND r.fiscal_year=a.fiscal_year
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;
UPDATE public.scpi_annual_backfill_queue q
SET status='extracted',updated_at=now()
FROM _archive a WHERE q.scpi_slug=a.scpi_slug AND q.fiscal_year=a.fiscal_year
 AND q.status<>'extracted' AND EXISTS (
 SELECT 1 FROM public.scpi_history_year_audit_v1 h
 WHERE h.scpi_slug=q.scpi_slug AND h.fiscal_year=q.fiscal_year AND h.all_three_verified
);
DO $verify$
DECLARE count_good integer;
BEGIN
 SELECT count(*) INTO count_good
 FROM _archive a JOIN public.scpi_history_year_audit_v1 h
 ON h.scpi_slug=a.scpi_slug AND h.fiscal_year=a.fiscal_year
 WHERE h.all_three_verified;
 IF count_good<>8 THEN RAISE EXCEPTION 'CORUM_ARCHIVE_NOT_COMPLETE %/8',count_good; END IF;
END $verify$;
COMMIT;
SELECT scpi_slug,fiscal_year,metrics_verified,all_three_verified
FROM public.scpi_history_year_audit_v1
WHERE (scpi_slug='corum-origin' AND fiscal_year BETWEEN 2020 AND 2022)
 OR (scpi_slug='corum-xl' AND fiscal_year BETWEEN 2017 AND 2021)
ORDER BY scpi_slug,fiscal_year;
