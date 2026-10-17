-- MaximusSCPI / 2026-10-17: eliminate stale file as the source of publishing truth.
-- Read-only, PRIVATE, RLS-respecting, one calculation from already certified ledger.
-- This is a DRAFT, not a release gate or an automatic compliance signoff.
CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_publication_draft_v1
WITH (security_invoker = true)
AS
WITH base AS (
  SELECT i.scpi_slug, i.nom, i.source_period,
    i.annee_creation, i.versement_loyers, i.sfdr, i.label_isr,
    i.prix_souscription, i.prix_reconstitution, i.frais_souscription, i.frais_gestion,
    i.capitalisation, i.delai_jouissance, i.srri, i.duree_detention_recommandee,
    i.repartition_sectorielle, i.repartition_geographique, i.td_reference_period,
    i.debt_reference_period,
    l.liquidity_basis,
    d.source_excerpt AS issuer_risks_note_excerpt,
    d.source_url AS issuer_risks_note_url,
    (SELECT m.numeric_value FROM maximus_agents.scpi_candidate_regulatory_metric_evidence m
      WHERE m.scpi_slug=i.scpi_slug AND m.metric='minimum_initial_parts'
        AND m.qa_status='qa_pass' AND m.independently_verified_at IS NOT NULL
      LIMIT 1) AS min_initial_parts,
    (SELECT m.numeric_value FROM maximus_agents.scpi_candidate_regulatory_metric_evidence m
      WHERE m.scpi_slug=i.scpi_slug AND m.metric='risk_sri'
        AND m.qa_status='qa_pass' AND m.independently_verified_at IS NOT NULL
      LIMIT 1) AS verified_sri,
    (SELECT m.numeric_value FROM maximus_agents.scpi_candidate_regulatory_metric_evidence m
      WHERE m.scpi_slug=i.scpi_slug AND m.metric='recommended_holding_years'
        AND m.qa_status='qa_pass' AND m.independently_verified_at IS NOT NULL
      LIMIT 1) AS verified_holding_years,
    (SELECT c.value_numeric FROM public.scpi_metric_certifications c
      WHERE c.scpi_slug=i.scpi_slug AND c.source_period=i.source_period
        AND c.metric='management_fee_euro_zone_ht'
        AND c.verification_status='manual_verified_official'
      LIMIT 1) AS euro_management_ht,
    (SELECT c.value_numeric FROM public.scpi_metric_certifications c
      WHERE c.scpi_slug=i.scpi_slug AND c.source_period=i.source_period
        AND c.metric='management_fee_non_euro_zone_ht'
        AND c.verification_status='manual_verified_official'
      LIMIT 1) AS non_euro_management_ht
  FROM public.scpi_indicators i
  JOIN maximus_agents.scpi_universe u USING(scpi_slug)
  LEFT JOIN public.scpi_trajectory_pilot_liquidity l
    ON l.scpi_slug=i.scpi_slug AND l.source_period=i.source_period
  LEFT JOIN maximus_agents.scpi_candidate_regulatory_documents d
    ON d.scpi_slug=i.scpi_slug AND d.document_kind='note'
      AND d.identity_verified AND d.kind_verified AND d.pdf_sha256~'^[a-f0-9]{64}$'
  WHERE u.lifecycle='candidate' AND NOT u.publication_authorized
    AND i.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND i.source_period='2026-T2'
), drafts AS (
 SELECT b.scpi_slug,b.nom,b.source_period,
 jsonb_build_object(
   'creation_year', b.annee_creation,
   'minimum_investment', CASE WHEN b.min_initial_parts>=1 AND b.prix_souscription>0
      THEN b.prix_souscription*b.min_initial_parts ELSE NULL END,
   'subscription_fees',b.frais_souscription,
   'management_fees', CASE
      WHEN b.euro_management_ht IS NOT NULL AND b.non_euro_management_ht IS NOT NULL
        THEN jsonb_build_object('kind','geographic_tiers','basis','HT',
            'revenue_basis','loyers encaissés','euro_zone_percent',b.euro_management_ht,
            'outside_euro_zone_percent',b.non_euro_management_ht,
            'blended_rate',NULL,'source_period',b.source_period)
      ELSE to_jsonb(b.frais_gestion) END,
   'reconstitution_value',b.prix_reconstitution,
   'risk_sri', CASE WHEN b.verified_sri=b.srri THEN b.srri ELSE NULL END,
   'recommended_holding_years', CASE WHEN b.verified_holding_years=b.duree_detention_recommandee
         THEN b.duree_detention_recommandee ELSE NULL END,
   'liquidity_basis', b.liquidity_basis,
   'withdrawal_terms', NULL,
   'enjoyment_delay', b.delai_jouissance,
   'sector_allocation', b.repartition_sectorielle,
   'geographic_allocation', b.repartition_geographique,
   'sfdr',b.sfdr,
   'capitalization_m',b.capitalisation,
   'sector_class', CASE
      WHEN b.repartition_sectorielle ? 'Bureaux'
        AND (b.repartition_sectorielle->>'Bureaux')::numeric>=50 THEN 'bureaux'
      WHEN b.repartition_sectorielle ? 'Commerces'
        AND (b.repartition_sectorielle->>'Commerces')::numeric>=50 THEN 'commerces'
      ELSE NULL END,
   'geographic_scope', CASE
      WHEN b.repartition_geographique ? 'États-Unis'
        AND (b.repartition_geographique->>'États-Unis')::numeric=100 THEN 'usa'
      WHEN b.repartition_geographique ? 'Canada' THEN 'international'
      WHEN NOT EXISTS (
        SELECT 1 FROM jsonb_object_keys(b.repartition_geographique) AS country(name)
        WHERE country.name NOT IN (
          'France','Allemagne','Belgique','Espagne','Estonie','Finlande',
          'Irlande','Italie','Lettonie','Lituanie','Pays-Bas','Portugal',
          'Slovénie','Pologne','Norvège','Royaume-Uni','Suède','Danemark',
          'Autriche','Luxembourg','Grèce','Malte','Suisse','Chypre','Hongrie',
          'Croatie','République tchèque','Slovaquie','Roumanie','Bulgarie'
        )
      ) THEN 'europe'
      ELSE NULL END,
   'payment_frequency', CASE WHEN lower(b.versement_loyers)='mensuel' THEN 'Mensuelle'
     WHEN lower(b.versement_loyers)='trimestriel' THEN 'Trimestrielle'
     ELSE NULL END,
   'risk_warnings',CASE
       WHEN position('risque de perte en capital' IN lower(coalesce(b.issuer_risks_note_excerpt,'')))>0
        AND position('liquidit' IN lower(coalesce(b.issuer_risks_note_excerpt,'')))>0
        AND position('revenus ne sont pas garantis' IN lower(coalesce(b.issuer_risks_note_excerpt,'')))>0
       THEN jsonb_build_array(
         'Risque de perte en capital, liquidité limitée, et revenus non garantis, selon la note officielle de la SCPI.',
         CASE WHEN position('cours des devises' IN lower(coalesce(b.issuer_risks_note_excerpt,'')))>0
           THEN 'Exposition au risque de change : les cours des devises peuvent modifier les résultats en euros.'
           ELSE 'La durée de détention recommandée ne constitue pas une garantie de revente ou de revenu.' END
       )
       ELSE NULL END,
   'label_isr',b.label_isr
 ) AS publishing_fields,
 jsonb_build_object(
   'source_period',b.source_period,
   'annual_yield_reference',b.td_reference_period,
   'annual_debt_reference',b.debt_reference_period,
   'risk_warning_note_url',b.issuer_risks_note_url,
   'status','DRAFT_ONLY_NEVER_AUTOMATICALLY_CERTIFY',
   'source_registry','public.scpi_indicators + public.scpi_metric_certifications + regulatory_metric_evidence + liquidity',
   'source_limitations','Field presence is not sufficient. Official document/page QA, risk disclosure and independent approval remain mandatory.'
 ) AS provenance
 FROM base b
)
SELECT d.scpi_slug,d.nom,d.source_period,d.publishing_fields,d.provenance,
 (SELECT count(*) FROM jsonb_each(d.publishing_fields) AS f(k,v)
  WHERE f.v<>'null'::jsonb AND f.v<>'{}'::jsonb AND f.v<>'[]'::jsonb) AS populated_field_count,
 (SELECT coalesce(jsonb_agg(f.k ORDER BY f.k),'[]'::jsonb)
  FROM jsonb_each(d.publishing_fields) f(k,v)
  WHERE f.v='null'::jsonb OR f.v='{}'::jsonb OR f.v='[]'::jsonb) AS unresolved_field_keys,
 false::boolean AS final_release_approved
FROM drafts d;

REVOKE ALL ON maximus_agents.scpi_candidate_publication_draft_v1
 FROM PUBLIC,anon,authenticated;

DO $verify$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n FROM maximus_agents.scpi_candidate_publication_draft_v1;
 IF n<>4 THEN RAISE EXCEPTION 'Expected 4 private CORUM drafts, not %',n; END IF;
 IF EXISTS (
   SELECT 1 FROM maximus_agents.scpi_candidate_publication_draft_v1
   WHERE final_release_approved OR (publishing_fields->>'risk_sri') IS NULL
     OR (publishing_fields->>'creation_year') IS NULL
 ) THEN RAISE EXCEPTION 'A private publication draft has an unsafe/completely missing source field'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe
  WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
    AND publication_authorized)
 THEN RAISE EXCEPTION 'No candidate may have become public as part of a read-only draft'; END IF;
END $verify$;
