SET LOCAL lock_timeout='3s';
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_browser_preflight_v3 AS
 SELECT scpi_slug,
    COALESCE(((review_evidence -> 'browser_smoke'::text) ->> 'status'::text) = 'PASS'::text AND ((review_evidence -> 'browser_smoke'::text) ->> 'run_url'::text) ~~ 'https://github.com/Speedcup212/maximus-scpi/actions/runs/%'::text AND ((review_evidence -> 'browser_smoke'::text) ->> 'commit_sha'::text) ~ '^[a-f0-9]{40}$'::text AND ((review_evidence -> 'browser_smoke'::text) ->> 'artifact_zip_sha256'::text) ~ '^[a-f0-9]{64}$'::text AND (NOT (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_indicator_stage s
          WHERE s.scpi_slug = r.scpi_slug)) OR (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_indicator_stage s
             LEFT JOIN public.scpi_bulletins b ON b.scpi_slug = s.scpi_slug AND b.period = s.source_period AND b.source_url = s.source_url
             JOIN maximus_agents.scpi_candidate_pdf_validation p ON p.scpi_slug = s.scpi_slug AND p.source_period = s.source_period AND p.source_url = s.source_url AND p.document_kind = ANY (ARRAY['quarterly_bulletin'::text, 'semiannual_bulletin'::text])
          WHERE s.scpi_slug = r.scpi_slug AND p.document_identity_verified AND p.pdf_sha256 = (s.metric_provenance ->> 'pdf_sha256'::text)
             AND maximus_agents.is_verified_candidate_issuer_source(p.source_url)
             AND (
               (b.pdf_sha256=p.pdf_sha256 AND scpi_is_strong_qa(b.qa_status))
               OR
               (s.qa_status='pending_independent_qa'
                AND (SELECT count(DISTINCT e.metric)
                     FROM maximus_agents.scpi_candidate_metric_evidence e
                     WHERE e.scpi_slug=s.scpi_slug AND e.source_period=s.source_period
                       AND e.source_url=s.source_url AND e.document_kind=p.document_kind
                       AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
                       AND e.source_page BETWEEN 1 AND p.page_count) >=12
                AND (r.review_evidence->'approved_analysis_snapshot'->>'source_period')=s.source_period
                AND (r.review_evidence->'approved_analysis_snapshot'->>'source_url')=s.source_url
                AND (r.review_evidence->'approved_analysis_snapshot'->>'source_pdf_sha256')=p.pdf_sha256)
             ) AND (to_jsonb(s.*) - ARRAY['staged_at'::text, 'stage_note'::text, 'updated_at'::text, 'qa_status'::text, 'source_type'::text]) = (((r.review_evidence -> 'approved_analysis_snapshot'::text) -> 'current_snapshot'::text) - ARRAY['staged_at'::text, 'stage_note'::text, 'updated_at'::text, 'qa_status'::text, 'source_type'::text])))) AND NOT (EXISTS ( SELECT 1
           FROM ( VALUES ('profile'::text), ('comparator_analysis'::text), ('radar'::text), ('simulator'::text), ('client_card'::text), ('trajectory'::text)) expected(surface)
             CROSS JOIN ( VALUES (1440), (390)) viewport(width)
          WHERE NOT (EXISTS ( SELECT 1
                   FROM jsonb_array_elements(
                        CASE
                            WHEN jsonb_typeof((r.review_evidence -> 'browser_smoke'::text) -> 'cases'::text) = 'array'::text THEN (r.review_evidence -> 'browser_smoke'::text) -> 'cases'::text
                            ELSE '[]'::jsonb
                        END) c(value)
                  WHERE (c.value ->> 'slug'::text) = r.scpi_slug AND (c.value ->> 'surface'::text) = expected.surface AND (c.value ->> 'width'::text) = viewport.width::text AND (c.value ->> 'status'::text) = 'PASS'::text)))), false) AS browser_contract_ready
   FROM maximus_agents.scpi_candidate_final_review r;;
