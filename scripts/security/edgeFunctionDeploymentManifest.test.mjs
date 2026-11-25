import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildManifest,
  validateManifest,
  ledgerSnapshot,
  declaredImports,
  resolveRepoFingerprint,
  validateProdEvidence,
  crossCheckAttestation,
  readAttestation,
  canonicalJsonSha256,
  INITIAL_PERIMETER_SIZE,
  LEDGER_PATH,
  PROD_EVIDENCE_DIR,
  FUNCTIONS_DIR,
  REPO_ROOT,
  EVIDENCE_SCHEMA_VERSION,
  ATTESTATION_SCHEMA_VERSION,
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
 * Évidence v2 : identité constatée + bundle de ROLLBACK distinct (pré-migration) + garde
 * liée à ce bundle + restauration testée hors prod, avec journal.
 */
const hardenedEvidence = (name, observedVersion, targetVersion = observedVersion - 1) => ({
  schemaVersion: EVIDENCE_SCHEMA_VERSION,
  function: name,
  observed: {
    version: observedVersion,
    verifyJwt: false,
    entrypointSha256: 'a'.repeat(64),
    dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
    bundleSha256: 'c'.repeat(64),
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
    destination: 'local-replay',
    result: 'PASS',
    journalRef: '/var/lib/maximus/restore-drills/scpi-evidence-certify.log',
    journalSha256: 'e'.repeat(64),
    restoredEntrypointSha256: '1'.repeat(64),
    restoredBundleSha256: '2'.repeat(64),
  },
  attestation: {
    schemaVersion: ATTESTATION_SCHEMA_VERSION,
    verifier: 'independent-control',
    verifierIdentity: 'chatgpt-independent-reviewer',
    attestationSha256: 'PENDING',
  },
});

/**
 * Attestation externe cohérente : elle confirme l'évidence champ par champ, et se déclare
 * indépendante de l'opérateur. C'est ce que la racine hors dépôt contiendrait réellement.
 */
const attestationFor = (evidence) => {
  const claims = {
    schemaVersion: ATTESTATION_SCHEMA_VERSION,
    function: evidence.function,
    observedBundleSha256: evidence.observed.bundleSha256,
    rollbackTargetBundleSha256: evidence.rollbackTarget.bundleSha256,
    custodyArtifactSha256: evidence.custody.artifactSha256,
    custodyArtifactRef: evidence.custody.artifactRef,
    restoreJournalSha256: evidence.restoreDrill.journalSha256,
    restoredBundleSha256: evidence.restoreDrill.restoredBundleSha256,
    restoreDestination: evidence.restoreDrill.destination,
    restoreResult: evidence.restoreDrill.result,
    verifier: evidence.attestation.verifier,
    verifierIdentity: evidence.attestation.verifierIdentity,
    operator: evidence.restoreDrill.performedBy,
    independentOfOperator: true,
    verifiedAt: '2026-11-25T01:00:00Z',
  };
  return { ...claims, attestationSha256: canonicalJsonSha256(claims) };
};

/** Lecteur d'attestation qui répond avec une attestation liée à l'évidence fournie. */
const attestationReaderFor = (evidenceFn) => (name) => {
  const ev = evidenceFn(name);
  return {
    attestation: ev ? attestationFor(ev) : null,
    source: `/non-repo/attestations/${name}.json`,
    reason: ev ? null : 'ATTESTATION_MISSING',
  };
};

const evidenceCertify = (m) => m.functions.find((f) => f.name === 'scpi-evidence-certify');

test('une évidence v2 vérifiée indépendamment rend le rollback calculable', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildManifest(ev, attestationReaderFor(ev));
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
  const m = buildManifest(ev, noAttestation);
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
  const f = evidenceCertify(buildManifest(ev, tampered));
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
  const f = evidenceCertify(buildManifest(ev, broken));
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
  const f = evidenceCertify(buildManifest(() => selfEv, selfVerified));
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
  const g = evidenceCertify(buildManifest(ev, notIndependent));
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

test('des empreintes seules ne sont JAMAIS une sauvegarde restaurable', () => {
  // Exactement l'évidence que produisait le lot 6 : identité complète, aucune garde.
  const fingerprintsOnly = (name) => ({
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    function: name,
    observed: {
      version: 9,
      verifyJwt: false,
      entrypointSha256: 'a'.repeat(64),
      dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
      bundleSha256: 'c'.repeat(64),
    },
  });
  const m = buildManifest(fingerprintsOnly, noAttestation);
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
  const f = evidenceCertify(buildManifest(postMigration, attestationReaderFor(postMigration)));
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
  const f = evidenceCertify(buildManifest(notPreMigration, attestationReaderFor(notPreMigration)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'ROLLBACK_TARGET_NOT_PRE_MIGRATION');
});

test('une garde non liée à la fonction, la version ou le bundle est rejetée', () => {
  const wrongFn = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToFunction = 'autre-fonction';
    return e;
  };
  const f1 = evidenceCertify(buildManifest(wrongFn, attestationReaderFor(wrongFn)));
  assert.equal(f1.rollback.ready, false);
  assert.equal(f1.rollback.blockingReason, 'CUSTODY_BINDS_OTHER_FUNCTION');

  const wrongBundle = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToBundleSha256 = 'f'.repeat(64);
    return e;
  };
  const f2 = evidenceCertify(buildManifest(wrongBundle, attestationReaderFor(wrongBundle)));
  assert.equal(f2.rollback.ready, false);
  assert.equal(f2.rollback.blockingReason, 'CUSTODY_BINDS_OTHER_BUNDLE');

  const wrongVersion = (name) => {
    const e = hardenedEvidence(name, 9);
    e.custody.bindsToVersion = 4;
    return e;
  };
  const f3 = evidenceCertify(buildManifest(wrongVersion, attestationReaderFor(wrongVersion)));
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
    const f = evidenceCertify(buildManifest(ev, attestationReaderFor(ev)));
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
  const f = evidenceCertify(buildManifest(notRestorable, attestationReaderFor(notRestorable)));
  assert.equal(f.rollback.ready, false);
  assert.equal(f.rollback.blockingReason, 'CUSTODY_NOT_RESTORABLE');
});

test('un rollback prêt sans preuve exigée est une violation bloquante', () => {
  const ev = (name) => hardenedEvidence(name, 9);
  const m = buildManifest(ev, attestationReaderFor(ev));
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
  const m = buildManifest(ev, attestationReaderFor(ev));
  const bulletin = m.functions.find((f) => f.name === 'scpi-bulletin-watch');
  assert.equal(bulletin.rollback.ready, false);
  assert.equal(bulletin.rollback.blockingReason, 'PROD_DEPENDENCY_FINGERPRINT_MISSING');
});

test('une évidence incohérente avec la version constatée n ouvre pas le rollback', () => {
  const wrongVersion = (name) => hardenedEvidence(name, 999);
  const m = buildManifest(wrongVersion, attestationReaderFor(wrongVersion));
  assert.equal(m.functions.every((f) => f.rollback.ready === false), true);
});

test('l évidence de production rejette une forme incomplète ou malformée', () => {
  assert.deepEqual(validateProdEvidence({}), [
    'MISSING_schemaVersion',
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
