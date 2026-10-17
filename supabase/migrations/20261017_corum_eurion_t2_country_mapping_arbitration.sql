-- CORUM EURION / Q2 2026 geographical country-label transposition
-- This is NOT an assumption that the original PDF graph was visually read:
-- its text extraction contains 27,19,19,14,8,6,6,1 but separates labels.
-- Three independent dated T2 transcriptions agree with canonical values,
-- while an Ateis transcription associates 4 numbers with different labels.
-- Resolve a *country-to-value mapping* disagreement, not a rounding variance.
-- Preserve both maps and dissenting URL in the existing final-review evidence.
-- No risk/financial approvals or public exposure updated.
DO $eurion$
DECLARE n integer;
  official_sha text := 'e4ca37f3accb67dbc8090284e4c64f2bafc3f199d742884ebb266749fe60c627';
BEGIN
IF NOT EXISTS (
 SELECT 1 FROM maximus_agents.scpi_universe
 WHERE scpi_slug='corum-eurion' AND lifecycle='candidate'
 AND strict_pass IS FALSE AND publication_authorized IS FALSE AND analysis_certified IS FALSE
) THEN RAISE EXCEPTION 'CORUM Eurion is no longer a private candidate'; END IF;
IF EXISTS (
 SELECT 1 FROM maximus_agents.scpi_candidate_final_review
 WHERE scpi_slug='corum-eurion'
   AND review_evidence->'source_arbitrations' ? '2026-T2:geography:transposition'
) THEN
 RAISE NOTICE 'Original source mapping transposition already documented';
ELSE
  WITH disputed(label,old_pct,new_pct) AS (
    VALUES ('Finlande',8::numeric,6::numeric),('Italie',1::numeric,14::numeric),
           ('Lettonie',6::numeric,1::numeric),('Portugal',14::numeric,8::numeric)
  ), checked AS (
    SELECT a.label FROM disputed x
    JOIN maximus_agents.scpi_candidate_allocations a
      ON a.scpi_slug='corum-eurion' AND a.allocation_type='geography'
     AND a.label=x.label AND a.pct=x.old_pct AND a.qa_status='needs_review'
     AND a.source_period='2026-T2' AND a.source_page=4 AND a.source_sha256=official_sha
    JOIN public.scpi_indicators i ON i.scpi_slug=a.scpi_slug
     AND i.source_period=a.source_period
     AND (i.repartition_geographique->>a.label)::numeric=x.new_pct
    JOIN public.scpi_bulletins b ON b.scpi_slug=a.scpi_slug
     AND b.period=a.source_period AND b.source_url=a.source_url
     AND b.pdf_sha256=official_sha
    JOIN maximus_agents.scpi_candidate_pdf_validation v
      ON v.scpi_slug=b.scpi_slug AND v.source_period=b.period
     AND v.source_url=b.source_url AND v.pdf_sha256=b.pdf_sha256
    WHERE v.document_identity_verified AND v.page_count>=4
      AND public.scpi_is_strong_qa(b.qa_status)
  ) SELECT count(*) INTO n FROM checked;
  IF n<>4 THEN RAISE EXCEPTION '4 disputable positions not checked against exact issuer PDF and canonical table: %',n; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM maximus_agents.scpi_candidate_allocations a
    WHERE a.scpi_slug='corum-eurion' AND a.source_period='2026-T2'
      AND a.allocation_type='geography'
    GROUP BY a.scpi_slug
    HAVING count(*)=8 AND sum(a.pct)=100
    AND count(*) FILTER (WHERE a.qa_status='qa_pass')=4
  ) THEN RAISE EXCEPTION 'Pre-arbitration country distribution incomplete'; END IF;

  -- Immutable prior state is written into the *existing* review evidence BEFORE
  -- changing a single number. Three independent reconstructions explicitly
  -- dated June 30 / Q2 2026 use 6/14/1/8. Ateis 8/1/6/14 dissent recorded.
  UPDATE maximus_agents.scpi_candidate_final_review r
    SET review_evidence=jsonb_set(coalesce(r.review_evidence,'{}'::jsonb),
      '{source_arbitrations}',
      coalesce(r.review_evidence->'source_arbitrations','{}'::jsonb)
      || jsonb_build_object(
        '2026-T2:geography:transposition',
        jsonb_build_object(
          'scope','country_percentage_mapping_only',
          'source_period','2026-T2',
          'source_date','2026-06-30',
          'document_sha256',official_sha,
          'document_page',4,
          'original_pdf_url','https://www.corum.fr/sites/default/files/2026-07/CORUM%20Eurion%20-%20Fil%20d%27Actualit%C3%A9s%202026-T2.pdf',
          'mirror_pdf_url','https://francescpi.com/scpi-de-rendement/corum-eurion/bi/corum-eurion-bulletin-2026-t2.pdf',
          'pdf_text_extraction_warning','country labels and percentage values extracted in different layout order; no claim of original graphic visual verification',
          'observed_pdf_weight_multiset',jsonb_build_array(27,19,19,14,8,6,6,1),
          'original_candidate_values',jsonb_build_object('Finlande',8,'Italie',1,'Lettonie',6,'Portugal',14),
          'selected_values',jsonb_build_object('Finlande',6,'Italie',14,'Lettonie',1,'Portugal',8),
          'matching_sources',jsonb_build_array(
            'https://app.2ndmarket.fr/scpi/715-parts-corum-eurion-usufruit-26-part-reconstitution-en-2029-2',
            'https://quellescpi.com/scpi/corum-eurion/',
            'https://www.scpi-simulateur.fr/scpi-corum-eurion.html'
          ),
          'disagreeing_secondary_source','https://ateispatrimoine.com/scpi/corum-eurion/',
          'selection_reason','three independent T2/2026 country-value transcriptions coincide with pre-existing canonical indicator snapshot; a fourth transcription disagrees. Exact period/source and retained alternative values documented',
          'remaining_uncertainty','visual reading of original official graphic not completed; correction remains challengeable by new issuer evidence',
          'approval_kind','technical_data_arbitration_not_independent_financial_signoff',
          'financial_audit_signed',false,
          'production_release_authorized',false
        )
      ),true)
  WHERE r.scpi_slug='corum-eurion'
    AND NOT r.verified_field_display_passed
    AND NOT r.frontend_contract_smoke_passed
    AND NOT r.debt_and_leverage_review_passed
    AND NOT r.liquidity_risk_review_passed
    AND NOT r.fees_and_redemption_review_passed
    AND NOT r.dic_risk_sfdr_review_passed;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Preserving original values and signed gate failed'; END IF;

  WITH corrected(label,old_pct,new_pct) AS (
    VALUES ('Finlande',8::numeric,6::numeric),('Italie',1::numeric,14::numeric),
           ('Lettonie',6::numeric,1::numeric),('Portugal',14::numeric,8::numeric)
  )
  UPDATE maximus_agents.scpi_candidate_allocations a
  SET pct=x.new_pct, qa_status='qa_pass', checked_at=now(),
      evidence_excerpt=
        'ARBITRAGE DU MAPPAGE GEOGRAPHIQUE CORUM EURION T2 2026 | '
        ||a.label||': VALEUR HISTORIQUE NON CERTIFIEE '||x.old_pct||
        ' % -> VALEUR RETENUE POUR T2 '||x.new_pct||
        ' %. PDF CORUM original empreinte='||official_sha||
        ' page 4; extraction des valeurs sans correspondance reliable libellés : '
        ||'https://francescpi.com/scpi-de-rendement/corum-eurion/bi/corum-eurion-bulletin-2026-t2.pdf . '
        ||'Trois retranscriptions datées au 30/06/2026 corroborent exactement : '
        ||'https://app.2ndmarket.fr/scpi/715-parts-corum-eurion-usufruit-26-part-reconstitution-en-2029-2 ; '
        ||'https://quellescpi.com/scpi/corum-eurion/ ; '
        ||'https://www.scpi-simulateur.fr/scpi-corum-eurion.html . '
        ||'Source secondaire contradictoire CONSERVEE : https://ateispatrimoine.com/scpi/corum-eurion/ . '
        ||'Valeurs initiales et méthodologie inscrites dans final_review.review_evidence.source_arbitrations. '
        ||'Niveau preuve = réconciliation documentaire multsources, pas inspection visuelle du graphique original ni signature réglementaire.'
  FROM corrected x
  WHERE a.scpi_slug='corum-eurion' AND a.label=x.label
    AND a.allocation_type='geography' AND a.source_period='2026-T2'
    AND a.pct=x.old_pct AND a.qa_status='needs_review'
    AND a.source_sha256=official_sha AND a.source_page=4;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>4 THEN RAISE EXCEPTION 'Only % of 4 Eurion country transpositions corrected; roll back',n; END IF;
END IF;

IF NOT EXISTS(
  SELECT 1 FROM maximus_agents.scpi_candidate_allocation_certification_v1
  WHERE scpi_slug='corum-eurion' AND geography_verified AND sector_verified AND allocations_verified
) THEN RAISE EXCEPTION 'No exact-key, exact-values 100pct country certification after arbitration'; END IF;

IF EXISTS(
 SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
 WHERE scpi_slug='corum-eurion' AND final_release_ready
) THEN RAISE EXCEPTION 'Source-level mapping cannot authorize final financial release'; END IF;
END $eurion$;
