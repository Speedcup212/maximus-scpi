import assert from 'node:assert/strict';

const site = 'https://maximusscpi.com';
const targets = [
  {path:'/',type:'home'},
  {path:'/analyses/',type:'analyses'},
  {path:'/actualites/maximus-qa-nonexistent-20261015/',type:'not_found_news'},
  {path:'/actualites/wemo-one/',type:'named_news'}
];

async function inspect(path) {
  const r = await fetch(site+path,{
    redirect:'follow',
    signal:AbortSignal.timeout(18000),
    headers:{'User-Agent':'Mozilla/5.0 (compatible; MaximusSCPI-Release-QA/1.0)',
      Accept:'text/html'}
  });
  const text=(await r.text()).slice(0,350000);
  const canonical=(text.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)||[])[1]||null;
  const title=(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||null;
  const h1Count=(text.match(/<h1\b/gi)||[]).length;
  return {status:r.status,finalUrl:r.url,canonical,title,h1Count,text};
}
let failed=false;
for (const t of targets) {
  try {
    const p=await inspect(t.path);
    const result={path:t.path,status:p.status,canonical:p.canonical,title:p.title,h1Count:p.h1Count};
    console.log(JSON.stringify(result));
    if(t.type==='home'){
      assert.equal(p.status,200,'homepage must return 200');
      assert.equal(p.h1Count,1,'homepage must include exactly one initial HTML H1');
      assert.equal(p.canonical,site+'/');
    }else if(t.type==='analyses'){
      assert.equal(p.status,200,'analyses must be served');
      assert.equal(p.h1Count,1,'analyses must have one H1');
      assert.equal(p.canonical,site+'/analyses/');
    }else if(t.type==='not_found_news'){
      assert.ok([404,410].includes(p.status),'unknown news must return true 404/410, never homepage SPA 200');
    }else if(t.type==='named_news'){
      if([404,410].includes(p.status))continue;
      assert.equal(p.status,200,'named news either has dedicated page or 404');
      assert.equal(p.h1Count,1,'published news needs exactly one H1');
      assert.equal(p.canonical,site+t.path,'news canonical cannot be homepage');
      assert.ok(p.title&&!/MaximusSCPI — Investir en SCPI/.test(p.title),'must not reuse homepage title');
    }
  }catch(e){
    failed=true;
    console.error('FAIL',t.path,e instanceof Error?e.message:String(e));
  }
}
if(failed)process.exitCode=1;
