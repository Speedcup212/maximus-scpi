-- Lot de dix SCPI : corriger le perimetre de lancement AVANT backfill.
-- Documentation officielle : Iroko Atlas septembre 2025, Transitions Europe
-- constituee novembre 2022 puis DEUX exercices sociaux clos en 2023.
-- Aucun chiffre financier n'est re-certifie par ces mises à jour.
BEGIN;
DO $$
BEGIN
 IF (SELECT count(*) FROM public.scpi_history_scope
 WHERE scpi_slug='iroko-atlas' AND start_year=2024
 AND start_year_status='catalog_provisional')<>1
 THEN RAISE EXCEPTION 'ATLAS_LAUNCH_NOT_PROVISIONAL_2024'; END IF;
 IF (SELECT count(*) FROM public.scpi_history_scope
 WHERE scpi_slug='transitions-europe' AND start_year=2022
 AND start_year_status='catalog_provisional')<>1
 THEN RAISE EXCEPTION 'TRANSITIONS_LAUNCH_NOT_PROVISIONAL_2022'; END IF;
END $$;
UPDATE public.scpi_history_scope
SET start_year=2025,
 start_year_status='official_verified',
 source_url='https://www.iroko.eu/blog/scpi-internationale',
 source_note='Iroko Atlas : agrement AMF 24 juin 2025, lancement officiel commercial le 16 septembre 2025. Ancienne annee 2024 incorrecte; premier et seul exercice clos 2025.',
 reviewed_at=now(),
 first_fiscal_year=2025,
 first_fiscal_year_source_url='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_rapport_annuel_2025.pdf',
 first_fiscal_year_evidence='Rapport annuel officiel Iroko Atlas 2025 : premiere periode d activite de la SCPI creee et commercialisee en septembre 2025; aucune periode sociale annuelle en 2024.',
 first_fiscal_year_reviewed_at=now(),
 updated_at=now()
WHERE scpi_slug='iroko-atlas';
UPDATE public.scpi_history_scope
SET start_year_status='official_verified',
 source_url='https://www.arkea-reim.com/upload/docs/application/pdf/2023-05/arkea_reim_ra_transition_europe.pdf',
 source_note='Transitions Europe constituee en octobre 2022, immatriculee le 16 novembre 2022; activite commerciale 2023. Premier exercice clos le 31 mars 2023, second exercice du 1 avril au 31 decembre 2023. DEUX CLÔTURES en 2023: une vue annuelle par exercice-civil ne represente pas les deux comptes sociaux.',
 reviewed_at=now(),
 first_fiscal_year=2023,
 first_fiscal_year_source_url='https://www.arkea-reim.com/upload/docs/application/pdf/2023-05/arkea_reim_ra_transition_europe.pdf',
 first_fiscal_year_evidence='Premier exercice social exceptionnel de quatre mois et quinze jours : du 16 novembre 2022 au 31 mars 2023. Un second exercice distinct de neuf mois a ete clos au 31 decembre 2023 : deux comptes sociaux portent la meme annee de fin; les valorisations doivent etre stockees avec la date complete de cloture.',
 first_fiscal_year_reviewed_at=now(),
 updated_at=now()
WHERE scpi_slug='transitions-europe';
DO $$
BEGIN
 IF EXISTS (
 SELECT 1 FROM public.scpi_history_readiness_v1
 WHERE scpi_slug='iroko-atlas'
 AND (start_year<>2025 OR start_year_status<>'official_verified'
 OR years_expected<>1 OR years_fully_verified<>1 OR core_historical_ready IS DISTINCT FROM true)
 ) THEN RAISE EXCEPTION 'ATLAS_FIRST_YEAR_HISTORICAL_QA_FAILED'; END IF;
 IF EXISTS (
 SELECT 1 FROM public.scpi_history_readiness_v1
 WHERE scpi_slug='transitions-europe'
 AND (start_year<>2023 OR years_expected<>3 OR start_year_status<>'official_verified')
 ) THEN RAISE EXCEPTION 'TRANSITIONS_FIRST_YEAR_HISTORICAL_QA_FAILED'; END IF;
END $$;
COMMIT;
SELECT s.scpi_slug,s.start_year as creation_year,s.first_fiscal_year,
r.years_expected,r.years_fully_verified,r.historical_status
FROM public.scpi_history_scope s
JOIN public.scpi_history_readiness_v1 r USING(scpi_slug)
WHERE s.scpi_slug IN ('iroko-atlas','transitions-europe')
ORDER BY s.scpi_slug;