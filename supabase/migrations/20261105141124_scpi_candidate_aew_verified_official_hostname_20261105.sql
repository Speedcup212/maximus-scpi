-- Verified official publisher host for the 2026-S1 AEW Opportunites Europe pilot.
-- Domain is exact-match; this is not financial QA or release permission.
insert into maximus_agents.scpi_candidate_issuer_hosts
(hostname,issuer_name,approval_source)
values
('www.aewpatrimoine.com','AEW Patrimoine','https://www.aewpatrimoine.com/nos-produits/scpi-dimmobilier-dentreprise/aew-opportunites-europe')
on conflict (hostname) do nothing;
