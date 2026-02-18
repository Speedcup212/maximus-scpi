-- =========================================================
-- MAXIMUSSCPI — SCHEMA COMPLET ESPACE PRIVE
-- Script idempotent : peut etre rejoue sans erreur.
-- A coller tel quel dans Supabase Dashboard > SQL Editor.
-- =========================================================

begin;

-- =========================
-- 0) EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- =========================
-- 1) FONCTIONS UTILITAIRES
-- =========================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: est admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

-- Helper: est partner actif?
create or replace function public.is_partner_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'partner'
      and p.status = 'active'
  );
$$;

-- Helper: org_id du user courant
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.org_id
  from public.profiles p
  where p.user_id = auth.uid();
$$;

-- RPC securisee: update profil (full_name/phone uniquement)
create or replace function public.update_my_profile(p_full_name text, p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set full_name = p_full_name,
      phone = p_phone,
      updated_at = now()
  where user_id = auth.uid();
end;
$$;

revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- =========================
-- 2) TABLES
-- =========================

-- PROFILES
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client'
    check (role in ('client','partner','admin')),
  status text not null default 'pending'
    check (status in ('pending','active','suspended')),
  org_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ORGANIZATIONS
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text not null default 'active'
    check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

-- FK profiles -> organizations (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_org_fk'
  ) then
    alter table public.profiles
      add constraint profiles_org_fk
      foreign key (org_id) references public.organizations(id);
  end if;
end $$;

-- CASES (dossiers)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid null references public.organizations(id),
  title text not null,
  status text not null default 'new'
    check (status in ('new','in_progress','sent','closed')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CASE NOTES (comptes rendus)
create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_user_id uuid not null references auth.users(id),
  note_type text not null default 'compte_rendu'
    check (note_type in ('compte_rendu','hypotheses','actions','misc')),
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CASE PDFS (metadonnees)
create table if not exists public.case_pdfs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  generated_by_user_id uuid not null references auth.users(id),
  version int not null default 1,
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- AUDIT EVENTS
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- INVITATIONS (invite-only)
create table if not exists public.invitations (
  token text primary key default gen_random_uuid()::text,
  id uuid default gen_random_uuid(),
  email citext not null,
  role text not null
    check (role in ('CLIENT','PARTENAIRE','ADMIN')),
  org_id uuid null references public.organizations(id),
  code_hash text not null,
  token_hash text,
  status text not null default 'PENDING'
    check (status in ('PENDING','USED','REVOKED','EXPIRED')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  used_at timestamptz null,
  claimed_at timestamptz null,
  claimed_by uuid null references auth.users(id),
  created_by uuid null references auth.users(id),
  meta jsonb
);

create index if not exists invitations_email_idx on public.invitations (email);
create index if not exists invitations_status_idx on public.invitations (status);
create index if not exists invitations_role_idx on public.invitations (role);
create unique index if not exists invitations_token_hash_idx on public.invitations (token_hash);

-- ACCESS REQUESTS (demandes d'acces publiques)
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED')),
  requested_role text not null default 'CLIENT',
  full_name text not null,
  email citext not null,
  phone text null,
  message text null,
  handled_by uuid null references auth.users(id),
  handled_at timestamptz null,
  decision_note text null
);

create unique index if not exists access_requests_email_pending_idx
  on public.access_requests (email)
  where status = 'PENDING';

create index if not exists access_requests_status_idx
  on public.access_requests (status);

-- =========================
-- 3) TRIGGERS
-- =========================

-- Auto updated_at
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

drop trigger if exists case_notes_set_updated_at on public.case_notes;
create trigger case_notes_set_updated_at
  before update on public.case_notes
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(user_id, role, status)
  values (new.id, 'client', 'pending')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_profiles on auth.users;

create trigger on_auth_user_created_profiles
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Apply invitation role to profile when claimed
create or replace function public.apply_invitation_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mapped_role text;
begin
  if new.status <> 'USED' then return new; end if;
  if new.claimed_by is null then return new; end if;

  mapped_role := case
    when upper(new.role) = 'CLIENT' then 'client'
    when upper(new.role) = 'PARTENAIRE' then 'partner'
    when upper(new.role) = 'ADMIN' then 'admin'
    else 'client'
  end;

  insert into public.profiles (user_id, role, status, full_name, phone, org_id)
  values (
    new.claimed_by,
    mapped_role,
    'active',
    coalesce(new.meta->>'full_name', null),
    coalesce(new.meta->>'phone', null),
    new.org_id
  )
  on conflict (user_id) do update
    set role = excluded.role,
        status = excluded.status,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        org_id = coalesce(excluded.org_id, public.profiles.org_id);

  return new;
end;
$$;

drop trigger if exists invitations_apply_profile on public.invitations;

create trigger invitations_apply_profile
  after update on public.invitations
  for each row
  when (old.status is distinct from new.status)
  execute function public.apply_invitation_to_profile();

-- =========================
-- 4) ENABLE RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.cases enable row level security;
alter table public.case_notes enable row level security;
alter table public.case_pdfs enable row level security;
alter table public.audit_events enable row level security;
alter table public.invitations enable row level security;
alter table public.access_requests enable row level security;

-- =========================
-- 5) DROP ALL POLICIES (idempotent reset)
-- =========================

-- profiles
drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_read on public.profiles;

-- organizations
drop policy if exists organizations_select on public.organizations;
drop policy if exists organizations_admin_insert on public.organizations;
drop policy if exists organizations_admin_update on public.organizations;
drop policy if exists org_read on public.organizations;
drop policy if exists org_admin_all on public.organizations;

-- cases
drop policy if exists cases_select on public.cases;
drop policy if exists cases_partner_insert on public.cases;
drop policy if exists cases_partner_update on public.cases;
drop policy if exists cases_read on public.cases;
drop policy if exists cases_insert_client on public.cases;
drop policy if exists cases_insert_partner on public.cases;
drop policy if exists cases_update_partner on public.cases;
drop policy if exists cases_admin_all on public.cases;

-- case_notes
drop policy if exists case_notes_select on public.case_notes;
drop policy if exists case_notes_insert on public.case_notes;
drop policy if exists notes_read on public.case_notes;
drop policy if exists notes_insert on public.case_notes;
drop policy if exists notes_update on public.case_notes;
drop policy if exists notes_admin_all on public.case_notes;

-- case_pdfs
drop policy if exists case_pdfs_select on public.case_pdfs;
drop policy if exists case_pdfs_insert on public.case_pdfs;
drop policy if exists pdfs_read on public.case_pdfs;
drop policy if exists pdfs_insert_partner on public.case_pdfs;
drop policy if exists pdfs_admin_all on public.case_pdfs;

-- audit_events
drop policy if exists audit_events_insert on public.audit_events;
drop policy if exists audit_events_admin_select on public.audit_events;
drop policy if exists audit_insert_own on public.audit_events;
drop policy if exists audit_admin_read on public.audit_events;

-- invitations
drop policy if exists invitations_admin_select on public.invitations;
drop policy if exists invitations_admin_insert on public.invitations;
drop policy if exists invitations_admin_update on public.invitations;
drop policy if exists invitations_admin_delete on public.invitations;

-- access_requests
drop policy if exists access_requests_insert on public.access_requests;
drop policy if exists access_requests_admin_select on public.access_requests;
drop policy if exists access_requests_admin_update on public.access_requests;
drop policy if exists access_requests_admin_delete on public.access_requests;
drop policy if exists anon_insert_access_requests on public.access_requests;
drop policy if exists admin_select_access_requests on public.access_requests;
drop policy if exists admin_update_access_requests on public.access_requests;

-- storage
drop policy if exists storage_private_docs_select on storage.objects;
drop policy if exists storage_private_docs_insert on storage.objects;

-- =========================
-- 6) CREATE POLICIES
-- =========================

-- ── PROFILES ──
-- Lecture: son propre profil + admin voit tout
create policy profiles_self_select
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin());

-- Update: soi-meme (full_name/phone via RPC recommande) + admin
create policy profiles_self_update
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin: tout
create policy profiles_admin_all
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── ORGANIZATIONS ──
create policy organizations_select
  on public.organizations for select
  using (
    public.is_admin()
    or (public.is_partner_active() and id = public.current_org_id())
  );

create policy organizations_admin_insert
  on public.organizations for insert
  with check (public.is_admin());

create policy organizations_admin_update
  on public.organizations for update
  using (public.is_admin())
  with check (public.is_admin());

-- ── CASES ──
create policy cases_select
  on public.cases for select
  using (
    public.is_admin()
    or client_user_id = auth.uid()
    or (public.is_partner_active() and org_id = public.current_org_id())
  );

-- Client cree son dossier
create policy cases_insert_client
  on public.cases for insert
  with check (
    client_user_id = auth.uid() and org_id is null
  );

-- Partner cree des dossiers pour son org
create policy cases_insert_partner
  on public.cases for insert
  with check (
    public.is_partner_active() and org_id = public.current_org_id()
  );

-- Partner update dossiers de son org
create policy cases_update_partner
  on public.cases for update
  using (public.is_partner_active() and org_id = public.current_org_id())
  with check (public.is_partner_active() and org_id = public.current_org_id());

-- Admin: tout
create policy cases_admin_all
  on public.cases for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── CASE NOTES ──
create policy notes_read
  on public.case_notes for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          public.is_admin()
          or c.client_user_id = auth.uid()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

create policy notes_insert
  on public.case_notes for insert
  with check (
    author_user_id = auth.uid()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          public.is_admin()
          or c.client_user_id = auth.uid()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

create policy notes_update
  on public.case_notes for update
  using (
    author_user_id = auth.uid()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          public.is_admin()
          or c.client_user_id = auth.uid()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  )
  with check (
    author_user_id = auth.uid()
  );

create policy notes_admin_all
  on public.case_notes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── CASE PDFS ──
create policy pdfs_read
  on public.case_pdfs for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          public.is_admin()
          or c.client_user_id = auth.uid()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

create policy pdfs_insert_partner
  on public.case_pdfs for insert
  with check (
    (public.is_partner_active() or public.is_admin())
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          public.is_admin()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

create policy pdfs_admin_all
  on public.case_pdfs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── AUDIT EVENTS ──
create policy audit_insert_own
  on public.audit_events for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy audit_admin_read
  on public.audit_events for select
  using (public.is_admin());

-- ── INVITATIONS (admin only via client, service_role bypass) ──
create policy invitations_admin_select
  on public.invitations for select
  using (public.is_admin());

create policy invitations_admin_insert
  on public.invitations for insert
  with check (public.is_admin());

create policy invitations_admin_update
  on public.invitations for update
  using (public.is_admin())
  with check (public.is_admin());

create policy invitations_admin_delete
  on public.invitations for delete
  using (public.is_admin());

-- ── ACCESS REQUESTS ──
-- Insert anonyme (formulaire public "Demander un acces")
create policy access_requests_anon_insert
  on public.access_requests for insert
  to anon, authenticated
  with check (status = 'PENDING');

-- Lecture admin
create policy access_requests_admin_select
  on public.access_requests for select
  to authenticated
  using (public.is_admin());

-- Update admin
create policy access_requests_admin_update
  on public.access_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Delete admin
create policy access_requests_admin_delete
  on public.access_requests for delete
  to authenticated
  using (public.is_admin());

-- =========================
-- 7) STORAGE (private docs bucket)
-- =========================
insert into storage.buckets (id, name, public)
values ('private-docs', 'private-docs', false)
on conflict (id) do nothing;

create policy storage_private_docs_select
  on storage.objects for select
  using (
    bucket_id = 'private-docs'
    and exists (
      select 1 from public.cases c
      where c.id = split_part(storage.objects.name, '/', 2)::uuid
        and (
          c.client_user_id = auth.uid()
          or public.is_admin()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

create policy storage_private_docs_insert
  on storage.objects for insert
  with check (
    bucket_id = 'private-docs'
    and exists (
      select 1 from public.cases c
      where c.id = split_part(storage.objects.name, '/', 2)::uuid
        and (
          public.is_admin()
          or (public.is_partner_active() and c.org_id = public.current_org_id())
        )
    )
  );

-- =========================
-- 8) REFRESH POSTGREST CACHE
-- =========================
notify pgrst, 'reload schema';

commit;
