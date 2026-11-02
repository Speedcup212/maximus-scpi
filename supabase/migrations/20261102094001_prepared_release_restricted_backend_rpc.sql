-- A restricted backend RPC reads private review records without expanding
-- service_role table privileges. Only postgres/service_role may execute it.
CREATE OR REPLACE FUNCTION public.maximus_prepared_release_slugs(p_sha text)
RETURNS TABLE(scpi_slug text) LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,maximus_agents AS $$
DECLARE ids text[]; ready_count integer;
BEGIN
 IF COALESCE(NULLIF(current_setting('role',true),'none'),session_user) NOT IN ('postgres','service_role') THEN RAISE EXCEPTION 'Trusted backend required'; END IF;
 SELECT b.candidate_slugs INTO ids
 FROM maximus_agents.scpi_prepared_releases p
 JOIN maximus_agents.scpi_candidate_batch_decisions b USING(batch_id)
 WHERE p.release_sha=p_sha AND p.expires_at>now() AND b.decision='approved'
 AND b.dossier_digest_sha256 ~ '^[a-f0-9]{64}$'
 AND maximus_agents.scpi_delegated_actor_authorized(b.responsible_name);
 IF ids IS NULL THEN RETURN; END IF;
 IF cardinality(ids)<>(SELECT count(DISTINCT x) FROM unnest(ids) x) THEN
  RAISE EXCEPTION 'Duplicate candidate identity';
 END IF;
 SELECT count(*) INTO ready_count FROM maximus_agents.scpi_candidate_release_circuit_v3 r
 WHERE r.scpi_slug=ANY(ids) AND r.final_release_ready;
 IF ready_count<>cardinality(ids) THEN RAISE EXCEPTION 'Prepared candidates no longer meet all evidence gates'; END IF;
 RETURN QUERY SELECT unnest(ids);
END $$;
REVOKE ALL ON FUNCTION public.maximus_prepared_release_slugs(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.maximus_prepared_release_slugs(text) TO service_role;
