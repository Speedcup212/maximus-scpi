-- RECOVERY-200 (10/11/2026) — retour au T2 2026 vérifié pour 5 SCPI de la base stricte.
-- Décision de Mr Bellaiche, 10/11/2026 au soir : même méthode qu'Iroko Atlas.
--
-- Constat (certain) : ces lignes live sont en 2026-T3 depuis fin octobre ou début novembre, au statut
-- source_verified_t3_partial_metrics, et n'ont été relues par personne. Le 10/11 à 17:46 et 17:49 UTC,
-- un recalcul des analyses dont l'auteur reste à identifier les a passées en review_required
-- (current_source_not_certified). Le contrôle de cohorte du build bloque alors tout déploiement.
--
-- Périmètre : uniquement les 5 SCPI dont le snapshot T2 a une source non automatisée. Leur retour passe
-- donc tous les garde-fous sans rien modifier d'autre. Les 4 SCPI dont le T2 provient d'un pipeline
-- automatisé (aestiam-horizon, epargne-pierre, patrimmo-commerce, primovie) sont exclues : le garde-fou
-- « régression de période » les bloque, et il n'est ni contourné ni requalifié ici.
-- Essai à blanc (transaction annulée) : les 5 analyses ressortent `certified`, avec T2 comparé à T1.

alter table scpi_internal.indicator_live_rollbacks
  add column if not exists restored_from_row jsonb;

do $$
declare
  s text;
  cur public.scpi_indicators%rowtype;
  hh public.scpi_indicator_history%rowtype;
  bid uuid;
  verdict record;
begin
  foreach s in array array['epsicap-nano', 'pierval-sante', 'transitions-europe', 'praemia-hotels-europe', 'log-in'] loop
    select * into cur from public.scpi_indicators where scpi_slug = s for update;
    if cur.source_period is distinct from '2026-T3' or cur.qa_status is distinct from 'source_verified_t3_partial_metrics' then
      raise exception '% : état inattendu (%, %)', s, cur.source_period, cur.qa_status;
    end if;

    select * into hh from public.scpi_indicator_history h
    where h.scpi_slug = s and h.source_period = '2026-T2' order by h.snapshot_at desc limit 1;
    if hh.id is null or not public.scpi_is_strong_qa(hh.qa_status) or hh.source_type ~* '(automated|edge|ingest)' then
      raise exception '% : snapshot T2 absent, faible ou automatisé', s;
    end if;

    select bb.id into bid from public.scpi_bulletins bb
    where bb.scpi_slug = s and bb.period = '2026-T2'
    order by case when public.scpi_is_strong_qa(bb.qa_status) then 1 else 0 end desc,
             coalesce(bb.extraction_confidence, 0) desc, bb.processed_at desc nulls last, bb.found_at desc
    limit 1;

    insert into scpi_internal.indicator_live_rollbacks
      (scpi_slug, rolled_back_period, restored_period, restored_from_history_id, reason, decided_by, rolled_back_row, restored_from_row)
    values (s, '2026-T3', '2026-T2', hh.id,
      'T3 partiel non relu (source_verified_t3_partial_metrics) ; analyse review_required bloquant le build production.',
      'Mr Bellaiche (décision 10/11/2026), exécution claude-session-recovery-200',
      to_jsonb(cur), to_jsonb(hh));

    update public.scpi_indicators i set
      source_period = hh.source_period, source_url = hh.source_url, source_document = hh.source_document,
      source_type = hh.source_type, qa_status = hh.qa_status, bulletin_id = bid,
      td = hh.td, tof = hh.tof, capitalisation = hh.capitalisation, prix_souscription = hh.prix_souscription,
      prix_reconstitution = hh.prix_reconstitution, prix_retrait = hh.prix_retrait,
      valeur_realisation = hh.valeur_realisation, endettement = hh.endettement, walt = hh.walt, walb = hh.walb,
      collecte_nette = hh.collecte_nette, nb_cessions_trimestre = hh.nb_cessions_trimestre,
      distribution_par_part = hh.distribution_par_part, nombre_locataires = hh.nombre_locataires,
      nombre_immeubles = hh.nombre_immeubles, nombre_parts = hh.nombre_parts, nombre_associes = hh.nombre_associes,
      parts_attente_retrait = hh.parts_attente_retrait, retraits_executes_trimestre = hh.retraits_executes_trimestre,
      capital_type = coalesce(hh.capital_type, i.capital_type), source_confidence = hh.source_confidence,
      -- seules les preuves de frais (indépendantes du trimestre) sont conservées
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
