-- RECOVERY-221: Épargne Pierre 2026-T3, correct false 811 M€ certificate.
-- Issuer full Q3 bulletin lists 2 811 M€ on page 1 and precisely
-- 2 811 241 056 € at 30 September 2026 in the evolution-of-capital table.
-- Existing history already holds the precise figure; do NOT change it.
-- Subscription price and share-count 10-for-1 split are separate QA issues.
-- No source-registry approval, numeric fabricated value, or PASS_100.

DO $rec221$
DECLARE
 v_url text := 'https://atland-voisin.com/wp-content/uploads/2026/10/BPI3T2026-EP-vdef-web.pdf';
 v_sha text := 'ab652dc2f490ccd8a7ed223bd0afd12a584b99eb46f43b9ea495b149096b94eb';
 n_pdf integer; n_hist integer; n_cert integer; n_changed integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('maximus:RECOVERY-221:epargne-pierre:2026-T3'));
 IF (SELECT count(*) FROM maximus_agents.scpi_universe WHERE lifecycle='existing')<>69 OR
    (SELECT count(*) FROM public.scpi_crash_test_strict_v2)<>69 OR
    NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_universe
      WHERE lifecycle='existing' AND scpi_slug='epargne-pierre') THEN
   RAISE EXCEPTION 'REC221_COHORT_DRIFT';
 END IF;
 SELECT count(*) INTO n_pdf FROM maximus_agents.scpi_bulletin_replay_documents d
 JOIN public.scpi_source_registry r ON r.scpi_slug=d.scpi_slug
 JOIN public.scpi_source_connectors cfg ON cfg.scpi_slug=d.scpi_slug AND cfg.enabled=true
 JOIN public.scpi_bulletins b ON b.scpi_slug=d.scpi_slug
     AND b.period=d.source_period AND b.source_url=d.source_url AND b.pdf_sha256=d.pdf_sha256
 WHERE d.scpi_slug='epargne-pierre' AND d.source_period='2026-T3'
   AND d.source_url=v_url AND d.pdf_sha256=v_sha
   AND r.last_document_period=d.source_period AND r.bulletin_url=v_url
   AND lower(split_part(split_part(d.source_url,'://',2),'/',1))=ANY(cfg.allowed_hosts)
   AND d.status='extracted' AND d.processing_complete IS TRUE AND d.page_count=6
   AND d.result->>'identity_verified'='true'
   AND d.result->>'period_verified'='true'
   AND d.result->>'sha256'=v_sha
   AND d.field_coverage->>'capitalisation'='verified'
   AND d.result->'metrics'->>'capitalisation'='2811'
   AND d.result->'evidence'->'capitalisation'->>'page'='1'
   AND d.result->'evidence'->'capitalisation'->>'value_match'='true'
   AND d.result->'evidence'->'capitalisation'->>'method'='dual_pdf_geometry'
   AND d.result->'evidence'->'capitalisation'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
   AND d.result->'evidence'->'capitalisation'->>'text' LIKE '%2 811%'
   AND d.result->'evidence'->'capitalisation'->>'poppler_text' LIKE '%2 811%';
 IF n_pdf<>1 THEN RAISE EXCEPTION 'REC221_NO_EXACT_DUAL_READER_PDF %',n_pdf; END IF;
 SELECT count(*) INTO n_hist FROM public.scpi_indicator_history h
 WHERE h.scpi_slug='epargne-pierre' AND h.source_period='2026-T3'
   AND h.source_url=v_url AND h.qa_status='source_verified_t3_partial_metrics'
   AND h.capitalisation=2811.241056
   AND h.nombre_parts=13515582 AND h.prix_souscription=208;
 SELECT count(*) INTO n_cert FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug='epargne-pierre' AND c.source_period='2026-T3'
   AND c.metric='capitalisation' AND c.value_numeric=811 AND c.source_page IS NULL
   AND c.verification_status='source_verified_no_field_evidence'
   AND c.verification_method='certified_bulletin_without_field_evidence'
   AND c.source_url=v_url;
 IF n_hist<>1 OR n_cert<>1 THEN
   RAISE EXCEPTION 'REC221_PREIMAGE_MISMATCH history % cert %',n_hist,n_cert;
 END IF;
 UPDATE public.scpi_metric_certifications c
 SET value_numeric=2811,
     source_page=1,
     evidence_text='RECOVERY-221: official Épargne Pierre 2026-T3 bulletin, exact SHA-256 '||
        v_sha||' page 1: CAPITALISATION 2 811 M EUR; independent MuPDF/Poppler'||
        ' same-page/same-value geometry evidence.'||
        ' Publisher Q3 capital evolution reports exact 2 811 241 056 EUR;'||
        ' capitalisation history already preserves exact amount.'||
        ' Independent financial QA pending; 10-for-1 share split'||
        ' in other Q3 historical fields still requires separate review.',
     verification_status='review_required_independent_financial_qa',
     verification_method='dual_pdf_geometry_current_value_pending_qa',
     verified_at=now()
 WHERE c.scpi_slug='epargne-pierre' AND c.source_period='2026-T3'
   AND c.metric='capitalisation' AND c.value_numeric=811
   AND c.source_page IS NULL AND c.source_url=v_url
   AND c.verification_status='source_verified_no_field_evidence';
 GET DIAGNOSTICS n_changed=ROW_COUNT;
 IF n_changed<>1 THEN RAISE EXCEPTION 'REC221_CERT_WRITES_NOT_ONE %',n_changed; END IF;
 INSERT INTO public.scpi_ingestion_events
    (scpi_slug,status,step,message,source_page_url,bulletin_url,
     source_period,extraction_confidence,metrics_count,ended_at)
 VALUES ('epargne-pierre','completed','recovery221_t3_capitalisation_source_reconciled',
    'RECOVERY-221: erroneous certificate 811 M EUR replaced by 2 811 M EUR.'||
    ' Original publisher PDF SHA '||v_sha||
    ', page 1; dual MuPDF/Poppler. Exact historical number 2 811 241 056 EUR preserved.'||
    ' Financial QA not signed. T3 split shares and pricing require independent follow-up.',
    'https://atland-voisin.com/scpi/epargne-pierre/',v_url,'2026-T3',0.98,1,now());
 IF NOT EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
   WHERE scpi_slug='epargne-pierre' AND crash_test_status='FAIL_STRICT') THEN
   RAISE EXCEPTION 'REC221_UNEXPECTED_STRICT_PASS_WITH_INCOMPLETE_SOURCE';
 END IF;
END $rec221$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_epargne_pierre_q3_capitalisation_v1()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog AS $guard$
BEGIN
 IF NEW.scpi_slug='epargne-pierre' AND NEW.source_period='2026-T3'
    AND NEW.metric='capitalisation' AND coalesce(NEW.verification_status,'') NOT LIKE 'invalid%'
    AND (NEW.value_numeric IS NULL OR abs(NEW.value_numeric-2811)>0.5) THEN
    RAISE EXCEPTION 'REC221_STALE_811_MEUR_CERTIFICATE_REPLAY_REJECTED';
 END IF;
 RETURN NEW;
END $guard$;
REVOKE ALL ON FUNCTION scpi_internal.guard_epargne_pierre_q3_capitalisation_v1() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_recovery221_epargne_t3_capitalisation ON public.scpi_metric_certifications;
CREATE TRIGGER trg_recovery221_epargne_t3_capitalisation
BEFORE INSERT OR UPDATE OF value_numeric ON public.scpi_metric_certifications
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_epargne_pierre_q3_capitalisation_v1();
