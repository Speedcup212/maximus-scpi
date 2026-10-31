-- EdR Europa: dated quarter-end values, NEVER propagate 2024/2025 NAV
-- into 2025-T1, 2025-T3 or 2026-T1 as if new valuations were performed.
-- Source: issuer-authorized quarter T2 2025 page 4, issuer annual reports
-- 2024 and 2025, and 2026-T2 official bulletin (already certified).
begin;

with periods(fiscal_year,quarter_period,reconstitution,realisation,share_price,annual_source,page) as (
 values
 (2024,'2024-T4',210.81::numeric,169.60::numeric,200::numeric,
  'https://edr-europa.com/wp-content/uploads/2025/12/SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf'::text,5),
 (2025,'2025-T4',220.66::numeric,179.28::numeric,200::numeric,
  'https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2025.pdf'::text,6)
)
update public.scpi_indicator_history h
set prix_reconstitution=p.reconstitution,
    valeur_realisation=p.realisation,
    prix_souscription=p.share_price,
    source_confidence=1,
    qa_status='manual_verified_quarterly_dividend_and_dated_annual_valuation',
    metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)
      || jsonb_build_object(
        'prix_reconstitution',jsonb_build_object('value',p.reconstitution,
            'reference_date',p.fiscal_year||'-12-31','source_url',p.annual_source,
            'source_page',p.page,'document_type','issuer_annual_report',
            'certification_period',p.fiscal_year||'-RA'),
        'valeur_realisation',jsonb_build_object('value',p.realisation,
            'reference_date',p.fiscal_year||'-12-31','source_url',p.annual_source,
            'source_page',p.page,'document_type','issuer_annual_report',
            'certification_period',p.fiscal_year||'-RA'),
        'prix_souscription',jsonb_build_object('value',p.share_price,
            'reference_date',p.fiscal_year||'-12-31','source_url',p.annual_source),
        'distribution_par_part',jsonb_build_object(
            'value',h.distribution_par_part,'reference_period',h.source_period,
            'source_url',h.source_url,'source_page',3,
            'source_type','issuer_authored_T2_2026_retrospective_chart'))
from periods p
where h.scpi_slug='edr-europa' and h.source_period=p.quarter_period
  and h.prix_reconstitution is null and h.valeur_realisation is null
  and h.qa_status='manual_verified_distributions_only_official_pdf_page_3'
  and (select count(*) from public.scpi_metric_certifications c
       where c.scpi_slug=h.scpi_slug and c.source_period=p.fiscal_year||'-RA'
       and c.verification_status='manual_verified_official_pdf_sha256_page'
       and ((c.metric='prix_reconstitution' and c.value_numeric=p.reconstitution)
            or (c.metric='valeur_realisation' and c.value_numeric=p.realisation)
            or (c.metric='prix_souscription' and c.value_numeric=p.share_price)))=3;

-- T2 2025 is a new valuation dated 30 June. The publisher-authored
-- bulletin is retained through a distributor archive; do not claim
-- its unverified original-host SHA256 matches the archived binary.
with issuer_source as (
 select 'https://francescpi.com/scpi-de-rendement/edmond-de-rothschild-europa/bi/edmond-de-rothschild-europa-bulletin-2025-t2.pdf'::text url
)
update public.scpi_indicator_history h
set prix_reconstitution=213.21, valeur_realisation=174.71,
    prix_souscription=200,source_confidence=0.95,
    qa_status='manual_verified_issuer_authored_T2_2025_PDF_page_4_valuations',
    metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)
      || jsonb_build_object(
        'prix_reconstitution',jsonb_build_object('value',213.21,
            'reference_date','2025-06-30','source_url',i.url,'source_page',4,
            'document_type','issuer_authored_pdf_distributor_hosted',
            'publisher_original_binary_sha256','unavailable'),
        'valeur_realisation',jsonb_build_object('value',174.71,
            'reference_date','2025-06-30','source_url',i.url,'source_page',4,
            'document_type','issuer_authored_pdf_distributor_hosted',
            'publisher_original_binary_sha256','unavailable'))
from issuer_source i
where h.scpi_slug='edr-europa' and h.source_period='2025-T2'
  and h.qa_status='manual_verified_distributions_only_official_pdf_page_3'
  and h.prix_reconstitution is null and h.valeur_realisation is null
  and h.distribution_par_part=4.04;

insert into public.scpi_metric_certifications(
scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,
verification_status,verification_method,extraction_confidence)
values
('edr-europa','2025-T2','prix_reconstitution',213.21,'EUR/part',
'https://francescpi.com/scpi-de-rendement/edmond-de-rothschild-europa/bi/edmond-de-rothschild-europa-bulletin-2025-t2.pdf',4,
'Bulletin Edmond de Rothschild Europa n5 S1 2025, page PDF 4, valeur de reconstitution 213,21 EUR au 30/06/2025. Copie du PDF du gestionnaire diffusee par FranceSCPI, page verifiee visuellement, SHA de l original non atteste.',
'manual_verified_issuer_authored_distributor_pdf_page',
'issuer_authored_visual_page_original_hash_not_claimed',0.95),
('edr-europa','2025-T2','valeur_realisation',174.71,'EUR/part',
'https://francescpi.com/scpi-de-rendement/edmond-de-rothschild-europa/bi/edmond-de-rothschild-europa-bulletin-2025-t2.pdf',4,
'Bulletin Edmond de Rothschild Europa n5 S1 2025, page PDF 4, valeur de realisation 174,71 EUR au 30/06/2025. Copie du PDF du gestionnaire diffusee par FranceSCPI, page verifiee visuellement, SHA de l original non atteste.',
'manual_verified_issuer_authored_distributor_pdf_page',
'issuer_authored_visual_page_original_hash_not_claimed',0.95)
on conflict(scpi_slug,source_period,metric) do nothing;


-- First of TWO distinct 2024 accounting closings: values approved in
-- shareholders' December 2024 resolutions as of 30 June 2024.
-- The fund-authored report copy has SHA256 evidence; its publisher-host
-- binary is not being conflated with the archive mirror's SHA.
update public.scpi_indicator_history h
set qa_status='manual_verified_first_2024_closing_signed_issuer_report_and_legal_AG',
    source_confidence=0.95,
    metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)
     || jsonb_build_object(
      'prix_reconstitution',jsonb_build_object(
       'value',203.85,'reference_date','2024-06-30','source_url',h.source_url,
       'source_page',5,'mirror_pdf_sha256','a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d',
       'independent_corroboration','EdR Europa AGM 05/12/2024 resolutions: 14 382 326.18 EUR / 203.85 EUR per part'),
      'valeur_realisation',jsonb_build_object(
       'value',171.33,'reference_date','2024-06-30','source_url',h.source_url,
       'source_page',5,'mirror_pdf_sha256','a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d',
       'independent_corroboration','EdR Europa AGM 05/12/2024 resolutions: 12 087 877.24 EUR / 171.33 EUR per part'))
where h.scpi_slug='edr-europa' and h.source_period='2024-T2'
  and h.qa_status='mirror_sha256_verified_pending_issuer_crosscheck'
  and h.prix_reconstitution=203.85 and h.valeur_realisation=171.33
  and h.source_url='https://access.fortunyconseil.fr/api/v1/SCPI/files/rapport_annuel2024_230ee4f0327011f0ab012dfda4e19bae.pdf'
  and (h.metric_provenance->>'source_sha256')='a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d';

insert into public.scpi_metric_certifications(
scpi_slug,source_period,metric,value_numeric,unit,source_url,source_page,evidence_text,
verification_status,verification_method,extraction_confidence)
values
('edr-europa','2024-T2','prix_reconstitution',203.85,'EUR/part',
'https://access.fortunyconseil.fr/api/v1/SCPI/files/rapport_annuel2024_230ee4f0327011f0ab012dfda4e19bae.pdf',5,
'Rapport EDR REIM signe au 30/06/2024 page 5, reconstitution 14 382 326.18 EUR / 203.85 EUR par part. SHA archive a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d; AG 05/12/2024 resolutions independently matched.',
'manual_verified_issuer_authored_report_and_legal_ag',
'issuer_signed_pdf_mirror_sha_and_independent_AG_resolutions',0.95),
('edr-europa','2024-T2','valeur_realisation',171.33,'EUR/part',
'https://access.fortunyconseil.fr/api/v1/SCPI/files/rapport_annuel2024_230ee4f0327011f0ab012dfda4e19bae.pdf',5,
'Rapport EDR REIM signe au 30/06/2024 page 5, realisation 12 087 877.24 EUR / 171.33 EUR par part. SHA archive a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d; AG 05/12/2024 resolutions independently matched.',
'manual_verified_issuer_authored_report_and_legal_ag',
'issuer_signed_pdf_mirror_sha_and_independent_AG_resolutions',0.95)
on conflict(scpi_slug,source_period,metric) do nothing;

commit;
