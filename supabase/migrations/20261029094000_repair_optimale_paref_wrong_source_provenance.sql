-- Correct demonstrably wrong issuer/issue attribution; NEVER transfer extracted
-- numbers across funds or periods. Keep full immutable before-images for audit.
-- Evidence: publisher Optimale BT 202206 = 2022-T2 (not 2021-T3);
-- PAREF issuer confirms Interpierre Europe Centrale -> PAREF Evo (not Hexa).
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_replay_provenance_quarantine (
 event_key text PRIMARY KEY,
 reason text NOT NULL,
 snapshot jsonb NOT NULL,
 audited_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE maximus_agents.scpi_replay_provenance_quarantine FROM PUBLIC, anon, authenticated;

DO $repair$
DECLARE
 wrong_optimale text := 'https://www.consultim-am.com/wp-content/uploads/2022/07/Optimale-Bulletin-trimestriel-202206.pdf';
 correct_optimale text := 'https://www.consultim-am.com/wp-content/uploads/2021/10/Optimale-Bulletin-trimestriel-202109.pdf';
 expected_old text := 'df7e1d0148070f6229a45d5832e4c9b9fe5533e18f07675cbff53a4c33962f84';
 expected_true text := '7474ab380e7aad2dfb30a7c2c6dce3c815396ce3aae852648286458a4434959f';
 b public.scpi_bulletins%ROWTYPE;
 true_row maximus_agents.scpi_bulletin_replay_documents%ROWTYPE;
 pair record;
 cert_rows jsonb;
BEGIN
 -- Repeat-safe: when corrected, the old SHA has already been replaced.
 SELECT * INTO b FROM public.scpi_bulletins
 WHERE scpi_slug='optimale' AND period='2021-T3' FOR UPDATE;
 IF b.pdf_sha256=expected_old AND b.source_url=wrong_optimale THEN
   SELECT * INTO true_row FROM maximus_agents.scpi_bulletin_replay_documents
    WHERE scpi_slug='optimale' AND source_period='2021-T3' AND source_url=correct_optimale;
   IF true_row.pdf_sha256 IS DISTINCT FROM expected_true
      OR true_row.processing_complete IS NOT TRUE
      OR true_row.result->>'identity_verified' IS DISTINCT FROM 'true'
      OR true_row.result->>'period_verified' IS DISTINCT FROM 'true'
      OR EXISTS (SELECT 1 FROM public.scpi_bulletins
                 WHERE pdf_sha256=expected_true AND id<>b.id)
   THEN RAISE EXCEPTION 'True Optimale T3 2021 source not independently verified'; END IF;

   SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) INTO cert_rows
    FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug='optimale' AND c.source_period='2021-T3' AND c.source_url=wrong_optimale;
   IF jsonb_array_length(cert_rows)<>8 THEN
       RAISE EXCEPTION 'Optimale mismatch expected 8 wrongly sourced certificates, found %',jsonb_array_length(cert_rows);
   END IF;
   INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
    VALUES('optimale-2021-T3-wrong-2022-T2-20261029',
           'Issuer 2022-T2 PDF incorrectly registered as 2021-T3',
           jsonb_build_object('bulletin_before',to_jsonb(b),'wrong_certifications',cert_rows))
    ON CONFLICT(event_key) DO NOTHING;
   DELETE FROM public.scpi_metric_certifications
    WHERE scpi_slug='optimale' AND source_period='2021-T3' AND source_url=wrong_optimale;
   UPDATE public.scpi_bulletins
    SET source_url=correct_optimale,pdf_sha256=expected_true,pdf_path=NULL,
        qa_status='auto_partial_review',
        extraction_json=jsonb_build_object('source_repair',
             jsonb_build_object('status','true_issue_requires_replay',
             'wrong_source',wrong_optimale,'right_source',correct_optimale,
             'audit_event','optimale-2021-T3-wrong-2022-T2-20261029')),
        processed_at=now()
    WHERE id=b.id;
   UPDATE maximus_agents.scpi_bulletin_replay_documents
    SET status='source_period_mismatch',origin='quarantined_reference',
        bulletin_id=NULL,expected_sha256=NULL,pdf_path=NULL,financial_complete=false,
        next_try_at='infinity'::timestamptz,
        result=result||jsonb_build_object('issuer_period_rejected','2022-T2','audit_event',
               'optimale-2021-T3-wrong-2022-T2-20261029'),updated_at=now()
    WHERE document_key=b.id::text AND scpi_slug='optimale' AND source_period='2021-T3';
   UPDATE maximus_agents.scpi_bulletin_replay_documents
    SET status='queued',parser_version=NULL,next_try_at=now(),updated_at=now()
    WHERE scpi_slug='optimale' AND
     ((source_period='2021-T3' AND source_url=correct_optimale) OR
      (source_period='2022-T2' AND source_url=wrong_optimale))
      AND status<>'running';
 ELSIF b.pdf_sha256 IS DISTINCT FROM expected_true OR b.source_url IS DISTINCT FROM correct_optimale THEN
   RAISE EXCEPTION 'Optimale correction source state unexpectedly different';
 END IF;

 FOR pair IN SELECT * FROM (VALUES
  ('2021-T2'::text,'a93e6a4ff6f7ebb16f2e5b7fe217756a452b7596fff530a02e854871419a2c6b'::text),
  ('2022-T2'::text,'71b1efa8b8f7dce25078712346362d5cd771427cedf095b3bd207ede6b6fb222'::text)
 ) v(source_period,source_hash)
 LOOP
   SELECT * INTO b FROM public.scpi_bulletins
    WHERE scpi_slug='paref-hexa' AND period=pair.source_period FOR UPDATE;
   IF b.id IS NULL THEN RAISE EXCEPTION 'Missing incorrectly labelled PAREF Hexa PDF (%)',pair.source_period; END IF;
   IF b.pdf_sha256=pair.source_hash THEN
      IF b.source_url NOT ILIKE '%Interpierre-Europe-Centrale%' THEN
         RAISE EXCEPTION 'PAREF source name does not demonstrate wrong fund'; END IF;
      IF NOT EXISTS(SELECT 1 FROM maximus_agents.scpi_bulletin_replay_documents
        WHERE scpi_slug='paref-evo' AND source_period=pair.source_period
          AND pdf_sha256=pair.source_hash AND processing_complete
          AND result->>'identity_verified'='true' AND result->>'period_verified'='true') THEN
         RAISE EXCEPTION 'Correct PAREF Evo source not independently verified for %',pair.source_period;
      END IF;
      SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) INTO cert_rows
        FROM public.scpi_metric_certifications c WHERE c.bulletin_id=b.id;
      INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
        VALUES('paref-hexa-wrong-evo-'||pair.source_period,
           'Official Interpierre Europe Centrale bulletin belongs to PAREF Evo, not PAREF Hexa',
           jsonb_build_object('bulletin_before',to_jsonb(b),'wrong_certifications',cert_rows))
       ON CONFLICT(event_key) DO NOTHING;
      DELETE FROM public.scpi_metric_certifications c WHERE c.bulletin_id=b.id;
      UPDATE public.scpi_bulletins
        SET pdf_sha256=NULL,pdf_path=NULL,qa_status='invalid_wrong_scpi_source',
            extraction_json=jsonb_build_object('quarantined_wrong_scpi',
             jsonb_build_object('proper_fund','paref-evo','source_hash',pair.source_hash,
                                'audit_event','paref-hexa-wrong-evo-'||pair.source_period))
      WHERE id=b.id;
      UPDATE maximus_agents.scpi_bulletin_replay_documents
       SET status='source_period_mismatch',origin='quarantined_reference',
           expected_sha256=NULL,pdf_path=NULL,financial_complete=false,
           next_try_at='infinity'::timestamptz,
           result=result||jsonb_build_object('correct_scpi','paref-evo','audit_event',
               'paref-hexa-wrong-evo-'||pair.source_period),updated_at=now()
       WHERE document_key=b.id::text;
      UPDATE maximus_agents.scpi_bulletin_replay_documents
       SET status='queued',parser_version=NULL,next_try_at=now(),updated_at=now()
       WHERE scpi_slug='paref-evo' AND source_period=pair.source_period
         AND pdf_sha256=pair.source_hash AND status<>'running';
   ELSIF b.qa_status IS DISTINCT FROM 'invalid_wrong_scpi_source' THEN
      RAISE EXCEPTION 'PAREF Hexa source hash unexpected for %',pair.source_period;
   END IF;
 END LOOP;
END $repair$;
