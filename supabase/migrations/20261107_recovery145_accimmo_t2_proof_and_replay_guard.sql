-- RECOVERY-145 part 2: Reuse the existing private, RLS-protected
-- independent geometric TOF proof ledger. Exact Accimmo quarter only.
-- This creates a cryptographic/source-linked QA predicate, NOT a blanket
-- exemption from manual reviewer rules for previously quarantined TOFs.
CREATE OR REPLACE FUNCTION scpi_internal.accimmo_t2_exact_tof_proof_valid(
  p_slug text,p_period text,p_url text,p_value numeric,p_page integer
) RETURNS boolean
LANGUAGE sql STABLE SET search_path TO ''
AS $accimmo_proof$
SELECT coalesce(exists(
 SELECT 1
 FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
 JOIN public.scpi_bulletins b
  ON b.scpi_slug=ev.scpi_slug AND b.period=ev.source_period
  AND b.source_url=ev.source_url AND b.pdf_sha256=ev.pdf_sha256
 JOIN storage.objects so ON so.bucket_id='scpi-bulletins' AND so.name=b.pdf_path
 JOIN public.scpi_metric_certifications c ON c.id=ev.certificate_id
  AND c.scpi_slug=ev.scpi_slug AND c.source_period=ev.source_period
  AND c.source_url=ev.source_url AND c.metric='tof'
  AND c.value_numeric=ev.value_percent AND c.source_page=ev.source_page
 JOIN public.scpi_indicator_history h ON h.scpi_slug=ev.scpi_slug
  AND h.source_period=ev.source_period AND h.source_url=ev.source_url
 WHERE ev.scpi_slug='accimmo-pierre' AND ev.source_period='2026-T2'
  AND ev.source_url='https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCIMMO%20PIERRE_BT_FR_T2%202026_DEF.pdf'
  AND ev.pdf_sha256='2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20'
  AND ev.value_percent=87.44 AND ev.source_page=2 AND ev.pdf_byte_size=1273352
  AND ev.scpi_slug=p_slug AND ev.source_period=p_period
  AND ev.source_url=p_url AND ev.value_percent=p_value AND ev.source_page=p_page
  AND ev.human_attestation=false
  AND ev.workflow_reference='github-actions:42390022740'
  AND ev.artifact_id='13580978353'
  AND so.metadata->>'size'='1273352'
  AND b.id='497c6e39-0565-475d-a330-c63ccfcba98e'::uuid
  AND h.id='97301791-9f71-4350-9048-caf6ebce3dcc'::uuid
  AND h.tof=87.44 AND h.qa_status='source_verified_delegated_review'
  AND h.source_confidence>=0.95
  AND h.metric_provenance->'tof'->>'sha256'=ev.pdf_sha256
  AND h.metric_provenance->'tof'->>'source_page'='2'
  AND h.metric_provenance->'tof'->>'human_attestation'='false'
  AND c.verification_status='auto_verified_with_evidence'
  AND c.verification_method='pdf_page_text_match_dual_mupdf_poppler'
  AND c.extraction_confidence>=0.95
  AND scpi_internal.tof_bulletin_source_rejection_reason(
    c.scpi_slug,c.source_url,c.evidence_text,
    c.verification_method,c.verification_status) IS NULL
  AND ev.detailed_evidence->>'status'='independent_geometric_qa_pass'
  AND ev.detailed_evidence->>'financial_certification_universal'='false'
  AND ev.detailed_evidence->>'human_attestation'='false'
  AND ev.detailed_evidence->>'reporting_basis'='taux_occupation_financier_ce_trimestre'
  AND (ev.detailed_evidence->>'distinct_publisher_key_figure')::numeric=87.03
  AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
  AND (ev.detailed_evidence->>'page_count')::integer=7
  AND (ev.detailed_evidence->>'source_page')::integer=2
  AND ev.detailed_evidence->'readers'='["MuPDF-geometry","Poppler-bbox"]'::jsonb
  AND (ev.detailed_evidence->'mupdf_geometry'->>'value_percent')::numeric=87.44
  AND (ev.detailed_evidence->'poppler_geometry'->>'value_percent')::numeric=87.44
  AND (ev.detailed_evidence->'mupdf_geometry'->>'page')::integer=2
  AND (ev.detailed_evidence->'poppler_geometry'->>'page')::integer=2
  AND (ev.detailed_evidence->'mupdf_geometry'->'word_rect'->>0)::numeric=130.96
  AND (ev.detailed_evidence->'poppler_geometry'->'word_rect'->>0)::numeric=130.96
  AND (ev.detailed_evidence->'mupdf_geometry'->'word_rect'->>1)::numeric=435.63
  AND (ev.detailed_evidence->'poppler_geometry'->'word_rect'->>1)::numeric=435.63
),false)
$accimmo_proof$;

REVOKE ALL ON FUNCTION scpi_internal.accimmo_t2_exact_tof_proof_valid(
 text,text,text,numeric,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.accimmo_t2_exact_tof_proof_valid(
 text,text,text,numeric,integer) TO service_role;

-- Extend, do not replace, the existing issuer-hash replay guard:
-- two independent Buro T1/T2 certificates and proven T3 continue to use
-- their prior protections. The only addition is the exact Accimmo T2
-- source-geometry proof. Weak INSERT gets skipped, weak UPDATE retains OLD.
CREATE OR REPLACE FUNCTION scpi_internal.guard_proven_tof_certificate_replay()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $rec142_replay$
DECLARE
  h record;
  safe_new boolean;
BEGIN
  IF NEW.metric <> 'tof' THEN RETURN NEW; END IF;
  SELECT hist.tof,hist.source_url,hist.qa_status,hist.source_confidence,
         hist.metric_provenance->'tof'->>'sha256' AS proof_sha,
         (hist.metric_provenance->'tof'->>'source_page')::integer AS proof_page,
         b.pdf_sha256,b.source_url AS bulletin_url
  INTO h
  FROM public.scpi_indicator_history hist
  JOIN public.scpi_bulletins b
   ON b.scpi_slug=hist.scpi_slug AND b.period=hist.source_period
  WHERE hist.scpi_slug=NEW.scpi_slug AND hist.source_period=NEW.source_period
    AND (
      hist.qa_status IN ('auto_verified_dual_pdf_evidence',
        'independent_verified_official_geometric_pdf_page4')
      OR (
        hist.scpi_slug='accimmo-pierre'
        AND hist.source_period='2026-T2'
        AND hist.qa_status='source_verified_delegated_review'
        AND scpi_internal.accimmo_t2_exact_tof_proof_valid(
          hist.scpi_slug,hist.source_period,hist.source_url,hist.tof,
          (hist.metric_provenance->'tof'->>'source_page')::integer)
      )
    )
    AND hist.source_confidence>=0.95 AND hist.tof IS NOT NULL
  ORDER BY hist.snapshot_at DESC
  LIMIT 1;

  IF NOT FOUND OR h.proof_sha IS NULL
    OR h.proof_sha<>h.pdf_sha256 OR h.source_url<>h.bulletin_url
    OR h.proof_page IS NULL OR h.proof_page<1
  THEN RETURN NEW; END IF;

  safe_new:=NEW.value_numeric IS NOT DISTINCT FROM h.tof
    AND NEW.source_url=h.source_url
    AND NEW.source_page=h.proof_page
    AND NEW.verification_status IN (
      'auto_verified_with_evidence','independent_verified_official_geometric_pdf')
    AND COALESCE(NEW.extraction_confidence,0)>=0.95;

  IF NOT safe_new THEN
    -- Ignore weaker rewrites to a previously source-certified record. This
    -- protects data integrity while allowing the scheduler to continue.
    IF TG_OP='UPDATE' THEN RETURN OLD; END IF;
    -- INSERT ... ON CONFLICT executes BEFORE INSERT BEFORE deciding whether
    -- to run its UPDATE branch. Skip ONLY the stale uncertified TOF row;
    -- do not abort the entire independent financial analysis refresh.
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$rec142_replay$;



-- The strict crash-test must regress to FAIL when the exact archived
-- independent proof is removed or tampered with, even though the certificate
-- text and confidence could otherwise still appear acceptable.
DO $accimmo_strict_view$
DECLARE
  old_view text;
  needle text:='THEN ''PASS_100''::text';
  verified_predicate text;
  occurrences integer;
BEGIN
 old_view:=pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true);
 occurrences:=(length(old_view)-length(replace(old_view,needle,'')))/length(needle);
 IF occurrences<>1 THEN
   RAISE EXCEPTION 'STRICT_VIEW_PASS_BRANCH_CONTRACT_CHANGED_%',occurrences;
 END IF;
 verified_predicate:=
 'AND (b.scpi_slug <> ''accimmo-pierre'' OR '||
 'scpi_internal.accimmo_t2_exact_tof_proof_valid('||
 '''accimmo-pierre'',''2026-T2'','||
 '''https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCIMMO%20PIERRE_BT_FR_T2%202026_DEF.pdf'','||
 '87.44::numeric,2)) ';
 PERFORM set_config('search_path','public,scpi_internal,maximus_agents,pg_catalog',true);
 EXECUTE 'CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS '||
   replace(old_view,needle,verified_predicate||needle);
END $accimmo_strict_view$;
