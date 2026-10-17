// Verify the *actual 65-fund public catalog* and real production components.
// Unlike private staging this NEVER overlays invented candidate data.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer';

const CATALOG=JSON.parse(fs.readFileSync('src/data/scpi_complet.json','utf8'));
const COHORT=JSON.parse(fs.readFileSync('src/data/certified_scpi_cohort.json','utf8'));
const EXPECTED=[['corum-eurion','CORUM Eurion',224.07,54,42702],
 ['corum-origin','CORUM Origin',1186.30,170,76169],
 ['corum-usa','CORUM USA',216.34,null,4716],
 ['corum-xl','CORUM XL',194.27,96,54340]];
const OUT=path.resolve('test-results/corum-published-rendering');
const PORT=4191,BASE='http://127.0.0.1:'+PORT;
fs.mkdirSync(OUT,{recursive:true});
if(COHORT.count!==65||COHORT.slugs.length!==65)throw Error('Production 65-fund cohort not built');
for(const [slug,name,vr,buildings,investors] of EXPECTED){
 const row=CATALOG.find(x=>x['Nom SCPI']===name);
 if(!COHORT.slugs.includes(slug)||!row)throw Error('Published CORUM absent '+slug);
 if(row['Valeur de reconstitution par part (€)']!==vr)throw Error('Wrong official VR for '+slug);
 if((row["Nombre d'immeubles"]??null)!==buildings)throw Error('Missing certified properties for '+slug);
 if(row['Nombre d’associés']!==investors)throw Error('Official T2 investor count absent '+slug);
}
const report={kind:'corum_real_published_catalog_consumers',commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 executed_at:new Date().toISOString(),repo:'Speedcup212/maximus-scpi',not_private_overlay:true,cases:[]};
const save=()=>fs.writeFileSync(path.join(OUT,'observations.json'),JSON.stringify(report,null,2)+'\n');
const processVite=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview',
 '--host','127.0.0.1','--port',String(PORT),'--strictPort'],
 {env:{...process.env},stdio:['ignore','pipe','pipe']});
let logs='';processVite.stdout.on('data',d=>{logs+=String(d)});processVite.stderr.on('data',d=>{logs+=String(d)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const get=url=>new Promise((resolve,reject)=>http.get(BASE+url,res=>{
 let body='';res.setEncoding('utf8');res.on('data',d=>body+=d);
 res.on('end',()=>resolve({status:res.statusCode,body}));
}).on('error',reject));
let browser,page;
let failed=0;
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
async function navigate(route,expected){
 const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(text=>document.body?.innerText?.normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(
   text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()),
  {timeout:16000},expected);
 await page.evaluate(()=>{
  const refuse=Array.from(document.querySelectorAll('button')).find(x=>/refuser tout/i.test(x.textContent||''));
  refuse?.click();
 });
 return response;
}
async function test(slug,surface,fn){
 const record={slug,surface,status:'fail',observations:{},at:new Date().toISOString()};
 try{
  const assertions=await fn();
  record.observations=assertions;
  if(Object.keys(assertions).length===0||Object.values(assertions).some(x=>x!==true))
   throw Error('Real rendered assertions failed: '+JSON.stringify(assertions));
  record.status='pass';
 }catch(e){
  record.error=String(e);failed++;
  try{await page.screenshot({path:path.join(OUT,slug+'-'+surface+'.png')})}catch{}
 }
 report.cases.push(record);
 console.log('CORUM_REAL_CATALOG_BROWSER',JSON.stringify({slug,surface,status:record.status,error:record.error}));
}
try{
 let started=false;
 for(let i=0;i<55;i++){try{if((await get('/')).status===200){started=true;break}}catch{}await sleep(300)}
 if(!started)throw Error('Production Vite preview unavailable '+logs.slice(-500));
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
 page=await browser.newPage();await page.setViewport({width:1280,height:900});
 await page.setRequestInterception(true);
 page.on('request',req=>/^https?:\/\//.test(req.url())&&!req.url().startsWith(BASE)
  ?req.abort():req.continue());
 for(const [slug,name,vr,properties,investors] of EXPECTED){
  await test(slug,'official_public_profile',async()=>{
   const res=await navigate('/'+slug+'/',name);
   const body=await page.$eval('body',el=>el.innerText);
   const title=await page.title();
   return {http_200:res?.status()===200,
      named_fund_visible:normalize(body).includes(normalize(name)),
      seo_title_named:normalize(title).includes(normalize(name))};
  });
  await test(slug,'live_comparator_and_analysis',async()=>{
   await navigate('/comparateur-scpi/','comparateur');
   const search=await page.waitForSelector('input[placeholder*="Rechercher"]',{visible:true,timeout:14000});
   await search.click({clickCount:3});
   await search.type(name,{delay:9});
   await page.waitForFunction(text=>
      Array.from(document.querySelectorAll('#scpi-grid button'))
       .some(b=>/^analyser$/i.test(b.textContent?.trim()||'')) &&
      document.body?.innerText?.toLowerCase().includes(text.toLowerCase()),
     {timeout:16000},name);
   const clicked=await page.evaluate(()=>{
     const el=Array.from(document.querySelectorAll('#scpi-grid button')).find(
       b=>/^analyser$/i.test(b.textContent?.trim()||''));
     el?.click();return Boolean(el);
   });
   if(!clicked)throw Error('Real Analyser button not found for '+slug);
   await page.waitForSelector('[data-testid="scpi-reconstitution-value"]',{timeout:16000});
   await page.waitForSelector('[data-testid="scpi-source-based-analysis"]',{timeout:16000});
   const obj=await page.evaluate(expected=>{
     const heading=Array.from(document.querySelectorAll('h2')).find(
       el=>el.textContent?.includes('Analyse Détaillée - '+expected));
     const modal=heading?.closest('div.fixed');
     const vrText=modal?.querySelector('[data-testid="scpi-reconstitution-value"]')?.textContent||'';
     const analysis=modal?.querySelector('[data-testid="scpi-source-based-analysis"]')?.textContent||'';
     const favorable=modal?.textContent||'';
     const tech=Array.from(modal?.querySelectorAll('div')||[]).find(
       x=>x.textContent?.trim()==='Nombre d’immeubles' || x.textContent?.trim()==="Nombre d'immeubles");
     const sourceLabels=modal?.textContent||'';
     const renter=modal?.querySelector('[data-testid="scpi-rental-source-coverage"]');
     const shareholders=modal?.querySelector('[data-testid="scpi-shareholders-count"]')?.textContent||'';
     return {hasHeading:!!heading,vrText,analysis,sourceLabels,
       visibleProperties:Boolean(tech),
       renterText:renter?.textContent||'',shareholders,
       favorable};
   },name);
   const euro=vr.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/\u202f/g,' ');
   const shown=obj.vrText.replace(/\u202f/g,' ').replace(/\xa0/g,' ');
   return {
    real_modal_for_correct_fund:obj.hasHeading,
    current_reconstitution_is_visible:shown.includes(euro)||shown.includes(vr.toFixed(2)),
    nonempty_source_anchored_analysis:obj.analysis.length>85 &&
      !/données insuffisantes pour conclure de façon robuste/i.test(obj.analysis),
    financial_period_2025_present:obj.sourceLabels.includes('2025'),
    official_building_count_displayed:properties==null?true:
       obj.sourceLabels.includes(String(properties)) && /immeubles?/i.test(obj.sourceLabels),
    unavailable_rentals_not_fake_numbers:!/Nombre de locataires\s*0(\D|$)/i.test(obj.renterText),
    official_shareholder_count_visible:obj.shareholders.includes(investors.toLocaleString('fr-FR')),
    real_risks_explained:/liquidit|perte en capital/i.test(obj.favorable)
   };
  });
 }
 report.total=report.cases.length;report.passed=report.cases.filter(x=>x.status==='pass').length;
 report.status=failed?'fail':'pass';
 if(failed)throw Error(failed+' real CORUM product journeys failed');
 console.log('CORUM_REAL_PUBLISHED_CATALOG_PASS',JSON.stringify({cases:report.passed,commit:report.commit}));
}catch(e){report.status='fail';report.failure=String(e);process.exitCode=1;
 console.error('CORUM_REAL_PUBLISHED_CATALOG_FAIL',e);
}finally{save();if(browser)await browser.close();processVite.kill('SIGTERM')}
