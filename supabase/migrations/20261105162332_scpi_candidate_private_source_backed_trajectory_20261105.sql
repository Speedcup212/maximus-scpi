CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_private_trajectory_v1
WITH (security_invoker=true) AS
WITH evidence AS (
 SELECT p.scpi_slug,p.source_period,p.document_kind,p.source_url,p.pdf_sha256,
  max(e.numeric_value) filter(where e.metric='nombre_parts' AND e.unit='PARTS')::bigint AS parts,
  max(e.source_page) filter(where e.metric='nombre_parts' AND e.unit='PARTS') AS parts_page,
  max(e.numeric_value) filter(where e.metric in ('tof','tof_quarterly') AND e.unit='PERCENT') AS quarterly_tof,
  max(e.source_page) filter(where e.metric in ('tof','tof_quarterly') AND e.unit='PERCENT') AS tof_page,
  max(e.value_basis) filter(where e.metric in ('tof','tof_quarterly') AND e.unit='PERCENT') AS tof_reference_basis,
  count(distinct e.metric) filter(where e.metric in ('tof','tof_quarterly')) AS tof_records
 FROM maximus_agents.scpi_candidate_pdf_validation p
 JOIN maximus_agents.scpi_candidate_metric_evidence e
 ON p.scpi_slug=e.scpi_slug AND p.source_period=e.source_period AND p.document_kind=e.document_kind
 AND p.source_url=e.source_url AND e.qa_status='qa_pass'
 AND e.independently_reviewed_at IS NOT NULL AND e.source_page BETWEEN 1 AND p.page_count
 WHERE p.document_identity_verified AND maximus_agents.is_verified_candidate_issuer_source(p.source_url)
 AND ((p.document_kind='quarterly_bulletin' AND p.source_period ~ '^20[0-9]{2}-T[1-4]$')
 OR (p.document_kind='semiannual_bulletin' AND p.source_period ~ '^20[0-9]{2}-S[12]$'))
 GROUP BY p.scpi_slug,p.source_period,p.document_kind,p.source_url,p.pdf_sha256
), validated AS (
 SELECT *,count(*) over(partition by scpi_slug) AS verified_source_periods
 FROM evidence
 WHERE parts > 0 AND quarterly_tof BETWEEN 0 AND 100 AND tof_records=1
   AND (tof_reference_basis ILIKE '%TOF%' OR tof_reference_basis ILIKE '%OCCUPANCY%')
)
SELECT scpi_slug,source_period,document_kind,source_url,pdf_sha256,
 parts,parts_page,quarterly_tof,tof_page,tof_reference_basis,
 verified_source_periods,
 verified_source_periods>=2 AS eligible_for_private_trajectory_preview,
 'SOURCE_POINTS_VERIFIED_ONLY_NO_AUTOMATED_RECOMMENDATION'::text AS qa_disposition,
 false::boolean AS comparison_signoff,
 false::boolean AS publication_authorized
FROM validated;
REVOKE ALL ON TABLE maximus_agents.scpi_candidate_private_trajectory_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE maximus_agents.scpi_candidate_private_trajectory_v1 TO service_role;
