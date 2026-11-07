-- RECOVERY-130 — repair the existing CORUM ingestion trigger path.
-- public.scpi_indicators AFTER UPDATE invokes
-- maximus_agents.restore_exact_reviewed_analysis(), an INVOKER trigger.
-- It reads maximus_agents.scpi_candidate_final_review even for CORUM existing
-- SCPI. The OIDC-restricted CORUM Edge Function invokes the write RPC as
-- service_role; the private final-review table currently grants only postgres.
-- Grant a single read-only table privilege to the server-only service_role.
-- Never expose review evidence to a browser, anon, or authenticated users.
-- RLS remains enabled. No finance data, qa_status, or release status is changed.
REVOKE SELECT ON TABLE maximus_agents.scpi_candidate_final_review
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE maximus_agents.scpi_candidate_final_review
  TO service_role;
