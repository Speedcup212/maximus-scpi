-- Access requests + invitations schema updates for invite-only flow

create extension if not exists "citext";

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  requested_role text not null check (requested_role in ('CLIENT','PARTENAIRE')),
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

create index if not exists access_requests_status_idx on public.access_requests (status);

alter table public.access_requests enable row level security;

create policy access_requests_insert
  on public.access_requests for insert
  with check (status = 'PENDING');

create policy access_requests_admin_select
  on public.access_requests for select
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy access_requests_admin_update
  on public.access_requests for update
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy access_requests_admin_delete
  on public.access_requests for delete
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

-- Invitations table adjustments
alter table public.invitations
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists token_hash text,
  add column if not exists claimed_at timestamptz null,
  add column if not exists claimed_by uuid null references auth.users(id),
  add column if not exists created_by uuid null references auth.users(id),
  add column if not exists meta jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'invitations' and column_name = 'email' and data_type <> 'citext'
  ) then
    execute 'alter table public.invitations alter column email type citext';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'invitations' and column_name = 'token' and data_type <> 'text'
  ) then
    execute 'alter table public.invitations alter column token type text using token::text';
  end if;
end $$;

update public.invitations
set role = upper(role)
where role is not null;

update public.invitations
set status = upper(status)
where status is not null;

alter table public.invitations
  drop constraint if exists invitations_role_check;

alter table public.invitations
  add constraint invitations_role_check
  check (role in ('CLIENT','PARTENAIRE','ADMIN'));

alter table public.invitations
  drop constraint if exists invitations_status_check;

alter table public.invitations
  add constraint invitations_status_check
  check (status in ('PENDING','USED','REVOKED','EXPIRED'));

create unique index if not exists invitations_token_hash_idx on public.invitations (token_hash);
create unique index if not exists invitations_token_idx on public.invitations (token);
create index if not exists invitations_role_idx on public.invitations (role);

create or replace function public.apply_invitation_to_profile()
returns trigger
language plpgsql
as $$
declare
  mapped_role text;
begin
  if new.status <> 'USED' then
    return new;
  end if;
  if new.claimed_by is null then
    return new;
  end if;

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
