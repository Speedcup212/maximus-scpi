BEGIN;
-- RECOVERY-009: source discovery, real-role preflight and durable PDF archives.
-- Financial guards and the existing deployed per-field checks are preserved.
GRANT SELECT ON maximus_agents.scpi_candidate_document_index TO service_role;

-- Official 2024-T4 cover prints XII while the canonical catalogue uses 12.
INSERT INTO public.scpi_name_aliases(scpi_slug,alias,evidence_url,evidence_note,active)
VALUES('altixia-cadence-12','Altixia Cadence XII',
 'https://www.altixia.fr/medias/actualites/doc1-20250130-154632.PDF',
 'Page 1 du bulletin officiel 4e trimestre 2024: SCPI ALTIXIA CADENCE XII. Alias de denomination, sans changement de fonds.',true)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_source_trusted(p_slug text, p_url text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 WITH host AS (SELECT lower(regexp_replace(substring(p_url from '^https://([^/:?#]+)'),'^www[.]','')) h),
 official AS (
  SELECT lower(regexp_replace(substring(u from '^https://([^/:?#]+)'),'^www[.]','')) h
  FROM public.scpi_source_registry r CROSS JOIN LATERAL unnest(ARRAY[r.source_domain,r.official_scpi_page_url])u WHERE r.scpi_slug=p_slug
  UNION SELECT lower(regexp_replace(substring(b.source_url from '^https://([^/:?#]+)'),'^www[.]',''))
  FROM public.scpi_bulletins b WHERE b.scpi_slug=p_slug AND b.qa_status ~ '(verified|certified_official)' AND b.qa_status !~ '^invalid'
 ) SELECT EXISTS(SELECT 1 FROM host,official WHERE host.h=official.h OR host.h LIKE '%.'||official.h)
 AND NOT EXISTS(SELECT 1 FROM host WHERE host.h ~ '(^|[.-])(extranet|intranet|private|login|auth|localhost)([.-]|$)');
$function$
;

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_archive_target(p_key text, p_lease uuid, p_sha text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ DECLARE d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE; BEGIN SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents WHERE document_key=p_key; IF d.status<>'running' OR d.lease_token IS DISTINCT FROM p_lease OR p_sha !~ '^[0-9a-f]{64}$' OR d.source_period !~ '^20[0-9]{2}-(T[1-4]|RA)$' OR d.source_url ~* '^https://(extranet|intranet|private|login|auth)[.]' THEN RAISE EXCEPTION 'INVALID_ARCHIVE_LEASE'; END IF; RETURN jsonb_build_object('path',d.scpi_slug||'/'||d.source_period||'/'||p_sha||'.pdf'); END $function$
;

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_claim(p_version text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE; payload jsonb;
BEGIN
 IF p_version !~ '^all-bulletins-[a-zA-Z0-9-]+$' THEN RAISE EXCEPTION 'BAD_REPLAY_VERSION'; END IF;
 SELECT * INTO d FROM maximus_agents.scpi_bulletin_replay_documents t
 WHERE EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p WHERE p.scpi_slug=t.scpi_slug AND p.enabled)
 AND t.next_try_at<=now() AND
 ((t.status<>'running' AND (t.parser_version IS DISTINCT FROM p_version OR t.status IN ('queued','fetch_error','extraction_error','html_pending_semantic_extraction','source_reference_review','source_access_blocked') OR t.result ? 'archive_error' OR (t.status='canonical_guard_review' AND t.result->>'canonical_guard_error'='deadlock detected') OR (t.status='extracted_needs_review' AND t.result->>'source_review_version' IS DISTINCT FROM 'issuer-source-resolution-20261028-v1')))
 OR (t.status='running' AND t.claimed_at<now()-interval '60 minutes'))
 ORDER BY (t.origin='registered_bulletin') DESC,t.source_period DESC,t.attempts,t.document_key
 FOR UPDATE SKIP LOCKED LIMIT 1;
 IF d.document_key IS NULL THEN RETURN jsonb_build_object('task',NULL); END IF;
 UPDATE maximus_agents.scpi_bulletin_replay_documents SET status='running',lease_token=gen_random_uuid(),claimed_at=now(),attempts=attempts+1,updated_at=now()
 WHERE document_key=d.document_key RETURNING * INTO d;
 SELECT to_jsonb(d)||jsonb_build_object('id',d.document_key,'period',d.source_period,'scpi_name',s.scpi_name,
   'pdf_sha256',d.expected_sha256,'official_scpi_page_url',s.official_scpi_page_url,'source_domain',s.source_domain,'discovery',d.result->'discovery','qa_status',b.qa_status,'metrics',coalesce(b.extraction_json->'metrics','{}'),
   'aliases',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM public.scpi_name_aliases a WHERE a.scpi_slug=d.scpi_slug AND a.active),'[]'))
 INTO payload FROM public.scpi_source_registry s LEFT JOIN public.scpi_bulletins b ON b.id=d.bulletin_id WHERE s.scpi_slug=d.scpi_slug;
 RETURN jsonb_build_object('task',payload);
END $function$
;

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
  pdf_sha256=p_doc->>'sha256',
  pdf_path=CASE WHEN p_doc->>'archive_path'=d.scpi_slug||'/'||d.source_period||'/'||(p_doc->>'sha256')||'.pdf' THEN p_doc->>'archive_path' ELSE d.pdf_path END,
  page_count=(p_doc->>'page_count')::int,pages_read=(p_doc->>'pages_read')::int,
  processing_complete=coalesce((p_doc->>'processing_complete')::boolean,false),
  financial_complete=false,field_coverage=coalesce(p_doc->'field_coverage','{}'),metrics=coalesce(p_doc->'metrics','{}'),
  evidence=coalesce(p_doc->'evidence','{}'),result=p_doc-'path',lease_token=NULL,processed_at=now(),updated_at=now(),
  next_try_at=CASE WHEN p_doc->>'status' IN ('fetch_error','extraction_error') THEN now()+least(interval '24 hours',interval '1 hour'*greatest(d.attempts,1)) WHEN p_doc->>'status' IN ('source_reference_review','source_access_blocked') THEN now()+interval '24 hours' WHEN p_doc ? 'archive_error' THEN now()+interval '1 hour' ELSE now() END
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
 IF p_doc->>'archive_path'=d.scpi_slug||'/'||d.source_period||'/'||(p_doc->>'sha256')||'.pdf' THEN
  UPDATE public.scpi_bulletins SET pdf_path=p_doc->>'archive_path' WHERE id=b.id AND pdf_sha256=p_doc->>'sha256' AND pdf_path IS NULL;
 END IF;
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

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_register_link(p_parent text,p_lease uuid,p_link jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $fn$
DECLARE d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 u text:=p_link->>'source_url'; per text:=p_link->>'period'; publisher text:=p_link->>'publisher_page'; result_key text;
BEGIN
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents WHERE document_key=p_parent;
 IF d.status<>'running' OR d.lease_token IS DISTINCT FROM p_lease
 OR NOT public.scpi_bulletin_replay_source_trusted(d.scpi_slug,coalesce(publisher,d.source_url))
 OR coalesce(u,'') !~ '^https://' OR coalesce(per,'') !~ '^20[0-9]{2}-T[1-4]$'
 OR per IS DISTINCT FROM d.source_period
 OR substring(u from '^https://([^/:?#]+)') ~* '(^|[.-])(extranet|intranet|private|login|auth|localhost)([.-]|$)'
 OR u ~ '^https://[^/]*@' OR u LIKE 'https://[%' OR u ~ '^https://(127[.]|10[.]|192[.]168[.]|169[.]254[.]|172[.](1[6-9]|2[0-9]|3[01])[.])'
 OR coalesce((p_link->>'identity_verified')::boolean,false) IS NOT TRUE
 OR coalesce((p_link->>'period_verified')::boolean,false) IS NOT TRUE
 OR p_link->'independent_engines' IS DISTINCT FROM '["MuPDF","Poppler"]'::jsonb
 OR coalesce(p_link->>'sha256','') !~ '^[0-9a-f]{64}$'
 THEN RETURN jsonb_build_object('ok',false,'status','unapproved_publisher_link'); END IF;
 INSERT INTO maximus_agents.scpi_bulletin_replay_documents(document_key,scpi_slug,source_period,source_url,origin,result)
 VALUES('ref:'||md5(d.scpi_slug||':'||per||':'||u),d.scpi_slug,per,u,'publisher_link',
  jsonb_build_object('discovery',jsonb_build_object('publisher_parent_key',p_parent,'publisher_page',publisher,
   'publisher_page_sha256',p_link->>'publisher_page_sha256','link_text',p_link->>'link_text','sha256',p_link->>'sha256')))
 ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;
 SELECT document_key INTO STRICT result_key FROM maximus_agents.scpi_bulletin_replay_documents
 WHERE scpi_slug=d.scpi_slug AND source_period=per AND source_url=u;
 RETURN jsonb_build_object('ok',true,'document_key',result_key,'status','registered_pdf_pending_full_numeric_qa');
END $fn$;

CREATE OR REPLACE FUNCTION public.scpi_bulletin_replay_health(p_version text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
SELECT jsonb_build_object(
 'effective_role',current_user,
 'permissions_ok',has_schema_privilege(current_user,'maximus_agents','USAGE')
  AND has_table_privilege(current_user,'maximus_agents.scpi_candidate_document_index','SELECT')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_seed()','EXECUTE')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_claim(text)','EXECUTE')
  AND has_function_privilege(current_user,'public.scpi_bulletin_replay_record(jsonb,uuid)','EXECUTE'),
 'checked_at',now(),
 'enabled_scpi',(SELECT count(*) FROM public.scpi_trajectory_pilot WHERE enabled),
 'eligible_now',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents t
  WHERE EXISTS(SELECT 1 FROM public.scpi_trajectory_pilot p WHERE p.scpi_slug=t.scpi_slug AND p.enabled)
  AND t.next_try_at<=now() AND ((t.status<>'running' AND
   (t.parser_version IS DISTINCT FROM p_version OR t.status IN ('queued','fetch_error','extraction_error','html_pending_semantic_extraction','source_reference_review','source_access_blocked')
    OR t.result ? 'archive_error' OR (t.status='canonical_guard_review' AND t.result->>'canonical_guard_error'='deadlock detected') OR (t.status='extracted_needs_review' AND t.result->>'source_review_version' IS DISTINCT FROM 'issuer-source-resolution-20261028-v1')))
   OR(t.status='running' AND t.claimed_at<now()-interval '60 minutes'))),
 'statuses',(SELECT coalesce(jsonb_object_agg(status,n),'{}'::jsonb) FROM
  (SELECT status,count(*) n FROM maximus_agents.scpi_bulletin_replay_documents GROUP BY status)s),
 'fully_read',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE processing_complete),
 'financially_complete',(SELECT count(*) FROM maximus_agents.scpi_bulletin_replay_documents WHERE financial_complete)
);
$fn$;

REVOKE ALL ON FUNCTION public.scpi_bulletin_replay_health(text),public.scpi_bulletin_replay_register_link(text,uuid,jsonb),public.scpi_bulletin_replay_archive_target(text,uuid,text),public.scpi_bulletin_replay_source_trusted(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.scpi_bulletin_replay_health(text),public.scpi_bulletin_replay_register_link(text,uuid,jsonb),public.scpi_bulletin_replay_archive_target(text,uuid,text),public.scpi_bulletin_replay_source_trusted(text,text) TO service_role;
COMMIT;
