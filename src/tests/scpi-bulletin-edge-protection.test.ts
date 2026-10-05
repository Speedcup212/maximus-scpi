import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Run the real Edge handler without remote dependencies, storage or credentials.
const source = readFileSync('supabase/functions/scpi-bulletin-watch/index.ts', 'utf8')
  .replace(/^import .*;\s*$/gm, '');
const executable = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

async function runFixture(incoming = '2026-T2', rejected: string[] = []) {
  const writes: string[] = [], events: any[] = [];
  const current = { source_period: '2026-T2', source_type: 'bulletin_edge_automated', qa_status: 'manual_verified_official', tof: 89.8 };
  let handler: (request: Request) => Promise<Response>;
  const db: any = {
    storage: { from: () => ({ upload: async () => { writes.push('storage'); return {}; } }) },
    from(table: string) {
      let writing = false;
      const query: any = {
        select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: table === 'scpi_bulletin_runtime_config' ? { value: 'mock-hash' }
          : table === 'scpi_source_registry' ? { scpi_slug: 'novapierre-residentiel', scpi_name: 'Novapierre Residentiel' }
          : table === 'scpi_indicators' ? current : null }),
        upsert: () => { writes.push(table); writing = true; return query; },
        update: () => { writes.push(table); writing = true; return query; },
        single: async () => ({ data: { id: 'mock-bulletin' } }),
        then: (resolve: any) => resolve({ error: null, data: writing ? {} : null }),
      };
      return query;
    },
  };
  const context = vm.createContext({ Request, Response, TextEncoder, TextDecoder, URL, console,
    fixture: { incoming, rejected }, writes, events, db, createClient: () => db,
    Deno: { env: { get: () => 'test-only' }, serve: (fn: any) => { handler = fn; } } });
  vm.runInContext(executable, context);
  vm.runInContext(`
    shaText=async()=>"mock-hash"; shaBytes=async()=>"mock-pdf-hash";
    findBulletin=async()=>({html:false,p:fixture.incoming,k:period(fixture.incoming).k,pdf:"https://official.example/bulletin.pdf",page:"https://official.example",label:""});
    getPdf=async()=>new Uint8Array(1200); extractPdfText=async()=>"official bulletin ".repeat(30);
    parseMetrics=()=>({tof:89.8,capitalisation:100,prix_souscription:200,td:5,nombre_parts:500000,nombre_associes:1000,nombre_immeubles:30,endettement:10,prix_retrait:180,prix_reconstitution:210});
    validate=(raw)=>({r:raw,bad:fixture.rejected});
    startEvent=async()=>"mock-event"; reg=async()=>{}; finish=async(db,id,event)=>events.push(event);
  `, context);
  const response = await handler!(new Request('https://test.example', { method: 'POST', headers: { 'x-cron-token': 'test-token' }, body: JSON.stringify({ slug: 'novapierre-residentiel' }) }));
  return { body: await response.json(), writes, events };
}

describe('same-quarter manual snapshot protection in the real Edge handler', () => {
  it('preserves both live indicators and the associated bulletin without storage writes', async () => {
    const result = await runFixture();
    expect(result.body.status).toBe('protected_snapshot');
    expect(result.writes).toEqual([]);
    expect(result.events[0].step).toBe('edge_protected_snapshot');
    expect(result.events[0].status).toBe('unchanged');
  });
  it('keeps genuine extraction anomalies visible instead of declaring a clean success', async () => {
    const result = await runFixture('2026-T2', ['nombre_parts: incohérent avec la capitalisation']);
    expect(result.body.review_required).toBe(true);
    expect(result.events[0].status).toBe('needs_review');
    expect(result.body.rejected).toHaveLength(1);
    expect(result.writes).toEqual([]);
  });
  it('does not freeze a genuinely newer quarter', async () => {
    const result = await runFixture('2026-T3');
    expect(result.body.status).toBe('updated');
    expect(result.writes).toContain('scpi_indicators');
    expect(result.writes).toContain('scpi_bulletins');
  });
});
