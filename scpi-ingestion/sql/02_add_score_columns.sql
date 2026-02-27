-- =============================================================================
-- 02_add_score_columns.sql
-- Adds MaximusSCPI scoring columns to public.scpi_bulletins.
--
-- Run after 01_scpi_bulletins.sql.
-- Safe to re-run: uses IF NOT EXISTS / column existence guards.
-- =============================================================================

-- ─── Add maximus_score column ─────────────────────────────────────────────────
-- Stores the full MaximusScoreResult as JSONB (score breakdown + audit trail).
-- Shape:
--   {
--     score_total:     number,   -- 0-100
--     score_rendement: number,   -- 0-40
--     score_secteur:   number,   -- 0-20
--     score_geo:       number,   -- 0-15
--     score_qualite:   number,   -- 0-15
--     score_taille:    number,   -- 0-10
--     audit_trail:     string[],
--     version:         "v1",
--     has_penalty:     boolean,
--     computed_at:     string    -- ISO 8601
--   }

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'scpi_bulletins'
       AND column_name  = 'maximus_score'
  ) THEN
    ALTER TABLE public.scpi_bulletins
      ADD COLUMN maximus_score jsonb;
  END IF;
END;
$$;

-- ─── Functional index on score_total for fast ranking queries ─────────────────

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_score_total
  ON public.scpi_bulletins
  USING btree ((maximus_score->>'score_total'));

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_score_version
  ON public.scpi_bulletins
  USING btree ((maximus_score->>'version'));

-- ─── Validation ───────────────────────────────────────────────────────────────

-- 1. Confirm column was added:
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'scpi_bulletins'
--    AND column_name  = 'maximus_score';

-- 2. After first ingestion run, check scored rows:
-- SELECT scpi_slug, period,
--        (maximus_score->>'score_total')::numeric   AS score_total,
--        (maximus_score->>'version')                AS version,
--        (maximus_score->>'has_penalty')::boolean   AS has_penalty,
--        (maximus_score->>'computed_at')            AS computed_at
--   FROM public.scpi_bulletins
--  WHERE maximus_score IS NOT NULL
--  ORDER BY score_total DESC;

-- 3. Rankings by SCPI (latest bulletin per SCPI):
-- SELECT DISTINCT ON (scpi_slug)
--        scpi_slug,
--        period,
--        (maximus_score->>'score_total')::numeric AS score_total
--   FROM public.scpi_bulletins
--  WHERE maximus_score IS NOT NULL
--  ORDER BY scpi_slug, found_at DESC;
