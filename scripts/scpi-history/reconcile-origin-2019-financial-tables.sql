-- Arbitrage CORUM Origin 2019 : conserver l'écart éditorial 67,53 vs 67,88.
-- La métrique de référence est la ligne réglementaire "Dividende brut versé
-- au titre de l'année", publiée à 67,88 dans RA 2019, 2020, 2021 et 2022.
-- Le texte introductif du RA 2019 affiche 67,53; ce n'est PAS la valeur du
-- tableau financier et l'écart demeure explicitement documenté.
BEGIN;
DO $guard$
BEGIN
 IF EXISTS(SELECT 1 FROM public.scpi_annual_fundamentals
 WHERE scpi_slug='corum-origin' AND fiscal_year=2019 AND (
  qa_status IS DISTINCT FROM 'manual_verified_official'
  OR distribution_totale_par_part IS DISTINCT FROM 67.88
  OR valeur_realisation_par_part IS DISTINCT FROM 935.49
  OR valeur_reconstitution_par_part IS DISTINCT FROM 1133.51))
 THEN RAISE EXCEPTION 'CORUM_ORIGIN_2019_CONFLICT_EXISTING_ROW'; END IF;
END $guard$;
INSERT INTO public.scpi_annual_reports
 (scpi_slug,fiscal_year,source_url,source_document,qa_status,found_at,processed_at)
VALUES('corum-origin',2019,'https://www.corum.fr/sites/default/files/2020-07/CORUM%20Origin%20-%20Rapport%20Annuel%202019_1.pdf',
 'CORUM Origin rapport annuel 2019 — tableaux financiers p.20 et 25',
 'source_verified_content',now(),now())
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
INSERT INTO public.scpi_annual_fundamentals
 (scpi_slug,fiscal_year,distribution_totale_par_part,
 valeur_realisation_par_part,valeur_reconstitution_par_part,
 source_url,source_document,source_report_id,qa_status,source_confidence,evidence)
SELECT 'corum-origin',2019,67.88,935.49,1133.51,
 'https://www.corum.fr/sites/default/files/2020-07/CORUM%20Origin%20-%20Rapport%20Annuel%202019_1.pdf',
 'CORUM Origin RA 2019 p.20 et p.25; corroboration RA 2020, 2021, 2022',
 r.id,'manual_verified_official',0.99,
 jsonb_build_object(
  'distribution_totale_par_part',jsonb_build_object(
   'page',19,'value',67.88,'fiscal_year_column',2019,'source_report_year',2019,
   'unit','EUR/part','basis','gross_annual_distribution_financial_table',
   'editorial_discrepancy_eur_per_share',67.53,
   'editorial_discrepancy_page',6,
   'arbitration','La rubrique éditoriale page 7 annonce 67,53 EUR, mais le tableau financier 2019 page 20 et les rapports officiels 2020, 2021 et 2022 annoncent tous 67,88 EUR comme dividende brut verse au titre de l annee. La serie reglementaire fait foi, sans effacement de la divergence.',
   'crosscheck_urls',jsonb_build_array(
    'https://www.corum.fr/sites/default/files/2021-04/200832_CORUM_ORIGIN_RA20_VDEF_0.pdf',
    'https://www.corum.fr/sites/default/files/2022-03/CORUM%20Origin%20-%20Rapport%20annuel%202021.pdf',
    'https://www.corum.fr/sites/default/files/2023-04/CORUM%20Origin%20-%20Rapport%20Annuel%202022..pdf')),
  'valeur_realisation_par_part',jsonb_build_object(
   'page',19,'value',935.49,'fiscal_year_column',2019,
   'reference_date','2019-12-31','text','Valeur de réalisation par part au 31 décembre 2019'),
  'valeur_reconstitution_par_part',jsonb_build_object(
   'page',19,'value',1133.51,'fiscal_year_column',2019,
   'reference_date','2019-12-31','text','Valeur de reconstitution par part au 31 décembre 2019'))
FROM public.scpi_annual_reports r
WHERE r.scpi_slug='corum-origin' AND r.fiscal_year=2019
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
UPDATE public.scpi_annual_backfill_queue q
SET status='extracted',updated_at=now()
WHERE q.scpi_slug='corum-origin' AND q.fiscal_year=2019 AND q.status='to_discover'
AND EXISTS(SELECT 1 FROM public.scpi_history_year_audit_v1 h
 WHERE h.scpi_slug=q.scpi_slug AND h.fiscal_year=q.fiscal_year AND h.all_three_verified);
DO $check$
DECLARE n integer; incomplete integer;
BEGIN
 SELECT count(*) INTO n FROM public.scpi_history_year_audit_v1
 WHERE scpi_slug='corum-origin' AND all_three_verified;
 IF n<>14 THEN RAISE EXCEPTION 'CORUM_ORIGIN_EXPECTED_14_VERIFIED_FOUND_%',n; END IF;
 SELECT count(*) INTO incomplete FROM public.scpi_history_readiness_v1
 WHERE scpi_slug LIKE 'corum-%' AND core_historical_ready IS DISTINCT FROM true;
 IF incomplete<>0 THEN RAISE EXCEPTION 'CORUM_CORE_HISTORIES_INCOMPLETE_%',incomplete; END IF;
END $check$;
COMMIT;
SELECT scpi_slug,years_expected,years_fully_verified,metrics_missing,
historical_status FROM public.scpi_history_readiness_v1
WHERE scpi_slug LIKE 'corum-%' ORDER BY scpi_slug;