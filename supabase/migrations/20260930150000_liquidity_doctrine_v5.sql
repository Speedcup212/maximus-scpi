-- MaximusSCPI — doctrine de liquidité v5
--
-- Principes :
--   < 3 % : vigilance faible ; pas d'alerte de liquidité par le seul ratio.
--   3 % à < 5 % : vigilance modérée.
--   >= 5 % : vigilance élevée.
--   >= 10 % : même badge élevé, libellé « Liquidité critique ».
-- La tendance enrichit le diagnostic mais ne relève jamais seule le badge.
-- Les SCPI à capital fixe, variabilité suspendue ou marché secondaire exclusif
-- ne sont pas classées avec le ratio « parts en attente / parts totales ».
-- Une donnée de qualité insuffisante reste hors du calcul de vigilance.

create or replace function public.enforce_scpi_liquidity_doctrine_v5(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  a public.scpi_bulletin_analysis%rowtype;
  c public.scpi_indicators%rowtype;
  p1 public.scpi_indicator_history%rowtype;
  p2 public.scpi_indicator_history%rowtype;
  item jsonb;
  cleaned_alerts jsonb := '[]'::jsonb;
  cleaned_watch jsonb := '[]'::jsonb;
  cleaned_improvements jsonb := '[]'::jsonb;
  metric text;
  total_shares numeric;
  cap_m numeric;
  wait_ratio numeric;
  prev1_ratio numeric;
  prev2_ratio numeric;
  delta_qoq numeric;
  rapid_rise boolean := false;
  improving boolean := false;
  active_secondary_regime boolean := false;
  queue_applicable boolean := false;
  evidence_ok boolean := false;
  direct_ratio_evidence numeric;
  evidence_text text;
  m text[];
  high_count integer := 0;
  medium_count integer := 0;
  medium_watch_count integer := 0;
  final_risk text := 'low';
begin
  select * into a from public.scpi_bulletin_analysis where scpi_slug=p_slug;
  if not found then return; end if;
  select * into c from public.scpi_indicators where scpi_slug=p_slug;
  if not found then return; end if;

  select exists(
    select 1 from public.scpi_structural_events e
    where e.scpi_slug=p_slug
      and public.scpi_is_strong_qa(e.verification_status)
      and e.effective_date <= current_date
      and (e.end_date is null or e.end_date >= current_date)
      and e.event_type in ('variability_suspended','secondary_market_only','capital_regime_change')
  ) into active_secondary_regime;

  queue_applicable := lower(coalesce(c.capital_type,''))='variable' and not active_secondary_regime;

  -- Supprime les anciens signaux de liquidité avant recalcul. Le passage est idempotent.
  for item in select value from jsonb_array_elements(coalesce(a.alerts,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');
    if metric in ('liquidite_retraits','parts_attente_retrait','parts_en_attente_de_retrait') then continue; end if;
    if metric='walb' then
      item:=jsonb_set(item,'{message}',to_jsonb(replace(replace(coalesce(item->>'message',''),'WALB de ','Durée ferme des baux : '),'échéances fermes','échéances locatives')),true);
    end if;
    cleaned_alerts:=cleaned_alerts||jsonb_build_array(item);
  end loop;

  for item in select value from jsonb_array_elements(coalesce(a.watch_points,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');
    if metric in ('liquidite_retraits','parts_attente_retrait','parts_en_attente_de_retrait','data_quality_liquidite','data_quality_liquidite_regime') then continue; end if;
    if metric='walb' then
      item:=jsonb_set(item,'{message}',to_jsonb(replace(replace(coalesce(item->>'message',''),'WALB de ','Durée ferme des baux : '),'échéances fermes','échéances locatives')),true);
    end if;
    cleaned_watch:=cleaned_watch||jsonb_build_array(item);
  end loop;

  for item in select value from jsonb_array_elements(coalesce(a.improvements,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');
    if metric in ('liquidite_retraits','parts_attente_retrait','parts_en_attente_de_retrait') then continue; end if;
    cleaned_improvements:=cleaned_improvements||jsonb_build_array(item);
  end loop;

  if c.nombre_parts is not null and c.nombre_parts>0 then
    total_shares:=c.nombre_parts;
  elsif c.capitalisation is not null and c.prix_souscription is not null and c.prix_souscription>0 then
    cap_m:=case when c.capitalisation>100000 then c.capitalisation/1000000.0 else c.capitalisation end;
    if cap_m>0 then total_shares:=(cap_m*1000000.0)/c.prix_souscription; end if;
  end if;

  if queue_applicable and c.parts_attente_retrait is not null and c.parts_attente_retrait>=0 and total_shares is not null and total_shares>0 then
    wait_ratio:=c.parts_attente_retrait::numeric/total_shares*100.0;

    evidence_ok:=coalesce(a.current_source_certified,false)
      and public.scpi_metric_is_certified(p_slug,a.current_period,'parts_attente_retrait')
      and (
        public.scpi_metric_is_certified(p_slug,a.current_period,'nombre_parts')
        or (
          public.scpi_metric_is_certified(p_slug,a.current_period,'capitalisation')
          and public.scpi_metric_is_certified(p_slug,a.current_period,'prix_souscription')
        )
      );

    -- Certains bulletins impriment directement le ratio dans la même preuve que le nombre de parts.
    -- On accepte cette preuve si elle concorde à 0,10 point près avec le calcul.
    if not evidence_ok and coalesce(a.current_source_certified,false)
       and public.scpi_metric_is_certified(p_slug,a.current_period,'parts_attente_retrait') then
      select mc.evidence_text into evidence_text
      from public.scpi_metric_certifications mc
      where mc.scpi_slug=p_slug
        and public.scpi_period_key(mc.source_period)=public.scpi_period_key(a.current_period)
        and mc.metric='parts_attente_retrait'
        and mc.verification_status='auto_verified_with_evidence'
      order by mc.verified_at desc nulls last, mc.created_at desc
      limit 1;
      if evidence_text is not null then
        m:=regexp_match(evidence_text,'([0-9]+([,.][0-9]+)?)\s*%\s*des\s+parts','i');
        if m is not null and array_length(m,1)>=1 then
          direct_ratio_evidence:=replace(m[1],',','.')::numeric;
          evidence_ok:=abs(direct_ratio_evidence-wait_ratio)<=0.10;
        end if;
      end if;
    end if;

    -- La tendance n'est utilisée qu'en contexte historique certifié et ne relève pas le badge seule.
    if a.comparison_certified and a.previous_period is not null then
      select h.* into p1
      from public.scpi_indicator_history h
      where h.scpi_slug=p_slug
        and public.scpi_period_key(h.source_period)=public.scpi_period_key(a.previous_period)
        and public.scpi_is_strong_qa(h.qa_status)
      order by coalesce(h.source_confidence,0) desc,h.snapshot_at desc
      limit 1;

      if found and p1.parts_attente_retrait is not null then
        if p1.nombre_parts is not null and p1.nombre_parts>0 then
          prev1_ratio:=p1.parts_attente_retrait::numeric/p1.nombre_parts::numeric*100.0;
        elsif p1.capitalisation is not null and p1.prix_souscription is not null and p1.prix_souscription>0 then
          cap_m:=case when p1.capitalisation>100000 then p1.capitalisation/1000000.0 else p1.capitalisation end;
          if cap_m>0 then prev1_ratio:=p1.parts_attente_retrait::numeric/((cap_m*1000000.0)/p1.prix_souscription)*100.0; end if;
        end if;
      end if;

      if public.scpi_period_key(a.previous_period) is not null then
        select h.* into p2
        from public.scpi_indicator_history h
        where h.scpi_slug=p_slug
          and public.scpi_period_key(h.source_period)=case when mod(public.scpi_period_key(a.previous_period),10)>1 then public.scpi_period_key(a.previous_period)-1 else ((public.scpi_period_key(a.previous_period)/10)-1)*10+4 end
          and public.scpi_is_strong_qa(h.qa_status)
        order by coalesce(h.source_confidence,0) desc,h.snapshot_at desc
        limit 1;
        if found and p2.parts_attente_retrait is not null then
          if p2.nombre_parts is not null and p2.nombre_parts>0 then
            prev2_ratio:=p2.parts_attente_retrait::numeric/p2.nombre_parts::numeric*100.0;
          elsif p2.capitalisation is not null and p2.prix_souscription is not null and p2.prix_souscription>0 then
            cap_m:=case when p2.capitalisation>100000 then p2.capitalisation/1000000.0 else p2.capitalisation end;
            if cap_m>0 then prev2_ratio:=p2.parts_attente_retrait::numeric/((cap_m*1000000.0)/p2.prix_souscription)*100.0; end if;
          end if;
        end if;
      end if;
    end if;

    if prev1_ratio is not null then delta_qoq:=wait_ratio-prev1_ratio; end if;
    rapid_rise:=wait_ratio>=2 and ((delta_qoq is not null and delta_qoq>=1) or (prev2_ratio is not null and prev2_ratio>0 and wait_ratio>=2*prev2_ratio));
    improving:=wait_ratio<3 and prev1_ratio is not null and prev2_ratio is not null and prev2_ratio>prev1_ratio and prev1_ratio>wait_ratio;

    if evidence_ok then
      if wait_ratio>=10 then
        cleaned_alerts:=cleaned_alerts||jsonb_build_array(jsonb_build_object('metric','liquidite_retraits','severity','high','current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),'message','Liquidité critique : '||round(wait_ratio,2)::text||' % des parts sont en attente de retrait.'));
      elsif wait_ratio>=5 then
        cleaned_alerts:=cleaned_alerts||jsonb_build_array(jsonb_build_object('metric','liquidite_retraits','severity','high','current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),'message','Liquidité : '||round(wait_ratio,2)::text||' % des parts sont en attente de retrait, tension importante.'||case when rapid_rise and delta_qoq is not null then ' Hausse de '||round(delta_qoq,2)::text||' point(s) sur le trimestre.' else '' end));
      elsif wait_ratio>=3 then
        cleaned_watch:=cleaned_watch||jsonb_build_array(jsonb_build_object('metric','liquidite_retraits','severity','medium','current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),'message','Liquidité : '||round(wait_ratio,2)::text||' % des parts sont en attente de retrait, tension à surveiller.'||case when rapid_rise and delta_qoq is not null then ' Hausse de '||round(delta_qoq,2)::text||' point(s) sur le trimestre.' else '' end));
      elsif wait_ratio>=2 and rapid_rise then
        cleaned_watch:=cleaned_watch||jsonb_build_array(jsonb_build_object('metric','liquidite_retraits','severity','info','current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),'message','Liquidité à observer : '||round(wait_ratio,2)::text||' % des parts sont en attente de retrait ; la tendance se dégrade rapidement, sans franchir le seuil de vigilance modérée.'));
      end if;

      if improving then
        cleaned_improvements:=cleaned_improvements||jsonb_build_array(jsonb_build_object('metric','liquidite_retraits','severity','info','current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),'message','Liquidité en amélioration : la part des retraits en attente baisse sur deux trimestres et repasse sous 3 %.'));
      end if;
    else
      cleaned_watch:=cleaned_watch||jsonb_build_array(jsonb_build_object('metric','data_quality_liquidite','severity','info','quality_issue',true,'message','Liquidité non classée automatiquement : la preuve documentaire du ratio courant est insuffisante.'));
    end if;
  elsif c.parts_attente_retrait is not null and c.parts_attente_retrait>0 and not queue_applicable then
    cleaned_watch:=cleaned_watch||jsonb_build_array(jsonb_build_object('metric','data_quality_liquidite_regime','severity','info','quality_issue',true,'message','File de retraits non utilisée pour le niveau de vigilance : le régime de capital ou de marché secondaire exige une lecture spécifique de la liquidité.'));
  end if;

  select count(*) filter(where value->>'severity'='high' and coalesce(value->>'quality_issue','false')<>'true'),
         count(*) filter(where value->>'severity'='medium' and coalesce(value->>'quality_issue','false')<>'true')
  into high_count,medium_count from jsonb_array_elements(cleaned_alerts) value;
  select count(*) into medium_watch_count from jsonb_array_elements(cleaned_watch) value
  where value->>'severity'='medium' and coalesce(value->>'quality_issue','false')<>'true';

  if high_count>0 then final_risk:='high';
  elsif medium_count>0 or medium_watch_count>0 then final_risk:='medium';
  else final_risk:='low'; end if;

  update public.scpi_bulletin_analysis
  set alerts=cleaned_alerts,
      watch_points=cleaned_watch,
      improvements=cleaned_improvements,
      risk_level=final_risk,
      analysis_version='2026-09-30-v5-liquidity',
      generated_at=now()
  where scpi_slug=p_slug;
end;
$function$;

create or replace function public.enforce_scpi_public_risk_cleanup_v5(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  a public.scpi_bulletin_analysis%rowtype;
  item jsonb;
  cleaned_alerts jsonb := '[]'::jsonb;
  cleaned_watch jsonb := '[]'::jsonb;
  seen_alerts jsonb := '{}'::jsonb;
  seen_watch jsonb := '{}'::jsonb;
  metric text;
  key text;
  current_value numeric;
  high_count integer := 0;
  medium_count integer := 0;
  medium_watch_count integer := 0;
  final_risk text := 'low';
begin
  select * into a from public.scpi_bulletin_analysis where scpi_slug=p_slug;
  if not found then return; end if;

  for item in select value from jsonb_array_elements(coalesce(a.alerts,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');

    if coalesce(item->>'severity','')='high' and not coalesce(a.current_source_certified,false) then
      item:=jsonb_set(item,'{severity}',to_jsonb('info'::text),true);
      item:=jsonb_set(item,'{quality_issue}','true'::jsonb,true);
      item:=jsonb_set(item,'{metric}',to_jsonb(('data_quality_'||metric)::text),true);
      item:=jsonb_set(item,'{message}',to_jsonb('Signal non publié : la source courante exacte n’est pas certifiée.'::text),true);
      metric:='data_quality_'||metric;
      key:=metric||'|'||coalesce(item->>'message','');
      if not (seen_watch ? key) then
        seen_watch:=seen_watch||jsonb_build_object(key,true);
        cleaned_watch:=cleaned_watch||jsonb_build_array(item);
      end if;
      continue;
    end if;

    if metric='tof' and coalesce(item->>'severity','')='high' then
      current_value:=nullif(item->>'current','')::numeric;
      if current_value is not null and current_value>=80 then
        item:=jsonb_set(item,'{severity}',to_jsonb('medium'::text),true);
        item:=jsonb_set(item,'{message}',to_jsonb(('TOF à '||round(current_value,2)::text||' % : niveau faible, vigilance renforcée sur l’occupation.')::text),true);
        key:=metric||'|'||coalesce(item->>'message','');
        if not (seen_watch ? key) then
          seen_watch:=seen_watch||jsonb_build_object(key,true);
          cleaned_watch:=cleaned_watch||jsonb_build_array(item);
        end if;
        continue;
      end if;
    end if;

    if coalesce(item->>'quality_issue','false')='true' and metric not like 'data_quality_%' then
      item:=jsonb_set(item,'{metric}',to_jsonb(('data_quality_'||metric)::text),true);
      metric:='data_quality_'||metric;
    end if;
    key:=metric||'|'||coalesce(item->>'message','');
    if seen_alerts ? key then continue; end if;
    seen_alerts:=seen_alerts||jsonb_build_object(key,true);
    cleaned_alerts:=cleaned_alerts||jsonb_build_array(item);
  end loop;

  for item in select value from jsonb_array_elements(coalesce(a.watch_points,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');
    if coalesce(item->>'quality_issue','false')='true' and metric not like 'data_quality_%' then
      item:=jsonb_set(item,'{metric}',to_jsonb(('data_quality_'||metric)::text),true);
      metric:='data_quality_'||metric;
    end if;
    key:=metric||'|'||coalesce(item->>'message','');
    if seen_watch ? key then continue; end if;
    seen_watch:=seen_watch||jsonb_build_object(key,true);
    cleaned_watch:=cleaned_watch||jsonb_build_array(item);
  end loop;

  select count(*) filter(where value->>'severity'='high' and coalesce(value->>'quality_issue','false')<>'true'),
         count(*) filter(where value->>'severity'='medium' and coalesce(value->>'quality_issue','false')<>'true')
  into high_count,medium_count from jsonb_array_elements(cleaned_alerts) value;
  select count(*) into medium_watch_count from jsonb_array_elements(cleaned_watch) value
  where value->>'severity'='medium' and coalesce(value->>'quality_issue','false')<>'true';

  if high_count>0 then final_risk:='high';
  elsif medium_count>0 or medium_watch_count>0 then final_risk:='medium';
  else final_risk:='low'; end if;

  update public.scpi_bulletin_analysis
  set alerts=cleaned_alerts, watch_points=cleaned_watch, risk_level=final_risk
  where scpi_slug=p_slug;
end;
$function$;

-- Le trigger historique ne doit pas recalibrer à nouveau une analyse déjà passée par la doctrine v5.
create or replace function public.trg_calibrate_scpi_bulletin_analysis()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  item jsonb;
  calibrated jsonb := '[]'::jsonb;
  watches jsonb := coalesce(new.watch_points,'[]'::jsonb);
  metric text;
  sev text;
  curr_tof numeric;
  prev_tof numeric;
  d numeric;
  ratio numeric;
  current_value numeric;
  delta_pct numeric;
  high_count int := 0;
  medium_count int := 0;
  medium_watch_count int := 0;
  imp_count int := 0;
  det_count int := 0;
begin
  if new.analysis_version in ('2026-09-27-v3-material','2026-09-30-v4-certified','2026-09-30-v5-liquidity') then
    return new;
  end if;

  curr_tof := nullif(new.current_snapshot->>'tof','')::numeric;
  prev_tof := nullif(new.previous_snapshot->>'tof','')::numeric;
  for item in select value from jsonb_array_elements(coalesce(new.alerts,'[]'::jsonb)) loop
    metric := item->>'metric';
    sev := coalesce(item->>'severity','medium');
    if metric='tof' then
      d:=nullif(item->>'delta','')::numeric;
      if curr_tof is not null and curr_tof<85 then sev:='high';
      elsif curr_tof is not null and curr_tof<90 then if d is not null and d<=-2 then sev:='high'; else sev:='medium'; end if;
      else sev:='medium'; end if;
    elsif metric='liquidite_retraits' then
      ratio:=nullif(item->>'ratio_pct','')::numeric;
      if ratio is null then sev:='medium';
      elsif ratio>=5 then sev:='high';
      elsif ratio>=1 then sev:='medium';
      else item:=jsonb_set(item,'{severity}',to_jsonb('medium'::text)); watches:=watches||jsonb_build_array(item); continue; end if;
    elsif metric='endettement' then
      current_value:=nullif(item->>'current','')::numeric;
      if current_value is null then current_value:=nullif(new.current_snapshot->>'endettement','')::numeric; end if;
      if current_value is not null and current_value>=35 then sev:='high'; else sev:='medium'; end if;
    elsif metric='prix_reconstitution' then
      delta_pct:=nullif(item->>'delta_pct','')::numeric;
      if delta_pct is not null and delta_pct<=-10 then sev:='high'; else sev:='medium'; end if;
    elsif metric='croissance_occupation' then
      if curr_tof is not null and prev_tof is not null and curr_tof<90 and curr_tof<=prev_tof-2 then sev:='high'; else sev:='medium'; end if;
    end if;
    item:=jsonb_set(item,'{severity}',to_jsonb(sev));
    calibrated:=calibrated||jsonb_build_array(item);
  end loop;

  select coalesce(jsonb_agg(x.value),'[]'::jsonb) into calibrated
  from (select distinct on (value->>'metric') value from jsonb_array_elements(calibrated) value
        order by value->>'metric',case value->>'severity' when 'high' then 3 when 'medium' then 2 else 1 end desc) x;
  new.alerts:=calibrated;
  new.watch_points:=watches;
  select count(*) filter(where value->>'severity'='high'),count(*) filter(where value->>'severity'='medium')
    into high_count,medium_count from jsonb_array_elements(new.alerts) value;
  select count(*) into medium_watch_count from jsonb_array_elements(new.watch_points) value where value->>'severity'='medium';
  imp_count:=jsonb_array_length(coalesce(new.improvements,'[]'::jsonb));
  det_count:=jsonb_array_length(coalesce(new.deteriorations,'[]'::jsonb));
  if high_count>0 then new.risk_level:='high';
  elsif medium_count>0 or medium_watch_count>0 or det_count>=2 then new.risk_level:='medium';
  else new.risk_level:='low'; end if;
  new.trend_score:=imp_count-det_count-(high_count*3)-medium_count;
  return new;
end;
$function$;

create or replace function public.trg_refresh_scpi_bulletin_analysis()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.refresh_scpi_bulletin_analysis(new.scpi_slug);
  perform public.apply_scpi_material_vigilance(new.scpi_slug);
  perform public.certify_scpi_bulletin_analysis(new.scpi_slug);
  perform public.enforce_scpi_certification_v4_1(new.scpi_slug);
  perform public.enforce_scpi_metric_evidence_v4_3(new.scpi_slug);
  perform public.enforce_scpi_liquidity_doctrine_v5(new.scpi_slug);
  perform public.enforce_scpi_public_risk_cleanup_v5(new.scpi_slug);
  return new;
end;
$function$;

create or replace function public.trg_refresh_analysis_on_scpi_evidence()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if (old.extraction_json->'evidence') is distinct from (new.extraction_json->'evidence')
     or (old.extraction_json->>'evidence_version') is distinct from (new.extraction_json->>'evidence_version') then
    perform public.refresh_scpi_bulletin_analysis(new.scpi_slug);
    perform public.apply_scpi_material_vigilance(new.scpi_slug);
    perform public.certify_scpi_bulletin_analysis(new.scpi_slug);
    perform public.enforce_scpi_certification_v4_1(new.scpi_slug);
    perform public.enforce_scpi_metric_evidence_v4_3(new.scpi_slug);
    perform public.enforce_scpi_liquidity_doctrine_v5(new.scpi_slug);
    perform public.enforce_scpi_public_risk_cleanup_v5(new.scpi_slug);
  end if;
  return new;
end;
$function$;

do $backfill$
declare r record;
begin
  for r in select scpi_slug from public.scpi_bulletin_analysis loop
    perform public.enforce_scpi_liquidity_doctrine_v5(r.scpi_slug);
    perform public.enforce_scpi_public_risk_cleanup_v5(r.scpi_slug);
  end loop;
end;
$backfill$;
