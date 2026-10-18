-- Lot pilote réexécutable : CORUM Eurion 2020–2024 (2025 déjà certifié).
-- 2020 : dividende d'une part en jouissance sur 12 mois, rendement publié annualisé.
-- Les données 2026-T2 ne sont PAS des données historiques annuelles.
BEGIN;
CREATE TEMP TABLE _corum_eurion_pilot(
 fiscal_year integer, gross_dividend numeric,realisation numeric,reconstitution numeric,
 dividend_pdf_page integer,valuation_pdf_page integer,published_report_year integer,
 source_url text,crosscheck_url text,review_note text
) ON COMMIT DROP;
INSERT INTO _corum_eurion_pilot VALUES
(2020, 20.79, 172.55, 209.74, 17, 22, 2021, 'https://www.corum.fr/sites/default/files/2022-03/CORUM%20Eurion%20-%20Rapport%20annuel%202021.pdf', 'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20Eurion%202024-avec%20compression.pdf', 'Exercice de lancement 2020. Rendement 10,40 % annualisé ; dividende brut théorique pour part en jouissance depuis le 1er janvier: 20,79 EUR. Ne pas interpréter comme cash réellement encaissé sur douze mois.'),
(2021, 12.23, 180.82, 225.41, 17, 22, 2021, 'https://www.corum.fr/sites/default/files/2022-03/CORUM%20Eurion%20-%20Rapport%20annuel%202021.pdf', 'https://www.corum.fr/sites/default/files/2023-03/CORUM%20Eurion%20-%20Rapport%20annuel%202022.pdf', 'Exercice 2021; colonne 2021 distincte de la colonne comparative 2020.'),
(2022, 13.19, 180.93, 222.55, 17, 22, 2022, 'https://www.corum.fr/sites/default/files/2023-03/CORUM%20Eurion%20-%20Rapport%20annuel%202022.pdf', 'https://www.corum.fr/sites/default/files/2024-04/Rapport%20annuel%20CORUM%20Eurion%202023.pdf', 'Exercice 2022, recoupement des chiffres comparatifs du rapport 2023.'),
(2023, 12.19, 180.89, 223.23, 16, 21, 2023, 'https://www.corum.fr/sites/default/files/2024-04/Rapport%20annuel%20CORUM%20Eurion%202023.pdf', 'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20Eurion%202024-avec%20compression.pdf', 'Exercice 2023; valeur de fin d''exercice et dividende brut annuel à distinguer.'),
(2024, 11.88, 184.76, 229.29, 12, 17, 2024, 'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20Eurion%202024-avec%20compression.pdf', 'https://www.corum.fr/sites/default/files/2026-04/Rapport%20annuel%20CORUM%20Eurion%202025.pdf', 'Exercice 2024, trois valeurs concordantes avec tableau comparatif officiel du rapport annuel 2025.');
DO $guard$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM _corum_eurion_pilot;
 IF n<>5 THEN RAISE EXCEPTION 'Invalid Eurion pilot cardinality: %',n; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_annual_fundamentals f
 JOIN _corum_eurion_pilot p USING(fiscal_year)
 WHERE f.scpi_slug='corum-eurion' AND
  (f.distribution_totale_par_part IS DISTINCT FROM p.gross_dividend OR
   f.valeur_realisation_par_part IS DISTINCT FROM p.realisation OR
   f.valeur_reconstitution_par_part IS DISTINCT FROM p.reconstitution OR
   f.qa_status IS DISTINCT FROM 'manual_verified_official'))
 THEN RAISE EXCEPTION 'EXISTING_EURION_HISTORICAL_DATA_DIFFER: manual review required'; END IF;
 IF EXISTS(SELECT 1 FROM _corum_eurion_pilot p
 WHERE p.source_url !~ '^https://www.corum.fr/' OR p.dividend_pdf_page<=0
 OR p.valuation_pdf_page<=0 OR p.crosscheck_url !~ '^https://www.corum.fr/')
 THEN RAISE EXCEPTION 'Bad official provenance'; END IF;
END $guard$;
INSERT INTO public.scpi_annual_reports
 (scpi_slug,fiscal_year,source_url,source_document,qa_status,found_at,processed_at)
SELECT 'corum-eurion',p.fiscal_year,p.source_url,
 'CORUM Eurion - rapport annuel '||p.published_report_year
 ||' (colonne exercice '||p.fiscal_year||')',
 'source_verified_content',now(),now()
FROM _corum_eurion_pilot p
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;
INSERT INTO public.scpi_annual_fundamentals
 (scpi_slug,fiscal_year,distribution_totale_par_part,valeur_realisation_par_part,
 valeur_reconstitution_par_part,source_url,source_document,source_report_id,
 qa_status,source_confidence,evidence)
SELECT 'corum-eurion',p.fiscal_year,p.gross_dividend,p.realisation,p.reconstitution,
 p.source_url, 'Rapport annuel officiel '||p.published_report_year||
 ' - CORUM Eurion, colonne '||p.fiscal_year,r.id,
 'manual_verified_official',0.99,
 jsonb_build_object(
  'distribution_totale_par_part',jsonb_build_object(
    'page',p.dividend_pdf_page,'value',p.gross_dividend,'document_year',p.published_report_year,
    'fiscal_year_column',p.fiscal_year,'unit','EUR/part','basis',
    CASE WHEN p.fiscal_year=2020 THEN 'annualized_inception_year_gross_dividend_reference'
         ELSE 'gross_dividend_annual_full_entitlement' END,
    'crosscheck_url',p.crosscheck_url,'text',p.review_note),
  'valeur_realisation_par_part',jsonb_build_object(
    'page',p.valuation_pdf_page,'value',p.realisation,'document_year',p.published_report_year,
    'fiscal_year_column',p.fiscal_year,'unit','EUR/part',
    'reference_date',p.fiscal_year||'-12-31','crosscheck_url',p.crosscheck_url,
    'text','Valeur de réalisation par part, fin d’exercice : colonne '||p.fiscal_year),
  'valeur_reconstitution_par_part',jsonb_build_object(
    'page',p.valuation_pdf_page,'value',p.reconstitution,'document_year',p.published_report_year,
    'fiscal_year_column',p.fiscal_year,'unit','EUR/part',
    'reference_date',p.fiscal_year||'-12-31','crosscheck_url',p.crosscheck_url,
    'text','Valeur de reconstitution par part, fin d’exercice : colonne '||p.fiscal_year)
 )
FROM _corum_eurion_pilot p JOIN public.scpi_annual_reports r
ON r.scpi_slug='corum-eurion' AND r.fiscal_year=p.fiscal_year
ON CONFLICT(scpi_slug,fiscal_year) DO NOTHING;
UPDATE public.scpi_annual_backfill_queue q SET status='extracted',updated_at=now()
FROM _corum_eurion_pilot p
WHERE q.scpi_slug='corum-eurion' AND q.fiscal_year=p.fiscal_year
AND q.status<>'extracted'
AND EXISTS(SELECT 1 FROM public.scpi_history_year_audit_v1 v
 WHERE v.scpi_slug=q.scpi_slug AND v.fiscal_year=q.fiscal_year AND v.all_three_verified);
DO $qa$
DECLARE yrs integer;
BEGIN
 SELECT count(*) INTO yrs FROM public.scpi_history_year_audit_v1
 WHERE scpi_slug='corum-eurion' AND all_three_verified AND fiscal_year BETWEEN 2020 AND 2025;
 IF yrs<>6 THEN RAISE EXCEPTION 'EURION_PILOT_HISTORY_INCOMPLETE: %/6',yrs; END IF;
END $qa$;
COMMIT;
SELECT fiscal_year,metrics_verified,metrics_missing,all_three_verified
FROM public.scpi_history_year_audit_v1
WHERE scpi_slug='corum-eurion' ORDER BY fiscal_year;
