-- Fail-closed source policy health: invalidated TOF remains a defect, not silently filtered.
CREATE OR REPLACE VIEW public.scpi_chantier_health AS  SELECT now() AS checked_at,
    ( SELECT count(*)::integer AS count
           FROM scpi_crash_test_status
          WHERE scpi_crash_test_status.crash_status = 'PASS'::text) AS pass_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_crash_test_status
          WHERE scpi_crash_test_status.crash_status <> 'PASS'::text) AS fail_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_BACKTEST'::text) AS ready_backtest_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'PARTIAL'::text) AS partial_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'BACKFILL_REQUIRED'::text) AS backfill_required_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_publish_queue q
             JOIN scpi_crash_test_status c USING (scpi_slug)
          WHERE q.published_at IS NULL AND q.publish_after <= CURRENT_DATE AND q.change_type = 'trajectory_data'::text AND c.crash_status = 'PASS'::text) AS pending_pass_publication,
    ( SELECT count(*)::integer AS count
           FROM scpi_publish_queue q
             JOIN scpi_crash_test_status c USING (scpi_slug)
          WHERE q.published_at IS NULL AND q.publish_after <= CURRENT_DATE AND q.change_type = 'trajectory_data'::text AND c.crash_status <> 'PASS'::text) AS blocked_fail_publication,
    ( SELECT count(*)::integer AS count
           FROM scpi_source_registry
          WHERE scpi_source_registry.automation_enabled AND NOT (scpi_source_registry.verification_status = 'verified'::text AND scpi_source_registry.confidence_level = 'high'::text)) AS source_registry_not_verified_high,
    ( SELECT count(*)::integer AS count
           FROM scpi_source_registry
          WHERE scpi_source_registry.automation_enabled AND scpi_source_registry.error_count > 0) AS source_registry_error_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_indicator_history
          WHERE (COALESCE(scpi_indicator_history.qa_status, ''::text) !~ '^invalid'::text OR scpi_indicator_history.qa_status='invalid_tof_bulletin_source_policy') AND scpi_indicator_history.tof IS NULL AND COALESCE(scpi_indicator_history.qa_status, ''::text) !~~ '%tof_not_reported%'::text AND COALESCE(scpi_indicator_history.qa_status, ''::text) !~~ '%tof_not_applicable%'::text) AS active_missing_tof_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_indicator_history
          WHERE (COALESCE(scpi_indicator_history.qa_status, ''::text) !~ '^invalid'::text OR scpi_indicator_history.qa_status='invalid_tof_bulletin_source_policy') AND COALESCE(scpi_indicator_history.source_confidence, 0::numeric) < 0.95) AS active_low_confidence_rows,
    ( SELECT d.status
           FROM scpi_netlify_deploy_log d
          WHERE d.deploy_date = CURRENT_DATE
          ORDER BY d.deployed_at DESC NULLS LAST
         LIMIT 1) AS today_deploy_status,
    ( SELECT d.deploy_reference
           FROM scpi_netlify_deploy_log d
          WHERE d.deploy_date = CURRENT_DATE
          ORDER BY d.deployed_at DESC NULLS LAST
         LIMIT 1) AS today_deploy_reference,
    ( SELECT d.deployed_at
           FROM scpi_netlify_deploy_log d
          WHERE d.deploy_date = CURRENT_DATE
          ORDER BY d.deployed_at DESC NULLS LAST
         LIMIT 1) AS today_deployed_at,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_qa_queue
          WHERE scpi_trajectory_qa_queue.qa_check <> 'ok'::text) AS trajectory_qa_alert_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_YOUNG_FUND'::text) AS ready_young_fund_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = ANY (ARRAY['READY_BACKTEST'::text, 'READY_YOUNG_FUND'::text, 'READY_NEW_FUND'::text, 'READY_STRUCTURAL_TRANSITION'::text, 'READY_LOW_FREQUENCY'::text, 'READY_SPECIAL_STRUCTURE'::text])) AS operational_ready_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_ingestion_guardrail_violations) AS ingestion_guardrail_alert_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_ingestion_guardrail_extended) AS extended_guardrail_alert_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_qa_guard_review_queue) AS qa_guard_review_rows,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_STRUCTURAL_TRANSITION'::text) AS ready_structural_transition_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_NEW_FUND'::text) AS ready_new_fund_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_LOW_FREQUENCY'::text) AS ready_low_frequency_count,
    ( SELECT count(*)::integer AS count
           FROM scpi_trajectory_pilot_readiness
          WHERE scpi_trajectory_pilot_readiness.readiness = 'READY_SPECIAL_STRUCTURE'::text) AS ready_special_structure_count,
    (SELECT count(*)::integer FROM public.scpi_metric_certifications WHERE metric='tof' AND verification_status='invalid_tof_bulletin_source_policy') AS tof_policy_invalid_certifications,
    (SELECT count(*)::integer FROM public.scpi_indicator_history WHERE qa_status='invalid_tof_bulletin_source_policy') AS tof_policy_invalid_history_rows,
    (SELECT count(*)::integer FROM public.scpi_indicators WHERE qa_status='invalid_tof_bulletin_source_policy') AS tof_policy_invalid_current_rows;;
