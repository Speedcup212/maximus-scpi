-- Doctrine MaximusSCPI v3 : matérialité des risques et cohérence badge / explication.
-- Les seuils ci-dessous sont des seuils propriétaires MaximusSCPI, distincts du SRI réglementaire.

create or replace function public.apply_scpi_material_vigilance(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.scpi_indicators%rowtype;
  a public.scpi_bulletin_analysis%rowtype;
  strict_alerts jsonb := '[]'::jsonb;
  strict_watch jsonb := '[]'::jsonb;
  material_points integer := 0;
  major_count integer := 0;
  total_shares numeric;
  cap_m numeric;
  wait_ratio numeric;
  premium numeric;
  delta_pct numeric;
  delta_value numeric;
  metric text;
  e jsonb;
  sector_name text;
  sector_value numeric;
  geo_name text;
  geo_value numeric;
  bad_sector boolean := false;
  bad_geo boolean := false;
  risk text := 'low';
  summary_text text;
begin
  select * into c from public.scpi_indicators where scpi_slug = p_slug;
  if not found then return; end if;
  select * into a from public.scpi_bulletin_analysis where scpi_slug = p_slug;
  if not found then return; end if;

  cap_m := case when c.capitalisation is null then null when c.capitalisation > 100000 then c.capitalisation / 1000000.0 else c.capitalisation end;
  if c.nombre_parts is not null and c.nombre_parts > 0 then
    total_shares := c.nombre_parts;
  elsif cap_m is not null and cap_m > 0 and c.prix_souscription is not null and c.prix_souscription > 0 then
    total_shares := (cap_m * 1000000.0) / c.prix_souscription;
  end if;

  -- Une valeur automatisée extrêmement atypique n'est jamais transformée directement en alerte investisseur.
  if c.tof is not null and c.tof > 0 and c.tof < 50 then
    strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
      'metric','data_quality_tof','severity','info','quality_issue',true,'current',c.tof,
      'message','TOF atypique ('||c.tof::text||' %) : donnée à vérifier avant interprétation.'
    ));
  elsif c.tof is not null then
    if c.tof < 85 then
      strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
        'metric','tof','severity','high','current',c.tof,
        'message','TOF à '||c.tof::text||' % : niveau très faible, signal majeur sur l’occupation.'
      ));
      major_count := major_count + 1;
    elsif c.tof < 88 then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','tof','severity','medium','current',c.tof,
        'message','TOF à '||c.tof::text||' % : niveau suffisamment faible pour constituer un facteur de vigilance.'
      ));
      material_points := material_points + 1;
    end if;
  end if;

  -- Endettement : importance du niveau absolu, non d'une micro-variation depuis zéro.
  if c.endettement is not null then
    if c.endettement >= 40 then
      strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
        'metric','endettement','severity','high','current',c.endettement,
        'message','Endettement à '||c.endettement::text||' % : levier financier élevé, signal majeur.'
      ));
      major_count := major_count + 1;
    elsif c.endettement >= 35 then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','endettement','severity','medium','current',c.endettement,
        'message','Endettement à '||c.endettement::text||' % : niveau matériel à surveiller.'
      ));
      material_points := material_points + 1;
    end if;
  end if;

  if c.walb is not null then
    if c.walb < 2 then
      strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
        'metric','walb','severity','high','current',c.walb,
        'message','WALB de '||c.walb::text||' an(s) : échéances fermes très proches.'
      ));
      major_count := major_count + 1;
    elsif c.walb < 3 then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','walb','severity','medium','current',c.walb,
        'message','WALB de '||c.walb::text||' ans : échéances fermes relativement proches.'
      ));
      material_points := material_points + 1;
    end if;
  end if;

  -- Liquidité : <0,5% non significatif ; 0,5-1% information ; 1-3% vigilance ; 3-5% notable ; >=5% majeur.
  if c.parts_attente_retrait is not null and c.parts_attente_retrait > 0 then
    if total_shares is not null and total_shares > 0 then
      wait_ratio := c.parts_attente_retrait::numeric / total_shares * 100.0;
      if wait_ratio >= 5 then
        strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','high','current_parts',c.parts_attente_retrait,
          'ratio_pct',round(wait_ratio,3),
          'message',round(wait_ratio,2)::text||' % des parts sont en attente de retrait : tension de liquidité majeure.'
        ));
        major_count := major_count + 1;
      elsif wait_ratio >= 3 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','medium','strength','strong',
          'current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),
          'message',round(wait_ratio,2)::text||' % des parts sont en attente de retrait : tension de liquidité notable.'
        ));
        material_points := material_points + 2;
      elsif wait_ratio >= 1 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','medium','current_parts',c.parts_attente_retrait,
          'ratio_pct',round(wait_ratio,3),
          'message',round(wait_ratio,2)::text||' % des parts sont en attente de retrait : facteur de liquidité significatif.'
        ));
        material_points := material_points + 1;
      elsif wait_ratio >= 0.5 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','info','materiality','information',
          'current_parts',c.parts_attente_retrait,'ratio_pct',round(wait_ratio,3),
          'message',round(wait_ratio,2)::text||' % des parts sont en attente de retrait : information suivie, sans facteur de vigilance à ce stade.'
        ));
      end if;
    else
      -- Sans dénominateur, le nombre brut ne peut pas créer seul une alerte élevée.
      if c.parts_attente_retrait >= 50000 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','medium','strength','strong',
          'current_parts',c.parts_attente_retrait,
          'message','File d’attente importante en nombre de parts ; ratio indisponible, vigilance renforcée mais niveau à confirmer.'
        ));
        material_points := material_points + 2;
      elsif c.parts_attente_retrait >= 10000 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','liquidite_retraits','severity','medium','current_parts',c.parts_attente_retrait,
          'message','File d’attente significative en nombre de parts ; ratio indisponible, niveau à confirmer.'
        ));
        material_points := material_points + 1;
      end if;
    end if;
  end if;

  if c.prix_souscription is not null and c.prix_reconstitution is not null and c.prix_reconstitution > 0 then
    premium := (c.prix_souscription / c.prix_reconstitution - 1) * 100;
    if premium > 15 then
      strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
        'metric','surcote_reconstitution','severity','high','current',round(premium,2),'unit','%',
        'message','Prix de souscription en surcote de '||round(premium,2)::text||' % par rapport à la valeur de reconstitution : signal majeur de valorisation.'
      ));
      major_count := major_count + 1;
    elsif premium > 10 then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','surcote_reconstitution','severity','medium','current',round(premium,2),'unit','%',
        'message','Surcote de '||round(premium,2)::text||' % par rapport à la valeur de reconstitution : niveau matériel à surveiller.'
      ));
      material_points := material_points + 1;
    elsif premium > 5 then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','surcote_reconstitution','severity','info','current',round(premium,2),'unit','%',
        'message','Surcote de '||round(premium,2)::text||' % par rapport à la valeur de reconstitution : information à suivre.'
      ));
    end if;
  end if;

  -- Baisse de valeur : signal économique prioritaire. Les amplitudes absurdes sont isolées comme QA.
  for e in select value from jsonb_array_elements(coalesce(a.deteriorations,'[]'::jsonb)) loop
    metric := coalesce(e->>'metric','');
    if metric in ('prix_reconstitution','valeur_realisation') and coalesce(e->>'delta_pct','') ~ '^-?[0-9]+([.][0-9]+)?$' then
      delta_pct := (e->>'delta_pct')::numeric;
      if delta_pct <= -35 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','data_quality_'||metric,'severity','info','quality_issue',true,
          'delta_pct',round(delta_pct,2),
          'message','Variation de '||abs(round(delta_pct,2))::text||' % sur '||case metric when 'prix_reconstitution' then 'la valeur de reconstitution' else 'la valeur de réalisation' end||' : amplitude atypique, donnée à vérifier avant interprétation.'
        ));
      elsif delta_pct <= -10 then
        strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
          'metric',metric,'severity','high','delta_pct',round(delta_pct,2),
          'message',case metric when 'prix_reconstitution' then 'Valeur de reconstitution' else 'Valeur de réalisation' end||' en baisse de '||abs(round(delta_pct,2))::text||' % : dégradation majeure de valorisation.'
        ));
        major_count := major_count + 1;
      elsif delta_pct <= -5 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric',metric,'severity','medium','delta_pct',round(delta_pct,2),
          'message',case metric when 'prix_reconstitution' then 'Valeur de reconstitution' else 'Valeur de réalisation' end||' en baisse de '||abs(round(delta_pct,2))::text||' % : facteur de valorisation significatif.'
        ));
        material_points := material_points + 1;
      end if;
    end if;
  end loop;

  -- Tendance trimestrielle : seulement si la variation et le niveau final sont tous deux significatifs.
  for e in select value from jsonb_array_elements(coalesce(a.deteriorations,'[]'::jsonb)) loop
    metric := coalesce(e->>'metric','');
    if metric = 'tof' and c.tof is not null and c.tof >= 50 and c.tof < 92 and coalesce(e->>'delta','') ~ '^-?[0-9]+([.][0-9]+)?$' then
      delta_value := (e->>'delta')::numeric;
      if delta_value <= -3 and c.tof >= 88 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','tof_tendance','severity','medium','current',c.tof,'delta',round(delta_value,2),
          'message','TOF en baisse de '||abs(round(delta_value,2))::text||' points sur le trimestre, à '||c.tof::text||' % : dégradation suffisamment marquée pour être suivie.'
        ));
        material_points := material_points + 1;
      end if;
    elsif metric = 'endettement' and c.endettement is not null and c.endettement >= 30 and c.endettement < 35 and coalesce(e->>'delta','') ~ '^-?[0-9]+([.][0-9]+)?$' then
      delta_value := (e->>'delta')::numeric;
      if delta_value >= 5 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','endettement_tendance','severity','medium','current',c.endettement,'delta',round(delta_value,2),
          'message','Endettement en hausse de '||round(delta_value,2)::text||' points, à '||c.endettement::text||' % : hausse rapide à surveiller.'
        ));
        material_points := material_points + 1;
      end if;
    end if;
  end loop;

  -- Mutualisation : petite taille seule insuffisante ; combinaison avec faible nombre d'actifs/locataires.
  if cap_m is not null and cap_m < 150 and ((c.nombre_immeubles is not null and c.nombre_immeubles < 15) or (c.nombre_locataires is not null and c.nombre_locataires < 15)) then
    strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
      'metric','mutualisation','severity','medium',
      'message','Mutualisation encore limitée : capitalisation d’environ '||round(cap_m,1)::text||' M€'||case when c.nombre_immeubles is not null and c.nombre_immeubles < 15 then ', '||c.nombre_immeubles::text||' immeuble(s)' else '' end||case when c.nombre_locataires is not null and c.nombre_locataires < 15 then ', '||c.nombre_locataires::text||' locataire(s)' else '' end||'.'
    ));
    material_points := material_points + 1;
  elsif c.nombre_immeubles is not null and c.nombre_immeubles < 10 then
    strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
      'metric','mutualisation','severity','medium',
      'message',c.nombre_immeubles::text||' immeuble(s) seulement : concentration patrimoniale réellement marquée.'
    ));
    material_points := material_points + 1;
  end if;

  -- Concentration : exclure les pseudo-catégories issues d'erreurs d'extraction.
  if c.repartition_sectorielle is not null and jsonb_typeof(c.repartition_sectorielle) = 'object' then
    select exists (select 1 from jsonb_each_text(c.repartition_sectorielle) where key ~* '(vacance|occup|taux|dette|endett|performance|distribution|collecte|capitalisation|walb|walt|associ|moyen de)') into bad_sector;
    if bad_sector then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','data_quality_sector','severity','info','quality_issue',true,
        'message','Répartition sectorielle incohérente détectée : donnée exclue de l’analyse jusqu’à vérification.'
      ));
    else
      select key, value::numeric into sector_name, sector_value
      from jsonb_each_text(c.repartition_sectorielle)
      where value ~ '^-?[0-9]+([.][0-9]+)?$'
      order by value::numeric desc limit 1;
      if found and sector_value >= 90 then
        strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
          'metric','concentration_sectorielle','severity','high','current',sector_value,
          'message','Concentration sectorielle très forte : '||sector_name||' représente environ '||round(sector_value,1)::text||' % du patrimoine.'
        ));
        major_count := major_count + 1;
      elsif found and sector_value >= 75 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','concentration_sectorielle','severity','medium','current',sector_value,
          'message','Concentration sectorielle forte : '||sector_name||' représente environ '||round(sector_value,1)::text||' % du patrimoine.'
        ));
        material_points := material_points + 1;
      end if;
    end if;
  end if;

  if c.repartition_geographique is not null and jsonb_typeof(c.repartition_geographique) = 'object' then
    select exists (select 1 from jsonb_each_text(c.repartition_geographique) where key ~* '(vacance|occup|taux|dette|endett|performance|distribution|collecte|capitalisation|walb|walt|associ|moyen de)') into bad_geo;
    if bad_geo then
      strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
        'metric','data_quality_geo','severity','info','quality_issue',true,
        'message','Répartition géographique incohérente détectée : donnée exclue de l’analyse jusqu’à vérification.'
      ));
    else
      select key, value::numeric into geo_name, geo_value
      from jsonb_each_text(c.repartition_geographique)
      where value ~ '^-?[0-9]+([.][0-9]+)?$'
      order by value::numeric desc limit 1;
      if found and geo_value >= 95 then
        strict_alerts := strict_alerts || jsonb_build_array(jsonb_build_object(
          'metric','concentration_geographique','severity','high','current',geo_value,
          'message','Concentration géographique très forte : '||geo_name||' représente environ '||round(geo_value,1)::text||' % du patrimoine.'
        ));
        major_count := major_count + 1;
      elsif found and geo_value >= 80 then
        strict_watch := strict_watch || jsonb_build_array(jsonb_build_object(
          'metric','concentration_geographique','severity','medium','current',geo_value,
          'message','Concentration géographique forte : '||geo_name||' représente environ '||round(geo_value,1)::text||' % du patrimoine.'
        ));
        material_points := material_points + 1;
      end if;
    end if;
  end if;

  if major_count > 0 or material_points >= 3 then risk := 'high';
  elsif material_points >= 1 then risk := 'medium';
  else risk := 'low'; end if;

  summary_text := 'Doctrine MaximusSCPI matérialité v3 : '||major_count::text||' signal(aux) majeur(s), '||material_points::text||' point(s) matériel(s). Niveau de vigilance : '||case risk when 'high' then 'élevé' when 'medium' then 'modéré' else 'faible' end||'.';

  update public.scpi_bulletin_analysis
  set risk_level = risk,
      alerts = strict_alerts,
      watch_points = strict_watch,
      summary = summary_text,
      analysis_version = '2026-09-27-v3-material',
      generated_at = now()
  where scpi_slug = p_slug;
end;
$$;

create or replace function public.trg_refresh_scpi_bulletin_analysis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_scpi_bulletin_analysis(new.scpi_slug);
  perform public.apply_scpi_material_vigilance(new.scpi_slug);
  return new;
end;
$$;

-- Correction vérifiée sur le bulletin officiel T2 2026 d'Épargne Pierre Europe.
update public.scpi_indicators
set tof = 99.79,
    capitalisation = 702.3774,
    nombre_parts = 3511887,
    nombre_immeubles = 34,
    nombre_locataires = 70,
    parts_attente_retrait = 0,
    repartition_sectorielle = '{"Bureaux":26.01,"Hôtellerie":25.96,"Commerces":24.00,"Activités / Entrepôts":15.82,"Santé":8.21}'::jsonb,
    repartition_geographique = '{"Espagne":27.50,"Irlande":23.88,"Allemagne":22.24,"Royaume-Uni":14.26,"Pays-Bas":8.35,"Portugal":3.77}'::jsonb,
    source_type = 'bulletin_manual_verified_crash_test',
    qa_status = 'manual_verified_crash_test',
    source_confidence = 1,
    updated_at = now()
where scpi_slug = 'epargne-pierre-europe'
  and source_period = '2026-T2';

-- Nettoyage de répartitions manifestement contaminées par d'autres métriques du bulletin.
update public.scpi_indicators
set repartition_geographique = null, updated_at = now()
where scpi_slug in ('cristal-life','cristal-rente')
  and repartition_geographique is not null
  and exists (select 1 from jsonb_each_text(repartition_geographique) where key ~* '(vacance|occup|taux)');

update public.scpi_indicators
set repartition_sectorielle = null, updated_at = now()
where scpi_slug = 'sofiprime'
  and repartition_sectorielle is not null
  and exists (select 1 from jsonb_each_text(repartition_sectorielle) where key ~* '(dette|taux|performance|distribution|moyen de)');

do $$
declare r record;
begin
  for r in select scpi_slug from public.scpi_indicators loop
    perform public.apply_scpi_material_vigilance(r.scpi_slug);
  end loop;
end;
$$;
