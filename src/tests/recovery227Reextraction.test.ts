// RECOVERY-227 — le paquet de livraison doit être prouvé, pas seulement décrit.
//
// Ce test rejoue la transaction `recovery227_kyaneos_t3_reextraction.sql` et son
// retour arrière `recovery227_kyaneos_t3_reextraction_rollback.sql` sur une base
// PostgreSQL locale jetable, hors production, et vérifie :
//   * les sept valeurs écrites ;
//   * que `qa_status` reste `auto_partial_review` (rien ne devient promouvable) ;
//   * qu'aucune surface publiée ni certificat n'est touché ;
//   * que le compteur strict reste inchangé ;
//   * la garde d'unicité, la garde de préimage et les codes d'échec nommés ;
//   * que la trace contient une préimage ET une postimage COMPLÈTES
//     (`processed_at` inclus) ;
//   * que le rollback refuse d'écraser un état qui n'est plus celui du script,
//     restaure `processed_at`, et laisse une trace d'annulation distincte ;
//   * que la définition canonique du ratio de dette est celle appliquée.
//
// Si aucun PostgreSQL local n'est disponible, les tests de rejeu sont ignorés :
// ils ne simulent jamais cette preuve. Les contrôles statiques, eux, tournent
// toujours.
import {describe, it, expect} from 'vitest';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SQL = 'scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql';
const ROLLBACK = 'scripts/industrial/sql/recovery227_kyaneos_t3_reextraction_rollback.sql';
const FIXTURE = 'scripts/industrial/sql/recovery227_reextraction_fixture.sql';
const DOC = 'docs/recovery227-kyaneos-t3-delivery-package.md';
const EVENT_EXEC = 'recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf';
const EVENT_ROLLBACK = 'recovery227:kyaneos-pierre:2026-T3:rollback-applied';
const BASE_URL = process.env.RECOVERY227_TEST_DATABASE_URL;

/** Retourne une commande psql utilisable, ou null si aucun serveur n'existe. */
function findPsql(): {cmd: string; base: string[]} | null {
  const candidates: Array<{cmd: string; base: string[]}> = [];
  if (BASE_URL) candidates.push({cmd: 'psql', base: [BASE_URL]});
  // Un serveur jetable local sur socket /tmp (voir le runbook du paquet).
  candidates.push({cmd: 'psql', base: ['-h', '/tmp', '-p', '55432', '-U', 'postgres']});
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.cmd, [...candidate.base, '-q', '-tA', '-c', 'select 1'],
      {encoding: 'utf8'});
    if (probe.status === 0) return candidate;
  }
  return null;
}

const psql = findPsql();

function run(db: string, args: string[]): string {
  const result = spawnSync(psql!.cmd, [...psql!.base, '-d', db, ...args],
    {encoding: 'utf8', env: {...process.env, ON_ERROR_STOP: '1'}});
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function query(db: string, sql: string): string {
  return run(db, ['-q', '-tA', '-c', sql]).trim();
}

const describeOrSkip = psql ? describe : describe.skip;

describeOrSkip('RECOVERY-227 — transaction de ré-extraction, hors production', () => {
  const suffix = `${process.pid}`;
  const db = `rec227_test_${suffix}`;

  function freshDatabase() {
    run('postgres', ['-q', '-c', `drop database if exists ${db}`]);
    run('postgres', ['-q', '-c', `create database ${db}`]);
    execFileSync(psql!.cmd, [...psql!.base, '-d', db, '-q', '-v', 'ON_ERROR_STOP=1', '-f', FIXTURE],
      {encoding: 'utf8'});
  }

  const at = (p: string) =>
    query(db, `select extraction_json #>> '{${p.replace(/\./g, ',')}}' from public.scpi_bulletins where period='2026-T3'`);

  it('écrit les valeurs publiées et ne certifie rien', () => {
    freshDatabase();
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('COMMIT');

    expect(at('maximus_indicators.valeur_realisation')).toBe('186.49');
    expect(at('valorisation_risque.prix_reconstitution')).toBe('225.02');
    expect(at('maximus_indicators.prix_retrait')).toBe('199.36');
    expect(at('maximus_indicators.nombre_immeubles')).toBe('666');
    expect(at('chiffres_cles.capitalisation')).toBe('458000000');
    expect(at('chiffres_cles.prix_part')).toBe('224');

    // Une ligne partielle ne peut pas être promue.
    expect(query(db, "select qa_status from public.scpi_bulletins where period='2026-T3'"))
      .toBe('auto_partial_review');
  });

  it('endettement : fraction de 1 stockée, 25 % publié et documenté', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    // `scpi_indicators.endettement` est un pourcentage ; `extraction_json` porte
    // la fraction que `buildIndicatorPatch` multiplie par 100. Écrire 25 ici
    // publierait 2500 % après promotion.
    expect(at('maximus_indicators.endettement')).toBe('0.25');
    expect(at('recovery227_reextraction.fields.endettement.value')).toBe('0.25');
    expect(at('recovery227_reextraction.fields.endettement.published_as_percent')).toBe('25');
    expect(at('recovery227_reextraction.fields.endettement.unit')).toBe('FRACTION_OF_1');
  });

  it('conserve les blocs d’extraction existants au lieu de les reconstruire', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    // Ces blocs ne font pas partie des valeurs corrigées : ils doivent survivre
    // tels quels, sinon la ré-écriture détruit une extraction saine.
    expect(at('maximus_indicators.capital_type')).toBe('variable');
    expect(at('structure_frais.frais_souscription')).toBe('0.11');
    expect(at('_meta.critical_fields_found')).toBe('3');
    expect(query(db, `select jsonb_array_length(extraction_json->'repartition_sectorielle')
                      from public.scpi_bulletins where period='2026-T3'`)).toBe('12');
  });

  it('ne touche ni la surface publiée, ni les certificats, ni le compteur strict', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(query(db, "select source_period||' '||valeur_realisation from public.scpi_indicators where scpi_slug='kyaneos-pierre'"))
      .toBe('2026-T2 187.10');
    expect(query(db, 'select count(*) from public.scpi_metric_certifications')).toBe('0');
    expect(query(db, 'select count(*) from public.scpi_indicator_history')).toBe('0');
    expect(query(db, "select count(*) from public.scpi_crash_test_strict_v2 where crash_test_status='PASS_100'"))
      .toBe('68');
  });

  it('distingue l’événement d’ingestion d’une certification', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(query(db, "select status from public.scpi_ingestion_events where step='recovery227_t3_reextracted_from_archived_pdf'"))
      .toBe('manual_review_required');
    expect(query(db, "select metrics_count from public.scpi_ingestion_events where step='recovery227_t3_reextracted_from_archived_pdf'"))
      .toBe('7');
    // Aucune ligne de certification n'est créée, et le message le dit.
    expect(query(db, "select count(*) from public.scpi_metric_certifications where source_period='2026-T3'"))
      .toBe('0');
    expect(query(db, `select snapshot->>'certifies_nothing'
                       from maximus_agents.scpi_replay_provenance_quarantine
                       where event_key='${EVENT_EXEC}'`)).toBe('true');
    expect(query(db, `select message like '%PAS une certification%'
                       from public.scpi_ingestion_events
                       where step='recovery227_t3_reextracted_from_archived_pdf'`)).toBe('t');
  });

  it('conserve la date imprimée par champ et l’anomalie de date', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    const dates = query(db,
      `select string_agg(distinct extraction_json->'recovery227_reextraction'->'fields'->k->>'reference_date', ','
         order by extraction_json->'recovery227_reextraction'->'fields'->k->>'reference_date')
       from public.scpi_bulletins,
            unnest(array['prix_souscription','valeur_realisation','prix_reconstitution',
                         'prix_retrait','endettement','nombre_immeubles','capitalisation']) k
       where period='2026-T3'`);
    // 30/06 pour les montants par part tels qu'imprimés, 30/09 pour les stocks.
    expect(dates).toBe('2026-06-30,2026-09-30');
    expect(query(db, "select (extraction_json->'recovery227_reextraction'->>'reference_date_anomaly') is not null from public.scpi_bulletins where period='2026-T3'"))
      .toBe('t');
  });

  it('la trace contient une préimage ET une postimage complètes, processed_at inclus', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    const before = query(db,
      `select (snapshot->'bulletin_before'->>'processed_at') || '|' ||
              (snapshot->'bulletin_before'->>'extraction_confidence') || '|' ||
              (snapshot->'bulletin_before'->'extraction_json'->'maximus_indicators'->>'valeur_realisation')
       from maximus_agents.scpi_replay_provenance_quarantine where event_key='${EVENT_EXEC}'`);
    // La préimage est celle de la ligne réellement observée, pas une constante.
    expect(before).toBe('2026-11-28T03:30:53.286+00:00|0.3|184.42');
    const afterProcessed = query(db,
      `select (snapshot->'bulletin_after'->>'processed_at') is not null
       from maximus_agents.scpi_replay_provenance_quarantine where event_key='${EVENT_EXEC}'`);
    expect(afterProcessed).toBe('t');
    // `processed_at` doit avoir réellement bougé : sinon le rollback ne restaure
    // rien et le défaut signalé n'est pas corrigé.
    expect(query(db,
      `select (snapshot->'bulletin_after'->>'processed_at') <> (snapshot->'bulletin_before'->>'processed_at')
       from maximus_agents.scpi_replay_provenance_quarantine where event_key='${EVENT_EXEC}'`)).toBe('t');
  });

  it('refuse un second passage avec un code explicite', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('REC227_ALREADY_EXECUTED_REVIEW_REQUIRED');
    expect(out).not.toContain('COMMIT');
  });

  it('nomme l’absence de ligne au lieu de lever NO_DATA_FOUND', () => {
    freshDatabase();
    run(db, ['-q', '-c', "delete from public.scpi_bulletins where period='2026-T3'"]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('REC227_BULLETIN_ROW_ABSENT');
  });

  it('refuse une préimage dont l’empreinte a changé', () => {
    freshDatabase();
    run(db, ['-q', '-c', `update public.scpi_bulletins set pdf_sha256=repeat('a',64) where period='2026-T3'`]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('REC227_PREIMAGE_MISMATCH');
  });

  it('refuse une ligne dont le décalage a déjà disparu', () => {
    freshDatabase();
    run(db, ['-q', '-c',
      `update public.scpi_bulletins
          set extraction_json = jsonb_set(extraction_json, '{maximus_indicators,valeur_realisation}', '"186.49"')
        where period='2026-T3'`]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('REC227_UNEXPECTED_PREIMAGE_VALUES_REVIEW_REQUIRED');
  });

  it('le rollback restaure la préimage exacte, processed_at compris', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(query(db, "select processed_at from public.scpi_bulletins where period='2026-T3'"))
      .not.toBe('2026-11-28 03:30:53.286+00');

    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(out).toContain('COMMIT');

    expect(at('maximus_indicators.valeur_realisation')).toBe('184.42');
    expect(at('maximus_indicators.endettement')).toBe('0.25');
    expect(at('maximus_indicators.nombre_immeubles')).toBe('8');
    expect(query(db, "select qa_status from public.scpi_bulletins where period='2026-T3'"))
      .toBe('auto_partial_review');
    expect(query(db, "select extraction_confidence::text from public.scpi_bulletins where period='2026-T3'"))
      .toBe('0.3');
    // `processed_at` est le champ que le rollback précédent oubliait.
    expect(query(db, "select processed_at from public.scpi_bulletins where period='2026-T3'"))
      .toBe('2026-11-28 03:30:53.286+00');
  });

  it('le rollback laisse une trace d’annulation distincte, sans effacer l’exécution', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(query(db, `select count(*) from maximus_agents.scpi_replay_provenance_quarantine
                      where event_key in ('${EVENT_EXEC}','${EVENT_ROLLBACK}')`)).toBe('2');
    expect(query(db, `select snapshot->>'restored_from_event_key'
                      from maximus_agents.scpi_replay_provenance_quarantine
                      where event_key='${EVENT_ROLLBACK}'`)).toBe(EVENT_EXEC);
    expect(query(db, "select status from public.scpi_ingestion_events where step='recovery227_t3_reextraction_rollback'"))
      .toBe('manual_review_required');
  });

  it('le rollback refuse un second passage', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(out).toContain('REC227_ROLLBACK_ALREADY_EXECUTED');
  });

  it('le rollback refuse d’écraser un état qui n’est plus celui du script', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    // Écriture ultérieure (autre correctif, ré-import) : le rollback ne doit pas
    // la détruire en restaurant sa propre préimage.
    run(db, ['-q', '-c',
      `update public.scpi_bulletins
          set extraction_json = jsonb_set(extraction_json, '{maximus_indicators,nombre_immeubles}', '667')
        where period='2026-T3'`]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(out).toContain('REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED');
    expect(at('maximus_indicators.nombre_immeubles')).toBe('667');
  });

  it('le rollback refuse une préimage incomplète', () => {
    freshDatabase();
    run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    run(db, ['-q', '-c',
      `update maximus_agents.scpi_replay_provenance_quarantine
          set snapshot = snapshot #- '{bulletin_before,processed_at}'
        where event_key='${EVENT_EXEC}'`]);
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(out).toContain('REC227_ROLLBACK_PREIMAGE_INCOMPLETE');
  });

  it('le rollback ne restaure rien sans trace d’exécution', () => {
    freshDatabase();
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', ROLLBACK]);
    expect(out).toContain('REC227_ROLLBACK_WITHOUT_EXECUTION_TRACE');
  });

  it('le script ne contient aucune écriture hors du bulletin T3', () => {
    // Garde statique : la transaction ne doit jamais toucher une surface publiée.
    for (const file of [SQL, ROLLBACK]) {
      const sql = fs.readFileSync(file, 'utf8').toLowerCase();
      for (const forbidden of [
        'update public.scpi_indicators',
        'insert into public.scpi_indicators',
        'update public.scpi_indicator_history',
        'insert into public.scpi_indicator_history',
        'update public.scpi_metric_certifications',
        'insert into public.scpi_metric_certifications',
        'create or replace view',
        'create table',
        'grant ',
        'revoke ',
      ]) {
        expect(sql, `${file}: ${forbidden}`).not.toContain(forbidden);
      }
      const updates = sql.match(/update public\.scpi_bulletins/g) ?? [];
      expect(updates, file).toHaveLength(1);
    }
  });
});

describe('RECOVERY-227 — contrat statique du paquet (toujours exécuté)', () => {
  it('le rollback ne code aucune valeur de préimage en dur', () => {
    const sql = fs.readFileSync(ROLLBACK, 'utf8');
    // Seules les bornes de contrôle et les noms d'événements peuvent être
    // littéraux ; une valeur de champ restaurée ne doit jamais l'être.
    expect(sql).toContain("q.snapshot -> 'bulletin_before' -> 'extraction_json'");
    expect(sql).toMatch(/restore_processed_at := \(q\.snapshot -> 'bulletin_before' ->> 'processed_at'\)::timestamptz/);
    expect(sql).not.toMatch(/set\s+extraction_json\s*=\s*'\{/i);
    // La postimage est contrôlée avant écrasement.
    expect(sql).toContain('REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED');
    // La trace d'annulation est distincte de la trace d'exécution.
    expect(sql).toContain('recovery227:kyaneos-pierre:2026-T3:rollback-applied');
    expect(sql).not.toMatch(/delete\s+from\s+maximus_agents\.scpi_replay_provenance_quarantine/i);
  });

  it('la transaction capture processed_at et vérifie sa postimage', () => {
    const sql = fs.readFileSync(SQL, 'utf8');
    expect(sql).toContain('before_processed_at := b.processed_at;');
    expect(sql).toContain("'processed_at', before_processed_at");
    expect(sql).toContain("'processed_at', b.processed_at");
    expect(sql).toContain('REC227_POSTIMAGE_MISMATCH_REVIEW_REQUIRED');
    // Aucune valeur de confiance ou de qa_status figée dans la préimage.
    expect(sql).not.toMatch(/before_confidence constant/);
    expect(sql).not.toMatch(/before_qa_status constant/);
  });

  it('la définition canonique du ratio de dette est appliquée et documentée', () => {
    const sql = fs.readFileSync(SQL, 'utf8');
    expect(sql).toContain('c_debt_fraction constant numeric := 0.25;');
    expect(sql).toContain('REC227_DEBT_RATIO_UNIT_OR_DEFINITION_REVIEW_REQUIRED');
    expect(sql).toContain('canonical_metric');

    const registry = fs.readFileSync('src/indicators/scpiIndicatorRegistry.ts', 'utf8');
    // Le libellé canonique de l'application pour ce champ est bien une LTV.
    expect(registry).toContain("label: 'Endettement (LTV)'");
    expect(registry).toContain('validate: inRange(0, 60)');

    // Et la borne de promotion est un pourcentage [0 ; 80], pas une fraction.
    const promote = fs.readFileSync('supabase/functions/scpi-certified-promote/index.ts', 'utf8');
    expect(promote).toContain('DEBT_OUT_OF_RANGE');
    const crawler = fs.readFileSync('netlify/functions/utils/scpi-bulletin-ingestion.ts', 'utf8');
    expect(crawler).toContain('endettement: pct(m.endettement)');
    expect(crawler).toContain('endettement: [0, 80]');
  });

  it('le runbook documente le chemin minimal vers source_ready sans le forcer', () => {
    const doc = fs.readFileSync(DOC, 'utf8');
    expect(doc).toContain('source_ready');
    expect(doc).toContain('recovery227_kyaneos_t3_reextraction_rollback.sql');
    // Le paquet ne doit jamais promettre une certification ni un PASS_100.
    expect(doc).toContain('ne certifie rien');
  });
});

describeOrSkip('RECOVERY-227 — le paquet documenté reste exact', () => {
  it('le runbook nomme le point d’entrée réel et la déduplication qui bloque un rejeu', () => {
    const doc = fs.readFileSync(DOC, 'utf8');
    expect(doc).toContain('scpi-bulletin-ingestion.ts');
    expect(doc).toContain('pdf-parse');
    expect(doc).toContain('deduplication');
    expect(doc).toContain('4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c');
    expect(doc).toContain('ne certifie rien');
  });

  it('le runbook documente le défaut capitalisation mesuré sans le corriger à l’aveugle', () => {
    const doc = fs.readFileSync(DOC, 'utf8');
    expect(doc).toContain('112 bulletins réels');
    expect(doc).toContain('parseAmount');
    expect(doc).toContain('NON corrigé');
    const extractor = fs.readFileSync('scpi-ingestion/src/extractor.ts', 'utf8');
    expect(extractor).not.toContain('CAPTION_OWNS_AMOUNT');
    expect(extractor).not.toContain('AMOUNT_RE');
  });

  it('os et path restent des imports utiles au test', () => {
    expect(typeof os.tmpdir()).toBe('string');
    expect(path.join('a', 'b')).toBe(path.normalize('a/b'));
  });
});
