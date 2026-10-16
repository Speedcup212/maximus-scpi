-- P0 release safety: strict-fail historical products cannot claim verified status.
-- Keep all 61 records, all raw evidence and source history. No fabricated certification.
UPDATE maximus_agents.scpi_universe u
SET publication_authorized=false,analysis_certified=false,strict_pass=false,
    stage='ingesting',updated_at=now(),
    review_note=concat(coalesce(nullif(u.review_note,''),''),
      ' | 2026-10-16 P0: FAIL_STRICT/source_ready=false, private pending independent source QA')
WHERE u.lifecycle='existing' AND u.scpi_slug IN ('atream-hotel','remake-uk-2025')
  AND EXISTS (
    SELECT 1 FROM public.scpi_crash_test_strict_v2 q
    WHERE q.scpi_slug=u.scpi_slug AND q.crash_test_status='FAIL_STRICT' AND q.source_ready=false
  );

-- Fail closed when serving public Supabase tables; historical membership alone
-- is insufficient for publication or financial analysis.
CREATE OR REPLACE FUNCTION public.maximus_scpi_is_in_public_cohort(p_slug text)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO ''
AS $body$
 SELECT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug=p_slug AND u.lifecycle='existing'
      AND u.stage='strict_pass' AND u.strict_pass IS TRUE
      AND u.analysis_certified IS TRUE
      AND u.publication_authorized IS TRUE
 );
$body$;

-- Existing anon/authenticated SELECT policies continue to call this function.
-- Never alter the underlying 61-fund certified_scpi_cohort.json here: Netlify deployment requires separate QA.
