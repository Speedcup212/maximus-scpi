-- RECOVERY-027: isolated official-document driver. No readiness definition changes.
BEGIN;
ALTER TABLE public.scpi_source_registry ADD COLUMN IF NOT EXISTS ingestion_driver text NOT NULL DEFAULT 'generic';
ALTER TABLE public.scpi_source_connectors ADD COLUMN IF NOT EXISTS ingestion_driver text NOT NULL DEFAULT 'generic';
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_corum_document_runs (
 scpi_slug text NOT NULL CHECK(scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa')),
 source_url text NOT NULL, source_period text NOT NULL, document_kind text NOT NULL,
 pdf_sha256 text, status text NOT NULL, parser_version text NOT NULL,
 payload jsonb NOT NULL, attempts integer NOT NULL DEFAULT 1,
 first_seen_at timestamptz NOT NULL DEFAULT now(), checked_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(scpi_slug,source_url)
);
ALTER TABLE maximus_agents.scpi_corum_document_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON maximus_agents.scpi_corum_document_runs FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA maximus_agents TO service_role;
GRANT SELECT,INSERT,UPDATE ON maximus_agents.scpi_corum_document_runs TO service_role;

CREATE OR REPLACE FUNCTION public.scpi_corum_record_document(p_doc jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $fn$
DECLARE
 slug text:=p_doc->>'slug'; doc_period text:=p_doc->>'period'; url text:=p_doc->>'url';
 state text:=p_doc->>'status'; sha text:=p_doc->>'sha256'; kind text:=p_doc->>'kind';
 metric_key text; val numeric; h public.scpi_indicator_history%ROWTYPE; b_id uuid; duplicate_url text;
 proof jsonb; result_status text; already boolean;
BEGIN
 IF slug NOT IN ('corum-origin','corum-xl','corum-eurion','corum-usa')
    OR url !~ '^https://(www\.)?corum\.fr/sites/default/files/'
    OR doc_period !~ '^20[0-9]{2}-(T[1-4]|RA)$'
    OR kind NOT IN ('annual_report','quarterly_bulletin')
    OR state NOT IN ('source_verified','certified_core','partial_review','ocr_pending','rejected','retry')
    OR coalesce(p_doc->>'parser_version','') NOT LIKE 'corum-dual-pdf-%' THEN
   RAISE EXCEPTION 'CORUM_DOCUMENT_INVALID_ENVELOPE';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(slug||':'||doc_period,0));
 IF state IN ('source_verified','certified_core') AND
    (sha !~ '^[0-9a-f]{64}$' OR coalesce((p_doc->>'identity_verified')::boolean,false) IS NOT TRUE
       OR coalesce((p_doc->>'period_verified')::boolean,false) IS NOT TRUE) THEN
    RAISE EXCEPTION 'CORUM_DOCUMENT_MISSING_IDENTITY_PERIOD_HASH';
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
 SELECT source_url INTO duplicate_url FROM maximus_agents.scpi_corum_document_runs
  WHERE scpi_slug=slug AND source_period=doc_period AND pdf_sha256=sha AND source_url<>url
    AND status IN ('source_verified','certified_core') LIMIT 1;
 SELECT EXISTS(SELECT 1 FROM maximus_agents.scpi_corum_document_runs
   WHERE scpi_slug=slug AND source_url=url AND pdf_sha256=sha AND status=state
     AND parser_version=p_doc->>'parser_version') INTO already;
 IF already THEN RETURN jsonb_build_object('ok',true,'status','unchanged','period',doc_period); END IF;
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
  VALUES(slug,doc_period,'bulletin',CASE WHEN state='certified_core' THEN 'already_loaded' ELSE 'qa_review' END,url,
   'Official CORUM archive: '||doc_period,CASE WHEN state='certified_core' THEN 'dual_pdf_page_evidence_verified' ELSE 'needs_review' END,
   CASE WHEN state='certified_core' THEN NULL ELSE (p_doc->'anomalies')::text END,50)
  ON CONFLICT(scpi_slug,source_period,source_kind) DO UPDATE SET
   status=CASE WHEN scpi_backfill_queue.status='already_loaded' THEN scpi_backfill_queue.status ELSE excluded.status END,
   last_error=CASE WHEN scpi_backfill_queue.status='already_loaded' THEN scpi_backfill_queue.last_error ELSE excluded.last_error END,
   updated_at=now();
 END IF;
 INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,source_page_url,bulletin_url,source_period,metrics_count,ended_at)
 VALUES(slug,CASE WHEN state='certified_core' THEN 'updated' WHEN state='source_verified' THEN 'source_verified' ELSE 'needs_review' END,
  'corum_dual_pdf_archive',state||'; sha256='||coalesce(sha,'none')||'; anomalies='||coalesce((p_doc->'anomalies')::text,'[]'),
  p_doc->>'index_url',url,doc_period,(select count(*) from jsonb_object_keys(coalesce(p_doc->'metrics','{}'))),now());
 RETURN jsonb_build_object('ok',true,'status',state,'period',doc_period);
END;
$fn$;
REVOKE ALL ON FUNCTION public.scpi_corum_record_document(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.scpi_corum_record_document(jsonb) TO service_role;
-- Configure isolated drivers. Automation remains false until tested.
UPDATE public.scpi_source_registry SET ingestion_driver='corum_dual_pdf_v1'
 WHERE scpi_slug IN ('corum-origin','corum-xl','corum-eurion','corum-usa');
INSERT INTO public.scpi_source_connectors(scpi_slug,discovery_url,allowed_hosts,enabled,ingestion_driver)
 SELECT scpi_slug,official_scpi_page_url,ARRAY['www.corum.fr','corum.fr'],true,'corum_dual_pdf_v1'
 FROM public.scpi_source_registry WHERE ingestion_driver='corum_dual_pdf_v1'
ON CONFLICT(scpi_slug) DO UPDATE SET discovery_url=excluded.discovery_url,allowed_hosts=excluded.allowed_hosts,ingestion_driver=excluded.ingestion_driver;
-- Generic workers must not claim protected publisher-specific documents.
DO $patch$
DECLARE src text;
BEGIN
 SELECT pg_get_functiondef('public.claim_scpi_backfill_job()'::regprocedure) INTO src;
 IF src NOT LIKE '%c.ingestion_driver%' THEN
  src:=replace(src,$a$where q.source_kind='bulletin'$a$,$b$where c.ingestion_driver='generic' and q.source_kind='bulletin'$b$);
  EXECUTE src;
 END IF;
END;
$patch$;
COMMIT;
