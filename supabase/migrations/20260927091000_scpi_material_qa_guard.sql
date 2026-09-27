-- Bloque les anomalies d'extraction automatisée les plus manifestes avant publication live.
-- Les valeurs atypiques restent possibles après vérification manuelle.

create or replace function public.guard_scpi_material_qa()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  automated boolean := coalesce(new.source_type, '') ~* '(automated|edge|ingest)';
  protected_same_period boolean := false;
  bad_sector boolean := false;
  bad_geo boolean := false;
begin
  if tg_op = 'UPDATE' then
    protected_same_period := coalesce(old.qa_status,'') ilike 'manual_verified%'
      and automated
      and new.source_period is not distinct from old.source_period;
  end if;

  -- Une ligne manuellement vérifiée du même trimestre est restaurée par le trigger de protection existant.
  if protected_same_period then
    return new;
  end if;

  if automated and new.tof is not null and new.tof > 0 and new.tof < 50 then
    raise exception using
      errcode = '23514',
      message = 'SCPI_MATERIAL_QA_REVIEW [' || coalesce(new.scpi_slug,'?') || '] : TOF automatisé < 50%, vérification manuelle requise';
  end if;

  if automated and new.repartition_sectorielle is not null and jsonb_typeof(new.repartition_sectorielle) = 'object' then
    select exists (
      select 1 from jsonb_each_text(new.repartition_sectorielle)
      where key ~* '(vacance|occup|taux|dette|endett|performance|distribution|collecte|capitalisation|walb|walt|associ|moyen de)'
    ) into bad_sector;
    if bad_sector then
      raise exception using
        errcode = '23514',
        message = 'SCPI_MATERIAL_QA_REVIEW [' || coalesce(new.scpi_slug,'?') || '] : répartition sectorielle contaminée par des métriques, vérification manuelle requise';
    end if;
  end if;

  if automated and new.repartition_geographique is not null and jsonb_typeof(new.repartition_geographique) = 'object' then
    select exists (
      select 1 from jsonb_each_text(new.repartition_geographique)
      where key ~* '(vacance|occup|taux|dette|endett|performance|distribution|collecte|capitalisation|walb|walt|associ|moyen de)'
    ) into bad_geo;
    if bad_geo then
      raise exception using
        errcode = '23514',
        message = 'SCPI_MATERIAL_QA_REVIEW [' || coalesce(new.scpi_slug,'?') || '] : répartition géographique contaminée par des métriques, vérification manuelle requise';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_scpi_material_qa on public.scpi_indicators;
create trigger trg_guard_scpi_material_qa
before insert or update on public.scpi_indicators
for each row execute function public.guard_scpi_material_qa();
