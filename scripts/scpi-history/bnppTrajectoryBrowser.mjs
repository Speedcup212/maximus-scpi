// Browser-verified staging fixtures for the two BNP REIM 2026-T3 candidates.
// This MUST NOT promote SCPI to the production cohort.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {writeFile,mkdir,rm} from 'node:fs/promises';
const origin=process.env.TRAJECTORY_TEST_ORIGIN||'http://127.0.0.1:4173';
const issuer='https://reim.bnpparibas-am.com/sites/default/files/docs/2026-10/';
const specs=[
 {slug:'acces-valeur-pierre',price:765,recon:745.63,real:610.32,ret:696.69,dist:7.08,debt:null,td:3.85,tof:86.5,shares:2391334,queue:129463,
  url:issuer+'BT_AVP_3T2026_5%20def.pdf',prevTof:null,prevQueue:120254,prevShares:2391334,prevPrice:765,prevDistribution:7.92},
 {slug:'accimmo-pierre',price:141,recon:132.51,real:109.46,ret:128.41,dist:1.59,debt:21.5,td:4.77,tof:87.52,shares:18600813,queue:636021,
  url:issuer+'BT_AP_3T2026_4%20vdef.pdf',prevTof:87.44,prevQueue:844571,prevShares:18848157,prevPrice:141,prevDistribution:1.68},
];
const fixture=new URL('../../trajectory-bnpp-check.html',import.meta.url);
await writeFile(fixture,`<div id="root"></div><script type="module">import React from 'react';import {createRoot} from 'react-dom/client';import Panel from '/src/components/trajectory/ScpiTrajectoryPanel.tsx';import '/src/index.css';const slug=new URLSearchParams(location.search).get('slug');createRoot(document.getElementById('root')).render(React.createElement(Panel,{scpiSlug:slug}));</script>`);
const folder=new URL('../../test-results/bnpp-trajectory/',import.meta.url);
await mkdir(folder,{recursive:true});
const issues=[];
let browser;
try {
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const spec of specs) {
  const base={scpi_slug:spec.slug,source_url:spec.url,source_type:'official_issuer_pdf',qa_status:'qa_pass_ai_second_pass',source_confidence:1,capital_type:'variable',liquidity_basis:'withdrawal_queue',td:spec.td};
  const rows=[
   {...base,snapshot_at:'2026-06-30',source_period:'2026-T2',tof:spec.prevTof,prix_souscription:spec.prevPrice,distribution_par_part:spec.prevDistribution,nombre_parts:spec.prevShares,parts_attente_retrait:spec.prevQueue},
   {...base,snapshot_at:'2026-09-30',source_period:'2026-T3',tof:spec.tof,prix_souscription:spec.price,prix_reconstitution:spec.recon,valeur_realisation:spec.real,prix_retrait:spec.ret,distribution_par_part:spec.dist,endettement:spec.debt,nombre_parts:spec.shares,parts_attente_retrait:spec.queue,
    metric_provenance:{prix_reconstitution:{reference_date:'2026-06-30'},valeur_realisation:{reference_date:'2026-06-30'}}}
  ];
  const page=await browser.newPage();
  page.on('pageerror',e=>issues.push(spec.slug+': '+e.message));
  await page.setRequestInterception(true);
  page.on('request',async req=>{
   if(req.url().startsWith('https://trajectory-test.supabase.co/')){
    let data=[];
    if(req.url().includes('scpi_trajectory_pilot_history'))data=rows;
    else if(req.url().includes('scpi_trajectory_pilot_liquidity'))data={scpi_slug:spec.slug,source_period:'2026-T3',liquidity_basis:'withdrawal_queue',parts_attente_retrait:spec.queue,nombre_parts:spec.shares,retrait_attente_pct:Math.round(spec.queue/spec.shares*10000)/100,liquidity_pressure_pct:Math.round(spec.queue/spec.shares*10000)/100,regime_changed:false,signal_certification:'source_verified'};
    else if(req.url().includes('scpi_trajectory_signal_gate'))data={scpi_slug:spec.slug,data_gate:'PASS',structural_gate:'PASS',semantic_gate:'PASS',liquidity_gate:'PASS',liquidity_signal_eligible:true};
    return req.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'apikey,authorization,content-type,accept-profile,x-client-info'},body:JSON.stringify(data)});
   }
   if(!req.url().startsWith(origin))return req.abort();
   return req.continue();
  });
  for(const width of [1440,390]){
   await page.setViewport({width,height:1100});
   await page.goto(origin+'/trajectory-bnpp-check.html?slug='+spec.slug,{waitUntil:'networkidle0'});
   await page.waitForFunction(()=>document.body.innerText.includes('Prix / reconstitution'),{timeout:15000});
   const cards=await page.$$eval('#trajectoire-scpi .grid > div',xs=>xs.slice(0,5).map(x=>x.innerText));
   const valuation=cards[2]||'';
   const money=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(spec.recon);
   assert.ok(valuation.includes(money+' €'),spec.slug+' missing reconstruction '+money);
   assert.match(valuation,/30\/06\/2026/,spec.slug+' missing true valuation date');
   assert.match(valuation,/T3 2026/,spec.slug+' wrong quarter');
   assert.ok((cards[3]||'').includes(new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(spec.dist)+' €'),spec.slug+' distribution absent');
   if(spec.debt===null)assert.doesNotMatch(cards[4]||'',/Endettement\s+0 %/,spec.slug+' unknown debt shown as zero');
   else assert.ok((cards[4]||'').includes('21,5 %'),spec.slug+' debt not displayed');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,spec.slug+' overflow '+width);
   await page.screenshot({path:new URL(spec.slug+'-'+width+'.png',folder).pathname,fullPage:true});
   console.log(JSON.stringify({slug:spec.slug,width,status:'PASS',valuation,distribution:cards[3],debt:cards[4]}));
  }
  await page.close();
 }
 assert.deepEqual(issues,[]);
} finally {if(browser)await browser.close();await rm(fixture,{force:true});}
