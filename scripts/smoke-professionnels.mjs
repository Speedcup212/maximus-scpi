import puppeteer from 'puppeteer';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const url = `${baseUrl}/professionnels`;
const errors = [];
const failedRequests = [];
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error?.stack || error?.message || String(error)));
  page.on('requestfailed', request => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  const rootText = await page.$eval('#root', el => el.innerText || '');
  console.log('HTTP_STATUS', response?.status());
  console.log('ROOT_TEXT', rootText.slice(0, 2000));
  console.log('PAGE_ERRORS', JSON.stringify(errors, null, 2));
  console.log('FAILED_REQUESTS', JSON.stringify(failedRequests, null, 2));
  if (!response?.ok() || errors.length || failedRequests.some(x => x.includes('/assets/')) || !/Espace CGP|Expert-Comptable|professionnel/i.test(rootText)) {
    throw new Error('PROFESSIONNELS_SMOKE_FAILED');
  }
  console.log('PROFESSIONNELS_SMOKE_PASS');
} finally {
  await browser.close();
}
