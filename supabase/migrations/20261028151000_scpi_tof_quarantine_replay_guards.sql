-- Preserve source-policy quarantine against current and historical ingestion replays.
-- Compatible with genuine manual recertification; never turns old invalid TOF into PASS.
CREATE OR REPLACE FUNCTION scpi_internal.guard_quarantined_tof_replay()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $fn$
DECLARE is_quarantined boolean;
BEGIN
 IF NEW.tof IS NULL THEN RETURN NEW; END IF;
 SELECT EXISTS(
  SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
  WHERE a.scpi_slug=NEW.scpi_slug AND a.source_period=NEW.source_period
    AND ((TG_TABLE_NAME='scpi_indicators' AND a.original_live IS NOT NULL)
      OR (TG_TABLE_NAME='scpi_indicator_history' AND a.original_history IS NOT NULL))
 ) INTO is_quarantined;
 IF NOT is_quarantined THEN RETURN NEW; END IF;
 IF NOT EXISTS(
  SELECT 1 FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug=NEW.scpi_slug AND c.source_period=NEW.source_period
    AND c.metric='tof' AND c.value_numeric=NEW.tof AND c.source_url=NEW.source_url
    AND c.verification_status LIKE 'manual_verified_official%'
    AND c.source_page>0 AND nullif(btrim(c.evidence_text),'') IS NOT NULL
    AND scpi_internal.tof_bulletin_source_rejection_reason(
       c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
 ) THEN
   NEW.tof:=NULL;
   NEW.qa_status:='invalid_tof_bulletin_source_policy';
   NEW.source_confidence:=0;
 END IF;
 RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_tof_replay_quarantine_history ON public.scpi_indicator_history;
CREATE TRIGGER trg_tof_replay_quarantine_history
BEFORE INSERT OR UPDATE ON public.scpi_indicator_history
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_quarantined_tof_replay();

DROP TRIGGER IF EXISTS trg_tof_replay_quarantine_current ON public.scpi_indicators;
CREATE TRIGGER trg_tof_replay_quarantine_current
BEFORE INSERT OR UPDATE ON public.scpi_indicators
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_quarantined_tof_replay();

REVOKE EXECUTE ON FUNCTION scpi_internal.guard_quarantined_tof_replay()
FROM PUBLIC,anon,authenticated;