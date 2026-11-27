-- MaximusSCPI RECOVERY-226 - evidence-bound SQL guards (source of truth)
-- Exported verbatim from the live verified PostgreSQL functions on 2026-11-17.
-- No changes to status thresholds; no human attestation or metric mutations.

CREATE OR REPLACE FUNCTION scpi_internal.buroboutic_t3_tof_proof_valid(p_certificate_id uuid, p_slug text, p_period text, p_url text, p_value numeric, p_page integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  SELECT COALESCE(EXISTS(
    SELECT 1
    FROM maximus_agents.scpi_independent_tof_geometry_proofs ev
    JOIN public.scpi_bulletins b
      ON b.scpi_slug=ev.scpi_slug AND b.period=ev.source_period
      AND b.source_url=ev.source_url AND b.pdf_sha256=ev.pdf_sha256
    JOIN storage.objects stored
      ON stored.bucket_id='scpi-bulletins' AND stored.name=b.pdf_path
    JOIN public.scpi_indicator_history hist
      ON hist.scpi_slug=ev.scpi_slug AND hist.source_period=ev.source_period
      AND hist.source_url=ev.source_url
    WHERE ev.certificate_id=p_certificate_id
      AND ev.scpi_slug=p_slug AND ev.scpi_slug='buroboutic-metropoles'
      AND ev.source_period=p_period AND ev.source_period='2026-T3'
      AND ev.source_url=p_url
      AND ev.value_percent=p_value AND ev.value_percent=91.37
      AND ev.source_page=p_page AND p_page=4
      AND ev.human_attestation=false
      AND ev.pdf_sha256='5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d'
      AND ev.pdf_byte_size=1585023 AND stored.metadata->>'size'=ev.pdf_byte_size::text
      AND ev.workflow_reference='github-actions:44098525999'
      AND ev.artifact_id='14333799941'
      AND b.qa_status NOT LIKE 'invalid%'
      AND hist.tof=ev.value_percent AND hist.source_confidence>=.95
      AND hist.metric_provenance->'tof'->>'sha256'=ev.pdf_sha256
      AND hist.metric_provenance->'tof'->>'source_page'=ev.source_page::text
      AND ev.detailed_evidence->>'status'='independent_geometric_qa_pass'
      AND ev.detailed_evidence->>'financial_certified'='false'
      AND ev.detailed_evidence->>'human_attestation'='false'
      AND ev.detailed_evidence->>'deploy_allowed'='false'
      AND ev.detailed_evidence->>'sha256'=ev.pdf_sha256
      AND ev.detailed_evidence->>'period'=ev.source_period
      AND ev.detailed_evidence->>'original_issuer_url'=ev.source_url
      AND ev.detailed_evidence->>'issuer_redirect_independently_observed'='true'
      AND ev.detailed_evidence->'readers'='["MuPDF-geometry","Poppler-bbox"]'::jsonb
      AND (ev.detailed_evidence->'mupdf_geometry'->>'value_percent')::numeric=ev.value_percent
      AND (ev.detailed_evidence->'poppler_geometry'->>'value_percent')::numeric=ev.value_percent
      AND (ev.detailed_evidence->'mupdf_geometry'->>'page')::integer=4
      AND (ev.detailed_evidence->'poppler_geometry'->>'page')::integer=4
      AND ev.detailed_evidence->'mupdf_geometry'->>'caption_quarter'='2026-T3'
      AND ev.detailed_evidence->'poppler_geometry'->>'caption_quarter'='2026-T3'
      AND ev.detailed_evidence->'mupdf_geometry'->>'distinct_from_vacancy_legend'='true'
      AND ev.detailed_evidence->'poppler_geometry'->>'distinct_from_vacancy_legend'='true'
      AND abs((ev.detailed_evidence->'mupdf_geometry'->'value_position'->>0)::numeric
        -(ev.detailed_evidence->'poppler_geometry'->'value_position'->>0)::numeric)<1
      AND abs((ev.detailed_evidence->'mupdf_geometry'->'value_position'->>1)::numeric
        -(ev.detailed_evidence->'poppler_geometry'->'value_position'->>1)::numeric)<1
      AND abs((ev.detailed_evidence->'mupdf_geometry'->'value_position'->>0)::numeric -321.95)<1
      AND abs((ev.detailed_evidence->'poppler_geometry'->'value_position'->>1)::numeric -641.52)<1
  ),FALSE);
$function$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_reviewed_metric_rejection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  decided_status text;
begin
  if NEW.verification_status ilike 'manual_verified%' then
    return NEW;
  end if;


  -- RECOVERY-226: one source-proofed, non-human appeal of a rejected
  -- Buroboutic TOF certificate. The original general rejection logic
  -- remains intact for ALL other certificates and for weak evidence.
  IF TG_OP='UPDATE' AND OLD.metric='tof'
     AND OLD.scpi_slug='buroboutic-metropoles'
     AND OLD.source_period IN ('2026-T2','2026-T3')
     AND OLD.verification_status ~ '^(rejected|invalid)_'
     AND NEW.id=OLD.id
     AND NEW.scpi_slug=OLD.scpi_slug
     AND NEW.source_period=OLD.source_period
     AND NEW.metric=OLD.metric
     AND NEW.verification_status='independent_verified_official_geometric_pdf'
     AND NEW.verification_method='pdf_page_tof_dual_geometry_sha256'
     AND COALESCE(NEW.extraction_confidence,0)>=0.95
     AND NEW.source_page=4
     AND NEW.value_numeric IS NOT NULL
     AND NEW.evidence_text ~* 'TOF|Taux d.Occupation Financier'
     AND (
        (OLD.id='7d248e32-826c-4222-a462-08f46a6257b4'::uuid
         AND OLD.source_period='2026-T2'
         AND scpi_internal.independent_tof_geometric_proof_valid(
            NEW.id,NEW.scpi_slug,NEW.source_period,NEW.source_url,
            NEW.value_numeric,NEW.source_page))
        OR
        (OLD.id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
         AND OLD.source_period='2026-T3'
         AND scpi_internal.buroboutic_t3_tof_proof_valid(
            NEW.id,NEW.scpi_slug,NEW.source_period,NEW.source_url,
            NEW.value_numeric,NEW.source_page))
     )
  THEN
    -- Independent geometry proof is NOT a manual attestation.
    RETURN NEW;
  END IF;

  if TG_OP = 'UPDATE'
     and OLD.verification_status ~ '^(rejected|invalid)_'
     and NEW.verification_status !~ '^(rejected|invalid)_' then
    NEW.verification_status := OLD.verification_status;
    NEW.verification_method := OLD.verification_method;
    NEW.value_numeric := OLD.value_numeric;
    NEW.value_text := OLD.value_text;
    NEW.unit := OLD.unit;
    NEW.source_url := OLD.source_url;
    NEW.source_page := OLD.source_page;
    NEW.evidence_text := OLD.evidence_text;
    NEW.bulletin_id := OLD.bulletin_id;
    return NEW;
  end if;

  if NEW.value_numeric is not null then
    select x.rejection_status into decided_status
    from scpi_internal.metric_certification_rejections x
    where x.scpi_slug = NEW.scpi_slug
      and x.source_period = NEW.source_period
      and x.metric = NEW.metric
      and x.rejected_value = NEW.value_numeric
    limit 1;
    if decided_status is not null then
      NEW.verification_status := decided_status;
      return NEW;
    end if;
  end if;

  if NEW.verification_status = 'auto_verified_with_evidence'
     and NEW.value_numeric = 0
     and NEW.metric in ('distribution_par_part', 'td', 'td_annee', 'prix_souscription', 'prix_retrait',
                        'prix_reconstitution', 'valeur_realisation', 'capitalisation', 'nombre_parts',
                        'nombre_associes', 'nombre_immeubles', 'nombre_locataires') then
    NEW.verification_status := 'review_required_zero_value';
  end if;
  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION scpi_internal.guard_proven_tof_certificate_replay()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  h record;
  safe_new boolean;
BEGIN
  -- RECOVERY-226: prevent crawler replay from downgrading exact T3
  -- Buroboutic 91.37% independent source proof to a vacancy subcomponent.
  IF TG_OP='UPDATE'
    AND OLD.id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
    AND OLD.scpi_slug='buroboutic-metropoles'
    AND OLD.source_period='2026-T3' AND OLD.metric='tof'
    AND OLD.value_numeric=91.37 AND OLD.source_page=4
    AND OLD.verification_status='independent_verified_official_geometric_pdf'
    AND scpi_internal.buroboutic_t3_tof_proof_valid(
      OLD.id,OLD.scpi_slug,OLD.source_period,OLD.source_url,OLD.value_numeric,OLD.source_page)
    AND NOT (
      NEW.value_numeric=91.37
      AND NEW.source_url=OLD.source_url
      AND NEW.source_page=4
      AND NEW.verification_status='independent_verified_official_geometric_pdf'
      AND NEW.verification_method='pdf_page_tof_dual_geometry_sha256'
      AND COALESCE(NEW.extraction_confidence,0)>=.95
    )
  THEN
    RETURN OLD;
  END IF;

  -- RECOVERY-212: protect this EXACT independent issuer-PDF TOF certificate.
  -- The ingestion crawler must not replace page-anchored PDF evidence with HTML
  -- or a certificate lacking field-level evidence. An independently verified
  -- successor can still be admitted through the original generic gate.
  IF TG_OP='UPDATE'
    AND OLD.id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'::uuid
    AND OLD.scpi_slug='iroko-atlas' AND OLD.source_period='2026-T3'
    AND OLD.metric='tof' AND OLD.value_numeric=96.65
    AND OLD.source_url='https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T3_2026.pdf'
    AND OLD.source_page=6
    AND OLD.verification_status='independent_verified_official_bulletin'
    AND OLD.verification_method='archived_issuer_pdf_two_independent_readers'
    AND NEW.verification_method IN ('html_text_match','certified_bulletin_without_field_evidence')
    AND (NEW.source_url IS DISTINCT FROM OLD.source_url
      OR NEW.source_page IS DISTINCT FROM OLD.source_page
      OR NEW.verification_status IS DISTINCT FROM OLD.verification_status)
    AND EXISTS (
      SELECT 1
      FROM public.scpi_source_registry sr
      JOIN maximus_agents.scpi_bulletin_replay_documents d
        ON d.scpi_slug=sr.scpi_slug
        AND d.source_period=sr.issuer_source_period
        AND d.pdf_sha256=sr.issuer_source_sha256
        AND d.source_url=sr.issuer_source_url
      JOIN storage.objects o ON o.bucket_id='scpi-bulletins'
        AND o.name=d.result->>'archive_path'
      WHERE sr.scpi_slug=OLD.scpi_slug
        AND sr.verification_status='verified'
        AND sr.issuer_source_period='2026-T3'
        AND sr.issuer_source_sha256='301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'
        AND d.processing_complete AND d.status='extracted'
        AND d.result->>'identity_verified'='true'
        AND d.result->>'period_verified'='true'
        AND (d.result->'evidence'->'tof'->>'page')::integer=6
        AND (d.result->'evidence'->'tof'->>'value')::numeric=96.65
        AND d.result->'evidence'->'tof'->'independent_engines'='["MuPDF","Poppler"]'::jsonb
        AND (o.metadata->>'size')::bigint=3971612)
  THEN
    RETURN OLD;
  END IF;
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
$function$;
REVOKE ALL ON FUNCTION scpi_internal.buroboutic_t3_tof_proof_valid(uuid,text,text,text,numeric,integer) FROM PUBLIC;
-- Exact read-only verification: copied separately to protect deployments.
SELECT scpi_internal.independent_tof_geometric_proof_valid(
 '7d248e32-826c-4222-a462-08f46a6257b4'::uuid,'buroboutic-metropoles','2026-T2',
 'https://www.fiducial-gerance.fr/content/download/1410/40287?version=4',91.56,4) AS t2_valid,
 scpi_internal.buroboutic_t3_tof_proof_valid(
 '985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid,'buroboutic-metropoles','2026-T3',
 'https://www.fiducial-gerance.fr/content/download/544/12625?version=14',91.37,4) AS t3_valid;
