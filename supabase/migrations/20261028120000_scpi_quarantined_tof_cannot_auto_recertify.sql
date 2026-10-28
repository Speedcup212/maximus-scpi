CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_bulletin_source_policy()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $fn$
DECLARE reason text; originally_quarantined boolean; manual_recertification boolean;
BEGIN
 IF NEW.metric <> 'tof' OR NEW.value_numeric IS NULL THEN RETURN NEW; END IF;
 SELECT EXISTS(
   SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a WHERE a.certificate_id=NEW.id
 ) INTO originally_quarantined;
 reason:=scpi_internal.tof_bulletin_source_rejection_reason(
   NEW.scpi_slug,NEW.source_url,NEW.evidence_text,NEW.verification_method,NEW.verification_status);
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
$fn$;

CREATE OR REPLACE FUNCTION public.scpi_metric_is_certified(p_slug text,p_period text,p_metric text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $fn$
  SELECT EXISTS(
    SELECT 1 FROM public.scpi_metric_certifications m
    WHERE m.scpi_slug=p_slug
      AND public.scpi_period_key(m.source_period)=public.scpi_period_key(p_period)
      AND m.metric=p_metric
      AND nullif(btrim(m.evidence_text),'') IS NOT NULL
      AND m.source_url IS NOT NULL
      AND (
        (m.verification_status='auto_verified_with_evidence' AND
           (m.verification_method ILIKE '%html%' OR (m.source_page IS NOT NULL AND m.source_page>0)))
        OR m.verification_status ILIKE 'manual_verified%'
        OR (p_metric<>'tof' AND m.verification_status='derived_verified_from_certified_inputs')
      )
      AND (p_metric<>'tof'
        OR (
          m.value_numeric IS NOT NULL AND
          scpi_internal.tof_bulletin_source_rejection_reason(
            m.scpi_slug,m.source_url,m.evidence_text,m.verification_method,m.verification_status) IS NULL
          AND (m.source_page>0 OR m.verification_method ILIKE '%html%')
          AND NOT EXISTS (
             SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
             WHERE a.certificate_id=m.id AND NOT (
               m.verification_status LIKE 'manual_verified_official%'
               AND m.source_page>0 AND m.evidence_text ~* '(taux[[:space:]]+d.{0,3}occupation[[:space:]]+financier|TOF)'
             )
          )
        ))
  );
$fn$;
REVOKE EXECUTE ON FUNCTION scpi_internal.guard_tof_bulletin_source_policy() FROM PUBLIC, anon, authenticated;