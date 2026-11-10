-- RECOVERY-207: fail closed existing legacy BIGINT flow on any fractional source parts.
-- Existing output columns and integer types are retained to avoid dependent-view breakage.
-- Separately use maximus_agents.scpi_candidate_share_flow_decimal_review_v1 for exact decimal arithmetic.
create or replace view maximus_agents.scpi_candidate_verified_share_flow_v1
with (security_invoker = true)
as
 WITH verified_periods AS (
         SELECT p.scpi_slug,
            p.source_period,
            p.document_kind,
            p.pdf_sha256,
            p.source_url,
            max(e.numeric_value) FILTER (WHERE e.metric = 'nombre_parts'::text AND e.unit = 'PARTS'::text)::bigint AS closing_parts,
            max(e.numeric_value) FILTER (WHERE e.metric = 'nombre_parts_nouvelles_souscrites'::text AND e.unit = 'PARTS'::text)::bigint AS subscribed,
            max(e.numeric_value) FILTER (WHERE e.metric = 'nombre_parts_retires'::text AND e.unit = 'PARTS'::text)::bigint AS quarterly_withdrawn,
            max(e.numeric_value) FILTER (WHERE e.metric = 'souscriptions_compensees_par_retraits'::text AND e.unit = 'PARTS'::text)::bigint AS subscriptions_matched,
            max(e.numeric_value) FILTER (WHERE e.metric = 'retraits_non_compenses'::text AND e.unit = 'PARTS'::text)::bigint AS uncompensated_withdrawals,
                CASE
                    WHEN p.document_kind = 'quarterly_bulletin'::text THEN "substring"(p.source_period, 1, 4)::integer * 4 + "substring"(p.source_period, 7, 1)::integer
                    WHEN p.document_kind = 'semiannual_bulletin'::text THEN "substring"(p.source_period, 1, 4)::integer * 2 + "substring"(p.source_period, 7, 1)::integer
                    ELSE NULL::integer
                END AS sequence
           FROM maximus_agents.scpi_candidate_pdf_validation p
             LEFT JOIN maximus_agents.scpi_candidate_metric_evidence e ON e.scpi_slug = p.scpi_slug AND e.source_period = p.source_period AND e.document_kind = p.document_kind AND e.source_url = p.source_url AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page >= 1 AND e.source_page <= p.page_count
          WHERE p.document_identity_verified AND maximus_agents.is_verified_candidate_issuer_source(p.source_url) AND (p.document_kind = 'quarterly_bulletin'::text AND p.source_period ~ '^20[0-9]{2}-T[1-4]$'::text OR p.document_kind = 'semiannual_bulletin'::text AND p.source_period ~ '^20[0-9]{2}-S[12]$'::text)
          GROUP BY p.scpi_slug, p.source_period, p.document_kind, p.pdf_sha256, p.source_url
        ), compared AS (
         SELECT v.scpi_slug,
            v.source_period,
            v.document_kind,
            v.pdf_sha256,
            v.source_url,
            v.closing_parts,
            v.subscribed,
            v.quarterly_withdrawn,
            v.subscriptions_matched,
            v.uncompensated_withdrawals,
            v.sequence,
            lag(v.closing_parts) OVER (PARTITION BY v.scpi_slug, v.document_kind ORDER BY v.sequence) AS opening_parts,
            lag(v.source_period) OVER (PARTITION BY v.scpi_slug, v.document_kind ORDER BY v.sequence) AS opening_period,
            lag(v.pdf_sha256) OVER (PARTITION BY v.scpi_slug, v.document_kind ORDER BY v.sequence) AS opening_pdf_sha,
            lag(v.sequence) OVER (PARTITION BY v.scpi_slug, v.document_kind ORDER BY v.sequence) AS preceding_sequence
           FROM verified_periods v
        ), math AS (
         SELECT c.scpi_slug,
            c.source_period,
            c.document_kind,
            c.pdf_sha256,
            c.source_url,
            c.closing_parts,
            c.subscribed,
            c.quarterly_withdrawn,
            c.subscriptions_matched,
            c.uncompensated_withdrawals,
            c.sequence,
            c.opening_parts,
            c.opening_period,
            c.opening_pdf_sha,
            c.preceding_sequence,
                CASE
                    WHEN c.document_kind = 'quarterly_bulletin'::text THEN
                    CASE
                        WHEN c.subscribed IS NULL OR c.quarterly_withdrawn IS NULL THEN NULL::bigint
                        ELSE c.opening_parts + c.subscribed - c.quarterly_withdrawn
                    END
                    ELSE
                    CASE
                        WHEN c.subscribed IS NULL OR c.subscriptions_matched IS NULL OR c.uncompensated_withdrawals IS NULL THEN NULL::bigint
                        ELSE c.opening_parts + c.subscribed - c.subscriptions_matched - c.uncompensated_withdrawals
                    END
                END AS expected_closing_parts
           FROM compared c
        )
 SELECT scpi_slug,
    source_period,
    document_kind,
    opening_period,
    opening_pdf_sha,
    pdf_sha256 AS closing_pdf_sha,
    opening_parts,
    closing_parts,
    subscribed,
    quarterly_withdrawn,
    subscriptions_matched,
    uncompensated_withdrawals,
    expected_closing_parts,
        CASE
            WHEN expected_closing_parts IS NOT NULL AND closing_parts IS NOT NULL THEN closing_parts - expected_closing_parts
            ELSE NULL::bigint
        END AS disclosed_flow_delta,
        CASE
            WHEN EXISTS (
                SELECT 1 FROM maximus_agents.scpi_candidate_metric_evidence fractional
                WHERE fractional.scpi_slug=m.scpi_slug
                AND fractional.source_period=m.source_period
                AND fractional.document_kind=m.document_kind
                AND fractional.unit='PARTS'
                AND fractional.metric IN ('nombre_parts','nombre_parts_nouvelles_souscrites','nombre_parts_retires',
                                          'souscriptions_compensees_par_retraits','retraits_non_compenses')
                AND fractional.numeric_value <> trunc(fractional.numeric_value)
            ) THEN 'FRACTIONAL_PARTS_REQUIRE_EXACT_NUMERIC_RECONCILER'::text
            WHEN opening_period IS NULL THEN 'NO_PREVIOUS_VERIFIED_PERIOD'::text
            WHEN (sequence - preceding_sequence) <> 1 THEN 'NON_ADJACENT_REPORTING_PERIODS'::text
            WHEN document_kind = 'quarterly_bulletin'::text AND opening_parts > 0 AND closing_parts = opening_parts AND (EXISTS ( SELECT 1
               FROM maximus_agents.scpi_candidate_indicator_stage s
              WHERE s.scpi_slug = m.scpi_slug AND s.source_period = m.source_period AND s.capital_type = 'variable_suspended'::text AND (s.metric_provenance ->> 'liquidity_basis'::text) = 'secondary_market_order_book'::text AND (s.metric_provenance ->> 'pdf_sha256'::text) = m.pdf_sha256)) AND (EXISTS ( SELECT 1
               FROM maximus_agents.scpi_candidate_metric_evidence e
                 JOIN maximus_agents.scpi_candidate_pdf_validation p ON p.scpi_slug = e.scpi_slug AND p.source_period = e.source_period AND p.document_kind = e.document_kind AND p.source_url = e.source_url
              WHERE e.scpi_slug = m.scpi_slug AND e.source_period = m.opening_period AND p.pdf_sha256 = m.opening_pdf_sha AND p.document_identity_verified AND e.document_kind = 'quarterly_bulletin'::text AND e.metric = 'parts_inscrites_vente'::text AND e.unit = 'PARTS'::text AND e.value_basis ~~ '%NOT_WITHDRAWAL_QUEUE%'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.numeric_value >= 0::numeric AND trunc(e.numeric_value) = e.numeric_value AND e.source_page >= 1 AND e.source_page <= p.page_count AND maximus_agents.is_verified_candidate_issuer_source(e.source_url))) AND (EXISTS ( SELECT 1
               FROM maximus_agents.scpi_candidate_metric_evidence e
                 JOIN maximus_agents.scpi_candidate_pdf_validation p ON p.scpi_slug = e.scpi_slug AND p.source_period = e.source_period AND p.document_kind = e.document_kind AND p.source_url = e.source_url
              WHERE e.scpi_slug = m.scpi_slug AND e.source_period = m.source_period AND p.pdf_sha256 = m.pdf_sha256 AND p.document_identity_verified AND e.document_kind = 'quarterly_bulletin'::text AND e.metric = 'parts_inscrites_vente'::text AND e.unit = 'PARTS'::text AND e.value_basis ~~ '%NOT_WITHDRAWAL_QUEUE%'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.numeric_value >= 0::numeric AND trunc(e.numeric_value) = e.numeric_value AND e.source_page >= 1 AND e.source_page <= p.page_count AND maximus_agents.is_verified_candidate_issuer_source(e.source_url))) THEN 'SECONDARY_ISSUED_SHARE_STOCK_UNCHANGED_SELL_ORDERS_VERIFIED_NOT_LIQUIDITY'::text
            WHEN closing_parts IS NULL OR expected_closing_parts IS NULL THEN 'REQUIRED_SOURCE_METRICS_MISSING'::text
            WHEN closing_parts = expected_closing_parts THEN 'SOURCE_FLOW_ARITHMETIC_RECONCILED'::text
            ELSE 'PUBLISHED_SHARE_FLOW_DELTA_UNEXPLAINED'::text
        END AS qa_reconciliation_status,
    false AS independently_legal_certified,
    false AS publication_authorized
   FROM math m;

comment on view maximus_agents.scpi_candidate_verified_share_flow_v1 is
'RECOVERY-207: LEGACY BIGINT result; any fractional claim forces FRACTIONAL_PARTS_REQUIRE_EXACT_NUMERIC_RECONCILER (never SOURCE_FLOW_ARITHMETIC_RECONCILED); do not use to approve decimalized SCPI shares.';
