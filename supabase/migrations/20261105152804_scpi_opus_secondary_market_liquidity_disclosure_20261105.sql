SET LOCAL lock_timeout='3s';
-- Readiness here concerns source-backed disclosure of secondary-market risk, not an assertion of liquidity or executable exit prices.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_release_circuit_v3 AS
 WITH candidates AS (
         SELECT u.scpi_slug,
            u.name,
            u.lifecycle,
            u.publication_authorized
           FROM maximus_agents.scpi_universe u
             JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
        ), source AS (
         SELECT c_1.scpi_slug,
            c_1.name,
            c_1.lifecycle,
            c_1.publication_authorized,
            p.source_period,
            p.source_url,
            p.pdf_sha256,
            p.page_count,
            p.validated_at AS pdf_validated_at,
            p.scpi_slug IS NOT NULL AND p.document_identity_verified AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'::text AND p.page_count > 0 AND p.source_url ~~ 'https://%'::text AS publisher_pdf_valid
           FROM candidates c_1
             LEFT JOIN LATERAL ( SELECT v.scpi_slug,
                    v.source_period,
                    v.document_kind,
                    v.source_url,
                    v.pdf_sha256,
                    v.page_count,
                    v.native_text_characters,
                    v.document_identity_verified,
                    v.identity_evidence,
                    v.inspect_request_id,
                    v.validated_at
                   FROM maximus_agents.scpi_candidate_pdf_validation v
                  WHERE v.scpi_slug = c_1.scpi_slug AND (v.document_kind = ANY (ARRAY['quarterly_bulletin'::text, 'semiannual_bulletin'::text])) AND v.source_period ~ '^20[0-9]{2}-(T[1-4]|S[12])$'::text
                  ORDER BY v.source_period DESC, v.validated_at DESC
                 LIMIT 1) p ON true
        ), counted AS (
         SELECT s.scpi_slug,
            s.name,
            s.lifecycle,
            s.publication_authorized,
            s.source_period,
            s.source_url,
            s.pdf_sha256,
            s.page_count,
            s.pdf_validated_at,
            s.publisher_pdf_valid,
            ( SELECT count(DISTINCT e.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = s.source_period AND (e.document_kind = ANY (ARRAY['quarterly_bulletin'::text, 'semiannual_bulletin'::text])) AND e.source_url = s.source_url AND e.source_page >= 1 AND e.source_page <= s.page_count AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.numeric_value IS NOT NULL) AS current_qa_fields,
            ( SELECT count(DISTINCT e.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = '2025-RA'::text AND e.document_kind = 'annual_report'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND (EXISTS ( SELECT 1
                           FROM maximus_agents.scpi_candidate_pdf_validation ap_1
                          WHERE ap_1.scpi_slug = e.scpi_slug AND ap_1.source_period = '2025-RA'::text AND ap_1.document_kind = 'annual_report'::text AND ap_1.source_url = e.source_url AND ap_1.document_identity_verified AND e.source_page >= 1 AND e.source_page <= ap_1.page_count))) AS annual_qa_fields,
            ( SELECT count(DISTINCT
                        CASE
                            WHEN (EXISTS ( SELECT 1
                               FROM maximus_agents.scpi_candidate_indicator_stage i
                              WHERE i.scpi_slug = s.scpi_slug AND i.source_period = s.source_period AND i.source_url = s.source_url AND i.capital_type = 'variable_suspended'::text AND (i.metric_provenance ->> 'liquidity_basis'::text) = 'secondary_market_order_book'::text AND (i.metric_provenance ->> 'pdf_sha256'::text) = s.pdf_sha256)) THEN
                            CASE
                                WHEN e.metric = 'nombre_parts'::text THEN 'shares'::text
                                WHEN e.metric = 'nombre_associes'::text THEN 'investors'::text
                                WHEN e.metric = 'nombre_immeubles'::text THEN 'buildings'::text
                                WHEN e.metric = 'nombre_locataires'::text THEN 'tenants'::text
                                WHEN e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text]) THEN 'occupancy'::text
                                WHEN e.metric = 'walb'::text THEN 'walb'::text
                                WHEN e.metric = ANY (ARRAY['distribution_par_part'::text, 'distribution_brute_par_part'::text]) THEN 'distribution'::text
                                WHEN e.metric = ANY (ARRAY['prix_reconstitution'::text, 'valeur_reconstitution_par_part'::text]) THEN 'reconstruction'::text
                                WHEN e.metric = ANY (ARRAY['valeur_realisation'::text, 'valeur_realisation_par_part'::text]) THEN 'realization'::text
                                WHEN e.metric = 'srri'::text THEN 'risk'::text
                                WHEN e.metric = 'parts_inscrites_vente'::text THEN 'secondary_sell_order'::text
                                ELSE NULL::text
                            END
                            WHEN s.source_period ~ '^20[0-9]{2}-S[12]$'::text THEN
                            CASE
                                WHEN e.metric = 'nombre_parts'::text THEN 'shares'::text
                                WHEN e.metric = 'nombre_associes'::text THEN 'investors'::text
                                WHEN e.metric = 'capitalisation'::text THEN 'capitalisation'::text
                                WHEN e.metric = 'prix_souscription'::text THEN 'subscription'::text
                                WHEN e.metric = 'prix_retrait'::text THEN 'withdrawal_price'::text
                                WHEN e.metric = 'parts_attente_retrait'::text THEN 'withdrawal_queue'::text
                                WHEN e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text]) THEN 'occupancy'::text
                                WHEN e.metric = ANY (ARRAY['prix_reconstitution'::text, 'valeur_reconstitution_par_part'::text]) THEN 'reconstruction'::text
                                WHEN e.metric = ANY (ARRAY['valeur_realisation'::text, 'valeur_realisation_par_part'::text]) THEN 'realization'::text
                                WHEN e.metric = 'top'::text THEN 'physical_occupancy'::text
                                WHEN e.metric = 'endettement'::text THEN 'debt'::text
                                ELSE NULL::text
                            END
                            ELSE
                            CASE
                                WHEN e.metric = 'nombre_parts'::text THEN 'shares'::text
                                WHEN e.metric = 'nombre_associes'::text THEN 'investors'::text
                                WHEN e.metric = 'capitalisation'::text THEN 'capitalisation'::text
                                WHEN e.metric = 'prix_souscription'::text THEN 'subscription'::text
                                WHEN e.metric = 'prix_retrait'::text THEN 'withdrawal_price'::text
                                WHEN e.metric = 'parts_attente_retrait'::text THEN 'withdrawal_queue'::text
                                WHEN e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text]) THEN 'occupancy'::text
                                WHEN e.metric = ANY (ARRAY['prix_reconstitution'::text, 'valeur_reconstitution_par_part'::text]) THEN 'reconstruction'::text
                                WHEN e.metric = ANY (ARRAY['valeur_realisation'::text, 'valeur_realisation_par_part'::text]) THEN 'realization'::text
                                WHEN e.metric = ANY (ARRAY['distribution_par_part'::text, 'distribution_brute_par_part'::text]) THEN 'distribution'::text
                                WHEN e.metric = 'endettement'::text THEN 'debt'::text
                                ELSE NULL::text
                            END
                        END) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = s.source_period AND e.source_url = s.source_url AND (e.document_kind = ANY (ARRAY['quarterly_bulletin'::text, 'semiannual_bulletin'::text])) AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page >= 1 AND e.source_page <= s.page_count) AS core_qa_fields,
            ( SELECT count(DISTINCT d.document_kind) AS count
                   FROM maximus_agents.scpi_candidate_regulatory_documents d
                  WHERE d.scpi_slug = s.scpi_slug AND (d.document_kind = ANY (ARRAY['dic'::text, 'note'::text, 'statutes'::text])) AND d.identity_verified AND d.kind_verified AND d.source_url ~~ 'https://%'::text AND d.pdf_sha256 ~ '^[0-9a-f]{64}$'::text AND d.page_count > 0) AS regulatory_documents_verified
           FROM source s
        ), allocation_axes AS (
         SELECT c_1.scpi_slug,
            a_1.allocation_type,
            count(*) FILTER (WHERE a_1.qa_status = 'qa_pass'::text AND a_1.source_period = c_1.source_period AND a_1.source_url = c_1.source_url AND a_1.source_sha256 = c_1.pdf_sha256 AND a_1.source_page >= 1 AND a_1.source_page <= c_1.page_count AND length(COALESCE(a_1.evidence_excerpt, ''::text)) >= 40 AND a_1.pct >= 0::numeric AND a_1.pct <= 100::numeric) AS verified_count,
            count(*) AS row_count,
            count(DISTINCT a_1.label) AS labels_count,
            sum(a_1.pct) AS total
           FROM counted c_1
             LEFT JOIN maximus_agents.scpi_candidate_allocations a_1 ON a_1.scpi_slug = c_1.scpi_slug AND a_1.source_period = c_1.source_period AND a_1.source_url = c_1.source_url AND a_1.source_sha256 = c_1.pdf_sha256
          GROUP BY c_1.scpi_slug, a_1.allocation_type
        ), allocations AS (
         SELECT c_1.scpi_slug,
            COALESCE(bool_or(a_1.allocation_type = 'geography'::text AND a_1.verified_count = a_1.row_count AND a_1.labels_count = a_1.row_count AND a_1.row_count > 0 AND abs(a_1.total - 100::numeric) <= (0.05 * a_1.row_count::numeric)), false) AS geography_verified,
            COALESCE(bool_or(a_1.allocation_type = 'sector'::text AND a_1.verified_count = a_1.row_count AND a_1.labels_count = a_1.row_count AND a_1.row_count > 0 AND abs(a_1.total - 100::numeric) <= (0.05 * a_1.row_count::numeric)), false) AS sector_verified
           FROM counted c_1
             LEFT JOIN allocation_axes a_1 USING (scpi_slug)
          GROUP BY c_1.scpi_slug
        ), app AS (
         SELECT c_1.scpi_slug,
            i.scpi_slug IS NOT NULL AND i.source_period = c_1.source_period AND i.source_url = c_1.source_url AND (i.metric_provenance ->> 'pdf_sha256'::text) = c_1.pdf_sha256 AND i.nombre_parts > 0 AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.repartition_geographique IS NOT NULL AND i.repartition_sectorielle IS NOT NULL AND i.prix_reconstitution > 0::numeric AND i.valeur_realisation > 0::numeric AND (i.capital_type = 'variable'::text AND i.prix_souscription > 0::numeric AND i.capitalisation > 100::numeric AND (i.metric_provenance ->> 'liquidity_basis'::text) = 'withdrawal_queue'::text OR i.capital_type = 'variable_suspended'::text AND i.prix_souscription IS NULL AND i.capitalisation IS NULL AND (i.metric_provenance ->> 'liquidity_basis'::text) = 'secondary_market_order_book'::text AND (EXISTS ( SELECT 1
                   FROM maximus_agents.scpi_candidate_metric_evidence orders
                  WHERE orders.scpi_slug = c_1.scpi_slug AND orders.source_period = c_1.source_period AND orders.metric = 'parts_inscrites_vente'::text AND orders.qa_status = 'qa_pass'::text AND orders.source_url = c_1.source_url AND orders.numeric_value >= 0::numeric AND orders.independently_reviewed_at IS NOT NULL AND orders.source_page >= 1 AND orders.source_page <= c_1.page_count))) AS current_indicators_ready,
            b.scpi_slug IS NOT NULL AND b.current_period = c_1.source_period AND b.status = 'complete'::text AND (b.certification_status = ANY (ARRAY['certified'::text, 'current_certified_history_unverified'::text])) AND b.current_source_certified AND b.certified_source_url = c_1.source_url AND (b.comparison_certified AND b.certification_status = 'certified'::text OR NOT b.comparison_certified AND b.current_snapshot IS NOT NULL AND jsonb_array_length(COALESCE(b.certification_reasons, '[]'::jsonb)) > 0 AND jsonb_array_length(COALESCE(b.improvements, '[]'::jsonb)) = 0 AND jsonb_array_length(COALESCE(b.deteriorations, '[]'::jsonb)) = 0) AS bulletin_analysis_ready,
            ( SELECT count(DISTINCT h.source_period) AS count
                   FROM scpi_indicator_history h
                  WHERE h.scpi_slug = c_1.scpi_slug AND h.source_url ~~ 'https://%'::text AND h.source_period ~ '^20[0-9]{2}-(T[1-4]|S[12])$'::text AND h.qa_status !~~ 'invalid%'::text) AS historical_periods,
            ( SELECT count(DISTINCT h.source_period) AS count
                   FROM scpi_indicator_history h
                  WHERE h.scpi_slug = c_1.scpi_slug AND h.source_period ~ '^20[0-9]{2}-(T[1-4]|S[12])$'::text AND h.source_url ~~ 'https://%'::text AND COALESCE(h.qa_status, ''::text) !~~ 'invalid%'::text) AS live_trajectory_points,
            i.scpi_slug IS NOT NULL AND i.source_period=c_1.source_period AND i.nombre_parts>0
 AND (
    (i.capital_type='variable' AND i.parts_attente_retrait IS NOT NULL
     AND i.metric_provenance->>'liquidity_basis'='withdrawal_queue')
    OR
    (i.capital_type='variable_suspended' AND i.prix_souscription IS NULL
     AND i.parts_attente_retrait IS NULL
     AND i.metric_provenance->>'liquidity_basis'='secondary_market_order_book'
     AND i.metric_provenance->>'pdf_sha256'=c_1.pdf_sha256
     AND EXISTS (
       SELECT 1 FROM maximus_agents.scpi_candidate_metric_evidence e
       WHERE e.scpi_slug=c_1.scpi_slug AND e.source_period=c_1.source_period
       AND e.source_url=c_1.source_url AND e.document_kind='quarterly_bulletin'
       AND e.metric='parts_inscrites_vente'
       AND e.value_basis='SECONDARY_SELL_ORDERS_NOT_WITHDRAWAL_QUEUE'
       AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
       AND e.numeric_value>=0 AND trunc(e.numeric_value)=e.numeric_value
       AND e.source_page BETWEEN 1 AND c_1.page_count
       AND maximus_agents.is_verified_candidate_issuer_source(e.source_url)
     ))
 ) AS live_liquidity_ready
           FROM counted c_1
             LEFT JOIN maximus_agents.scpi_candidate_indicator_stage i USING (scpi_slug)
             LEFT JOIN scpi_bulletin_analysis b USING (scpi_slug)
        ), reviewed AS (
         SELECT c_1.scpi_slug,
            r.scpi_slug IS NOT NULL AND r.legal_identity_passed AND r.verified_field_display_passed AND r.annual_quarter_coherence_passed AND r.debt_and_leverage_review_passed AND r.liquidity_risk_review_passed AND r.fees_and_redemption_review_passed AND r.dic_risk_sfdr_review_passed AND r.frontend_contract_smoke_passed AND length(TRIM(BOTH FROM r.reviewed_by)) >= 3 AND (r.reviewed_by !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'::text OR maximus_agents.scpi_delegated_actor_authorized(r.reviewed_by)) AND r.reviewed_at >= c_1.pdf_validated_at AND jsonb_typeof(r.review_evidence -> 'browser_smoke'::text) = 'object'::text AND length(COALESCE((r.review_evidence -> 'browser_smoke'::text) ->> 'run_url'::text, ''::text)) > 20 AND ((r.review_evidence -> 'browser_smoke'::text) ->> 'status'::text) = 'PASS'::text AS independent_review_ready,
            a_1.scpi_slug IS NOT NULL AND a_1.audit_status = 'approved'::text AND a_1.historical_consistency_pass AND a_1.financial_coverage_pass AND a_1.liquidity_risk_pass AND a_1.document_regulatory_pass AND a_1.public_display_mapping_pass AND length(TRIM(BOTH FROM COALESCE(a_1.approved_by, ''::text))) >= 3 AND (a_1.approved_by !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'::text OR maximus_agents.scpi_delegated_actor_authorized(a_1.approved_by)) AND a_1.approved_at >= c_1.pdf_validated_at AND a_1.evidence_digest_sha256 ~ '^[0-9a-f]{64}$'::text AS independent_audit_ready,
            COALESCE(( SELECT b.decision = 'approved'::text AND length(TRIM(BOTH FROM COALESCE(b.responsible_name, ''::text))) >= 3 AND (b.responsible_name !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'::text OR maximus_agents.scpi_delegated_actor_authorized(b.responsible_name)) AND b.dossier_digest_sha256 ~ '^[0-9a-f]{64}$'::text AND b.decided_at >= c_1.pdf_validated_at
                   FROM maximus_agents.scpi_candidate_batch_decisions b
                  WHERE c_1.scpi_slug = ANY (b.candidate_slugs)
                  ORDER BY b.decided_at DESC NULLS LAST
                 LIMIT 1), false) AS responsible_batch_ready
           FROM counted c_1
             LEFT JOIN maximus_agents.scpi_candidate_final_review r USING (scpi_slug)
             LEFT JOIN maximus_agents.scpi_candidate_final_audit a_1 USING (scpi_slug)
        )
 SELECT c.scpi_slug,
    c.name,
    c.lifecycle,
    c.source_period,
    c.source_url,
    c.pdf_sha256,
    c.publisher_pdf_valid,
    c.current_qa_fields,
    c.annual_qa_fields,
    c.core_qa_fields,
    c.regulatory_documents_verified,
    c.publisher_pdf_valid AND c.current_qa_fields >= 12 AND c.annual_qa_fields >= 4 AND c.core_qa_fields >= 11 AND c.regulatory_documents_verified = 3 AS financial_sources_ready,
    COALESCE(a.geography_verified, false) AS geography_verified,
    COALESCE(a.sector_verified, false) AS sector_verified,
    COALESCE(a.geography_verified, false) AND COALESCE(a.sector_verified, false) AS allocations_verified,
    COALESCE(ap.current_indicators_ready, false) AS current_indicators_ready,
    COALESCE(ap.bulletin_analysis_ready, false) AS bulletin_analysis_ready,
    COALESCE(ap.historical_periods, 0::bigint) AS historical_periods,
    COALESCE(ap.live_trajectory_points, 0::bigint) AS live_trajectory_points,
    COALESCE(ap.live_liquidity_ready, false) AS live_liquidity_ready,
    COALESCE(rv.independent_review_ready, false) AS independent_review_ready,
    COALESCE(rv.independent_audit_ready, false) AS independent_audit_ready,
    COALESCE(rv.responsible_batch_ready, false) AS responsible_batch_ready,
    c.publisher_pdf_valid AND c.current_qa_fields >= 12 AND c.annual_qa_fields >= 4 AND c.core_qa_fields >= 11 AND c.regulatory_documents_verified = 3 AND COALESCE(a.geography_verified, false) AND COALESCE(a.sector_verified, false) AND COALESCE(ap.current_indicators_ready, false) AND COALESCE(ap.bulletin_analysis_ready, false) AND COALESCE(ap.historical_periods, 0::bigint) >= 2 AND COALESCE(ap.live_trajectory_points, 0::bigint) >= 2 AND COALESCE(ap.live_liquidity_ready, false) AND COALESCE(rv.independent_review_ready, false) AND COALESCE(rv.independent_audit_ready, false) AND COALESCE(rv.responsible_batch_ready, false) AS final_release_ready
   FROM counted c
     LEFT JOIN allocations a USING (scpi_slug)
     LEFT JOIN app ap USING (scpi_slug)
     LEFT JOIN reviewed rv USING (scpi_slug);;
