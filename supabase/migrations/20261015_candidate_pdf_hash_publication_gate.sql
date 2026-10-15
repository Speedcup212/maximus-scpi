-- MaximusSCPI verified candidate onboarding and fail-closed publication guard.
-- Mirrors deployed Supabase state at 2026-10-15. No certified financial data mutation.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_pdf_validation (
 scpi_slug text NOT NULL,
 source_period text NOT NULL,
 document_kind text NOT NULL,
 source_url text NOT NULL,
 pdf_sha256 text NOT NULL CHECK(pdf_sha256 ~ '^[0-9a-f]{64}$'),
 page_count integer NOT NULL CHECK(page_count BETWEEN 1 AND 250),
 native_text_characters integer NOT NULL CHECK(native_text_characters>=0),
 document_identity_verified boolean NOT NULL DEFAULT false,
 identity_evidence text NOT NULL DEFAULT '',
 inspect_request_id bigint,
 validated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(scpi_slug,source_period,document_kind),
 FOREIGN KEY(scpi_slug,source_period,document_kind)
 REFERENCES maximus_agents.scpi_candidate_document_index(scpi_slug,source_period,document_kind)
);
REVOKE ALL ON maximus_agents.scpi_candidate_pdf_validation FROM PUBLIC,anon,authenticated;
ALTER TABLE maximus_agents.scpi_candidate_metric_evidence
 DROP CONSTRAINT IF EXISTS scpi_candidate_metric_evidence_source_url_check;
ALTER TABLE maximus_agents.scpi_candidate_metric_evidence
 ADD CONSTRAINT scpi_candidate_metric_evidence_source_url_check
 CHECK(source_url LIKE 'https://www.corum.fr/%' OR source_url LIKE 'https://reim.bnpparibas-am.com/%');
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_release_members (
 scpi_slug text PRIMARY KEY REFERENCES maximus_agents.scpi_universe(scpi_slug),
 enrolled_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON maximus_agents.scpi_candidate_release_members FROM PUBLIC,anon,authenticated;
INSERT INTO maximus_agents.scpi_candidate_release_members(scpi_slug)
 SELECT scpi_slug FROM maximus_agents.scpi_universe WHERE lifecycle='candidate'
 ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION maximus_agents.scpi_ocr_preflight_reason(s text, per text, kind text, src text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
DECLARE y integer;
BEGIN
 IF kind='annual_report' AND per ~ '^20[0-9]{2}-RA$' THEN
  y:=substring(per,1,4)::int;
  IF EXISTS(
   SELECT 1 FROM public.scpi_annual_reports a
   JOIN public.scpi_annual_fundamentals f ON f.scpi_slug=a.scpi_slug AND f.fiscal_year=a.fiscal_year
   WHERE a.scpi_slug=s AND a.fiscal_year=y AND a.source_url=src
    AND f.source_report_id=a.id AND f.source_url=a.source_url
    AND f.qa_status LIKE 'manual_verified%'
    AND num_nonnulls(f.revenus_par_part,f.resultat_courant_par_part,
      f.distribution_totale_par_part,f.valeur_reconstitution_par_part,
      f.valeur_realisation_par_part,f.endettement_pct)>=3
    AND f.evidence IS NOT NULL AND f.evidence<>'{}'::jsonb
  ) THEN RETURN 'skipped_existing_verified'; END IF;
  IF EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_document_index d
    WHERE d.scpi_slug=s AND d.source_period=per AND d.document_kind=kind
      AND d.direct_document_url=src AND d.review_note LIKE 'OCR_REQUIRED:%')
  THEN RETURN 'needs_extraction'; END IF;
  IF EXISTS(
   SELECT 1 FROM maximus_agents.scpi_candidate_pdf_validation p
   WHERE p.scpi_slug=s AND p.source_period=per AND p.document_kind=kind
    AND p.source_url=src AND p.document_identity_verified
    AND p.native_text_characters>=1000 AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'
    AND (SELECT count(DISTINCT e.metric)
         FROM maximus_agents.scpi_candidate_metric_evidence e
         WHERE e.scpi_slug=s AND e.source_period=per AND e.document_kind=kind
          AND e.source_url=src AND e.qa_status='qa_pass'
          AND e.independently_reviewed_at IS NOT NULL
          AND e.source_page BETWEEN 1 AND p.page_count)>=4
   ) THEN RETURN 'skipped_existing_extraction'; END IF;
  IF EXISTS(
   SELECT 1 FROM public.scpi_annual_reports a WHERE a.scpi_slug=s AND a.fiscal_year=y
    AND a.source_url=src AND a.processed_at IS NOT NULL
    AND jsonb_typeof(a.extraction_json->'metrics')='object'
    AND a.extraction_json->'metrics'<>'{}'::jsonb
    AND coalesce(a.extraction_json->>'ocr_status','')<>'needs_ocr'
  ) THEN RETURN 'skipped_existing_extraction'; END IF;
 ELSIF kind='quarterly_bulletin' AND per ~ '^20[0-9]{2}-T[1-4]$' THEN
  IF EXISTS(
   SELECT 1 FROM public.scpi_bulletins b WHERE b.scpi_slug=s AND b.period=per
    AND b.source_url=src AND b.pdf_sha256 IS NOT NULL
    AND b.qa_status IN ('historical_auto_verified','auto_verified',
      'auto_verified_product_period_tof','auto_verified_product_alias_period_tof')
    AND EXISTS(SELECT 1 FROM public.scpi_metric_certifications c
      WHERE c.bulletin_id=b.id AND c.source_page IS NOT NULL
        AND c.verification_status='auto_verified_with_evidence')
  ) THEN RETURN 'skipped_existing_verified'; END IF;
  IF EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_document_index d
    WHERE d.scpi_slug=s AND d.source_period=per AND d.document_kind=kind
      AND d.direct_document_url=src AND d.review_note LIKE 'OCR_REQUIRED:%')
  THEN RETURN 'needs_extraction'; END IF;
  IF EXISTS(
    SELECT 1 FROM public.scpi_bulletins b WHERE b.scpi_slug=s AND b.period=per
      AND b.source_url=src AND b.pdf_sha256 IS NOT NULL
      AND jsonb_typeof(b.extraction_json->'metrics')='object'
      AND b.extraction_json->'metrics'<>'{}'::jsonb
      AND b.qa_status IN ('historical_auto_partial','auto_partial','auto_partial_review')
      AND NOT EXISTS(
        SELECT 1 FROM public.scpi_ingestion_events e
        WHERE e.scpi_slug=b.scpi_slug AND e.source_period=b.period
          AND e.bulletin_url=b.source_url AND e.step='edge_ocr_pending')
  ) THEN RETURN 'skipped_existing_extraction'; END IF;
 END IF;
 RETURN 'needs_extraction';
END;
$function$
;

CREATE OR REPLACE FUNCTION maximus_agents.scpi_enroll_future_candidates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF NEW.lifecycle='candidate' THEN
  INSERT INTO maximus_agents.scpi_candidate_release_members(scpi_slug)
  VALUES (NEW.scpi_slug) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END;$function$
;
REVOKE ALL ON FUNCTION maximus_agents.scpi_enroll_future_candidates() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS scpi_enroll_release_candidates ON maximus_agents.scpi_universe;
CREATE TRIGGER scpi_enroll_release_candidates
 AFTER INSERT OR UPDATE OF lifecycle ON maximus_agents.scpi_universe
 FOR EACH ROW EXECUTE FUNCTION maximus_agents.scpi_enroll_future_candidates();

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_publication_gate_v1 AS
 SELECT u.scpi_slug,
    u.name,
    u.stage,
    u.lifecycle,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.document_kind = 'annual_report'::text AND p.source_period = '2025-RA'::text AND p.document_identity_verified AND p.native_text_characters > 1000 AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'::text)) AS annual_2025_sha_verified,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.document_kind = 'quarterly_bulletin'::text AND p.source_period = '2026-T2'::text AND p.document_identity_verified AND p.native_text_characters > 1000 AND p.pdf_sha256 ~ '^[0-9a-f]{64}$'::text)) OR (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_ocr_jobs j
          WHERE j.scpi_slug = u.scpi_slug AND j.document_kind = 'quarterly_bulletin'::text AND j.source_period = '2026-T2'::text AND j.status = 'done'::text AND j.pdf_sha256 ~ '^[0-9a-f]{64}$'::text AND j.text_characters > 1000 AND j.total_pages >= 1)) AS quarter_2026_t2_sha_verified,
    ( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2025-RA'::text AND e.document_kind = 'annual_report'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page > 0) AS annual_fields_qa_pass,
    ( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.document_kind = 'quarterly_bulletin'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL AND e.source_page > 0) AS quarter_fields_qa_pass,
    ( SELECT count(DISTINCT
                CASE
                    WHEN e.metric = ANY (ARRAY['nombre_parts'::text, 'prix_souscription'::text, 'distribution_brute_par_part'::text, 'tof'::text, 'tof_quarterly'::text, 'parts_attente_retrait'::text]) THEN
                    CASE
                        WHEN e.metric = 'tof_quarterly'::text THEN 'tof'::text
                        ELSE e.metric
                    END
                    ELSE NULL::text
                END) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.document_kind = 'quarterly_bulletin'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL) AS quarterly_core_qa_coverage,
    (EXISTS ( SELECT 1
           FROM scpi_source_registry r
          WHERE r.scpi_slug = u.scpi_slug AND r.verification_status = 'verified'::text AND r.confidence_level = 'high'::text AND r.dic_url ~~ 'https://%'::text AND r.note_information_url ~~ 'https://%'::text AND r.annual_report_url ~~ 'https://%'::text)) AS regulatory_and_source_registry_verified,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.source_period = '2025-RA'::text AND p.document_kind = 'annual_report'::text AND p.document_identity_verified)) AND ((EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_pdf_validation p
          WHERE p.scpi_slug = u.scpi_slug AND p.source_period = '2026-T2'::text AND p.document_kind = 'quarterly_bulletin'::text AND p.document_identity_verified)) OR (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_ocr_jobs j
          WHERE j.scpi_slug = u.scpi_slug AND j.document_kind = 'quarterly_bulletin'::text AND j.source_period = '2026-T2'::text AND j.status = 'done'::text AND j.pdf_sha256 ~ '^[0-9a-f]{64}$'::text))) AND (( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2025-RA'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL)) >= 4 AND (( SELECT count(DISTINCT e.metric) AS count
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.qa_status = 'qa_pass'::text AND e.independently_reviewed_at IS NOT NULL)) >= 5 AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'nombre_parts'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'prix_souscription'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND (e.metric = ANY (ARRAY['tof'::text, 'tof_quarterly'::text])) AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_metric_evidence e
          WHERE e.scpi_slug = u.scpi_slug AND e.source_period = '2026-T2'::text AND e.metric = 'distribution_brute_par_part'::text AND e.qa_status = 'qa_pass'::text)) AND (EXISTS ( SELECT 1
           FROM scpi_source_registry r
          WHERE r.scpi_slug = u.scpi_slug AND r.verification_status = 'verified'::text AND r.confidence_level = 'high'::text AND r.dic_url ~~ 'https://%'::text AND r.note_information_url ~~ 'https://%'::text AND r.annual_report_url ~~ 'https://%'::text)) AS release_ready
   FROM maximus_agents.scpi_universe u
     JOIN maximus_agents.scpi_candidate_release_members m USING (scpi_slug);;
REVOKE ALL ON maximus_agents.scpi_candidate_publication_gate_v1 FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION maximus_agents.scpi_guard_new_candidate_release()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE ok boolean;
BEGIN
 IF COALESCE(NEW.publication_authorized,false) AND
    (NEW.lifecycle='candidate' OR EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_release_members m WHERE m.scpi_slug=NEW.scpi_slug)) THEN
   SELECT v.release_ready INTO ok FROM maximus_agents.scpi_candidate_publication_gate_v1 v
    WHERE v.scpi_slug=NEW.scpi_slug;
   IF NOT COALESCE(ok,false) THEN
      RAISE EXCEPTION 'SCPI_CANDIDATE_RELEASE_BLOCKED: missing verified annual/quarter PDF, core financial page evidence, or official regulatory registry for %',NEW.scpi_slug USING ERRCODE='check_violation';
   END IF;
 END IF;
 RETURN NEW;
END;$function$
;
REVOKE ALL ON FUNCTION maximus_agents.scpi_guard_new_candidate_release() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS scpi_guard_new_candidate_release ON maximus_agents.scpi_universe;
CREATE TRIGGER scpi_guard_new_candidate_release BEFORE INSERT OR UPDATE
 ON maximus_agents.scpi_universe FOR EACH ROW
 EXECUTE FUNCTION maximus_agents.scpi_guard_new_candidate_release();
