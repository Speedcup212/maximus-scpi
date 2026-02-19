-- =========================================================
-- MAXIMUSSCPI — Création des tables leads manquantes
-- À exécuter dans Supabase SQL Editor (une seule fois)
--
-- Tables créées : leads_pdf_comparatif, leads_ads_formulaire,
--                 google_ads_comete_leads, partner_leads
-- Tables existantes non touchées : prospects, access_requests
-- =========================================================

begin;

-- Extension UUID (idempotent)
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════
-- 1) leads_pdf_comparatif
-- Sources : OptimizedScpiLandingPage (organique),
--           OptimizedThematicLandingPage (organique),
--           LeadMagnetEmailForm, TestSenderReact
-- ═══════════════════════════════════════════════════════════

create table if not exists public.leads_pdf_comparatif (
  id                      uuid primary key default gen_random_uuid(),
  email                   text not null,
  nom                     text,
  prenom                  text,
  source_page             text,
  source                  text,
  consentement_marketing  boolean default false,
  consentement_date       timestamptz,
  created_at              timestamptz not null default now()
);

create index if not exists idx_leads_pdf_email
  on public.leads_pdf_comparatif(email);
create index if not exists idx_leads_pdf_created
  on public.leads_pdf_comparatif(created_at desc);

-- ═══════════════════════════════════════════════════════════
-- 2) leads_ads_formulaire
-- Sources : OptimizedScpiLandingPage (Google Ads),
--           OptimizedThematicLandingPage (Google Ads)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.leads_ads_formulaire (
  id              uuid primary key default gen_random_uuid(),
  nom             text,
  prenom          text,
  email           text not null,
  telephone       text,
  montant         text,
  commentaire     text,
  scpi            jsonb,
  statut          text default 'nouveau',
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  gclid           text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_leads_ads_email
  on public.leads_ads_formulaire(email);
create index if not exists idx_leads_ads_created
  on public.leads_ads_formulaire(created_at desc);
create index if not exists idx_leads_ads_gclid
  on public.leads_ads_formulaire(gclid)
  where gclid is not null;

-- ═══════════════════════════════════════════════════════════
-- 3) google_ads_comete_leads
-- Source : ScpiExamplePage (Google Ads Comète)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.google_ads_comete_leads (
  id                      uuid primary key default gen_random_uuid(),
  nom                     text,
  prenom                  text,
  email                   text not null,
  telephone               text,
  montant_investissement   text,
  commentaire             text,
  source                  text,
  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  gclid                   text,
  statut                  text default 'nouveau',
  created_at              timestamptz not null default now()
);

create index if not exists idx_comete_email
  on public.google_ads_comete_leads(email);
create index if not exists idx_comete_created
  on public.google_ads_comete_leads(created_at desc);
create index if not exists idx_comete_gclid
  on public.google_ads_comete_leads(gclid)
  where gclid is not null;

-- ═══════════════════════════════════════════════════════════
-- 4) partner_leads
-- Source : supabaseBtob.ts / AdminPartners.tsx
-- ═══════════════════════════════════════════════════════════

create table if not exists public.partner_leads (
  id              uuid primary key default gen_random_uuid(),
  cabinet_name    text not null,
  contact_name    text,
  email           text not null,
  phone           text,
  source          text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  page_url        text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_partner_leads_email
  on public.partner_leads(email);
create index if not exists idx_partner_leads_created
  on public.partner_leads(created_at desc);

-- ═══════════════════════════════════════════════════════════
-- 5) Vérifier que prospects a les colonnes manquantes
--    (la table existe déjà, on ajoute seulement si absent)
-- ═══════════════════════════════════════════════════════════

alter table public.prospects add column if not exists simulation_result jsonb;
alter table public.prospects add column if not exists utm_source text;
alter table public.prospects add column if not exists utm_medium text;
alter table public.prospects add column if not exists utm_campaign text;
alter table public.prospects add column if not exists gclid text;
alter table public.prospects add column if not exists type_contact text;
alter table public.prospects add column if not exists profil_risque text;
alter table public.prospects add column if not exists profil_esg text;
alter table public.prospects add column if not exists horizon text;
alter table public.prospects add column if not exists objectifs text;
alter table public.prospects add column if not exists tmi text;
alter table public.prospects add column if not exists portfolio_selection jsonb;
alter table public.prospects add column if not exists exactitude_info boolean;
alter table public.prospects add column if not exists comprehension_risques boolean;
alter table public.prospects add column if not exists accord_cif boolean;
alter table public.prospects add column if not exists comprehension_process boolean;

-- ═══════════════════════════════════════════════════════════
-- 6) ROW LEVEL SECURITY — toutes les tables leads
-- ═══════════════════════════════════════════════════════════

-- leads_pdf_comparatif
alter table public.leads_pdf_comparatif enable row level security;

drop policy if exists "allow_insert_anon_leads_pdf" on public.leads_pdf_comparatif;
create policy "allow_insert_anon_leads_pdf"
  on public.leads_pdf_comparatif
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "deny_select_leads_pdf" on public.leads_pdf_comparatif;
create policy "deny_select_leads_pdf"
  on public.leads_pdf_comparatif
  for select
  using (false);

-- leads_ads_formulaire
alter table public.leads_ads_formulaire enable row level security;

drop policy if exists "allow_insert_anon_leads_ads" on public.leads_ads_formulaire;
create policy "allow_insert_anon_leads_ads"
  on public.leads_ads_formulaire
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "deny_select_leads_ads" on public.leads_ads_formulaire;
create policy "deny_select_leads_ads"
  on public.leads_ads_formulaire
  for select
  using (false);

-- google_ads_comete_leads
alter table public.google_ads_comete_leads enable row level security;

drop policy if exists "allow_insert_anon_comete" on public.google_ads_comete_leads;
create policy "allow_insert_anon_comete"
  on public.google_ads_comete_leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "deny_select_comete" on public.google_ads_comete_leads;
create policy "deny_select_comete"
  on public.google_ads_comete_leads
  for select
  using (false);

-- partner_leads
alter table public.partner_leads enable row level security;

drop policy if exists "allow_insert_anon_partner" on public.partner_leads;
create policy "allow_insert_anon_partner"
  on public.partner_leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "deny_select_partner" on public.partner_leads;
create policy "deny_select_partner"
  on public.partner_leads
  for select
  using (false);

-- prospects (ajout insert anon si manquant)
alter table public.prospects enable row level security;

drop policy if exists "allow_insert_anon_prospects" on public.prospects;
create policy "allow_insert_anon_prospects"
  on public.prospects
  for insert
  to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════════
-- 7) Rafraîchir le cache PostgREST
-- ═══════════════════════════════════════════════════════════

notify pgrst, 'reload schema';

commit;

-- ═══════════════════════════════════════════════════════════
-- 8) VALIDATION — exécuter après le bloc ci-dessus
-- ═══════════════════════════════════════════════════════════

-- Vérifier que les 4 tables existent
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'leads_pdf_comparatif',
    'leads_ads_formulaire',
    'google_ads_comete_leads',
    'partner_leads',
    'prospects'
  )
order by table_name;

-- Vérifier les colonnes de leads_pdf_comparatif
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'leads_pdf_comparatif'
order by ordinal_position;

-- Vérifier les colonnes de leads_ads_formulaire
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'leads_ads_formulaire'
order by ordinal_position;

-- Vérifier les colonnes de google_ads_comete_leads
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'google_ads_comete_leads'
order by ordinal_position;

-- Vérifier les colonnes de partner_leads
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'partner_leads'
order by ordinal_position;

-- Vérifier RLS activé
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'leads_pdf_comparatif',
    'leads_ads_formulaire',
    'google_ads_comete_leads',
    'partner_leads',
    'prospects'
  );

-- Vérifier les policies
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'leads_pdf_comparatif',
    'leads_ads_formulaire',
    'google_ads_comete_leads',
    'partner_leads'
  )
order by tablename, policyname;
