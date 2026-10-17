-- CORUM T2 2026: dated property count stated directly in the publisher's
-- official HTML portfolio section. Distinguish exact count from generic
-- "more than N" marketing copy. Do NOT infer WALT, tenants or collections.
-- This migration is intentionally limited to three exact dated building counts.
DO $dated_issuer_properties$
DECLARE applied_cert integer; applied_ind integer;
BEGIN
 IF (SELECT count(*) FROM public.scpi_indicators i
     JOIN maximus_agents.scpi_universe u USING(scpi_slug)
     WHERE i.scpi_slug IN ('corum-eurion','corum-origin','corum-xl')
       AND i.source_period='2026-T2'
       AND i.nombre_immeubles IS NULL
       AND u.lifecycle='existing'
       AND u.publication_authorized
       AND u.analysis_certified
       AND u.strict_pass) <> 3
 THEN RAISE EXCEPTION 'Exact publisher property facts cannot overwrite prior values or unpublished candidates'; END IF;
 IF EXISTS(
  SELECT 1 FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug IN ('corum-eurion','corum-origin','corum-xl')
    AND c.source_period='2026-T2' AND c.metric='nombre_immeubles')
 THEN RAISE EXCEPTION 'A building-count certificate already exists; reconcile instead of overwriting'; END IF;

 WITH official_fact(scpi_slug,value_numeric,source_url,evidence_text) AS (
 VALUES
 ('corum-eurion',54::numeric,'https://www.corum.fr/nos-scpi/eurion',
   'Émetteur CORUM, rubrique Patrimoine: 54 immeubles dans 8 pays de la zone euro, au 30/06/2026.'),
 ('corum-origin',170::numeric,'https://www.corum.fr/nos-scpi/corum-origin',
   'Émetteur CORUM, rubrique Patrimoine: 170 immeubles dans 13 pays de la zone euro, au 30/06/2026.'),
 ('corum-xl',96::numeric,'https://www.corum.fr/nos-scpi/corum-xl',
   'Émetteur CORUM, rubrique Patrimoine: 96 immeubles dans 12 pays, au 30/06/2026; ne pas confondre avec le bandeau marketing "Plus de 96".')
 )
 INSERT INTO public.scpi_metric_certifications
 (scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
  evidence_text,verification_status,verification_method)
 SELECT scpi_slug,'2026-T2','nombre_immeubles',value_numeric,
   'NUMBER_OF_BUILDINGS',source_url,NULL,evidence_text,
   'manual_verified_official','direct_issuer_html_dated_2026_t2'
 FROM official_fact;
 GET DIAGNOSTICS applied_cert=ROW_COUNT;
 IF applied_cert<>3 THEN RAISE EXCEPTION 'Exactly 3 issuer certificates required: %',applied_cert; END IF;

 UPDATE public.scpi_indicators i
 SET nombre_immeubles=c.value_numeric::integer
 FROM public.scpi_metric_certifications c
 WHERE i.scpi_slug=c.scpi_slug
   AND i.scpi_slug IN ('corum-eurion','corum-origin','corum-xl')
   AND i.source_period=c.source_period
   AND c.source_period='2026-T2'
   AND c.metric='nombre_immeubles'
   AND c.verification_status='manual_verified_official'
   AND c.verification_method='direct_issuer_html_dated_2026_t2'
   AND i.nombre_immeubles IS NULL;
 GET DIAGNOSTICS applied_ind=ROW_COUNT;
 IF applied_ind<>3 THEN RAISE EXCEPTION 'Expected three verified property additions, found %',applied_ind; END IF;

 IF EXISTS(SELECT 1 FROM public.scpi_indicators i
  WHERE i.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
   AND (i.nombre_locataires IS NOT NULL OR i.walt IS NOT NULL
    OR i.walb IS NOT NULL OR i.collecte_nette IS NOT NULL))
 THEN RAISE EXCEPTION 'No other unreviewed rental metrics should be fabricated'; END IF;
END $dated_issuer_properties$;