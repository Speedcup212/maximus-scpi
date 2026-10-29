-- A stale secondary URL returning 403 is not a permanent missing-bulletin
-- incident when the exact fund+quarter's own official issuer PDF was already
-- fully downloaded and independently validated. Preserve the transport error,
-- source URL, attempts and audit evidence; resolve the obsolete URL only.
WITH matched AS (
 SELECT old.document_key,
  (SELECT jsonb_build_object(
    'verified_pdf_document_key',v.document_key,
    'verified_pdf_url',v.source_url,
    'verified_pdf_sha256',v.pdf_sha256,
    'verified_pdf_pages_read',v.pages_read,
    'issuer_fund_verified',true,
    'issuer_period_verified',true,
    'financial_complete',v.financial_complete,
    'reason','original_issuer_pdf_validated_for_same_fund_and_quarter',
    'resolved_at',now())
   FROM maximus_agents.scpi_bulletin_replay_documents v
   WHERE v.scpi_slug=old.scpi_slug
     AND v.source_period=old.source_period
     AND v.document_key<>old.document_key
     AND v.status='extracted'
     AND v.processing_complete=true
     AND v.page_count=v.pages_read
     AND v.result->>'identity_verified'='true'
     AND v.result->>'period_verified'='true'
     AND v.pdf_sha256~'^[0-9a-f]{64}$'
     AND public.scpi_bulletin_replay_source_trusted(v.scpi_slug,v.source_url)
   ORDER BY v.processed_at DESC NULLS LAST,v.document_key
   LIMIT 1) AS proof
 FROM maximus_agents.scpi_bulletin_replay_documents old
 WHERE old.status='fetch_error' AND
       old.source_url!~*'\.pdf([/?].*)?$'
)
UPDATE maximus_agents.scpi_bulletin_replay_documents d
SET status='source_reference_resolved',
    next_try_at='infinity'::timestamptz,
    result=coalesce(d.result,'{}'::jsonb)||jsonb_build_object(
      'superseded_by_official_original_pdf',m.proof,
      'old_fetch_error_retained',d.result->>'error',
      'resolved_without_new_financial_certification',true),
    updated_at=now()
FROM matched m
WHERE d.document_key=m.document_key AND m.proof IS NOT NULL
AND d.status='fetch_error';
