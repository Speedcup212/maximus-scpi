-- Atomic certified financial release: live row and publish-intent share ONE transaction.
-- Called only by the private service_role worker after independent PDF QA.
CREATE OR REPLACE FUNCTION public.scpi_commit_certified_promotion(
  p_slug text, p_expected_period text, p_expected_updated_at timestamptz,
  p_bulletin_id uuid, p_period text, p_patch jsonb, p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_b public.scpi_bulletins%ROWTYPE;
  v_c public.scpi_metric_certifications%ROWTYPE;
  v_i public.scpi_indicators%ROWTYPE;
  v_metric text;
  v_proof jsonb;
  v_unit text;
  v_host text;
  v_hosts text[];
BEGIN
  IF coalesce(auth.role(),'') <> 'service_role' THEN
    RAISE EXCEPTION 'SCPI_SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_period !~ '^20[0-9]{2}-T[1-4]$'
     OR p_expected_period !~ '^20[0-9]{2}-T[1-4]$'
     OR p_period <= p_expected_period
     OR p_patch IS NULL
     OR jsonb_typeof(p_patch) <> 'object' THEN
    RAISE EXCEPTION 'SCPI_INVALID_PERIOD_OR_PATCH';
  END IF;
  SELECT * INTO v_b FROM public.scpi_bulletins
   WHERE id=p_bulletin_id AND scpi_slug=p_slug AND period=p_period
     AND qa_status='auto_verified'
     AND pdf_sha256 ~ '^[a-f0-9]{64}$'
     AND source_url LIKE 'https://%';
  IF NOT FOUND THEN RAISE EXCEPTION 'SCPI_DOCUMENT_NOT_STAGED_VERIFIED'; END IF;
  SELECT allowed_hosts INTO v_hosts FROM public.scpi_source_connectors
    WHERE scpi_slug=p_slug AND enabled IS TRUE;
  v_host := lower(split_part(v_b.source_url,'/',3));
  IF coalesce(v_host = ANY(v_hosts),false) IS NOT TRUE THEN
    RAISE EXCEPTION 'SCPI_NOT_OFFICIAL_ISSUER_HOST';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.scpi_trajectory_pilot
                 WHERE scpi_slug=p_slug AND enabled IS TRUE) THEN
    RAISE EXCEPTION 'SCPI_OUTSIDE_ACTIVE_COHORT';
  END IF;
  IF coalesce((p_patch->>'tof')::numeric,0) < 50
     OR coalesce((p_patch->>'tof')::numeric,101) > 100
     OR coalesce((p_patch->>'capitalisation')::numeric,0) <= 0
     OR coalesce((p_patch->>'prix_souscription')::numeric,0) <= 0 THEN
    RAISE EXCEPTION 'SCPI_CORE_MATERIAL_QA';
  END IF;
  FOR v_metric IN SELECT jsonb_object_keys(p_patch) LOOP
    IF v_metric = 'metric_provenance' THEN CONTINUE; END IF;
    IF v_metric <> ALL(ARRAY['tof','top','capitalisation','prix_souscription','prix_retrait','endettement','walt','walb','collecte_nette','nombre_locataires','nombre_immeubles','nombre_associes','nombre_parts','parts_attente_retrait','retraits_executes_trimestre','distribution_par_part','nb_cessions_trimestre']) THEN
      RAISE EXCEPTION 'SCPI_FORBIDDEN_PATCH_FIELD: %',v_metric;
    END IF;
    v_unit := CASE v_metric
        WHEN 'tof' THEN '%'
        WHEN 'top' THEN '%'
        WHEN 'capitalisation' THEN 'M€'
        WHEN 'prix_souscription' THEN '€'
        WHEN 'prix_retrait' THEN '€'
        WHEN 'endettement' THEN '%'
        WHEN 'walt' THEN 'ans'
        WHEN 'walb' THEN 'ans'
        WHEN 'collecte_nette' THEN '€'
        WHEN 'nombre_locataires' THEN 'locataires'
        WHEN 'nombre_immeubles' THEN 'immeubles'
        WHEN 'nombre_associes' THEN 'associés'
        WHEN 'nombre_parts' THEN 'parts'
        WHEN 'parts_attente_retrait' THEN 'parts'
        WHEN 'retraits_executes_trimestre' THEN 'parts'
        WHEN 'distribution_par_part' THEN '€/part'
        WHEN 'nb_cessions_trimestre' THEN 'cessions'
      ELSE NULL END;
    SELECT * INTO v_c FROM public.scpi_metric_certifications
      WHERE scpi_slug=p_slug AND source_period=p_period
        AND metric=v_metric AND bulletin_id=p_bulletin_id
        AND verification_status='auto_verified_with_evidence'
        AND verification_method='pdf_page_text_match'
        AND source_url=v_b.source_url
        AND source_page > 0
        AND unit = v_unit
        AND value_numeric=(p_patch->>v_metric)::numeric
      LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'SCPI_UNCERTIFIED_FIELD: %',v_metric; END IF;
    v_proof := p_patch->'metric_provenance'->v_metric;
    IF v_proof IS NULL
       OR v_proof->>'source_sha256' IS DISTINCT FROM v_b.pdf_sha256
       OR v_proof->>'source_url' IS DISTINCT FROM v_b.source_url
       OR v_proof->>'source_period' IS DISTINCT FROM p_period
       OR (v_proof->>'source_page')::integer IS DISTINCT FROM v_c.source_page THEN
      RAISE EXCEPTION 'SCPI_MISSING_FIELD_PROVENANCE: %',v_metric;
    END IF;
  END LOOP;
  UPDATE public.scpi_indicators AS i SET
      tof = coalesce((p_patch->>'tof')::numeric,i.tof),
      top = coalesce((p_patch->>'top')::numeric,i.top),
      capitalisation = coalesce((p_patch->>'capitalisation')::numeric,i.capitalisation),
      prix_souscription = coalesce((p_patch->>'prix_souscription')::numeric,i.prix_souscription),
      prix_retrait = coalesce((p_patch->>'prix_retrait')::numeric,i.prix_retrait),
      endettement = coalesce((p_patch->>'endettement')::numeric,i.endettement),
      walt = coalesce((p_patch->>'walt')::numeric,i.walt),
      walb = coalesce((p_patch->>'walb')::numeric,i.walb),
      collecte_nette = coalesce((p_patch->>'collecte_nette')::numeric,i.collecte_nette),
      nombre_locataires = coalesce((p_patch->>'nombre_locataires')::integer,i.nombre_locataires),
      nombre_immeubles = coalesce((p_patch->>'nombre_immeubles')::integer,i.nombre_immeubles),
      nombre_associes = coalesce((p_patch->>'nombre_associes')::integer,i.nombre_associes),
      nombre_parts = coalesce((p_patch->>'nombre_parts')::bigint,i.nombre_parts),
      parts_attente_retrait = coalesce((p_patch->>'parts_attente_retrait')::bigint,i.parts_attente_retrait),
      retraits_executes_trimestre = coalesce((p_patch->>'retraits_executes_trimestre')::bigint,i.retraits_executes_trimestre),
      distribution_par_part = coalesce((p_patch->>'distribution_par_part')::numeric,i.distribution_par_part),
      nb_cessions_trimestre = coalesce((p_patch->>'nb_cessions_trimestre')::integer,i.nb_cessions_trimestre),
      metric_provenance = coalesce(i.metric_provenance,'{}'::jsonb) || coalesce(p_patch->'metric_provenance','{}'::jsonb),
      source_period=p_period,source_type='bulletin_edge_automated',
      qa_status='auto_verified',source_confidence=v_b.extraction_confidence,
      bulletin_id=p_bulletin_id,source_url=v_b.source_url,
      source_document=split_part(v_b.source_url,'/',array_length(string_to_array(split_part(v_b.source_url,'?',1),'/'),1)),
      updated_at=now()
    WHERE i.scpi_slug=p_slug AND i.source_period=p_expected_period
      AND i.updated_at=p_expected_updated_at
      AND NOT(i.source_period=p_period AND i.qa_status LIKE 'manual_verified%')
  RETURNING i.* INTO v_i;
  IF NOT FOUND THEN RAISE EXCEPTION 'SCPI_CONCURRENT_UPDATE_OR_GUARD'; END IF;
  INSERT INTO public.scpi_publish_queue(scpi_slug,change_type,publish_after,published_at,payload)
  VALUES(p_slug,'trajectory_data',current_date,NULL,coalesce(p_payload,'{}'::jsonb))
  ON CONFLICT(scpi_slug,change_type,publish_after)
  DO UPDATE SET payload=excluded.payload,published_at=NULL,queued_at=now();
  RETURN jsonb_build_object('status','committed_pending_frontend',
    'scpi_slug',v_i.scpi_slug,'source_period',v_i.source_period,
    'bulletin_id',v_i.bulletin_id,'tof',v_i.tof,
    'capitalisation',v_i.capitalisation,'prix_souscription',v_i.prix_souscription);
END;
$$;
REVOKE ALL ON FUNCTION public.scpi_commit_certified_promotion(
  text,text,timestamptz,uuid,text,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.scpi_commit_certified_promotion(
  text,text,timestamptz,uuid,text,jsonb,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
