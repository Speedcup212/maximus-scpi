import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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

test('le handoff exige une attestation SIGNÉE contre une ancre épinglée, pas un simple hash', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  // Constat du 25/11 : deux documents cohérents mais forgés passaient le gate v2.
  assert.match(doc, /rollbackVerifierTrustAnchor\.json/);
  assert.match(doc, /ed25519/);
  assert.match(doc, /ATTESTATION_UNSIGNED/);
  assert.match(doc, /ATTESTATION_VERIFIER_NOT_TRUSTED/);
  assert.match(doc, /ANCHOR_KEY_NOT_PROVISIONED/);
  assert.match(doc, /ATTESTATION_KEY_REVOKED/);
  assert.match(doc, /ATTESTATION_SIGNATURE_INVALID/);
  assert.match(doc, /ROLLBACK_READY_WITHOUT_SIGNATURE/);
  // La frontière du dépôt est résolue réellement, pas par `resolve` seul.
  assert.match(doc, /realpath/);
  assert.match(doc, /ATTESTATION_DIR_INSIDE_REPO/);
  assert.match(doc, /ATTESTATION_INSIDE_REPO/);
});

test('le handoff sépare readiness pré-déploiement et validation post-déploiement', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  assert.match(doc, /PRE_DEPLOY/);
  assert.match(doc, /POST_DEPLOY/);
  assert.match(doc, /ROLLBACK_TARGET_DIFFERS_BEFORE_DEPLOY/);
  assert.match(doc, /EVIDENCE_STAGE_MISMATCH/);
  assert.match(doc, /PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION/);
});

test('le handoff enregistre la cible arbitrée du patch scpi-certified-promote', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  // Arbitrage du 25/11 : bundle v12 réellement en production, pas un commit antérieur.
  assert.match(doc, /db3599421ad844e81a031bfbc149345ecd3e791736e7bb1bca4cba00c5fe8e44/);
  assert.match(doc, /empreinte \*\*fournisseur\*\*/i);
  assert.match(doc, /canonique/i);
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

// --- Défaut du lot 14 : un handoff qui cite des commandes inexistantes -----------------

test('chaque script de sécurité cité par le handoff existe réellement sur disque', () => {
  const doc = handoff();
  const cited = new Set([...doc.matchAll(/scripts\/security\/[\w.-]+\.mjs/g)].map((m) => m[0]));
  assert.ok(cited.size >= 3, 'le handoff doit citer les outils de la chaîne de restauration');
  for (const rel of cited) {
    assert.ok(existsSync(join(REPO_ROOT, rel)), `script cité par le handoff mais absent : ${rel}`);
  }
});

test('le handoff n utilise plus les drapeaux fantômes du plan de restauration', () => {
  const doc = handoff();
  // L'assertion porte sur les blocs de commandes réellement exécutables. Le chapitre 11.1
  // cite les commandes fautives pour documenter le défaut : ce n'est pas une instruction.
  const commandBlocks = [...doc.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');
  assert.ok(commandBlocks.length > 0, 'aucun bloc de commande dans le handoff');
  // `--custody` n'a jamais été reconnu par collectReadback : il sauvegardait « en silence ».
  assert.doesNotMatch(commandBlocks, /collectReadback\.mjs[^\n]*--custody/);
  // restoreProtocol.mjs est une bibliothèque : l'appeler en CLI se terminait en exit 0 muet.
  assert.doesNotMatch(commandBlocks, /node\s+scripts\/security\/restoreProtocol\.mjs\s+--/);
  // La commande de capture correcte est citée, et l'étape de reconditionnement a un point
  // d'entrée réel.
  assert.match(commandBlocks, /collectReadback\.mjs --capture/);
  assert.match(commandBlocks, /prepareRestore\.mjs/);
});

test('le handoff documente les deux objets du plan de restauration', () => {
  const doc = handoff();
  assert.match(doc, /RESTORE_DRILL/);
  assert.match(doc, /ROLLBACK_EVIDENCE/);
  assert.match(doc, /ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE/);
  // Un exercice de restauration ne peut pas être confondu avec une preuve de rollback.
  assert.match(doc, /restauration exercée/i);
});

test('le handoff exige les tests d authentification après restauration', () => {
  const doc = handoff();
  assert.match(doc, /verify_jwt=false/);
  assert.match(doc, /401/);
  // Le troisième obstacle du §2.7.8 doit rester explicitement testé.
  assert.match(doc, /configSha256/);
});

test('le handoff subordonne la requalification ANALYST à une nécessité métier', () => {
  const doc = handoff();
  assert.match(doc, /ca1cc7be-2e80-43dd-afc6-42f01e069951/);
  assert.match(doc, /nécessité métier/i);
  assert.match(doc, /execution_mode='scoped_code_correction'/);
});

test('aucun fichier du handoff ne contient de secret ni de source de production', () => {
  for (const doc of [handoff(), runbook()]) {
    assert.doesNotMatch(doc, /SUPABASE_ACCESS_TOKEN=[A-Za-z0-9]/);
    assert.doesNotMatch(doc, /-----BEGIN [A-Z ]*PRIVATE KEY-----/);
  }
});

test('la préparation de restauration est déclarée bloquée, jamais exécutée', () => {
  const doc = handoff();
  // Le chapitre 11 doit distinguer explicitement préparé et bloqué.
  const section = doc.slice(doc.indexOf('## 11. Handoff unique exécutable'));
  assert.ok(section.length > 1000, 'chapitre 11 absent');
  assert.match(section, /NON EXÉCUTÉ/);
  assert.match(section, /rollbackReady\*\* reste \*\*0\/16|rollbackReady\` reste \*\*0\/16/);
});

// --- Défaut du lot 14 : un faux PASS sur production ------------------------------------

test('le handoff exige une destination autorisée, pas seulement différente', () => {
  const doc = handoff();
  // Le contrôle portait sur le contenu, jamais sur le projet : relire la production donnait
  // PASS. La doc doit nommer la liste d'autorisation et chaque code de refus.
  assert.match(doc, /AUTHORIZED_RESTORE_PROJECT_REFS/);
  assert.match(doc, /RESTORE_TARGET_IS_PRODUCTION_PROJECT/);
  assert.match(doc, /RESTORE_TARGET_IS_SOURCE_PROJECT/);
  assert.match(doc, /RESTORE_TARGET_NOT_AUTHORIZED/);
  assert.match(doc, /RESTORED_PROJECT_REF_MISMATCH/);
  // Et l'état réel : la liste est vide, donc aucun exercice n'est possible aujourd'hui.
  assert.match(doc, /liste \*\*vide\*\*|liste est \*\*vide\*\*/);
});

test('le handoff refuse d élargir l autorisation pour débloquer un exercice', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  assert.match(doc, /peupler\s*`?AUTHORIZED_RESTORE_PROJECT_REFS`?\s*sans décision/i);
});

test('le handoff distingue le PASS de comparaison d une preuve d exercice', () => {
  const doc = handoff();
  assert.match(doc, /exercisedProof/);
  assert.match(doc, /n'est pas une preuve d'exercice/i);
  // La version fournisseur est tracée, jamais comparée à l'identique.
  assert.match(doc, /versionTrace/);
});

test('le handoff décrit la requête de déploiement estampillée, jamais recopiée de la capture', () => {
  const doc = handoff();
  assert.match(doc, /estampill/i);
  assert.match(doc, /TARGET_REFUSED/);
  // Le fichier émis ne doit nommer la production dans aucun champ.
  assert.match(doc, /ne doit \*\*jamais\*\* contenir le projet de production|jamais.*projet de production/i);
});

test('le handoff établit le coût du projet jetable sans en créer aucun', () => {
  const doc = handoff();
  assert.match(doc, /11\.5\.2/);
  // Le lot 15 affirmait « 0 € sur le plan gratuit ». L'arbitrage du 26/11 a établi que
  // l'organisation est Pro : l'affirmation est corrigée, pas maintenue.
  assert.match(doc, /0,01344 \$\/h|0\.01344/);
  assert.match(doc, /Pro\*\* et compte déjà quatre projets actifs|organisation est \*\*Pro\*\*/);
  // Aucune création : la doc doit dire explicitement que rien n'a été créé.
  assert.match(doc, /aucune création/i);
});

test('le handoff ne présente plus le plan gratuit comme acquis pour cette organisation', () => {
  const doc = handoff().replace(/\s+/g, ' ');
  // La phrase fautive du lot 15 doit avoir disparu : elle fondait une décision sur une
  // hypothèse que l'inventaire fournisseur a réfutée.
  assert.doesNotMatch(doc, /0 € \*\*sur le plan gratuit/i);
  assert.doesNotMatch(doc, /plan gratuit possible, à confirmer/i);
});

test('le handoff outille l autorisation nominative et cite ses codes de refus', () => {
  const doc = handoff();
  assert.match(doc, /restoreTargetAuthorization\.mjs/);
  for (const code of [
    'AUTHORIZED_LIST_WITHOUT_RECORD',
    'AUTHORIZATION_NOT_OWNER',
    'AUTHORIZATION_GRANTS_REVOCATION',
    'AUTHORIZATION_RECORD_INSIDE_REPO',
    'STALE_AUTHORIZATION_RECORD',
    'CLOSED_EXPECTED',
  ]) {
    assert.ok(doc.includes(code), `${code} absent du handoff`);
  }
});
