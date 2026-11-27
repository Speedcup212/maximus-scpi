-- 2026-10-28: Prevent partial historical PDF replay from being marked fully auto-verified.
-- Only a TOF actually extracted with independent PDF evidence can qualify for the
-- full auto_verified_dual_pdf_fields label. Other fields remain individually certified;
-- missing TOF remains missing and is reported by health and strict tests.
-- Based on the live function definition; no historical observations are fabricated.
CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_record(p_doc jsonb, p_lease uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE; b public.scpi_bulletins%ROWTYPE;
 k text; proof jsonb; val numeric; refdate date; enddate date; item jsonb;
 h public.scpi_indicator_history%ROWTYPE; i public.scpi_indicators%ROWTYPE;
 hp jsonb:='{}'; ip jsonb:='{}'; prov jsonb:='{}'; conflicts jsonb:='[]'; n integer:=0; assignments text; complete boolean:=false;
 allowed text[]:=ARRAY['td','tof','capitalisation','prix_souscription','prix_reconstitution','prix_retrait','valeur_realisation','endettement','walt','walb','collecte_nette','distribution_par_part','nombre_locataires','nombre_immeubles','nombre_parts','nombre_associes','parts_attente_retrait','retraits_executes_trimestre'];
BEGIN
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents WHERE document_key=p_doc->>'id' FOR UPDATE;
 IF p_lease IS NULL AND d.status='running' THEN RETURN jsonb_build_object('ok',true,'status','owned_by_running_worker','applied',0); END IF;
 IF p_lease IS NOT NULL AND (d.status<>'running' OR d.lease_token IS DISTINCT FROM p_lease) THEN RAISE EXCEPTION 'STALE_REPLAY_LEASE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p WHERE p.scpi_slug=d.scpi_slug AND p.enabled)
 OR p_doc->>'scpi_slug' IS DISTINCT FROM d.scpi_slug OR p_doc->>'period' IS DISTINCT FROM d.source_period
 OR coalesce(p_doc->>'parser_version','') !~ '^all-bulletins-[a-zA-Z0-9-]+$' THEN RAISE EXCEPTION 'BAD_REPLAY_ENVELOPE'; END IF;
 UPDATE maximus_agents.scpi_bulletin_replay_documents SET
  status=coalesce(p_doc->>'status','extraction_error'),parser_version=p_doc->>'parser_version',
  pdf_sha256=p_doc->>'sha256',page_count=(p_doc->>'page_count')::int,pages_read=(p_doc->>'pages_read')::int,
  processing_complete=coalesce((p_doc->>'processing_complete')::boolean,false),
  financial_complete=false,field_coverage=coalesce(p_doc->'field_coverage','{}'),metrics=coalesce(p_doc->'metrics','{}'),
  evidence=coalesce(p_doc->'evidence','{}'),result=p_doc-'path',lease_token=NULL,processed_at=now(),updated_at=now(),
  next_try_at=CASE WHEN p_doc->>'status' IN ('fetch_error','extraction_error') THEN now()+least(interval '24 hours',interval '1 hour'*greatest(d.attempts,1)) ELSE now() END
 WHERE document_key=d.document_key;
 BEGIN
 -- A source reference, an unreadable PDF or a changed hash is never financial proof.
 IF p_doc->>'status'<>'extracted' OR coalesce((p_doc->>'identity_verified')::boolean,false) IS NOT TRUE
 OR coalesce((p_doc->>'period_verified')::boolean,false) IS NOT TRUE
 OR coalesce((p_doc->>'processing_complete')::boolean,false) IS NOT TRUE
 OR (p_doc->>'pages_read')::int IS DISTINCT FROM (p_doc->>'page_count')::int
 OR d.source_period !~ '^20[0-9]{2}-T[1-4]$' THEN
 RETURN jsonb_build_object('ok',true,'status','recorded_review','applied',0); END IF;
 IF d.bulletin_id IS NULL THEN
  -- Newly recovered official archives join the same canonical bulletin table.
  -- An alternative PDF cannot replace an established different hash silently.
  SELECT * INTO b FROM public.scpi_bulletins WHERE scpi_slug=d.scpi_slug AND period=d.source_period;
  IF b.id IS NULL THEN
   IF coalesce(p_doc->>'sha256','') !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'MISSING_REGISTERED_PDF_HASH'; END IF;
   INSERT INTO public.scpi_bulletins(scpi_slug,period,source_url,pdf_sha256,qa_status,extraction_confidence,extraction_json,processed_at,run_id)
   VALUES(d.scpi_slug,d.source_period,d.source_url,p_doc->>'sha256','auto_partial_review',.98,jsonb_build_object('metrics','{}'::jsonb,'parser_version',p_doc->>'parser_version'),now(),p_doc->>'parser_version')
   ON CONFLICT(scpi_slug,period) DO NOTHING;
   SELECT * INTO STRICT b FROM public.scpi_bulletins WHERE scpi_slug=d.scpi_slug AND period=d.source_period;
  END IF;
  IF b.pdf_sha256=p_doc->>'sha256' THEN
   UPDATE maximus_agents.scpi_bulletin_replay_documents SET bulletin_id=b.id WHERE document_key=d.document_key;
   d.bulletin_id:=b.id;
  ELSE RETURN jsonb_build_object('ok',true,'status','alternate_document_requires_comparison','applied',0); END IF;
 ELSE SELECT * INTO STRICT b FROM public.scpi_bulletins WHERE id=d.bulletin_id;
 END IF;
 IF b.pdf_sha256 IS DISTINCT FROM p_doc->>'sha256'
 OR coalesce(b.qa_status,'') LIKE 'invalid%' THEN RETURN jsonb_build_object('ok',true,'status','source_review','applied',0); END IF;
 enddate:=(make_date(left(d.source_period,4)::int,right(d.source_period,1)::int*3,1)+interval '1 month -1 day')::date;
 IF enddate>date_trunc('quarter',current_date)+interval '3 months -1 day' THEN RAISE EXCEPTION 'FUTURE_REPLAY_PERIOD'; END IF;
 SELECT * INTO h FROM public.scpi_indicator_history WHERE scpi_slug=d.scpi_slug AND source_period=d.source_period FOR UPDATE;
 SELECT * INTO i FROM public.scpi_indicators WHERE scpi_slug=d.scpi_slug FOR UPDATE;
 FOR k IN SELECT jsonb_object_keys(coalesce(p_doc->'metrics','{}')) LOOP
  IF NOT k=ANY(allowed) THEN CONTINUE; END IF;
  proof:=p_doc->'evidence'->k;
  IF jsonb_typeof(p_doc->'metrics'->k)<>'number' THEN CONTINUE; END IF;
  val:=(p_doc->'metrics'->>k)::numeric;refdate:=(proof->>'reference_date')::date;
  IF val IS NULL OR refdate IS NULL OR refdate>enddate OR coalesce((proof->>'page')::int,0) NOT BETWEEN 1 AND (p_doc->>'page_count')::int
  OR proof->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb
  OR (proof->>'value')::numeric IS DISTINCT FROM val OR length(coalesce(proof->>'text',''))<5 OR length(coalesce(proof->>'poppler_text',''))<5 THEN CONTINUE; END IF;
  IF k IN ('td','tof','endettement') AND val NOT BETWEEN 0 AND 100 THEN CONTINUE; END IF;
  IF k IN ('walb','walt') AND val NOT BETWEEN 0 AND 100 THEN CONTINUE; END IF;
  IF k IN ('nombre_parts','nombre_associes','nombre_immeubles','nombre_locataires','parts_attente_retrait','retraits_executes_trimestre') AND (val<0 OR val<>trunc(val)) THEN CONTINUE; END IF;
  IF k IN ('prix_souscription','prix_reconstitution','prix_retrait','valeur_realisation') AND val NOT BETWEEN 10 AND 100000 THEN CONTINUE; END IF;
  IF k='capitalisation' AND val NOT BETWEEN .1 AND 100000 THEN CONTINUE; END IF;
  -- Fail closed on any established contradiction, including manual snapshots.
  IF EXISTS(SELECT 1 FROM public.scpi_metric_certifications c WHERE c.scpi_slug=d.scpi_slug AND c.source_period=d.source_period AND c.metric=k AND c.value_numeric<>val)
   OR (h.id IS NOT NULL AND to_jsonb(h)->>k IS NOT NULL AND (to_jsonb(h)->>k)::numeric<>val)
   OR (b.extraction_json->'metrics'->>k IS NOT NULL AND (b.extraction_json->'metrics'->>k)::numeric<>val) THEN
    conflicts:=conflicts||to_jsonb(k);CONTINUE;
  END IF;
  -- Narrative/caption proposals still require the exact document field QA.
  -- Existing extraction agreement is corroboration, never a licence to borrow a neighbour.
  IF proof->>'method'='dual_pdf_geometry' AND b.extraction_json->'metrics'->>k IS NULL AND coalesce(proof->>'association','')<>'same_line' THEN
    conflicts:=conflicts||to_jsonb('new_field_numeric_review:'||k);CONTINUE;
  END IF;
  item:=jsonb_build_object('reference_date',refdate,'document_period',d.source_period,'source_url',d.source_url,'source_page',(proof->>'page')::int,'sha256',b.pdf_sha256,'unit',proof->>'unit','definition',proof->>'definition');
  hp:=hp||jsonb_build_object(k,val);prov:=prov||jsonb_build_object(k,item);n:=n+1;
  INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,bulletin_id,verification_status,verification_method,extraction_confidence,verified_at)
  VALUES(d.scpi_slug,d.source_period,k,val,proof->>'unit',d.source_url,(proof->>'page')::int,'SHA256='||b.pdf_sha256||'; reference_date='||refdate||'; MuPDF='||(proof->>'text')||'; Poppler='||(proof->>'poppler_text'),b.id,'auto_verified_with_evidence','pdf_page_text_match_dual_mupdf_poppler',.98,now())
  ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;
 END LOOP;
 IF n>0 THEN
  IF h.id IS NULL THEN
   INSERT INTO public.scpi_indicator_history(scpi_slug,source_period,source_url,source_document,source_type,qa_status,source_confidence,metric_provenance)
   VALUES(d.scpi_slug,d.source_period,d.source_url,'Bulletin officiel, lecture complète avec preuves datées','official_bulletin_historical',CASE WHEN hp ? 'tof' THEN 'auto_verified_dual_pdf_fields' ELSE 'auto_partial_review' END,.98,'{}')
   ON CONFLICT(scpi_slug,source_period) DO NOTHING;
   SELECT * INTO h FROM public.scpi_indicator_history WHERE scpi_slug=d.scpi_slug AND source_period=d.source_period FOR UPDATE;
  END IF;
  -- All accepted fields are written together so arithmetic guardrails see one observation.
  h:=jsonb_populate_record(h,hp||jsonb_build_object('metric_provenance',h.metric_provenance||prov));
  SELECT string_agg(format('%I=($1).%I',name,name),',') INTO assignments FROM jsonb_object_keys(hp||jsonb_build_object('metric_provenance',prov)) AS name;
  EXECUTE 'UPDATE public.scpi_indicator_history SET '||assignments||' WHERE id=$2' USING h,h.id;
  -- Only fill the current same-period record. A history replay cannot re-date old fields.
  IF i.source_period=d.source_period THEN
   FOR k IN SELECT jsonb_object_keys(hp) LOOP
    IF to_jsonb(i)->>k IS NULL OR (to_jsonb(i)->>k)::numeric=(hp->>k)::numeric THEN
     ip:=ip||jsonb_build_object(k,hp->k);
    END IF;
   END LOOP;
   IF ip<>'{}'::jsonb THEN
    i:=jsonb_populate_record(i,ip||jsonb_build_object('metric_provenance',i.metric_provenance||prov,'source_type','official_bulletin_extended'));
    SELECT string_agg(format('%I=($1).%I',name,name),',') INTO assignments FROM jsonb_object_keys(ip||jsonb_build_object('metric_provenance',prov,'source_type','official_bulletin_extended')) AS name;
    EXECUTE 'UPDATE public.scpi_indicators SET '||assignments||' WHERE scpi_slug=$2' USING i,d.scpi_slug;
   END IF;
  END IF;
 END IF;
 complete:=coalesce((p_doc->>'financial_complete')::boolean,false)
  AND conflicts='[]'::jsonb
  AND (SELECT count(*)>=32 FROM jsonb_each_text(coalesce(p_doc->'field_coverage','{}')))
  AND NOT EXISTS(SELECT 1 FROM jsonb_each_text(coalesce(p_doc->'field_coverage','{}')) c WHERE c.value<>'verified');
 UPDATE public.scpi_bulletins SET extraction_json=coalesce(extraction_json,'{}')||jsonb_build_object('full_document_scan',jsonb_build_object('parser_version',p_doc->>'parser_version','pages_read',p_doc->'pages_read','page_count',p_doc->'page_count','field_coverage',p_doc->'field_coverage','processing_complete',true,'financial_complete',complete,'conflicts',conflicts,'checked_at',now())) WHERE id=b.id;
 UPDATE maximus_agents.scpi_bulletin_replay_documents SET financial_complete=complete,result=result||jsonb_build_object('applied',n,'conflicts',conflicts) WHERE document_key=d.document_key;
 RETURN jsonb_build_object('ok',true,'status','recorded','applied',n,'conflicts',conflicts);
 EXCEPTION WHEN OTHERS THEN
  UPDATE maximus_agents.scpi_bulletin_replay_documents SET status='canonical_guard_review',result=result||jsonb_build_object('applied',0,'canonical_guard_error',SQLERRM) WHERE document_key=d.document_key;
  RETURN jsonb_build_object('ok',true,'status','canonical_guard_review','applied',0,'error',SQLERRM);
 END;
END $function$
;
