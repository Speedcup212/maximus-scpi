-- MaximusSCPI 211-fund delivery milestone. No new worker or duplicated data state.
-- Reuse the existing candidate queue, underlying official-source gates and Iroko Atlas tool checks.
-- Preserve the existing public/private access model; only private maximus_agents views.
-- Publishing remains an independent controlled act; these views authorize NOTHING.

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_work_queue AS
SELECT u.scpi_slug,u.name,u.management_company,u.origin_type,u.origin_url,u.stage,
 CASE
  WHEN NOT coalesce(g.annual_2025_sha_verified,false)
    OR NOT coalesce(g.quarter_2026_t2_sha_verified,false)
    THEN CASE WHEN u.stage='identity_only'
      THEN CASE WHEN u.origin_type='aspim_official'
        THEN 'LOCATE_PRIMARY_ISSUER_DOCUMENTS'
        ELSE 'VERIFY_EXISTENCE_AND_PRODUCT_STATUS' END
      ELSE 'VERIFY_PDF_AND_IDENTITY' END
  WHEN coalesce(g.annual_fields_qa_pass,0)<4
    OR coalesce(g.quarter_fields_qa_pass,0)<5
    OR coalesce(g.quarterly_core_qa_coverage,0)<4
    THEN 'COMPLETE_PAGINATED_METRIC_QA'
  WHEN NOT coalesce(g.regulatory_and_source_registry_verified,false)
    THEN 'VERIFY_REGULATORY_AND_SOURCE_REGISTRY'
  WHEN NOT coalesce(t.analysis_ready,false)
    THEN 'CERTIFY_EXACT_PERIOD_BULLETIN_ANALYSIS'
  WHEN NOT (coalesce(t.catalog_and_simulator_ready,false)
        AND coalesce(t.comparator_radar_ready,false)
        AND coalesce(t.client_card_ready,false)
        AND coalesce(t.trajectory_ready,false)
        AND coalesce(t.liquidity_ready,false))
    THEN 'COMPLETE_IROKO_ATLAS_TOOL_PARITY'
  WHEN NOT coalesce(t.finance_and_final_qa_ready,false)
    THEN 'INDEPENDENT_FINANCIAL_AND_FINAL_QA'
  ELSE 'CONTROLLED_PUBLICATION_REVIEW'
 END AS next_action,
 CASE
  WHEN coalesce(g.annual_2025_sha_verified,false)
   AND coalesce(g.quarter_2026_t2_sha_verified,false)
   AND coalesce(g.annual_fields_qa_pass,0)>=4
   AND coalesce(g.quarter_fields_qa_pass,0)>=5
   AND coalesce(g.quarterly_core_qa_coverage,0)>=4
   AND coalesce(g.regulatory_and_source_registry_verified,false) THEN 0
  WHEN coalesce(g.annual_2025_sha_verified,false)
   AND coalesce(g.quarter_2026_t2_sha_verified,false) THEN 1
  WHEN u.stage='primary_source_found' THEN 2
  WHEN u.origin_type='aspim_official' THEN 3
  ELSE 4
 END AS priority_bucket,
 u.review_note,u.first_seen_at,u.last_checked_at
FROM maximus_agents.scpi_universe u
LEFT JOIN maximus_agents.scpi_candidate_publication_gate_v1 g ON g.scpi_slug=u.scpi_slug
LEFT JOIN maximus_agents.scpi_candidate_tool_readiness t ON t.scpi_slug=u.scpi_slug
WHERE u.lifecycle='candidate' AND NOT u.strict_pass AND NOT u.publication_authorized;

-- A single read-only delivery board spanning precisely the 61 existing and 150
-- candidate identities. Stages come exclusively from current data, not human claims.
CREATE OR REPLACE VIEW maximus_agents.scpi_delivery_211 AS
SELECT u.scpi_slug,u.name,u.management_company,u.lifecycle,u.stage,
 CASE WHEN u.lifecycle='existing' THEN
    CASE WHEN NOT coalesce(u.strict_pass,false)
      THEN 'REPAIR_STRICT_SOURCE_QA'
     WHEN NOT coalesce(u.analysis_certified,false)
      THEN 'CERTIFY_HISTORICAL_ANALYSIS'
     WHEN NOT coalesce(u.publication_authorized,false)
      THEN 'INDEPENDENT_APPROVAL_REVIEW'
     ELSE 'PUBLIC_API_AUTHORIZED' END
  ELSE coalesce(q.next_action,'VERIFY_EXISTENCE_AND_PRODUCT_STATUS') END AS next_action,
 CASE WHEN u.lifecycle='existing' THEN
    CASE WHEN u.strict_pass AND u.analysis_certified AND u.publication_authorized
      THEN 9 ELSE 0 END
  ELSE coalesce(q.priority_bucket,4)+1 END AS delivery_priority,
 (u.lifecycle='existing' AND u.strict_pass AND u.analysis_certified
    AND u.publication_authorized) AS public_api_approved,
 (u.lifecycle='candidate' AND coalesce(g.annual_2025_sha_verified,false)
    AND coalesce(g.quarter_2026_t2_sha_verified,false)
    AND coalesce(g.annual_fields_qa_pass,0)>=4
    AND coalesce(g.quarter_fields_qa_pass,0)>=5
    AND coalesce(g.quarterly_core_qa_coverage,0)>=4
    AND coalesce(g.regulatory_and_source_registry_verified,false)) AS primary_evidence_ready,
 coalesce(t.analysis_ready,false) AS analysis_ready,
 coalesce(t.finance_and_final_qa_ready,false) AS final_qa_ready,
 coalesce(t.full_surface_ready,false) AS full_surface_ready,
 u.last_checked_at
FROM maximus_agents.scpi_universe u
LEFT JOIN maximus_agents.scpi_candidate_work_queue q ON q.scpi_slug=u.scpi_slug
LEFT JOIN maximus_agents.scpi_candidate_publication_gate_v1 g ON g.scpi_slug=u.scpi_slug
LEFT JOIN maximus_agents.scpi_candidate_tool_readiness t ON t.scpi_slug=u.scpi_slug
WHERE u.lifecycle IN ('existing','candidate');

CREATE OR REPLACE VIEW maximus_agents.scpi_delivery_211_summary AS
SELECT count(*)::integer AS identified_funds,
 count(*) FILTER(WHERE lifecycle='existing')::integer AS historical,
 count(*) FILTER(WHERE lifecycle='candidate')::integer AS candidates,
 count(*) FILTER(WHERE public_api_approved)::integer AS public_api_approved,
 count(*) FILTER(WHERE lifecycle='existing' AND NOT public_api_approved)::integer AS historical_unresolved,
 count(*) FILTER(WHERE lifecycle='candidate' AND primary_evidence_ready)::integer AS candidate_source_and_metrics_ready,
 count(*) FILTER(WHERE lifecycle='candidate' AND analysis_ready)::integer AS candidate_analyses_ready,
 count(*) FILTER(WHERE lifecycle='candidate' AND final_qa_ready)::integer AS candidate_final_qa_ready,
 count(*) FILTER(WHERE lifecycle='candidate' AND full_surface_ready)::integer AS candidate_all_surfaces_ready,
 count(*) FILTER(WHERE lifecycle='candidate' AND next_action IN
    ('LOCATE_PRIMARY_ISSUER_DOCUMENTS','VERIFY_EXISTENCE_AND_PRODUCT_STATUS'))::integer AS candidates_to_identify_or_source,
 count(*) FILTER(WHERE lifecycle='candidate' AND next_action='CERTIFY_EXACT_PERIOD_BULLETIN_ANALYSIS')::integer AS candidates_waiting_analysis
FROM maximus_agents.scpi_delivery_211;

-- Keep source-and-finance status private; no anon/authenticated view access.
REVOKE ALL ON maximus_agents.scpi_delivery_211 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON maximus_agents.scpi_delivery_211_summary FROM PUBLIC,anon,authenticated;
