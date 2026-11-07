-- RECOVERY-133 exact evidence enrollment, NO FINANCIAL CERTIFICATION.
-- Source archive: GitHub Actions run 42372117510, artifact 13574715569,
-- PR #317 at commit 3cd5bb219638c98f74ffb0e8353b684ebda3c3c8.
-- 14 original issuer PDFs were checked by MuPDF+Poppler (name and period),
-- independently recomputed from stored artifact by SHA-256, page count
-- and sum of native text character counts before this migration.
-- Exactly 1 quarterly T2 and 13 semiannual S1. No financial figures touched.
DO $recovery133_binary$
DECLARE
 evidence jsonb:='[{"slug":"lf-croissance-et-territoires","period":"2026-T2","kind":"quarterly_bulletin","sha":"87d2a94b8b2a656fa7149f89737f80205f675bac0e1f6e3829126b73acdf23db","pages":12,"chars":70872,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-croissance-territoires-30062026"},{"slug":"lf-grand-paris-habitation","period":"2026-S1","kind":"semiannual_bulletin","sha":"1d724e43aa4ba73186e6b8102cb63e02d7b4f0995615addd0fdf758e92712752","pages":9,"chars":52931,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-grand-paris-habitation-30062026"},{"slug":"lf-les-grands-palais","period":"2026-S1","kind":"semiannual_bulletin","sha":"8fc42883df86b074f0d458818089a74226034b4eb5c5bf442062d8a3dc00d2cc","pages":9,"chars":60229,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-lf-les-grands-palais-30062026"},{"slug":"lf-renovimmo","period":"2026-S1","kind":"semiannual_bulletin","sha":"e78962c47e9de6f96af2b9c962a9da8d077c68184eb5cf9fb082ac3b5fead02b","pages":9,"chars":52891,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-lf-renovimmo-30062026"},{"slug":"multihabitation-10","period":"2026-S1","kind":"semiannual_bulletin","sha":"1d05072acb9416c371ec978d21a39d5945adf5bef0f2f93c5d0cbaa2ae37d0e3","pages":9,"chars":55593,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-10-30062026"},{"slug":"multihabitation-2","period":"2026-S1","kind":"semiannual_bulletin","sha":"a7e7b9fa76b1f2362105e7bdec65288622e655a0f17111324324293969e8ad5e","pages":9,"chars":53266,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-2-30062026"},{"slug":"multihabitation-3","period":"2026-S1","kind":"semiannual_bulletin","sha":"822ab5bc12cd4e65c6dcc339622e2e3cbe66603592e93f3dc7d02a89d53d2136","pages":9,"chars":53488,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-3-30062026"},{"slug":"multihabitation-4","period":"2026-S1","kind":"semiannual_bulletin","sha":"5b31500dfec80f97c2b4e59e28a1bb048f1fdab137b346599f54bf7f43fe6381","pages":9,"chars":53654,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-4-30062026"},{"slug":"multihabitation-5","period":"2026-S1","kind":"semiannual_bulletin","sha":"5077b51144a2554d055d0ce11ccb8a566e195923679cbe77c5975c06fdc2bc8f","pages":9,"chars":53981,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-5-30062026"},{"slug":"multihabitation-6","period":"2026-S1","kind":"semiannual_bulletin","sha":"bc804bb294a48d61ced0c4c541d1f639d4b7d5f8aaedcb8a2036fec69613f16d","pages":9,"chars":54182,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-6-30062026"},{"slug":"multihabitation-7","period":"2026-S1","kind":"semiannual_bulletin","sha":"ea5f22ff95cc2fb3b16bcd27c9d1397f6fb22e1858b8b18f6e1a6879ff100790","pages":9,"chars":53385,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-7-30062026"},{"slug":"multihabitation-8","period":"2026-S1","kind":"semiannual_bulletin","sha":"d6e95fb8d55f32fb98ad2aa0bd3844fa6996ac24a73104d5fb70c86e1fe0c5c2","pages":9,"chars":53437,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-8-30062026"},{"slug":"multihabitation-9","period":"2026-S1","kind":"semiannual_bulletin","sha":"8c1a2797b5003338b3c93307a937fe1e552b6fbdc380f2762f9987e6d3f1a7c8","pages":9,"chars":52603,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-multihabitation-9-30062026"},{"slug":"ufg-pierre-et-vacances","period":"2026-S1","kind":"semiannual_bulletin","sha":"a6702d22d45748b12e1d681fd7d16676a6db29cf3e869d841902e5692e422c51","pages":3,"chars":41323,"url":"https://doc.la-francaise.com/Documents/bulletin-trimestriel-scpi-ufg-pierre-vacances-30062026"}]'::jsonb;
 n integer;
BEGIN
 IF jsonb_array_length(evidence)<>14 THEN
    RAISE EXCEPTION 'LFREM_EXACT_BINARY_PROOF_COUNT_REQUIRED';
 END IF;
 UPDATE maximus_agents.scpi_candidate_document_index idx
 SET status='page_verified',
     verified_pdf_at=now(),
     extraction_run_reference='github-actions:42372117510',
     review_note='Exact issuer original PDF identity/period/page/SHA verified by MuPDF and Poppler, GitHub Actions #42372117510 artifact #13574715569; financial metrics and publication NOT certified.'
 FROM jsonb_to_recordset(evidence)
   AS e(slug text,period text,kind text,sha text,pages integer,chars integer,url text)
 WHERE idx.scpi_slug=e.slug AND idx.source_period=e.period
   AND idx.document_kind=e.kind AND idx.direct_document_url=e.url
   AND idx.publisher_index_url='https://client.la-francaise.com/bt'
   AND idx.status='publisher_index_visible'
   AND idx.verified_pdf_at IS NULL
   AND e.url LIKE 'https://doc.la-francaise.com/Documents/%'
   AND e.sha ~ '^[a-f0-9]{64}$'
   AND e.pages BETWEEN 1 AND 250 AND e.chars>=1500;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>14 THEN
   RAISE EXCEPTION 'LFREM_INDEX_MATCH_EXPECTED_14_GOT_%',n;
 END IF;
 INSERT INTO maximus_agents.scpi_candidate_pdf_validation
   (scpi_slug,source_period,document_kind,source_url,pdf_sha256,
    page_count,native_text_characters,document_identity_verified,
    identity_evidence)
 SELECT e.slug,e.period,e.kind,e.url,e.sha,e.pages,e.chars,true,
   'Source binary proof ONLY: GitHub Actions 42372117510; artifact 13574715569. Dual reader MuPDF+Poppler issuer name/period verified. SHA256/page_count rehashed from archived original PDF. Financial QA NOT done. No publishing authorized.'
 FROM jsonb_to_recordset(evidence)
   AS e(slug text,period text,kind text,sha text,pages integer,chars integer,url text)
 JOIN maximus_agents.scpi_candidate_document_index idx
 ON idx.scpi_slug=e.slug AND idx.source_period=e.period
   AND idx.document_kind=e.kind AND idx.direct_document_url=e.url
   AND idx.status='page_verified'
   AND idx.extraction_run_reference='github-actions:42372117510';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>14 THEN
   RAISE EXCEPTION 'LFREM_BINARY_PROOF_EXPECTED_14_GOT_%',n;
 END IF;
END
$recovery133_binary$;
