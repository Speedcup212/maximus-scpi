-- Follow-up to the exact-period handoff. The original trigger was
-- UPDATE OF extraction_json only. Updating the function body alone cannot
-- listen for QA, source URL or SHA transitions. Rewire EXISTING trigger.
-- No changes to any financial metric, publication right or QA classification.

DROP TRIGGER IF EXISTS trg_scpi_bulletin_evidence_refresh_analysis ON public.scpi_bulletins;
CREATE TRIGGER trg_scpi_bulletin_evidence_refresh_analysis
  AFTER UPDATE OF extraction_json,qa_status,pdf_sha256,source_url,period
  ON public.scpi_bulletins
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_analysis_on_scpi_evidence();

-- A genuine previous-quarter analyst sign-off also requires recalculation.
-- Keep the callback specific to candidate history QA transitions; avoid extra
-- work for the established cohort and ignore numerical changes alone.
CREATE OR REPLACE FUNCTION public.trg_recheck_candidate_analysis_after_history_qa()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $trigger$
BEGIN
 IF TG_OP='UPDATE'
   AND OLD.qa_status IS NOT DISTINCT FROM NEW.qa_status
   AND OLD.source_url IS NOT DISTINCT FROM NEW.source_url
   AND OLD.source_period IS NOT DISTINCT FROM NEW.source_period THEN
   RETURN NEW;
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM maximus_agents.scpi_universe u
   WHERE u.scpi_slug=NEW.scpi_slug AND u.lifecycle='candidate'
     AND u.publication_authorized IS FALSE
 ) THEN RETURN NEW; END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.scpi_indicators i
   WHERE i.scpi_slug=NEW.scpi_slug AND i.source_period<>NEW.source_period
 ) THEN RETURN NEW; END IF;
 PERFORM public.certify_scpi_bulletin_analysis(NEW.scpi_slug);
 PERFORM public.enforce_scpi_certification_v4_1(NEW.scpi_slug);
 PERFORM public.enforce_scpi_metric_evidence_v4_3(NEW.scpi_slug);
 PERFORM public.enforce_scpi_liquidity_doctrine_v5(NEW.scpi_slug);
 PERFORM public.enforce_scpi_public_risk_cleanup_v5(NEW.scpi_slug);
 RETURN NEW;
END;
$trigger$;

DROP TRIGGER IF EXISTS trg_scpi_candidate_history_qa_to_analysis ON public.scpi_indicator_history;
CREATE TRIGGER trg_scpi_candidate_history_qa_to_analysis
  AFTER INSERT OR UPDATE OF qa_status,source_url,source_period
  ON public.scpi_indicator_history
  FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_candidate_analysis_after_history_qa();
