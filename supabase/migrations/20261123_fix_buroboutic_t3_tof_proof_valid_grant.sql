-- Fix `permission denied for function buroboutic_t3_tof_proof_valid` (SQLSTATE 42501).
--
-- RECOVERY-226 created scpi_internal.buroboutic_t3_tof_proof_valid with
--   REVOKE ALL ... FROM PUBLIC
-- but, unlike its sibling guard functions (independent_tof_geometric_proof_valid,
-- accimmo_t2_exact_tof_proof_valid, pierval_t3_exact_tof_proof_valid,
-- paref_archive_tof_proof_valid), it forgot the corresponding
--   GRANT EXECUTE ... TO service_role.
--
-- The non-SECURITY-DEFINER trigger scpi_internal.guard_proven_tof_certificate_replay()
-- calls this function while executing as the invoking role (service_role for
-- PostgREST writes), so any REST write to scpi_metric_certifications failed with
-- "permission denied for function buroboutic_t3_tof_proof_valid".
--
-- This migration restores parity with the sibling guards. No status threshold,
-- metric value, attestation or publication flag is changed.

REVOKE ALL ON FUNCTION scpi_internal.buroboutic_t3_tof_proof_valid(uuid,text,text,text,numeric,integer)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.buroboutic_t3_tof_proof_valid(uuid,text,text,text,numeric,integer)
  TO service_role;

-- Postcondition: fail closed if the grant did not take effect.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.role_routine_grants
    WHERE routine_schema = 'scpi_internal'
      AND routine_name   = 'buroboutic_t3_tof_proof_valid'
      AND grantee        = 'service_role'
      AND privilege_type = 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'BUROBOUTIC_T3_TOF_PROOF_VALID_GRANT_NOT_APPLIED';
  END IF;
END $$;
