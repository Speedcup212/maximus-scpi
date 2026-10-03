import fs from 'fs';
import path from 'path';
import http from 'http';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { articleTemplates } from '../src/data/articleTemplatesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const articlesDir = path.join(distDir, 'articles');
const appShellPath = path.join(distDir, 'index.html');
const host = '127.0.0.1';
const port = 4174;
const origin = `http://${host}:${port}`;
const SITE = 'https://maximusscpi.com';

const templates = articleTemplates.filter((entry) => entry.indexable !== false);

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const replaceOrInsertHeadTag = (html: string, pattern: RegExp, replacement: string) => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
};

const setArticleSeo = (baseHtml: string, template: (typeof templates)[number]) => {
  const canonical = `${SITE}/articles/${template.slug}/`;
  const title = template.title;
  const description = template.metaDescription;
  const keywords = (template.keywords || []).join(', ');

  let html = baseHtml;
  html = replaceOrInsertHeadTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']keywords["'][^>]*>/i, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  html = replaceOrInsertHeadTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsertHeadTag(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, `<link rel="alternate" hreflang="fr" href="${canonical}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="article" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:url["'][^>]*>/i, `<meta property="twitter:url" content="${canonical}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);

  html = html.replace(/\s*<script[^>]+id=["']article-react-prerender-schema["'][^>]*>[\s\S]*?<\/script>/gi, '');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        url: canonical,
        mainEntityOfPage: canonical,
        author: { '@type': 'Person', name: 'Eric Bellaiche', jobTitle: 'Conseiller en Gestion de Patrimoine' },
        publisher: { '@type': 'Organization', name: 'MaximusSCPI', url: SITE },
        keywords: template.keywords || []
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE}/articles/` },
          { '@type': 'ListItem', position: 3, name: title, item: canonical }
        ]
      }
    ]
  };
  const schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');
  return html.replace('</head>', `    <script id="article-react-prerender-schema" type="application/ld+json">${schemaJson}</script>\n  </head>`);
};

const hasProductionModule = (html: string) => /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["'][^"']+["'])[^>]*>/i.test(html);

const extractRootBounds = (html: string) => {
  if (!hasProductionModule(html)) throw new Error('bundle Vite module absent du shell applicatif');
  const rootStart = html.search(/<div\s+id=["']root["'][^>]*>/i);
  if (rootStart === -1) throw new Error('div#root absent du shell applicatif');
  const openEnd = html.indexOf('>', rootStart);
  if (openEnd === -1) throw new Error('ouverture div#root invalide');

  const divTag = /<div\b[^>]*>|<\/div>/gi;
  divTag.lastIndex = openEnd + 1;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = divTag.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return { rootStart, openEnd, closeStart: match.index };
  }
  throw new Error('fermeture div#root introuvable');
};

const injectReactRoot = (baseHtml: string, slug: string, rootHtml: string) => {
  const { rootStart, openEnd, closeStart } = extractRootBounds(baseHtml);
  const openingTag = baseHtml.slice(rootStart, openEnd + 1)
    .replace(/\sdata-react-prerender=(['"])[\s\S]*?\1/gi, '')
    .replace(/\sdata-react-prerender-slug=(['"])[\s\S]*?\1/gi, '')
    .replace(/>$/, ` data-react-prerender="true" data-react-prerender-slug="${slug}">`);
  return baseHtml.slice(0, rootStart) + openingTag + rootHtml + baseHtml.slice(closeStart);
};

const safeFileForRequest = (pathname: string) => {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!decoded) return null;
  const candidate = path.resolve(distDir, decoded);
  if (!candidate.startsWith(path.resolve(distDir) + path.sep)) return null;
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;
  return candidate;
};

const createSpaServer = (appShell: string) => http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', origin);
    const filePath = safeFileForRequest(requestUrl.pathname);
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      const body = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': 'no-store'
      });
      res.end(body);
      return;
    }

    const body = Buffer.from(appShell, 'utf-8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': body.length,
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch (error: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error?.message || 'Erreur serveur SPA');
  }
});

const listen = (server: http.Server) => new Promise<void>((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, host, () => resolve());
});
const closeServer = (server: http.Server) => new Promise<void>((resolve) => server.close(() => resolve()));

const processArticle = async (page: any, template: (typeof templates)[number], appShell: string) => {
  const slug = template.slug;
  const url = `${origin}/articles/${slug}/`;
  const expectedTitle = template.title;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

  try {
    await page.waitForFunction((title: string) => {
      const root = document.getElementById('root');
      if (!root) return false;
      const normalize = (value: string) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const expectedTokens = normalize(title).split(' ').filter((token) => token.length >= 3).slice(0, 9);
      const h1Texts = Array.from(root.querySelectorAll('h1')).map((node) => normalize((node.textContent || '')));
      const titleMatch = h1Texts.some((h1) => {
        const overlap = expectedTokens.filter((token) => h1.includes(token)).length;
        return overlap >= Math.min(4, expectedTokens.length);
      });
      const text = (root.innerText || '').replace(/\s+/g, ' ').trim();
      const h2 = root.querySelectorAll('h2').length;
      const loading = /chargement( en cours)?/i.test(text);
      return titleMatch && !loading && h2 >= 5 && text.length >= 2200;
    }, { timeout: 25000 }, expectedTitle);
  } catch (error: any) {
    const diagnostic = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { textLength: 0, h2: 0, h1: [], canonical: '' };
      return {
        textLength: (root.innerText || '').replace(/\s+/g, ' ').trim().length,
        h2: root.querySelectorAll('h2').length,
        h1: Array.from(root.querySelectorAll('h1')).map((node) => (node.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 3),
        canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || ''
      };
    });
    throw new Error(`article non prêt (${diagnostic.textLength} caractères, ${diagnostic.h2} H2, H1=${JSON.stringify(diagnostic.h1)}, canonical=${diagnostic.canonical || 'absent'})`);
  }

  await new Promise((resolve) => setTimeout(resolve, 80));
  const captured = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) throw new Error('root React absent');
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, iframe, [class*="modal"], [class*="Modal"]').forEach((el) => el.remove());
    return {
      html: clone.innerHTML.trim(),
      text: (root.innerText || '').replace(/\s+/g, ' ').trim(),
      h1Count: clone.querySelectorAll('h1').length,
      h2Count: clone.querySelectorAll('h2').length
    };
  });

  if (!captured.html || captured.text.length < 2200 || captured.h2Count < 5) {
    throw new Error(`rendu React trop mince (${captured.text.length} caractères, ${captured.h2Count} H2)`);
  }

  const finalHtml = injectReactRoot(setArticleSeo(appShell, template), slug, captured.html);
  const pageDir = path.join(articlesDir, slug);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'index.html'), finalHtml, 'utf-8');

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
  if (!fs.existsSync(appShellPath)) throw new Error('dist/index.html absent : lancer après vite build');
  const appShell = fs.readFileSync(appShellPath, 'utf-8');
  extractRootBounds(appShell);
  fs.mkdirSync(articlesDir, { recursive: true });

  console.log(`🚀 Pré-rendu React autoritaire : ${templates.length} articles`);
  const server = createSpaServer(appShell);
  let browser: any;

  try {
    await listen(server);
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
      page.on('pageerror', (error: any) => console.error(`   ⚠️ [${workerId}] React: ${error?.message || error}`));
      await page.setRequestInterception(true);
      page.on('request', (request: any) => {
        const requestUrl = request.url();
        if (
          requestUrl.includes('googletagmanager.com') ||
          requestUrl.includes('google-analytics.com') ||
          requestUrl.includes('elfsightcdn.com') ||
          requestUrl.includes('calendly.com')
        ) {
          request.abort();
          return;
        }
        request.continue();
      });

      try {
        while (true) {
          const index = cursor++;
          if (index >= templates.length) break;
          const template = templates[index];
          try {
            const result = await processArticle(page, template, appShell);
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
    await closeServer(server);
  }
};

main().catch((error) => {
  console.error('❌ Pré-rendu React fatal :', error);
  process.exit(1);
});
