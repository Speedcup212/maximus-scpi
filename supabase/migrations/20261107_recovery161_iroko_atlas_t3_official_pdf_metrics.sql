-- RECOVERY-161 — Iroko Atlas 2026-T3, official publisher-linked original PDF.
-- Replace HTML reference misleadingly stored as PDF and certify only values
-- independently dual-read in issuer original (TOF, cap, subscription price).
-- Other HTML values and overall fund confidence remain MEDIUM and QA-open.
DO $rec161$
DECLARE v_old_url text:='https://www.iroko.eu/bulletins-trimestriels-atlas/q3-2026';
 v_pdf_url text:='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf';
 v_sha text:='301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a';
 v_original public.scpi_bulletins%ROWTYPE;
 v_registry public.scpi_source_registry%ROWTYPE;
 v_task public.scpi_backfill_queue%ROWTYPE;
 v_replay maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 v_metric record;
 v_old_certs jsonb;
 v_rows int;
 v_check text;
BEGIN
 SELECT * INTO STRICT v_registry FROM public.scpi_source_registry r
 WHERE r.scpi_slug='iroko-atlas' AND r.bulletin_url=v_old_url
 AND r.last_document_period='2026-T3'
 AND r.verification_status='verified' AND r.confidence_level='medium' FOR UPDATE;
 SELECT * INTO STRICT v_original FROM public.scpi_bulletins b
 WHERE b.id='3b099d3a-f8cd-4580-b773-699d083cce1b'::uuid
 AND b.scpi_slug='iroko-atlas' AND b.period='2026-T3'
 AND b.source_url=v_old_url AND b.pdf_path IS NULL
 AND b.pdf_sha256='df981cf33989eb173dd3d3e24eaa5b170f5e5983a3c25e08b7070b866a34c41d'
 AND b.qa_status='auto_verified' FOR UPDATE;
 SELECT * INTO STRICT v_task FROM public.scpi_backfill_queue q
 WHERE q.id='9f5e84f6-ff93-476c-b842-b8b8a40a2f11'::uuid
 AND q.scpi_slug='iroko-atlas' AND q.source_period='2026-T3'
 AND q.source_kind='bulletin' AND q.status='not_applicable'
 AND q.verification_status='future_period' AND q.source_url IS NULL FOR UPDATE;
 SELECT * INTO STRICT v_replay FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.document_key='ref:4c95d675b84e0e5658a0810f865a4f98'
 AND d.origin='publisher_link' AND d.scpi_slug='iroko-atlas'
 AND d.source_period='2026-T3' AND d.source_url=v_pdf_url
 AND d.pdf_sha256=v_sha AND d.pdf_path='iroko-atlas/2026-T3/'||v_sha||'.pdf'
 AND d.status='extracted' AND d.processing_complete AND d.page_count=11
 AND d.pages_read=11 AND d.field_coverage->>'tof'='verified'
 AND d.field_coverage->>'capitalisation'='verified'
 AND d.field_coverage->>'prix_souscription'='verified'
 AND (d.metrics->>'tof')::numeric=96.65
 AND (d.metrics->>'capitalisation')::numeric=218.83
 AND (d.metrics->>'prix_souscription')::numeric=200;
 IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
 AND o.name=v_replay.pdf_path AND (o.metadata->>'size')::bigint=3971612)
 THEN RAISE EXCEPTION 'REC161_PUBLISHER_ORIGINAL_NOT_IN_PRIVATE_ARCHIVE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors c WHERE c.scpi_slug='iroko-atlas'
 AND 'iroko-documents.s3.eu-west-3.amazonaws.com'=ANY(c.allowed_hosts))
 THEN RAISE EXCEPTION 'REC161_OFFICIAL_CDN_NOT_APPROVED'; END IF;
 IF EXISTS(SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
 WHERE q.scpi_slug='iroko-atlas' AND q.source_period='2026-T3')
 THEN RAISE EXCEPTION 'REC161_HISTORICAL_TOF_QUARANTINE'; END IF;
 FOR v_metric IN SELECT * FROM (VALUES
 ('tof','9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid,96.65::numeric,6),
 ('capitalisation','e750c076-5fb0-4bce-80ce-88fce0f380c7'::uuid,218.83::numeric,2),
 ('prix_souscription','81a86fb4-a83d-49ad-8d1c-c1fc5b4134d2'::uuid,200::numeric,2))
 m(metric,certid,val,page_num)
 LOOP
   IF NOT EXISTS(SELECT 1 FROM public.scpi_metric_certifications c
   WHERE c.id=v_metric.certid AND c.scpi_slug='iroko-atlas'
   AND c.source_period='2026-T3' AND c.metric=v_metric.metric
   AND c.value_numeric=v_metric.val AND c.source_url=v_old_url
   AND c.source_page IS NULL AND c.verification_method='html_text_match'
   AND c.verification_status='auto_verified_with_evidence'
   AND c.extraction_confidence<0.95 AND c.bulletin_id=v_original.id)
   THEN RAISE EXCEPTION 'REC161_ORIGINAL_HTML_CERT_NOT_IDENTICAL_%',v_metric.metric; END IF;
   IF NOT(
     (v_replay.evidence->v_metric.metric->>'value')::numeric=v_metric.val
     AND (v_replay.evidence->v_metric.metric->>'page')::integer=v_metric.page_num
     AND v_replay.evidence->v_metric.metric->>'method'='dual_pdf_geometry'
     AND v_replay.evidence->v_metric.metric->>'value_match'='true'
     AND v_replay.evidence->v_metric.metric->'independent_engines'='["MuPDF","Poppler"]'::jsonb)
   THEN RAISE EXCEPTION 'REC161_DUAL_READER_EVIDENCE_MISSING_%',v_metric.metric; END IF;
 END LOOP;
 SELECT jsonb_agg(to_jsonb(c) ORDER BY c.metric) INTO STRICT v_old_certs
 FROM public.scpi_metric_certifications c WHERE c.scpi_slug='iroko-atlas'
 AND c.source_period='2026-T3' AND c.metric IN('tof','capitalisation','prix_souscription');
 IF jsonb_array_length(v_old_certs)<>3 THEN RAISE EXCEPTION 'REC161_MISSING_EXPECTED_CERTS';END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery161:iroko-atlas:2026-T3:source-html-to-pdf',
 '3 original issuer PDF verified metrics only; remaining HTML metrics low confidence; queue QA retained; no overall certification',
 jsonb_build_object('before_bulletin',to_jsonb(v_original),'before_registry',to_jsonb(v_registry),
 'before_queue',to_jsonb(v_task),'before_certs',v_old_certs,'publisher_pdf_replay',to_jsonb(v_replay),
 'human_attestation',false,'all_fields_certified',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_bulletins b SET
 source_url=v_pdf_url,pdf_path=v_replay.pdf_path,pdf_sha256=v_sha,
 qa_status='auto_partial_review',
 extraction_json=jsonb_set(coalesce(b.extraction_json,'{}'::jsonb),'{source_review}',
 jsonb_build_object('issuer_pdf_url',v_pdf_url,'issuer_pdf_sha256',v_sha,
 'issuer_pdf_pages',11,'issuer_pdf_bytes',3971612,
 'only_dual_verified_metrics',jsonb_build_array('tof','capitalisation','prix_souscription'),
 'legacy_html_source',v_old_url,'html_derived_other_metrics_pending',true,
 'universal_financial_certification',false,'human_attestation',false),true)
 WHERE b.id=v_original.id AND b.source_url=v_old_url AND b.pdf_path IS NULL;
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 IF v_rows<>1 THEN RAISE EXCEPTION 'REC161_BULLETIN_UPDATE_CONFLICT';END IF;
 FOR v_metric IN SELECT * FROM (VALUES
 ('tof','9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid,96.65::numeric,6),
 ('capitalisation','e750c076-5fb0-4bce-80ce-88fce0f380c7'::uuid,218.83::numeric,2),
 ('prix_souscription','81a86fb4-a83d-49ad-8d1c-c1fc5b4134d2'::uuid,200::numeric,2))
 m(metric,certid,val,page_num)
 LOOP
 UPDATE public.scpi_metric_certifications c SET
 source_url=v_pdf_url,source_page=v_metric.page_num,
 verification_method='issuer_original_pdf_dual_reader_sha_verified',
 extraction_confidence=0.98,
 evidence_text='Iroko Atlas 2026-T3 PDF original éditeur SHA-256 '||v_sha||
  ', page '||v_metric.page_num||', '||v_metric.metric||' = '||v_metric.val||
  '. MuPDF: '||(v_replay.evidence->v_metric.metric->>'text')||
  ' ; Poppler: '||(v_replay.evidence->v_metric.metric->>'poppler_text')||
  '. Relecture indépendante de la valeur et légende. Aucune attestation humaine.'
 WHERE c.id=v_metric.certid AND c.value_numeric=v_metric.val
 AND c.source_url=v_old_url AND c.source_page IS NULL;
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 IF v_rows<>1 THEN RAISE EXCEPTION 'REC161_CERT_UPDATE_CONFLICT_%',v_metric.metric;END IF;
 END LOOP;
 SELECT scpi_internal.tof_bulletin_source_rejection_reason(c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status)
 INTO v_check FROM public.scpi_metric_certifications c WHERE c.id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid;
 IF v_check IS NOT NULL THEN RAISE EXCEPTION 'REC161_TOF_POLICY_REJECTED_%',v_check;END IF;
 UPDATE public.scpi_backfill_queue q SET
 source_url=v_pdf_url,
 source_document='Official Iroko Atlas T3 2026 PDF SHA '||v_sha||' 11p; three financial metrics dual verified; others QA pending',
 status='qa_review',
 verification_status='issuer_pdf_three_fields_verified_others_pending',
 last_error='Official T3 2026 PDF confirmed. TOF, capitalisation and prix_souscription verified p6/2; other financial fields still need QA.',
 updated_at=now()
 WHERE q.id=v_task.id AND q.status='not_applicable' AND q.verification_status='future_period';
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 IF v_rows<>1 THEN RAISE EXCEPTION 'REC161_QUEUE_CONFLICT';END IF;
 UPDATE public.scpi_source_registry r SET bulletin_url=v_pdf_url,updated_at=now()
 WHERE r.id=v_registry.id AND r.bulletin_url=v_old_url AND r.verification_status='verified'
 AND r.confidence_level='medium';
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 IF v_rows<>1 THEN RAISE EXCEPTION 'REC161_REGISTRY_CONFLICT';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_registry r WHERE r.id=v_registry.id AND r.verification_status='verified'
 AND r.confidence_level='medium' AND r.bulletin_url=v_pdf_url)
 THEN RAISE EXCEPTION 'REC161_OVERPROMOTION';END IF;
END $rec161$;