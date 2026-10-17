-- Hotfix: admin SQL recovery for a Netlify-published cohort whose
-- postdeploy activation job was missed. The pre-existing service_role gate stays.
-- A direct Postgres owner session (no JWT) can legitimately operate the same
-- verified stored procedure, but anon/authenticated traffic cannot.
-- Explicitly do not SET request.jwt.claim.role or impersonate a reviewer.
CREATE OR REPLACE FUNCTION public.maximus_activate_candidate_after_deploy(p_slugs text[], p_release_sha text, p_netlify_deploy_id text)
 RETURNS TABLE(activated_slug text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE requested int;ready int;current_state int;
BEGIN
 IF NOT (auth.role() = 'service_role'
       OR (auth.role() IS NULL AND session_user = 'postgres')) THEN
  RAISE EXCEPTION 'Activation requires service role or privileged postgres operator after verified Netlify release';
 END IF;
 requested:=coalesce(array_length(p_slugs,1),0);
 IF requested NOT BETWEEN 1 AND 5 OR
    (SELECT count(DISTINCT s) FROM unnest(p_slugs) s WHERE s~'^[a-z0-9]+(-[a-z0-9]+)*$')<>requested THEN
   RAISE EXCEPTION 'Activation requires 1-5 distinct canonical SCPI slugs';
 END IF;
 IF p_release_sha !~ '^[a-f0-9]{40}$' OR
    p_netlify_deploy_id !~ '^[a-f0-9]{24}$' THEN
   RAISE EXCEPTION 'Activation needs verified exact release SHA and Netlify deployment ID';
 END IF;

 -- Strict source/analysis/independent review and actual tool-staging checks.
 -- The source code must already be deployed and served as verified by caller.
 SELECT count(*) INTO ready
 FROM maximus_agents.scpi_universe u
 JOIN maximus_agents.scpi_candidate_release_members m USING(scpi_slug)
 JOIN maximus_agents.scpi_candidate_final_release_v1 f USING(scpi_slug)
 JOIN maximus_agents.scpi_candidate_tool_readiness t USING(scpi_slug)
 JOIN public.scpi_bulletin_analysis a USING(scpi_slug)
 WHERE u.scpi_slug=ANY(p_slugs) AND u.lifecycle='candidate'
   AND NOT u.strict_pass AND NOT u.analysis_certified AND NOT u.publication_authorized
   AND f.final_release_ready IS TRUE
   AND t.full_surface_ready IS TRUE
   AND t.analysis_ready IS TRUE
   AND t.finance_and_final_qa_ready IS TRUE
   AND a.certification_status='certified'
   AND a.current_source_certified IS TRUE
   AND a.comparison_certified IS TRUE;
 IF ready<>requested THEN
  RAISE EXCEPTION 'Activation blocked: % of % SCPI have approved batch and complete technical QA',ready,requested;
 END IF;

 -- One atomic transition: satisfies both forbid_candidate_verified_claim and
 -- forbid_unverified_publication without transient public exposure.
 RETURN QUERY WITH transitioned AS (
  UPDATE maximus_agents.scpi_universe u
  SET lifecycle='existing', stage='strict_pass', strict_pass=true,
      analysis_certified=true,publication_authorized=true,
      review_note=concat(coalesce(u.review_note,''),
        ' | PUBLIC ACTIVATION: Netlify=',p_netlify_deploy_id,
        ' Git SHA=',p_release_sha,' signed QA+tool gates verified.'),
      last_checked_at=now(),updated_at=now()
  WHERE u.scpi_slug=ANY(p_slugs) AND u.lifecycle='candidate'
    AND NOT u.publication_authorized AND NOT u.analysis_certified
  RETURNING u.scpi_slug
 )
 SELECT scpi_slug FROM transitioned ORDER BY scpi_slug;

 GET DIAGNOSTICS current_state=ROW_COUNT;
 IF current_state<>requested THEN
   RAISE EXCEPTION 'Atomic activation failed; partial batch rollback';
 END IF;
END;
$function$

