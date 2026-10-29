-- 2025-T2 issuer original URL returns HTTP 404 but the exact same
-- quarter/fund's PDF from La Française's own Moniwan operator was fully
-- downloaded, dual-read and independently checked. A failed URL remains
-- archived as evidence; it is NOT relabelled as a successfully read PDF.
-- Only these two exact old URLs / new URLs / fund-quarter are permitted.
DO $resolve$
DECLARE pair record; old_row maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 verified_row maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 audit_key text;
BEGIN
 FOR pair IN SELECT * FROM (VALUES
 ('lf-avenir-sante'::text,'2025-T2'::text,
 'https://doc.la-francaise.com/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'::text,
 'https://www.moniwan.fr/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'::text),
 ('lf-europimmo'::text,'2025-T2'::text,
 'https://doc.la-francaise.com/documents/bulletin-trimestriel-lf-europimmo-30062025'::text,
 'https://www.moniwan.fr/documents/bulletin-trimestriel-lf-europimmo-30062025'::text)
 ) x(scpi_slug,period,old_url,actual_url)
 LOOP
  SELECT * INTO STRICT verified_row FROM maximus_agents.scpi_bulletin_replay_documents
    WHERE scpi_slug=pair.scpi_slug AND source_period=pair.period AND source_url=pair.actual_url;
  IF verified_row.status<>'extracted'
     OR verified_row.processing_complete IS DISTINCT FROM true
     OR verified_row.result->>'identity_verified'<>'true'
     OR verified_row.result->>'period_verified'<>'true'
     OR verified_row.pdf_sha256 !~ '^[a-f0-9]{64}$'
     OR NOT public.scpi_bulletin_replay_source_trusted(pair.scpi_slug,pair.actual_url)
  THEN RAISE EXCEPTION 'Replacement original-issuer PDF not fully verified: %',pair.scpi_slug; END IF;
  SELECT * INTO STRICT old_row FROM maximus_agents.scpi_bulletin_replay_documents
    WHERE scpi_slug=pair.scpi_slug AND source_period=pair.period
      AND source_url=pair.old_url FOR UPDATE;
  IF old_row.status='source_reference_resolved'
      AND old_row.result->'issuer_pdf_resolution'->>'verified_pdf_document_key'=verified_row.document_key THEN
    CONTINUE;
  END IF;
  IF old_row.status<>'fetch_error'
     OR coalesce(old_row.result->>'error','') NOT ILIKE '%404%'
  THEN RAISE EXCEPTION 'Original broken URL not a 404 as expected: %',pair.scpi_slug; END IF;
  audit_key:='lafrancaise-superseded-404-'||pair.scpi_slug||'-2025-T2';
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
   VALUES(audit_key,'Dead original URL superseded by first-party group distributed, exact-quarter PDF',
      jsonb_build_object('old_failed_url',to_jsonb(old_row),'verified_replacement_pdf',
        jsonb_build_object('document_key',verified_row.document_key,'source_url',verified_row.source_url,
          'source_period',verified_row.source_period,'sha256',verified_row.pdf_sha256,
          'identity_verified',true,'period_verified',true)))
  ON CONFLICT(event_key) DO NOTHING;
  UPDATE maximus_agents.scpi_bulletin_replay_documents
    SET status='source_reference_resolved',next_try_at='infinity'::timestamptz,
        result=coalesce(result,'{}'::jsonb)||jsonb_build_object(
          'issuer_pdf_resolution',jsonb_build_object(
            'verified_pdf_document_key',verified_row.document_key,
            'verified_pdf_source_url',verified_row.source_url,
            'verified_pdf_sha256',verified_row.pdf_sha256,
            'fund_and_quarter_verified',true,'pdf_scan_complete',true,
            'financial_certification',CASE WHEN verified_row.financial_complete
             THEN 'complete' ELSE 'partial_still_under_review' END,
            'resolution_reason','dead_old_issuer_host_replaced_by_same_group_exact_quarter_pdf',
            'resolved_at',now()),
          'old_fetch_error_retained_for_audit',true,'audit_event',audit_key),
        updated_at=now()
    WHERE document_key=old_row.document_key AND status='fetch_error';
 END LOOP;
END $resolve$;

-- Idempotent companion reconciliation of the two old product-page placeholders,
-- only for these precise fund/quarter pairs and independently validated PDF.
UPDATE maximus_agents.scpi_bulletin_replay_documents d
  SET status='source_reference_resolved',next_try_at='infinity'::timestamptz,
      result=d.result||jsonb_build_object('issuer_pdf_resolution',jsonb_build_object(
       'verified_pdf_document_key',v.document_key,'verified_pdf_source_url',v.source_url,
       'verified_pdf_sha256',v.pdf_sha256,'pdf_scan_complete',true,
       'fund_and_quarter_verified',true,
       'financial_certification',CASE WHEN v.financial_complete
          THEN 'complete' ELSE 'partial_still_under_review' END,
       'resolution_reason','same_group_official_issuer_document_supersedes_product_page',
       'resolved_at',now()),'resolved_without_inferred_financial_values',true),
      updated_at=now()
  FROM maximus_agents.scpi_bulletin_replay_documents v
  WHERE d.scpi_slug=v.scpi_slug AND d.source_period=v.source_period
   AND d.scpi_slug IN ('lf-avenir-sante','lf-europimmo')
   AND d.source_period='2025-T2' AND d.status='source_reference_review'
   AND v.status='extracted' AND v.processing_complete
   AND v.result->>'identity_verified'='true'
   AND v.result->>'period_verified'='true'
   AND v.pdf_sha256 ~ '^[a-f0-9]{64}$'
   AND v.source_url=CASE v.scpi_slug
     WHEN 'lf-avenir-sante' THEN 'https://www.moniwan.fr/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'
     WHEN 'lf-europimmo' THEN 'https://www.moniwan.fr/documents/bulletin-trimestriel-lf-europimmo-30062025'
     ELSE '' END
   AND public.scpi_bulletin_replay_source_trusted(v.scpi_slug,v.source_url);
