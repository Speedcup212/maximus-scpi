-- RECOVERY-227 — retour arrière CIBLÉ de la ré-extraction Kyaneos Pierre 2026-T3.
--
-- Le rollback documenté jusqu'ici relisait le snapshot sans vérifier ce qu'il
-- écrasait, et ne restaurait pas `processed_at`. Ce script corrige les deux :
--
--   * il exige que la ligne soit TOUJOURS la postimage écrite par
--     `recovery227_kyaneos_t3_reextraction.sql` (sinon `REC227_ROLLBACK_POSTIMAGE_DRIFT`) ;
--     la comparaison est null-safe et porte sur LES CINQ champs que la
--     transaction peut avoir déplacés : `extraction_json`,
--     `extraction_confidence`, `qa_status`, `processed_at`, et l'identité du
--     document (`pdf_sha256`, `source_url`) — un nouveau PDF n'est jamais écrasé ;
--   * il restaure `extraction_json`, `extraction_confidence`, `qa_status` ET
--     `processed_at` depuis une préimage réellement capturée, jamais recalculée ;
--   * il refuse une préimage incomplète (`REC227_ROLLBACK_PREIMAGE_INCOMPLETE`),
--     y compris une trace antérieure au correctif qui ne porte pas de
--     `processed_at` de postimage : aucune comparaison n'est sautée en silence ;
--   * il laisse une trace d'annulation sous un `event_key` distinct, sans jamais
--     supprimer la trace d'exécution d'origine ;
--   * il n'écrit dans aucune surface publiée et n'abaisse aucun seuil.
--
-- Le rollback est donc rejouable au sens strict : une seconde exécution lève
-- `REC227_ROLLBACK_ALREADY_EXECUTED`, elle n'écrase rien deux fois.
--
-- Exécution :
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f scripts/industrial/sql/recovery227_kyaneos_t3_reextraction_rollback.sql

begin;

do $rec227rb$
declare
  b public.scpi_bulletins%rowtype;
  q maximus_agents.scpi_replay_provenance_quarantine%rowtype;
  live public.scpi_indicators%rowtype;
  pass_before integer;
  pass_after integer;
  n integer;
  restore_extraction jsonb;
  restore_confidence numeric;
  restore_qa_status text;
  restore_processed_at timestamptz;
  after_processed_at timestamptz;
  before_pdf_sha256 text;
  before_source_url text;
begin
  perform pg_advisory_xact_lock(hashtext('recovery227:kyaneos-pierre:2026-T3'));

  select count(*) into pass_before
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';

  if exists (select 1 from maximus_agents.scpi_replay_provenance_quarantine
             where event_key = 'recovery227:kyaneos-pierre:2026-T3:rollback-applied') then
    raise exception 'REC227_ROLLBACK_ALREADY_EXECUTED';
  end if;

  select * into q
  from maximus_agents.scpi_replay_provenance_quarantine
  where event_key = 'recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf';
  if q.event_key is null then
    raise exception 'REC227_ROLLBACK_WITHOUT_EXECUTION_TRACE';
  end if;

  -- Préimage réellement capturée par la transaction : jamais reconstruite ici.
  restore_extraction := q.snapshot -> 'bulletin_before' -> 'extraction_json';
  restore_confidence := (q.snapshot -> 'bulletin_before' ->> 'extraction_confidence')::numeric;
  restore_qa_status := q.snapshot -> 'bulletin_before' ->> 'qa_status';
  restore_processed_at := (q.snapshot -> 'bulletin_before' ->> 'processed_at')::timestamptz;
  -- La postimage de `processed_at` n'existe que dans les traces capturées
  -- depuis le correctif : une trace plus ancienne n'a pas de valeur à
  -- comparer, et le rollback doit alors le dire au lieu de sauter le contrôle.
  after_processed_at := (q.snapshot -> 'bulletin_after' ->> 'processed_at')::timestamptz;
  before_pdf_sha256 := q.snapshot -> 'bulletin_before' ->> 'pdf_sha256';
  before_source_url := q.snapshot -> 'bulletin_before' ->> 'source_url';

  if restore_extraction is null
     or restore_extraction = 'null'::jsonb
     or restore_confidence is null
     or restore_qa_status is null
     or restore_qa_status = ''
     or restore_processed_at is null
     or q.snapshot -> 'bulletin_after' -> 'extraction_json' is null
     or after_processed_at is null
     or before_pdf_sha256 is null
     or before_pdf_sha256 = ''
     or before_source_url is null
     or before_source_url = '' then
    raise exception 'REC227_ROLLBACK_PREIMAGE_INCOMPLETE';
  end if;

  select * into b
  from public.scpi_bulletins
  where id = (q.snapshot ->> 'bulletin_id')::uuid
  for update;
  if b.id is null then
    raise exception 'REC227_ROLLBACK_BULLETIN_ROW_ABSENT';
  end if;
  if b.scpi_slug <> 'kyaneos-pierre' or b.period <> '2026-T3' then
    raise exception 'REC227_ROLLBACK_WRONG_ROW % %', b.scpi_slug, b.period;
  end if;

  -- On n'écrase que notre propre écriture. Toute autre valeur (ré-extraction
  -- ultérieure, correction manuelle, nouveau PDF) doit être relue par un humain.
  -- Les cinq champs sont comparés null-safe : `processed_at` et l'identité du
  -- document (`pdf_sha256`, `source_url`) sont écrits indirectement par la
  -- chaîne d'ingestion, et un nouveau PDF ne doit jamais être écrasé.
  if b.extraction_json is distinct from (q.snapshot -> 'bulletin_after' -> 'extraction_json')
     or b.extraction_confidence is distinct from (q.snapshot -> 'bulletin_after' ->> 'extraction_confidence')::numeric
     or b.qa_status is distinct from (q.snapshot -> 'bulletin_after' ->> 'qa_status')
     or b.processed_at is distinct from after_processed_at
     or b.pdf_sha256 is distinct from before_pdf_sha256
     or b.source_url is distinct from before_source_url then
    raise exception 'REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED';
  end if;

  select * into live from public.scpi_indicators where scpi_slug = 'kyaneos-pierre';
  if live.scpi_slug is not null and live.source_period = '2026-T3' then
    raise exception 'REC227_ROLLBACK_PUBLIC_SURFACE_CHANGED';
  end if;

  update public.scpi_bulletins
  set extraction_json = restore_extraction,
      extraction_confidence = restore_confidence,
      qa_status = restore_qa_status,
      processed_at = restore_processed_at
  where id = b.id;

  select * into b from public.scpi_bulletins where id = b.id;
  if b.extraction_json is distinct from restore_extraction
     or b.extraction_confidence is distinct from restore_confidence
     or b.qa_status is distinct from restore_qa_status
     or b.processed_at is distinct from restore_processed_at then
    raise exception 'REC227_ROLLBACK_RESTORE_MISMATCH_REVIEW_REQUIRED';
  end if;

  select count(*) into pass_after
  from public.scpi_crash_test_strict_v2 where crash_test_status = 'PASS_100';
  if pass_after <> pass_before then
    raise exception 'REC227_ROLLBACK_STRICT_REGRESSION % -> %', pass_before, pass_after;
  end if;

  -- Trace d'annulation distincte : la trace d'exécution d'origine reste intacte.
  insert into maximus_agents.scpi_replay_provenance_quarantine(event_key, reason, snapshot)
  values (
    'recovery227:kyaneos-pierre:2026-T3:rollback-applied',
    'Retour arriere de la re-extraction T3 : la preimage capturee avant ecriture a ete '
    'restauree (extraction_json, extraction_confidence, qa_status, processed_at) apres '
    'controle que la postimage etait toujours celle du script. Aucune surface publiee '
    'touchee, aucun certificat cree ni supprime, compteur strict inchange.',
    jsonb_build_object(
      'bulletin_id', b.id,
      'restored_from_event_key', 'recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf',
      'rollback_preimage_used', jsonb_build_object(
        'extraction_json', restore_extraction,
        'extraction_confidence', restore_confidence,
        'qa_status', restore_qa_status,
        'processed_at', restore_processed_at),
      'bulletin_after_rollback', to_jsonb(b),
      'public_indicators_untouched', to_jsonb(live),
      'pass_100_before', pass_before,
      'pass_100_after', pass_after,
      'financial_certified', false,
      'deploy_allowed', false,
      'certifies_nothing', true))
  on conflict (event_key) do nothing;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'REC227_ROLLBACK_TRACE_NOT_RECORDED';
  end if;

  insert into public.scpi_ingestion_events
  (scpi_slug, status, step, message, source_period, bulletin_url,
   extraction_confidence, metrics_count, ended_at)
  values (
    'kyaneos-pierre', 'manual_review_required', 'recovery227_t3_reextraction_rollback',
    'Retour arriere de la re-extraction T3 : la ligne de bulletin retrouve exactement '
    'l extraction decalee d origine (preimage capturee, processed_at inclus). '
    'Aucune ecriture live, aucun certificat, compteur strict inchange.',
    '2026-T3', (q.snapshot -> 'bulletin_before' ->> 'source_url'),
    restore_confidence, 0, now());
end
$rec227rb$;

commit;

-- Relecture (aucune écriture) :
--   select scpi_slug, period, qa_status, extraction_confidence, processed_at,
--          extraction_json->'maximus_indicators' ->> 'valeur_realisation' as valeur_realisation
--   from public.scpi_bulletins where scpi_slug='kyaneos-pierre' and period='2026-T3';
--   select event_key, created_at
--   from maximus_agents.scpi_replay_provenance_quarantine
--   where event_key like 'recovery227:kyaneos-pierre:2026-T3:%' order by created_at;
