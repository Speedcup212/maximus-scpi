-- Exact first-party PDF sources identified and indexed for six fund-quarters.
-- La Française doc URLs are PDF documents despite extension-less API paths;
-- never infer their format or financial data from URL alone.
WITH sources(scpi_slug,source_period,source_url) AS (VALUES ('epargne-pierre','2024-T1','https://atland-voisin.com/wp-content/uploads/2024/05/ATLAND_VOISIN_BPI-EP-1T2024-VDEF.pdf'),
('epargne-pierre','2024-T2','https://atland-voisin.com/wp-content/uploads/2024/07/ATLAND_VOISIN_BPI-EP-2T2024-WEB.pdf'),
('epargne-pierre','2024-T3','https://atland-voisin.com/wp-content/uploads/2024/10/ATLAND_VOISIN_BPI-EP-3T2024-WEB-1.pdf'),
('epargne-pierre','2024-T4','https://atland-voisin.com/wp-content/uploads/2025/02/ATLAND_VOISIN_BPI-EP-4T2024-WEB.pdf'),
('lf-europimmo','2025-T2','https://doc.la-francaise.com/documents/bulletin-trimestriel-lf-europimmo-30062025'),
('lf-avenir-sante','2025-T2','https://doc.la-francaise.com/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'))
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
  (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(s.scpi_slug||':'||s.source_period||':'||s.source_url),
 s.scpi_slug,s.source_period,s.source_url,'backfill_reference','queued',
 jsonb_build_object('discovery',jsonb_build_object(
  'method','indexed_atland_lafrancaise_primary_issuer_archive',
  'observed_on','2026-10-29','identity_period_and_numeric_certification','PENDING_FULL_PDF_TWO_READERS'))
FROM sources s
WHERE public.scpi_bulletin_replay_source_trusted(s.scpi_slug,s.source_url)
ON CONFLICT (scpi_slug,source_period,source_url) DO NOTHING;
