create or replace function public.protect_manual_verified_scpi_bulletin()
returns trigger
language plpgsql
as $function$
begin
  if old.qa_status like 'manual_verified%' and coalesce(new.run_id,'') like 'edge-%' then
    -- Autoriser exclusivement l'ajout de preuves de champ dans extraction_json.
    -- Les métriques, la source, le statut QA et toutes les autres colonnes restent inchangés.
    if (to_jsonb(new) - 'extraction_json') = (to_jsonb(old) - 'extraction_json')
       and (new.extraction_json->'metrics') is not distinct from (old.extraction_json->'metrics')
       and (new.extraction_json->>'parser_version') is not distinct from (old.extraction_json->>'parser_version')
       and new.extraction_json->>'evidence_version' = '2026-09-30-v1-page-proof'
       and jsonb_typeof(new.extraction_json->'evidence') = 'object'
    then
      return new;
    end if;
    return old;
  end if;
  return new;
end;
$function$;
