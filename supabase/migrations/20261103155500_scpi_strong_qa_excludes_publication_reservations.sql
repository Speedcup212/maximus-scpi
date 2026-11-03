-- RECOVERY-081: a public factual listing is not a strong/full certification.
-- The original predicate only excluded 'partial'/'review' and would wrongly
-- accept 'verified_primary_source_with_reserves' as strict QA.
create or replace function public.scpi_is_strong_qa(p_status text)
returns boolean language sql immutable
set search_path='' as $$
  select coalesce(p_status,'') not ilike 'invalid%'
    and coalesce(p_status,'') not ilike '%partial%'
    and coalesce(p_status,'') not ilike '%review%'
    and coalesce(p_status,'') not ilike '%reserve%'
    and coalesce(p_status,'') not ilike '%provisional%'
    and (
      coalesce(p_status,'') ilike '%verified%'
      or coalesce(p_status,'')='certified_official'
    );
$$;
-- This function gates history QA. Existing certified statuses preserve their
-- result; provisional SCPI public visibility remains independently controlled
-- by the exact-hash private active-release registry and existing public RLS.
