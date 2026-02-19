-- Ajouter notified_at + notified_error à contact_submissions existante
-- Safe : IF NOT EXISTS, exécutable plusieurs fois

alter table public.contact_submissions
  add column if not exists notified_at    timestamptz,
  add column if not exists notified_error text;

notify pgrst, 'reload schema';
