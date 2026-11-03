-- RECOVERY-083: the existing candidate trigger must accept only a separately
-- verified progressive release already registered by the protected atomic RPC.
-- The strict historical/financial/legal certification trigger remains intact.
create or replace function maximus_agents.scpi_guard_new_candidate_release()
returns trigger language plpgsql security definer set search_path='' as $function$
declare
  ok boolean;
begin
  if coalesce(NEW.publication_authorized,false) and NEW.stage='partial_pass' then
    select (
      NEW.lifecycle='existing'
      and NEW.strict_pass is false
      and NEW.analysis_certified is false
      and exists (
        select 1
        from maximus_agents.scpi_progressive_active_releases p
        join maximus_agents.scpi_candidate_final_review r on r.scpi_slug=p.scpi_slug
        join maximus_agents.scpi_candidate_indicator_stage s on s.scpi_slug=p.scpi_slug
        where p.scpi_slug=NEW.scpi_slug and p.active is true
          and s.source_period=p.source_period
          and p.source_pdf_sha256=s.metric_provenance->'capitalisation'->>'pdf_sha256'
          and p.release_sha=r.review_evidence->'progressive_publication'->>'release_sha'
          and p.browser_report_sha256=r.review_evidence->'progressive_publication'->>'browser_report_sha256'
          and r.review_evidence->'progressive_publication'->>'disclosures_verified'='true'
          and r.review_evidence->'progressive_publication'->>'restricted_features_enforced'='true'
          and r.review_evidence->'progressive_publication'->>'reviewer_type'='DELEGATED_AUTOMATION_NOT_HUMAN'
          and 'LATEST_STATUTES_UNVERIFIED'=any(p.reservations)
          and 'UNRECONCILED_SHARE_FLOW'=any(p.reservations)
          and 'suitability_recommendations'=any(p.disabled_features)
          and 'share_movement_trend'=any(p.disabled_features)
          and 'uncertified_history_comparison'=any(p.disabled_features)
          and maximus_agents.scpi_delegated_actor_authorized(p.responsible_actor)
      )
    ) into ok;
    if not coalesce(ok,false) then
      raise exception 'SCPI_PROGRESSIVE_RELEASE_BLOCKED: immutable source, 12 browser checks, disclosed reservations and delegated release registry required for %', NEW.scpi_slug
      using errcode='check_violation';
    end if;
    return NEW;
  end if;

  -- Unmodified strict circuit for every other new candidate / publication.
  if coalesce(NEW.publication_authorized,false) and
     (NEW.lifecycle='candidate' or exists(
       select 1 from maximus_agents.scpi_candidate_release_members m
       where m.scpi_slug=NEW.scpi_slug
     )) then
    select (v.final_release_ready is true and t.full_surface_ready is true) into ok
    from maximus_agents.scpi_candidate_final_release_v1 v
    left join maximus_agents.scpi_candidate_tool_readiness t
      on t.scpi_slug=v.scpi_slug
    where v.scpi_slug=NEW.scpi_slug;
    if not coalesce(ok,false) then
      raise exception 'SCPI_CANDIDATE_FINAL_RELEASE_BLOCKED: verified source, financial/history/risk QA, signed audit and all Iroko-Atlas-parity site circuits required for %',NEW.scpi_slug
      using errcode='check_violation';
    end if;
  end if;
  return NEW;
end;
$function$;
