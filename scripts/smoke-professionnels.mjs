import puppeteer from 'puppeteer';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function check(path, expected, label) {
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', error => errors.push(error?.stack || error?.message || String(error)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));

  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  const snapshot = await page.evaluate(() => ({
    title: document.title,
    rootText: document.getElementById('root')?.innerText || '',
    rootHtmlLength: document.getElementById('root')?.innerHTML?.length || 0,
  }));

  console.log(label, 'HTTP_STATUS', response?.status());
  console.log(label, 'TITLE', snapshot.title);
  console.log(label, 'ROOT_TEXT', snapshot.rootText.slice(0, 2200));
  console.log(label, 'ROOT_HTML_LENGTH', snapshot.rootHtmlLength);
  console.log(label, 'PAGE_ERRORS', JSON.stringify(errors, null, 2));
  console.log(label, 'CONSOLE_ERRORS', JSON.stringify(consoleErrors, null, 2));
  console.log(label, 'FAILED_REQUESTS', JSON.stringify(failedRequests, null, 2));

  const failed = !response?.ok() || errors.length > 0 || failedRequests.some(item => item.includes('/assets/')) || !expected.test(snapshot.rootText);
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
