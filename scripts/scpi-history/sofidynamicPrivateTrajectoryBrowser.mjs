// Isolated, source-backed trajectory test for an UNPUBLISHED candidate.
// No cohort edits, no manufactured valuations, no production publication.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import puppeteer from 'puppeteer';

const origin='http://127.0.0.1:4192';
const fixture='trajectory-sofidynamic-private-check.html';
const folder='test-results/scpi-sofidynamic-trajectory';
const snapshot=JSON.parse(fs.readFileSync(
 'scripts/scpi-onboarding/fixtures/sofidynamic-69-browser-snapshot.json','utf8'));
const rows=snapshot.history;
assert.equal(rows.length,2);
assert.deepEqual(rows.map(row=>row.source_period),['2026-T1','2026-T2']);
assert.equal(snapshot.analysis[0].comparison_certified,false);
assert.equal(Number(rows[1].nombre_parts),773714);
assert.equal(Number(rows[1].prix_souscription),320);
assert.equal(Number(rows[1].distribution_par_part),5.52);
assert.equal(rows[1].prix_reconstitution,null);
assert.equal(rows[1].valeur_realisation,null);
fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(fixture,'<div id="root"></div><script type="module">import React from "react";import {createRoot} from "react-dom/client";import Panel from "/src/components/trajectory/ScpiTrajectoryPanel.tsx";import "/src/index.css";createRoot(document.getElementById("root")).render(React.createElement(Panel,{scpiSlug:"sofidynamic"}));</script>');

const child=spawn(process.execPath,
 ['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4192','--strictPort'],
 {env:{...process.env,VITE_SUPABASE_URL:'https://trajectory-test.supabase.co',VITE_SUPABASE_ANON_KEY:'candidate-test-public-key'},stdio:'pipe'});
let browser;const errors=[];
const report={candidate:'sofidynamic',mode:'isolated_real_staging_trend_private',cases:[],publication_authorized:false};
try {
 let available=false;
 for(let i=0;i<50;i++){
  try{if((await fetch(origin)).ok){available=true;break}}catch{}
  await new Promise(done=>setTimeout(done,250));
 }
 assert.equal(available,true,'Vite private trajectory server failed to start');
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 await page.setRequestInterception(true);
 page.on('request',request=>{
  if(request.url().startsWith('https://trajectory-test.supabase.co/')){
   const url=request.url();
   const payload=url.includes('scpi_trajectory_pilot_history')?rows:null;
   return request.respond({status:200,contentType:'application/json',
    headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS',
     'access-control-allow-headers':'apikey,authorization,content-type,accept-profile,x-client-info'},
    body:JSON.stringify(payload)});
  }
  if(request.url().startsWith(origin))return request.continue();
  return request.abort();
 });
 for(const width of [1440,390]){
  await page.setViewport({width,height:1100});
  await page.goto(origin+'/'+fixture,{waitUntil:'networkidle0'});
  // This unpublished candidate intentionally carries the current
  // uncertified_history_comparison gate in scpi_complet.json.
  // The browser MUST show the restricted fallback, not a misleading chart.
  await page.waitForSelector('[data-testid="scpi-trajectory-insufficient-history"]',
    {timeout:20000});
  const body=await page.$eval('#trajectoire-scpi',node=>node.innerText);
  assert.match(body,/Trajectoire historique en cours de constitution/);
  assert.match(body,/2 période historique admissible/);
  assert.match(body,/aucun tracé ni variation n.est inventé/);
  assert.equal(await page.$$('#trajectoire-scpi .recharts-wrapper').then(a=>a.length),0,
    'Uncertified historical comparisons must not render as charts');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,
    'Horizontal overflow at '+width);
  report.cases.push({slug:'sofidynamic',width,surface:'trajectory',status:'PASS',
   valuation:'NOT_BACKDATED',comparisons:'RESTRICTED_NOT_CHARTED',official_history_periods:2});
  await page.screenshot({path:folder+'/sofidynamic-'+width+'.png',fullPage:true});
 }
 assert.deepEqual(errors,[],'Runtime page errors in private trajectory');
 report.status='PASS';
}catch(e){
 report.status='FAIL';report.error=String(e);report.pageErrors=errors;
 process.exitCode=1;
 console.error(e);
}finally{
 if(browser)await browser.close();
 child.kill();
 fs.rmSync(fixture,{force:true});
 fs.writeFileSync(folder+'/report.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}
