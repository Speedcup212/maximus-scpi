CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_work_queue AS
 SELECT u.scpi_slug,
    u.name,
    u.management_company,
    u.origin_type,
    u.origin_url,
    u.stage,
        CASE
            WHEN NOT COALESCE(g.annual_2025_sha_verified, false)
              OR NOT (
                 COALESCE(g.quarter_2026_t2_sha_verified, false)
                 OR EXISTS (
                   SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation semi
                   WHERE semi.scpi_slug=u.scpi_slug
                     AND semi.document_kind='semiannual_bulletin'
                     AND semi.source_period='2026-S1'
                     AND semi.document_identity_verified
                     AND semi.native_text_characters > 1000
                     AND semi.pdf_sha256 ~ '^[0-9a-f]{64}$'
                     AND maximus_agents.is_verified_candidate_issuer_source(semi.source_url)
                 )
              ) THEN
            CASE
                WHEN u.stage = 'identity_only'::text THEN
                CASE
                    WHEN u.origin_type = 'aspim_official'::text THEN 'LOCATE_PRIMARY_ISSUER_DOCUMENTS'::text
                    ELSE 'VERIFY_EXISTENCE_AND_PRODUCT_STATUS'::text
                END
                ELSE 'VERIFY_PDF_AND_IDENTITY'::text
            END
            WHEN COALESCE(g.annual_fields_qa_pass, 0::bigint) < 4 OR COALESCE(g.quarter_fields_qa_pass, 0::bigint) < 5 OR COALESCE(g.quarterly_core_qa_coverage, 0::bigint) < 4 THEN 'COMPLETE_PAGINATED_METRIC_QA'::text
            WHEN NOT COALESCE(g.regulatory_and_source_registry_verified, false) THEN 'VERIFY_REGULATORY_AND_SOURCE_REGISTRY'::text
            WHEN NOT COALESCE(t.analysis_ready, false) THEN 'CERTIFY_EXACT_PERIOD_BULLETIN_ANALYSIS'::text
            WHEN NOT COALESCE(t.catalog_and_simulator_ready, false) OR NOT COALESCE(t.comparator_radar_ready, false) OR NOT COALESCE(t.client_card_ready, false) OR NOT COALESCE(t.trajectory_ready, false) OR NOT COALESCE(t.liquidity_ready, false) THEN 'COMPLETE_IROKO_ATLAS_TOOL_PARITY'::text
            WHEN NOT COALESCE(al.allocations_verified, false) THEN 'VERIFY_EXACT_PERIOD_ALLOCATIONS'::text
            WHEN NOT COALESCE(t.finance_and_final_qa_ready, false) THEN 'INDEPENDENT_FINANCIAL_AND_FINAL_QA'::text
            ELSE 'CONTROLLED_PUBLICATION_REVIEW'::text
        END AS next_action,
        CASE
            WHEN COALESCE(g.annual_2025_sha_verified, false) AND COALESCE(g.quarter_2026_t2_sha_verified, false) AND COALESCE(g.annual_fields_qa_pass, 0::bigint) >= 4 AND COALESCE(g.quarter_fields_qa_pass, 0::bigint) >= 5 AND COALESCE(g.quarterly_core_qa_coverage, 0::bigint) >= 4 AND COALESCE(g.regulatory_and_source_registry_verified, false) THEN 0
            WHEN COALESCE(g.annual_2025_sha_verified, false) AND COALESCE(g.quarter_2026_t2_sha_verified, false) THEN 1
            WHEN u.stage = 'primary_source_found'::text THEN 2
            WHEN u.origin_type = 'aspim_official'::text THEN 3
            ELSE 4
        END AS priority_bucket,
    u.review_note,
    u.first_seen_at,
    u.last_checked_at
   FROM maximus_agents.scpi_universe u
     LEFT JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN maximus_agents.scpi_candidate_tool_readiness t USING (scpi_slug)
     LEFT JOIN maximus_agents.scpi_candidate_allocation_certification_v1 al USING (scpi_slug)
  WHERE u.lifecycle = 'candidate'::text AND NOT u.strict_pass AND NOT u.publication_authorized;
