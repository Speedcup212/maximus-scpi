-- MaximusSCPI 2026-10-17: One proportionate professional signoff PER BATCH.
-- Unchanged: official metrics, DIC/risk/fees, risk warnings, all actual product
-- consumers and Netlify postdeploy switch. No fabricated audit/signature.
-- Scope: 2025 annual + 2026-T2 evidence and registered private release members.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_batch_decisions (
  batch_id text PRIMARY KEY,
  candidate_slugs text[] NOT NULL,
  decision text NOT NULL DEFAULT 'draft'
    CHECK (decision IN ('draft','approved','rejected')),
  responsible_name text,
  decided_at timestamptz,
  decision_statement text,
  dossier_digest_sha256 text,
  review_evidence jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(review_evidence)='object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_responsible_batch_decision_integrity CHECK (
    cardinality(candidate_slugs) BETWEEN 1 AND 5
    AND (
      decision<>'approved' OR (
        length(btrim(coalesce(responsible_name,''))) >= 3
        AND decided_at IS NOT NULL
        AND length(btrim(coalesce(decision_statement,''))) >= 30
        AND dossier_digest_sha256 ~ '^[0-9a-f]{64}$'
        AND jsonb_typeof(review_evidence->'financial_risk_exceptions')='array'
        AND jsonb_typeof(review_evidence->'issuer_document_checks')='object'
      )
    )
  )
);
ALTER TABLE maximus_agents.scpi_candidate_batch_decisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON maximus_agents.scpi_candidate_batch_decisions
  FROM PUBLIC,anon,authenticated;
-- Only privileged server-side governance can record a real review; no anonymous
-- client or text instruction can create a database approval.

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_proportional_release_v2
WITH (security_invoker = true)
AS
WITH source_checks AS (
 SELECT g.scpi_slug, g.name, g.stage, g.lifecycle,
   g.annual_2025_sha_verified,
   g.quarter_2026_t2_sha_verified,
   g.annual_fields_qa_pass,
   g.quarter_fields_qa_pass,
   g.quarterly_core_qa_coverage,
   g.regulatory_and_source_registry_verified,
   COALESCE(a.allocations_verified,false) AS allocations_verified,
   (g.annual_2025_sha_verified
     AND g.quarter_2026_t2_sha_verified
     AND g.annual_fields_qa_pass>=6
     AND g.quarter_fields_qa_pass>=5
     AND g.quarterly_core_qa_coverage>=5
     AND g.regulatory_and_source_registry_verified
     AND COALESCE(a.allocations_verified,false)) AS source_financial_ready
 FROM maximus_agents.scpi_candidate_publication_gate_v1 g
 JOIN maximus_agents.scpi_candidate_release_members m USING(scpi_slug)
 LEFT JOIN maximus_agents.scpi_candidate_allocation_certification_v1 a USING(scpi_slug)
), full_checks AS (
 SELECT s.*, d.populated_field_count, d.unresolved_field_keys,
   (d.scpi_slug IS NOT NULL
     AND d.populated_field_count>=18
     AND d.unresolved_field_keys <@ '["withdrawal_terms"]'::jsonb
     AND d.provenance->>'annual_yield_reference'='2025-RA'
     AND d.provenance->>'annual_debt_reference'='2025-RA'
     AND d.publishing_fields->>'sfdr' IN ('Article 6','Article 8','Article 9')
     AND jsonb_typeof(d.publishing_fields->'risk_warnings')='array'
     AND jsonb_array_length(d.publishing_fields->'risk_warnings')>=1
     AND d.publishing_fields->>'liquidity_basis'
        IN ('withdrawal_queue','secondary_market_order_book')) AS disclosure_ready,
   (b.scpi_slug IS NOT NULL
     AND b.certification_status='certified'
     AND b.current_source_certified
     AND b.comparison_certified
     AND COALESCE(h.history_count,0)>=2
     AND COALESCE(h.period_count,0)>=2
     AND l.scpi_slug IS NOT NULL
     AND l.signal_certification IS NOT NULL
     AND l.source_period='2026-T2'
     AND l.nombre_parts>0
     AND (l.liquidity_basis<>'withdrawal_queue'
         OR l.parts_attente_retrait IS NOT NULL)) AS app_data_ready,
   (r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'verification_kind'
      ='actual_ephemeral_staging_chromium_run_not_a_financial_or_publication_signoff'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'github_run_completed_success'='true'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'checks_passed'='28'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'fund_specific_cases'='24'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'shared_cases'='4'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'commit_sha' ~ '^[0-9a-f]{40}$'
     AND r.review_evidence->'private_chromium_acceptance_2026_10_17'
      ->>'artifact_zip_sha256' ~ '^[0-9a-f]{64}$') AS private_browser_proof_recorded,
   d.source_period
 FROM source_checks s
 LEFT JOIN maximus_agents.scpi_candidate_publication_draft_v1 d USING(scpi_slug)
 LEFT JOIN public.scpi_bulletin_analysis b USING(scpi_slug)
 LEFT JOIN public.scpi_trajectory_pilot_liquidity l USING(scpi_slug)
 LEFT JOIN maximus_agents.scpi_candidate_final_review r USING(scpi_slug)
 LEFT JOIN LATERAL (
   SELECT count(*) AS history_count, count(DISTINCT source_period) AS period_count
   FROM public.scpi_trajectory_pilot_history th
   WHERE th.scpi_slug=s.scpi_slug AND th.qa_status IS NOT NULL
     AND th.source_url LIKE 'https://%'
 ) h ON true
), review_lookup AS (
 SELECT c.*,
   COALESCE(signoff.batch_id,'') AS responsible_batch_id,
   COALESCE(signoff.decision='approved',false) AS responsible_batch_approved
 FROM full_checks c
 LEFT JOIN LATERAL (
  SELECT b.batch_id,b.decision
  FROM maximus_agents.scpi_candidate_batch_decisions b
  WHERE b.decision='approved' AND c.scpi_slug=ANY(b.candidate_slugs)
    AND (
      SELECT count(*) FROM maximus_agents.scpi_candidate_release_members m
      WHERE m.scpi_slug=ANY(b.candidate_slugs)
    )=cardinality(b.candidate_slugs)
  ORDER BY b.decided_at DESC LIMIT 1
 ) signoff ON true
)
SELECT r.scpi_slug,r.name,r.stage,r.lifecycle,
 r.annual_2025_sha_verified,r.quarter_2026_t2_sha_verified,
 r.annual_fields_qa_pass,r.quarter_fields_qa_pass,r.quarterly_core_qa_coverage,
 r.regulatory_and_source_registry_verified,r.allocations_verified,
 r.populated_field_count,r.unresolved_field_keys,
 r.source_financial_ready,r.disclosure_ready,r.app_data_ready,
 r.private_browser_proof_recorded,r.responsible_batch_id,r.responsible_batch_approved,
 (r.source_financial_ready AND r.disclosure_ready AND r.app_data_ready
     AND r.private_browser_proof_recorded) AS technical_ready,
 (r.source_financial_ready AND r.disclosure_ready AND r.app_data_ready
     AND r.private_browser_proof_recorded AND r.responsible_batch_approved)
   AS final_release_ready
FROM review_lookup r;

REVOKE ALL ON maximus_agents.scpi_candidate_proportional_release_v2
  FROM PUBLIC,anon,authenticated;

-- Preserve EXACT v1 column contract: every consumer now sees the simplified
-- source-verified + single-responsible-batch gate, no four fake external audits.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_final_release_v1
AS
SELECT v.scpi_slug,v.name,v.stage,v.lifecycle,
  v.annual_2025_sha_verified,v.quarter_2026_t2_sha_verified,
  v.annual_fields_qa_pass,v.quarter_fields_qa_pass,
  v.quarterly_core_qa_coverage,v.regulatory_and_source_registry_verified,
  v.technical_ready AS release_ready,
  (v.responsible_batch_approved AND v.allocations_verified) AS full_qa_pass,
  v.final_release_ready
FROM maximus_agents.scpi_candidate_proportional_release_v2 v;

-- Prepublication RPC is used by the one supported promotion script.
-- It MUST respect final_release_ready (no longer the old manually-maintained
-- 8-flag review table).
CREATE OR REPLACE FUNCTION public.maximus_candidate_release_clearance(p_slugs text[])
RETURNS TABLE(scpi_slug text, release_ready boolean,
 publication_authorized boolean, analysis_certified boolean,
 live_indicators_ok boolean, liquidity_ok boolean)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
 SELECT u.scpi_slug, f.final_release_ready,
   u.publication_authorized,u.analysis_certified,
   EXISTS(SELECT 1 FROM public.scpi_indicators i WHERE i.scpi_slug=u.scpi_slug
    AND i.prix_souscription>0 AND i.td>0 AND i.tof BETWEEN 0 AND 100
    AND i.nombre_parts>0 AND i.qa_status IS NOT NULL),
   EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot_liquidity l
    WHERE l.scpi_slug=u.scpi_slug AND l.liquidity_basis IS NOT NULL
      AND l.nombre_parts>0)
 FROM maximus_agents.scpi_universe u
 JOIN maximus_agents.scpi_candidate_final_release_v1 f USING(scpi_slug)
 WHERE u.scpi_slug=ANY(p_slugs) AND u.lifecycle='candidate'
 ORDER BY u.scpi_slug;
$function$;

DO $no_fabrication$
DECLARE candidates_count int; ready_count int; unapproved_count int;
BEGIN
 SELECT count(*),
        count(*) FILTER (WHERE technical_ready),
        count(*) FILTER (WHERE NOT final_release_ready)
   INTO candidates_count,ready_count,unapproved_count
 FROM maximus_agents.scpi_candidate_proportional_release_v2
 WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl');
 IF candidates_count<>4 OR unapproved_count<>4
 THEN RAISE EXCEPTION 'No automatic signoff; state unexpected: % total, % awaiting approval',
   candidates_count,unapproved_count; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe
    WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND publication_authorized)
 THEN RAISE EXCEPTION 'A private fund became public without responsible signoff'; END IF;
 RAISE NOTICE 'No-go remains until one professional batch decision: %/4 source-based technical ready',ready_count;
END $no_fabrication$;
