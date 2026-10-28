-- 15 issuer-published quarter-exact TOFs from direct original publisher PDFs.
-- Comparison: separate TOP vs TOF labels; never use an ASPIM-labelled metric.
-- Matching SHA256 per document verified against public.scpi_bulletins.
DO $backfill$
DECLARE d record; hh record; bb record; modified int; total_updated int:=0;
BEGIN
 FOR d IN SELECT * FROM (VALUES
('aestiam-horizon','2026-T3','87','3','TOF 87,00 % au 30/09/2026 (page 3). 13,00 % de locaux vacants. 81,12 % de locaux occupés, 3,81 % sous franchise, 0,31 % vacants sous promesse de vente, 1,76 % en restructuration; 81,12 % n est pas le TOF.','c77dc6259fc2e7731db341a4dc7db8475653b77ebe7be98ad42ae3ac7e588309','2026-09-30'),
('corum-eurion','2022-T3','100.94','4','CORUM Eurion tableau page 4 : TAUX D OCCUPATION FINANCIER (TOF) 100,94 %, TOP 98,71 %. Le bulletin explique que ce TOF supérieur a 100 % est dû aux conditions d acquisition de l immeuble de City West à Dublin.','2794cf2b40c7d5e43ff3c70d425f52e72b7d1fb2101dbb38a11654f271e0e12a','2022-09-30'),
('corum-eurion','2022-T4','100.72','4','CORUM Eurion tableau page 4 : TAUX D OCCUPATION FINANCIER (TOF) 100,72 %, TOP 98,49 %. Page 2 : le taux avoisine 101 % en raison des conditions d une acquisition négociée; garder le 100,72 % exact du tableau.','6f9f636221c9c13d4007f8632b381c4385bdf5877d556521be23716278b592e7','2022-12-31'),
('corum-origin','2015-T3','99.5','5','CORUM Convictions bulletin 2015-T3 page 5, graphique TOP 3e T 2015 99,1 % et TOF 3e T 2015 99,5 %. Le trimestre est explicite.','8c8299f8d7b25fccc6ff2b703559f813e9648024177ea200370331c57fdc21ac','2015-09-30'),
('corum-origin','2016-T1','99.3','5','CORUM Convictions bulletin 2016-T1 page 5, graphique TOP 1er T 2016 99,2 % et TOF 1er T 2016 99,3 %.','45db0560ebe53e950c53211af64d38368125009af7ac2a0f427b3279b34d3484','2016-03-31'),
('corum-origin','2016-T2','99.4','6','CORUM Convictions bulletin 2016-T2 page 6, graphique TOP 2T 2016 99,5 % et TOF 2T 2016 99,4 %.','ad89d1cf56b30b34efd470fe53e2891f7f45830da5dceac895b83ae250dd9be1','2016-06-30'),
('corum-origin','2016-T3','99.4','5','CORUM Origin bulletin 2016-T3 page 5, graphique TOP 3T 2016 99,3 % et TOF 3T 2016 99,4 %.','49965acf05af6e2bd5cdaffd8a44ee9e9a0563ae176520dd058b8cfbd2cb6451','2016-09-30'),
('corum-origin','2017-T2','99.6','6','CORUM Origin bulletin 2017-T2 page 6, graphique TOP 2T2017 99,6 % et TOF 2T2017 99,6 %.','b737ddf0db3785a0a5197f0293fa8b0f3438f32ba563813440ad2a60172aab7f','2017-06-30'),
('corum-origin','2017-T3','99.6','5','CORUM Origin bulletin 2017-T3 page 5, graphique TOP 3T2017 99,8 % et TOF 3T2017 99,6 %.','d2fde2d55bb93a61f1a0ded803ccd86e6ccb05cea26edbfb630b50ebbd99d1df','2017-09-30'),
('corum-origin','2017-T4','99.6','6','CORUM Origin bulletin 2017-T4 page 6, graphique TOP 4T2017 99,5 % et TOF 4T2017 99,6 %.','eb8d8c307807d19a201c8503ec3bd41e90e2782d815c62a3bfd523d35369bd3b','2017-12-31'),
('corum-origin','2018-T1','99.4','4','CORUM Origin bulletin 2018-T1 page 4, graphique TOP 1T2018 99,6 % et TOF 1T2018 99,4 %.','3fee524647691a70ed191b7f7c67fd62f3bbf38dfe9ea0d750bb741af5567dcd','2018-03-31'),
('corum-origin','2018-T2','99.5','4','CORUM Origin bulletin 2018-T2 page 4, graphique TOP 2T2018 99,6 % et TOF 2T2018 99,5 %.','0deb8d823179af93ab02f5e436d994b66ec5b90fba6cb85b75f3627c33d1f90c','2018-06-30'),
('corum-origin','2018-T3','99.4','4','CORUM Origin bulletin 2018-T3 page 4, graphique TOP 3T2018 99,6 % et TOF 3T2018 99,4 %.','bc5393ee84d35462763788b4e581a5f551f5e8f4025218de187325070b5707a2','2018-09-30'),
('corum-xl','2018-T1','100','4','CORUM XL bulletin 2018-T1 page 4, graphique TOP 1T2018 100 % et TOF 1T2018 100 % (valeurs trimestrielles explicites).','f6f22e880ecd2ecf93ebae3865a833d3b0e4267dca9b69e39349f419cbb9fef1','2018-03-31'),
('corum-xl','2018-T2','100','5','CORUM XL bulletin 2018-T2 page 5, graphique TOP 2T2018 100 % et TOF 2T2018 100 % (valeurs trimestrielles explicites).','7b253a98a451b467c5dbc0f4b169609a2dc17a28965ddb9c7abbb20da646e8a7','2018-06-30')
 ) AS v(slug,period,tof_text,pageno,proof,sha256,refdate)
 LOOP
   IF EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 WHERE scpi_slug=d.slug AND source_period=d.period)
   THEN RAISE EXCEPTION 'Quarantined historical value requires independent full recertification: % %',d.slug,d.period; END IF;
   SELECT * INTO hh FROM public.scpi_indicator_history
     WHERE scpi_slug=d.slug AND source_period=d.period AND tof IS NULL AND qa_status='auto_verified_dual_pdf_fields';
   SELECT * INTO bb FROM public.scpi_bulletins
     WHERE scpi_slug=d.slug AND period=d.period AND pdf_sha256=d.sha256;
   IF hh.id IS NULL OR bb.id IS NULL OR hh.source_url IS DISTINCT FROM bb.source_url
      OR EXISTS(SELECT 1 FROM public.scpi_metric_certifications WHERE scpi_slug=d.slug AND source_period=d.period AND metric='tof')
   THEN RAISE EXCEPTION 'Preconditions did not match official PDF for % %',d.slug,d.period; END IF;
   IF NOT EXISTS (
     SELECT 1 FROM public.scpi_source_connectors c
     WHERE c.scpi_slug=d.slug
       AND lower(split_part(split_part(hh.source_url,'://',2),'/',1))=any(c.allowed_hosts)
   ) OR d.proof ~* 'TOF[[:space:]]+ASPIM'
   THEN RAISE EXCEPTION 'Policy disallows source or ASPIM label % %',d.slug,d.period; END IF;
   INSERT INTO public.scpi_metric_certifications (
     scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,
     evidence_text,bulletin_id,verification_status,verification_method,
     extraction_confidence,verified_at)
   VALUES (d.slug,d.period,'tof',d.tof_text::numeric,'%',hh.source_url,d.pageno::int,
      d.proof || ' Bulletin SHA256 ' || d.sha256 || ', arrêté ' || d.refdate,
      bb.id,'manual_verified_official_pdf_text_review',
      'issuer_pdf_page_text_verified_against_TopAndTOF',0.98,now());
   UPDATE public.scpi_indicator_history h
   SET tof=d.tof_text::numeric,
       metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)||
         jsonb_build_object('tof',jsonb_build_object(
           'value',d.tof_text::numeric,'unit','%','source_page',d.pageno::int,
           'source_url',h.source_url,'sha256',d.sha256,'reference_date',d.refdate,
           'document_period',d.period,'definition','issuer_published_quarter_exact_TOF',
           'verification','manual_official_pdf_page_context_not_ASPIM')),
       snapshot_at=now()
   WHERE h.id=hh.id AND h.tof IS NULL;
   GET DIAGNOSTICS modified=ROW_COUNT;
   IF modified<>1 THEN RAISE EXCEPTION 'History update mismatch % %',d.slug,d.period; END IF;
   UPDATE public.scpi_bulletins b
   SET extraction_json=jsonb_set(
      jsonb_set(coalesce(b.extraction_json,'{}'::jsonb),'{metrics,tof}',to_jsonb(d.tof_text::numeric),true),
      '{evidence,tof}',jsonb_build_object('page',d.pageno::int,'value',d.tof_text::numeric,
        'unit','%','text',d.proof,'reference_date',d.refdate,'method','issuer_pdf_manual_geometry_crosscheck',
        'independent_engines',jsonb_build_array('MuPDF','Poppler'),
        'source_sha256',d.sha256),true)
   WHERE b.id=bb.id;
   INSERT INTO public.scpi_ingestion_events(scpi_slug,status,step,message,bulletin_url,source_period,ended_at)
   VALUES(d.slug,'updated','issuer_quarter_tof_recertified',
     'TOF '||d.tof_text||' % from original issuer PDF page '||d.pageno||' SHA256 '||d.sha256,
     hh.source_url,d.period,now());
   total_updated:=total_updated+1;
 END LOOP;
 IF total_updated<>15 THEN RAISE EXCEPTION 'Expected 15 quarter TOFs, applied %',total_updated; END IF;
END $backfill$;