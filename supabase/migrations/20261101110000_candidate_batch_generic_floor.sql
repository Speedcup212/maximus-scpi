-- Remove the legacy hard-coded 66 floor without weakening cohort protection.
-- The signed batch, exact pre/post count, staged QA and trusted deploy SHA remain mandatory.
CREATE OR REPLACE FUNCTION maximus_agents.candidate_batch_expected_counts_valid(
  p_expected_before integer,
  p_expected_after integer,
  p_candidate_count integer
) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
 SELECT p_expected_before > 0 AND p_candidate_count > 0
   AND p_expected_after = p_expected_before + p_candidate_count;
$$;
REVOKE ALL ON FUNCTION maximus_agents.candidate_batch_expected_counts_valid(integer,integer,integer)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION maximus_agents.candidate_batch_expected_counts_valid(integer,integer,integer) TO service_role;
-- NOTE: Existing promote_candidate_batch_v3 still enforces >=66 until its
-- migration is applied. This helper alone does not change the release function.
