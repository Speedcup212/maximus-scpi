-- RECOVERY-121 — private, read-only supervision of the EXISTING 5 agent roles.
-- No extra queue, no change to claim budgets, no financial/admission mutations.
CREATE OR REPLACE VIEW maximus_agents.agent_operational_status
WITH (security_invoker = true)
AS
SELECT
 a.role,
 a.enabled,
 a.heartbeat_at AS last_heartbeat_utc,
 a.heartbeat_at AT TIME ZONE 'Europe/Paris' AS last_heartbeat_paris,
 coalesce(t.pending_today,0) AS pending_today,
 coalesce(t.running,0) AS running,
 coalesce(t.blocked_today,0) AS blocked_today,
 coalesce(t.completed_today,0) AS completed_today,
 coalesce(t.pending_all,0) AS pending_all,
 coalesce(t.blocked_all,0) AS blocked_all,
 coalesce(t.pending_qa_dependencies,0) AS pending_qa_dependencies,
 coalesce(r.claims_today,0) AS claims_today,
 CASE WHEN a.role='CONTROL' THEN NULL ELSE cfg.max_claims_per_role_day END AS daily_claim_limit,
 CASE WHEN a.role='CONTROL' THEN NULL
 ELSE greatest(cfg.max_claims_per_role_day-coalesce(r.claims_today,0),0)
 END AS claims_remaining_today,
 r.last_run_started_at AS last_run_started_utc,
 r.last_run_status,
 CASE
   WHEN NOT a.enabled OR NOT cfg.enabled THEN 'DISABLED'
   WHEN coalesce(t.running,0)>0 THEN 'RUNNING'
   WHEN a.role='CONTROL' THEN 'COORDINATOR'
   WHEN coalesce(t.pending_qa_dependencies,0)>0 AND a.role='QA' THEN 'WAITING_UPSTREAM'
   WHEN coalesce(t.pending_today,0)>0 AND coalesce(r.claims_today,0)>=cfg.max_claims_per_role_day
     THEN 'QUOTA_EXHAUSTED'
   WHEN coalesce(t.blocked_today,0)>0 THEN 'NEEDS_REVIEW'
   WHEN coalesce(t.pending_today,0)>0 THEN 'READY_OR_WAITING'
   WHEN coalesce(t.completed_today,0)>0 THEN 'IDLE_AFTER_WORK'
   ELSE 'IDLE'
 END AS operational_state
FROM maximus_agents.agents a
CROSS JOIN maximus_agents.settings cfg
LEFT JOIN LATERAL (
 SELECT
  count(*) FILTER (WHERE x.status='pending' AND x.cycle_date=(now() AT TIME ZONE 'Europe/Paris')::date) AS pending_today,
  count(*) FILTER (WHERE x.status='pending') AS pending_all,
  count(*) FILTER (WHERE x.status='running') AS running,
  count(*) FILTER (WHERE x.status='blocked' AND x.cycle_date=(now() AT TIME ZONE 'Europe/Paris')::date) AS blocked_today,
  count(*) FILTER (WHERE x.status='blocked') AS blocked_all,
  count(*) FILTER (WHERE x.status='done' AND x.cycle_date=(now() AT TIME ZONE 'Europe/Paris')::date) AS completed_today,
  count(*) FILTER (WHERE x.role='QA' AND x.status='pending'
   AND EXISTS (
    SELECT 1 FROM unnest(x.depends_on) dep(id)
    LEFT JOIN maximus_agents.tasks parent ON parent.id=dep.id
    WHERE parent.id IS NULL OR parent.status<>'done'
   )
  ) AS pending_qa_dependencies
 FROM maximus_agents.tasks x WHERE x.role=a.role
) t ON true
LEFT JOIN LATERAL (
 SELECT
  count(*) FILTER (WHERE z.started_at AT TIME ZONE 'Europe/Paris' >=
    date_trunc('day',now() AT TIME ZONE 'Europe/Paris')) AS claims_today,
  max(z.started_at) AS last_run_started_at,
  (SELECT r2.status FROM maximus_agents.runs r2 WHERE r2.role=a.role
   ORDER BY r2.started_at DESC LIMIT 1) AS last_run_status
 FROM maximus_agents.runs z WHERE z.role=a.role
) r ON true;
REVOKE ALL ON maximus_agents.agent_operational_status FROM PUBLIC,anon,authenticated;
