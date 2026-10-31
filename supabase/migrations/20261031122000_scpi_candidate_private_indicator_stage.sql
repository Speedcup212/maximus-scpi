-- Candidate-only staging matches the public indicator contract without leaking
-- unapproved data to public scpi_indicators, comparator or simulators.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_indicator_stage
(LIKE public.scpi_indicators INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES,
 staged_at timestamptz NOT NULL DEFAULT now(),
 stage_note text NOT NULL DEFAULT '');
ALTER TABLE maximus_agents.scpi_candidate_indicator_stage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON maximus_agents.scpi_candidate_indicator_stage FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON maximus_agents.scpi_candidate_indicator_stage TO service_role;
