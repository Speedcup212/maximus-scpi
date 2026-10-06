-- Business P2 hardening — funnel_events must not be discoverable by anon.
revoke select on table public.funnel_events from anon;
