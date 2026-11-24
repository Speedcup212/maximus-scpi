/**
 * Authentification d'Edge Function compatible clés legacy et nouvelles.
 *
 * Modèle de clés :
 * - Legacy : `anon` / `service_role` (JWT HS256). En mode legacy, la plateforme
 *   `verify_jwt` a déjà validé le JWT avant d'exécuter le handler.
 * - Nouvelles : `sb_publishable_*` (publique) / `sb_secret_*` (backend). Clés opaques,
 *   portées exclusivement sur l'en-tête `apikey` (jamais en `Authorization: Bearer`).
 *
 * INVARIANT DE SÉCURITÉ — fail-closed, jamais permissif par défaut :
 * Une garde ne laisse passer SANS contrôle QUE si `legacyJwt === true` (le JWT a déjà
 * été vérifié par la plateforme) ET qu'aucune clé nouvelle n'est configurée (variable
 * absente). Dans tous les autres cas, la garde REFUSE :
 *   - clés absentes alors que `legacyJwt === false` (verify_jwt désactivé) → 503 ;
 *   - configuration vide (`{}`) ou JSON invalide → 503 (même en mode legacy : une
 *     variable présente mais cassée signale une intention de mode clés) ;
 *   - `apikey` manquante ou ne correspondant à aucune clé acceptée → 401.
 *
 * Règle de déploiement associée (à ne jamais violer) :
 *   - `verify_jwt = false` n'est autorisé QUE si l'une de ces gardes est en place,
 *     ET que les clés correspondantes sont effectivement configurées.
 *   - `legacyJwt` doit refléter l'état réel de `verify_jwt` au déploiement.
 */

export type EnvGetter = (key: string) => string | undefined;

export interface GuardMode {
  /** true si la fonction est déployée avec `verify_jwt` actif (mode legacy). */
  legacyJwt: boolean;
}

type Collected = { present: boolean; values: string[] };

/**
 * Lit une variable JSON (objet { nom: clé }) injectée par la plateforme.
 * - `present` : la variable est définie (même si le contenu est invalide).
 * - `values` : les clés non vides extraites (vide si absent, invalide ou `{}`).
 */
function collect(raw: string | undefined): Collected {
  if (raw === undefined) return { present: false, values: [] };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { present: true, values: [] };
    }
    const values = Object.values(parsed as Record<string, unknown>).filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    );
    return { present: true, values };
  } catch {
    return { present: true, values: [] };
  }
}

function deny(status: number, code: string): Response {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Coeur du contrôle fail-closed. `rawVars` liste les variables de clés pertinentes.
 * Retourne `null` (requête autorisée) uniquement si :
 *   - des clés sont configurées ET `apikey` correspond ; OU
 *   - aucune variable n'est présente ET `legacyJwt === true` (verify_jwt protège).
 */
function gate(
  req: Request,
  getEnv: EnvGetter,
  mode: GuardMode,
  rawVars: string[],
): Response | null {
  let present = false;
  const values: string[] = [];
  for (const rawVar of rawVars) {
    const c = collect(getEnv(rawVar));
    present = present || c.present;
    values.push(...c.values);
  }

  if (!present) {
    return mode.legacyJwt ? null : deny(503, "authentication_not_configured");
  }
  if (values.length === 0) {
    // Variable présente mais vide ou invalide : jamais permissif.
    return deny(503, "authentication_not_configured");
  }
  const apikey = req.headers.get("apikey") ?? "";
  return values.includes(apikey) ? null : deny(401, "unauthorized");
}

/** Lecteur brut de la première clé publishable (sans décision d'auth). */
export function readPublishableKey(getEnv: EnvGetter): string {
  return collect(getEnv("SUPABASE_PUBLISHABLE_KEYS")).values[0] ?? "";
}

/**
 * Endpoint PUBLIC : n'accepte que les clés publishables (`sb_publishable_*`).
 * Une clé secrète, une clé absente ou invalide est rejetée.
 */
export function requirePublishableKey(
  req: Request,
  getEnv: EnvGetter,
  mode: GuardMode,
): Response | null {
  return gate(req, getEnv, mode, ["SUPABASE_PUBLISHABLE_KEYS"]);
}

/**
 * Endpoint PRIVÉ (backend uniquement : cron, pg_net, OIDC GitHub, webhook interne).
 * N'accepte QUE les clés secrètes (`sb_secret_*`). Une clé publishable — publique —
 * est rejetée, même si elle est valide.
 */
export function requireSecretKey(
  req: Request,
  getEnv: EnvGetter,
  mode: GuardMode,
): Response | null {
  return gate(req, getEnv, mode, ["SUPABASE_SECRET_KEYS"]);
}

/**
 * Endpoint MIXTE (frontend + backend pg_net/Netlify) : accepte une clé publishable
 * OU une clé secrète configurée.
 */
export function requireApiKey(
  req: Request,
  getEnv: EnvGetter,
  mode: GuardMode,
): Response | null {
  return gate(req, getEnv, mode, [
    "SUPABASE_PUBLISHABLE_KEYS",
    "SUPABASE_SECRET_KEYS",
  ]);
}
