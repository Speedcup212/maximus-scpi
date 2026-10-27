CREATE OR REPLACE FUNCTION public.scpi_corum_record_document(p_doc jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
 slug text:=p_doc->>'slug'; doc_period text:=p_doc->>'period'; url text:=p_doc->>'url';
 state text:=p_doc->>'status'; sha text:=p_doc->>'sha256'; kind text:=p_doc->>'kind';
 metric_key text; val numeric; h public.scpi_indicator_history%ROWTYPE; b_id uuid; duplicate_url text;
 proof jsonb; result_status text; already boolean; certified_metrics integer;
BEGIN
 IF coalesce(slug,'') NOT IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
    OR coalesce(url,'') !~ '^https://(www\.)?corum\.fr/sites/default/files/'
    OR coalesce(doc_period,'') !~ '^20[0-9]{2}-(T[1-4]|RA)$'
    OR coalesce(kind,'') NOT IN ('annual_report','quarterly_bulletin')
    OR coalesce(state,'') NOT IN ('source_verified','certified_core','partial_review','ocr_pending','rejected','retry')
    OR coalesce(p_doc->>'parser_version','') NOT LIKE 'corum-dual-pdf-%' THEN
   RAISE EXCEPTION 'CORUM_DOCUMENT_INVALID_ENVELOPE';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(slug||':'||doc_period,0));
 IF state IN ('source_verified','certified_core') AND
    (coalesce(sha,'') !~ '^[0-9a-f]{64}$' OR coalesce((p_doc->>'identity_verified')::boolean,false) IS NOT TRUE
       OR coalesce((p_doc->>'period_verified')::boolean,false) IS NOT TRUE) THEN
    RAISE EXCEPTION 'CORUM_DOCUMENT_MISSING_IDENTITY_PERIOD_HASH';
 END IF;
 -- Reuse prior financial QA ONLY for the exact current PDF bytes and pages.
 -- OCR recovery is not falsely described as two native text extractions.
 IF state='ocr_pending' AND kind='quarterly_bulletin'
   AND coalesce(sha,'') ~ '^[0-9a-f]{64}$'
   AND coalesce((p_doc->>'identity_verified')::boolean,false)
   AND coalesce((p_doc->>'period_verified')::boolean,false) THEN
  SELECT count(DISTINCT c.metric) INTO certified_metrics
  FROM public.scpi_metric_certifications c
  JOIN public.scpi_indicator_history existing_h ON existing_h.scpi_slug=c.scpi_slug AND existing_h.source_period=c.source_period
  WHERE c.scpi_slug=slug AND c.source_period=doc_period AND c.source_url=url
   AND c.metric IN ('tof','nombre_parts','parts_attente_retrait')
   AND c.verification_status LIKE 'manual_verified_official%'
   AND c.source_page>0 AND position(sha IN coalesce(c.evidence_text,''))>0
   AND existing_h.source_url=url AND existing_h.source_confidence>=0.95
   AND coalesce(existing_h.qa_status,'') NOT LIKE 'invalid%'
   AND c.value_numeric=(to_jsonb(existing_h)->>c.metric)::numeric;
  IF certified_metrics=3 THEN
   state:='certified_core_existing';
   p_doc:=p_doc||jsonb_build_object('qa_resolution','existing_manual_certificates_identical_pdf_sha256_exact_pages','resolved_metrics',3);
   UPDATE public.scpi_indicator_history SET qa_status='manual_verified_official_existing_sha_core'
    WHERE scpi_slug=slug AND source_period=doc_period AND coalesce(qa_status,'') NOT LIKE 'invalid%';
  END IF;
 END IF;
 IF state='certified_core' THEN
  IF kind<>'quarterly_bulletin' OR (substring(doc_period,1,4)::integer*4+right(doc_period,1)::integer)>
       (extract(year from current_date)::integer*4+extract(quarter from current_date)::integer) THEN
    RAISE EXCEPTION 'CORUM_DOCUMENT_BAD_QUARTER';
  END IF;
  FOREACH metric_key IN ARRAY ARRAY['tof','nombre_parts','parts_attente_retrait'] LOOP
   proof:=p_doc->'evidence'->metric_key;
   IF jsonb_typeof(p_doc->'metrics'->metric_key) IS DISTINCT FROM 'number'
      OR coalesce((proof->>'page')::integer,0)<1
      OR length(coalesce(proof->>'text',''))<3
      OR length(coalesce(proof->>'poppler_text',''))<3
      OR proof->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb THEN
      RAISE EXCEPTION 'CORUM_DOCUMENT_MISSING_DUAL_PROOF %',metric_key;
   END IF;
  END LOOP;
  IF (p_doc->'metrics'->>'tof')::numeric NOT BETWEEN 50 AND 100
     OR (p_doc->'metrics'->>'nombre_parts')::numeric<=0
     OR (p_doc->'metrics'->>'parts_attente_retrait')::numeric<0
     OR (p_doc->'metrics'->>'parts_attente_retrait')::numeric>(p_doc->'metrics'->>'nombre_parts')::numeric THEN
     RAISE EXCEPTION 'CORUM_DOCUMENT_FINANCIAL_CONTRADICTION';
  END IF;
  SELECT * INTO h FROM public.scpi_indicator_history WHERE scpi_slug=slug AND source_period=doc_period;
  IF h.id IS NOT NULL THEN
   FOREACH metric_key IN ARRAY ARRAY['tof','nombre_parts','parts_attente_retrait'] LOOP
    val:=(p_doc->'metrics'->>metric_key)::numeric;
    IF (to_jsonb(h)->>metric_key) IS NOT NULL AND abs((to_jsonb(h)->>metric_key)::numeric-val)>0.00001 THEN
     state:='partial_review';p_doc:=jsonb_set(p_doc,'{anomalies}',coalesce(p_doc->'anomalies','[]')||to_jsonb('existing_history_conflict:'||metric_key));
    END IF;
   END LOOP;
  END IF;
 END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_corum_document_runs
   WHERE scpi_slug=slug AND source_url=url AND status IN ('certified_core','certified_core_existing')
   AND (state NOT IN ('certified_core','certified_core_existing') OR pdf_sha256 IS DISTINCT FROM sha)) THEN
  UPDATE maximus_agents.scpi_corum_document_runs SET attempts=attempts+1,checked_at=now(),
    payload=payload||jsonb_build_object('last_rejected_attempt',p_doc)
   WHERE scpi_slug=slug AND source_url=url;
  INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,bulletin_url,source_period,ended_at)
   VALUES(slug,'needs_review','corum_protected_document_regression','Certified PDF evidence retained; incoming state='||state,url,doc_period,now());
  RETURN jsonb_build_object('ok',true,'status','protected_certified_document','period',doc_period);
 END IF;
 SELECT source_url INTO duplicate_url FROM maximus_agents.scpi_corum_document_runs
  WHERE scpi_slug=slug AND source_period=doc_period AND pdf_sha256=sha AND source_url<>url
    AND status IN ('source_verified','certified_core','certified_core_existing') LIMIT 1;
 SELECT EXISTS(SELECT 1 FROM maximus_agents.scpi_corum_document_runs
   WHERE scpi_slug=slug AND source_url=url AND pdf_sha256=sha AND status=state
     AND parser_version=p_doc->>'parser_version') INTO already;
 IF already THEN PERFORM public.scpi_apply_extended_bulletin_metrics(p_doc); RETURN jsonb_build_object('ok',true,'status','unchanged','period',doc_period); END IF;
 INSERT INTO maximus_agents.scpi_corum_document_runs(scpi_slug,source_url,source_period,document_kind,pdf_sha256,status,parser_version,payload)
 VALUES(slug,url,doc_period,kind,sha,CASE WHEN duplicate_url IS NULL THEN state ELSE 'duplicate_sha256' END,p_doc->>'parser_version',p_doc)
 ON CONFLICT(scpi_slug,source_url) DO UPDATE SET pdf_sha256=excluded.pdf_sha256,status=excluded.status,
   payload=excluded.payload,parser_version=excluded.parser_version,attempts=scpi_corum_document_runs.attempts+1,checked_at=now();
 IF duplicate_url IS NOT NULL THEN RETURN jsonb_build_object('ok',true,'status','duplicate_sha256','canonical_url',duplicate_url); END IF;
 IF state='certified_core' THEN
  INSERT INTO public.scpi_bulletins(scpi_slug,period,pdf_sha256,source_url,run_id,found_at,processed_at,qa_status,extraction_confidence,extraction_json)
  VALUES(slug,doc_period,sha,url,p_doc->>'parser_version',now(),now(),'auto_verified_dual_pdf_evidence',0.98,
    jsonb_build_object('metrics',p_doc->'metrics','evidence',p_doc->'evidence','parser_version',p_doc->>'parser_version','evidence_version','2026-09-30-v1-page-proof'))
  ON CONFLICT(scpi_slug,period) DO UPDATE SET
   pdf_sha256=coalesce(scpi_bulletins.pdf_sha256,excluded.pdf_sha256)
  RETURNING id INTO b_id;
  FOREACH metric_key IN ARRAY ARRAY['tof','nombre_parts','parts_attente_retrait'] LOOP
   proof:=p_doc->'evidence'->metric_key;
   INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence)
   VALUES(slug,doc_period,metric_key,(p_doc->'metrics'->>metric_key)::numeric,proof->>'unit',url,(proof->>'page')::integer,
     'SHA256='||sha||'; period='||doc_period||'; MuPDF='||(proof->>'text')||'; Poppler='||(proof->>'poppler_text'),b_id,'auto_verified_with_evidence','pdf_page_text_match_dual_mupdf_poppler',0.98)
   ON CONFLICT(scpi_slug,source_period,metric) DO UPDATE SET
     value_numeric=excluded.value_numeric,unit=excluded.unit,source_url=excluded.source_url,source_page=excluded.source_page,
     evidence_text=excluded.evidence_text,verification_status=excluded.verification_status,verification_method=excluded.verification_method,
     extraction_confidence=excluded.extraction_confidence,verified_at=now()
   WHERE scpi_metric_certifications.verification_status NOT LIKE 'manual_verified%';
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.scpi_indicator_history WHERE scpi_slug=slug AND source_period=doc_period) THEN
   UPDATE public.scpi_indicator_history SET tof=(p_doc->'metrics'->>'tof')::numeric,
    nombre_parts=(p_doc->'metrics'->>'nombre_parts')::bigint,
    parts_attente_retrait=(p_doc->'metrics'->>'parts_attente_retrait')::bigint,
    liquidity_basis='withdrawal_queue',source_confidence=greatest(source_confidence,0.98)
   WHERE scpi_slug=slug AND source_period=doc_period;
  ELSE
  INSERT INTO public.scpi_indicator_history(scpi_slug,snapshot_at,source_period,source_type,source_document,source_url,tof,nombre_parts,parts_attente_retrait,capital_type,liquidity_basis,qa_status,source_confidence)
  VALUES(slug,now(),doc_period,'official_bulletin_historical','Official CORUM PDF, dual MuPDF/Poppler page proofs SHA256='||sha,url,
   (p_doc->'metrics'->>'tof')::numeric,(p_doc->'metrics'->>'nombre_parts')::bigint,(p_doc->'metrics'->>'parts_attente_retrait')::bigint,
   'variable','withdrawal_queue','auto_verified_dual_pdf_evidence',0.98)
  ON CONFLICT(scpi_slug,source_period) DO UPDATE SET
   tof=excluded.tof,nombre_parts=excluded.nombre_parts,parts_attente_retrait=excluded.parts_attente_retrait,
   liquidity_basis=excluded.liquidity_basis,
   qa_status=CASE WHEN scpi_indicator_history.qa_status LIKE 'manual_verified%' OR scpi_indicator_history.qa_status='verified' THEN scpi_indicator_history.qa_status ELSE excluded.qa_status END,
   source_confidence=greatest(scpi_indicator_history.source_confidence,excluded.source_confidence);
  END IF;
 END IF;
 IF kind='annual_report' AND state='source_verified' THEN
  IF EXISTS(SELECT 1 FROM public.scpi_annual_reports WHERE scpi_slug=slug AND source_url=url AND source_sha256 IS NOT NULL AND source_sha256<>sha) THEN
   RAISE EXCEPTION 'CORUM_ANNUAL_HASH_CHANGED_REVIEW_REQUIRED';
  END IF;
  UPDATE public.scpi_annual_reports SET source_sha256=sha,
   extraction_json=coalesce(extraction_json,'{}')||jsonb_build_object('document_validation',jsonb_build_object('sha256',sha,'parser_version',p_doc->>'parser_version','page_count',p_doc->'page_count','identity_verified',true,'period_verified',true)),updated_at=now()
  WHERE scpi_slug=slug AND source_url=url;
 END IF;
 IF kind='quarterly_bulletin' THEN
  INSERT INTO public.scpi_backfill_queue(scpi_slug,source_period,source_kind,status,source_url,source_document,verification_status,last_error,priority)
  VALUES(slug,doc_period,'bulletin',CASE WHEN state IN ('certified_core','certified_core_existing') THEN 'already_loaded' ELSE 'qa_review' END,url,
   'Official CORUM archive: '||doc_period,CASE WHEN state IN ('certified_core','certified_core_existing') THEN 'dual_pdf_page_evidence_verified' ELSE 'needs_review' END,
   CASE WHEN state IN ('certified_core','certified_core_existing') THEN NULL ELSE (p_doc->'anomalies')::text END,50)
  ON CONFLICT(scpi_slug,source_period,source_kind) DO UPDATE SET
   status=CASE WHEN scpi_backfill_queue.status='already_loaded' THEN scpi_backfill_queue.status ELSE excluded.status END,
   last_error=CASE WHEN scpi_backfill_queue.status='already_loaded' THEN scpi_backfill_queue.last_error ELSE excluded.last_error END,
   updated_at=now();
 END IF;
 INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,source_page_url,bulletin_url,source_period,metrics_count,ended_at)
 VALUES(slug,CASE WHEN state IN ('certified_core','certified_core_existing') THEN 'updated' WHEN state='source_verified' THEN 'source_verified' ELSE 'needs_review' END,
  'corum_dual_pdf_archive',state||'; sha256='||coalesce(sha,'none')||'; anomalies='||coalesce((p_doc->'anomalies')::text,'[]'),
  p_doc->>'index_url',url,doc_period,(select count(*) from jsonb_object_keys(coalesce(p_doc->'metrics','{}'))),now());
 PERFORM public.scpi_apply_extended_bulletin_metrics(p_doc);
 RETURN jsonb_build_object('ok',true,'status',state,'period',doc_period);
END;
$function$
;
