-- RECOVERY-142: second, independent, exact-binary QA path for quarantined
-- TOF certificates. This is NOT a manual-review status alias. Every acceptance
-- depends on the issuer PDF and independently verified geometric page evidence.
-- All other quarantines retain existing manual certification requirements.

CREATE OR REPLACE FUNCTION scpi_internal.independent_tof_geometric_proof_valid(
 p_certificate_id uuid,p_slug text,p_period text,p_url text,
 p_value numeric,p_page integer
) RETURNS boolean
LANGUAGE sql STABLE SET search_path TO ''
AS $verified_geom$
 SELECT coalesce(exists(
  SELECT 1
  FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
  JOIN public.scpi_bulletins b
    ON b.scpi_slug=ev.scpi_slug AND b.period=ev.source_period
    AND b.source_url=ev.source_url AND b.pdf_sha256=ev.pdf_sha256
  JOIN storage.objects stored
    ON stored.bucket_id='scpi-bulletins' AND stored.name=b.pdf_path
  WHERE ev.certificate_id=p_certificate_id
    AND ev.scpi_slug=p_slug AND ev.source_period=p_period
    AND ev.source_url=p_url AND ev.value_percent=p_value
    AND ev.source_page=p_page AND p_page=4
    AND ev.human_attestation=false
    -- This pilot authorizes ONLY the two source-backed 2026 Buro quarters.
    AND ev.scpi_slug='buroboutic-metropoles'
    AND (
      (ev.source_period='2026-T1'
       AND ev.certificate_id='2a6d65bd-6101-416b-a16a-dd32f5d008a9'::uuid
       AND ev.value_percent=91.78
       AND ev.pdf_sha256='25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3')
      OR
      (ev.source_period='2026-T2'
       AND ev.certificate_id='7d248e32-826c-4222-a462-08f46a6257b4'::uuid
       AND ev.value_percent=91.56
       AND ev.pdf_sha256='2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba')
    )
    AND ev.workflow_reference='github-actions:42381361609'
    AND ev.artifact_id='13577252680'
    AND ev.pdf_sha256 ~ '^[a-f0-9]{64}$'
    AND stored.metadata->>'size'=ev.pdf_byte_size::text
    AND b.qa_status NOT LIKE 'invalid%'
    AND ev.detailed_evidence->>'status'='independent_geometric_qa_pass'
    AND ev.detailed_evidence->>'financial_certified'='false'
    AND ev.detailed_evidence->>'human_attestation'='false'
    AND ev.detailed_evidence->>'deploy_allowed'='false'
    AND ev.detailed_evidence->>'original_issuer_url'=ev.source_url
    AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
    AND ev.detailed_evidence->>'period'=ev.source_period
    AND (ev.detailed_evidence->>'source_page')::integer=ev.source_page
    AND ev.detailed_evidence->'readers'='["MuPDF-geometry","Poppler-bbox"]'::jsonb
    AND (ev.detailed_evidence->'mupdf_geometry'->>'value_percent')::numeric=ev.value_percent
    AND (ev.detailed_evidence->'poppler_geometry'->>'value_percent')::numeric=ev.value_percent
    AND (ev.detailed_evidence->'mupdf_geometry'->>'page')::integer=4
    AND (ev.detailed_evidence->'poppler_geometry'->>'page')::integer=4
    AND ev.detailed_evidence->'mupdf_geometry'->>'caption_quarter'=ev.source_period
    AND ev.detailed_evidence->'poppler_geometry'->>'caption_quarter'=ev.source_period
    AND ev.detailed_evidence->'mupdf_geometry'->>'distinct_from_vacancy_legend'='true'
    AND ev.detailed_evidence->'poppler_geometry'->>'distinct_from_vacancy_legend'='true'
    AND abs(
      (ev.detailed_evidence->'mupdf_geometry'->'value_position'->>0)::numeric -
      (ev.detailed_evidence->'poppler_geometry'->'value_position'->>0)::numeric
    )<1
    AND abs(
      (ev.detailed_evidence->'mupdf_geometry'->'value_position'->>1)::numeric -
      (ev.detailed_evidence->'poppler_geometry'->'value_position'->>1)::numeric
    )<1
 ),false)
$verified_geom$;

REVOKE ALL ON FUNCTION scpi_internal.independent_tof_geometric_proof_valid(
 uuid,text,text,text,numeric,integer
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.independent_tof_geometric_proof_valid(
 uuid,text,text,text,numeric,integer
) TO service_role;

-- Retain the FULL original issuer-host / TOF-ASPIM / vacancy checks. An
-- independently QA'ed source may be unquarantined ONLY when its exact binary
-- geometry row has been pre-registered, hash-matched and source-policy valid.
CREATE OR REPLACE FUNCTION scpi_internal.guard_tof_bulletin_source_policy()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $rec142_certificate_guard$
DECLARE
 reason text; originally_quarantined boolean;
 manual_recertification boolean; independent_recertification boolean;
BEGIN
 IF NEW.metric <> 'tof' OR NEW.value_numeric IS NULL THEN RETURN NEW; END IF;
 SELECT EXISTS(
  SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
  WHERE a.certificate_id=NEW.id
 ) INTO originally_quarantined;
 reason:=scpi_internal.tof_bulletin_source_rejection_reason(
  NEW.scpi_slug,NEW.source_url,NEW.evidence_text,
  NEW.verification_method,NEW.verification_status);
 IF reason IS NULL AND scpi_internal.tof_value_is_vacancy_component(
     NEW.evidence_text,NEW.value_numeric) THEN
    reason:='TOF_VACANCY_SUBCOMPONENT_NOT_TOTAL';
 END IF;
 manual_recertification :=
  NEW.verification_status LIKE 'manual_verified_official%'
  AND NEW.source_page>0 AND NULLIF(btrim(NEW.evidence_text),'') IS NOT NULL
  AND NEW.evidence_text ~* '(taux[[:space:]]+d.{0,3}occupation[[:space:]]+financier|TOF)'
  AND reason IS NULL;
 independent_recertification :=
  NEW.verification_status='independent_verified_official_geometric_pdf'
  AND NEW.verification_method='pdf_page_tof_dual_geometry_sha256'
  AND NEW.source_page=4 AND COALESCE(NEW.extraction_confidence,0)>=0.95
  AND NULLIF(btrim(NEW.evidence_text),'') IS NOT NULL
  AND NEW.evidence_text ~* '(taux[[:space:]]+d.{0,3}occupation[[:space:]]+financier|TOF)'
  AND reason IS NULL
  AND scpi_internal.independent_tof_geometric_proof_valid(
   NEW.id,NEW.scpi_slug,NEW.source_period,NEW.source_url,
   NEW.value_numeric,NEW.source_page);
 IF reason IS NOT NULL OR (
  originally_quarantined
  AND NOT (manual_recertification OR independent_recertification)
 ) THEN
    NEW.verification_status:='invalid_tof_bulletin_source_policy';
    NEW.verification_method:='blocked_'||coalesce(
      reason,'requires_manual_or_proven_independent_recertification_from_issuer_bulletin');
    NEW.extraction_confidence:=0;
 END IF;
 RETURN NEW;
END;
$rec142_certificate_guard$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_quarantined_tof_replay()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $rec142_history_guard$
DECLARE is_quarantined boolean;
BEGIN
 IF NEW.tof IS NULL THEN RETURN NEW; END IF;
 SELECT EXISTS(
  SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
  WHERE a.scpi_slug=NEW.scpi_slug AND a.source_period=NEW.source_period
    AND ((TG_TABLE_NAME='scpi_indicators' AND a.original_live IS NOT NULL)
      OR (TG_TABLE_NAME='scpi_indicator_history' AND a.original_history IS NOT NULL))
 ) INTO is_quarantined;
 IF NOT is_quarantined THEN RETURN NEW; END IF;
 IF NOT EXISTS(
  SELECT 1 FROM public.scpi_metric_certifications c
  WHERE c.scpi_slug=NEW.scpi_slug AND c.source_period=NEW.source_period
    AND c.metric='tof' AND c.value_numeric=NEW.tof AND c.source_url=NEW.source_url
    AND c.source_page>0 AND NULLIF(btrim(c.evidence_text),'') IS NOT NULL
    AND scpi_internal.tof_bulletin_source_rejection_reason(
       c.scpi_slug,c.source_url,c.evidence_text,c.verification_method,c.verification_status) IS NULL
    AND (
      c.verification_status LIKE 'manual_verified_official%'
      OR (
       c.verification_status='independent_verified_official_geometric_pdf'
       AND c.verification_method='pdf_page_tof_dual_geometry_sha256'
       AND c.extraction_confidence>=0.95
       AND scpi_internal.independent_tof_geometric_proof_valid(
         c.id,c.scpi_slug,c.source_period,c.source_url,c.value_numeric,c.source_page)
      )
    )
 ) THEN
   NEW.tof:=NULL;
   NEW.qa_status:='invalid_tof_bulletin_source_policy';
   NEW.source_confidence:=0;
 END IF;
 RETURN NEW;
END;
$rec142_history_guard$;

-- Replace only the ONE quarantine-status predicate, retaining every other
-- requirement in public.scpi_crash_test_strict_v2 unchanged. The view must
-- remain row-for-row identical for all SCPI other than exact Buro proofs.
DO $rec142_view$
DECLARE
 original_view text;
 target text:='certified.verification_status !~~ ''manual_verified_official%''::text';
 updated_view text;
 n integer;
BEGIN
 original_view:=pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true);
 n:=(length(original_view)-length(replace(original_view,target,'')))/length(target);
 IF n<>1 THEN RAISE EXCEPTION 'STRICT_VIEW_MANUAL_QUARANTINE_PREDICATE_EXPECTED_ONCE_GOT_%',n; END IF;
 updated_view:=replace(original_view,target,
  '(certified.verification_status !~~ ''manual_verified_official%''::text AND NOT '||
  'scpi_internal.independent_tof_geometric_proof_valid('||
  'certified.id,certified.scpi_slug,certified.source_period,certified.source_url,'||
  'certified.value_numeric,certified.source_page))');
 PERFORM set_config('search_path','public,scpi_internal,maximus_agents,pg_catalog',true);
 EXECUTE 'CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS '||updated_view;
END;
$rec142_view$;
