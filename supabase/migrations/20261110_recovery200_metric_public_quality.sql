-- RECOVERY-200 / chantier C — trois états publics par métrique publiée, calculés en base.
--   verified : valeur, période, source et preuve concordent (même définition que la politique RLS
--              publique des certifications ; pour les frais : provenance prouvée ou non-applicabilité prouvée) ;
--   partial  : valeur publiée sans concordance complète (certification sans preuve de champ, période
--              ou valeur différente, aucune certification) ;
--   blocked  : valeur retirée ou certification rejetée pour la période publiée.
-- Les statuts techniques détaillés restent dans scpi_metric_certifications (cert_status).
create or replace view scpi_internal.metric_public_quality_v1 as
with m as (
  select i.scpi_slug, i.source_period, e.key as metric, e.value as v, i.qa_status as indicator_qa,
         i.metric_provenance -> e.key as prov
  from public.scpi_indicators i
  cross join lateral jsonb_each(to_jsonb(i)) e
  where e.key = any (array['td','tof','capitalisation','prix_souscription','prix_reconstitution','prix_retrait',
    'valeur_realisation','endettement','walt','walb','collecte_nette','nombre_locataires','nombre_immeubles',
    'nombre_associes','nombre_parts','parts_attente_retrait','distribution_par_part','td_annee',
    'frais_souscription','frais_gestion'])
), j as (
  select m.*, case when jsonb_typeof(m.v) = 'number' then (m.v #>> '{}')::numeric end as value_numeric,
         c.verification_status as cert_status, c.value_numeric as cert_value,
         (c.verification_status = 'auto_verified_with_evidence' or c.verification_status ilike 'manual_verified%')
           and nullif(btrim(c.evidence_text), '') is not null
           and ((c.verification_method ilike '%html%' and c.source_url is not null) or coalesce(c.source_page, 0) > 0) as cert_field_proven
  from m
  left join public.scpi_metric_certifications c
    on c.scpi_slug = m.scpi_slug and c.source_period = m.source_period and c.metric = m.metric
)
select scpi_slug, metric, source_period, value_numeric, cert_status, indicator_qa,
  public.maximus_scpi_is_in_public_cohort(scpi_slug) as public_cohort,
  case
    when metric in ('frais_souscription', 'frais_gestion') then
      case when prov ->> 'value_state' = 'not_applicable' and prov ->> 'verification_status' = 'verified' then 'verified'
           when value_numeric is not null and prov ->> 'verification_status' = 'verified'
                and prov ->> 'source_url' like 'https://%' and coalesce((prov ->> 'source_page')::int, 0) > 0
                and nullif(btrim(prov ->> 'evidence_text'), '') is not null then 'verified'
           when value_numeric is not null then 'partial'
           when prov ->> 'verification_status' = 'blocked' then 'blocked'
      end
    when value_numeric is null then
      case when cert_status ~ '^(rejected|invalid)_' or prov ->> 'verification_status' = 'blocked'
                or prov ->> 'value_state' = 'not_applicable' then 'blocked' end
    when cert_status ~ '^(rejected|invalid)_' then 'blocked'
    when cert_field_proven and cert_value is not null and abs(cert_value - value_numeric) <= 0.0001 then 'verified'
    else 'partial'
  end as public_state,
  case
    when metric in ('frais_souscription', 'frais_gestion') then coalesce(prov ->> 'value_state', case when value_numeric is null then 'unknown' else 'value' end)
    when value_numeric is null then coalesce(prov ->> 'value_state', 'unknown')
    when cert_status is null then 'no_certification_for_period'
    when not coalesce(cert_field_proven, false) then 'certification_without_field_evidence'
    when cert_value is distinct from value_numeric then 'certified_value_differs'
    else 'value_period_source_evidence_match'
  end as state_reason
from j;

revoke all on scpi_internal.metric_public_quality_v1 from public, anon, authenticated;
comment on view scpi_internal.metric_public_quality_v1 is
  'RECOVERY-200 : état public verified/partial/blocked par métrique publiée (statuts techniques conservés).';
