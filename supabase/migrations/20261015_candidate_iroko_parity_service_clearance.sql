-- Service-only read-only readiness of the EXISTING Iroko Atlas site circuits.
CREATE OR REPLACE FUNCTION public.maximus_candidate_tool_clearance(p_slugs text[])
RETURNS TABLE(scpi_slug text,full_surface_ready boolean,catalog_and_simulator_ready boolean,
comparator_radar_ready boolean,client_card_ready boolean,analysis_ready boolean,
trajectory_ready boolean,liquidity_ready boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT t.scpi_slug,t.full_surface_ready,t.catalog_and_simulator_ready,
 t.comparator_radar_ready,t.client_card_ready,t.analysis_ready,
 t.trajectory_ready,t.liquidity_ready
 FROM maximus_agents.scpi_candidate_tool_readiness t
 WHERE t.scpi_slug=ANY(p_slugs)
 ORDER BY t.scpi_slug;
$$;
REVOKE ALL ON FUNCTION public.maximus_candidate_tool_clearance(text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.maximus_candidate_tool_clearance(text[]) TO service_role;
