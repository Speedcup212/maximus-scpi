-- RECOVERY-183 — Source provenance alone, after independent documentary evidence.
-- Pilot: Aestiam Horizon 2026-T3. Never auto-certify incomplete numerical fields.
-- Mirrors RECOVERY-181's SHA attestation on the SAME existing source registry.
CREATE OR REPLACE FUNCTION maximus_agents.attest_aestiam_horizon_direct_issuer_v1()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $func$
DECLARE pdf_url text := 'https://www.aestiam.com/doc/horizon/periodique/2026-3t-bti-aestiam-horizon.pdf';
 pdf_sha text := 'c77dc6259fc2e7731db341a4dc7db8475653b77ebe7be98ad42ae3ac7e588309';
 n integer; proof_count integer; status text; existing_sha text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('RECOVERY183:aestiam-horizon:2026-T3'));
 SELECT r.verification_status,r.issuer_source_sha256 INTO status,existing_sha
 FROM public.scpi_source_registry r WHERE r.scpi_slug='aestiam-horizon' FOR UPDATE;
 IF status='verified' AND existing_sha=pdf_sha THEN
  RETURN jsonb_build_object('updated',0,'already_attested',true,'financial_value_changes',0,'financial_certifications_granted',0);
 END IF;
 IF status IS DISTINCT FROM 'incomplete' OR existing_sha IS NOT NULL THEN
  RAISE EXCEPTION 'RECOVERY183_SOURCE_CHANGED_REVIEW_REQUIRED';
 END IF;

 SELECT count(*)::int INTO proof_count
 FROM public.scpi_source_registry r
 JOIN maximus_agents.scpi_universe u ON u.scpi_slug=r.scpi_slug AND u.lifecycle='existing'
 JOIN public.scpi_crash_test_strict_v2 v ON v.scpi_slug=r.scpi_slug
 JOIN public.scpi_source_connectors host ON host.scpi_slug=r.scpi_slug
 JOIN public.scpi_bulletins b ON b.scpi_slug=r.scpi_slug AND b.period=r.last_document_period
 JOIN maximus_agents.scpi_bulletin_replay_documents d ON d.scpi_slug=r.scpi_slug
    AND d.source_period=r.last_document_period
    AND d.source_url=r.bulletin_url
 JOIN public.scpi_indicator_history h ON h.scpi_slug=r.scpi_slug AND h.source_period=r.last_document_period
 JOIN public.scpi_metric_certifications tof ON tof.scpi_slug=r.scpi_slug
    AND tof.source_period=r.last_document_period AND tof.metric='tof'
 WHERE r.scpi_slug='aestiam-horizon'
   AND r.last_document_period='2026-T3'
   AND r.verification_status='incomplete' AND r.confidence_level='high'
   AND r.last_error='Extraction existante partielle'
   AND r.bulletin_url=pdf_url
   AND r.source_domain='https://www.aestiam.com'
   AND r.official_scpi_page_url='https://www.aestiam.com/nos-scpi/aestiam-horizon/'
   AND v.crash_test_status='FAIL_STRICT' AND v.source_ready IS FALSE
   AND coalesce(v.quarterly_blockers,0)=0 AND coalesce(v.missing_tof,0)=0
   AND coalesce(v.uncertified_tof_periods,0)=0
   AND coalesce(v.source_host_violations,0)=0 AND coalesce(v.cap_consistency_issues,0)=0
   AND lower(split_part(split_part(pdf_url,'://',2),'/',1))=ANY(host.allowed_hosts)
   AND b.pdf_sha256=pdf_sha AND b.source_url=pdf_url
   AND d.pdf_sha256=pdf_sha AND d.status='extracted'
   AND d.processing_complete IS TRUE
   AND d.result->>'sha256'=pdf_sha
   AND d.result->>'identity_verified'='true'
   AND d.result->>'period_verified'='true'
   AND h.source_url=pdf_url AND h.source_confidence>=0.95
   AND h.qa_status='auto_verified_dual_pdf_fields'
   AND h.tof=87
   AND h.metric_provenance->'tof'->>'sha256'=pdf_sha
   AND h.metric_provenance->'tof'->>'source_page'='3'
   AND h.metric_provenance->'tof'->>'reference_date'='2026-09-30'
   AND tof.value_numeric=87 AND tof.source_page=3
   AND tof.source_url=pdf_url
   AND tof.extraction_confidence>=.95
   AND tof.verification_status='manual_verified_official_pdf_text_review'
   AND tof.verification_method='issuer_pdf_page_text_verified_against_TopAndTOF'
   AND tof.evidence_text LIKE '%TOF 87,00 % au 30/09/2026%'
   AND position(pdf_sha IN coalesce(tof.evidence_text,''))>0
   AND scpi_internal.tof_bulletin_source_rejection_reason(tof.scpi_slug,tof.source_url,tof.evidence_text,tof.verification_method,tof.verification_status) IS NULL
   AND NOT EXISTS (
      SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
      WHERE q.scpi_slug=r.scpi_slug AND q.source_period='2026-T3'
   )
   AND NOT EXISTS (
      SELECT 1 FROM public.scpi_metric_certifications c_bad
      WHERE c_bad.scpi_slug=r.scpi_slug AND c_bad.source_period='2026-T3'
        AND c_bad.verification_status LIKE 'invalid%'
   );
 IF proof_count<>1 THEN RAISE EXCEPTION 'RECOVERY183_ISSUER_PDF_TOF_PROOF_MISSING'; END IF;

 -- Five independent MuPDF+Poppler crosschecks of semantic metric+value+page
 -- and quarter/reference-date. The two valuation figures are explicitly
 -- dated 30/06/2026 in this T3 bulletin; do not move their observation date.
 SELECT count(*)::int INTO proof_count
 FROM public.scpi_metric_certifications c
 JOIN maximus_agents.scpi_bulletin_replay_documents d
  ON d.scpi_slug=c.scpi_slug AND d.source_period=c.source_period
  AND d.source_url=c.source_url AND d.status='extracted' AND d.pdf_sha256=pdf_sha
 JOIN public.scpi_indicator_history h ON h.scpi_slug=c.scpi_slug AND h.source_period=c.source_period
 WHERE c.scpi_slug='aestiam-horizon' AND c.source_period='2026-T3'
   AND c.source_url=pdf_url AND c.metric IN ('capitalisation','walt','walb','prix_reconstitution','valeur_realisation')
   AND c.verification_status='auto_verified_with_evidence'
   AND c.verification_method='pdf_page_text_match_dual_mupdf_poppler'
   AND c.extraction_confidence>=.95 AND c.source_page>0
   AND d.field_coverage->>c.metric='verified'
   AND d.result->'evidence'->c.metric->'independent_engines'='["MuPDF","Poppler"]'::jsonb
   AND d.result->'evidence'->c.metric->>'value_match'='true'
   AND d.result->'evidence'->c.metric->>'page'=c.source_page::text
   AND d.result->'evidence'->c.metric->>'reference_date'=
       CASE WHEN c.metric IN ('prix_reconstitution','valeur_realisation')
           THEN '2026-06-30' ELSE '2026-09-30' END
   AND h.metric_provenance->c.metric->>'sha256'=pdf_sha
   AND h.metric_provenance->c.metric->>'source_page'=c.source_page::text
   AND h.metric_provenance->c.metric->>'reference_date'=
       d.result->'evidence'->c.metric->>'reference_date'
   AND (d.result->'metrics'->>c.metric)::numeric=c.value_numeric
   AND (d.result->'evidence'->c.metric->>'value')::numeric=c.value_numeric
   AND (to_jsonb(h)->>c.metric)::numeric=c.value_numeric
   AND position(pdf_sha IN coalesce(c.evidence_text,''))>0;
 IF proof_count<>5 THEN RAISE EXCEPTION 'RECOVERY183_FIVE_INDEPENDENT_METRIC_CROSSCHECKS_MISSING'; END IF;

 UPDATE public.scpi_source_registry r
 SET verification_status='verified',confidence_level='high',last_error=NULL,
   issuer_source_sha256=pdf_sha,issuer_source_period='2026-T3',
   issuer_source_url=pdf_url,
   issuer_source_publisher_url='https://www.aestiam.com/nos-scpi/aestiam-horizon/',
   issuer_source_verified_at=now(),last_verified_at=now(),updated_at=now()
 WHERE r.scpi_slug='aestiam-horizon' AND r.last_document_period='2026-T3'
   AND r.bulletin_url=pdf_url AND r.verification_status='incomplete'
   AND r.confidence_level='high' AND r.last_error='Extraction existante partielle'
   AND r.issuer_source_sha256 IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'RECOVERY183_SOURCE_WRITE_RACE'; END IF;

 INSERT INTO public.scpi_ingestion_events(
   scpi_slug,status,step,message,source_page_url,bulletin_url,
   source_period,extraction_confidence,metrics_count,ended_at)
 VALUES(
  'aestiam-horizon','completed','recovery183_direct_issuer_sha_attested',
  'Source official PDF direct issuer host verified; before incomplete/high extraction partial, after verified/high source provenance only. SHA256='||pdf_sha||
  '; independently checked TOF 87% p3 plus five dual-reader metrics across p3 and p5; valuation dates remain 2026-06-30. No financial data changes or financial certifications added.',
  'https://www.aestiam.com/nos-scpi/aestiam-horizon/',pdf_url,
  '2026-T3',.98,6,now());
 RETURN jsonb_build_object('updated_sources',n,'funds',jsonb_build_array('aestiam-horizon'),
   'financial_value_changes',0,'financial_certifications_granted',0,'deploy_allowed',false,
   'issuer_source_sha256',pdf_sha,'semantic_qa_guard',true);
END
$func$;
REVOKE ALL ON FUNCTION maximus_agents.attest_aestiam_horizon_direct_issuer_v1()
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.attest_aestiam_horizon_direct_issuer_v1() IS
 'One-shot fail-closed Aestiam Horizon T3 provenance promotion. Requires exact issuer URL/SHA and a certified TOF plus five independent dual-reader field proofs; no financial edits.';
