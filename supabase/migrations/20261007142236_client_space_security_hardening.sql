alter view public.scpi_trajectory_pilot_dashboard set (security_invoker = true);

revoke all privileges on table public.scpi_trajectory_pilot_dashboard from anon;
revoke all privileges on table public.scpi_trajectory_pilot_dashboard from authenticated;
grant select on table public.scpi_trajectory_pilot_dashboard to service_role;
