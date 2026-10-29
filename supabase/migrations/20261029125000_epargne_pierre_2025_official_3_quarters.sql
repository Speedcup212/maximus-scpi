-- Recover Q1/Q3/Q4 2025 of Epargne Pierre using ATLAND Voisin originals
-- in place of an obsolete SCPI-Lab "BT1 2025" URL applied to every quarter.
-- No inferred numeric values. One exact issuer quarter and fund per URL;
-- PDF full-read, identity and double-reader QA still gate certification.
WITH sources(slug,period,url) AS (VALUES
 ('epargne-pierre','2025-T1','https://atland-voisin.com/wp-content/uploads/2025/04/BPI2025-EP-avec-annexe-WEB.pdf'),
 ('epargne-pierre','2025-T3','https://atland-voisin.com/wp-content/uploads/2025/11/BPI3T2025-EP-VDEF-web-reduit.pdf'),
 ('epargne-pierre','2025-T4','https://atland-voisin.com/wp-content/uploads/2026/02/BPI4T2025-EP-vdef-web-compresse-1.pdf')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
 (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(slug||':'||period||':'||url),
slug,period,url,'publisher_link','queued',
jsonb_build_object('discovery',jsonb_build_object(
 'method','exact_atland_issuer_2025_backfill',
 'issuer_name','ATLAND Voisin','candidate_only',true,
 'supersedes_third_party_url','https://www.scpi-lab.com/scpi/scpi-epargne-pierre-40/information/bt1-2025',
 'certification','PENDING_FULL_PDF_IDENTITY_PERIOD_AND_DUAL_READER_QA'))
FROM sources
WHERE public.scpi_bulletin_replay_source_trusted(slug,url)
ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;
