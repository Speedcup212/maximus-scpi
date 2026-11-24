/**
 * Authentification d'Edge Function compatible clés legacy et nouvelles.
 *
 * Deux modes, séparés par la présence de la variable `SUPABASE_PUBLISHABLE_KEYS`
 * (injectée automatiquement par la plateforme dès que des clés publishable/secret
 * sont créées dans le dashboard) :
 *
 * 1. Mode legacy (variable absente) :
 *    la plateforme `verify_jwt` a déjà validé le JWT `anon` présent sur
 *    `Authorization: Bearer ...` avant d'exécuter le handler. Aucun contrôle
 *    supplémentaire n'est nécessaire ici.
 *
 * 2. Mode nouvelles clés (variable présente) :
 *    la fonction est déployée avec `verify_jwt = false` (flag CLI `--no-verify-jwt`
 *    ou `config.toml`). La clé `sb_publishable_*` ou `sb_secret_*` doit alors être
 *    présentée sur l'en-tête `apikey` et correspondre à une clé configurée, faute
 *    de quoi la requête est rejetée en 401. C'est le mécanisme d'authentification
 *    de remplacement : jamais `verify_jwt = false` sans ce contrôle actif.
 */

export type EnvGetter = (key: string) => string | undefined;

function keyValues(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const keys = JSON.parse(raw) as Record<string, string>;
    return Object.values(keys).filter((v): v is string => Boolean(v));
  } catch {
    return [];
  }
}

export function readPublishableKey(getEnv: EnvGetter): string {
  return keyValues(getEnv('SUPABASE_PUBLISHABLE_KEYS'))[0] ?? '';
}

function readSecretKeys(getEnv: EnvGetter): string[] {
  return keyValues(getEnv('SUPABASE_SECRET_KEYS'));
}

function deny(): Response {
  return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Rejette la requête si la clé `apikey` ne correspond pas à une clé publishable
 * configurée. En mode legacy (aucune clé publishable), laisse passer : `verify_jwt`
 * a déjà authentifié le JWT `anon`.
 */
export function requirePublishableKey(
  req: Request,
  getEnv: EnvGetter,
): Response | null {
  const publishable = readPublishableKey(getEnv);
  if (!publishable) return null;
  const apikey = req.headers.get('apikey') ?? '';
  return apikey === publishable ? null : deny();
}

/**
 * Variante pour les fonctions appelées à la fois par le frontend (clé publishable)
 * ET par des services backend (pg_net / Netlify, clés secrètes). Accepte toute clé
 * publishable OU secrète configurée. Rejette en 401 uniquement lorsqu'au moins une
 * clé est configurée et qu'aucune ne correspond.
 */
export function requireApiKey(
  req: Request,
  getEnv: EnvGetter,
): Response | null {
  const accepted = new Set<string>([
    ...keyValues(getEnv('SUPABASE_PUBLISHABLE_KEYS')),
    ...readSecretKeys(getEnv),
  ]);
  if (accepted.size === 0) return null;
  const apikey = req.headers.get('apikey') ?? '';
  return accepted.has(apikey) ? null : deny();
}
