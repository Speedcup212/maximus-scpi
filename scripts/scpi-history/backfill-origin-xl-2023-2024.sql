-- Pilote réutilisable : lecture de colonnes comparatives officielles, 2 fonds × 2 exercices.
-- IMPORTANT: données 2023/2024 uniquement, sans interpolation ni réécriture 2025/2026.
BEGIN;
CREATE TEMP TABLE _corum_compared (
 scpi_slug text,fiscal_year int,dividend numeric,vr numeric,rc numeric,div_page int,valuation_page int,source_url text,review_note text
) ON COMMIT DROP;
INSERT INTO _corum_compared VALUES ('corum-origin',2023,68.8,932.52,1146.42,14,19,'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20Origin%202024-compress%C3%A9.pdf','Colonne 2023 du rapport 2024: dividende brut 68,80, valeur de réalisation 932,52, reconstitution 1 146,42; exercices et pages recoupés.'),
('corum-origin',2024,68.62,953.35,1172.41,14,19,'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20Origin%202024-compress%C3%A9.pdf','Dividende brut incluant exploitation, distribution exceptionnelle de plus-value et produits financiers; colonnes 2024 du rapport 2024.'),
('corum-xl',2023,10.53,151.69,185.8,13,18,'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20XL%202024%20F-avec%20compression.pdf','Colonne comparative 2023 du rapport 2024; ne pas confondre dividende brut par part avec ligne comptable Dividende (10,67 EUR).'),
('corum-xl',2024,10.78,154.71,189.88,13,18,'https://www.corum.fr/sites/default/files/2025-03/Rapport%20annuel%20CORUM%20XL%202024%20F-avec%20compression.pdf','Colonne 2024 du rapport 2024; dividende brut 10,78 EUR incluant 0,40 EUR exceptionnel; valeur de réalisation et reconstitution au 31/12/2024.');
DO $guard$
BEGIN
 IF (SELECT count(*) FROM _corum_compared)<>4 THEN RAISE EXCEPTION 'Expected exactly 4 periods'; END IF;
 IF EXISTS (SELECT 1 FROM _corum_compared WHERE source_url !~ '^https://www.corum.fr/' OR valuation_page<1 OR div_page<1)
 THEN RAISE EXCEPTION 'Untrusted source URL or invalid PDF page'; END IF;
 IF EXISTS (SELECT 1 FROM public.scpi_annual_fundamentals f JOIN _corum_compared x
  ON f.scpi_slug=x.scpi_slug AND f.fiscal_year=x.fiscal_year
  WHERE f.distribution_totale_par_part IS DISTINCT FROM x.dividend
  OR f.valeur_realisation_par_part IS DISTINCT FROM x.vr
  OR f.valeur_reconstitution_par_part IS DISTINCT FROM x.rc
  OR f.qa_status IS DISTINCT FROM 'manual_verified_official')
 THEN RAISE EXCEPTION 'Historical annual row conflict (preserving existing data)'; END IF;
END $guard$;
INSERT INTO public.scpi_annual_reports
 (scpi_slug,fiscal_year,source_url,source_document,qa_status,found_at,processed_at)
SELECT t.scpi_slug,t.fiscal_year,t.source_url,
 t.scpi_slug||' - rapport annuel 2024, colonne '||t.fiscal_year,
 'source_verified_content',now(),now()
FROM _corum_compared t
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
INSERT INTO public.scpi_annual_fundamentals(
 scpi_slug,fiscal_year,distribution_totale_par_part,valeur_realisation_par_part,
 valeur_reconstitution_par_part,source_url,source_document,source_report_id,
 qa_status,source_confidence,evidence
)
SELECT t.scpi_slug,t.fiscal_year,t.dividend,t.vr,t.rc,t.source_url,
 'CORUM - rapport annuel 2024, exercice '||t.fiscal_year,
 r.id,'manual_verified_official',0.99,
 jsonb_build_object(
  'distribution_totale_par_part',jsonb_build_object(
  'page',t.div_page,'value',t.dividend,'fiscal_year_column',t.fiscal_year,
  'source_report_year',2024,'unit','EUR/part','basis','gross_annual_distribution',
  'text',t.review_note),
  'valeur_realisation_par_part',jsonb_build_object(
  'page',t.valuation_page,'value',t.vr,'fiscal_year_column',t.fiscal_year,
  'reference_date',t.fiscal_year||'-12-31','unit','EUR/part','text',t.review_note),
  'valeur_reconstitution_par_part',jsonb_build_object(
  'page',t.valuation_page,'value',t.rc,'fiscal_year_column',t.fiscal_year,
  'reference_date',t.fiscal_year||'-12-31','unit','EUR/part','text',t.review_note)
 )
FROM _corum_compared t JOIN public.scpi_annual_reports r
 ON r.scpi_slug=t.scpi_slug AND r.fiscal_year=t.fiscal_year
ON CONFLICT (scpi_slug,fiscal_year) DO NOTHING;
UPDATE public.scpi_annual_backfill_queue q SET status='extracted',updated_at=now()
FROM _corum_compared t
WHERE q.scpi_slug=t.scpi_slug AND q.fiscal_year=t.fiscal_year AND q.status<>'extracted'
AND EXISTS(SELECT 1 FROM public.scpi_history_year_audit_v1 a
 WHERE a.scpi_slug=q.scpi_slug AND a.fiscal_year=q.fiscal_year AND a.all_three_verified);
DO $qa$
BEGIN
 IF EXISTS (SELECT 1 FROM _corum_compared t
 LEFT JOIN public.scpi_history_year_audit_v1 a ON a.scpi_slug=t.scpi_slug AND a.fiscal_year=t.fiscal_year
 WHERE a.all_three_verified IS DISTINCT FROM true)
 THEN RAISE EXCEPTION 'Comparison series cannot be certified'; END IF;
END $qa$;
COMMIT;
SELECT scpi_slug,fiscal_year,metrics_verified,all_three_verified
FROM public.scpi_history_year_audit_v1
WHERE scpi_slug IN ('corum-origin','corum-xl') AND fiscal_year IN (2023,2024)
ORDER BY scpi_slug,fiscal_year;
