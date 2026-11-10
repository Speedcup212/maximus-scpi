-- RECOVERY-200 (10/11/2026) — retour au T2 2026 de 4 SCPI de la base stricte, par décision explicite
-- de Mr Bellaiche (10/11/2026 au soir, « retour manuel tracé »).
--
-- Les 4 SCPI sont aestiam-horizon, epargne-pierre, patrimmo-commerce et primovie. Leur ligne live
-- 2026-T3 (source_verified_t3_partial_metrics) n'a été relue par personne. Le recalcul du 10/11 l'a passée
-- en review_required, et le build production est bloqué.
-- Leur snapshot T2 provient d'un pipeline automatisé (bulletin_edge_automated). Le garde-fou
-- guard_scpi_indicator_live_quality refuse les régressions de période des écritures automatisées. Or
-- cette écriture n'est pas automatisée : c'est un retour manuel décidé par le propriétaire. Elle est
-- donc marquée source_type = 'owner_rollback_t2_snapshot'. Le source_type d'origine reste conservé
-- dans indicator_live_rollbacks.restored_from_row, et le qa_status d'origine (auto_verified) est gardé
-- sans changement. Le garde-fou lui-même n'est pas modifié.
-- La migration est annulée en bloc si une des 4 analyses n'est pas certifiée (essai à blanc : 4 sur 4 certifiées).

do $$
declare
  s text;
  cur public.scpi_indicators%rowtype;
  hh public.scpi_indicator_history%rowtype;
  bid uuid;
  verdict record;
begin
  foreach s in array array['aestiam-horizon', 'epargne-pierre', 'patrimmo-commerce', 'primovie'] loop
    select * into cur from public.scpi_indicators where scpi_slug = s for update;
    if cur.source_period is distinct from '2026-T3' or cur.qa_status is distinct from 'source_verified_t3_partial_metrics' then
      raise exception '% : état inattendu (%, %)', s, cur.source_period, cur.qa_status;
    end if;

    select * into hh from public.scpi_indicator_history h
    where h.scpi_slug = s and h.source_period = '2026-T2' order by h.snapshot_at desc limit 1;
    if hh.id is null or not public.scpi_is_strong_qa(hh.qa_status) then
      raise exception '% : snapshot T2 absent ou faible', s;
    end if;

    select bb.id into bid from public.scpi_bulletins bb
    where bb.scpi_slug = s and bb.period = '2026-T2'
    order by case when public.scpi_is_strong_qa(bb.qa_status) then 1 else 0 end desc,
             coalesce(bb.extraction_confidence, 0) desc, bb.processed_at desc nulls last, bb.found_at desc
    limit 1;

    insert into scpi_internal.indicator_live_rollbacks
      (scpi_slug, rolled_back_period, restored_period, restored_from_history_id, reason, decided_by, rolled_back_row, restored_from_row)
    values (s, '2026-T3', '2026-T2', hh.id,
      'T3 partiel non relu ; analyse review_required bloquant le build production. Retour manuel tracé : source T2 d''origine ' || coalesce(hh.source_type, 'inconnue') || '.',
      'Mr Bellaiche (décision explicite « retour manuel tracé », 10/11/2026), exécution claude-session-recovery-200',
      to_jsonb(cur), to_jsonb(hh));

    update public.scpi_indicators i set
      source_period = hh.source_period, source_url = hh.source_url, source_document = hh.source_document,
      source_type = 'owner_rollback_t2_snapshot', qa_status = hh.qa_status, bulletin_id = bid,
      td = hh.td, tof = hh.tof, capitalisation = hh.capitalisation, prix_souscription = hh.prix_souscription,
      prix_reconstitution = hh.prix_reconstitution, prix_retrait = hh.prix_retrait,
      valeur_realisation = hh.valeur_realisation, endettement = hh.endettement, walt = hh.walt, walb = hh.walb,
      collecte_nette = hh.collecte_nette, nb_cessions_trimestre = hh.nb_cessions_trimestre,
      distribution_par_part = hh.distribution_par_part, nombre_locataires = hh.nombre_locataires,
      nombre_immeubles = hh.nombre_immeubles, nombre_parts = hh.nombre_parts, nombre_associes = hh.nombre_associes,
      parts_attente_retrait = hh.parts_attente_retrait, retraits_executes_trimestre = hh.retraits_executes_trimestre,
      capital_type = coalesce(hh.capital_type, i.capital_type), source_confidence = hh.source_confidence,
      metric_provenance = (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
                           from jsonb_each(coalesce(i.metric_provenance, '{}'::jsonb)) e(k, v)
                           where k in ('frais_souscription', 'frais_gestion')),
      updated_at = now()
    where i.scpi_slug = s;

    select certification_status, current_source_certified, current_period into verdict
    from public.scpi_bulletin_analysis where scpi_slug = s;
    if verdict.certification_status is distinct from 'certified' or verdict.current_source_certified is not true
       or verdict.current_period is distinct from '2026-T2' then
      raise exception '% : analyse non certifiée après retour T2 (% / % / %) : annulation de tout le lot',
        s, verdict.certification_status, verdict.current_source_certified, verdict.current_period;
    end if;
  end loop;
end $$;
