-- RECOVERY-080: staged certification is not the same as public factual listing.
-- Explicitly authorize the single new 'partial_pass' status without relaxing
-- existing strict publication or public RLS membership checks.
-- Actual anon visibility additionally requires exact SHA-bound evidence in
-- maximus_agents.scpi_progressive_active_releases.
alter table maximus_agents.scpi_universe
 drop constraint if exists scpi_universe_stage_check;
alter table maximus_agents.scpi_universe
 add constraint scpi_universe_stage_check
 check (stage = any(array['identity_only'::text,'primary_source_found'::text,
 'ingesting'::text,'strict_pass'::text,'partial_pass'::text,'excluded'::text]));
alter table maximus_agents.scpi_universe
 drop constraint if exists forbid_unverified_publication;
alter table maximus_agents.scpi_universe
 add constraint forbid_unverified_publication
 check (
   not publication_authorized
   or (
     lifecycle='existing'
     and (
       (stage='strict_pass' and strict_pass and analysis_certified)
       or (stage='partial_pass' and not strict_pass and not analysis_certified)
     )
   )
 );
alter table maximus_agents.scpi_universe
 add constraint partial_publication_not_full_certification
 check (stage<>'partial_pass'
        or (lifecycle='existing'
           and strict_pass=false and analysis_certified=false
           and publication_authorized=true));
-- Explicit negative test: a provisional row still fails without the private
-- active-release registry because public.maximus_scpi_is_in_public_cohort
-- requires it and the current RLS predicate is unchanged.
