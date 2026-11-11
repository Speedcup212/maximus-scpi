// Real Chromium crash test for the Actualités hub and two SCPI/article routes.
// Uses the Vite production build and deliberately blocks external APIs to verify fallback.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
const origin='http://127.0.0.1:4287',output=path.resolve('test-results/actualites-crash-test');
await mkdir(output,{recursive:true});
const cases=[],server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4287','--strictPort'],{stdio:'ignore'});
let browser;
const articlePath='/actualites/optimale/2026-10-07-optimale-investit-environ-4-4-m-dans-trois-commerces-a-belz-et-au-plessis-robinson/';
try{
 let ready=false;
 for(let i=0;i<70;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
 assert.ok(ready,'Vite build preview not ready');
 const doc=await fetch(origin+articlePath);
 assert.equal(doc.status,200,'Acquisition page not served by HTTP');
 const html=await doc.text();
 assert.match(html,/<link rel="canonical" href="https:\/\/maximusscpi.com\/actualites\/optimale\//);
 assert.match(html,/Optimale investit environ 4,4 M€/);
 cases.push({case:'HTTP canonical and server-rendered acquisition HTML',status:'PASS'});
 browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [1440,390]){
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,220)));
  await page.setViewport({width,height:920,isMobile:width<700,hasTouch:width<700});
  await page.setRequestInterception(true);
  page.on('request',r=>/^https?:/.test(r.url())&&!r.url().startsWith(origin)?r.abort():r.continue());
  await page.goto(origin+'/actualites/',{waitUntil:'networkidle0',timeout:45000});
  await page.waitForSelector('input[placeholder^="Rechercher"]',{timeout:25000});
  await page.waitForFunction(()=>document.body.innerText.includes('Dossiers d’actualités des 69 SCPI')||document.body.innerText.includes("Dossiers d'actualités des 69 SCPI"),{timeout:12000});
  assert.equal(errors.length,0,'Hub JS runtime error '+errors.join(' | '));
  await page.screenshot({path:path.join(output,'hub-'+width+'.png'),fullPage:false});
  cases.push({case:'Responsive hub '+width,status:'PASS'});
  await page.goto(origin+articlePath,{waitUntil:'networkidle0',timeout:45000});
  await page.waitForFunction(()=>document.body.innerText.includes('Optimale investit environ 4,4 M€'),{timeout:25000});
  const body=await page.evaluate(()=>document.body.innerText);
  assert.ok(body.includes('Belz')&&body.includes('Plessis-Robinson'),'Article lacks real locations');
  assert.ok(!body.includes('Rome, Italie'),'Wrong geographical mapping survived');
  assert.equal(errors.length,0,'Article JS runtime error '+errors.join(' | '));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=4,'Horizontal page overflow '+overflow+' pixels at '+width);
  await page.screenshot({path:path.join(output,'optimale-'+width+'.png'),fullPage:false});
  cases.push({case:'Optimale deep-link '+width,status:'PASS',overflow});
  await page.goto(origin+'/actualites/cristal-life/',{waitUntil:'networkidle0',timeout:45000});
  await page.waitForFunction(()=>document.body.innerText.includes('Cristal Life')&&document.body.innerText.includes('Bulletin analysé'),{timeout:25000});
  assert.equal(errors.length,0,'SCPI dossier JS runtime error '+errors.join(' | '));
  cases.push({case:'Cristal Life quarterly dossier deep-link '+width,status:'PASS'});
  await page.close();
 }
 await writeFile(path.join(output,'result.json'),JSON.stringify({result:'PASS',cases},null,2));
 console.log('Actualités browser crash test: PASS '+cases.length+' scenarios');
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
