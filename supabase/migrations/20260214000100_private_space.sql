-- Private space schema + RLS

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) profile étendu
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client','partner','admin')),
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  org_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) organisations partenaires
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_org_fk foreign key (org_id) references public.organizations(id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 3) dossiers
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid null references public.organizations(id),
  title text not null,
  status text not null default 'new' check (status in ('new','in_progress','sent','closed')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cases_set_updated_at
before update on public.cases
for each row execute function public.set_updated_at();

-- 4) comptes rendus
create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_user_id uuid not null references auth.users(id),
  note_type text not null default 'compte_rendu' check (note_type in ('compte_rendu','hypotheses','actions','misc')),
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_notes_set_updated_at
before update on public.case_notes
for each row execute function public.set_updated_at();

-- 5) pdfs (métadonnées)
create table if not exists public.case_pdfs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  generated_by_user_id uuid not null references auth.users(id),
  version int not null default 1,
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- 6) audit log minimal
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.cases enable row level security;
alter table public.case_notes enable row level security;
alter table public.case_pdfs enable row level security;
alter table public.audit_events enable row level security;

-- Profiles policies
create policy profiles_self_select
  on public.profiles for select
  using (auth.uid() = user_id);

create policy profiles_self_update
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy profiles_admin_all
  on public.profiles for all
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- Organizations policies
create policy organizations_select
  on public.organizations for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and (p.role = 'admin' or p.org_id = organizations.id)
    )
  );

create policy organizations_admin_insert
  on public.organizations for insert
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

create policy organizations_admin_update
  on public.organizations for update
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- Cases policies
create policy cases_select
  on public.cases for select
  using (
    client_user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'partner'
        and p.org_id = cases.org_id
    )
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy cases_partner_insert
  on public.cases for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (p.role = 'partner' or p.role = 'admin')
        and (p.role = 'admin' or p.org_id = cases.org_id)
    )
  );

create policy cases_partner_update
  on public.cases for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (p.role = 'partner' or p.role = 'admin')
        and (p.role = 'admin' or p.org_id = cases.org_id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (p.role = 'partner' or p.role = 'admin')
        and (p.role = 'admin' or p.org_id = cases.org_id)
    )
  );

-- Case notes policies
create policy case_notes_select
  on public.case_notes for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_notes.case_id
        and (
          c.client_user_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.user_id = auth.uid()
              and (p.role = 'partner' or p.role = 'admin')
              and (p.role = 'admin' or p.org_id = c.org_id)
          )
        )
    )
  );

create policy case_notes_insert
  on public.case_notes for insert
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_notes.case_id
        and (
          c.client_user_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.user_id = auth.uid()
              and (p.role = 'partner' or p.role = 'admin')
              and (p.role = 'admin' or p.org_id = c.org_id)
          )
        )
    )
  );

-- Case PDFs policies
create policy case_pdfs_select
  on public.case_pdfs for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_pdfs.case_id
        and (
          c.client_user_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.user_id = auth.uid()
              and (p.role = 'partner' or p.role = 'admin')
              and (p.role = 'admin' or p.org_id = c.org_id)
          )
        )
    )
  );

create policy case_pdfs_insert
  on public.case_pdfs for insert
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_pdfs.case_id
        and exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and (p.role = 'partner' or p.role = 'admin')
            and (p.role = 'admin' or p.org_id = c.org_id)
        )
    )
  );

-- Audit events policies
create policy audit_events_insert
  on public.audit_events for insert
  with check (auth.uid() is not null);

create policy audit_events_admin_select
  on public.audit_events for select
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('private-docs', 'private-docs', false)
on conflict (id) do nothing;

-- Storage policies
create policy storage_private_docs_select
  on storage.objects for select
  using (
    bucket_id = 'private-docs'
    and exists (
      select 1 from public.cases c
      where c.id = split_part(storage.objects.name, '/', 2)::uuid
        and (
          c.client_user_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.user_id = auth.uid()
              and (p.role = 'partner' or p.role = 'admin')
              and (p.role = 'admin' or p.org_id = c.org_id)
          )
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
        and exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and (p.role = 'partner' or p.role = 'admin')
            and (p.role = 'admin' or p.org_id = c.org_id)
        )
    )
  );
