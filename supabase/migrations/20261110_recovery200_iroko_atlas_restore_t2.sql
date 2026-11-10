-- RECOVERY-200 (10/11/2026) — retour d'Iroko Atlas au T2 2026 vérifié manuellement.
-- Décision de Mr Bellaiche, 10/11/2026 au soir.
--
-- Constat (certain) :
--   * La ligne live est en 2026-T3 depuis le 07/11/2026 (historique 242d7f77, qa_status
--     auto_verified_t3_verified_fields). Elle n'a été relue par personne.
--   * Elle mélange deux trimestres : capitalisation T3 de 218,83 M€ avec le nombre de parts du
--     T2 (834 833). Or 834 833 parts × 200 € = 166,97 M€. Associés (4 695) et collecte
--     (46 903 000) sont aussi ceux du T2.
--   * Le 10/11 à 12:54:59 UTC, une mise à jour technique de la ligne a recalculé l'analyse :
--     certification_status = review_required. Le contrôle de cohorte du build bloque alors
--     tout déploiement : PROGRESSIVE_COHORT_ATTESTATION:EXISTING_STRICT_CERTIFICATIONS_INVALID:iroko-atlas.
--
-- Action : sauvegarder la ligne T3 telle quelle, puis rétablir le snapshot T2 vérifié
-- (scpi_indicator_history 0f6ac035, bulletin 3c0f4104). On ne conserve que la preuve de frais
-- de souscription, qui ne dépend pas du trimestre.
-- Les données T3 restent disponibles pour relecture (historique 242d7f77 et sauvegarde ci-dessous).
-- Aucun garde-fou n'est désactivé. Un essai à blanc (transaction annulée) a donné une analyse
-- `certified`, avec 2026-T2 comparé à 2026-T1.

create table if not exists scpi_internal.indicator_live_rollbacks (
  id bigint generated always as identity primary key,
  scpi_slug text not null,
  rolled_back_at timestamptz not null default now(),
  rolled_back_period text not null,
  restored_period text not null,
  restored_from_history_id uuid,
  reason text not null,
  decided_by text not null,
  rolled_back_row jsonb not null
);
revoke all on scpi_internal.indicator_live_rollbacks from public, anon, authenticated;
comment on table scpi_internal.indicator_live_rollbacks is
  'RECOVERY-200 : lignes live retirées (copie intégrale) avant retour à un snapshot vérifié.';

do $$
declare
  current_row public.scpi_indicators%rowtype;
  verdict record;
begin
  select * into current_row from public.scpi_indicators where scpi_slug = 'iroko-atlas' for update;
  if not found then
    raise exception 'iroko-atlas absent de scpi_indicators';
  end if;
  if current_row.source_period is distinct from '2026-T3'
     or current_row.qa_status is distinct from 'auto_verified_t3_verified_fields' then
    raise exception 'état inattendu (%, %) : migration non rejouée', current_row.source_period, current_row.qa_status;
  end if;

  insert into scpi_internal.indicator_live_rollbacks
    (scpi_slug, rolled_back_period, restored_period, restored_from_history_id, reason, decided_by, rolled_back_row)
  values ('iroko-atlas', '2026-T3', '2026-T2', '0f6ac035-22f9-4a69-9278-5efed872768e',
    'T3 non relu et mélangeant deux trimestres (capitalisation T3, parts/associés/collecte T2) ; analyse review_required bloquant le build production.',
    'Mr Bellaiche (décision 10/11/2026), exécution claude-session-recovery-200',
    to_jsonb(current_row));

  update public.scpi_indicators set
    source_period = '2026-T2',
    source_url = 'https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_bulletin_trimestriel_T2_2026.pdf',
    source_document = 'Iroko_Atlas_bulletin_trimestriel_T2_2026.pdf',
    source_type = 'bulletin_manual_verified_official',
    qa_status = 'manual_verified_official_liquidity',
    bulletin_id = '3c0f4104-332f-4c78-ae50-b1518e77c5f8',
    td = 9.41, tof = 98.11, walb = 8, walt = 10, endettement = 0, capital_type = 'variable',
    nombre_parts = 834833, prix_retrait = 200, capitalisation = 166.923, collecte_nette = 46903000,
    nombre_associes = 4695, nombre_immeubles = 23, nombre_locataires = 53, prix_souscription = 200,
    source_confidence = 1, valeur_realisation = 198.04, prix_reconstitution = 216, distribution_par_part = 5.02,
    nb_cessions_trimestre = null, parts_attente_retrait = 0, retraits_executes_trimestre = null,
    metric_provenance = jsonb_build_object('frais_souscription', current_row.metric_provenance -> 'frais_souscription'),
    updated_at = now()
  where scpi_slug = 'iroko-atlas';

  -- Fail closed : la migration n'est conservée que si l'analyse redevient certifiée.
  select certification_status, current_source_certified, current_period into verdict
  from public.scpi_bulletin_analysis where scpi_slug = 'iroko-atlas';
  if verdict.certification_status is distinct from 'certified'
     or verdict.current_source_certified is not true
     or verdict.current_period is distinct from '2026-T2' then
    raise exception 'analyse non certifiée après retour T2 (% / % / %) : annulation',
      verdict.certification_status, verdict.current_source_certified, verdict.current_period;
  end if;
end $$;
