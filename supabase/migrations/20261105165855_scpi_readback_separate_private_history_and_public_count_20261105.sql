SET LOCAL lock_timeout='3s';
-- Preserve public historical count as-is, and independently expose source-backed private prepublication history.
-- No change to admission_100_proven, publication rights or responsible QA.
CREATE OR REPLACE VIEW maximus_agents.scpi_industrial_admission_live_v1 WITH (security_invoker=true) AS
 WITH pilots(slug) AS (
         VALUES ('sofidynamic'::text), ('opus-real'::text), ('aew-opportunites-europe'::text)
        )
 SELECT p.slug AS scpi_slug,
    v.source_period,
    COALESCE(v.publisher_pdf_valid, false) AS current_pdf_identity_verified,
    COALESCE(v.current_qa_fields, 0::bigint) AS current_metric_qa_count,
    COALESCE(v.annual_qa_fields, 0::bigint) AS annual_metric_qa_count,
    COALESCE(v.core_qa_fields, 0::bigint) AS regime_specific_core_qa_count,
    COALESCE(v.regulatory_documents_verified, 0::bigint) AS regulatory_binary_count,
    COALESCE(v.financial_sources_ready, false) AS source_financial_gate,
    COALESCE(v.allocations_verified, false) AS allocation_gate,
    COALESCE(v.current_indicators_ready, false) AS candidate_indicator_gate,
    COALESCE(v.bulletin_analysis_ready, false) AS analysis_gate,
    COALESCE(v.independent_review_ready, false) AS independent_review_gate,
    COALESCE(v.independent_audit_ready, false) AS independent_audit_gate,
    COALESCE(v.responsible_batch_ready, false) AS responsible_batch_gate,
    COALESCE(b.browser_contract_ready, false) AS six_surface_browser_gate,
    COALESCE(v.final_release_ready, false) AS final_release_gate,
    COALESCE(r.verification_status = 'verified'::text AND r.confidence_level = 'high'::text, false) AS registry_links_verified,
    COALESCE(( SELECT rv.legal_identity_passed AND rv.dic_risk_sfdr_review_passed
           FROM maximus_agents.scpi_candidate_final_review rv
          WHERE rv.scpi_slug = p.slug), false) AS regulatory_legal_review_gate,
    COALESCE(v.live_trajectory_points, 0::bigint) AS qa_historical_period_count,
    COALESCE(v.live_liquidity_ready, false) AS liquidity_disclosure_gate,
        CASE
            WHEN COALESCE(v.final_release_ready, false) THEN 'AWAIT_PROTECTED_POSTDEPLOY_READBACK'::text
            ELSE 'NOT_ELIGIBLE_FOR_PRODUCTION_READBACK'::text
        END AS production_readback_status,
    false AS admission_100_proven,
    false AS publication_authorized_by_observation,
    COALESCE(v.prepublication_verified_history_periods, 0::bigint) AS prepublication_verified_history_periods,
    COALESCE(v.prepublication_history_consistency_ready, false) AS prepublication_history_consistency_ready
   FROM pilots p
     LEFT JOIN maximus_agents.scpi_candidate_release_circuit_v3 v ON v.scpi_slug = p.slug
     LEFT JOIN maximus_agents.scpi_candidate_browser_preflight_v3 b ON b.scpi_slug = p.slug
     LEFT JOIN scpi_source_registry r ON r.scpi_slug = p.slug;;
