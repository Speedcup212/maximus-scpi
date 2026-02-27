-- =============================================================================
-- Create scpi_bulletins table for ingestion pipeline & frontend score lookup
-- =============================================================================
--
-- This table is used by:
--   - scpi-ingestion pipeline: inserts bulletin records, stores maximus_score
--   - Frontend (getScoreBySlug): reads maximus_score for per-SCPI rating display
--
-- Until the ingestion pipeline runs, the table will be empty and the UI will
-- show N/A (fallback to scores_scpi or local compute).
-- =============================================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scpi_bulletins (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SCPI identifier (slug, e.g. "iroko-zen", "comete")
  scpi_slug  text        NOT NULL,

  -- Normalized quarter, YYYY-Tn format (e.g. "2025-T3")
  period     text        NOT NULL,

  -- Supabase Storage object key: scpi_slug/YYYY-Tn/sha256.pdf
  pdf_path   text        NOT NULL,

  -- SHA-256 hex digest of the PDF byte content
  pdf_sha256 text        NOT NULL,

  -- URL the PDF was fetched from
  source_url text        NOT NULL,

  -- Timestamp the pipeline first recorded this bulletin
  found_at   timestamptz NOT NULL DEFAULT now(),

  -- UUID of the ingestion run that inserted this row
  run_id     text        NOT NULL,

  CONSTRAINT uq_scpi_period UNIQUE (scpi_slug, period),
  CONSTRAINT uq_pdf_sha256  UNIQUE (pdf_sha256)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_scpi_slug
  ON public.scpi_bulletins (scpi_slug);

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_period
  ON public.scpi_bulletins (period);

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_found_at
  ON public.scpi_bulletins (found_at DESC);

-- ─── maximus_score column ─────────────────────────────────────────────────────
-- Stores MaximusScoreResult JSONB (score_total, score_rendement, etc. + version)

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

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_score_total
  ON public.scpi_bulletins
  USING btree ((maximus_score->>'score_total'));

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_score_version
  ON public.scpi_bulletins
  USING btree ((maximus_score->>'version'));

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.scpi_bulletins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename  = 'scpi_bulletins'
       AND policyname = 'allow_select_anon'
  ) THEN
    CREATE POLICY allow_select_anon
      ON public.scpi_bulletins
      FOR SELECT
      USING (true);
  END IF;
END;
$$;

COMMENT ON TABLE public.scpi_bulletins IS 'Bulletin PDFs processed by ingestion pipeline; maximus_score used for frontend rating';
