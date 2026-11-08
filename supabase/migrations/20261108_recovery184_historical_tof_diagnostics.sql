-- RECOVERY-184: exact historical TOF quarantine blocker matrix, read-only.
-- The current strict PASS_100 predicate remains unchanged. The view keeps
-- previously reviewed quarantines visible without treating them as blockers.
CREATE OR REPLACE VIEW maximus_agents.scpi_historical_tof_quarantine_qa_v1
WITH (security_invoker=true)
AS
WITH per_period AS (
 SELECT
  q.scpi_slug,q.source_period,q.certificate_id,q.quarantined_at,
  q.rejection_reason AS original_quarantine_reason,
  c.verification_status AS current_certificate_status,
  c.verification_method,c.value_numeric AS certified_tof,
  c.source_page AS certificate_page,c.source_url AS certificate_url,
  h.qa_status AS current_history_status,
  h.tof AS canonical_tof,
  (c.id IS NULL) AS certificate_missing,
  (c.id IS NOT NULL
   AND c.verification_status NOT LIKE 'manual_verified_official%'
   AND NOT scpi_internal.independent_tof_geometric_proof_valid(
      c.id,c.scpi_slug,c.source_period,c.source_url,c.value_numeric,c.source_page)
  ) AS independent_proof_missing,
  (c.value_numeric IS NULL OR c.source_page IS NULL OR c.source_page<=0) AS incomplete_certificate,
  scpi_internal.tof_bulletin_source_rejection_reason(
     c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status
  ) AS current_source_policy_rejection,
  (h.id IS NULL) AS history_missing,
  (h.qa_status LIKE 'invalid%') AS history_invalid,
  (h.tof IS DISTINCT FROM c.value_numeric) AS history_value_mismatch,
  EXISTS (
    SELECT 1 FROM maximus_agents.scpi_bulletin_replay_documents d
    WHERE d.scpi_slug=q.scpi_slug AND d.source_period=q.source_period
      AND d.status='extracted' AND d.processing_complete IS TRUE
      AND d.result->>'identity_verified'='true'
      AND d.result->>'period_verified'='true'
      AND d.pdf_sha256 ~ '^[a-f0-9]{64}$'
  ) AS has_archive_pdf_exact_period
 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
 JOIN maximus_agents.scpi_universe u
  ON u.scpi_slug=q.scpi_slug AND u.lifecycle='existing'
 LEFT JOIN public.scpi_metric_certifications c ON c.id=q.certificate_id
 LEFT JOIN public.scpi_indicator_history h
  ON h.scpi_slug=q.scpi_slug AND h.source_period=q.source_period
)
SELECT
 p.scpi_slug,p.source_period,p.certificate_id,p.quarantined_at,
 p.original_quarantine_reason,
 p.current_certificate_status,p.verification_method,p.certified_tof,
 p.certificate_page,p.certificate_url,p.current_history_status,p.canonical_tof,
 p.certificate_missing,p.independent_proof_missing,p.incomplete_certificate,
 p.current_source_policy_rejection,p.history_missing,p.history_invalid,
 p.history_value_mismatch,p.has_archive_pdf_exact_period,
 (p.certificate_missing OR p.independent_proof_missing OR p.incomplete_certificate
    OR p.current_source_policy_rejection IS NOT NULL
    OR p.history_missing OR p.history_invalid OR p.history_value_mismatch)
    AS still_blocks_strict_pass,
 CASE
    WHEN NOT (p.certificate_missing OR p.independent_proof_missing OR p.incomplete_certificate
       OR p.current_source_policy_rejection IS NOT NULL
       OR p.history_missing OR p.history_invalid OR p.history_value_mismatch)
      THEN 'ALREADY_RECONCILED_HISTORICAL_PROOF'
    WHEN p.certificate_missing THEN 'ORPHAN_CERTIFICATE_ID'
    WHEN p.current_source_policy_rejection='TOF_ASPIM_FORBIDDEN'
      THEN 'ASPIM_TOF_NOT_ADMISSIBLE'
    WHEN p.current_source_policy_rejection='OUTSIDE_ISSUER_OFFICIAL_HOSTS'
      THEN 'OUTSIDE_ISSUER_DOCUMENT_HOST'
    WHEN p.current_source_policy_rejection IS NOT NULL
      THEN 'SOURCE_POLICY_REJECTION'
    WHEN p.incomplete_certificate THEN 'CERTIFICATE_PAGE_OR_VALUE_MISSING'
    WHEN p.independent_proof_missing THEN 'INDEPENDENT_PAGE_PROOF_MISSING'
    WHEN p.history_missing THEN 'CANONICAL_HISTORY_MISSING'
    WHEN p.history_invalid THEN 'CANONICAL_HISTORY_QUARANTINED'
    WHEN p.history_value_mismatch THEN 'CANONICAL_TOF_VALUE_CONFLICT'
    ELSE 'REQUIRES_INDEPENDENT_QA' END AS repair_family,
 CASE
    WHEN p.current_source_policy_rejection IS NOT NULL OR p.certificate_missing
      THEN 'SEARCH'
    WHEN p.history_invalid OR p.history_missing THEN 'DATA'
    ELSE 'ANALYST' END AS proposed_owner_role,
 true::boolean AS independent_qa_required,
 false::boolean AS changes_financial_data,
 false::boolean AS permits_strict_pass,
 false::boolean AS task_dispatched
FROM per_period p;

REVOKE ALL ON maximus_agents.scpi_historical_tof_quarantine_qa_v1
 FROM PUBLIC,anon,authenticated;
COMMENT ON VIEW maximus_agents.scpi_historical_tof_quarantine_qa_v1 IS
 'Exact current strict historical TOF quarantine integrity predicate, including resolved audit rows. Read-only diagnostic; never unquarantine ASPIM/third party sources, never grant strict PASS.';

CREATE OR REPLACE VIEW maximus_agents.scpi_historical_tof_quarantine_summary_v1
WITH (security_invoker=true)
AS
SELECT q.scpi_slug,
 count(*)::int AS archived_quarantines,
 count(*) FILTER(WHERE q.still_blocks_strict_pass)::int AS still_blocking,
 count(*) FILTER(WHERE NOT q.still_blocks_strict_pass)::int AS already_reconciled,
 count(*) FILTER(WHERE q.still_blocks_strict_pass AND q.repair_family='ASPIM_TOF_NOT_ADMISSIBLE')::int AS aspim_rejections,
 count(*) FILTER(WHERE q.still_blocks_strict_pass AND q.repair_family='OUTSIDE_ISSUER_DOCUMENT_HOST')::int AS source_host_rejections,
 count(*) FILTER(WHERE q.still_blocks_strict_pass AND q.history_invalid)::int AS invalid_history_rows,
 count(*) FILTER(WHERE q.still_blocks_strict_pass AND q.has_archive_pdf_exact_period)::int AS blocked_but_has_exact_pdf,
 array_agg(q.source_period ORDER BY q.source_period)
   FILTER(WHERE q.still_blocks_strict_pass)::text[] AS remaining_periods,
 false::boolean AS financial_certified
FROM maximus_agents.scpi_historical_tof_quarantine_qa_v1 q
GROUP BY q.scpi_slug;

REVOKE ALL ON maximus_agents.scpi_historical_tof_quarantine_summary_v1
 FROM PUBLIC,anon,authenticated;
COMMENT ON VIEW maximus_agents.scpi_historical_tof_quarantine_summary_v1 IS
 'Immutable-source QA triage for CONTROL. Existing 43 quarantine audit rows do not imply 43 current blockers.';
