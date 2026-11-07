
-- RECOVERY-151. PDF binaries read from PRIVATE issuer archive via existing GitHub OIDC.
-- Source QA GH run 42401051091 / artifact 13585154053, double-reader exact SHA+coordinates.
-- Preserve historical quarantines, source status and all unrelated financial fields.
DO $r151$
DECLARE s record; h public.scpi_indicator_history%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE; c public.scpi_metric_certifications%ROWTYPE;
 c_id uuid; ev jsonb; n integer; updated public.scpi_indicator_history%ROWTYPE;
BEGIN
 FOR s IN SELECT * FROM (VALUES
 ('paref-evo','2024-T4','5a4103c5-3bd9-467e-b443-2ca980c3cb77','f7a5804c-de76-4dc5-a971-0d8be9228b6a',
 'c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9',
 'https://paref-gestion.com/wp-content/uploads/2025/04/05c7e184-d5e4-4cdd-bf9f-7ee2c008b217-BTI-T4-2024-PAREF-Evo.pdf',
 94.4::numeric,4,2171159,77.30::numeric,167.25::numeric,108.37::numeric,183.96::numeric,'2024-12-31'),
 ('paref-hexa','2026-T3','6ab11df7-01c2-47c6-bf77-8c017829fe66','16a0761a-83d0-4325-94a0-19b4af0cb131',
 'ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce',
 'https://paref-gestion.com/wp-content/uploads/2026/10/dc0cd675-deb0-4ab0-b928-040f9aafd157-BTI-T3-2026-PAREF-Hexa.pdf',
 84.5::numeric,5,1775561,75.69::numeric,327.38::numeric,107.28::numeric,345.53::numeric,'2026-09-30')
 ) t(slug,period,h_id,b_id,sha,url,value,pg,bytes,x1,y1,x2,y2,refdate)
 LOOP
  SELECT * INTO STRICT h FROM public.scpi_indicator_history
    WHERE id=s.h_id::uuid AND scpi_slug=s.slug AND source_period=s.period AND source_url=s.url
      AND tof IS NULL AND qa_status='auto_partial_review' AND source_confidence=0.98 FOR UPDATE;
  SELECT * INTO STRICT b FROM public.scpi_bulletins
    WHERE id=s.b_id::uuid AND scpi_slug=s.slug AND period=s.period
      AND source_url=s.url AND pdf_sha256=s.sha
      AND pdf_path=s.slug||'/'||s.period||'/'||s.sha||'.pdf';
  IF NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
       AND o.name=b.pdf_path AND (o.metadata->>'size')::bigint=s.bytes) THEN
     RAISE EXCEPTION 'PAREF_ORIGINAL_ARCHIVE_NOT_PRESENT_%',s.slug; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors k WHERE k.scpi_slug=s.slug
     AND 'paref-gestion.com'=ANY(k.allowed_hosts)) THEN RAISE EXCEPTION 'PAREF_ISSUER_NOT_ALLOWED_%',s.slug; END IF;
  IF EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
     WHERE q.scpi_slug=s.slug AND q.source_period=s.period) THEN
     RAISE EXCEPTION 'PAREF_PERIOD_IN_QUARANTINE_%',s.slug; END IF;
  IF s.slug='paref-evo' THEN
    IF EXISTS (SELECT 1 FROM public.scpi_metric_certifications m WHERE m.scpi_slug=s.slug
     AND m.source_period=s.period AND m.metric='tof') THEN
       RAISE EXCEPTION 'PAREF_TOF_CERT_CONCURRENCY_%',s.slug; END IF;
    INSERT INTO public.scpi_metric_certifications
      (scpi_slug,source_period,metric,value_numeric,value_text,unit,source_url,source_page,
       evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence)
    VALUES(s.slug,s.period,'tof',s.value,'94,4 %','%',s.url,s.pg,
      'TOF financier global 94,4 % du bulletin officiel PAREF Evo T4 2024, p.4, et non les 78,3 % de locaux occupes ni 5,6 % de locaux vacants. SHA256 c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9, original prive 2171159 octets. Double lecture MuPDF/Poppler du mot 94,4 x77.30 y167.25. GitHub Actions 42401051091 / artifact 13585154053. Aucune attestation humaine.',
      b.id,'auto_verified_with_evidence','pdf_page_dual_reader_private_original_sha',0.98)
    RETURNING id INTO c_id;
  ELSE
    SELECT id INTO STRICT c_id FROM public.scpi_metric_certifications
      WHERE id='c84b0bd5-2b30-4dad-8141-63f960d947f4'::uuid
        AND scpi_slug=s.slug AND source_period=s.period AND metric='tof' AND value_numeric=s.value
        AND source_url=s.url AND source_page=s.pg AND bulletin_id=b.id
        AND verification_status='auto_verified_with_evidence' AND extraction_confidence>=0.95;
  END IF;
  SELECT * INTO STRICT c FROM public.scpi_metric_certifications WHERE id=c_id;
  IF scpi_internal.tof_bulletin_source_rejection_reason(
     c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NOT NULL THEN
     RAISE EXCEPTION 'PAREF_SOURCE_FINANCIAL_POLICY_REJECTED_%',s.slug; END IF;
  ev:=jsonb_build_object(
   'status','issuer_binary_verified_candidate_geometry','slug',s.slug,'period',s.period,'sha256',s.sha,
   'source_page',s.pg,'tof_candidate_percent',s.value,'original_archive_bytes',s.bytes,'original_issuer_url',s.url,
   'readers',jsonb_build_array('MuPDF','Poppler'),
   'same_numeric_word_coordinates',true,
   'mupdf_target_box',jsonb_build_array(s.x1,s.y1,s.x2,s.y2),
   'poppler_target_box',jsonb_build_array(s.x1,s.y1,s.x2,s.y2),
   'workflow_reference','github-actions:42401051091','artifact_id','13585154053',
   'fund_period_verified',true,'human_attestation',false,'publication_authorized',false);
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
    VALUES('recovery151:'||s.slug||':'||s.period||':verified_archived_tof',
     'Historical before-image and independent source QA proof; no human attestation asserted',
     jsonb_build_object('before_history',to_jsonb(h),'original_bulletin',to_jsonb(b),
       'certificate',to_jsonb(c),'proof',ev));
  INSERT INTO maximus_agents.scpi_independent_tof_geometry_proofs
     (certificate_id,scpi_slug,source_period,source_url,pdf_sha256,value_percent,
      source_page,pdf_byte_size,workflow_reference,artifact_id,detailed_evidence,human_attestation)
  VALUES(c_id,s.slug,s.period,s.url,s.sha,s.value,s.pg,s.bytes,
      'github-actions:42401051091','13585154053',ev,false);
  UPDATE public.scpi_indicator_history hi SET
    tof=s.value,qa_status='source_verified_independent_paref_archive',
    metric_provenance=jsonb_set(COALESCE(hi.metric_provenance,'{}'::jsonb),'{tof}',
      jsonb_build_object('value',s.value,'unit','%','definition','issuer_reported_tof_total',
       'source_url',s.url,'source_page',s.pg,'sha256',s.sha,'document_period',s.period,
       'reference_date',s.refdate,'workflow_reference','github-actions:42401051091',
       'artifact_id','13585154053','human_attestation',false),true)
   WHERE hi.id=h.id AND hi.tof IS NULL AND hi.qa_status=h.qa_status AND hi.source_url=h.source_url;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'PAREF_HISTORY_NOT_UNIQUE_%',s.slug; END IF;
  SELECT * INTO STRICT updated FROM public.scpi_indicator_history WHERE id=h.id;
  IF updated.tof IS DISTINCT FROM s.value OR updated.qa_status<>'source_verified_independent_paref_archive'
    OR to_jsonb(updated)-ARRAY['tof','qa_status','metric_provenance']
         IS DISTINCT FROM to_jsonb(h)-ARRAY['tof','qa_status','metric_provenance']
  THEN RAISE EXCEPTION 'PAREF_UNRELATED_HISTORY_MUTATION_%',s.slug; END IF;
 END LOOP;
END $r151$;

CREATE OR REPLACE FUNCTION scpi_internal.paref_archive_tof_proof_valid(
 p_slug text,p_period text,p_value numeric,p_page integer)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO ''
AS $r151_proof$
 SELECT COALESCE(EXISTS (
 SELECT 1 FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
 JOIN public.scpi_bulletins b ON b.scpi_slug=ev.scpi_slug AND b.period=ev.source_period
   AND b.source_url=ev.source_url AND b.pdf_sha256=ev.pdf_sha256
 JOIN storage.objects o ON o.bucket_id='scpi-bulletins' AND o.name=b.pdf_path
 JOIN public.scpi_metric_certifications c ON c.id=ev.certificate_id AND c.bulletin_id=b.id
   AND c.scpi_slug=ev.scpi_slug AND c.source_period=ev.source_period
   AND c.source_url=ev.source_url AND c.metric='tof' AND c.source_page=ev.source_page
   AND c.value_numeric=ev.value_percent
 JOIN public.scpi_indicator_history h ON h.scpi_slug=ev.scpi_slug
   AND h.source_period=ev.source_period AND h.source_url=ev.source_url
 WHERE ev.scpi_slug=p_slug AND ev.source_period=p_period
   AND ev.value_percent=p_value AND ev.source_page=p_page
   AND ((ev.scpi_slug='paref-evo' AND ev.source_period='2024-T4'
     AND ev.pdf_sha256='c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9'
     AND ev.value_percent=94.4 AND ev.source_page=4 AND ev.pdf_byte_size=2171159)
    OR (ev.scpi_slug='paref-hexa' AND ev.source_period='2026-T3'
     AND ev.pdf_sha256='ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce'
     AND ev.value_percent=84.5 AND ev.source_page=5 AND ev.pdf_byte_size=1775561))
   AND b.pdf_path=ev.scpi_slug||'/'||ev.source_period||'/'||ev.pdf_sha256||'.pdf'
   AND (o.metadata->>'size')::bigint=ev.pdf_byte_size
   AND ev.workflow_reference='github-actions:42401051091'
   AND ev.artifact_id='13585154053' AND ev.human_attestation=false
   AND ev.detailed_evidence->>'status'='issuer_binary_verified_candidate_geometry'
   AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
   AND (ev.detailed_evidence->>'source_page')::integer=ev.source_page
   AND (ev.detailed_evidence->>'original_archive_bytes')::bigint=ev.pdf_byte_size
   AND ev.detailed_evidence->>'fund_period_verified'='true'
   AND ev.detailed_evidence->>'same_numeric_word_coordinates'='true'
   AND ev.detailed_evidence->>'human_attestation'='false'
   AND ev.detailed_evidence->>'publication_authorized'='false'
   AND ev.detailed_evidence->'readers'='["MuPDF","Poppler"]'::jsonb
   AND ev.detailed_evidence->'mupdf_target_box'=ev.detailed_evidence->'poppler_target_box'
   AND h.tof=ev.value_percent AND h.qa_status='source_verified_independent_paref_archive'
   AND h.source_confidence>=0.95 AND h.metric_provenance->'tof'->>'sha256'=ev.pdf_sha256
   AND (h.metric_provenance->'tof'->>'source_page')::integer=ev.source_page
   AND h.metric_provenance->'tof'->>'human_attestation'='false'
   AND c.verification_status='auto_verified_with_evidence'
   AND c.extraction_confidence>=0.95
   AND scpi_internal.tof_bulletin_source_rejection_reason(
      c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
 ),false)
$r151_proof$;
REVOKE ALL ON FUNCTION scpi_internal.paref_archive_tof_proof_valid(text,text,numeric,integer)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.paref_archive_tof_proof_valid(text,text,numeric,integer)
 TO service_role;

DO $r151_view$
DECLARE original text; needle text:='THEN ''PASS_100''::text'; n integer;
BEGIN
 original:=pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true);
 n:=(length(original)-length(replace(original,needle,'')))/length(needle);
 IF n<>1 OR position('scpi_internal.paref_archive_tof_proof_valid' IN original)>0
 THEN RAISE EXCEPTION 'PAREF_VIEW_UNEXPECTED_CHANGE'; END IF;
 PERFORM set_config('search_path','public,scpi_internal,maximus_agents,pg_catalog',true);
 EXECUTE 'CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS '||
   replace(original,needle,
    'AND (b.scpi_slug <> ''paref-evo'' OR scpi_internal.paref_archive_tof_proof_valid(''paref-evo'',''2024-T4'',94.4,4)) '||
    'AND (b.scpi_slug <> ''paref-hexa'' OR scpi_internal.paref_archive_tof_proof_valid(''paref-hexa'',''2026-T3'',84.5,5)) '||needle);
END $r151_view$;
