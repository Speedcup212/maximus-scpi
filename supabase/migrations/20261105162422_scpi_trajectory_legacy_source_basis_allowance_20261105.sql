SET LOCAL lock_timeout='3s';
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_private_trajectory_v1 WITH (security_invoker=true) AS
 WITH evidence AS (
         SELECT p.scpi_slug,
            p.source_period,
            p.document_kind,
            p.source_url,
            p.pdf_sha256,
            max(e.numeric_value) FILTER (WHERE e.metric = 'nombre_parts'::text AND e.unit = 'PARTS'::text)::bigint AS parts,
            max(e.source_page) FILTER (WHERE e.metric = 'nombre_parts'::text AND e.unit = 'PARTS'::text) AS parts_page,
            max(e.numeric_value) FILTER (WHERE (e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AND e.unit = 'PERCENT'::text) AS quarterly_tof,
            max(e.source_page) FILTER (WHERE (e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AND e.unit = 'PERCENT'::text) AS tof_page,
            max(e.value_basis) FILTER (WHERE (e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AND e.unit = 'PERCENT'::text) AS tof_reference_basis,
            count(DISTINCT e.metric) FILTER (WHERE e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AS tof_records
           FROM maximus_agents.scpi_candidate_pdf_validation p
             JOIN maximus_agents.scpi_candidate_metric_evidence e ON p.scpi_slug = e.scpi_slug AND p.source_period = e.source_period AND p.document_kind = e.document_kind AND p.source_url = e.source_url AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page >= 1 AND e.source_page <= p.page_count
          WHERE p.document_identity_verified AND maximus_agents.is_verified_candidate_issuer_source(p.source_url) AND (p.document_kind = 'quarterly_bulletin'::text AND p.source_period ~ '^20[0-9]{2}-T[1-4]$'::text OR p.document_kind = 'semiannual_bulletin'::text AND p.source_period ~ '^20[0-9]{2}-S[12]$'::text)
          GROUP BY p.scpi_slug, p.source_period, p.document_kind, p.source_url, p.pdf_sha256
        ), validated AS (
         SELECT evidence.scpi_slug,
            evidence.source_period,
            evidence.document_kind,
            evidence.source_url,
            evidence.pdf_sha256,
            evidence.parts,
            evidence.parts_page,
            evidence.quarterly_tof,
            evidence.tof_page,
            evidence.tof_reference_basis,
            evidence.tof_records,
            count(*) OVER (PARTITION BY evidence.scpi_slug) AS verified_source_periods
           FROM evidence
          WHERE evidence.parts > 0 AND evidence.quarterly_tof >= 0::numeric AND evidence.quarterly_tof <= 100::numeric AND evidence.tof_records = 1
        )
 SELECT scpi_slug,
    source_period,
    document_kind,
    source_url,
    pdf_sha256,
    parts,
    parts_page,
    quarterly_tof,
    tof_page,
    tof_reference_basis,
    verified_source_periods,
    verified_source_periods >= 2 AS eligible_for_private_trajectory_preview,
    'SOURCE_POINTS_VERIFIED_ONLY_NO_AUTOMATED_RECOMMENDATION'::text AS qa_disposition,
    false AS comparison_signoff,
    false AS publication_authorized
   FROM validated;;
