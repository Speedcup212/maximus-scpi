-- RECOVERY-152: correct stale registered annual 2021/2024 pointers using already-verified 2025 issuer PDF and pinned SHA.
-- Do not change any verification_status, confidence_level, source_ready, financial value or strict PASS policy.
DO $r152$
DECLARE s record;r public.scpi_source_registry%ROWTYPE;a public.scpi_annual_reports%ROWTYPE;n integer;
BEGIN
 FOR s IN SELECT * FROM (VALUES
 ('aestiam-horizon','https://www.aestiam.com/doc/horizon/rapport-annuel/2021-rapport-annuel-aestiam-placement-pierre.pdf','75637cdccbecbfd68e846c8cbd65f7ec0328d52cc900c8f29305b22c3cec809a'),
 ('epargne-pierre','https://atland-voisin.com/wp-content/uploads/2025/05/ATLAND_RA_Epargne_Pierre_2024_OPTI-compresse.pdf','d6b40189baf0ea94d87cd448dc03be3f07553093084c4b37468389a60b7ff978'),
 ('epargne-pierre-europe','https://atland-voisin.com/wp-content/uploads/2025/05/ATLAND_RA_Epargne_Pierre_Europe_2024_compresse.pdf','770cacec7cc42fdbecea8bc6cf723b71eed4ca062314cd6325804d080f95c42e'),
 ('epsicap-nano','https://epsicap.thrive-production.fr/app/uploads/2026/07/EXPLORE-Rapport-annuel-2025.pdf','ee009c0d3dddcb7bf5866626bde116fbf986ef72a855f507373b99bf741e7863'),
 ('fonciere-des-praticiens','https://www.groupemagellim.com/wp-content/uploads/Fonciere-des-Praticiens-Rapport-annuel-2021.pdf','817b25aa8906bb5c1955427d5256d9d7485a3a41fbb18d80459af0002e0fcbc3'),
 ('transitions-europe','https://www.arkea-reim.com/upload/docs/application/pdf/2025-05/ra_2024_te.pdf','efb5bd55a0a68120c384b6cd3012041c6f68403cea30c9940ee7df71f8628c91')
 ) x(slug,old_url,sha)
 LOOP
 SELECT * INTO STRICT r FROM public.scpi_source_registry
 WHERE scpi_slug=s.slug AND annual_report_url=s.old_url FOR UPDATE;
 SELECT * INTO STRICT a FROM public.scpi_annual_reports
 WHERE scpi_slug=s.slug AND fiscal_year=2025 AND qa_status='source_verified_content'
  AND extraction_confidence>=0.9 AND source_sha256=s.sha;
 IF length(a.source_sha256)<>64 OR a.source_url NOT LIKE 'https://%'
  OR position(r.source_domain||'/' IN a.source_url)<>1
 THEN RAISE EXCEPTION 'ISSUER_2025_ANNUAL_PROOF_REJECTED_%',s.slug;END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES('recovery152:'||s.slug||':annual2025-pointer',
   'Only official 2025 issuer PDF URL pointer changed; prior registry and SHA evidence preserved, no certification promoted',
   jsonb_build_object('before_registry',to_jsonb(r),'verified_annual_2025',to_jsonb(a)))
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.scpi_source_registry
 SET annual_report_url=a.source_url
 WHERE id=r.id AND scpi_slug=s.slug AND annual_report_url=s.old_url
   AND verification_status=r.verification_status AND confidence_level=r.confidence_level;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'ISSUER_ANNUAL_POINTER_CONCURRENT_%',s.slug; END IF;
 END LOOP;
END $r152$;