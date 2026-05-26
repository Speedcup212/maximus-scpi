-- =============================================================================
-- 03_add_extraction_column.sql
-- Adds extraction_json column to public.scpi_bulletins.
--
-- Stores the full ExtractionResult produced by extractFromText() for each
-- bulletin: chiffres_cles, TOF, TOP, TD, frais, répartitions, décote/surcote,
-- indicateurs locatifs, actualités trimestrielles, confidence score.
--
-- Run after 02_add_score_columns.sql.
-- Safe to re-run (column existence guard).
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'scpi_bulletins'
       AND column_name  = 'extraction_json'
  ) THEN
    ALTER TABLE public.scpi_bulletins
      ADD COLUMN extraction_json jsonb;

    COMMENT ON COLUMN public.scpi_bulletins.extraction_json IS
      'Full ExtractionResult from extractFromText(): all 30+ SCPI indicators '
      '(capitalisation, TD, TOF, TOP, frais, répartitions, prime_decote, WALT, WALB, …)';
  END IF;

  -- Confidence index for QA dashboards
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename  = 'scpi_bulletins'
       AND indexname  = 'idx_scpi_bulletins_confidence'
  ) THEN
    CREATE INDEX idx_scpi_bulletins_confidence
      ON public.scpi_bulletins
      USING btree ((extraction_json->>'confidence'));
  END IF;
END;
$$;

-- =============================================================================
-- Verification queries (run manually after first ingestion with extraction):
-- =============================================================================
--
-- SELECT scpi_slug, period,
--        (extraction_json->'chiffres_cles'->>'capitalisation')::numeric  AS capitalisation,
--        (extraction_json->'chiffres_cles'->>'taux_distribution')::numeric * 100 AS td_pct,
--        (extraction_json->'chiffres_cles'->>'taux_occupation_financier')::numeric * 100 AS tof_pct,
--        (extraction_json->'valorisation_risque'->>'prime_decote')::numeric * 100 AS decote_pct,
--        (extraction_json->>'confidence')::numeric AS confidence
--   FROM public.scpi_bulletins
--  WHERE extraction_json IS NOT NULL
--  ORDER BY found_at DESC;
