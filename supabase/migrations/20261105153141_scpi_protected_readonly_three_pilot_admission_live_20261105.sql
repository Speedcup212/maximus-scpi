-- Live, private and read-only admission observations. Does NOT grant release authority.
CREATE OR REPLACE VIEW maximus_agents.scpi_industrial_admission_live_v1
WITH (security_invoker=true)
AS
WITH pilots(slug) AS (
 VALUES ('sofidynamic'::text),('opus-real'::text),('aew-opportunites-europe'::text)
)
SELECT p.slug AS scpi_slug,
 v.source_period,
 COALESCE(v.publisher_pdf_valid,false) AS current_pdf_identity_verified,
 COALESCE(v.current_qa_fields,0) AS current_metric_qa_count,
 COALESCE(v.annual_qa_fields,0) AS annual_metric_qa_count,
 COALESCE(v.core_qa_fields,0) AS regime_specific_core_qa_count,
 COALESCE(v.regulatory_documents_verified,0) AS regulatory_binary_count,
 COALESCE(v.financial_sources_ready,false) AS source_financial_gate,
 COALESCE(v.allocations_verified,false) AS allocation_gate,
 COALESCE(v.current_indicators_ready,false) AS candidate_indicator_gate,
 COALESCE(v.bulletin_analysis_ready,false) AS analysis_gate,
 COALESCE(v.independent_review_ready,false) AS independent_review_gate,
 COALESCE(v.independent_audit_ready,false) AS independent_audit_gate,
 COALESCE(v.responsible_batch_ready,false) AS responsible_batch_gate,
 COALESCE(b.browser_contract_ready,false) AS six_surface_browser_gate,
 COALESCE(f.final_release_ready,false) AS final_release_gate,
 COALESCE(r.verification_status='verified' AND r.confidence_level='high',false) AS registry_links_verified,
 COALESCE((SELECT legal_identity_passed AND dic_risk_sfdr_review_passed
 FROM maximus_agents.scpi_candidate_final_review rv WHERE rv.scpi_slug=p.slug),false) AS regulatory_legal_review_gate,
 COALESCE(v.live_trajectory_points,0) AS qa_historical_period_count,
 COALESCE(v.live_liquidity_ready,false) AS liquidity_disclosure_gate,
 CASE WHEN COALESCE(f.final_release_ready,false) THEN 'AWAIT_PROTECTED_POSTDEPLOY_READBACK'
 ELSE 'NOT_ELIGIBLE_FOR_PRODUCTION_READBACK' END AS production_readback_status,
 false::boolean AS admission_100_proven,
 false::boolean AS publication_authorized_by_observation
FROM pilots p
LEFT JOIN maximus_agents.scpi_candidate_release_circuit_v3 v ON v.scpi_slug=p.slug
LEFT JOIN maximus_agents.scpi_candidate_final_release_v1 f ON f.scpi_slug=p.slug
LEFT JOIN maximus_agents.scpi_candidate_browser_preflight_v3 b ON b.scpi_slug=p.slug
LEFT JOIN public.scpi_source_registry r ON r.scpi_slug=p.slug;
REVOKE ALL ON TABLE maximus_agents.scpi_industrial_admission_live_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE maximus_agents.scpi_industrial_admission_live_v1 TO service_role;
