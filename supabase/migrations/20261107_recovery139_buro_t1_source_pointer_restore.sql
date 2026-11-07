-- RECOVERY-139: repair the incorrectly overwritten T1 Buroboutic bulletin.
-- The 2026-T1 scpi_bulletins pointer currently resolves to issuer's
-- "Note d'information et statuts", NOT the quarterly bulletin.
-- TRUE issuer T1 bulletin independently retrieved and verified as:
--  https://www.fiducial-gerance.fr/content/download/1334/38495?version=5
--  SHA 25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3
--  6 pages, MuPDF+Poppler issuer identity and 2026-T1 page-4 TOF 91.78%.
-- The correct binary was ALREADY uploaded 2026-10-28 to scpi-bulletins,
-- while an edge job 2026-11-04 overwrote the pointer to a 40,549 byte
-- statutory note. Do not replace a PDF with a guessed storage path.
-- GitHub Actions source proof #42378990476, artifact #13576917342.
-- NO financial certification or QA override in this migration.
DO $recovery139$
DECLARE
  old_row public.scpi_bulletins%ROWTYPE;
  affected integer;
  correction jsonb;
BEGIN
  SELECT * INTO STRICT old_row
  FROM public.scpi_bulletins
  WHERE id='56027d89-31f6-41f5-9f70-a2ecc397be17'::uuid
    AND scpi_slug='buroboutic-metropoles'
    AND period='2026-T1'
    AND source_url='https://www.fiducial-gerance.fr/content/download/1634/43668?version=4'
    AND pdf_sha256='cdcbef9488a16eb7bba36ba6eec72cde84881ab10a558d302ec4158bdecb2278'
    AND pdf_path='buroboutic-metropoles/2026-T1/cdcbef9488a16eb7bba36ba6eec72cde84881ab10a558d302ec4158bdecb2278.pdf'
    AND qa_status='auto_partial'
    AND coalesce(extraction_json->'metrics','{}'::jsonb)='{}'::jsonb
    AND coalesce(extraction_json->'source_correction'->>'recovery_id','')<>'139';

  -- Crosscheck the correct PDF is already present in the actual storage
  -- bucket. Changing a database pointer to nonexisting bytes is prohibited.
  IF NOT EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.bucket_id='scpi-bulletins'
      AND so.name='buroboutic-metropoles/2026-T1/25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3.pdf'
      AND so.metadata->>'size'='1770998'
  ) THEN RAISE EXCEPTION 'T1_CORRECT_ISSUER_BINARY_NOT_ARCHIVED'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.bucket_id='scpi-bulletins'
      AND so.name=old_row.pdf_path
      AND so.metadata->>'size'='40549'
  ) THEN RAISE EXCEPTION 'T1_OLD_STATUTORY_SOURCE_NOT_IDENTIFIED'; END IF;

  -- No rewrite of source metrics: this repairs the true documentary identity
  -- and leaves financial QA pending. Preserve historical edge run ID.
  correction:=jsonb_build_object(
    'recovery_id','139',
    'document_kind','quarterly_bulletin',
    'reference_period','2026-T1',
    'old_source_url',old_row.source_url,
    'old_sha256',old_row.pdf_sha256,
    'old_pdf_path',old_row.pdf_path,
    'replacement_source_url','https://www.fiducial-gerance.fr/content/download/1334/38495?version=5',
    'replacement_sha256','25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3',
    'replacement_pdf_path','buroboutic-metropoles/2026-T1/25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3.pdf',
    'replacement_page_count',6,
    'readers',jsonb_build_array('MuPDF','Poppler'),
    'official_binary_run','github-actions:42378990476',
    'official_binary_artifact','13576917342',
    'financial_certified',false,
    'independent_financial_qa_pending',true,
    'revision_reason','T1 source had been overwritten by an official non-bulletin statutes PDF'
  );
  INSERT INTO maximus_agents.scpi_replay_provenance_quarantine
    (event_key,reason,snapshot)
  VALUES (
    'recovery139:buroboutic-2026-T1-wrong-statutory-bulletin-pointer',
    'Document identity correction only. Original edge ingestion overwritten T1 original bulletin with statutory note. Replacement already exists in storage and was dual-reader SHA verified.',
    jsonb_build_object('original_bulletin',to_jsonb(old_row),'correction',correction)
  ) ON CONFLICT (event_key) DO NOTHING;

  UPDATE public.scpi_bulletins b
  SET source_url='https://www.fiducial-gerance.fr/content/download/1334/38495?version=5',
      pdf_sha256='25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3',
      pdf_path='buroboutic-metropoles/2026-T1/25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3.pdf',
      extraction_json=jsonb_set(coalesce(b.extraction_json,'{}'::jsonb),
                                '{source_correction}',correction,true)
  WHERE b.id=old_row.id AND b.qa_status='auto_partial'
    AND b.source_url=old_row.source_url
    AND b.pdf_sha256=old_row.pdf_sha256
    AND b.pdf_path=old_row.pdf_path;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'T1_SOURCE_REPAIR_EXPECTED_1_GOT_%',affected; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.scpi_bulletins b
    WHERE b.id=old_row.id
      AND b.qa_status='auto_partial'
      AND b.pdf_sha256='25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3'
      AND b.extraction_json->'source_correction'->>'financial_certified'='false'
      AND coalesce(b.extraction_json->'metrics','{}'::jsonb)='{}'::jsonb
  ) THEN
    RAISE EXCEPTION 'T1_SOURCE_CORRECTION_POSTCONDITION_FAILED';
  END IF;
END $recovery139$;
