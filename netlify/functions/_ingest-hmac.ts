import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Séparation du secret HMAC interne de la clé Supabase (migration clés API).
 *
 * Historiquement, le dispatch d'ingestion planifié (`scpi-ingest-scheduled` → cron
 * `30 3 * * *`) signait sa requête vers `scpi-ingest-background` avec la clé
 * `SUPABASE_SERVICE_ROLE_KEY` utilisée comme simple secret de signature — PAS comme
 * credential Supabase. Ce fichier introduit un secret DÉDIÉ `INGEST_HMAC_SECRET`,
 * afin que la clé service_role legacy puisse être révoquée indépendamment.
 *
 * Repli transitoire : tant que la clé legacy n'est pas révoquée, le vérificateur
 * accepte aussi une signature produite avec `SUPABASE_SERVICE_ROLE_KEY`. Le signataire
 * préfère le secret dédié. À retirer après révocation définitive du legacy.
 */

export const INGEST_HMAC_SECRET_VAR = 'INGEST_HMAC_SECRET';

/** Fenêtre de validité d'un timestamp signé (anti-rejeu). */
export const INGEST_HMAC_MAX_AGE_MS = 5 * 60_000;

const payloadFor = (timestamp: string): string => `${timestamp}:scpi-ingest`;

/** Signature HMAC-SHA256 d'un timestamp pour le dispatch d'ingestion. */
export function signIngestDispatch(timestamp: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadFor(timestamp)).digest('hex');
}

/** Signature attendue (alias sémantique côté vérificateur). */
export const expectedIngestSignature = signIngestDispatch;

/**
 * Secrets acceptés pour vérifier une signature, dans l'ordre :
 * 1. `INGEST_HMAC_SECRET` (dédié, préféré) ;
 * 2. `SUPABASE_SERVICE_ROLE_KEY` (repli transitoire, à retirer après révocation).
 */
export function ingestHmacSecrets(getEnv: (key: string) => string | undefined): string[] {
  const dedicated = getEnv(INGEST_HMAC_SECRET_VAR);
  const legacy = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const secrets: string[] = [];
  if (dedicated) secrets.push(dedicated);
  if (legacy && legacy !== dedicated) secrets.push(legacy);
  return secrets;
}

/**
 * Vérifie une signature HMAC contre les secrets acceptés, en temps constant :
 * toutes les signatures attendues sont calculées et comparées (pas de sortie
 * anticipée sur premier match), fenêtre anti-rejeu appliquée en amont.
 */
export function verifyIngestSignature(
  timestamp: string,
  provided: string,
  secrets: string[],
): boolean {
  if (secrets.length === 0 || !timestamp || !provided) return false;

  const ageMs = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(ageMs) || ageMs > INGEST_HMAC_MAX_AGE_MS) return false;

  const providedBuf = Buffer.from(provided, 'utf8');
  let matched = false;
  for (const secret of secrets) {
    const expectedBuf = Buffer.from(expectedIngestSignature(timestamp, secret), 'utf8');
    if (expectedBuf.length === providedBuf.length) {
      matched = timingSafeEqual(expectedBuf, providedBuf) || matched;
    }
  }
  return matched;
}
