-- MaximusSCPI — Surveillance client V2
-- Restaure la persistance du portefeuille client supprimée lors du rollback technique.
-- Les positions ajoutées depuis le navigateur restent strictement propriétaires et externes.

create table if not exists public.client_scpi_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scpi_slug text not null references public.scpi_indicators(scpi_slug) on update cascade,
  units numeric(18,6) not null check (units > 0),
  purchase_price_per_unit numeric(14,2) not null check (purchase_price_per_unit > 0),
  purchase_date date,
  source text not null default 'external' check (source in ('maximus', 'external')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_scpi_positions_user_id_idx
  on public.client_scpi_positions(user_id);

create index if not exists client_scpi_positions_scpi_slug_idx
  on public.client_scpi_positions(scpi_slug);

alter table public.client_scpi_positions enable row level security;

revoke all on table public.client_scpi_positions from anon, authenticated;
grant select, insert, update, delete on table public.client_scpi_positions to authenticated;

drop policy if exists "client_scpi_positions_select_own" on public.client_scpi_positions;
create policy "client_scpi_positions_select_own"
  on public.client_scpi_positions
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
  );

drop policy if exists "client_scpi_positions_insert_own" on public.client_scpi_positions;
create policy "client_scpi_positions_insert_own"
  on public.client_scpi_positions
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and source = 'external'
  );

drop policy if exists "client_scpi_positions_update_own" on public.client_scpi_positions;
create policy "client_scpi_positions_update_own"
  on public.client_scpi_positions
  for update
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and source = 'external'
  )
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and source = 'external'
  );

drop policy if exists "client_scpi_positions_delete_own" on public.client_scpi_positions;
create policy "client_scpi_positions_delete_own"
  on public.client_scpi_positions
  for delete
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and source = 'external'
  );
