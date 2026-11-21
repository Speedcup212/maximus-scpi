import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { authenticate, decodeInpiPdf, downloadAct, listActs, listWithdrawnActIds, normaliseAct, validateSiren } from './lib.mjs';

const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF');
const response = (data, headers = {}) => new Response(data, { status: 200, headers });

test('SIREN is 9 digits, no manager-name matching', () => {
  assert.equal(validateSiren('123456789'), '123456789');
  for (const bad of [' 123456789', '12345678', '1234567890', 'abc456789', '']) {
    assert.throws(() => validateSiren(bad), /SIREN invalide/);
  }
});

test('public, restricted and withdrawn acts remain distinguishable', () => {
  const publicAct = normaliseAct({ id:'id1', siren:'123456789', confidentiality:'Public',
    deleted:false, typeRdd:[{typeActe:'Statuts mis à jour'}] }, '123456789');
  assert.equal(publicAct.public, true);
  assert.equal(publicAct.act_types[0].typeActe, 'Statuts mis à jour');
  assert.equal(normaliseAct({id:'id2', confidentiality:'Confidentiel'}, '123456789').public, false);
  assert.equal(normaliseAct({id:'id3', deleted:true}, '123456789').deleted, true);
  assert.throws(() => normaliseAct({id:'id4', siren:'987654321'}, '123456789'), /divergent/);
  assert.throws(() => normaliseAct({id:'../escape'}, '123456789'), /invalide/);
});

test('binary PDF and INPI data-uri base64 PDF produce same digest', () => {
  const direct = decodeInpiPdf(pdf, 'application/pdf');
  const dataUri = decodeInpiPdf(Buffer.from('data:application/pdf;base64,' + pdf.toString('base64')));
  const jsonUri = decodeInpiPdf(Buffer.from(JSON.stringify({ binaryFile: 'data:application/pdf;base64,' + pdf.toString('base64') })));
  assert.equal(direct.sha256, createHash('sha256').update(pdf).digest('hex'));
  assert.equal(dataUri.sha256, direct.sha256);
  assert.equal(jsonUri.sha256, direct.sha256);
  assert.deepEqual(direct.bytes, pdf);
});

test('HTML, fake PDF and non-base64 content are rejected', () => {
  for (const data of ['<html>404</html>', '{"error":"Not found"}',
    'data:application/pdf;base64,not!base64', 'data:text/plain;base64,Zm9v']) {
    assert.throws(() => decodeInpiPdf(Buffer.from(data)), /PDF|base64|Base64/);
  }
});

test('authentication uses official fixed host and bearer token only in subsequent requests', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/sso/login')) return response(JSON.stringify({token:'secret-token'}), {'Content-Type':'application/json'});
    if (url.endsWith('/api/companies/123456789/attachments')) return response(JSON.stringify({
      actes:[{id:'ABC001',siren:'123456789',confidentiality:'Public',deleted:false}],
      bilans:[],
    }), {'Content-Type':'application/json'});
    if (url.endsWith('/api/actes/ABC001/download')) return response(pdf, {'Content-Type':'application/pdf'});
    throw new Error('unexpected URL');
  };
  const token = await authenticate({username:'user@example.org',password:'not-a-real-secret',fetcher});
  const acts = await listActs('123456789', token, fetcher);
  const downloaded = await downloadAct(acts[0].inpi_id, token, fetcher);
  assert.equal(acts.length, 1);
  assert.deepEqual(downloaded.bytes, pdf);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(x => x.url.startsWith('https://registre-national-entreprises.inpi.fr/api/')));
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer secret-token');
});

test('unexpected or malformed INPI attachments fail closed', async () => {
  const fetcher = async () => response('{}', {'Content-Type':'application/json'});
  await assert.rejects(() => listActs('123456789', 'token', fetcher), /Format liste/);
});


test('differential withdrawals are collected even if omitted from current attachments', async () => {
  const fetcher = async (url) => {
    assert.match(url, /\/api\/actes\?/);
    assert.match(url, /siren%5B%5D=123456789/);
    return response(JSON.stringify([
      { id:'withdrawn-001',siren:'123456789',deleted:true },
      { id:'other-002',siren:'987654321',deleted:true },
      { id:'current-003',siren:'123456789',deleted:false },
    ]), {'Content-Type':'application/json'});
  };
  const ids = await listWithdrawnActIds('123456789', 'dummy', fetcher);
  assert.deepEqual([...ids], ['withdrawn-001']);
});

test('differential must fail closed on truncated 100-row page', async () => {
  const rows = Array.from({length:100}, (_,i) => ({
    id:'id'+i,siren:'123456789',deleted:true,
  }));
  await assert.rejects(
    () => listWithdrawnActIds('123456789','dummy',async () => response(JSON.stringify(rows))),
    /troncature/,
  );
});
