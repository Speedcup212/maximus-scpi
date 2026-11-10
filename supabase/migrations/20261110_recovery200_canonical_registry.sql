-- RECOVERY-200 / chantier D — registre canonique sociétés de gestion → SCPI → alias → connecteur.
-- Lecture seule pour la publication : aucune ligne de ce registre n'autorise une mise en ligne.

create or replace function scpi_internal.normalize_alias(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  -- Même règle que scripts/industrial/admission.mjs (normalizeAlias).
  select trim(both '-' from regexp_replace(lower(translate(
           replace(replace(replace(replace(coalesce(value, ''), 'œ', 'oe'), 'Œ', 'oe'), 'æ', 'ae'), 'Æ', 'ae'),
           'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ',
           'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUYY')), '[^a-z0-9]+', '-', 'g'));
$$;

create table if not exists scpi_internal.management_companies (
  manager_id text primary key check (manager_id ~ '^[a-z0-9-]+$'),
  canonical_name text not null,
  domains text[] not null default '{}',
  note text
);

create table if not exists scpi_internal.management_company_aliases (
  alias_key text primary key,
  raw_alias text not null,
  manager_id text not null references scpi_internal.management_companies (manager_id),
  confidence text not null check (confidence in ('certain', 'probable')),
  evidence text not null
);

alter table scpi_internal.management_companies enable row level security;
alter table scpi_internal.management_company_aliases enable row level security;
revoke all on scpi_internal.management_companies, scpi_internal.management_company_aliases from anon, authenticated;

insert into scpi_internal.management_companies (manager_id, canonical_name, domains, note) values
 ('aestiam', 'Aestiam', array['aestiam.com', 'consultim-am.com'], null),
 ('aew-patrimoine', 'AEW Patrimoine', array['aewpatrimoine.com'], null),
 ('alderan', 'Alderan', array['alderan.fr'], null),
 ('altarea-investment-managers', 'Altarea Investment Managers', array['altarea-im.com'], null),
 ('altixia-reim', 'ALTIXIA REIM', array['altixia.fr'], null),
 ('amundi-immobilier', 'Amundi Immobilier', array['amundi-immobilier.com'], null),
 ('arkea-reim', 'Arkéa REIM', array['arkea-reim.com'], null),
 ('atland-voisin', 'Atland Voisin', array['atland-voisin.com'], null),
 ('atream', 'Atream', array['atream.com'], null),
 ('bnp-paribas-reim-france', 'BNP Paribas REIM France', array['reim.bnpparibas-am.com'], null),
 ('corum-asset-management', 'CORUM Asset Management', array['corum.fr'], null),
 ('edmond-de-rothschild-reim-france', 'Edmond de Rothschild REIM (France)', array['edr-europa.com'], null),
 ('epsicap', 'Epsicap', array['epsicap.fr'], null),
 ('euryale-am', 'Euryale AM', array['euryale-am.fr'], null),
 ('fiducial-gerance', 'FIDUCIAL Gérance', array['fiducial-gerance.fr'], null),
 ('inter-gestion-reim', 'Inter Gestion REIM', array['inter-gestion.com'], null),
 ('iroko', 'Iroko', array['iroko.eu'], null),
 ('kyaneos-asset-management', 'KYANEOS ASSET MANAGEMENT', array['kyaneosam.com'], null),
 ('la-francaise-rem', 'La Française Real Estate Managers', array['la-francaise.com'], null),
 ('magellim-reim', 'MAGELLIM REIM', array['groupemagellim.com'], null),
 ('norma-capital', 'Norma Capital', array['normacapital.fr'], null),
 ('novaxia-investissement', 'Novaxia Investissement', array['novaxia-investissement.fr'], null),
 ('paref-gestion', 'PAREF GESTION', array['paref-gestion.com'], null),
 ('perial-asset-management', 'PERIAL Asset Management', array['perial.com'], null),
 ('praemia-reim-france', 'Praemia REIM France', array['praemiareim.fr'], null),
 ('remake-asset-management', 'Remake Asset Management', array['remake.fr'], null),
 ('sofidy', 'Sofidy', array['sofidy.com'], 'Filiale du groupe Tikehau Capital.'),
 ('sogenial-immobilier', 'Sogenial Immobilier', array['sogenial.fr'], null),
 ('swiss-life-am-france', 'Swiss Life AM France', array['fr.swisslife-am.com'], null),
 ('theoreim', 'THEOREIM', array['theoreim.com'], null),
 ('urban-premium', 'Urban Premium', array['urban-coeurcommerce.com'], null),
 ('wemo-reim', 'Wemo REIM', array['wemo-reim.fr'], null)
on conflict (manager_id) do nothing;

insert into scpi_internal.management_company_aliases (alias_key, raw_alias, manager_id, confidence, evidence)
select scpi_internal.normalize_alias(a.raw), a.raw, a.manager_id, a.confidence, a.evidence
from (values
 ('Aestiam', 'aestiam', 'certain', 'nom canonique'),
 ('CONSULTIM Asset Management', 'aestiam', 'probable', 'domaine consultim-am.com rattaché à Aestiam dans scpi_source_registry'),
 ('AEW Patrimoine', 'aew-patrimoine', 'certain', 'nom canonique'),
 ('Alderan', 'alderan', 'certain', 'nom canonique'),
 ('Altarea Investment Managers', 'altarea-investment-managers', 'certain', 'nom canonique'),
 ('ALTIXIA REIM', 'altixia-reim', 'certain', 'nom canonique'),
 ('Amundi Immobilier', 'amundi-immobilier', 'certain', 'nom canonique'),
 ('Arkéa REIM', 'arkea-reim', 'certain', 'nom canonique'),
 ('Atland Voisin', 'atland-voisin', 'certain', 'nom canonique'),
 ('Atream', 'atream', 'certain', 'nom canonique'),
 ('BNP Paribas REIM France', 'bnp-paribas-reim-france', 'certain', 'nom canonique'),
 ('BNP Paribas REIM', 'bnp-paribas-reim-france', 'certain', 'même domaine reim.bnpparibas-am.com'),
 ('BNP Paribas AM', 'bnp-paribas-reim-france', 'probable', 'même domaine reim.bnpparibas-am.com ; groupe et société de gestion confondus dans la source'),
 ('CORUM Asset Management', 'corum-asset-management', 'certain', 'nom canonique'),
 ('Edmond de Rothschild REIM (France)', 'edmond-de-rothschild-reim-france', 'certain', 'nom canonique'),
 ('Epsicap', 'epsicap', 'certain', 'nom canonique'),
 ('Euryale AM', 'euryale-am', 'certain', 'nom canonique'),
 ('FIDUCIAL Gérance', 'fiducial-gerance', 'certain', 'nom canonique'),
 ('Inter Gestion REIM', 'inter-gestion-reim', 'certain', 'nom canonique'),
 ('Iroko', 'iroko', 'certain', 'nom canonique'),
 ('KYANEOS ASSET MANAGEMENT', 'kyaneos-asset-management', 'certain', 'nom canonique'),
 ('La Française Real Estate Managers', 'la-francaise-rem', 'certain', 'nom canonique'),
 ('La Française REM', 'la-francaise-rem', 'certain', 'abréviation REM = Real Estate Managers, même domaine'),
 ('MAGELLIM REIM', 'magellim-reim', 'certain', 'nom canonique'),
 ('Norma Capital', 'norma-capital', 'certain', 'nom canonique'),
 ('Novaxia Investissement', 'novaxia-investissement', 'certain', 'nom canonique'),
 ('PAREF GESTION', 'paref-gestion', 'certain', 'nom canonique'),
 ('PERIAL Asset Management', 'perial-asset-management', 'certain', 'nom canonique'),
 ('Praemia REIM France', 'praemia-reim-france', 'certain', 'nom canonique (Præmia normalisé)'),
 ('Remake Asset Management', 'remake-asset-management', 'certain', 'nom canonique'),
 ('Sofidy', 'sofidy', 'certain', 'nom canonique'),
 ('Tikehau Investment Management', 'sofidy', 'probable', 'source officielle sur sofidy.com ; Sofidy appartient au groupe Tikehau Capital'),
 ('Sogenial Immobilier', 'sogenial-immobilier', 'certain', 'nom canonique'),
 ('Swiss Life AM France', 'swiss-life-am-france', 'certain', 'nom canonique'),
 ('THEOREIM', 'theoreim', 'certain', 'nom canonique'),
 ('Urban Premium', 'urban-premium', 'certain', 'nom canonique'),
 ('Wemo REIM', 'wemo-reim', 'certain', 'nom canonique')
) as a(raw, manager_id, confidence, evidence)
on conflict (alias_key) do nothing;

create or replace view scpi_internal.scpi_canonical_registry_v1 as
with aliases as (
  select scpi_slug, array_agg(distinct alias order by alias) as aliases
  from public.scpi_name_aliases where active group by scpi_slug
), collisions as (
  select scpi_internal.normalize_alias(alias) as alias_key, array_agg(distinct scpi_slug) as slugs
  from public.scpi_name_aliases where active
  group by 1 having count(distinct scpi_slug) > 1
), quality as (
  select scpi_slug,
         count(*) filter (where public_state = 'verified') as verified,
         count(*) filter (where public_state = 'partial') as partial,
         count(*) filter (where public_state = 'blocked') as blocked
  from scpi_internal.metric_public_quality_v1 group by scpi_slug
)
select r.scpi_slug, r.scpi_name, r.management_company as raw_manager,
  ma.manager_id, m.canonical_name as manager_name, ma.confidence as manager_confidence,
  coalesce(al.aliases, '{}') as aliases,
  exists (select 1 from collisions c, unnest(coalesce(al.aliases, '{}')) x where c.alias_key = scpi_internal.normalize_alias(x)) as alias_collision,
  r.ingestion_driver as connector, r.automation_enabled,
  r.official_scpi_page_url, r.dic_url, r.note_information_url, r.bulletin_url,
  r.issuer_source_verified_at is not null as official_source_verified,
  exists (select 1 from public.scpi_indicators i where i.scpi_slug = r.scpi_slug) as in_catalog,
  public.maximus_scpi_is_in_public_cohort(r.scpi_slug) as public_cohort,
  q.verified as metrics_verified, q.partial as metrics_partial, q.blocked as metrics_blocked,
  jsonb_build_object(
    'identity', case when ma.manager_id is null then 'blocked' when ma.confidence = 'probable' then 'partial' else 'verified' end,
    'official_source', case when r.issuer_source_verified_at is not null then 'verified' when r.official_scpi_page_url is not null then 'partial' else 'blocked' end,
    'connector', case when r.automation_enabled and r.ingestion_driver is not null then 'verified' when r.ingestion_driver is not null then 'partial' else 'blocked' end,
    'quality', case when q.scpi_slug is null then 'not_assessed' when q.blocked > 0 then 'blocked' when q.partial > 0 then 'partial' else 'verified' end,
    'publication', case when public.maximus_scpi_is_in_public_cohort(r.scpi_slug) then 'verified' else 'not_published' end,
    'production', 'not_measured'
  ) as admission
from public.scpi_source_registry r
left join scpi_internal.management_company_aliases ma on ma.alias_key = scpi_internal.normalize_alias(r.management_company)
left join scpi_internal.management_companies m on m.manager_id = ma.manager_id
left join aliases al on al.scpi_slug = r.scpi_slug
left join quality q on q.scpi_slug = r.scpi_slug;

revoke all on scpi_internal.scpi_canonical_registry_v1 from public, anon, authenticated;
comment on view scpi_internal.scpi_canonical_registry_v1 is
  'RECOVERY-200 : registre canonique (société de gestion, alias, connecteur, sources, état d''admission). Ne vaut pas autorisation de publication.';
