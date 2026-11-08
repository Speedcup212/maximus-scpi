-- RECOVERY-193: "TOF ASPIM" is an issuer methodology label, not a source rejection.
-- Preserve official-host, original-document and non-derived gates.
-- This migration changes only the policy classifier. It NEVER repairs an
-- invalid certificate, lifts historical quarantine or publishes a metric.
CREATE OR REPLACE FUNCTION scpi_internal.tof_bulletin_source_rejection_reason(
  p_slug text,
  p_source_url text,
  p_evidence_text text,
  p_verification_method text DEFAULT NULL,
  p_verification_status text DEFAULT NULL
)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT CASE
    WHEN NULLIF(BTRIM(p_slug), '') IS NULL
      THEN 'UNKNOWN_SCPI'
    WHEN p_source_url IS NULL OR p_source_url !~* '^https://[^/]+/'
      THEN 'OFFICIAL_BULLETIN_URL_REQUIRED'
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.scpi_source_connectors connector
      WHERE connector.scpi_slug = p_slug
        AND lower(split_part(split_part(p_source_url, '://', 2), '/', 1))
          = ANY(connector.allowed_hosts)
    )
      THEN 'OUTSIDE_ISSUER_OFFICIAL_HOSTS'
    -- Deliberately no rejection on p_evidence_text containing "TOF ASPIM".
    -- The independent semantic/vacancy guards still reject wrong TOF values.
    WHEN COALESCE(p_verification_method, '') ~* '(derived|estimated|interpolat|aggregate_only)'
      OR COALESCE(p_verification_status, '') ~* '(^derived_|secondary_crosscheck)'
      THEN 'TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN'
    ELSE NULL
  END;
$function$;

REVOKE ALL ON FUNCTION scpi_internal.tof_bulletin_source_rejection_reason(text,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.tof_bulletin_source_rejection_reason(text,text,text,text,text)
  TO service_role;

-- Source policy tests: the same official URL is admitted irrespective of ASPIM
-- labelling, but mirrors and approximations still fail closed.
DO $verify$
BEGIN
  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'corum-origin',
    'https://www.corum.fr/sites/default/files/2020-07/CorumAM-Convictions-BTI-2T15.pdf',
    'Bulletin original CORUM Origin : TOF ASPIM 99,4 %',
    'pdf_page_text_match',
    'manual_verified_official_pdf_page'
  ) IS NOT NULL THEN
    RAISE EXCEPTION 'RECOVERY193_ISSUER_ASPIM_WRONGLY_BLOCKED';
  END IF;

  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'corum-origin',
    'https://www.scpi-lab.com/miroir/corum-origin.pdf',
    'TOF ASPIM 99,4 %',
    'pdf_page_text_match'
  ) IS DISTINCT FROM 'OUTSIDE_ISSUER_OFFICIAL_HOSTS' THEN
    RAISE EXCEPTION 'RECOVERY193_THIRD_PARTY_SOURCE_ACCEPTED';
  END IF;

  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'corum-origin',
    'https://www.corum.fr/sites/default/files/2020-07/CorumAM-Convictions-BTI-2T15.pdf',
    'TOF ASPIM estimé 99,4 %',
    'estimated_from_aggregate'
  ) IS DISTINCT FROM 'TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN' THEN
    RAISE EXCEPTION 'RECOVERY193_DERIVED_TOF_ACCEPTED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_guard_tof_explicit_vacancy'
       OR tgname = 'trg_zzzz_tof_explicit_vacancy'
  ) THEN
    RAISE EXCEPTION 'RECOVERY193_VACANCY_SUBCOMPONENT_GUARD_MISSING';
  END IF;
END;
$verify$;
