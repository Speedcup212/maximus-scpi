import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';

// Execute the actual deployed operation, with only DB/storage IO replaced.
const source=readFileSync(new URL('../../supabase/functions/maximus-scpi-ocr-oidc/index.ts',import.meta.url),'utf8');
const operation=source.slice(source.indexOf('    if(body.op==="original")'),source.indexOf('    if(body.op==="claim")'));
assert.ok(operation.length>1000);
const run=new (async function(){}).constructor('sql','fail','validStr','Deno','fetch','crypto','body',operation);
const bytes=Buffer.from('%PDF-1.7 exact original'.padEnd(1100,' '));
const hash=Buffer.from(await webcrypto.subtle.digest('SHA-256',bytes)).toString('hex');
const task={slug:'novapierre-1',period:'2024-T1',kind:'quarterly_bulletin',url:'https://paref-gestion.com/official.pdf',lease_token:'12345678-1234-1234-1234-123456789012'};
const file={pdf_path:`${task.slug}/${task.period}/${hash}.pdf`,pdf_sha256:hash,archive_bytes:String(bytes.length)};
async function call({job={url:task.url},meta=file,data=bytes,taskValue=task}={}){
  let queries=[],requests=[];
  const sql=async(strings,...values)=>{
    queries.push({text:strings.join('?'),values});
    assert.doesNotMatch(strings.join(' '),/\b(?:UPDATE|DELETE|INSERT|GRANT)\b/i);
    return queries.length===1?(job?[job]:[]):(meta?[meta]:[]);
  };
  const fetcher=async(url,options)=>{
    requests.push(url);
    assert.equal(url,'https://ygvsddcpohsnaowofuwc.supabase.co/storage/v1/object/authenticated/scpi-bulletins/'+file.pdf_path);
    assert.equal(options.redirect,'error');
    return new Response(data);
  };
  const response=await run(sql,(code,error)=>Response.json({error},{status:code}),
    (s,n)=>typeof s==='string'&&s.length>0&&s.length<=n,
    {env:{get:()=> 'server-only-secret'}},fetcher,webcrypto,{op:'original',task:taskValue});
  return {response,queries,requests};
}
test('exact active lease, source, canonical path, size and SHA return original only',async()=>{
  const {response,queries}=await call();
  assert.equal(response.status,200);
  assert.equal(response.headers.get('X-Original-Sha256'),hash);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
  assert.match(queries[0].text,/j\.status='running'/);
  assert.match(queries[0].text,/j\.lease_token=/);
  assert.match(queries[0].text,/45 minutes/);
  assert.match(queries[1].text,/b\.source_url=/);
});
test('stale lease or cross-source task cannot read Storage',async()=>{
  for(const opts of [{job:null},{job:{url:'https://different.example/other.pdf'}}]){
    const {response,requests}=await call(opts);
    assert.equal(response.status,409);assert.equal(requests.length,0);
  }
});
test('missing original permits fallback, malformed metadata never does',async()=>{
  assert.equal((await call({meta:null})).response.status,404);
  for(const changed of [{pdf_path:'other-fund/file.pdf'},{archive_bytes:'25000000'},{pdf_sha256:'bad'}]){
    const {response,requests}=await call({meta:{...file,...changed}});
    assert.equal(response.status,422);assert.equal(requests.length,0);
  }
});
test('modified bytes or length cannot become an original',async()=>{
  for(const data of [Buffer.from('wrong'),Buffer.from('x'.repeat(bytes.length))])
    assert.equal((await call({data})).response.status,422);
});
test('caller cannot select a Storage path or an unleased quarterly original',async()=>{
  const {response,requests}=await call({taskValue:{...task,lease_token:'invalid',pdf_path:file.pdf_path}});
  assert.equal(response.status,400);assert.equal(requests.length,0);
});
