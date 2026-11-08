-- RECOVERY-194: preserve independently cross-checked issuer evidence against
-- a later automatic downgrade of the exact same documentary fingerprint.
-- Explicit invalidation and any new PDF, URL or reporting period stay fail-closed.
CREATE OR REPLACE FUNCTION public.scpi_prevent_verified_source_auto_downgrade()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $guard$
BEGIN
  IF OLD.qa_status = 'verified_issuer_html_8_metrics_pdf_tof'
     AND NEW.qa_status IN ('auto_partial_review', 'auto_partial', 'auto_verified', 'auto_verified_dual_pdf_evidence')
     AND OLD.extraction_json->'release_source_verification'->>'pdf_sha256' = OLD.pdf_sha256
     AND OLD.extraction_json->'release_source_verification'->>'verified_metric_count' = '8'
     AND (NEW.scpi_slug, NEW.period, NEW.source_url, NEW.pdf_sha256)
         IS NOT DISTINCT FROM
         (OLD.scpi_slug, OLD.period, OLD.source_url, OLD.pdf_sha256)
  THEN
    -- The same document does not lose an attested source audit because a
    -- crawler supplies a weaker automated classification.
    -- An explicit invalid_* verdict, new fingerprint or new source is NOT blocked.
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS trg_scpi_prevent_verified_source_auto_downgrade
ON public.scpi_bulletins;

CREATE TRIGGER trg_scpi_prevent_verified_source_auto_downgrade
BEFORE UPDATE ON public.scpi_bulletins
FOR EACH ROW EXECUTE FUNCTION public.scpi_prevent_verified_source_auto_downgrade();

COMMENT ON FUNCTION public.scpi_prevent_verified_source_auto_downgrade()
IS 'Protects the same source and SHA from automated QA downgrade, never permits unverified sources or blocks explicit invalidation.';
