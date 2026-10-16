-- CORUM four-fund financial source reconciliation, 16 Oct 2026.
-- This DOES NOT sign final audits or promote publication or artificially certify
-- a whole bulletin. It repairs source-proven material fields, one prior analysis
-- cache and preserves accurate dated/territorial fee bases.
DO $guard$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM maximus_agents.scpi_universe
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND lifecycle='candidate' AND NOT publication_authorized
   AND NOT analysis_certified;
 IF n<>4 THEN RAISE EXCEPTION 'Refuse financial correction: 4 private unapproved funds required, got %',n; END IF;

 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_metric_evidence e
 WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
   AND e.numeric_value IS NOT NULL AND e.source_page>0;
 IF n<>69 THEN RAISE EXCEPTION 'Existing primary-source numeric evidence count changed %/69',n; END IF;

 SELECT count(*) INTO n
 FROM public.scpi_indicators i
 JOIN maximus_agents.scpi_candidate_metric_evidence e
   ON e.scpi_slug=i.scpi_slug AND e.source_period='2026-T2'
   AND e.metric='nombre_parts' AND e.numeric_value=i.nombre_parts AND e.qa_status='qa_pass'
 JOIN maximus_agents.scpi_candidate_metric_evidence p
   ON p.scpi_slug=i.scpi_slug AND p.source_period='2026-T2'
   AND p.metric='prix_souscription' AND p.numeric_value=i.prix_souscription
   AND p.qa_status='qa_pass'
 WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND abs(i.capitalisation-(i.nombre_parts*i.prix_souscription/1000000.0))<0.000001
   AND i.td_annee=2025;
 IF n<>4 THEN RAISE EXCEPTION 'Capital, subscription pricing or annual performance period mismatch: %/4',n; END IF;
END;
$guard$;

-- CORUM XL T2 54,340 associates: independent source/p3 fully verified in 69
-- evidence ledger, but was null in the canonical current SCPI record.
UPDATE public.scpi_indicators i
 SET nombre_associes=e.numeric_value::integer
FROM maximus_agents.scpi_candidate_metric_evidence e
WHERE i.scpi_slug='corum-xl' AND i.source_period='2026-T2'
  AND i.nombre_associes IS NULL
  AND i.qa_status='candidate_verified_partial'
  AND e.scpi_slug=i.scpi_slug AND e.source_period=i.source_period
  AND e.metric='nombre_associes' AND e.numeric_value=54340
  AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
  AND e.source_page=3 AND e.source_url=i.source_url;

-- CORUM USA fee schedule: 15.90% is NOT a globally flat rate; it applies
-- to US rent. Issuer's legally verified 2025 statutes p9 and current fee
-- disclosure confirm 12.40% for eurozone rent, 15.90% for US rent.
-- The scalar fee must remain NULL until tools can display the TWO tiers,
-- like CORUM XL. Do not compute any fabricated weighted average.
UPDATE public.scpi_indicators i SET
 frais_gestion=NULL,
 source_document=coalesce(i.source_document,'')||
 ' | 2026-10-16 verified CORUM USA fee schedule: 12.40% HT eurozone rent, 15.90% HT US rent; do NOT publish a single unqualified fee. Issuer current /corum-usa/frais and official statutes p9.'
WHERE i.scpi_slug='corum-usa' AND i.source_period='2026-T2'
  AND i.frais_gestion=15.9
  AND EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_regulatory_documents d
   WHERE d.scpi_slug=i.scpi_slug AND d.document_kind='statutes'
     AND d.identity_verified AND d.kind_verified AND d.page_count>=9
     AND d.pdf_sha256='bd2877f8ed8ffe075752a07479b7ba36e6ceae1c9cb48ea656fdc91095178fb5');

WITH reviewed_fees(metric,val,basis) AS (
  VALUES
  ('management_fee_euro_zone_ht',12.40::numeric,'HT_EUROZONE_RENT_CURRENT_TERMS_2026_10'),
  ('management_fee_non_euro_zone_ht',15.90::numeric,'HT_US_RENT_CURRENT_TERMS_2026_10')
)
INSERT INTO public.scpi_metric_certifications
(scpi_slug,source_period,metric,value_numeric,value_text,unit,
 source_url,source_page,evidence_text,bulletin_id,verification_status,
 verification_method,extraction_confidence,verified_at)
SELECT 'corum-usa','2026-T2',f.metric,f.val,NULL,'PERCENT',
 d.source_url,9,
 'Issuer CORUM USA statutes official PDF dated 2025-01-25 p9, fee clause; PDF SHA='||d.pdf_sha256||
 '; current issuer website https://www.corum.fr/nos-scpi/corum-usa/frais reconfirmed 2026-10-16: '||
 f.val||'% HT, territory '||f.basis||'. This is a territorial fee schedule, not a uniform weighted fee.',
 NULL,'manual_verified_official',
 'legal_statutes_page9_and_issuer_current_fee_20261016',
 1,now()
FROM reviewed_fees f
JOIN maximus_agents.scpi_candidate_regulatory_documents d
 ON d.scpi_slug='corum-usa' AND d.document_kind='statutes'
 AND d.identity_verified AND d.kind_verified
 AND d.page_count>=9
 AND d.pdf_sha256='bd2877f8ed8ffe075752a07479b7ba36e6ceae1c9cb48ea656fdc91095178fb5'
ON CONFLICT (scpi_slug,source_period,metric) DO NOTHING;

-- Reuse the EXISTING certified analysis pipeline after correcting evidence.
-- This refresh specifically removes stale previous_snapshot, e.g. Origin T1
-- recorded 16.65 but old cached previous snapshot omitted it.
DO $refresh$
DECLARE slug text;
BEGIN
 FOREACH slug IN ARRAY ARRAY['corum-origin','corum-eurion','corum-usa','corum-xl'] LOOP
  PERFORM public.refresh_scpi_bulletin_analysis(slug);
  PERFORM public.apply_scpi_material_vigilance(slug);
  PERFORM public.certify_scpi_bulletin_analysis(slug);
  PERFORM public.enforce_scpi_certification_v4_1(slug);
  PERFORM public.enforce_scpi_metric_evidence_v4_3(slug);
  PERFORM public.enforce_scpi_liquidity_doctrine_v5(slug);
  PERFORM public.enforce_scpi_public_risk_cleanup_v5(slug);
  PERFORM public.apply_scpi_reporting_cadence_v6(slug);
 END LOOP;
END;
$refresh$;

-- Open the official final-audit RECORDS in their existing ledger.
-- Never use 'approved' until independent financial, legal and GUI reviews.
WITH audited AS (
SELECT
 i.scpi_slug,
 (SELECT count(*) FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug=i.scpi_slug AND c.verification_status='manual_verified_official') AS certified_fields,
 (SELECT count(*) FROM maximus_agents.scpi_candidate_regulatory_documents d
  WHERE d.scpi_slug=i.scpi_slug AND d.identity_verified AND d.kind_verified
    AND d.document_kind IN ('dic','note','statutes')) AS legal_docs,
 (SELECT count(*) FROM maximus_agents.scpi_candidate_metric_evidence e
  WHERE e.scpi_slug=i.scpi_slug AND e.qa_status='qa_pass'
    AND e.independently_reviewed_at IS NOT NULL) AS original_proofs,
 i.td_annee,i.endettement,i.prix_reconstitution,i.frais_gestion
FROM public.scpi_indicators i
WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
)
INSERT INTO maximus_agents.scpi_candidate_final_audit
(scpi_slug,audit_status,historical_consistency_pass,financial_coverage_pass,
 liquidity_risk_pass,document_regulatory_pass,public_display_mapping_pass,
 independent_qa_reference,approved_by,approved_at,evidence_digest_sha256,
 audit_summary,updated_at)
SELECT scpi_slug,'pending',
 false,false,false,false,false,
 NULL,NULL,NULL,NULL,
 jsonb_build_object(
 'review_type','preliminary_financial_source_reconciliation_20261016',
 'verified_field_count',certified_fields,'independently_reviewed_source_fields',original_proofs,
 'identity_checked_regulatory_document_count',legal_docs,
 'annual_distribution_year',td_annee,
 'annual_debt_ratio_not_a_quarterly_2026_measure',endettement,
 'annual_2025_reconstitution_price_not_quarterly_2026',prix_reconstitution,
 'fee_display_scalar',frais_gestion,
 'corum_xl_and_usa_fee_schedule','12.40% HT eurozone, 15.90% HT non-eurozone/US',
 'verified_2026_t2_withdrawal_queue','0 parts in the checked T2 source, does not guarantee resale/liquidity',
 'remaining_financial_approval',
 jsonb_build_array(
 'Independently certify entire T1/T2 financial analyses and period-comparable risks, not just 69 audited fields',
 'Independently review 2026 DIC risk indicator and SFDR classification plus updated legal terms',
 'Validate dated annual 2025 debt and reconstitution disclosures versus Q2 2026 without misleading period',
 'Verify frontend renders geographic fee tiers and risks using exact Iroko Atlas layout',
 'Run end-to-end public tool parity and obtain independent financial/legal sign-off'),
 'release_authorized',false
 ),now()
FROM audited
ON CONFLICT(scpi_slug) DO UPDATE SET
 audit_summary=EXCLUDED.audit_summary,updated_at=now()
WHERE maximus_agents.scpi_candidate_final_audit.audit_status='pending';

DO $postcheck$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.scpi_indicators
 WHERE scpi_slug='corum-xl' AND source_period='2026-T2' AND nombre_associes=54340;
 IF n<>1 THEN RAISE EXCEPTION 'Missing 54,340 CORUM XL verified associate count'; END IF;
 SELECT count(*) INTO n FROM public.scpi_metric_certifications
 WHERE scpi_slug='corum-usa' AND source_period='2026-T2'
 AND metric IN ('management_fee_euro_zone_ht','management_fee_non_euro_zone_ht')
 AND verification_status='manual_verified_official' AND source_page=9;
 IF n<>2 THEN RAISE EXCEPTION 'Territorial CORUM USA fees proof incomplete'; END IF;
 SELECT count(*) INTO n FROM public.scpi_bulletin_analysis
 WHERE scpi_slug='corum-origin' AND previous_period='2026-T1'
 AND (previous_snapshot->>'distribution_par_part')::numeric=16.65;
 IF n<>1 THEN RAISE EXCEPTION 'CORUM Origin certified T1 source not reflected in live analysis cache'; END IF;
 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_final_audit
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND audit_status='pending' AND approved_at IS NULL;
 IF n<>4 THEN RAISE EXCEPTION 'Unapproved final review records missing'; END IF;
 IF EXISTS (SELECT 1 FROM maximus_agents.scpi_universe
   WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND (publication_authorized OR analysis_certified)) THEN
   RAISE EXCEPTION 'Financial staging MUST NOT confer release authorization';
 END IF;
END;
$postcheck$;
