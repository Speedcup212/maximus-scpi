import puppeteer from 'puppeteer';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const url = `${baseUrl}/professionnels`;
const errors = [];
const failedRequests = [];
const consoleErrors = [];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error?.stack || error?.message || String(error)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
  });

  const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 1200));
  const snapshot = await page.evaluate(() => ({
    title: document.title,
    text: document.body?.innerText || '',
    htmlLength: document.body?.innerHTML?.length || 0,
    rootText: document.getElementById('root')?.innerText || '',
    rootHtmlLength: document.getElementById('root')?.innerHTML?.length || 0,
  }));

  console.log('SMOKE_URL', url);
  console.log('HTTP_STATUS', response?.status());
  console.log('TITLE', snapshot.title);
  console.log('BODY_TEXT', snapshot.text.slice(0, 2500));
  console.log('BODY_HTML_LENGTH', snapshot.htmlLength);
  console.log('ROOT_TEXT', snapshot.rootText.slice(0, 2500));
  console.log('ROOT_HTML_LENGTH', snapshot.rootHtmlLength);
  console.log('PAGE_ERRORS', JSON.stringify(errors, null, 2));
  console.log('CONSOLE_ERRORS', JSON.stringify(consoleErrors, null, 2));
  console.log('FAILED_REQUESTS', JSON.stringify(failedRequests, null, 2));

  const hasExpectedCopy = /CGP|conseiller|professionnel|partenaire/i.test(snapshot.rootText);
  const assetFailure = failedRequests.some(item => item.includes('/assets/'));
  if (!response || !response.ok() || errors.length > 0 || assetFailure || !hasExpectedCopy) {
    console.error('PROFESSIONNELS_SMOKE_FAILED');
    process.exitCode = 1;
  } else {
    console.log('PROFESSIONNELS_SMOKE_PASS');
  }
} finally {
  await browser.close();
}
