-- Independent Atream legal form proof, official annual report 2025
-- PDF title page (physical p.1) explicitly says SCPI à capital variable.
-- Official publisher product page also confirms unchanged SCPI capital variable nature.
UPDATE public.scpi_metric_certifications
SET source_url='https://atream.com/wp-content/uploads/2026/05/Rapport-Annuel-SCPI-Atream-Hotels-2025-Web_114-pages_compressed.pdf',
 source_page=1,
 evidence_text='Rapport annuel officiel Atream Hôtels 2025, page PDF 1 : « ATREAM HÔTELS — Société Civile de Placement Immobilier à capital variable ». Confirmation sur https://atream.com/solutions/fonds-ouverts/scpi-atream-hotels/ (« SCPI à capital variable »). Forme juridique structurelle en vigueur au T2 2026, distincte d''une valeur de rendement trimestrielle. Audit indépendant 16/10/2026 ; ancien document Article-10 incorrect écarté.',
 bulletin_id=NULL,verification_status='manual_verified_official',
 verification_method='official_annual_2025_and_publisher_html_crosscheck_20261016',
 extraction_confidence=1,verified_at=now()
WHERE scpi_slug='atream-hotel' AND source_period='2026-T2'
 AND metric='capital_type' AND value_text='variable'
 AND verification_status='source_verified_no_field_evidence'
 AND source_page IS NULL AND evidence_text IS NULL
 AND source_url='https://atream.com/wp-content/uploads/2020/07/20260916-SCPI-Atream-Hotels-Article-10.pdf';