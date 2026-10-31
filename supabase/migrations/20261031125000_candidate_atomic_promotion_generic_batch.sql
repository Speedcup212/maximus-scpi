-- Atomic, fail-closed release of an explicitly signed-off candidate batch.
-- Does NOT run automatically. Release controller must first verify that the
-- Netlify/GitHub build contains the matching explicit certified cohort.
CREATE OR REPLACE FUNCTION maximus_agents.promote_candidate_batch_v3(
  p_batch_id text,
  p_expected_before integer,
  p_expected_after integer,
  p_deployed_commit_sha text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog,public,maximus_agents
AS $$
DECLARE
  v_slugs text[];
  v_count integer;
  v_ready integer;
  v_after integer;
  v_commit text;
BEGIN
  IF current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'Candidate release requires trusted backend role';
  END IF;
  IF p_batch_id IS NULL OR p_batch_id='' OR p_deployed_commit_sha !~ '^[a-f0-9]{40}$'
     OR p_expected_after<=p_expected_before OR p_expected_before<66 THEN
    RAISE EXCEPTION 'Invalid release parameters or deployed commit SHA';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('maximusscpi_candidate_batch_release_v3'));
  SELECT b.candidate_slugs, b.review_evidence->>'production_deploy_sha'
  INTO v_slugs, v_commit
  FROM maximus_agents.scpi_candidate_batch_decisions b
  WHERE b.batch_id=p_batch_id AND b.decision='approved'
    AND b.dossier_digest_sha256 ~ '^[a-f0-9]{64}$'
    AND coalesce(b.responsible_name,'') !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT'
  LIMIT 1;
  IF v_slugs IS NULL OR cardinality(v_slugs)<1 OR
     (SELECT count(DISTINCT slug) FROM unnest(v_slugs) slug)<>cardinality(v_slugs) OR
     v_commit IS DISTINCT FROM p_deployed_commit_sha THEN
    RAISE EXCEPTION 'Batch approval, exact candidates or production deploy proof missing';
  END IF;
  IF p_expected_after<>p_expected_before+cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Expected target cohort count does not match signed batch size';
  END IF;
  SELECT count(*) INTO v_count FROM public.scpi_trajectory_pilot WHERE enabled;
  IF v_count<>p_expected_before THEN
    RAISE EXCEPTION 'Pre-release active pilot count % differs from expected %',
      v_count,p_expected_before;
  END IF;
  IF EXISTS(SELECT 1 FROM public.scpi_indicators i WHERE i.scpi_slug=ANY(v_slugs))
     OR EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p
       WHERE p.scpi_slug=ANY(v_slugs) AND p.enabled)
     OR (SELECT count(*) FROM maximus_agents.scpi_candidate_indicator_stage s
       WHERE s.scpi_slug=ANY(v_slugs))<>cardinality(v_slugs) THEN
    RAISE EXCEPTION 'A target candidate is already published or missing from private stage';
  END IF;
  SELECT count(*) INTO v_ready
  FROM maximus_agents.scpi_candidate_release_circuit_v3 r
  JOIN maximus_agents.scpi_candidate_indicator_stage s USING(scpi_slug)
  WHERE r.scpi_slug=ANY(v_slugs)
    AND r.final_release_ready
    AND r.lifecycle='candidate'
    AND s.source_period=r.source_period
    AND s.source_url=r.source_url
    AND s.qa_status='technical_qa_pass_pending_responsible_approval';
  IF v_ready<>cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Fail closed: only % of % candidates have all financial, UI and human release proofs',v_ready,cardinality(v_slugs);
  END IF;
  -- No partial publication: all subsequent writes use this single transaction.
  INSERT INTO public.scpi_indicators
  SELECT (jsonb_populate_record(NULL::public.scpi_indicators,
      (to_jsonb(s) - 'staged_at' - 'stage_note') || jsonb_build_object(
        'qa_status','approved_official_pdf_human_review',
        'source_type','approved_primary_publisher_release'))).*
  FROM maximus_agents.scpi_candidate_indicator_stage s
  WHERE s.scpi_slug=ANY(v_slugs);
  UPDATE public.scpi_trajectory_pilot p SET enabled=true
  WHERE p.scpi_slug=ANY(v_slugs) AND NOT p.enabled;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pilot rows updated during candidate publication';
  END IF;
  UPDATE maximus_agents.scpi_universe u
  SET lifecycle='existing',stage='strict_pass',strict_pass=true,
      analysis_certified=true,publication_authorized=true,
      updated_at=now(),
      review_note=coalesce(u.review_note,'') || ' | Approved atomic batch: '||p_batch_id
  WHERE u.scpi_slug=ANY(v_slugs) AND u.lifecycle='candidate';
  SELECT count(*) INTO v_after FROM public.scpi_trajectory_pilot WHERE enabled;
  IF v_after<>p_expected_after THEN
    RAISE EXCEPTION 'Fail closed: active count after publish % != expected %',
       v_after,p_expected_after;
  END IF;
  IF (SELECT count(*) FROM public.scpi_indicators i
      WHERE i.scpi_slug=ANY(v_slugs))<>cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Fail closed: published indicator count does not match batch size';
  END IF;
  RETURN jsonb_build_object('published',true,'batch_id',p_batch_id,
     'candidate_slugs',v_slugs,'before',v_count,'after',v_after,
     'deployed_commit',p_deployed_commit_sha);
END;
$$;
REVOKE ALL ON FUNCTION maximus_agents.promote_candidate_batch_v3(text,integer,integer,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION maximus_agents.promote_candidate_batch_v3(text,integer,integer,text)
 TO service_role;
