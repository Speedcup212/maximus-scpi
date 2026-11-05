SET LOCAL lock_timeout = '3s';
ALTER TABLE maximus_agents.scpi_candidate_document_index
 DROP CONSTRAINT scpi_candidate_document_index_document_kind_check;
ALTER TABLE maximus_agents.scpi_candidate_document_index
 ADD CONSTRAINT scpi_candidate_document_index_document_kind_check
 CHECK (document_kind = ANY (ARRAY[
 'quarterly_bulletin'::text,'semiannual_bulletin'::text,'annual_report'::text,
 'dic'::text,'note_information'::text
 ]));
ALTER TABLE maximus_agents.scpi_candidate_document_index
 DROP CONSTRAINT scpi_candidate_document_index_source_period_check;
ALTER TABLE maximus_agents.scpi_candidate_document_index
 ADD CONSTRAINT scpi_candidate_document_index_source_period_check
 CHECK (
 source_period ~ '^20[0-9]{2}-(T[1-4]|RA)$'
 OR (document_kind='semiannual_bulletin' AND source_period ~ '^20[0-9]{2}-S[12]$')
 );
