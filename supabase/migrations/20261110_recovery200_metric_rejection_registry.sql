-- RECOVERY-200 (10/11/2026) — registre des rejets revus et garde anti faux zéro.
--
-- Constat : public.refresh_scpi_metric_certifications(p_slug), appelée par l'analyse
-- (enforce_scpi_metric_evidence_v4_x) à chaque mise à jour de scpi_indicators, remet
-- toute certification non manuelle en « non prouvée » puis la re-dérive de
-- scpi_bulletins.extraction_json. Une certification rejetée après revue redevenait donc
-- automatiquement auto_verified_with_evidence (cas Ficommerce Proximité T3 2026 : dividende
-- 0 € « prouvé » par un « 0,00 % » de revenus non récurrents).
--
-- Règle : une décision de rejet revue est rejouée à chaque écriture tant que la valeur
-- extraite est identique. Seule une vérification manuelle (manual_verified%) ou une valeur
-- extraite différente la lève. Un zéro auto-certifié sur une métrique où zéro n'est pas
-- plausible sans revue est mis en review_required_zero_value.

create table if not exists scpi_internal.metric_certification_rejections (
  scpi_slug text not null,
  source_period text not null,
  metric text not null,
  rejected_value numeric not null,
  rejection_status text not null
    check (rejection_status ~ '^(invalid|rejected|review_required)_[a-z0-9_]+$'),
  reason text not null,
  evidence_excerpt text,
  decided_by text not null,
  decided_at timestamptz not null default now(),
  recovery_task text not null default 'RECOVERY-200',
  primary key (scpi_slug, source_period, metric, rejected_value)
);

alter table scpi_internal.metric_certification_rejections enable row level security;
revoke all on scpi_internal.metric_certification_rejections from anon, authenticated;

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

-- Nom choisi pour s'exécuter après les gardes TOF existantes (ordre alphabétique des triggers BEFORE).
drop trigger if exists trg_zzzzzz_reviewed_metric_rejection on public.scpi_metric_certifications;
create trigger trg_zzzzzz_reviewed_metric_rejection
  before insert or update on public.scpi_metric_certifications
  for each row execute function scpi_internal.guard_reviewed_metric_rejection();

-- Décisions revues le 10/11/2026 (revue outillée, non humaine) : la valeur certifiée est
-- contredite par l'extrait de preuve lui-même.
insert into scpi_internal.metric_certification_rejections
  (scpi_slug, source_period, metric, rejected_value, rejection_status, reason, evidence_excerpt, decided_by)
values
  ('ficommerce-proximite', '2026-T3', 'distribution_par_part', 0, 'invalid_false_zero_unit_mismatch',
   'Dividende 0 € rapproché d''un « 0,00 % » (part des revenus non récurrents) : unité incohérente.',
   'Dividende en € (10) 9,52 10,50 10,60 (11) 10,65 10,70 (12) dont % des revenus non récurrents … 0,00 %',
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('selectipierre-2', '2026-T3', 'distribution_par_part', 0, 'invalid_false_zero_unit_mismatch',
   'Dividende extrait à 0 € sans preuve de champ ; historique 6,50 €/part, même défaut que Ficommerce.',
   null, 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('buroboutic-metropoles', '2026-T3', 'distribution_par_part', 0, 'invalid_false_zero_unit_mismatch',
   'Dividende extrait à 0 € ; le bulletin T3 2026 indique 0,90 €/part.', null,
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('paref-hexa', '2026-T3', 'distribution_par_part', 0, 'invalid_false_zero_unit_mismatch',
   'Dividende extrait à 0 € ; le bulletin T3 2026 indique 3,30 €/part brut.', null,
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('primovie', '2026-T2', 'parts_attente_retrait', 0, 'invalid_not_applicable_variability_suspended',
   'Le bulletin T2 2026 affiche « - » pour les parts en attente de retrait (contre 1 201 141 / 1 355 899 / '
   '1 438 276 les trimestres précédents) et précise que la SCPI a suspendu la variabilité du capital ; le 0 '
   'retenu provient de la ligne « parts en attente de cession ». Zéro non applicable, pas zéro.',
   'Nombre de parts en attente de retrait (confirmées et non confirmées*) 1 201 141 1 355 899 1 438 276 - '
   'Nombre de parts en attente de cession (confirmées et non confirmées*) - - - 0 La SCPI Primovie a suspendu temporair…',
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('aestiam-agora', '2025-T2', 'parts_attente_retrait', 0, 'invalid_evidence_other_product',
   'L''extrait cité indique 104 068 / 105 643 / 105 643 parts en attente pour un fonds de 749 915 parts '
   '(Aestiam Agora : 508 097 parts) : extrait d''un autre produit, zéro non prouvé.',
   'Nombre total de parts 749 915 749 915 749 915 … Parts en attente de retrait 104 068 105 643 105 643',
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('aestiam-horizon', '2024-T2', 'parts_attente_retrait', 0, 'invalid_evidence_other_product',
   'L''extrait cité indique 92 867 / 94 162 / 94 172 parts en attente pour un fonds de 749 915 parts '
   '(Aestiam Horizon : 1 086 498 parts) : extrait d''un autre produit, zéro non prouvé.',
   'Nombre total de parts 749 915 749 915 749 915 … Parts en attente de retrait 92 867 94 162 94 172',
   'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('aestiam-horizon', '2023-T3', 'parts_attente_retrait', 0, 'invalid_value_contradicted_by_evidence',
   'Le tableau cité comporte quatre colonnes renseignées (1 078 984 / 1 086 588 / 1 088 396 / 1 086 498 parts) '
   'et la ligne parts en attente se termine par 1 493 : le 0 retenu est celui d''une colonne antérieure.',
   'Nombre total de parts 1 078 984 1 086 588 1 088 396 1 086 498 - … Parts en attente de retrait 0 0 0 1 493 -',
   'claude-session-recovery-200 (revue outillée, non humaine)')
on conflict (scpi_slug, source_period, metric, rejected_value) do nothing;

-- Rejoue les décisions sur les certifications existantes (le trigger applique le statut).
update public.scpi_metric_certifications c
set verification_status = c.verification_status
from scpi_internal.metric_certification_rejections x
where x.scpi_slug = c.scpi_slug
  and x.source_period = c.source_period
  and x.metric = c.metric
  and x.rejected_value = c.value_numeric
  and c.verification_status not ilike 'manual_verified%';
