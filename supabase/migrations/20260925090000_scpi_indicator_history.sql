-- Historisation des indicateurs SCPI pour les fiches MaximusSCPI.
-- Déployé initialement le 25/09/2026.
-- Le backfill initial est alimenté depuis le registre de preuves et le dataset SCPI courant.
-- Les mises à jour de public.scpi_indicators sont ensuite historisées automatiquement.

create table if not exists public.scpi_indicator_history (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text not null,
  snapshot_at timestamptz not null default now(),
  source_period text,
  source_type text not null default 'dataset',
  source_document text,
  source_url text,
  td numeric,
  tof numeric,
  capitalisation numeric,
  prix_souscription numeric,
  prix_reconstitution numeric,
  prix_retrait numeric,
  valeur_realisation numeric,
  endettement numeric,
  walt numeric,
  walb numeric,
  collecte_nette numeric,
  nb_cessions_trimestre integer,
  distribution_par_part numeric,
  nombre_locataires integer,
  nombre_immeubles integer,
  parts_attente_retrait bigint,
  created_at timestamptz not null default now(),
  constraint uq_scpi_indicator_history_period unique (scpi_slug, source_period)
);

create index if not exists idx_scpi_indicator_history_slug_period
  on public.scpi_indicator_history(scpi_slug, source_period);

create index if not exists idx_scpi_indicator_history_slug_snapshot
  on public.scpi_indicator_history(scpi_slug, snapshot_at desc);

alter table public.scpi_indicator_history enable row level security;

grant select on public.scpi_indicator_history to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'scpi_indicator_history'
      and policyname = 'allow_public_select'
  ) then
    create policy allow_public_select
      on public.scpi_indicator_history
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

create or replace function public.capture_scpi_indicator_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
     or old.td is distinct from new.td
     or old.tof is distinct from new.tof
     or old.capitalisation is distinct from new.capitalisation
     or old.prix_souscription is distinct from new.prix_souscription
     or old.prix_reconstitution is distinct from new.prix_reconstitution
     or old.prix_retrait is distinct from new.prix_retrait
     or old.valeur_realisation is distinct from new.valeur_realisation
     or old.endettement is distinct from new.endettement
     or old.walt is distinct from new.walt
     or old.walb is distinct from new.walb
     or old.collecte_nette is distinct from new.collecte_nette
     or old.nb_cessions_trimestre is distinct from new.nb_cessions_trimestre
     or old.distribution_par_part is distinct from new.distribution_par_part
     or old.nombre_locataires is distinct from new.nombre_locataires
     or old.nombre_immeubles is distinct from new.nombre_immeubles
  then
    insert into public.scpi_indicator_history (
      scpi_slug,
      snapshot_at,
      source_period,
      source_type,
      source_document,
      td,
      tof,
      capitalisation,
      prix_souscription,
      prix_reconstitution,
      prix_retrait,
      valeur_realisation,
      endettement,
      walt,
      walb,
      collecte_nette,
      nb_cessions_trimestre,
      distribution_par_part,
      nombre_locataires,
      nombre_immeubles
    )
    values (
      new.scpi_slug,
      coalesce(new.updated_at, now()),
      new.source_period,
      coalesce(new.source_type, 'scpi_indicators'),
      null,
      new.td,
      new.tof,
      new.capitalisation,
      new.prix_souscription,
      new.prix_reconstitution,
      new.prix_retrait,
      new.valeur_realisation,
      new.endettement,
      new.walt,
      new.walb,
      new.collecte_nette,
      new.nb_cessions_trimestre,
      new.distribution_par_part,
      new.nombre_locataires,
      new.nombre_immeubles
    )
    on conflict (scpi_slug, source_period)
    do update set
      snapshot_at = excluded.snapshot_at,
      source_type = excluded.source_type,
      td = excluded.td,
      tof = excluded.tof,
      capitalisation = excluded.capitalisation,
      prix_souscription = excluded.prix_souscription,
      prix_reconstitution = excluded.prix_reconstitution,
      prix_retrait = excluded.prix_retrait,
      valeur_realisation = excluded.valeur_realisation,
      endettement = excluded.endettement,
      walt = excluded.walt,
      walb = excluded.walb,
      collecte_nette = excluded.collecte_nette,
      nb_cessions_trimestre = excluded.nb_cessions_trimestre,
      distribution_par_part = excluded.distribution_par_part,
      nombre_locataires = excluded.nombre_locataires,
      nombre_immeubles = excluded.nombre_immeubles;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_capture_scpi_indicator_history on public.scpi_indicators;

create trigger trg_capture_scpi_indicator_history
after insert or update on public.scpi_indicators
for each row
execute function public.capture_scpi_indicator_history();

create or replace function public.scpi_period_sort_key(p text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p ~ '^T[1-4] [0-9]{4}$'
      then substring(p from 4 for 4)::int * 10 + substring(p from 2 for 1)::int
    when p ~ '^S[12] [0-9]{4}$'
      then substring(p from 4 for 4)::int * 10
        + case when substring(p from 2 for 1) = '1' then 2 else 4 end
    when p ~ '^[0-9]{4}-T[1-4]$'
      then substring(p from 1 for 4)::int * 10 + substring(p from 7 for 1)::int
    when p ~ '^[0-9]{4}-Q[1-4]$'
      then substring(p from 1 for 4)::int * 10 + substring(p from 7 for 1)::int
    else 0
  end;
$$;

drop view if exists public.scpi_indicator_changes;

create view public.scpi_indicator_changes
with (security_invoker = true)
as
with ranked as (
  select
    h.*,
    row_number() over (
      partition by h.scpi_slug
      order by public.scpi_period_sort_key(h.source_period) desc, h.snapshot_at desc
    ) as rn
  from public.scpi_indicator_history h
  where h.source_period is not null
),
latest as (
  select * from ranked where rn = 1
),
previous as (
  select * from ranked where rn = 2
)
select
  l.scpi_slug,
  p.source_period as previous_period,
  l.source_period as current_period,
  p.source_document as previous_source_document,
  l.source_document as current_source_document,
  p.source_url as previous_source_url,
  l.source_url as current_source_url,
  p.td as previous_td,
  l.td as current_td,
  l.td - p.td as td_delta,
  p.tof as previous_tof,
  l.tof as current_tof,
  l.tof - p.tof as tof_delta,
  p.capitalisation as previous_capitalisation,
  l.capitalisation as current_capitalisation,
  l.capitalisation - p.capitalisation as capitalisation_delta,
  p.prix_souscription as previous_prix_souscription,
  l.prix_souscription as current_prix_souscription,
  l.prix_souscription - p.prix_souscription as prix_souscription_delta,
  p.prix_reconstitution as previous_prix_reconstitution,
  l.prix_reconstitution as current_prix_reconstitution,
  l.prix_reconstitution - p.prix_reconstitution as prix_reconstitution_delta,
  p.prix_retrait as previous_prix_retrait,
  l.prix_retrait as current_prix_retrait,
  l.prix_retrait - p.prix_retrait as prix_retrait_delta,
  p.valeur_realisation as previous_valeur_realisation,
  l.valeur_realisation as current_valeur_realisation,
  l.valeur_realisation - p.valeur_realisation as valeur_realisation_delta,
  p.endettement as previous_endettement,
  l.endettement as current_endettement,
  l.endettement - p.endettement as endettement_delta,
  p.walt as previous_walt,
  l.walt as current_walt,
  l.walt - p.walt as walt_delta,
  p.walb as previous_walb,
  l.walb as current_walb,
  l.walb - p.walb as walb_delta,
  p.collecte_nette as previous_collecte_nette,
  l.collecte_nette as current_collecte_nette,
  l.collecte_nette - p.collecte_nette as collecte_nette_delta,
  p.distribution_par_part as previous_distribution_par_part,
  l.distribution_par_part as current_distribution_par_part,
  l.distribution_par_part - p.distribution_par_part as distribution_par_part_delta,
  p.nombre_locataires as previous_nombre_locataires,
  l.nombre_locataires as current_nombre_locataires,
  l.nombre_locataires - p.nombre_locataires as nombre_locataires_delta,
  p.nombre_immeubles as previous_nombre_immeubles,
  l.nombre_immeubles as current_nombre_immeubles,
  l.nombre_immeubles - p.nombre_immeubles as nombre_immeubles_delta,
  p.parts_attente_retrait as previous_parts_attente_retrait,
  l.parts_attente_retrait as current_parts_attente_retrait,
  l.parts_attente_retrait - p.parts_attente_retrait as parts_attente_retrait_delta
from latest l
join previous p on p.scpi_slug = l.scpi_slug;

grant select on public.scpi_indicator_changes to anon, authenticated;
