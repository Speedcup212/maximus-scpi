-- RECOVERY-134: exact TOF vs vacancy-component proof guard.
-- The issuer may report a component "Locaux vacants en restructuration
-- (intégrés au TOF sous conditions) : 0,07 %". That value is not the TOF.
-- Only reject when the certificate number equals the COMPONENT number,
-- not when an excerpt includes both a genuine overall TOF and a component.
CREATE OR REPLACE FUNCTION scpi_internal.tof_value_is_vacancy_component(
  p_evidence_text text, p_value numeric)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
SET search_path TO ''
AS $tof_component$
DECLARE m text[];
BEGIN
  IF p_value IS NULL THEN RETURN FALSE; END IF;
  m := regexp_match(
    COALESCE(p_evidence_text,''),
    'locaux[[:space:]]+vacants[[:space:]]+en[[:space:]]+restructuration[[:space:]]*\([^)]*int.gr.s[[:space:]]+au[[:space:]]+tof[[:space:]]+sous[[:space:]]+conditions\)[[:space:]]*:[[:space:]]*([0-9]+[,.]?[0-9]*)[[:space:]]*%',
    'i');
  RETURN m IS NOT NULL AND
    replace(m[1],',','.')::numeric=p_value;
END;
$tof_component$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_bulletin_source_policy()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE reason text; originally_quarantined boolean; manual_recertification boolean;
BEGIN
 IF NEW.metric <> 'tof' OR NEW.value_numeric IS NULL THEN RETURN NEW; END IF;
 SELECT EXISTS(
   SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a WHERE a.certificate_id=NEW.id
 ) INTO originally_quarantined;
 reason:=scpi_internal.tof_bulletin_source_rejection_reason(
   NEW.scpi_slug,NEW.source_url,NEW.evidence_text,NEW.verification_method,NEW.verification_status);
 -- Reject TOF equal to a subordinate vacancy component even with page and
 -- source proof; preserve valid total TOF when it differs from that component.
 IF reason IS NULL AND scpi_internal.tof_value_is_vacancy_component(
     NEW.evidence_text, NEW.value_numeric) THEN
   reason:='TOF_VACANCY_SUBCOMPONENT_NOT_TOTAL';
 END IF;
 manual_recertification :=
   NEW.verification_status LIKE 'manual_verified_official%'
   AND NEW.source_page>0 AND NULLIF(btrim(NEW.evidence_text),'') IS NOT NULL
   AND NEW.evidence_text ~* '(taux[[:space:]]+d.{0,3}occupation[[:space:]]+financier|TOF)'
   AND reason IS NULL;
 IF reason IS NOT NULL OR (originally_quarantined AND NOT manual_recertification) THEN
   NEW.verification_status:='invalid_tof_bulletin_source_policy';
   NEW.verification_method:='blocked_'||coalesce(reason,'requires_manual_recertification_from_issuer_bulletin');
   NEW.extraction_confidence:=0;
 END IF;
 RETURN NEW;
END;
$function$
;

-- Snapshot the false certificate in the existing private quarantine table.
-- No deletion and no substitution with an invented overall TOF.
DO $recovery134$
DECLARE n integer;
BEGIN
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
     (event_key, reason, snapshot)
  SELECT 'buroboutic-2026-T3-tof-vacancy-component-0p07',
         'TOF auto certificate at 0.07% is explicitly the vacant-under-restructuring component, not total financial occupancy',
         to_jsonb(c)
  FROM public.scpi_metric_certifications c
  WHERE c.id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
    AND c.scpi_slug='buroboutic-metropoles' AND c.source_period='2026-T3'
    AND c.metric='tof' AND c.value_numeric=0.07
    AND c.verification_status='auto_verified_with_evidence'
    AND scpi_internal.tof_value_is_vacancy_component(c.evidence_text,c.value_numeric)
  ON CONFLICT (event_key) DO NOTHING;
  IF NOT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_replay_provenance_quarantine
    WHERE event_key='buroboutic-2026-T3-tof-vacancy-component-0p07'
  ) THEN RAISE EXCEPTION 'BUROBOUTIC_ORIGINAL_CERTIFICATE_ARCHIVE_REQUIRED'; END IF;

  -- The existing BEFORE trigger applies the new policy and marks the
  -- document proof invalid. This does not change financial history.
  UPDATE public.scpi_metric_certifications c
  SET verification_status='invalid_tof_bulletin_source_policy',
      verification_method='blocked_TOF_VACANCY_SUBCOMPONENT_NOT_TOTAL',
      extraction_confidence=0, verified_at=now()
  WHERE c.id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
    AND c.scpi_slug='buroboutic-metropoles' AND c.source_period='2026-T3'
    AND c.metric='tof' AND c.value_numeric=0.07
    AND c.verification_status='auto_verified_with_evidence'
    AND scpi_internal.tof_value_is_vacancy_component(c.evidence_text,c.value_numeric);
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'BUROBOUTIC_EXPECTED_EXACTLY_ONE_QUARANTINE_GOT_%',n; END IF;
END $recovery134$;
