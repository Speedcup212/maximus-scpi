-- EdR Europa 66th fund: preserve original strict-pass predicate for the 65
-- incumbent funds. The additional publication exception is backed by
-- the certified source, active pilot, verified registry and exact PDF SHA256.
-- This does not whitelist arbitrary staged SCPI or non-certified analyses.
create or replace function public.maximus_scpi_is_in_public_cohort(p_slug text)
returns boolean language sql stable security definer set search_path to ''
as $function$
select exists (
  select 1 from maximus_agents.scpi_universe u
  where u.scpi_slug=p_slug and u.lifecycle='existing'
    and u.stage='strict_pass' and u.strict_pass is true
    and u.analysis_certified is true and u.publication_authorized is true
) or (
  p_slug='edr-europa'
  and exists (select 1 from public.scpi_trajectory_pilot p
    where p.scpi_slug='edr-europa' and p.enabled is true)
  and exists (select 1 from public.scpi_source_registry s
    where s.scpi_slug='edr-europa' and s.verification_status='verified')
  and exists (select 1 from public.scpi_bulletin_analysis a
    where a.scpi_slug='edr-europa' and a.certification_status='certified'
      and a.current_source_certified is true and a.comparison_certified is true
      and a.certified_source_url like 'https://edr-europa.com/%')
  and exists (select 1 from public.scpi_bulletins b
    where b.scpi_slug='edr-europa' and b.period='2026-T2'
      and b.pdf_sha256='401987ac4d713eb30253a3d327b76b723c73753f72b5b31e28ffcd504f737d7d')
);
$function$;

comment on function public.maximus_scpi_is_in_public_cohort(text)
is 'Public cohort protection: original maximus_agents strict-pass population plus EdR Europa after exact issuer PDF and current/historic certification. Any invalidation revokes EdR public trajectory automatically.';
