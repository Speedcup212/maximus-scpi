// Real Chromium acceptance of provisional data inside the shared React surfaces.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer';
const root='http://127.0.0.1:4197';
const fixture='scpi-progressive-public-check.html';
const dir='test-results/scpi-progressive-public';
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(fixture,`<div id="root"></div><script type="module">
import React from 'react';import{createRoot}from'react-dom/client';
import{scpiData}from'/src/data/scpiData';
import{scpiDataExtended}from'/src/data/scpiDataExtended';
import Quality from'/src/components/ScpiPublicationQualityNotice.tsx';
import Card from'/src/components/fintech/SCPICardDark.tsx';
import TableRow from'/src/components/fintech/SCPITableRow.tsx';
import Client from'/src/app/components/ClientScpiCard.tsx';
import {resolveExposure}from'/src/utils/clientPortfolioExposure.ts';
import'/src/index.css';
const scpi=scpiData.find(x=>x.name==='Sofidynamic');
const ext=scpiDataExtended.find(x=>x.name==='Sofidynamic');
if(!scpi||!ext||scpi.maximusPublicationStatus!=='published_with_reserves')throw Error('Public provisional catalog missing');
window.progressiveCatalog={name:scpi.name,price:scpi.price,period:scpi.maximusSourcePeriode,source:scpi.metricProvenance?.capitalisation?.source_url,disabled:scpi.maximusDisabledFeatures};
const holding={slug:'sofidynamic',name:scpi.name,units:10,invested:3200,currentValue:3136,valuationBasis:'withdrawal',averagePurchasePrice:320,annualIncome:null,yieldOnCost:null,source:'maximus',indicator:{source_period:'2026-T2',td:9.04,tof:97.73,prix_souscription:320,prix_retrait:313.60,prix_reconstitution:336.75,endettement:16}};
const noop=()=>{};
createRoot(document.getElementById('root')).render(React.createElement(React.Fragment,null,
React.createElement('section',{'data-case':'profile'},React.createElement(Quality,{scpi})),
React.createElement('section',{'data-case':'fintech-card'},React.createElement(Card,{scpi:ext,isSelected:false,onToggleSelect:noop,onAnalyze:noop})),
React.createElement('section',{'data-case':'fintech-row'},React.createElement(TableRow,{scpi:ext,isSelected:false,onToggleSelect:noop,onAnalyze:noop})),
React.createElement('section',{'data-case':'client'},React.createElement(Client,{holding,sector:resolveExposure({'Bureaux':12},scpi.repartitionSector,'sector'),geography:resolveExposure({'Pays-Bas':36.9},scpi.repartitionGeo,'geography'),alerts:[],radarLabel:'Données sourcées',radarClass:'',surveillanceUnavailable:true,manageExpanded:false,expanded:true,onToggleExpanded:noop,onManage:noop})),
React.createElement('section',{'data-case':'dates'},React.createElement('p',null,'2025 annual: ',scpi.metricProvenance?.prix_reconstitution?.reference_date,'; 2026 T2: ',scpi.maximusSourcePeriode)),
React.createElement('section',{'data-case':'blocked-actions'},React.createElement('p',null,'No unverified recommendation:',String(!scpi.isRecommended),', no trend:',String(scpi.maximusDisabledFeatures?.includes('uncertified_history_comparison'))))
));
</script>`);
const child=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4197','--strictPort'],{env:{...process.env,VITE_SUPABASE_URL:'https://progressive-preview.supabase.co',VITE_SUPABASE_ANON_KEY:'test-only'},stdio:'pipe'});
let browser;const errors=[];
const report={mode:'real React components / source-backed catalog',candidate:'sofidynamic',source_period:'2026-T2',cases:[],publication_authorized:false,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()};
const cases=[
 ['profile','[data-case="profile"] [data-testid="scpi-publication-reserves"]',/Fiche publiée avec réserves/],
 ['fintech-card','[data-case="fintech-card"] [data-testid="scpi-fintech-caveat"]',/Données partielles/],
 ['fintech-row','[data-case="fintech-row"] [data-testid="scpi-fintech-caveat"]',/Données partielles/],
 ['client','[data-case="client"] [data-testid="scpi-client-history-restricted"]',/Comparaison historique indisponible/],
 ['dates','[data-case="dates"]',/2025-12-31.*2026-T2/],
 ['blocked-actions','[data-case="blocked-actions"]',/No unverified recommendation:true, no trend:true/],
];
try{
 let ready=false;
 for(let i=0;i<70;i++){try{if((await fetch(root)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,220))}
 assert.ok(ready,'Vite progressive preview not ready');
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.setRequestInterception(true);
 page.on('request',req=>{
  if(req.url().startsWith(root))return req.continue();
  if(req.url().includes('progressive-preview.supabase.co/'))return req.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'});
  return req.abort();
 });
 for(const width of [1440,390]){
  await page.setViewport({width,height:1000});
  await page.goto(root+'/'+fixture,{waitUntil:'networkidle0'});
  await page.waitForSelector('[data-case="profile"] [data-testid="scpi-publication-reserves"]',{timeout:20000});
  for(const[surface,sel,pattern]of cases){
    const node=await page.$(sel);assert.ok(node,'Missing '+surface);
    const value=await page.$eval(sel,el=>el.textContent||'');
    assert.match(value,pattern,'Invalid '+surface);
    report.cases.push({surface,width,status:'PASS',evidence:sel});
  }
  const details=await page.$eval('[data-case="profile"]',el=>el.textContent||'');
  assert.match(details,/Statuts/);assert.match(details,/Mouvements/);
  assert.match(details,/31\/12\/2025/);
  await page.screenshot({path:dir+'/sofidynamic-'+width+'.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,'Horizontal overflow');
 }
 assert.equal(errors.length,0,'React page runtime errors: '+errors.join(';'));
 assert.equal(report.cases.length,12);
 report.status='PASS';
}catch(e){report.status='FAIL';report.error=String(e);report.runtime_errors=errors;process.exitCode=1;}
finally{if(browser)await browser.close();child.kill();try{fs.unlinkSync(fixture)}catch{}fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2));console.log('PROGRESSIVE_PUBLIC_BROWSER',JSON.stringify({status:report.status,cases:report.cases.length,error:report.error||null}))}
