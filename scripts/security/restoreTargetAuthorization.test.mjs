import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  quoteRestoreDrillCost,
  validateCostBasis,
  validateOwnerAuthorization,
  resolveRestoreTargetAuthorization,
  readAuthorizationRecord,
  publicCostSummary,
  RESTORE_DRILL_COST_PATHS,
  SOURCED_PRICING,
  COST_SOURCE_ALLOWLIST,
  PRICING_RETRIEVED_AT,
  TARGET_AUTHORIZATION_REFUSALS,
} from './restoreTargetAuthorization.mjs';
import { AUTHORIZED_RESTORE_PROJECT_REFS } from './restoreProtocol.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const TODAY = '2026-11-26';
const REF = 'abcdrfghijklmnopqrst';

/** Autorisation valide de référence ; chaque test n'en casse qu'un champ. */
function validRecord(overrides = {}) {
  const quote = quoteRestoreDrillCost({ pathId: 'THROWAWAY_PROJECT_IN_PRO_ORG', hours: 2 }).quote;
  return {
    schemaVersion: 'restore-target-authorization-v1',
    authorizedBy: 'owner',
    authorizedAt: '2026-11-26',
    expiresAt: '2026-12-31',
    scope: 'RESTORE_DRILL',
    revocationAuthorized: false,
    projectRef: REF,
    costBasis: {
      selectedPath: quote.pathId,
      hours: quote.hours,
      marginalCostUsd: quote.marginalCostUsd,
      sourceUrl: 'https://supabase.com/pricing',
      retrievedAt: quote.retrievedAt,
      pricingSourceIds: quote.pricingSourceIds,
    },
    ...overrides,
  };
}

// --- Le coût doit être sourcé, daté et recalculable -------------------------------------

test('chaque tarif cité provient d une source officielle admise et porte sa phrase', () => {
  assert.ok(SOURCED_PRICING.length >= 5);
  for (const p of SOURCED_PRICING) {
    assert.ok(COST_SOURCE_ALLOWLIST.includes(p.sourceUrl), `${p.id} : source non admise`);
    assert.ok(typeof p.quote === 'string' && p.quote.length > 10, `${p.id} : citation absente`);
    assert.equal(p.retrievedAt, PRICING_RETRIEVED_AT);
  }
  // Les deux tarifs qui fondent le chiffre du chemin Pro.
  const micro = SOURCED_PRICING.find((p) => p.id === 'MICRO_COMPUTE_HOURLY');
  assert.equal(micro.amountUsd, 0.01344);
  assert.equal(micro.period, 'HOUR');
  assert.equal(SOURCED_PRICING.find((p) => p.id === 'PRO_PLAN_SUBSCRIPTION').amountUsd, 25);
});

test('le chemin Pro coûte à l heure et l heure entamée est facturée en entier', () => {
  const q = quoteRestoreDrillCost({ pathId: 'THROWAWAY_PROJECT_IN_PRO_ORG', hours: 0.5 });
  assert.equal(q.ok, true);
  assert.equal(q.quote.billedHours, 1);
  // Sous-estimer une dépense qu'on demande d'autoriser serait le défaut à éviter.
  assert.equal(q.quote.marginalCostUsd, 0.01344);
  assert.equal(q.quote.worstCaseMonthlyUsd, 10);

  const three = quoteRestoreDrillCost({ pathId: 'THROWAWAY_PROJECT_IN_PRO_ORG', hours: 3 });
  assert.equal(three.quote.marginalCostUsd, 0.04032);
  // Le pire cas reste le mois entier : un projet oublié n'est pas gratuit.
  assert.equal(three.quote.worstCaseMonthlyUsd, 10);
});

test('le projet oublié est chiffré : un exercice non supprimé coûte un Micro mensuel', () => {
  const q = quoteRestoreDrillCost({ pathId: 'THROWAWAY_PROJECT_IN_PRO_ORG', hours: 2 }).quote;
  assert.equal(q.worstCaseMonthlyUsd, 10);
  assert.ok(q.pricingSourceIds.includes('PAUSED_PROJECTS_UNBILLED'));
  assert.ok(q.conditions.some((c) => /suppression immédiate/i.test(c)));
});

test('les deux chemins prouvent un exercice ; aucun ne vaut un rejeu local', () => {
  assert.equal(RESTORE_DRILL_COST_PATHS.length, 2);
  for (const p of RESTORE_DRILL_COST_PATHS) {
    assert.equal(p.proofOfExercise, true, `${p.id} ne prouverait pas un exercice`);
    assert.ok(!/local-replay/i.test(p.id));
  }
});

test('l organisation Free séparée ne coûte rien mais dépend d un quota non inventariable', () => {
  const q = quoteRestoreDrillCost({ pathId: 'SEPARATE_FREE_ORGANIZATION', hours: 5 });
  assert.equal(q.quote.marginalCostUsd, 0);
  assert.equal(q.quote.worstCaseMonthlyUsd, 0);
  // L'agent ne peut pas lire le quota : le devis doit le dire, pas le supposer.
  assert.ok(q.quote.unverifiableByAgent.some((u) => /quota Free/i.test(u)));
});

test('un chemin ou une durée inconnus ne produisent aucun devis', () => {
  assert.deepEqual(quoteRestoreDrillCost({ pathId: 'N_IMPORTE_QUOI', hours: 1 }).reasons, ['COST_PATH_UNKNOWN']);
  assert.deepEqual(quoteRestoreDrillCost({ pathId: 'SEPARATE_FREE_ORGANIZATION', hours: 0 }).reasons, ['COST_HOURS_MISSING']);
});

test('un coût sans source, sans date ou d une source non admise n est pas établi', () => {
  const base = validRecord().costBasis;
  assert.equal(validateCostBasis(base).ok, true);

  assert.ok(validateCostBasis(null).reasons.includes('COST_BASIS_MISSING'));
  assert.ok(validateCostBasis({ ...base, sourceUrl: '' }).reasons.includes('COST_BASIS_NOT_SOURCED'));
  assert.ok(validateCostBasis({ ...base, sourceUrl: 'https://un-blog.example/pricing' })
    .reasons.includes('COST_BASIS_SOURCE_NOT_ALLOWED'));
  assert.ok(validateCostBasis({ ...base, retrievedAt: 'hier' })
    .reasons.includes('COST_BASIS_RETRIEVAL_MISSING'));
  assert.ok(validateCostBasis({ ...base, pricingSourceIds: [] })
    .reasons.includes('COST_BASIS_PRICING_UNCITED'));
  assert.ok(validateCostBasis({ ...base, pricingSourceIds: [...base.pricingSourceIds, 'TARIF_INVENTE'] })
    .reasons.includes('COST_BASIS_PRICING_UNKNOWN'));
  // Un montant qui ne correspond pas au tarif cité est refusé : on ne « déclare » pas un coût.
  assert.ok(validateCostBasis({ ...base, marginalCostUsd: 0.001 })
    .reasons.includes('COST_BASIS_AMOUNT_DISAGREES'));
});

// --- L autorisation est nominative, bornée, et ne vaut rien d autre ---------------------

test('une autorisation complète du propriétaire est acceptée', () => {
  const v = validateOwnerAuthorization(validRecord(), { projectRef: REF, today: TODAY });
  assert.deepEqual(v, { ok: true, reasons: [] });
});

test('une autorisation n ouvre que le projet qu elle nomme', () => {
  const v = validateOwnerAuthorization(validRecord(), { projectRef: 'zzzzzzzzzzzzzzzzzzzz', today: TODAY });
  assert.ok(v.reasons.includes('AUTHORIZATION_TARGET_MISMATCH'));
});

test('seul le propriétaire autorise, et seulement pour une restauration exercée', () => {
  assert.ok(validateOwnerAuthorization(validRecord({ authorizedBy: 'agent' }), { projectRef: REF, today: TODAY })
    .reasons.includes('AUTHORIZATION_NOT_OWNER'));
  assert.ok(validateOwnerAuthorization(validRecord({ scope: 'REVOCATION' }), { projectRef: REF, today: TODAY })
    .reasons.includes('AUTHORIZATION_SCOPE_NOT_RESTORE_DRILL'));
  assert.ok(validateOwnerAuthorization(validRecord({ scope: 'RESTORE_DRILL_AND_REVOKE' }), { projectRef: REF, today: TODAY })
    .reasons.includes('AUTHORIZATION_SCOPE_NOT_RESTORE_DRILL'));
});

test('une autorisation de restauration ne peut jamais valoir révocation', () => {
  const v = validateOwnerAuthorization(validRecord({ revocationAuthorized: true }), { projectRef: REF, today: TODAY });
  assert.ok(v.reasons.includes('AUTHORIZATION_GRANTS_REVOCATION'));
});

test('une autorisation échue ou sans échéance n ouvre rien', () => {
  assert.ok(validateOwnerAuthorization(validRecord({ expiresAt: '2026-11-25' }), { projectRef: REF, today: TODAY })
    .reasons.includes('AUTHORIZATION_EXPIRED'));
  assert.ok(validateOwnerAuthorization(validRecord({ expiresAt: undefined }), { projectRef: REF, today: TODAY })
    .reasons.includes('AUTHORIZATION_EXPIRED'));
  assert.equal(validateOwnerAuthorization(validRecord({ expiresAt: TODAY }), { projectRef: REF, today: TODAY }).ok, true);
});

test('une autorisation dont le coût n est pas établi est refusée', () => {
  const rec = validRecord();
  rec.costBasis = { ...rec.costBasis, sourceUrl: 'https://exemple.example/tarifs' };
  const v = validateOwnerAuthorization(rec, { projectRef: REF, today: TODAY });
  assert.ok(v.reasons.includes('AUTHORIZATION_COST_BASIS_UNVERIFIED'));
});

test('une autorisation rangée dans le dépôt public ne compte pas', () => {
  const v = validateOwnerAuthorization(validRecord(), { projectRef: REF, today: TODAY, insideRepo: true });
  assert.ok(v.reasons.includes('AUTHORIZATION_RECORD_INSIDE_REPO'));
});

// --- Le défaut central : une liste peuplée sans décision -------------------------------

test('l état réel du dépôt est fermé, et ce n est pas une anomalie', () => {
  assert.deepEqual([...AUTHORIZED_RESTORE_PROJECT_REFS], []);
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
    record: null,
    today: TODAY,
  });
  assert.equal(v.state, 'CLOSED_EXPECTED');
  assert.equal(v.ok, true);
  assert.deepEqual(v.reasons, []);
});

test('une liste peuplée SANS autorisation est refusée — même avec la meilleure intention', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: [REF],
    record: null,
    today: TODAY,
  });
  assert.equal(v.state, 'REFUSED');
  assert.equal(v.ok, false);
  assert.deepEqual(v.reasons, ['AUTHORIZED_LIST_WITHOUT_RECORD']);
});

test('une liste peuplée avec une autorisation valide est le seul état ouvert', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: [REF],
    record: validRecord(),
    today: TODAY,
  });
  assert.equal(v.state, 'AUTHORIZED');
  assert.equal(v.ok, true);
});

test('une autorisation qui ne nomme pas le projet de la liste ne l ouvre pas', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: ['zzzzzzzzzzzzzzzzzzzz'],
    record: validRecord(),
    today: TODAY,
  });
  assert.equal(v.state, 'REFUSED');
  assert.ok(v.reasons.includes('AUTHORIZATION_TARGET_MISMATCH'));
});

test('deux cibles à la fois ne sont pas un exercice', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: [REF, 'zzzzzzzzzzzzzzzzzzzz'],
    record: validRecord(),
    today: TODAY,
  });
  assert.equal(v.state, 'REFUSED');
  assert.ok(v.reasons.includes('AUTHORIZATION_TARGET_MISMATCH'));
});

test('un identifiant répété est une seule cible, pas deux', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: [REF, REF],
    record: validRecord(),
    today: TODAY,
  });
  assert.equal(v.state, 'AUTHORIZED', JSON.stringify(v.reasons));
});

test('une autorisation orpheline ne dort pas dans le dossier de conservation', () => {
  const v = resolveRestoreTargetAuthorization({
    authorizedProjectRefs: [],
    record: validRecord(),
    today: TODAY,
  });
  assert.equal(v.state, 'CLOSED_EXPECTED');
  assert.deepEqual(v.reasons, ['STALE_AUTHORIZATION_RECORD']);
});

test('chaque code de refus est atteignable par au moins un cas construit', () => {
  const reached = new Set();
  const collect = (r) => r.reasons.forEach((x) => reached.add(x));
  collect(validateOwnerAuthorization(null, { projectRef: REF, today: TODAY }));
  collect(validateOwnerAuthorization(validRecord({ authorizedBy: 'x' }), { projectRef: REF, today: TODAY }));
  collect(validateOwnerAuthorization(validRecord(), { projectRef: 'z', today: TODAY }));
  collect(validateOwnerAuthorization(validRecord({ scope: 'X' }), { projectRef: REF, today: TODAY }));
  collect(validateOwnerAuthorization(validRecord({ revocationAuthorized: true }), { projectRef: REF, today: TODAY }));
  collect(validateOwnerAuthorization(
    validRecord({ costBasis: { ...validRecord().costBasis, sourceUrl: 'https://x.example' } }),
    { projectRef: REF, today: TODAY },
  ));
  collect(validateOwnerAuthorization(validRecord({ expiresAt: '2000-01-01' }), { projectRef: REF, today: TODAY }));
  collect(validateOwnerAuthorization(validRecord(), { projectRef: REF, today: TODAY, insideRepo: true }));
  collect(resolveRestoreTargetAuthorization({ authorizedProjectRefs: [REF], record: null }));
  collect(resolveRestoreTargetAuthorization({ authorizedProjectRefs: [], record: validRecord(), today: TODAY }));
  for (const code of TARGET_AUTHORIZATION_REFUSALS) {
    assert.ok(reached.has(code), `code jamais atteint par les tests : ${code}`);
  }
});

// --- Le fichier d autorisation vit hors dépôt -------------------------------------------

test('un fichier d autorisation dans le dépôt est refusé avant lecture', () => {
  const p = join(REPO_ROOT, 'autorisation-interdite.json');
  const r = readAuthorizationRecord(p, { repoRoot: REPO_ROOT });
  assert.equal(r.ok, false);
  assert.deepEqual(r.reasons, ['AUTHORIZATION_RECORD_INSIDE_REPO']);
});

test('un fichier d autorisation hors dépôt est lu tel quel', () => {
  const dir = mkdtempSync(join(tmpdir(), 'maximus-authz-'));
  const p = join(dir, 'authorization.json');
  writeFileSync(p, JSON.stringify(validRecord()));
  const r = readAuthorizationRecord(p, { repoRoot: REPO_ROOT });
  assert.equal(r.ok, true);
  assert.equal(r.record.projectRef, REF);
});

test('un fichier absent ou illisible ne devient pas une autorisation', () => {
  const r = readAuthorizationRecord(join(tmpdir(), 'inexistant-authz.json'), { repoRoot: REPO_ROOT });
  assert.equal(r.ok, false);
  assert.deepEqual(r.reasons, ['AUTHORIZATION_MISSING']);
  assert.deepEqual(readAuthorizationRecord('', { repoRoot: REPO_ROOT }).reasons, ['AUTHORIZATION_MISSING']);
});

// --- Résumé publiable et CLI ------------------------------------------------------------

test('le résumé publiable ne contient aucun jeton ni contenu de source', () => {
  const s = publicCostSummary({ pathId: 'THROWAWAY_PROJECT_IN_PRO_ORG', hours: 2 });
  const text = JSON.stringify(s);
  assert.doesNotMatch(text, /sb_secret_|sb_publishable_|eyJ[A-Za-z0-9_-]{20,}/);
  assert.ok(s.conditions.length > 0);
  assert.equal(s.marginalCostUsd, 0.02688);
});

test('le CLI --check constate le gate fermé et sort en 0', () => {
  const out = execFileSync(process.execPath, ['scripts/security/restoreTargetAuthorization.mjs', '--check'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.authorizedProjectRefs, 0);
  assert.equal(parsed.state, 'CLOSED_EXPECTED');
  assert.equal(parsed.revocationAllowed, false);
  assert.equal(parsed.rollbackReady, '0/16');
});

test('le CLI refuse une autorisation rangée dans le dépôt', () => {
  assert.throws(() => execFileSync(process.execPath, [
    'scripts/security/restoreTargetAuthorization.mjs',
    '--check',
    '--record',
    join(REPO_ROOT, 'docs', 'security', 'autorisation.json'),
  ], { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' }));
});

test('le CLI ne sort pas en 0 quand une autorisation fournie n ouvre pas le gate', () => {
  const dir = mkdtempSync(join(tmpdir(), 'maximus-authz-cli-'));
  const p = join(dir, 'authorization.json');
  writeFileSync(p, JSON.stringify(validRecord()));
  // La liste du dépôt est vide : l'autorisation valide est donc orpheline. Sortir en 0
  // laisserait croire qu'elle a pris effet — c'est le « succès apparent » à empêcher.
  const r = spawnSync(process.execPath, [
    'scripts/security/restoreTargetAuthorization.mjs', '--check', '--record', p,
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  assert.equal(r.status, 1, `sortie attendue 1, obtenue ${r.status}`);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.state, 'CLOSED_EXPECTED');
  assert.deepEqual(parsed.reasons, ['STALE_AUTHORIZATION_RECORD']);
  assert.equal(parsed.suppliedAuthorizationApplied, false);
  assert.equal(parsed.revocationAllowed, false);
});
