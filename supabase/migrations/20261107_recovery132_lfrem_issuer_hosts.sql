-- RECOVERY-132 issuer allowlist: La Française REM's own public bulletin index
-- https://client.la-francaise.com/bt links to official doc.la-francaise.com PDFs.
-- Official hosts are discovery/transport allowlists, NOT a verified PDF or QA.
-- Every fund/period still requires dual PDF reader, matching identity and SHA256.
INSERT INTO maximus_agents.scpi_candidate_issuer_hosts
(hostname,issuer_name,approval_source)
VALUES
 ('client.la-francaise.com','La Française REM','https://client.la-francaise.com/bt'),
 ('doc.la-francaise.com','La Française REM','https://client.la-francaise.com/bt')
ON CONFLICT (hostname) DO NOTHING;
