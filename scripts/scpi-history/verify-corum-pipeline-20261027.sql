-- Read-only production verification. No status writes or threshold changes.
SELECT * FROM public.scpi_chantier_health;
SELECT * FROM public.scpi_trajectory_pilot_readiness WHERE scpi_slug LIKE 'corum%';
SELECT * FROM public.scpi_operational_status WHERE scpi_slug LIKE 'corum%';
SELECT scpi_slug,status,count(*) FROM maximus_agents.scpi_corum_document_runs GROUP BY 1,2 ORDER BY 1,2;
SELECT scpi_slug,automation_enabled,ingestion_driver,last_checked_at,last_success_at FROM public.scpi_source_registry WHERE scpi_slug LIKE 'corum%';
SELECT * FROM public.scpi_history_readiness_v1 WHERE scpi_slug LIKE 'corum%';
SELECT j.jobname,d.start_time,d.status,d.return_message FROM cron.job_run_details d JOIN cron.job j USING(jobid) WHERE j.jobname ILIKE '%scpi%' AND d.start_time>now()-interval '24 hours' AND d.status='failed';
