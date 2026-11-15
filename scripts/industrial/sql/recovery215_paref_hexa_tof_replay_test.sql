-- Run after the correction, always within BEGIN / ROLLBACK.
DO $test$ BEGIN
 UPDATE public.scpi_metric_certifications SET value_numeric=84.5, source_page=5,
 verification_status='auto_verified_with_evidence',verification_method='pdf_page_text_match'
 WHERE scpi_slug='paref-hexa' AND source_period='2026-T3' AND metric='tof';
 IF NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug='paref-hexa'
 AND source_period='2026-T3' AND metric='tof' AND value_numeric=86.0 AND source_page=5
 AND verification_status='auto_verified_with_evidence')
 THEN RAISE EXCEPTION 'REC215_STALE_CERT_REPLAY_NOT_BLOCKED'; END IF;
 PERFORM public.refresh_scpi_metric_certifications('paref-hexa');
 IF NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug='paref-hexa'
 AND source_period='2026-T3' AND metric='tof' AND value_numeric=86.0 AND source_page=5
 AND verification_status='auto_verified_with_evidence')
 THEN RAISE EXCEPTION 'REC215_REFRESH_LOST_CORRECT_TOF'; END IF;
END $test$;
