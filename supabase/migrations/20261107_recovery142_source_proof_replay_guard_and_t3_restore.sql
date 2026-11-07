-- RECOVERY-142: last-write-wins replay protection for high-proof TOF.
-- Incident confirmed on 2026-11-07: Buro 2026-T3 PDF SHA/page TOF=91.37
-- had been restored, then a lower-quality automated replay rewrote its
-- certificate to obsolete 0.07 (a "vacant restructuring" subcomponent).
-- Existing manual-history guard did NOT check auto_verified_dual_pdf_evidence.
-- Preserve independently verified history / issuer SHA against ANY later
-- lower-confidence conflicting insertion or update. No security bypass.

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
    RAISE EXCEPTION 'INDEPENDENT_TOF_SOURCE_REPLAY_REJECTED_FOR_%_%',
      NEW.scpi_slug,NEW.source_period;
  END IF;
  RETURN NEW;
END;
$rec142_replay$;

DROP TRIGGER IF EXISTS trg_a0_guard_proven_tof_certificate_replay
ON public.scpi_metric_certifications;
CREATE TRIGGER trg_a0_guard_proven_tof_certificate_replay
BEFORE INSERT OR UPDATE ON public.scpi_metric_certifications
FOR EACH ROW EXECUTE FUNCTION scpi_internal.guard_proven_tof_certificate_replay();

REVOKE ALL ON FUNCTION scpi_internal.guard_proven_tof_certificate_replay()
FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION scpi_internal.guard_proven_tof_certificate_replay()
TO service_role;

-- Restore the T3 certified source, exactly as in RECOVERY-137, provided
-- its independent history & matching source are still intact.
DO $rec142_restore$
DECLARE
 c public.scpi_metric_certifications%ROWTYPE;
 h public.scpi_indicator_history%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE;
 changed integer;
BEGIN
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
 WHERE scpi_slug='buroboutic-metropoles' AND source_period='2026-T3'
   AND id='2f9ace9b-cdff-412c-b050-6d59eda108a7'::uuid
   AND tof=91.37 AND qa_status='auto_verified_dual_pdf_evidence'
   AND source_confidence>=0.95
   AND metric_provenance->'tof'->>'sha256'=
       '5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d';

 SELECT * INTO STRICT b FROM public.scpi_bulletins
 WHERE scpi_slug=h.scpi_slug AND period=h.source_period
   AND source_url=h.source_url
   AND pdf_sha256='5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d';

 SELECT * INTO STRICT c FROM public.scpi_metric_certifications
 WHERE id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
   AND scpi_slug=h.scpi_slug AND source_period=h.source_period
   AND metric='tof' AND source_url=h.source_url
   AND value_numeric=0.07
   AND verification_status='invalid_tof_subcomponent_not_occupancy'
   AND verification_method='blocked_vacancy_subcomponent_label'
   AND extraction_confidence=0 AND source_page=4;

 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
 (event_key,reason,snapshot) VALUES
 ('recovery142:buroboutic-T3-replay-rejection-and-source-restore',
  'Detected post-certification regression: an issuer-sourced 91.37% TOF was overwritten with false 0.07%. Original bad certificate and true source-backed history preserved. Replay trigger now blocks downgrade.',
  jsonb_build_object('old_certificate',to_jsonb(c),
    'verified_history',to_jsonb(h),'bulletin',to_jsonb(b),
    'prior_recovery','recovery137:buroboutic-2026-T3-tof-91.37-original-issuer'))
 ON CONFLICT(event_key) DO NOTHING;

 UPDATE public.scpi_metric_certifications cert
 SET value_numeric=91.37,
     source_page=4,
     verification_status='auto_verified_with_evidence',
     verification_method='pdf_page_text_match_dual_mupdf_poppler',
     extraction_confidence=0.98,
     verified_at=now(),
     evidence_text=
       'Buroboutic Metropoles | bulletin trimestriel officiel 2026-T3, page 4/6. '||
       'Taux d''Occupation Financier (TOF) 3eme trimestre 2026 : 91,37 %. '||
       'Le taux du T2 est 91,56 %. La ligne 0,07 % est seulement la composante '||
       'locaux vacants en restructuration integres au TOF sous conditions; '||
       'elle ne constitue pas le TOF. Independent MuPDF + Poppler and visual '||
       'page inspection. SHA256=5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d; '||
       'source Actions 42377472006, artifact 13575957579. No human signoff asserted.'
 WHERE cert.id=c.id AND cert.value_numeric=0.07
   AND cert.verification_status='invalid_tof_subcomponent_not_occupancy';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>1 THEN RAISE EXCEPTION 'BURO_T3_RESTORATION_EXACT_MATCH_FAILURE'; END IF;

 IF NOT EXISTS(
  SELECT 1 FROM public.scpi_metric_certifications cert
  WHERE cert.id=c.id AND cert.value_numeric=h.tof
    AND cert.verification_status='auto_verified_with_evidence'
    AND cert.extraction_confidence>=0.95 AND cert.source_page=4
 ) THEN RAISE EXCEPTION 'BURO_T3_SOURCE_REPLAY_RESTORE_REJECTED'; END IF;
END $rec142_restore$;
