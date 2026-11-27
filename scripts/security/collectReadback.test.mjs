import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  readbackFromProviderReads,
  parseMultipartFunctionBody,
  normalizeBundlePaths,
  bundleFingerprintFromEntries,
  mergeReadbackIntoEvidence,
  fetchReadback,
  readbackFromManagementApi,
  captureProviderArtifact,
  assertEvidenceRootOutsideRepo,
  identityFromBodyMetadata,
} from './collectReadback.mjs';
import {
  PRODUCTION_PROJECT_REF,
  readbackConfigSha256,
  validateReadback,
  EVIDENCE_SCHEMA_VERSION,
} from './edgeFunctionDeploymentManifest.mjs';
import {
  redactedMetadata,
  redactedBody,
  redactedBodyMetadata,
  buildRedactedMultipartBody,
  REDACTED_BODY_CONTENT_TYPE,
  REDACTED_FILES_FOR_TEST,
} from './fixtures/providerFunctionBody.mjs';

const SLUG = 'scpi-certified-promote';

/** Readback produit depuis la réponse fournisseur expurgée, au format réel. */
const readbackFromRedacted = (metaOverrides = {}, bodyOptions = {}) => {
  const meta = redactedMetadata(metaOverrides);
  const body = redactedBody(bodyOptions);
  return readbackFromProviderReads({
    metadata: meta,
    body: parseMultipartFunctionBody(body.buffer, body.contentType),
    requestedSlug: meta.slug ?? SLUG,
  }, { fetchedAt: '2026-11-25T00:30:00Z' });
};

// ---------------------------------------------------------------------------
// Défaut 1 du 26/11 : l'endpoint de métadonnées ne rend aucun contenu.
// ---------------------------------------------------------------------------

test('les métadonnées seules ne suffisent pas : le readback exige la lecture du bundle', () => {
  // `GET /functions/{slug}` ne rend ni `files` ni octets. Un collecteur qui n'aurait lu que
  // cet endpoint produirait une empreinte plausible sur un contenu qu'il n'a jamais vu.
  assert.throws(
    () => readbackFromProviderReads({ metadata: redactedMetadata() }, { fetchedAt: '2026-11-25T00:30:00Z' }),
    /READBACK_WITHOUT_BUNDLE_READ/,
  );
});

test('l ancien point d entrée échoue explicitement au lieu de faire semblant de collecter', () => {
  assert.throws(() => readbackFromManagementApi({ slate: SLUG }), /READBACK_REQUIRES_BUNDLE_READ/);
});

test('la réponse multipart réelle est découpée en métadonnées et fichiers', () => {
  const body = redactedBody();
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  // La partie `metadata` réelle ne publie ni slug ni version : l'identité vient de
  // `deployment_id` et de l'entrypoint, et c'est elle que la collecte doit lire.
  assert.equal(parsed.metadata.slug, undefined);
  assert.equal(parsed.metadata.version, undefined);
  const identity = identityFromBodyMetadata(parsed.metadata);
  assert.equal(identity.slug, SLUG);
  assert.equal(identity.version, 12);
  assert.equal(identity.projectRef, 'ygvsddcpohsnaowofuwc');
  assert.equal(parsed.files.length, REDACTED_FILES_FOR_TEST.length);
  // Le corps conserve les chemins du fournisseur : c'est la normalisation qui les ramènera
  // à la convention du registre, pas un découpage complaisant.
  assert.ok(parsed.files.every((f) => f.name.startsWith('source/')));
});

// ---------------------------------------------------------------------------
// Défaut 2 du 26/11 : correspondance unique de l'entrypoint, slug demandé vérifié.
// ---------------------------------------------------------------------------

test('un readback complet produit une identité exploitable et recalculable', () => {
  const rb = readbackFromRedacted();
  assert.equal(rb.projectRef, PRODUCTION_PROJECT_REF);
  assert.equal(rb.slug, SLUG);
  assert.equal(rb.status, 'ACTIVE');
  assert.equal(rb.version, 12);
  assert.equal(rb.verifyJwt, false);
  // Chemin fournisseur conservé pour la traçabilité, chemin registre distinct.
  assert.equal(rb.providerEntrypointPath, redactedMetadata().entrypoint_path);
  assert.equal(rb.entrypointPath, `${SLUG}/index.ts`);
  assert.match(rb.entrypointSha256, /^[0-9a-f]{64}$/);
  assert.match(rb.bundleSha256, /^[0-9a-f]{64}$/);
  assert.match(rb.configSha256, /^[0-9a-f]{64}$/);
  // L'empreinte de configuration lie EXACTEMENT les champs qu'elle prétend couvrir.
  assert.equal(rb.configSha256, readbackConfigSha256({
    projectRef: rb.projectRef,
    slug: rb.slug,
    version: rb.version,
    verifyJwt: rb.verifyJwt,
    entrypointPath: rb.entrypointPath,
  }));
  // L'empreinte fournisseur (stockage) n'est PAS l'empreinte canonique du manifeste.
  assert.notEqual(rb.providerEzbrSha256, rb.bundleSha256);
});

test('la provenance nomme le projet réellement lu, jamais la production par défaut', () => {
  // Défaut : un readback d'un projet jetable étiqueté « production » désigne un autre objet
  // que celui qu'il décrit. Un sceau ou un journal de restauration bâti dessus est faux.
  const disposable = 'disposable-project-ref-0001';
  const meta = redactedMetadata();
  const body = redactedBody({
    metadata: redactedBodyMetadata({
      deployment_id: `${disposable}_redacted-deployment-uuid_12`,
    }),
  });
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  const rb = readbackFromProviderReads(
    { metadata: meta, body: parsed, requestedSlug: meta.slug },
    { projectRef: disposable, fetchedAt: '2026-11-26T10:00:00Z' },
  );
  assert.equal(rb.projectRef, disposable);
  assert.ok(rb.source.includes(disposable), `source non liée au projet lu : ${rb.source}`);
  assert.ok(rb.bundleSource.includes(disposable), `bundleSource non liée : ${rb.bundleSource}`);
  assert.ok(!rb.source.includes(PRODUCTION_PROJECT_REF));
  assert.ok(!rb.bundleSource.includes(PRODUCTION_PROJECT_REF));
  // La provenance reste celle d'un endpoint fournisseur reconnu (le gate la valide ainsi).
  assert.match(rb.source, /^supabase-management-api:/);
  assert.match(rb.bundleSource, /^supabase-management-api:/);
});

test('un readback cohérent passe la validation de forme du manifeste', () => {
  const rb = readbackFromRedacted();
  const observed = {
    version: rb.version,
    verifyJwt: rb.verifyJwt,
    entrypointSha256: rb.entrypointSha256,
    dependencies: rb.dependencies,
    bundleSha256: rb.bundleSha256,
    readback: rb,
  };
  assert.deepEqual(validateReadback(observed, SLUG), []);
});

test('un body servi pour une autre version que les métadonnées est refusé', () => {
  // Lier la version 12 lue en métadonnées à des octets servis pour la version 11 serait
  // exactement le défaut que le collecteur doit rendre impossible.
  const body = redactedBody({
    metadata: redactedBodyMetadata({ deployment_id: 'ygvsddcpohsnaowofuwc_redacted-deployment-uuid_11' }),
  });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_BODY_VERSION_MISMATCH/,
  );
});

test('un body servi pour une autre fonction est refusé', () => {
  const body = redactedBody({
    metadata: redactedBodyMetadata({ deno2_entrypoint_path: 'source/scpi-news-watch/index.ts' }),
  });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_BODY_SLUG_MISMATCH/,
  );
});

test('une lecture qui ne décrit pas le slug demandé est refusée', () => {
  const body = redactedBody();
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: 'scpi-news-watch',
    }),
    /READBACK_OTHER_FUNCTION/,
  );
});

test('un entrypoint absent du corps échoue au lieu de retomber sur un index.ts quelconque', () => {
  const files = REDACTED_FILES_FOR_TEST.filter((f) => !f.name.endsWith('/index.ts'));
  const body = redactedBody({ files });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_ENTRYPOINT_NOT_IN_BODY/,
  );
});

test('deux candidats entrypoint rendent la correspondance ambiguë et bloquante', () => {
  // Deux `index.ts` sous la racine du bundle : impossible de désigner l'entrypoint sans
  // deviner. Le collecteur refuse plutôt que d'en choisir un au hasard.
  const files = [
    ...REDACTED_FILES_FOR_TEST,
    {
      name: 'source/index.ts',
      content: '// REDACTED — doublon de l entrypoint\n',
    },
  ];
  const body = redactedBody({ files });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_ENTRYPOINT_AMBIGUOUS|READBACK_DUPLICATE_DEPENDENCY_PATH|PROVIDER_PATH_NOT_NORMALIZABLE/,
  );
});

// ---------------------------------------------------------------------------
// Défaut 3 du 26/11 : aucun fichier n'est haché comme du vide.
// ---------------------------------------------------------------------------

test('une dépendance sans contenu échoue au lieu d être hachée comme une chaîne vide', () => {
  const files = REDACTED_FILES_FOR_TEST.map((f) => (
    f.name.endsWith('/matcher.mjs') ? { ...f, content: '' } : f
  ));
  const body = redactedBody({ files });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_FILE_WITHOUT_CONTENT/,
  );
});

test('un entrypoint vide est refusé même si le fichier est présent', () => {
  const files = REDACTED_FILES_FOR_TEST.map((f) => (
    f.name.endsWith('/index.ts') ? { ...f, content: '' } : f
  ));
  const body = redactedBody({ files });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_ENTRYPOINT_CONTENT_EMPTY/,
  );
});

test('un corps sans aucun fichier échoue explicitement', () => {
  const body = redactedBody({ files: [] });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_PAYLOAD_WITHOUT_ENTRYPOINT_CONTENT/,
  );
});

// ---------------------------------------------------------------------------
// Défaut 4 du 26/11 : normalisation explicite des chemins fournisseur.
// ---------------------------------------------------------------------------

test('les URI temporaires du fournisseur sont ramenées à la convention du registre', () => {
  const root = '/tmp/user_fn_ygvsddcpohsnaowofuwc_redacted_12/source';
  const mapping = normalizeBundlePaths({
    entrypointProviderPath: `file://${root}/index.ts`,
    filePaths: [
      `file://${root}/index.ts`,
      `file://${root}/matcher.mjs`,
      `file://${root}/_shared/serviceKey.ts`,
    ],
    slug: SLUG,
  });
  assert.equal(mapping.get(`file://${root}/index.ts`), `${SLUG}/index.ts`);
  // Une dépendance locale reste sous le slug…
  assert.equal(mapping.get(`file://${root}/matcher.mjs`), `${SLUG}/matcher.mjs`);
  // …alors qu'une dépendance partagée vit à la racine du bundle, sans le slug.
  assert.equal(mapping.get(`file://${root}/_shared/serviceKey.ts`), '_shared/serviceKey.ts');
});

test('un chemin fournisseur qu on ne sait pas placer est refusé, jamais deviné', () => {
  assert.throws(
    () => normalizeBundlePaths({
      entrypointProviderPath: 'file:///tmp/a/source/index.ts',
      filePaths: ['file:///tmp/a/source/index.ts', 'file:///tmp/ailleurs/inconnu.mjs'],
      slug: SLUG,
    }),
    /PROVIDER_PATH_NOT_NORMALIZABLE/,
  );
});

test('un chemin qui remonte hors du bundle est refusé', () => {
  assert.throws(
    () => normalizeBundlePaths({
      entrypointProviderPath: 'file:///tmp/a/source/index.ts',
      filePaths: ['file:///tmp/a/source/index.ts', 'file:///tmp/a/source/../../secret.mjs'],
      slug: SLUG,
    }),
    /PROVIDER_PATH_NOT_NORMALIZABLE/,
  );
});

test('deux fichiers qui se normalisent sur le même chemin sont refusés', () => {
  const files = [
    ...REDACTED_FILES_FOR_TEST,
    // Même chemin registre que le matcher déjà présent : identité ambiguë.
    { name: 'source/matcher.mjs', content: '// REDACTED — doublon\n' },
  ];
  const body = redactedBody({ files });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_DUPLICATE_DEPENDENCY_PATH/,
  );
});

// ---------------------------------------------------------------------------
// Robustesse du parseur multipart / contrôles d'état.
// ---------------------------------------------------------------------------

test('un corps multipart sans frontière, tronqué ou non UTF-8 est refusé', () => {
  const body = redactedBody();
  assert.throws(() => parseMultipartFunctionBody(body.buffer, 'multipart/form-data'), /WITHOUT_BOUNDARY/);
  assert.throws(
    () => parseMultipartFunctionBody(body.buffer.slice(0, 120), body.contentType),
    /WITHOUT_PARTS|TRUNCATED|MALFORMED_PART/,
  );
  assert.throws(() => parseMultipartFunctionBody('pas des octets', body.contentType), /NOT_BYTES/);
});

test('une fonction non ACTIVE n est pas un déploiement vivant', () => {
  assert.throws(() => readbackFromRedacted({ status: 'THROTTLED' }), /READBACK_STATUS_NOT_ACTIVE/);
});

test('une réponse sans version, sans verify_jwt ou sans empreinte fournisseur échoue', () => {
  assert.throws(() => readbackFromRedacted({ version: null }), /WITHOUT_VERSION/);
  assert.throws(() => readbackFromRedacted({ verify_jwt: undefined }), /WITHOUT_VERIFY_JWT/);
  assert.throws(() => readbackFromRedacted({ slug: '' }), /WITHOUT_SLUG/);
  assert.throws(() => readbackFromRedacted({ entrypoint_path: '' }), /WITHOUT_ENTRYPOINT_PATH/);
  assert.throws(() => readbackFromRedacted({ ezbr_sha256: '' }), /WITHOUT_EZBR_SHA256/);
  assert.throws(() => readbackFromProviderReads(null), /NOT_AN_OBJECT/);
});

// ---------------------------------------------------------------------------
// Propriétés conservées : configuration, empreinte, merge, jeton.
// ---------------------------------------------------------------------------

test('la configuration change l empreinte même quand le code est identique', () => {
  const base = readbackFromRedacted();
  const jwtChanged = readbackFromRedacted({ verify_jwt: true });
  const versionChanged = readbackFromRedacted({ version: 13 }, {
    metadata: redactedBodyMetadata({ deployment_id: 'ygvsddcpohsnaowofuwc_redacted-deployment-uuid_13' }),
  });

  // Le code est le même : c'est précisément le cas que le contrôle a signalé.
  assert.equal(base.bundleSha256, jwtChanged.bundleSha256);
  assert.equal(base.bundleSha256, versionChanged.bundleSha256);
  // La configuration, elle, diffère : une signature qui ne couvrirait que le code serait aveugle.
  assert.notEqual(base.configSha256, jwtChanged.configSha256);
  assert.notEqual(base.configSha256, versionChanged.configSha256);
});

test('l empreinte de bundle du collecteur suit la même règle que le registre', () => {
  const entries = [
    { path: 'b.mjs', sha256: '2'.repeat(64) },
    { path: 'a.mjs', sha256: '1'.repeat(64) },
  ];
  // Indépendante de l'ordre : une renumérotation de fichiers ne doit pas changer l'identité.
  assert.equal(
    bundleFingerprintFromEntries(entries),
    bundleFingerprintFromEntries([...entries].reverse()),
  );
});

test('le merge réaligne observed sur la lecture sans muter l évidence d origine', () => {
  const rb = readbackFromRedacted();
  const evidence = {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    stage: 'PRE_DEPLOY',
    function: SLUG,
    observed: { version: 8, verifyJwt: true, entrypointSha256: 'f'.repeat(64), dependencies: [], bundleSha256: 'e'.repeat(64) },
    rollbackTarget: { phase: 'PRE_MIGRATION' },
  };
  const merged = mergeReadbackIntoEvidence(evidence, rb);
  assert.equal(merged.observed.version, 12);
  assert.equal(merged.observed.verifyJwt, false);
  assert.equal(merged.observed.bundleSha256, rb.bundleSha256);
  assert.deepEqual(merged.observed.readback, rb);
  // La cible de rollback n'est jamais touchée par une lecture d'état courant.
  assert.deepEqual(merged.rollbackTarget, evidence.rollbackTarget);
  // L'entrée n'est pas mutée : le merge ne « corrige » pas silencieusement un fichier.
  assert.equal(evidence.observed.version, 8);
});

test('une lecture qui n est pas un readback lié est refusée avant tout usage', () => {
  const rb = readbackFromRedacted();
  const divergent = { version: 8, verifyJwt: false, entrypointSha256: rb.entrypointSha256, dependencies: rb.dependencies, bundleSha256: rb.bundleSha256, readback: rb };
  const errors = validateReadback(divergent, SLUG);
  assert.ok(errors.includes('READBACK_DISAGREES_WITH_OBSERVED_version'), errors.join(','));
});

test('sans jeton, la collecte échoue sans jamais appeler le fournisseur', async () => {
  let called = false;
  const fetchImpl = async () => { called = true; return { ok: true, json: async () => redactedMetadata() }; };
  await assert.rejects(
    () => fetchReadback(SLUG, { token: '', fetchImpl }),
    /SUPABASE_ACCESS_TOKEN_MISSING/,
  );
  assert.equal(called, false, 'aucun appel réseau ne doit partir sans jeton');
});

test('les métadonnées en erreur remontent un code explicite, jamais un readback vide', async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, json: async () => ({}) });
  await assert.rejects(() => fetchReadback(SLUG, { token: 'jeton-de-test', fetchImpl }), /READBACK_HTTP_403/);
});

test('un body en erreur remonte READBACK_BODY_HTTP, jamais un readback partiel', async () => {
  const body = redactedBody();
  const fetchImpl = async (url) => (url.endsWith('/body')
    ? { ok: false, status: 500, headers: { get: () => null } }
    : { ok: true, status: 200, json: async () => redactedMetadata() });
  await assert.rejects(
    () => fetchReadback(SLUG, { token: 'jeton-de-test', fetchImpl }),
    /READBACK_BODY_HTTP_500/,
  );
  assert.ok(body.buffer.length > 0);
});

test('un body qui n est pas multipart est refusé au lieu d être interprété', async () => {
  const fetchImpl = async (url) => (url.endsWith('/body')
    ? { ok: true, status: 200, headers: { get: () => 'application/json' }, arrayBuffer: async () => Buffer.from('{}') }
    : { ok: true, status: 200, json: async () => redactedMetadata() });
  await assert.rejects(() => fetchReadback(SLUG, { token: 'jeton-de-test', fetchImpl }), /READBACK_BODY_NOT_MULTIPART/);
});

test('la collecte complète lie les deux lectures et n émet jamais le jeton', async () => {
  const secret = 'sbp_jeton-de-test-qui-ne-doit-pas-fuir';
  const body = redactedBody();
  const seen = [];
  const fetchImpl = async (url) => {
    seen.push(url);
    if (url.endsWith('/body')) {
      return {
        ok: true,
        status: 200,
        headers: { get: () => body.contentType },
        arrayBuffer: async () => body.buffer,
      };
    }
    return { ok: true, status: 200, json: async () => redactedMetadata() };
  };
  const rb = await fetchReadback(SLUG, { token: secret, fetchImpl });
  assert.equal(seen.length, 2, 'métadonnées ET bundle doivent être lus');
  assert.ok(seen[1].endsWith('/body'));
  assert.equal(rb.version, 12);
  // Aucun contenu de source ne doit sortir : le dépôt est public.
  assert.equal(rb.entrypointContent, undefined);
  assert.doesNotMatch(JSON.stringify(rb), /REDACTED — source/);
  assert.doesNotMatch(JSON.stringify(rb), new RegExp(secret));
});

test('la fixture elle-même reste expurgée : aucun source de production n y est publié', () => {
  const body = buildRedactedMultipartBody();
  const text = body.toString('utf8');
  assert.match(REDACTED_BODY_CONTENT_TYPE, /boundary=/);
  assert.doesNotMatch(text, /SUPABASE_ACCESS_TOKEN|sb_secret_|sb_publishable_|eyJhbGciOi/);
});

// --- Capture de l'artefact fournisseur original (custody) ----------------------------

const createHashSha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const captureFetch = (metadataOverrides = {}, bodyMetadataOverrides = {}) => async (url) => {
  if (String(url).endsWith('/body')) {
    const body = redactedBody({
      metadata: redactedBodyMetadata(bodyMetadataOverrides),
    });
    return {
      ok: true,
      status: 200,
      headers: { get: () => body.contentType },
      arrayBuffer: async () => body.buffer,
    };
  }
  return { ok: true, status: 200, json: async () => redactedMetadata(metadataOverrides) };
};

test('la capture conserve les octets multipart ORIGINAUX, jamais une reconstruction', async () => {
  const caps = await captureProviderArtifact(SLUG, {
    token: 'jeton-de-test',
    fetchImpl: captureFetch(),
  });
  // Les octets conservés doivent être exactement le corps rendu par le fournisseur.
  assert.deepEqual(caps.artifact.bytes, buildRedactedMultipartBody(REDACTED_FILES_FOR_TEST, redactedBodyMetadata()));
  assert.equal(caps.sealed.artifactBytes, caps.artifact.bytes.length);
  assert.equal(caps.sealed.artifactSha256, createHashSha256(caps.artifact.bytes));
});

test('la capture lie configuration et version à l artifice scellé', async () => {
  const caps = await captureProviderArtifact(SLUG, {
    token: 'jeton-de-test',
    fetchImpl: captureFetch(),
  });
  assert.equal(caps.sealed.schemaVersion, 'rollback-custody-artifact-v1');
  assert.equal(caps.sealed.version, 12);
  assert.equal(caps.sealed.verifyJwt, false);
  assert.equal(caps.sealed.status, 'ACTIVE');
  assert.equal(caps.sealed.bundleSha256, caps.readback.bundleSha256);
  assert.equal(caps.sealed.configSha256, caps.readback.configSha256);
  assert.equal(caps.sealed.providerEzbrSha256, redactedMetadata().ezbr_sha256);
});

test('la capture refuse deux lectures qui ne décrivent pas la même version', async () => {
  // Métadonnées de l'endpoint à version 12, corps rendu pour la version 11.
  const fetchImpl = async (url) => {
    if (String(url).endsWith('/body')) {
      const body = redactedBody({
        metadata: redactedBodyMetadata({ deployment_id: 'ygvsddcpohsnaowofuwc_redacted-deployment-uuid_11' }),
      });
      return {
        ok: true,
        status: 200,
        headers: { get: () => body.contentType },
        arrayBuffer: async () => body.buffer,
      };
    }
    return { ok: true, status: 200, json: async () => redactedMetadata() };
  };
  await assert.rejects(
    () => captureProviderArtifact(SLUG, { token: 'jeton-de-test', fetchImpl }),
    /CAPTURE_BODY_VERSION_MISMATCH/,
  );
});

test('la capture échoue explicitement sans jeton plutôt que de renseigner un champ non lu', async () => {
  await assert.rejects(
    () => captureProviderArtifact(SLUG, { token: '' }),
    /SUPABASE_ACCESS_TOKEN_MISSING/,
  );
});

test('une racine de conservation dans le dépôt est refusée : le dépôt est public', async () => {
  const repo = '/agent/repos/maximus-scpi';
  assert.equal(assertEvidenceRootOutsideRepo('/var/custody', repo).ok, true);
  assert.equal(assertEvidenceRootOutsideRepo(repo, repo).reason, 'EVIDENCE_ROOT_INSIDE_REPO');
  assert.equal(
    assertEvidenceRootOutsideRepo(`${repo}/scripts/security/prod-bundles`, repo).reason,
    'EVIDENCE_ROOT_INSIDE_REPO',
  );
  assert.equal(assertEvidenceRootOutsideRepo('', repo).reason, 'EVIDENCE_ROOT_UNSET');
});

// ---------------------------------------------------------------------------
// Défaut du 27/11 : la forme réelle du corps rendait TOUTE capture impossible.
//
// Le fournisseur ne publie ni `slug` ni `version` dans la partie `metadata` du corps :
// l'identité vient de `deployment_id` et de `deno2_entrypoint_path`. Les exiger produisait
// `CAPTURE_BODY_SLUG_MISMATCH` sur chaque fonction réelle — une garde insatisfiable.
// Ces tests verrouillent la lecture de l'identité là où elle est réellement publiée.
// ---------------------------------------------------------------------------

test('l identité du corps se lit dans deployment_id et deno2_entrypoint_path', () => {
  const identity = identityFromBodyMetadata(redactedBodyMetadata());
  assert.notEqual(identity, null);
  assert.equal(identity.projectRef, PRODUCTION_PROJECT_REF);
  assert.equal(identity.version, 12);
  assert.equal(identity.slug, SLUG);
  assert.equal(identity.entrypointPath, `source/${SLUG}/index.ts`);
});

test('une partie metadata sans identité lisible est refusée, jamais devinée', () => {
  // Sans `deployment_id`, ni version ni projet ne sont établis : on refuse.
  assert.equal(identityFromBodyMetadata({ deno2_entrypoint_path: `source/${SLUG}/index.ts` }), null);
  // `deployment_id` mal formé : refus plutôt qu'une version inventée.
  assert.equal(
    identityFromBodyMetadata({ deployment_id: 'pas-un-deployment-id', deno2_entrypoint_path: `source/${SLUG}/index.ts` }),
    null,
  );
  // Une version non numérique n'est pas une version.
  assert.equal(
    identityFromBodyMetadata({ deployment_id: `${PRODUCTION_PROJECT_REF}_uuid_abc`, deno2_entrypoint_path: `source/${SLUG}/index.ts` }),
    null,
  );
  // Sans entrypoint, l'identité du bundle n'est pas établie.
  assert.equal(identityFromBodyMetadata({ deployment_id: `${PRODUCTION_PROJECT_REF}_uuid_12` }), null);
  assert.equal(identityFromBodyMetadata(null), null);
});

test('un corps servi par un AUTRE projet que celui demandé est refusé', () => {
  // Le sceau serait étiqueté d'un projet et rempli par un autre : inacceptable même si les
  // octets sont identiques, puisque c'est la provenance qui fait la preuve.
  const body = redactedBody({
    metadata: redactedBodyMetadata({ deployment_id: 'autre-projet-ref-0001_uuid_12' }),
  });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }, { projectRef: PRODUCTION_PROJECT_REF }),
    /READBACK_BODY_PROJECT_MISMATCH/,
  );
});

test('les deux lectures doivent désigner le MÊME entrypoint, préfixes fournisseur exclus', () => {
  // Les métadonnées nomment le fichier par une URI temporaire, le corps par un chemin
  // relatif : comparer les chaînes brutes ferait échouer toute capture réelle.
  const body = redactedBody({
    metadata: redactedBodyMetadata({ deno2_entrypoint_path: 'source/scpi-autre/index.ts' }),
  });
  assert.throws(
    () => readbackFromProviderReads({
      metadata: redactedMetadata(),
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_BODY_ENTRYPOINT_MISMATCH|READBACK_BODY_SLUG_MISMATCH/,
  );
});

test('un corps tronqué est refusé même quand ses octets sont parfaitement plausibles', () => {
  // `module_count` annonce 3 modules : en servir 2 donnerait une empreinte valide d'un
  // bundle incomplet, donc une « sauvegarde » qui ne restaure pas la fonction.
  const files = REDACTED_FILES_FOR_TEST.slice(0, 2);
  const body = redactedBody({ files });
  const responses = {
    body: {
      ok: true, status: 200,
      headers: { get: () => body.contentType },
      arrayBuffer: async () => body.buffer,
    },
    meta: { ok: true, status: 200, json: async () => redactedMetadata() },
  };
  return assert.rejects(
    () => captureProviderArtifact(SLUG, {
      token: 'jeton-de-test',
      fetchImpl: async (url) => (String(url).endsWith('/body') ? responses.body : responses.meta),
    }),
    /CAPTURE_BODY_MODULE_COUNT_MISMATCH/,
  );
});

test('un entrypoint de corps qui contredit les métadonnées est refusé (forme historique à plat)', () => {
  // Ancienne disposition fournisseur : l'entrypoint est à plat sous `source/`, donc le chemin
  // ne porte pas le slug. La garde de slug ne peut pas trancher ici : c'est la comparaison
  // d'entrypoint (relativisée au bundle) qui doit refuser le désaccord.
  const meta = redactedMetadata({
    entrypoint_path: 'file:///tmp/user_fn_ygvsddcpohsnaowofuwc_redacted_12/source/index.ts',
  });
  const body = redactedBody();
  assert.throws(
    () => readbackFromProviderReads({
      metadata: meta,
      body: parseMultipartFunctionBody(body.buffer, body.contentType),
      requestedSlug: SLUG,
    }),
    /READBACK_BODY_ENTRYPOINT_MISMATCH/,
  );
});

test('la forme historique à plat reste normalisable : entrypoint racine et dépendances', () => {
  const root = 'file:///tmp/user_fn_ygvsddcpohsnaowofuwc_redacted_12/source';
  const meta = redactedMetadata({ entrypoint_path: `${root}/index.ts` });
  const files = [
    { name: `${root}/index.ts`, content: 'export default serve(redactedHandler);\n' },
    { name: `${root}/_shared/serviceKey.ts`, content: 'export const resolveKey = () => null;\n' },
  ];
  const body = redactedBody({
    files,
    metadata: redactedBodyMetadata({ deno2_entrypoint_path: `${root}/index.ts` }),
  });
  const rb = readbackFromProviderReads({
    metadata: meta,
    body: parseMultipartFunctionBody(body.buffer, body.contentType),
    requestedSlug: SLUG,
  });
  assert.equal(rb.entrypointPath, `${SLUG}/index.ts`);
  assert.deepEqual(rb.dependencies.map((d) => d.path), ['_shared/serviceKey.ts']);
});
