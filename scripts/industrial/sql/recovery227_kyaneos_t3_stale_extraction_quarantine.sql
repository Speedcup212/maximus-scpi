-- RECOVERY-227 — Kyaneos Pierre 2026-T3 : la ligne de bulletin extraite le
-- 2026-11-28 03:30:53Z porte des montants décalés d'un champ. Elle doit rester
-- non publiable et ne jamais être promue tant qu'elle n'a pas été ré-extraite
-- avec le correctif de `scpi-ingestion/src/extractor.ts`.
--
-- Constat mesuré sur l'octet officiel (SHA-256 4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c) :
--   * extraction_json.maximus_indicators.valeur_realisation = 184,42 (valeur IFI)
--     alors que la page 4 publie « Valeur de réalisation* 186,49 € » ;
--   * extraction_json.valorisation_risque.prix_reconstitution = 186,49
--     alors que la page 4 publie « Valeur de reconstitution* 225,02 € » ;
--   * extraction_json.maximus_indicators.prix_retrait = 225,02
--     alors que la page 4 publie « Valeur de retrait* 199,36 € » ;
--   * extraction_json.maximus_indicators.endettement = 0 alors que la page 4
--     porte une jauge (0 % / 25 % / 50 %) et la phrase « La dette représente
--     25 % de la valeur de réalisation ». Le 0 enregistré est le premier cran
--     de la jauge, pas le ratio publié (25 %).
--   * extraction_json.maximus_indicators.nombre_immeubles = 8 (acquisitions du
--     trimestre) au lieu de « Nombre d'actifs : 666 ».
--
-- Ce script ne touche AUCUNE donnée financière certifiée, aucun seuil strict et
-- aucune vue. Il (1) vérifie que l'état attendu est bien celui observé,
-- (2) inscrit la ligne dans la quarantaine de provenance existante, (3) vérifie
-- que la ligne décalée n'a atteint aucune surface publiée.
--
-- ## Ce que ce script NE fait pas (limite mesurée, à ne pas surinterpréter)
--
-- Il ne pose aucun verrou de promotion. Le refus de promouvoir la ligne est
-- porté par deux gardes déjà en place, exercés hors de ce fichier :
--   * `scpi_commit_certified_promotion` exige `qa_status='auto_verified'` sur le
--     bulletin et un certificat `auto_verified_with_evidence` par métrique
--     (`pdf_page_text_match`, page > 0, valeur identique). La ligne est en
--     `auto_partial_review` : elle ne peut donc pas être promue.
--   * `validateIndicatorPatch` (netlify/functions/utils/scpi-bulletin-ingestion.ts)
--     refuse les variations extrêmes, désormais aussi celles des stocks
--     (`nombre_immeubles`, `nombre_locataires`, `nombre_associes`,
--     `nombre_parts`) — 8 actifs contre 666 certifiés est refusé.
-- Ces deux gardes sont testés respectivement par
-- `scripts/industrial/recovery227PromotionGuard.test.mjs` (10 tests) et par les
-- contraintes du RPC. Le présent script ajoute la trace de provenance, pas le
-- verrou.
--
-- Exécution : psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/industrial/sql/recovery227_kyaneos_t3_stale_extraction_quarantine.sql

begin;

do $rec227$
declare
  b public.scpi_bulletins%rowtype;
  h public.scpi_indicator_history%rowtype;
  live public.scpi_indicators%rowtype;
  strict_row public.scpi_crash_test_strict_v2%rowtype;
  pass_before integer;
  pass_after integer;
  n integer;
begin
  perform pg_advisory_xact_lock(hashtext('recovery227:kyaneos-pierre:2026-T3'));

  select count(*) into pass_before
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';

  -- 1. La cohorte ne doit pas bouger.
  if (select count(*) from maximus_agents.scpi_universe where lifecycle = 'existing') <> 69
     or (select count(*) from public.scpi_crash_test_strict_v2) <> 69 then
    raise exception 'REC227_COHORT_DRIFT';
  end if;

  -- 2. Ligne de bulletin exacte, toujours partielle, jamais promue.
  select * into strict b
  from public.scpi_bulletins
  where scpi_slug = 'kyaneos-pierre' and period = '2026-T3'
  for update;

  if b.id is null
     or b.pdf_sha256 <> '4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c'
     or b.source_url <> 'https://kyaneosam.com/wp-content/uploads/2026/11/SCPI-KP-Bulletin-trimestriel-3T2026.pdf'
     or b.qa_status <> 'auto_partial_review' then
    raise exception 'REC227_BULLETIN_PREIMAGE_MISMATCH';
  end if;

  -- 3. Le décalage doit être encore présent : sinon une ré-extraction a déjà eu
  --    lieu et cette quarantaine n'a plus d'objet (ne pas la rejouer en aveugle).
  if (b.extraction_json -> 'maximus_indicators' ->> 'valeur_realisation') is distinct from '184.42'
     or (b.extraction_json -> 'valorisation_risque' ->> 'prix_reconstitution') is distinct from '186.49'
     or (b.extraction_json -> 'maximus_indicators' ->> 'prix_retrait') is distinct from '225.02'
     or (b.extraction_json -> 'maximus_indicators' ->> 'endettement') is distinct from '0'
     or (b.extraction_json -> 'maximus_indicators' ->> 'nombre_immeubles') is distinct from '8' then
    raise exception 'REC227_EXTRACTION_ALREADY_CHANGED_REVIEW_REQUIRED';
  end if;

  -- 4. Aucune valeur décalée ne doit avoir atteint une surface publiée.
  select * into live from public.scpi_indicators where scpi_slug = 'kyaneos-pierre';
  if live.source_period = '2026-T3' then
    raise exception 'REC227_STALE_VALUES_REACHED_PUBLIC_INDICATORS';
  end if;
  if live.prix_reconstitution = 186.49 or live.valeur_realisation = 184.42
     or live.prix_retrait = 225.02 then
    raise exception 'REC227_PUBLIC_INDICATORS_CARRY_SHIFTED_VALUES source_period=%', live.source_period;
  end if;

  select * into h
  from public.scpi_indicator_history
  where scpi_slug = 'kyaneos-pierre' and source_period = '2026-T3'
  for update;
  if h.id is not null then
    raise exception 'REC227_HISTORY_ROW_ALREADY_EXISTS_REVIEW_REQUIRED';
  end if;

  -- 5. Aucun certificat TOF ni autre sur la période : le blocage vient de la
  --    découverte documentaire, pas d'une valeur financière en conflit.
  if exists (select 1 from public.scpi_metric_certifications
             where scpi_slug = 'kyaneos-pierre' and source_period = '2026-T3') then
    raise exception 'REC227_UNEXPECTED_T3_CERTIFICATES';
  end if;

  -- 6. Trace immuable dans la quarantaine de provenance existante.
  insert into maximus_agents.scpi_replay_provenance_quarantine(event_key, reason, snapshot)
  values (
    'recovery227:kyaneos-pierre:2026-T3:shifted-per-share-extraction',
    'La ligne 2026-T3 extraite le 2026-11-28 03:30:53Z attribue à chaque libellé de valorisation le montant du champ voisin (IFI/réalisation/reconstitution/retrait), invente un endettement 0 % à partir des graduations de jauge et lit le flux d''acquisitions (8) comme nombre d''actifs (666). Le bulletin et le code ne sont pas modifiés financièrement ; la ligne reste non publiable jusqu''à ré-extraction corrigée.',
    jsonb_build_object(
      'bulletin_before', to_jsonb(b),
      'public_indicators_untouched', to_jsonb(live),
      'history_row_absent', true,
      'official_pdf', jsonb_build_object(
        'sha256', b.pdf_sha256,
        'byte_size', 1401858,
        'page', 4,
        'published_values', jsonb_build_object(
          'valeur_ifi', 184.42,
          'valeur_realisation', 186.49,
          'valeur_reconstitution', 225.02,
          'valeur_retrait', 199.36,
          'nombre_actifs', 666,
          'ratio_dette_publie_pct', 25
        ),
        'readers', jsonb_build_array('MuPDF', 'Poppler'),
        'reference_date_on_page', '2026-06-30',
        'reference_date_anomaly', 'le bloc « Valeurs de part » du bulletin 3T 2026 porte la date du 30/06/2026 alors que la période publiée est 2026-T3 : la date de valeur est qualifiée séparément de la période du document et aucune valorisation n''est datée par déduction',
        'debt_ratio_definition', 'le ratio publié « La dette représente 25 % de la valeur de réalisation » est distinct de la jauge 0/25/50 % ; ni l''un ni l''autre n''est converti ici en endettement certifié'
      ),
      'financial_certified', false,
      'deploy_allowed', false,
      'human_attestation', false
    )
  )
  on conflict (event_key) do nothing;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'REC227_QUARANTINE_NOT_RECORDED';
  end if;

  -- 7. Le compteur strict doit rester identique : ce correctif ne certifie rien.
  select count(*) into pass_after
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';
  if pass_after <> pass_before then
    raise exception 'REC227_STRICT_REGRESSION % -> %', pass_before, pass_after;
  end if;

  -- 8. Diagnostic nommé, sans édition de la vue : la vue ne peut pas produire
  --    PASS_100 pour ce fonds tant que source_ready/operational_status ne sont
  --    pas explicitement rétablis par la chaîne documentaire.
  select * into strict_row
  from public.scpi_crash_test_strict_v2 where scpi_slug = 'kyaneos-pierre';
  if strict_row.crash_test_status = 'PASS_100' then
    raise exception 'REC227_UNEXPECTED_PASS_100_WITH_UNPUBLISHED_T3';
  end if;

  insert into public.scpi_ingestion_events
    (scpi_slug, status, step, message, source_period, bulletin_url,
     extraction_confidence, metrics_count, ended_at)
  values (
    'kyaneos-pierre', 'completed', 'recovery227_t3_shifted_extraction_quarantined',
    'Ligne T3 2026 identifiée comme décalée (valeur de chaque libellé = champ voisin) ; '
    'endettement 0 % issu des graduations de jauge ; 8 acquisitions lues comme nombre d''actifs. '
    'Aucune écriture financière, aucun certificat, aucun changement de seuil strict.',
    '2026-T3', b.source_url, b.extraction_confidence, 1, now()
  );
end
$rec227$;

commit;

-- Relecture (aucune écriture) :
--   select scpi_slug, period, qa_status, extraction_confidence
--   from public.scpi_bulletins where scpi_slug='kyaneos-pierre' and period='2026-T3';
--   select scpi_slug, crash_test_status, operational_status, source_ready,
--          quarterly_blockers, missing_tof, uncertified_tof_periods
--   from public.scpi_crash_test_strict_v2 where scpi_slug='kyaneos-pierre';
