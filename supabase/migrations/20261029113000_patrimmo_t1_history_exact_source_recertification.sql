-- Patrimmo Commerce 2026-T1: the history snapshot still linked to
-- a T2 bulletin even though its TOF, shares and period proof were recovered
-- from the original T1 publisher PDF. Reattach the URL; do not invent or
-- modify any financial value. Preserve the original snapshot privately.
DO $repair$
DECLARE
 h public.scpi_indicator_history%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE;
 d maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 c public.scpi_metric_certifications%ROWTYPE;
 key text:='patrimmo-history-exact-source-2026-T1';
 old_url text:='https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo+Commerce_T2_2026_VDEF+%281%29.pdf/99ff97ba-a933-030e-da41-1ab9f47c97cb?t=1786019920553';
BEGIN
 SELECT * INTO STRICT b FROM public.scpi_bulletins
  WHERE scpi_slug='patrimmo-commerce' AND period='2026-T1';
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
  WHERE scpi_slug='patrimmo-commerce' AND source_period='2026-T1' FOR UPDATE;
 SELECT * INTO STRICT d FROM maximus_agents.scpi_bulletin_replay_documents
  WHERE scpi_slug='patrimmo-commerce' AND source_period='2026-T1'
   AND status='extracted' AND bulletin_id=b.id AND source_url=b.source_url
   AND processing_complete=true AND result->>'identity_verified'='true'
   AND result->>'period_verified'='true';
 SELECT * INTO STRICT c FROM public.scpi_metric_certifications
  WHERE scpi_slug='patrimmo-commerce' AND source_period='2026-T1' AND metric='tof';
 IF h.source_url=b.source_url THEN
   PERFORM public.certify_scpi_bulletin_analysis('patrimmo-commerce');
   RETURN;
 END IF;
 IF h.source_url<>old_url OR h.qa_status!~'^(manual_verified|auto_verified)'
   OR h.tof IS DISTINCT FROM 91::numeric OR h.nombre_parts<>3835627
   OR h.parts_attente_retrait > h.nombre_parts
   OR b.pdf_sha256 IS DISTINCT FROM d.pdf_sha256
   OR b.pdf_sha256!~'^[0-9a-f]{64}$'
   OR NOT public.scpi_is_strong_qa(b.qa_status)
   OR NOT public.scpi_bulletin_replay_source_trusted('patrimmo-commerce',b.source_url)
   OR (d.metrics->>'tof')::numeric IS DISTINCT FROM h.tof
   OR (d.evidence->'tof'->>'page')::int<>4
   OR d.evidence->'tof'->>'reference_date'<>'2026-03-31'
   OR d.evidence->'tof'->'independent_engines' IS DISTINCT FROM
      '["MuPDF","Poppler"]'::jsonb
   OR c.source_url IS DISTINCT FROM b.source_url
   OR c.bulletin_id IS DISTINCT FROM b.id
   OR c.value_numeric IS DISTINCT FROM h.tof
   OR h.metric_provenance->'tof'->>'sha256' IS DISTINCT FROM b.pdf_sha256
 THEN RAISE EXCEPTION 'Patrimmo T1 exact issuer period snapshot checks failed'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
   (event_key,reason,snapshot)
 VALUES(key,'Fix remaining 2026-T1 history link to 2026-T2 despite exact T1 verified TOF source',
   jsonb_build_object('history_before',to_jsonb(h),
     'certification_before',to_jsonb(c),'bulletin',to_jsonb(b),
     'replay_evidence_tof',d.evidence->'tof'))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_indicator_history
 SET source_url=b.source_url
 WHERE id=h.id AND source_url=old_url;
 PERFORM public.certify_scpi_bulletin_analysis('patrimmo-commerce');
END $repair$;