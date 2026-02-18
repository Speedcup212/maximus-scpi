-- Invitations table for invite-only access

create table if not exists public.invitations (
  token uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('client','partner','admin')),
  org_id uuid null references public.organizations(id),
  code_hash text not null,
  status text not null default 'pending' check (status in ('pending','used','revoked','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  used_at timestamptz null
);

create index if not exists invitations_email_idx on public.invitations (email);
create index if not exists invitations_status_idx on public.invitations (status);

alter table public.invitations enable row level security;

create policy invitations_admin_select
  on public.invitations for select
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy invitations_admin_insert
  on public.invitations for insert
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy invitations_admin_update
  on public.invitations for update
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy invitations_admin_delete
  on public.invitations for delete
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));
