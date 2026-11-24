import { describe, expect, it } from 'vitest';
import {
  SUPABASE_APIKEY_HEADER,
  functionHeaders,
  restHeaders,
} from '../utils/supabaseAuthHeaders';
import {
  readPublishableKey,
  requireApiKey,
  requirePublishableKey,
  requireSecretKey,
} from '../../supabase/functions/_shared/auth';
import { readServiceKey } from '../../supabase/functions/_shared/serviceKey';

const KEY = 'sb_publishable_test_00000000000000000000';
const env = (map: Record<string, string>) => (key: string) => map[key];

describe('supabaseAuthHeaders (frontend) — clés legacy et sb_publishable', () => {
  it('restHeaders porte la clé sur apikey et ne reproduit jamais un Bearer', () => {
    const headers = restHeaders(KEY);
    expect(headers[SUPABASE_APIKEY_HEADER]).toBe(KEY);
    expect(headers.Accept).toBe('application/json');
    expect(headers).not.toHaveProperty('Authorization');
    expect(JSON.stringify(headers)).not.toContain('Bearer');
  });

  it('functionHeaders porte la clé sur apikey et ne reproduit jamais un Bearer', () => {
    const headers = functionHeaders(KEY);
    expect(headers[SUPABASE_APIKEY_HEADER]).toBe(KEY);
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers).not.toHaveProperty('Authorization');
    expect(JSON.stringify(headers)).not.toContain('Bearer');
  });
});

describe('edge function auth (transition verify_jwt → apikey publishable)', () => {
  it('lit la clé publishable default depuis SUPABASE_PUBLISHABLE_KEYS', () => {
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: KEY }) });
    expect(readPublishableKey(get)).toBe(KEY);
  });

  it('retourne une chaîne vide si variable absente ou JSON invalide', () => {
    expect(readPublishableKey(env({}))).toBe('');
    expect(readPublishableKey(env({ SUPABASE_PUBLISHABLE_KEYS: 'not-json' }))).toBe('');
  });

  it('mode legacy (aucune clé publishable) : laisse passer — verify_jwt a déjà authentifié', () => {
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { apikey: 'n-importe-quoi' },
    });
    expect(requirePublishableKey(req, env({}))).toBeNull();
  });

  it('mode nouvelles clés : rejette si apikey absent', () => {
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: KEY }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', { method: 'POST' });
    const res = requirePublishableKey(req, get);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('mode nouvelles clés : rejette si apikey ne correspond pas', () => {
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: KEY }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { apikey: 'sb_publishable_mauvais' },
    });
    expect(requirePublishableKey(req, get)?.status).toBe(401);
  });

  it('mode nouvelles clés : accepte la clé publishable exacte', () => {
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: KEY }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { apikey: KEY },
    });
    expect(requirePublishableKey(req, get)).toBeNull();
  });

  it('requirePublishableKey rejette une clé secrète (frontend-only)', () => {
    const get = env({
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: KEY }),
      SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: 'sb_secret_x' }),
    });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { apikey: 'sb_secret_x' },
    });
    expect(requirePublishableKey(req, get)?.status).toBe(401);
  });
});

describe('requireApiKey (frontend + backend pg_net/Netlify)', () => {
  const PUB = 'sb_publishable_pub';
  const SECRET = 'sb_secret_pgnet';

  it('mode legacy : laisse passer (aucune clé configurée)', () => {
    const req = new Request('https://example.supabase.co/functions/v1/x', { method: 'POST' });
    expect(requireApiKey(req, env({}))).toBeNull();
  });

  it('accepte une clé publishable', () => {
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUB }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: PUB },
    });
    expect(requireApiKey(req, get)).toBeNull();
  });

  it('accepte une clé secrète (pg_net / Netlify)', () => {
    const get = env({ SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: SECRET }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: SECRET },
    });
    expect(requireApiKey(req, get)).toBeNull();
  });

  it('rejette une clé inconnue', () => {
    const get = env({
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUB }),
      SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: SECRET }),
    });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: 'sb_unknown' },
    });
    expect(requireApiKey(req, get)?.status).toBe(401);
  });

  it('un JWT utilisateur invalide sur Authorization ne contourne pas le contrôle apikey', () => {
    // Les gardes authentifient via `apikey`, pas via le JWT utilisateur. Un
    // Authorization falsifié ne doit jamais compenser une clé apikey absente.
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUB }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { Authorization: 'Bearer <jwt-invalide>' },
    });
    expect(requireApiKey(req, get)?.status).toBe(401);
  });

  it('une clé apikey valide reste acceptée même avec un Authorization incohérent (auth par clé)', () => {
    // En mode apikey, l'en-tête Authorization (JWT utilisateur) est ignoré par la
    // garde : c'est le `apikey` qui fait foi. L'invalide JWT ne bloque rien car
    // l'endpoint n'utilise pas l'auth utilisateur.
    const get = env({ SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUB }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST',
      headers: { apikey: PUB, Authorization: 'Bearer <jwt-invalide>' },
    });
    expect(requireApiKey(req, get)).toBeNull();
  });
});

describe('requireSecretKey (endpoint privé : cron / pg_net / OIDC)', () => {
  const PUB = 'sb_publishable_pub';
  const SECRET = 'sb_secret_pgnet';

  it('accepte une clé secrète', () => {
    const get = env({ SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: SECRET }) });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: SECRET },
    });
    expect(requireSecretKey(req, get)).toBeNull();
  });

  it('rejette une clé publique (publishable) sur un endpoint privé', () => {
    const get = env({
      SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: SECRET }),
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: PUB }),
    });
    const req = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: PUB },
    });
    expect(requireSecretKey(req, get)?.status).toBe(401);
  });

  it('rejette une clé absente ou invalide', () => {
    const get = env({ SUPABASE_SECRET_KEYS: JSON.stringify({ pgnet_webhooks: SECRET }) });
    const noKey = new Request('https://example.supabase.co/functions/v1/x', { method: 'POST' });
    expect(requireSecretKey(noKey, get)?.status).toBe(401);
    const bad = new Request('https://example.supabase.co/functions/v1/x', {
      method: 'POST', headers: { apikey: 'sb_secret_invalide' },
    });
    expect(requireSecretKey(bad, get)?.status).toBe(401);
  });

  it('mode legacy (aucune clé secrète) : laisse passer — verify_jwt protège', () => {
    const req = new Request('https://example.supabase.co/functions/v1/x', { method: 'POST' });
    expect(requireSecretKey(req, env({}))).toBeNull();
  });
});

describe('readServiceKey (backend → backend)', () => {
  const SECRET = 'sb_secret_test_0000000000000000000000';

  it('privilégie SUPABASE_SECRET_KEYS.default', () => {
    const get = env({ SUPABASE_SECRET_KEYS: JSON.stringify({ default: SECRET }) });
    expect(readServiceKey(get)).toBe(SECRET);
  });

  it('lit une clé nommée (ex: scpi_agents)', () => {
    const get = env({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: 'sb_secret_default', scpi_agents: SECRET }),
    });
    expect(readServiceKey(get, 'scpi_agents')).toBe(SECRET);
  });

  it('replie sur default puis sur la première entrée si le nom est absent', () => {
    const get = env({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: 'sb_secret_default', netlify: SECRET }),
    });
    expect(readServiceKey(get, 'inconnu')).toBe('sb_secret_default');
    expect(readServiceKey(env({ SUPABASE_SECRET_KEYS: JSON.stringify({ netlify: SECRET }) }), 'inconnu')).toBe(SECRET);
  });

  it('repli transitoire sur SUPABASE_SERVICE_ROLE_KEY', () => {
    const get = env({ SUPABASE_SERVICE_ROLE_KEY: 'legacy-service-role' });
    expect(readServiceKey(get)).toBe('legacy-service-role');
  });

  it('préfère la nouvelle clé quand les deux sont présentes', () => {
    const get = env({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: SECRET }),
      SUPABASE_SERVICE_ROLE_KEY: 'legacy-service-role',
    });
    expect(readServiceKey(get)).toBe(SECRET);
  });

  it('ne fabrique jamais de valeur : chaîne vide si aucune clé', () => {
    expect(readServiceKey(env({}))).toBe('');
    expect(readServiceKey(env({ SUPABASE_SECRET_KEYS: 'not-json' }))).toBe('');
  });
});
