-- The existing protected service requires only read access to public document metadata.
GRANT SELECT ON maximus_agents.scpi_candidate_document_index TO service_role;
