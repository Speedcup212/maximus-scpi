-- Source-registry provenance only; no approval of investor suitability or publication.
INSERT INTO public.scpi_source_registry
(scpi_slug,scpi_name,management_company,official_scpi_page_url,bulletin_url,annual_report_url,
dic_url,note_information_url,statutes_url,source_domain,last_document_period,last_document_date,
last_verified_at,verification_status,confidence_level,notes,automation_enabled)
SELECT u.scpi_slug,u.name,u.management_company,u.origin_url,semi.source_url,annual.source_url,
dic.source_url,ni.source_url,statutes.source_url,'https://www.aewpatrimoine.com',
'2026-S1',date '2026-06-30',now(),'verified','high',
'Issuer PDF identity SHA and document kinds verified; legal-currentness and investor adequacy NOT certified; no publication.',
true
FROM maximus_agents.scpi_universe u
JOIN maximus_agents.scpi_candidate_pdf_validation annual
 ON annual.scpi_slug=u.scpi_slug AND annual.source_period='2025-RA'
 AND annual.document_kind='annual_report' AND annual.document_identity_verified
JOIN maximus_agents.scpi_candidate_pdf_validation semi
 ON semi.scpi_slug=u.scpi_slug AND semi.source_period='2026-S1'
 AND semi.document_kind='semiannual_bulletin' AND semi.document_identity_verified
JOIN maximus_agents.scpi_candidate_regulatory_documents dic
 ON dic.scpi_slug=u.scpi_slug AND dic.document_kind='dic' AND dic.identity_verified AND dic.kind_verified
JOIN maximus_agents.scpi_candidate_regulatory_documents ni
 ON ni.scpi_slug=u.scpi_slug AND ni.document_kind='note' AND ni.identity_verified AND ni.kind_verified
JOIN maximus_agents.scpi_candidate_regulatory_documents statutes
 ON statutes.scpi_slug=u.scpi_slug AND statutes.document_kind='statutes'
 AND statutes.identity_verified AND statutes.kind_verified
WHERE u.scpi_slug='aew-opportunites-europe' AND u.lifecycle='candidate' AND NOT u.publication_authorized
AND maximus_agents.is_verified_candidate_issuer_source(annual.source_url)
AND maximus_agents.is_verified_candidate_issuer_source(semi.source_url)
AND maximus_agents.is_verified_candidate_issuer_source(dic.source_url)
AND maximus_agents.is_verified_candidate_issuer_source(ni.source_url)
AND maximus_agents.is_verified_candidate_issuer_source(statutes.source_url)
ON CONFLICT(scpi_slug) DO NOTHING;
