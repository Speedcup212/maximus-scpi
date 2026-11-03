-- RECOVERY-073: narrow, service-role-only entrypoint for independently
-- approved prepared batches after the caller verified live Netlify SHA and routes.
-- This function NEVER creates a QA certificate or grants batch approval.
CREATE OR REPLACE FUNCTION public.maximus_publish_verified_prepared_release(
  p_release_sha text,
  p_netlify_deploy_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_batch_id text;
  v_slugs text[];
  v_before integer;
  v_result jsonb;
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role'
     AND session_user <> 'postgres' THEN
    RAISE EXCEPTION 'Trusted backend service role required';
  END IF;
  IF p_release_sha !~ '^[a-f0-9]{40}$'
     OR p_netlify_deploy_id !~ '^[a-f0-9]{24}$' THEN
    RAISE EXCEPTION 'Exact Git SHA and Netlify deploy ID required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('maximusscpi_candidate_batch_release_v3')
  );
  SELECT b.batch_id, b.candidate_slugs INTO v_batch_id, v_slugs
    FROM maximus_agents.scpi_prepared_releases p
    JOIN maximus_agents.scpi_candidate_batch_decisions b USING (batch_id)
   WHERE p.release_sha = p_release_sha
     AND p.expires_at > now()
     AND b.decision = 'approved'
     AND b.dossier_digest_sha256 ~ '^[a-f0-9]{64}$'
     AND b.review_evidence->>'production_deploy_sha' = p_release_sha
     AND maximus_agents.scpi_delegated_actor_authorized(b.responsible_name)
   FOR UPDATE OF p;

  IF v_batch_id IS NULL OR v_slugs IS NULL OR
     cardinality(v_slugs) NOT BETWEEN 1 AND 5 OR
     cardinality(v_slugs) <> (SELECT count(DISTINCT s) FROM unnest(v_slugs) AS s) THEN
    RAISE EXCEPTION 'No valid independently approved batch for this exact SHA';
  END IF;

  SELECT count(*) INTO v_before FROM public.scpi_indicators;
  IF (SELECT count(*) FROM public.scpi_trajectory_pilot WHERE enabled) <> v_before THEN
    RAISE EXCEPTION 'Public indicators and active trajectory counts diverge';
  END IF;

  -- Existing audited v3 function verifies all source, technical, financial,
  -- independent QA, private tool, and batch approval gates inside one TX.
  v_result := maximus_agents.promote_candidate_batch_v3(
    v_batch_id, v_before, v_before + cardinality(v_slugs), p_release_sha
  );
  IF v_result->>'published' IS DISTINCT FROM 'true' OR
     (v_result->>'after')::integer <> v_before + cardinality(v_slugs) OR
     (SELECT count(*) FROM public.scpi_indicators WHERE scpi_slug=ANY(v_slugs))
       <> cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Atomic release verification failed; transaction rolled back';
  END IF;

  RETURN v_result || jsonb_build_object('netlify_deploy_id', p_netlify_deploy_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.maximus_publish_verified_prepared_release(text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.maximus_publish_verified_prepared_release(text,text)
  TO service_role;
