-- RECOVERY / MaximusSCPI: allocations must be certified before any candidate release.
-- Reuses the single canonical indicator + exact official PDF / page / SHA registry.
-- This changes no SCPI financial value, QA flag, reviewer approval or public status.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_allocation_certification_v1
WITH (security_invoker = true) AS
WITH axes AS (
  SELECT i.scpi_slug,i.source_period,'geography'::text AS allocation_type,
         i.repartition_geographique AS expected_data
  FROM public.scpi_indicators i
  JOIN maximus_agents.scpi_candidate_release_members m USING(scpi_slug)
  UNION ALL
  SELECT i.scpi_slug,i.source_period,'sector'::text AS allocation_type,
         i.repartition_sectorielle AS expected_data
  FROM public.scpi_indicators i
  JOIN maximus_agents.scpi_candidate_release_members m USING(scpi_slug)
), checks AS (
  SELECT f.scpi_slug,f.allocation_type,
    CASE WHEN jsonb_typeof(f.expected_data)='object'
         THEN (SELECT count(*) FROM jsonb_object_keys(f.expected_data)) ELSE 0 END AS expected_count,
    count(a.label) AS actual_count,
    count(DISTINCT a.label) AS distinct_count,
    count(a.label) FILTER (WHERE
      a.qa_status='qa_pass' AND a.pct BETWEEN 0 AND 100
      AND a.source_page BETWEEN 1 AND v.page_count
      AND a.source_url=b.source_url AND a.source_sha256=b.pdf_sha256
      AND b.pdf_sha256~'^[0-9a-f]{64}$'
      AND b.period=f.source_period AND public.scpi_is_strong_qa(b.qa_status)
      AND v.document_identity_verified IS TRUE AND v.pdf_sha256=b.pdf_sha256
      AND a.source_url LIKE 'https://%'
      AND length(coalesce(a.evidence_excerpt,''))>=40
      AND jsonb_typeof(f.expected_data->a.label)='number'
      AND (f.expected_data->>a.label)::numeric=a.pct
    ) AS verified_count,
    sum(a.pct) AS pct_total
  FROM axes f
  LEFT JOIN maximus_agents.scpi_candidate_allocations a
    ON a.scpi_slug=f.scpi_slug AND a.source_period=f.source_period
   AND a.allocation_type=f.allocation_type
  LEFT JOIN public.scpi_bulletins b
    ON b.scpi_slug=a.scpi_slug AND b.period=a.source_period AND b.source_url=a.source_url
  LEFT JOIN maximus_agents.scpi_candidate_pdf_validation v
    ON v.scpi_slug=a.scpi_slug AND v.source_period=a.source_period
   AND v.source_url=a.source_url AND v.document_kind='quarterly_bulletin'
  GROUP BY f.scpi_slug,f.allocation_type,f.expected_data
), result AS (
 SELECT u.scpi_slug,
   coalesce(bool_or(c.allocation_type='geography'
      AND c.expected_count>0 AND c.actual_count=c.expected_count
      AND c.distinct_count=c.expected_count
      AND c.verified_count=c.expected_count AND c.pct_total=100),false) AS geography_verified,
   coalesce(bool_or(c.allocation_type='sector'
      AND c.expected_count>0 AND c.actual_count=c.expected_count
      AND c.distinct_count=c.expected_count
      AND c.verified_count=c.expected_count AND c.pct_total=100),false) AS sector_verified
 FROM maximus_agents.scpi_universe u
 JOIN maximus_agents.scpi_candidate_release_members m USING(scpi_slug)
 LEFT JOIN checks c USING(scpi_slug)
 GROUP BY u.scpi_slug
)
SELECT scpi_slug,geography_verified,sector_verified,
  (geography_verified AND sector_verified) AS allocations_verified
FROM result;
REVOKE ALL ON maximus_agents.scpi_candidate_allocation_certification_v1
FROM PUBLIC,anon,authenticated;

-- Fail-closed financial/product release: the original independent final audit
-- is necessary but can NEVER override a missing/uncertified geographic chart.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_final_release_v1 AS
SELECT v.scpi_slug,v.name,v.stage,v.lifecycle,
 v.annual_2025_sha_verified,v.quarter_2026_t2_sha_verified,
 v.annual_fields_qa_pass,v.quarter_fields_qa_pass,
 v.quarterly_core_qa_coverage,v.regulatory_and_source_registry_verified,
 v.release_ready,
 (coalesce(qa.approved,false) AND coalesce(al.allocations_verified,false)) AS full_qa_pass,
 (v.release_ready AND coalesce(qa.approved,false)
                  AND coalesce(al.allocations_verified,false)) AS final_release_ready
FROM maximus_agents.scpi_candidate_publication_gate_v1 v
LEFT JOIN LATERAL (
  SELECT EXISTS (SELECT 1 FROM maximus_agents.scpi_candidate_final_audit a
   WHERE a.scpi_slug=v.scpi_slug AND a.audit_status='approved'
     AND a.historical_consistency_pass AND a.financial_coverage_pass
     AND a.liquidity_risk_pass AND a.document_regulatory_pass
     AND a.public_display_mapping_pass AND a.approved_at IS NOT NULL
     AND a.evidence_digest_sha256~'^[0-9a-f]{64}$') AS approved
) qa ON true
LEFT JOIN maximus_agents.scpi_candidate_allocation_certification_v1 al
  USING(scpi_slug);
REVOKE ALL ON maximus_agents.scpi_candidate_final_release_v1
FROM PUBLIC,anon,authenticated;

-- Same existing, unique worker queue; merely expose the REAL missing gate.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_work_queue AS
SELECT u.scpi_slug,u.name,u.management_company,u.origin_type,u.origin_url,u.stage,
 CASE
  WHEN NOT coalesce(g.annual_2025_sha_verified,false)
    OR NOT coalesce(g.quarter_2026_t2_sha_verified,false)
    THEN CASE WHEN u.stage='identity_only'
      THEN CASE WHEN u.origin_type='aspim_official'
        THEN 'LOCATE_PRIMARY_ISSUER_DOCUMENTS'
        ELSE 'VERIFY_EXISTENCE_AND_PRODUCT_STATUS' END
      ELSE 'VERIFY_PDF_AND_IDENTITY' END
  WHEN coalesce(g.annual_fields_qa_pass,0)<4
    OR coalesce(g.quarter_fields_qa_pass,0)<5
    OR coalesce(g.quarterly_core_qa_coverage,0)<4
    THEN 'COMPLETE_PAGINATED_METRIC_QA'
  WHEN NOT coalesce(g.regulatory_and_source_registry_verified,false)
    THEN 'VERIFY_REGULATORY_AND_SOURCE_REGISTRY'
  WHEN NOT coalesce(t.analysis_ready,false)
    THEN 'CERTIFY_EXACT_PERIOD_BULLETIN_ANALYSIS'
  WHEN NOT coalesce(t.catalog_and_simulator_ready,false)
    OR NOT coalesce(t.comparator_radar_ready,false)
    OR NOT coalesce(t.client_card_ready,false)
    OR NOT coalesce(t.trajectory_ready,false)
    OR NOT coalesce(t.liquidity_ready,false)
    THEN 'COMPLETE_IROKO_ATLAS_TOOL_PARITY'
  WHEN NOT coalesce(al.allocations_verified,false)
    THEN 'VERIFY_EXACT_PERIOD_ALLOCATIONS'
  WHEN NOT coalesce(t.finance_and_final_qa_ready,false)
    THEN 'INDEPENDENT_FINANCIAL_AND_FINAL_QA'
  ELSE 'CONTROLLED_PUBLICATION_REVIEW'
 END AS next_action,
 CASE
  WHEN coalesce(g.annual_2025_sha_verified,false)
   AND coalesce(g.quarter_2026_t2_sha_verified,false)
   AND coalesce(g.annual_fields_qa_pass,0)>=4
   AND coalesce(g.quarter_fields_qa_pass,0)>=5
   AND coalesce(g.quarterly_core_qa_coverage,0)>=4
   AND coalesce(g.regulatory_and_source_registry_verified,false) THEN 0
  WHEN coalesce(g.annual_2025_sha_verified,false)
   AND coalesce(g.quarter_2026_t2_sha_verified,false) THEN 1
  WHEN u.stage='primary_source_found' THEN 2
  WHEN u.origin_type='aspim_official' THEN 3
  ELSE 4
 END AS priority_bucket,
 u.review_note,u.first_seen_at,u.last_checked_at
FROM maximus_agents.scpi_universe u
LEFT JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING(scpi_slug)
LEFT JOIN maximus_agents.scpi_candidate_tool_readiness t USING(scpi_slug)
LEFT JOIN maximus_agents.scpi_candidate_allocation_certification_v1 al USING(scpi_slug)
WHERE u.lifecycle='candidate' AND NOT u.strict_pass AND NOT u.publication_authorized;
REVOKE ALL ON maximus_agents.scpi_candidate_work_queue
FROM PUBLIC,anon,authenticated;

DO $verify$
BEGIN
 IF EXISTS (
  SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1 f
  LEFT JOIN maximus_agents.scpi_candidate_allocation_certification_v1 a USING(scpi_slug)
  WHERE f.final_release_ready AND NOT coalesce(a.allocations_verified,false)
 ) THEN RAISE EXCEPTION 'Uncertified allocations must never pass final release'; END IF;
 IF EXISTS (
  SELECT 1 FROM maximus_agents.scpi_candidate_tool_readiness t
  JOIN maximus_agents.scpi_candidate_final_release_v1 f USING(scpi_slug)
  WHERE t.finance_and_final_qa_ready AND NOT f.final_release_ready
 ) THEN RAISE EXCEPTION 'Real tool release readiness bypassed financial QA'; END IF;
 IF EXISTS (
  SELECT 1 FROM maximus_agents.scpi_universe
  WHERE lifecycle='candidate' AND (analysis_certified OR publication_authorized)
 ) THEN RAISE EXCEPTION 'Unpublished candidate incorrectly made public'; END IF;
END $verify$;
