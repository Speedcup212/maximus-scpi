-- RECOVERY-142: independent documentary evidence registry for Buro T1/T2.
-- Source GitHub Actions run #42381361609, artifact #13577252680.
-- This registers two independently re-read issuer PDF percentages with
-- SHA256+page+quarter+layout proof. NO financial certificate is approved here.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_independent_tof_geometry_proofs (
 certificate_id uuid PRIMARY KEY REFERENCES public.scpi_metric_certifications(id),
 scpi_slug text NOT NULL,
 source_period text NOT NULL,
 source_url text NOT NULL,
 pdf_sha256 text NOT NULL CHECK(pdf_sha256 ~ '^[a-f0-9]{64}$'),
 value_percent numeric(7,3) NOT NULL CHECK(value_percent BETWEEN 70 AND 100),
 source_page integer NOT NULL CHECK(source_page > 0),
 pdf_byte_size bigint NOT NULL CHECK(pdf_byte_size > 1000),
 workflow_reference text NOT NULL,
 artifact_id text NOT NULL,
 detailed_evidence jsonb NOT NULL,
 human_attestation boolean NOT NULL DEFAULT false CHECK(human_attestation=false),
 inserted_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(scpi_slug,source_period)
);
ALTER TABLE maximus_agents.scpi_independent_tof_geometry_proofs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON maximus_agents.scpi_independent_tof_geometry_proofs FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON maximus_agents.scpi_independent_tof_geometry_proofs TO service_role;

-- Two immutable, exact-issuer admissions; new records for other issuers
-- require a separate evidence review and controlled migration.
DO $recovery142$
DECLARE inserted integer;
BEGIN
 INSERT INTO maximus_agents.scpi_independent_tof_geometry_proofs
 (certificate_id,scpi_slug,source_period,source_url,pdf_sha256,value_percent,
  source_page,pdf_byte_size,workflow_reference,artifact_id,detailed_evidence,human_attestation)
 VALUES
('2a6d65bd-6101-416b-a16a-dd32f5d008a9'::uuid,'buroboutic-metropoles','2026-T1','https://www.fiducial-gerance.fr/content/download/1334/38495?version=5','25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3',91.78,4,1770998,'github-actions:42381361609','13577252680','{"status":"independent_geometric_qa_pass","scpi_slug":"buroboutic-metropoles","period":"2026-T1","metric":"tof","value_percent":91.78,"original_issuer_url":"https://www.fiducial-gerance.fr/content/download/1334/38495?version=5","sha256":"25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3","source_page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"mupdf_geometry":{"value_percent":91.78,"page":4,"caption_quarter":"2026-T1","value_position":[320.33,609.36],"caption_center_x":326.48,"distinct_from_vacancy_legend":true},"poppler_geometry":{"value_percent":91.78,"page":4,"caption_quarter":"2026-T1","value_position":[320.34,609.36],"caption_center_x":326.48,"distinct_from_vacancy_legend":true},"financial_certified":false,"human_attestation":false,"deploy_allowed":false}'::jsonb,false),
('7d248e32-826c-4222-a462-08f46a6257b4'::uuid,'buroboutic-metropoles','2026-T2','https://www.fiducial-gerance.fr/content/download/1410/40287?version=4','2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba',91.56,4,2659100,'github-actions:42381361609','13577252680','{"status":"independent_geometric_qa_pass","scpi_slug":"buroboutic-metropoles","period":"2026-T2","metric":"tof","value_percent":91.56,"original_issuer_url":"https://www.fiducial-gerance.fr/content/download/1410/40287?version=4","sha256":"2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba","source_page":4,"readers":["MuPDF-geometry","Poppler-bbox"],"mupdf_geometry":{"value_percent":91.56,"page":4,"caption_quarter":"2026-T2","value_position":[320.33,609.36],"caption_center_x":326.48,"distinct_from_vacancy_legend":true},"poppler_geometry":{"value_percent":91.56,"page":4,"caption_quarter":"2026-T2","value_position":[320.33,609.36],"caption_center_x":326.48,"distinct_from_vacancy_legend":true},"financial_certified":false,"human_attestation":false,"deploy_allowed":false}'::jsonb,false);
 GET DIAGNOSTICS inserted=ROW_COUNT;
 IF inserted<>2 THEN RAISE EXCEPTION 'TWO_INDEPENDENT_SOURCE_PROOFS_REQUIRED_%',inserted; END IF;
 IF (
   SELECT count(*)
   FROM maximus_agents.scpi_independent_tof_geometry_proofs p
   JOIN public.scpi_bulletins b ON b.scpi_slug=p.scpi_slug
     AND b.period=p.source_period AND b.source_url=p.source_url AND b.pdf_sha256=p.pdf_sha256
   JOIN storage.objects o ON o.bucket_id='scpi-bulletins' AND o.name=b.pdf_path
   WHERE p.workflow_reference='github-actions:42381361609'
     AND p.artifact_id='13577252680'
     AND o.metadata->>'size'=p.pdf_byte_size::text
     AND p.detailed_evidence->>'status'='independent_geometric_qa_pass'
     AND p.detailed_evidence->>'financial_certified'='false'
     AND p.detailed_evidence->>'human_attestation'='false'
     AND p.detailed_evidence->>'deploy_allowed'='false'
     AND p.detailed_evidence->'mupdf_geometry'->>'caption_quarter'=p.source_period
     AND p.detailed_evidence->'poppler_geometry'->>'caption_quarter'=p.source_period
     AND (p.detailed_evidence->'mupdf_geometry'->>'value_percent')::numeric=p.value_percent
     AND (p.detailed_evidence->'poppler_geometry'->>'value_percent')::numeric=p.value_percent
 )<>2 THEN RAISE EXCEPTION 'DUAL_PDF_PROOF_AND_STORAGE_MISMATCH'; END IF;
END $recovery142$;

-- No DELETE/UPDATE privileges granted to application roles, and RLS
-- forbids public access even if a future schema exposure changes.
COMMENT ON TABLE maximus_agents.scpi_independent_tof_geometry_proofs IS
'Private binary+geometry evidence. human_attestation=false; this table is not itself a regulatory financial certification or a publication authorization.';
