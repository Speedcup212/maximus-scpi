-- Generic issuer-period candidate release circuit, independent of legacy CORUM/T2 rules.
-- This view never authorizes a release without documented human sign-off.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_release_circuit_v3
WITH (security_invoker = true) AS
WITH candidates AS (
  SELECT u.scpi_slug, u.name, u.lifecycle, u.publication_authorized
  FROM maximus_agents.scpi_universe u
  JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
), source AS (
  SELECT c.*, p.source_period, p.source_url, p.pdf_sha256, p.page_count,
    p.validated_at AS pdf_validated_at,
    (p.scpi_slug IS NOT NULL AND p.document_identity_verified
      AND p.pdf_sha256 ~ '^[0-9a-f]{64}$' AND p.page_count > 0
      AND p.source_url LIKE 'https://%') AS publisher_pdf_valid
  FROM candidates c
  LEFT JOIN LATERAL (
    SELECT v.* FROM maximus_agents.scpi_candidate_pdf_validation v
    WHERE v.scpi_slug=c.scpi_slug AND v.document_kind='quarterly_bulletin'
      AND v.source_period ~ '^20[0-9]{2}-T[1-4]$'
    ORDER BY v.source_period DESC, v.validated_at DESC LIMIT 1
  ) p ON true
), counted AS (
  SELECT s.*,
    (SELECT count(DISTINCT e.metric)
      FROM maximus_agents.scpi_candidate_metric_evidence e
      WHERE e.scpi_slug=s.scpi_slug AND e.source_period=s.source_period
        AND e.document_kind='quarterly_bulletin'
        AND e.source_url=s.source_url
        AND e.source_page BETWEEN 1 AND s.page_count
        AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
        AND e.numeric_value IS NOT NULL) AS current_qa_fields,
    (SELECT count(DISTINCT e.metric)
      FROM maximus_agents.scpi_candidate_metric_evidence e
      WHERE e.scpi_slug=s.scpi_slug AND e.source_period='2025-RA'
        AND e.document_kind='annual_report'
        AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
        AND EXISTS (SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation ap
          WHERE ap.scpi_slug=e.scpi_slug AND ap.source_period='2025-RA'
            AND ap.document_kind='annual_report' AND ap.source_url=e.source_url
            AND ap.document_identity_verified AND e.source_page BETWEEN 1 AND ap.page_count)
    ) AS annual_qa_fields,
    (SELECT count(DISTINCT e.metric)
      FROM maximus_agents.scpi_candidate_metric_evidence e
      WHERE e.scpi_slug=s.scpi_slug AND e.source_period=s.source_period
        AND e.document_kind='quarterly_bulletin' AND e.source_url=s.source_url
        AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
        AND e.source_page BETWEEN 1 AND s.page_count
        AND e.metric IN ('capitalisation','tof_quarterly','tof','nombre_parts',
          'nombre_associes','parts_attente_retrait','prix_souscription',
          'prix_retrait','valeur_realisation_par_part',
          'valeur_reconstitution_par_part','distribution_brute_par_part',
          'frais_souscription_ttc','srri')
    ) AS core_qa_fields,
    (SELECT count(DISTINCT d.document_kind)
      FROM maximus_agents.scpi_candidate_regulatory_documents d
      WHERE d.scpi_slug=s.scpi_slug
        AND d.document_kind IN ('dic','note','statutes')
        AND d.identity_verified AND d.kind_verified
        AND d.source_url LIKE 'https://%' AND d.pdf_sha256 ~ '^[0-9a-f]{64}$'
        AND d.page_count>0) AS regulatory_documents_verified
  FROM source s
), allocation_axes AS (
  SELECT c.scpi_slug, a.allocation_type,
    count(*) FILTER (WHERE a.qa_status='qa_pass'
      AND a.source_period=c.source_period AND a.source_url=c.source_url
      AND a.source_sha256=c.pdf_sha256
      AND a.source_page BETWEEN 1 AND c.page_count
      AND length(coalesce(a.evidence_excerpt,''))>=40
      AND a.pct BETWEEN 0 AND 100) AS verified_count,
    count(*) AS row_count,
    count(DISTINCT a.label) AS labels_count,
    sum(a.pct) AS total
  FROM counted c
  LEFT JOIN maximus_agents.scpi_candidate_allocations a USING (scpi_slug)
  GROUP BY c.scpi_slug,a.allocation_type
), allocations AS (
  SELECT c.scpi_slug,
    coalesce(bool_or(a.allocation_type='geography' AND a.verified_count=a.row_count
      AND a.labels_count=a.row_count AND a.row_count>0 AND a.total=100),false) AS geography_verified,
    coalesce(bool_or(a.allocation_type='sector' AND a.verified_count=a.row_count
      AND a.labels_count=a.row_count AND a.row_count>0 AND a.total=100),false) AS sector_verified
  FROM counted c LEFT JOIN allocation_axes a USING(scpi_slug)
  GROUP BY c.scpi_slug
), app AS (
  SELECT c.scpi_slug,
    (i.scpi_slug IS NOT NULL AND i.source_period=c.source_period
      AND i.prix_souscription>0 AND i.td>0 AND i.tof BETWEEN 0 AND 100
      AND i.capitalisation>100 AND i.repartition_geographique IS NOT NULL
      AND i.repartition_sectorielle IS NOT NULL
      AND i.prix_reconstitution>0 AND i.valeur_realisation>0) AS current_indicators_ready,
    (b.scpi_slug IS NOT NULL AND b.current_period=c.source_period
      AND b.status='complete' AND b.certification_status='certified'
      AND b.current_source_certified
      AND b.certified_source_url=c.source_url
      AND (b.comparison_certified OR
        (NOT b.comparison_certified AND b.current_snapshot IS NOT NULL
          AND jsonb_array_length(coalesce(b.certification_reasons,'[]'::jsonb))>0))
    ) AS bulletin_analysis_ready,
    (SELECT count(DISTINCT h.source_period)
      FROM public.scpi_indicator_history h
      WHERE h.scpi_slug=c.scpi_slug AND h.source_url LIKE 'https://%'
        AND h.source_period ~ '^20[0-9]{2}-T[1-4]$'
        AND h.qa_status NOT LIKE 'invalid%') AS historical_periods,
    -- Avoid requiring a public trajectory to authorize its first publication.
    (SELECT count(DISTINCT h.source_period) FROM public.scpi_indicator_history h
      WHERE h.scpi_slug=c.scpi_slug
        AND h.source_period ~ '^20[0-9]{2}-T[1-4]$'
        AND h.source_url LIKE 'https://%'
        AND coalesce(h.qa_status,'') NOT LIKE 'invalid%') AS live_trajectory_points,
    -- Preflight liquidity uses the private indicator stage, not a published liquidity view.
    (i.scpi_slug IS NOT NULL AND i.source_period=c.source_period
      AND i.nombre_parts>0 AND i.parts_attente_retrait IS NOT NULL
      AND i.capital_type='variable'
      AND (i.metric_provenance->>'liquidity_basis')='withdrawal_queue') AS live_liquidity_ready
  FROM counted c
  -- Private stage before publication; public table is populated only by approved activation.
  LEFT JOIN maximus_agents.scpi_candidate_indicator_stage i USING(scpi_slug)
  LEFT JOIN public.scpi_bulletin_analysis b USING(scpi_slug)
), reviewed AS (
  SELECT c.scpi_slug,
    (r.scpi_slug IS NOT NULL AND r.legal_identity_passed
      AND r.verified_field_display_passed
      AND r.annual_quarter_coherence_passed
      AND r.debt_and_leverage_review_passed
      AND r.liquidity_risk_review_passed
      AND r.fees_and_redemption_review_passed
      AND r.dic_risk_sfdr_review_passed
      AND r.frontend_contract_smoke_passed
      AND length(trim(r.reviewed_by))>=3
      AND r.reviewed_by !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'
      AND r.reviewed_at>=c.pdf_validated_at
      AND jsonb_typeof(r.review_evidence->'browser_smoke')='object'
      AND length(coalesce(r.review_evidence->'browser_smoke'->>'run_url',''))>20
      AND (r.review_evidence->'browser_smoke'->>'status')='PASS'
    ) AS independent_review_ready,
    (a.scpi_slug IS NOT NULL AND a.audit_status='approved'
      AND a.historical_consistency_pass AND a.financial_coverage_pass
      AND a.liquidity_risk_pass AND a.document_regulatory_pass
      AND a.public_display_mapping_pass
      AND length(trim(coalesce(a.approved_by,'')))>=3
      AND a.approved_by !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'
      AND a.approved_at>=c.pdf_validated_at
      AND a.evidence_digest_sha256 ~ '^[0-9a-f]{64}$'
    ) AS independent_audit_ready,
    coalesce((
      SELECT b.decision='approved' AND length(trim(coalesce(b.responsible_name,'')))>=3
        AND b.responsible_name !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'
        AND b.dossier_digest_sha256 ~ '^[0-9a-f]{64}$'
        AND b.decided_at>=c.pdf_validated_at
      FROM maximus_agents.scpi_candidate_batch_decisions b
      WHERE c.scpi_slug=ANY(b.candidate_slugs)
      ORDER BY b.decided_at DESC NULLS LAST LIMIT 1
    ),false) AS responsible_batch_ready
  FROM counted c
  LEFT JOIN maximus_agents.scpi_candidate_final_review r USING(scpi_slug)
  LEFT JOIN maximus_agents.scpi_candidate_final_audit a USING(scpi_slug)
)
SELECT c.scpi_slug,c.name,c.lifecycle,c.source_period,c.source_url,c.pdf_sha256,
 c.publisher_pdf_valid,c.current_qa_fields,c.annual_qa_fields,c.core_qa_fields,c.regulatory_documents_verified,
 (c.publisher_pdf_valid AND c.current_qa_fields>=12
   AND c.annual_qa_fields>=4 AND c.core_qa_fields>=11
   AND c.regulatory_documents_verified=3) AS financial_sources_ready,
 coalesce(a.geography_verified,false) AS geography_verified,
 coalesce(a.sector_verified,false) AS sector_verified,
 (coalesce(a.geography_verified,false) AND coalesce(a.sector_verified,false)) AS allocations_verified,
 coalesce(ap.current_indicators_ready,false) AS current_indicators_ready,
 coalesce(ap.bulletin_analysis_ready,false) AS bulletin_analysis_ready,
 coalesce(ap.historical_periods,0) AS historical_periods,
 coalesce(ap.live_trajectory_points,0) AS live_trajectory_points,
 coalesce(ap.live_liquidity_ready,false) AS live_liquidity_ready,
 coalesce(rv.independent_review_ready,false) AS independent_review_ready,
 coalesce(rv.independent_audit_ready,false) AS independent_audit_ready,
 coalesce(rv.responsible_batch_ready,false) AS responsible_batch_ready,
 (c.publisher_pdf_valid AND c.current_qa_fields>=12
  AND c.annual_qa_fields>=4 AND c.core_qa_fields>=11
  AND c.regulatory_documents_verified=3
  AND coalesce(a.geography_verified,false) AND coalesce(a.sector_verified,false)
  AND coalesce(ap.current_indicators_ready,false)
  AND coalesce(ap.bulletin_analysis_ready,false)
  AND coalesce(ap.historical_periods,0)>=2
  AND coalesce(ap.live_trajectory_points,0)>=2
  AND coalesce(ap.live_liquidity_ready,false)
  AND coalesce(rv.independent_review_ready,false)
  AND coalesce(rv.independent_audit_ready,false)
  AND coalesce(rv.responsible_batch_ready,false)) AS final_release_ready
FROM counted c
LEFT JOIN allocations a USING(scpi_slug)
LEFT JOIN app ap USING(scpi_slug)
LEFT JOIN reviewed rv USING(scpi_slug);
REVOKE ALL ON maximus_agents.scpi_candidate_release_circuit_v3 FROM PUBLIC, anon, authenticated;
GRANT SELECT ON maximus_agents.scpi_candidate_release_circuit_v3 TO service_role;
