CREATE OR REPLACE FUNCTION scpi_internal.recertify_quarantined_tof_issuer_pdf(
 p_slug text,p_period text,p_value numeric,p_source_url text,
 p_source_page integer,p_sha256 text,p_evidence text)
 RETURNS text LANGUAGE plpgsql SET search_path TO '' AS $fn$
DECLARE a record; c record; b record; n integer; cutoff text;
BEGIN
 IF p_slug IS NULL OR p_source_page<=0 OR p_source_page IS NULL
 OR p_sha256 !~ '^[a-f0-9]{64}$' OR p_evidence IS NULL OR length(p_evidence)<20
 OR p_evidence !~* '(TOF|taux[[:space:]]+d.{0,3}occupation[[:space:]]+financier)'
 THEN RAISE EXCEPTION 'Missing explicit official TOF proof'; END IF;
 IF scpi_internal.tof_bulletin_source_rejection_reason(
   p_slug,p_source_url,p_evidence,'issuer_pdf_explicit_TOF_label',
   'manual_verified_official_pdf_text_review') IS NOT NULL
 THEN RAISE EXCEPTION 'Disallowed source or label'; END IF;
 SELECT * INTO a FROM scpi_internal.tof_policy_quarantine_audit_20261028
 WHERE scpi_slug=p_slug AND source_period=p_period;
 IF a.certificate_id IS NULL OR (a.original_certification->>'value_numeric')::numeric IS DISTINCT FROM p_value
 OR a.original_certification->>'source_url' IS DISTINCT FROM p_source_url
 THEN RAISE EXCEPTION 'Original backup does not match claimed metric'; END IF;
 SELECT * INTO c FROM public.scpi_metric_certifications WHERE id=a.certificate_id
   AND scpi_slug=p_slug AND source_period=p_period AND metric='tof' AND source_url=p_source_url;
 IF c.id IS NULL OR c.verification_status NOT IN (
   'invalid_tof_bulletin_source_policy','manual_verified_official_pdf_text_review')
 THEN RAISE EXCEPTION 'Current certificate identity differs'; END IF;
 IF c.verification_status='invalid_tof_bulletin_source_policy' THEN
 UPDATE public.scpi_metric_certifications SET value_numeric=p_value,unit='%',
 source_page=p_source_page,
 evidence_text='Bulletin de la SCPI publié sur le site émetteur, page '||p_source_page||
 ' trimestre '||p_period||': '||p_evidence||' SHA256 '||p_sha256,
 verification_status='manual_verified_official_pdf_text_review',
 verification_method='issuer_pdf_explicit_TOF_label',extraction_confidence=.98,verified_at=now()
 WHERE id=c.id AND verification_status='invalid_tof_bulletin_source_policy';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_metric_certifications
  WHERE id=c.id AND verification_status='manual_verified_official_pdf_text_review'
    AND value_numeric=p_value)
 THEN RAISE EXCEPTION 'Source policy trigger did not accept proof'; END IF;
 IF a.original_history IS NOT NULL THEN
 UPDATE public.scpi_indicator_history h SET tof=p_value,
  qa_status='manual_verified_official_pdf_recertified',
  source_confidence=.98,
  metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)||
    jsonb_build_object('tof',jsonb_build_object(
     'value',p_value,'unit','%','source_page',p_source_page,
     'document_period',p_period,'source_url',p_source_url,
     'sha256',p_sha256,'verification','issuer_official_pdf_explicit_TOF'),
     'tof_policy',jsonb_build_object('recertified_at',now()::text,
       'previous_backup','scpi_internal.tof_policy_quarantine_audit_20261028'))
 WHERE h.scpi_slug=p_slug AND h.source_period=p_period
   AND h.tof IS NULL AND h.qa_status='invalid_tof_bulletin_source_policy'
   AND h.source_url=p_source_url;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN
  IF NOT EXISTS (SELECT 1 FROM public.scpi_indicator_history
   WHERE scpi_slug=p_slug AND source_period=p_period AND tof=p_value
     AND qa_status='manual_verified_official_pdf_recertified')
  THEN RAISE EXCEPTION 'History remains invalid'; END IF;
 END IF;
 END IF;
 SELECT * INTO b FROM public.scpi_bulletins
 WHERE scpi_slug=p_slug AND period=p_period AND source_url=p_source_url AND pdf_sha256=p_sha256;
 IF b.id IS NOT NULL THEN
  UPDATE public.scpi_bulletins SET extraction_json=jsonb_set(
   jsonb_set(coalesce(extraction_json,'{}'::jsonb),'{metrics,tof}',to_jsonb(p_value),true),
   '{evidence,tof}',jsonb_build_object('value',p_value,'unit','%','page',p_source_page,
    'text',p_evidence,'method','issuer_pdf_manual_TOF_label','sha256',p_sha256),true)
  WHERE id=b.id;
 END IF;
 INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,bulletin_url,source_period,ended_at)
 VALUES(p_slug,'updated','issuer_tof_manual_recertification',
 'Issuer bulletin TOF '||p_value||'% page '||p_source_page||' SHA256 '||p_sha256,
 p_source_url,p_period,now());
 RETURN 'TOF_OFFICIAL_RECERTIFIED';
END $fn$;
REVOKE EXECUTE ON FUNCTION scpi_internal.recertify_quarantined_tof_issuer_pdf(text,text,numeric,text,integer,text,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.recertify_quarantined_tof_issuer_pdf(text,text,numeric,text,integer,text,text)
 TO service_role;