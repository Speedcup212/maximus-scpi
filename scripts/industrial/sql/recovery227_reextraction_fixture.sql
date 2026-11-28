-- RECOVERY-227 — fixture de rejeu HORS PRODUCTION de la transaction de
-- ré-extraction Kyaneos 2026-T3. Reconstruit le strict minimum réel pour
-- prouver la transaction, ses gardes et son rollback sans aucune connexion.
--
-- Ce fichier n'écrit rien en production et n'est pas une migration.
-- Utilisation :
--   createdb rec227 && psql -d rec227 -v ON_ERROR_STOP=1 -f scripts/industrial/sql/recovery227_reextraction_fixture.sql
--   psql -d rec227 -v ON_ERROR_STOP=1 -f scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql
--   node --test scripts/industrial/recovery227Reextraction.test.mjs

\set ON_ERROR_STOP on

create schema if not exists maximus_agents;

create table if not exists public.scpi_bulletins (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text not null,
  period text not null,
  qa_status text,
  pdf_sha256 text,
  source_url text,
  extraction_json jsonb,
  extraction_confidence numeric,
  processed_at timestamptz,
  unique (scpi_slug, period)
);

create table if not exists public.scpi_indicators (
  scpi_slug text primary key,
  source_period text,
  qa_status text,
  valeur_realisation numeric,
  prix_reconstitution numeric,
  prix_retrait numeric,
  endettement numeric
);

create table if not exists public.scpi_indicator_history (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text, source_period text, qa_status text
);

create table if not exists public.scpi_metric_certifications (
  scpi_slug text, source_period text, metric text
);

create table if not exists public.scpi_ingestion_events (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text, status text, step text, message text,
  source_period text, bulletin_url text,
  extraction_confidence numeric, metrics_count int, ended_at timestamptz
);

create table if not exists maximus_agents.scpi_replay_provenance_quarantine (
  event_key text primary key, reason text, snapshot jsonb,
  created_at timestamptz default now()
);

-- Compteur strict de référence : 68 PASS_100 sur 69, Kyaneos INCOMPLETE.
create table if not exists public.strict_fixture (
  scpi_slug text primary key, crash_test_status text
);
insert into public.strict_fixture
select 'fonds-'||g, case when g<=68 then 'PASS_100' else 'FAIL' end
from generate_series(1,68) g
on conflict do nothing;
insert into public.strict_fixture values ('kyaneos-pierre','FAIL')
on conflict do nothing;
create or replace view public.scpi_crash_test_strict_v2 as
  select * from public.strict_fixture;

-- Préimage : la ligne T3 réellement observée le 2026-11-28 03:30:53Z,
-- extraction décalée d'un champ.
insert into public.scpi_bulletins(scpi_slug, period, qa_status, pdf_sha256, source_url,
  extraction_confidence, extraction_json, processed_at)
values ('kyaneos-pierre','2026-T3','auto_partial_review',
  '4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c',
  'https://kyaneosam.com/wp-content/uploads/2026/11/SCPI-KP-Bulletin-trimestriel-3T2026.pdf',
  0.3,
  '{"confidence":0.3,"chiffres_cles":{"prix_part":224,"capitalisation":224},
    "maximus_indicators":{"endettement":0.25,"capital_type":"variable","prix_retrait":225.02,
      "nombre_immeubles":8,"valeur_realisation":184.42},
    "valorisation_risque":{"prix_reconstitution":186.49}}'::jsonb,
  '2026-11-28T03:30:53Z')
on conflict (scpi_slug, period) do nothing;

-- Surface publiée : T2 uniquement, jamais contaminée par la ligne T3.
insert into public.scpi_indicators(scpi_slug, source_period, qa_status,
  valeur_realisation, prix_reconstitution, prix_retrait, endettement)
values ('kyaneos-pierre','2026-T2','manual_verified',187.10,225.26,199.36,25)
on conflict (scpi_slug) do nothing;
