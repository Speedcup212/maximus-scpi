-- Publisher-first documentary candidates: SCPI Patrimmo Commerce (Praemia).
-- URL discovery is not certification: only exact-issue dual-PDF evidence is released.
WITH candidates(scpi_slug,source_period,source_url) AS (VALUES
 ('patrimmo-commerce','2024-T1','https://www.praemiareim.fr/documents/14836074/14836275/Patrimmo%2BCommerce%2B-%2BBulletin%2Bd%27information%2B-%2B2024%2BT1.pdf/e9544e2d-4918-5472-2b63-e9d0580b7101?t=1715957463409'),
 ('patrimmo-commerce','2024-T2','https://www.praemiareim.fr/documents/14836074/14836275/Patrimmo%2BCommerce%2B-%2BBulletin%2Bd%27information%2B-%2B2024%2BT2.pdf/79d5f547-14b7-72fe-41dc-72acce5e61be?t=1722499029860'),
 ('patrimmo-commerce','2024-T4','https://www.praemiareim.fr/documents/14836074/14836275/Patrimmo%2BCommerce%2B-%2BBulletin%2Bd%27information%2B-%2B2024%2BT4.pdf/d8f22a1c-e526-673e-07e4-86efd714c25a?t=1738863421339')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents(document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(c.scpi_slug||':'||c.source_period||':'||c.source_url),c.scpi_slug,c.source_period,c.source_url,
 'backfill_reference','queued',jsonb_build_object('discovery',jsonb_build_object('method','primary_issuer_pdf_search_20261029',
 'proof_level','issuer_source_discovered_pending_dual_reader_issue_and_financial_qa'))
FROM candidates c
WHERE public.scpi_bulletin_replay_source_trusted(c.scpi_slug,c.source_url)
ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;
