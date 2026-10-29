-- Two indexed issuer-hosted Primovie PDFs, queued for independent dual-reader
-- verification. Discovery alone never changes financial data or certification.
WITH discovered(scpi_slug,source_period,source_url) AS (
 VALUES
 ('primovie','2024-T1','https://www.praemiareim.fr/documents/14836074/14836311/Primovie%2B-%2BBulletin%2Bd%27information%2B-%2B2024%2BT1.pdf/39e45f43-6a2a-c658-8e2c-624d909dc4df?t=1715957245667'),
 ('primovie','2024-T4','https://www.praemiareim.fr/documents/14836074/14836311/Primovie%2B-%2BBulletin%2Bd%27information%2B-%2B2024%2BT4.pdf/4e0496ce-dc54-ce9e-663d-d6a68c79ece9?t=1738863500028')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
 (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(x.scpi_slug||':'||x.source_period||':'||x.source_url),
 x.scpi_slug,x.source_period,x.source_url,'backfill_reference','queued',
 jsonb_build_object('discovery',
   jsonb_build_object('method','indexed_primary_issuer_pdf','observed_date','2026-10-29',
                      'proof_level','source_url_only_pending_pdf_identity_period_and_financial_qa'))
FROM discovered x WHERE public.scpi_bulletin_replay_source_trusted(x.scpi_slug,x.source_url)
ON CONFLICT (scpi_slug,source_period,source_url) DO NOTHING;
