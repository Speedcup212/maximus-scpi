-- RECOVERY-073: internal financial certifiers and worker queue claimers must not
-- be anonymously callable through the public REST RPC endpoints.
-- This leaves client-facing read-only helper functions unchanged.
REVOKE EXECUTE ON FUNCTION public.certify_scpi_bulletin_analysis(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_scpi_metric_certifications(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_scpi_material_vigilance(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_scpi_backfill_job() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_scpi_trajectory_jobs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.certify_scpi_bulletin_analysis(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_scpi_metric_certifications(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_scpi_material_vigilance(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_scpi_backfill_job() TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_scpi_trajectory_jobs(integer) TO service_role;
