-- One single pending responsibility record for the four-CORUM release batch.
-- No signer is invented and no public authorization is issued by this insert.
INSERT INTO maximus_agents.scpi_candidate_batch_decisions
(batch_id,candidate_slugs,decision,decision_statement,review_evidence)
VALUES (
 'corum-2026-t2',
 ARRAY['corum-eurion','corum-origin','corum-usa','corum-xl']::text[],
 'draft',
 'Décision professionnelle UNIQUE de publication à enregistrer après lecture des quatre fiches et de leurs risques.',
 jsonb_build_object(
  'technical_readiness_source',
     'maximus_agents.scpi_candidate_proportional_release_v2',
  'publisher_evidence_periods',
     jsonb_build_array('2025-RA','2026-T2'),
  'source_registry',
     'maximus_agents.scpi_candidate_publication_draft_v1',
  'browser_actual_run',
     'https://github.com/Speedcup212/maximus-scpi/actions/runs/39021335373',
  'browser_cases_completed',28,
  'financial_risk_exceptions',
     jsonb_build_array('À relire lors de la décision responsable : frais, pertes possibles, change, liquidité, périodes des performances.'),
  'issuer_document_checks',
     jsonb_build_object('dic','source_check_automated_not_professional_approval',
        'annual','source_check_automated_not_professional_approval',
        'quarterly','source_check_automated_not_professional_approval'),
  'decision_status','AWAITING_NAMED_RESPONSIBLE_PROFESSIONAL_REVIEW',
  'approval_fabricated',false,
  'netlify_deployed',false
 )
)
ON CONFLICT (batch_id) DO NOTHING;

DO $verify_draft$
DECLARE counted integer;
BEGIN
 SELECT count(*) INTO counted
 FROM maximus_agents.scpi_candidate_batch_decisions d
 WHERE d.batch_id='corum-2026-t2'
   AND d.decision='draft'
   AND d.responsible_name IS NULL
   AND d.decided_at IS NULL
   AND d.dossier_digest_sha256 IS NULL
   AND d.candidate_slugs=ARRAY['corum-eurion','corum-origin','corum-usa','corum-xl']::text[];
 IF counted<>1 THEN RAISE EXCEPTION 'Batch approval must remain unsigned (draft)'; END IF;
 IF EXISTS (
  SELECT 1 FROM maximus_agents.scpi_candidate_proportional_release_v2 v
  WHERE v.scpi_slug=ANY(ARRAY['corum-eurion','corum-origin','corum-usa','corum-xl']::text[])
    AND v.responsible_batch_approved
 ) THEN RAISE EXCEPTION 'No silent professional signoff permitted'; END IF;
END $verify_draft$;
