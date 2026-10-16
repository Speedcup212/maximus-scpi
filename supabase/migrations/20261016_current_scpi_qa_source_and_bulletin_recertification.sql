-- Repair the final missing source->analysis transition in the EXISTING pipeline.
-- The historical trigger observed numeric changes, but not QA status / verified
-- official bulletin identity. The 4 CORUM T1+T2 sources demonstrated a stuck
-- review_required until a manual certify_scpi_bulletin_analysis() call.
-- This migration NEVER edits any QA status, numeric metric or publication flag.
DROP TRIGGER IF EXISTS trg_scpi_indicators_refresh_analysis ON public.scpi_indicators;
CREATE TRIGGER trg_scpi_indicators_refresh_analysis
  AFTER INSERT OR UPDATE OF
    source_period,qa_status,source_url,bulletin_id,
    tof,capitalisation,prix_souscription,prix_reconstitution,prix_retrait,
    valeur_realisation,endettement,walt,walb,collecte_nette,nombre_locataires,
    nombre_immeubles,nombre_associes,nombre_parts,parts_attente_retrait,
    distribution_par_part,capital_type
  ON public.scpi_indicators
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_scpi_bulletin_analysis();

-- Verify the active trigger listens to the two previously omitted transitions.
DO $verify$
DECLARE ddl text;
BEGIN
 SELECT pg_get_triggerdef(oid,true) INTO ddl
 FROM pg_trigger WHERE tgrelid='public.scpi_indicators'::regclass
   AND tgname='trg_scpi_indicators_refresh_analysis' AND tgenabled='O';
 IF ddl IS NULL OR ddl NOT ILIKE '%qa_status%'
    OR ddl NOT ILIKE '%bulletin_id%' OR ddl NOT ILIKE '%source_url%'
    OR ddl NOT ILIKE '%trg_refresh_scpi_bulletin_analysis%' THEN
   RAISE EXCEPTION 'Source QA -> analysis trigger not correctly installed';
 END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe
    WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
      AND (publication_authorized OR analysis_certified)) THEN
   RAISE EXCEPTION 'CORUM candidate publication flags must remain private';
 END IF;
END $verify$;
