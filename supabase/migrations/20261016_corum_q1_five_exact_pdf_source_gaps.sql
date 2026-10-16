-- Targeted Q1/2026 CORUM missing-field repair from official SHA-verified PDFs.
-- This is NOT an independent final audit, and MUST NOT change bulletin QA
-- to strong/certified or activate candidate public visibility.
-- Source: CI 38946497463 and page-located follow-up 38946639824.
DO $precheck$
BEGIN
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe u
           WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
             AND (u.lifecycle<>'candidate' OR u.publication_authorized OR u.analysis_certified))
 THEN RAISE EXCEPTION 'Private CORUM candidates expected; no public promotion'; END IF;
END;
$precheck$;

CREATE TEMP TABLE corum_t1_five_source_gaps
ON COMMIT DROP AS
SELECT v.scpi_slug,v.metric,v.numeric_value,v.unit,v.value_basis,v.expected_sha,v.expected_pages,
       v.source_page,v.proof_text,b.source_url,b.id AS bulletin_id
FROM (VALUES
 ('corum-origin','prix_souscription',1135.00::numeric,'EUR_PER_PART',
  'PRICE_IN_FORCE_ON_2026_03_31','9460af970ef68989dcfbb6006de4c1af8697282bb780db53688a13fd9e8bb607',7,3,
  'Issuer CORUM Origin T1/2026 bulletin p3: PRIX DE SOUSCRIPTION DEPUIS LE 1er AVRIL 2022 1 135,00 EUR'),
 ('corum-eurion','prix_souscription',215.00::numeric,'EUR_PER_PART',
  'PRICE_IN_FORCE_ON_2026_03_31','fcc3e7a0c48812fe5274474d2dab0727d863b780113a665e910b1e3626e0e68e',7,3,
  'Issuer CORUM Eurion T1/2026 bulletin p3: PRIX DE SOUSCRIPTION DEPUIS LE 1er JUILLET 2022 215,00 EUR'),
 ('corum-usa','prix_souscription',200.00::numeric,'EUR_PER_PART',
  'PRICE_IN_FORCE_ON_2026_03_31','3f281dfcb0ddef36cc6c4fc1e765ffe749a5feb48c36fb7581b725c141a8b878',7,3,
  'Issuer CORUM USA T1/2026 bulletin p3: PRIX DE SOUSCRIPTION DEPUIS LE 4 NOVEMBRE 2024 200,00 EUR'),
 ('corum-xl','prix_souscription',195.00::numeric,'EUR_PER_PART',
  'PRICE_IN_FORCE_ON_2026_03_31','5ff8c827cfd1f1e25a5d8c3bf8a4ddbf4e00eeeecbe5a5cff3d8676b40128037',8,3,
  'Issuer CORUM XL T1/2026 bulletin p3: PRIX DE SOUSCRIPTION DEPUIS LE 1er JUIN 2022 195,00 EUR'),
 ('corum-origin','tof',95.71::numeric,'PERCENT',
  'TOF_2026_03_31','9460af970ef68989dcfbb6006de4c1af8697282bb780db53688a13fd9e8bb607',7,4,
  'Issuer CORUM Origin T1/2026 bulletin p4: TAUX D OCCUPATION FINANCIER TOF 95,71%; vacance physique 7,55% is distinct')
) AS v(scpi_slug,metric,numeric_value,unit,value_basis,expected_sha,expected_pages,source_page,proof_text)
JOIN public.scpi_bulletins b ON b.scpi_slug=v.scpi_slug AND b.period='2026-T1'
  AND b.pdf_sha256=v.expected_sha
JOIN maximus_agents.scpi_candidate_pdf_validation d
 ON d.scpi_slug=v.scpi_slug AND d.source_period=b.period
 AND d.document_kind='quarterly_bulletin' AND d.document_identity_verified
 AND d.pdf_sha256=b.pdf_sha256 AND d.source_url=b.source_url
 AND d.page_count=v.expected_pages AND v.source_page<=d.page_count
WHERE b.qa_status='candidate_page_checked_partial';

DO $must_have$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n FROM corum_t1_five_source_gaps;
 IF n<>5 THEN RAISE EXCEPTION 'Q1 official issuer PDFs not exactly matched: %/5',n; END IF;
 IF EXISTS (
 SELECT 1 FROM corum_t1_five_source_gaps v
 JOIN public.scpi_indicator_history h ON h.scpi_slug=v.scpi_slug AND h.source_period='2026-T1'
 WHERE h.source_url<>v.source_url OR h.qa_status<>'candidate_source_verified_partial'
 OR (v.metric='prix_souscription' AND h.prix_souscription IS NOT NULL AND h.prix_souscription<>v.numeric_value)
 OR (v.metric='tof' AND h.tof IS NOT NULL AND h.tof<>v.numeric_value)
 ) THEN RAISE EXCEPTION 'Q1 history source identity/status or existing value conflict'; END IF;
END;$must_have$;

-- New pages are source-extracted and explicitly await a separate financial
-- review: no fake independently_reviewed_by or QA_PASS/approval inserted here.
INSERT INTO maximus_agents.scpi_candidate_metric_evidence
(scpi_slug,source_period,document_kind,metric,numeric_value,unit,value_basis,
 source_url,source_page,evidence_text,qa_status)
SELECT scpi_slug,'2026-T1','quarterly_bulletin',metric,numeric_value,unit,value_basis,
 source_url,source_page,proof_text||'; exact official PDF SHA-256 '||expected_sha||
 '; extracted with PDF.js full-page context, no final signoff yet',
 'pending_independent_qa'
FROM corum_t1_five_source_gaps
ON CONFLICT(scpi_slug,source_period,document_kind,metric) DO NOTHING;

INSERT INTO public.scpi_metric_certifications
(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
 evidence_text,bulletin_id,verification_status,verification_method,
 extraction_confidence,verified_at)
SELECT scpi_slug,'2026-T1',metric,numeric_value,unit,source_url,source_page,
 proof_text||'; exact issuer PDF SHA-256 '||expected_sha||
 '; SOURCE VERIFIED / FINAL INDEPENDENT REVIEW STILL PENDING',
 bulletin_id,'source_page_verified_pending_independent_review',
 'github_actions_original_pdf_sha_and_page_text_20261016',1,now()
FROM corum_t1_five_source_gaps
ON CONFLICT(scpi_slug,source_period,metric) DO NOTHING;

WITH values AS (
 SELECT DISTINCT ON (scpi_slug) scpi_slug,numeric_value,source_url
 FROM corum_t1_five_source_gaps WHERE metric='prix_souscription'
)
UPDATE public.scpi_indicator_history h SET prix_souscription=v.numeric_value
FROM values v
WHERE h.scpi_slug=v.scpi_slug AND h.source_period='2026-T1'
 AND h.source_url=v.source_url AND h.prix_souscription IS NULL;

UPDATE public.scpi_indicator_history h SET tof=v.numeric_value
FROM corum_t1_five_source_gaps v
WHERE h.scpi_slug=v.scpi_slug AND h.source_period='2026-T1'
 AND h.source_url=v.source_url AND v.metric='tof' AND h.tof IS NULL;

-- Existing analysis engine must not produce certified alerts from newly
-- imported but not independently reviewed historical values.
DO $refresh$
DECLARE v text;
BEGIN
 FOREACH v IN ARRAY ARRAY['corum-origin','corum-eurion','corum-usa','corum-xl']
 LOOP
  PERFORM public.refresh_scpi_bulletin_analysis(v);
  PERFORM public.certify_scpi_bulletin_analysis(v);
  PERFORM public.enforce_scpi_certification_v4_1(v);
  PERFORM public.enforce_scpi_metric_evidence_v4_3(v);
  PERFORM public.enforce_scpi_liquidity_doctrine_v5(v);
  PERFORM public.enforce_scpi_public_risk_cleanup_v5(v);
 END LOOP;
END;
$refresh$;

DO $post$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n
 FROM corum_t1_five_source_gaps e
 JOIN public.scpi_indicator_history h ON h.scpi_slug=e.scpi_slug AND h.source_period='2026-T1'
 JOIN public.scpi_metric_certifications c
  ON c.scpi_slug=e.scpi_slug AND c.source_period='2026-T1'
  AND c.metric=e.metric AND c.source_url=e.source_url AND c.source_page=e.source_page
  AND c.value_numeric=e.numeric_value
 WHERE (e.metric='prix_souscription' AND h.prix_souscription=e.numeric_value)
    OR (e.metric='tof' AND h.tof=e.numeric_value);
 IF n<>5 THEN RAISE EXCEPTION 'Expected exactly five source-backed Q1 history corrections, got %',n; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_bulletin_analysis a
  WHERE a.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND (a.certification_status='certified' OR a.current_source_certified OR a.comparison_certified))
 THEN RAISE EXCEPTION 'Partial Q1 proof cannot automatically certify entire CORUM'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe u
 WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND (u.publication_authorized OR u.analysis_certified))
 THEN RAISE EXCEPTION 'CORUM must remain private'; END IF;
END;
$post$;
