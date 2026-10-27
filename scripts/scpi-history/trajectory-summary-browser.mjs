// Run against Vite with VITE_SUPABASE_URL=https://trajectory-test.supabase.co
// and VITE_SUPABASE_ANON_KEY=test-public-key. All API responses are intercepted.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {writeFile,rm} from 'node:fs/promises';
const origin = process.env.TRAJECTORY_TEST_ORIGIN || 'http://127.0.0.1:4173';
const base = {scpi_slug:'corum-usa',snapshot_at:'2026-10-27',source_url:'https://www.corum.fr/bulletin.pdf',qa_status:'verified',source_confidence:1,
  tof:100,td:null,capitalisation:null,prix_souscription:null,prix_reconstitution:null,prix_retrait:null,valeur_realisation:null,endettement:null,
  distribution_par_part:null,parts_attente_retrait:0,nombre_parts:412240,capital_type:'variable',liquidity_basis:'withdrawal_queue',retrait_attente_pct:0};
const rows = [{...base,source_period:'2026-T2',prix_souscription:200,prix_reconstitution:216.34,distribution_par_part:3.27,endettement:0},
  {...base,source_period:'2026-T3',prix_souscription:200,distribution_par_part:3.15}];
const fixture = new URL('../../trajectory-summary-check.html',import.meta.url);
await writeFile(fixture,`<div id="root"></div><script type="module">import React from 'react';import {createRoot} from 'react-dom/client';import Panel from '/src/components/trajectory/ScpiTrajectoryPanel.tsx';import '/src/index.css';createRoot(document.getElementById('root')).render(React.createElement(Panel,{scpiSlug:'corum-usa'}));</script>`);
let browser;
try {
browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page = await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', async r=>{
    if(r.url().startsWith('https://trajectory-test.supabase.co/')) {
      let data=[];
      if(r.url().includes('scpi_trajectory_pilot_history')) data=rows;
      else if(r.url().includes('scpi_trajectory_pilot_liquidity')) data={scpi_slug:'corum-usa',source_period:'2026-T3',liquidity_basis:'withdrawal_queue',retrait_attente_pct:0,liquidity_pressure_pct:0,regime_changed:false,signal_certification:'trajectory_certified'};
      else if(r.url().includes('scpi_trajectory_signal_gate')) data={scpi_slug:'corum-usa',data_gate:'PASS',structural_gate:'PASS',semantic_gate:'PASS',liquidity_gate:'PASS',liquidity_signal_eligible:true};
      return r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'apikey,authorization,content-type,accept-profile,x-client-info'},body:JSON.stringify(data)});
    }
    if(!r.url().startsWith(origin)) return r.abort();
    return r.continue();
  });
  for (const width of [1440,390]) {
    await page.setViewport({width,height:1000});
    await page.goto(`${origin}/trajectory-summary-check.html`,{waitUntil:'networkidle0'});
    await page.waitForFunction(()=>document.body.innerText.includes('Dernière valeur connue'));
    const cards=await page.$$eval('#trajectoire-scpi .grid > div',es=>es.slice(0,5).map(e=>e.innerText));
    assert.match(cards[2],/200 € \/ 216,34 €/);
    assert.match(cards[2],/Dernière valeur connue · T2 2026/);
    assert.match(cards[3],/3,15 €/);
    assert.match(cards[3],/Observation · T3 2026/);
    assert.match(cards[4],/0 %/);
    assert.match(cards[4],/T3 2026 : donnée non renseignée ou non validée/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'page overflow');
    console.log(JSON.stringify({width,status:'PASS',valuation:cards[2],distribution:cards[3],debt:cards[4]}));
  }
  assert.deepEqual(errors,[]);
} finally {if(browser) await browser.close();await rm(fixture,{force:true});}
