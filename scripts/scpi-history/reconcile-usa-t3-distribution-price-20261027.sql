-- RECOVERY-006: CORUM USA T3 only. Reconstitution remains dated 30/06/2026.
-- MuPDF + Poppler agree, rendered source pages 2 and 3 reviewed by Codex.
-- No debt inferred; no readiness, QA thresholds or current T2 snapshot changed.
BEGIN;
DO $gate$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM scpi_bulletins WHERE scpi_slug='corum-usa' AND period='2026-T3'
 AND pdf_sha256='680f2bad842bfa7586908c5ac0ba532f5d17682aa530a9915a1246070c64d4c4') THEN
 RAISE EXCEPTION 'SOURCE_HASH_MISMATCH'; END IF;
 IF NOT EXISTS (SELECT 1 FROM scpi_indicator_history WHERE scpi_slug='corum-usa' AND source_period='2026-T3'
 AND (distribution_par_part IS NULL OR distribution_par_part=3.15)
 AND (prix_souscription IS NULL OR prix_souscription=200)) THEN
 RAISE EXCEPTION 'MISSING_OR_CONFLICTING_HISTORY'; END IF;
 IF EXISTS (SELECT 1 FROM scpi_metric_certifications WHERE scpi_slug='corum-usa' AND source_period='2026-T3'
 AND ((metric='distribution_par_part' AND value_numeric IS DISTINCT FROM 3.15)
 OR (metric='prix_souscription' AND value_numeric IS DISTINCT FROM 200))) THEN
 RAISE EXCEPTION 'CONFLICTING_CERTIFICATE'; END IF;
END $gate$;
INSERT INTO scpi_metric_certifications
(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence,verified_at)
SELECT 'corum-usa','2026-T3',d.metric,d.value,'EUR_PER_PART',b.source_url,d.page,
'SHA256='||b.pdf_sha256||'; period=2026-T3; '||d.evidence,b.id,
'manual_verified_official','codex_visual_review_plus_mupdf_poppler_20261027',1,now()
FROM scpi_bulletins b CROSS JOIN (VALUES
('distribution_par_part',3.15::numeric,2,'Bulletin N.8 publie le 19 octobre 2026, p2: Dividende par part au 3eme trimestre 2026, dividende BRUT PAR PART 3,15 EUR; confirme p3. MuPDF=3,15 EUR; Poppler=3,15 EUR. Ne pas annualiser ni confondre avec le net.'),
('prix_souscription',200::numeric,3,'Bulletin N.8 p3: PRIX DE SOUSCRIPTION DEPUIS LE 4 NOVEMBRE 2024, Une part (frais et commission de souscription inclus) 200,00 EUR. MuPDF=200,00 EUR; Poppler=200,00 EUR. Prix en vigueur dans le bulletin T3; pas une revalorisation.')) d(metric,value,page,evidence)
WHERE b.scpi_slug='corum-usa' AND b.period='2026-T3'
ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;
UPDATE scpi_indicator_history h SET distribution_par_part=3.15,prix_souscription=200
WHERE h.scpi_slug='corum-usa' AND h.source_period='2026-T3'
AND EXISTS (SELECT 1 FROM scpi_metric_certifications c WHERE c.scpi_slug=h.scpi_slug
AND c.source_period=h.source_period AND c.metric='distribution_par_part' AND c.value_numeric=3.15)
AND EXISTS (SELECT 1 FROM scpi_metric_certifications c WHERE c.scpi_slug=h.scpi_slug
AND c.source_period=h.source_period AND c.metric='prix_souscription' AND c.value_numeric=200);
DO $qa$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM scpi_trajectory_pilot_history WHERE scpi_slug='corum-usa'
 AND source_period='2026-T3' AND distribution_par_part=3.15 AND prix_souscription=200
 AND prix_reconstitution IS NULL AND endettement IS NULL) THEN
 RAISE EXCEPTION 'POST_WRITE_HISTORY_MISMATCH'; END IF;
END $qa$;
COMMIT;
