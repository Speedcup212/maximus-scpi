-- Le trigger historique de calibration reste utile pour l'analyse v2 intermédiaire,
-- mais ne doit pas écraser le niveau déjà calculé par la doctrine matérialité v3.

create or replace function public.trg_calibrate_scpi_bulletin_analysis()
returns trigger
language plpgsql
set search_path = public
as $$
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
  if new.analysis_version = '2026-09-27-v3-material' then
    return new;
  end if;

  curr_tof := nullif(new.current_snapshot->>'tof','')::numeric;
  prev_tof := nullif(new.previous_snapshot->>'tof','')::numeric;

  for item in select value from jsonb_array_elements(coalesce(new.alerts,'[]'::jsonb))
  loop
    metric := item->>'metric';
    sev := coalesce(item->>'severity','medium');

    if metric = 'tof' then
      d := nullif(item->>'delta','')::numeric;
      if curr_tof is not null and curr_tof < 85 then
        sev := 'high';
      elsif curr_tof is not null and curr_tof < 90 then
        if d is not null and d <= -2 then sev := 'high'; else sev := 'medium'; end if;
      else
        sev := 'medium';
      end if;

    elsif metric = 'liquidite_retraits' then
      ratio := nullif(item->>'ratio_pct','')::numeric;
      if ratio is null then
        sev := 'medium';
      elsif ratio >= 5 then
        sev := 'high';
      elsif ratio >= 1 then
        sev := 'medium';
      else
        item := jsonb_set(item,'{severity}',to_jsonb('medium'::text));
        item := jsonb_set(item,'{message}',to_jsonb((item->>'message')||' Niveau à surveiller, sans tension élevée à ce stade.'::text));
        watches := watches || jsonb_build_array(item);
        continue;
      end if;

    elsif metric = 'endettement' then
      current_value := nullif(item->>'current','')::numeric;
      if current_value is null then current_value := nullif(new.current_snapshot->>'endettement','')::numeric; end if;
      if current_value is not null and current_value >= 35 then sev := 'high'; else sev := 'medium'; end if;

    elsif metric = 'prix_reconstitution' then
      delta_pct := nullif(item->>'delta_pct','')::numeric;
      if delta_pct is not null and delta_pct <= -10 then sev := 'high'; else sev := 'medium'; end if;

    elsif metric = 'croissance_occupation' then
      if curr_tof is not null and prev_tof is not null and curr_tof < 90 and curr_tof <= prev_tof - 2 then
        sev := 'high';
      else
        sev := 'medium';
      end if;
    end if;

    item := jsonb_set(item,'{severity}',to_jsonb(sev));
    calibrated := calibrated || jsonb_build_array(item);
  end loop;

  select coalesce(jsonb_agg(x.value),'[]'::jsonb)
  into calibrated
  from (
    select distinct on (value->>'metric') value
    from jsonb_array_elements(calibrated) value
    order by value->>'metric', case value->>'severity' when 'high' then 3 when 'medium' then 2 else 1 end desc
  ) x;

  new.alerts := calibrated;
  new.watch_points := watches;

  select count(*) filter (where value->>'severity'='high'), count(*) filter (where value->>'severity'='medium')
  into high_count, medium_count
  from jsonb_array_elements(new.alerts) value;

  select count(*) into medium_watch_count
  from jsonb_array_elements(new.watch_points) value
  where value->>'severity'='medium';

  imp_count := jsonb_array_length(coalesce(new.improvements,'[]'::jsonb));
  det_count := jsonb_array_length(coalesce(new.deteriorations,'[]'::jsonb));

  if high_count > 0 then
    new.risk_level := 'high';
  elsif medium_count > 0 or medium_watch_count > 0 or det_count >= 2 then
    new.risk_level := 'medium';
  else
    new.risk_level := 'low';
  end if;

  new.trend_score := imp_count - det_count - (high_count*3) - medium_count;
  return new;
end;
$$;

do $$
declare r record;
begin
  for r in select scpi_slug from public.scpi_indicators loop
    perform public.apply_scpi_material_vigilance(r.scpi_slug);
  end loop;
end;
$$;
