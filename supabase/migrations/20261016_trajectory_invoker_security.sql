-- Keep private CORUM trajectories accessible to service-role workers,
-- but ensure anonymous consumers see only validated existing SCPI.
-- The two views must be SECURITY INVOKER to enforce the underlying table RLS.
CREATE POLICY public_read_certified_structural_events
ON public.scpi_structural_events FOR SELECT TO anon, authenticated
USING (public.maximus_scpi_is_in_public_cohort(scpi_slug)
       AND verification_status ILIKE '%verified%');
ALTER VIEW public.scpi_trajectory_pilot_history SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_pilot_liquidity SET (security_invoker=true);

-- Other live trajectory projections must preserve the same gate.
ALTER VIEW public.scpi_trajectory_pilot_readiness SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_pilot_valuation_debt SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_signal_gate SET (security_invoker=true);

-- Protect auxiliary SCPI state views as well, while service-role remains unrestricted.
ALTER VIEW public.scpi_annual_backfill_progress SET (security_invoker=true);
ALTER VIEW public.scpi_automation_status SET (security_invoker=true);
ALTER VIEW public.scpi_indicator_deltas SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_agent_progress SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_orchestrator_status SET (security_invoker=true);
ALTER VIEW public.scpi_trajectory_work_plan SET (security_invoker=true);
