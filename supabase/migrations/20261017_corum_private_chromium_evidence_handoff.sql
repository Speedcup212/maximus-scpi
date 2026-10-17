-- Audit evidence transfer for real CORUM private Chromium acceptance.
-- Store evidence only. A successful browser run is NOT risk/financial signoff.
DO $browser_proof$
DECLARE changed int;
BEGIN
 IF (SELECT count(*) FROM maximus_agents.scpi_candidate_final_review r
    JOIN maximus_agents.scpi_universe u USING(scpi_slug)
    JOIN maximus_agents.scpi_candidate_final_audit a USING(scpi_slug)
    WHERE r.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND u.lifecycle='candidate' AND NOT u.publication_authorized
      AND a.audit_status='pending' AND NOT r.frontend_contract_smoke_passed)<>4
 THEN RAISE EXCEPTION 'Private candidate review state changed, must reverify'; END IF;

 UPDATE maximus_agents.scpi_candidate_final_review r
  SET review_evidence=COALESCE(r.review_evidence,'{}'::jsonb) ||
   jsonb_build_object('private_chromium_acceptance_2026_10_17',
     jsonb_build_object(
       'verification_kind','actual_ephemeral_staging_chromium_run_not_a_financial_or_publication_signoff',
       'actual_run_url','https://github.com/Speedcup212/maximus-scpi/actions/runs/39021335373',
       'github_run_id',39021335373,
       'commit_sha','906eb9a413ebc8a444b06473d70ff31cefa501e1',
       'artifact_id',12097101261,
       'artifact_name','corum-private-browser-39021335373',
       'artifact_zip_sha256','3e56be22006320fe5b22f6012c2c8a08fa293d382fa83eb4d14f5f2969f62c59',
       'github_run_completed_success',true,
       'checks_passed',28,
       'fund_specific_cases',24,
       'shared_cases',4,
       'environment','GitHub Actions private CI-only 65-SCPI preview (61 public base + four candidate overlay)',
       'scope_limits','Test matrix checks pages, sitemap, comparator, analysis modal/radar, liquidity and representative shared flows; does not independently approve tax, legal DIC details, true authenticated client holding or production HTML.',
       'independent_legal_financial_review',false,
       'production_smoke',false,
       'release_authorized',false))
 WHERE r.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
   AND r.review_evidence->'private_chromium_acceptance_2026_10_17' IS NULL;
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>4 THEN RAISE EXCEPTION 'Expected to document 4 new browser proofs, got %',changed; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
   WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
     AND final_release_ready)
 THEN RAISE EXCEPTION 'Browser test alone cannot imply financial signoff'; END IF;
END $browser_proof$;