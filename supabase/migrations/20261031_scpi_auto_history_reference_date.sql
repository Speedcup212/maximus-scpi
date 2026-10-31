-- The history timeline is indexed by the official reporting period,
-- not by the instant the PDF was ingested or promoted.
CREATE OR REPLACE FUNCTION public.scpi_auto_history_reference_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_year integer;
  v_quarter integer;
  v_end date;
BEGIN
  IF NEW.source_type='bulletin_edge_automated'
     AND NEW.source_period ~ '^20[0-9]{2}-T[1-4]$' THEN
    v_year := substring(NEW.source_period from 1 for 4)::integer;
    v_quarter := right(NEW.source_period,1)::integer;
    v_end := (make_date(v_year,v_quarter*3,1)
              + interval '1 month' - interval '1 day')::date;
    NEW.snapshot_at := (v_end::timestamp + time '23:59:59') AT TIME ZONE 'UTC';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_scpi_auto_history_reference_date ON public.scpi_indicator_history;
CREATE TRIGGER trg_scpi_auto_history_reference_date
BEFORE INSERT OR UPDATE ON public.scpi_indicator_history
FOR EACH ROW
EXECUTE FUNCTION public.scpi_auto_history_reference_date();
-- One already-published, page-certified T3 record needs an immediate correction.
UPDATE public.scpi_indicator_history
SET snapshot_at='2026-09-30 23:59:59+00'::timestamptz
WHERE scpi_slug='perial-opportunites-europe'
  AND source_period='2026-T3'
  AND source_type='bulletin_edge_automated'
  AND snapshot_at::date='2026-10-31';
