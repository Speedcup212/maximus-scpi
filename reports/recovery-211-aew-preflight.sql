-- RECOVERY-211 / #426 — read-only AEW candidate release preflight.
-- Run using Supabase SQL editor / execute_sql. Never writes or grants.
-- The v3 verdict is necessary but NOT sufficient for a public release:
-- GitHub CI, browser, exact Netlify deployment and protected atomic activation remain mandatory.
WITH c AS (
  SELECT *
  FROM maximus_agents.scpi_candidate_release_circuit_v3
  WHERE scpi_slug = 'aew-opportunites-europe' AND lifecycle = 'candidate'
),
s AS (
  SELECT scpi_slug, source_period, source_url, qa_status, nombre_parts,
         parts_attente_retrait, prix_souscription, prix_retrait, td, tof,
         prix_reconstitution, valeur_realisation, capitalisation, endettement,
         metric_provenance
  FROM maximus_agents.scpi_candidate_indicator_stage
  WHERE scpi_slug = 'aew-opportunites-europe'
)
SELECT
  clock_timestamp() AS checked_at,
  c.scpi_slug,
  c.source_period,
  c.pdf_sha256,
  c.publisher_pdf_valid,
  c.current_qa_fields,
  c.annual_qa_fields,
  c.core_qa_fields,
  c.regulatory_documents_verified,
  c.geography_verified,
  c.sector_verified,
  c.current_indicators_ready,
  c.live_liquidity_ready,
  c.prepublication_verified_history_periods,
  c.prepublication_history_consistency_ready,
  c.historical_periods,
  c.live_trajectory_points,
  c.bulletin_analysis_ready,
  c.independent_review_ready,
  c.independent_audit_ready,
  c.responsible_batch_ready,
  c.final_release_ready,
  s.qa_status AS private_stage_qa_status,
  s.nombre_parts,
  s.parts_attente_retrait,
  round(100.0*s.parts_attente_retrait/nullif(s.nombre_parts,0), 2) AS withdrawal_queue_pct_of_parts,
  s.prix_souscription,
  s.prix_retrait,
  s.td,
  s.metric_provenance->'td'->>'basis' AS td_period_basis,
  s.tof,
  s.endettement,
  s.prix_reconstitution,
  s.valeur_realisation,
  s.capitalisation,
  (s.capitalisation*1000000-s.nombre_parts*s.prix_souscription) AS capitalisation_arithmetic_error_eur,
  CASE
    WHEN c.final_release_ready IS TRUE
      THEN 'DB_READY_BUT_PUBLICATION_REQUIRES_INDEPENDENT_CI_NETLIFY_AND_ATOMIC_READBACK'
    ELSE 'NO_GO_PUBLICATION'
  END AS preflight_verdict
FROM c
JOIN s USING (scpi_slug);
