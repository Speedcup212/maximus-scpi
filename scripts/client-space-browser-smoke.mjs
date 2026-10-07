import { spawn } from 'node:child_process';
import http from 'node:http';
import puppeteer from 'puppeteer';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE = `http://${HOST}:${PORT}`;

const preview = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', HOST, '--port', String(PORT)],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      // Le smoke teste le routage/les guards, pas l'infrastructure distante.
      // Ces valeurs factices permettent d'initialiser supabase-js en CI sans exposer de clé réelle.
      VITE_SUPABASE_URL: 'https://smoke-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'smoke-test-publishable-key',
    },
  },
);

let previewLogs = '';
preview.stdout.on('data', chunk => {
  previewLogs += chunk.toString();
});
preview.stderr.on('data', chunk => {
  previewLogs += chunk.toString();
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const ok = await new Promise(resolve => {
      const req = http.get(BASE, res => {
        res.resume();
        resolve(Boolean(res.statusCode && res.statusCode < 500));
      });
      req.on('error', () => resolve(false));
      req.setTimeout(500, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await sleep(250);
  }
  throw new Error(`Vite dev n'a pas démarré.\n${previewLogs}`);
};

const assertContains = async (page, path, expected) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 30_000 });
  await page.waitForSelector('body', { timeout: 10_000 });
  const body = await page.$eval('body', el => el.innerText);
  for (const text of expected) {
    if (!body.includes(text)) {
      throw new Error(`Smoke test ${path}: texte absent "${text}".\nBody:\n${body.slice(0, 2000)}`);
    }
  }
};

let browser;
try {
  await waitForServer();

  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('pageerror', error => {
    throw error;
  });

  await assertContains(page, '/app/login', ['Connexion', 'Continuer avec Google']);
  await assertContains(page, '/app/request-access', ['Demander un accès', 'Après validation']);

  await page.goto(`${BASE}/app/client`, { waitUntil: 'networkidle2', timeout: 30_000 });
  await sleep(1000);
  const protectedBody = await page.$eval('body', el => el.innerText);
  if (!protectedBody.includes('Connexion')) {
    throw new Error(
      `Route protégée /app/client non redirigée vers la connexion.\nBody:\n${protectedBody.slice(0, 2000)}`,
    );
  }

  console.log('Client space browser smoke: PASS');
} finally {
  if (browser) await browser.close();
  preview.kill('SIGTERM');
}
