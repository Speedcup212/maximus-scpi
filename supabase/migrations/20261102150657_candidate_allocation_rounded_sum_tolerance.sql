-- Applied to MaximusSCPI on 2026-11-02 as Supabase migration 20261102150657.
-- A five-category chart rounded to one decimal can correctly sum to 99.9%.
-- Do not falsify allocations by changing a category to reach 100%.
do $repair$
declare v text; old_count integer; already_count integer;
begin
 select pg_get_viewdef('maximus_agents.scpi_candidate_release_circuit_v3'::regclass,true) into v;
 old_count := (length(v)-length(replace(v,'a_1.total = 100::numeric',''))) / length('a_1.total = 100::numeric');
 already_count := (length(v)-length(replace(v,'0.05 * a_1.row_count',''))) / length('0.05 * a_1.row_count');
 if old_count = 2 then
   v := replace(v,'a_1.total = 100::numeric',
        'abs(a_1.total - 100::numeric) <= (0.05::numeric * a_1.row_count)');
   execute 'create or replace view maximus_agents.scpi_candidate_release_circuit_v3 as ' || v;
 elsif old_count = 0 and already_count = 2 then
   null; -- already migrated in this database
 else
   raise exception 'Unexpected allocation gate format: old=%, migrated=%',old_count,already_count;
 end if;
end
$repair$;
alter view maximus_agents.scpi_candidate_release_circuit_v3 set (security_invoker=true);
revoke all on maximus_agents.scpi_candidate_release_circuit_v3 from public, anon, authenticated;
grant select on maximus_agents.scpi_candidate_release_circuit_v3 to service_role;
