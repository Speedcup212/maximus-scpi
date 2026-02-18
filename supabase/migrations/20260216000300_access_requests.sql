-- Access requests table (invitation-only onboarding)

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requested_role text not null default 'CLIENT',
  full_name text not null,
  email text not null,
  phone text null,
  message text null,
  status text not null default 'PENDING'
);

create unique index if not exists access_requests_email_unique_idx
  on public.access_requests (email);

create index if not exists access_requests_status_created_idx
  on public.access_requests (status, created_at);

alter table public.access_requests enable row level security;
