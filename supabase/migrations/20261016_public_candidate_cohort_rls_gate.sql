-- 2026-10-16: public Data API may display ONLY a SCPI in the established
-- live existing cohort. Candidate rows remain available to privileged QA,
-- even when stored in public SCPI tables for staging.
CREATE OR REPLACE FUNCTION public.maximus_scpi_is_in_public_cohort(p_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $guard$
  SELECT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug=p_slug AND u.lifecycle='existing'
  );
$guard$;
REVOKE ALL ON FUNCTION public.maximus_scpi_is_in_public_cohort(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.maximus_scpi_is_in_public_cohort(text) TO anon, authenticated;

ALTER POLICY "allow_select_anon" ON public.scpi_indicators
USING ((true) AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
ALTER POLICY "allow_select_anon" ON public.scpi_bulletins
USING ((true) AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
ALTER POLICY "Public read SCPI bulletin analysis" ON public.scpi_bulletin_analysis
USING ((true) AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
ALTER POLICY "allow_public_select_certified_history" ON public.scpi_indicator_history
USING ((scpi_is_strong_qa(qa_status) AND source_url IS NOT NULL)
       AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
ALTER POLICY "public_read_verified_metric_certifications" ON public.scpi_metric_certifications
USING (
  ((verification_status='auto_verified_with_evidence'
    OR verification_status ILIKE 'manual_verified%')
   AND NULLIF(btrim(evidence_text),'') IS NOT NULL
   AND ((verification_method ILIKE '%html%' AND source_url IS NOT NULL)
        OR (source_page IS NOT NULL AND source_page>0)))
  AND public.maximus_scpi_is_in_public_cohort(scpi_slug)
);
ALTER POLICY "public_read_enabled_scpi_trajectory_pilot" ON public.scpi_trajectory_pilot
USING (enabled=true AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
