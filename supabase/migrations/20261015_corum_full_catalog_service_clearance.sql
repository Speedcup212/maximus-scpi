-- Read-only service-role clearance before a candidate becomes a public catalog row.
-- Prevents publishing from a stale GitHub fixture or from a partial UI signoff.
CREATE OR REPLACE FUNCTION public.maximus_candidate_release_clearance(p_slugs text[])
 RETURNS TABLE(scpi_slug text, release_ready boolean, publication_authorized boolean, analysis_certified boolean, live_indicators_ok boolean, liquidity_ok boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 SELECT u.scpi_slug,g.release_ready,u.publication_authorized,u.analysis_certified,
 EXISTS(SELECT 1 FROM public.scpi_indicators i WHERE i.scpi_slug=u.scpi_slug
   AND i.prix_souscription>0 AND i.td>0 AND i.tof BETWEEN 0 AND 100
   AND i.nombre_parts>0 AND i.qa_status IS NOT NULL),
 EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot_liquidity li
    WHERE li.scpi_slug=u.scpi_slug AND li.liquidity_basis IS NOT NULL
      AND li.nombre_parts>0)
 FROM maximus_agents.scpi_universe u
 JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING(scpi_slug)
 WHERE u.scpi_slug=ANY(p_slugs) AND u.lifecycle='candidate'
 ORDER BY u.scpi_slug;
$function$
;
REVOKE ALL ON FUNCTION public.maximus_candidate_release_clearance(text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.maximus_candidate_release_clearance(text[]) TO service_role;
