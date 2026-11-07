-- RECOVERY-157 — Iroko Zen 2026-T3 source ledger: replace misleading HTML "PDF" reference
-- with issuer CDN archived original SHA; TOF only is independently source certified.
-- Preserve low confidence for other HTML-extracted fields, no universal PASS promotion.
DO $r157$
DECLARE prior_b public.scpi_bulletins%ROWTYPE;
 prior_c public.scpi_metric_certifications%ROWTYPE;
 prior_h public.scpi_indicator_history%ROWTYPE;
 prior_r public.scpi_source_registry%ROWTYPE;
 prior_q public.scpi_backfill_queue%ROWTYPE;
 original_pdf maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 verified_url text:='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Zen_bulletin_trimestriel_T3_2026.pdf';
 verified_sha text:='6b42208fa4c104879d5cb025a5d46e7fdc79a370c7200fe9b8bc0ed8fe7caae1';
 old_html text:='https://www.iroko.eu/bulletins-trimestriels/t3-2026';
 n int;
BEGIN
 SELECT * INTO STRICT prior_b FROM public.scpi_bulletins b
 WHERE b.id='208f81fb-e425-4e62-9750-6d1988d01543'::uuid
  AND b.scpi_slug='iroko-zen' AND b.period='2026-T3' AND b.source_url=old_html
  AND b.pdf_path IS NULL AND b.qa_status='auto_verified'
  AND b.pdf_sha256='9f46606649cf371efa3f0c3fb60c76eb568eb1d453f1c4486310fb5ccda135af'
 FOR UPDATE;
 SELECT * INTO STRICT prior_c FROM public.scpi_metric_certifications c
 WHERE c.id='484f6e39-397c-44ef-af94-688fdbea56f0'::uuid
  AND c.scpi_slug='iroko-zen' AND c.source_period='2026-T3' AND c.metric='tof'
  AND c.value_numeric=96.61 AND c.verification_status='auto_verified_with_evidence'
  AND c.source_url=old_html AND c.source_page IS NULL
  AND c.extraction_confidence<0.95 FOR UPDATE;
 SELECT * INTO STRICT prior_h FROM public.scpi_indicator_history h
 WHERE h.id='9ced4163-1f85-4d81-b9a8-51b139ca22c0'::uuid
  AND h.scpi_slug='iroko-zen' AND h.source_period='2026-T3'
  AND h.tof=96.61 AND h.source_url=old_html AND h.source_confidence<0.95
 FOR UPDATE;
 SELECT * INTO STRICT prior_r FROM public.scpi_source_registry r
 WHERE r.scpi_slug='iroko-zen' AND r.bulletin_url=old_html
  AND r.verification_status='verified' AND r.confidence_level='medium'
 FOR UPDATE;
 SELECT * INTO STRICT prior_q FROM public.scpi_backfill_queue q
 WHERE q.id='0adbbb1a-87f3-4e67-a301-79eeccc9c082'::uuid
  AND q.scpi_slug='iroko-zen' AND q.source_period='2026-T3'
  AND q.source_kind='bulletin' AND q.status='qa_review'
  AND q.source_url=old_html||'#' FOR UPDATE;
 SELECT * INTO STRICT original_pdf FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.document_key='ref:e5c66c46dd60e1ad0b7f186c1df021a5'
  AND d.origin='publisher_link' AND d.scpi_slug='iroko-zen' AND d.source_period='2026-T3'
  AND d.source_url=verified_url AND d.pdf_sha256=verified_sha
  AND d.pdf_path='iroko-zen/2026-T3/'||verified_sha||'.pdf'
  AND d.processing_complete AND d.pages_read=17 AND d.page_count=17
  AND d.status='extracted' AND d.field_coverage->>'tof'='verified'
  AND (d.metrics->>'tof')::numeric=96.61
  AND (d.evidence->'tof'->>'page')::int=7
  AND (d.evidence->'tof'->>'value')::numeric=96.61
  AND d.evidence->'tof'->>'method'='dual_pdf_geometry'
  AND d.evidence->'tof'->>'association'='adjacent_caption'
  AND d.evidence->'tof'->>'value_match'='true'
  AND d.evidence->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb;
 IF NOT EXISTS(SELECT 1 FROM storage.objects o
  WHERE o.bucket_id='scpi-bulletins' AND o.name=original_pdf.pdf_path
  AND (o.metadata->>'size')::bigint=2443057)
 THEN RAISE EXCEPTION 'REC157_ISSUER_ARCHIVE_NOT_EXACT_BINARY'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_source_connectors sc
  WHERE sc.scpi_slug='iroko-zen'
  AND 'iroko-documents.s3.eu-west-3.amazonaws.com'=ANY(sc.allowed_hosts))
 THEN RAISE EXCEPTION 'REC157_PUBLISHER_CDN_UNAPPROVED'; END IF;
 IF EXISTS(SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 q
  WHERE q.scpi_slug='iroko-zen' AND q.source_period='2026-T3')
 THEN RAISE EXCEPTION 'REC157_QUARANTINE_REQUIRES_INDEPENDENT_REVIEW'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery157:iroko-zen:2026-T3:official-binary-source',
 'Issuer publisher-link PDF 17/17, exact SHA and TOF 96.61 p7 dual readers; registered HTML reference replaced but all other HTML-derived metric certifications retain their original lower confidence',
 jsonb_build_object('before_bulletin',to_jsonb(prior_b),'before_tof_cert',to_jsonb(prior_c),
  'before_history',to_jsonb(prior_h),'before_registry',to_jsonb(prior_r),
  'before_queue',to_jsonb(prior_q),'issuer_original_replay',to_jsonb(original_pdf),
  'certified_metric','tof','human_attestation',false,'universal_certification',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_bulletins b SET
  source_url=verified_url, pdf_sha256=verified_sha, pdf_path=original_pdf.pdf_path,
  qa_status='auto_partial_review',
  extraction_json=jsonb_set(COALESCE(b.extraction_json,'{}'::jsonb),
     '{source_review}',jsonb_build_object(
      'verified_pdf_url',verified_url,'verified_pdf_sha256',verified_sha,'pdf_bytes',2443057,
      'tof_source_page',7,'tof_independent_engines',jsonb_build_array('MuPDF','Poppler'),
      'legacy_html_source',old_html,
      'other_html_metrics_remain_lower_confidence',true,
      'complete_financial_certification',false,'human_attestation',false),true)
 WHERE b.id=prior_b.id AND b.source_url=old_html AND b.pdf_path IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC157_BULLETIN_UPDATE_FAILED'; END IF;
 UPDATE public.scpi_metric_certifications c SET
  source_url=verified_url,source_page=7,extraction_confidence=0.98,
  verification_method='pdf_issuer_original_archived_sha_dual_reader',
  evidence_text='Iroko Zen T3 2026 - official issuer original PDF 17p, SHA256 '||verified_sha||
   '. Page 7 TOF global 96,61 %, correspondance MuPDF et Poppler: '||
   (original_pdf.evidence->'tof'->>'text')||
   '. Valeur officielle, ne pas substituer les composantes vacance ou ASPIM. '||
   'Source officielle et document unique par produit/période. QA automatique, pas d attestation humaine.'
 WHERE c.id=prior_c.id AND c.value_numeric=96.61 AND c.source_url=old_html AND c.source_page IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC157_CERTIFICAT_TOF_UPDATE_FAILED'; END IF;
 IF scpi_internal.tof_bulletin_source_rejection_reason('iroko-zen',verified_url,
   (SELECT evidence_text FROM public.scpi_metric_certifications WHERE id=prior_c.id),
   'pdf_issuer_original_archived_sha_dual_reader','auto_verified_with_evidence') IS NOT NULL
 THEN RAISE EXCEPTION 'REC157_OFFICIAL_TOF_POLICY_REJECTION'; END IF;
 UPDATE public.scpi_indicator_history h SET metric_provenance=jsonb_set(
  COALESCE(h.metric_provenance,'{}'::jsonb),'{tof}',
   jsonb_build_object('value',96.61,'unit','%','source_page',7,
     'source_url',verified_url,'sha256',verified_sha,'document_period','2026-T3',
     'reference_date','2026-09-30','verification','exact_original_dual_reader_geometry',
     'human_attestation',false,'other_html_fields_still_pending_QA',true),true)
 WHERE h.id=prior_h.id AND h.source_url=old_html AND h.source_confidence<0.95;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC157_HISTORY_PROVENANCE_UPDATE_FAILED'; END IF;
 UPDATE public.scpi_backfill_queue q SET
   source_url=verified_url,
   source_document='Iroko Zen original issuer PDF T3 2026 SHA '||verified_sha,
   status='already_loaded',verification_status='dual_pdf_page_evidence_verified',
   last_error=NULL,updated_at=now()
 WHERE q.id=prior_q.id AND q.status='qa_review' AND q.source_url=old_html||'#';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC157_BACKFILL_QUEUE_UPDATE_FAILED'; END IF;
 UPDATE public.scpi_source_registry r SET
  bulletin_url=verified_url,updated_at=now()
 WHERE r.id=prior_r.id AND r.bulletin_url=old_html
  AND r.verification_status='verified' AND r.confidence_level='medium';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'REC157_SOURCE_POINTER_UPDATE_FAILED'; END IF;
 -- NO source_confidence or source_ready flag elevation. Other metrics remain HTML-only.
 IF (SELECT source_confidence FROM public.scpi_indicator_history WHERE id=prior_h.id) <> prior_h.source_confidence
 OR (SELECT confidence_level FROM public.scpi_source_registry WHERE id=prior_r.id) <> 'medium'
 THEN RAISE EXCEPTION 'REC157_ILLEGAL_OVERPROMOTION'; END IF;
END $r157$;