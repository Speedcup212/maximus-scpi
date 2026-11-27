/**
 * Réponse fournisseur **expurgée**, au format réel, pour tester le collecteur de readback.
 *
 * Pourquoi un fichier de fixture plutôt qu'un objet écrit à la main dans le test :
 * le collecteur doit être éprouvé sur la **forme exacte** que rend Supabase, pas sur une
 * forme commode imaginée pour l'occasion. Cette fixture reproduit donc :
 *
 *  - `GET /v1/projects/{ref}/functions/{slug}` : un objet JSON de **métadonnées seulement**
 *    (`id`, `slug`, `status`, `version`, `verify_jwt`, `entrypoint_path`, `ezbr_sha256`…).
 *    Cet endpoint ne rend **aucun** contenu — c'est le défaut relevé le 26/11 (#459) ;
 *  - `GET /v1/projects/{ref}/functions/{slug}/body` : un corps `multipart/form-data`
 *    contenant une partie JSON de métadonnées puis **une partie par fichier**, chaque
 *    fichier portant son URI temporaire de déploiement comme nom (`file:///tmp/…`), sans
 *    le slug. C'est cette différence de convention qui oblige à normaliser les chemins.
 *
 * **Expurgation.** Aucun source de production n'est publié ici (le dépôt est public) :
 * les contenus de fichiers sont des marqueurs inertes et explicites, pas du code réel.
 * Seule la *structure* est réelle. Les empreintes publiées par le readback sont donc celles
 * de ces marqueurs — c'est sans conséquence, le test vérifie la mécanique, jamais les
 * valeurs de production.
 *
 * Les métadonnées décrivent `scpi-certified-promote` v12, `verify_jwt=false`, telles que
 * constatées par le contrôle indépendant (bundle prod `db3599421a…`, cf. handoff §2.7.5),
 * avec l'entrypoint fournisseur sous URI temporaire — distinct du chemin canonique du dépôt.
 */

const CRLF = '\r\n';
const BOUNDARY = 'f0e4c8a17b39d25c6a10';

/**
 * Partie `metadata` du corps, **telle que le fournisseur la rend réellement**.
 *
 * Constat du 27/11 sur `GET /v1/projects/{ref}/functions/{slug}/body` : elle ne contient
 * **ni `slug` ni `version`** — seulement `deployment_id`, `deno2_entrypoint_path`,
 * `module_count`, `original_size` et `compressed_size`. La fixture précédente inventait un
 * `slug` et une `version` dans cette partie, ce qui rendait les tests verts sur une forme
 * que la production ne produit jamais, et la capture réelle impossible.
 */
const REDACTED_BODY_METADATA = Object.freeze({
  deployment_id: 'ygvsddcpohsnaowofuwc_redacted-deployment-uuid_12',
  original_size: 4211,
  compressed_size: 1187,
  module_count: 3,
  deno2_entrypoint_path: 'source/scpi-certified-promote/index.ts',
});

/** Métadonnées de `GET /functions/{slug}` — elles, seules, portent `slug` et `version`. */
const REDACTED_METADATA = Object.freeze({
  id: 'redacted-function-id',
  slug: 'scpi-certified-promote',
  name: 'scpi-certified-promote',
  status: 'ACTIVE',
  version: 12,
  created_at: 1763000000000,
  updated_at: 1763300000000,
  verify_jwt: false,
  import_map: false,
  entrypoint_path: 'source/scpi-certified-promote/index.ts',
  import_map_path: null,
  ezbr_sha256: 'db3599421ad844e81a031bfbc149345ecd3e791736e7bb1bca4cba00c5fe8e44',
});

/** Marqueurs inertes : structure réelle, contenu volontairement non exécutable. */
const REDACTED_FILES = Object.freeze([
  {
    name: 'source/scpi-certified-promote/index.ts',
    content: '// REDACTED — source de production non publiée (dépôt public)\n'
      + 'export default serve(redactedHandler);\n',
  },
  {
    name: 'source/scpi-certified-promote/matcher.mjs',
    content: '// REDACTED — matcher de production non publié\nexport const match = () => true;\n',
  },
  {
    name: 'source/_shared/serviceKey.ts',
    content: '// REDACTED — dépendance partagée non publiée\nexport const resolveKey = () => null;\n',
  },
]);

/** Construit une partie multipart conforme (en-têtes + CRLF + corps + CRLF). */
function part({ filename = null, contentType = 'text/plain; charset=utf-8', body }) {
  const headers = [];
  if (filename === null) {
    headers.push('Content-Disposition: form-data; name="metadata"');
    headers.push('Content-Type: application/json');
  } else {
    headers.push(`Content-Disposition: form-data; name="file"; filename="${filename}"`);
    headers.push(`Content-Type: ${contentType}`);
  }
  return Buffer.concat([
    Buffer.from(`--${BOUNDARY}${CRLF}${headers.join(CRLF)}${CRLF}${CRLF}`, 'utf8'),
    Buffer.from(body, 'utf8'),
    Buffer.from(CRLF, 'utf8'),
  ]);
}

/** Corps multipart complet : métadonnées puis fichiers, comme le rend le fournisseur. */
export function buildRedactedMultipartBody(files = REDACTED_FILES, metadata = REDACTED_METADATA) {
  return Buffer.concat([
    ...files.map((f) => part({ filename: f.name, body: f.content })),
    part({ body: JSON.stringify(metadata) }),
    Buffer.from(`--${BOUNDARY}--${CRLF}`, 'utf8'),
  ]);
}

export const REDACTED_BODY_CONTENT_TYPE = `multipart/form-data; boundary=${BOUNDARY}`;

/** Ce que le test injecte comme `GET /functions/{slug}` (métadonnées seules). */
export function redactedMetadata(overrides = {}) {
  return { ...REDACTED_METADATA, ...overrides };
}

/**
 * Ce que le test injecte comme partie `metadata` du corps multipart.
 *
 * Distinct de `redactedMetadata()` : les deux lectures ne portent pas les mêmes champs, et
 * les confondre est précisément ce qui masquait le défaut de capture.
 */
export function redactedBodyMetadata(overrides = {}) {
  return { ...REDACTED_BODY_METADATA, ...overrides };
}

/** Ce que le test injecte comme `GET /functions/{slug}/body`. */
export function redactedBody({ files, metadata, contentType } = {}) {
  return {
    contentType: contentType ?? REDACTED_BODY_CONTENT_TYPE,
    buffer: buildRedactedMultipartBody(files ?? REDACTED_FILES, metadata ?? REDACTED_BODY_METADATA),
  };
}

export const REDACTED_FILES_FOR_TEST = REDACTED_FILES;
export const REDACTED_METADATA_FOR_TEST = REDACTED_METADATA;
export const REDACTED_BODY_METADATA_FOR_TEST = REDACTED_BODY_METADATA;
