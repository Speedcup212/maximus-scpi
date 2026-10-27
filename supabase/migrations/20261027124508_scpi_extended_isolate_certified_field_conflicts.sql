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
  IF jsonb_typeof(doc->'extended_metrics'->k) IS DISTINCT FROM 'number' OR val IS NULL OR val<0 OR refdate IS NULL OR refdate>enddate OR coalesce((proof->>'page')::int,0) NOT BETWEEN 1 AND 240
   OR proof->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb
   OR length(coalesce(proof->>'text',''))<5 OR length(coalesce(proof->>'poppler_text',''))<5
   OR (proof->>'value')::numeric IS DISTINCT FROM val OR coalesce(proof->>'unit','')='' THEN RAISE EXCEPTION 'EXTENDED_MISSING_DUAL_DATED_PROOF %',k; END IF;
  IF k IN ('nombre_immeubles','nombre_locataires','nombre_associes','retraits_executes_trimestre') AND val<>trunc(val) THEN RAISE EXCEPTION 'EXTENDED_NONINTEGER %',k; END IF;
  IF k IN ('walb','walt','endettement') AND val>100 THEN RAISE EXCEPTION 'EXTENDED_RANGE %',k; END IF;
  -- A dated PDF may repair a legacy inherited value lacking a field certificate.
  -- A real contradictory field certificate is quarantined individually, never overwritten.
  IF EXISTS (SELECT 1 FROM public.scpi_metric_certifications c WHERE c.scpi_slug=slug AND c.source_period=doc_period AND c.metric=k AND c.value_numeric<>val) THEN
   doc:=jsonb_set(doc,ARRAY['field_coverage',k],to_jsonb('conflict_requires_review'::text),true);
   INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,bulletin_url,source_period,ended_at)
   VALUES(slug,'needs_review','extended_metric_conflict','Certified field retained: '||k,b.source_url,doc_period,now());
   CONTINUE;
  END IF;
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