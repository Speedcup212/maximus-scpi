-- Normalize TWO already-completed official T2 PDF acquisitions into the
-- SAME publisher PDF identity register as the other six CORUM bulletins.
-- Evidence: page_verified issuer source index 2026-10-14, official CORUM
-- URL exact, GitHub OCR #38712529291 12/12 pages, single matching SHA-256,
-- full issuer product name and quarter on pages 2/3, existing bulletin.
-- This is verified DOCUMENT IDENTITY, not independent total financial approval.
WITH eligible AS (
 SELECT d.scpi_slug,d.source_period,d.document_kind,d.direct_document_url AS source_url,
 b.pdf_sha256,j.total_pages,
 (SELECT sum(length(o.page_text))::integer
 FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=d.scpi_slug AND o.source_period=d.source_period
  AND o.document_kind=d.document_kind AND o.pdf_sha256=b.pdf_sha256) AS text_chars,
 (SELECT left(o.page_text,1250)
 FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=d.scpi_slug AND o.source_period=d.source_period
  AND o.document_kind=d.document_kind AND o.pdf_sha256=b.pdf_sha256
  AND o.page_number=3) AS issuer_page3,
 d.verified_pdf_at,d.extraction_run_reference
 FROM maximus_agents.scpi_candidate_document_index d
 JOIN maximus_agents.scpi_ocr_jobs j USING(scpi_slug,source_period,document_kind)
 JOIN public.scpi_bulletins b ON b.scpi_slug=d.scpi_slug AND b.period=d.source_period
  AND b.source_url=d.direct_document_url
 WHERE d.scpi_slug IN ('corum-origin','corum-xl')
 AND d.source_period='2026-T2' AND d.document_kind='quarterly_bulletin'
 AND d.status='page_verified' AND d.source_primary
 AND d.verified_pdf_at IS NOT NULL
 AND d.identity_observed=(CASE d.scpi_slug
  WHEN 'corum-origin' THEN 'CORUM Origin' ELSE 'CORUM XL' END)
 AND j.status='done' AND j.total_pages=12 AND j.pages_ocr=12
 AND j.attempts>=1 AND b.pdf_sha256~'^[a-f0-9]{64}$'
 AND b.extraction_json->>'document_sha256'=b.pdf_sha256
 AND EXISTS(SELECT 1 FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=d.scpi_slug AND o.source_period=d.source_period
   AND o.pdf_sha256=b.pdf_sha256 AND o.page_number=2
   AND lower(o.page_text) LIKE CASE WHEN d.scpi_slug='corum-origin'
    THEN '%corum origin%' ELSE '%corum xl%' END)
 AND EXISTS(SELECT 1 FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=d.scpi_slug AND o.source_period=d.source_period
   AND o.pdf_sha256=b.pdf_sha256 AND o.page_number=3
   AND lower(o.page_text) LIKE CASE WHEN d.scpi_slug='corum-origin'
    THEN '%corum origin%' ELSE '%corum xl%' END)
 AND (SELECT count(DISTINCT o.page_number) FROM maximus_agents.scpi_ocr_pages o
 WHERE o.scpi_slug=d.scpi_slug AND o.source_period=d.source_period
 AND o.pdf_sha256=b.pdf_sha256)>=10
)
INSERT INTO maximus_agents.scpi_candidate_pdf_validation
(scpi_slug,source_period,document_kind,source_url,pdf_sha256,page_count,
native_text_characters,document_identity_verified,identity_evidence,
inspect_request_id,validated_at)
SELECT scpi_slug,source_period,document_kind,source_url,pdf_sha256,
total_pages,text_chars,true,
'CORUM publisher original PDF official identity verified; source index verified '||
 verified_pdf_at||'; '||extraction_run_reference||
 '; OCR worker done 12/12 pages; exact official URL, source SHA and issuer name on p2/p3. '||
 left(issuer_page3,600)||' | Proof of document identity ONLY; complete financial signoff pending.',
NULL,now() FROM eligible
WHERE text_chars>1500 AND issuer_page3 IS NOT NULL
ON CONFLICT (scpi_slug,source_period,document_kind) DO NOTHING;

DO $complete$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_pdf_validation v
 JOIN public.scpi_bulletins b ON b.scpi_slug=v.scpi_slug
 AND b.period=v.source_period AND b.source_url=v.source_url
 AND b.pdf_sha256=v.pdf_sha256
 WHERE v.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND v.source_period IN ('2026-T1','2026-T2')
 AND v.document_kind='quarterly_bulletin'
 AND v.document_identity_verified AND v.page_count>0;
 IF n<>8 THEN RAISE EXCEPTION 'Eight official 2026 CORUM bulletins not identity registered: %/8',n; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_bulletins
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND period IN ('2026-T1','2026-T2') AND qa_status<>'candidate_page_checked_partial')
 THEN RAISE EXCEPTION 'Source identity registration must not fake independent full financial QA'; END IF;
END $complete$;
