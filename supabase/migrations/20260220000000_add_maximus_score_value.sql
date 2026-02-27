-- Add maximus_score_value numeric column for fast frontend lookups
-- React reads maximus_score_value first, fallback to maximus_score->>'score_total'

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'scpi_bulletins'
       AND column_name  = 'maximus_score_value'
  ) THEN
    ALTER TABLE public.scpi_bulletins
      ADD COLUMN maximus_score_value numeric;
  END IF;
END;
$$;

-- Backfill from maximus_score JSON
UPDATE public.scpi_bulletins
SET maximus_score_value = COALESCE(
  (maximus_score->>'score_total')::numeric,
  (maximus_score->>'score')::numeric
)
WHERE maximus_score IS NOT NULL
  AND maximus_score_value IS NULL;

CREATE INDEX IF NOT EXISTS idx_scpi_bulletins_maximus_score_value
  ON public.scpi_bulletins (maximus_score_value DESC NULLS LAST)
  WHERE maximus_score_value IS NOT NULL;
