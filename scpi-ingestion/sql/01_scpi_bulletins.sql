-- =============================================================================
-- 01_scpi_bulletins.sql
-- Audit table for every SCPI PDF bulletin processed by the ingestion pipeline.
--
-- Run once in the Supabase SQL Editor (or via `psql`).
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards.
-- =============================================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scpi_bulletins (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SCPI identifier (slug, e.g. "iroko-zen")
  scpi_slug  text        NOT NULL,

  -- Normalized quarter, always in YYYY-Tn format (e.g. "2025-T3")
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

  -- One canonical entry per (SCPI, quarter).
  -- A row for the same (scpi_slug, period) with a DIFFERENT pdf_sha256
  -- indicates the issuer published a revised version of the bulletin.
  CONSTRAINT uq_scpi_period UNIQUE (scpi_slug, period),

  -- Content-level dedup: identical PDF bytes must not be recorded twice,
  -- even if they appear under different source URLs or run IDs.
  CONSTRAINT uq_pdf_sha256  UNIQUE (pdf_sha256)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_scpi_slug
  ON public.scpi_bulletins (scpi_slug);

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_period
  ON public.scpi_bulletins (period);

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_found_at
  ON public.scpi_bulletins (found_at DESC);

-- ─── Row-level security ───────────────────────────────────────────────────────
-- The pipeline connects with the service-role key, which bypasses RLS entirely.
-- Enable RLS so anonymous/authenticated clients cannot read raw bulletin data
-- unless an explicit policy grants it.

ALTER TABLE public.scpi_bulletins ENABLE ROW LEVEL SECURITY;

-- Optional: allow public read access so the frontend can query which bulletins
-- have been indexed.  Remove or restrict this policy if the data should stay
-- server-side only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename  = 'scpi_bulletins'
       AND policyname = 'allow_select_anon'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY allow_select_anon
        ON public.scpi_bulletins
        FOR SELECT
        USING (true)
    $policy$;
  END IF;
END;
$$;

-- ─── Validation queries ───────────────────────────────────────────────────────
-- Uncomment and run these after executing the migration to confirm the schema.

-- 1. Columns and types
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_schema = 'public'
--    AND table_name   = 'scpi_bulletins'
--  ORDER BY ordinal_position;

-- 2. Constraints (unique, primary key, etc.)
-- SELECT conname, contype, pg_get_constraintdef(oid) AS definition
--   FROM pg_constraint
--  WHERE conrelid = 'public.scpi_bulletins'::regclass
--  ORDER BY contype;

-- 3. Indexes
-- SELECT indexname, indexdef
--   FROM pg_indexes
--  WHERE schemaname = 'public'
--    AND tablename  = 'scpi_bulletins';

-- 4. RLS policies
-- SELECT policyname, cmd, qual
--   FROM pg_policies
--  WHERE schemaname = 'public'
--    AND tablename  = 'scpi_bulletins';

-- 5. Smoke test (should return 0 rows on a fresh install)
-- SELECT count(*) FROM public.scpi_bulletins;
