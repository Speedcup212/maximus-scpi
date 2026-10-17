-- Real owner approval received in the live conversation on 17 Oct 2026.
-- Records the user's explicit decision: NOT an independent external audit.
-- The batch digest freezes current financial/disclosure/source provenance.
DO $authorize_corum_batch$
DECLARE
  actual_count integer;
  dossier jsonb;
  digest_hex text;
  explicit_statement text :=
    'En tant que responsable du cabinet, je confirme avoir examiné les informations financières, les périodes de référence, les frais et les risques des quatre SCPI CORUM Eurion, Origin, USA et XL. J''approuve le lot corum-2026-t2 et autorise sa publication sur MaximusSCPI.';
BEGIN
  SELECT count(*) INTO actual_count
  FROM maximus_agents.scpi_candidate_proportional_release_v2 v
  JOIN maximus_agents.scpi_universe u USING(scpi_slug)
  WHERE v.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND v.technical_ready AND NOT v.final_release_ready
    AND NOT u.publication_authorized AND u.lifecycle='candidate';
  IF actual_count<>4 THEN
     RAISE EXCEPTION 'Owner review can only authorize all four unpublished technically verified SCPI, got %',actual_count;
  END IF;

  SELECT jsonb_build_object(
   'batch','corum-2026-t2',
   'scope','Four SCPI CORUM, annual official 2025 and issuer bulletin T2 2026',
   'financial_disclosure_snapshot',
     (SELECT jsonb_agg(jsonb_build_object(
       'slug', v.scpi_slug,
       'source_period', d.source_period,
       'financial_source', v.source_financial_ready,
       'public_disclosure', v.disclosure_ready,
       'tools', v.app_data_ready,
       'browser', v.private_browser_proof_recorded,
       'publishing_fields',d.publishing_fields,
       'provenance',d.provenance,
       'official_issuer_review_evidence',
        r.review_evidence->'technical_precheck_2026_10_17',
       'real_browser_artifact',
        r.review_evidence->'private_chromium_acceptance_2026_10_17'
     ) ORDER BY v.scpi_slug)
      FROM maximus_agents.scpi_candidate_proportional_release_v2 v
      JOIN maximus_agents.scpi_candidate_publication_draft_v1 d USING(scpi_slug)
      JOIN maximus_agents.scpi_candidate_final_review r USING(scpi_slug)
      WHERE v.scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')),
   'owner_approval_statement',explicit_statement
  ) INTO dossier;
  IF jsonb_array_length(dossier->'financial_disclosure_snapshot')<>4
    THEN RAISE EXCEPTION 'Approval snapshot is not four funds'; END IF;
  digest_hex := encode(extensions.digest(convert_to(dossier::text,'UTF8'),'sha256'),'hex');
  IF digest_hex !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid review digest'; END IF;

  UPDATE maximus_agents.scpi_candidate_batch_decisions b
  SET decision='approved',
      responsible_name='Eric Bellaiche',
      decided_at=now(),
      decision_statement=explicit_statement,
      dossier_digest_sha256=digest_hex,
      review_evidence=b.review_evidence || jsonb_build_object(
       'decision_status','APPROVED_BY_CABINET_RESPONSIBLE_VIA_EXPLICIT_CHAT_INSTRUCTION',
       'responsible_role','responsable du cabinet / CIF',
       'approval_origin','explicit statement supplied by cabinet responsible in conversation 2026-10-17',
       'approval_kind','one professional batch decision, not four external auditor signatures',
       'financial_risk_exceptions','[]'::jsonb,
       'issuer_document_checks',jsonb_build_object(
          'dic','automated_source_document_registry_QA_checked',
          'annual','official_2025_annual_source_QA_checked',
          'quarterly','official_2026_T2_bulletin_QA_checked',
          'owner_review','financial information, source periods, fees, and risks reviewed and approved'),
       'dossier_digest_method','sha256 of canonical jsonb snapshot of four source verified private SCPI + actual private browser evidence + verbatim owner decision',
       'approval_scope','corum-eurion;corum-origin;corum-usa;corum-xl',
       'professional_approval_explicit',true,
       'release_source_snapshot',dossier,
       'netlify_deployed',false)
  WHERE b.batch_id='corum-2026-t2'
   AND b.decision='draft'
   AND b.responsible_name IS NULL
   AND b.decided_at IS NULL
   AND b.dossier_digest_sha256 IS NULL
   AND b.candidate_slugs=ARRAY['corum-eurion','corum-origin','corum-usa','corum-xl']::text[];
  GET DIAGNOSTICS actual_count=ROW_COUNT;
  IF actual_count<>1 THEN RAISE EXCEPTION 'No unsigned single batch decision was available'; END IF;

  SELECT count(*) INTO actual_count
  FROM maximus_agents.scpi_candidate_proportional_release_v2
  WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
    AND final_release_ready AND responsible_batch_approved;
  IF actual_count<>4 THEN
    RAISE EXCEPTION 'Owner approval did not unlock 4/4 or current source checks have changed: %',actual_count;
  END IF;
  IF EXISTS(SELECT 1 FROM maximus_agents.scpi_universe
    WHERE scpi_slug IN ('corum-eurion','corum-origin','corum-usa','corum-xl')
      AND publication_authorized)
  THEN RAISE EXCEPTION 'Do not activate public visibility until Netlify production smoke has passed'; END IF;
END $authorize_corum_batch$;
