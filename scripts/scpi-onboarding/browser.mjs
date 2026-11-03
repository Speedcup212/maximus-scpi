// Generic prepublication browser test. Temporary candidate cohort; NEVER a deployment.
// All mocked API data comes from a committed staging export, not invented figures.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer';
const origin='http://127.0.0.1:4189';
const path='src/data/certified_scpi_cohort.json';
const original=fs.readFileSync(path,'utf8');
const manifestPath=process.env.SCPI_ONBOARDING_MANIFEST||'scripts/scpi-onboarding/fixtures/bnpp-2026-t3.json';
if(!/^scripts\/scpi-onboarding\/[a-zA-Z0-9_./-]+\.json$/.test(manifestPath)||manifestPath.includes('..'))throw Error('Invalid manifest path');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const snapshotPath=manifest.snapshot_file;
if(!/^scripts\/[a-zA-Z0-9_./-]+\.json$/.test(snapshotPath)||snapshotPath.includes('..'))throw Error('Invalid snapshot path');
const snapshot=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
const candidates=manifest.candidates.map(c=>[c.slug,c.name,c.subscription_price,c.issuer_hosts?.[0],c.annual_period?.slice(0,4)]);
if(!candidates.length||candidates.some(c=>!c[0]||!c[1]||!Number.isFinite(c[2])||!c[3]))throw Error('Invalid candidate manifest');
const cohort=JSON.parse(original);
for(const [slug] of candidates) if(!cohort.slugs.includes(slug))cohort.slugs.push(slug);
cohort.count=cohort.slugs.length;
assert.equal(cohort.count,new Set(cohort.slugs).size);
fs.writeFileSync(path,JSON.stringify(cohort));
const folder='test-results/scpi-onboarding';fs.mkdirSync(folder,{recursive:true});
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mode:'generic-private-stage-integration-not-production',cases:[]};
const fixture='scpi-onboarding-module-check.html';
fs.writeFileSync(fixture,`<div id="root"></div><script type="module">
import React from 'react';import {createRoot} from 'react-dom/client';
import {scpiData} from '/src/data/scpiData';import {scpiDataExtended} from '/src/data/scpiDataExtended';
import {ScpiDetailedAnalysis} from '/src/components/ScpiAnalysisDetails';
import Income from '/src/components/ScpiDirectIncomeSimulator';
import ClientCard from '/src/app/components/ClientScpiCard';
import Trajectory from '/src/components/trajectory/ScpiTrajectoryPanel.tsx';
import {resolveExposure} from '/src/utils/clientPortfolioExposure';
import snapshot from '/${snapshotPath}';import '/src/index.css';
const slug=new URLSearchParams(location.search).get('slug');
const norm=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
const scpi=scpiData.find(s=>norm(s.name)===slug);const extended=scpiDataExtended.find(s=>norm(s.name)===slug);
if(!scpi||!extended)throw Error('Candidate missing from shared client/simulator catalog');
const i=snapshot.indicators.find(s=>s.scpi_slug===slug);
window.catalogEvidence={price:scpi.price,extendedPrice:extended.price,yield:scpi.yield,name:scpi.name};
const holding={slug,name:scpi.name,units:10,invested:scpi.price*10,currentValue:Number(i.prix_retrait)*10,valuationBasis:'withdrawal',averagePurchasePrice:scpi.price,annualIncome:null,yieldOnCost:null,source:'maximus',indicator:i};
createRoot(document.getElementById('root')).render(React.createElement(React.Fragment,null,
React.createElement('section',{'data-test':'radar'},React.createElement(ScpiDetailedAnalysis,{scpi})),
React.createElement('section',{'data-test':'simulator'},React.createElement(Income,{defaultAmount:50000,defaultYield:scpi.yield,embedded:true})),
React.createElement('section',{'data-test':'client'},React.createElement(ClientCard,{holding,sector:resolveExposure(i.repartition_sectorielle,scpi.repartitionSector,'sector'),geography:resolveExposure(i.repartition_geographique,scpi.repartitionGeo,'geography'),alerts:[],radarLabel:'Données de test',radarClass:'',surveillanceUnavailable:true,manageExpanded:false,expanded:true,onToggleExpanded:()=>{},onManage:()=>{}}))));
const trajectory=document.createElement('section');trajectory.setAttribute('data-test','trajectory');document.body.appendChild(trajectory);
createRoot(trajectory).render(React.createElement(Trajectory,{scpiSlug:slug}));
</script>`);
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4189','--strictPort'],{env:{...process.env,VITE_SUPABASE_URL:'https://scpi-onboarding-test.supabase.co',VITE_SUPABASE_ANON_KEY:'test-only'},stdio:'pipe'});
let browser;const errors=[];
try{
 for(let n=0;n<50;n++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.setRequestInterception(true);
 page.on('request',req=>{
  if(req.url().startsWith(origin))return req.continue();
  if(req.url().includes('scpi-onboarding-test.supabase.co')){
   const u=new URL(req.url());const slug=(u.searchParams.get('scpi_slug')||'').replace(/^eq\./,'');
   let rows=[];
   if(u.pathname.includes('scpi_indicators'))rows=snapshot.indicators;
   if(u.pathname.includes('scpi_bulletin_analysis'))rows=snapshot.analysis;
   if(u.pathname.includes('scpi_trajectory_pilot_history'))rows=snapshot.history;
   if(slug)rows=rows.filter(r=>r.scpi_slug===slug);
   const object=(req.headers().accept||'').includes('object');
   return req.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(object?(rows[0]||null):rows)});
  }
  return req.abort();
 });
 for(const [slug,name,price,issuerHost,annualYear] of candidates){
  for(const width of [1440,390]){
   await page.setViewport({width,height:1000});
   await page.goto(origin+'/'+slug+'/',{waitUntil:'networkidle0'});
   await page.waitForFunction(n=>document.body.innerText.includes(n),{},name);
   assert.ok((await page.$eval('h1',e=>e.textContent)).includes(name));
   if(annualYear)assert.match(await page.$eval('body',e=>e.innerText),new RegExp('taux de distribution '+annualYear,'i'));
   assert.equal(cohort.slugs.includes(slug),true);
   report.cases.push({slug,width,surface:'profile',status:'PASS'});
   await page.goto(origin+'/comparateur-scpi/',{waitUntil:'networkidle0'});
   const search=await page.waitForSelector('input[placeholder*="Rechercher"]');await search.type(name);
   await page.waitForFunction(()=>[...document.querySelectorAll('#scpi-grid button')].some(b=>/^analyser$/i.test(b.textContent.trim())));
   await page.evaluate(()=>[...document.querySelectorAll('#scpi-grid button')].find(b=>/^analyser$/i.test(b.textContent.trim())).click());
   await page.waitForSelector('[data-testid="scpi-reconstitution-value"]');
   assert.ok((await page.$eval('body',e=>e.innerText)).includes(name));
   const modalText=await page.$eval('body',e=>e.innerText);
   assert.doesNotMatch(modalText,/Bulletin officiel CORUM|liquidité structurellement plus robuste|approved_official_pdf_delegated_review|source_verified_approved_release/);
   if(annualYear)assert.match(modalText,new RegExp('Taux de distribution brut '+annualYear,'i'));
   assert.doesNotMatch(modalText,/principaux pays/);
   assert.ok(await page.evaluate((host)=>Array.from(document.querySelectorAll('a[href]')).some(a=>{try{return new URL(a.href).hostname===host;}catch{return false;}}),issuerHost),'Issuer source missing in comparator '+slug);
   report.cases.push({slug,width,surface:'comparator_analysis',status:'PASS'});
   await page.goto(origin+'/'+fixture+'?slug='+slug,{waitUntil:'networkidle0'});
   await page.waitForSelector('[data-test="client"]');
   assert.equal(await page.evaluate(()=>window.catalogEvidence.price),price);
   assert.equal(await page.evaluate(()=>window.catalogEvidence.extendedPrice),price);
   assert.ok(await page.$('[data-test="radar"] svg[role="img"]'));
   assert.ok((await page.$eval('[data-test="client"]',e=>e.innerText)).includes(name));
   assert.doesNotMatch(await page.$eval('[data-test="simulator"]',e=>e.innerText),/NaN|Infinity/);
   for(const surface of ['radar','simulator','client_card'])report.cases.push({slug,width,surface,status:'PASS'});
   // The backend gate requires the genuine trajectory component at both widths.
   await page.waitForSelector('[data-test="trajectory"] #trajectoire-scpi',{timeout:20000});
   const trajectoryText=await page.$eval('[data-test="trajectory"] #trajectoire-scpi',e=>e.innerText);
   assert.match(trajectoryText,/TOF|Occupation/i);
   assert.doesNotMatch(trajectoryText,/NaN|Infinity/);
   report.cases.push({slug,width,surface:'trajectory',status:'PASS'});
   await page.screenshot({path:folder+'/'+slug+'-'+width+'.png',fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.error=String(e);report.pageErrors=errors;process.exitCode=1;console.error(e);}
finally{if(browser)await browser.close();server.kill();fs.writeFileSync(path,original);fs.rmSync(fixture,{force:true});fs.writeFileSync(folder+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
