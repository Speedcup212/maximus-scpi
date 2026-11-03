-- RECOVERY-087: Only facts checked against official Sofidynamic PDFs.
-- Source issuer note Aug 2026, PDF SHA-256 782f5b2f... page 22.
-- Bulletin T2 2026, PDF SHA-256 89ecdf2e... pages 2 and 5.
do $$
declare t2 text:='https://www.sofidy.com/app/uploads/2026/07/Bulletin_Trimestriel_-_Sofidynamic_OPTI.pdf';
        note text:='https://www.sofidy.com/app/uploads/2024/01/NI-DYN-072026-FR-2-3146.pdf';
        proof jsonb;
begin
 if (select count(distinct metric) from maximus_agents.scpi_candidate_metric_evidence
      where scpi_slug='sofidynamic' and source_period='2026-T2' and qa_status='qa_pass'
        and source_url=t2 and
        ((metric='distribution_par_part' and numeric_value=5.52 and source_page=5)
          or (metric='nombre_unites_locatives' and numeric_value=681 and source_page=2)))<>2
 then raise exception 'Missing official QA evidence for distribution or rental units';end if;
 if not exists(select 1 from maximus_agents.scpi_candidate_regulatory_documents
   where scpi_slug='sofidynamic' and document_kind='note'
     and source_url=note and kind_verified and identity_verified
     and pdf_sha256='782f5b2fcdabe3cc5219fe3bb49e7a636760b42b2c5f3afa2b4110fc853e51c3')
 then raise exception 'Current issuer note evidence missing';end if;
 proof:=jsonb_build_object(
 'distribution_par_part',jsonb_build_object('value_numeric',5.52,'unit','EUR_PER_PART','source_period','2026-T2','reference_date','2026-06-30','source_url',t2,'source_page',5,'pdf_sha256','89ecdf2e2765a98a930e1883a69403029cfe789c0a9da7c51b7ee3e622023376','qa_status','qa_pass','reviewer','SECOND_PASS_PDF_QA_NOT_HUMAN'),
 'nombre_unites_locatives',jsonb_build_object('value_numeric',681,'unit','RENTAL_UNITS_NOT_TENANTS','source_period','2026-T2','reference_date','2026-06-30','source_url',t2,'source_page',2,'pdf_sha256','89ecdf2e2765a98a930e1883a69403029cfe789c0a9da7c51b7ee3e622023376','qa_status','qa_pass','reviewer','SECOND_PASS_PDF_QA_NOT_HUMAN'),
 'frais_souscription',jsonb_build_object('value_numeric',2.4,'unit','PERCENT_TTC_SUBSCRIPTION_PRICE','source_period','2026-08','source_url',note,'source_page',22,'pdf_sha256','782f5b2fcdabe3cc5219fe3bb49e7a636760b42b2c5f3afa2b4110fc853e51c3','qa_status','VISUAL_VERIFIED_NOT_HUMAN'),
 'frais_gestion',jsonb_build_object('value_numeric',12,'unit','PERCENT_HT_OF_RENTAL_AND_FINANCIAL_PROCEEDS','source_period','2026-08','source_url',note,'source_page',22,'pdf_sha256','782f5b2fcdabe3cc5219fe3bb49e7a636760b42b2c5f3afa2b4110fc853e51c3','qa_status','VISUAL_VERIFIED_NOT_HUMAN'));
 update public.scpi_indicators set distribution_par_part=5.52,frais_souscription=2.4,
   frais_gestion=12,metric_provenance=coalesce(metric_provenance,'{}'::jsonb)||proof
 where scpi_slug='sofidynamic' and source_period='2026-T2' and prix_souscription=320;
 if not found then raise exception 'Public pilot missing or changed';end if;
 update maximus_agents.scpi_candidate_indicator_stage set distribution_par_part=5.52,
   frais_souscription=2.4,frais_gestion=12,
   metric_provenance=coalesce(metric_provenance,'{}'::jsonb)||proof
 where scpi_slug='sofidynamic' and source_period='2026-T2';
 if not found then raise exception 'Candidate stage missing or changed';end if;
end $$;