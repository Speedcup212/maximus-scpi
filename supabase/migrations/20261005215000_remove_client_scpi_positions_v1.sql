-- Remove the abandoned MaximusSCPI client portfolio V1 schema.
-- The table was empty when removed from production on 2026-10-05.
drop table if exists public.client_scpi_positions;
