-- Atream Hotels T2-2026: official publisher PDF visually independently inspected
-- PDF physical page 2 (page labelled "2"). Never certify its stored Article-10 PDF as a quarterly bulletin.
-- The bad bulletin row remains quarantined; no analysis/publication flags are changed.
WITH documented(metric,expected_value,evidence) AS (
 VALUES
 ('capitalisation',329.8355::numeric,'Capitalisation 30/06/2026 : 329 835 500 € (= 329,8355 M€).'),
 ('distribution_par_part',13.24,'Dividende brut 2T 2026 : 13,24 €/part.'),
 ('endettement',22.86,'Ratio d’endettement au 30/06/2026 : 22,86 %.'),
 ('nombre_associes',6048,'Nombre d’associés au 30/06/2026 : 6 048.'),
 ('nombre_immeubles',23,'Chiffres clés au 30/06/2026 : 23 actifs.'),
 ('nombre_parts',327606,'Nombre de parts au 30/06/2026 : 327 606 parts.'),
 ('prix_reconstitution',1059.54,'Valeur de reconstitution au 30/06/2026 : 1 059,54 €.'),
 ('prix_retrait',900,'Valeur de retrait au 30/06/2026 : 900,00 €.'),
 ('prix_souscription',1000,'Prix de souscription au 30/06/2026 : 1 000,00 €.'),
 ('td',5.05,'Performances 2025 : Taux de Distribution brute 5,05 %, année explicitement 2025.'),
 ('td_annee',2025,'Entête « Performances 2025 » attachée au taux 5,05 %.'),
 ('tof',100,'Taux d’occupation financier ASPIM T2 2026 : 100 %.'),
 ('valeur_realisation',868.14,'Valeur de réalisation au 30/06/2026 : 868,14 €.'),
 ('walb',11.8,'Durée résiduelle moyenne ferme des baux : 11,8 ans.')
), updated AS (
 UPDATE public.scpi_metric_certifications mc SET
   source_url='https://atream.com/wp-content/uploads/2026/07/Bulletin-N2026_2T-SCPI_Atream_Hotels_WEB_10-PAGES.pdf',
   source_page=2,
   evidence_text='Atream Hôtels, bulletin officiel 2026/2, période 01/04–30/06/2026, PDF page physique 2 : '||v.evidence||
     ' Relecture de la page image officielle le 16/10/2026. Correction de la fausse provenance Article-10. '
     ||'Le bulletin stocké reste en statut needs_review; ne pas certifier ses analyses sans identité PDF vérifiée.',
   bulletin_id=NULL,
   verification_status='manual_verified_official',
   verification_method='official_pdf_visual_crosscheck_20261016',
   extraction_confidence=1,
   verified_at=now()
 FROM documented v
 WHERE mc.scpi_slug='atream-hotel' AND mc.source_period='2026-T2'
   AND mc.metric=v.metric AND mc.value_numeric=v.expected_value
   AND mc.verification_status='source_verified_no_field_evidence'
   AND mc.evidence_text IS NULL AND mc.source_page IS NULL
   AND mc.source_url='https://atream.com/wp-content/uploads/2020/07/20260916-SCPI-Atream-Hotels-Article-10.pdf'
 RETURNING mc.metric
)
SELECT count(*) AS corrected_field_proofs FROM updated;
