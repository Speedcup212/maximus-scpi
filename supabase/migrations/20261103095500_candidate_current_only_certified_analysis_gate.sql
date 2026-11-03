-- RECOVERY-074: verified current official analysis with deliberately suppressed
-- historical trends must be eligible for release. This does NOT certify the comparison,
-- resurrect hidden trends, or bypass current official-source QA/URL/period controls.
-- Previous BNP candidate state and Sofidynamic share mismatch are both documented.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_release_circuit_v3
WITH (security_invoker = true)
AS
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
                  WHERE v.scpi_slug = c_1.scpi_slug AND v.document_kind = 'quarterly_bulletin'::text AND v.source_period ~ '^20[0-9]{2}-T[1-4]$'::text
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
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = s.source_period AND e.document_kind = 'quarterly_bulletin'::text AND e.source_url = s.source_url AND e.source_page >= 1 AND e.source_page <= s.page_count AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.numeric_value IS NOT NULL) AS current_qa_fields,
            ( SELECT count(DISTINCT e.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = '2025-RA'::text AND e.document_kind = 'annual_report'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND (EXISTS ( SELECT 1
                           FROM maximus_agents.scpi_candidate_pdf_validation ap_1
                          WHERE ap_1.scpi_slug = e.scpi_slug AND ap_1.source_period = '2025-RA'::text AND ap_1.document_kind = 'annual_report'::text AND ap_1.source_url = e.source_url AND ap_1.document_identity_verified AND e.source_page >= 1 AND e.source_page <= ap_1.page_count))) AS annual_qa_fields,
            (( SELECT count(DISTINCT e.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = s.scpi_slug AND e.source_period = s.source_period AND e.document_kind = 'quarterly_bulletin'::text AND e.source_url = s.source_url AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page >= 1 AND e.source_page <= s.page_count AND (e.metric = ANY (ARRAY['capitalisation'::text, 'tof_quarterly'::text, 'tof'::text, 'nombre_parts'::text, 'nombre_associes'::text, 'parts_attente_retrait'::text, 'prix_souscription'::text, 'prix_retrait'::text, 'valeur_realisation_par_part'::text, 'valeur_reconstitution_par_part'::text, 'distribution_brute_par_part'::text, 'frais_souscription_ttc'::text, 'srri'::text])))) + (( SELECT count(DISTINCT e2.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e2
                     JOIN maximus_agents.scpi_candidate_pdf_validation v2 ON v2.scpi_slug = e2.scpi_slug AND v2.source_period = e2.source_period AND v2.document_kind = e2.document_kind AND v2.source_url = e2.source_url
                  WHERE e2.scpi_slug = s.scpi_slug AND e2.source_period = s.source_period AND e2.document_kind = 'quarterly_bulletin'::text AND e2.source_url = s.source_url AND e2.metric = 'distribution_par_part'::text AND e2.qa_status = 'qa_pass'::text AND e2.independently_reviewed_at IS NOT NULL AND e2.numeric_value IS NOT NULL AND v2.pdf_sha256 = s.pdf_sha256 AND v2.document_identity_verified AND e2.source_page >= 1 AND e2.source_page <= v2.page_count)) + (( SELECT count(DISTINCT e3.metric) AS count
                   FROM maximus_agents.scpi_candidate_metric_evidence e3
                     JOIN maximus_agents.scpi_candidate_pdf_validation v3 ON v3.scpi_slug = e3.scpi_slug AND v3.source_period = e3.source_period AND v3.document_kind = e3.document_kind AND v3.source_url = e3.source_url
                  WHERE e3.scpi_slug = s.scpi_slug AND e3.source_period ~~ '20%-RA'::text AND e3.document_kind = 'annual_report'::text AND (e3.metric = ANY (ARRAY['prix_reconstitution'::text, 'valeur_realisation'::text])) AND e3.value_basis ~~ 'VALUATION_AT_%'::text AND e3.qa_status = 'qa_pass'::text AND e3.independently_reviewed_at IS NOT NULL AND e3.numeric_value IS NOT NULL AND v3.document_identity_verified AND e3.source_page >= 1 AND e3.source_page <= v3.page_count)) AS core_qa_fields,
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
             LEFT JOIN maximus_agents.scpi_candidate_allocations a_1 USING (scpi_slug)
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
            i.scpi_slug IS NOT NULL AND i.source_period = c_1.source_period AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 100::numeric AND i.repartition_geographique IS NOT NULL AND i.repartition_sectorielle IS NOT NULL AND i.prix_reconstitution > 0::numeric AND i.valeur_realisation > 0::numeric AS current_indicators_ready,
            b.scpi_slug IS NOT NULL AND b.current_period = c_1.source_period AND b.status = 'complete'::text AND b.certification_status = ANY(ARRAY['certified'::text,'current_certified_history_unverified'::text])
                AND b.current_source_certified AND b.certified_source_url = c_1.source_url
                AND (
                    (b.comparison_certified AND b.certification_status='certified')
                    OR (
                        NOT b.comparison_certified AND b.current_snapshot IS NOT NULL
                        AND jsonb_array_length(COALESCE(b.certification_reasons,'[]'::jsonb)) > 0
                        AND jsonb_array_length(COALESCE(b.improvements,'[]'::jsonb)) = 0
                        AND jsonb_array_length(COALESCE(b.deteriorations,'[]'::jsonb)) = 0
                    )
                ) AS bulletin_analysis_ready,
            ( SELECT count(DISTINCT h.source_period) AS count
                   FROM scpi_indicator_history h
                  WHERE h.scpi_slug = c_1.scpi_slug AND h.source_url ~~ 'https://%'::text AND h.source_period ~ '^20[0-9]{2}-T[1-4]$'::text AND h.qa_status !~~ 'invalid%'::text) AS historical_periods,
            ( SELECT count(DISTINCT h.source_period) AS count
                   FROM scpi_indicator_history h
                  WHERE h.scpi_slug = c_1.scpi_slug AND h.source_period ~ '^20[0-9]{2}-T[1-4]$'::text AND h.source_url ~~ 'https://%'::text AND COALESCE(h.qa_status, ''::text) !~~ 'invalid%'::text) AS live_trajectory_points,
            i.scpi_slug IS NOT NULL AND i.source_period = c_1.source_period AND i.nombre_parts > 0 AND i.parts_attente_retrait IS NOT NULL AND i.capital_type = 'variable'::text AND (i.metric_provenance ->> 'liquidity_basis'::text) = 'withdrawal_queue'::text AS live_liquidity_ready
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
