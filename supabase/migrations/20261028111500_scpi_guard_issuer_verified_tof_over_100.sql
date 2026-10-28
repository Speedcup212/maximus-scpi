-- Already applied in Supabase project ygvsddcpohsnaowofuwc. Require matched official issuer PDF evidence for TOF > 100.
CREATE OR REPLACE FUNCTION public.guard_scpi_indicator_history_auto_quality()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  automated boolean := coalesce(new.source_type,'') ~* '(official_bulletin_historical|automated|edge|ingest)' or coalesce(new.qa_status,'') ~ '^auto_verified';
  new_key integer;
  prior_tof numeric;
  implied_cap numeric;
  cap_gap numeric;
begin
  -- Always allow explicit quarantine / invalidation.
  if coalesce(new.qa_status,'') ~ '^invalid' then return new; end if;
  if not automated then return new; end if;

  if new.source_period !~ '^20[0-9]{2}-T[1-4]$' then
    raise exception 'SCPI_HISTORY_QA_BLOCK [%] période non canonique: %', new.scpi_slug,new.source_period;
  end if;

  new_key := substring(new.source_period,1,4)::int*4 + substring(new.source_period,7,1)::int;
  if new_key > extract(year from current_date)::int*4 + extract(quarter from current_date)::int then
    raise exception 'SCPI_HISTORY_QA_BLOCK [%] trimestre futur: %', new.scpi_slug,new.source_period;
  end if;

  -- Une valeur TOF >100 peut être légitime (loyer garanti et double encaissement)
  -- UNIQUEMENT si le bulletin de la SCPI précise le chiffre ET l'explication.
  -- Ne jamais tronquer/arrondir artificiellement à 100 %.
  if new.tof is not null and (new.tof < 50 or new.tof > 100) then
    if NOT (
      new.tof > 100 and new.tof <= 110 and exists (
        select 1 from public.scpi_metric_certifications m
        join public.scpi_source_connectors cfg on cfg.scpi_slug=m.scpi_slug
        where m.scpi_slug=new.scpi_slug and m.source_period=new.source_period
          and m.metric='tof' and m.value_numeric=new.tof
          and m.source_url=new.source_url
          and m.source_page is not null and m.source_page > 0
          and m.verification_status='manual_verified_official_pdf_text_review'
          and m.evidence_text ~* '(garanti|garantie|double[[:space:]]+loyer)'
          and lower(split_part(split_part(m.source_url,'://',2),'/',1))=any(cfg.allowed_hosts)
      )
    ) then
      raise exception 'SCPI_HISTORY_QA_BLOCK [%] TOF automatisé hors plage sûre ou sans preuve PDF: %', new.scpi_slug,new.tof;
    end if;
  end if;

  if new.tof is not null then
    select h.tof into prior_tof
    from public.scpi_indicator_history h
    where h.scpi_slug=new.scpi_slug
      and h.source_period ~ '^20[0-9]{2}-T[1-4]$'
      and coalesce(h.qa_status,'') !~ '^invalid'
      and coalesce(h.source_confidence,0)>=0.95
      and h.tof is not null
      and (substring(h.source_period,1,4)::int*4 + substring(h.source_period,7,1)::int) < new_key
    order by (substring(h.source_period,1,4)::int*4 + substring(h.source_period,7,1)::int) desc
    limit 1;
    if prior_tof is not null and abs(new.tof-prior_tof)>=40 then
      raise exception 'SCPI_HISTORY_QA_BLOCK [%] saut TOF à vérifier: % -> %',new.scpi_slug,prior_tof,new.tof;
    end if;
  end if;

  if new.nombre_parts is not null and new.parts_attente_retrait is not null and new.nombre_parts>0 and new.parts_attente_retrait>new.nombre_parts then
    raise exception 'SCPI_HISTORY_QA_BLOCK [%] retraits en attente > parts totales',new.scpi_slug;
  end if;
  if new.nombre_parts is not null and new.nombre_associes is not null and new.nombre_parts>0 and new.nombre_associes>new.nombre_parts then
    raise exception 'SCPI_HISTORY_QA_BLOCK [%] associés > parts',new.scpi_slug;
  end if;
  if new.nombre_parts is not null and new.nombre_parts>=1000 and new.nombre_associes is not null and new.nombre_associes=new.nombre_parts then
    raise exception 'SCPI_HISTORY_QA_BLOCK [%] associés = parts suspect',new.scpi_slug;
  end if;

  if new.capitalisation is not null and new.capitalisation>0 and new.nombre_parts is not null and new.nombre_parts>0 and new.prix_souscription is not null and new.prix_souscription>0 then
    implied_cap := new.nombre_parts*new.prix_souscription/1000000.0;
    cap_gap := abs(implied_cap-new.capitalisation)/new.capitalisation;
    if cap_gap>0.25 then
      raise exception 'SCPI_HISTORY_QA_BLOCK [%] capitalisation incohérente: cap %, implicite %',new.scpi_slug,new.capitalisation,implied_cap;
    end if;
  end if;

  return new;
end $function$
;
