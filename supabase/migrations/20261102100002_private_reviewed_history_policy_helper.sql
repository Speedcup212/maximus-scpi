-- Display only the exact previous snapshot already reviewed for a published
-- batch. Its QA status is unchanged: visibility does not certify a trend.
CREATE OR REPLACE FUNCTION maximus_agents.scpi_has_exact_reviewed_history(p_snapshot jsonb)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT COALESCE(
   p_snapshot->>'qa_status'='source_verified_delegated_review'
   AND p_snapshot->>'source_type'='official_issuer_pdf_delegated_source_review'
   AND (p_snapshot->'metric_provenance'->>'pdf_sha256') ~ '^[a-f0-9]{64}$'
   AND EXISTS (
     SELECT 1 FROM maximus_agents.scpi_candidate_final_review r
     JOIN maximus_agents.scpi_candidate_batch_decisions b
       ON r.scpi_slug=ANY(b.candidate_slugs)
     JOIN maximus_agents.scpi_universe u ON u.scpi_slug=r.scpi_slug
     WHERE r.scpi_slug=p_snapshot->>'scpi_slug'
       AND r.reviewed_at IS NOT NULL
       AND r.review_evidence->'approved_analysis_snapshot'->'previous_snapshot'=p_snapshot
       AND b.decision='approved'
       AND b.dossier_digest_sha256 ~ '^[a-f0-9]{64}$'
       AND b.dossier_digest_sha256=p_snapshot->'metric_provenance'->>'review_digest_sha256'
       AND maximus_agents.scpi_delegated_actor_authorized(b.responsible_name)
       AND b.review_evidence->>'production_deploy_sha' ~ '^[a-f0-9]{40}$'
       AND u.lifecycle='existing' AND u.stage='strict_pass'
       AND u.strict_pass AND u.analysis_certified AND u.publication_authorized
   ),false);
$$;
REVOKE ALL ON FUNCTION maximus_agents.scpi_has_exact_reviewed_history(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION maximus_agents.scpi_has_exact_reviewed_history(jsonb) TO anon,authenticated,service_role;
ALTER POLICY allow_public_select_certified_history ON public.scpi_indicator_history
USING (
  (public.scpi_is_strong_qa(qa_status)
   OR maximus_agents.scpi_has_exact_reviewed_history(to_jsonb(scpi_indicator_history)))
  AND source_url IS NOT NULL
  AND public.maximus_scpi_is_in_public_cohort(scpi_slug)
);

-- The policy helper is private and is not an exposed PostgREST RPC.
REVOKE ALL ON FUNCTION public.maximus_scpi_has_exact_reviewed_history(jsonb) FROM PUBLIC,anon,authenticated,service_role;
