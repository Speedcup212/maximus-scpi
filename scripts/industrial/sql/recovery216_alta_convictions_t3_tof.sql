-- RECOVERY-216: Alta Convictions 2026-T3 issuer TOF, without changing strict certification gates.
-- Archived issuer PDF sha256 b0e55e0606feb657e11fc12e05b6938422e72c64b07ba3d07a838f483113bf37,
-- 1034887 bytes, page 3: "Taux d'occupation financier 97%" (reference date 2026-09-30).
-- Evidence already produced by the existing replay (MuPDF + Poppler, dual_pdf_geometry, field VERIFIED)
-- but never applied: canonical guard failed on 2026-11-11 with
-- "permission denied for function tof_explicit_vacancy_conflict". No human attestation.
-- Only the TOF is certified; the T3 row stays auto_partial_review for its other fields.
DO $fix$
DECLARE
 h public.scpi_indicator_history%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE;
 r maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 pass_before text[];
 provenance jsonb;
 ev_text text := 'Taux d''occupation financier 97%. TOF 97%: Locaux occupés (97%), Locaux vacants (3%). Page 3, au 30/09/2026. Replay dual reader: TOF | 97%.';
 c_sha constant text := 'b0e55e0606feb657e11fc12e05b6938422e72c64b07ba3d07a838f483113bf37';
 c_url constant text := 'https://altarea-im.com/wp-content/uploads/2026/10/06102026_ALTA_BUL_TRIMESTRIEL_T3_26_PPP_WEB.pdf';
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('recovery216:alta-convictions:2026-T3'));
 SELECT array_agg(scpi_slug ORDER BY scpi_slug) INTO pass_before
 FROM public.scpi_crash_test_strict_v2 WHERE crash_test_status='PASS_100';
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
 WHERE scpi_slug='alta-convictions' AND source_period='2026-T3' FOR UPDATE;
 SELECT * INTO STRICT b FROM public.scpi_bulletins
 WHERE scpi_slug=h.scpi_slug AND period=h.source_period FOR UPDATE;
 SELECT * INTO STRICT r FROM maximus_agents.scpi_bulletin_replay_documents
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period FOR UPDATE;
 IF h.tof IS NOT NULL OR COALESCE(h.qa_status,'') LIKE 'invalid%' OR COALESCE(h.source_confidence,0)<0.95
 OR b.pdf_sha256 IS DISTINCT FROM c_sha OR b.source_url IS DISTINCT FROM c_url
 OR h.source_url IS DISTINCT FROM c_url
 OR EXISTS (SELECT 1 FROM public.scpi_metric_certifications
   WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period AND metric='tof')
 OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='scpi-bulletins'
   AND name='alta-convictions/2026-T3/'||c_sha||'.pdf' AND (metadata->>'size')::bigint=1034887)
 OR NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors WHERE scpi_slug=h.scpi_slug
   AND 'altarea-im.com'=ANY(allowed_hosts))
 -- existing dual-reader replay evidence, same binary
 OR r.pdf_sha256 IS DISTINCT FROM c_sha OR (r.metrics->>'tof')::numeric IS DISTINCT FROM 97
 OR r.evidence->'tof'->>'method' IS DISTINCT FROM 'dual_pdf_geometry'
 OR (r.evidence->'tof'->>'page')::int IS DISTINCT FROM 3
 OR r.evidence->'tof'->>'value_match' IS DISTINCT FROM 'true'
 OR r.evidence->'tof'->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb
 OR r.evidence->'tof'->>'reference_date' IS DISTINCT FROM '2026-09-30'
 OR r.result->'field_decisions'->'tof'->>'status' IS DISTINCT FROM 'VERIFIED'
 OR r.result->>'identity_verified' IS DISTINCT FROM 'true'
 OR r.result->>'period_verified' IS DISTINCT FROM 'true'
 -- independent native text of the same binary, page 3
 OR NOT EXISTS (SELECT 1 FROM maximus_agents.scpi_ocr_pages p
   WHERE p.scpi_slug=h.scpi_slug AND p.source_period=h.source_period AND p.page_number=3
     AND p.pdf_sha256=c_sha AND p.extraction_method='native_pdf_text'
     AND p.page_text ~ 'Taux d’occupation financier[^%]{0,160}97%'
     -- total TOF equals the occupied component here (97 + 3 = 100): not a sub-component
     AND p.page_text ~ 'Locaux occupés \(97%\)' AND p.page_text ~ 'Locaux vacants \(3%\)')
 -- the explicit-vacancy guard that failed on permission must not flag this evidence
 OR scpi_internal.tof_explicit_vacancy_conflict(97, ev_text)
 THEN RAISE EXCEPTION 'REC216_SOURCE_OR_BASELINE_CHANGED'; END IF;

 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES ('recovery216:alta-convictions:2026-T3:tof-p3-applied',
 'Archived issuer PDF p3: TOF 97% at 2026-09-30. Existing dual-reader replay evidence (MuPDF+Poppler) applied after canonical guard permission failure of 2026-11-11. No human attestation. Strict gate unchanged.',
 jsonb_build_object('history_before',to_jsonb(h),'bulletin_before',to_jsonb(b)-'extraction_json',
 'replay_tof_evidence',r.evidence->'tof','replay_guard_error',r.result->>'canonical_guard_error'));

 provenance:=jsonb_build_object('value',97,'unit','%','definition','issuer_reported_tof',
 'sha256',c_sha,'source_url',c_url,'source_page',3,'document_period',h.source_period,
 'reference_date','2026-09-30','verification_method','dual_pdf_geometry',
 'readers',jsonb_build_array('MuPDF','Poppler'),'human_attestation',false,'recovery_task','RECOVERY-216');

 INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,value_text,unit,
  source_url,source_page,evidence_text,bulletin_id,verification_status,verification_method,
  extraction_confidence,verified_at)
 VALUES (h.scpi_slug,h.source_period,'tof',97,'97 %','%',c_url,3,ev_text,b.id,
  'auto_verified_with_evidence','dual_pdf_geometry',0.98,now());

 UPDATE public.scpi_indicator_history SET tof=97,
  metric_provenance=jsonb_set(COALESCE(metric_provenance,'{}'::jsonb),'{tof}',provenance,true)
 WHERE id=h.id;

 IF NOT EXISTS (SELECT 1 FROM public.scpi_indicator_history WHERE id=h.id AND tof=97
   AND qa_status IS NOT DISTINCT FROM h.qa_status)
 OR NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug=h.scpi_slug
   AND source_period=h.source_period AND metric='tof' AND value_numeric=97 AND source_page=3
   AND verification_status='auto_verified_with_evidence' AND extraction_confidence>=0.95)
 THEN RAISE EXCEPTION 'REC216_CORRECTION_NOT_RETAINED'; END IF;
 IF EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
   WHERE scpi_slug=ANY(pass_before) AND crash_test_status<>'PASS_100')
 THEN RAISE EXCEPTION 'REC216_STRICT_REGRESSION'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
   WHERE scpi_slug=h.scpi_slug AND crash_test_status='PASS_100' AND missing_tof=0
     AND uncertified_tof_periods=0)
 THEN RAISE EXCEPTION 'REC216_EXPECTED_PASS_NOT_REACHED'; END IF;
END $fix$;
