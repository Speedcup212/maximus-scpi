-- Business P2 — admin-only funnel visibility
-- Needed by src/app/pages/AdminDashboard.tsx.
-- Keeps funnel_events private to anonymous users and non-admin authenticated users.

alter table public.funnel_events enable row level security;

grant select on table public.funnel_events to authenticated;

drop policy if exists "allow_select_admin" on public.funnel_events;

create policy "allow_select_admin"
  on public.funnel_events
  for select
  to authenticated
  using (public.is_admin());
