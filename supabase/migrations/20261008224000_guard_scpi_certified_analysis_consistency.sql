-- MaximusSCPI: protections metier pour les analyses certifiees.
-- Une migration sur une DB deja corrigee doit etre idempotente.
-- Le correctif de source concerne le BTI Altixia Cadence XII T2 2026
-- (PDF officiel Altixia REIM : https://api.rock-n-data.io/fichiers/publications/6a708fd02b6f8415260897.pdf).

CREATE OR REPLACE FUNCTION public.scpi_filter_structural_price_gaps()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public'
AS $fn$
BEGIN
  -- Si le regime de capital change, un prix de souscription historique ne
  -- doit pas generer de surcote ou de decote artificielle.
  IF NEW.structural_event_detected IS TRUE THEN
    SELECT coalesce(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      INTO NEW.alerts
    FROM jsonb_array_elements(coalesce(NEW.alerts, '[]'::jsonb))
         WITH ORDINALITY AS e(item, ord)
    WHERE coalesce(item->>'metric', '') NOT IN
      ('surcote_reconstitution', 'decote_reconstitution');

    SELECT coalesce(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      INTO NEW.watch_points
    FROM jsonb_array_elements(coalesce(NEW.watch_points, '[]'::jsonb))
         WITH ORDINALITY AS e(item, ord)
    WHERE coalesce(item->>'metric', '') NOT IN
      ('surcote_reconstitution', 'decote_reconstitution');
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS zzz_scpi_analysis_structural_price_gap_guard
  ON public.scpi_bulletin_analysis;
CREATE TRIGGER zzz_scpi_analysis_structural_price_gap_guard
BEFORE INSERT OR UPDATE OF alerts, watch_points, structural_event_detected
ON public.scpi_bulletin_analysis
FOR EACH ROW EXECUTE FUNCTION public.scpi_filter_structural_price_gaps();

CREATE OR REPLACE FUNCTION public.scpi_filter_noncomparable_lease_deltas()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public'
AS $fn$
DECLARE
  prior_walt numeric;
  prior_walb numeric;
BEGIN
  prior_walt := CASE
    WHEN NEW.previous_snapshot->>'walt' ~ '^[0-9]+([.][0-9]+)?$'
    THEN (NEW.previous_snapshot->>'walt')::numeric
    ELSE NULL
  END;
  prior_walb := CASE
    WHEN NEW.previous_snapshot->>'walb' ~ '^[0-9]+([.][0-9]+)?$'
    THEN (NEW.previous_snapshot->>'walb')::numeric
    ELSE NULL
  END;

  -- En temps normal le WALB (duree ferme) ne peut exceder le WALT
  -- (duree totale). Si le bulletin precedent publie cette inversion,
  -- ne pas calculer de progression/regression fictive.
  IF prior_walt IS NOT NULL AND prior_walb IS NOT NULL
     AND prior_walb > prior_walt THEN
    SELECT coalesce(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      INTO NEW.deteriorations
    FROM jsonb_array_elements(coalesce(NEW.deteriorations, '[]'::jsonb))
         WITH ORDINALITY AS e(item, ord)
    WHERE coalesce(item->>'metric', '') NOT IN ('walt', 'walb');

    SELECT coalesce(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      INTO NEW.improvements
    FROM jsonb_array_elements(coalesce(NEW.improvements, '[]'::jsonb))
         WITH ORDINALITY AS e(item, ord)
    WHERE coalesce(item->>'metric', '') NOT IN ('walt', 'walb');

    IF NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(coalesce(NEW.watch_points, '[]'::jsonb)) w
      WHERE w->>'metric' = 'data_quality_lease_durations'
    ) THEN
      NEW.watch_points := coalesce(NEW.watch_points, '[]'::jsonb) ||
        jsonb_build_array(jsonb_build_object(
          'metric', 'data_quality_lease_durations',
          'severity', 'info',
          'quality_issue', true,
          'message', 'Evolution WALT/WALB non comparable : la periode precedente presente une duree ferme superieure a la duree totale restante.'
        ));
    END IF;
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS zzzz_scpi_analysis_lease_comparability_guard
  ON public.scpi_bulletin_analysis;
CREATE TRIGGER zzzz_scpi_analysis_lease_comparability_guard
BEFORE INSERT OR UPDATE OF improvements, deteriorations, watch_points, previous_snapshot
ON public.scpi_bulletin_analysis
FOR EACH ROW EXECUTE FUNCTION public.scpi_filter_noncomparable_lease_deltas();

-- Refiltrer les analyses existantes sans effacer les autres signaux.
UPDATE public.scpi_bulletin_analysis
SET watch_points = coalesce(watch_points, '[]'::jsonb),
    alerts = coalesce(alerts, '[]'::jsonb)
WHERE structural_event_detected IS TRUE;
UPDATE public.scpi_bulletin_analysis
SET deteriorations = coalesce(deteriorations, '[]'::jsonb),
    improvements = coalesce(improvements, '[]'::jsonb),
    watch_points = coalesce(watch_points, '[]'::jsonb)
WHERE previous_snapshot IS NOT NULL;
