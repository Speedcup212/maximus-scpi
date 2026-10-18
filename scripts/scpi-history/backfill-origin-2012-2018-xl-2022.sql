-- Suite de la reprise : 2012–2018 CORUM Origin + 2022 CORUM XL.
-- Ne pas substituer les "dividendes comptables par part" aux distributions brutes
-- pour un associé en jouissance au premier jour de l'exercice.
BEGIN;
CREATE TEMP TABLE _corum_history_source (
 scpi_slug text, fiscal_year integer, distribution numeric, realisation numeric,
 reconstitution numeric, report_year integer, page_distribution integer,
 page_valuation integer, source_url text, distribution_basis text, source_note text
) ON COMMIT DROP;
INSERT INTO _corum_history_source VALUES
('corum-origin',2012,40.05,863.34,1029.03,2013,14,19,'https://www.corum.fr/sites/default/files/2020-07/CorumAM%20Convictions%20-%20Rapport%20annuel%202013.pdf','gross_actual_first_partial_year_8_months','Exercice de lancement limité à huit mois; dividende brut effectivement déclaré, aucune annualisation des euros.'),
('corum-origin',2013,63.84,867.95,1031.83,2013,14,19,'https://www.corum.fr/sites/default/files/2020-07/CorumAM%20Convictions%20-%20Rapport%20annuel%202013.pdf','gross_annual_distribution','Rapport 2013, tableau annuel et rapport 2014 concordants, pas le graphique secondaire arrondi.'),
('corum-origin',2014,64.77,874.67,1072.24,2014,15,18,'https://www.corum.fr/sites/default/files/2020-07/CorumAM%20Convictions%20-%20Rapport%20annuel%202014.pdf','gross_annual_distribution','Rapport 2014, dividende brut versé dans le tableau pluriannuel et valeurs de la société au 31/12/2014.'),
('corum-origin',2015,65.49,895.29,1087.77,2016,16,19,'https://www.corum.fr/sites/default/files/2020-07/Rapport%20Annuel%20CORUM_2016.pdf','gross_annual_distribution','Rapport 2016, colonnes comparatives 2015 de dividende brut et de valorisation, dates distinctes.'),
('corum-origin',2016,66.39,899.14,1092.77,2016,16,19,'https://www.corum.fr/sites/default/files/2020-07/Rapport%20Annuel%20CORUM_2016.pdf','gross_annual_distribution','Rapport 2016, colonne 2016, confirmation par résolutions 2016.'),
('corum-origin',2017,68.35,900.08,1108.67,2018,30,31,'https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Rapport%20Annuel%202018.pdf','gross_annual_distribution','Rapport 2018, colonne 2017, dividende brut payé pour une part en jouissance au 01/01.'),
('corum-origin',2018,77.68,934.38,1126.77,2018,8,31,'https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Rapport%20Annuel%202018.pdf','gross_annual_distribution','Dividende brut annuel publié page 9, différent du dividende comptable 78,46 EUR; valeurs 2018 arrêtées au 31 décembre.'),
('corum-xl',2022,11.28,155.55,189.93,2022,7,22,'https://www.corum.fr/sites/default/files/2023-03/CORUM%20XL%20-%20Rapport%20annuel%202022.pdf','gross_annual_distribution','2022: dividende brut pour une part en jouissance au 01/01, différent du dividende comptable 11,39 EUR. Valeurs au 31/12.');
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM _corum_history_source;
 IF n<>8 THEN RAISE EXCEPTION 'CORUM_EXPECTED_8_FOUND_%',n; END IF;
 IF EXISTS(SELECT 1 FROM _corum_history_source WHERE page_distribution<1
  OR page_valuation<1 OR source_url !~ '^https://www.corum.fr/'
  OR fiscal_year>report_year OR distribution<=0 OR realisation<=0 OR reconstitution<=0)
 THEN RAISE EXCEPTION 'INVALID_YEAR_PAGE_VALUE_SOURCE'; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_annual_fundamentals f
 JOIN _corum_history_source t USING (scpi_slug,fiscal_year)
 WHERE f.qa_status IS DISTINCT FROM 'manual_verified_official'
 OR f.distribution_totale_par_part IS DISTINCT FROM t.distribution
 OR f.valeur_realisation_par_part IS DISTINCT FROM t.realisation
 OR f.valeur_reconstitution_par_part IS DISTINCT FROM t.reconstitution)
 THEN RAISE EXCEPTION 'CONFLICT_WITH_EXISTING_CERTIFIED_ANNUAL_FUNDAMENTALS'; END IF;
END $$;
INSERT INTO public.scpi_annual_reports
 (scpi_slug,fiscal_year,source_url,source_document,qa_status,found_at,processed_at)
SELECT scpi_slug,fiscal_year,source_url,'Rapport officiel CORUM '||report_year||' / colonne '||fiscal_year,
 'source_verified_content',now(),now()
FROM _corum_history_source
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
INSERT INTO public.scpi_annual_fundamentals
 (scpi_slug,fiscal_year,distribution_totale_par_part,
 valeur_realisation_par_part,valeur_reconstitution_par_part,source_url,source_document,
 source_report_id,qa_status,source_confidence,evidence)
SELECT t.scpi_slug,t.fiscal_year,t.distribution,t.realisation,t.reconstitution,
 t.source_url,'Rapport annuel officiel CORUM '||t.report_year||' / exercice '||t.fiscal_year,
 r.id,'manual_verified_official',0.99,
 jsonb_build_object(
 'distribution_totale_par_part',jsonb_build_object(
 'page',t.page_distribution,'value',t.distribution,'source_report_year',t.report_year,
 'fiscal_year_column',t.fiscal_year,'unit','EUR/part','basis',t.distribution_basis,
 'text',t.source_note),
 'valeur_realisation_par_part',jsonb_build_object(
 'page',t.page_valuation,'value',t.realisation,'source_report_year',t.report_year,
 'fiscal_year_column',t.fiscal_year,'unit','EUR/part',
 'reference_date',t.fiscal_year||'-12-31','text','Valeur par part arrêtée au 31 décembre de l exercice '||t.fiscal_year),
 'valeur_reconstitution_par_part',jsonb_build_object(
 'page',t.page_valuation,'value',t.reconstitution,'source_report_year',t.report_year,
 'fiscal_year_column',t.fiscal_year,'unit','EUR/part',
 'reference_date',t.fiscal_year||'-12-31','text','Valeur par part arrêtée au 31 décembre de l exercice '||t.fiscal_year)
 )
FROM _corum_history_source t JOIN public.scpi_annual_reports r
 ON r.scpi_slug=t.scpi_slug AND r.fiscal_year=t.fiscal_year
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
UPDATE public.scpi_annual_backfill_queue q
SET status='extracted',updated_at=now()
FROM _corum_history_source t
WHERE q.scpi_slug=t.scpi_slug AND q.fiscal_year=t.fiscal_year
 AND q.status<>'extracted'
 AND EXISTS(SELECT 1 FROM public.scpi_history_year_audit_v1 h
  WHERE h.scpi_slug=q.scpi_slug AND h.fiscal_year=q.fiscal_year AND h.all_three_verified);
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM _corum_history_source t
 JOIN public.scpi_history_year_audit_v1 h ON h.scpi_slug=t.scpi_slug
  AND h.fiscal_year=t.fiscal_year AND h.all_three_verified;
 IF n<>8 THEN RAISE EXCEPTION 'CORUM_EIGHT_YEARS_NOT_VERIFIED: %',n; END IF;
END $$;
COMMIT;
SELECT scpi_slug,fiscal_year,metrics_verified,all_three_verified
 FROM public.scpi_history_year_audit_v1
 WHERE (scpi_slug='corum-origin' AND fiscal_year BETWEEN 2012 AND 2018)
 OR (scpi_slug='corum-xl' AND fiscal_year=2022)
 ORDER BY scpi_slug,fiscal_year;