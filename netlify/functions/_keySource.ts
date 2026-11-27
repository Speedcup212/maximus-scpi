import { createHash } from 'node:crypto';

/**
 * Observabilité de la bascule de clés Supabase (preuve d'utilisation effective).
 *
 * Le motif `NOUVELLE || legacy` peut masquer un repli silencieux : si la nouvelle
 * variable est absente/vide, le code retombe sur la clé legacy sans qu'on le voie,
 * et tout « fonctionne » jusqu'à la révocation (panne alors). Ces helpers loggent
 * la SOURCE de la clé utilisée (nom de variable) et une empreinte tronquée
 * SHA-256 (12 hex) — jamais la valeur — afin de prouver, sans l'exposer, que la
 * nouvelle clé est réellement consommée.
 *
 * Lecture attendue dans les logs Netlify :
 *   [key-source] service ← SUPABASE_SERVICE_ROLE_KEY_NEW (fp=xxxxxxxxxxxx)   → nouvelle clé active
 *   [key-source] service ← SUPABASE_SERVICE_ROLE_KEY (repli legacy, fp=...)  → repli (à corriger)
 */

type Env = Record<string, string | undefined>;

const fingerprint = (value: string): string =>
  value ? createHash('sha256').update(value).digest('hex').slice(0, 12) : '';

function resolveKey(
  env: Env,
  label: string,
  primary: string,
  legacy: string[],
): { key: string; source: string } {
  const primaryValue = env[primary];
  if (primaryValue) {
    console.log(`[key-source] ${label} <- ${primary} (fp=${fingerprint(primaryValue)})`);
    return { key: primaryValue, source: primary };
  }
  for (const name of legacy) {
    const value = env[name];
    if (value) {
      console.warn(`[key-source] ${label} <- ${name} (repli legacy, fp=${fingerprint(value)})`);
      return { key: value, source: name };
    }
  }
  console.error(`[key-source] ${label} <- aucune clé (${[primary, ...legacy].join(' / ')})`);
  return { key: '', source: '' };
}

/** Résout la clé backend (service) : `SUPABASE_SERVICE_ROLE_KEY_NEW` puis replis legacy. */
export function resolveServiceKey(
  env: Env,
  extraLegacy: string[] = [],
): { key: string; source: string } {
  return resolveKey(env, 'service', 'SUPABASE_SERVICE_ROLE_KEY_NEW', [
    'SUPABASE_SERVICE_ROLE_KEY',
    ...extraLegacy,
  ]);
}

/** Résout la clé publique (anon) : `VITE_SUPABASE_ANON_KEY_NEW` puis repli legacy. */
export function resolveAnonKey(env: Env): { key: string; source: string } {
  return resolveKey(env, 'anon', 'VITE_SUPABASE_ANON_KEY_NEW', ['VITE_SUPABASE_ANON_KEY']);
}
