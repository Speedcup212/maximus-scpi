// Exercise the real production comparator against its published catalog, offline.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { scpiData } from '../../src/data/scpiData.ts';
import { getScpiDiscountPremium } from '../../src/utils/scpiDiscountPremium.ts';

const origin = 'http://127.0.0.1:4198';
const output = path.resolve('test-results/comparator-financial-filters');
await mkdir(output, { recursive: true });
const finite = value => typeof value === 'number' && Number.isFinite(value);
const capital = scpi => finite(scpi.capitalization) && scpi.capitalization >= 100_000_000;
const discount = scpi => scpi.discountQaStatus === 'publishable' &&
  getScpiDiscountPremium(scpi).value !== null && getScpiDiscountPremium(scpi).value <= 1e-9;
const debt = scpi => finite(scpi.debt) && scpi.debt >= 0 && scpi.debt <= 30;
const delay = scpi => finite(scpi.delaiJouissance) && scpi.delaiJouissance >= 0 && scpi.delaiJouissance <= 3;
const cases = [
  { name: 'capitalization', fields: { 'capitalization-0': '100' }, expected: scpiData.filter(capital) },
  { name: 'discount', fields: { 'discount-1': '0' }, expected: scpiData.filter(discount) },
  { name: 'debt', fields: { 'max-ltv': '30' }, expected: scpiData.filter(debt) },
  { name: 'enjoyment', fields: { 'max-jouissance': '3' }, expected: scpiData.filter(delay) },
  { name: 'combined', fields: { 'capitalization-0': '100', 'discount-1': '0', 'max-ltv': '30', 'max-jouissance': '3' },
    expected: scpiData.filter(scpi => capital(scpi) && discount(scpi) && debt(scpi) && delay(scpi)) },
];
const report = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  executed_at: new Date().toISOString(), cohort_count: scpiData.length, cases: [] };
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview',
  '--host', '127.0.0.1', '--port', '4198', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Compiled comparator preview must start');
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const width of [1440, 390]) {
    const page = await browser.newPage();
    const runtimeErrors = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    await page.setViewport({ width, height: 1000, isMobile: width < 768, hasTouch: width < 768 });
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) && !request.url().startsWith(origin)
      ? request.abort() : request.continue());
    await page.goto(`${origin}/comparateur-scpi/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#scpi-grid h3', { timeout: 20000 });
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Refuser tout')?.click();
    });
    const openFilters = async () => {
      const buttons = await page.$$('button[aria-label="Ouvrir les filtres"]');
      for (const button of buttons) {
        if (await button.boundingBox()) { await button.click(); break; }
      }
      await page.waitForSelector('#capitalization-0', { visible: true });
    };
    const count = () => page.evaluate(() => {
      const label = Array.from(document.querySelectorAll('button'))
        .map(button => button.textContent.trim()).find(text => /^Voir les \d+ SCPI$/.test(text));
      return label ? Number(label.match(/\d+/)[0]) : null;
    });
    const reset = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Réinitialiser')?.click();
    });
    await openFilters();
    assert.equal(await count(), scpiData.length, 'No filter excludes a certified fund');
    assert.equal(await page.$$('input[type="number"]').then(inputs => inputs.length), 6);
    for (const test of cases) {
      await reset();
      await page.waitForFunction(expected => Array.from(document.querySelectorAll('button'))
        .some(button => button.textContent.trim() === `Voir les ${expected} SCPI`), {}, scpiData.length);
      for (const [id, value] of Object.entries(test.fields)) await page.type(`#${id}`, value);
      await page.waitForFunction(expected => Array.from(document.querySelectorAll('button'))
        .some(button => button.textContent.trim() === `Voir les ${expected} SCPI`), {}, test.expected.length);
      assert.equal(await count(), test.expected.length, test.name);
      report.cases.push({ width, scenario: test.name, count: await count(), status: 'PASS' });
    }
    assert.equal(await page.evaluate(() => {
      const section = document.querySelector('[aria-labelledby="financial-filters-title"]');
      const rect = section.getBoundingClientRect();
      return section.scrollWidth <= section.clientWidth + 1 && rect.left >= 0 && rect.right <= innerWidth + 1;
    }), true, 'Financial controls fit the desktop/mobile panel');
    await page.evaluate(() => document.querySelector('#financial-filters-title').scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(output, `filters-${width}.png`) });
    await page.click('button[aria-label="Fermer les filtres"]');
    await page.waitForSelector('#capitalization-0', { hidden: true });
    assert.equal(new URL(page.url()).pathname, '/comparateur-scpi/', 'Closing filters must not click the site header behind them');
    const expectedNames = [...cases.at(-1).expected].sort((a, b) => b.yield - a.yield).slice(0, 9).map(scpi => scpi.name);
    await page.waitForFunction(expected => Array.from(document.querySelectorAll('#scpi-grid h3'))
      .map(node => node.textContent).join('|') === expected.join('|'), {}, expectedNames);
    assert.deepEqual(await page.$$eval('#scpi-grid h3', nodes => nodes.map(node => node.textContent)), expectedNames);
    assert.equal(await page.$$eval('button[aria-label="Ouvrir les filtres"]', buttons => {
      const visible = buttons.find(button => button.getBoundingClientRect().width > 0);
      return visible?.querySelector('span.absolute')?.textContent;
    }), '4', 'All four active criteria appear in the counter');
    await openFilters();
    await reset();
    await page.waitForFunction(expected => Array.from(document.querySelectorAll('button'))
      .some(button => button.textContent.trim() === `Voir les ${expected} SCPI`), {}, scpiData.length);
    assert.equal(await count(), scpiData.length, 'Reset restores the whole cohort');
    assert.deepEqual(runtimeErrors, []);
    report.cases.push({ width, scenario: 'cards-counter-reopen-reset', status: 'PASS' });
    await page.close();
  }
  console.log(JSON.stringify(report));
} finally {
  await writeFile(path.join(output, 'observations.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  server.kill();
}
