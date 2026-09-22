-- MaximusSCPI — veille automatisée des acquisitions SCPI
-- Déployé le 22/09/2026. Les sources sont synchronisées depuis data/scpi-investment-news-sources.json.

create extension if not exists pgcrypto;
create extension if not exists pg_net;
create extension if not exists pg_cron;

create table if not exists public.scpi_news_sources (
  slug text primary key,
  name text not null,
  management_company text not null default '',
  official_url text not null default '',
  news_url text not null default '',
  documents_url text not null default '',
  rss_url text not null default '',
  enabled boolean not null default true,
  status text not null default 'incomplete' check (status in ('active','incomplete','error')),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  last_items_found integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scpi_news_items (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  scpi_slug text not null,
  scpi_name text not null,
  management_company text not null default '',
  operation_type text not null default 'acquisition',
  asset_type text not null default 'autre_immobilier',
  country text not null default '',
  city text not null default '',
  area text not null default '',
  address text not null default '',
  tenant text not null default '',
  amount text not null default '',
  surface text not null default '',
  lease_duration text not null default '',
  title text not null,
  summary text not null default '',
  source_url text not null,
  source_type text not null default 'web_page',
  document_title text not null default '',
  source_official boolean not null default true,
  published_date date,
  detected_at timestamptz not null default now(),
  data_quality text not null default 'standard' check (data_quality in ('complete','standard','partial','weak')),
  editorial_priority integer not null default 2 check (editorial_priority between 0 and 3),
  confidence numeric(4,3) not null default 0.850,
  status text not null default 'published' check (status in ('published','review','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scpi_news_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','partial','error')),
  sources_total integer not null default 0,
  sources_success integer not null default 0,
  sources_error integer not null default 0,
  items_detected integer not null default 0,
  items_inserted integer not null default 0,
  error_message text,
  details jsonb not null default '{}'::jsonb
);

create table if not exists public.scpi_news_runtime_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_scpi_news_items_date
  on public.scpi_news_items (published_date desc nulls last, detected_at desc);
create index if not exists idx_scpi_news_items_scpi
  on public.scpi_news_items (scpi_slug, published_date desc nulls last);
create index if not exists idx_scpi_news_sources_status
  on public.scpi_news_sources (status, last_checked_at);

alter table public.scpi_news_sources enable row level security;
alter table public.scpi_news_items enable row level security;
alter table public.scpi_news_runs enable row level security;
alter table public.scpi_news_runtime_config enable row level security;

drop policy if exists "public_read_scpi_news_sources" on public.scpi_news_sources;
create policy "public_read_scpi_news_sources"
  on public.scpi_news_sources for select to anon, authenticated using (true);

drop policy if exists "public_read_scpi_news_items" on public.scpi_news_items;
create policy "public_read_scpi_news_items"
  on public.scpi_news_items for select to anon, authenticated
  using (status='published' and editorial_priority > 0 and data_quality <> 'weak');

drop policy if exists "public_read_scpi_news_runs" on public.scpi_news_runs;
create policy "public_read_scpi_news_runs"
  on public.scpi_news_runs for select to anon, authenticated using (true);

do $$
declare
  v_token text;
  v_hash text;
  j bigint;
begin
  if not exists (select 1 from public.scpi_news_runtime_config where key='cron_token_plain') then
    v_token := encode(gen_random_bytes(32), 'hex');
    v_hash := encode(digest(v_token, 'sha256'), 'hex');

    insert into public.scpi_news_runtime_config(key,value)
      values ('cron_token_plain',v_token);
    insert into public.scpi_news_runtime_config(key,value)
      values ('cron_token_sha256',v_hash);
  end if;

  select jobid into j from cron.job where jobname='scpi-news-watch-daily' limit 1;
  if j is not null then
    perform cron.unschedule(j);
  end if;
end $$;

select cron.schedule(
  'scpi-news-watch-daily',
  '15 5 * * *',
  $cron$
  select net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-news-watch',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-cron-token',(select value from public.scpi_news_runtime_config where key='cron_token_plain')
    ),
    body := jsonb_build_object('trigger','cron','at',now()),
    timeout_milliseconds := 120000
  );
  $cron$
);
