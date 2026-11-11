-- RECOVERY-201 — Capture email après simulation.
-- Trace de l'envoi de l'email 1 (« Votre simulation SCPI ») par la fonction send-simulation-email.
-- Additif uniquement : aucune policy RLS, aucune donnée existante modifiée.

alter table public.contact_submissions
  add column if not exists confirmation_sent_at timestamptz;

alter table public.contact_submissions
  add column if not exists confirmation_error text;

-- Limite d'envois par adresse (3 par 24 h) : lecture par email et date.
create index if not exists contact_submissions_email_created_idx
  on public.contact_submissions (email, created_at desc);
