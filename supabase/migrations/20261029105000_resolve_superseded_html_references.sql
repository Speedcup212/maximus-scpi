-- A product page is never an issuer bulletin. If a different original
-- issuer PDF for the EXACT fund and quarter has subsequently passed complete
-- document scan, product identity, period and SHA, resolve its placeholder
-- without changing financial certifications, source URL or audit evidence.
-- Unresolved periods stay flagged; repeat-safe, no false 100% claims.
WITH verified_source AS (
  SELECT d.document_key placeholder_key,
    (SELECT jsonb_build_object(
       'verified_pdf_document_key',v.document_key,
       'verified_pdf_source_url',v.source_url,
       'verified_pdf_sha256',v.pdf_sha256,
       'pdf_scan_complete',true,
       'fund_and_quarter_verified',true,
       'financial_certification',CASE WHEN v.financial_complete THEN 'complete' ELSE 'partial_still_under_review' END,
       'resolution_reason','independently_verified_same_fund_same_quarter_official_pdf',
       'resolved_at',now()
      )
     FROM maximus_agents.scpi_bulletin_replay_documents v
     WHERE v.scpi_slug=d.scpi_slug AND v.source_period=d.source_period
       AND v.document_key<>d.document_key
       AND v.status='extracted'
       AND v.processing_complete=true
       AND v.result->>'identity_verified'='true'
       AND v.result->>'period_verified'='true'
       AND v.pdf_sha256 ~ '^[0-9a-f]{64}$'
       AND public.scpi_bulletin_replay_source_trusted(v.scpi_slug,v.source_url)
     ORDER BY v.processed_at DESC NULLS LAST, v.document_key
     LIMIT 1) AS proof
  FROM maximus_agents.scpi_bulletin_replay_documents d
  WHERE d.status='source_reference_review'
    AND d.source_url !~* '[.]pdf([/?].*)?$'
)
UPDATE maximus_agents.scpi_bulletin_replay_documents d
 SET status='source_reference_resolved',
     next_try_at='infinity'::timestamptz,
     result=coalesce(d.result,'{}'::jsonb)||jsonb_build_object(
       'issuer_pdf_resolution',s.proof,
       'resolved_without_inferred_financial_values',true),
     updated_at=now()
 FROM verified_source s
 WHERE d.document_key=s.placeholder_key AND s.proof IS NOT NULL
   AND d.status='source_reference_review';
