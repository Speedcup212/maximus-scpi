-- Vérification des bulletins ingérés
-- Exécuter après Phase 1 ou Phase 2

SELECT
  scpi_slug,
  period,
  source_url,
  pdf_path,
  pdf_sha256,
  run_id,
  found_at,
  maximus_score_value
FROM public.scpi_bulletins
ORDER BY scpi_slug, found_at DESC;
