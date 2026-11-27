import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../../netlify/functions/funnel-event';
import { keyFingerprint, resolveServiceKey } from '../../netlify/functions/_keySource';

// §7.7 du handoff : la résolution de clé du funnel doit journaliser la SOURCE et une
// empreinte SHA-256 tronquée à 12 hexadécimaux, jamais la valeur. Sans le `fp=`, un repli
// legacy silencieux reste indétectable et la panne n'apparaît qu'à la révocation de la clé.
//
// Le handler est importé réellement (résolution de modules, `node:crypto` du runtime) et
// non retranspilé dans un bac à sable `vm` : c'est le runtime de production qui doit être
// prouvé, pas une réimplémentation de test. C'est précisément un écart entre les deux qui
// avait conduit à embarquer un SHA-256 maison dans une Netlify Function.
const LEGACY = 'test-only-legacy-service-role-key';
const NEW = 'test-only-sb_secret_service_key_new';
const expectedFp = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 12);

const event = {
  httpMethod: 'POST',
  headers: { origin: 'https://maximusscpi.com' },
  body: JSON.stringify({
    event_name: 'simulation_start',
    session_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
    path: '/simulateur-scpi/',
    metadata: { source: 'simulateur_scpi' },
  }),
};

let logs: { level: string; line: string }[];

beforeEach(() => {
  logs = [];
  const record = (level: string) => (...args: unknown[]) => {
    logs.push({ level, line: args.map(String).join(' ') });
  };
  vi.spyOn(console, 'log').mockImplementation(record('log'));
  vi.spyOn(console, 'warn').mockImplementation(record('warn'));
  vi.spyOn(console, 'error').mockImplementation(record('error'));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 201 })));
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY_NEW', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const keySourceLines = () => logs.filter((entry) => entry.line.includes('[key-source] service'));

describe('funnel-event key source proof (§7.7)', () => {
  it('publie la source et l empreinte de la NOUVELLE clé, calculable indépendamment', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY_NEW', NEW);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', LEGACY);

    expect((await handler(event)).statusCode).toBe(204);

    const lines = keySourceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].line).toContain('SUPABASE_SERVICE_ROLE_KEY_NEW');
    // Le `fp=` doit être recalculable par la procédure documentée
    // (`printf %s "$VALEUR" | sha256sum | cut -c1-12`), sinon le recoupement
    // indépendant produirait un faux « la clé utilisée n'est pas la nouvelle ».
    expect(lines[0].line).toContain(`(fp=${expectedFp(NEW)})`);
    expect(lines[0].level).toBe('log');
  });

  it('signale un repli legacy en avertissement, avec l empreinte de la clé legacy', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', LEGACY);

    expect((await handler(event)).statusCode).toBe(204);

    const lines = keySourceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].level).toBe('warn');
    // Format documenté au §7.7 : `(repli legacy, fp=…)` — le champ `fp=` reste extractible.
    expect(lines[0].line).toContain('(repli legacy');
    expect(lines[0].line).toContain(`fp=${expectedFp(LEGACY)})`);
  });

  it('n ajoute jamais la valeur de la clé au journal', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY_NEW', NEW);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', LEGACY);

    await handler(event);

    const joined = logs.map((entry) => entry.line).join('\n');
    expect(joined).toContain('[key-source]');
    expect(joined).not.toContain(NEW);
    expect(joined).not.toContain(LEGACY);
  });

  it('refuse la requête sans aucune clé et le signale en erreur', async () => {
    expect((await handler(event)).statusCode).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
    expect(logs.some((entry) => entry.level === 'error' && entry.line.includes('[key-source]'))).toBe(true);
  });
});

describe('empreinte §7.7 — SHA-256 du runtime sur toutes les tailles de bloc', () => {
  // Une clé `sb_secret_*` dépasse parfois 64 octets : la paddingisation multi-blocs doit
  // être exacte. On compare au `node:crypto` de référence, jamais à une constante recopiée.
  const LENGTHS = [1, 3, 31, 55, 56, 63, 64, 65, 119, 120, 241, 1000];

  it.each(LENGTHS)('longueur %i : empreinte identique à node:crypto', (length) => {
    const value = 'k'.repeat(length);
    expect(keyFingerprint(value)).toBe(expectedFp(value));
  });

  it('une clé absente ne produit AUCUNE empreinte, surtout pas celle de la chaîne vide', () => {
    // SHA-256('') = e3b0c44298fc… : une empreinte plausible pour une variable non renseignée
    // ferait croire à une clé configurée. Le contrat est « pas de valeur, pas de fp ».
    expect(keyFingerprint('')).toBe('');
    expect(expectedFp('')).toBe('e3b0c44298fc');
  });

  it('produit toujours 12 hexadécimaux', () => {
    const value = 'sb_secret_' + 'a'.repeat(80);
    expect(keyFingerprint(value)).toMatch(/^[0-9a-f]{12}$/);
  });

  it('le handler ne peut pas basculer silencieusement sur une autre implémentation', () => {
    // Un repli maison produisant un autre condensat avait été introduit pour satisfaire un
    // bac à sable de test. Il ne doit pas revenir : une seule implémentation, celle du runtime.
    const source = readFileSync(new URL('../../netlify/functions/funnel-event.ts', import.meta.url), 'utf8');
    expect(source).toContain("from './_keySource'");
    expect(source).not.toMatch(/sha256Hex|SHA256_K|crypto\.subtle/);
  });

  it('le module partagé s appuie sur node:crypto, pas sur une implémentation maison', () => {
    const source = readFileSync(new URL('../../netlify/functions/_keySource.ts', import.meta.url), 'utf8');
    expect(source).toContain("createHash('sha256')");
  });

  it('resolveServiceKey priorise la nouvelle clé puis les replis legacy fournis', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveServiceKey({
      SUPABASE_SERVICE_ROLE_KEY_NEW: NEW,
      SUPABASE_SERVICE_ROLE_KEY: LEGACY,
    })).toEqual({ key: NEW, source: 'SUPABASE_SERVICE_ROLE_KEY_NEW' });
    expect(resolveServiceKey({ SUPABASE_SERVICE_ROLE_KEY: LEGACY }))
      .toEqual({ key: LEGACY, source: 'SUPABASE_SERVICE_ROLE_KEY' });
    expect(resolveServiceKey({ SUPABASE_SECRET_KEY: 'test-only-third' }, ['SUPABASE_SECRET_KEY']))
      .toEqual({ key: 'test-only-third', source: 'SUPABASE_SECRET_KEY' });
    expect(resolveServiceKey({})).toEqual({ key: '', source: '' });
  });
});
