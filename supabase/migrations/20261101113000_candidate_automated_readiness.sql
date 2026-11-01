CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_automated_readiness_v1 WITH (security_invoker = true) AS
SELECT scpi_slug, source_period, publisher_pdf_valid, financial_sources_ready,
allocations_verified, current_indicators_ready, bulletin_analysis_ready,
historical_periods, live_trajectory_points, live_liquidity_ready,
(coalesce(publisher_pdf_valid,false) AND coalesce(financial_sources_ready,false)
AND coalesce(allocations_verified,false) AND coalesce(current_indicators_ready,false)
AND coalesce(bulletin_analysis_ready,false) AND historical_periods >= 2
AND live_trajectory_points >= 2 AND coalesce(live_liquidity_ready,false))
AS automated_evidence_pass,
independent_review_ready, independent_audit_ready, responsible_batch_ready,
final_release_ready
FROM maximus_agents.scpi_candidate_release_circuit_v3;
REVOKE ALL ON maximus_agents.scpi_candidate_automated_readiness_v1 FROM PUBLIC, anon, authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_automated_readiness_v1 TO service_role;
