-- RECOVERY-189: refuse the common OCR/model failure "Locaux vacants: x%" as TOF.
-- The input must contain BOTH explicitly printed, different, labelled rates.
-- This is fail-closed only: it never inserts or changes a financial value or PASS.
CREATE OR REPLACE FUNCTION scpi_internal.tof_explicit_vacancy_conflict(
  p_value numeric, p_evidence text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO ''
AS $fn$
WITH matched AS (
 SELECT regexp_match(
   regexp_replace(coalesce(p_evidence,''),'[[:space:]]+',' ','g'),
   'locaux vacants *: *([0-9]{1,3}[,.]?[0-9]{0,2}) *%', 'i') AS vacancy,
   regexp_match(
     regexp_replace(coalesce(p_evidence,''),'[[:space:]]+',' ','g'),
     'TOF *(T[1-4] *20[0-9]{2} *)?([0-9]{1,3}[,.]?[0-9]{0,2}) *%', 'i') AS tof
)
SELECT coalesce(
  p_value=replace(vacancy[1],',','.')::numeric
  AND replace(tof[2],',','.')::numeric<>p_value,
  false)
FROM matched;
$fn$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_explicit_vacancy()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $fn$
BEGIN
 IF NEW.metric='tof' AND NEW.value_numeric IS NOT NULL
    AND scpi_internal.tof_explicit_vacancy_conflict(
          NEW.value_numeric,NEW.evidence_text)
    AND coalesce(NEW.verification_status,'') NOT LIKE 'invalid%' THEN
   NEW.verification_status:='invalid_tof_explicit_vacancy_component';
   NEW.verification_method:='blocked_issuer_chart_vacancy_not_tof';
   NEW.extraction_confidence:=0;
 END IF;
 RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_zzzz_tof_explicit_vacancy
ON public.scpi_metric_certifications;
CREATE TRIGGER trg_zzzz_tof_explicit_vacancy
BEFORE INSERT OR UPDATE ON public.scpi_metric_certifications
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_tof_explicit_vacancy();

REVOKE ALL ON FUNCTION scpi_internal.tof_explicit_vacancy_conflict(numeric,text)
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION scpi_internal.guard_tof_explicit_vacancy()
  FROM PUBLIC,anon,authenticated;

-- Ground this new guard in the EXACT Novapierre 1 issuer source already
-- verified by the two-PDF-reader original archive and evidence page 4.
DO $verify$
DECLARE ev text;
BEGIN
 SELECT evidence_text INTO STRICT ev FROM public.scpi_metric_certifications
 WHERE id='3e1056ea-ace0-4359-bce7-b3816cc3e747'::uuid
  AND scpi_slug='novapierre-1' AND source_period='2024-T4'
  AND value_numeric=10.3 AND source_page=4
  AND verification_status LIKE 'invalid%';
 IF NOT scpi_internal.tof_explicit_vacancy_conflict(10.3,ev) THEN
   RAISE EXCEPTION 'REC189_MUST_BLOCK_VACANCY_10_3';
 END IF;
 IF scpi_internal.tof_explicit_vacancy_conflict(89.7,ev) THEN
   RAISE EXCEPTION 'REC189_MUST_NOT_BLOCK_CORRECT_CHART_TOF_89_7';
 END IF;
 IF scpi_internal.tof_explicit_vacancy_conflict(
     10.3,'TOF T4 2024 10,3 % sans libelle de vacance') THEN
   RAISE EXCEPTION 'REC189_UNSUPPORTED_VACANCY_MUST_NOT_TRIGGER';
 END IF;
END;
$verify$;
