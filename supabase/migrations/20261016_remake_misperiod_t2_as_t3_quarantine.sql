-- Remake UK 2025: a file explicitly named "BT2_2026" was ingested into 2026-T3.
-- OCR extracts spurious price 25 (instead of 1025), reconstitution 30.15 (instead of 1030.15)
-- and wrongly marks fixed capital as variable. The real 2026-T2 stored metrics remain untouched.
UPDATE public.scpi_bulletins b
SET qa_status='invalid_wrong_period_product_fields_20261016',
    extraction_json=coalesce(b.extraction_json,'{}'::jsonb)||
      jsonb_build_object('qa_override',
        jsonb_build_object('status','invalid','reason','PDF BT2_2026 ingested as 2026-T3; OCR price truncated and capital type mismatched',
          'observed_at',now(),'source_period_true','2026-T2',
          'do_not_propagate',true))
WHERE b.scpi_slug='remake-uk-2025' AND b.period='2026-T3'
  AND b.source_url='https://www.remake.fr/wp-content/uploads/2026/08/REMAKEUK2025_BT2_2026.pdf'
  AND b.pdf_sha256='e43db45f7532146fc9331728a30ba4ac29b7bb75ecc717d3b5eec5f4cd51195e'
  AND b.qa_status='auto_partial_review'
  AND b.extraction_json->'metrics'->>'prix_souscription'='25'
  AND b.extraction_json->'metrics'->>'prix_reconstitution'='30.15';

UPDATE public.scpi_source_registry s
SET notes=coalesce(s.notes,'')||' | 16/10 P0: detected duplicate T2 PDF falsely ingested as T3 with erroneous OCR prices/capital; T3 bulletin invalidated in scpi_bulletins, existing verified T2 history protected.',
 updated_at=now()
WHERE s.scpi_slug='remake-uk-2025' AND s.verification_status='incomplete'
  AND s.bulletin_url LIKE '%BT2_2026.pdf'
  AND coalesce(s.notes,'') NOT LIKE '%16/10 P0: detected duplicate T2 PDF%';
