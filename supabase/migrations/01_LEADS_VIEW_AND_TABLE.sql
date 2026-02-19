-- =========================================================
-- MAXIMUSSCPI — Vue consolidée leads + table de fallback
-- À exécuter dans Supabase SQL Editor
-- =========================================================

begin;

-- ═══════════════════════════════════════════════════════════
-- OPTION A : VIEW leads_all (agrège toutes les tables leads)
-- ═══════════════════════════════════════════════════════════

drop view if exists public.leads_all;

create or replace view public.leads_all as

-- 1) prospects (F1 RdvModal, F2 EmailSimulation, F5 Generic, F6 IrokoZen, F7 Thematic, F8 ScpiLanding, F11 Subscription, W1 Calendly)
select
  id::text                    as lead_id,
  'prospects'                 as source_table,
  coalesce(type_contact, 'formulaire') as source_type,
  nom                         as nom,
  prenom                      as prenom,
  email                       as email,
  telephone                   as telephone,
  metadata->>'form'           as form_name,
  metadata->>'source'         as traffic_source,
  metadata->>'page'           as page_url,
  metadata                    as raw_metadata,
  null::uuid                  as request_id,
  statut                      as statut,
  created_at                  as created_at
from public.prospects

union all

-- 2) leads_pdf_comparatif (F3 OptimizedScpi, F4 OptimizedThematic, F10 LeadMagnet)
select
  id::text,
  'leads_pdf_comparatif',
  'pdf_comparatif',
  nom,
  prenom,
  email,
  null,
  'pdf_comparatif',
  source,
  source_page,
  null::jsonb,
  null::uuid,
  null,
  created_at
from public.leads_pdf_comparatif

union all

-- 3) leads_ads_formulaire (F3 OptimizedScpi Ads, F4 OptimizedThematic Ads)
select
  id::text,
  'leads_ads_formulaire',
  'google_ads',
  nom,
  prenom,
  email,
  telephone,
  'ads_formulaire',
  utm_source,
  null,
  jsonb_build_object('utm_source', utm_source, 'utm_medium', utm_medium, 'utm_campaign', utm_campaign, 'gclid', gclid),
  null::uuid,
  statut,
  created_at
from public.leads_ads_formulaire

union all

-- 4) google_ads_comete_leads (F9 ScpiExamplePage)
select
  id::text,
  'google_ads_comete_leads',
  'google_ads_comete',
  nom,
  prenom,
  email,
  telephone,
  'comete_ads',
  utm_source,
  null,
  jsonb_build_object('utm_source', utm_source, 'utm_medium', utm_medium, 'gclid', gclid),
  null::uuid,
  statut,
  created_at
from public.google_ads_comete_leads

union all

-- 5) partner_leads (F12 PartenaireCabinet)
select
  id::text,
  'partner_leads',
  'partner',
  null,
  null,
  email,
  null,
  'partner_cabinet',
  null,
  null,
  null::jsonb,
  null::uuid,
  null,
  created_at
from public.partner_leads

union all

-- 6) access_requests (F13 RequestAccess)
select
  id::text,
  'access_requests',
  'access_request',
  full_name,
  null,
  email,
  phone,
  'request_access',
  null,
  null,
  null::jsonb,
  null::uuid,
  status,
  created_at
from public.access_requests;


-- ═══════════════════════════════════════════════════════════
-- OPTION B : table contact_submissions (fallback + futur)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null,
  source_form   text not null,
  source_page   text,
  email         text not null,
  nom           text,
  prenom        text,
  telephone     text,
  payload       jsonb not null default '{}'::jsonb,
  status        text not null default 'received' check (status in ('received','notified','failed')),
  notif_sent    boolean not null default false,
  notif_error   text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_contact_submissions_email on public.contact_submissions(email);
create index if not exists idx_contact_submissions_created on public.contact_submissions(created_at desc);
create index if not exists idx_contact_submissions_request_id on public.contact_submissions(request_id);

alter table public.contact_submissions enable row level security;

drop policy if exists contact_submissions_anon_insert on public.contact_submissions;
create policy contact_submissions_anon_insert
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists contact_submissions_admin_all on public.contact_submissions;
create policy contact_submissions_admin_all
  on public.contact_submissions
  for all
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';

commit;
