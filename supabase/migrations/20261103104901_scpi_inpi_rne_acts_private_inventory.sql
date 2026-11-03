-- Applied to MaximusSCPI on 2026-11-03 as Supabase migration 20261103104901.
-- INPI PDF originals remain private; no user-facing SELECT/INSERT/UPDATE policy.
create table if not exists public.scpi_inpi_entities (
  scpi_slug text primary key references public.scpi_indicators(scpi_slug) on delete cascade,
  siren text not null unique check (siren ~ '^[0-9]{9}$'),
  verified boolean not null default false,
  verification_source text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scpi_inpi_verified_source_check check (
    not verified or (verification_source is not null and length(trim(verification_source)) > 5 and verified_at is not null)
  )
);
create table if not exists public.scpi_inpi_documents (
  inpi_id text primary key,
  scpi_slug text not null references public.scpi_indicators(scpi_slug) on delete cascade,
  siren text not null check (siren ~ '^[0-9]{9}$'),
  document_name text,
  deposit_date date,
  source_updated_at timestamptz,
  act_types jsonb not null default '[]'::jsonb,
  status text not null check (status in ('available','withdrawn','restricted','error')),
  storage_path text,
  sha256 text,
  last_error text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint scpi_inpi_pdf_evidence_consistency check (
    (status='available' and storage_path is not null and sha256 ~ '^[0-9a-f]{64}$')
    or (status <> 'available')
  ),
  constraint scpi_inpi_storage_path_scope check (
    storage_path is null or storage_path like 'inpi/%'
  )
);
create index if not exists scpi_inpi_documents_siren_idx on public.scpi_inpi_documents(siren);
create index if not exists scpi_inpi_documents_slug_idx on public.scpi_inpi_documents(scpi_slug);
create index if not exists scpi_inpi_documents_checked_idx on public.scpi_inpi_documents(checked_at);
alter table public.scpi_inpi_entities enable row level security;
alter table public.scpi_inpi_documents enable row level security;
revoke all on public.scpi_inpi_entities from public, anon, authenticated;
revoke all on public.scpi_inpi_documents from public, anon, authenticated;
grant select, insert, update, delete on public.scpi_inpi_entities to service_role;
grant select, insert, update, delete on public.scpi_inpi_documents to service_role;
comment on table public.scpi_inpi_entities is 'Verified fund-level SIREN mapping; service-role only, no manager guessing.';
comment on table public.scpi_inpi_documents is 'Restricted INPI acts catalog. PDFs reside in existing scpi-bulletins storage bucket; INPI deletions must revoke the object.';
