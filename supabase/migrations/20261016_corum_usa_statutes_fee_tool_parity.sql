-- CORUM USA fee tier source is OFFICIAL STATUTES (p9), not quarterly issuer
-- T2 bulletin. The old tool gate incorrectly demanded both fee metrics from
-- the same quarterly bulletin, despite correctly verified legal source rows.
-- Preserve existing XL quarterly tier check and optional flat fees for others.
-- No numeric, QA, public-release or final audit flags are modified.
SET search_path TO public,maximus_agents;
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_tool_readiness AS
 SELECT u.scpi_slug,
    i.scpi_slug IS NOT NULL AS catalog_and_simulator_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64} AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;::text)) OR (i.frais_gestion IS NULL AND EXISTS (
 SELECT 1
 FROM public.scpi_metric_certifications c1
 JOIN public.scpi_metric_certifications c2
  ON c2.scpi_slug=c1.scpi_slug AND c2.source_period=c1.source_period
  AND c2.metric='management_fee_non_euro_zone_ht'
 JOIN maximus_agents.scpi_candidate_regulatory_documents d
  ON d.scpi_slug=c1.scpi_slug AND d.document_kind='statutes'
  AND d.source_url=c1.source_url AND d.source_url=c2.source_url
  AND d.identity_verified IS TRUE AND d.kind_verified IS TRUE
  AND d.pdf_sha256 ~ '^[a-f0-9]{64} AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;
  AND c1.source_page BETWEEN 1 AND d.page_count
  AND c2.source_page BETWEEN 1 AND d.page_count
 WHERE c1.scpi_slug=i.scpi_slug AND c1.source_period=i.source_period
  AND c1.metric='management_fee_euro_zone_ht'
  AND c1.verification_status='manual_verified_official'
  AND c2.verification_status='manual_verified_official'
  AND c1.verification_method=c2.verification_method
  AND c1.unit='PERCENT' AND c2.unit='PERCENT'
  AND c1.value_numeric>0 AND c1.value_numeric<100
  AND c2.value_numeric>0 AND c2.value_numeric<100
 ))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64} AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;::text)) OR (i.frais_gestion IS NULL AND EXISTS (
 SELECT 1
 FROM public.scpi_metric_certifications c1
 JOIN public.scpi_metric_certifications c2
  ON c2.scpi_slug=c1.scpi_slug AND c2.source_period=c1.source_period
  AND c2.metric='management_fee_non_euro_zone_ht'
 JOIN maximus_agents.scpi_candidate_regulatory_documents d
  ON d.scpi_slug=c1.scpi_slug AND d.document_kind='statutes'
  AND d.source_url=c1.source_url AND d.source_url=c2.source_url
  AND d.identity_verified IS TRUE AND d.kind_verified IS TRUE
  AND d.pdf_sha256 ~ '^[a-f0-9]{64} AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;
  AND c1.source_page BETWEEN 1 AND d.page_count
  AND c2.source_page BETWEEN 1 AND d.page_count
 WHERE c1.scpi_slug=i.scpi_slug AND c1.source_period=i.source_period
  AND c1.metric='management_fee_euro_zone_ht'
  AND c1.verification_status='manual_verified_official'
  AND c2.verification_status='manual_verified_official'
  AND c1.verification_method=c2.verification_method
  AND c1.unit='PERCENT' AND c2.unit='PERCENT'
  AND c1.value_numeric>0 AND c1.value_numeric<100
  AND c2.value_numeric>0 AND c2.value_numeric<100
 ))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_release_v1 fr
          WHERE fr.scpi_slug = u.scpi_slug AND fr.final_release_ready IS TRUE)) AS full_surface_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug)
     LEFT JOIN scpi_indicators i USING (scpi_slug)
     LEFT JOIN scpi_bulletin_analysis a USING (scpi_slug)
     LEFT JOIN scpi_trajectory_pilot_liquidity l USING (scpi_slug)
     JOIN maximus_agents.scpi_candidate_publication_gate_v1 g USING (scpi_slug)
     LEFT JOIN LATERAL ( SELECT count(*) AS n_history,
            count(DISTINCT th.source_period) AS n_periods
           FROM scpi_trajectory_pilot_history th
          WHERE th.scpi_slug = u.scpi_slug AND th.qa_status IS NOT NULL AND th.source_url ~~ 'https://%'::text) h ON true;;
RESET search_path;

DO $post$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n
 FROM maximus_agents.scpi_candidate_tool_readiness t
 WHERE t.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND t.comparator_radar_ready IS TRUE;
 IF n<>4 THEN RAISE EXCEPTION 'Official fee provenance not recognized by all 4 comparators: %/4',n; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_indicators i
  WHERE i.scpi_slug IN ('corum-usa','corum-xl')
   AND i.frais_gestion IS NOT NULL) THEN
  RAISE EXCEPTION 'Never invent a single management fee across legal geographical tiers';
 END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe u
 WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND (u.publication_authorized OR u.analysis_certified)) THEN
  RAISE EXCEPTION 'Tool-data readiness cannot authorize public financial publication';
 END IF;
 IF (SELECT t.finance_and_final_qa_ready FROM maximus_agents.scpi_candidate_tool_readiness t WHERE t.scpi_slug='corum-usa') THEN
  RAISE EXCEPTION 'Statutory fee rows alone must never sign final financial audit';
 END IF;
END $post$;
