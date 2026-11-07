-- RECOVERY-170 — independent source QA for Praemia Hotels Europe T3 2026
-- Newly discovered current-quarter issuer PDF was rejected by financial QA:
-- alleged reconstruction 169.68 equals realisation 169.68, while 2026-T2
-- verified reconstruction 199.01 and realisation 169.68. Never restore PASS
-- or declare source ready before resolving source/page/figure independently.
-- Reconcile false "not published" queue; seed the EXISTING replay pipeline.
DO $rec170$
DECLARE b public.scpi_bulletins%ROWTYPE;
 r public.scpi_source_registry%ROWTYPE;
 q public.scpi_backfill_queue%ROWTYPE;
 h public.scpi_indicator_history%ROWTYPE;
 n integer;
BEGIN
 SELECT * INTO STRICT r FROM public.scpi_source_registry x
 WHERE x.scpi_slug='praemia-hotels-europe'
 AND x.last_document_period='2026-T3'
 AND x.verification_status='incomplete' AND x.confidence_level='high'
 AND x.last_error='Rejets QA: prix_reconstitution: incohérente avec la valeur de réalisation'
 FOR UPDATE;
 SELECT * INTO STRICT q FROM public.scpi_backfill_queue x
 WHERE x.id='142bed0c-5e30-4ce4-9b02-085f3a0e06dc'::uuid
 AND x.scpi_slug='praemia-hotels-europe' AND x.source_period='2026-T3'
 AND x.source_kind='bulletin' AND x.status='not_applicable'
 AND x.verification_status='official_not_published_as_of_2026-10-01'
 AND x.source_url IS NULL FOR UPDATE;
 SELECT * INTO STRICT b FROM public.scpi_bulletins x
 WHERE x.scpi_slug='praemia-hotels-europe' AND x.period='2026-T3'
 AND x.source_url=r.bulletin_url
 AND x.pdf_sha256='0c1fd34bc775e93a503fd1587117ec6ce1670055bca710b042b102c36eff4b62'
 AND x.pdf_path='praemia-hotels-europe/2026-T3/'||x.pdf_sha256||'.pdf'
 AND x.qa_status='auto_partial_review'
 AND x.extraction_json->'metrics'->>'prix_reconstitution'='169.68'
 AND x.extraction_json->'metrics'->>'valeur_realisation'='169.68';
 IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='scpi-bulletins'
 AND o.name=b.pdf_path AND (o.metadata->>'size')::bigint=1257956)
 THEN RAISE EXCEPTION 'REC170_ISSUER_ORIGINAL_ARCHIVE_UNAVAILABLE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors c
 WHERE c.scpi_slug='praemia-hotels-europe' AND 'www.praemiareim.fr'=ANY(c.allowed_hosts))
 THEN RAISE EXCEPTION 'REC170_ISSUER_HOST_UNAPPROVED'; END IF;
 SELECT * INTO STRICT h FROM public.scpi_indicator_history x
 WHERE x.scpi_slug='praemia-hotels-europe' AND x.source_period='2026-T2'
 AND x.tof=97.6 AND x.prix_reconstitution=199.01 AND x.valeur_realisation=169.68
 AND x.source_confidence>=0.95 AND x.qa_status='manual_verified';
 IF EXISTS(SELECT 1 FROM public.scpi_metric_certifications x
 WHERE x.scpi_slug='praemia-hotels-europe' AND x.source_period='2026-T3'
 AND x.metric IN('prix_reconstitution','valeur_realisation','tof'))
 THEN RAISE EXCEPTION 'REC170_CONCURRENT_NEW_CERTIFICATES_REVIEW_REQUIRED'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.scpi_slug='praemia-hotels-europe' AND d.source_period='2026-T3')
 THEN RAISE EXCEPTION 'REC170_EXISTING_REPLAY_REVIEW_REQUIRED'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery170:praemia-hotels-europe:2026-T3:source-QA-first',
 'Financial QA revoked prior fund PASS after suspect reconstruction and realization equal in new T3 PDF; preserve strict FAIL until independent issuer page reconciliation; stale T3 not-published queue corrected',
 jsonb_build_object('registry_before',to_jsonb(r),'queue_before',to_jsonb(q),
  'official_quarantined_bulletin',to_jsonb(b),'trusted_prior_t2_history',to_jsonb(h),
  'new_T3_certification_approved',false,'human_attestation',false,
  'strict_gate_relaxed',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_backfill_queue x SET
  status='qa_review',
  verification_status='issuer_pdf_original_financial_conflict_independent_QA_needed',
  source_url=b.source_url,
  source_document='Praemia Hotels Europe publisher PDF T3 2026 SHA '||b.pdf_sha256||
                  ', valuation and parts extraction suspect; double reader source check pending',
  last_error='Published T3 original archived. Publisher page/value validation required: extracted prix_reconstitution = valeur_realisation = 169.68, older official T2 reconstruction 199.01, realization 169.68; source registry held incomplete.',
  updated_at=now()
 WHERE x.id=q.id AND x.status='not_applicable'
 AND x.verification_status='official_not_published_as_of_2026-10-01';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC170_Q3_QUEUE_CHANGE_NOT_SINGLE'; END IF;
 INSERT INTO maximus_agents.scpi_bulletin_replay_documents
  (document_key,scpi_slug,source_period,source_url,bulletin_id,pdf_path,expected_sha256,origin,
   result)
 VALUES
  (b.id::text,b.scpi_slug,b.period,b.source_url,b.id,b.pdf_path,b.pdf_sha256,
   'registered_bulletin',jsonb_build_object('recovery170_reason','publisher_current_quarter_conflicting_valuation_independent_replay',
    'source_sha256',b.pdf_sha256,'financial_QA_review_required',true,'human_attestation',false))
 RETURNING 1 INTO n;
 IF n<>1 THEN RAISE EXCEPTION 'REC170_REPLAY_SEED_NOT_SINGLE';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_crash_test_strict_v2 v
 WHERE v.scpi_slug='praemia-hotels-europe' AND v.crash_test_status='FAIL_STRICT'
 AND v.source_ready=false AND v.quarterly_blockers=1)
 THEN RAISE EXCEPTION 'REC170_FUND_QA_GATE_NOT_HELD'; END IF;
END $rec170$;