import puppeteer from 'puppeteer';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function check(path, expected, label) {
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];
  page.on('pageerror', error => errors.push(error?.stack || error?.message || String(error)));
  page.on('requestfailed', request => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  const rootText = await page.$eval('#root', el => el.innerText || '');
  console.log(label, 'HTTP_STATUS', response?.status());
  console.log(label, 'ROOT_TEXT', rootText.slice(0, 2000));
  console.log(label, 'PAGE_ERRORS', JSON.stringify(errors, null, 2));
  console.log(label, 'FAILED_REQUESTS', JSON.stringify(failedRequests, null, 2));
  const failed = !response?.ok() || errors.length > 0 || failedRequests.some(x => x.includes('/assets/')) || !expected.test(rootText);
  await page.close();
  if (failed) throw new Error(`${label}_SMOKE_FAILED`);
  console.log(`${label}_SMOKE_PASS`);
}

try {
  await check('/professionnels', /Espace CGP|Expert-Comptable|professionnel/i, 'PROFESSIONNELS');
  await check('/pro/cgp-login', /Google|connexion|connecter|CGP/i, 'PRO_CGP_LOGIN');
} finally {
  await browser.close();
}
