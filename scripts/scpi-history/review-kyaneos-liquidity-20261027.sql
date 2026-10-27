-- Actual rendered official quarterly tables, AI reviewed 27/10/2026.
-- A dash in the explicit queue row is nil stock, according to the same issuer
-- convention already certified for T2 2026. Never confuse compensated exits
-- (5553/5548/11302) with pending shares. No missing field is defaulted to zero.
BEGIN;
INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,verification_status,verification_method,extraction_confidence)
VALUES('kyaneos-pierre','2026-T1','parts_attente_retrait',0,'parts','https://kyaneosam.com/wp-content/uploads/2026/05/BT-T1-2026-KP.pdf',3,'Official Marché des parts 2026-T1; current quarter column; Parts en attente de cession = ''-'' (nil stock). Source SHA256=e9349f70d3f1bcd29be22efd0f3b19e9615a4b097c8e755dde0b4d9f19509407. MuPDF + Poppler + rendered AI visual review 2026-10-27.','manual_verified_official_liquidity','codex_visual_review_official_nil_dash_current_period_column',0.98)
ON CONFLICT(scpi_slug,source_period,metric) DO UPDATE SET value_numeric=excluded.value_numeric,unit=excluded.unit,source_page=excluded.source_page,evidence_text=excluded.evidence_text,verification_status=excluded.verification_status,verification_method=excluded.verification_method;
UPDATE public.scpi_indicator_history SET parts_attente_retrait=0,liquidity_basis='withdrawal_queue_official_nil_dash' WHERE scpi_slug='kyaneos-pierre' AND source_period='2026-T1';
COMMIT;
INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,verification_status,verification_method,extraction_confidence)
VALUES('kyaneos-pierre','2025-T4','parts_attente_retrait',0,'parts','https://kyaneosam.com/wp-content/uploads/2026/02/SCPI-KP-Bulletin-trimestriel-4T2025.pdf',3,'Official Marché des parts 2025-T4; current quarter column; Parts en attente de cession = ''-'' (nil stock). Source SHA256=ce720abe4a2fb9bddee25c436ec4b7347f132a64f3049ffdcda5864e54d8797e. MuPDF + Poppler + rendered AI visual review 2026-10-27.','manual_verified_official_liquidity','codex_visual_review_official_nil_dash_current_period_column',0.98)
ON CONFLICT(scpi_slug,source_period,metric) DO UPDATE SET value_numeric=excluded.value_numeric,unit=excluded.unit,source_page=excluded.source_page,evidence_text=excluded.evidence_text,verification_status=excluded.verification_status,verification_method=excluded.verification_method;
UPDATE public.scpi_indicator_history SET parts_attente_retrait=0,liquidity_basis='withdrawal_queue_official_nil_dash' WHERE scpi_slug='kyaneos-pierre' AND source_period='2025-T4';
COMMIT;
INSERT INTO public.scpi_metric_certifications(scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,verification_status,verification_method,extraction_confidence)
VALUES('kyaneos-pierre','2025-T3','parts_attente_retrait',0,'parts','https://kyaneosam.com/wp-content/uploads/2025/10/SCPI-KP-Bulletin-trimestriel-3T2025-1.pdf',4,'Official Marché des parts 2025-T3; current quarter column; Parts en attente de cession = ''-'' (nil stock). Source SHA256=aea90dd5fc9602d35436a86cbf72a2605ef2a2270bfb8802182be78075e60bc3. MuPDF + Poppler + rendered AI visual review 2026-10-27.','manual_verified_official_liquidity','codex_visual_review_official_nil_dash_current_period_column',0.98)
ON CONFLICT(scpi_slug,source_period,metric) DO UPDATE SET value_numeric=excluded.value_numeric,unit=excluded.unit,source_page=excluded.source_page,evidence_text=excluded.evidence_text,verification_status=excluded.verification_status,verification_method=excluded.verification_method;
UPDATE public.scpi_indicator_history SET parts_attente_retrait=0,liquidity_basis='withdrawal_queue_official_nil_dash' WHERE scpi_slug='kyaneos-pierre' AND source_period='2025-T3';
COMMIT;
