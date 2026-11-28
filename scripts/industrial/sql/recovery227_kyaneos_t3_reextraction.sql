-- RECOVERY-227 — ré-extraction ciblée de Kyaneos Pierre 2026-T3 depuis le PDF
-- déjà archivé (SHA-256 4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c,
-- 1 401 858 octets, source_url du registre).
--
-- Cette transaction NE CERTIFIE RIEN. Elle remplace le seul bloc
-- `extraction_json` de la ligne T3 par les valeurs que l'émetteur publie, avec
-- provenance et date par champ, et laisse `qa_status='auto_partial_review'`.
-- Une ligne `auto_partial_review` ne peut pas être promue : le refus reste porté
-- par `scpi_commit_certified_promotion` (exige `auto_verified` + un certificat
-- par métrique) et par `validateIndicatorPatch` (refus d'effondrement de stock).
--
-- Ce script n'écrit ni dans `scpi_indicators`, ni dans `scpi_indicator_history`,
-- ni dans `scpi_metric_certifications`, ni dans une vue.
--
-- Valeurs publiées page 4 (relues par Poppler et PyMuPDF sur l'octet archivé) :
--   Valeur IFI*                 184,42 €
--   Valeur de réalisation*      186,49 €
--   Valeur de reconstitution*   225,02 €
--   Valeur de retrait*          199,36 €
--   Prix de souscription        224 €
--   Nombre d'actifs             666
--   Ratio de dettes             25 %  (phrase publiée, jamais la jauge 0/25/50 %)
-- Page 1 : Capitalisation 458 M€.
--
-- ANOMALIE DE DATE conservée telle quelle, jamais lissée : le bloc
-- « Valeurs de part » du bulletin 3T 2026 porte « au 30/06/2026 ». C'est la date
-- imprimée par l'émetteur ; elle est qualifiée séparément de la période du
-- document (2026-T3, arrêtée au 30/09/2026) et aucune valorisation n'est datée
-- par déduction.
--
-- Exécution :
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql
--
-- Le retour arrière exact est dans
-- `recovery227_kyaneos_t3_reextraction_rollback.sql` : il ne se contente pas de
-- relire le snapshot, il vérifie d'abord que la postimage est toujours celle
-- écrite ici, et laisse une trace d'annulation.

begin;

do $rec227$
declare
  b public.scpi_bulletins%rowtype;
  live public.scpi_indicators%rowtype;
  pass_before integer;
  pass_after integer;
  before_extraction jsonb;
  after_extraction jsonb;
  before_confidence numeric;
  before_qa_status text;
  before_processed_at timestamptz;
  written_confidence numeric := 0.6;
  derived_endettement_pct numeric;
  n integer;
  c_sha constant text := '4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c';
  c_url constant text := 'https://kyaneosam.com/wp-content/uploads/2026/11/SCPI-KP-Bulletin-trimestriel-3T2026.pdf';
  c_page4_date constant date := '2026-06-30';
  -- `extraction_json` porte une FRACTION (l'extracteur renvoie 0.25 pour un
  -- « 25 % » publié) ; `buildIndicatorPatch` la multiplie par 100 avant
  -- `scpi_indicators.endettement`. Écrire 25 ici publierait 2500 %.
  c_debt_fraction constant numeric := 0.25;
  -- Provenance par champ : valeur, page, date de valeur imprimée, définition.
  provenance constant jsonb := jsonb_build_object(
    'source_url', c_url,
    'pdf_sha256', c_sha,
    'pdf_byte_size', 1401858,
    'readers', jsonb_build_array('MuPDF', 'Poppler', 'pdf-parse'),
    'parsed_at', '2026-11-28',
    'fields', jsonb_build_object(
      'prix_souscription', jsonb_build_object(
        'value', 224, 'unit', 'EUR_PER_PART', 'page', 4,
        'reference_date', c_page4_date,
        'definition', 'prix de souscription par part',
        'printed_in_block', 'Valeurs de part'),
      'valeur_realisation', jsonb_build_object(
        'value', 186.49, 'unit', 'EUR_PER_PART', 'page', 4,
        'reference_date', c_page4_date,
        'definition', 'valeur de realisation par part',
        'printed_in_block', 'Valeurs de part'),
      'prix_reconstitution', jsonb_build_object(
        'value', 225.02, 'unit', 'EUR_PER_PART', 'page', 4,
        'reference_date', c_page4_date,
        'definition', 'valeur de reconstitution par part',
        'printed_in_block', 'Valeurs de part'),
      'prix_retrait', jsonb_build_object(
        'value', 199.36, 'unit', 'EUR_PER_PART', 'page', 4,
        'reference_date', c_page4_date,
        'definition', 'valeur de retrait par part',
        'printed_in_block', 'Valeurs de part'),
      'endettement', jsonb_build_object(
        'value', c_debt_fraction, 'unit', 'FRACTION_OF_1', 'page', 4,
        'published_as_percent', 25,
        'reference_date', '2026-09-30',
        'definition', 'ratio publie en prose : la dette represente 25 % de la valeur de realisation',
        'canonical_metric', 'endettement (LTV) = dettes / valeur de realisation du patrimoine',
        'not_the_gauge', 'la jauge 0 % / 25 % / 50 % est une echelle et ne fournit aucune valeur'),
      'nombre_immeubles', jsonb_build_object(
        'value', 666, 'unit', 'count', 'page', 4,
        'reference_date', '2026-09-30',
        'definition', 'stock : Total de la SCPI - Nombre d actifs',
        'not_the_flow', 'les 8 immeubles sont les acquisitions du trimestre'),
      'capitalisation', jsonb_build_object(
        'value', 458, 'unit', 'MEUR', 'page', 1,
        'reference_date', '2026-09-30',
        'definition', 'capitalisation en prix de souscription')
    ),
    'period', '2026-T3',
    'reference_date_anomaly',
      'le bloc Valeurs de part du bulletin 3T 2026 porte la date imprimee du 30/06/2026 '
      'alors que la periode publiee est 2026-T3 ; la date de valeur est qualifiee '
      'separement et aucune valorisation n est datee par deduction',
    'financial_certified', false,
    'deploy_allowed', false,
    'human_attestation', false,
    'certifies_nothing', true
  );
begin
  perform pg_advisory_xact_lock(hashtext('recovery227:kyaneos-pierre:2026-T3'));

  select count(*) into pass_before
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';
  if pass_before < 68 then
    raise exception 'REC227_STRICT_BASELINE_REGRESSED %', pass_before;
  end if;

  -- 1. Cette transaction ne s'exécute qu'une fois. Une trace existante signifie
  --    soit qu'elle a déjà été appliquée, soit qu'elle a été annulée par le
  --    rollback : dans les deux cas l'état doit être relu par un humain, jamais
  --    réécrit en aveugle.
  if exists (select 1 from maximus_agents.scpi_replay_provenance_quarantine
             where event_key = 'recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf') then
    raise exception 'REC227_ALREADY_EXECUTED_REVIEW_REQUIRED';
  end if;

  -- 2. Préimage exacte : la ligne doit être encore celle du décalage. La lecture
  --    n'est pas STRICT : l'absence de ligne doit produire un code nommé, pas
  --    un NO_DATA_FOUND brut.
  select * into b
  from public.scpi_bulletins
  where scpi_slug = 'kyaneos-pierre' and period = '2026-T3'
  for update;

  if b.id is null then
    raise exception 'REC227_BULLETIN_ROW_ABSENT';
  end if;
  if b.pdf_sha256 is distinct from c_sha
     or b.source_url is distinct from c_url
     or b.qa_status <> 'auto_partial_review' then
    raise exception 'REC227_PREIMAGE_MISMATCH qa_status=% sha=%', b.qa_status, b.pdf_sha256;
  end if;

  -- 3. Le décalage doit encore être présent. S'il a déjà disparu (écriture
  --    antérieure, autre correctif), cette transaction n'a plus d'objet : elle
  --    s'arrête au lieu d'écraser un état inconnu.
  if (b.extraction_json -> 'maximus_indicators' ->> 'valeur_realisation') is distinct from '184.42'
     or (b.extraction_json -> 'valorisation_risque' ->> 'prix_reconstitution') is distinct from '186.49'
     or (b.extraction_json -> 'maximus_indicators' ->> 'prix_retrait') is distinct from '225.02'
     or (b.extraction_json -> 'maximus_indicators' ->> 'nombre_immeubles') is distinct from '8' then
    raise exception 'REC227_UNEXPECTED_PREIMAGE_VALUES_REVIEW_REQUIRED';
  end if;

  -- 4. Aucune valeur décalée ne doit avoir atteint une surface publiée.
  select * into live from public.scpi_indicators where scpi_slug = 'kyaneos-pierre';
  if live.scpi_slug is null then
    raise exception 'REC227_PUBLIC_INDICATOR_ROW_ABSENT';
  end if;
  if live.source_period = '2026-T3' then
    raise exception 'REC227_STALE_VALUES_REACHED_PUBLIC_INDICATORS';
  end if;
  if live.prix_reconstitution = 186.49 or live.valeur_realisation = 184.42
     or live.prix_retrait = 225.02 then
    raise exception 'REC227_PUBLIC_INDICATORS_CARRY_SHIFTED_VALUES period=%', live.source_period;
  end if;

  if exists (select 1 from public.scpi_indicator_history
             where scpi_slug = 'kyaneos-pierre' and source_period = '2026-T3') then
    raise exception 'REC227_UNEXPECTED_T3_HISTORY_ROW';
  end if;
  if exists (select 1 from public.scpi_metric_certifications
             where scpi_slug = 'kyaneos-pierre' and source_period = '2026-T3') then
    raise exception 'REC227_UNEXPECTED_T3_CERTIFICATES';
  end if;

  -- 5. Définition et unité canoniques du ratio de dette, contrôlées ICI parce
  --    que la promotion les relit plus tard sans le contexte du PDF.
  --    Canonique dans l'application : `endettement` = « Endettement (LTV) »,
  --    dettes / valeur de réalisation du patrimoine, publié en pourcentage et
  --    borné [0 ; 80] par `scpi-certified-promote`.
  --    La phrase du bulletin (« la dette représente 25 % de la valeur de
  --    réalisation ») est exactement ce ratio, et non la jauge 0/25/50 qui
  --    n'est qu'une échelle. La valeur stockée reste une fraction de 1.
  derived_endettement_pct := round(c_debt_fraction * 100, 6);
  if c_debt_fraction <= 0
     or c_debt_fraction > 1
     or derived_endettement_pct <> 25
     or derived_endettement_pct > 80 then
    raise exception 'REC227_DEBT_RATIO_UNIT_OR_DEFINITION_REVIEW_REQUIRED fraction=% pct=%',
      c_debt_fraction, derived_endettement_pct;
  end if;

  -- 6. Préimage COMPLÈTE, y compris `processed_at`, la confiance réelle et le
  --    qa_status réels : le rollback ne doit rien reconstruire de mémoire.
  before_extraction := b.extraction_json;
  before_confidence := b.extraction_confidence;
  before_qa_status := b.qa_status;
  before_processed_at := b.processed_at;

  -- 7. Ré-écriture du seul bloc d'extraction. qa_status reste partiel : rien
  --    ne devient promouvable par cette opération.
  after_extraction := coalesce(b.extraction_json, '{}'::jsonb)
    || jsonb_build_object(
         'maximus_indicators', coalesce(b.extraction_json -> 'maximus_indicators', '{}'::jsonb)
           || jsonb_build_object(
                'valeur_realisation', 186.49,
                'prix_retrait', 199.36,
                'nombre_immeubles', 666,
                'endettement', c_debt_fraction),
         'valorisation_risque', coalesce(b.extraction_json -> 'valorisation_risque', '{}'::jsonb)
           || jsonb_build_object('prix_reconstitution', 225.02),
         'chiffres_cles', coalesce(b.extraction_json -> 'chiffres_cles', '{}'::jsonb)
           || jsonb_build_object('prix_part', 224, 'capitalisation', 458000000),
         'recovery227_reextraction', provenance);

  -- La confiance remonte parce que sept champs critiques sont désormais lus,
  -- jamais par un plancher artificiel. 6/10 sur les champs critiques du parseur.
  update public.scpi_bulletins
  set extraction_json = after_extraction,
      extraction_confidence = written_confidence,
      processed_at = now()
  where id = b.id
  returning * into b;

  -- 8. Postimage vérifiée, pas supposée : la trace de rollback doit décrire ce
  --    qui est réellement en base après l'écriture.
  if b.extraction_json is distinct from after_extraction
     or b.extraction_confidence is distinct from written_confidence
     or b.qa_status <> 'auto_partial_review'
     or (b.extraction_json -> 'maximus_indicators' ->> 'endettement')::numeric <> c_debt_fraction
     or (b.extraction_json -> 'maximus_indicators' ->> 'nombre_immeubles')::numeric <> 666
     or (b.extraction_json -> 'maximus_indicators' ->> 'valeur_realisation')::numeric <> 186.49
     or (b.extraction_json -> 'maximus_indicators' ->> 'prix_retrait')::numeric <> 199.36
     or (b.extraction_json -> 'valorisation_risque' ->> 'prix_reconstitution')::numeric <> 225.02
     or (b.extraction_json -> 'chiffres_cles' ->> 'capitalisation')::numeric <> 458000000
     or (b.extraction_json -> 'chiffres_cles' ->> 'prix_part')::numeric <> 224 then
    raise exception 'REC227_POSTIMAGE_MISMATCH_REVIEW_REQUIRED';
  end if;

  -- 9. Le compteur strict ne doit pas bouger : cette écriture ne certifie rien.
  select count(*) into pass_after
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';
  if pass_after <> pass_before then
    raise exception 'REC227_STRICT_REGRESSION % -> %', pass_before, pass_after;
  end if;

  -- 10. Trace immuable : préimage complète ET postimage complète, pour que le
  --     rollback puisse refuser d'écraser un état qui n'est plus le nôtre.
  insert into maximus_agents.scpi_replay_provenance_quarantine(event_key, reason, snapshot)
  values (
    'recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf',
    'Re-extraction de la ligne T3 depuis le PDF officiel deja archive, avec le correctif '
    'd extraction (montant capture sur sa propre ligne, ratio de dette lu dans la prose, '
    'stock d actifs prefere au flux d acquisitions, capitalisation tranchee par le libelle '
    'voisin). qa_status reste a auto_partial_review : aucune promotion, aucun certificat.',
    jsonb_build_object(
      'bulletin_id', b.id,
      'bulletin_before', jsonb_build_object(
        'extraction_json', before_extraction,
        'extraction_confidence', before_confidence,
        'qa_status', before_qa_status,
        'processed_at', before_processed_at,
        'pdf_sha256', c_sha,
        'source_url', c_url),
      'bulletin_after', jsonb_build_object(
        'extraction_json', b.extraction_json,
        'extraction_confidence', b.extraction_confidence,
        'qa_status', b.qa_status,
        'processed_at', b.processed_at),
      'public_indicators_untouched', to_jsonb(live),
      'debt_ratio_canonical_definition', jsonb_build_object(
        'numerator', 'dettes de la SCPI',
        'denominator', 'valeur de realisation du patrimoine',
        'published_percent', derived_endettement_pct,
        'stored_fraction', c_debt_fraction,
        'gauge_ignored', true),
      'pass_100_before', pass_before,
      'pass_100_after', pass_after,
      'financial_certified', false,
      'deploy_allowed', false,
      'certifies_nothing', true))
  on conflict (event_key) do nothing;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'REC227_PROVENANCE_NOT_RECORDED';
  end if;

  -- 11. Événement d'ingestion DISTINCT de toute certification. Le statut retenu
  --     est celui que la chaîne existante utilise déjà pour « à revoir à la
  --     main » ; il n'existe aucune certification, aucun certificat, et le
  --     message le dit explicitement.
  insert into public.scpi_ingestion_events
  (scpi_slug, status, step, message, source_period, bulletin_url,
   extraction_confidence, metrics_count, ended_at)
  values (
    'kyaneos-pierre', 'manual_review_required', 'recovery227_t3_reextracted_from_archived_pdf',
    'Ligne T3 re-extraite depuis l octet archive 4def42a5. Valeurs de realisation 186,49, '
    'reconstitution 225,02, retrait 199,36, actifs 666, capitalisation 458 M EUR, '
    'endettement 25 % (prose). Cet evenement n est PAS une certification : '
    'qa_status conserve a auto_partial_review, aucun certificat, aucune ecriture live, '
    'compteur strict inchange.',
    '2026-T3', c_url, written_confidence, 7, now());
end
$rec227$;

commit;

-- Relecture (aucune écriture) :
--   select scpi_slug, period, qa_status, extraction_confidence, processed_at,
--          extraction_json->'maximus_indicators',
--          extraction_json->'valorisation_risque',
--          extraction_json->'chiffres_cles'
--   from public.scpi_bulletins where scpi_slug='kyaneos-pierre' and period='2026-T3';
--   select count(*) filter (where crash_test_status='PASS_100') as pass_100,
--          count(*) as total from public.scpi_crash_test_strict_v2;
