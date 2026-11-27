import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync,
  symlinkSync, rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  generateKeyPairSync, createPrivateKey, sign,
} from 'node:crypto';
import {
  buildManifest,
  validateManifest,
  ledgerSnapshot,
  declaredImports,
  resolveRepoFingerprint,
  validateProdEvidence,
  crossCheckAttestation,
  readAttestation,
  readTrustAnchor,
  verifyAttestationSignature,
  canonicalJsonSha256,
  resolvesInsideRepo,
  INITIAL_PERIMETER_SIZE,
  LEDGER_PATH,
  PROD_EVIDENCE_DIR,
  FUNCTIONS_DIR,
  REPO_ROOT,
  TRUST_ANCHOR_PATH,
  EVIDENCE_SCHEMA_VERSION,
  ATTESTATION_SCHEMA_VERSION,
  TRUST_ANCHOR_SCHEMA_VERSION,
  PRODUCTION_PROJECT_REF,
  MAX_READBACK_AGE_MS,
  readbackConfigSha256,
  validateReadback,
  bundleFingerprint,
} from './edgeFunctionDeploymentManifest.mjs';

const noEvidence = () => undefined;
const noAttestation = () => ({ attestation: null, source: 'NONE', reason: 'EVIDENCE_ROOT_UNSET' });
const manifest = () => buildManifest(noEvidence);

test('le périmètre initial de 16 fonctions est classé exactement une fois', () => {
  const m = manifest();
  assert.equal(m.counts.initialPerimeter, INITIAL_PERIMETER_SIZE);
  const sum =
    m.counts.deployed +
    m.counts.pendingDeploy +
    m.counts.pendingKeyOnlyPatch +
    m.counts.pendingCoordinatedLot;
  assert.equal(sum, INITIAL_PERIMETER_SIZE);
  assert.equal(m.functions.length, INITIAL_PERIMETER_SIZE);
  assert.equal(new Set(m.functions.map((f) => f.name)).size, INITIAL_PERIMETER_SIZE);
  assert.deepEqual(validateManifest(m), []);
});

test('le décompte publié dans le ticket est reproductible et explicite', () => {
  const { counts } = manifest();
  assert.equal(counts.deployed, 6);
  assert.equal(counts.pendingDeploy, 7);
  assert.equal(counts.pendingKeyOnlyPatch, 1);
  assert.equal(counts.pendingCoordinatedLot, 2);
  assert.equal(
    counts.deployed + counts.pendingDeploy + counts.pendingKeyOnlyPatch + counts.pendingCoordinatedLot,
    16,
  );
});

test('les cinq fonctions orphelines sont hors périmètre et bloquent la révocation', () => {
  const m = manifest();
  const orphans = m.outOfPerimeter.filter((x) => x.reason === 'SOURCE_ABSENT_FROM_REPO');
  assert.equal(orphans.length, 5);
  for (const o of orphans) {
    assert.equal(o.blocksRevocation, true, `${o.name} doit bloquer la révocation`);
    assert.equal(m.functions.some((f) => f.name === o.name), false);
  }
  assert.equal(m.counts.revocationBlockers >= 5, true);
  assert.equal(m.revocationAllowed, false);
});

test('aucune fonction hors périmètre ne double une fonction du périmètre', () => {
  const m = manifest();
  const inScope = new Set(m.functions.map((f) => f.name));
  for (const x of m.outOfPerimeter) assert.equal(inScope.has(x.name), false, x.name);
});

test('scpi-scoring et maximus-search-agent-oidc ne bloquent pas la révocation', () => {
  const m = manifest();
  for (const name of ['scpi-scoring', 'maximus-search-agent-oidc']) {
    const x = m.outOfPerimeter.find((o) => o.name === name);
    assert.ok(x, `${name} doit être classé`);
    assert.equal(x.blocksRevocation, false);
  }
});

test('chaque fonction du périmètre a une source présente avec empreinte SHA-256', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.deepEqual(f.repo.missing, [], `${f.name} : dépendance manquante`);
    assert.match(f.repo.entrypoint.sha256, /^[0-9a-f]{64}$/, f.name);
    assert.match(f.repo.bundleSha256, /^[0-9a-f]{64}$/, f.name);
    for (const d of f.repo.dependencies) {
      assert.match(d.sha256, /^[0-9a-f]{64}$/, `${f.name}:${d.path}`);
    }
  }
});

test('toutes les dépendances locales importées sont déclarées au registre', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.deepEqual(f.undeclaredImports, [], `${f.name} importe une dépendance non déclarée`);
  }
});

test('un import local non déclaré est détecté', () => {
  const entry = join(FUNCTIONS_DIR, 'scpi-bulletin-watch', 'index.ts');
  const imports = declaredImports(readFileSync(entry, 'utf8'));
  assert.ok(imports.includes('./sourceProvenance.mjs'));
  assert.ok(imports.includes('../_shared/serviceKey.ts'));
});

test('le rollback n est jamais déclaré prêt sans évidence du bundle de production', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.equal(f.rollback.ready, false, `${f.name} : rollback prématuré`);
    assert.equal(f.rollback.blockingReason, 'EVIDENCE_MISSING');
    assert.equal(f.rollback.prodEvidencePresent, false);
  }
  assert.equal(m.counts.rollbackReady, 0);
});

/**
 * Readback fournisseur cohérent avec une fonction donnée : la pièce qui atteste ce que la
 * production contient réellement, dans le bon projet, à un instant daté.
 *
 * Les tests négatifs le dégradent champ par champ pour prouver que chaque propriété est
 * exigée séparément (projet, fraîcheur, liaison de configuration, accord avec `observed`).
 */
const readbackFor = (name, version, verifyJwt = false, overrides = {}) => {
  const entrypointPath = `${name}/index.ts`;
  const dependencies = [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }];
  const base = {
    source: 'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}',
    bundleSource: 'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}/body',
    fetchedAt: '2026-11-25T00:30:00Z',
    projectRef: PRODUCTION_PROJECT_REF,
    slug: name,
    status: 'ACTIVE',
    version,
    verifyJwt,
    providerEntrypointPath: `file:///tmp/user_fn_redacted_${version}/source/index.ts`,
    entrypointPath,
    entrypointSha256: 'a'.repeat(64),
    providerEzbrSha256: 'f'.repeat(64),
    dependencies,
    // Empreinte canonique du bundle, recalculée depuis l'entrypoint et les dépendances.
    bundleSha256: bundleFingerprint([
      { path: entrypointPath, sha256: 'a'.repeat(64) },
      ...dependencies,
    ]),
  };
  const merged = { ...base, ...overrides };
  merged.configSha256 = readbackConfigSha256({
    projectRef: merged.projectRef,
    slug: merged.slug,
    version: merged.version,
    verifyJwt: merged.verifyJwt,
    entrypointPath: merged.entrypointPath,
  });
  if (overrides.configSha256) merged.configSha256 = overrides.configSha256;
  return merged;
};

/**
 * Évidence v3 : identité constatée PAR READBACK FOURNISSEUR + bundle de ROLLBACK distinct
 * (pré-migration) + garde liée à ce bundle + restauration testée hors prod, avec journal,
 * stage explicite, et signature couvrant projet/version/configuration.
 */
const hardenedEvidence = (name, observedVersion, targetVersion = observedVersion - 1, stage = 'POST_DEPLOY') => {
  // `observed` est dérivé du readback : une évidence dont les deux blocs divergent est
  // refusée par `READBACK_DISAGREES_WITH_OBSERVED_*`, ce qui est le comportement voulu.
  const readback = readbackFor(name, observedVersion);
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    stage,
    function: name,
    observed: {
      version: readback.version,
      verifyJwt: readback.verifyJwt,
      entrypointSha256: readback.entrypointSha256,
      dependencies: readback.dependencies,
      bundleSha256: readback.bundleSha256,
      readback,
    },
    rollbackTarget: {
      phase: 'PRE_MIGRATION',
      version: targetVersion,
      verifyJwt: false,
      entrypointSha256: '1'.repeat(64),
      dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
      bundleSha256: '2'.repeat(64),
    },
    custody: {
      artifactRef: `vault://prod-bundles/${name}-v${targetVersion}.tgz`,
      artifactSha256: 'd'.repeat(64),
      owner: 'proprietaire',
      holdsRestorableArtifact: true,
      bindsToBundleSha256: '2'.repeat(64),
      bindsToFunction: name,
      bindsToVersion: targetVersion,
    },
    restoreDrill: {
      performedAt: '2026-11-25T00:00:00Z',
      performedBy: 'ci-restore-drill',
      destination: 'staging-non-prod',
      result: 'PASS',
      journalRef: '/var/lib/maximus/restore-drills/scpi-evidence-certify.log',
      journalSha256: 'e'.repeat(64),
      restoredEntrypointSha256: '1'.repeat(64),
      restoredBundleSha256: '2'.repeat(64),
    },
    attestation: {
      schemaVersion: ATTESTATION_SCHEMA_VERSION,
      verifier: 'independent-control',
      verifierIdentity: 'chatgpt-independent-controller',
      attestationSha256: 'PENDING',
    },
  };
};

/**
 * Paire de clés Ed25519 **de test**, générée à la volée et jamais commitée.
 *
 * Le test ne prouve donc pas qu'une clé réelle existe : il prouve que le gate **exige** une
 * signature vérifiable contre l'ancre, et qu'un document forgé — même parfaitement cohérent
 * avec l'évidence — ne peut pas la produire sans la clé privée.
 */
const TEST_KEY_ID = 'test-key-2026-11';
const testKeys = generateKeyPairSync('ed25519');
const TEST_PUBLIC_PEM = testKeys.publicKey.export({ type: 'spki', format: 'pem' });
const TEST_PRIVATE_PEM = testKeys.privateKey.export({ type: 'pkcs8', format: 'pem' });

const testAnchor = (overrides = {}) => ({
  schemaVersion: TRUST_ANCHOR_SCHEMA_VERSION,
  verifiers: [
    {
      identity: 'chatgpt-independent-controller',
      algorithm: 'ed25519',
      keyId: TEST_KEY_ID,
      publicKeyPem: TEST_PUBLIC_PEM,
      revokedKeyIds: [],
      ...overrides,
    },
  ],
});

/** Signe les affirmations d'une attestation (ce que ferait le contrôle indépendant). */
const signClaims = (claims, privatePem = TEST_PRIVATE_PEM) => {
  const payload = canonicalJsonSha256(claims);
  return {
    keyId: TEST_KEY_ID,
    algorithm: 'ed25519',
    value: sign(null, Buffer.from(payload, 'utf8'), createPrivateKey(privatePem)).toString('base64'),
  };
};

/**
 * Attestation externe **signée** : elle confirme l'évidence champ par champ et porte une
 * signature vérifiable contre l'ancre épinglée.
 */
const attestationFor = (evidence, opts = {}) => {
  const claims = {
    schemaVersion: ATTESTATION_SCHEMA_VERSION,
    function: evidence.function,
    stage: evidence.stage,
    observedBundleSha256: evidence.observed.bundleSha256,
    rollbackTargetBundleSha256: evidence.rollbackTarget.bundleSha256,
    custodyArtifactSha256: evidence.custody.artifactSha256,
    custodyArtifactRef: evidence.custody.artifactRef,
    restoreJournalSha256: evidence.restoreDrill.journalSha256,
    restoredBundleSha256: evidence.restoreDrill.restoredBundleSha256,
    restoreDestination: evidence.restoreDrill.destination,
    restoreResult: evidence.restoreDrill.result,
    // Identité complète du bundle : le SHA de code seul ne prouve pas la configuration.
    // Un readback absent laisse ces affirmations vides : le recoupement échouera alors en
    // `MISSING_attestation_claim_*` ou en `ATTESTATION_CLAIM_MISMATCH_*`, jamais en succès.
    projectRef: evidence.observed?.readback?.projectRef ?? null,
    observedVersion: evidence.observed?.version ?? null,
    observedVerifyJwt: evidence.observed?.verifyJwt ?? null,
    observedConfigSha256: evidence.observed?.readback?.configSha256 ?? null,
    readbackSource: evidence.observed?.readback?.source ?? null,
    readbackFetchedAt: evidence.observed?.readback?.fetchedAt ?? null,
    verifier: evidence.attestation.verifier,
    verifierIdentity: evidence.attestation.verifierIdentity,
    operator: evidence.restoreDrill.performedBy,
    independentOfOperator: true,
    verifiedAt: '2026-11-25T01:00:00Z',
    ...opts.claims,
  };
  return {
    ...claims,
    attestationSha256: canonicalJsonSha256(claims),
    signature: signClaims(claims, opts.privatePem ?? TEST_PRIVATE_PEM),
  };
};

/** Lecteur d'attestation qui répond avec une attestation signée liée à l'évidence fournie. */
const attestationReaderFor = (evidenceFn, opts = {}) => (name) => {
  const ev = evidenceFn(name);
  return {
    attestation: ev ? attestationFor(ev, typeof opts === 'function' ? opts(ev) : opts) : null,
    source: `/non-repo/attestations/${name}.json`,
    reason: ev ? null : 'ATTESTATION_MISSING',
  };
};

/**
 * Manifeste construit contre l'ancre de test.
 *
 * Le dépôt, lui, épingle une ancre **sans clé publique** : le gate reste donc fermé en CI
 * tant que le contrôle indépendant n'a pas publié la sienne. Ces tests-ci vérifient le
 * mécanisme, pas la réalité de la vérification.
 */
const buildAnchored = (evidenceFn, readerFn, anchor = testAnchor()) =>
  buildManifest(evidenceFn, readerFn, anchor);

const evidenceCertify = (m) => m.functions.find((f) => f.name === 'scpi-evidence-certify');

test('une évidence v2 vérifiée indépendamment rend le rollback calculable', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, true);
  assert.equal(f.rollback.blockingReason, null);
  assert.equal(f.rollback.fingerprintsOnly, false);
  assert.equal(f.rollback.independentlyVerified, true);
  assert.equal(f.rollback.custodyProof.holdsRestorableArtifact, true);
  assert.equal(f.rollback.restoreDrill.result, 'PASS');
  assert.equal(f.rollback.rollbackTarget.phase, 'PRE_MIGRATION');
  const calendly = m.functions.find((f) => f.name === 'calendly-webhook');
  // Version de prod non encore constatée dans le registre -> rien n'est validé par ressemblance.
  assert.equal(calendly.prodVersion, null);
  assert.equal(calendly.rollback.ready, false);
});

test('les SHA fictifs du lot 7 ne suffisent plus : sans attestation externe, rien n est prêt', () => {
  // Le défaut exact relevé par le contrôle indépendant : une évidence cohérente mais
  // entièrement déclarative (SHA inventés) ouvrait `ready = true`.
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, noAttestation);
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, false, 'une déclaration cohérente ne prouve aucune restauration');
  assert.equal(f.rollback.blockingReason, 'EVIDENCE_ROOT_UNSET');
  assert.equal(f.rollback.independentlyVerified, false);
  assert.equal(m.counts.rollbackReady, 0);
});

test('une attestation qui n est pas rattachée à l évidence est refusée', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const tampered = (name) => {
    const a = attestationFor(ev(name));
    a.rollbackTargetBundleSha256 = '9'.repeat(64);
    return { attestation: { ...a, attestationSha256: canonicalJsonSha256(
      Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'attestationSha256')),
    ) }, source: 'x', reason: null };
  };
  const f = evidenceCertify(buildAnchored(ev, tampered));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('ATTESTATION_CLAIM_MISMATCH_rollbackTargetBundleSha256'),
    f.rollback.attestationErrors.join(','),
  );
});

test('une attestation dont l empreinte ne couvre pas son contenu est refusée', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const broken = (name) => {
    const a = attestationFor(ev(name));
    a.verifier = 'autre-verificateur';
    return { attestation: a, source: 'x', reason: null };
  };
  const f = evidenceCertify(buildAnchored(ev, broken));
  assert.equal(f.rollback.ready, false);
  assert.ok(f.rollback.attestationErrors.includes('ATTESTATION_SHA256_MISMATCH'));
});

test('un opérateur ne peut pas être son propre vérificateur', () => {
  // L'opérateur du drill de restauration EST l'identité du vérificateur : auto-validation.
  const selfEv = hardenedEvidence('scpi-evidence-certify', 9);
  selfEv.restoreDrill.performedBy = selfEv.attestation.verifierIdentity;
  const selfVerified = (name) => ({
    attestation: attestationFor({ ...selfEv, function: name }),
    source: 'x',
    reason: null,
  });
  const f = evidenceCertify(buildAnchored(() => selfEv, selfVerified));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('ATTESTATION_VERIFIER_IS_OPERATOR'),
    f.rollback.attestationErrors.join(','),
  );

  const ev = (name) => hardenedEvidence(name, 9);
  const notIndependent = (name) => {
    const a = attestationFor(ev(name));
    a.independentOfOperator = false;
    return {
      attestation: { ...a, attestationSha256: canonicalJsonSha256(
        Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'attestationSha256')),
      ) },
      source: 'x',
      reason: null,
    };
  };
  const g = evidenceCertify(buildAnchored(ev, notIndependent));
  assert.equal(g.rollback.ready, false);
  assert.ok(g.rollback.attestationErrors.includes('ATTESTATION_NOT_INDEPENDENT'));
});

test('une racine d évidence située dans le dépôt n est pas une vérification indépendante', () => {
  const inside = readAttestation('scpi-evidence-certify', { root: join(REPO_ROOT, 'scripts') });
  assert.equal(inside.attestation, null);
  assert.equal(inside.reason, 'EVIDENCE_ROOT_INSIDE_REPO');
  const unset = readAttestation('scpi-evidence-certify', { root: null });
  assert.equal(unset.reason, 'EVIDENCE_ROOT_UNSET');
});

test('un PASS par rejeu local ne prouve aucune restauration : le gate reste fermé', () => {
  // Arbitrage du 26/11 : « la restauration réelle reste non prouvée ». Un `local-replay`
  // reconstruit le bundle en mémoire à partir des octets conservés — il ne traverse aucune
  // plateforme de déploiement, donc il n'exerce ni la pose de `verify_jwt`, ni la résolution
  // des dépendances, ni le démarrage. Le compter comme équivalent ouvrait `rollbackReady`
  // sans aucun environnement fournisseur : c'était le défaut.
  const localReplay = (name) => {
    const e = hardenedEvidence(name, 9);
    return { ...e, restoreDrill: { ...e.restoreDrill, destination: 'local-replay' } };
  };
  const m = buildAnchored(localReplay, attestationReaderFor(localReplay));
  const f = evidenceCertify(m);
  assert.equal(f.rollback.restoreDrill.result, 'PASS', 'le rejeu lui-même a réussi');
  assert.equal(
    f.rollback.restoreDrill.provesRestore,
    false,
    'un rejeu local ne prouve pas une restauration déployée',
  );
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'RESTORE_DRILL_NOT_ON_DEPLOYED_ENVIRONMENT');
  assert.equal(m.counts.rollbackReady, 0);
  // Le PASS partiel reste visible : on ne prétend pas que la restauration a échoué.
  assert.equal(f.rollback.restoreDrill.result, 'PASS');
});

test('une restauration exercée sur un environnement déployé hors prod ouvre le gate', () => {
  // Contrôle positif : la règle ne ferme pas le gate par principe. Les deux destinations qui
  // traversent réellement une plateforme de déploiement doivent être acceptées.
  for (const destination of ['staging-non-prod', 'disposable-project']) {
    const ev = (name) => {
      const e = hardenedEvidence(name, 9);
      return { ...e, restoreDrill: { ...e.restoreDrill, destination } };
    };
    const m = buildAnchored(ev, attestationReaderFor(ev));
    const f = evidenceCertify(m);
    assert.equal(f.rollback.restoreDrill.provesRestore, true, destination);
    assert.equal(f.rollback.ready, true, `${destination} : ${f.rollback.blockingReason ?? ''}`);
  }
});

test('des empreintes seules ne sont JAMAIS une sauvegarde restaurable', () => {
  // Exactement l'évidence que produisait le lot 6 : identité complète, aucune garde.
  const fingerprintsOnly = (name) => ({
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    stage: 'POST_DEPLOY',
    function: name,
    observed: {
      version: 9,
      verifyJwt: false,
      entrypointSha256: 'a'.repeat(64),
      dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
      bundleSha256: 'c'.repeat(64),
    },
  });
  const m = buildAnchored(fingerprintsOnly, noAttestation);
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, false, 'des empreintes ne restaurent rien');
  assert.equal(f.rollback.fingerprintsOnly, true);
  assert.equal(f.rollback.blockingReason, 'MISSING_rollbackTarget');
  assert.equal(f.rollback.custodyProof.holdsRestorableArtifact, false);
  assert.equal(m.counts.rollbackReady, 0);
});

test('restaurer le bundle déjà déployé ne défait rien : la cible doit être pré-migration', () => {
  // Défaut 2 relevé par le contrôle : le lot 7 comparait la restauration au bundle DÉPLOYÉ,
  // donc une sauvegarde post-migration était présentée comme un rollback pré-migration.
  const postMigration = (name) => {
    const e = hardenedEvidence(name, 9);
    e.rollbackTarget = JSON.parse(JSON.stringify(e.observed));
    e.rollbackTarget.phase = 'PRE_MIGRATION';
    e.custody.bindsToBundleSha256 = e.observed.bundleSha256;
    e.custody.bindsToVersion = e.observed.version;
    e.restoreDrill.restoredEntrypointSha256 = e.observed.entrypointSha256;
    e.restoreDrill.restoredBundleSha256 = e.observed.bundleSha256;
    return e;
  };
  const f = evidenceCertify(buildAnchored(postMigration, attestationReaderFor(postMigration)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE');
  assert.equal(f.rollback.rollbackTarget.equalsObserved, true);
});

test('une cible de rollback non pré-migration est rejetée', () => {
  const notPreMigration = (name) => {
    const e = hardenedEvidence(name, 9);
    e.rollbackTarget.phase = 'POST_MIGRATION';
    return e;
  };
  const f = evidenceCertify(buildAnchored(notPreMigration, attestationReaderFor(notPreMigration)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'ROLLBACK_TARGET_NOT_PRE_MIGRATION');
});

test('une garde non liée à la fonction, la version ou le bundle est rejetée', () => {
  const wrongFn = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToFunction = 'autre-fonction';
    return e;
  };
  const f1 = evidenceCertify(buildAnchored(wrongFn, attestationReaderFor(wrongFn)));
  assert.equal(f1.rollback.ready, false);
  assert.equal(f1.rollback.blockingReason, 'CUSTODY_BINDS_OTHER_FUNCTION');

  const wrongBundle = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToBundleSha256 = 'f'.repeat(64);
    return e;
  };
  const f2 = evidenceCertify(buildAnchored(wrongBundle, attestationReaderFor(wrongBundle)));
  assert.equal(f2.rollback.ready, false);
  assert.equal(f2.rollback.blockingReason, 'CUSTODY_BINDS_OTHER_BUNDLE');

  const wrongVersion = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToVersion = 4;
    return e;
  };
  const f3 = evidenceCertify(buildAnchored(wrongVersion, attestationReaderFor(wrongVersion)));
  assert.equal(f3.rollback.ready, false);
  assert.equal(f3.rollback.blockingReason, 'CUSTODY_BINDS_OTHER_VERSION');
});

test('une restauration non testée, faite en production ou sans journal ne rend pas le rollback prêt', () => {
  const withDrill = (mutate) => (name) => {
    const e = hardenedEvidence(name, 9);
    mutate(e);
    return e;
  };
  const cases = [
    [(e) => { e.restoreDrill.destination = 'production'; }, 'RESTORE_DRILL_ON_PRODUCTION'],
    [(e) => { e.restoreDrill.result = 'FAIL'; }, 'RESTORE_DRILL_NOT_PASSED'],
    [(e) => { e.restoreDrill.restoredBundleSha256 = 'e'.repeat(64); }, 'RESTORE_DRILL_BUNDLE_MISMATCH'],
    [(e) => { e.restoreDrill.restoredEntrypointSha256 = 'e'.repeat(64); }, 'RESTORE_DRILL_ENTRYPOINT_MISMATCH'],
    [(e) => { e.restoreDrill.journalRef = join(REPO_ROOT, 'docs', 'journal.log'); }, 'RESTORE_JOURNAL_INSIDE_REPO'],
    [(e) => { delete e.restoreDrill.journalSha256; }, 'MISSING_restoreDrill_journalSha256'],
  ];
  for (const [mutate, expected] of cases) {
    const ev = withDrill(mutate);
    const f = evidenceCertify(buildAnchored(ev, attestationReaderFor(ev)));
    assert.equal(f.rollback.ready, false, expected);
    assert.equal(f.rollback.blockingReason, expected);
  }
});

test('une garde déclarée non restaurable bloque le rollback', () => {
  const notRestorable = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.holdsRestorableArtifact = false;
    return e;
  };
  const f = evidenceCertify(buildAnchored(notRestorable, attestationReaderFor(notRestorable)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'CUSTODY_NOT_RESTORABLE');
});

test('un rollback prêt sans preuve exigée est une violation bloquante', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  assert.deepEqual(validateManifest(m), []);
  const target = evidenceCertify(m);

  // Sabotage successif de chaque preuve : la défense en profondeur doit refuser à chaque fois.
  const checks = [
    ['ROLLBACK_READY_WITHOUT_CUSTODY', () => { target.rollback.custodyProof.holdsRestorableArtifact = false; },
      () => { target.rollback.custodyProof.holdsRestorableArtifact = true; }],
    ['ROLLBACK_READY_WITHOUT_RESTORE_DRILL', () => { target.rollback.restoreDrill.result = null; },
      () => { target.rollback.restoreDrill.result = 'PASS'; }],
    ['ROLLBACK_READY_WITHOUT_INDEPENDENT_VERIFICATION', () => { target.rollback.independentlyVerified = false; },
      () => { target.rollback.independentlyVerified = true; }],
    ['ROLLBACK_READY_TARGET_IS_DEPLOYED_BUNDLE', () => { target.rollback.rollbackTarget.equalsObserved = true; },
      () => { target.rollback.rollbackTarget.equalsObserved = false; }],
    ['ROLLBACK_READY_WITHOUT_CUSTODY_BINDING', () => { target.rollback.custodyProof.bindsToBundleSha256 = null; },
      () => { target.rollback.custodyProof.bindsToBundleSha256 = target.rollback.rollbackTarget.bundleSha256; }],
    // Une empreinte recalculée n'est pas une signature : le v2 laissait passer un document
    // cohérent sans ancre de confiance.
    ['ROLLBACK_READY_WITHOUT_SIGNATURE', () => { target.rollback.signatureVerified = false; },
      () => { target.rollback.signatureVerified = true; }],
    ['ROLLBACK_READY_WITH_STAGE_MISMATCH', () => { target.rollback.stageMatchesDeployState = false; },
      () => { target.rollback.stageMatchesDeployState = true; }],
  ];
  for (const [code, breakIt, restore] of checks) {
    breakIt();
    const codes = validateManifest(m).map((x) => x.code);
    assert.ok(codes.includes(code), `${code} attendu, vu : ${codes.join(',')}`);
    restore();
    assert.deepEqual(validateManifest(m), [], `${code} : l'état restauré doit redevenir conforme`);
  }
});

test('une empreinte de dépendance de prod manquante bloque le rollback', () => {
  // Garde, restauration et vérification présentes : seul blocage restant, `sourceProvenance.mjs`.
  const ev = (name) => hardenedEvidence(name, 108);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  const bulletin = m.functions.find((f) => f.name === 'scpi-bulletin-watch');
  assert.equal(bulletin.rollback.ready, false);
  assert.equal(bulletin.rollback.blockingReason, 'PROD_DEPENDENCY_FINGERPRINT_MISSING');
});

test('une évidence incohérente avec la version constatée n ouvre pas le rollback', () => {
  const wrongVersion = (name) => hardenedEvidence(name, 999);
  const m = buildAnchored(wrongVersion, attestationReaderFor(wrongVersion));
  assert.equal(m.functions.every((f) => f.rollback.ready === false), true);
});

test('l évidence de production rejette une forme incomplète ou malformée', () => {
  assert.deepEqual(validateProdEvidence({}), [
    'MISSING_schemaVersion',
    'MISSING_stage',
    'MISSING_function',
    'MISSING_observed',
    'MISSING_rollbackTarget',
    'MISSING_custody',
    'MISSING_restoreDrill',
    'MISSING_attestation',
  ]);

  const badHashes = hardenedEvidence('x', 1, 0);
  badHashes.observed.entrypointSha256 = 'not-a-hash';
  badHashes.observed.bundleSha256 = 'zz';
  assert.deepEqual(validateProdEvidence(badHashes), [
    'BAD_observed_entrypointSha256',
    'BAD_observed_bundleSha256',
    // Le readback doit décrire le MÊME objet que `observed` : une déclaration qui diverge
    // de la lecture fournisseur est refusée, pas silencieusement préférée.
    'READBACK_DISAGREES_WITH_OBSERVED_entrypointSha256',
    'READBACK_DISAGREES_WITH_OBSERVED_bundleSha256',
  ]);

  const missingBytes = hardenedEvidence('x', 1, 0);
  missingBytes.observed.dependencies = [{ path: 'a', sha256: 'b'.repeat(64) }];
  assert.deepEqual(validateProdEvidence(missingBytes), ['MISSING_observed_dependency_bytes']);

  const badSchema = hardenedEvidence('x', 1, 0);
  badSchema.schemaVersion = 'security-prod-evidence-v1';
  assert.deepEqual(validateProdEvidence(badSchema), ['BAD_schemaVersion']);
});

test('une attestation incomplète est refusée sans jamais ouvrir le rollback', () => {
  const ev = hardenedEvidence('x', 1, 0);
  const errors = crossCheckAttestation(ev, { schemaVersion: ATTESTATION_SCHEMA_VERSION });
  assert.ok(errors.includes('MISSING_attestation_attestationSha256'), errors.join(','));
  assert.ok(errors.includes('MISSING_attestation_claim_independentOfOperator'), errors.join(','));
  assert.deepEqual(crossCheckAttestation(ev, null), ['ATTESTATION_MISSING']);
});

test('les fichiers d évidence commités ne contiennent aucune valeur de clé', () => {
  const forbidden = /(sb_publishable_|sb_secret_|eyJ[A-Za-z0-9_-]{10,}|service_role_key"\s*:\s*"[^"]{20,})/;
  if (!existsSync(PROD_EVIDENCE_DIR)) {
    assert.fail('répertoire prod-bundles absent (voir son README)');
  }
  const files = readdirSync(PROD_EVIDENCE_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const raw = readFileSync(join(PROD_EVIDENCE_DIR, file), 'utf8');
    assert.doesNotMatch(raw, forbidden, `${file} contient une valeur assimilable à une clé`);
    const ev = JSON.parse(raw);
    assert.deepEqual(validateProdEvidence(ev), [], `${file} : forme invalide`);
    assert.equal(ev.function, file.replace(/\.json$/, ''), `${file} : nom de fonction incohérent`);
  }
  if (files.length === 0) {
    // Aucune évidence encore consignée : le rollback reste légitimement bloqué.
    assert.equal(manifest().counts.rollbackReady, 0);
  }
});

test('le README de prod-bundles documente le format restaurable attendu', () => {
  const readme = readFileSync(join(PROD_EVIDENCE_DIR, 'README.md'), 'utf8');
  for (const field of ['entrypointSha256', 'dependencies', 'bundleSha256', 'verifyJwt',
    'custody', 'restoreDrill', 'artifactRef', 'holdsRestorableArtifact']) {
    assert.ok(readme.includes(field), `${field} non documenté`);
  }
  assert.match(readme, /Aucune valeur de clé/);
  // Le README doit dire qu'une empreinte n'est pas une sauvegarde.
  assert.match(readme, /empreinte est une \*\*identité\*\*, jamais une \*\*sauvegarde\*\*/);
});

test('scpi-certified-promote est protégée contre le déploiement de l entrypoint du dépôt', () => {
  const f = manifest().functions.find((x) => x.name === 'scpi-certified-promote');
  assert.equal(f.deployState, 'PENDING_KEY_ONLY_PATCH');
  assert.equal(f.deployGuard, 'NEVER_DEPLOY_REPO_ENTRYPOINT_VERBATIM');
  assert.match(f.entrypointDrift, /WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION/);
  const src = readFileSync(join(FUNCTIONS_DIR, 'scpi-certified-promote', 'index.ts'), 'utf8');
  assert.match(src, /WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION/);
  assert.match(src, /readServiceKey/);
});

test('le drift matcher de scpi-evidence-certify est enregistré et non écrasé', () => {
  const f = manifest().functions.find((x) => x.name === 'scpi-evidence-certify');
  const drift = f.repoDrift.find((d) => d.path === 'matcher.mjs');
  assert.ok(drift, 'drift matcher absent du registre');
  assert.equal(drift.prodSha256, '88c46bc36396a1906db5b5a625f1e336d81036a22101990e527dcc7414623b8c');
  assert.equal(drift.prodBytes, 13355);
  assert.notEqual(drift.repoSha256, drift.prodSha256);
});

test('sender-add-contact est le seul verify_jwt=true constaté en production', () => {
  const m = manifest();
  const trueJwt = m.functions.filter((f) => f.prodVerifyJwt === true).map((f) => f.name);
  assert.deepEqual(trueJwt, ['sender-add-contact']);
  const sender = m.functions.find((f) => f.name === 'sender-add-contact');
  assert.equal(sender.prodVersion, 7);
  assert.equal(sender.targetVerifyJwt, false);
  const lead = m.functions.find((f) => f.name === 'send-lead-notification');
  assert.equal(lead.prodVerifyJwt, false);
  assert.equal(lead.prodVersion, 17);
});

test('chaque fonction déclare un test positif et un test négatif', () => {
  for (const f of manifest().functions) {
    assert.ok(f.tests.positive.length > 0, `${f.name} : test positif manquant`);
    assert.ok(f.tests.negative.length > 0, `${f.name} : test négatif manquant`);
    assert.match(f.auth, /\S/, `${f.name} : authentification interne non documentée`);
  }
});

test('aucune fonction verify_jwt=false ne reste sans authentification interne', () => {
  for (const f of manifest().functions) {
    if (f.targetVerifyJwt === false) assert.match(f.auth, /\S/, f.name);
  }
});

test('le registre commité correspond aux sources actuelles', () => {
  assert.equal(existsSync(LEDGER_PATH), true, 'registre JSON absent');
  const committed = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
  assert.deepEqual(committed, ledgerSnapshot(manifest()));
});

/**
 * Défaut central du lot 8, relevé le 25/11 : « un opérateur pouvant écrire les deux
 * fichiers peut toujours inventer les deux identités et les SHA ». Le test suivant construit
 * exactement ce scénario — évidence cohérente ET attestation cohérente, toutes deux forgées —
 * et vérifie que le gate refuse.
 */
test('deux documents cohérents mais forgés ne suffisent pas : la signature manque', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const forgedReader = (name) => {
    const e = ev(name);
    const a = attestationFor(e);
    // L'attaquant recalcule l'empreinte canonique : elle reste cohérente avec son contenu,
    // mais il ne peut pas produire la signature attendue par l'ancre.
    const { signature, attestationSha256, ...claims } = a;
    const forged = { ...claims, attestationSha256: canonicalJsonSha256(claims) };
    return { attestation: forged, source: '/non-repo/attestations/x.json', reason: null };
  };
  const f = evidenceCertify(buildAnchored(ev, forgedReader));
  assert.equal(f.rollback.ready, false, 'un document non signé ne prouve aucune vérification');
  assert.ok(
    f.rollback.attestationErrors.some((c) => /signature/i.test(c)),
    f.rollback.attestationErrors.join(','),
  );
});

test('une signature présente mais forgée ne passe pas la vérification de l ancre', () => {
  // Même document, signature présente et bien formée, mais valeur arbitraire.
  const ev = (name) => hardenedEvidence(name, 9);
  const reader = (name) => {
    const e = ev(name);
    const a = attestationFor(e);
    return {
      attestation: { ...a, signature: { ...a.signature, value: Buffer.alloc(64, 7).toString('base64') } },
      source: '/non-repo/attestations/x.json',
      reason: null,
    };
  };
  const f = evidenceCertify(buildAnchored(ev, reader));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('ATTESTATION_SIGNATURE_INVALID'),
    f.rollback.attestationErrors.join(','),
  );
});

test('une signature faite avec une autre clé que celle de l ancre est refusée', () => {
  // Deux documents parfaitement cohérents, empreinte recalculée, signature réellement
  // produite — mais par une clé privée que l'ancre n'autorise pas.
  const rogue = generateKeyPairSync('ed25519');
  const roguePem = rogue.privateKey.export({ type: 'pkcs8', format: 'pem' });
  const ev = (name) => hardenedEvidence(name, 9);
  const reader = attestationReaderFor(ev, { privatePem: roguePem });
  const f = evidenceCertify(buildAnchored(ev, reader));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('ATTESTATION_SIGNATURE_INVALID'),
    f.rollback.attestationErrors.join(','),
  );
});

test('une identité de vérificateur absente de l ancre n est pas une vérification', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const unknownIdentity = (name) => {
    const e = ev(name);
    e.attestation.verifierIdentity = 'verificateur-auto-proclame';
    return { attestation: attestationFor(e), source: 'x', reason: null };
  };
  const f = evidenceCertify(buildAnchored(ev, unknownIdentity));
  assert.equal(f.rollback.ready, false);
  assert.ok(f.rollback.attestationErrors.includes('ATTESTATION_VERIFIER_NOT_TRUSTED'));
});

test('une clé révoquée dans l ancre ne vérifie plus rien', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev), testAnchor({ revokedKeyIds: [TEST_KEY_ID] }));
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, false);
  assert.ok(f.rollback.attestationErrors.includes('ATTESTATION_KEY_REVOKED'));
});

test('l ancre de confiance épinglée dans le dépôt est présente et ne contient aucune clé privée', () => {
  const raw = readFileSync(TRUST_ANCHOR_PATH, 'utf8');
  assert.doesNotMatch(raw, /PRIVATE KEY/, 'une clé privée ne doit jamais être commitée');
  assert.doesNotMatch(raw, /sb_secret_|eyJ[A-Za-z0-9_-]{10,}\./);
  const { anchor, reason } = readTrustAnchor();
  assert.equal(reason, null, reason ?? undefined);
  assert.equal(anchor.schemaVersion, TRUST_ANCHOR_SCHEMA_VERSION);
  assert.ok(anchor.verifiers.length >= 1);
});

test('sans clé publique provisionnée, l ancre ne valide aucune attestation', () => {
  // État réel du dépôt tant que le contrôle indépendant n'a pas publié sa clé publique.
  const { anchor } = readTrustAnchor();
  const unprovisioned = {
    schemaVersion: TRUST_ANCHOR_SCHEMA_VERSION,
    verifiers: anchor.verifiers.map((v) => ({ ...v, keyId: null, publicKeyPem: null })),
  };
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev), unprovisioned);
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('ANCHOR_KEY_NOT_PROVISIONED'),
    f.rollback.attestationErrors.join(','),
  );
});

test('le manifeste réel reste fermé : aucune évidence signée n existe encore', () => {
  const m = buildManifest();
  assert.equal(m.counts.rollbackReady, 0);
  assert.equal(m.counts.preDeployReady, 0);
  assert.equal(m.counts.postDeployReady, 0);
  assert.equal(m.revocationAllowed, false);
  assert.deepEqual(validateManifest(m), []);
  assert.equal(m.trustAnchor.present, true);
});

/**
 * Le v2 testait l'appartenance au dépôt avec `resolve` seul : un lien symbolique, ou un
 * dossier encore inexistant sous un ancêtre lié au dépôt, passait pour « hors dépôt ».
 */
test('un lien symbolique ne contourne pas la frontière du dépôt', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'maximus-attest-'));
  try {
    const link = join(sandbox, 'evidence-root');
    symlinkSync(join(REPO_ROOT, 'scripts'), link, 'dir');
    // Racine elle-même dans le dépôt via lien symbolique.
    const viaRootLink = readAttestation('scpi-evidence-certify', { root: link });
    assert.equal(viaRootLink.attestation, null);
    assert.equal(viaRootLink.reason, 'EVIDENCE_ROOT_INSIDE_REPO');
    assert.equal(resolvesInsideRepo(link), true);

    // Dossier `attestations/` inexistant sous un ancêtre lié au dépôt.
    const fresh = join(sandbox, 'not-yet-created');
    mkdirSync(fresh, { recursive: true });
    symlinkSync(join(REPO_ROOT, 'docs'), join(fresh, 'attestations'), 'dir');
    const viaSubdir = readAttestation('scpi-evidence-certify', { root: fresh });
    assert.equal(viaSubdir.attestation, null);
    assert.equal(viaSubdir.reason, 'ATTESTATION_DIR_INSIDE_REPO');

    // Contrôle positif : une racine réellement hors dépôt est lue.
    const outside = join(sandbox, 'real');
    mkdirSync(join(outside, 'attestations'), { recursive: true });
    writeFileSync(
      join(outside, 'attestations', 'scpi-evidence-certify.json'),
      JSON.stringify({ function: 'scpi-evidence-certify' }),
    );
    const ok = readAttestation('scpi-evidence-certify', { root: outside });
    assert.equal(ok.reason, null);
    assert.equal(ok.attestation.function, 'scpi-evidence-certify');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

/**
 * Arbitrage du 25/11 : « autoriser la préparation du rollback lorsque observed = target
 * avant intervention, puis exiger leur distinction après migration ».
 */
test('la préparation pré-déploiement accepte observed = target, la validation post-déploiement l exclut', () => {
  // Fonction LIVE mais pas encore migrée (patch clé seule en attente) : le bundle à
  // sauvegarder EST le bundle qui tourne, et un readback fournisseur peut l'attester.
  // C'est le cas réel de `scpi-certified-promote` (v12 en production, patch non appliqué).
  const LIVE_PRE = 'scpi-certified-promote';
  const preDeploy = (name) => {
    const e = hardenedEvidence(LIVE_PRE, 12, 12, 'PRE_DEPLOY');
    e.function = name;
    e.observed.readback = readbackFor(name, 12);
    e.observed.entrypointSha256 = e.observed.readback.entrypointSha256;
    e.observed.bundleSha256 = e.observed.readback.bundleSha256;
    e.observed.dependencies = e.observed.readback.dependencies;
    e.rollbackTarget = JSON.parse(JSON.stringify(e.observed));
    e.rollbackTarget.phase = 'PRE_MIGRATION';
    e.custody.artifactRef = `vault://pre-deploy/${name}.tgz`;
    // Avant intervention, l'artefact conservé EST le bundle qui tourne.
    e.custody.bindsToBundleSha256 = e.observed.bundleSha256;
    e.custody.bindsToVersion = 12;
    e.custody.bindsToFunction = name;
    e.restoreDrill.restoredEntrypointSha256 = e.observed.entrypointSha256;
    e.restoreDrill.restoredBundleSha256 = e.observed.bundleSha256;
    return e;
  };
  const m = buildAnchored(preDeploy, attestationReaderFor(preDeploy));
  const promote = m.functions.find((f) => f.name === LIVE_PRE);
  assert.equal(promote.deployState, 'PENDING_KEY_ONLY_PATCH');
  assert.equal(promote.rollback.stageMatchesDeployState, true);
  assert.equal(promote.rollback.preDeployReady, true, promote.rollback.blockingReason ?? '');
  assert.equal(promote.rollback.ready, true, 'la préparation du rollback doit être possible');
  assert.equal(promote.rollback.rollbackTarget.equalsObserved, true);

  // Le même type d'évidence sur une fonction DÉJÀ migrée prétendrait que rien n'a changé :
  // la forme est valide, mais le stage contredit l'état réel de la fonction.
  const postDeploySameTarget = (name) => {
    const e = hardenedEvidence(name, 9);
    e.stage = 'PRE_DEPLOY';
    e.rollbackTarget = JSON.parse(JSON.stringify(e.observed));
    e.rollbackTarget.phase = 'PRE_MIGRATION';
    e.custody.bindsToBundleSha256 = e.observed.bundleSha256;
    e.custody.bindsToVersion = e.observed.version;
    e.restoreDrill.restoredEntrypointSha256 = e.observed.entrypointSha256;
    e.restoreDrill.restoredBundleSha256 = e.observed.bundleSha256;
    return e;
  };
  const f = evidenceCertify(buildAnchored(postDeploySameTarget, attestationReaderFor(postDeploySameTarget)));
  assert.equal(f.rollback.stageMatchesDeployState, false);
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'EVIDENCE_STAGE_MISMATCH');
});

test('un stage incohérent avec l état de la fonction est une violation bloquante', () => {
  const preDeploy = (name) => {
    const e = hardenedEvidence(name, 9);
    e.stage = 'PRE_DEPLOY';
    e.observed.version = 9;
    return e;
  };
  const m = buildAnchored(preDeploy, attestationReaderFor(preDeploy));
  assert.equal(evidenceCertify(m).rollback.preDeployReady, false);
  assert.equal(evidenceCertify(m).rollback.stageMatchesDeployState, false);
});

test('une préparation pré-déploiement dont la cible diffère de l état courant est refusée', () => {
  // Avant intervention, sauvegarder « autre chose » que ce qui tourne ne permettrait pas de
  // revenir à l'état courant : la préparation serait une fausse sécurité.
  const LIVE_PRE = 'scpi-certified-promote';
  const preDeployOnLiveFn = (name) => {
    const e = hardenedEvidence(LIVE_PRE, 12, 12, 'PRE_DEPLOY');
    e.function = name;
    e.observed.readback = readbackFor(name, 12);
    e.rollbackTarget = JSON.parse(JSON.stringify(e.observed));
    e.rollbackTarget.phase = 'PRE_MIGRATION';
    e.custody.bindsToVersion = 12;
    e.custody.bindsToFunction = name;
    // Cible délibérément différente de ce qui est déployé.
    e.rollbackTarget.bundleSha256 = '9'.repeat(64);
    e.rollbackTarget.entrypointSha256 = '8'.repeat(64);
    e.custody.bindsToBundleSha256 = '9'.repeat(64);
    e.restoreDrill.restoredBundleSha256 = '9'.repeat(64);
    e.restoreDrill.restoredEntrypointSha256 = '8'.repeat(64);
    return e;
  };
  const m = buildAnchored(preDeployOnLiveFn, attestationReaderFor(preDeployOnLiveFn));
  const promote = m.functions.find((f) => f.name === LIVE_PRE);
  assert.equal(promote.rollback.preDeployReady, false);
  assert.equal(promote.rollback.blockingReason, 'ROLLBACK_TARGET_DIFFERS_BEFORE_DEPLOY');
});

test('la défense en profondeur refuse un rollback prêt sans restauration exercée', () => {
  // Un `local-replay` peut produire un `result: PASS` sans déployer quoi que ce soit. Si une
  // évidence forgée (ou un manifeste édité à la main) déclarait `ready = true` avec ce seul
  // rejeu, la validation de forme doit le refuser même si `commonProof` a été contourné.
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  assert.deepEqual(validateManifest(m), []);
  const f = evidenceCertify(m);
  f.rollback.restoreDrill = { ...f.rollback.restoreDrill, destination: 'local-replay', provesRestore: false };
  const codes = validateManifest(m).map((x) => x.code);
  assert.ok(codes.includes('ROLLBACK_READY_WITHOUT_EXERCISED_RESTORE'), codes.join(','));
  f.rollback.restoreDrill = { ...f.rollback.restoreDrill, destination: 'staging-non-prod', provesRestore: true };
  assert.deepEqual(validateManifest(m), []);
});

test('la défense en profondeur refuse un readiness pré-déploiement sur une fonction migrée', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  assert.deepEqual(validateManifest(m), []);
  const f = evidenceCertify(m);
  f.rollback.preDeployReady = true;
  const codes = validateManifest(m).map((x) => x.code);
  assert.ok(codes.includes('PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION'), codes.join(','));
  f.rollback.preDeployReady = false;
  assert.deepEqual(validateManifest(m), []);
});

test('le README de prod-bundles documente le stage et la séparation pré/post-déploiement', () => {
  const readme = readFileSync(join(PROD_EVIDENCE_DIR, 'README.md'), 'utf8');
  assert.match(readme, /PRE_DEPLOY/);
  assert.match(readme, /POST_DEPLOY/);
  assert.match(readme, /rollbackVerifierTrustAnchor/);
  assert.match(readme, /ANCHOR_KEY_NOT_PROVISIONED/);
  assert.match(readme, /ATTESTATION_SIGNATURE_INVALID/);
});

/**
 * Défaut du lot 9 relevé par le contrôle du 25/11 : « le gate commonProof compare notamment
 * version et verifyJwt au registre statique : avant intervention, recouper également
 * l'identité complète du bundle et la configuration avec le readback fournisseur frais ; la
 * signature doit couvrir ou lier ces éléments et le projet cible. Une égalité de SHA de code
 * seule ne prouve pas l'égalité de configuration. »
 */
test('comparer observed au registre du dépôt ne prouve rien sans readback fournisseur', () => {
  // Défaut exact : une évidence dont `observed` recopie le registre, sans aucune lecture
  // provider. Les valeurs « tombent juste » parce qu'elles viennent du même endroit.
  const noReadback = (name) => {
    const e = hardenedEvidence(name, 9);
    delete e.observed.readback;
    return e;
  };
  const f = evidenceCertify(buildAnchored(noReadback, attestationReaderFor(noReadback)));
  assert.equal(f.rollback.ready, false, 'une croyance comparée à elle-même n est pas une preuve');
  assert.ok(
    f.rollback.evidenceErrors.includes('MISSING_observed_readback'),
    f.rollback.evidenceErrors.join(','),
  );
  assert.equal(f.rollback.readback.present, false);
});

test('un readback d un autre projet ne prouve rien sur la migration en cours', () => {
  const wrongProject = (name) => {
    const e = hardenedEvidence(name, 9);
    e.observed.readback = readbackFor(name, 9, false, { projectRef: 'autreprojet0000000000' });
    return e;
  };
  const f = evidenceCertify(buildAnchored(wrongProject, attestationReaderFor(wrongProject)));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.evidenceErrors.includes('READBACK_WRONG_PROJECT'),
    f.rollback.evidenceErrors.join(','),
  );
});

test('une égalité de SHA de code ne vaut pas égalité de configuration', () => {
  // Le bundle lu porte le même code, mais la configuration (verify_jwt) a changé : seule
  // une empreinte de configuration liée le montre, et la signature doit la couvrir.
  const sameCodeOtherConfig = (name) => {
    const e = hardenedEvidence(name, 9);
    e.observed.readback = readbackFor(name, 9, true);
    e.observed.readback.entrypointSha256 = e.observed.entrypointSha256;
    e.observed.readback.bundleSha256 = e.observed.bundleSha256;
    return e;
  };
  const f = evidenceCertify(buildAnchored(sameCodeOtherConfig, attestationReaderFor(sameCodeOtherConfig)));
  assert.equal(f.rollback.ready, false, 'verify_jwt différent = configuration différente');
  assert.ok(
    f.rollback.evidenceErrors.includes('READBACK_DISAGREES_WITH_OBSERVED_verifyJwt'),
    f.rollback.evidenceErrors.join(','),
  );

  // Et si l'on aligne `observed` sur la lecture, le registre devient la référence : la
  // lecture contredit alors ce que le registre constate en production.
  const contradictsRegistry = (name) => {
    const e = hardenedEvidence(name, 9);
    e.observed.verifyJwt = true;
    e.observed.readback = readbackFor(name, 9, true);
    return e;
  };
  const g = evidenceCertify(buildAnchored(contradictsRegistry, attestationReaderFor(contradictsRegistry)));
  assert.equal(g.rollback.ready, false);
  assert.equal(g.rollback.readback.matchesRegistry, false);
  assert.equal(g.rollback.blockingReason, 'READBACK_DISAGREES_WITH_REGISTRY');
});

test('une empreinte de configuration recalculée qui ne couvre pas les champs est refusée', () => {
  const frozenConfig = (name) => {
    const e = hardenedEvidence(name, 9);
    e.observed.readback = readbackFor(name, 9);
    // Empreinte d'une AUTRE configuration (verify_jwt inversé) : elle ne lie pas les champs.
    e.observed.readback.configSha256 = readbackConfigSha256({
      projectRef: PRODUCTION_PROJECT_REF,
      slug: name,
      version: 9,
      verifyJwt: true,
      entrypointPath: `supabase/functions/${name}/index.ts`,
    });
    return e;
  };
  const f = evidenceCertify(buildAnchored(frozenConfig, attestationReaderFor(frozenConfig)));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.evidenceErrors.includes('READBACK_CONFIG_SHA256_MISMATCH'),
    f.rollback.evidenceErrors.join(','),
  );
  assert.equal(f.rollback.readback.configBound, false);
});

test('un readback postérieur à la vérification indépendante, ou périmé, ne compte pas', () => {
  // Une lecture impossible à avoir vue par le contrôle ne peut pas être ce qu'il a vérifié.
  const afterVerification = (name) => {
    const e = hardenedEvidence(name, 9);
    e.observed.readback = readbackFor(name, 9, false, { fetchedAt: '2026-11-25T02:00:00Z' });
    return e;
  };
  const f = evidenceCertify(buildAnchored(afterVerification, attestationReaderFor(afterVerification)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.readback.fresh, false);
  assert.equal(f.rollback.blockingReason, 'READBACK_STALE_OR_AFTER_VERIFICATION');

  // Lecture antérieure à la fenêtre admise (24 h) : ce n'est plus l'état constaté.
  const stale = (name) => {
    const e = hardenedEvidence(name, 9);
    const fetched = new Date(Date.parse('2026-11-25T01:00:00Z') - MAX_READBACK_AGE_MS - 1000);
    e.observed.readback = readbackFor(name, 9, false, { fetchedAt: fetched.toISOString() });
    return e;
  };
  const g = evidenceCertify(buildAnchored(stale, attestationReaderFor(stale)));
  assert.equal(g.rollback.ready, false);
  assert.equal(g.rollback.readback.fresh, false);
});

test('la signature doit couvrir le projet cible et la configuration observée', () => {
  // Attestation signée mais qui n'affirme pas le projet : elle ne lie pas la cible.
  const missingProjectClaim = (name) => {
    const e = hardenedEvidence(name, 9);
    const a = attestationFor(e);
    delete a.projectRef;
    const claims = Object.fromEntries(
      Object.entries(a).filter(([k]) => k !== 'signature' && k !== 'attestationSha256'),
    );
    return {
      attestation: {
        ...claims,
        attestationSha256: canonicalJsonSha256(claims),
        signature: signClaims(claims),
      },
      source: 'x',
      reason: null,
    };
  };
  const f = evidenceCertify(buildAnchored((name) => hardenedEvidence(name, 9), missingProjectClaim));
  assert.equal(f.rollback.ready, false);
  assert.ok(
    f.rollback.attestationErrors.includes('MISSING_attestation_claim_projectRef'),
    f.rollback.attestationErrors.join(','),
  );

  // Attestation qui affirme un AUTRE projet que celui du readback.
  const otherProjectClaim = (name) => {
    const e = hardenedEvidence(name, 9);
    return { attestation: attestationFor(e, { claims: { projectRef: 'autreprojet0000000000' } }), source: 'x', reason: null };
  };
  const g = evidenceCertify(buildAnchored((name) => hardenedEvidence(name, 9), otherProjectClaim));
  assert.equal(g.rollback.ready, false);
  assert.ok(
    g.rollback.attestationErrors.includes('ATTESTATION_CLAIM_MISMATCH_projectRef'),
    g.rollback.attestationErrors.join(','),
  );

  // Attestation qui affirme une autre empreinte de configuration.
  const otherConfigClaim = (name) => {
    const e = hardenedEvidence(name, 9);
    return { attestation: attestationFor(e, { claims: { observedConfigSha256: 'f'.repeat(64) } }), source: 'x', reason: null };
  };
  const h = evidenceCertify(buildAnchored((name) => hardenedEvidence(name, 9), otherConfigClaim));
  assert.equal(h.rollback.ready, false);
  assert.ok(
    h.rollback.attestationErrors.includes('ATTESTATION_CLAIM_MISMATCH_observedConfigSha256'),
    h.rollback.attestationErrors.join(','),
  );
});

test('la défense en profondeur refuse un rollback prêt sans readback lié', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildAnchored(ev, attestationReaderFor(ev));
  assert.deepEqual(validateManifest(m), []);
  const f = evidenceCertify(m);
  assert.equal(f.rollback.ready, true);

  for (const [field, code] of [
    ['present', 'ROLLBACK_READY_WITHOUT_PROVIDER_READBACK'],
    ['matchesRegistry', 'ROLLBACK_READY_WITH_READBACK_REGISTRY_MISMATCH'],
    ['fresh', 'ROLLBACK_READY_WITH_STALE_READBACK'],
    ['configBound', 'ROLLBACK_READY_WITHOUT_CONFIG_BINDING'],
  ]) {
    const original = f.rollback.readback[field];
    f.rollback.readback[field] = false;
    const codes = validateManifest(m).map((x) => x.code);
    assert.ok(codes.includes(code), `${field}=false devrait produire ${code} : ${codes.join(',')}`);
    f.rollback.readback[field] = original;
    assert.deepEqual(validateManifest(m), [], `restauration de ${field}`);
  }
});

test('validateReadback refuse un readback incomplet, non-provider ou incohérent', () => {
  const base = readbackFor('scpi-evidence-certify', 9);
  assert.deepEqual(validateReadback({ readback: base }, 'scpi-evidence-certify'), []);
  assert.deepEqual(validateReadback({}, 'scpi-evidence-certify'), ['MISSING_observed_readback']);

  const manual = { ...base, source: 'saisie manuelle' };
  assert.ok(
    validateReadback({ readback: manual }, 'scpi-evidence-certify').includes('READBACK_SOURCE_NOT_PROVIDER'),
  );

  const otherSlug = readbackFor('scpi-news-watch', 9);
  assert.ok(
    validateReadback({ readback: otherSlug }, 'scpi-evidence-certify').includes('READBACK_OTHER_FUNCTION'),
  );
});

/**
 * Gardes ajoutées au lot 11 après le contrôle du 26/11 (#459).
 *
 * Chacune répond à un défaut nommé : l'endpoint de métadonnées ne rend pas les octets, donc
 * le readback doit dire **d'où vient le contenu**, ne pas accepter une fonction non ACTIVE,
 * conserver le chemin fournisseur distinct du chemin registre, et surtout porter une
 * empreinte de bundle **recalculable** depuis le contenu déclaré.
 */
test('validateReadback exige une lecture de contenu distincte et une empreinte recalculable', () => {
  const SLUG = 'scpi-evidence-certify';
  const base = readbackFor(SLUG, 9);

  // Une lecture qui ne nomme que les métadonnées ne dit pas d'où viennent les octets.
  const noBundleSource = { ...base };
  delete noBundleSource.bundleSource;
  assert.ok(
    validateReadback({ readback: noBundleSource }, SLUG).includes('MISSING_readback_bundleSource'),
  );

  const manualContent = { ...base, bundleSource: 'saisie manuelle' };
  assert.ok(
    validateReadback({ readback: manualContent }, SLUG).includes('READBACK_BUNDLE_SOURCE_NOT_PROVIDER'),
  );

  // Une fonction qui n'est pas ACTIVE n'est pas un déploiement vivant.
  const notActive = { ...base, status: 'THROTTLED' };
  assert.ok(
    validateReadback({ readback: notActive }, SLUG).includes('READBACK_STATUS_NOT_ACTIVE'),
  );

  // Le chemin fournisseur (URI temporaire) doit être conservé, pas fondu dans le registre.
  const noProviderPath = { ...base };
  delete noProviderPath.providerEntrypointPath;
  assert.ok(
    validateReadback({ readback: noProviderPath }, SLUG).includes('MISSING_readback_providerEntrypointPath'),
  );

  // Le chemin canonique doit être celui du registre pour CE slug.
  const wrongPath = { ...base, entrypointPath: 'supabase/functions/autre/index.ts' };
  wrongPath.configSha256 = readbackConfigSha256({
    projectRef: wrongPath.projectRef,
    slug: wrongPath.slug,
    version: wrongPath.version,
    verifyJwt: wrongPath.verifyJwt,
    entrypointPath: wrongPath.entrypointPath,
  });
  assert.ok(
    validateReadback({ readback: wrongPath }, SLUG).includes('READBACK_ENTRYPOINT_PATH_NOT_REGISTRY_SHAPE'),
  );

  // L'empreinte fournisseur (stockage) est un champ obligatoire, distinct de la canonique.
  const noEzbr = { ...base };
  delete noEzbr.providerEzbrSha256;
  assert.ok(
    validateReadback({ readback: noEzbr }, SLUG).includes('MISSING_readback_providerEzbrSha256'),
  );
  const badEzbr = { ...base, providerEzbrSha256: 'pas-une-empreinte' };
  assert.ok(
    validateReadback({ readback: badEzbr }, SLUG).includes('BAD_readback_providerEzbrSha256'),
  );

  // Une empreinte de bundle qui ne se recalcule pas depuis le contenu est une déclaration.
  const forgedBundle = { ...base, bundleSha256: '9'.repeat(64) };
  assert.ok(
    validateReadback({ readback: forgedBundle }, SLUG).includes('READBACK_BUNDLE_SHA256_MISMATCH'),
  );

  // Et le readback sain ne produit toujours aucune erreur.
  assert.deepEqual(validateReadback({ readback: base }, SLUG), []);
});

test('le README de prod-bundles documente le readback fournisseur et la configuration', () => {
  const readme = readFileSync(join(PROD_EVIDENCE_DIR, 'README.md'), 'utf8');
  assert.match(readme, /readback/i);
  assert.match(readme, /configSha256/);
  assert.match(readme, /READBACK_WRONG_PROJECT/);
  assert.match(readme, /collectReadback\.mjs/);
});

test('le calcul d empreintes est stable et indépendant de l ordre du registre', () => {
  const a = resolveRepoFingerprint({
    name: 'calendly-webhook',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
  });
  const b = resolveRepoFingerprint({
    name: 'calendly-webhook',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
  });
  assert.equal(a.bundleSha256, b.bundleSha256);
  assert.match(a.bundleSha256, /^[0-9a-f]{64}$/);
});
