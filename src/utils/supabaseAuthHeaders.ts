/**
 * En-têtes d'authentification Supabase compatibles avec les DEUX générations de clés :
 * - clés legacy `anon` / `service_role` (JWTs HS256 signés par le JWT secret partagé) ;
 * - nouvelles clés `sb_publishable_*` / `sb_secret_*` (qui ne sont PAS des JWTs).
 *
 * Règle officielle Supabase : les nouvelles clés doivent être envoyées sur l'en-tête
 * `apikey` uniquement. Les envoyer sur `Authorization: Bearer ...` fait échouer la
 * requête avec « Invalid JWT » (la plateforme tente de les parser comme un JWT).
 *
 * Ces helpers suppriment donc le doublon dangereux `Authorization: Bearer <clé>` que
 * certains appels `fetch` manuels utilisaient : la clé est désormais portée uniquement
 * par `apikey`, ce qui fonctionne à la fois avec les clés legacy et les nouvelles clés.
 */

export const SUPABASE_APIKEY_HEADER = 'apikey';

/** Lecture publique PostgREST : clé sur `apikey`, sans `Authorization`. */
export function restHeaders(key: string): Record<string, string> {
  return {
    [SUPABASE_APIKEY_HEADER]: key,
    Accept: 'application/json',
  };
}

/** Appel d'une Edge Function : clé sur `apikey`, sans `Authorization`. */
export function functionHeaders(key: string): Record<string, string> {
  return {
    [SUPABASE_APIKEY_HEADER]: key,
    'Content-Type': 'application/json',
  };
}
