// Browser acceptance on real built SCPI routes, desktop and mobile.
// No remote financial data is inferred; external requests are blocked.
// These are visual component/route tests, not independent financial certification.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const root = path.resolve('.');
const output = path.resolve('test-results/scpi-visual-charts-browser');
const origin = 'http://127.0.0.1:4193';
const routes = ['comete','iroko-atlas','sofidynamic'];
const widths = [1440,390];
const results = [];
fs.mkdirSync(output,{recursive:true});

const proc = spawn(process.execPath,['node_modules/vite/bin/vite.js','preview',
  '--host','127.0.0.1','--port','4193','--strictPort'],{
  cwd: root, stdio: ['ignore','pipe','pipe'], env: process.env,
});
let serverLog = '';
proc.stdout.on('data',d => { serverLog += d.toString(); });
proc.stderr.on('data',d => { serverLog += d.toString(); });
const sleep = n => new Promise(resolve => setTimeout(resolve,n));
const status = url => new Promise((resolve,reject) => {
  http.get(url,r=>{ r.resume();r.on('end',()=>resolve(r.statusCode)); }).on('error',reject);
});
let browser;
try {
  let ready = false;
  for(let attempt=0;attempt<50;attempt++){
    try { if(await status(origin+'/')===200) {ready=true;break;} } catch {}
    await sleep(300);
  }
  assert.ok(ready, 'Local preview unavailable: '+serverLog.slice(-600));
  browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request',r=>{
    if(!r.url().startsWith(origin))return r.abort();
    return r.continue();
  });
  for(const slug of routes)for(const width of widths){
    try {
      await page.setViewport({width,height:920,deviceScaleFactor:1});
      const response=await page.goto(origin+'/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000});
      // 304 is an expected conditional revalidation when revisiting the same page at another width.
      assert.ok([200,304].includes(response?.status()), 'SCPI route HTTP: '+slug+' ('+response?.status()+')');
      await page.waitForSelector('[data-testid="scpi-visual-analysis"]',{timeout:15000});
      await page.waitForSelector('#radar-scpi',{timeout:15000});
      await page.waitForSelector('#trajectoire-scpi',{timeout:20000});
      await page.waitForSelector('[data-testid="scpi-sticky-navigation"]',{timeout:15000});
      const observed=await page.evaluate(()=>{
        const ids=['scpi-synthese','radar-scpi','trajectoire-scpi','scpi-patrimoine','scpi-risques-frais','scpi-documents'];
        const nav=document.querySelector('[data-testid="scpi-sticky-navigation"]');
        const navLinks=nav?.querySelectorAll('nav[aria-label="Navigation dans la fiche SCPI"] a')||[];
        const allAnchorsPresent=ids.every(id=>document.querySelectorAll('#'+id).length===1);
        const source=document.querySelector('[data-testid="scpi-source-references"]');
        const docs=document.getElementById('scpi-documents');
        const details=document.querySelector('[data-testid="scpi-sources-details"]');
        const main=document.getElementById('scpi-synthese');
        const navigable={navCount:document.querySelectorAll('[data-testid="scpi-sticky-navigation"]').length,
          navLinks:navLinks.length,
          labels:Array.from(navLinks).map(x=>x.textContent?.trim()),
          allAnchorsPresent,
          navPosition:nav?getComputedStyle(nav).position:null,
          sourceInDocs:!source||Boolean(source.closest('#scpi-documents')),
          sourcesCollapsed:!details || !details.open,
          sourcesAfterTitle:!source || Boolean(main && docs && (main.compareDocumentPosition(docs) & Node.DOCUMENT_POSITION_FOLLOWING)),
        };
        const radar=document.getElementById('radar-scpi');
        const trajectory=document.getElementById('trajectoire-scpi');
        const radarVisible=!!radar && radar.getBoundingClientRect().height>30;
        const trajectoryVisible=!!trajectory && trajectory.getBoundingClientRect().height>30;
        const fallback=trajectory?.getAttribute('data-testid')==='scpi-trajectory-insufficient-history';
        return {
          h1:document.querySelector('h1')?.textContent?.trim()||'',
          radarCount:document.querySelectorAll('#radar-scpi').length,
          trajectoryCount:document.querySelectorAll('#trajectoire-scpi').length,
          radarVisible,trajectoryVisible,fallback,
          bg:trajectory?getComputedStyle(trajectory).backgroundColor:null,
          headingColor:trajectory?.querySelector('h3')?getComputedStyle(trajectory.querySelector('h3')).color:null,
          ...navigable
        };
      });
      assert.equal(observed.navCount,1,'Duplicate SCPI navigation: '+slug);
      assert.equal(observed.navLinks,6,'SCPI menu must have six tabs: '+slug);
      assert.deepEqual(observed.labels,['Synthèse','Radar','Trajectoire','Patrimoine','Risques & frais','Documents']);
      assert.ok(observed.allAnchorsPresent,'Missing or duplicated section anchor: '+slug);
      assert.equal(observed.navPosition,'sticky','Navigation must be sticky: '+slug);
      assert.ok(observed.sourceInDocs && observed.sourcesAfterTitle && observed.sourcesCollapsed,
        'SCPI official source panel must be under Documents, not above hero: '+slug);
      await page.evaluate(()=>{window.scrollTo({top:Math.min(document.body.scrollHeight/2,document.body.scrollHeight-1000),behavior:'instant'});});
      await page.waitForFunction(()=> {
        const nav=document.querySelector('[data-testid="scpi-sticky-navigation"]');
        return nav && Math.abs(nav.getBoundingClientRect().top-64)<=4;
      },{timeout:5000});
      await page.click('nav[aria-label="Navigation dans la fiche SCPI"] a[href="#scpi-documents"]');
      await page.waitForFunction(() => {
        const docs=document.getElementById('scpi-documents');
        const current=document.querySelector('nav[aria-label="Navigation dans la fiche SCPI"] a[aria-current="location"]');
        const nav=document.querySelector('[data-testid="scpi-sticky-navigation"]');
        return window.location.hash==='#scpi-documents'
          && window.scrollY>100
          && docs && docs.getBoundingClientRect().top<window.innerHeight
          && current?.getAttribute('href')==='#scpi-documents'
          && nav && Math.abs(nav.getBoundingClientRect().top-64)<=4;
      },{timeout:12000});
      // A fresh deep link must scroll after React hydration, not only update the URL.
      await page.goto(origin+'/'+slug+'/?scpi-deep-link-qa='+width+'#scpi-documents',
        {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() => {
        const docs=document.getElementById('scpi-documents');
        const active=document.querySelector('nav[aria-label="Navigation dans la fiche SCPI"] a[aria-current="location"]');
        return docs && window.location.hash==='#scpi-documents'
          && window.scrollY>100
          && docs.getBoundingClientRect().top<window.innerHeight
          && docs.getBoundingClientRect().bottom>64
          && active?.getAttribute('href')==='#scpi-documents';
      },{timeout:12000});
      // Browser back to the summary must also navigate and restore the active item.
      await page.click('nav[aria-label="Navigation dans la fiche SCPI"] a[href="#scpi-synthese"]');
      await page.waitForFunction(() => {
        const active=document.querySelector('nav[aria-label="Navigation dans la fiche SCPI"] a[aria-current="location"]');
        return window.location.hash==='#scpi-synthese'
          && window.scrollY<120
          && active?.getAttribute('href')==='#scpi-synthese';
      },{timeout:12000});
      assert.equal(observed.radarCount,1,'Duplicate Radar: '+slug);
      assert.equal(observed.trajectoryCount,1,'Duplicate Trajectory: '+slug);
      assert.ok(observed.radarVisible,'Hidden Radar: '+slug);
      assert.ok(observed.trajectoryVisible,'Hidden Trajectory: '+slug);
      if(observed.fallback) {
        assert.equal(observed.bg,'rgb(2, 6, 23)','Insufficient-history panel must be dark');
        assert.equal(observed.headingColor,'rgb(255, 255, 255)','Insufficient-history title must be white');
      }
      results.push({slug,width,status:'PASS',...observed});
      console.log('SCPI_VISUAL_CHARTS_BROWSER_PASS',JSON.stringify({slug,width,fallback:observed.fallback}));
    }catch(error){
      results.push({slug,width,status:'FAIL',error:String(error)});
      try{await page.screenshot({path:path.join(output,slug+'-'+width+'-failed.png'),fullPage:true})}catch{}
      throw error;
    }
  }
}finally{
  fs.writeFileSync(path.join(output,'matrix.json'),JSON.stringify({results,source:'local build; external data blocked',generatedAt:new Date().toISOString()},null,2)+'\n');
  if(browser)await browser.close();
  proc.kill('SIGTERM');
}
