// One PRIVATE Chromium acceptance run for fund consumers and shared tools.
// No data is published, no form submitted, no approval is inferred.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer';
import {CORUM,FUND_SURFACES,COMMON_SURFACES} from './verifyCorumBrowserEvidence.mjs';

if(process.env.GITHUB_ACTIONS!=='true'||process.env.CORUM_PRIVATE_BROWSER_FIXTURE!=='enabled')
 throw Error('Private CORUM browser run only permitted in explicit CI staging');
const PORT=4198,BASE='http://127.0.0.1:'+PORT,OUT=path.resolve('test-results/corum-private-browser');
fs.mkdirSync(OUT,{recursive:true});
const report={kind:'corum_private_staging_browser_matrix',
 github_run_id:process.env.GITHUB_RUN_ID||null,
 commit_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 candidate_scpis_verified:[...CORUM],source_kind:'private_ci_preview_not_approved',
 cases:[],not_financial_signoff:true};
const draft=JSON.parse(fs.readFileSync('data-import/corum_private_browser_fixture_20261017.json','utf8'));
const names=Object.fromEntries(draft.scpi.map(v=>[v.scpi_slug,v.nom]));
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
const get=target=>new Promise(resolve=>http.get(BASE+target,res=>{
 let body='';res.setEncoding('utf8');res.on('data',a=>{body+=a});
 res.on('end',()=>resolve({status:res.statusCode,body}));
}).on('error',e=>resolve({status:0,error:String(e),body:''})));
const normalized=t=>String(t??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1',
 '--port',String(PORT),'--strictPort'],{stdio:['ignore','pipe','pipe'],
 env:{...process.env,VITE_SUPABASE_URL:'https://smoke-test.supabase.co',
  VITE_SUPABASE_ANON_KEY:'smoke-test-publishable-key'}});
let logs='';server.stdout.on('data',d=>logs+=String(d));server.stderr.on('data',d=>logs+=String(d));
const save=()=>fs.writeFileSync(path.join(OUT,'browser-matrix.json'),JSON.stringify(report,null,2)+'\n');
let browser,page,failed=0;
const visit=async(route,contains,timeout=13000)=>{
 const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:25000});
 // The prerendered SCPI HTML shell is NOT evidence that the React product mounted.
 if(/^\/corum-(eurion|origin|usa|xl)\/$/.test(route))
   await page.waitForFunction(()=>document.body?.innerText?.includes('Obtenir mon analyse personnalisée'),
     {timeout:18000});
 // Cookie choice is a REAL visible modal in Chromium; dismiss it with the
 // "Refuser tout" button rather than misdiagnosing the comparator as broken.
 await page.waitForFunction(()=>Boolean(document.querySelector('body')),
  {timeout:3000});
 await page.evaluate(()=>{
   const button=Array.from(document.querySelectorAll('button')).find(
     el=>/refuser tout/i.test(el.textContent||''));
   if(button)button.click();
 });
 await page.waitForFunction(s=>document.body?.innerText?.toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(
     String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   ),{timeout},contains);
 return {code:response?.status()||0,body:await page.$eval('body',x=>x.innerText)};
};
const caseRun=async(slug,surface,fn)=>{
 const c={slug,surface,status:'fail',assertions:{},checked_at:new Date().toISOString()};
 try{
  const observed=await fn();
  if(!observed||!Object.keys(observed).length||Object.values(observed).some(v=>v!==true))
   throw Error('One or more real DOM/HTTP assertions failed: '+JSON.stringify(observed));
  c.status='pass';c.assertions=observed;
 }catch(e){
  c.error=String(e);failed++;
  try{await page.screenshot({path:path.join(OUT,slug+'-'+surface+'.png')})}catch{}
 }
 report.cases.push(c);
 console.log('CORUM_STAGING_REAL_BROWSER',JSON.stringify({slug,surface,status:c.status,error:c.error}));
};
const searchFor=async(name)=>{
 await visit('/comparateur-scpi/','comparateur');
 const q=await page.$('input[placeholder*="Rechercher"]');
 if(!q)throw Error('Search input absent from real comparator');
 await q.click({clickCount:3});await q.type(name,{delay:15});
 await page.waitForFunction(n=>document.body?.innerText?.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(
    n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  ),{timeout:12000},name);
 return page.$eval('body',e=>e.innerText);
};
const selectResale=async(name)=>{
 await visit('/simulateur-marche-secondaire-scpi/','revente');
 const selectors=await page.$$eval('select',els=>els.map(el=>({
  all:Array.from(el.options).map(o=>({name:o.text,value:o.value}))
 })));
 const match=selectors.find(x=>x.all.some(x=>normalized(x.name)===normalized(name)));
 if(!match)throw Error('La SCPI ne figure pas parmi les options du simulateur de revente : '+name);
 const value=match.all.find(o=>normalized(o.name)===normalized(name)).value;
 const selects=await page.$$('select');
 for(const el of selects){const values=await el.evaluate(x=>Array.from(x.options).map(o=>o.value));
  if(values.includes(value)){await el.select(value);break}
 }
 await sleep(350);
 return page.$eval('body',e=>e.innerText);
};
try{
 let ready=false;for(let i=0;i<35;i++){let r=await get('/');if(r.status===200){ready=true;break}await sleep(300)}
 if(!ready)throw Error('Private Vite stage inaccessible '+logs.slice(-900));
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
 page=await browser.newPage();await page.setViewport({width:1280,height:800});
 await page.setRequestInterception(true);
 page.on('request',req=>{
   if(/^https?:\/\//.test(req.url())&&!req.url().startsWith(BASE))return req.abort();
   req.continue();
 });
 for(const slug of CORUM){
  const name=names[slug];if(!name)throw Error('Unknown staging source '+slug);
  const d=draft.scpi.find(x=>x.scpi_slug===slug);
  await caseRun(slug,'seo_page',async()=>{
    const {code,body}=await visit('/'+slug+'/',name);
    const head=await page.evaluate(()=>({
     title:document.title,h1:document.querySelector('h1')?.textContent||'',
     description:document.querySelector('meta[name="description"]')?.content||''
    }));
    return {http_200:code===200,name_visible:normalized(body).includes(normalized(name)),
      page_title_or_h1:normalized(head.title+' '+head.h1).includes(normalized(name)),
      seo_description:head.description.length>40,
      annual_reporting_year_visible:/distribution[^\n]{0,90}2025/i.test(body)};
  });
  await caseRun(slug,'sitemap',async()=>{
    const s=await get('/sitemap.xml');
    return {sitemap_http_200:s.status===200,real_slug_present:s.body.includes('/'+slug+'/')};
  });
  await caseRun(slug,'comparateur',async()=>{
    const body=await searchFor(name);
    return {fund_search_visible:normalized(body).includes(normalized(name)),
      comparison_is_not_empty:body.length>300};
  });
  await caseRun(slug,'liquidite',async()=>{
    const body=await selectResale(name);
    return {fund_selected_in_liquidity_simulator:normalized(body).includes(normalized(name)),
      actual_risk_or_withdrawal_copy:/liquidit|retrait|revente/i.test(body)};
  });
  await caseRun(slug,'simulateur_revente',async()=>{
    const body=await selectResale(name);
    return {fund_name_in_resale_route:normalized(body).includes(normalized(name)),
      resale_input_available:(await page.$$('input')).length>0};
  });
  await caseRun(slug,'analyse_detail',async()=>{
    await searchFor(name);
    const clicked=await page.evaluate(()=>{
      const container=document.querySelector('#scpi-grid');
      const button=Array.from(container?.querySelectorAll('button')||[])
        .find(x=>/^analyser$/i.test(x.textContent?.trim()||''));
      if(button){button.click();return true;}
      return false;
    });
    if(!clicked)throw Error('No actual Analyser action on selected CORUM comparator card');
    // Verify the actual analysis modal and the five-dimension Recharts radar;
    // a search result containing the word "analyse" never counted as radar QA.
    await page.waitForFunction(n=>{
      const heading=Array.from(document.querySelectorAll('h2'))
         .find(el=>(el.textContent||'').includes('Analyse Détaillée - '+n));
      return Boolean(heading) &&
         Boolean(Array.from(document.querySelectorAll('h3'))
           .find(el=>(el.textContent||'').includes('Radar MaximusSCPI'))) &&
         Boolean(document.querySelector('.recharts-radar'));
    },{timeout:15000},name);
    const inspected=await page.evaluate(n=>{
      const headings=Array.from(document.querySelectorAll('h2'));
      const heading=headings.find(el=>(el.textContent||'').includes('Analyse Détaillée - '+n));
      const radarHeader=Array.from(document.querySelectorAll('h3'))
        .find(el=>(el.textContent||'').includes('Radar MaximusSCPI'));
      return {headingMatches:!!heading,
        radarRendered:!!document.querySelector('.recharts-radar'),
        radarFiveAxes:!!radarHeader&&['Rendement','Secteurs','Géographie','Qualité','Taille']
          .every(s=>radarHeader.closest('.rounded-xl')?.textContent?.includes(s))};
    },name);
    return {fund_analysis_modal_opened:clicked&&inspected.headingMatches,
      rendered_recharts_radar:inspected.radarRendered,
      five_source_score_axes_present:inspected.radarFiveAxes};
  });
 }
 await caseRun('shared','simulateur_direct',async()=>{
  const {code,body}=await visit('/simulateur-scpi/','simul');
  return {route_200:code===200,calculator_visible:/revenu|rendement|montant/i.test(body),
    input_present:(await page.$$('input')).length>0};
 });
 await caseRun('shared','simulateur_demembrement',async()=>{
  const {code,body}=await visit('/simulateur-demembrement-scpi/','démembrement');
  return {route_200:code===200,calculator_visible:/nue.propri|usufruit/i.test(body),
    input_present:(await page.$$('input')).length>0};
 });
 await caseRun('shared','espace_client',async()=>{
  const {code,body}=await visit('/app/client','connexion');
  return {protected_route_renders:code===200,
    login_guard_visible:/connexion|connecter/i.test(body),
    client_data_not_public:!/dossier patrimonial n°/i.test(body)};
 });
 await caseRun('shared','parcours_souscription',async()=>{
  const {code,body}=await visit('/'+CORUM[0]+'/',names[CORUM[0]]);
  const actions=await page.$$eval('a,button',els=>els.map(x=>x.textContent?.trim()).filter(Boolean));
  return {profile_loaded:normalized(body).includes(normalized(names[CORUM[0]])),
    call_to_action_present:actions.some(x=>/analyse personnalisée|obtenir mon analyse|rendez.vous|prendre rendez.vous|rdv|être rappelé|contacter/i.test(x)),
    investor_warning_visible:/perte en capital|risque de liquidit/i.test(body)};
 });
 report.status=failed===0?'pass':'fail';
 report.total_cases=report.cases.length;
 report.passed_cases=report.cases.filter(x=>x.status==='pass').length;
 if(report.cases.length!==28)throw Error('Incomplete private staging matrix '+report.cases.length);
 if(failed)throw Error(failed+' real staging checks failed');
 console.log('CORUM_STAGING_BROWSER_SUCCESS',JSON.stringify({passed:report.passed_cases,sha:report.commit_sha}));
}catch(e){
 report.status='fail';report.failure=String(e);
 console.error('CORUM_STAGING_BROWSER_FAILURE',e);
 process.exitCode=1;
}finally{
 save();if(browser)await browser.close();server.kill('SIGTERM');
}
