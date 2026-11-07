-- RECOVERY-133: correct the *discovery index*, not any financial metric.
-- Issuer PDFs read by MuPDF disclose: "Bulletin d'information semestriel",
-- "Analyse du 1er semestre 2026", "Validité du 2e semestre 2026".
-- The original issuer HTML index labels them "Bulletin Trimestriel": the
-- PDF's document-period semantics prevail over the label and URL date.
-- LF Croissance & Territoires is the 1 true 2026-T2 quarterly bulletin.
-- The 13 remaining T2 index pointers were imported on 2026-11-07 without
-- hashes or QA; preserve direct official URLs, original first_seen_at.
DO $recovery133$
DECLARE updated_count integer;
BEGIN
  WITH issuer_semesters(scpi_slug,direct_document_url) AS (
    VALUES
    ('lf-grand-paris-habitation','https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-grand-paris-habitation-30062026'),
    ('lf-les-grands-palais','https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-les-grands-palais-30062026'),
    ('lf-renovimmo','https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-lf-renovimmo-30062026'),
    ('multihabitation-10','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-10-30062026'),
    ('multihabitation-2','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-2-30062026'),
    ('multihabitation-3','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-3-30062026'),
    ('multihabitation-4','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-4-30062026'),
    ('multihabitation-5','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-5-30062026'),
    ('multihabitation-6','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-6-30062026'),
    ('multihabitation-7','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-7-30062026'),
    ('multihabitation-8','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-8-30062026'),
    ('multihabitation-9','https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-9-30062026'),
    ('ufg-pierre-et-vacances','https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-ufg-pierre-vacances-30062026')
  )
  UPDATE maximus_agents.scpi_candidate_document_index idx
  SET source_period='2026-S1',
      document_kind='semiannual_bulletin',
      review_note='RECOVERY-133: issuer PDF cover explicitly says first semester 2026; HTML index said trimestriel. Source period corrected from 2026-T2, PDF binary and financial QA pending.'
  FROM issuer_semesters p
  WHERE idx.scpi_slug=p.scpi_slug
    AND idx.direct_document_url=p.direct_document_url
    AND idx.publisher_index_url='https://client.la-francaise.com/bt'
    AND idx.source_period='2026-T2'
    AND idx.document_kind='quarterly_bulletin'
    AND idx.status='publisher_index_visible'
    AND idx.verified_pdf_at IS NULL;
  GET DIAGNOSTICS updated_count=ROW_COUNT;
  IF updated_count<>13 THEN
    RAISE EXCEPTION 'LFREM_RECLASSIFICATION_EXPECTED_13_GOT_%', updated_count;
  END IF;
END
$recovery133$;
