-- Recover exact original issuer PDFs, NOT a third-party data page.
-- Source discovery: ATLAND Voisin official document hub, official FIDUCIAL
-- Gérance Ficommerce page. PDF identity/issue/dual native-reader gates apply.
-- Reprocessing a source does not automatically certify all of its fields.
WITH sources(slug,period,url,publisher_page) AS (
 VALUES
 ('epargne-pierre','2025-T2','https://atland-voisin.com/wp-content/uploads/2025/07/BPI2T2025-EP-web-avec-annexe-1.pdf',
 'https://atland-voisin.com/documentation/?category=bulletin-trimestriel'),
 ('ficommerce-proximite','2025-T4','https://www.fiducial-gerance.fr/content/download/1264/37262?version=9',
 'https://www.fiducial-gerance.fr/investir-en-scpi/nos-scpi/ficommerce-proximite')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
 (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(slug||':'||period||':'||url),
slug,period,url,'publisher_link','queued',
jsonb_build_object('discovery',jsonb_build_object(
 'method','exact_issuer_document_link_20261029',
 'publisher_page',publisher_page,'candidate_only',true,
 'certification','PENDING_FULL_PDF_IDENTITY_PERIOD_AND_DUAL_READER_QA'))
FROM sources
WHERE public.scpi_bulletin_replay_source_trusted(slug,url)
ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;
