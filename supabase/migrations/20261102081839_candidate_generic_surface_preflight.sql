-- Generic issuer-period preflight. Preserve the legacy CORUM contract verbatim.
-- A private, source-verified snapshot can be tested before activation; publication
-- still requires the responsible delegated review, signed digest and browser proof.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_tool_legacy_v2
WITH (security_invoker=true) AS
SELECT u.scpi_slug,
    i.scpi_slug IS NOT NULL AS catalog_and_simulator_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text)) OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM scpi_metric_certifications c1
             JOIN scpi_metric_certifications c2 ON c2.scpi_slug = c1.scpi_slug AND c2.source_period = c1.source_period AND c2.metric = 'management_fee_non_euro_zone_ht'::text
             JOIN maximus_agents.scpi_candidate_regulatory_documents d ON d.scpi_slug = c1.scpi_slug AND d.document_kind = 'statutes'::text AND d.source_url = c1.source_url AND d.source_url = c2.source_url AND d.identity_verified IS TRUE AND d.kind_verified IS TRUE AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'::text AND c1.source_page >= 1 AND c1.source_page <= d.page_count AND c2.source_page >= 1 AND c2.source_page <= d.page_count
          WHERE c1.scpi_slug = i.scpi_slug AND c1.source_period = i.source_period AND c1.metric = 'management_fee_euro_zone_ht'::text AND c1.verification_status = 'manual_verified_official'::text AND c2.verification_status = 'manual_verified_official'::text AND c1.verification_method = c2.verification_method AND c1.unit = 'PERCENT'::text AND c2.unit = 'PERCENT'::text AND c1.value_numeric > 0::numeric AND c1.value_numeric < 100::numeric AND c2.value_numeric > 0::numeric AND c2.value_numeric < 100::numeric))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text)) OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM scpi_metric_certifications c1
             JOIN scpi_metric_certifications c2 ON c2.scpi_slug = c1.scpi_slug AND c2.source_period = c1.source_period AND c2.metric = 'management_fee_non_euro_zone_ht'::text
             JOIN maximus_agents.scpi_candidate_regulatory_documents d ON d.scpi_slug = c1.scpi_slug AND d.document_kind = 'statutes'::text AND d.source_url = c1.source_url AND d.source_url = c2.source_url AND d.identity_verified IS TRUE AND d.kind_verified IS TRUE AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'::text AND c1.source_page >= 1 AND c1.source_page <= d.page_count AND c2.source_page >= 1 AND c2.source_page <= d.page_count
          WHERE c1.scpi_slug = i.scpi_slug AND c1.source_period = i.source_period AND c1.metric = 'management_fee_euro_zone_ht'::text AND c1.verification_status = 'manual_verified_official'::text AND c2.verification_status = 'manual_verified_official'::text AND c1.verification_method = c2.verification_method AND c1.unit = 'PERCENT'::text AND c2.unit = 'PERCENT'::text AND c1.value_numeric > 0::numeric AND c1.value_numeric < 100::numeric AND c2.value_numeric > 0::numeric AND c2.value_numeric < 100::numeric))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;
REVOKE ALL ON maximus_agents.scpi_candidate_tool_legacy_v2 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_tool_legacy_v2 TO service_role;

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_browser_preflight_v3
WITH (security_invoker=true) AS
SELECT r.scpi_slug,
 coalesce(
  (r.review_evidence->'browser_smoke'->>'status')='PASS'
  AND (r.review_evidence->'browser_smoke'->>'run_url')
   LIKE 'https://github.com/Speedcup212/maximus-scpi/actions/runs/%'
  AND (r.review_evidence->'browser_smoke'->>'commit_sha') ~ '^[a-f0-9]{40}$'
  AND (r.review_evidence->'browser_smoke'->>'artifact_zip_sha256') ~ '^[a-f0-9]{64}$'
  AND NOT EXISTS (
   SELECT 1
   FROM (VALUES ('profile'),('comparator_analysis'),('radar'),('simulator'),
                ('client_card'),('trajectory')) expected(surface)
   CROSS JOIN (VALUES (1440),(390)) viewport(width)
   WHERE NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(
     CASE WHEN jsonb_typeof(r.review_evidence->'browser_smoke'->'cases')='array'
     THEN r.review_evidence->'browser_smoke'->'cases' ELSE '[]'::jsonb END) c
    WHERE c->>'slug'=r.scpi_slug AND c->>'surface'=expected.surface
      AND c->>'width'=viewport.width::text AND c->>'status'='PASS'
   )
  ),false) AS browser_contract_ready
FROM maximus_agents.scpi_candidate_final_review r;
REVOKE ALL ON maximus_agents.scpi_candidate_browser_preflight_v3 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_browser_preflight_v3 TO service_role;

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_tool_readiness
WITH (security_invoker=true) AS
SELECT l.* FROM maximus_agents.scpi_candidate_tool_legacy_v2 l
WHERE NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_candidate_indicator_stage s
                  WHERE s.scpi_slug=l.scpi_slug)
UNION ALL
SELECT r.scpi_slug,
 r.current_indicators_ready AS catalog_and_simulator_ready,
 (r.current_indicators_ready AND r.allocations_verified
  AND r.independent_review_ready AND b.browser_contract_ready) AS comparator_radar_ready,
 (r.current_indicators_ready AND b.browser_contract_ready) AS client_card_ready,
 r.bulletin_analysis_ready AS analysis_ready,
 (r.live_trajectory_points>=2 AND b.browser_contract_ready) AS trajectory_ready,
 r.live_liquidity_ready AS liquidity_ready,
 r.final_release_ready AS finance_and_final_qa_ready,
 (r.final_release_ready AND b.browser_contract_ready) AS full_surface_ready
FROM maximus_agents.scpi_candidate_release_circuit_v3 r
JOIN maximus_agents.scpi_candidate_indicator_stage s USING(scpi_slug)
JOIN maximus_agents.scpi_candidate_browser_preflight_v3 b USING(scpi_slug);
REVOKE ALL ON maximus_agents.scpi_candidate_tool_readiness FROM PUBLIC,anon,authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_tool_readiness TO service_role;

-- Keep the compatibility view's actual historical columns; choose the current
-- issuer-period circuit for its readiness decisions when a private stage exists.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_final_release_v1
WITH (security_invoker=true) AS
SELECT v.scpi_slug,v.name,v.stage,v.lifecycle,v.annual_2025_sha_verified,
 v.quarter_2026_t2_sha_verified,v.annual_fields_qa_pass,v.quarter_fields_qa_pass,
 v.quarterly_core_qa_coverage,v.regulatory_and_source_registry_verified,
 CASE WHEN s.scpi_slug IS NOT NULL THEN
  (r.financial_sources_ready AND r.allocations_verified
   AND r.current_indicators_ready AND r.bulletin_analysis_ready
   AND r.live_trajectory_points>=2 AND r.live_liquidity_ready
   AND coalesce(b.browser_contract_ready,false))
 ELSE v.technical_ready END AS release_ready,
 CASE WHEN s.scpi_slug IS NOT NULL THEN
  (r.independent_review_ready AND r.independent_audit_ready
   AND r.responsible_batch_ready AND r.allocations_verified)
 ELSE v.responsible_batch_approved AND v.allocations_verified END AS full_qa_pass,
 CASE WHEN s.scpi_slug IS NOT NULL THEN
  (r.final_release_ready AND coalesce(b.browser_contract_ready,false))
 ELSE v.final_release_ready END AS final_release_ready
FROM maximus_agents.scpi_candidate_proportional_release_v2 v
LEFT JOIN maximus_agents.scpi_candidate_indicator_stage s USING(scpi_slug)
LEFT JOIN maximus_agents.scpi_candidate_release_circuit_v3 r USING(scpi_slug)
LEFT JOIN maximus_agents.scpi_candidate_browser_preflight_v3 b USING(scpi_slug);
REVOKE ALL ON maximus_agents.scpi_candidate_final_release_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_final_release_v1 TO service_role;
