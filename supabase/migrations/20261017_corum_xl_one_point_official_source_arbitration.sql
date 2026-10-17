-- 2026-10-17 | CORUM XL: source hierarchy for a non-material 1 pp sector mismatch.
-- PRIMARY: issuer's fixed 2026-T2 bulletin, page 4, PDF SHA256.
-- SECONDARY: issuer's mutable patrimoine page (same reference date) shows 54% vs 55%.
-- Adopt 55% AS REPORTED in the frozen bulletin, not an imputed adjustment.
-- Preserve issuer-site 54% verbatim as an auditable documented discrepancy.
-- Never grant global risk/regulatory approvals or promote a public SCPI.
DO $arbitration$
DECLARE
  candidate_count integer;
  peer_count integer;
  peer_total numeric;
  updated_count integer;
  original_pdf_hash text := 'fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd';
  competing_site text := 'https://www.corum.fr/nos-scpi/corum-xl/patrimoine';
  primary_pdf_url text := 'https://www.corum.fr/sites/default/files/2026-07/CORUM%20XL%20-%20Fil%20d%27Actualit%C3%A9s%202026-T2%202%20%281%29.pdf';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug='corum-xl' AND u.lifecycle='candidate'
      AND u.strict_pass IS FALSE
      AND u.analysis_certified IS FALSE
      AND u.publication_authorized IS FALSE
  ) THEN RAISE EXCEPTION 'CORUM XL is no longer an unpublished candidate'; END IF;

  -- Idempotent across DB migration replays.
  IF EXISTS (
    SELECT 1 FROM maximus_agents.scpi_candidate_allocations a
    JOIN maximus_agents.scpi_candidate_final_review rv USING(scpi_slug)
    WHERE a.scpi_slug='corum-xl' AND a.source_period='2026-T2'
      AND a.allocation_type='sector' AND a.label='Bureaux'
      AND a.pct=55 AND a.qa_status='qa_pass'
      AND rv.review_evidence->'source_arbitrations'->'2026-T2:sector:Bureaux'->>'selected_primary_value_pct'='55'
      AND rv.review_evidence->'source_arbitrations'->'2026-T2:sector:Bureaux'->>'observed_issuer_web_value_pct'='54'
  ) THEN
    RAISE NOTICE 'CORUM XL documented source arbitration already applied';
  ELSE
    -- The original official PDF identity and its recorded page OCR MUST reconcile.
    SELECT count(*) INTO candidate_count
    FROM maximus_agents.scpi_candidate_allocations a
    JOIN public.scpi_indicators i USING(scpi_slug)
    JOIN public.scpi_bulletins b
      ON b.scpi_slug=a.scpi_slug AND b.period=a.source_period
      AND b.source_url=a.source_url AND b.pdf_sha256=a.source_sha256
    JOIN maximus_agents.scpi_candidate_pdf_validation v
      ON v.scpi_slug=a.scpi_slug AND v.source_period=a.source_period
      AND v.source_url=b.source_url AND v.pdf_sha256=b.pdf_sha256
    JOIN maximus_agents.scpi_ocr_pages o
      ON o.scpi_slug=b.scpi_slug AND o.source_period=b.period
      AND o.pdf_sha256=b.pdf_sha256 AND o.page_number=a.source_page
    WHERE a.scpi_slug='corum-xl' AND a.source_period='2026-T2'
      AND a.allocation_type='sector' AND a.label='Bureaux'
      AND a.qa_status='needs_review' AND a.pct=55
      AND a.source_url=primary_pdf_url AND a.source_sha256=original_pdf_hash
      AND a.source_page=4 AND public.scpi_is_strong_qa(b.qa_status)
      AND v.document_identity_verified AND a.source_page BETWEEN 1 AND v.page_count
      AND i.source_period=a.source_period
      AND (i.repartition_sectorielle->>'Bureaux')::numeric=55
      AND position('55 % 18% 14% 6% 4%' in o.page_text)>0
      AND position('Bureau* Commerce Hôtellerie Industriel & logistique Santé' in o.page_text)>0;
    IF candidate_count<>1 THEN
      RAISE EXCEPTION 'Official 2026-T2 primary PDF/Bureaux 55%% not safely established: %',candidate_count;
    END IF;

    -- No change to percentages, no invented balancing row: the 6 other issuer
    -- T2 sector rows are already proven by their own PDF + publisher corroboration.
    SELECT count(*),sum(a.pct) INTO peer_count,peer_total
    FROM maximus_agents.scpi_candidate_allocations a
    WHERE a.scpi_slug='corum-xl' AND a.source_period='2026-T2'
      AND a.allocation_type='sector' AND a.label<>'Bureaux'
      AND a.qa_status='qa_pass' AND a.source_page=4
      AND a.source_sha256=original_pdf_hash;
    IF peer_count<>6 OR peer_total<>45 THEN
      RAISE EXCEPTION 'Remaining six sectors must total 45%%, not % for % rows',peer_total,peer_count;
    END IF;

    IF (55::numeric-54::numeric)>1 THEN
      RAISE EXCEPTION 'Source gap exceeds non-material one-percentage-point tolerance';
    END IF;

    UPDATE maximus_agents.scpi_candidate_allocations a
      SET qa_status='qa_pass', checked_at=now(),
        evidence_excerpt =
          'SOURCE ARBITRATION / NON-BLOCKING DOCUMENTARY DISCREPANCY / 2026-10-17. '||
          'SELECTED for 2026-T2: Bureaux=55% from official fixed CORUM XL Q2 2026 PDF p4, '||
          'source='||primary_pdf_url||'; SHA256='||original_pdf_hash||'. '||
          'OCR exact original page sequence: 55% 18% 14% 6% 4% = '||
          'Bureau, Commerce, Hotellerie, Industrie-logistique, Sante; '||
          '2% Education, 1% Parking. Total documented T2 sector distribution=100%. '||
          'OTHER OFFICIAL PRESENTATION: '||competing_site||' says Bureaux=54% '||
          'for reference date 2026-06-30, seven displayed weights totaling 99%. '||
          'The one-point difference is a documented issuer reporting conflict; '||
          'do NOT assert it was caused by rounding, do NOT average or silently inflate '||
          'a value. The time-frozen primary quarterly bulletin prevails over the '||
          'changeable synthesis webpage for this published period. '||
          'Independent transcriptions dated 2026-T2 corroborate 55%: '||
          'https://www.choixscpi.fr/scpi/corum-xl/ and '||
          'https://ateispatrimoine.com/scpi/corum-xl/. '||
          'Technical source-level arbitration only: regulatory approval, financial QA, '||
          'real user journeys and final site publication remain blocked.'
    WHERE a.scpi_slug='corum-xl' AND a.source_period='2026-T2'
      AND a.allocation_type='sector' AND a.label='Bureaux' AND a.pct=55
      AND a.source_page=4 AND a.source_sha256=original_pdf_hash
      AND a.qa_status='needs_review';
    GET DIAGNOSTICS updated_count=ROW_COUNT;
    IF updated_count<>1 THEN RAISE EXCEPTION 'Single arbitration QA update not applied'; END IF;

    UPDATE maximus_agents.scpi_candidate_final_review rv
    SET review_evidence = jsonb_set(
      coalesce(rv.review_evidence,'{}'::jsonb),
      '{source_arbitrations}',
      coalesce(rv.review_evidence->'source_arbitrations','{}'::jsonb)
      || jsonb_build_object(
        '2026-T2:sector:Bureaux',
        jsonb_build_object(
          'disposition','primary_periodic_issuer_pdf_preferred',
          'status','nonblocking_documentary_conflict_with_evidence',
          'selected_primary_value_pct',55,
          'observed_issuer_web_value_pct',54,
          'delta_percentage_points',1,
          'source_period','2026-T2',
          'source_date','2026-06-30',
          'primary_source_url',primary_pdf_url,
          'primary_pdf_sha256',original_pdf_hash,
          'primary_pdf_page',4,
          'secondary_issuer_url',competing_site,
          'secondary_total_reported_percent',99,
          'primary_total_reported_percent',100,
          'corroborating_sources',jsonb_build_array(
            'https://www.choixscpi.fr/scpi/corum-xl/',
            'https://ateispatrimoine.com/scpi/corum-xl/'
          ),
          'not_claimed','cause_of_one_point_gap_unconfirmed',
          'regulatory_approval_signed',false,
          'public_release_authorized',false
        )
      ),
      true
    )
    WHERE rv.scpi_slug='corum-xl' AND rv.verified_field_display_passed IS FALSE
      AND rv.frontend_contract_smoke_passed IS FALSE
      AND rv.debt_and_leverage_review_passed IS FALSE
      AND rv.liquidity_risk_review_passed IS FALSE
      AND rv.fees_and_redemption_review_passed IS FALSE
      AND rv.dic_risk_sfdr_review_passed IS FALSE;
    GET DIAGNOSTICS updated_count=ROW_COUNT;
    IF updated_count<>1 THEN RAISE EXCEPTION 'Arbitration metadata not persisted in existing final review'; END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_candidate_allocation_certification_v1 a
    WHERE a.scpi_slug='corum-xl' AND a.sector_verified
  ) THEN RAISE EXCEPTION 'Sector gate still blocked; revert entire operation'; END IF;
  IF EXISTS (
    SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1 f
    WHERE f.scpi_slug='corum-xl' AND f.final_release_ready
  ) THEN RAISE EXCEPTION 'A documentary arbitration must never authorize full financial release'; END IF;
  IF EXISTS (
    SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug='corum-xl'
      AND (u.publication_authorized OR u.analysis_certified OR u.lifecycle<>'candidate')
  ) THEN RAISE EXCEPTION 'Documentary arbitration cannot change publication lifecycle'; END IF;
END $arbitration$;
