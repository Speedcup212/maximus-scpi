-- RECOVERY-170 revised by RECOVERY-172 after an authorized OIDC worker
-- independently completed the original T3 PDF source replay during the preflight
-- / migration race. The historical SQL was NOT applied: fail-closed on TOF cert.
-- This source-scoped correction ONLY fixes the stale "not published" backfill row.
-- It recognizes valid independent TOF p5, but maintains official valuation in QA.
-- No new financial values, source-ready flag, extra PDF queue or human signoff.
DO $rec170_reconciled$
DECLARE old_queue public.scpi_backfill_queue%ROWTYPE;
 old_registry public.scpi_source_registry%ROWTYPE;
 original_bulletin public.scpi_bulletins%ROWTYPE;
 original_replay maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 certified_tof public.scpi_metric_certifications%ROWTYPE;
 trusted_2026_t2 public.scpi_indicator_history%ROWTYPE;
 approved_url text:='https://www.praemiareim.fr/documents/14836074/14836332/PRAEMIA_BTI_Praemia_Hotels_Europe_T3_2026_VDEF.pdf/6ef65e62-c097-7cce-d524-984e8b402ca0?t=1793984832890';
 approved_sha text:='0c1fd34bc775e93a503fd1587117ec6ce1670055bca710b042b102c36eff4b62';
 changed integer;
BEGIN
 SELECT * INTO STRICT old_registry FROM public.scpi_source_registry AS r
 WHERE r.scpi_slug='praemia-hotels-europe' AND r.last_document_period='2026-T3'
 AND r.bulletin_url=approved_url AND r.verification_status='incomplete'
 AND r.confidence_level='high'
 AND r.last_error='Rejets QA: prix_reconstitution: incohérente avec la valeur de réalisation';
 SELECT * INTO STRICT old_queue FROM public.scpi_backfill_queue AS q
 WHERE q.id='142bed0c-5e30-4ce4-9b02-085f3a0e06dc'::uuid
 AND q.scpi_slug='praemia-hotels-europe' AND q.source_period='2026-T3'
 AND q.source_kind='bulletin' AND q.status='not_applicable'
 AND q.verification_status='official_not_published_as_of_2026-10-01'
 AND q.source_url IS NULL FOR UPDATE;
 SELECT * INTO STRICT original_bulletin FROM public.scpi_bulletins AS b
 WHERE b.id='f2248c10-415d-421c-b186-8f25e9bbc838'::uuid
 AND b.scpi_slug='praemia-hotels-europe' AND b.period='2026-T3'
 AND b.source_url=approved_url AND b.pdf_sha256=approved_sha
 AND b.pdf_path='praemia-hotels-europe/2026-T3/'||approved_sha||'.pdf'
 AND b.qa_status='auto_partial_review'
 AND (b.extraction_json->'metrics'->>'prix_reconstitution')::numeric=169.68
 AND (b.extraction_json->'metrics'->>'valeur_realisation')::numeric=169.68;
 IF NOT EXISTS(SELECT 1 FROM storage.objects AS o
 WHERE o.bucket_id='scpi-bulletins' AND o.name=original_bulletin.pdf_path
 AND (o.metadata->>'size')::bigint=1257956)
 THEN RAISE EXCEPTION 'REC172_ISSUER_ORIGINAL_ARCHIVE_NOT_MATCHED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors AS co
 WHERE co.scpi_slug='praemia-hotels-europe'
 AND 'www.praemiareim.fr'=ANY(co.allowed_hosts))
 THEN RAISE EXCEPTION 'REC172_ISSUER_HOST_NOT_APPROVED'; END IF;
 SELECT * INTO STRICT trusted_2026_t2 FROM public.scpi_indicator_history AS h
 WHERE h.scpi_slug='praemia-hotels-europe' AND h.source_period='2026-T2'
 AND h.qa_status='manual_verified' AND h.source_confidence>=0.95
 AND h.tof=97.6 AND h.prix_reconstitution=199.01
 AND h.valeur_realisation=169.68;
 SELECT * INTO STRICT original_replay FROM maximus_agents.scpi_bulletin_replay_documents AS d
 WHERE d.document_key=original_bulletin.id::text
 AND d.bulletin_id=original_bulletin.id
 AND d.scpi_slug='praemia-hotels-europe' AND d.source_period='2026-T3'
 AND d.origin='registered_bulletin' AND d.source_url=approved_url
 AND d.pdf_sha256=approved_sha AND d.expected_sha256=approved_sha
 AND d.pdf_path=original_bulletin.pdf_path
 AND d.status='extracted' AND d.processing_complete
 AND d.page_count=9 AND d.pages_read=9
 AND d.result->>'identity_verified'='true'
 AND d.result->>'period_verified'='true'
 AND d.field_coverage->>'tof'='verified'
 AND d.field_coverage->>'prix_reconstitution'='needs_review'
 AND d.field_coverage->>'valeur_realisation'='needs_review'
 AND (d.metrics->>'tof')::numeric=97.5
 AND d.metrics->>'prix_reconstitution' IS NULL
 AND d.metrics->>'valeur_realisation' IS NULL
 AND (d.evidence->'tof'->>'value')::numeric=97.5
 AND (d.evidence->'tof'->>'page')::integer=5
 AND d.evidence->'tof'->>'reference_date'='2026-09-30'
 AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
 AND d.evidence->'tof'->>'definition'='reported_metric'
 AND d.evidence->'tof'->>'value_match'='true'
 AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
 SELECT * INTO STRICT certified_tof FROM public.scpi_metric_certifications AS c
 WHERE c.id='90cf3a4f-2fbc-41a1-a8f6-b0730ecd6efd'::uuid
 AND c.scpi_slug='praemia-hotels-europe' AND c.source_period='2026-T3'
 AND c.metric='tof' AND c.value_numeric=97.5 AND c.unit='%'
 AND c.source_url=approved_url AND c.source_page=5
 AND c.bulletin_id=original_bulletin.id
 AND c.verification_method='pdf_page_text_match_dual_mupdf_poppler'
 AND c.verification_status='auto_verified_with_evidence'
 AND c.extraction_confidence>=0.95
 AND c.evidence_text LIKE '%SHA256='||approved_sha||'%';
 IF scpi_internal.tof_bulletin_source_rejection_reason(
 certified_tof.scpi_slug,certified_tof.source_url,certified_tof.evidence_text,
 certified_tof.verification_method,certified_tof.verification_status) IS NOT NULL
 THEN RAISE EXCEPTION 'REC172_PUBLISHER_TOF_POLICY_REJECTED'; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_metric_certifications AS c
 WHERE c.scpi_slug='praemia-hotels-europe' AND c.source_period='2026-T3'
 AND c.metric IN('prix_reconstitution','valeur_realisation'))
 THEN RAISE EXCEPTION 'REC172_NEW_VALUATION_CERT_REQUIRES_SEPARATE_REVIEW'; END IF;
 IF EXISTS(SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 AS x
 WHERE x.scpi_slug='praemia-hotels-europe' AND x.source_period='2026-T3')
 THEN RAISE EXCEPTION 'REC172_TOF_QUARANTINE_UNRESOLVED'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery170:praemia-hotels-europe:2026-T3:source-QA-first',
 'Original publisher document and TOF were independently validated by existing OIDC replay before migration; valuation conflict remains open and queue must reflect QA rather than the false October publication absence',
 jsonb_build_object('queue_before',to_jsonb(old_queue),
 'registry_before',to_jsonb(old_registry),
 'issuer_original',to_jsonb(original_bulletin),
 'complete_original_pdf_dual_reader_replay',to_jsonb(original_replay),
 'certified_tof_only',to_jsonb(certified_tof),
 'prior_period_verified_valuation',to_jsonb(trusted_2026_t2),
 'concurrent_replay_preflight_race_reconciled',true,
 'new_financial_certification',false,'human_attestation',false,
 'fund_pass_override',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_backfill_queue AS q SET
 status='qa_review',
 verification_status='issuer_pdf_tof_verified_valuation_conflict_open',
 source_url=approved_url,
 source_document='Praemia Hotels Europe T3 2026 PDF officiel, 9 pages SHA '||approved_sha||
  '. TOF 97.5% p5 MuPDF/Poppler vérifié. Valorisation T3 en conflit, revue nécessaire.',
 last_error='T3 source PDF officielle archivée et 9/9 pages lues; TOF 97,5 % certifié p5, reconstruction/réalisation non certifiées (valeurs 169,68 identiques suggérées par l extraction edge). T2 officiel reconstitution 199,01 et réalisation 169,68. Maintenir FAIL jusqu à preuves indépendantes.',
 updated_at=now()
 WHERE q.id=old_queue.id AND q.status='not_applicable'
 AND q.verification_status='official_not_published_as_of_2026-10-01'
 AND q.source_url IS NULL;
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>1 THEN RAISE EXCEPTION 'REC172_CONCURRENT_QUEUE_CHANGE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_backfill_queue AS q
 WHERE q.id=old_queue.id AND q.status='qa_review'
 AND q.verification_status='issuer_pdf_tof_verified_valuation_conflict_open'
 AND q.source_url=approved_url)
 THEN RAISE EXCEPTION 'REC172_QUEUE_READBACK_FAILED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_crash_test_strict_v2 AS v
 WHERE v.scpi_slug='praemia-hotels-europe'
 AND v.crash_test_status='FAIL_STRICT'
 AND v.source_ready=false AND v.quarterly_blockers=1
 AND v.quarterly_qa_review=1)
 THEN RAISE EXCEPTION 'REC172_SOURCE_FINANCIAL_QA_LOCK_NOT_HELD'; END IF;
END $rec170_reconciled$;