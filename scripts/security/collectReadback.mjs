/**
 * Collecte du readback fournisseur pour une fonction du périmètre de migration.
 *
 * Objet : produire le bloc `observed.readback` de l'évidence **à partir d'une lecture réelle**
 * de la fonction déployée, jamais d'une ressaisie manuelle. Le contrôle indépendant du 25/11
 * a établi que comparer `observed.version` au registre statique du dépôt revient à comparer
 * une croyance à elle-même ; la seule pièce qui dise ce que la production contient est une
 * lecture datée du fournisseur.
 *
 * Le contrôle du 26/11 (#459) a établi que ce collecteur ne collectait pas ce qu'il
 * prétendait collecter :
 *
 *  1. `GET /v1/projects/{ref}/functions/{slug}` ne rend **que des métadonnées** — la
 *     documentation du fournisseur n'expose ni `files` ni contenu sur cet endpoint. Les
 *     octets viennent de `GET /v1/projects/{ref}/functions/{slug}/body` (multipart). Le
 *     collecteur lit donc **deux fois** et lie les deux lectures à la **même version**.
 *  2. L'entrypoint n'était pas réellement identifié : un repli silencieux sur « n'importe
 *     quel `index.ts` » pouvait retenir le mauvais fichier. La correspondance est désormais
 *     **unique** avec `entrypoint_path` du fournisseur, et le slug demandé est vérifié.
 *  3. Une dépendance sans contenu était hachée comme la chaîne vide, ce qui produisait une
 *     empreinte plausible pour un fichier absent. Chaque fichier doit désormais porter un
 *     contenu réel, en octets UTF-8 exacts.
 *  4. Les chemins fournisseur (URI temporaires de déploiement) étaient comparés à des
 *     chemins du dépôt sans normalisation. `normalizeBundlePaths` les ramène explicitement
 *     à la convention du registre (`<slug>/index.ts`, `<slug>/<dépendance locale>`,
 *     `_shared/<dépendance partagée>`) et **refuse** tout chemin qu'elle ne sait pas placer.
 *
 * Ce que le script NE fait pas, volontairement :
 *  - il ne déploie rien, ne modifie rien, ne révoque rien ;
 *  - il n'écrit aucun fichier par défaut (`--json` sur stdout seulement) ;
 *  - il ne publie **aucun contenu de source** : le readback ne porte que des empreintes et
 *    des tailles, jamais les octets (le dépôt est public) ;
 *  - il ne lit aucun secret applicatif et n'émet aucun jeton dans sa sortie ;
 *  - il n'invente **jamais** de valeur : sans jeton, sans second endpoint ou sans réponse
 *    exploitable, il échoue en nommant le motif plutôt que de produire un readback plausible.
 *
 * Le jeton de management Supabase n'est jamais passé en argument de ligne de commande
 * (il apparaîtrait dans `ps` et l'historique du shell) : il est lu dans
 * `SUPABASE_ACCESS_TOKEN`, que le mode interactif fournit à la session.
 *
 * Usages :
 *   SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs --function scpi-evidence-certify
 *       Lit la fonction déployée et émet le bloc `readback` (JSON) sur stdout.
 *   SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs --function <nom> --merge <évidence.json>
 *       Émet l'évidence complète avec `observed` réaligné sur le readback.
 *   node scripts/security/collectReadback.mjs --list
 *       Liste les fonctions du périmètre sans aucun appel réseau.
 *
 * Codes de sortie : 0 succès, 1 échec de collecte, 2 usage invalide.
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import {
  PRODUCTION_PROJECT_REF,
  READBACK_SOURCES,
  READBACK_BUNDLE_SOURCES,
  READBACK_ACTIVE_STATUS,
  readbackConfigSha256,
  bundleFingerprint,
  buildManifest,
} from './edgeFunctionDeploymentManifest.mjs';

const MANAGEMENT_BASE = 'https://api.supabase.com';

/** Variable qui désigne la racine de conservation des artefacts, hors du dépôt. */
export const MAXIMUS_EVIDENCE_ROOT_ENV = 'MAXIMUS_ROLLBACK_EVIDENCE_ROOT';

/** Endpoint de **métadonnées** : slug, version, `verify_jwt`, `entrypoint_path`, `ezbr_sha256`. */
const METADATA_SOURCE = READBACK_SOURCES[0].replace('{ref}', PRODUCTION_PROJECT_REF);
/**
 * Endpoint de **contenu** : multipart/form-data. C'est le seul mécanisme fournisseur qui
 * rende les octets ; l'endpoint de métadonnées n'en rend aucun.
 */
const BUNDLE_SOURCE = READBACK_BUNDLE_SOURCES[0].replace('{ref}', PRODUCTION_PROJECT_REF);

/** État fournisseur exigé : une fonction non `ACTIVE` n'est pas un déploiement vivant. */
const ACTIVE_STATUS = READBACK_ACTIVE_STATUS;

/** Empreinte SHA-256 de l'entrée vide : la marque d'un contenu qui n'a pas été lu. */
export const EMPTY_CONTENT_SHA256 = createHash('sha256').update(Buffer.alloc(0)).digest('hex');

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/**
 * Empreinte agrégée d'un bundle, selon la même règle que le registre du dépôt.
 *
 * La règle doit rester **identique** à `bundleFingerprint` du manifeste : deux règles
 * différentes produiraient deux empreintes différentes pour le même contenu, et le gate
 * refuserait à tort. Le test `collectReadback` verrouille cette égalité.
 *
 * @param {Array<{path: string, sha256: string}>} entries
 * @returns {string} SHA-256 hexadécimal.
 */
export function bundleFingerprintFromEntries(entries) {
  return bundleFingerprint(entries);
}

/** Retire le préfixe `file://` et les séparateurs de fin d'une URI fournisseur. */
function stripProviderScheme(raw) {
  return String(raw).replace(/^file:\/\//, '').replace(/\/+$/, '');
}

/** Répertoire d'un chemin fournisseur (les URI de déploiement sont toujours absolues). */
function providerDirname(p) {
  const i = p.lastIndexOf('/');
  return i === -1 ? '' : p.slice(0, i);
}

/** Refuse un chemin qui sortirait du bundle ou désignerait une racine absolue. */
function assertRelativeShape(rel, raw) {
  if (rel === '' || rel.startsWith('/') || rel.split('/').includes('..')) {
    throw new Error(`PROVIDER_PATH_NOT_NORMALIZABLE:${raw}`);
  }
}

/**
 * Ramène les chemins du fournisseur à la convention du registre du dépôt.
 *
 * Le fournisseur sert le bundle sous une **URI temporaire de déploiement**
 * (`file:///tmp/<déploiement>/index.ts`), qui ne contient pas le slug : comparer ces chemins
 * au registre sans normalisation produit des identités incomparables. La règle est donc
 * explicite et unique :
 *
 *  - la racine du bundle est le répertoire de l'`entrypoint_path` fournisseur ;
 *  - l'entrypoint devient `<slug>/index.ts` ;
 *  - un fichier sous la racine devient `<slug>/<chemin relatif>` ;
 *  - un fichier partagé sous `<racine>/_shared/` devient `_shared/<…>` (les dépendances
 *    partagées vivent à la racine du bundle) ;
 *  - un fichier déjà exprimé dans la convention du registre est conservé tel quel ;
 *  - **tout autre cas échoue** : mieux vaut ne rien prouver que placer un chemin au hasard.
 *
 * @param {{entrypointProviderPath: string, filePaths: string[], slug: string}} input
 * @returns {Map<string, string>} Chemin fournisseur brut → chemin registre.
 */
export function normalizeBundlePaths({ entrypointProviderPath, filePaths, slug }) {
  if (typeof slug !== 'string' || slug === '') throw new Error('NORMALIZE_WITHOUT_SLUG');
  if (typeof entrypointProviderPath !== 'string' || entrypointProviderPath === '') {
    throw new Error('NORMALIZE_WITHOUT_ENTRYPOINT');
  }
  const rawEntry = stripProviderScheme(entrypointProviderPath);
  const root = providerDirname(rawEntry);
  const mapping = new Map();

  for (const raw of filePaths) {
    const p = stripProviderScheme(raw);
    if (p === rawEntry) {
      mapping.set(raw, `${slug}/index.ts`);
      continue;
    }
    if (root !== '' && p.startsWith(`${root}/`)) {
      const rel = p.slice(root.length + 1);
      assertRelativeShape(rel, raw);
      mapping.set(raw, rel.startsWith('_shared/') ? rel : `${slug}/${rel}`);
      continue;
    }
    if (p.startsWith('_shared/') || p.startsWith(`${slug}/`)) {
      assertRelativeShape(p, raw);
      mapping.set(raw, p);
      continue;
    }
    throw new Error(`PROVIDER_PATH_NOT_NORMALIZABLE:${raw}`);
  }
  return mapping;
}

/** Extrait la frontière d'un `content-type: multipart/form-data; boundary=…`. */
function boundaryFromContentType(contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(String(contentType ?? ''));
  const boundary = m ? (m[1] ?? m[2] ?? '').trim() : '';
  return boundary === '' ? null : boundary;
}

/** Extrait le nom de fichier d'un `content-disposition`. */
function filenameFromHeaders(headerText) {
  const m = /filename="([^"]*)"/i.exec(headerText) ?? /filename=([^;\r\n]+)/i.exec(headerText);
  return m ? m[1].trim() : null;
}

/**
 * Découpe une réponse `multipart/form-data` du fournisseur en métadonnées + fichiers.
 *
 * Fonction pure sur des octets : elle travaillé sur la réponse telle que le fournisseur la
 * rend, ce qui permet de la tester sur une réponse réelle expurgée. Elle ne devine rien :
 * une partie sans en-tête exploitable, un flux tronqué ou un corps non UTF-8 échouent.
 *
 * @param {Buffer} raw Octets du corps multipart.
 * @param {string} contentType En-tête `content-type` de la réponse.
 * @returns {{metadata: object|null, files: Array<{name: string, content: string, bytes: number}>}}
 */
export function parseMultipartFunctionBody(raw, contentType) {
  if (!Buffer.isBuffer(raw)) throw new Error('READBACK_BODY_NOT_BYTES');
  const boundary = boundaryFromContentType(contentType);
  if (!boundary) throw new Error('READBACK_BODY_WITHOUT_BOUNDARY');

  const delimiter = Buffer.from(`--${boundary}`, 'utf8');
  const parts = [];
  let cursor = raw.indexOf(delimiter);
  if (cursor === -1) throw new Error('READBACK_BODY_WITHOUT_PARTS');

  while (cursor !== -1) {
    let start = cursor + delimiter.length;
    if (raw.slice(start, start + 2).toString('latin1') === '--') break;
    if (raw.slice(start, start + 2).toString('latin1') === '\r\n') start += 2;

    const headerEnd = raw.indexOf('\r\n\r\n', start);
    if (headerEnd === -1) throw new Error('READBACK_BODY_MALFORMED_PART');
    const headerText = raw.slice(start, headerEnd).toString('utf8');

    const bodyStart = headerEnd + 4;
    const next = raw.indexOf(delimiter, bodyStart);
    if (next === -1) throw new Error('READBACK_BODY_TRUNCATED');
    let bodyEnd = next;
    if (raw.slice(bodyEnd - 2, bodyEnd).toString('latin1') === '\r\n') bodyEnd -= 2;

    parts.push({ headerText, body: raw.slice(bodyStart, bodyEnd) });
    cursor = next;
  }

  let metadata = null;
  const files = [];
  for (const part of parts) {
    const filename = filenameFromHeaders(part.headerText);
    if (filename === null) {
      // Partie de métadonnées : JSON, jamais un fichier anonyme.
      try {
        metadata = JSON.parse(part.body.toString('utf8'));
      } catch {
        throw new Error('READBACK_BODY_METADATA_NOT_JSON');
      }
      continue;
    }
    const content = part.body.toString('utf8');
    // Une conversion qui change le nombre d'octets signifie que le fichier n'est pas de
    // l'UTF-8 : hacher la chaîne obtenue produirait une empreinte fausse mais plausible.
    if (Buffer.byteLength(content, 'utf8') !== part.body.length) {
      throw new Error(`READBACK_FILE_NOT_UTF8:${filename}`);
    }
    files.push({ name: filename, content, bytes: part.body.length });
  }
  return { metadata, files };
}

/**
 * Assemble un bloc `readback` à partir des **deux** lectures fournisseur.
 *
 * Fonction pure : elle ne fait aucun appel réseau, ce qui permet de la tester sur des
 * réponses enregistrées. Elle exige que les deux lectures décrivent le **même objet** :
 * une métadonnée de version 12 et un corps de version 11 ne forment pas une preuve de la
 * version 12, et ce désaccord est refusé au lieu d'être moyenné.
 *
 * @param {{metadata: object, body: {metadata: object|null, files: Array}, requestedSlug?: string}} reads
 * @param {{projectRef?: string, fetchedAt?: string}} [options]
 * @returns {object} Bloc `readback` prêt à être inséré dans `observed`.
 */
export function readbackFromProviderReads(reads, options = {}) {
  const { metadata, body } = reads ?? {};
  if (!metadata || typeof metadata !== 'object') throw new Error('READBACK_PAYLOAD_NOT_AN_OBJECT');
  if (!body || typeof body !== 'object') throw new Error('READBACK_WITHOUT_BUNDLE_READ');

  const slug = metadata.slug ?? metadata.name;
  if (typeof slug !== 'string' || slug === '') throw new Error('READBACK_PAYLOAD_WITHOUT_SLUG');
  if (reads.requestedSlug !== undefined && reads.requestedSlug !== slug) {
    throw new Error('READBACK_OTHER_FUNCTION');
  }
  if (!Number.isInteger(metadata.version)) throw new Error('READBACK_PAYLOAD_WITHOUT_VERSION');
  if (typeof metadata.verify_jwt !== 'boolean') throw new Error('READBACK_PAYLOAD_WITHOUT_VERIFY_JWT');
  if (typeof metadata.entrypoint_path !== 'string' || metadata.entrypoint_path === '') {
    throw new Error('READBACK_PAYLOAD_WITHOUT_ENTRYPOINT_PATH');
  }
  if (metadata.status !== ACTIVE_STATUS) throw new Error('READBACK_STATUS_NOT_ACTIVE');

  const providerEzbrSha256 = metadata.ezbr_sha256;
  if (typeof providerEzbrSha256 !== 'string' || providerEzbrSha256 === '') {
    throw new Error('READBACK_PAYLOAD_WITHOUT_EZBR_SHA256');
  }

  // Les deux lectures doivent décrire la même version et la même fonction. Le corps rend ses
  // propres métadonnées : c'est la seule façon de prouver qu'on ne lie pas la version 12 à
  // des octets servis pour la version 11.
  const bodyMeta = body.metadata;
  if (!bodyMeta || typeof bodyMeta !== 'object') throw new Error('READBACK_BODY_WITHOUT_METADATA');
  if (bodyMeta.slug !== slug) throw new Error('READBACK_BODY_SLUG_MISMATCH');
  if (bodyMeta.version !== metadata.version) throw new Error('READBACK_BODY_VERSION_MISMATCH');

  const files = Array.isArray(body.files) ? body.files : [];
  if (files.length === 0) throw new Error('READBACK_PAYLOAD_WITHOUT_ENTRYPOINT_CONTENT');
  for (const f of files) {
    if (typeof f?.name !== 'string' || f.name === '') throw new Error('READBACK_FILE_WITHOUT_NAME');
    if (typeof f.content !== 'string') throw new Error(`READBACK_FILE_WITHOUT_CONTENT:${f.name}`);
  }

  const mapping = normalizeBundlePaths({
    entrypointProviderPath: metadata.entrypoint_path,
    filePaths: files.map((f) => f.name),
    slug,
  });

  const entrypointPath = `${slug}/index.ts`;
  const entrypointMatches = files.filter((f) => mapping.get(f.name) === entrypointPath);
  if (entrypointMatches.length === 0) throw new Error('READBACK_ENTRYPOINT_NOT_IN_BODY');
  if (entrypointMatches.length > 1) throw new Error('READBACK_ENTRYPOINT_AMBIGUOUS');
  const entrypointFile = entrypointMatches[0];
  if (entrypointFile.content === '') throw new Error('READBACK_ENTRYPOINT_CONTENT_EMPTY');

  const seen = new Set();
  const dependencies = files
    .filter((f) => f !== entrypointFile)
    .map((f) => {
      const path = mapping.get(f.name);
      if (seen.has(path)) throw new Error(`READBACK_DUPLICATE_DEPENDENCY_PATH:${path}`);
      seen.add(path);
      if (f.content === '') throw new Error(`READBACK_FILE_WITHOUT_CONTENT:${path}`);
      return {
        path,
        sha256: sha256(Buffer.from(f.content, 'utf8')),
        bytes: Buffer.byteLength(f.content, 'utf8'),
      };
    })
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const entrypointSha256 = sha256(Buffer.from(entrypointFile.content, 'utf8'));
  const projectRef = options.projectRef ?? PRODUCTION_PROJECT_REF;
  const readback = {
    source: METADATA_SOURCE,
    bundleSource: BUNDLE_SOURCE,
    fetchedAt: options.fetchedAt ?? new Date().toISOString(),
    projectRef,
    slug,
    status: metadata.status,
    version: metadata.version,
    verifyJwt: metadata.verify_jwt,
    // Chemin fournisseur brut (URI temporaire de déploiement), conservé pour la traçabilité,
    // et chemin canonique du registre : les deux ne se confondent jamais.
    providerEntrypointPath: metadata.entrypoint_path,
    entrypointPath,
    entrypointSha256,
    dependencies,
    // Empreinte **fournisseur** du bundle (stockage) : distincte de l'empreinte canonique
    // calculée ci-dessous. Confondre les deux ferait échouer toute comparaison.
    providerEzbrSha256,
    bundleSha256: bundleFingerprintFromEntries([
      { path: entrypointPath, sha256: entrypointSha256 },
      ...dependencies,
    ]),
  };
  readback.configSha256 = readbackConfigSha256({
    projectRef: readback.projectRef,
    slug: readback.slug,
    version: readback.version,
    verifyJwt: readback.verifyJwt,
    entrypointPath: readback.entrypointPath,
  });
  return readback;
}

/**
 * @deprecated Remplacé par `readbackFromProviderReads`.
 *
 * Conservé uniquement pour que l'ancien nom échoue **explicitement** plutôt que de laisser
 * croire qu'une réponse de métadonnées unique suffirait : c'est précisément l'erreur que le
 * contrôle du 26/11 a relevée.
 */
export function readbackFromManagementApi() {
  throw new Error('READBACK_REQUIRES_BUNDLE_READ — l\'endpoint de métadonnées ne rend aucun contenu');
}

/**
 * Lit une fonction déployée : métadonnées **et** contenu, en lecture seule.
 *
 * Aucune valeur de jeton ne sort d'ici : il n'est utilisé que dans les en-têtes.
 *
 * @param {string} slug Nom de la fonction.
 * @param {{token: string, projectRef?: string, fetchImpl?: typeof fetch}} options
 * @returns {Promise<object>} Bloc `readback`.
 */
export async function fetchReadback(slug, options) {
  const { token, projectRef = PRODUCTION_PROJECT_REF, fetchImpl = fetch } = options;
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('SUPABASE_ACCESS_TOKEN_MISSING');
  }
  const base = `${MANAGEMENT_BASE}/v1/projects/${projectRef}/functions/${encodeURIComponent(slug)}`;
  const headers = { Authorization: `Bearer ${token}` };

  const metaRes = await fetchImpl(base, { method: 'GET', headers: { ...headers, Accept: 'application/json' } });
  if (!metaRes.ok) throw new Error(`READBACK_HTTP_${metaRes.status}`);
  const metadata = await metaRes.json();

  const bodyRes = await fetchImpl(`${base}/body`, {
    method: 'GET',
    headers: { ...headers, Accept: 'multipart/form-data' },
  });
  if (!bodyRes.ok) throw new Error(`READBACK_BODY_HTTP_${bodyRes.status}`);
  const contentType = bodyRes.headers?.get?.('content-type') ?? '';
  if (!String(contentType).toLowerCase().startsWith('multipart/form-data')) {
    throw new Error('READBACK_BODY_NOT_MULTIPART');
  }
  const buffer = Buffer.from(await bodyRes.arrayBuffer());
  const body = parseMultipartFunctionBody(buffer, contentType);
  return readbackFromProviderReads({ metadata, body, requestedSlug: slug }, { projectRef });
}

/**
 * Capture l'**artefact fournisseur original** d'une fonction : les octets multipart bruts,
 * les métadonnées de la même version, et les empreintes qui les lient.
 *
 * ## Pourquoi garder les octets bruts plutôt qu'un JSON normalisé
 *
 * Le contrôle du 26/11 (#459) a demandé de conserver l'artefact fournisseur **original**
 * (octets multipart du body, métadonnées et configuration liées à la version), et de ne pas
 * présenter une représentation reconstruite comme une sauvegarde. Un readback JSON ne
 * conserve que des empreintes : il **identifie** un bundle sans permettre de le restaurer.
 * L'artefact, lui, doit contenir les octets exacts.
 *
 * ## Pourquoi l'artefact ne peut pas vivre dans le dépôt
 *
 * Il contient le source de production ; le dépôt est **public**. La capture est donc écrite
 * sous `MAXIMUS_ROLLBACK_EVIDENCE_ROOT`, **hors du dépôt**, et le fichier scellé n'est
 * jamais committé. Le module refuse une destination située dans `REPO_ROOT`, ce qui évite
 * qu'une « sauvegarde » finisse publiée par mégarde.
 *
 * ## Ce que la capture ne fait pas
 *
 * Elle n'écrit rien en production, ne déploie rien, ne révoque rien. Elle n'invente aucune
 * valeur : sans seconde lecture, ou si les deux lectures ne décrivent pas la même version,
 * elle échoue en nommant le motif (`CAPTURE_BODY_VERSION_MISMATCH`).
 *
 * @param {string} slug Nom de la fonction à capturer.
 * @param {{token: string, projectRef?: string, fetchImpl?: typeof fetch}} options
 * @returns {Promise<{readback: object, artifact: {bytes: Buffer, contentType: string},
 *   metadata: object, sealed: object}>}
 */
export async function captureProviderArtifact(slug, options) {
  const { token, projectRef = PRODUCTION_PROJECT_REF, fetchImpl = fetch } = options;
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('SUPABASE_ACCESS_TOKEN_MISSING');
  }
  const base = `${MANAGEMENT_BASE}/v1/projects/${projectRef}/functions/${encodeURIComponent(slug)}`;
  const headers = { Authorization: `Bearer ${token}` };
  const fetchedAt = new Date().toISOString();

  const metaRes = await fetchImpl(base, { method: 'GET', headers: { ...headers, Accept: 'application/json' } });
  if (!metaRes.ok) throw new Error(`CAPTURE_METADATA_HTTP_${metaRes.status}`);
  const metadata = await metaRes.json();

  const bodyRes = await fetchImpl(`${base}/body`, {
    method: 'GET',
    headers: { ...headers, Accept: 'multipart/form-data' },
  });
  if (!bodyRes.ok) throw new Error(`CAPTURE_BODY_HTTP_${bodyRes.status}`);
  const contentType = bodyRes.headers?.get?.('content-type') ?? '';
  if (!String(contentType).toLowerCase().startsWith('multipart/form-data')) {
    throw new Error('CAPTURE_BODY_NOT_MULTIPART');
  }
  const rawBytes = Buffer.from(await bodyRes.arrayBuffer());
  const body = parseMultipartFunctionBody(rawBytes, contentType);

  // Les deux lectures doivent décrire la même version : sinon l'artefact et la configuration
  // scellés ne désignent pas le même objet, et la « sauvegarde » serait incohérente.
  const bodyMeta = body.metadata;
  if (!bodyMeta || typeof bodyMeta !== 'object') throw new Error('CAPTURE_BODY_WITHOUT_METADATA');
  if (bodyMeta.slug !== (metadata.slug ?? metadata.name)) throw new Error('CAPTURE_BODY_SLUG_MISMATCH');
  if (bodyMeta.version !== metadata.version) throw new Error('CAPTURE_BODY_VERSION_MISMATCH');

  const readback = readbackFromProviderReads(
    { metadata, body, requestedSlug: slug },
    { projectRef, fetchedAt },
  );

  const artifactSha256 = sha256(rawBytes);
  const sealed = {
    schemaVersion: 'rollback-custody-artifact-v1',
    function: slug,
    projectRef,
    capturedAt: fetchedAt,
    // Configuration liée à la version : c'est elle qui distingue deux déploiements au code
    // identique, et c'est elle qu'un reconditionnement doit transporter explicitement.
    version: metadata.version,
    verifyJwt: metadata.verify_jwt,
    status: metadata.status,
    providerEntrypointPath: metadata.entrypoint_path,
    providerEzbrSha256: metadata.ezbr_sha256 ?? null,
    contentType,
    artifactBytes: rawBytes.length,
    artifactSha256,
    // Empreintes de contenu, recalculables depuis l'artefact.
    entrypointSha256: readback.entrypointSha256,
    bundleSha256: readback.bundleSha256,
    configSha256: readback.configSha256,
    dependencies: readback.dependencies,
  };

  return { readback, artifact: { bytes: rawBytes, contentType }, metadata, sealed };
}

/**
 * Vérifie qu'une racine de conservation est utilisable : hors dépôt, donc jamais publiée.
 *
 * Une sauvegarde écrite dans un dépôt public n'est pas une sauvegarde : elle publie le
 * source de production. C'est exactement ce que le mandat interdit.
 *
 * @param {string} evidenceRoot Racine désignée par `MAXIMUS_ROLLBACK_EVIDENCE_ROOT`.
 * @param {string} repoRoot Racine du dépôt.
 * @returns {{ok: boolean, reason?: string}}
 */
export function assertEvidenceRootOutsideRepo(evidenceRoot, repoRoot) {
  if (typeof evidenceRoot !== 'string' || evidenceRoot.trim() === '') {
    return { ok: false, reason: 'EVIDENCE_ROOT_UNSET' };
  }
  const root = resolve(evidenceRoot);
  const repo = resolve(repoRoot);
  if (root === repo || root.startsWith(`${repo}${sep}`)) {
    return { ok: false, reason: 'EVIDENCE_ROOT_INSIDE_REPO' };
  }
  return { ok: true };
}


/**
 * Réaligne `observed` sur le readback sans toucher au reste de l'évidence.
 *
 * `observed` doit décrire exactement ce que le fournisseur vient de rendre : le laisser
 * diverger du readback ferait échouer `READBACK_DISAGREES_WITH_OBSERVED_*`, ce qui est le
 * comportement voulu — on ne « raccorde » pas une déclaration à une lecture, on la remplace.
 *
 * @param {object} evidence Évidence existante.
 * @param {object} readback Bloc readback lu.
 * @returns {object} Nouvelle évidence (l'entrée n'est pas mutée).
 */
export function mergeReadbackIntoEvidence(evidence, readback) {
  return {
    ...evidence,
    observed: {
      ...evidence.observed,
      version: readback.version,
      verifyJwt: readback.verifyJwt,
      entrypointSha256: readback.entrypointSha256,
      dependencies: readback.dependencies,
      bundleSha256: readback.bundleSha256,
      readback,
    },
  };
}

function usage() {
  console.error('Usage :');
  console.error('  SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs '
    + '--function <nom> [--merge <évidence.json>]');
  console.error('  SUPABASE_ACCESS_TOKEN=… MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<dir-hors-dépôt> '
    + 'node scripts/security/collectReadback.mjs --capture <nom>');
  console.error('  node scripts/security/collectReadback.mjs --list');
}

/**
 * CLI de capture : écrit l'artefact original **hors du dépôt** et imprime son sceau.
 *
 * Le sceau (empreintes, version, configuration) est ce qui peut être publié ; les octets du
 * source de production restent dans le répertoire de conservation et ne sont jamais committés.
 *
 * @param {string} slug
 * @returns {Promise<number>} Code de sortie.
 */
async function captureMain(slug) {
  const { REPO_ROOT } = await import('./edgeFunctionDeploymentManifest.mjs');
  const evidenceRoot = process.env[MAXIMUS_EVIDENCE_ROOT_ENV] ?? '';
  const rootCheck = assertEvidenceRootOutsideRepo(evidenceRoot, REPO_ROOT);
  if (!rootCheck.ok) {
    console.error(`Conservation refusée : ${rootCheck.reason}`);
    return 1;
  }
  try {
    const caps = await captureProviderArtifact(slug, {
      token: process.env.SUPABASE_ACCESS_TOKEN ?? '',
    });
    const dir = resolve(evidenceRoot, 'artifacts');
    mkdirSync(dir, { recursive: true });
    const artifactPath = resolve(dir, `${slug}.multipart.bin`);
    const sealPath = resolve(dir, `${slug}.seal.json`);
    writeFileSync(artifactPath, caps.artifact.bytes, { mode: 0o600 });
    writeFileSync(
      sealPath,
      `${JSON.stringify({ ...caps.sealed, artifactPath: `${slug}.multipart.bin` }, null, 2)}\n`,
      { mode: 0o600 },
    );
    // Seul le sceau sort sur stdout : les octets restent hors dépôt.
    process.stdout.write(`${JSON.stringify(caps.sealed, null, 2)}\n`);
    console.error(`Artefact conservé : ${artifactPath} (${caps.sealed.artifactBytes} octets)`);
    return 0;
  } catch (err) {
    console.error(`Capture impossible : ${err.message}`);
    return 1;
  }
}

async function main(argv) {
  const captureIndex = argv.indexOf('--capture');
  if (captureIndex !== -1) {
    const captureSlug = argv[captureIndex + 1];
    if (!captureSlug) {
      usage();
      return 2;
    }
    const knownNames = buildManifest(() => undefined).functions.map((f) => f.name);
    if (!knownNames.includes(captureSlug)) {
      console.error(`Fonction hors périmètre : ${captureSlug}`);
      return 2;
    }
    return captureMain(captureSlug);
  }

  if (argv.includes('--list')) {
    for (const f of buildManifest(() => undefined).functions) {
      console.log(`${f.name}\t${f.deployState}\t${f.prodVersion ?? '-'}\tverify_jwt=${f.prodVerifyJwt}`);
    }
    return 0;
  }

  const fnIndex = argv.indexOf('--function');
  if (fnIndex === -1 || !argv[fnIndex + 1]) {
    usage();
    return 2;
  }

  const slug = argv[fnIndex + 1];
  const known = buildManifest(() => undefined).functions.map((f) => f.name);
  if (!known.includes(slug)) {
    console.error(`Fonction hors périmètre : ${slug}`);
    return 2;
  }

  let readback;
  try {
    readback = await fetchReadback(slug, { token: process.env.SUPABASE_ACCESS_TOKEN ?? '' });
  } catch (err) {
    console.error(`Collecte impossible : ${err.message}`);
    return 1;
  }

  const mergeIndex = argv.indexOf('--merge');
  if (mergeIndex === -1) {
    process.stdout.write(`${JSON.stringify(readback, null, 2)}\n`);
    return 0;
  }

  const evidencePath = argv[mergeIndex + 1];
  if (!evidencePath || !existsSync(resolve(evidencePath))) {
    console.error(`Évidence introuvable : ${evidencePath ?? '(vide)'}`);
    return 2;
  }
  const evidence = JSON.parse(readFileSync(resolve(evidencePath), 'utf8'));
  process.stdout.write(`${JSON.stringify(mergeReadbackIntoEvidence(evidence, readback), null, 2)}\n`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(`Erreur : ${err.message}`);
      process.exit(1);
    });
}
