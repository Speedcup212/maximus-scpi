/**
 * Custody AEAD — le format d'archive doit **refuser** une altération, pas la tolérer.
 *
 * Le défaut corrigé ici est mesuré, pas supposé : avec « AES-256-CBC + SHA-256 séparé »,
 * l'altération d'un seul bit d'un bloc de données laissait `openssl enc -d` sortir en
 * **exit 0** avec un clair silencieusement corrompu. Ces tests fixent le comportement
 * attendu : authentification obligatoire, refus nommé, jamais de clair douteux.
 *
 * Ce qui est vérifié :
 *  1. aller-retour exact sur un contenu multi-blocs ;
 *  2. altération d'un bit dans les données → refus ;
 *  3. altération de l'en-tête (paramètres KDF) → refus, car l'en-tête est authentifié ;
 *  4. mauvaise phrase secrète → refus ;
 *  5. substitution de manifeste → refus ;
 *  6. paramètres faibles (itérations, cipher) → refus, sans « correction » silencieuse ;
 *  7. comparaison 11/11 stricte : manquant, en trop, différent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTAINER_MAGIC,
  CUSTODY_SCHEMA_VERSION,
  DEFAULT_KDF_ITERATIONS,
  MIN_KDF_ITERATIONS,
  buildManifest,
  digestOf,
  openArchive,
  openManifest,
  parseContainer,
  sealArchive,
  sealManifest,
  verifyBundleDigests,
} from './custodyArchive.mjs';

// Contenu de test multi-blocs : dépasse largement une taille de bloc AES.
const PLAINTEXT = Buffer.from(
  Array.from({ length: 4096 }, (_, i) => String.fromCharCode(32 + (i % 90))).join(''),
  'utf8'
);
const PASSPHRASE = 'phrase-de-test-jetable-uniquement-dans-ce-test';

const seal = (extra = {}) =>
  sealArchive({
    plaintext: PLAINTEXT,
    passphrase: PASSPHRASE,
    header: { purpose: 'test', bundleCount: 11 },
    ...extra,
  });

test('aller-retour : le clair est rendu octet pour octet', () => {
  const { container, header } = seal();
  assert.equal(header.cipher, 'aes-256-gcm');
  assert.equal(header.schemaVersion, CUSTODY_SCHEMA_VERSION);
  assert.equal(header.plaintextBytes, PLAINTEXT.length);
  assert.equal(header.plaintextSha256, digestOf(PLAINTEXT));

  const opened = openArchive({ container, passphrase: PASSPHRASE });
  assert.equal(digestOf(opened.plaintext), digestOf(PLAINTEXT));
  assert.ok(opened.plaintext.equals(PLAINTEXT));
});

test('le conteneur porte le magic et ne contient pas le clair', () => {
  const { container } = seal();
  assert.ok(container.subarray(0, CONTAINER_MAGIC.length).toString('utf8') === CONTAINER_MAGIC);
  // Le clair de test est du texte : il ne doit apparaître nulle part dans le conteneur.
  assert.equal(container.includes(Buffer.from(PLAINTEXT.subarray(0, 64))), false);
});

test('un seul bit altéré dans les données chiffrées est refusé', () => {
  const { container } = seal();
  const { headerBytes, ciphertext, authTag } = parseContainer(container);

  for (const offset of [0, Math.floor(ciphertext.length / 2), ciphertext.length - 1]) {
    const tampered = Buffer.from(container);
    const start = container.length - authTag.length - ciphertext.length;
    tampered[start + offset] ^= 0x01;
    assert.throws(
      () => openArchive({ container: tampered, passphrase: PASSPHRASE }),
      /CUSTODY_AUTHENTICATION_FAILED/,
      `altération au décalage ${offset} non détectée`
    );
  }
  assert.ok(headerBytes.length > 0);
});

test('altérer le tag lui-même est refusé', () => {
  const { container } = seal();
  const tampered = Buffer.from(container);
  tampered[tampered.length - 1] ^= 0x80;
  assert.throws(() => openArchive({ container: tampered, passphrase: PASSPHRASE }), /CUSTODY_AUTHENTICATION_FAILED/);
});

test("l'en-tête est authentifié : changer les itérations KDF est refusé", () => {
  const { container, header } = seal();
  const { headerBytes } = parseContainer(container);

  // Mutation de MÊME LONGUEUR : l'en-tête reste un JSON valide et lisible, seul le tag peut
  // le rejeter. C'est la seule forme qui prouve réellement l'AAD ; une taille différente
  // pourrait être rejetée par le parseur et masquerait l'absence d'authentification.
  const forgedIterations = 300000;
  assert.equal(String(forgedIterations).length, String(header.kdf.iterations).length);
  const forged = Buffer.from(
    JSON.stringify({ ...header, kdf: { ...header.kdf, iterations: forgedIterations } }),
    'utf8'
  );
  assert.equal(forged.length, headerBytes.length, 'la mutation doit conserver la longueur');

  const prefix = Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8');
  const rebuilt = Buffer.concat([prefix, forged, container.subarray(prefix.length + headerBytes.length)]);

  // L'en-tête forgé est accepté par le parseur…
  assert.equal(parseContainer(rebuilt).header.kdf.iterations, forgedIterations);
  // …mais le tag GCM refuse : l'en-tête est bien couvert par l'authentification.
  assert.throws(
    () => openArchive({ container: rebuilt, passphrase: PASSPHRASE }),
    /CUSTODY_AUTHENTICATION_FAILED/
  );
});

test("un en-tête forgé de longueur différente est également refusé", () => {
  const { container } = seal();
  const { headerBytes } = parseContainer(container);
  const prefix = Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8');

  // Un en-tête tronqué qui n'est plus du JSON ne doit pas être interprété « au mieux ».
  const truncated = Buffer.concat([prefix, headerBytes.subarray(0, 12), container.subarray(prefix.length + headerBytes.length)]);
  assert.throws(() => parseContainer(truncated), /CUSTODY_CONTAINER_HEADER_NOT_JSON/);
});

test('une mauvaise phrase secrète est refusée (jamais de clair douteux)', () => {
  const { container } = seal();
  assert.throws(
    () => openArchive({ container, passphrase: 'mauvaise-phrase' }),
    /CUSTODY_AUTHENTICATION_FAILED/
  );
});

test('les paramètres faibles sont refusés, pas corrigés', () => {
  assert.throws(
    () => sealArchive({ plaintext: PLAINTEXT, passphrase: PASSPHRASE, header: {}, iterations: 1000 }),
    /CUSTODY_KDF_ITERATIONS_TOO_LOW/
  );
  assert.throws(
    () => sealArchive({ plaintext: PLAINTEXT, passphrase: '', header: {} }),
    /CUSTODY_PASSPHRASE_EMPTY/
  );
  assert.throws(
    () => sealArchive({ plaintext: Buffer.alloc(0), passphrase: PASSPHRASE, header: {} }),
    /CUSTODY_PLAINTEXT_EMPTY/
  );
});

test('un cipher non authentifié serait refusé à la lecture', () => {
  const { container } = seal();
  const { header } = parseContainer(container);
  assert.equal(header.cipher, 'aes-256-gcm');
  // Le refus est structurel : parseContainer n'accepte que CUSTODY_CIPHER.
  const forgedHeader = Buffer.from(
    JSON.stringify({ ...header, cipher: 'aes-256-cbc' }),
    'utf8'
  );
  const prefix = Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8');
  const { headerBytes } = parseContainer(container);
  const rebuilt = Buffer.concat([prefix, forgedHeader, container.subarray(prefix.length + headerBytes.length)]);
  assert.throws(() => parseContainer(rebuilt), /CUSTODY_CONTAINER_CIPHER_REFUSED/);
});

test('un magic inconnu est refusé au lieu d’être interprété', () => {
  assert.throws(() => parseContainer(Buffer.from('AUTRE-CHOSE\n{}')), /CUSTODY_CONTAINER_MAGIC_MISMATCH/);
  assert.throws(() => parseContainer(Buffer.alloc(0)), /CUSTODY_CONTAINER_EMPTY/);
});

test('un conteneur déclarant une KDF trop faible est refusé à la lecture', () => {
  const { container } = seal();
  const { header, headerBytes } = parseContainer(container);
  const prefix = Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8');
  const tail = container.subarray(prefix.length + headerBytes.length);

  // Conteneur fabriqué de toutes pièces : en-tête valide en forme, KDF sous le plancher.
  // Il ne doit pas être « corrigé » en dérivant quand même une clé faible.
  const weak = Buffer.from(
    JSON.stringify({ ...header, kdf: { ...header.kdf, iterations: 1000 } }),
    'utf8'
  );
  const rebuilt = Buffer.concat([prefix, weak, tail]);
  assert.throws(() => parseContainer(rebuilt), /CUSTODY_CONTAINER_ITERATIONS_TOO_LOW/);
  assert.throws(() => openArchive({ container: rebuilt, passphrase: PASSPHRASE }), /CUSTODY_CONTAINER_ITERATIONS_TOO_LOW/);

  // Même refus pour un manifeste scellé qui déclarerait une KDF trop faible.
  const sealedManifest = sealManifest({ manifest: { a: 1 }, passphrase: PASSPHRASE });
  const weakManifest = {
    ...sealedManifest,
    kdf: { ...sealedManifest.kdf, iterations: 1000 },
  };
  assert.throws(() => openManifest({ sealed: weakManifest, passphrase: PASSPHRASE }), /CUSTODY_CONTAINER_ITERATIONS_TOO_LOW/);
});

test('le manifeste scellé ne peut pas être substitué', () => {
  const manifest = buildManifest({
    bundles: [{ slug: 'a', bytes: 1, sha256: 'x' }],
    containerSha256: 'abc',
    containerBytes: 10,
    capturedAt: '2026-11-27T00:00:00Z',
    projectRef: 'ref',
  });
  const sealed = sealManifest({ manifest, passphrase: PASSPHRASE });
  assert.deepEqual(openManifest({ sealed, passphrase: PASSPHRASE }), manifest);

  // Altérer un caractère du ciphertext du manifeste doit être détecté.
  const raw = Buffer.from(sealed.ciphertextBase64, 'base64');
  raw[0] ^= 0x01;
  const tampered = { ...sealed, ciphertextBase64: raw.toString('base64') };
  assert.throws(() => openManifest({ sealed: tampered, passphrase: PASSPHRASE }), /CUSTODY_AUTHENTICATION_FAILED/);

  // Une autre phrase secrète ne doit pas ouvrir le manifeste.
  assert.throws(() => openManifest({ sealed, passphrase: 'autre' }), /CUSTODY_AUTHENTICATION_FAILED/);
});

test('la comparaison 11/11 est stricte : manquant, en trop, différent', () => {
  const expected = { a: '1', b: '2', c: '3' };
  assert.equal(verifyBundleDigests({ a: '1', b: '2', c: '3' }, expected).ok, true);

  const missing = verifyBundleDigests({ a: '1', c: '3' }, expected);
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.problems, [{ code: 'BUNDLE_MISSING', slug: 'b' }]);
  assert.equal(missing.matched, 2);

  const extra = verifyBundleDigests({ a: '1', b: '2', c: '3', d: '4' }, expected);
  assert.equal(extra.ok, false);
  assert.deepEqual(extra.problems, [{ code: 'BUNDLE_UNEXPECTED', slug: 'd' }]);

  const different = verifyBundleDigests({ a: '1', b: 'X', c: '3' }, expected);
  assert.equal(different.ok, false);
  assert.deepEqual(different.problems, [{ code: 'BUNDLE_DIGEST_MISMATCH', slug: 'b' }]);
});

test('le manifeste ne peut pas prétendre à une restauration exercée par défaut', () => {
  const manifest = buildManifest({
    bundles: [{ slug: 'a', bytes: 1, sha256: 'x' }],
    containerSha256: 'abc',
    containerBytes: 10,
    capturedAt: '2026-11-27T00:00:00Z',
    projectRef: 'ref',
  });
  assert.equal(manifest.restoreExercised, false);
  assert.equal(manifest.schemaVersion, 'maximus-custody-manifest-v1');
  assert.equal(manifest.counts.bundles, 1);
  assert.equal(manifest.counts.totalPlaintextBytes, 1);
});

test('les itérations par défaut respectent le plancher déclaré', () => {
  assert.ok(DEFAULT_KDF_ITERATIONS >= MIN_KDF_ITERATIONS);
  const { header } = seal();
  assert.equal(header.kdf.iterations, DEFAULT_KDF_ITERATIONS);
  assert.equal(header.kdf.name, 'pbkdf2-hmac-sha256');
});
