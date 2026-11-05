CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_verified_share_flow_v1
WITH (security_invoker=true)
AS
WITH verified_periods AS (
  SELECT p.scpi_slug,p.source_period,p.document_kind,p.pdf_sha256,p.source_url,
    max(e.numeric_value) FILTER(WHERE e.metric='nombre_parts' AND e.unit='PARTS')::bigint as closing_parts,
    max(e.numeric_value) FILTER(WHERE e.metric='nombre_parts_nouvelles_souscrites' AND e.unit='PARTS')::bigint as subscribed,
    max(e.numeric_value) FILTER(WHERE e.metric='nombre_parts_retires' AND e.unit='PARTS')::bigint as quarterly_withdrawn,
    max(e.numeric_value) FILTER(WHERE e.metric='souscriptions_compensees_par_retraits' AND e.unit='PARTS')::bigint as subscriptions_matched,
    max(e.numeric_value) FILTER(WHERE e.metric='retraits_non_compenses' AND e.unit='PARTS')::bigint as uncompensated_withdrawals,
    CASE
      WHEN p.document_kind='quarterly_bulletin' THEN (substring(p.source_period,1,4)::integer)*4+substring(p.source_period,7,1)::integer
      WHEN p.document_kind='semiannual_bulletin' THEN (substring(p.source_period,1,4)::integer)*2+substring(p.source_period,7,1)::integer
    END AS sequence
  FROM maximus_agents.scpi_candidate_pdf_validation p
  LEFT JOIN maximus_agents.scpi_candidate_metric_evidence e
    ON e.scpi_slug=p.scpi_slug AND e.source_period=p.source_period AND e.document_kind=p.document_kind
   AND e.source_url=p.source_url AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
   AND e.source_page BETWEEN 1 AND p.page_count
  WHERE p.document_identity_verified AND maximus_agents.is_verified_candidate_issuer_source(p.source_url)
    AND ((p.document_kind='quarterly_bulletin' AND p.source_period~'^20[0-9]{2}-T[1-4]$')
      OR (p.document_kind='semiannual_bulletin' AND p.source_period~'^20[0-9]{2}-S[12]$'))
  GROUP BY p.scpi_slug,p.source_period,p.document_kind,p.pdf_sha256,p.source_url
), compared AS (
  SELECT v.*,
   lag(closing_parts) over (partition by scpi_slug,document_kind order by sequence) as opening_parts,
   lag(source_period) over (partition by scpi_slug,document_kind order by sequence) as opening_period,
   lag(pdf_sha256) over (partition by scpi_slug,document_kind order by sequence) as opening_pdf_sha,
   lag(sequence) over (partition by scpi_slug,document_kind order by sequence) as preceding_sequence
  FROM verified_periods v
), math AS (
  SELECT c.*,
   CASE
     WHEN c.document_kind='quarterly_bulletin' THEN
       CASE WHEN c.subscribed IS NULL OR c.quarterly_withdrawn IS NULL THEN NULL
            ELSE c.opening_parts+c.subscribed-c.quarterly_withdrawn END
     ELSE
       CASE WHEN c.subscribed IS NULL OR c.subscriptions_matched IS NULL OR c.uncompensated_withdrawals IS NULL THEN NULL
            ELSE c.opening_parts+c.subscribed-c.subscriptions_matched-c.uncompensated_withdrawals END
   END AS expected_closing_parts
  FROM compared c
)
SELECT scpi_slug,source_period,document_kind,
 opening_period,opening_pdf_sha,pdf_sha256 AS closing_pdf_sha,
 opening_parts,closing_parts,subscribed,quarterly_withdrawn,subscriptions_matched,uncompensated_withdrawals,
 expected_closing_parts,
 CASE WHEN expected_closing_parts IS NOT NULL AND closing_parts IS NOT NULL THEN closing_parts-expected_closing_parts END AS disclosed_flow_delta,
 CASE
   WHEN opening_period IS NULL THEN 'NO_PREVIOUS_VERIFIED_PERIOD'
   WHEN sequence-preceding_sequence<>1 THEN 'NON_ADJACENT_REPORTING_PERIODS'
   WHEN closing_parts IS NULL OR expected_closing_parts IS NULL THEN 'REQUIRED_SOURCE_METRICS_MISSING'
   WHEN closing_parts=expected_closing_parts THEN 'SOURCE_FLOW_ARITHMETIC_RECONCILED'
   ELSE 'PUBLISHED_SHARE_FLOW_DELTA_UNEXPLAINED'
 END as qa_reconciliation_status,
 false::boolean AS independently_legal_certified,
 false::boolean AS publication_authorized
FROM math;
REVOKE ALL ON TABLE maximus_agents.scpi_candidate_verified_share_flow_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE maximus_agents.scpi_candidate_verified_share_flow_v1 TO service_role;
