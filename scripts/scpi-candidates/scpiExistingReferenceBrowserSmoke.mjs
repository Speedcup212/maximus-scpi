// Real Chromium smoke of four ALREADY PUBLIC SCPI reference sheets.
// Explicitly NOT evidence of unpublished CORUM journeys. Never writes public catalog.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const ROOT=path.resolve('.');
const OUTPUT=path.resolve('test-results/scpi-existing-baseline');
const HOST='127.0.0.1',PORT=4187,BASE='http://'+HOST+':'+PORT;
const REFERENCE=[['comete','Comète'],['transitions-europe','Transitions Europe'],
  ['iroko-atlas','Iroko Atlas'],['iroko-zen','Iroko Zen']];
const cohort=JSON.parse(fs.readFileSync('src/data/certified_scpi_cohort.json','utf8'));
const now=()=>new Date().toISOString();
const report={kind:'existing_public_baseline_browser_smoke',purpose:'REFERENCE_NON_CORUM',
  generated_at:now(),commit_sha:process.env.GITHUB_SHA||null,
  github_run_id:process.env.GITHUB_RUN_ID||null, cases:[],
  candidate_scpis_verified:[],corum_browser_coverage:'0/40',
  limitations:'Existing public route and sitemap only; NOT 40 CORUM end-to-end checks or independent compliance approval'};
fs.mkdirSync(OUTPUT,{recursive:true});
for(const [slug] of REFERENCE){
  if(!cohort.slugs.includes(slug))throw Error('Baseline SCPI absent from public cohort: '+slug);
}
if(REFERENCE.some(([slug])=>slug.startsWith('corum-')))
  throw Error('Unreleased CORUM must NEVER be presented as public baseline');
const save=()=>fs.writeFileSync(path.join(OUTPUT,'browser-matrix.json'),JSON.stringify(report,null,2)+'\n');

const preview=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview',
  '--host',HOST,'--port',String(PORT),'--strictPort'],{
  cwd:ROOT,
  stdio:['ignore','pipe','pipe'],
  env:{...process.env,VITE_SUPABASE_URL:'https://smoke-test.supabase.co',
       VITE_SUPABASE_ANON_KEY:'smoke-test-publishable-key'},
});
let logs='';
preview.stdout.on('data',d=>{logs+=d.toString()});
preview.stderr.on('data',d=>{logs+=d.toString()});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url){
 return new Promise((resolve,reject)=>{
  http.get(url,res=>{
   let body='';
   res.setEncoding('utf8');
   res.on('data',chunk=>{body+=chunk});
   res.on('end',()=>resolve({status:res.statusCode,body}));
  }).on('error',reject);
 });
}
let browser;
try {
 let ready=false;
 for(let j=0;j<45;j++){try{const r=await get(BASE+'/');if(r.status===200){ready=true;break}}catch{} await sleep(300)}
 if(!ready)throw Error('Vite preview did not start: '+logs.slice(-1500));
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
 const page=await browser.newPage();
 await page.setViewport({width:1280,height:900});
 await page.setRequestInterception(true);
 page.on('request',req=>{
   const url=req.url();
   if(/^https?:\/\//.test(url)&&!url.startsWith(BASE))return req.abort();
   req.continue();
 });
 for(const [slug,name] of REFERENCE){
   try{
    const response=await page.goto(BASE+'/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000});
    try {
      await page.waitForFunction(expected=>{
        const normalized=v=>String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
        const text=document.body?.innerText||'';
        const heading=Array.from(document.querySelectorAll('h1')).map(x=>x.textContent).join(' ');
        return normalized(text).includes(normalized(expected))
          && normalized(document.title+' '+heading).includes(normalized(expected));
      },{timeout:15000},name);
    }catch {
      console.warn('Reference public page not ready / content mismatch',slug,
        'documentTitle=',await page.title(),
        'currentBody=',(await page.$eval('body',el=>el.innerText)).slice(0,600));
    }
    const observation=await page.evaluate(()=>({
       title:document.title,
       h1:Array.from(document.querySelectorAll('h1')).map(x=>x.textContent?.trim()),
       bodyText:document.body?.innerText?.slice(0,8000)||'',
       canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href')||null
    }));
    const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const ok=Boolean(response?.status()===200)&&normalized(observation.bodyText).includes(normalized(name))
      &&normalized(observation.title+' '+observation.h1.join(' ')).includes(normalized(name));
    report.cases.push({slug,surface:'seo_page',type:'existing_public_browser',
      http_status:response?.status(),title:observation.title,main_heading:observation.h1,
      canonical:observation.canonical,status:ok?'pass':'fail',checked_at:now()});
    if(!ok)throw Error('SCPI page failed real Chromium content/title assertion: '+slug
      +' title='+observation.title+' h1='+observation.h1.join(' | ')
      +' body='+observation.bodyText.slice(0,250));
   }catch(e){
    report.cases.push({slug,surface:'seo_page_error',type:'existing_public_browser',
       status:'fail',error:String(e),checked_at:now()});
    try{await page.screenshot({path:path.join(OUTPUT,slug+'-failed.png')})}catch{}
    throw e;
   }
 }
 const sitemap=await get(BASE+'/sitemap.xml');
 for(const [slug] of REFERENCE){
  const ok=sitemap.status===200&&sitemap.body.includes('/'+slug+'/');
  report.cases.push({slug,surface:'sitemap',type:'existing_public_static_document',
    http_status:sitemap.status,status:ok?'pass':'fail',checked_at:now()});
  if(!ok)throw Error('Published existing public SCPI missing from local sitemap: '+slug);
 }
 report.status='pass';
 report.existing_reference_cases_passed=report.cases.filter(c=>c.status==='pass').length;
 console.log('SCPI_PUBLIC_BASELINE_BROWSER_PROVEN',JSON.stringify({
   counted:report.existing_reference_cases_passed,corum_verified:0,
   commit:report.commit_sha,run_id:report.github_run_id
 }));
} catch(e){
 report.status='fail';
 report.failure=String(e);
 console.error('SCPI_PUBLIC_BASELINE_BROWSER_FAILED',e);
 process.exitCode=1;
} finally {
 save();
 if(browser)await browser.close();
 preview.kill('SIGTERM');
}
