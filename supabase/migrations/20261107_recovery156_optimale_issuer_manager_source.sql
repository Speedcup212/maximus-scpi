-- RECOVERY-156 — official corporate event / source governance, NO financial PASS override.
-- 2026-11-02: Optimale management moved from Consultim AM to Aestiam.
-- Evidence issuer/partner press release (Galivel):
-- https://www.galivel.com/fr/1-0-7157/communiques-de-presse/consultim-groupe-choisit-aestiam-pour-nouer-un-partenariat-strategique-afin-delargir-son-offre
-- 2026-T3 bulletin reported publicly, but its exact issuer PDF not yet in private archive.
-- 2025 issuer annual PDF SHA verified in scpi_annual_reports; T2 original issuer bulletin in scpi_bulletins.
-- Preserve manual_review_required + low, historical 2021-T3 PDF collision, no certification/queue status promotion.
DO $r156$
DECLARE old_row public.scpi_source_registry%ROWTYPE;
 q2 public.scpi_bulletins%ROWTYPE;
 annual_2025 public.scpi_annual_reports%ROWTYPE;
 changed integer;
BEGIN
 SELECT * INTO STRICT old_row FROM public.scpi_source_registry r
 WHERE r.scpi_slug='optimale' AND r.management_company='CONSULTIM Asset Management'
 AND r.verification_status='manual_review_required' AND r.confidence_level='low'
 AND r.last_document_period='2021-T3'
 AND r.last_error LIKE 'PDF_SHA256_PERIOD_OR_PRODUCT_COLLISION:%'
 FOR UPDATE;
 SELECT * INTO STRICT q2 FROM public.scpi_bulletins b
 WHERE b.scpi_slug='optimale' AND b.period='2026-T2'
 AND b.source_url='https://www.consultim-am.com/wp-content/uploads/2026/09/062026-Bulletin-trimestriel.pdf'
 AND b.pdf_sha256='84610a0aea2d32a54d5d4c89ab3bc4e278b820120745368ead65c314140a732a'
 AND b.qa_status='auto_verified_product_alias_period_tof'
 AND b.extraction_confidence>=0.95;
 IF NOT EXISTS(SELECT 1 FROM public.scpi_indicator_history h
   WHERE h.scpi_slug='optimale' AND h.source_period='2026-T2'
   AND h.source_url=q2.source_url AND h.tof=91.16 AND h.source_confidence>=0.95
   AND h.qa_status='manual_verified_official_with_secondary_crosscheck_liquidity')
 THEN RAISE EXCEPTION 'OPTIMALE_T2_ORIGINAL_HISTORY_NOT_VERIFIED'; END IF;
 SELECT * INTO STRICT annual_2025 FROM public.scpi_annual_reports a
 WHERE a.scpi_slug='optimale' AND a.fiscal_year=2025
 AND a.source_url='https://www.consultim-am.com/wp-content/uploads/2026/09/SCPI-OPTIMALE-Rapport-annuel-2025.pdf'
 AND a.qa_status='source_verified_content' AND a.extraction_confidence>=0.75
 AND a.source_sha256='ff63e319ed89d32c738aa475afd630d00d721c80a81a9ea286a7d418afdac718';
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery156:optimale:issuer-manager-2026-11-02',
  '2 Nov 2026 management transfer verified by official corporate press release; source registry T2 and annual 2025 corrected; T3 source and 2021-T3 collision remain unresolved',
  jsonb_build_object('before_source_registry',to_jsonb(old_row),'last_verified_t2_bulletin',to_jsonb(q2),
    'annual_2025',to_jsonb(annual_2025),
    'management_change_date','2026-11-02','management_company_new','Aestiam',
    'management_press_release','https://www.galivel.com/fr/1-0-7157/communiques-de-presse/consultim-groupe-choisit-aestiam-pour-nouer-un-partenariat-strategique-afin-delargir-son-offre',
    'q3_2026_bulletin','published_but_exact_issuer_pdf_unverified',
    'certification_granted',false,'human_attestation',false))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_source_registry r SET
  management_company='Aestiam',
  bulletin_url=q2.source_url,
  annual_report_url=annual_2025.source_url,
  last_document_period='2026-T2',
  notes=COALESCE(r.notes,'')||' | 2026-11-02: Aestiam devenue société de gestion (communiqué éditeur via Galivel); Consultim conserve distribution. Bulletin 2026-T3 annoncé, PDF éditeur exact encore à authentifier. Collision historique 2021-T3 maintenue en revue.',
  updated_at=now()
 WHERE r.id=old_row.id AND r.management_company=old_row.management_company
  AND r.verification_status='manual_review_required' AND r.confidence_level='low';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>1 THEN RAISE EXCEPTION 'OPTIMALE_ISSUER_MANAGER_UPDATE_FAILED'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.scpi_source_registry r
   WHERE r.scpi_slug='optimale' AND r.management_company='Aestiam'
   AND r.verification_status='manual_review_required' AND r.confidence_level='low'
   AND r.last_document_period='2026-T2' AND r.last_error=old_row.last_error)
 THEN RAISE EXCEPTION 'OPTIMALE_PENDING_REVIEW_FLAGS_MODIFIED'; END IF;
END $r156$;