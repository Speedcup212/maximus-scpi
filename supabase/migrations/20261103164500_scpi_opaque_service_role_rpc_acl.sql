-- RECOVERY-082: reconcile Supabase opaque sb_secret_ backend keys with privileged RPCs.
-- The caller is authorized by PostgreSQL FUNCTION EXECUTE ACL before entering
-- the SECURITY DEFINER body; request.jwt.claim.role is absent for opaque keys.
-- Existing financial/issuer/browser/disclosure/atomic checks are UNCHANGED.
CREATE OR REPLACE FUNCTION public.maximus_prepare_progressive_release(p_release_sha text, p_scpi_slug text, p_expected_source_sha256 text, p_browser_report jsonb, p_browser_report_sha256 text, p_browser_run_url text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_actor text:='codex-automation-delegated-release';
 v_gate record;
 v_report_count integer;
 v_before integer;
 v_warnings text[];
 v_affected text[];
begin
 -- Security: function EXECUTE privileges are granted exclusively to service_role.
 -- Supabase sb_secret_ keys map to that DB role but carry no JWT role claim;
 -- ACL is the authoritative caller gate, not request.jwt.claim.role.
 if p_release_sha !~ '^[a-f0-9]{40}$' or p_scpi_slug !~ '^[a-z0-9-]+$'
   or p_expected_source_sha256 !~ '^[a-f0-9]{64}$'
   or p_browser_report_sha256 !~ '^[a-f0-9]{64}$'
   or p_browser_run_url not like 'https://github.com/%/actions/runs/%' then
  raise exception 'Invalid progressive source, SHA, or browser artifact';
 end if;
 if not maximus_agents.scpi_delegated_actor_authorized(v_actor) then
   raise exception 'Standing owner delegation not enabled';
 end if;
 if p_browser_report->>'status' <> 'PASS' or p_browser_report->>'candidate' <> p_scpi_slug
   or p_browser_report->>'commit' <> p_release_sha
   or coalesce(jsonb_array_length(p_browser_report->'cases'),0) <> 12
   or p_browser_report->>'publication_authorized' <> 'false' then
   raise exception 'Twelve exact-checkout source-backed UI cases not proven';
 end if;
 if (select count(distinct (c->>'surface') || ':' || (c->>'width'))
     from jsonb_array_elements(p_browser_report->'cases') as c
     where c->>'status'='PASS'
       and (c->>'width')::integer in (1440,390)) <> 12 then
    raise exception '12 distinct desktop/mobile provisional checks missing';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('maximus-progressive-release'));
 select c.* into v_gate from maximus_agents.scpi_candidate_release_circuit_v3 c
  join maximus_agents.scpi_candidate_indicator_stage s using(scpi_slug)
  where c.scpi_slug=p_scpi_slug
    and c.lifecycle='candidate'
    and c.pdf_sha256=p_expected_source_sha256
    and c.source_period=s.source_period and c.source_url=s.source_url
    and c.publisher_pdf_valid
    and c.current_qa_fields>=12 and c.core_qa_fields>=11
    and c.annual_qa_fields>=4
    and c.regulatory_documents_verified>=2
    and c.current_indicators_ready
    and c.allocations_verified and c.bulletin_analysis_ready
    and c.live_liquidity_ready and c.historical_periods>=2
    and c.live_trajectory_points>=2;
 if not found then raise exception 'Official financial QA and material-data gate failed'; end if;
 if not exists (
  select 1 from maximus_agents.scpi_candidate_final_review r
  where r.scpi_slug=p_scpi_slug
    and r.verified_field_display_passed and r.debt_and_leverage_review_passed
    and r.liquidity_risk_review_passed and r.fees_and_redemption_review_passed
    and r.frontend_contract_smoke_passed
    and r.review_evidence->'browser_smoke'->>'status'='PASS'
    and coalesce((r.review_evidence->'browser_smoke'->>'case_count')::integer,0)>=12
    and coalesce((r.review_evidence->>'material_falsehood')::boolean,false)=false
  ) then raise exception 'Independent essential UI/financial review failed'; end if;
 if (select count(*) from maximus_agents.scpi_candidate_regulatory_documents d
    where d.scpi_slug=p_scpi_slug and d.document_kind in ('dic','note')
      and d.identity_verified and d.kind_verified
      and d.pdf_sha256 ~ '^[a-f0-9]{64}$')<>2 then
   raise exception 'Mandatory DIC and note missing';
 end if;
 v_before := (select count(*) from public.scpi_indicators);
 if v_before<>(select count(*) from public.scpi_trajectory_pilot where enabled)
   or exists(select 1 from public.scpi_indicators where scpi_slug=p_scpi_slug)
   or exists(select 1 from maximus_agents.scpi_progressive_active_releases where scpi_slug=p_scpi_slug and active)
  then raise exception 'Public cohort or duplicate provisional release mismatch'; end if;

 -- Only contained defects are eligible. Do not manufacture full certification.
 v_warnings:=array['LATEST_STATUTES_UNVERIFIED','HISTORY_NOT_RECONCILED',
   'RISK_SFDR_TEXT_UNDER_REVIEW','UNRECONCILED_SHARE_FLOW','LAST_OFFICIAL_VALUATION_HISTORICAL'];
 v_affected:=array['suitability_recommendations','share_movement_trend',
   'derived_capital_flow','uncertified_history_comparison','legal_terms_currentness',
   'undated_valuation_comparison'];
 update maximus_agents.scpi_candidate_final_review r
  set review_evidence=pg_catalog.jsonb_set(
     coalesce(r.review_evidence,'{}'::jsonb),'{progressive_publication}',
     pg_catalog.jsonb_build_object(
       'disclosures_verified',true,'restricted_features_enforced',true,
       'source','12 REAL CHROMIUM COMPONENTS / TRUSTED GITHUB BUILD',
       'browser_report_sha256',p_browser_report_sha256,
       'browser_run_url',p_browser_run_url,
       'release_sha',p_release_sha,
       'reviewer',v_actor,'reviewer_type','DELEGATED_AUTOMATION_NOT_HUMAN',
       'cases',p_browser_report->'cases',
       'reservations',to_jsonb(v_warnings),'disabled_features',to_jsonb(v_affected)),
    true)
 where r.scpi_slug=p_scpi_slug;
 if not exists(
  select 1 from maximus_agents.scpi_candidate_progressive_publication_v1 g
  where g.scpi_slug=p_scpi_slug and g.publication_review_status='READY_WITH_RESERVES'
    and 'LATEST_STATUTES_UNVERIFIED'=any(g.reservations)
    and 'UNRECONCILED_SHARE_FLOW'=any(g.reservations)
 ) then raise exception 'Partial-publication gate not satisfied after evidence'; end if;
 insert into maximus_agents.scpi_progressive_prepared_releases(
  release_sha,scpi_slug,source_pdf_sha256,browser_report_sha256,
  browser_run_url,reserved_before,responsible_actor)
 values(p_release_sha,p_scpi_slug,p_expected_source_sha256,p_browser_report_sha256,
  p_browser_run_url,v_before,v_actor)
 on conflict(release_sha) do update
  set browser_report_sha256=excluded.browser_report_sha256,
      browser_run_url=excluded.browser_run_url,
      expires_at=now()+interval '2 days';
 return pg_catalog.jsonb_build_object('prepared',true,'before',v_before,
   'expected_after',v_before+1,'candidate',p_scpi_slug,'release_sha',p_release_sha,
   'certified',false,'source_pdf_sha256',p_expected_source_sha256);
end $function$


CREATE OR REPLACE FUNCTION public.maximus_publish_verified_progressive_release(p_release_sha text, p_netlify_deploy_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_prepared record;v_before integer;v_after integer;v_updated integer;
 v_stage record;v_gate record;v_evidence jsonb;
begin
 -- Security: function EXECUTE privileges are granted exclusively to service_role.
 -- Supabase sb_secret_ keys map to that DB role but carry no JWT role claim;
 -- ACL is the authoritative caller gate, not request.jwt.claim.role.
 if p_release_sha !~ '^[a-f0-9]{40}$' or p_netlify_deploy_id !~ '^[a-f0-9]{24}$'
 then raise exception 'Exact production Git/Netlify SHAs required';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('maximus-progressive-release'));
 select * into v_prepared from maximus_agents.scpi_progressive_prepared_releases
  where release_sha=p_release_sha and expires_at>now() for update;
 if not found or not maximus_agents.scpi_delegated_actor_authorized(v_prepared.responsible_actor)
 then raise exception 'No current delegated QA proof for deployed SHA'; end if;
 select * into v_gate from maximus_agents.scpi_candidate_progressive_publication_v1
  where scpi_slug=v_prepared.scpi_slug and publication_review_status='READY_WITH_RESERVES'
    and factual_listing_qa_pass and complete_certification=false;
 if not found then raise exception 'Verified partial-source gate revoked';end if;
 select * into v_stage from maximus_agents.scpi_candidate_indicator_stage
  where scpi_slug=v_prepared.scpi_slug
    and source_period=v_gate.source_period
    and source_url=v_gate.source_url;
 if not found or v_gate.pdf_sha256<>v_prepared.source_pdf_sha256
 then raise exception 'Prepared issuer SHA or source period drift';end if;
 select review_evidence into v_evidence from maximus_agents.scpi_candidate_final_review
  where scpi_slug=v_prepared.scpi_slug;
 if v_evidence->'progressive_publication'->>'release_sha' <> p_release_sha
   or v_evidence->'progressive_publication'->>'browser_report_sha256' <> v_prepared.browser_report_sha256
   or v_evidence->'progressive_publication'->>'disclosures_verified' <> 'true'
   or v_evidence->'progressive_publication'->>'restricted_features_enforced' <> 'true'
 then raise exception 'Provisional UI release evidence changed';end if;
 v_before:=(select count(*) from public.scpi_indicators);
 if v_before<>v_prepared.reserved_before
   or v_before<>(select count(*) from public.scpi_trajectory_pilot where enabled)
   or exists(select 1 from public.scpi_indicators where scpi_slug=v_prepared.scpi_slug)
 then raise exception 'Public count mismatch, partial publication rolled back';end if;
 insert into maximus_agents.scpi_progressive_active_releases(
 scpi_slug,release_sha,netlify_deploy_id,source_pdf_sha256,browser_report_sha256,
 reservations,disabled_features,responsible_actor,source_period)
 values(v_prepared.scpi_slug,p_release_sha,p_netlify_deploy_id,v_prepared.source_pdf_sha256,
 v_prepared.browser_report_sha256, v_gate.reservations,
 array['suitability_recommendations','share_movement_trend','derived_capital_flow',
 'uncertified_history_comparison','legal_terms_currentness','undated_valuation_comparison'],
 v_prepared.responsible_actor,v_gate.source_period);
 insert into public.scpi_indicators
 select (pg_catalog.jsonb_populate_record(null::public.scpi_indicators,
  (to_jsonb(s)-'staged_at'-'stage_note') || pg_catalog.jsonb_build_object(
    'qa_status','verified_primary_source_with_reserves',
    'source_type','issuer_official_pdf_provisional'))).*
 from maximus_agents.scpi_candidate_indicator_stage s
 where s.scpi_slug=v_prepared.scpi_slug;
 get diagnostics v_updated=row_count;
 if v_updated<>1 then raise exception 'Provisional source row not inserted';end if;
 insert into public.scpi_trajectory_pilot(scpi_slug,pilot_order,rationale,enabled)
 values(v_prepared.scpi_slug,
   (select coalesce(max(pilot_order),0)+1 from public.scpi_trajectory_pilot),
   'Progressive issuer publication: dated official facts and explicit reservations',true);
 update maximus_agents.scpi_universe u
 set lifecycle='existing',stage='partial_pass',
 strict_pass=false,analysis_certified=false,publication_authorized=true,
 review_note=coalesce(u.review_note,'')||
 ' | Progressive public, source 2026-T2, explicit reservations, backend actor '||
 v_prepared.responsible_actor,updated_at=now()
 where u.scpi_slug=v_prepared.scpi_slug and u.lifecycle='candidate';
 get diagnostics v_updated=row_count;
 if v_updated<>1 then raise exception 'Provisional universe lifecycle failed';end if;
 v_after:=(select count(*) from public.scpi_indicators);
 if v_after<>v_before+1 or (select count(*) from public.scpi_trajectory_pilot where enabled)<>v_after
   or not public.maximus_scpi_is_in_public_cohort(v_prepared.scpi_slug)
 then raise exception 'Atomic provisional count or RLS test failed';end if;
 delete from maximus_agents.scpi_progressive_prepared_releases
   where release_sha=p_release_sha;
 return pg_catalog.jsonb_build_object('published',true,'certified',false,
  'publication_status','published_with_reserves','candidate_slugs',array[v_prepared.scpi_slug],
  'before',v_before,'after',v_after,'netlify_deploy_id',p_netlify_deploy_id,
  'release_sha',p_release_sha);
end $function$

revoke all on function public.maximus_prepare_progressive_release(text,text,text,jsonb,text,text) from PUBLIC,anon,authenticated;
grant execute on function public.maximus_prepare_progressive_release(text,text,text,jsonb,text,text) to service_role;
revoke all on function public.maximus_publish_verified_progressive_release(text,text) from PUBLIC,anon,authenticated;
grant execute on function public.maximus_publish_verified_progressive_release(text,text) to service_role;
