-- One SCPI = ONE Iroko-Atlas-derived frontend template + same existing data
-- circuits for SEO/comparator/score/radar/liquidity/trajectory/client.
-- This prevents financial QA alone from making a candidate publishable.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_tool_readiness AS
 SELECT u.scpi_slug,
    i.scpi_slug IS NOT NULL AS catalog_and_simulator_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND i.frais_gestion IS NOT NULL AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    u.analysis_certified IS TRUE AND g.release_ready IS TRUE AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND i.frais_gestion IS NOT NULL AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND u.analysis_certified IS TRUE AND g.release_ready IS TRUE AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;;
REVOKE ALL ON maximus_agents.scpi_candidate_tool_readiness FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION maximus_agents.scpi_guard_new_candidate_release()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE ok boolean;
BEGIN
 IF COALESCE(NEW.publication_authorized,false) AND
    (NEW.lifecycle='candidate' OR EXISTS(
      SELECT 1 FROM maximus_agents.scpi_candidate_release_members m
      WHERE m.scpi_slug=NEW.scpi_slug)) THEN
   SELECT (v.final_release_ready IS TRUE AND t.full_surface_ready IS TRUE) INTO ok
   FROM maximus_agents.scpi_candidate_final_release_v1 v
   LEFT JOIN maximus_agents.scpi_candidate_tool_readiness t
     ON t.scpi_slug=v.scpi_slug
   WHERE v.scpi_slug=NEW.scpi_slug;
   IF NOT COALESCE(ok,false) THEN
     RAISE EXCEPTION 'SCPI_CANDIDATE_FINAL_RELEASE_BLOCKED: verified source, financial/history/risk QA, signed audit and all Iroko-Atlas-parity site circuits required for %',NEW.scpi_slug
     USING ERRCODE='check_violation';
   END IF;
 END IF;
 RETURN NEW;
END;$function$
;
REVOKE ALL ON FUNCTION maximus_agents.scpi_guard_new_candidate_release() FROM PUBLIC,anon,authenticated;
-- Existing candidate publication trigger reuses this definition unchanged.
