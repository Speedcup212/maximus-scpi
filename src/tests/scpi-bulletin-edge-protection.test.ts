import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { preserveIndependentIssuerProof } from '../../supabase/functions/scpi-bulletin-watch/sourceProvenance.mjs';

// Run the real Edge handler without remote dependencies, storage or credentials.
const source = readFileSync('supabase/functions/scpi-bulletin-watch/index.ts', 'utf8')
  .replace(/^import .*;\s*$/gm, '');
const executable = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

async function runFixture(incoming = '2026-T2', rejected: string[] = [], allowedHosts = ['official.example'], pdfText?: string) {
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
          : table === 'scpi_source_connectors' ? { allowed_hosts: allowedHosts }
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
    fixture: { incoming, rejected, pdfText }, writes, events, db, createClient: () => db,
    preserveIndependentIssuerProof,
    Deno: { env: { get: () => 'test-only' }, serve: (fn: any) => { handler = fn; } } });
  vm.runInContext(executable, context);
  vm.runInContext(`
    shaText=async()=>"mock-hash"; shaBytes=async()=>"mock-pdf-hash";
    findBulletin=async()=>({html:false,p:fixture.incoming,k:period(fixture.incoming).k,pdf:"https://official.example/bulletin.pdf",page:"https://official.example",label:""});
    getPdf=async()=>new Uint8Array(1200);
    extractPdfText=async()=>fixture.pdfText || (
      "SCPI Novapierre Residentiel Bulletin Trimestriel d Information N  " +
      fixture.incoming.replace("-", " ") + " | Période analysée " +
      fixture.incoming.replace("-", " ") + " . "
    ).repeat(20);
    parseMetrics=()=>({tof:89.8,capitalisation:100,prix_souscription:200,td:5,nombre_parts:500000,nombre_associes:1000,nombre_immeubles:30,endettement:10,prix_retrait:180,prix_reconstitution:210});
    validate=(raw)=>({r:raw,bad:fixture.rejected});
    startEvent=async()=>"mock-event"; reg=async()=>{}; finish=async(db,id,event)=>events.push(event);
  `, context);
  const response = await handler!(new Request('https://test.example', { method: 'POST', headers: { 'x-cron-token': 'test-token' }, body: JSON.stringify({ slug: 'novapierre-residentiel' }) }));
  return { body: await response.json(), writes, events };
}

describe('same-quarter manual snapshot protection in the real Edge handler', () => {
  it('rejects an unregistered issuer before extraction or writes', async () => {
    const result = await runFixture('2026-T2', [], []);
    expect(result.body.status).toBe('issuer_bulletin_host_rejected');
    expect(result.writes).toEqual([]);
    expect(result.events[0].step).toBe('issuer_host_gate');
  });
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
  it('rejects an issuer statutes document even when the HTML link says T1 2026', async () => {
    const pdfText = (
      "SCPI Novapierre Residentiel Note d information et statuts "
      + "Actualisation 02.01.2026. Bilan du 1er trimestre 2026. "
    ).repeat(22);
    const result = await runFixture('2026-T1', [], ['official.example'], pdfText);
    expect(result.body.status).toBe('issuer_pdf_document_identity_rejected');
    expect(result.body.reason).toBe('ISSUER_PDF_DOCUMENT_KIND_MISMATCH');
    expect(result.events[0].step).toBe('edge_pdf_cover_identity_gate');
    expect(result.writes).toEqual([]);
  });

  it('rejects a genuine bulletin for a different quarter before Storage writes', async () => {
    const pdfText = (
      "SCPI Novapierre Residentiel Bulletin trimestriel d Information "
      + "N 2026 T1. Période analysée 1er trimestre 2026. "
    ).repeat(20);
    const result = await runFixture('2026-T2', [], ['official.example'], pdfText);
    expect(result.body.reason).toBe('ISSUER_PDF_COVER_PERIOD_MISMATCH');
    expect(result.writes).toEqual([]);
  });

  it('rejects an unrelated fund despite an apparently matching quarter', async () => {
    const pdfText = (
      "SCPI Autre Fonds Bulletin trimestriel d Information "
      + "N 2026 T2. Période analysée 2e trimestre 2026. "
    ).repeat(20);
    const result = await runFixture('2026-T2', [], ['official.example'], pdfText);
    expect(result.body.reason).toBe('ISSUER_PDF_FUND_IDENTITY_MISMATCH');
    expect(result.writes).toEqual([]);
  });

  it('rejects a semestrial bulletin labelled quarterly by an external index', async () => {
    const pdfText = (
      "SCPI Novapierre Residentiel Bulletin semestriel d Information "
      + "Premier semestre 2026. Période analysée S1 2026. "
    ).repeat(20);
    const result = await runFixture('2026-T2', [], ['official.example'], pdfText);
    expect(result.body.reason).toBe('ISSUER_PDF_SEMESTER_NOT_QUARTER');
    expect(result.writes).toEqual([]);
  });

  it('keeps an ASPIM-labelled issuer TOF candidate but requires independent QA', async () => {
    const pdfText = (
      "SCPI Novapierre Residentiel Bulletin trimestriel d Information " +
      "N 2026 T3. Période analysée 3e trimestre 2026. " +
      "TOF ASPIM 89,8 % ; locaux vacants 10,2 %. "
    ).repeat(20);
    const result = await runFixture('2026-T3', [], ['official.example'], pdfText);
    expect(result.body.status).toBe('needs_review');
    expect(result.body.verification).toBe('incomplete');
    expect(result.body.rejected).toContain(
      'TOF ASPIM: candidat officiel à valider par preuve PDF/page et QA indépendante'
    );
    expect(result.writes).not.toContain('scpi_indicators');
    expect(result.writes).toContain('scpi_bulletins');
  });

  it('stages a newer quarter for source-page QA without publishing it', async () => {
    const result = await runFixture('2026-T3');
    expect(result.body.status).toBe('needs_review');
    expect(result.body.verification).toBe('verified');
    expect(result.events[0].step).toBe('edge_staged_independent_qa');
    expect(result.writes).not.toContain('scpi_indicators');
    expect(result.writes).toContain('storage');
    expect(result.writes).toContain('scpi_bulletins');
  });
});
