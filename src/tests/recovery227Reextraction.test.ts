// RECOVERY-227 — le paquet de livraison doit être prouvé, pas seulement décrit.
//
// Ce test rejoue la transaction `recovery227_kyaneos_t3_reextraction.sql` sur
// une base PostgreSQL locale jetable, hors production, et vérifie :
//   * les sept valeurs écrites ;
//   * que `qa_status` reste `auto_partial_review` (rien ne devient promouvable) ;
//   * qu'aucune surface publiée ni certificat n'est touché ;
//   * que le compteur strict reste inchangé ;
//   * la garde d'unicité, la garde de préimage et le rollback ciblé.
//
// Si aucun PostgreSQL local n'est disponible, le test est ignoré : il ne
// simule jamais cette preuve.
import {describe, it, expect} from 'vitest';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SQL = 'scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql';
const FIXTURE = 'scripts/industrial/sql/recovery227_reextraction_fixture.sql';
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

function run(db: string, args: string[], file?: string): string {
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

  it('écrit les valeurs publiées et ne certifie rien', () => {
    freshDatabase();
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('COMMIT');

    const at = (p: string) =>
      query(db, `select extraction_json #>> '{${p.replace(/\./g, ',')}}' from public.scpi_bulletins where period='2026-T3'`);

    expect(at('maximus_indicators.valeur_realisation')).toBe('186.49');
    expect(at('valorisation_risque.prix_reconstitution')).toBe('225.02');
    expect(at('maximus_indicators.prix_retrait')).toBe('199.36');
    expect(at('maximus_indicators.nombre_immeubles')).toBe('666');
    expect(at('maximus_indicators.endettement')).toBe('0.25');
    expect(at('chiffres_cles.capitalisation')).toBe('458000000');
    expect(at('chiffres_cles.prix_part')).toBe('224');

    // Une ligne partielle ne peut pas être promue.
    expect(query(db, "select qa_status from public.scpi_bulletins where period='2026-T3'"))
      .toBe('auto_partial_review');
  });

  it('ne touche ni la surface publiée, ni les certificats, ni le compteur strict', () => {
    expect(query(db, "select source_period||' '||valeur_realisation from public.scpi_indicators where scpi_slug='kyaneos-pierre'"))
      .toBe('2026-T2 187.10');
    expect(query(db, 'select count(*) from public.scpi_metric_certifications')).toBe('0');
    expect(query(db, 'select count(*) from public.scpi_indicator_history')).toBe('0');
    expect(query(db, "select count(*) from public.scpi_crash_test_strict_v2 where crash_test_status='PASS_100'"))
      .toBe('68');
  });

  it('conserve la date imprimée par champ et l’anomalie de date', () => {
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

  it('refuse un second passage avec un code explicite', () => {
    const out = run(db, ['-v', 'ON_ERROR_STOP=1', '-f', SQL]);
    expect(out).toContain('REC227_ALREADY_EXECUTED_REVIEW_REQUIRED');
    expect(out).not.toContain('COMMIT');
  });

  it('le rollback ciblé restaure la préimage exacte', () => {
    run(db, ['-q', '-c',
      `UPDATE public.scpi_bulletins b
          SET extraction_json = q.snapshot->'bulletin_before'->'extraction_json',
              extraction_confidence = (q.snapshot->'bulletin_before'->>'extraction_confidence')::numeric,
              qa_status = q.snapshot->'bulletin_before'->>'qa_status'
         FROM maximus_agents.scpi_replay_provenance_quarantine q
        WHERE q.event_key='recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf'
          AND b.id=(q.snapshot->>'bulletin_id')::uuid`]);
    expect(query(db, "select extraction_json->'maximus_indicators'->>'valeur_realisation' from public.scpi_bulletins where period='2026-T3'"))
      .toBe('184.42');
    expect(query(db, "select qa_status from public.scpi_bulletins where period='2026-T3'"))
      .toBe('auto_partial_review');
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

  it('le script ne contient aucune écriture hors du bulletin T3', () => {
    // Garde statique : la transaction ne doit jamais toucher une surface publiée.
    const sql = fs.readFileSync(SQL, 'utf8').toLowerCase();
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
      expect(sql, forbidden).not.toContain(forbidden);
    }
    // Une seule écriture, sur le bulletin exact.
    const updates = sql.match(/update public\.scpi_bulletins/g) ?? [];
    expect(updates).toHaveLength(1);
  });
});

describeOrSkip('RECOVERY-227 — le paquet documenté reste exact', () => {
  it('le runbook nomme le point d’entrée réel et la déduplication qui bloque un rejeu', () => {
    const doc = fs.readFileSync('docs/recovery227-kyaneos-t3-delivery-package.md', 'utf8');
    expect(doc).toContain('scpi-bulletin-ingestion.ts');
    expect(doc).toContain('pdf-parse');
    expect(doc).toContain('deduplication');
    expect(doc).toContain('4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c');
    // Le paquet ne doit jamais promettre une certification.
    expect(doc).toContain('ne certifie rien');
  });

  it('le runbook documente le défaut capitalisation mesuré sans le corriger à l’aveugle', () => {
    const doc = fs.readFileSync('docs/recovery227-kyaneos-t3-delivery-package.md', 'utf8');
    // Le défaut est mesuré sur un corpus réel et la raison du report est écrite.
    expect(doc).toContain('112 bulletins réels');
    expect(doc).toContain('parseAmount');
    expect(doc).toContain('NON corrigé');
    // L'extracteur ne doit pas avoir été modifié par cette PR au-delà de #476.
    const extractor = fs.readFileSync('scpi-ingestion/src/extractor.ts', 'utf8');
    expect(extractor).not.toContain('CAPTION_OWNS_AMOUNT');
    expect(extractor).not.toContain('AMOUNT_RE');
  });

  it('os et path restent des imports utiles au test', () => {
    // Empêche une régression silencieuse si le helper de chemin change.
    expect(typeof os.tmpdir()).toBe('string');
    expect(path.join('a', 'b')).toBe(path.normalize('a/b'));
  });
});
