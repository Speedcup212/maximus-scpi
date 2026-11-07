-- RECOVERY-143: reflect EXACT certified T2 TOF in the T2 current public
-- snapshot without copying any of the newer T3 observations into T2.
-- This is field-specific same-quarter publication, not a new SCPI admission.
-- Original source: Fiducial Gérance official Buroboutic 2026-T2 bulletin.
-- PDF original SHA 2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba.
-- T2 TOF 91.56 percent is proven by two independent geometric PDF engines.
-- The T2 public summary's other fields were already independently reviewed;
-- its prior "manual_verified_issuer_bulletin_fields_" state is preserved for
-- THESE preexisting fields, while TOF is explicitly described as independent.
-- Snapshot every NON-TOF certificate before the live trigger recursively
-- refreshes document metrics. That refresh unconditionally writes verified_at
-- even if NO field was re-verified; misleading historical revalidation dates
-- are not allowed. Preserve original timestamps and require all other fields
-- byte-identical, rather than disabling the analysis trigger.
CREATE TEMP TABLE recovery143_non_tof_before ON COMMIT DROP AS
 SELECT c.id,c.verified_at, to_jsonb(c)-'verified_at' AS immutable_fields
 FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug='buroboutic-metropoles' AND c.metric<>'tof';

DO $recovery143_live$
DECLARE
 original public.scpi_indicators%ROWTYPE;
 after_row public.scpi_indicators%ROWTYPE;
 hist public.scpi_indicator_history%ROWTYPE;
 certificate public.scpi_metric_certifications%ROWTYPE;
 bulletin public.scpi_bulletins%ROWTYPE;
 changed integer;
BEGIN
 SELECT * INTO STRICT original
 FROM public.scpi_indicators
 WHERE scpi_slug='buroboutic-metropoles'
   AND source_period='2026-T2'
   AND source_url='https://www.fiducial-gerance.fr/content/download/1410/40287?version=4'
   AND source_type='official_bulletin_extended'
   AND tof IS NULL
   AND qa_status='manual_verified_issuer_bulletin_fields_tof_unpublished_exact_value'
 FOR UPDATE;

 SELECT * INTO STRICT hist FROM public.scpi_indicator_history
 WHERE scpi_slug=original.scpi_slug
   AND source_period=original.source_period
   AND source_url=original.source_url
   AND tof=91.56
   AND qa_status='independent_verified_official_geometric_pdf_page4'
   AND metric_provenance->'tof'->>'human_attestation'='false'
   AND metric_provenance->'tof'->>'document_period'='2026-T2'
   AND metric_provenance->'tof'->>'sha256'=
       '2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba';

 SELECT * INTO STRICT certificate FROM public.scpi_metric_certifications
 WHERE scpi_slug=hist.scpi_slug
   AND source_period=hist.source_period
   AND source_url=hist.source_url AND metric='tof'
   AND value_numeric=91.56
   AND source_page=4
   AND verification_status='independent_verified_official_geometric_pdf'
   AND verification_method='pdf_page_tof_dual_geometry_sha256'
   AND extraction_confidence>=0.95;

 SELECT * INTO STRICT bulletin FROM public.scpi_bulletins
 WHERE id=original.bulletin_id
   AND scpi_slug=hist.scpi_slug
   AND period=hist.source_period
   AND source_url=hist.source_url
   AND pdf_sha256='2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba';

 IF NOT scpi_internal.independent_tof_geometric_proof_valid(
   certificate.id,certificate.scpi_slug,certificate.source_period,
   certificate.source_url,certificate.value_numeric,certificate.source_page)
 THEN RAISE EXCEPTION 'T2_CURRENT_PROOF_EXACT_BULLETIN_NOT_VALID'; END IF;

 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
 (event_key,reason,snapshot)
 VALUES (
  'recovery143:buroboutic-live-2026-T2-tof-same-period-only',
  'Publish T2 91.56% TOF only into the T2 public current snapshot. No T3 data copied into T2; the historic manual QA of other fields remains, while TOF is verified independently by PDF geometry.',
  jsonb_build_object('old_live',to_jsonb(original),
                     'certification',to_jsonb(certificate),
                     'verified_history',to_jsonb(hist),
                     'source_bulletin',to_jsonb(bulletin))
 ) ON CONFLICT(event_key) DO NOTHING;

 UPDATE public.scpi_indicators current_row
 SET tof=91.56,
     qa_status='manual_verified_issuer_fields_tof_independent_pdf_geometry',
     metric_provenance=jsonb_set(coalesce(current_row.metric_provenance,'{}'::jsonb),
        '{tof}',hist.metric_provenance->'tof',true),
     updated_at=now()
 WHERE current_row.scpi_slug=original.scpi_slug
   AND current_row.source_period=original.source_period
   AND current_row.source_url=original.source_url
   AND current_row.tof IS NULL;
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>1 THEN
   RAISE EXCEPTION 'T2_CURRENT_QUARTER_TOF_UPDATE_EXPECTED_ONE_GOT_%',changed;
 END IF;

 SELECT * INTO STRICT after_row FROM public.scpi_indicators
 WHERE scpi_slug=original.scpi_slug;
 IF after_row.tof IS DISTINCT FROM 91.56::numeric
    OR after_row.source_period<>original.source_period
    OR after_row.source_url<>original.source_url
    OR after_row.source_type<>original.source_type
    OR after_row.qa_status<>'manual_verified_issuer_fields_tof_independent_pdf_geometry'
    OR after_row.metric_provenance->'tof'
       IS DISTINCT FROM hist.metric_provenance->'tof'
    OR to_jsonb(after_row)-ARRAY['tof','qa_status','metric_provenance','updated_at']
       IS DISTINCT FROM to_jsonb(original)-ARRAY['tof','qa_status','metric_provenance','updated_at']
 THEN RAISE EXCEPTION 'T2_LIVE_UPDATE_CHANGED_UNRELATED_FIELDS_OR_PERIOD'; END IF;

 -- Full analysis refreshes must not destroy the verified historical record.
 IF NOT EXISTS (
  SELECT 1 FROM public.scpi_indicator_history h
  WHERE h.scpi_slug='buroboutic-metropoles'
    AND h.source_period='2026-T2' AND h.tof=91.56
    AND h.qa_status='independent_verified_official_geometric_pdf_page4'
    AND h.metric_provenance->'tof'->>'sha256'=
        '2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba'
 ) THEN RAISE EXCEPTION 'T2_HISTORY_DEGRADED_BY_ANALYSIS_REFRESH'; END IF;

 -- Refreshing the public summary runs a full automatic metric-certificate
 -- upsert. We may correct its synthetic verified_at rewrites ONLY if every
 -- source, value, QA status, page, evidence and bulletin id is unchanged.
 IF (SELECT count(*) FROM public.scpi_metric_certifications
     WHERE scpi_slug='buroboutic-metropoles' AND metric<>'tof')
    <> (SELECT count(*) FROM recovery143_non_tof_before)
 OR EXISTS(
    SELECT 1 FROM recovery143_non_tof_before prior
    LEFT JOIN public.scpi_metric_certifications c ON c.id=prior.id
    WHERE c.id IS NULL
      OR to_jsonb(c)-'verified_at' IS DISTINCT FROM prior.immutable_fields
 ) THEN RAISE EXCEPTION 'BURO_UNRELATED_METRIC_CERTIFICATE_WAS_MUTATED'; END IF;

 -- Restore the true original verification dates, not a synthetic date of
 -- re-processing other metrics during a one-field TOF release.
 UPDATE public.scpi_metric_certifications c
 SET verified_at=prior.verified_at
 FROM recovery143_non_tof_before prior
 WHERE c.id=prior.id
   AND c.verified_at IS DISTINCT FROM prior.verified_at
   AND to_jsonb(c)-'verified_at'=prior.immutable_fields;
 IF EXISTS (
    SELECT 1 FROM recovery143_non_tof_before prior
    JOIN public.scpi_metric_certifications c ON c.id=prior.id
    WHERE c.verified_at IS DISTINCT FROM prior.verified_at
       OR to_jsonb(c)-'verified_at' IS DISTINCT FROM prior.immutable_fields
 ) THEN RAISE EXCEPTION 'BURO_METRIC_VERIFICATION_TIMESTAMPS_NOT_RESTORED'; END IF;

 -- Reject a second-order refresh that attempted to downgrade another
 -- protected TOF on the same fund (2026-T3 and 2026-T1).
 IF NOT EXISTS (
    SELECT 1 FROM public.scpi_metric_certifications c
    WHERE c.id='985d9663-2900-40ba-9a0f-2a215461ebe4'::uuid
      AND c.value_numeric=91.37
      AND c.verification_status='auto_verified_with_evidence'
      AND c.extraction_confidence>=0.95
 ) OR NOT EXISTS (
    SELECT 1 FROM public.scpi_metric_certifications c
    WHERE c.id='2a6d65bd-6101-416b-a16a-dd32f5d008a9'::uuid
      AND c.value_numeric=91.78
      AND c.verification_status='independent_verified_official_geometric_pdf'
 ) THEN RAISE EXCEPTION 'BURO_PROTECTED_TOF_DOWNGRADED_DURING_REFRESH'; END IF;
END $recovery143_live$;
