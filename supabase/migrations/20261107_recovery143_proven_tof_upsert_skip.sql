-- RECOVERY-143: reconcile exact-SHA TOF replay protection with Postgres
-- INSERT ... ON CONFLICT trigger execution order. Production T2 current-value
-- publishing exposed that a weak T3 source row is first offered as INSERT,
-- and RAISE would abort the entire issuer financial-analysis refresh.
-- We must SKIP that one weak INSERT (RETURN NULL), not weaken the
-- genuine verified T3 certificate or disable the guard.
-- For UPDATE, existing verified OLD row is retained unchanged.
-- Proven double-reader QA, source hash/page/issuer checks remain identical.
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
    AND hist.qa_status IN ('auto_verified_dual_pdf_evidence',
      'independent_verified_official_geometric_pdf_page4')
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


