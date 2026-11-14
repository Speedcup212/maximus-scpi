
-- RECOVERY-213: issuer-source original PDF, exact 2026-T3 shares Iroko Atlas.
-- Previously the T3 row had reused T2 834,833 shares; T3 issuer PDF p.2
-- expressly reports "Parts net de retrait 1 094 174" as at 30/09/2026.
-- Independent reading: archived native PDF page 2, public original PDF
-- parser and issuer website "Nombre de parts total 1 094 174".
-- Source URL https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf
-- SHA-256 301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a
-- Does not invent a number via capitalisation / price, or assert human QA.
DO $shares$
DECLARE
 h public.scpi_indicator_history%ROWTYPE;
 p maximus_agents.scpi_ocr_pages%ROWTYPE;
 d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 source_hosts text[];
 n integer;
 prior_pass integer;
 next_pass integer;
 before_gate public.scpi_crash_test_strict_v2%ROWTYPE;
 after_gate public.scpi_crash_test_strict_v2%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('recovery212:iroko-atlas:2026-T3'));
 SELECT count(*) INTO prior_pass FROM public.scpi_crash_test_strict_v2 WHERE crash_test_status='PASS_100';
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
  WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3' FOR UPDATE;
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents
  WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3' AND
  pdf_sha256='301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
  AND source_url='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf'
  AND status='extracted' AND processing_complete=true;
 SELECT * INTO STRICT p FROM maximus_agents.scpi_ocr_pages
  WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3'
    AND document_kind='quarterly_bulletin' AND page_number=2
    AND pdf_sha256=d.pdf_sha256 AND extraction_method='native_pdf_text';
 SELECT allowed_hosts INTO STRICT source_hosts
  FROM public.scpi_source_connectors
  WHERE scpi_slug='iroko-atlas' AND enabled;
 SELECT * INTO STRICT before_gate
  FROM public.scpi_crash_test_strict_v2 WHERE scpi_slug='iroko-atlas';
 IF before_gate.crash_test_status<>'FAIL_STRICT' OR NOT before_gate.source_ready
    OR before_gate.uncertified_tof_periods<>0
    OR before_gate.cap_consistency_issues<>1
    OR NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_universe
        WHERE scpi_slug='iroko-atlas' AND lifecycle='existing')
 THEN RAISE EXCEPTION 'REC213_SHARES_PRE_GATE_CHANGED'; END IF;
 IF h.nombre_parts<>834833 OR h.capitalisation<>218.83
   OR h.prix_souscription<>200 OR h.tof<>96.65
   OR h.source_period<>'2026-T3'
   OR h.metric_provenance ? 'nombre_parts'
   OR NOT EXISTS (SELECT 1 FROM public.scpi_indicator_history t2
     WHERE t2.scpi_slug='iroko-atlas' AND t2.source_period='2026-T2'
       AND t2.nombre_parts=834833)
   OR EXISTS (SELECT 1 FROM public.scpi_metric_certifications
     WHERE scpi_slug='iroko-atlas' AND source_period='2026-T3' AND metric='nombre_parts')
   OR NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications
     WHERE id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid
       AND verification_status='independent_verified_official_bulletin'
       AND source_url=d.source_url AND source_page=6 AND value_numeric=96.65)
 THEN RAISE EXCEPTION 'REC213_SHARES_PRE_VALUES_CHANGED'; END IF;
 IF p.page_text NOT LIKE '%Parts net de retrait%'
    OR p.page_text NOT LIKE '%1 094 174%'
    OR p.page_text NOT LIKE '%218,83 M€%'
    OR p.page_text NOT LIKE '%200,00 €%'
    OR p.page_text NOT LIKE '%30/09/2026%'
    OR d.result->>'identity_verified'<>'true'
    OR d.result->>'period_verified'<>'true'
    OR d.result->>'archive_path'<>'iroko-atlas/2026-T3/'||d.pdf_sha256||'.pdf'
    OR NOT (lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(source_hosts))
    OR NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
       AND o.name=d.result->>'archive_path' AND (o.metadata->>'size')::bigint=3971612)
    OR NOT EXISTS (SELECT 1 FROM public.scpi_source_registry s
       WHERE s.scpi_slug='iroko-atlas' AND s.verification_status='verified'
       AND s.confidence_level='high'
       AND s.issuer_source_url=d.source_url AND s.issuer_source_sha256=d.pdf_sha256)
 THEN RAISE EXCEPTION 'REC213_SHARES_PDF_IDENTITY_PAGE_PROOF_INCOMPLETE'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES ('recovery213:iroko-atlas:2026-T3:shares-page2',
   'Issuer-original Q3 PDF page 2 proves 1094174 shares, cross-checked against issuer PDF web rendition and issuer HTML. Correct T3 only; T2 retained, no generated numeric field.',
   jsonb_build_object('history_before',to_jsonb(h),
     'pdf_sha256',d.pdf_sha256,'archive_path',d.result->>'archive_path',
     'source_page',2,'extraction_method',p.extraction_method,
     'publisher_pdf_text',substring(p.page_text from 1 for 1250),
     'publisher_web_url','https://www.iroko.eu/bulletins-trimestriels-atlas/t3-2026',
     'human_attestation',false));
 INSERT INTO public.scpi_metric_certifications
 (scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
  evidence_text,verification_status,verification_method,extraction_confidence)
 VALUES ('iroko-atlas','2026-T3','nombre_parts',1094174,'parts',d.source_url,2,
    'Iroko Atlas T3 2026 p.2: Parts net de retrait 1 094 174; issuer web T3 calls it nombre de parts total. Capitalisation 218,83 M€ and prix de souscription 200,00 € on the same original page.',
    'independent_verified_official_bulletin',
    'archived_issuer_pdf_page2_native_text_and_independent_issuer_html',1);
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC213_SHARE_CERT_NOT_UNIQUE'; END IF;
 UPDATE public.scpi_indicator_history
 SET nombre_parts=1094174,
 metric_provenance=jsonb_set(metric_provenance,'{nombre_parts}',
  jsonb_build_object('unit','parts','sha256',d.pdf_sha256,
   'source_url',d.source_url,'source_page',2,'document_period','2026-T3',
   'reference_date','2026-09-30',
   'evidence_label','Parts net de retrait',
   'verification_method','archived_issuer_pdf_page2_native_text_and_independent_issuer_html',
   'verification_status','independent_verified_official_bulletin',
   'human_attestation',false),true)
 WHERE id=h.id AND scpi_slug='iroko-atlas' AND source_period='2026-T3'
   AND nombre_parts=834833 AND capitalisation=218.83 AND prix_souscription=200;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC213_SHARE_HISTORY_NOT_UNIQUE'; END IF;
 SELECT * INTO STRICT after_gate FROM public.scpi_crash_test_strict_v2
 WHERE scpi_slug='iroko-atlas';
 SELECT count(*) INTO next_pass FROM public.scpi_crash_test_strict_v2
 WHERE crash_test_status='PASS_100';
 IF after_gate.crash_test_status<>'PASS_100' OR NOT after_gate.source_ready
   OR after_gate.cap_consistency_issues<>0
   OR after_gate.uncertified_tof_periods<>0
   OR next_pass<>prior_pass+1
 THEN RAISE EXCEPTION 'REC213_STRICT_NOT_EXACTLY_PLUS_ONE: % -> %, status %, cap %',
   prior_pass,next_pass,after_gate.crash_test_status,after_gate.cap_consistency_issues; END IF;
 INSERT INTO public.scpi_ingestion_events
 (scpi_slug,step,status,message,source_period,bulletin_url,
  extraction_confidence,metrics_count,ended_at)
 VALUES('iroko-atlas','recovery213_issuer_pdf_t3_shares_page2','completed',
 'Official issuer PDF p2 SHA301b proves 1094174 shares, crosschecked with official issuer web; T2 834833 preserved. QA original source and strict view recomputed with exact +1 PASS. No human attestation or Netlify publication.',
 '2026-T3',d.source_url,1,1,now());
END $shares$;

-- Extend the EXISTING per-metric integrity trigger for this source-backed
-- T3 shares only; no new automation, no broad relaxation or fake manual QA.
CREATE OR REPLACE FUNCTION public.guard_scpi_manual_metric_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
 rec record;
 approved numeric;
BEGIN
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

DO $guard_presence$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trg_guard_scpi_manual_metric_integrity'
   AND tgrelid='public.scpi_indicator_history'::regclass AND NOT tgisinternal)
 THEN RAISE EXCEPTION 'REC213_MISSING_EXISTING_METRIC_GUARD'; END IF;
END $guard_presence$;
