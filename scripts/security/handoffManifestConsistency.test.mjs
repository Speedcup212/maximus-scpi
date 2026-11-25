import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildManifest } from './edgeFunctionDeploymentManifest.mjs';
import { REPO_ROOT, INITIAL_PERIMETER_SIZE } from './edgeFunctionDeploymentManifest.mjs';

const HANDOFF = join(REPO_ROOT, 'docs', 'security', 'HANDOFF_SUPABASE_API_KEYS_MIGRATION.md');
const RUNBOOK = join(REPO_ROOT, 'docs', 'security', 'RUNBOOK_SUPABASE_API_KEYS_MIGRATION.md');

const handoff = () => readFileSync(HANDOFF, 'utf8');
const runbook = () => readFileSync(RUNBOOK, 'utf8');

test('le handoff cite chaque fonction du périmètre du manifeste', () => {
  const doc = handoff();
  for (const f of buildManifest(() => undefined).functions) {
    assert.ok(doc.includes(f.name), `le handoff ne mentionne pas ${f.name}`);
  }
});

test('le décompte du handoff correspond exactement au manifeste calculé', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  const m = buildManifest(() => undefined);
  const expected = `${m.counts.deployed} déployées + ${m.counts.pendingDeploy} restantes + `
    + `${m.counts.pendingKeyOnlyPatch} patch clé-seule + `
    + `${m.counts.pendingCoordinatedLot} lot coordonné = ${INITIAL_PERIMETER_SIZE}/${INITIAL_PERIMETER_SIZE}`;
  assert.ok(
    doc.includes(expected),
    `décompte réconcilié attendu introuvable : « ${expected} »`,
  );
  // Les états par état ne doivent pas être contradictoires avec le manifeste.
  assert.equal(
    m.counts.deployed + m.counts.pendingDeploy + m.counts.pendingKeyOnlyPatch
      + m.counts.pendingCoordinatedLot,
    INITIAL_PERIMETER_SIZE,
  );
});

test('le handoff ne prétend pas le rollback prêt ni la révocation autorisée', () => {
  const doc = handoff();
  assert.doesNotMatch(doc, /revocationAllowed\s*[:=]\s*true/i);
  assert.doesNotMatch(doc, /rollback.*\b16\/16 ready\b/i);
  assert.match(doc, /rollbackReady\s*=\s*0\/16/);
  assert.match(doc, /revocationAllowed\s*=\s*false/);
});

test('le handoff documente la condition d évidence du bundle de production', () => {
  const doc = handoff();
  assert.match(doc, /prod-bundles/);
  assert.match(doc, /PROD_DEPENDENCY_FINGERPRINT_MISSING/);
  assert.match(doc, /bundleSha256/);
  assert.match(doc, /entrypointSha256/);
});

test('le handoff affirme qu une empreinte n est pas une sauvegarde restaurable', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  assert.match(doc, /empreinte est une \*\*identité\*\*, pas une \*\*sauvegarde\*\*/);
  assert.match(doc, /holdsRestorableArtifact/);
  assert.match(doc, /restoreDrill/);
  assert.match(doc, /RESTORE_DRILL_ON_PRODUCTION/);
  assert.match(doc, /ROLLBACK_READY_WITHOUT_CUSTODY/);
  assert.match(doc, /ROLLBACK_READY_WITHOUT_RESTORE_DRILL/);
  assert.match(doc, /restaurable/);
});

test('le handoff exige une vérification indépendante hors dépôt et une cible pré-migration', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  // Défaut 1 : une déclaration cohérente ne suffisait pas ; l'attestation est hors dépôt.
  assert.match(doc, /MAXIMUS_ROLLBACK_EVIDENCE_ROOT/);
  assert.match(doc, /EVIDENCE_ROOT_INSIDE_REPO/);
  assert.match(doc, /ATTESTATION_VERIFIER_IS_OPERATOR/);
  assert.match(doc, /ATTESTATION_CLAIM_MISMATCH/);
  // Défaut 2 : restaurer le bundle déployé ne défait rien.
  assert.match(doc, /rollbackTarget/);
  assert.match(doc, /PRE_MIGRATION/);
  assert.match(doc, /ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE/);
  assert.match(doc, /ROLLBACK_READY_TARGET_IS_DEPLOYED_BUNDLE/);
  // Défaut 3 : la garde et le journal doivent être liés.
  assert.match(doc, /CUSTODY_BINDS_OTHER_BUNDLE/);
  assert.match(doc, /RESTORE_JOURNAL_INSIDE_REPO/);
  assert.match(doc, /ROLLBACK_READY_WITHOUT_INDEPENDENT_VERIFICATION/);
});

test('le handoff interdit de publier des bundles bruts dans un dépôt public', () => {
  const doc = handoff();
  assert.match(doc, /dépôt étant \*\*public\*\*/);
  assert.match(doc, /aucun bundle brut/i);
});

test('le handoff outille le patch scpi-certified-promote et le déclare vérifié', () => {
  const doc = handoff();
  assert.match(doc, /applyKeyOnlyPatch\.mjs/);
  assert.match(doc, /UNAUTHORIZED_EDIT/);
  assert.match(doc, /AMBIGUOUS_LEGACY_RESOLUTION/);
  assert.match(doc, /à l'octet près/);
});

test('le handoff attribue correctement le drift des gardes prix au dépôt, antérieur à #457', () => {
  const doc = handoff();
  assert.match(doc, /déjà présentes dans\s*\n?`dfc6b309`/);
  assert.match(doc, /dépôt ↔ production/);
  assert.match(doc, /non\*\* introduit par/);
});

test('le handoff sépare explicitement les 5 fonctions sans source du périmètre des 16', () => {
  const doc = handoff();
  for (const name of [
    'scpi-parallel-backfill-worker',
    'scpi-parallel-discover-worker',
    'scpi-annual-source-discover',
    'scpi-norma-quarterly-ingest',
    'maximus-watchdog-oidc',
  ]) {
    assert.ok(doc.includes(name), `${name} absent du handoff`);
  }
  assert.match(doc, /SOURCE_ABSENT_FROM_REPO/);
});

test('le handoff exige une preuve par fonction et rejette les agrégats', () => {
  const doc = handoff();
  assert.match(doc, /preuve par fonction/i);
  assert.match(doc, /agrégat/i);
});

test('le handoff n exige plus le rollback par simple checkout d un commit', () => {
  const doc = handoff();
  const section = doc.slice(doc.indexOf('#### 2.7.4'));
  assert.doesNotMatch(
    section.slice(0, 3000),
    /^\*\*Rollback\*\* : `git checkout/m,
    'le rollback par checkout de commit est encore présenté comme suffisant',
  );
});

test('le handoff ne contient aucune valeur de clé', () => {
  for (const doc of [handoff(), runbook()]) {
    assert.doesNotMatch(doc, /sb_secret_[A-Za-z0-9]{10,}/);
    assert.doesNotMatch(doc, /sb_publishable_[A-Za-z0-9]{10,}/);
    assert.doesNotMatch(doc, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/);
  }
});

test('le runbook renvoie au manifeste machine-vérifiable', () => {
  assert.match(runbook(), /edgeFunctionDeploymentManifest/);
});
