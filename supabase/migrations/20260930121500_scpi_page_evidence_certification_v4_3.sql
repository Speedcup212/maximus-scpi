create or replace function public.refresh_scpi_metric_certifications(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  b record;
  kv record;
  e jsonb;
  n numeric;
  proof_page integer;
  proof_text text;
  proof_method text;
  proof_unit text;
  proof_distance numeric;
  evidence_ok boolean;
  numeric_metrics text[] := array[
    'td','tof','capitalisation','prix_souscription','prix_reconstitution','prix_retrait','valeur_realisation',
    'endettement','walt','walb','collecte_nette','nombre_locataires','nombre_immeubles','nombre_associes',
    'nombre_parts','parts_attente_retrait','distribution_par_part','td_annee'
  ];
  text_metrics text[] := array['capital_type'];
begin
  for b in
    select id,scpi_slug,period,source_url,qa_status,extraction_confidence,extraction_json
    from public.scpi_bulletins
    where scpi_slug=p_slug
      and public.scpi_is_strong_qa(qa_status)
      and source_url is not null
      and extraction_json ? 'metrics'
  loop
    update public.scpi_metric_certifications
    set verification_status='source_verified_no_field_evidence',
        verification_method='certified_bulletin_without_field_evidence',
        source_page=null,
        evidence_text=null,
        unit=null,
        verified_at=now()
    where bulletin_id=b.id
      and verification_status not ilike 'manual_verified%';

    for kv in select key,value from jsonb_each(b.extraction_json->'metrics')
    loop
      e := coalesce(b.extraction_json->'evidence'->kv.key, '{}'::jsonb);
      proof_method := nullif(e->>'method','');
      proof_text := nullif(btrim(e->>'text'),'');
      proof_unit := nullif(e->>'unit','');
      proof_page := case when coalesce(e->>'page','') ~ '^[0-9]+$' then (e->>'page')::integer else null end;
      proof_distance := case when coalesce(e->>'distance','') ~ '^[0-9]+([.][0-9]+)?$' then (e->>'distance')::numeric else null end;

      evidence_ok := coalesce(b.extraction_json->>'evidence_version','')='2026-09-30-v1-page-proof'
        and jsonb_typeof(e)='object'
        and coalesce((e->>'value_match')::boolean,false)
        and proof_text is not null
        and proof_method in ('pdf_page_text_match','html_text_match')
        and coalesce(proof_distance,999999) <= 450
        and (proof_method='html_text_match' or (proof_method='pdf_page_text_match' and proof_page is not null and proof_page>0));

      if kv.key = any(numeric_metrics) and jsonb_typeof(kv.value)='number' then
        n := (kv.value #>> '{}')::numeric;
        insert into public.scpi_metric_certifications(
          scpi_slug,source_period,metric,value_numeric,value_text,unit,source_url,source_page,evidence_text,bulletin_id,
          verification_status,verification_method,extraction_confidence,verified_at
        ) values (
          b.scpi_slug,b.period,kv.key,n,null,case when evidence_ok then proof_unit else null end,b.source_url,
          case when evidence_ok then proof_page else null end,case when evidence_ok then proof_text else null end,b.id,
          case when evidence_ok then 'auto_verified_with_evidence' else 'source_verified_no_field_evidence' end,
          case when evidence_ok then proof_method else 'certified_bulletin_without_field_evidence' end,
          b.extraction_confidence,now()
        )
        on conflict (scpi_slug,source_period,metric) do update set
          value_numeric=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.value_numeric else excluded.value_numeric end,
          value_text=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.value_text else excluded.value_text end,
          unit=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.unit is not null then public.scpi_metric_certifications.unit else excluded.unit end,
          source_url=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.source_url else excluded.source_url end,
          source_page=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.source_page is not null then public.scpi_metric_certifications.source_page else excluded.source_page end,
          evidence_text=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.evidence_text else excluded.evidence_text end,
          bulletin_id=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.bulletin_id else excluded.bulletin_id end,
          verification_status=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verification_status else excluded.verification_status end,
          verification_method=case
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.verification_method
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and excluded.evidence_text is not null then 'manual_verified_plus_'||excluded.verification_method
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verification_method
            else excluded.verification_method end,
          extraction_confidence=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.extraction_confidence else excluded.extraction_confidence end,
          verified_at=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verified_at else now() end;
      elsif kv.key = any(text_metrics) and jsonb_typeof(kv.value)='string' then
        insert into public.scpi_metric_certifications(
          scpi_slug,source_period,metric,value_numeric,value_text,unit,source_url,source_page,evidence_text,bulletin_id,
          verification_status,verification_method,extraction_confidence,verified_at
        ) values (
          b.scpi_slug,b.period,kv.key,null,kv.value #>> '{}',case when evidence_ok then proof_unit else null end,b.source_url,
          case when evidence_ok then proof_page else null end,case when evidence_ok then proof_text else null end,b.id,
          case when evidence_ok then 'auto_verified_with_evidence' else 'source_verified_no_field_evidence' end,
          case when evidence_ok then proof_method else 'certified_bulletin_without_field_evidence' end,
          b.extraction_confidence,now()
        )
        on conflict (scpi_slug,source_period,metric) do update set
          value_numeric=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.value_numeric else excluded.value_numeric end,
          value_text=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.value_text else excluded.value_text end,
          unit=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.unit is not null then public.scpi_metric_certifications.unit else excluded.unit end,
          source_url=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.source_url else excluded.source_url end,
          source_page=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.source_page is not null then public.scpi_metric_certifications.source_page else excluded.source_page end,
          evidence_text=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.evidence_text else excluded.evidence_text end,
          bulletin_id=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.bulletin_id else excluded.bulletin_id end,
          verification_status=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verification_status else excluded.verification_status end,
          verification_method=case
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and public.scpi_metric_certifications.evidence_text is not null then public.scpi_metric_certifications.verification_method
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' and excluded.evidence_text is not null then 'manual_verified_plus_'||excluded.verification_method
            when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verification_method
            else excluded.verification_method end,
          extraction_confidence=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.extraction_confidence else excluded.extraction_confidence end,
          verified_at=case when public.scpi_metric_certifications.verification_status ilike 'manual_verified%' then public.scpi_metric_certifications.verified_at else now() end;
      end if;
    end loop;
  end loop;
end;
$function$;

create or replace function public.scpi_metric_is_certified(p_slug text, p_period text, p_metric text)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select exists(
    select 1
    from public.scpi_metric_certifications m
    where m.scpi_slug=p_slug
      and public.scpi_period_key(m.source_period)=public.scpi_period_key(p_period)
      and m.metric=p_metric
      and (m.verification_status='auto_verified_with_evidence' or m.verification_status ilike 'manual_verified%')
      and nullif(btrim(m.evidence_text),'') is not null
      and ((m.verification_method ilike '%html%' and m.source_url is not null) or (m.source_page is not null and m.source_page>0))
  );
$function$;

create or replace function public.scpi_metric_proof_json(p_slug text, p_period text, p_metric text)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'metric',m.metric,
    'period',m.source_period,
    'page',m.source_page,
    'source_url',m.source_url,
    'method',m.verification_method
  )
  from public.scpi_metric_certifications m
  where m.scpi_slug=p_slug
    and public.scpi_period_key(m.source_period)=public.scpi_period_key(p_period)
    and m.metric=p_metric
    and public.scpi_metric_is_certified(p_slug,p_period,p_metric)
  order by case when m.verification_status ilike 'manual_verified%' then 0 else 1 end, m.verified_at desc
  limit 1;
$function$;

create or replace function public.enforce_scpi_metric_evidence_v4_3(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  a public.scpi_bulletin_analysis%rowtype;
  c public.scpi_indicators%rowtype;
  item jsonb;
  filtered_alerts jsonb := '[]'::jsonb;
  filtered_watch jsonb := '[]'::jsonb;
  metric text;
  evidence_ok boolean;
  has_structural_event boolean := false;
  proofs jsonb;
  proof jsonb;
  msg text;
  high_count integer := 0;
  medium_count integer := 0;
  medium_watch_count integer := 0;
  det_count integer := 0;
  final_risk text := 'low';
begin
  perform public.refresh_scpi_metric_certifications(p_slug);
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
      and e.event_type in ('variability_suspended','secondary_market_only','capital_regime_change','nominal_split','merger')
  ) into has_structural_event;

  for item in select value from jsonb_array_elements(coalesce(a.alerts,'[]'::jsonb)) loop
    metric:=coalesce(item->>'metric','');
    if coalesce(item->>'severity','') <> 'high' then
      filtered_alerts:=filtered_alerts||jsonb_build_array(item - 'certification');
      continue;
    end if;

    evidence_ok:=false;
    proofs:='[]'::jsonb;

    if metric='tof' then
      evidence_ok:=public.scpi_metric_is_certified(p_slug,a.current_period,'tof');
      if evidence_ok then proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'tof')); end if;
    elsif metric='endettement' then
      evidence_ok:=public.scpi_metric_is_certified(p_slug,a.current_period,'endettement');
      if evidence_ok then proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'endettement')); end if;
    elsif metric='walb' then
      evidence_ok:=public.scpi_metric_is_certified(p_slug,a.current_period,'walb');
      if evidence_ok then proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'walb')); end if;
    elsif metric='liquidite_retraits' then
      evidence_ok:=public.scpi_metric_is_certified(p_slug,a.current_period,'parts_attente_retrait');
      if evidence_ok then
        proof:=public.scpi_metric_proof_json(p_slug,a.current_period,'parts_attente_retrait');
        proofs:=proofs||jsonb_build_array(proof);
        if public.scpi_metric_is_certified(p_slug,a.current_period,'nombre_parts') then
          proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'nombre_parts'));
        elsif public.scpi_metric_is_certified(p_slug,a.current_period,'capitalisation')
          and public.scpi_metric_is_certified(p_slug,a.current_period,'prix_souscription') then
          proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'capitalisation'));
          proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'prix_souscription'));
        else
          evidence_ok:=false;
          proofs:='[]'::jsonb;
        end if;
      end if;
    elsif metric in ('prix_reconstitution','valeur_realisation') then
      evidence_ok:=a.comparison_certified
        and a.previous_period is not null
        and public.scpi_metric_is_certified(p_slug,a.current_period,metric)
        and public.scpi_metric_is_certified(p_slug,a.previous_period,metric);
      if evidence_ok then
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.previous_period,metric));
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,metric));
      end if;
    elsif metric in ('surcote_reconstitution','decote_reconstitution') then
      evidence_ok:=not has_structural_event
        and lower(coalesce(c.capital_type,''))='variable'
        and public.scpi_metric_is_certified(p_slug,a.current_period,'prix_souscription')
        and public.scpi_metric_is_certified(p_slug,a.current_period,'prix_reconstitution')
        and public.scpi_metric_is_certified(p_slug,a.current_period,'capital_type');
      if evidence_ok then
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'prix_souscription'));
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'prix_reconstitution'));
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'capital_type'));
      end if;
    elsif metric='capital_type' then
      evidence_ok:=a.comparison_certified
        and a.previous_period is not null
        and public.scpi_metric_is_certified(p_slug,a.current_period,'capital_type')
        and public.scpi_metric_is_certified(p_slug,a.previous_period,'capital_type');
      if evidence_ok then
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.previous_period,'capital_type'));
        proofs:=proofs||jsonb_build_array(public.scpi_metric_proof_json(p_slug,a.current_period,'capital_type'));
      end if;
    else
      evidence_ok:=false;
    end if;

    if evidence_ok and jsonb_array_length(proofs)>0 then
      item:=jsonb_set(item,'{certification}',jsonb_build_object(
        'status','certified_with_field_evidence',
        'evidence_version','2026-09-30-v1-page-proof',
        'proofs',proofs
      ),true);
      filtered_alerts:=filtered_alerts||jsonb_build_array(item);
    else
      item:=item-'certification';
      item:=jsonb_set(item,'{severity}',to_jsonb('medium'::text));
      item:=jsonb_set(item,'{quality_issue}','true'::jsonb);
      msg:=coalesce(item->>'message','Signal détecté');
      if position('preuve de champ insuffisante' in lower(msg))=0 then
        msg:=msg||' — vigilance élevée neutralisée : preuve de champ insuffisante.';
      end if;
      item:=jsonb_set(item,'{message}',to_jsonb(msg));
      filtered_watch:=filtered_watch||jsonb_build_array(item);
    end if;
  end loop;

  for item in select value from jsonb_array_elements(coalesce(a.watch_points,'[]'::jsonb)) loop
    filtered_watch:=filtered_watch||jsonb_build_array(item-'certification');
  end loop;

  select count(*) filter(where value->>'severity'='high'), count(*) filter(where value->>'severity'='medium')
  into high_count,medium_count from jsonb_array_elements(filtered_alerts) value;
  select count(*) into medium_watch_count from jsonb_array_elements(filtered_watch) value where value->>'severity'='medium';
  det_count:=jsonb_array_length(coalesce(a.deteriorations,'[]'::jsonb));

  if not a.current_source_certified then final_risk:='medium';
  elsif high_count>0 then final_risk:='high';
  elsif medium_count>0 or medium_watch_count>0 or det_count>=2 then final_risk:='medium';
  else final_risk:='low'; end if;

  update public.scpi_bulletin_analysis
  set alerts=filtered_alerts,
      watch_points=filtered_watch,
      risk_level=final_risk,
      analysis_version='2026-09-30-v4-certified',
      generated_at=now()
  where scpi_slug=p_slug;
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
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_scpi_bulletin_evidence_refresh_analysis on public.scpi_bulletins;
create trigger trg_scpi_bulletin_evidence_refresh_analysis
after update of extraction_json on public.scpi_bulletins
for each row execute function public.trg_refresh_analysis_on_scpi_evidence();

drop policy if exists public_read_verified_metric_certifications on public.scpi_metric_certifications;
create policy public_read_verified_metric_certifications
on public.scpi_metric_certifications
for select
to anon,authenticated
using (
  (verification_status='auto_verified_with_evidence' or verification_status ilike 'manual_verified%')
  and nullif(btrim(evidence_text),'') is not null
  and ((verification_method ilike '%html%' and source_url is not null) or (source_page is not null and source_page>0))
);

do $block$
declare r record;
begin
  for r in select scpi_slug from public.scpi_indicators loop
    perform public.refresh_scpi_bulletin_analysis(r.scpi_slug);
    perform public.apply_scpi_material_vigilance(r.scpi_slug);
    perform public.certify_scpi_bulletin_analysis(r.scpi_slug);
    perform public.enforce_scpi_certification_v4_1(r.scpi_slug);
    perform public.enforce_scpi_metric_evidence_v4_3(r.scpi_slug);
  end loop;
end;
$block$;

do $block$
declare j record;
begin
  for j in select jobid from cron.job where jobname='scpi-evidence-certify-5m' loop
    perform cron.unschedule(j.jobid);
  end loop;
end;
$block$;

select cron.schedule(
  'scpi-evidence-certify-5m',
  '2-59/5 * * * *',
  $job$
    select net.http_post(
      url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-evidence-certify',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-cron-token',(select decrypted_secret from vault.decrypted_secrets where name='scpi_bulletin_cron_token' limit 1)
      ),
      body := jsonb_build_object('trigger','cron','limit',2,'at',now()),
      timeout_milliseconds := 120000
    );
  $job$
);
