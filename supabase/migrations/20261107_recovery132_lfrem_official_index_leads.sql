-- RECOVERY-132 / SOURCE-P0: issuer-index leads for 14 La Française REM candidates.
-- First-party directory: https://client.la-francaise.com/bt
-- The 2026-T2 index links were observed on 2026-11-07. Binary fetch could
-- not be completed from the inspection environment; DO NOT mark PDF verified.
-- 2026-T3 may be available: the existing source-collector must prefer the
-- actual newest proven document after issuer retrieval, never re-date this T2.
-- Excludes generic "multihabitation" because issuer page lists only numbered funds.
-- No AI financial QA, false hash, certification, publication, or recommendation.
WITH official_links(scpi_slug, identity_observed, direct_document_url) AS (
 VALUES
  ('lf-croissance-et-territoires', 'LF Croissance & Territoires', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-croissance-territoires-30062026'),
  ('lf-grand-paris-habitation', 'LF Grand Paris Habitation', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-grand-paris-habitation-30062026'),
  ('lf-les-grands-palais', 'LF Les Grands Palais', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-les-grands-palais-30062026'),
  ('lf-renovimmo', 'LF Rénovimmo', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-lf-renovimmo-30062026'),
  ('multihabitation-10', 'Multihabitation 10', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-10-30062026'),
  ('multihabitation-2', 'Multihabitation 2', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-2-30062026'),
  ('multihabitation-3', 'Multihabitation 3', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-3-30062026'),
  ('multihabitation-4', 'Multihabitation 4', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-4-30062026'),
  ('multihabitation-5', 'Multihabitation 5', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-5-30062026'),
  ('multihabitation-6', 'Multihabitation 6', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-6-30062026'),
  ('multihabitation-7', 'Multihabitation 7', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-7-30062026'),
  ('multihabitation-8', 'Multihabitation 8', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-8-30062026'),
  ('multihabitation-9', 'Multihabitation 9', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-9-30062026'),
  ('ufg-pierre-et-vacances', 'UFG Pierre & Vacances', 'https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-ufg-pierre-vacances-30062026')
)
INSERT INTO maximus_agents.scpi_candidate_document_index
(scpi_slug,source_period,document_kind,publisher_index_url,direct_document_url,
 identity_observed,status,source_primary,review_note)
SELECT l.scpi_slug, '2026-T2', 'quarterly_bulletin',
       'https://client.la-francaise.com/bt', l.direct_document_url,
       l.identity_observed, 'publisher_index_visible', true,
       'Issuer index link observed 2026-11-07. PDF binary NOT retrieved; SHA256, period, pages and financial data UNVERIFIED. Do not admit QA or publish.'
FROM official_links l
JOIN maximus_agents.scpi_universe u ON u.scpi_slug=l.scpi_slug
WHERE u.lifecycle='candidate' AND u.management_company='La Française REM'
ON CONFLICT (scpi_slug, source_period,document_kind) DO NOTHING;
