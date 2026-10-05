-- MaximusSCPI — certification des trajectoires et cadence semestrielle v6
--
-- Objectifs :
-- 1) rendre reproductibles les ponts documentaires historiques validés en production ;
-- 2) consolider Altixia Commerces et Edissimmo sur leur période précédente certifiée ;
-- 3) traiter explicitement les SCPI à reporting semestriel sans fabriquer de trimestre ;
-- 4) rejouer les doctrines de certification v4/v5 puis la cadence v6 de façon idempotente.

-- ---------------------------------------------------------------------------
-- 1. Ponts documentaires : historiques déjà certifiés vers scpi_bulletins
-- ---------------------------------------------------------------------------

with targets(scpi_slug, period_key) as (
  values
    ('altixia-cadence-12', 20254),
    ('epargne-pierre-europe', 20261),
    ('esg-pierre-capital', 20261),
    ('fonciere-des-praticiens', 20261)
),
selected as (
  select distinct on (h.scpi_slug, public.scpi_period_key(h.source_period))
         h.*
  from public.scpi_indicator_history h
  join targets t
    on t.scpi_slug=h.scpi_slug
   and t.period_key=public.scpi_period_key(h.source_period)
  where public.scpi_is_strong_qa(h.qa_status)
    and h.source_url ~* '\.pdf($|[?#])'
  order by h.scpi_slug,
           public.scpi_period_key(h.source_period),
           coalesce(h.source_confidence,0) desc,
           h.snapshot_at desc
)
insert into public.scpi_bulletins(
  scpi_slug, period, source_url, run_id, extraction_json,
  qa_status, extraction_confidence, processed_at
)
select s.scpi_slug,
       s.source_period,
       s.source_url,
       'history-bridge-20261005',
       jsonb_build_object(
         'history_bridge', true,
         'source_table', 'scpi_indicator_history',
         'source_history_id', s.id,
         'reason', 'Exact official bulletin URL already manually verified in historical trajectory'
       ),
       'manual_verified_official_history_bridge',
       1.0,
       now()
from selected s
on conflict (scpi_slug, period) do update set
  source_url=excluded.source_url,
  run_id=excluded.run_id,
  extraction_json=excluded.extraction_json,
  qa_status=excluded.qa_status,
  extraction_confidence=excluded.extraction_confidence,
  processed_at=excluded.processed_at;

-- ---------------------------------------------------------------------------
-- 2. Altixia Commerces — bulletin officiel et historique 2026-T1
-- ---------------------------------------------------------------------------

insert into public.scpi_bulletins(
  scpi_slug,period,source_url,run_id,extraction_json,
  qa_status,extraction_confidence,processed_at
)
values (
  'altixia-commerces',
  '2026-T1',
  'https://www.altixia.fr/medias/documentations/doc1-20260430-110640.pdf',
  'manual-official-backfill-20261005',
  jsonb_build_object(
    'manual_official_backfill',true,
    'document','Bulletin trimestriel Altixia Commerces 1T 2026',
    'evidence_version','2026-10-05-altixia-t1',
    'evidence',jsonb_build_object(
      'tof','89.1 %',
      'capitalisation','107084530 EUR',
      'prix_souscription','203 EUR',
      'prix_retrait','197.92 EUR',
      'prix_reconstitution','203.48 EUR au 31/12/2025',
      'valeur_realisation','181.35 EUR au 31/12/2025',
      'endettement','14.3 %',
      'walt','2.19 ans',
      'walb','4.93 ans',
      'nombre_locataires','73',
      'nombre_parts','527510',
      'nombre_associes','1022',
      'parts_attente_retrait','13559',
      'distribution_par_part','2.04 EUR'
    )
  ),
  'manual_verified_official',
  1.0,
  now()
)
on conflict (scpi_slug,period) do update set
  source_url=excluded.source_url,
  run_id=excluded.run_id,
  extraction_json=excluded.extraction_json,
  qa_status=excluded.qa_status,
  extraction_confidence=excluded.extraction_confidence,
  processed_at=excluded.processed_at;

insert into public.scpi_indicator_history(
  scpi_slug,snapshot_at,source_period,source_type,source_document,source_url,
  tof,capitalisation,prix_souscription,prix_reconstitution,prix_retrait,valeur_realisation,
  endettement,distribution_par_part,nombre_locataires,nombre_immeubles,parts_attente_retrait,
  nombre_parts,nombre_associes,retraits_executes_trimestre,capital_type,qa_status,source_confidence
)
values (
  'altixia-commerces',
  now(),
  '2026-T1',
  'manual_official_backfill',
  'Bulletin trimestriel Altixia Commerces 1T 2026',
  'https://www.altixia.fr/medias/documentations/doc1-20260430-110640.pdf',
  89.1,
  107.08453,
  203,
  203.48,
  197.92,
  181.35,
  14.3,
  2.04,
  73,
  22,
  13559,
  527510,
  1022,
  724,
  'variable',
  'manual_verified_official',
  1.0
)
on conflict (scpi_slug,source_period) do update set
  snapshot_at=excluded.snapshot_at,
  source_type=excluded.source_type,
  source_document=excluded.source_document,
  source_url=excluded.source_url,
  tof=excluded.tof,
  capitalisation=excluded.capitalisation,
  prix_souscription=excluded.prix_souscription,
  prix_reconstitution=excluded.prix_reconstitution,
  prix_retrait=excluded.prix_retrait,
  valeur_realisation=excluded.valeur_realisation,
  endettement=excluded.endettement,
  distribution_par_part=excluded.distribution_par_part,
  nombre_locataires=excluded.nombre_locataires,
  nombre_immeubles=excluded.nombre_immeubles,
  parts_attente_retrait=excluded.parts_attente_retrait,
  nombre_parts=excluded.nombre_parts,
  nombre_associes=excluded.nombre_associes,
  retraits_executes_trimestre=excluded.retraits_executes_trimestre,
  capital_type=excluded.capital_type,
  qa_status=excluded.qa_status,
  source_confidence=excluded.source_confidence;

-- ---------------------------------------------------------------------------
-- 3. Edissimmo — pont documentaire 2026-T1
-- ---------------------------------------------------------------------------

insert into public.scpi_bulletins(
  scpi_slug,period,source_url,run_id,extraction_json,
  qa_status,extraction_confidence,processed_at
)
values (
  'edissimo',
  '2026-T1',
  'https://www.amundi-immobilier.com/Local-content/Producsheet/SCPI/EDISSIMMO/Documents',
  'history-certification-backfill-20261005',
  jsonb_build_object(
    'history_bridge',true,
    'publisher','Amundi Immobilier',
    'document','Edissimmo - L''essentiel 1er trimestre 2026',
    'publisher_documents_page','https://www.amundi-immobilier.com/Local-content/Producsheet/SCPI/EDISSIMMO/Documents',
    'controlled_mirror_url','https://api.rock-n-data.io/fichiers/publications/6a27e34f6e34b406155376.pdf',
    'controlled_mirror_title','AMUNDI_IS_BT_EDISSIMMO 1T26',
    'evidence',jsonb_build_object(
      'tof','84.73 %',
      'prix_souscription','172 EUR',
      'prix_retrait','158.25 EUR',
      'capitalisation','3030 M EUR',
      'distribution_par_part','1.73 EUR',
      'parts_attente_retrait','776330'
    )
  ),
  'manual_verified_history_backfill',
  1.0,
  now()
)
on conflict (scpi_slug,period) do update set
  source_url=excluded.source_url,
  run_id=excluded.run_id,
  extraction_json=excluded.extraction_json,
  qa_status=excluded.qa_status,
  extraction_confidence=excluded.extraction_confidence,
  processed_at=excluded.processed_at;

-- ---------------------------------------------------------------------------
-- 4. Cadence semestrielle : ne pas inventer un trimestre intermédiaire
-- ---------------------------------------------------------------------------

create or replace function public.apply_scpi_reporting_cadence_v6(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  a public.scpi_bulletin_analysis%rowtype;
  c public.scpi_indicators%rowtype;
  p public.scpi_indicator_history%rowtype;
  curr_key integer;
  prev_key integer;
  item jsonb;
  cleaned_watch jsonb := '[]'::jsonb;
begin
  if not exists (
    select 1
    from public.scpi_structural_events e
    where e.scpi_slug=p_slug
      and e.event_type='reporting_cadence_semiannual'
      and public.scpi_is_strong_qa(e.verification_status)
      and e.effective_date <= current_date
      and (e.end_date is null or e.end_date >= current_date)
  ) then
    return;
  end if;

  select * into a
  from public.scpi_bulletin_analysis
  where scpi_slug=p_slug;
  if not found then return; end if;

  select * into c
  from public.scpi_indicators
  where scpi_slug=p_slug;
  if not found then return; end if;

  curr_key := public.scpi_period_key(c.source_period);
  if curr_key is null then return; end if;

  -- Le schéma historique encode S1 comme T2 et S2 comme T4.
  if mod(curr_key,10)=2 then
    prev_key := ((curr_key/10)-1)*10+4;
  elsif mod(curr_key,10)=4 then
    prev_key := (curr_key/10)*10+2;
  else
    return;
  end if;

  select h.* into p
  from public.scpi_indicator_history h
  where h.scpi_slug=p_slug
    and public.scpi_period_key(h.source_period)=prev_key
    and public.scpi_is_strong_qa(h.qa_status)
  order by coalesce(h.source_confidence,0) desc, h.snapshot_at desc
  limit 1;
  if not found then return; end if;

  for item in
    select value
    from jsonb_array_elements(coalesce(a.watch_points,'[]'::jsonb))
  loop
    if coalesce(item->>'metric','') in ('history','data_quality_history','reporting_cadence') then
      continue;
    end if;
    cleaned_watch := cleaned_watch || jsonb_build_array(item);
  end loop;

  cleaned_watch := cleaned_watch || jsonb_build_array(jsonb_build_object(
    'metric','reporting_cadence',
    'severity','info',
    'quality_issue',false,
    'message','Reporting semestriel : la période précédente disponible est '||p.source_period||'. La comparaison trimestrielle est volontairement neutralisée afin de ne pas fabriquer un trimestre intermédiaire.'
  ));

  update public.scpi_bulletin_analysis
  set previous_period=p.source_period,
      previous_snapshot=to_jsonb(p),
      status='complete',
      improvements='[]'::jsonb,
      deteriorations='[]'::jsonb,
      comparison_certified=false,
      certification_status=case
        when coalesce(a.current_source_certified,false)
          then 'current_certified_history_unverified'
        else a.certification_status
      end,
      certification_reasons=jsonb_build_array(jsonb_build_object(
        'code','semiannual_reporting_cadence',
        'message','Le véhicule publie ses bulletins principaux par semestre ; la comparaison trimestrielle standard est neutralisée.'
      )),
      watch_points=cleaned_watch,
      summary='Reporting semestriel : bulletin courant '||coalesce(c.source_period,'N/A')||
              ', période précédente disponible '||p.source_period||
              '. Les signaux absolus du bulletin courant restent publiables ; aucun delta trimestriel artificiel n’est produit.',
      generated_at=now()
  where scpi_slug=p_slug;
end;
$function$;

insert into public.scpi_structural_events(
  scpi_slug,event_type,effective_date,end_date,
  source_period,source_url,evidence,verification_status
)
values (
  'grand-paris-residentiel',
  'reporting_cadence_semiannual',
  '2023-01-01',
  null,
  '2026-T2',
  'https://www.inter-gestion.com/corpo/scpi-gerees/grand-paris-residentiels',
  'La documentation officielle Inter Gestion liste les bulletins S1 et S2 (S1-2023 à S1-2026) : la cadence de publication principale est semestrielle.',
  'verified_official'
)
on conflict (scpi_slug,event_type,effective_date) do update set
  end_date=excluded.end_date,
  source_period=excluded.source_period,
  source_url=excluded.source_url,
  evidence=excluded.evidence,
  verification_status=excluded.verification_status;

-- ---------------------------------------------------------------------------
-- 5. Branche la doctrine de cadence sur les rafraîchissements futurs
-- ---------------------------------------------------------------------------

create or replace function public.trg_refresh_scpi_bulletin_analysis()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.refresh_scpi_bulletin_analysis(new.scpi_slug);
  perform public.apply_scpi_material_vigilance(new.scpi_slug);
  perform public.certify_scpi_bulletin_analysis(new.scpi_slug);
  perform public.enforce_scpi_certification_v4_1(new.scpi_slug);
  perform public.enforce_scpi_metric_evidence_v4_3(new.scpi_slug);
  perform public.enforce_scpi_liquidity_doctrine_v5(new.scpi_slug);
  perform public.enforce_scpi_public_risk_cleanup_v5(new.scpi_slug);
  perform public.apply_scpi_reporting_cadence_v6(new.scpi_slug);
  return new;
end;
$function$;

create or replace function public.trg_refresh_analysis_on_scpi_evidence()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if (old.extraction_json->'evidence') is distinct from (new.extraction_json->'evidence')
     or (old.extraction_json->>'evidence_version') is distinct from (new.extraction_json->>'evidence_version') then
    perform public.refresh_scpi_bulletin_analysis(new.scpi_slug);
    perform public.apply_scpi_material_vigilance(new.scpi_slug);
    perform public.certify_scpi_bulletin_analysis(new.scpi_slug);
    perform public.enforce_scpi_certification_v4_1(new.scpi_slug);
    perform public.enforce_scpi_metric_evidence_v4_3(new.scpi_slug);
    perform public.enforce_scpi_liquidity_doctrine_v5(new.scpi_slug);
    perform public.enforce_scpi_public_risk_cleanup_v5(new.scpi_slug);
    perform public.apply_scpi_reporting_cadence_v6(new.scpi_slug);
  end if;
  return new;
end;
$function$;

-- ---------------------------------------------------------------------------
-- 6. Recalcule les dossiers affectés, puis homogénéise tout le corpus
-- ---------------------------------------------------------------------------

do $affected$
declare
  r text;
begin
  foreach r in array array[
    'altixia-cadence-12',
    'altixia-commerces',
    'edissimo',
    'epargne-pierre-europe',
    'esg-pierre-capital',
    'fonciere-des-praticiens',
    'grand-paris-residentiel'
  ]
  loop
    if exists (select 1 from public.scpi_indicators where scpi_slug=r) then
      perform public.refresh_scpi_bulletin_analysis(r);
      perform public.apply_scpi_material_vigilance(r);
      perform public.certify_scpi_bulletin_analysis(r);
      perform public.enforce_scpi_certification_v4_1(r);
      perform public.enforce_scpi_metric_evidence_v4_3(r);
      perform public.enforce_scpi_liquidity_doctrine_v5(r);
      perform public.enforce_scpi_public_risk_cleanup_v5(r);
      perform public.apply_scpi_reporting_cadence_v6(r);
    end if;
  end loop;
end;
$affected$;

do $global_replay$
declare
  r record;
begin
  for r in select scpi_slug from public.scpi_bulletin_analysis loop
    perform public.enforce_scpi_liquidity_doctrine_v5(r.scpi_slug);
    perform public.enforce_scpi_public_risk_cleanup_v5(r.scpi_slug);
    perform public.apply_scpi_reporting_cadence_v6(r.scpi_slug);
  end loop;
end;
$global_replay$;
