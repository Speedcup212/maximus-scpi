BEGIN;
ALTER TABLE public.scpi_indicator_history ADD COLUMN IF NOT EXISTS metric_provenance jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.scpi_indicators ADD COLUMN IF NOT EXISTS metric_provenance jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE OR REPLACE FUNCTION public.scpi_apply_extended_bulletin_metrics(doc jsonb)
RETURNS void LANGUAGE plpgsql SET search_path='' AS $fn$
DECLARE
 slug text:=doc->>'slug'; doc_period text:=doc->>'period'; sha text:=doc->>'sha256';
 k text; val numeric; proof jsonb; refdate date; enddate date;
 patch jsonb:='{}'; provenance jsonb:='{}'; item jsonb; b public.scpi_bulletins%ROWTYPE; i public.scpi_indicators%ROWTYPE;
 allowed text[]:=ARRAY['prix_souscription','prix_reconstitution','valeur_realisation','prix_retrait','distribution_par_part','capitalisation','nombre_immeubles','nombre_locataires','nombre_associes','walb','walt','endettement','collecte_nette','retraits_executes_trimestre'];
BEGIN
 IF doc->>'status'<>'certified_core' OR doc->>'parser_version' NOT LIKE 'corum-dual-pdf-%-extended' THEN RETURN; END IF;
 IF slug NOT IN ('corum-origin','corum-xl','corum-eurion','corum-usa') OR doc_period !~ '^20[0-9]{2}-T[1-4]$' THEN RAISE EXCEPTION 'EXTENDED_INVALID_DOCUMENT'; END IF;
 SELECT * INTO STRICT b FROM public.scpi_bulletins WHERE scpi_slug=slug AND public.scpi_bulletins.period=doc_period;
 IF b.pdf_sha256 IS DISTINCT FROM sha OR b.source_url IS DISTINCT FROM doc->>'url' THEN RAISE EXCEPTION 'EXTENDED_PDF_HASH_OR_URL_MISMATCH'; END IF;
 enddate:=(make_date(left(doc_period,4)::int,right(doc_period,1)::int*3,1)+interval '1 month -1 day')::date;
 FOR k IN SELECT jsonb_object_keys(coalesce(doc->'extended_metrics','{}')) LOOP
  IF NOT k=ANY(allowed) THEN RAISE EXCEPTION 'EXTENDED_UNAPPROVED_FIELD %',k; END IF;
  val:=(doc->'extended_metrics'->>k)::numeric; proof:=doc->'extended_evidence'->k;
  refdate:=(proof->>'reference_date')::date;
  IF val IS NULL OR val<0 OR refdate IS NULL OR refdate>enddate OR (proof->>'page')::int NOT BETWEEN 1 AND 240
   OR proof->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb
   OR length(coalesce(proof->>'text',''))<5 OR length(coalesce(proof->>'poppler_text',''))<5
   OR (proof->>'value')::numeric IS DISTINCT FROM val OR coalesce(proof->>'unit','')='' THEN RAISE EXCEPTION 'EXTENDED_MISSING_DUAL_DATED_PROOF %',k; END IF;
  IF k IN ('nombre_immeubles','nombre_locataires','nombre_associes','retraits_executes_trimestre') AND val<>trunc(val) THEN RAISE EXCEPTION 'EXTENDED_NONINTEGER %',k; END IF;
  IF k IN ('walb','walt','endettement') AND val>100 THEN RAISE EXCEPTION 'EXTENDED_RANGE %',k; END IF;
  IF EXISTS (SELECT 1 FROM public.scpi_indicator_history h WHERE h.scpi_slug=slug AND h.source_period=doc_period AND (to_jsonb(h)->>k) IS NOT NULL AND (to_jsonb(h)->>k)::numeric<>val) THEN RAISE EXCEPTION 'EXTENDED_HISTORY_CONFLICT %',k; END IF;
  IF EXISTS (SELECT 1 FROM public.scpi_metric_certifications c WHERE c.scpi_slug=slug AND c.source_period=doc_period AND c.metric=k AND c.value_numeric<>val) THEN RAISE EXCEPTION 'EXTENDED_CERTIFICATE_CONFLICT %',k; END IF;
  item:=jsonb_build_object('reference_date',refdate,'document_period',doc_period,'source_url',b.source_url,'source_page',(proof->>'page')::int,'sha256',sha,'unit',proof->>'unit','definition',proof->>'definition');
  provenance:=provenance||jsonb_build_object(k,item);patch:=patch||jsonb_build_object(k,val);
  INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence,verified_at)
  VALUES(slug,doc_period,k,val,proof->>'unit',b.source_url,(proof->>'page')::int,'SHA256='||sha||'; reference_date='||refdate||'; MuPDF='||(proof->>'text')||'; Poppler='||(proof->>'poppler_text'),b.id,'auto_verified_with_evidence','pdf_page_text_match_dual_mupdf_poppler',0.98,now())
  ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;
  EXECUTE format('UPDATE public.scpi_indicator_history SET %I=$1,metric_provenance=jsonb_set(metric_provenance,ARRAY[$2],$3,true) WHERE scpi_slug=$4 AND source_period=$5',k) USING val,k,item,slug,doc_period;
 END LOOP;
 -- Core fields also retain their actual reporting date and document provenance.
 FOREACH k IN ARRAY ARRAY['tof','nombre_parts','parts_attente_retrait'] LOOP
  proof:=doc->'evidence'->k;
  item:=jsonb_build_object('reference_date',enddate,'document_period',doc_period,'source_url',b.source_url,'source_page',(proof->>'page')::int,'sha256',sha,'unit',proof->>'unit');
  provenance:=provenance||jsonb_build_object(k,item);patch:=patch||jsonb_build_object(k,doc->'metrics'->k);
 END LOOP;
 UPDATE public.scpi_indicator_history SET metric_provenance=metric_provenance||provenance WHERE scpi_slug=slug AND source_period=doc_period;
 UPDATE public.scpi_bulletins SET extraction_json=coalesce(extraction_json,'{}')||jsonb_build_object('extended_metrics',doc->'extended_metrics','extended_evidence',doc->'extended_evidence','field_coverage',doc->'field_coverage','extended_parser_version',doc->>'parser_version','extraction_scope','core_plus_extended_fields') WHERE id=b.id;
 SELECT * INTO i FROM public.scpi_indicators WHERE scpi_slug=slug FOR UPDATE;
 IF i.scpi_slug IS NOT NULL AND (i.source_period IS NULL OR i.source_period<=doc_period) THEN
  -- Older allocation/debt references remain explicit; they are not re-dated to the incoming quarter.
  FOREACH k IN ARRAY ARRAY['repartition_sectorielle','repartition_geographique'] LOOP
   IF NOT i.metric_provenance ? k THEN i.metric_provenance:=i.metric_provenance||jsonb_build_object(k,jsonb_build_object('document_period',i.source_period,'source_url',i.source_url)); END IF;
  END LOOP;
  patch:=patch||jsonb_build_object('metric_provenance',i.metric_provenance||provenance,'source_type','official_bulletin_extended','source_period',doc_period,'source_url',b.source_url,'source_document','Bulletin officiel CORUM '||doc_period||'; reference dates and exact page evidence stored per metric; SHA256='||sha,'bulletin_id',b.id,'updated_at',now());
  UPDATE public.scpi_indicators target SET
   (prix_souscription,prix_reconstitution,valeur_realisation,prix_retrait,distribution_par_part,capitalisation,nombre_immeubles,nombre_locataires,nombre_associes,walb,walt,endettement,collecte_nette,retraits_executes_trimestre,tof,nombre_parts,parts_attente_retrait,metric_provenance,source_type,source_period,source_url,source_document,bulletin_id,updated_at)=
   (SELECT r.prix_souscription,r.prix_reconstitution,r.valeur_realisation,r.prix_retrait,r.distribution_par_part,r.capitalisation,r.nombre_immeubles,r.nombre_locataires,r.nombre_associes,r.walb,r.walt,r.endettement,r.collecte_nette,r.retraits_executes_trimestre,r.tof,r.nombre_parts,r.parts_attente_retrait,r.metric_provenance,r.source_type,r.source_period,r.source_url,r.source_document,r.bulletin_id,r.updated_at FROM jsonb_populate_record(i,patch) r)
   WHERE target.scpi_slug=slug;
 END IF;
END $fn$;
REVOKE ALL ON FUNCTION public.scpi_apply_extended_bulletin_metrics(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.scpi_apply_extended_bulletin_metrics(jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.capture_scpi_indicator_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- The extended driver writes exact document observations itself; do not copy older current fields into its new quarter.
  if new.source_type='official_bulletin_extended' then return new; end if;
  if tg_op = 'INSERT' or
     old.td is distinct from new.td or old.tof is distinct from new.tof or
     old.capitalisation is distinct from new.capitalisation or
     old.prix_souscription is distinct from new.prix_souscription or
     old.prix_reconstitution is distinct from new.prix_reconstitution or
     old.prix_retrait is distinct from new.prix_retrait or
     old.valeur_realisation is distinct from new.valeur_realisation or
     old.endettement is distinct from new.endettement or
     old.walt is distinct from new.walt or old.walb is distinct from new.walb or
     old.collecte_nette is distinct from new.collecte_nette or
     old.nb_cessions_trimestre is distinct from new.nb_cessions_trimestre or
     old.distribution_par_part is distinct from new.distribution_par_part or
     old.nombre_locataires is distinct from new.nombre_locataires or
     old.nombre_immeubles is distinct from new.nombre_immeubles or
     old.nombre_parts is distinct from new.nombre_parts or
     old.nombre_associes is distinct from new.nombre_associes or
     old.parts_attente_retrait is distinct from new.parts_attente_retrait or
     old.retraits_executes_trimestre is distinct from new.retraits_executes_trimestre or
     old.capital_type is distinct from new.capital_type or
     old.source_period is distinct from new.source_period
  then
    insert into public.scpi_indicator_history(
      scpi_slug, snapshot_at, source_period, source_type, source_document, source_url,
      td,tof,capitalisation,prix_souscription,prix_reconstitution,prix_retrait,valeur_realisation,
      endettement,walt,walb,collecte_nette,nb_cessions_trimestre,distribution_par_part,
      nombre_locataires,nombre_immeubles,nombre_parts,nombre_associes,parts_attente_retrait,
      retraits_executes_trimestre,capital_type,qa_status,source_confidence
    ) values (
      new.scpi_slug, coalesce(new.updated_at, now()), new.source_period, coalesce(new.source_type,'pipeline'),
      new.source_document, new.source_url,
      new.td,new.tof,new.capitalisation,new.prix_souscription,new.prix_reconstitution,new.prix_retrait,new.valeur_realisation,
      new.endettement,new.walt,new.walb,new.collecte_nette,new.nb_cessions_trimestre,new.distribution_par_part,
      new.nombre_locataires,new.nombre_immeubles,new.nombre_parts,new.nombre_associes,new.parts_attente_retrait,
      new.retraits_executes_trimestre,new.capital_type,new.qa_status,new.source_confidence
    )
    on conflict (scpi_slug, source_period) do update set
      snapshot_at=excluded.snapshot_at,
      source_type=excluded.source_type,
      source_document=coalesce(excluded.source_document, public.scpi_indicator_history.source_document),
      source_url=coalesce(excluded.source_url, public.scpi_indicator_history.source_url),
      td=coalesce(excluded.td, public.scpi_indicator_history.td),
      tof=coalesce(excluded.tof, public.scpi_indicator_history.tof),
      capitalisation=coalesce(excluded.capitalisation, public.scpi_indicator_history.capitalisation),
      prix_souscription=coalesce(excluded.prix_souscription, public.scpi_indicator_history.prix_souscription),
      prix_reconstitution=coalesce(excluded.prix_reconstitution, public.scpi_indicator_history.prix_reconstitution),
      prix_retrait=coalesce(excluded.prix_retrait, public.scpi_indicator_history.prix_retrait),
      valeur_realisation=coalesce(excluded.valeur_realisation, public.scpi_indicator_history.valeur_realisation),
      endettement=coalesce(excluded.endettement, public.scpi_indicator_history.endettement),
      walt=coalesce(excluded.walt, public.scpi_indicator_history.walt),
      walb=coalesce(excluded.walb, public.scpi_indicator_history.walb),
      collecte_nette=coalesce(excluded.collecte_nette, public.scpi_indicator_history.collecte_nette),
      nb_cessions_trimestre=coalesce(excluded.nb_cessions_trimestre, public.scpi_indicator_history.nb_cessions_trimestre),
      distribution_par_part=coalesce(excluded.distribution_par_part, public.scpi_indicator_history.distribution_par_part),
      nombre_locataires=coalesce(excluded.nombre_locataires, public.scpi_indicator_history.nombre_locataires),
      nombre_immeubles=coalesce(excluded.nombre_immeubles, public.scpi_indicator_history.nombre_immeubles),
      nombre_parts=coalesce(excluded.nombre_parts, public.scpi_indicator_history.nombre_parts),
      nombre_associes=coalesce(excluded.nombre_associes, public.scpi_indicator_history.nombre_associes),
      parts_attente_retrait=coalesce(excluded.parts_attente_retrait, public.scpi_indicator_history.parts_attente_retrait),
      retraits_executes_trimestre=coalesce(excluded.retraits_executes_trimestre, public.scpi_indicator_history.retraits_executes_trimestre),
      capital_type=coalesce(excluded.capital_type, public.scpi_indicator_history.capital_type),
      qa_status=excluded.qa_status,
      source_confidence=excluded.source_confidence;
  end if;
  return new;
end;
$function$;
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
$function$;
CREATE OR REPLACE VIEW public.scpi_trajectory_pilot_history WITH (security_invoker=true) AS  SELECT h.id,
    h.scpi_slug,
    h.snapshot_at,
    h.source_period,
    h.source_type,
    h.source_document,
    h.source_url,
    h.td,
    h.tof,
    h.capitalisation,
    h.prix_souscription,
    h.prix_reconstitution,
    h.prix_retrait,
    h.valeur_realisation,
    h.endettement,
    h.walt,
    h.walb,
    h.collecte_nette,
    h.nb_cessions_trimestre,
    h.distribution_par_part,
    h.nombre_locataires,
    h.nombre_immeubles,
    h.parts_attente_retrait,
    h.created_at,
    h.nombre_parts,
    h.nombre_associes,
    h.retraits_executes_trimestre,
    h.capital_type,
    h.qa_status,
    h.source_confidence,
        CASE
            WHEN h.nombre_parts IS NOT NULL AND h.nombre_parts > 0 AND h.parts_attente_retrait IS NOT NULL THEN round(100.0 * h.parts_attente_retrait::numeric / h.nombre_parts::numeric, 4)
            ELSE NULL::numeric
        END AS retrait_attente_pct,
    h.liquidity_basis,
    h.liquidity_sell_orders,
    h.liquidity_buy_orders,
        CASE
            WHEN h.nombre_parts IS NOT NULL AND h.nombre_parts > 0 AND h.liquidity_basis ~~ 'secondary_market_order_book%'::text AND h.liquidity_sell_orders IS NOT NULL THEN round(100.0 * h.liquidity_sell_orders::numeric / h.nombre_parts::numeric, 4)
            WHEN h.capital_type = 'fixe'::text OR h.liquidity_basis ~~ 'fixed_capital%'::text THEN NULL::numeric
            WHEN h.nombre_parts IS NOT NULL AND h.nombre_parts > 0 AND h.parts_attente_retrait IS NOT NULL THEN round(100.0 * h.parts_attente_retrait::numeric / h.nombre_parts::numeric, 4)
            ELSE NULL::numeric
        END AS liquidity_pressure_pct
    , h.metric_provenance
   FROM scpi_indicator_history h
     JOIN scpi_trajectory_pilot p USING (scpi_slug)
  WHERE p.enabled AND h.source_period ~ '^20[0-9]{2}-T[1-4]$'::text AND ("substring"(h.source_period, 1, 4)::integer * 4 + "substring"(h.source_period, 7, 1)::integer) <= (EXTRACT(year FROM CURRENT_DATE)::integer * 4 + EXTRACT(quarter FROM CURRENT_DATE)::integer) AND COALESCE(h.source_confidence, 0::numeric) >= 0.95 AND COALESCE(h.qa_status, ''::text) !~~ 'invalid%'::text AND COALESCE(h.qa_status, ''::text) <> 'manual_period_correction'::text;;
CREATE OR REPLACE VIEW public.scpi_bulletin_field_coverage_v1 WITH(security_invoker=true) AS
WITH latest AS (SELECT DISTINCT ON (scpi_slug) scpi_slug,period,extraction_json FROM public.scpi_bulletins WHERE period ~ '^20[0-9]{2}-T[1-4]$' ORDER BY scpi_slug,period DESC)
SELECT b.scpi_slug,b.period document_period,m.metric,
 coalesce(b.extraction_json->'field_coverage'->>m.metric,CASE WHEN to_jsonb(h)->>m.metric IS NOT NULL THEN 'stored_coverage_not_assessed' ELSE 'not_assessed' END) status,
 to_jsonb(h)->m.metric stored_value,h.metric_provenance->m.metric provenance
FROM latest b LEFT JOIN public.scpi_indicator_history h ON h.scpi_slug=b.scpi_slug AND h.source_period=b.period
CROSS JOIN unnest(ARRAY['prix_souscription','prix_reconstitution','valeur_realisation','prix_retrait','distribution_par_part','capitalisation','nombre_immeubles','nombre_locataires','nombre_associes','walb','walt','endettement','collecte_nette','tof','nombre_parts','parts_attente_retrait','repartition_sectorielle','repartition_geographique','frais_gestion','frais_souscription','delai_jouissance']) m(metric);
REVOKE ALL ON public.scpi_bulletin_field_coverage_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.scpi_bulletin_field_coverage_v1 TO service_role;
COMMIT;
