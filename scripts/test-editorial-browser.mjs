import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(repository, 'dist');
const enabled = process.env.CI === 'true' || process.env.RUN_EDITORIAL_BROWSER === 'true';

test('RECOVERY-028: nine built routes and the thematic React view render compliant copy', {
  skip: enabled ? false : 'Browser gate runs after the production build in CI, or with RUN_EDITORIAL_BROWSER=true.',
  timeout: 180000,
}, async () => {
  assert.ok(fs.existsSync(path.join(dist, 'index.html')), 'Build dist before the browser gate');
  const { default: puppeteer } = await import('puppeteer');
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    // The thematic generator intentionally serves standalone HTML. The extra
    // header is test-only: it also exercises the existing SPA counterpart.
    const forceSpa = request.headers['x-recovery-028-spa'] === '1'
      && (pathname.endsWith('/') || !path.extname(pathname));
    let file = forceSpa ? path.join(dist, 'index.html') : path.resolve(dist, '.' + pathname);
    if (file !== dist && !file.startsWith(dist + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) file = path.join(dist, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });

  let browser;
  const results = [];
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const origin = 'http://127.0.0.1:' + server.address().port;
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1365, height: 900 });
    // Keep public-page QA local: analytics, widgets and remote data do not run.
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (url.startsWith(origin + '/') || url.startsWith('data:') || url.startsWith('blob:')) request.continue();
      else request.abort();
    });
    const routes = [
      ['/', 'Analysez'],
      ['/meilleures-scpi-rendement/', 'Comparer les SCPI de rendement'],
      ['/transitions-europe/', 'Transitions Europe'],
      ['/comete/', 'Comète'],
      ['/remake-live/', 'Remake Live'],
      ['/expertise-orias-cif/', 'ORIAS'],
      ['/faq/', 'Foire Aux Questions'],
      ['/articles/demembrement-scpi-nue-propriete-usufruit/', 'Démembrement'],
      ['/comparateur-scpi/', 'Comparateur SCPI'],
    ];
    const forbidden = /certifi[ée]e? ORIAS|Sous (le )?contr[ôo]le (de l')?ACPR|(?:^|\n)ACPR(?:\n|$)|Conseils? gratuits?|Rendez-vous Gratuit|rappelle gratuitement|aucun frais pour l'investisseur|Classement Officiel|Toutes labellis[ée]es ISR|amortis par les rendements|Rendements moyens de 4% à 6%|8% à 12% HT|Résumé en attente de vérification documentaire|Confiance donnée|signaux certifiés|Ce que disent nos clients/im;

    for (const [route, heading] of routes) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      const standalone = route === '/meilleures-scpi-rendement/';
      await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 30000 });
      // For SPA routes a matching shell is insufficient: wait for React's h1.
      await page.waitForFunction((text, isStandalone) => [...document.querySelectorAll('h1')].some(node =>
        node.textContent.includes(text) && (isStandalone || Object.keys(node).some(key => key.startsWith('__reactFiber$')))
      ), { timeout: 15000 }, heading, standalone);
      if (route === '/') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForSelector('footer');
      }
      if (route === '/faq/') {
        const buttons = await page.$$('button');
        let opened = false;
        for (const button of buttons) {
          if ((await button.evaluate(node => node.textContent)).includes('Quels frais rémunèrent le cabinet')) {
            await button.click();
            opened = true;
            break;
          }
        }
        assert.ok(opened, 'The remuneration question must be accessible');
        await page.waitForFunction(() => document.body.innerText.includes('Aucun honoraire'));
      }
      const text = await page.evaluate(() => document.body.innerText);
      assert.doesNotMatch(text, forbidden, route);
      assert.deepEqual(errors, [], route + ': no React runtime error');
      if (route === '/expertise-orias-cif/') assert.match(text, /conseil non indépendant/);
      if (route === '/meilleures-scpi-rendement/') {
        assert.match(text, /Taux de distribution passés, non garantis/);
        assert.doesNotMatch(text, /95%\+|supérieur à 93%/);
        await page.setExtraHTTPHeaders({ 'x-recovery-028-spa': '1' });
        try {
          await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 30000 });
          await page.waitForFunction(text => [...document.querySelectorAll('#root h1')].some(node =>
            node.textContent.includes(text) && Object.keys(node).some(key => key.startsWith('__reactFiber$'))
          ), { timeout: 15000 }, heading);
          const reactText = await page.evaluate(() => document.body.innerText);
          assert.doesNotMatch(reactText, forbidden, route + ': React counterpart');
          assert.match(reactText, /Taux de distribution passés, non garantis/);
          assert.doesNotMatch(reactText, /95%\+|supérieur à 93%/);
          assert.deepEqual(errors, [], route + ': React counterpart runtime');
        } finally {
          await page.setExtraHTTPHeaders({});
        }
      }
      if (route === '/comparateur-scpi/') {
        assert.equal(await page.$('a[href="/methodologie-donnees"]'), null);
        assert.equal(await page.$('a[href="/methodologie-donnees/"]'), null);
        assert.ok(await page.$('a[href="/methodologie-donnees-scpi/"]'));
      }
      const schemaTypes = await page.evaluate(() => {
        const types = [];
        const walk = value => {
          if (Array.isArray(value)) value.forEach(walk);
          else if (value && typeof value === 'object') {
            if (value['@type']) types.push(...[value['@type']].flat());
            Object.values(value).forEach(walk);
          }
        };
        document.querySelectorAll('script[type="application/ld+json"]').forEach(node => walk(JSON.parse(node.textContent)));
        return types;
      });
      assert.ok(!schemaTypes.some(type => type === 'Review' || type === 'AggregateRating'), route);
      page.off('pageerror', onError);
      results.push({ route, heading, mode: standalone ? 'standalone HTML + React counterpart' : 'React', status: 'passed', runtimeErrors: errors, schemaTypes });
      console.log('EDITORIAL_BROWSER_PASS', route);
    }
  } finally {
    const directory = path.join(repository, 'test-results/scpi-existing-baseline');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'recovery028-editorial-browser.json'), JSON.stringify({ results, completed: results.length === 9 }, null, 2));
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
