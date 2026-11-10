-- RECOVERY-200 (10/11/2026) — une certification rejetée n'est jamais revalidée automatiquement.
--
-- Preuve du défaut (transaction annulée) : public.refresh_scpi_metric_certifications('sofiprime')
-- faisait repasser les 147 certifications `rejected_wrong_product` en auto_verified_with_evidence
-- (146) ou source_verified_no_field_evidence (1), avec les valeurs du mauvais produit. Le bulletin
-- est en `historical_auto_verified` (QA forte), donc toute mise à jour de l'indicateur Sofiprime
-- aurait suffi à republier ces valeurs.
--
-- Règle : sur UPDATE, une ligne `rejected_*` / `invalid_*` conserve son statut, sa valeur et sa
-- preuve tant que la nouvelle écriture n'est ni un autre rejet ni une vérification manuelle.
-- Les statuts `review_required_*` restent dynamiques (ils signalent un doute, pas un rejet).

create or replace function scpi_internal.guard_reviewed_metric_rejection()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  decided_status text;
begin
  if NEW.verification_status ilike 'manual_verified%' then
    return NEW;
  end if;

  if TG_OP = 'UPDATE'
     and OLD.verification_status ~ '^(rejected|invalid)_'
     and NEW.verification_status !~ '^(rejected|invalid)_' then
    NEW.verification_status := OLD.verification_status;
    NEW.verification_method := OLD.verification_method;
    NEW.value_numeric := OLD.value_numeric;
    NEW.value_text := OLD.value_text;
    NEW.unit := OLD.unit;
    NEW.source_url := OLD.source_url;
    NEW.source_page := OLD.source_page;
    NEW.evidence_text := OLD.evidence_text;
    NEW.bulletin_id := OLD.bulletin_id;
    return NEW;
  end if;

  if NEW.value_numeric is not null then
    select x.rejection_status into decided_status
    from scpi_internal.metric_certification_rejections x
    where x.scpi_slug = NEW.scpi_slug
      and x.source_period = NEW.source_period
      and x.metric = NEW.metric
      and x.rejected_value = NEW.value_numeric
    limit 1;
    if decided_status is not null then
      NEW.verification_status := decided_status;
      return NEW;
    end if;
  end if;

  if NEW.verification_status = 'auto_verified_with_evidence'
     and NEW.value_numeric = 0
     and NEW.metric in ('distribution_par_part', 'td', 'td_annee', 'prix_souscription', 'prix_retrait',
                        'prix_reconstitution', 'valeur_realisation', 'capitalisation', 'nombre_parts',
                        'nombre_associes', 'nombre_immeubles', 'nombre_locataires') then
    NEW.verification_status := 'review_required_zero_value';
  end if;
  return NEW;
end;
$function$;

revoke all on function scpi_internal.guard_reviewed_metric_rejection() from public, anon, authenticated;
