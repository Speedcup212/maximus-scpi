-- Persist deployed Supabase candidate regulatory source audit and second-stage financial publication guard.
-- Exact annual and quarterly evidence stays private. No public financial data is modified.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_regulatory_documents (
 scpi_slug text NOT NULL REFERENCES maximus_agents.scpi_universe(scpi_slug),
 document_kind text NOT NULL CHECK(document_kind IN ('dic','note','statutes')),
 source_url text NOT NULL CHECK(source_url LIKE 'https://www.corum.fr/%' OR source_url LIKE 'https://reim.bnpparibas-am.com/%'),
 pdf_sha256 text NOT NULL CHECK(pdf_sha256 ~ '^[0-9a-f]{64}$'),
 page_count integer NOT NULL CHECK(page_count BETWEEN 1 AND 200),
 native_text_characters integer NOT NULL CHECK(native_text_characters>200),
 identity_verified boolean NOT NULL DEFAULT false,
 kind_verified boolean NOT NULL DEFAULT false,
 official_page_url text NOT NULL,
 inspect_request_id bigint,
 source_excerpt text,
 checked_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(scpi_slug,document_kind)
);
REVOKE ALL ON maximus_agents.scpi_candidate_regulatory_documents FROM PUBLIC,anon,authenticated;

CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_final_audit (
 scpi_slug text PRIMARY KEY REFERENCES maximus_agents.scpi_universe(scpi_slug),
 audit_status text NOT NULL DEFAULT 'pending'
   CHECK(audit_status IN ('pending','rejected','approved')),
 historical_consistency_pass boolean NOT NULL DEFAULT false,
 financial_coverage_pass boolean NOT NULL DEFAULT false,
 liquidity_risk_pass boolean NOT NULL DEFAULT false,
 document_regulatory_pass boolean NOT NULL DEFAULT false,
 public_display_mapping_pass boolean NOT NULL DEFAULT false,
 independent_qa_reference text,
 approved_by text,
 approved_at timestamptz,
 evidence_digest_sha256 text CHECK(evidence_digest_sha256 IS NULL OR evidence_digest_sha256 ~ '^[0-9a-f]{64}$'),
 audit_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT scpi_candidate_final_audit_approval_integrity CHECK(
 audit_status <> 'approved' OR (
 historical_consistency_pass AND financial_coverage_pass AND liquidity_risk_pass
 AND document_regulatory_pass AND public_display_mapping_pass
 AND length(btrim(coalesce(independent_qa_reference,'')))>=12
 AND length(btrim(coalesce(approved_by,'')))>=3
 AND approved_at IS NOT NULL
 AND evidence_digest_sha256 ~ '^[0-9a-f]{64}$'
 ))
);
REVOKE ALL ON maximus_agents.scpi_candidate_final_audit FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_final_release_v1 AS
 SELECT scpi_slug,
    name,
    stage,
    lifecycle,
    annual_2025_sha_verified,
    quarter_2026_t2_sha_verified,
    annual_fields_qa_pass,
    quarter_fields_qa_pass,
    quarterly_core_qa_coverage,
    regulatory_and_source_registry_verified,
    release_ready,
    (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_audit a
          WHERE a.scpi_slug = v.scpi_slug AND a.audit_status = 'approved'::text AND a.historical_consistency_pass AND a.financial_coverage_pass AND a.liquidity_risk_pass AND a.document_regulatory_pass AND a.public_display_mapping_pass AND a.approved_at IS NOT NULL AND a.evidence_digest_sha256 ~ '^[0-9a-f]{64}$'::text)) AS full_qa_pass,
    release_ready AND (EXISTS ( SELECT 1
           FROM maximus_agents.scpi_candidate_final_audit a
          WHERE a.scpi_slug = v.scpi_slug AND a.audit_status = 'approved'::text AND a.historical_consistency_pass AND a.financial_coverage_pass AND a.liquidity_risk_pass AND a.document_regulatory_pass AND a.public_display_mapping_pass AND a.approved_at IS NOT NULL AND a.evidence_digest_sha256 ~ '^[0-9a-f]{64}$'::text)) AS final_release_ready
   FROM maximus_agents.scpi_candidate_publication_gate_v1 v;;
REVOKE ALL ON maximus_agents.scpi_candidate_final_release_v1 FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION maximus_agents.scpi_guard_new_candidate_release()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE ok boolean;
BEGIN
 IF COALESCE(NEW.publication_authorized,false) AND
    (NEW.lifecycle='candidate' OR EXISTS(
      SELECT 1 FROM maximus_agents.scpi_candidate_release_members m
      WHERE m.scpi_slug=NEW.scpi_slug)) THEN
   SELECT v.final_release_ready INTO ok
   FROM maximus_agents.scpi_candidate_final_release_v1 v
   WHERE v.scpi_slug=NEW.scpi_slug;
   IF NOT COALESCE(ok,false) THEN
     RAISE EXCEPTION 'SCPI_CANDIDATE_FINAL_RELEASE_BLOCKED: verified source, complete financial/history/risk QA, and signed final audit required for %',NEW.scpi_slug
     USING ERRCODE='check_violation';
   END IF;
 END IF;
 RETURN NEW;
END;$function$
;
REVOKE ALL ON FUNCTION maximus_agents.scpi_guard_new_candidate_release() FROM PUBLIC,anon,authenticated;

-- Keep hook installed on both create and update:
DROP TRIGGER IF EXISTS scpi_guard_new_candidate_release ON maximus_agents.scpi_universe;
CREATE TRIGGER scpi_guard_new_candidate_release BEFORE INSERT OR UPDATE
 ON maximus_agents.scpi_universe FOR EACH ROW
 EXECUTE FUNCTION maximus_agents.scpi_guard_new_candidate_release();
