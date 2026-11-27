import { describe, expect, it } from 'vitest';
import {
  INGEST_HMAC_SECRET_VAR,
  ingestHmacSecrets,
  signIngestDispatch,
  verifyIngestSignature,
} from '../../netlify/functions/_ingest-hmac';

const env = (map: Record<string, string | undefined>) => (key: string) => map[key];

describe('séparation du secret HMAC d’ingestion (INGEST_HMAC_SECRET)', () => {
  it('signe et vérifie avec le secret dédié', () => {
    const timestamp = String(Date.now());
    const sig = signIngestDispatch(timestamp, 'dedicated-secret');
    expect(
      verifyIngestSignature(timestamp, sig, ['dedicated-secret']),
    ).toBe(true);
  });

  it('préfère INGEST_HMAC_SECRET puis replie sur SUPABASE_SERVICE_ROLE_KEY', () => {
    const secrets = ingestHmacSecrets(
      env({ [INGEST_HMAC_SECRET_VAR]: 'new', SUPABASE_SERVICE_ROLE_KEY: 'old' }),
    );
    expect(secrets).toEqual(['new', 'old']);
  });

  it('replie sur le legacy seul si le secret dédié est absent', () => {
    const secrets = ingestHmacSecrets(
      env({ SUPABASE_SERVICE_ROLE_KEY: 'old' }),
    );
    expect(secrets).toEqual(['old']);
  });

  it('ne duplique pas le secret quand dédié === legacy', () => {
    const secrets = ingestHmacSecrets(
      env({ [INGEST_HMAC_SECRET_VAR]: 'same', SUPABASE_SERVICE_ROLE_KEY: 'same' }),
    );
    expect(secrets).toEqual(['same']);
  });

  it('renvoie une liste vide sans aucun secret', () => {
    expect(ingestHmacSecrets(env({}))).toEqual([]);
  });

  it('accepte une signature legacy pendant la transition (double fenêtre)', () => {
    const timestamp = String(Date.now());
    const sig = signIngestDispatch(timestamp, 'old');
    expect(verifyIngestSignature(timestamp, sig, ['new', 'old'])).toBe(true);
    expect(verifyIngestSignature(timestamp, sig, ['new'])).toBe(false);
  });

  it('rejette une signature invalide même si un secret est configuré', () => {
    const timestamp = String(Date.now());
    expect(verifyIngestSignature(timestamp, 'bad-signature', ['new'])).toBe(false);
  });

  it('rejette un timestamp absent, non numérique ou expiré (anti-rejeu)', () => {
    const now = String(Date.now());
    const sig = signIngestDispatch(now, 'new');
    expect(verifyIngestSignature('', sig, ['new'])).toBe(false);
    expect(verifyIngestSignature('not-a-number', sig, ['new'])).toBe(false);
    const expired = String(Date.now() - 6 * 60_000);
    expect(verifyIngestSignature(expired, signIngestDispatch(expired, 'new'), ['new'])).toBe(false);
  });

  it('rejette sans secret configuré (fail-closed)', () => {
    const timestamp = String(Date.now());
    const sig = signIngestDispatch(timestamp, 'new');
    expect(verifyIngestSignature(timestamp, sig, [])).toBe(false);
  });
});
