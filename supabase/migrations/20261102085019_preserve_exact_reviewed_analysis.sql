-- Preserve a source-reviewed analysis only while the exact approved data,
-- issuer binary, private decision and real browser evidence still match.
-- Any source/period/value/approval change leaves the ordinary quality guard intact.
CREATE OR REPLACE FUNCTION maximus_agents.restore_exact_reviewed_analysis()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path=pg_catalog,public,maximus_agents AS $$
DECLARE approved jsonb; staged jsonb;
BEGIN
 IF current_user NOT IN ('postgres','service_role') THEN RETURN NEW; END IF;
 SELECT r.review_evidence->'approved_analysis_snapshot',
        to_jsonb(s)-ARRAY['staged_at','stage_note','updated_at','qa_status','source_type']
 INTO approved,staged
 FROM maximus_agents.scpi_candidate_final_review r
 JOIN maximus_agents.scpi_candidate_indicator_stage s USING(scpi_slug)
 JOIN maximus_agents.scpi_candidate_release_circuit_v3 g USING(scpi_slug)
 JOIN public.scpi_bulletins b ON b.id=NEW.bulletin_id AND b.scpi_slug=NEW.scpi_slug
 WHERE r.scpi_slug=NEW.scpi_slug AND s.source_period=NEW.source_period
  AND s.source_url=NEW.source_url AND g.financial_sources_ready AND g.allocations_verified
  AND g.independent_review_ready AND g.independent_audit_ready AND g.responsible_batch_ready
  AND b.period=NEW.source_period AND b.source_url=NEW.source_url
  AND b.pdf_sha256=g.pdf_sha256 AND public.scpi_is_strong_qa(b.qa_status)
  AND public.scpi_is_strong_qa(NEW.qa_status) AND b.extraction_confidence>=0.95;
 IF approved IS NULL OR staged IS DISTINCT FROM
   (to_jsonb(NEW)-ARRAY['updated_at','qa_status','source_type']) THEN RETURN NEW; END IF;
 IF approved->>'current_period' IS DISTINCT FROM NEW.source_period
  OR approved->>'certified_source_url' IS DISTINCT FROM NEW.source_url
  OR approved->>'current_source_certified' IS DISTINCT FROM 'true'
  OR approved->>'certification_status' IS DISTINCT FROM 'certified'
  OR (approved->>'comparison_certified'='false' AND
     (jsonb_array_length(coalesce(approved->'improvements','[]'::jsonb))<>0
      OR jsonb_array_length(coalesce(approved->'deteriorations','[]'::jsonb))<>0
      OR jsonb_array_length(coalesce(approved->'certification_reasons','[]'::jsonb))=0))
 THEN RETURN NEW; END IF;
 UPDATE public.scpi_bulletin_analysis a SET
  current_period=q.current_period,previous_period=q.previous_period,status=q.status,
  risk_level=q.risk_level,trend_score=q.trend_score,improvements=q.improvements,
  deteriorations=q.deteriorations,alerts=q.alerts,watch_points=q.watch_points,
  current_snapshot=to_jsonb(NEW),previous_snapshot=q.previous_snapshot,
  summary=q.summary,analysis_version=q.analysis_version,generated_at=now(),
  certification_status=q.certification_status,certification_reasons=q.certification_reasons,
  current_source_certified=q.current_source_certified,comparison_certified=q.comparison_certified,
  structural_event_detected=q.structural_event_detected,certified_source_url=q.certified_source_url,
  certified_source_qa_status=NEW.qa_status,certified_at=now()
 FROM jsonb_populate_record(NULL::public.scpi_bulletin_analysis,approved) q
 WHERE a.scpi_slug=NEW.scpi_slug;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION maximus_agents.restore_exact_reviewed_analysis() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION maximus_agents.restore_exact_reviewed_analysis() TO service_role;
CREATE TRIGGER zz_restore_exact_reviewed_analysis
AFTER INSERT OR UPDATE ON public.scpi_indicators
FOR EACH ROW EXECUTE FUNCTION maximus_agents.restore_exact_reviewed_analysis();

-- Approved source quality is recorded without the word "review", which the
-- existing strong-QA predicate deliberately reserves for unresolved reviews.
CREATE OR REPLACE FUNCTION maximus_agents.promote_candidate_batch_v3(p_batch_id text, p_expected_before integer, p_expected_after integer, p_deployed_commit_sha text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public', 'maximus_agents'
AS $function$
DECLARE
  v_slugs text[];
  v_count integer;
  v_ready integer;
  v_after integer;
  v_commit text;
  v_updated integer;
BEGIN
  IF current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'Candidate release requires trusted backend role';
  END IF;
  IF p_batch_id IS NULL OR p_batch_id='' OR p_deployed_commit_sha !~ '^[a-f0-9]{40}$'
     OR p_expected_after<=p_expected_before OR p_expected_before<1 THEN
    RAISE EXCEPTION 'Invalid release parameters or deployed commit SHA';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('maximusscpi_candidate_batch_release_v3'));
  SELECT b.candidate_slugs, b.review_evidence->>'production_deploy_sha'
  INTO v_slugs, v_commit
  FROM maximus_agents.scpi_candidate_batch_decisions b
  WHERE b.batch_id=p_batch_id AND b.decision='approved'
    AND b.dossier_digest_sha256 ~ '^[a-f0-9]{64}$'
    AND (coalesce(b.responsible_name,'') !~* 'GPT|AI[_ -]|NOT_HUMAN|AUTOMAT|BOT' OR maximus_agents.scpi_delegated_actor_authorized(b.responsible_name))
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
    AND EXISTS (SELECT 1 FROM maximus_agents.scpi_candidate_tool_readiness t
      WHERE t.scpi_slug=r.scpi_slug AND t.full_surface_ready)
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
        'qa_status','source_verified_approved_release',
        'source_type','approved_primary_publisher_release'))).*
  FROM maximus_agents.scpi_candidate_indicator_stage s
  WHERE s.scpi_slug=ANY(v_slugs);
  UPDATE public.scpi_trajectory_pilot p SET enabled=true
  WHERE p.scpi_slug=ANY(v_slugs) AND NOT p.enabled;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Fail closed: enabled % pilots for % candidates', v_updated, cardinality(v_slugs);
  END IF;
  UPDATE maximus_agents.scpi_universe u
  SET lifecycle='existing',stage='strict_pass',strict_pass=true,
      analysis_certified=true,publication_authorized=true,
      updated_at=now(),
      review_note=coalesce(u.review_note,'') || ' | Approved atomic batch: '||p_batch_id
  WHERE u.scpi_slug=ANY(v_slugs) AND u.lifecycle='candidate';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> cardinality(v_slugs) THEN
    RAISE EXCEPTION 'Fail closed: updated % universe rows for % candidates', v_updated, cardinality(v_slugs);
  END IF;
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
$function$
