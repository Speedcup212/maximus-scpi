/**
 * Collecte du readback fournisseur pour une fonction du périmètre de migration.
 *
 * Objet : produire le bloc `observed.readback` de l'évidence **à partir d'une lecture réelle**
 * de la fonction déployée, jamais d'une ressaisie manuelle. Le contrôle indépendant du 25/11
 * a établi que comparer `observed.version` au registre statique du dépôt revient à comparer
 * une croyance à elle-même ; la seule pièce qui dise ce que la production contient est une
 * lecture datée du fournisseur.
 *
 * Ce que le script NE fait pas, volontairement :
 *  - il ne déploie rien, ne modifie rien, ne révoque rien ;
 *  - il n'écrit aucun fichier par défaut (`--json` sur stdout seulement) ;
 *  - il ne lit aucun secret applicatif et n'émet aucun jeton dans sa sortie ;
 *  - il n'invente **jamais** de valeur : sans jeton ou sans réponse exploitable, il échoue
 *    en nommant le motif, plutôt que de produire un readback plausible.
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
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PRODUCTION_PROJECT_REF,
  READBACK_SOURCES,
  readbackConfigSha256,
  buildManifest,
} from './edgeFunctionDeploymentManifest.mjs';

const MANAGEMENT_BASE = 'https://api.supabase.com';
/** Source de readback effectivement utilisée par ce script. */
const READBACK_SOURCE = READBACK_SOURCES[0].replace('{ref}', PRODUCTION_PROJECT_REF);

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
  const lines = entries
    .slice()
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((e) => `${e.path}\n${e.sha256 ?? 'MISSING'}\n`)
    .join('');
  return sha256(lines);
}

/**
 * Transforme une réponse de l'API de management en bloc `readback`.
 *
 * Fonction pure : elle ne fait aucun appel réseau, ce qui permet de la tester sur une
 * réponse enregistrée. Toute réponse incomplète lève une erreur explicite au lieu de
 * produire des `undefined` silencieux.
 *
 * @param {object} payload Réponse `GET /v1/projects/{ref}/functions/{slug}`.
 * @param {{projectRef?: string, fetchedAt?: string}} [options]
 * @returns {object} Bloc `readback` prêt à être inséré dans `observed`.
 */
export function readbackFromManagementApi(payload, options = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('READBACK_PAYLOAD_NOT_AN_OBJECT');
  }
  const slug = payload.slug ?? payload.name;
  if (typeof slug !== 'string' || slug === '') throw new Error('READBACK_PAYLOAD_WITHOUT_SLUG');
  if (!Number.isInteger(payload.version)) throw new Error('READBACK_PAYLOAD_WITHOUT_VERSION');
  if (typeof payload.verify_jwt !== 'boolean') throw new Error('READBACK_PAYLOAD_WITHOUT_VERIFY_JWT');

  const files = Array.isArray(payload.files) ? payload.files : [];
  const entrypointPath = payload.entrypoint_path ?? `supabase/functions/${slug}/index.ts`;
  const entrypointFile = files.find((f) => f.name === entrypointPath || f.path === entrypointPath)
    ?? files.find((f) => /index\.ts$/.test(f.name ?? f.path ?? ''));
  if (!entrypointFile || typeof entrypointFile.content !== 'string') {
    throw new Error('READBACK_PAYLOAD_WITHOUT_ENTRYPOINT_CONTENT');
  }

  const dependencies = files
    .filter((f) => f !== entrypointFile)
    .filter((f) => typeof (f.name ?? f.path) === 'string')
    .map((f) => ({
      path: String(f.name ?? f.path).replace(new RegExp(`^supabase/functions/${slug}/`), ''),
      sha256: sha256(Buffer.from(f.content ?? '', 'utf8')),
      bytes: Buffer.byteLength(f.content ?? '', 'utf8'),
    }));

  const entrypointSha256 = sha256(Buffer.from(entrypointFile.content, 'utf8'));
  const projectRef = options.projectRef ?? PRODUCTION_PROJECT_REF;
  const readback = {
    source: READBACK_SOURCE,
    fetchedAt: options.fetchedAt ?? new Date().toISOString(),
    projectRef,
    slug,
    version: payload.version,
    verifyJwt: payload.verify_jwt,
    entrypointPath,
    entrypointSha256,
    dependencies,
    bundleSha256: bundleFingerprintFromEntries([
      { path: `${slug}/index.ts`, sha256: entrypointSha256 },
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
 * Lit une fonction déployée via l'API de management Supabase.
 *
 * Aucune valeur de jeton ne sort d'ici : il n'est utilisé que dans l'en-tête de la requête.
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
  const url = `${MANAGEMENT_BASE}/v1/projects/${projectRef}/functions/${encodeURIComponent(slug)}`;
  const res = await fetchImpl(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`READBACK_HTTP_${res.status}`);
  const payload = await res.json();
  return readbackFromManagementApi(payload, { projectRef });
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
  console.error('  node scripts/security/collectReadback.mjs --list');
}

async function main(argv) {
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
