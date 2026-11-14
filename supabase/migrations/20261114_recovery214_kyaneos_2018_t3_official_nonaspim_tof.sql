-- RECOVERY-214 | Kyaneos Pierre 2018-T3: correct false "TOF not reported".
-- Official issuer PDF p5 explicitly says "TOF (83.8%)" WITHOUT ASPIM;
-- source SHA 850837d91473c97085751a095aea794477ee4b25b337cab0e90a26f00e6cfc3b.
-- The invalid 2021-T2/T3 "TOF ASPIM" quarantines remain untouched and FAIL_STRICT.
DO $fix$
DECLARE
 h public.scpi_indicator_history%ROWTYPE;
 c public.scpi_metric_certifications%ROWTYPE;
 d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 o maximus_agents.scpi_ocr_pages%ROWTYPE;
 hosts text[];
 pass_before int;
 pass_after int;
 modified int;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('recovery214:kyaneos-pierre:2018-T3'));
 SELECT count(*) INTO pass_before FROM public.scpi_crash_test_strict_v2 WHERE crash_test_status='PASS_100';
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2018-T3' FOR UPDATE;
 SELECT * INTO STRICT c FROM public.scpi_metric_certifications
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2018-T3' AND metric='tof' FOR UPDATE;
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2018-T3'
  AND pdf_sha256='850837d91473c97085751a095aea794477ee4b25b337cab0e90a26f00e6cfc3b'
  AND source_url='https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-3T18.pdf'
  AND status='extracted' AND processing_complete;
 SELECT * INTO STRICT o FROM maximus_agents.scpi_ocr_pages
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2018-T3'
  AND pdf_sha256=d.pdf_sha256 AND page_number=5 AND document_kind='quarterly_bulletin'
  AND extraction_method='native_pdf_text';
 SELECT allowed_hosts INTO STRICT hosts FROM public.scpi_source_connectors
 WHERE scpi_slug='kyaneos-pierre' AND enabled;
 IF h.tof IS NOT NULL OR h.qa_status<>'manual_verified_official_tof_not_reported'
   OR h.source_confidence<>1 OR h.source_url<>d.source_url
   OR c.value_numeric IS NOT NULL
   OR c.verification_status<>'manual_verified_official_not_reported'
   OR c.verification_method<>'official_bulletin_absence_verified'
   OR c.source_page IS NOT NULL OR c.source_url<>d.source_url
   OR NOT EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
      WHERE scpi_slug='kyaneos-pierre' AND crash_test_status='FAIL_STRICT')
 THEN RAISE EXCEPTION 'REC214_PREVIOUS_VALUES_CHANGED'; END IF;
 IF d.result->>'identity_verified'<>'true' OR d.result->>'period_verified'<>'true'
   OR d.result->>'archive_path'<>'kyaneos-pierre/2018-T3/'||d.pdf_sha256||'.pdf'
   OR o.page_text NOT LIKE '%TAUX D’OCCUPATION FINANCIER%'
   OR o.page_text NOT LIKE '%TOF (83.8%)%'
   OR POSITION('TOF ASPIM' IN upper(o.page_text))>0
   OR (d.result->'evidence'->'tof'->>'value')::numeric<>83.8
   OR (d.result->'evidence'->'tof'->>'page')::int<>5
   OR d.result->'evidence'->'tof'->>'text'<>'TOF | 83.8%'
   OR d.result->'evidence'->'tof'->>'reference_date'<>'2018-09-30'
   OR d.result->'evidence'->'tof'->'independent_engines'<>'["MuPDF","Poppler"]'::jsonb
   OR NOT (lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(hosts))
   OR NOT EXISTS (SELECT 1 FROM storage.objects so WHERE so.bucket_id='scpi-bulletins'
      AND so.name=d.result->>'archive_path' AND (so.metadata->>'size')::bigint=2124880)
   OR NOT EXISTS (SELECT 1 FROM public.scpi_bulletins b
      WHERE b.scpi_slug=d.scpi_slug AND b.period=d.source_period
      AND b.pdf_sha256=d.pdf_sha256 AND b.source_url=d.source_url)
   OR scpi_internal.tof_bulletin_source_rejection_reason(
     'kyaneos-pierre',d.source_url,'TOF (83.8%)',
     'archived_issuer_pdf_two_independent_readers',
     'independent_verified_official_bulletin') IS NOT NULL
 THEN RAISE EXCEPTION 'REC214_NO_EXACT_ISSUER_NONASPIM_PDF_PROOF'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications
   WHERE scpi_slug='kyaneos-pierre' AND source_period='2021-T2'
    AND metric='tof' AND verification_status='invalid_tof_bulletin_source_policy'
    AND value_numeric=78.7)
 OR NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications
   WHERE scpi_slug='kyaneos-pierre' AND source_period='2021-T3'
    AND metric='tof' AND verification_status='invalid_tof_bulletin_source_policy'
    AND value_numeric=74.3)
 THEN RAISE EXCEPTION 'REC214_2021_ASPIM_QUARANTINE_CHANGED'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES ('recovery214:kyaneos-pierre:2018-T3:tof-p5',
  'Replace false TOF not reported claim for 2018-T3 using original PDF non-ASPIM TOF, preserving 2021-T2/T3 ASPIM quarantines.',
  jsonb_build_object('history_before',to_jsonb(h),'certification_before',to_jsonb(c),
     'pdf_sha256',d.pdf_sha256,'archive_path',d.result->>'archive_path',
     'page5_extract',substring(o.page_text from greatest(strpos(o.page_text,'TOF (83.8%)')-210,1) for 460),
     'double_reader',d.result->'evidence'->'tof','human_attestation',false));
 UPDATE public.scpi_metric_certifications SET value_numeric=83.8,
   unit='%',source_page=5,
   evidence_text='Bulletin officiel Kyaneos Pierre T3 2018, page 5: TAUX D’OCCUPATION FINANCIER, TOF (83.8%). Non-ASPIM. Deux lecteurs PDF indépendants.',
   verification_status='independent_verified_official_bulletin',
   verification_method='archived_issuer_pdf_two_independent_readers',
   extraction_confidence=1,verified_at=now()
 WHERE id=c.id AND value_numeric IS NULL AND verification_status='manual_verified_official_not_reported';
 GET DIAGNOSTICS modified=ROW_COUNT;
 IF modified<>1 THEN RAISE EXCEPTION 'REC214_CERT_NOT_UNIQUE'; END IF;
 UPDATE public.scpi_indicator_history SET
   tof=83.8,qa_status='auto_verified_dual_pdf_evidence',
   metric_provenance=jsonb_set(metric_provenance,'{tof}',
    jsonb_build_object('unit','%','value',83.8,'definition','TOF_canonique_bulletin_officiel',
     'sha256',d.pdf_sha256,'source_url',d.source_url,'source_page',5,
     'document_period','2018-T3','reference_date','2018-09-30',
     'verification','archived_issuer_pdf_two_independent_readers',
     'human_attestation',false),true)
 WHERE id=h.id AND tof IS NULL AND qa_status='manual_verified_official_tof_not_reported';
 GET DIAGNOSTICS modified=ROW_COUNT;
 IF modified<>1 THEN RAISE EXCEPTION 'REC214_HISTORY_NOT_UNIQUE'; END IF;
 SELECT count(*) INTO pass_after FROM public.scpi_crash_test_strict_v2 WHERE crash_test_status='PASS_100';
 IF pass_after<>pass_before
   OR NOT EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
       WHERE scpi_slug='kyaneos-pierre' AND crash_test_status='FAIL_STRICT')
 THEN RAISE EXCEPTION 'REC214_MUST_NOT_FORCE_KYANEOS_PASS'; END IF;
 INSERT INTO public.scpi_ingestion_events
 (scpi_slug,step,status,message,source_period,bulletin_url,extraction_confidence,metrics_count,ended_at)
 VALUES('kyaneos-pierre','recovery214_original_2018_t3_nonaspim_tof','completed',
  'Original issuer SHA850837d PDF p5 TOF 83.8% verified by MuPDF+Poppler. False non-reported corrected. 2021 ASPIM quarantines and FAIL_STRICT remain.', '2018-T3',d.source_url,1,1,now());
END $fix$;

-- Exact 2018-T3 per-metric anti-regression in existing integrity trigger.
-- No new workflow, no general policy changes, and original Iroko guard retained.
CREATE OR REPLACE FUNCTION public.guard_scpi_manual_metric_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
 rec record;
 approved numeric;
BEGIN
  -- RECOVERY-214: protect exact original non-ASPIM issuer TOF (Kyaneos 2018-T3)
  -- against automated stale absence replays; allow explicit invalidation
  -- by an independent QA decision (qa_status invalid*).
  IF TG_OP='UPDATE' AND OLD.scpi_slug='kyaneos-pierre'
    AND OLD.source_period='2018-T3' AND OLD.tof=83.8
    AND OLD.qa_status='auto_verified_dual_pdf_evidence'
    AND OLD.metric_provenance->'tof'->>'sha256'=
      '850837d91473c97085751a095aea794477ee4b25b337cab0e90a26f00e6cfc3b'
    AND COALESCE(NEW.qa_status,'') !~ '^invalid'
    AND (NEW.tof IS DISTINCT FROM OLD.tof
      OR NEW.qa_status IS DISTINCT FROM OLD.qa_status
      OR NEW.metric_provenance->'tof' IS DISTINCT FROM OLD.metric_provenance->'tof')
    AND EXISTS (SELECT 1 FROM public.scpi_metric_certifications c
       JOIN public.scpi_bulletins b
        ON b.scpi_slug=c.scpi_slug AND b.period=c.source_period
       WHERE c.scpi_slug='kyaneos-pierre' AND c.source_period='2018-T3'
         AND c.metric='tof' AND c.value_numeric=83.8 AND c.source_page=5
         AND c.verification_status='independent_verified_official_bulletin'
         AND c.source_url=b.source_url
         AND b.pdf_sha256=OLD.metric_provenance->'tof'->>'sha256')
  THEN
    NEW.tof:=OLD.tof;
    NEW.qa_status:=OLD.qa_status;
    NEW.metric_provenance:=jsonb_set(COALESCE(NEW.metric_provenance,'{}'::jsonb),
       '{tof}',OLD.metric_provenance->'tof',true);
  END IF;
  -- RECOVERY-213: retain exact issuer-page proof if a generic ingestion
  -- tries to replay the stale T2 shares into the same T3 period.
  -- This is a scoped data-integrity guard, not manual approval or a new engine.
  IF TG_OP='UPDATE'
    AND OLD.scpi_slug='iroko-atlas' AND OLD.source_period='2026-T3'
    AND OLD.nombre_parts=1094174
    AND NEW.nombre_parts IS DISTINCT FROM OLD.nombre_parts
    AND OLD.metric_provenance->'nombre_parts'->>'sha256'=
      '301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
    AND EXISTS (SELECT 1 FROM public.scpi_metric_certifications c
      JOIN public.scpi_source_registry r USING(scpi_slug)
      JOIN maximus_agents.scpi_ocr_pages p ON p.scpi_slug=c.scpi_slug
        AND p.source_period=c.source_period
        AND p.pdf_sha256=r.issuer_source_sha256
      WHERE c.scpi_slug=OLD.scpi_slug AND c.source_period=OLD.source_period
        AND c.metric='nombre_parts' AND c.value_numeric=1094174
        AND c.source_page=2 AND c.verification_status='independent_verified_official_bulletin'
        AND r.issuer_source_sha256=OLD.metric_provenance->'nombre_parts'->>'sha256'
        AND p.document_kind='quarterly_bulletin' AND p.page_number=2
        AND p.extraction_method='native_pdf_text'
        AND p.page_text LIKE '%Parts net de retrait%'
        AND p.page_text LIKE '%1 094 174%')
  THEN
    NEW.nombre_parts:=OLD.nombre_parts;
    NEW.metric_provenance:=jsonb_set(COALESCE(NEW.metric_provenance,'{}'::jsonb),
      '{nombre_parts}',OLD.metric_provenance->'nombre_parts',true);
  END IF;
 -- A manual, source-backed certification is authoritative; an import cannot
 -- silently overwrite the corresponding metric. Other fields are unchanged.
 IF TG_OP='UPDATE' THEN
   FOR rec IN SELECT * FROM (VALUES
     ('tof'::text, NEW.tof::numeric, OLD.tof::numeric),
     ('endettement', NEW.endettement::numeric, OLD.endettement::numeric),
     ('prix_reconstitution', NEW.prix_reconstitution::numeric, OLD.prix_reconstitution::numeric),
     ('valeur_realisation', NEW.valeur_realisation::numeric, OLD.valeur_realisation::numeric),
     ('distribution_par_part', NEW.distribution_par_part::numeric, OLD.distribution_par_part::numeric),
     ('parts_attente_retrait', NEW.parts_attente_retrait::numeric, OLD.parts_attente_retrait::numeric),
     ('nombre_parts', NEW.nombre_parts::numeric, OLD.nombre_parts::numeric)
   ) AS fields(metric, incoming, previous)
   WHERE incoming IS DISTINCT FROM previous
   LOOP
     SELECT c.value_numeric INTO approved
     FROM public.scpi_metric_certifications c
     WHERE c.scpi_slug=NEW.scpi_slug AND c.source_period=NEW.source_period
       AND c.metric=rec.metric AND c.verification_status LIKE 'manual_verified_official%'
       AND c.value_numeric IS NOT NULL;
     IF FOUND AND (rec.incoming IS NULL OR abs(rec.incoming-approved)>0.0001) THEN
       RAISE EXCEPTION 'SCPI_CERTIFIED_METRIC_PROTECTED: % % %, verified %, attempted %',
         NEW.scpi_slug, NEW.source_period,rec.metric,approved,rec.incoming
         USING ERRCODE='23514';
     END IF;
   END LOOP;
 ELSE
   FOR rec IN SELECT * FROM (VALUES
     ('tof'::text, NEW.tof::numeric),
     ('endettement', NEW.endettement::numeric),
     ('prix_reconstitution', NEW.prix_reconstitution::numeric),
     ('valeur_realisation', NEW.valeur_realisation::numeric),
     ('distribution_par_part', NEW.distribution_par_part::numeric),
     ('parts_attente_retrait', NEW.parts_attente_retrait::numeric),
     ('nombre_parts', NEW.nombre_parts::numeric)
   ) AS fields(metric, incoming)
   LOOP
     SELECT c.value_numeric INTO approved
     FROM public.scpi_metric_certifications c
     WHERE c.scpi_slug=NEW.scpi_slug AND c.source_period=NEW.source_period
       AND c.metric=rec.metric AND c.verification_status LIKE 'manual_verified_official%'
       AND c.value_numeric IS NOT NULL;
     IF FOUND AND (rec.incoming IS NULL OR abs(rec.incoming-approved)>0.0001) THEN
       RAISE EXCEPTION 'SCPI_CERTIFIED_METRIC_PROTECTED: % % %, verified %, attempted %',
         NEW.scpi_slug, NEW.source_period,rec.metric,approved,rec.incoming
         USING ERRCODE='23514';
     END IF;
   END LOOP;
 END IF;
 RETURN NEW;
END;
$function$
;
