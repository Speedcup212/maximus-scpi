-- RECOVERY-207: additive exact part counts for private candidate staging.
-- The legacy BIGINT field is never filled by rounding a fractional unit quantity.
alter table maximus_agents.scpi_candidate_indicator_stage
  add column if not exists nombre_parts_exact numeric;
comment on column maximus_agents.scpi_candidate_indicator_stage.nombre_parts_exact is
  'Exact issuer share count, including decimalized units; SOURCE ONLY, private staging, never cast to BIGINT.';
alter table maximus_agents.scpi_candidate_indicator_stage
  add constraint candidate_stage_exact_parts_guard
  check (
     nombre_parts_exact is null
     or (
       nombre_parts_exact >= 0
       and (
         (nombre_parts_exact=trunc(nombre_parts_exact)
          and (nombre_parts is null or nombre_parts::numeric=nombre_parts_exact))
         or
         (nombre_parts_exact<>trunc(nombre_parts_exact) and nombre_parts is null)
       )
     )
  );
