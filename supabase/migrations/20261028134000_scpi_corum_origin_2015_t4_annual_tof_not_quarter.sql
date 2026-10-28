-- CORUM Origin 2015-T4: official bulletin p.5 states TOF 2015
-- (annual basis), not a distinct 4T 2015 quarterly value.
-- Do not fabricate the missing quarterly TOF or copy the annual value.
DO $review$
DECLARE h record; b record; n int;
BEGIN
 SELECT * INTO h FROM public.scpi_indicator_history
 WHERE scpi_slug='corum-origin' AND source_period='2015-T4'
   AND tof IS NULL AND qa_status='auto_verified_dual_pdf_fields';
 SELECT * INTO b FROM public.scpi_bulletins
 WHERE scpi_slug='corum-origin' AND period='2015-T4'
 AND pdf_sha256='93d7ac830a5bccd7dbc7eefd4c7514ac87fa09b75ec3bf81f13ffb33585637da';
 IF h.id IS NULL OR b.id IS NULL OR h.source_url IS DISTINCT FROM b.source_url
 OR EXISTS(SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug='corum-origin' AND source_period='2015-T4' AND metric='tof')
 THEN RAISE EXCEPTION 'CORUM 2015-T4 official source or evidence changed'; END IF;
 INSERT INTO public.scpi_metric_certifications(
  scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
  evidence_text,bulletin_id,verification_status,verification_method,
  extraction_confidence,verified_at)
 VALUES('corum-origin','2015-T4','tof',NULL,'%',h.source_url,5,
  'CORUM Convictions bulletin du 4e trimestre 2015, page PDF 5 : graphique Taux d Occupation Physique et Financier trimestriel et annuel, valeur TOF 2015 99,5 % (année entière). Aucun chiffre distinct explicitement étiqueté TOF 4T 2015 identifié sur ce graphique. Le TOF trimestriel 2015-T4 n est PAS publié de façon indépendante; ne pas substituer le 99,5 % annuel. PDF SHA256 93d7ac830a5bccd7dbc7eefd4c7514ac87fa09b75ec3bf81f13ffb33585637da.',
  b.id,'manual_verified_official_not_reported','issuer_pdf_annual_2015_only_quarter_not_reported',0.98,now());
 UPDATE public.scpi_indicator_history hi SET
   qa_status='manual_verified_official_tof_not_reported_quarterly',
   metric_provenance=coalesce(hi.metric_provenance,'{}'::jsonb)||
     jsonb_build_object('tof',jsonb_build_object(
       'quarter_value',null,'reported',false,'annual_reference_value',99.5,
       'annual_basis','2015_full_year_not_2015_T4',
       'source_url',hi.source_url,'source_page',5,
       'sha256','93d7ac830a5bccd7dbc7eefd4c7514ac87fa09b75ec3bf81f13ffb33585637da',
       'verification','official_pdf_manual_period_disambiguation'))
 WHERE hi.id=h.id AND hi.tof IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'CORUM annual-only classification not applied'; END IF;
 UPDATE public.scpi_bulletins SET extraction_json=coalesce(extraction_json,'{}'::jsonb)||
 jsonb_build_object('tof_period_policy',
   jsonb_build_object('quarter_reported',false,'quarter','2015-T4',
    'annual_to_not_confuse',99.5,'source_page',5,'status','official_not_reported'))
 WHERE id=b.id;
 INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,bulletin_url,source_period,ended_at)
 VALUES('corum-origin','updated','issuer_tof_annual_vs_quarter_period_review',
 'T4 2015 TOF not independently published: official page 5 only states annual 2015 TOF 99.5%. No fabricated quarterly value.',
 h.source_url,'2015-T4',now());
END $review$;