-- RECOVERY-202: keep the vacancy/TOF rejection guard active for server ingestion.
-- Pure, private predicate only. No new table rights, public API or SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION scpi_internal.tof_explicit_vacancy_conflict(numeric,text)
  TO service_role;

-- Official issuer already independently downloaded by the Advenis family pilot.
-- Exact host only: no suffix/wildcard, no financial approval or candidate promotion.
INSERT INTO maximus_agents.scpi_candidate_issuer_hosts
  (hostname,issuer_name,approval_source)
VALUES ('www.advenis-reim.com','Advenis REIM',
        'https://www.advenis-reim.com/scpi_sc/scpi-eurovalys/')
ON CONFLICT (hostname) DO NOTHING;

DO $verify$
BEGIN
 IF NOT has_function_privilege('service_role',
       'scpi_internal.tof_explicit_vacancy_conflict(numeric,text)','EXECUTE')
    OR has_function_privilege('anon',
       'scpi_internal.tof_explicit_vacancy_conflict(numeric,text)','EXECUTE')
    OR has_function_privilege('authenticated',
       'scpi_internal.tof_explicit_vacancy_conflict(numeric,text)','EXECUTE') THEN
   RAISE EXCEPTION 'REC202_PRIVATE_PREDICATE_PERMISSIONS';
 END IF;
 IF NOT scpi_internal.tof_explicit_vacancy_conflict(
       10.3,'Locaux vacants : 10,3 % ; TOF T4 2024 89,7 %')
    OR scpi_internal.tof_explicit_vacancy_conflict(
       89.7,'Locaux vacants : 10,3 % ; TOF T4 2024 89,7 %') THEN
   RAISE EXCEPTION 'REC202_FINANCIAL_GUARD_MUST_REMAIN_ACTIVE';
 END IF;
 IF NOT maximus_agents.is_verified_candidate_issuer_source(
       'https://www.advenis-reim.com/wp-content/uploads/official.pdf')
    OR maximus_agents.is_verified_candidate_issuer_source(
       'https://www.advenis-reim.com.attacker.org/official.pdf') THEN
   RAISE EXCEPTION 'REC202_EXACT_ISSUER_HOST_REQUIRED';
 END IF;
END;
$verify$;
