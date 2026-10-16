-- Repair the existing proof -> bulletin -> current SCPI -> analysis handoff.
-- This migration NEVER upgrades qa_status, never invents missing values, and
-- never sets publication_authorized, analysis_certified or final QA.
-- Existing candidate/61-cohort/Netlify publication gates remain unchanged.

CREATE OR REPLACE FUNCTION public.trg_refresh_analysis_on_scpi_evidence()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $handoff$
DECLARE
  relevant_change boolean := false;
  official_pdf_verified boolean := false;
  linked_rows integer := 0;
BEGIN
  IF TG_OP='INSERT' THEN
    relevant_change := true;
  ELSE
    relevant_change :=
      (OLD.extraction_json->'evidence') IS DISTINCT FROM (NEW.extraction_json->'evidence')
      OR (OLD.extraction_json->>'evidence_version') IS DISTINCT FROM (NEW.extraction_json->>'evidence_version')
      OR OLD.qa_status IS DISTINCT FROM NEW.qa_status
      OR OLD.pdf_sha256 IS DISTINCT FROM NEW.pdf_sha256
      OR OLD.source_url IS DISTINCT FROM NEW.source_url
      OR OLD.period IS DISTINCT FROM NEW.period;
  END IF;

  IF NOT relevant_change THEN RETURN NEW; END IF;

  -- A source link is a FACT about provenance, not a QA approval.
  -- Require exact slug, exact period, URL, official-document fingerprint and
  -- independent issuer-identity validation (native PDF or SHA-matched OCR).
  IF NEW.qa_status NOT ILIKE 'invalid%'
    AND NEW.pdf_sha256 ~ '^[a-f0-9]{64}$'
    AND NEW.source_url LIKE 'https://%'
    AND EXISTS (
      SELECT 1 FROM maximus_agents.scpi_universe u
      WHERE u.scpi_slug=NEW.scpi_slug AND u.lifecycle='candidate'
        AND u.publication_authorized IS FALSE
    )
  THEN
    SELECT
      EXISTS (
        SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation v
        WHERE v.scpi_slug=NEW.scpi_slug
          AND v.source_period=NEW.period
          AND v.document_kind='quarterly_bulletin'
          AND v.source_url=NEW.source_url
          AND v.pdf_sha256=NEW.pdf_sha256
          AND v.document_identity_verified
          AND v.page_count>0
      ) OR EXISTS (
        SELECT 1 FROM maximus_agents.scpi_ocr_pages p
        WHERE p.scpi_slug=NEW.scpi_slug
          AND p.source_period=NEW.period
          AND p.document_kind='quarterly_bulletin'
          AND p.pdf_sha256=NEW.pdf_sha256
          AND p.page_number>0
      )
    INTO official_pdf_verified;

    IF official_pdf_verified THEN
      UPDATE public.scpi_indicators i
      SET bulletin_id=NEW.id
      WHERE i.scpi_slug=NEW.scpi_slug
        AND i.source_period=NEW.period
        AND i.source_url=NEW.source_url
        AND i.bulletin_id IS NULL;
      GET DIAGNOSTICS linked_rows=ROW_COUNT;
    END IF;
  END IF;

  -- The indicator's existing UPDATE trigger already recomputes all analyses.
  -- Do not run the full pipeline twice in one transaction.
  IF linked_rows>0 THEN RETURN NEW; END IF;

  -- Reuse the ORIGINAL analysis pipeline, including every financial and
  -- liquidity guard. A partial bulletin remains partial after this operation.
  PERFORM public.refresh_scpi_bulletin_analysis(NEW.scpi_slug);
  PERFORM public.apply_scpi_material_vigilance(NEW.scpi_slug);
  PERFORM public.certify_scpi_bulletin_analysis(NEW.scpi_slug);
  PERFORM public.enforce_scpi_certification_v4_1(NEW.scpi_slug);
  PERFORM public.enforce_scpi_metric_evidence_v4_3(NEW.scpi_slug);
  PERFORM public.enforce_scpi_liquidity_doctrine_v5(NEW.scpi_slug);
  PERFORM public.enforce_scpi_public_risk_cleanup_v5(NEW.scpi_slug);
  PERFORM public.apply_scpi_reporting_cadence_v6(NEW.scpi_slug);
  RETURN NEW;
END;
$handoff$;

-- The old UPDATE trigger already uses this function.
-- Enable the same reconciliation for incoming bulletins, not only edits.
DROP TRIGGER IF EXISTS trg_scpi_bulletin_handoff_on_insert ON public.scpi_bulletins;
CREATE TRIGGER trg_scpi_bulletin_handoff_on_insert
  AFTER INSERT ON public.scpi_bulletins
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_analysis_on_scpi_evidence();

-- First deterministic reconciliation of the FOUR existing CORUM T2 sources.
-- Update only the missing foreign key; never edit numerical metrics or QA flags.
WITH source AS (
  SELECT i.scpi_slug,b.id AS bulletin_id
  FROM public.scpi_indicators i
  JOIN public.scpi_bulletins b
    ON b.scpi_slug=i.scpi_slug AND b.period=i.source_period
    AND b.source_url=i.source_url
  JOIN maximus_agents.scpi_universe u
    ON u.scpi_slug=i.scpi_slug
    AND u.lifecycle='candidate' AND u.publication_authorized IS FALSE
  WHERE i.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND i.source_period='2026-T2'
    AND i.bulletin_id IS NULL
    AND b.qa_status NOT ILIKE 'invalid%'
    AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'
    AND (
      EXISTS (
        SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation v
        WHERE v.scpi_slug=b.scpi_slug AND v.source_period=b.period
          AND v.document_kind='quarterly_bulletin'
          AND v.source_url=b.source_url AND v.pdf_sha256=b.pdf_sha256
          AND v.document_identity_verified AND v.page_count>0
      ) OR EXISTS (
        SELECT 1 FROM maximus_agents.scpi_ocr_pages p
        WHERE p.scpi_slug=b.scpi_slug AND p.source_period=b.period
          AND p.document_kind='quarterly_bulletin'
          AND p.pdf_sha256=b.pdf_sha256 AND p.page_number>0
      )
    )
)
UPDATE public.scpi_indicators i
  SET bulletin_id=src.bulletin_id
FROM source src
WHERE i.scpi_slug=src.scpi_slug
  AND i.source_period='2026-T2'
  AND i.bulletin_id IS NULL;

-- Re-run the original calculation even if a candidate had already been linked;
-- corrects stale "no exact period bulletin" diagnostics without certification.
SELECT public.certify_scpi_bulletin_analysis(s.scpi_slug)
FROM (VALUES ('corum-eurion'),('corum-origin'),('corum-usa'),('corum-xl'))
  AS s(scpi_slug);

-- The QA boundary is unchanged. A link is NOT approval.
DO $verify$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n
  FROM public.scpi_indicators i
  JOIN public.scpi_bulletins b ON b.id=i.bulletin_id
  WHERE i.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND i.source_period='2026-T2' AND i.source_url=b.source_url
    AND i.source_period=b.period;
  IF n<>4 THEN RAISE EXCEPTION 'CORUM exact period source linking incomplete: %/4',n; END IF;

  IF EXISTS (SELECT 1 FROM maximus_agents.scpi_universe u
      WHERE u.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
        AND (u.publication_authorized OR u.analysis_certified)) THEN
    RAISE EXCEPTION 'Refuse to bypass independent SCPI publication gate';
  END IF;

  IF EXISTS (SELECT 1 FROM public.scpi_bulletin_analysis a
      WHERE a.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
        AND (a.current_source_certified OR a.comparison_certified
             OR a.certification_status='certified')) THEN
    RAISE EXCEPTION 'Certification unexpectedly granted to partial CORUM bulletin';
  END IF;
END;
$verify$;
