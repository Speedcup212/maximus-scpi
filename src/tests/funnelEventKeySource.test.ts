import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

// §7.7 du handoff : la résolution de clé du funnel doit journaliser la SOURCE et une
// empreinte SHA-256 tronquée à 12 hexadécimaux, jamais la valeur. Sans le `fp=`, un repli
// legacy silencieux reste indétectable et la panne n'apparaît qu'à la révocation de la clé.
const source = readFileSync(new URL('../../netlify/functions/funnel-event.ts', import.meta.url), 'utf8');
const executable = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

type EndpointResponse = { statusCode: number; body: string };
type EndpointInput = { httpMethod: string; headers: Record<string, string>; body: string };
type EndpointHandler = (event: EndpointInput) => Promise<EndpointResponse>;

const LEGACY = 'test-only-legacy-service-role-key';
const NEW = 'test-only-sb_secret_service_key_new';
const expectedFp = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 12);

const input: EndpointInput = {
  httpMethod: 'POST',
  headers: { origin: 'https://maximusscpi.com' },
  body: JSON.stringify({
    event_name: 'simulation_start',
    session_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
    path: '/simulateur-scpi/',
    metadata: { source: 'simulateur_scpi' },
  }),
};

// Les deux chemins d'empreinte doivent être exercés : la production dispose de Web Crypto,
// un contexte isolé n'en a pas et retombe sur l'implémentation pure JS. Tester un seul des
// deux laisserait l'autre capable de produire une valeur qui ne se recalcule pas.
const MODES = [
  { mode: 'web-crypto', withCrypto: true },
  { mode: 'repli-pur-js', withCrypto: false },
] as const;

function buildHandler(env: Record<string, string>, withCrypto: boolean) {
  const write = vi.fn<typeof fetch>();
  write.mockResolvedValue(new Response(null, { status: 201 }));
  const exports = {} as { handler: EndpointHandler };
  const logs: { level: string; line: string }[] = [];
  const record = (level: string) => (...args: unknown[]) => {
    logs.push({ level, line: args.map(String).join(' ') });
  };
  vm.runInNewContext(executable, {
    exports,
    Buffer,
    Response,
    DataView,
    Uint8Array,
    Uint32Array,
    Math,
    Array,
    Object,
    String,
    Number,
    JSON,
    RegExp,
    Error,
    console: { log: record('log'), warn: record('warn'), error: record('error') },
    fetch: write,
    // Absent du contexte ⇒ `crypto.subtle` lève et le repli pur JS prend le relais.
    ...(withCrypto ? { crypto: globalThis.crypto, TextEncoder } : {}),
    process: { env: { SUPABASE_URL: 'https://example.supabase.co', ...env } },
  });
  return { handler: exports.handler, logs, write };
}

describe.each(MODES)('funnel-event key source proof (§7.7) — $mode', ({ withCrypto }) => {
  it('publie la source et l empreinte de la NOUVELLE clé, calculable indépendamment', async () => {
    const { handler, logs } = buildHandler(
      { SUPABASE_SERVICE_ROLE_KEY_NEW: NEW, SUPABASE_SERVICE_ROLE_KEY: LEGACY },
      withCrypto,
    );

    expect((await handler(input)).statusCode).toBe(204);

    const lines = logs.filter((entry) => entry.line.includes('[key-source] service'));
    expect(lines).toHaveLength(1);
    expect(lines[0].line).toContain('SUPABASE_SERVICE_ROLE_KEY_NEW');
    // Le `fp=` doit être recalculable par la procédure documentée
    // (`printf %s "$VALEUR" | sha256sum | cut -c1-12`), sinon le recoupement
    // indépendant produirait un faux « la clé utilisée n'est pas la nouvelle ».
    expect(lines[0].line).toContain(`(fp=${expectedFp(NEW)})`);
    expect(lines[0].level).toBe('log');
  });

  it('signale un repli legacy en avertissement, avec l empreinte de la clé legacy', async () => {
    const { handler, logs } = buildHandler({ SUPABASE_SERVICE_ROLE_KEY: LEGACY }, withCrypto);

    expect((await handler(input)).statusCode).toBe(204);

    const lines = logs.filter((entry) => entry.line.includes('[key-source] service'));
    expect(lines).toHaveLength(1);
    expect(lines[0].level).toBe('warn');
    expect(lines[0].line).toContain('repli legacy');
    expect(lines[0].line).toContain(`(fp=${expectedFp(LEGACY)})`);
  });

  it('n ajoute jamais la valeur de la clé au journal', async () => {
    const { handler, logs } = buildHandler(
      { SUPABASE_SERVICE_ROLE_KEY_NEW: NEW, SUPABASE_SERVICE_ROLE_KEY: LEGACY },
      withCrypto,
    );

    await handler(input);

    const joined = logs.map((entry) => entry.line).join('\n');
    expect(joined).not.toContain(NEW);
    expect(joined).not.toContain(LEGACY);
  });

  it('refuse la requête sans aucune clé et le signale en erreur', async () => {
    const { handler, logs, write } = buildHandler({}, withCrypto);

    expect((await handler(input)).statusCode).toBe(503);
    expect(write).not.toHaveBeenCalled();
    expect(logs.some((entry) => entry.level === 'error' && entry.line.includes('[key-source]'))).toBe(true);
  });
});
