-- Evidence-based financial quality CHECKS, not signature of entire product.
-- The source period must match the data's actual measurement date.
-- Capture completed checks in the EXISTING final_review table so the QA agent
-- works solely on remaining red gates instead of restarting 69 field proofs.

WITH candidates AS (
 SELECT i.scpi_slug,
    i.td AS annual_td_2025, i.td_annee,
    i.prix_souscription, i.prix_reconstitution, i.endettement,
    i.distribution_par_part AS dividend_t2,
    i.nombre_parts AS shares_t2,i.nombre_associes AS owners_t2,
    i.capitalisation AS capitalisation_millions,
    h.nombre_parts AS shares_t1,h.distribution_par_part AS dividend_t1,
    h.source_url AS t1_source_url,i.source_url AS t2_source_url,
    (SELECT count(*) FROM maximus_agents.scpi_candidate_regulatory_documents d
     WHERE d.scpi_slug=i.scpi_slug AND d.identity_verified AND d.kind_verified
       AND d.document_kind IN ('dic','note','statutes')) AS legal_document_count,
    (SELECT count(*) FROM maximus_agents.scpi_candidate_metric_evidence e
     WHERE e.scpi_slug=i.scpi_slug AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL) AS checked_metric_count
 FROM public.scpi_indicators i
 JOIN public.scpi_indicator_history h
   ON h.scpi_slug=i.scpi_slug AND h.source_period='2026-T1'
 WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND i.source_period='2026-T2'
), evidence AS (
 SELECT c.*, a.numeric_value AS dividend_annual_2025,
  b.numeric_value AS price_annual_2025,
  d.numeric_value AS debt_annual_2025,
  v.numeric_value AS reconstitution_annual_2025,
  g.numeric_value AS proven_dividend_t1,
  f.numeric_value AS proven_dividend_t2
 FROM candidates c
 JOIN maximus_agents.scpi_candidate_metric_evidence a
   ON a.scpi_slug=c.scpi_slug AND a.source_period='2025-RA'
   AND a.metric='distribution_brute_par_part' AND a.qa_status='qa_pass'
 JOIN maximus_agents.scpi_candidate_metric_evidence b
   ON b.scpi_slug=c.scpi_slug AND b.source_period='2025-RA'
   AND b.metric='prix_souscription' AND b.qa_status='qa_pass'
 JOIN maximus_agents.scpi_candidate_metric_evidence d
   ON d.scpi_slug=c.scpi_slug AND d.source_period='2025-RA'
   AND d.metric='endettement_pct' AND d.qa_status='qa_pass'
 JOIN maximus_agents.scpi_candidate_metric_evidence v
   ON v.scpi_slug=c.scpi_slug AND v.source_period='2025-RA'
   AND v.metric='valeur_reconstitution_par_part' AND v.qa_status='qa_pass'
 JOIN maximus_agents.scpi_candidate_metric_evidence g
   ON g.scpi_slug=c.scpi_slug AND g.source_period='2026-T1'
   AND g.metric='distribution_brute_par_part' AND g.qa_status='qa_pass'
   AND g.source_url=c.t1_source_url
 JOIN maximus_agents.scpi_candidate_metric_evidence f
   ON f.scpi_slug=c.scpi_slug AND f.source_period='2026-T2'
   AND f.metric='distribution_brute_par_part' AND f.qa_status='qa_pass'
   AND f.source_url=c.t2_source_url
), verified AS (
 SELECT *, (
    td_annee=2025 AND round((dividend_annual_2025/price_annual_2025*100),2)=annual_td_2025
    AND dividend_t1=proven_dividend_t1 AND dividend_t2=proven_dividend_t2
    AND debt_annual_2025=endettement
    AND reconstitution_annual_2025=prix_reconstitution
    AND shares_t1>0 AND shares_t2>=shares_t1
    AND abs(capitalisation_millions-shares_t2*prix_souscription/1000000.0)<0.000001
    AND owners_t2>0 AND legal_document_count=3
 ) AS historical_period_arithmetic_pass
 FROM evidence
)
INSERT INTO maximus_agents.scpi_candidate_final_review
(scpi_slug,legal_identity_passed,verified_field_display_passed,
 annual_quarter_coherence_passed,debt_and_leverage_review_passed,
 liquidity_risk_review_passed,fees_and_redemption_review_passed,
 dic_risk_sfdr_review_passed,frontend_contract_smoke_passed,
 review_evidence,reviewed_at,reviewed_by,notes)
SELECT scpi_slug,true,false,historical_period_arithmetic_pass,
 false,false,false,false,false,
 jsonb_build_object(
  'scope','automated_reconciliation_only_not_final_audit',
  'source_linked_metrics',checked_metric_count,
  'official_dic_note_statutes_identified_and_sha_verified',legal_document_count,
  'historical_period_and_arithmetic_crosscheck',historical_period_arithmetic_pass,
  '2025_td',annual_td_2025,
  '2025_gross_dividend',dividend_annual_2025,
  '2025_annual_bank_loan_ratio_percent',debt_annual_2025,
  '2025_reconstitution',reconstitution_annual_2025,
  '2026_t1_dividend_gross_per_part',dividend_t1,
  '2026_t2_dividend_gross_per_part',dividend_t2,
  '2026_t2_shares',shares_t2,
  '2026_t2_capitalisation_millions',capitalisation_millions,
  '2026_t2_associates',owners_t2,
  'source_warning','2025 debt/reconstitution not a current 2026 quarterly value',
  'unapproved_gates',jsonb_build_array(
    'Finance/regulatory reviewer must confirm all current 2026 DIC risk, latest borrowing, SFDR and fees against issuer',
    'Check withdrawal execution, illiquidity and FX/US-REIT taxation where relevant',
    'Verify simulator, radar, comparison, client, trajectory and SEO renders',
    'Independently sign complete financial/regulatory final audit and release only after all controls')
 ),now(),'source_mathematics_automated_not_independent_signoff',
 'PARTIAL REVIEW: source and arithmetic checks completed. Financial, legal and UI signature not delivered.'
FROM verified
WHERE historical_period_arithmetic_pass
ON CONFLICT (scpi_slug) DO UPDATE
SET review_evidence=EXCLUDED.review_evidence,
 annual_quarter_coherence_passed=EXCLUDED.annual_quarter_coherence_passed,
 legal_identity_passed=EXCLUDED.legal_identity_passed,
 reviewed_at=EXCLUDED.reviewed_at,
 reviewed_by=EXCLUDED.reviewed_by,
 notes=EXCLUDED.notes
WHERE maximus_agents.scpi_candidate_final_review.dic_risk_sfdr_review_passed=false
  AND maximus_agents.scpi_candidate_final_review.frontend_contract_smoke_passed=false;

UPDATE maximus_agents.scpi_candidate_final_audit a
SET historical_consistency_pass=true,
    audit_summary=a.audit_summary||jsonb_build_object(
      'independent_math_crosscheck','PASS: Q1/Q2 2026 gross dividends, reported 2025 annual distribution TD, debt and reconstitution, Q2 capitalisation and chronological share numbers',
      'historical_checks_completed_at',now(),
      'remaining_gate','DIC/current regulatory risk, liquidity review, valuation/fees complete and exact interface mapping independent signoff'
    ),updated_at=now()
WHERE a.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND a.audit_status='pending' AND a.approved_at IS NULL
 AND EXISTS(
   SELECT 1 FROM maximus_agents.scpi_candidate_final_review r
   WHERE r.scpi_slug=a.scpi_slug AND r.annual_quarter_coherence_passed);

DO $postcheck$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_final_review
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND legal_identity_passed AND annual_quarter_coherence_passed
  AND NOT dic_risk_sfdr_review_passed AND NOT frontend_contract_smoke_passed;
 IF n<>4 THEN RAISE EXCEPTION 'Insufficient source-based yearly/quarterly coherence crosschecks %/4',n; END IF;
 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_final_audit
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND historical_consistency_pass AND audit_status='pending'
 AND approved_at IS NULL AND independent_qa_reference IS NULL;
 IF n<>4 THEN RAISE EXCEPTION 'Pending financial reviews must remain unsigned: %/4',n; END IF;
END;
$postcheck$;
