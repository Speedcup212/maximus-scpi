-- 2026-10-17 P0 CORUM: no invented creation year or dividend cadence.
-- Issuer landing and monthly dividend histories; four candidate records only.
-- This does not constitute a release, source-hash certification, or financial signoff.
DO $issuer_product_facts$
DECLARE changed_rows integer;
BEGIN
  IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe u
    WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
    AND (u.lifecycle<>'candidate' OR u.publication_authorized OR u.analysis_certified OR u.strict_pass)
  ) THEN RAISE EXCEPTION 'A CORUM fund is no longer a private candidate'; END IF;

  IF (SELECT count(*) FROM public.scpi_indicators i
    WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
      AND i.source_period='2026-T2'
      AND i.annee_creation IS NULL AND i.versement_loyers IS NULL) <> 4
  THEN
    -- Allow exact replay of a completed, documented source migration.
    IF (SELECT count(*) FROM public.scpi_indicators i JOIN maximus_agents.scpi_candidate_final_review r USING(scpi_slug)
      WHERE i.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
      AND i.annee_creation = CASE i.scpi_slug
          WHEN 'corum-origin' THEN 2012 WHEN 'corum-eurion' THEN 2020
          WHEN 'corum-xl' THEN 2017 WHEN 'corum-usa' THEN 2024 END
      AND i.versement_loyers='Mensuel'
      AND r.review_evidence->'issuer_product_facts_2026_10_17'->>'status'='direct_issuer_web_source_checked')=4
    THEN RAISE NOTICE 'Four issuer creation-year and monthly-dividend facts already present';
    ELSE RAISE EXCEPTION 'Unexpected existing or conflicting product fact; no overwrite'; END IF;
  ELSE
    WITH primary_source(scpi_slug,creation_year,history_url,year_url) AS (VALUES
      ('corum-origin',2012,'https://www.corum.fr/nos-scpi/corum-origin/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-eurion',2020,'https://www.corum.fr/nos-scpi/eurion/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-xl',2017,'https://www.corum.fr/nos-scpi/corum-xl/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-usa',2024,'https://www.corum.fr/nos-scpi/corum-usa/dividendes',
         'https://www.corum.fr/nos-scpi/corum-usa')
    )
    UPDATE public.scpi_indicators i
      SET annee_creation=p.creation_year,
          versement_loyers='Mensuel'
      FROM primary_source p
      WHERE i.scpi_slug=p.scpi_slug AND i.source_period='2026-T2'
        AND i.annee_creation IS NULL AND i.versement_loyers IS NULL
        AND i.qa_status='source_verified_content';
    GET DIAGNOSTICS changed_rows=ROW_COUNT;
    IF changed_rows<>4 THEN RAISE EXCEPTION 'Expected to update four independent CORUM candidates, found %',changed_rows; END IF;

    WITH primary_source(scpi_slug,creation_year,history_url,year_url) AS (VALUES
      ('corum-origin',2012,'https://www.corum.fr/nos-scpi/corum-origin/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-eurion',2020,'https://www.corum.fr/nos-scpi/eurion/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-xl',2017,'https://www.corum.fr/nos-scpi/corum-xl/dividendes',
         'https://www.corum.fr/actus/la-scpi-eurion-est-renommee-corum-eurion'),
      ('corum-usa',2024,'https://www.corum.fr/nos-scpi/corum-usa/dividendes',
         'https://www.corum.fr/nos-scpi/corum-usa')
    )
    UPDATE maximus_agents.scpi_candidate_final_review r
      SET review_evidence=COALESCE(r.review_evidence,'{}'::jsonb)
       ||jsonb_build_object('issuer_product_facts_2026_10_17',
        jsonb_build_object(
          'status','direct_issuer_web_source_checked',
          'year_created',p.creation_year,
          'creation_year_source_url',p.year_url,
          'dividend_cadence','Mensuel',
          'monthly_dividends_2026_source_url',p.history_url,
          'dividend_history_2026_periods',jsonb_build_array('2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'),
          'caveat','Potential monthly income not guaranteed; listing a cash distribution history does not constitute a yield or liquidity guarantee',
          'source_kind','official_issuer_published_webpage',
          'source_pdf_sha_proof',false,
          'financial_audit_signed',false,
          'release_authorized',false
        ))
      FROM primary_source p
      WHERE r.scpi_slug=p.scpi_slug
        AND r.review_evidence->'technical_precheck_2026_10_17'->>'scope'='AUTOMATED_SOURCE_RECONCILIATION_ONLY_NOT_SIGNED';
    GET DIAGNOSTICS changed_rows=ROW_COUNT;
    IF changed_rows<>4 THEN RAISE EXCEPTION 'Issuer source provenance failed to update all four reviews: %',changed_rows; END IF;
  END IF;

  IF EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
     WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl') AND final_release_ready)
  THEN RAISE EXCEPTION 'Issuer product facts cannot authorize final QA'; END IF;
END $issuer_product_facts$;
