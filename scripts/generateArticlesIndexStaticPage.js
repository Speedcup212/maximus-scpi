import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const appShellPath = path.join(distDir, 'index.html');
const articlesDir = path.join(distDir, 'articles');
const outputPath = path.join(articlesDir, 'index.html');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const decodeHtml = (value) => String(value ?? '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

const stripTags = (value) => decodeHtml(String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

const extract = (html, regex) => {
  const match = html.match(regex);
  return match ? stripTags(match[1]) : '';
};

const replaceOrInsertHeadTag = (html, pattern, replacement) => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
};

if (!fs.existsSync(appShellPath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder le hub articles.');
  process.exit(1);
}

if (!fs.existsSync(articlesDir)) {
  console.error('❌ dist/articles introuvable. Les articles statiques doivent être générés avant le hub.');
  process.exit(1);
}

const articleEntries = fs.readdirSync(articlesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name;
    const indexPath = path.join(articlesDir, slug, 'index.html');
    if (!fs.existsSync(indexPath)) return null;

    const html = fs.readFileSync(indexPath, 'utf-8');
    const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1 || extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*\|\s*MaximusSCPI\s*$/i, '');
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
      || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
    const description = descriptionMatch ? decodeHtml(descriptionMatch[1]).trim() : '';

    return {
      slug,
      title: title || slug.replace(/-/g, ' '),
      description,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

if (articleEntries.length < 20) {
  console.warn(`⚠️ Seulement ${articleEntries.length} articles statiques détectés pour le hub.`);
}

const cards = articleEntries.map((article) => `
          <article class="articles-shell-card">
            <h2><a href="/articles/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2>
            ${article.description ? `<p>${escapeHtml(article.description)}</p>` : ''}
          </article>`).join('');

const rootContent = `
<div id="root">
  <div class="articles-initial-shell">
    <header class="articles-shell-header">
      <a href="/" aria-label="Accueil MaximusSCPI">
        <img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" fetchpriority="high" />
      </a>
      <nav aria-label="Navigation principale">
        <a href="/comparateur-scpi/">Comparateur</a>
        <a href="/simulateurs/">Simulateurs</a>
      </nav>
    </header>
    <main>
      <section class="articles-shell-hero">
        <p class="articles-shell-kicker">Guides & analyses SCPI</p>
        <h1>Comprendre les SCPI</h1>
        <p>Fiscalité, risques, rendement, liquidité, sociétés de gestion et stratégies patrimoniales : retrouvez les analyses publiées par MaximusSCPI.</p>
        <p class="articles-shell-count">${articleEntries.length} articles accessibles directement en HTML.</p>
      </section>
      <section class="articles-shell-list" aria-label="Articles MaximusSCPI">
        ${cards}
      </section>
    </main>
  </div>
  <style>
    .articles-initial-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .articles-shell-header{height:64px;max-width:1280px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;background:#111827;border-bottom:1px solid #1f2937}
    .articles-shell-header img{width:205px;height:auto}.articles-shell-header nav{display:flex;gap:20px}.articles-shell-header a{color:#e5e7eb;text-decoration:none;font-weight:650;font-size:14px}
    .articles-shell-hero{max-width:1180px;margin:0 auto;padding:64px 24px 34px}.articles-shell-kicker{margin:0 0 12px;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.articles-shell-hero h1{margin:0 0 18px;color:#fff;font-size:clamp(40px,5vw,64px);line-height:1.05;letter-spacing:-.035em;font-weight:850}.articles-shell-hero>p:not(.articles-shell-kicker):not(.articles-shell-count){max-width:820px;color:#cbd5e1;font-size:18px;line-height:1.65}.articles-shell-count{margin-top:14px;color:#94a3b8;font-size:14px}
    .articles-shell-list{max-width:1180px;margin:0 auto;padding:18px 24px 72px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.articles-shell-card{border:1px solid #263244;border-radius:14px;background:#121a25;padding:18px}.articles-shell-card h2{margin:0 0 9px;font-size:17px;line-height:1.35}.articles-shell-card h2 a{color:#f8fafc;text-decoration:none}.articles-shell-card p{margin:0;color:#94a3b8;font-size:13px;line-height:1.55}
    @media(max-width:900px){.articles-shell-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.articles-shell-header{padding:0 18px}.articles-shell-header img{width:175px}.articles-shell-header nav{display:none}.articles-shell-hero{padding:46px 20px 26px}.articles-shell-list{grid-template-columns:1fr;padding:12px 20px 56px}}
  </style>
</div>`;

let html = fs.readFileSync(appShellPath, 'utf-8');
const canonical = 'https://maximusscpi.com/articles/';
const title = 'Comprendre les SCPI : guides, fiscalité, risques et stratégies | MaximusSCPI';
const description = `${articleEntries.length} articles pour comprendre les SCPI : rendement, fiscalité, risques, liquidité, sociétés de gestion, comparatifs et stratégies patrimoniales.`;

html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
html = replaceOrInsertHeadTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
html = replaceOrInsertHeadTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="website" />');
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:url["'][^>]*>/i, `<meta property="twitter:url" content="${canonical}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);

const rootStart = html.indexOf('<div id="root">');
const moduleScriptStart = html.indexOf('<script type="module"', rootStart);
if (rootStart === -1 || moduleScriptStart === -1) {
  console.error('❌ Structure dist/index.html inattendue : root ou script module introuvable.');
  process.exit(1);
}
const rootEnd = html.lastIndexOf('</div>', moduleScriptStart);
if (rootEnd === -1 || rootEnd < rootStart) {
  console.error('❌ Fermeture du root introuvable dans dist/index.html.');
  process.exit(1);
}

html = html.slice(0, rootStart) + rootContent + html.slice(rootEnd + 6);
fs.mkdirSync(articlesDir, { recursive: true });
fs.writeFileSync(outputPath, html, 'utf-8');

const verification = fs.readFileSync(outputPath, 'utf-8');
const linkCount = (verification.match(/href="\/articles\/[^"]+\/"/g) || []).length;
if (!verification.includes('<h1>Comprendre les SCPI</h1>') || !verification.includes(`rel="canonical" href="${canonical}"`) || linkCount < Math.min(20, articleEntries.length)) {
  console.error(`❌ Vérification du hub articles échouée : ${linkCount} liens détectés.`);
  process.exit(1);
}

console.log(`✅ Hub /articles/ généré : ${articleEntries.length} articles, ${linkCount} liens HTML statiques.`);
