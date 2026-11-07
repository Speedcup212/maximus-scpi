-- RECOVERY-154 / three exact issuer TOF values, existing replay with MuPDF+Poppler.
-- No fabricated human attestations or source-ready overrides.
DO $rec154$
DECLARE target RECORD;
 hist_row public.scpi_indicator_history%ROWTYPE;
 bulletin_row public.scpi_bulletins%ROWTYPE;
 replay_row maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 certificate_row public.scpi_metric_certifications%ROWTYPE;
 old_history jsonb; evidence jsonb; created_certificate_id uuid; changed integer;
BEGIN
 FOR target IN SELECT * FROM (VALUES
  ('epsicap-nano','2026-T3','10d640f8-bb57-4905-9bfb-3e0739f9f586','2fd87718-cd56-42d2-944d-c6acbf59113a','1f7efa004028d10758149d0dcd97677dc22ad679cf314768e0d682add4a4b3e7',2993073,97.98::numeric,5,'YTD_FROM_2026_01_01'),
  ('novapierre-1','2023-T4','b32ef53c-bc0c-424a-bf14-76c6da75570f','929fdd42-8298-4a49-83ea-8b46a3c0f454','7f51fa45155efeb66c59b1b395e2e80323c4092ac18c132ec23605bfc2dc2270',1895247,88.5::numeric,4,'QUARTER_END_2023_12_31'),
  ('novapierre-1','2024-T1','70c9911a-3b8a-4a20-8482-593b4b398f0a','c2ff7f39-603f-4bf6-be06-c99e9cab2f9e','728afae49db7ef2aee8639cd47afe4b37ed6c5652ad22c371e9df62aa6449887',3445546,87.4::numeric,4,'QUARTER_END_2024_03_31')
 ) AS t(slug,period,hid,bid,sha,bytes,tof,page_num,basis)
 LOOP
  SELECT * INTO STRICT hist_row FROM public.scpi_indicator_history AS h WHERE h.id=target.hid::uuid
   AND h.scpi_slug=target.slug AND h.source_period=target.period AND h.tof IS NULL
   AND h.source_confidence>=0.95 AND h.qa_status='auto_partial_review' FOR UPDATE;
  SELECT * INTO STRICT bulletin_row FROM public.scpi_bulletins AS b WHERE b.id=target.bid::uuid
   AND b.scpi_slug=target.slug AND b.period=target.period
   AND b.pdf_sha256=target.sha AND b.source_url=hist_row.source_url
   AND b.pdf_path=target.slug||'/'||target.period||'/'||target.sha||'.pdf';
  SELECT * INTO STRICT replay_row FROM maximus_agents.scpi_bulletin_replay_documents AS d
   WHERE d.bulletin_id=bulletin_row.id AND d.scpi_slug=target.slug AND d.source_period=target.period
   AND d.source_url=bulletin_row.source_url AND d.pdf_path=bulletin_row.pdf_path
   AND d.pdf_sha256=target.sha AND d.expected_sha256=target.sha
   AND d.status='extracted' AND d.processing_complete=true
   AND d.pages_read=d.page_count AND d.page_count>0
   AND d.field_coverage->>'tof'='verified'
   AND (d.metrics->>'tof')::numeric=target.tof
   AND (d.evidence->'tof'->>'value')::numeric=target.tof
   AND (d.evidence->'tof'->>'page')::integer=target.page_num
   AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
   AND d.evidence->'tof'->>'association'='adjacent_caption'
   AND d.evidence->'tof'->>'value_match'='true'
   AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
  IF NOT EXISTS(SELECT 1 FROM storage.objects AS o WHERE o.bucket_id='scpi-bulletins'
    AND o.name=bulletin_row.pdf_path AND (o.metadata->>'size')::bigint=target.bytes)
     THEN RAISE EXCEPTION 'REC154_WRONG_PRIVATE_ORIGINAL_ARCHIVE_%',target.slug; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors AS sc
    WHERE sc.scpi_slug=target.slug AND lower(split_part(split_part(bulletin_row.source_url,'://',2),'/',1))=ANY(sc.allowed_hosts))
     THEN RAISE EXCEPTION 'REC154_ISSUER_NOT_ALLOWED_%',target.slug; END IF;
  IF EXISTS(SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 AS q
    WHERE q.scpi_slug=target.slug AND q.source_period=target.period)
     THEN RAISE EXCEPTION 'REC154_HISTORIC_QUARANTINE_%',target.slug; END IF;
  IF EXISTS(SELECT 1 FROM public.scpi_metric_certifications AS mc
    WHERE mc.scpi_slug=target.slug AND mc.source_period=target.period AND mc.metric='tof')
     THEN RAISE EXCEPTION 'REC154_CONCURRENT_TOF_CERT_%',target.slug; END IF;
  old_history:=to_jsonb(hist_row);
  evidence:=jsonb_build_object('status','archived_dual_pdf_readers_verified',
   'slug',target.slug,'period',target.period,'source_url',bulletin_row.source_url,
   'sha256',target.sha,'original_bytes',target.bytes,
   'page',target.page_num,'tof',target.tof,'reporting_basis',target.basis,
   'replay_document_key',replay_row.document_key,'replay_tof_evidence',replay_row.evidence->'tof',
   'human_attestation',false,'financially_complete',false,'publication_authorized',false);
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
    VALUES('recovery154:'||target.slug||':'||target.period||':dual-original-tof',
      'Before image and replay MuPDF/Poppler official source proof; metric-specific not universal certification',
      jsonb_build_object('history_before',old_history,'bulletin',to_jsonb(bulletin_row),'replay',to_jsonb(replay_row),'proof',evidence))
  ON CONFLICT(event_key) DO NOTHING;
  INSERT INTO public.scpi_metric_certifications
   (scpi_slug,source_period,metric,value_numeric,value_text,unit,source_url,
    source_page,evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence)
  VALUES(target.slug,target.period,'tof',target.tof,replace(target.tof::text,'.',',')||' %','%',
   bulletin_row.source_url,target.page_num,
   'Original issuer quarterly PDF, page '||target.page_num||', TOF '||target.tof||
   ' %, reporting basis '||target.basis||'. Source SHA-256 '||target.sha||'. MuPDF text: '||
   (replay_row.evidence->'tof'->>'text')||'; Poppler: '||(replay_row.evidence->'tof'->>'poppler_text')||
   '. Dual geometry source evidence. Automatic source check, no human attestation.',
   bulletin_row.id,'auto_verified_with_evidence','issuer_pdf_dual_readers_source_bound_sha256',0.98)
  RETURNING id INTO created_certificate_id;
  SELECT * INTO STRICT certificate_row FROM public.scpi_metric_certifications AS mc
    WHERE mc.id=created_certificate_id;
  IF scpi_internal.tof_bulletin_source_rejection_reason(certificate_row.scpi_slug,
      certificate_row.source_url,certificate_row.evidence_text,
      certificate_row.verification_method,certificate_row.verification_status) IS NOT NULL
    THEN RAISE EXCEPTION 'REC154_TOF_POLICY_REJECTED_%',target.slug; END IF;
  UPDATE public.scpi_indicator_history AS ih SET tof=target.tof,
    qa_status='source_verified_dual_reader_tof',
    metric_provenance=jsonb_set(coalesce(ih.metric_provenance,'{}'::jsonb),'{tof}',
      jsonb_build_object('value',target.tof,'unit','%','sha256',target.sha,
       'document_period',target.period,'source_url',bulletin_row.source_url,
       'source_page',target.page_num,'basis',target.basis,
       'parser_engines',jsonb_build_array('MuPDF','Poppler'),'replay_document_key',replay_row.document_key,
       'human_attestation',false),true)
    WHERE ih.id=hist_row.id AND ih.tof IS NULL AND ih.qa_status=hist_row.qa_status
       AND ih.source_url=hist_row.source_url;
  GET DIAGNOSTICS changed=ROW_COUNT;
  IF changed<>1 THEN RAISE EXCEPTION 'REC154_HISTORY_CONCURRENT_CHANGE_%',target.slug; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.scpi_indicator_history AS ih
    WHERE ih.id=hist_row.id AND ih.tof=target.tof
    AND ih.metric_provenance->'tof'->>'sha256'=target.sha
    AND to_jsonb(ih)-ARRAY['tof','qa_status','metric_provenance']
      IS NOT DISTINCT FROM old_history-ARRAY['tof','qa_status','metric_provenance'])
      THEN RAISE EXCEPTION 'REC154_UNRELATED_HISTORY_FIELDS_CHANGED_%',target.slug; END IF;
 END LOOP;
END $rec154$;