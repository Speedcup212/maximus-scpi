-- RECOVERY-134: reject semantic vacancy subcomponents disguised as financial
-- occupancy TOF, quarantine two exact, already-demonstrated misread cases.
-- NEVER replace an unproven source figure with a guessed "official" number.
-- Evidence and prechange rows remain intact in the private audit ledger.

CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_vacancy_subcomponent()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $recovery134_guard$
DECLARE
  component text[];
  evidence_normalized text;
BEGIN
  IF NEW.metric <> 'tof' OR NEW.value_numeric IS NULL THEN RETURN NEW; END IF;
  evidence_normalized := regexp_replace(coalesce(NEW.evidence_text,''),'[[:space:]]+',' ','g');
  component := regexp_match(
    evidence_normalized,
    'locaux[[:space:]]+vacants[[:space:]]+en[[:space:]]+restructuration[[:space:]]*\(int[ée]gr[ée]s[[:space:]]+au[[:space:]]+tof[[:space:]]+sous[[:space:]]+conditions\)[[:space:]]*:[[:space:]]*([0-9]+[,.]?[0-9]*)',
    'i'
  );
  -- A numerical match on a subcategory caption is not occupancy-rate
  -- evidence, regardless of OCR/model confidence or issuer identity.
  IF component IS NOT NULL
     AND NEW.value_numeric <= 10
     AND NEW.value_numeric = replace(component[1],',','.')::numeric THEN
    NEW.verification_status := 'invalid_tof_subcomponent_not_occupancy';
    NEW.verification_method := 'blocked_vacancy_subcomponent_label';
    NEW.extraction_confidence := 0;
  END IF;
  RETURN NEW;
END;
$recovery134_guard$;

DROP TRIGGER IF EXISTS trg_zz_tof_vacancy_subcomponent
ON public.scpi_metric_certifications;
CREATE TRIGGER trg_zz_tof_vacancy_subcomponent
BEFORE INSERT OR UPDATE
ON public.scpi_metric_certifications
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_tof_vacancy_subcomponent();

REVOKE ALL ON FUNCTION scpi_internal.guard_tof_vacancy_subcomponent()
FROM PUBLIC, anon, authenticated;

DO $recovery134$
DECLARE
  b public.scpi_metric_certifications%ROWTYPE;
  h public.scpi_indicator_history%ROWTYPE;
  perial_cert public.scpi_metric_certifications%ROWTYPE;
  affected integer;
BEGIN
  SELECT * INTO STRICT b
  FROM public.scpi_metric_certifications
  WHERE id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
    AND scpi_slug='buroboutic-metropoles'
    AND source_period='2026-T3' AND metric='tof'
    AND value_numeric=0.07
    AND verification_status IN ('auto_verified_with_evidence',
      'invalid_tof_bulletin_source_policy',
      'invalid_tof_subcomponent_not_occupancy')
    AND source_page=4
    AND source_url='https://www.fiducial-gerance.fr/content/download/544/12625?version=14'
    AND evidence_text ILIKE '%Locaux vacants en restructuration%'
    AND evidence_text ILIKE '%intégrés au TOF sous conditions%0,07%';

  SELECT * INTO STRICT h
  FROM public.scpi_indicator_history
  WHERE id='8d7ae55b-b1e2-4cd1-89ca-85d9ebc47abd'::uuid
    AND scpi_slug='perial-grand-paris' AND source_period='2026-T3'
    AND tof=100 AND qa_status='auto_verified_product_alias_period_tof'
    AND source_confidence=1;

  SELECT * INTO STRICT perial_cert
  FROM public.scpi_metric_certifications
  WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period
    AND metric='tof' AND value_numeric=84.7
    AND verification_status='auto_verified_with_evidence'
    AND source_page=6 AND source_url=h.source_url
    AND evidence_text ILIKE '%occupation financière 84,7 %';

  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
  (event_key,reason,snapshot) VALUES
  ('recovery134:buroboutic-2026-T3-0.07-not-tof',
   'Exact issuer evidence labels 0.07% as vacancy in restructuring, not TOF; original automatic certification quarantined.',
   to_jsonb(b)),
  ('recovery134:perial-grand-paris-2026-T3-history-100-vs-certificate-84.7',
   'History TOF 100% disagrees with same-period/source certificate 84.7%; hold value pending independent binary PDF review.',
   jsonb_build_object('history',to_jsonb(h),'certificate',to_jsonb(perial_cert)))
  ON CONFLICT (event_key) DO NOTHING;

  UPDATE public.scpi_metric_certifications
  SET verification_status='invalid_tof_subcomponent_not_occupancy',
      verification_method='blocked_vacancy_subcomponent_label',
      extraction_confidence=0
  WHERE id=b.id AND value_numeric=0.07
    AND verification_status='auto_verified_with_evidence';
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF b.verification_status='auto_verified_with_evidence' AND affected<>1 THEN
    RAISE EXCEPTION 'BUROBOUTIC_FIRST_QUARANTINE_EXPECTED_1_GOT_%',affected;
  END IF;
  IF b.verification_status<>'auto_verified_with_evidence'
    AND (affected<>0 OR b.extraction_confidence<>0
      OR b.verification_status NOT LIKE 'invalid_tof_%') THEN
    RAISE EXCEPTION 'BUROBOUTIC_ALREADY_QUARANTINED_STATE_CHANGED';
  END IF;

  UPDATE public.scpi_indicator_history
  SET tof=NULL,
      qa_status='auto_partial_review_tof_certificate_conflict'
  WHERE id=h.id AND tof=100
    AND qa_status='auto_verified_product_alias_period_tof'
    AND EXISTS (
      SELECT 1 FROM public.scpi_metric_certifications c
      WHERE c.id=perial_cert.id AND c.value_numeric=84.7
        AND c.source_url=h.source_url);
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'PERIAL_HISTORY_QUARANTINE_EXPECTED_1_GOT_%',affected; END IF;

  IF EXISTS (
    SELECT 1 FROM public.scpi_metric_certifications c
    WHERE c.id=b.id AND (
      c.verification_status NOT LIKE 'invalid_tof_%' OR
      c.extraction_confidence<>0
    )
  ) OR EXISTS (
    SELECT 1 FROM public.scpi_indicator_history hh
    WHERE hh.id=h.id AND (
      hh.tof IS NOT NULL OR hh.qa_status<>'auto_partial_review_tof_certificate_conflict'
    )
  ) THEN
    RAISE EXCEPTION 'RECOVERY134_FAIL_CLOSED_POSTCONDITION';
  END IF;
END;
$recovery134$;
