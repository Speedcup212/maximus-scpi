-- Correction contrôlée du prix de retrait des 4 CORUM. Pas d'extrapolation.
-- Sources : clauses de retrait officielles CORUM, prix en vigueur et pièces justificatives.
BEGIN;
CREATE TEMP TABLE _corum_retrait (
 scpi_slug text,prix_souscription numeric,prix_retrait numeric,
 commission_eur numeric,source_url text,source_page integer,
 valid_since date,evidence_text text
) ON COMMIT DROP;
INSERT INTO _corum_retrait VALUES
('corum-origin',1135,999.21,135.79,'https://content.corum.fr/app/uploads/corum-fr/CORUM-Origin-FR2-Note-dinformation-2024.02.12.pdf',11,'2022-04-01','Note d''information CORUM Origin, page 11, chapitre II/2 b): valeur de retrait 999,21 EUR/part depuis le 1er avril 2022, prix de souscription 1 135,00 EUR moins commission de souscription 135,79 EUR TTI. Recoupe annonce officielle CORUM du 08/06/2026.'),
('corum-xl',195,171.6,23.4,'https://content.corum.fr/app/uploads/corum-fr/CORUM-XL-FR8-Plan-epargne-immobilier-2022.07.pdf',2,'2022-06-01','Conditions officielles CORUM XL, p. 2/2, rubrique Remboursement de l''epargne investie : retrait 171,60 EUR/part, prix 195 EUR moins commission 23,40 EUR depuis juin 2022. Corroboration dans bulletin CORUM XL T4 2025 (prix de revente).'),
('corum-eurion',215,189.2,25.8,'https://epargne.corum.fr/docs/cgv-scpi-2023.pdf',3,'2022-07-01','Conditions generales de vente CORUM L''Epargne, page PDF 3, rubrique PRIX DE RETRAIT : CORUM EURION 189,20 EUR par part, prix 215 EUR moins 25,80 EUR de commission. Note d''information 27 mai 2025 confirme depuis le 01/07/2022.'),
('corum-usa',200,176,24,'https://content.corum.fr/app/uploads/corum-fr/CORUM-USA-FR1-Note-information-20250124.pdf',13,'2024-11-04','Note d''information CORUM USA 2025, page 13/30, chapitre II/2 b): prix de retrait 176,00 EUR par part depuis le 4 novembre 2024, prix souscription 200 EUR moins commission 24,00 EUR TTC. Confirmation bulletin officiel 2024 T4.');
DO $gate$
DECLARE n integer;
BEGIN
 IF (SELECT COUNT(*) FROM _corum_retrait)<>4 THEN
  RAISE EXCEPTION 'RETRAIT_GATE_EXPECTED_FOUR'; END IF;
 SELECT COUNT(*) INTO n
 FROM public.scpi_indicators i JOIN _corum_retrait d USING(scpi_slug)
 WHERE i.source_period='2026-T2' AND i.prix_souscription=d.prix_souscription
 AND (i.prix_retrait IS NULL OR i.prix_retrait=d.prix_retrait);
 IF n<>4 THEN
  RAISE EXCEPTION 'RETRAIT_GATE_EXISTING_VALUES_OR_PRICES_DIFFER: %',n; END IF;
 IF EXISTS (
   SELECT 1 FROM _corum_retrait
   WHERE round(prix_souscription-commission_eur,2)<>prix_retrait
   OR source_url !~ '^https://' OR source_page<1
   OR valid_since>date '2026-06-30'
   OR length(evidence_text)<100
 ) THEN RAISE EXCEPTION 'RETRAIT_GATE_INCOHERENT_SOURCE_MATH'; END IF;
 IF EXISTS (
   SELECT 1 FROM public.scpi_metric_certifications c
   JOIN _corum_retrait d USING(scpi_slug)
   WHERE c.metric='prix_retrait' AND c.source_period='2026-T2'
     AND (c.value_numeric IS DISTINCT FROM d.prix_retrait
       OR c.source_url IS DISTINCT FROM d.source_url)
 ) THEN RAISE EXCEPTION 'RETRAIT_GATE_EXISTING_CERTIFICATION_DIFFERS'; END IF;
END $gate$;
INSERT INTO public.scpi_metric_certifications
 (scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
 evidence_text,verification_status,verification_method,extraction_confidence)
SELECT scpi_slug,'2026-T2','prix_retrait',prix_retrait,'EUR_PER_PART',
 source_url,source_page,
 evidence_text||' | Date initiale du tarif : '||valid_since||
 '. Série courante 2026-T2 rapprochée du prix de souscription et des conditions de retrait; pas de garantie de liquidité ni de prix en cas de retraits non compensés.',
 'manual_verified_official','official_issuer_retraction_terms_20261019',1.0
FROM _corum_retrait
ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;
UPDATE public.scpi_indicators i
SET prix_retrait=d.prix_retrait
FROM _corum_retrait d
WHERE i.scpi_slug=d.scpi_slug AND i.prix_retrait IS DISTINCT FROM d.prix_retrait;
DO $qa$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM _corum_retrait d
 JOIN public.scpi_indicators i USING(scpi_slug)
 JOIN public.scpi_metric_certifications c ON
 c.scpi_slug=d.scpi_slug AND c.source_period='2026-T2' AND c.metric='prix_retrait'
 WHERE i.prix_retrait=d.prix_retrait
 AND i.prix_souscription=d.prix_souscription
 AND c.value_numeric=d.prix_retrait
 AND c.verification_status='manual_verified_official'
 AND c.source_page=d.source_page
 AND c.source_url=d.source_url;
 IF n<>4 THEN RAISE EXCEPTION 'RETRAIT_GATE_POST_WRITE_MISSING_%',n; END IF;
END $qa$;
COMMIT;
SELECT i.scpi_slug, i.prix_souscription, i.prix_retrait,
 c.source_page,c.source_url,c.verification_status
FROM public.scpi_indicators i
JOIN public.scpi_metric_certifications c USING(scpi_slug)
WHERE i.scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
 AND c.source_period='2026-T2' AND c.metric='prix_retrait'
ORDER BY i.scpi_slug;