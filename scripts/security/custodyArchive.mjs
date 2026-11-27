#!/usr/bin/env node
/**
 * Archive de custody chiffrée et **authentifiée** des bundles déployés (P0 conservation).
 *
 * ## Pourquoi ce module existe
 *
 * Le run du 27/11 17:33Z a produit une archive « AES-256-CBC + PBKDF2 + SHA-256 ». Le
 * contrôle du même jour a mesuré le défaut, et il est **reproductible** : avec `openssl
 * enc -d`, l'altération d'un seul bit dans un bloc de données sort en **exit 0** et rend un
 * clair silencieusement corrompu. Un SHA-256 posé à côté de l'archive ne rattrape rien : il
 * n'est pas vérifié par le déchiffrement, et quiconque modifie l'archive peut recalculer
 * le SHA. Chiffrement sans authentification = intégrité **non** prouvée.
 *
 * Ce module fournit donc ce que la consigne demandait : un chiffrement **AEAD**
 * (AES-256-GCM, tag de 128 bits authentifiant aussi les données associées), une dérivation
 * de clé PBKDF2-HMAC-SHA256 à itérations déclarées, et un manifeste **scellé** par la même
 * clé — on ne peut donc pas substituer un autre manifeste à celui de l'archive.
 *
 * ## Ce que ce module ne fait JAMAIS
 *
 *  - il n'écrit, ne lit et ne journalise **aucune** clé ni phrase secrète : la clé vient
 *    d'un fichier désigné par l'appelant, et n'apparaît dans aucune sortie ;
 *  - il ne conserve pas la clé : la durabilité de la clé est un problème **distinct**, que
 *    ce module ne peut pas résoudre et ne prétend pas résoudre ;
 *  - il ne contacte aucun fournisseur et ne lit aucune variable d'environnement ;
 *  - il ne déchiffre pas « en confiance » : toute altération, tout changement d'en-tête,
 *    tout manifeste substitué, toute mauvaise clé sont rejetés par le tag GCM ;
 *  - il n'affirme pas qu'une archive est une sauvegarde restaurée : `restoreExercised`
 *    reste `false` tant qu'une restauration réelle n'a pas eu lieu.
 *
 * ## Format du fichier d'archive
 *
 * ```
 * MAXIMUSCUSTODY1\n            en-tête magic + version de conteneur
 * <en-tête JSON, une ligne>     paramètres KDF/chiffrement, sel, IV, empreintes
 * \n
 * <octets chiffrés>             clair = l'archive tar des bundles
 * ```
 *
 * L'en-tête JSON est passé en **données associées** (AAD) du tag GCM : le modifier invalide
 * le tag, donc on ne peut pas changer les paramètres KDF pour forcer une dérivation faible.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

/** Magic du conteneur : refuse tout autre format au lieu de deviner. */
export const CONTAINER_MAGIC = 'MAXIMUSCUSTODY1';

/** Version du schéma d'en-tête. */
export const CUSTODY_SCHEMA_VERSION = 'maximus-custody-aead-v1';

/** Cipher imposé : AEAD obligatoire, aucune option pour revenir à un mode non authentifié. */
export const CUSTODY_CIPHER = 'aes-256-gcm';

/** Itérations PBKDF2 par défaut, déclarées dans l'en-tête et vérifiées au déchiffrement. */
export const DEFAULT_KDF_ITERATIONS = 600000;

/** Plancher d'itérations : un en-tête qui demanderait moins est refusé. */
export const MIN_KDF_ITERATIONS = 210000;

/** Taille du sel KDF et de l'IV GCM, en octets. */
export const KDF_SALT_BYTES = 32;
export const GCM_IV_BYTES = 12;

/** Taille du tag d'authentification GCM, en octets. */
export const GCM_TAG_BYTES = 16;

const sha256Hex = (buf) => createHash('sha256').update(buf).digest('hex');

/**
 * Dérive la clé AEAD depuis la phrase secrète.
 *
 * Aucune trace de la phrase ni de la clé n'est produite : seuls le sel et le nombre
 * d'itérations sont publiés (ils ne sont pas secrets).
 */
export function deriveKey(passphrase, salt, iterations) {
  if (typeof passphrase !== 'string' || passphrase.length === 0) {
    throw new Error('CUSTODY_PASSPHRASE_EMPTY');
  }
  if (!Buffer.isBuffer(salt) || salt.length !== KDF_SALT_BYTES) {
    throw new Error('CUSTODY_KDF_SALT_INVALID');
  }
  if (!Number.isInteger(iterations) || iterations < MIN_KDF_ITERATIONS) {
    throw new Error('CUSTODY_KDF_ITERATIONS_TOO_LOW');
  }
  return pbkdf2Sync(passphrase, salt, iterations, 32, 'sha256');
}

/**
 * Chiffre et authentifie un contenu binaire.
 *
 * `plaintext` est l'archive tar ; `header` porte les paramètres publics et les empreintes.
 * L'en-tête est authentifié, donc son altération est détectée au déchiffrement.
 */
export function sealArchive({ plaintext, passphrase, header, iterations = DEFAULT_KDF_ITERATIONS }) {
  if (!Buffer.isBuffer(plaintext) || plaintext.length === 0) {
    throw new Error('CUSTODY_PLAINTEXT_EMPTY');
  }
  const salt = randomBytes(KDF_SALT_BYTES);
  const iv = randomBytes(GCM_IV_BYTES);
  const key = deriveKey(passphrase, salt, iterations);

  const sealedHeader = {
    ...header,
    schemaVersion: CUSTODY_SCHEMA_VERSION,
    cipher: CUSTODY_CIPHER,
    kdf: { name: 'pbkdf2-hmac-sha256', iterations, saltBase64: salt.toString('base64') },
    ivBase64: iv.toString('base64'),
    plaintextBytes: plaintext.length,
    plaintextSha256: sha256Hex(plaintext),
  };
  // L'en-tête entre dans le tag : on ne peut pas le réécrire pour changer la KDF.
  const headerBytes = Buffer.from(JSON.stringify(sealedHeader), 'utf8');

  const cipher = createCipheriv(CUSTODY_CIPHER, key, iv, { authTagLength: GCM_TAG_BYTES });
  cipher.setAAD(headerBytes);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  key.fill(0);

  const container = Buffer.concat([
    Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8'),
    headerBytes,
    Buffer.from('\n', 'utf8'),
    ciphertext,
    authTag,
  ]);

  return { container, header: sealedHeader, containerSha256: sha256Hex(container) };
}

/** Sépare un conteneur en en-tête / chiffré / tag, sans rien déchiffrer. */
export function parseContainer(container) {
  if (!Buffer.isBuffer(container) || container.length === 0) {
    throw new Error('CUSTODY_CONTAINER_EMPTY');
  }
  const magicBytes = Buffer.from(`${CONTAINER_MAGIC}\n`, 'utf8');
  if (
    container.length <= magicBytes.length ||
    !timingSafeEqual(container.subarray(0, magicBytes.length), magicBytes)
  ) {
    throw new Error('CUSTODY_CONTAINER_MAGIC_MISMATCH');
  }
  const rest = container.subarray(magicBytes.length);
  const newline = rest.indexOf(0x0a);
  if (newline < 0) throw new Error('CUSTODY_CONTAINER_HEADER_UNTERMINATED');

  const headerBytes = rest.subarray(0, newline);
  const payload = rest.subarray(newline + 1);
  if (payload.length <= GCM_TAG_BYTES) throw new Error('CUSTODY_CONTAINER_PAYLOAD_TRUNCATED');

  let header;
  try {
    header = JSON.parse(headerBytes.toString('utf8'));
  } catch {
    throw new Error('CUSTODY_CONTAINER_HEADER_NOT_JSON');
  }
  if (header?.schemaVersion !== CUSTODY_SCHEMA_VERSION) {
    throw new Error('CUSTODY_CONTAINER_SCHEMA_MISMATCH');
  }
  // Refuser les paramètres faibles plutôt que les « corriger » silencieusement.
  if (header?.cipher !== CUSTODY_CIPHER) throw new Error('CUSTODY_CONTAINER_CIPHER_REFUSED');
  if (header?.kdf?.name !== 'pbkdf2-hmac-sha256') throw new Error('CUSTODY_CONTAINER_KDF_REFUSED');
  if (!Number.isInteger(header?.kdf?.iterations) || header.kdf.iterations < MIN_KDF_ITERATIONS) {
    throw new Error('CUSTODY_CONTAINER_ITERATIONS_TOO_LOW');
  }

  return {
    header,
    headerBytes,
    ciphertext: payload.subarray(0, payload.length - GCM_TAG_BYTES),
    authTag: payload.subarray(payload.length - GCM_TAG_BYTES),
  };
}

/**
 * Vérifie l'intégrité puis déchiffre. Toute altération lève, sans jamais rendre un clair
 * partiel : un clair corrompu est plus dangereux qu'un refus.
 */
export function openArchive({ container, passphrase }) {
  const { header, headerBytes, ciphertext, authTag } = parseContainer(container);
  const salt = Buffer.from(header.kdf.saltBase64, 'base64');
  const iv = Buffer.from(header.ivBase64, 'base64');
  if (salt.length !== KDF_SALT_BYTES) throw new Error('CUSTODY_KDF_SALT_INVALID');
  if (iv.length !== GCM_IV_BYTES) throw new Error('CUSTODY_IV_INVALID');

  const key = deriveKey(passphrase, salt, header.kdf.iterations);
  const decipher = createDecipheriv(CUSTODY_CIPHER, key, iv, { authTagLength: GCM_TAG_BYTES });
  decipher.setAAD(headerBytes);
  decipher.setAuthTag(authTag);

  let plaintext;
  try {
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    // Message volontairement unique : ne pas distinguer « mauvaise clé » de « bit altéré »
    // hors du canal d'exploitation éviterait de renseigner un attaquant, mais surtout le
    // code appelant n'a aucune raison de traiter les deux cas différemment — les deux sont
    // un refus d'intégrité.
    throw new Error('CUSTODY_AUTHENTICATION_FAILED');
  } finally {
    key.fill(0);
  }

  if (plaintext.length !== header.plaintextBytes) throw new Error('CUSTODY_LENGTH_MISMATCH');
  if (sha256Hex(plaintext) !== header.plaintextSha256) throw new Error('CUSTODY_DIGEST_MISMATCH');

  return { plaintext, header };
}

/**
 * Scelle le manifeste (non sensible) avec la même clé que l'archive.
 *
 * Sans ce scellement, un manifeste séparé pourrait être remplacé par un autre manifeste
 * cohérent avec d'autres octets, et la vérification « 11/11 » porterait sur le mauvais objet.
 */
export function sealManifest({ manifest, passphrase }) {
  const body = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');
  const salt = randomBytes(KDF_SALT_BYTES);
  const iv = randomBytes(GCM_IV_BYTES);
  const key = deriveKey(passphrase, salt, DEFAULT_KDF_ITERATIONS);

  const aad = Buffer.from(
    JSON.stringify({ schemaVersion: 'maximus-custody-manifest-seal-v1', cipher: CUSTODY_CIPHER }),
    'utf8'
  );
  const cipher = createCipheriv(CUSTODY_CIPHER, key, iv, { authTagLength: GCM_TAG_BYTES });
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(body), cipher.final()]);
  const authTag = cipher.getAuthTag();
  key.fill(0);

  return {
    schemaVersion: 'maximus-custody-manifest-seal-v1',
    cipher: CUSTODY_CIPHER,
    kdf: { name: 'pbkdf2-hmac-sha256', iterations: DEFAULT_KDF_ITERATIONS, saltBase64: salt.toString('base64') },
    ivBase64: iv.toString('base64'),
    manifestSha256: sha256Hex(body),
    ciphertextBase64: ciphertext.toString('base64'),
    authTagBase64: authTag.toString('base64'),
  };
}

/** Ouvre un manifeste scellé, en refusant toute substitution ou altération. */
export function openManifest({ sealed, passphrase }) {
  if (sealed?.schemaVersion !== 'maximus-custody-manifest-seal-v1') {
    throw new Error('CUSTODY_MANIFEST_SEAL_SCHEMA_MISMATCH');
  }
  if (sealed?.cipher !== CUSTODY_CIPHER) throw new Error('CUSTODY_CONTAINER_CIPHER_REFUSED');
  if (
    !Number.isInteger(sealed?.kdf?.iterations) ||
    sealed.kdf.iterations < MIN_KDF_ITERATIONS
  ) {
    throw new Error('CUSTODY_CONTAINER_ITERATIONS_TOO_LOW');
  }
  const salt = Buffer.from(sealed.kdf.saltBase64, 'base64');
  const iv = Buffer.from(sealed.ivBase64, 'base64');
  const key = deriveKey(passphrase, salt, sealed.kdf.iterations);
  const aad = Buffer.from(
    JSON.stringify({ schemaVersion: 'maximus-custody-manifest-seal-v1', cipher: CUSTODY_CIPHER }),
    'utf8'
  );
  const decipher = createDecipheriv(CUSTODY_CIPHER, key, iv, { authTagLength: GCM_TAG_BYTES });
  decipher.setAAD(aad);
  decipher.setAuthTag(Buffer.from(sealed.authTagBase64, 'base64'));

  let body;
  try {
    body = Buffer.concat([
      decipher.update(Buffer.from(sealed.ciphertextBase64, 'base64')),
      decipher.final(),
    ]);
  } catch {
    throw new Error('CUSTODY_AUTHENTICATION_FAILED');
  } finally {
    key.fill(0);
  }
  if (sha256Hex(body) !== sealed.manifestSha256) throw new Error('CUSTODY_DIGEST_MISMATCH');
  return JSON.parse(body.toString('utf8'));
}

/**
 * Compare les empreintes constatées aux empreintes attendues, bundle par bundle.
 *
 * Ne rend jamais un PASS « en gros » : un bundle absent, en trop ou différent est un échec
 * nommé. C'est ce contrôle qui rend le « 11/11 » vérifiable au lieu d'affirmé.
 */
export function verifyBundleDigests(observed, expected) {
  const expectedSlugs = Object.keys(expected).sort();
  const observedSlugs = Object.keys(observed).sort();
  const problems = [];

  for (const slug of expectedSlugs) {
    if (!(slug in observed)) problems.push({ code: 'BUNDLE_MISSING', slug });
    else if (observed[slug] !== expected[slug]) problems.push({ code: 'BUNDLE_DIGEST_MISMATCH', slug });
  }
  for (const slug of observedSlugs) {
    if (!(slug in expected)) problems.push({ code: 'BUNDLE_UNEXPECTED', slug });
  }

  return {
    ok: problems.length === 0,
    expectedCount: expectedSlugs.length,
    observedCount: observedSlugs.length,
    matched: expectedSlugs.filter((s) => observed[s] === expected[s]).length,
    problems,
  };
}

/**
 * Construit le manifeste publié (non sensible) : identités, tailles, empreintes, périodes.
 * Aucun octet de source, aucune clé, aucune donnée client.
 */
export function buildManifest({
  bundles,
  containerSha256,
  containerBytes,
  capturedAt,
  projectRef,
  restoreExercised = false,
}) {
  const sorted = [...bundles].sort((a, b) => a.slug.localeCompare(b.slug));
  return {
    schemaVersion: 'maximus-custody-manifest-v1',
    purpose: 'Archivage chiffré et authentifié des bundles déployés, pour restauration future.',
    generatedAt: capturedAt,
    projectRef,
    captureSource:
      'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}/body (Accept: multipart/form-data)',
    container: { sha256: containerSha256, bytes: containerBytes },
    counts: {
      bundles: sorted.length,
      totalPlaintextBytes: sorted.reduce((n, b) => n + b.bytes, 0),
    },
    // Une archive n'est pas une restauration : ce champ ne peut passer à true que sur
    // exercice réel, jamais sur la seule existence de l'archive.
    restoreExercised,
    bundles: sorted.map((b) => ({
      slug: b.slug,
      bytes: b.bytes,
      sha256: b.sha256,
    })),
  };
}

/** Empreinte SHA-256 d'un Buffer, exposée pour les appelants qui n'importent pas node:crypto. */
export function digestOf(buf) {
  return sha256Hex(buf);
}
