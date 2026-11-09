// Visual QA for the real Trajectory fallback. Synthetic fixtures are TEST ONLY.
// Run under Vite dev with VITE_SUPABASE_URL=https://trajectory-test.supabase.co.
// No financial certification or external data is inferred.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import { writeFile, rm } from 'node:fs/promises';

const origin = process.env.TRAJECTORY_TEST_ORIGIN || 'http://127.0.0.1:4173';
const fixture = new URL('../../trajectory-contrast-check.html', import.meta.url);
const mockedRow = {
  scpi_slug: 'sofidynamic', snapshot_at: '2026-06-30', source_period: '2026-T2',
  source_url: 'https://www.sofidy.com/', qa_status: 'verified', source_confidence: 1,
  tof: 97.73, td: 9.04, capitalisation: 248000000, prix_souscription: 320,
  prix_reconstitution: null, prix_retrait: 313.60, valeur_realisation: null,
  endettement: 16, distribution_par_part: 5.52, parts_attente_retrait: 0,
  nombre_parts: 672775, capital_type: 'variable', liquidity_basis: 'withdrawal_queue',
  retrait_attente_pct: 0,
};
await writeFile(fixture, `<!doctype html><html lang="fr"><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="margin:0;background:#fff"><div id="root"></div><script type="module">import React from 'react';import {createRoot} from 'react-dom/client';import Panel from '/src/components/trajectory/ScpiTrajectoryPanel.tsx';import '/src/index.css';createRoot(document.getElementById('root')).render(React.createElement(Panel,{scpiSlug:'sofidynamic'}));</script></body></html>`);
let browser;
try {
  browser = await puppeteer.launch({headless: true, args: ['--no-sandbox','--disable-dev-shm-usage']});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', async request => {
    if (request.url().startsWith('https://trajectory-test.supabase.co/')) {
      const data = request.url().includes('scpi_trajectory_pilot_history') ? [mockedRow] : null;
      return request.respond({
        status: 200,
        contentType: 'application/json',
        headers: {'access-control-allow-origin':'*','access-control-allow-headers':'apikey,authorization,content-type,accept-profile,x-client-info'},
        body: JSON.stringify(data),
      });
    }
    if (!request.url().startsWith(origin)) return request.abort();
    return request.continue();
  });
  for (const width of [1440, 390]) {
    await page.setViewport({width, height: 950});
    await page.goto(origin + '/trajectory-contrast-check.html', {waitUntil:'networkidle0'});
    await page.waitForSelector('[data-testid="scpi-trajectory-insufficient-history"]', {timeout:15000});
    const observation = await page.evaluate(() => {
      const block = document.querySelector('[data-testid="scpi-trajectory-insufficient-history"]');
      const title = block?.querySelector('h3');
      return {
        title: title?.textContent?.trim(),
        background: block ? getComputedStyle(block).backgroundColor : null,
        foreground: title ? getComputedStyle(title).color : null,
        periods: block?.textContent?.trim()?.slice(0,180),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.match(observation.title || '', /Trajectoire historique en cours/);
    assert.equal(observation.background, 'rgb(2, 6, 23)');
    assert.equal(observation.foreground, 'rgb(255, 255, 255)');
    assert.match(observation.periods || '', /1 période historique admissible/);
    assert.equal(observation.overflow, false, 'Unexpected horizontal overflow: ' + width);
    console.log('SCPI_TRAJECTORY_CONTRAST_QA', JSON.stringify({width, result:'PASS', ...observation}));
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  if (browser) await browser.close();
  await rm(fixture, {force:true});
}
