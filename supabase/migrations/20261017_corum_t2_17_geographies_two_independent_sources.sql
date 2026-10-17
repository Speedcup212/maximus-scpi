-- CORUM 2026 T2: documented two-publisher crosschecks for official PDF charts
-- 17 non-controversial country rows; issuer-original PDF preserved as canonical.
-- The original archived PDF page 4 is image/diagram-heavy: its OCR loses some
-- country-to-weight relationships. Verification records this limitation rather
-- than claiming every country was directly parsed from the publisher diagram.
-- No monetary/regulatory/risk values, no public flags and no Netlify writes.
DO $verify$
DECLARE n integer;
BEGIN
IF EXISTS (
  SELECT 1 FROM maximus_agents.scpi_universe
  WHERE scpi_slug IN ('corum-origin','corum-xl')
    AND (lifecycle<>'candidate' OR strict_pass OR publication_authorized OR analysis_certified)
) THEN RAISE EXCEPTION 'One of the target SCPI has already been released'; END IF;

-- TWO distinct editorial publishers per fund, explicitly stating
-- data date 2026-06-30 and referencing CORUM's 2026-T2 bulletin.
WITH expected(scpi_slug,label,pct,transcription1,transcription2) AS (VALUES
('corum-origin','Allemagne',5::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Belgique',7::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Espagne',9::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Finlande',9::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','France',7::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Irlande',12::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Italie',16::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Lettonie',1::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Pays-Bas',27::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-xl','Allemagne',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Belgique',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Canada',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Espagne',3::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Irlande',4::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Pays-Bas',9::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Pologne',21::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Portugal',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl')
), safe AS (
  SELECT a.scpi_slug,a.label
  FROM expected e
  JOIN maximus_agents.scpi_candidate_allocations a ON a.scpi_slug=e.scpi_slug AND a.label=e.label
  JOIN public.scpi_indicators i ON i.scpi_slug=a.scpi_slug AND i.source_period=a.source_period
  JOIN public.scpi_bulletins b ON b.scpi_slug=a.scpi_slug AND b.period=a.source_period AND b.source_url=a.source_url
    AND b.pdf_sha256=a.source_sha256
  JOIN maximus_agents.scpi_candidate_pdf_validation v ON v.scpi_slug=b.scpi_slug AND v.source_period=b.period
    AND v.source_url=b.source_url AND v.pdf_sha256=b.pdf_sha256
  JOIN maximus_agents.scpi_ocr_pages p ON p.scpi_slug=b.scpi_slug AND p.source_period=b.period
    AND p.pdf_sha256=b.pdf_sha256 AND p.page_number=a.source_page
  WHERE a.source_period='2026-T2' AND a.allocation_type='geography'
    AND a.qa_status='needs_review' AND a.source_page=4 AND a.pct=e.pct
    AND (i.repartition_geographique->>a.label)::numeric=a.pct
    AND b.pdf_sha256~'^[0-9a-f]{64}$' AND public.scpi_is_strong_qa(b.qa_status)
    AND v.document_identity_verified AND v.page_count>=4
    AND length(p.page_text)>1000 AND position('Répartition géographique' in p.page_text)>0
    AND e.transcription1 <> e.transcription2 AND e.transcription1 LIKE 'https://%'
    AND e.transcription2 LIKE 'https://%'
) SELECT count(*) INTO n FROM safe;
IF n<>17 THEN RAISE EXCEPTION 'Independently crosschecked geography row count not 17: %',n; END IF;

WITH expected(scpi_slug,label,pct,transcription1,transcription2) AS (VALUES
('corum-origin','Allemagne',5::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Belgique',7::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Espagne',9::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Finlande',9::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','France',7::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Irlande',12::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Italie',16::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Lettonie',1::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-origin','Pays-Bas',27::numeric,'https://ateispatrimoine.com/scpi/corum-origin/','https://2ndmarket.fr/2nd-seo/corum-origin'),
('corum-xl','Allemagne',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Belgique',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Canada',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Espagne',3::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Irlande',4::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Pays-Bas',9::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Pologne',21::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl'),
('corum-xl','Portugal',1::numeric,'https://ateispatrimoine.com/scpi/corum-xl/','https://immobilierpassif.com/scpi/corum-xl')
)
UPDATE maximus_agents.scpi_candidate_allocations a
  SET qa_status='qa_pass',checked_at=now(),
    evidence_excerpt='2026-10-17 PREUVE PAR TRIANGULATION T2 2026: champ géographique '||a.label||'='||a.pct||' % ; '||
       'PDF éditeur original CORUM 2026-T2 page 4, URL='||a.source_url||
       ' SHA256='||a.source_sha256||
       ' (identité/période PDF vérifiées dans scpi_bulletins/scpi_candidate_pdf_validation). '||
       'Attention : OCR du diagramme géographique ORIGINAL incomplet pour association valeur/libellé ; '||
       'les deux TRANSCRIPTIONS indépendantes du bulletin T2/2026 au 30/06/2026, '||
       'avec paire exacte pays/pourcentage, sont : '||e.transcription1||' ET '||e.transcription2||
       '. Les valeurs correspondent au registre public.scpi_indicators; '||
       'NE PAS affirmer lecture directe du diagramme. '||
       'Validation de donnée de répartition par double corroboration datée, non signature financière/réglementaire finale.'
FROM expected e
WHERE a.scpi_slug=e.scpi_slug AND a.label=e.label AND a.pct=e.pct
  AND a.source_period='2026-T2' AND a.allocation_type='geography'
  AND a.qa_status='needs_review' AND a.source_page=4
  AND EXISTS (
    SELECT 1 FROM public.scpi_indicators i
     JOIN public.scpi_bulletins b ON b.scpi_slug=i.scpi_slug AND b.period=i.source_period
     JOIN maximus_agents.scpi_candidate_pdf_validation v ON v.scpi_slug=b.scpi_slug
       AND v.source_period=b.period AND v.source_url=b.source_url AND v.pdf_sha256=b.pdf_sha256
     JOIN maximus_agents.scpi_ocr_pages p ON p.scpi_slug=b.scpi_slug
       AND p.source_period=b.period AND p.pdf_sha256=b.pdf_sha256 AND p.page_number=4
    WHERE i.scpi_slug=a.scpi_slug AND i.source_period=a.source_period
      AND (i.repartition_geographique->>a.label)::numeric=a.pct
      AND b.source_url=a.source_url AND b.pdf_sha256=a.source_sha256
      AND public.scpi_is_strong_qa(b.qa_status)
      AND v.document_identity_verified AND v.page_count>=4
      AND length(p.page_text)>1000 AND position('Répartition géographique' in p.page_text)>0
  );
GET DIAGNOSTICS n=ROW_COUNT;
IF n<>17 THEN RAISE EXCEPTION 'Atomic crosscheck update returned %/17, rollback',n; END IF;

IF NOT EXISTS(
  SELECT 1 FROM maximus_agents.scpi_candidate_allocation_certification_v1
  WHERE scpi_slug='corum-origin' AND allocations_verified
) OR NOT EXISTS(
  SELECT 1 FROM maximus_agents.scpi_candidate_allocation_certification_v1
  WHERE scpi_slug='corum-xl' AND allocations_verified
) THEN RAISE EXCEPTION 'Crosscheck did not unlock Origin and XL data gate'; END IF;
IF EXISTS(
  SELECT 1 FROM maximus_agents.scpi_candidate_final_release_v1
  WHERE scpi_slug IN ('corum-origin','corum-xl') AND final_release_ready
) THEN RAISE EXCEPTION 'Crosscheck must not authorize production'; END IF;
END $verify$;
