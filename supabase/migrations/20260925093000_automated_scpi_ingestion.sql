-- Automated SCPI bulletin ingestion
-- Mirrors the production schema deployed on 2026-09-25.

alter table public.scpi_source_registry
  add column if not exists automation_enabled boolean not null default true,
  add column if not exists discovered_page_url text,
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_success_at timestamptz,
  add column if not exists next_check_at timestamptz,
  add column if not exists last_error text,
  add column if not exists error_count integer not null default 0;

create index if not exists idx_scpi_source_registry_next_check
  on public.scpi_source_registry(automation_enabled, next_check_at, last_checked_at);

alter table public.scpi_bulletins
  add column if not exists extraction_json jsonb,
  add column if not exists qa_status text,
  add column if not exists extraction_confidence numeric,
  add column if not exists processed_at timestamptz;

alter table public.scpi_indicators
  add column if not exists nombre_parts bigint,
  add column if not exists nombre_associes integer,
  add column if not exists parts_attente_retrait bigint,
  add column if not exists retraits_executes_trimestre bigint,
  add column if not exists capital_type text,
  add column if not exists source_document text,
  add column if not exists source_url text,
  add column if not exists qa_status text;

alter table public.scpi_indicator_history
  add column if not exists nombre_parts bigint,
  add column if not exists nombre_associes integer,
  add column if not exists retraits_executes_trimestre bigint,
  add column if not exists capital_type text,
  add column if not exists qa_status text,
  add column if not exists source_confidence numeric;

create table if not exists public.scpi_ingestion_events (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'started',
  step text,
  message text,
  source_page_url text,
  bulletin_url text,
  source_period text,
  extraction_confidence numeric,
  metrics_count integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_scpi_ingestion_events_started
  on public.scpi_ingestion_events(started_at desc);

create index if not exists idx_scpi_ingestion_events_slug
  on public.scpi_ingestion_events(scpi_slug, started_at desc);

alter table public.scpi_ingestion_events enable row level security;

comment on column public.scpi_indicators.td is
  'Taux de distribution en points de pourcentage, ex. 5.50 = 5,50 %';
comment on column public.scpi_indicators.tof is
  'TOF en points de pourcentage, ex. 94.70 = 94,70 %';
comment on column public.scpi_indicators.top is
  'TOP en points de pourcentage';
comment on column public.scpi_indicators.capitalisation is
  'Capitalisation en millions d euros (M€)';
comment on column public.scpi_indicators.prime_decote is
  'Prime/surcote positive ou décote négative, en points de pourcentage';
comment on column public.scpi_indicators.frais_souscription is
  'Frais de souscription en points de pourcentage';
comment on column public.scpi_indicators.frais_gestion is
  'Frais de gestion en points de pourcentage';
comment on column public.scpi_indicators.endettement is
  'Endettement/LTV en points de pourcentage';
comment on column public.scpi_indicators.collecte_nette is
  'Collecte nette du trimestre en euros';

create or replace function public.capture_scpi_indicator_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or
     old.td is distinct from new.td or
     old.tof is distinct from new.tof or
     old.capitalisation is distinct from new.capitalisation or
     old.prix_souscription is distinct from new.prix_souscription or
     old.prix_reconstitution is distinct from new.prix_reconstitution or
     old.prix_retrait is distinct from new.prix_retrait or
     old.valeur_realisation is distinct from new.valeur_realisation or
     old.endettement is distinct from new.endettement or
     old.walt is distinct from new.walt or
     old.walb is distinct from new.walb or
     old.collecte_nette is distinct from new.collecte_nette or
     old.nb_cessions_trimestre is distinct from new.nb_cessions_trimestre or
     old.distribution_par_part is distinct from new.distribution_par_part or
     old.nombre_locataires is distinct from new.nombre_locataires or
     old.nombre_immeubles is distinct from new.nombre_immeubles or
     old.nombre_parts is distinct from new.nombre_parts or
     old.nombre_associes is distinct from new.nombre_associes or
     old.parts_attente_retrait is distinct from new.parts_attente_retrait or
     old.retraits_executes_trimestre is distinct from new.retraits_executes_trimestre or
     old.capital_type is distinct from new.capital_type or
     old.source_period is distinct from new.source_period
  then
    insert into public.scpi_indicator_history(
      scpi_slug, snapshot_at, source_period, source_type, source_document, source_url,
      td, tof, capitalisation, prix_souscription, prix_reconstitution, prix_retrait,
      valeur_realisation, endettement, walt, walb, collecte_nette,
      nb_cessions_trimestre, distribution_par_part, nombre_locataires,
      nombre_immeubles, nombre_parts, nombre_associes, parts_attente_retrait,
      retraits_executes_trimestre, capital_type, qa_status, source_confidence
    ) values (
      new.scpi_slug, coalesce(new.updated_at, now()), new.source_period,
      coalesce(new.source_type, 'pipeline'), new.source_document, new.source_url,
      new.td, new.tof, new.capitalisation, new.prix_souscription,
      new.prix_reconstitution, new.prix_retrait, new.valeur_realisation,
      new.endettement, new.walt, new.walb, new.collecte_nette,
      new.nb_cessions_trimestre, new.distribution_par_part,
      new.nombre_locataires, new.nombre_immeubles, new.nombre_parts,
      new.nombre_associes, new.parts_attente_retrait,
      new.retraits_executes_trimestre, new.capital_type, new.qa_status,
      new.source_confidence
    )
    on conflict (scpi_slug, source_period) do update set
      snapshot_at = excluded.snapshot_at,
      source_type = excluded.source_type,
      source_document = coalesce(excluded.source_document, public.scpi_indicator_history.source_document),
      source_url = coalesce(excluded.source_url, public.scpi_indicator_history.source_url),
      td = coalesce(excluded.td, public.scpi_indicator_history.td),
      tof = coalesce(excluded.tof, public.scpi_indicator_history.tof),
      capitalisation = coalesce(excluded.capitalisation, public.scpi_indicator_history.capitalisation),
      prix_souscription = coalesce(excluded.prix_souscription, public.scpi_indicator_history.prix_souscription),
      prix_reconstitution = coalesce(excluded.prix_reconstitution, public.scpi_indicator_history.prix_reconstitution),
      prix_retrait = coalesce(excluded.prix_retrait, public.scpi_indicator_history.prix_retrait),
      valeur_realisation = coalesce(excluded.valeur_realisation, public.scpi_indicator_history.valeur_realisation),
      endettement = coalesce(excluded.endettement, public.scpi_indicator_history.endettement),
      walt = coalesce(excluded.walt, public.scpi_indicator_history.walt),
      walb = coalesce(excluded.walb, public.scpi_indicator_history.walb),
      collecte_nette = coalesce(excluded.collecte_nette, public.scpi_indicator_history.collecte_nette),
      nb_cessions_trimestre = coalesce(excluded.nb_cessions_trimestre, public.scpi_indicator_history.nb_cessions_trimestre),
      distribution_par_part = coalesce(excluded.distribution_par_part, public.scpi_indicator_history.distribution_par_part),
      nombre_locataires = coalesce(excluded.nombre_locataires, public.scpi_indicator_history.nombre_locataires),
      nombre_immeubles = coalesce(excluded.nombre_immeubles, public.scpi_indicator_history.nombre_immeubles),
      nombre_parts = coalesce(excluded.nombre_parts, public.scpi_indicator_history.nombre_parts),
      nombre_associes = coalesce(excluded.nombre_associes, public.scpi_indicator_history.nombre_associes),
      parts_attente_retrait = coalesce(excluded.parts_attente_retrait, public.scpi_indicator_history.parts_attente_retrait),
      retraits_executes_trimestre = coalesce(excluded.retraits_executes_trimestre, public.scpi_indicator_history.retraits_executes_trimestre),
      capital_type = coalesce(excluded.capital_type, public.scpi_indicator_history.capital_type),
      qa_status = excluded.qa_status,
      source_confidence = excluded.source_confidence;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_capture_scpi_indicator_history on public.scpi_indicators;

create trigger trg_capture_scpi_indicator_history
after insert or update on public.scpi_indicators
for each row
execute function public.capture_scpi_indicator_history();
