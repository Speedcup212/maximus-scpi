-- Source governance for the TOF metric: issuer bulletin ONLY.
-- This migration is intentionally separate from the historical remediation:
-- existing values must be reviewed against the actual issuer bulletins before
-- the canonical metric is changed. New/replayed proof is fail-closed.
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
    WHEN COALESCE(p_evidence_text, '') ~*
      '(^|[^[:alnum:]_])(TOF[[:space:]]+(financier[[:space:]]+)?ASPIM|taux[[:space:]]+d[''’]?occupation[[:space:]]+financier[[:space:]]+ASPIM)([^[:alnum:]_]|$)'
      THEN 'TOF_ASPIM_FORBIDDEN'
    WHEN COALESCE(p_verification_method, '') ~* '(derived|estimated|interpolat|aggregate_only)'
      OR COALESCE(p_verification_status, '') ~* '(^derived_|secondary_crosscheck)'
      THEN 'TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN'
    ELSE NULL
  END;
$function$;

-- Diagnose existing certifications without mutating historic values.
CREATE OR REPLACE VIEW scpi_internal.tof_bulletin_source_policy_violations
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.scpi_slug,
  c.source_period,
  c.value_numeric,
  c.source_url,
  c.source_page,
  c.verification_status,
  scpi_internal.tof_bulletin_source_rejection_reason(
    c.scpi_slug, c.source_url, c.evidence_text,
    c.verification_method, c.verification_status
  ) AS rejection_reason
FROM public.scpi_metric_certifications c
WHERE c.metric = 'tof'
  AND c.value_numeric IS NOT NULL
  AND COALESCE(c.verification_status, '') NOT LIKE 'invalid%'
  AND COALESCE(c.verification_status, '') NOT LIKE 'rejected%'
  AND scpi_internal.tof_bulletin_source_rejection_reason(
    c.scpi_slug, c.source_url, c.evidence_text,
    c.verification_method, c.verification_status
  ) IS NOT NULL;

-- New proof may not be labelled verified when it violates the source policy.
-- Evidence and original numeric payload are retained for forensic review, but
-- the certification confidence is 0 and the status begins with "invalid_".
CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_bulletin_source_policy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE reason text;
BEGIN
  IF NEW.metric <> 'tof' OR NEW.value_numeric IS NULL
    OR COALESCE(NEW.verification_status, '') ~* '^(invalid|rejected|review_required)'
  THEN
    RETURN NEW;
  END IF;

  reason := scpi_internal.tof_bulletin_source_rejection_reason(
    NEW.scpi_slug, NEW.source_url, NEW.evidence_text,
    NEW.verification_method, NEW.verification_status
  );
  IF reason IS NOT NULL THEN
    NEW.verification_status := 'invalid_tof_bulletin_source_policy';
    NEW.verification_method := 'blocked_' || reason;
    NEW.extraction_confidence := 0;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_guard_tof_bulletin_source_policy
  ON public.scpi_metric_certifications;
CREATE TRIGGER trg_guard_tof_bulletin_source_policy
  BEFORE INSERT OR UPDATE
  ON public.scpi_metric_certifications
  FOR EACH ROW
  EXECUTE FUNCTION scpi_internal.guard_tof_bulletin_source_policy();

REVOKE ALL ON FUNCTION scpi_internal.tof_bulletin_source_rejection_reason(text,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION scpi_internal.guard_tof_bulletin_source_policy()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON scpi_internal.tof_bulletin_source_policy_violations
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.tof_bulletin_source_rejection_reason(text,text,text,text,text)
  TO service_role;

-- Fail closed in the smoke test on the same 65-SCPI connector registry.
DO $test$
BEGIN
  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'kyaneos-pierre',
    'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-2T2021.pdf',
    'Bulletin: TOF ASPIM (78,7%)'
  ) IS DISTINCT FROM 'TOF_ASPIM_FORBIDDEN' THEN
    RAISE EXCEPTION 'TOF_POLICY_TEST_ASPIM_FAILED';
  END IF;
  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'edissimo',
    'https://www.scpi-lab.com/scpi/edissimmo/bt2-2026',
    'TOF 83,84%'
  ) IS DISTINCT FROM 'OUTSIDE_ISSUER_OFFICIAL_HOSTS' THEN
    RAISE EXCEPTION 'TOF_POLICY_TEST_THIRDPARTY_FAILED';
  END IF;
  IF scpi_internal.tof_bulletin_source_rejection_reason(
    'corum-origin',
    'https://www.corum.fr/sites/default/files/2020-07/CorumAM-Convictions-BTI-2T15.pdf',
    'Bulletin officiel CORUM Origin T2 2015 - Taux occupation financier 99,4%',
    'pdf_page_text_match'
  ) IS NOT NULL THEN
    RAISE EXCEPTION 'TOF_POLICY_TEST_ISSUER_PDF_FAILED';
  END IF;
END;
$test$;