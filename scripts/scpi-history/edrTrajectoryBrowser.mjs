// EdR regression: public modal trajectory + market signals must not silently
// disappear merely because the global catalogue contains the 66th SCPI.
// Test REST payload is source-certified fixture, not fabricated metrics.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import { writeFile, rm } from 'node:fs/promises';
const origin=process.env.TRAJECTORY_TEST_ORIGIN||'http://127.0.0.1:4173';
const issuer='https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf';
const q1='https://francescpi.com/scpi-de-rendement/edmond-de-rothschild-europa/bi/edmond-de-rothschild-europa-bulletin-2026-t1.pdf';
const dividends=[['2024-T4',4.59],['2025-T1',4.03],['2025-T2',4.04],['2025-T3',4.21],['2025-T4',5.21]];
const base={scpi_slug:'edr-europa',snapshot_at:'2026-10-31',source_url:issuer,qa_status:'manual_verified_distributions_only_official_pdf_page_3',source_confidence:0.99,
  tof:null,td:null,capitalisation:null,prix_souscription:null,prix_reconstitution:null,prix_retrait:null,
  valeur_realisation:null,endettement:null,distribution_par_part:null,parts_attente_retrait:null,
  nombre_parts:null,capital_type:'variable',liquidity_basis:null,retrait_attente_pct:null,liquidity_pressure_pct:null,metric_provenance:{}};
const rows=[
 {...base,source_period:'2024-T2',
  source_url:'https://access.fortunyconseil.fr/api/v1/SCPI/files/rapport_annuel2024_230ee4f0327011f0ab012dfda4e19bae.pdf',
  qa_status:'manual_verified_first_2024_closing_signed_issuer_report_and_legal_AG',
  source_confidence:0.95,prix_reconstitution:203.85,valeur_realisation:171.33,capitalisation:13.40488,
  prix_souscription:200,metric_provenance:{prix_reconstitution:{reference_date:'2024-06-30'},valeur_realisation:{reference_date:'2024-06-30'}}},
 ...dividends.map(([source_period,distribution_par_part])=>{
   const valuations={
     '2024-T4':{prix_reconstitution:210.81,valeur_realisation:169.60,date:'2024-12-31'},
     '2025-T2':{prix_reconstitution:213.21,valeur_realisation:174.71,date:'2025-06-30'},
     '2025-T4':{prix_reconstitution:220.66,valeur_realisation:179.28,date:'2025-12-31'},
   }[source_period];
   return {...base,source_period,distribution_par_part,
     prix_reconstitution:valuations?.prix_reconstitution??null,
     valeur_realisation:valuations?.valeur_realisation??null,
     prix_souscription:valuations?200:null,
     metric_provenance:valuations?{
       prix_reconstitution:{reference_date:valuations.date},
       valeur_realisation:{reference_date:valuations.date}
     }:{}
   };
 }),
 {...base,source_period:'2026-T1',source_url:q1,qa_status:'manual_verified_issuer_bulletin_official_web_and_mirror_sha',
  source_confidence:0.95,tof:100,capitalisation:103.1064,prix_souscription:200,prix_retrait:180,endettement:0,distribution_par_part:4.33,nombre_parts:515532},
 {...base,source_period:'2026-T2',qa_status:'manual_verified_official_pdf_sha256_page',source_confidence:1,
  tof:100,capitalisation:152.923494,prix_souscription:202,prix_retrait:181.8,prix_reconstitution:212.78,
  valeur_realisation:174.23,endettement:0,distribution_par_part:4.69,nombre_parts:757047,
  metric_provenance:{prix_reconstitution:{reference_date:'2026-06-30'},valeur_realisation:{reference_date:'2026-06-30'}}},
];
const liquidity={scpi_slug:'edr-europa',source_period:'2026-T2',liquidity_basis:null,liquidity_pressure_pct:null,retrait_attente_pct:null,regime_changed:false,signal_certification:'no_signal',niveau_liquidite:'non_calculable'};
const gate={scpi_slug:'edr-europa',data_gate:'PASS',structural_gate:'PASS',semantic_gate:'PASS',liquidity_gate:'PASS_NO_DATA',liquidity_signal_eligible:false};
const fixture=new URL('../../trajectory-edr-regression.html',import.meta.url);
await writeFile(fixture,`<div id="root"></div><script type="module">import React from 'react';import {createRoot} from 'react-dom/client';import Tabs from '/src/components/trajectory/ScpiTrajectoryTabs.tsx';import '/src/index.css';createRoot(document.getElementById('root')).render(React.createElement(Tabs,{scpiSlug:'edr-europa'}));</script>`);
let browser;
try{
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setRequestInterception(true);
 page.on('request',async request=>{
   if(request.url().startsWith('https://trajectory-test.supabase.co/')){
     const u=request.url();
     const data=u.includes('scpi_trajectory_pilot_history')?rows:
       u.includes('scpi_trajectory_pilot_liquidity')?liquidity:
       u.includes('scpi_trajectory_signal_gate')?gate:[];
     return request.respond({status:200,contentType:'application/json',
       headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS',
                'access-control-allow-headers':'apikey,authorization,content-type,accept-profile,x-client-info'},
       body:JSON.stringify(data)});
   }
   if(!request.url().startsWith(origin))return request.abort();
   return request.continue();
 });
 for(const width of [1440,390]){
   await page.setViewport({width,height:1000});
   await page.goto(origin+'/trajectory-edr-regression.html',{waitUntil:'networkidle0'});
   await page.waitForFunction(()=>document.body.innerText.includes('8 périodes observées'),{timeout:16000});
   const first=await page.evaluate(()=>document.body.innerText);
   assert.match(first,/8 périodes observées/);
   assert.match(first,/203,85 €/);
   assert.match(first,/171,33 €/);
   assert.match(first,/1\/2 exercices validés/);
   assert.match(first,/17,49 €/);
   assert.match(first,/220,66 €/);
   assert.match(first,/179,28 €/);
   assert.match(first,/169,60 €/);
   assert.match(first,/210,81 €/);
   assert.match(first,/Non consolidée : exercices distincts/);
   assert.match(first,/4,69 €/);
   assert.match(first,/213,21 €/);
   assert.match(first,/174,71 €/);
   assert.match(first,/212,78 €/);
   assert.match(first,/174,23 €/);
   assert.match(first,/220,66 €/);
   assert.match(first,/Dernière valeur officielle connue/);
   assert.match(first,/179,28 €/);
   assert.match(first,/Valeur arrêtée au/);
   await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(x=>x.textContent?.trim()==='Signaux du marché de la SCPI')?.click());
   await page.waitForFunction(()=>document.body.innerText.includes('4/5 indicateurs exploitables'),{timeout:16000});
   const market=await page.evaluate(()=>document.body.innerText);
   assert.match(market,/Dernière période : T2 2026/);
   assert.match(market,/4\/5 indicateurs exploitables/);
   assert.match(market,/100 %/);
   assert.match(market,/Prix \/ valeur de reconstitution/);
   assert.match(market,/Dynamique de capitalisation/);
   assert.match(market,/Endettement/);
   assert.match(market,/Base non documentée/);
   assert.equal(errors.length,0,'Browser console runtime errors: '+errors.join(', '));
   console.log(JSON.stringify({width,status:'PASS',historyPeriods:8,annualComplete:1,annualExpected:2,marketSignals:4,unknownLiquidity:'N.D.'}));
 }
}finally{if(browser)await browser.close();await rm(fixture,{force:true})}
