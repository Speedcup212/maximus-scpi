-- Official issuer regulatory/ESG claim reconciliation, 2026-10-17.
-- For publication candidates only. Never manufacture current-year documents or signed QA.
-- Source #1: CORUM USA official currently listed FR1 NOTE (24 Jan 2025),
-- PDF SHA b34a275e7d8eff9e8755abb94dad9a97300688b4cf797d150a5d5583fe7f2095,
-- page 7/30, Article 6 in the *issuer's own note*, not a 2026 DIC claim.
-- Source #2: CORUM official group page "Les labels du groupe", listing only
-- CORUM Eurion as its labelled real-estate SCPI. No assumption from SFDR class.
DO $issuer_esg$
DECLARE n integer;
BEGIN
 IF EXISTS (SELECT 1 FROM maximus_agents.scpi_universe u
   WHERE u.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND (u.lifecycle<>'candidate' OR u.publication_authorized OR u.analysis_certified OR u.strict_pass))
 THEN RAISE EXCEPTION 'Source review may not edit a published CORUM'; END IF;

 IF NOT EXISTS (
  SELECT 1 FROM maximus_agents.scpi_candidate_regulatory_documents d
  WHERE d.scpi_slug='corum-usa' AND d.document_kind='note'
    AND d.source_url='https://www.corum.fr/sites/default/files/2025-01/CORUM%20USA%20-%20FR1%20-%20Note%20information%20-%2020250124.pdf'
    AND d.pdf_sha256='b34a275e7d8eff9e8755abb94dad9a97300688b4cf797d150a5d5583fe7f2095'
    AND d.identity_verified AND d.kind_verified AND d.page_count>=7
 ) THEN RAISE EXCEPTION 'CORUM USA 2025 legal notice official identity/sha not verified'; END IF;

 IF (SELECT count(*) FROM public.scpi_indicators
     WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
       AND source_period='2026-T2' AND label_isr IS NULL)=4
 THEN
    UPDATE public.scpi_indicators i
    SET label_isr=CASE WHEN i.scpi_slug='corum-eurion' THEN true ELSE false END
    WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
      AND i.source_period='2026-T2' AND i.label_isr IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>4 THEN RAISE EXCEPTION 'Expected 4 issuer label source attributes'; END IF;
 ELSIF NOT EXISTS(
   SELECT 1 FROM public.scpi_indicators i
   WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
     AND i.label_isr IS DISTINCT FROM (i.scpi_slug='corum-eurion')
 ) THEN
   RAISE NOTICE 'Issuer label state already matches preserved source record';
 ELSE RAISE EXCEPTION 'Unexpected ISR label mapping, refuse overwriting another validation'; END IF;

 IF EXISTS (SELECT 1 FROM public.scpi_indicators WHERE scpi_slug='corum-usa' AND sfdr IS NULL) THEN
    UPDATE public.scpi_indicators
      SET sfdr='Article 6'
    WHERE scpi_slug='corum-usa' AND source_period='2026-T2' AND sfdr IS NULL;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>1 THEN RAISE EXCEPTION 'USA classification row unexpectedly changed'; END IF;
 ELSIF EXISTS(SELECT 1 FROM public.scpi_indicators WHERE scpi_slug='corum-usa' AND sfdr='Article 6') THEN
   RAISE NOTICE 'USA classification already confirmed from issuer 2025 notice';
 ELSE RAISE EXCEPTION 'USA classification conflicts with already existing publisher review'; END IF;

 UPDATE maximus_agents.scpi_candidate_final_review r
 SET review_evidence=coalesce(r.review_evidence,'{}'::jsonb)
      || jsonb_build_object('official_issuer_esg_sources_2026_10_17',jsonb_build_object(
         'sfdr_usa',CASE WHEN r.scpi_slug='corum-usa' THEN jsonb_build_object(
             'classification','Article 6',
             'source_vintage','2025-01-24',
             'source_doc_kind','note_information',
             'page_printed',7,
             'page_index_zero_based',6,
             'issuer_pdf_url','https://www.corum.fr/sites/default/files/2025-01/CORUM%20USA%20-%20FR1%20-%20Note%20information%20-%2020250124.pdf',
             'issuer_pdf_sha256','b34a275e7d8eff9e8755abb94dad9a97300688b4cf797d150a5d5583fe7f2095',
             'reverify_if_newer_note_or_sfdr_disclosure',true
           ) ELSE null END,
         'isr_label_source','https://www.corum.fr/qui-sommes-nous/labels-recompenses',
         'isr_label_check_scope','Current issuer group labels list at 2026-10-17: Eurion named as the only SCPI ISR in group list; verify again if issuer changes',
         'isr_label',r.scpi_slug='corum-eurion',
         'record_type','documentary_technical_reconciliation_not_independent_certification',
         'current_2026_regulatory_independent_signoff',false,
         'release_authorized',false
      ))
 WHERE r.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND (r.review_evidence->'official_issuer_esg_sources_2026_10_17' IS NULL)
  AND NOT r.dic_risk_sfdr_review_passed
  AND NOT r.frontend_contract_smoke_passed;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n NOT IN (0,4) THEN RAISE EXCEPTION 'Partial issuer source audit record %/4',n; END IF;

 IF EXISTS(
   SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
   WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND final_release_ready)
 THEN RAISE EXCEPTION 'Primary issuer ESG attributes never substitute financial signoff'; END IF;
END $issuer_esg$;
