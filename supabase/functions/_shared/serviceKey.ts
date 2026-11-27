/**
 * Lecture de la clé de service (backend → backend) compatible clés legacy et nouvelles.
 *
 * Ordre de résolution :
 * 1. `SUPABASE_SECRET_KEYS` (injectée automatiquement par la plateforme dès qu'une clé
 *    `sb_secret_*` est créée) : objet JSON nommé. On privilégie la clé demandée par `name`,
 *    puis `default`, puis la première entrée.
 * 2. Repli transitoire sur `SUPABASE_SERVICE_ROLE_KEY` (clé legacy `service_role`).
 *
 * Aucune valeur n'est jamais fabriquée : si aucune clé n'est configurée, on renvoie
 * une chaîne vide et l'appelant doit échouer proprement.
 */

export type EnvGetter = (key: string) => string | undefined;

export function readServiceKey(getEnv: EnvGetter, name = 'default'): string {
  try {
    const raw = getEnv('SUPABASE_SECRET_KEYS');
    if (raw) {
      const keys = JSON.parse(raw) as Record<string, string>;
      const key = keys[name] ?? keys['default'] ?? keys[Object.keys(keys)[0]] ?? '';
      if (key) return key;
    }
  } catch {
    /* variable absente ou JSON invalide : repli legacy */
  }
  return getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}
