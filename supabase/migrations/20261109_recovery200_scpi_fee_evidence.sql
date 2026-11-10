-- RECOVERY-200 / chantier A : registre des preuves de frais réglementaires.
-- Une ligne par SCPI et par nature de frais. Zéro, inconnu et non applicable sont
-- distincts ; un statut `verified` exige identité, document, empreinte, page, extrait,
-- assiette et revue sémantique. Les statuts techniques détaillés restent dans
-- `technical_status`/`reason` ; le statut public est limité à verified/partial/blocked.

create table if not exists public.scpi_fee_evidence (
  id uuid primary key default gen_random_uuid(),
  scpi_slug text not null,
  fee_kind text not null check (fee_kind in ('souscription','gestion','cession','retrait','arbitrage','acquisition','suivi_travaux','autre')),
  verification_status text not null check (verification_status in ('verified','partial','blocked')),
  value_state text not null check (value_state in ('value','zero','unknown','not_applicable')),
  rate_ht numeric check (rate_ht is null or (rate_ht >= 0 and rate_ht <= 100)),
  rate_ttc numeric check (rate_ttc is null or (rate_ttc >= 0 and rate_ttc <= 100)),
  tax_label text check (tax_label is null or tax_label in ('HT','TTC','TTI','exonere')),
  assessment_basis text,
  document_kind text check (document_kind is null or document_kind in ('dic','note','statuts','bulletin','rapport_annuel')),
  source_url text check (source_url is null or source_url like 'https://%'),
  pdf_sha256 text check (pdf_sha256 is null or pdf_sha256 ~ '^[a-f0-9]{64}$'),
  source_page integer check (source_page is null or source_page > 0),
  evidence_text text,
  document_dates_hint jsonb,
  valid_from date not null,
  valid_from_basis text not null,
  product_identity_verified boolean not null default false,
  semantic_review_verified boolean not null default false,
  semantic_reviewer text,
  technical_status text,
  reason text,
  note text,
  catalog_value_is_priips_cost boolean not null default false,
  probe_run_id text not null,
  created_at timestamptz not null default now(),
  constraint scpi_fee_evidence_value_state_consistency check (
    (value_state = 'value' and coalesce(rate_ht, rate_ttc) > 0)
    or (value_state = 'zero' and coalesce(rate_ht, 0) = 0 and coalesce(rate_ttc, 0) = 0 and evidence_text is not null)
    or (value_state in ('unknown','not_applicable') and rate_ht is null and rate_ttc is null)),
  constraint scpi_fee_evidence_verified_requires_proof check (
    verification_status <> 'verified' or (
      value_state in ('value','zero') and source_url is not null and pdf_sha256 is not null
      and source_page is not null and length(coalesce(evidence_text,'')) > 20
      and assessment_basis is not null and tax_label is not null
      and document_kind in ('dic','note')
      and product_identity_verified and semantic_review_verified)),
  constraint scpi_fee_evidence_unique unique (scpi_slug, fee_kind, probe_run_id)
);

create index if not exists scpi_fee_evidence_slug_idx on public.scpi_fee_evidence (scpi_slug, fee_kind);

alter table public.scpi_fee_evidence enable row level security;
revoke all on public.scpi_fee_evidence from anon, authenticated;
comment on table public.scpi_fee_evidence is
  'RECOVERY-200 : preuves de frais par SCPI (DIC/note, SHA-256, page, extrait). Lecture service_role uniquement ; la projection publique passe par scpi_indicators.metric_provenance.';
