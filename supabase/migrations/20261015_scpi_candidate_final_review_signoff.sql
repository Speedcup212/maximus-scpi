-- Fail-closed final financial/legal/client-UI review for new SCPI listings.
-- Preserve the technical/documentary gate, but require a separate auditable
-- signoff before publication. An added or changed document invalidates old reviews.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_final_review (
 scpi_slug text PRIMARY KEY REFERENCES maximus_agents.scpi_universe(scpi_slug),
 legal_identity_passed boolean NOT NULL DEFAULT false,
 verified_field_display_passed boolean NOT NULL DEFAULT false,
 annual_quarter_coherence_passed boolean NOT NULL DEFAULT false,
 debt_and_leverage_review_passed boolean NOT NULL DEFAULT false,
 liquidity_risk_review_passed boolean NOT NULL DEFAULT false,
 fees_and_redemption_review_passed boolean NOT NULL DEFAULT false,
 dic_risk_sfdr_review_passed boolean NOT NULL DEFAULT false,
 frontend_contract_smoke_passed boolean NOT NULL DEFAULT false,
 review_evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(review_evidence)='object'),
 reviewed_at timestamptz NOT NULL DEFAULT now(),
 reviewed_by text NOT NULL DEFAULT '' CHECK(length(reviewed_by)<=120),
 notes text NOT NULL DEFAULT ''
);
REVOKE ALL ON maximus_agents.scpi_candidate_final_review FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_publication_gate_v1 AS
 SELECT u.scpi_slug,
    u.name,
    u.stage,
    u.lifecycle,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.document_kind = 'annual_report'::text AND p.source_period = '2025-RA'::text AND p.document_identity_verified AND p.native_text_characters > 1000 AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'::text)) AS annual_2025_sha_verified,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.document_kind = 'quarterly_bulletin'::text AND p.source_period = '2026-T2'::text AND p.document_identity_verified AND p.native_text_characters > 1000 AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'::text)) OR (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_ocr_jobs j
          WHERE j.scpi_slug = u.scpi_slug AND j.document_kind = 'quarterly_bulletin'::text AND j.source_period = '2026-T2'::text AND j.status = 'done'::text AND j.pdf_sha256 ~ '^[0-9a-f]{64}$'::text AND j.text_characters > 1000 AND j.total_pages >= 1)) AS quarter_2026_t2_sha_verified,
    ( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2025-RA'::text AND e.document_kind = 'annual_report'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page > 0) AS annual_fields_qa_pass,
    ( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.document_kind = 'quarterly_bulletin'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page > 0) AS quarter_fields_qa_pass,
    ( SELECT count(DISTINCT
                CASE
                    WHEN e.metric = ANY (ARRAY['nombre_parts'::text, 'prix_souscription'::text, 'distribution_brute_par_part'::text, 'tof'::text, 'tof_quarterly'::text, 'parts_attente_retrait'::text]) THEN
                    CASE
                        WHEN e.metric = 'tof_quarterly'::text THEN 'tof'::text
                        ELSE e.metric
                    END
                    ELSE NULL::text
                END) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.document_kind = 'quarterly_bulletin'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL) AS quarterly_core_qa_coverage,
    (EXISTS ( SELECT 1
           FROM scpi_source_registry r
          WHERE r.scpi_slug = u.scpi_slug AND r.verification_status = 'verified'::text AND r.confidence_level = 'high'::text AND r.dic_url ~~ 'https://%'::text AND r.note_information_url ~~ 'https://%'::text AND r.annual_report_url ~~ 'https://%'::text)) AS regulatory_and_source_registry_verified,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.source_period = '2025-RA'::text AND p.document_kind = 'annual_report'::text AND p.document_identity_verified)) AND ((EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.source_period = '2026-T2'::text AND p.document_kind = 'quarterly_bulletin'::text AND p.document_identity_verified)) OR (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_ocr_jobs j
          WHERE j.scpi_slug = u.scpi_slug AND j.document_kind = 'quarterly_bulletin'::text AND j.source_period = '2026-T2'::text AND j.status = 'done'::text AND j.pdf_sha256 ~ '^[0-9a-f]{64}$'::text))) AND (( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2025-RA'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL)) >= 4 AND (( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL)) >= 5 AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'nombre_parts'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'prix_souscription'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND (e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'distribution_brute_par_part'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM scpi_source_registry r
          WHERE r.scpi_slug = u.scpi_slug AND r.verification_status = 'verified'::text AND r.confidence_level = 'high'::text AND r.dic_url ~~ 'https://%'::text AND r.note_information_url ~~ 'https://%'::text AND r.annual_report_url ~~ 'https://%'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_review rv
          WHERE rv.scpi_slug = u.scpi_slug AND rv.legal_identity_passed AND rv.verified_field_display_passed AND rv.annual_quarter_coherence_passed AND rv.debt_and_leverage_review_passed AND rv.liquidity_risk_review_passed AND rv.fees_and_redemption_review_passed AND rv.dic_risk_sfdr_review_passed AND rv.frontend_contract_smoke_passed AND length(TRIM(BOTH FROM rv.reviewed_by)) >= 3 AND length(rv.review_evidence::text) > 15 AND rv.reviewed_at >= GREATEST(COALESCE(( SELECT max(e.independently_reviewed_at) AS max
                   FROM maximus_agents.scpi_candidate_metric_evidence e
                  WHERE e.scpi_slug = u.scpi_slug), '1970-01-01 00:00:00+00'::timestamp with time zone), COALESCE(( SELECT max(d.validated_at) AS max
                   FROM maximus_agents.scpi_candidate_pdf_validation d
                  WHERE d.scpi_slug = u.scpi_slug), '1970-01-01 00:00:00+00'::timestamp with time zone), COALESCE(( SELECT max(d.checked_at) AS max
                   FROM maximus_agents.scpi_candidate_regulatory_documents d
                  WHERE d.scpi_slug = u.scpi_slug), '1970-01-01 00:00:00+00'::timestamp with time zone)))) AS release_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug);
REVOKE ALL ON maximus_agents.scpi_candidate_publication_gate_v1 FROM PUBLIC,anon,authenticated;
