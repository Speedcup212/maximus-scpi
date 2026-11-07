-- RECOVERY-147 — Preserve existing Buro and Accimmo replay gates,
-- add Pierval 2026-T3 ONLY if one exact publisher PDF, archived binary,
-- independently verified page-9 geometry and one source-bound TOF certify.
-- Not a generic trust exemption for other SCPI / other quarters.
CREATE OR REPLACE FUNCTION scpi_internal.pierval_t3_exact_tof_proof_valid(
 p_slug text,p_period text,p_url text,p_value numeric,p_page integer)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO ''
AS $pierval_proof$
 SELECT coalesce(exists(
  SELECT 1
  FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
  JOIN public.scpi_bulletins b ON b.scpi_slug=ev.scpi_slug
    AND b.period=ev.source_period AND b.source_url=ev.source_url
    AND b.pdf_sha256=ev.pdf_sha256
  JOIN storage.objects so ON so.bucket_id='scpi-bulletins'
    AND so.name=b.pdf_path
  JOIN public.scpi_metric_certifications c ON c.id=ev.certificate_id
    AND c.scpi_slug=ev.scpi_slug AND c.source_period=ev.source_period
    AND c.source_url=ev.source_url AND c.metric='tof'
    AND c.value_numeric=ev.value_percent AND c.source_page=ev.source_page
  JOIN public.scpi_indicator_history h ON h.scpi_slug=ev.scpi_slug
    AND h.source_period=ev.source_period AND h.source_url=ev.source_url
  WHERE ev.scpi_slug='pierval-sante' AND ev.source_period='2026-T3'
    AND ev.scpi_slug=p_slug AND ev.source_period=p_period AND ev.source_url=p_url
    AND ev.value_percent=p_value AND ev.source_page=p_page
    AND ev.source_url='https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf'
    AND ev.pdf_sha256='823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1'
    AND ev.value_percent=91.04 AND ev.source_page=9
    AND ev.pdf_byte_size=3637582
    AND ev.human_attestation=false
    AND ev.workflow_reference='github-actions:42397568752'
    AND ev.artifact_id='13584485846'
    AND so.metadata->>'size'='3637582'
    AND b.id='596f5f03-df53-4a6c-97a9-6c53fe1af303'::uuid
    AND h.id='3dba6c62-233f-4efa-aa1b-6ac5cc74093c'::uuid
    AND h.tof=91.04 AND h.qa_status='source_verified_independent_tof_page9'
    AND h.source_confidence>=0.95
    AND h.metric_provenance->'tof'->>'sha256'=ev.pdf_sha256
    AND h.metric_provenance->'tof'->>'source_page'='9'
    AND h.metric_provenance->'tof'->>'human_attestation'='false'
    AND c.verification_status='auto_verified_with_evidence'
    AND c.verification_method='pdf_page_chart_tof_dual_mupdf_poppler_sha256'
    AND c.extraction_confidence>=0.95
    AND scpi_internal.tof_bulletin_source_rejection_reason(
      c.scpi_slug,c.source_url,c.evidence_text,
      c.verification_method,c.verification_status) IS NULL
    AND ev.detailed_evidence->>'status'='exact_binary_independent_geometry_pass'
    AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
    AND ev.detailed_evidence->>'original_issuer_url'=ev.source_url
    AND (ev.detailed_evidence->>'pdf_byte_size')::integer=3637582
    AND (ev.detailed_evidence->>'source_page')::integer=9
    AND (ev.detailed_evidence->>'page_count')::integer=12
    AND ev.detailed_evidence->>'official_cover_period_proven'='true'
    AND ev.detailed_evidence->>'official_cover_fund_proven'='true'
    AND ev.detailed_evidence->>'independent_numeric_and_layout_proven'='true'
    AND ev.detailed_evidence->>'human_attestation'='false'
    AND ev.detailed_evidence->>'automatic_publication'='false'
    AND ev.detailed_evidence->>'reporting_basis'='publisher_reported_tof_total_not_vacancy_component'
    AND (ev.detailed_evidence->>'vacant_percentage')::numeric=8.96
    AND ev.detailed_evidence->'readers'='["MuPDF-geometry","Poppler-bbox"]'::jsonb
    AND (ev.detailed_evidence->'mupdf_geometry'->>'value_percent')::numeric=91.04
    AND (ev.detailed_evidence->'poppler_geometry'->>'value_percent')::numeric=91.04
    AND (ev.detailed_evidence->'mupdf_geometry'->>'page')::integer=9
    AND (ev.detailed_evidence->'poppler_geometry'->>'page')::integer=9
    AND abs((ev.detailed_evidence->'mupdf_geometry'->'left_tof_box'->>0)::numeric-53.1496)<1
    AND abs((ev.detailed_evidence->'poppler_geometry'->'left_tof_box'->>0)::numeric-53.1496)<1
    AND abs((ev.detailed_evidence->'mupdf_geometry'->'chart_tof_box'->>0)::numeric-394.6145)<1
    AND abs((ev.detailed_evidence->'poppler_geometry'->'chart_tof_box'->>0)::numeric-394.6145)<1
    AND abs((ev.detailed_evidence->'mupdf_geometry'->'chart_tof_box'->>1)::numeric-363.9439)<1
    AND abs((ev.detailed_evidence->'poppler_geometry'->'chart_tof_box'->>1)::numeric-363.9439)<1
 ),false)
$pierval_proof$;

REVOKE ALL ON FUNCTION scpi_internal.pierval_t3_exact_tof_proof_valid(
 text,text,text,numeric,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.pierval_t3_exact_tof_proof_valid(
 text,text,text,numeric,integer) TO service_role;

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
      OR (
        hist.scpi_slug='pierval-sante'
        AND hist.source_period='2026-T3'
        AND hist.qa_status='source_verified_independent_tof_page9'
        AND scpi_internal.pierval_t3_exact_tof_proof_valid(
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



-- The existing strict view remains the same for 67 other funds.
-- The Pierval PASS requires the matching source/geometry ledger.
-- If tampered, its status reverts to FAIL_STRICT.
DO $pierval_strict$
DECLARE original text; needle text:='THEN ''PASS_100''::text';
    n integer; additional text;
BEGIN
 original:=pg_get_viewdef('public.scpi_crash_test_strict_v2'::regclass,true);
 n:=(length(original)-length(replace(original,needle,'')))/length(needle);
 IF n<>1 THEN RAISE EXCEPTION 'STRICT_VIEW_BRANCH_NOT_UNIQUE_%',n; END IF;
 IF position('scpi_internal.pierval_t3_exact_tof_proof_valid' IN original)>0 THEN
    RAISE EXCEPTION 'PIERVAL_CERT_ALREADY_ADMITTED_STOP_DUPLICATE';
 END IF;
 additional:=
 'AND (b.scpi_slug <> ''pierval-sante'' OR '||
 'scpi_internal.pierval_t3_exact_tof_proof_valid('||
 '''pierval-sante'',''2026-T3'','||
 '''https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf'','||
 '91.04::numeric,9)) ';
 PERFORM set_config('search_path','public,scpi_internal,maximus_agents,pg_catalog',true);
 EXECUTE 'CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS '||
          replace(original,needle,additional||needle);
END $pierval_strict$;
