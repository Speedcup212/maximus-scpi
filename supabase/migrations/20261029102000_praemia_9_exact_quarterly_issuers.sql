-- Nine index-verified primary-manager PDFs for exact historical quarters.
-- Only candidate URLs: full PDF download, page-by-page identity/period QA, dual reader
-- and financial certification still required. Never infer values from search snippets.
WITH candidate(scpi_slug,source_period,source_url) AS (VALUES
 ('patrimmo-commerce','2024-T3','https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T3_2024_V6.pdf/cc402e5c-e839-7c69-1c5b-87383d0eb438?t=1730912947304'),
 ('patrimmo-commerce','2025-T1','https://www.praemiareim.fr/documents/14836074/14836275/BTI_Patrimmo%2BCommerce_T1_2025.pdf/131ff8d8-d23e-9228-3870-60fc88f25174?t=1746459294165'),
 ('patrimmo-commerce','2025-T3','https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T3_2025_VDEF.pdf/8d82b8f2-c4c2-e8ff-8045-76c38fe0b08a?t=1762443795423'),
 ('patrimmo-commerce','2025-T4','https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T4_2025_VDEF.pdf/48cdd3ce-f504-f76d-e870-60036975e1d0?t=1770712823223'),
 ('patrimmo-commerce','2026-T1','https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T1_2026.pdf/5e457c39-b612-e181-6428-5ac4e126672c?t=1778509195055'),
 ('primovie','2024-T3','https://www.praemiareim.fr/documents/14836074/14836311/PRAEMIA_BTI_Primovie_T3_2024_V7.pdf/53dc8fd3-0a77-b559-b97e-3fe3777e1e21?t=1730991427258'),
 ('primovie','2025-T2','https://www.praemiareim.fr/documents/14836074/14836311/PRAEMIA_BTI_Primovie_T2_2025_Vdef.pdf/0b7f8bba-7927-8eb6-757d-6e7078d6bdb4?t=1754056576446'),
 ('primovie','2025-T3','https://www.praemiareim.fr/documents/14836074/14836311/PRAEMIA_BTI_Primovie_T3_2025_VDEF.pdf/c261a2e9-05e0-4e41-5849-5bc59f5ca952?t=1762445988370'),
 ('primovie','2025-T4','https://www.praemiareim.fr/documents/14836074/14836311/PRAEMIA_BTI_Primovie_T4_2025_VDEF.pdf/214c23be-d3c6-1029-6f87-7f8226fd3980?t=1770654195469')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
 (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(c.scpi_slug||':'||c.source_period||':'||c.source_url),
 c.scpi_slug,c.source_period,c.source_url,'backfill_reference','queued',
 jsonb_build_object('discovery',jsonb_build_object(
   'date','2026-10-29',
   'method','indexed_official_praemia_reim_quarterly_pdf',
   'certification','PENDING_PDF_CONTENT_PERIOD_2_READERS',
   'published_facts_used',false))
FROM candidate c
WHERE public.scpi_bulletin_replay_source_trusted(c.scpi_slug,c.source_url)
ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;

-- Retire only three obsolete 'already loaded' assertions that were backed by
-- ASPIM/secondary websites rather than the original quarter's issuer PDF.
-- Keep before-images in the private audit table and do not touch financial values.
WITH old AS (
 SELECT q.*
 FROM public.scpi_backfill_queue q
 WHERE q.scpi_slug='patrimmo-commerce' AND q.source_kind='bulletin'
 AND q.source_period IN ('2025-T3','2025-T4','2026-T1')
 AND q.verification_status='manual_verified_archive_tof_aspim'
 AND q.status='already_loaded'
)
INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
 (event_key,reason,snapshot)
SELECT 'patrimmo-tof-non-issuer-'||old.source_period,
 'Previous TOF ASPIM/third-party source did not certify the exact quarterly issuer PDF',
 to_jsonb(old)
FROM old ON CONFLICT(event_key) DO NOTHING;

UPDATE public.scpi_backfill_queue q
 SET status='qa_review',
     source_url=case q.source_period
       WHEN '2025-T3' THEN 'https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T3_2025_VDEF.pdf/8d82b8f2-c4c2-e8ff-8045-76c38fe0b08a?t=1762443795423'
       WHEN '2025-T4' THEN 'https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T4_2025_VDEF.pdf/48cdd3ce-f504-f76d-e870-60036975e1d0?t=1770712823223'
       WHEN '2026-T1' THEN 'https://www.praemiareim.fr/documents/14836074/14836275/PRAEMIA_BTI_Patrimmo%2BCommerce_T1_2026.pdf/5e457c39-b612-e181-6428-5ac4e126672c?t=1778509195055' END,
     verification_status='exact_publisher_bulletin_pending_replay',
     last_error='Ancien statut ASPIM/site tiers non conforme ; PDF émetteur du trimestre découvert, lecture et preuve TOF encore requises.',
     updated_at=now()
 WHERE q.scpi_slug='patrimmo-commerce' AND q.source_kind='bulletin'
 AND q.source_period IN ('2025-T3','2025-T4','2026-T1')
 AND q.verification_status='manual_verified_archive_tof_aspim'
 AND q.status='already_loaded';
