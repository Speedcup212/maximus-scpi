-- RECOVERY-091: the v3 circuit already accepts documented issuer rounding.
-- Reconcile the second allocation gate without changing values, QA or final review.
-- Non-exact sums require tenths precision AND every original source/page/SHA check.
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
    sum(a.pct) AS pct_total,
    bool_and(a.pct * 10 = trunc(a.pct * 10)) AS issuer_tenths_precision
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
      AND c.verified_count=c.expected_count AND (c.pct_total=100 OR (c.issuer_tenths_precision
        AND abs(c.pct_total-100) <= 0.05::numeric*c.expected_count))),false) AS geography_verified,
   coalesce(bool_or(c.allocation_type='sector'
      AND c.expected_count>0 AND c.actual_count=c.expected_count
      AND c.distinct_count=c.expected_count
      AND c.verified_count=c.expected_count AND (c.pct_total=100 OR (c.issuer_tenths_precision
        AND abs(c.pct_total-100) <= 0.05::numeric*c.expected_count))),false) AS sector_verified
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

GRANT SELECT ON maximus_agents.scpi_candidate_allocation_certification_v1 TO service_role;
