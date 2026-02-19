-- =========================================================
-- MAXIMUSSCPI — Table unifiée contact_submissions (v2 flat)
-- Colonnes plates pour identité + tracking (pas de JSONB)
-- À exécuter dans Supabase SQL Editor
-- =========================================================

begin;

create extension if not exists "pgcrypto";

drop table if exists public.contact_submissions cascade;

create table public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Référence
  request_id    uuid,

  -- Contexte formulaire
  channel       text not null,
  context_type  text,
  context_slug  text,
  form_type     text not null,

  -- Identité (colonnes plates, lisibles dans l'UI)
  email         text not null,
  nom           text,
  prenom        text,
  telephone     text,

  -- Contenu
  message       text,
  answers       jsonb not null default '{}'::jsonb,

  -- Tracking (colonnes plates, filtrables)
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  gclid         text,
  referrer      text,
  page_url      text,

  -- Statut
  status        text not null default 'new',

  -- Notification admin
  notified_at    timestamptz,
  notified_error text
);

-- Index
create index idx_cs_created    on public.contact_submissions (created_at desc);
create index idx_cs_email      on public.contact_submissions (email);
create index idx_cs_channel    on public.contact_submissions (channel);
create index idx_cs_slug       on public.contact_submissions (context_slug);
create index idx_cs_form_type  on public.contact_submissions (form_type);
create index idx_cs_request_id on public.contact_submissions (request_id);
create index idx_cs_gclid      on public.contact_submissions (gclid) where gclid is not null;

-- RLS
alter table public.contact_submissions enable row level security;

create policy "cs_allow_insert"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

notify pgrst, 'reload schema';

commit;

-- ═════════ VALIDATION ═════════

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'contact_submissions'
order by ordinal_position;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'contact_submissions';

select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'contact_submissions';
