import fs from 'fs';
import path from 'path';
import http from 'http';
import { createHash } from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { articleTemplates } from '../src/data/articleTemplatesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const articlesDir = path.join(distDir, 'articles');
const host = '127.0.0.1';
const port = 4174;
const origin = `http://${host}:${port}`;

const templates = articleTemplates.filter((entry) => entry.indexable !== false);

const waitForServer = () => new Promise<void>((resolve, reject) => {
  const startedAt = Date.now();
  const tick = () => {
    const req = http.get(origin, (res) => {
      res.resume();
      if (res.statusCode && res.statusCode < 500) return resolve();
      if (Date.now() - startedAt > 30000) return reject(new Error(`Vite preview indisponible (${res.statusCode})`));
      setTimeout(tick, 250);
    });
    req.on('error', () => {
      if (Date.now() - startedAt > 30000) return reject(new Error('Vite preview inaccessible après 30 s'));
      setTimeout(tick, 250);
    });
  };
  tick();
});

const extractRootBounds = (html: string) => {
  const rootStart = html.indexOf('<div id="root"');
  if (rootStart === -1) throw new Error('div#root absent');
  const openEnd = html.indexOf('>', rootStart);
  if (openEnd === -1) throw new Error('ouverture div#root invalide');
  const moduleStart = html.indexOf('<script type="module"', openEnd);
  if (moduleStart === -1) throw new Error('script Vite de production absent après #root');
  const closeStart = html.lastIndexOf('</div>', moduleStart);
  if (closeStart === -1 || closeStart <= openEnd) throw new Error('fermeture div#root introuvable');
  return { rootStart, openEnd, closeStart };
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

const injectReactRoot = (baseHtml: string, slug: string, rootHtml: string) => {
  const { rootStart, openEnd, closeStart } = extractRootBounds(baseHtml);
  const openingTag = baseHtml.slice(rootStart, openEnd + 1)
    .replace(/\sdata-react-prerender=(['"])[\s\S]*?\1/gi, '')
    .replace(/\sdata-react-prerender-slug=(['"])[\s\S]*?\1/gi, '')
    .replace(/>$/, ` data-react-prerender="true" data-react-prerender-slug="${slug}">`);

  return baseHtml.slice(0, rootStart) + openingTag + rootHtml + baseHtml.slice(closeStart);
};

const launchPreview = () => {
  const viteBin = path.join(projectRoot, 'node_modules', '.bin', 'vite');
  const child = spawn(viteBin, ['preview', '--host', host, '--port', String(port), '--strictPort'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', (chunk) => process.stdout.write(`[vite-preview] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[vite-preview] ${chunk}`));
  return child;
};

const processArticle = async (page: any, template: (typeof templates)[number]) => {
  const slug = template.slug;
  const url = `${origin}/articles/${slug}/`;
  const filePath = path.join(articlesDir, slug, 'index.html');

  if (!fs.existsSync(filePath)) {
    throw new Error(`${slug}: shell HTML absent avant pré-rendu`);
  }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    if (!root) return false;
    const text = (root.innerText || '').replace(/\s+/g, ' ').trim();
    const h1 = root.querySelectorAll('h1').length;
    const h2 = root.querySelectorAll('h2').length;
    const legacyShell = root.querySelector('.article-seo-shell');
    return !legacyShell && h1 >= 1 && h2 >= 5 && text.length >= 2200;
  }, { timeout: 20000 });

  const captured = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) throw new Error('root React absent');
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, iframe, [class*="modal"], [class*="Modal"]').forEach((el) => el.remove());
    const html = clone.innerHTML.trim();
    const text = (clone.innerText || '').replace(/\s+/g, ' ').trim();
    return {
      html,
      text,
      h1Count: clone.querySelectorAll('h1').length,
      h2Count: clone.querySelectorAll('h2').length
    };
  });

  if (!captured.html || captured.text.length < 2200 || captured.h2Count < 5) {
    throw new Error(`${slug}: rendu React trop mince (${captured.text.length} caractères, ${captured.h2Count} H2)`);
  }

  const baseHtml = fs.readFileSync(filePath, 'utf-8');
  const finalHtml = injectReactRoot(baseHtml, slug, captured.html);
  fs.writeFileSync(filePath, finalHtml, 'utf-8');

  return {
    slug,
    chars: captured.text.length,
    words: normalizeText(captured.text).split(' ').filter(Boolean).length,
    h1: captured.h1Count,
    h2: captured.h2Count,
    rootHash: hash(captured.html)
  };
};

const main = async () => {
  if (!fs.existsSync(distDir)) throw new Error('dist/ absent : lancer après vite build');
  if (!fs.existsSync(articlesDir)) throw new Error('dist/articles/ absent');

  console.log(`🚀 Pré-rendu React autoritaire : ${templates.length} articles`);
  const preview = launchPreview();
  let browser: any;

  try {
    await waitForServer();
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const workerCount = Math.min(4, templates.length);
    let cursor = 0;
    const results: any[] = [];
    const failures: string[] = [];

    const worker = async (workerId: number) => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1365, height: 900 });
      await page.setRequestInterception(true);
      page.on('request', (request: any) => {
        const url = request.url();
        if (
          url.startsWith(origin) ||
          url.startsWith('data:') ||
          url.startsWith('blob:') ||
          url.startsWith('about:')
        ) request.continue();
        else request.abort();
      });

      try {
        while (true) {
          const index = cursor++;
          if (index >= templates.length) break;
          const template = templates[index];
          try {
            const result = await processArticle(page, template);
            results.push(result);
            console.log(`   ✓ [${workerId}] ${template.slug} — ${result.words} mots, ${result.h2} H2`);
          } catch (error: any) {
            failures.push(`${template.slug}: ${error?.message || error}`);
            console.error(`   ❌ [${workerId}] ${template.slug}: ${error?.message || error}`);
          }
        }
      } finally {
        await page.close();
      }
    };

    await Promise.all(Array.from({ length: workerCount }, (_, index) => worker(index + 1)));

    if (failures.length) {
      console.error(`❌ Pré-rendu React incomplet : ${failures.length} anomalie(s)`);
      failures.slice(0, 40).forEach((failure) => console.error(`   - ${failure}`));
      process.exitCode = 1;
      return;
    }

    results.sort((a, b) => a.slug.localeCompare(b.slug));
    const manifest = {
      generatedAt: new Date().toISOString(),
      source: 'DynamicArticlePage React',
      count: results.length,
      articles: results
    };
    fs.writeFileSync(
      path.join(articlesDir, 'react-prerender-manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    const minChars = Math.min(...results.map((entry) => entry.chars));
    const minWords = Math.min(...results.map((entry) => entry.words));
    console.log(`✅ Pré-rendu React terminé : ${results.length}/${templates.length} articles · minimum ${minWords} mots / ${minChars} caractères`);
  } finally {
    if (browser) await browser.close();
    preview.kill('SIGTERM');
  }
};

main().catch((error) => {
  console.error('❌ Pré-rendu React fatal :', error);
  process.exit(1);
});
