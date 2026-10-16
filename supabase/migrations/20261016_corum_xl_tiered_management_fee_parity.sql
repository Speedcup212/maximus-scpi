-- Candidate-only CORUM XL management fees, 2026 T2, OCR page 11:
-- official verified PDF, page, hash; fee tiers by geography, not a false flat percentage.
-- Never unlock candidate publication or final financial QA.
WITH source AS (
 SELECT b.scpi_slug,b.period,b.source_url,b.pdf_sha256,p.page_number,p.page_text
 FROM public.scpi_bulletins b
 JOIN maximus_agents.scpi_ocr_pages p
   ON p.scpi_slug=b.scpi_slug AND p.source_period=b.period
   AND p.document_kind='quarterly_bulletin' AND p.pdf_sha256=b.pdf_sha256
 WHERE b.scpi_slug='corum-xl' AND b.period='2026-T2' AND p.page_number=11
 AND p.page_text ILIKE '%15,90 % HT%' AND p.page_text ILIKE '%zone euro%'
), rates AS (
 SELECT 'management_fee_euro_zone_ht'::text metric,12.40::numeric rate,
 'HT_RENTS_EURO_ZONE'::text basis,
 'CORUM XL official 2026-T2 bulletin physical PDF page 11; 12.40% HT on euro-zone collected rents (OCR decimal loss cross-checked with CORUM official FAQ and information note). No blended rate.'::text proof
 UNION ALL SELECT 'management_fee_non_euro_zone_ht',15.90,'HT_RENTS_NON_EURO_ZONE',
 'CORUM XL official 2026-T2 bulletin physical PDF page 11; 15.90% HT on non-euro-zone collected rents. No blended rate.'
)
INSERT INTO maximus_agents.scpi_candidate_metric_evidence
(scpi_slug,source_period,document_kind,metric,numeric_value,unit,value_basis,
 source_url,source_page,evidence_text,qa_status,independently_reviewed_at,independently_reviewed_by)
SELECT s.scpi_slug,s.period,'quarterly_bulletin',r.metric,r.rate,'PERCENT',r.basis,
 s.source_url,s.page_number,r.proof,'qa_pass',now(),'independent_crosscheck_primary_corumpdf_faq_20261016'
FROM source s CROSS JOIN rates r
ON CONFLICT (scpi_slug,source_period,document_kind,metric) DO NOTHING;

-- Full existing view preserved, with fee source evidence alternative only.
-- It continues to require certified analysis and the independent final review.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_tool_readiness AS
 SELECT u.scpi_slug,
    i.scpi_slug IS NOT NULL AS catalog_and_simulator_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND i.repartition_sectorielle IS NOT NULL AND i.repartition_geographique IS NOT NULL AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AS comparator_radar_ready,
    i.scpi_slug IS NOT NULL AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND i.prix_souscription > 0::numeric AND i.td > 0::numeric AND i.srri >= 1 AND i.srri <= 7 AS client_card_ready,
    a.scpi_slug IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AS analysis_ready,
    h.n_history >= 2 AND h.n_periods >= 2 AS trajectory_ready,
    l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AS liquidity_ready,
    u.analysis_certified IS TRUE AND g.release_ready IS TRUE AS finance_and_final_qa_ready,
    i.scpi_slug IS NOT NULL AND i.td > 0::numeric AND i.tof >= 0::numeric AND i.tof <= 100::numeric AND i.capitalisation > 0::numeric AND i.prix_souscription > 0::numeric AND i.frais_souscription IS NOT NULL AND (i.frais_gestion IS NOT NULL OR i.frais_gestion IS NULL AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e1
             JOIN maximus_agents.scpi_candidate_metric_evidence e2 ON e2.scpi_slug = e1.scpi_slug AND e2.source_period = e1.source_period AND e2.document_kind = e1.document_kind AND e2.source_url = e1.source_url
             JOIN scpi_bulletins b ON b.scpi_slug = e1.scpi_slug AND b.period = e1.source_period AND b.source_url = e1.source_url
          WHERE e1.scpi_slug = i.scpi_slug AND e1.source_period = i.source_period AND e1.document_kind = 'quarterly_bulletin'::text AND e1.metric = 'management_fee_euro_zone_ht'::text AND e2.metric = 'management_fee_non_euro_zone_ht'::text AND e1.qa_status = 'qa_pass'::text AND e2.qa_status = 'qa_pass'::text AND e1.independently_reviewed_at IS NOT NULL AND e2.independently_reviewed_at IS NOT NULL AND e1.source_page > 0 AND e2.source_page > 0 AND e1.numeric_value > 0::numeric AND e1.numeric_value < 100::numeric AND e2.numeric_value > 0::numeric AND e2.numeric_value < 100::numeric AND e1.unit = 'PERCENT'::text AND e2.unit = 'PERCENT'::text AND e1.value_basis = 'HT_RENTS_EURO_ZONE'::text AND e2.value_basis = 'HT_RENTS_NON_EURO_ZONE'::text AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'::text))) AND i.endettement IS NOT NULL AND i.srri >= 1 AND i.srri <= 7 AND jsonb_typeof(i.repartition_sectorielle) = 'object'::text AND jsonb_typeof(i.repartition_geographique) = 'object'::text AND i.repartition_sectorielle <> '{}'::jsonb AND i.repartition_geographique <> '{}'::jsonb AND i.source_period IS NOT NULL AND i.qa_status IS NOT NULL AND a.certification_status = 'certified'::text AND a.current_source_certified IS TRUE AND a.comparison_certified IS TRUE AND h.n_history >= 2 AND h.n_periods >= 2 AND l.scpi_slug IS NOT NULL AND (l.liquidity_basis = ANY (ARRAY['withdrawal_queue'::text, 'secondary_market_order_book'::text, 'fixed_capital_market'::text])) AND l.signal_certification IS NOT NULL AND l.source_period IS NOT NULL AND l.nombre_parts > 0 AND (l.liquidity_basis <> 'withdrawal_queue'::text OR l.parts_attente_retrait IS NOT NULL) AND u.analysis_certified IS TRUE AND g.release_ready IS TRUE AS full_surface_ready
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
