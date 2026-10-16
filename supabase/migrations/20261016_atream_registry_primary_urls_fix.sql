-- Fix publisher registry pointers for future scheduled ingestion.
-- Both URLs were followed on the official Atream website and checked for exact fund/year.
-- Keep verification_status='incomplete' and all quarantine flags until the real PDFs
-- are ingested with verified SHA256 and source QA.
UPDATE public.scpi_source_registry
SET bulletin_url='https://atream.com/wp-content/uploads/2026/07/Bulletin-N2026_2T-SCPI_Atream_Hotels_WEB_10-PAGES.pdf',
 annual_report_url='https://atream.com/wp-content/uploads/2026/05/Rapport-Annuel-SCPI-Atream-Hotels-2025-Web_114-pages_compressed.pdf',
 notes=coalesce(notes,'')||' | 16/10/2026 P0: official publisher URL validated: T2-2026 BTI (10 pages) and 2025 annual report (116 PDF pages); prior Article-10/2021 references were wrong. Independent field QA is separate; registry status remains incomplete until ingested source hash is verified.',
 updated_at=now()
WHERE scpi_slug='atream-hotel'
 AND verification_status='incomplete'
 AND bulletin_url='https://atream.com/wp-content/uploads/2020/07/20260916-SCPI-Atream-Hotels-Article-10.pdf'
 AND annual_report_url='https://atream.com/wp-content/uploads/2020/07/Rapport-Annuel-Sans-Signature-97-pages-SCPI-Atream-Hotels-2021-1.pdf';