import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const appShellPath = path.join(distDir, 'index.html');
const articlesDir = path.join(distDir, 'articles');
const outputPath = path.join(articlesDir, 'index.html');
const articleTemplatesPath = path.join(__dirname, '../src/data/articleTemplatesConfig.ts');

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

const decodeTsString = (value) => String(value ?? '')
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"')
  .replace(/\\n/g, ' ')
  .replace(/\\r/g, ' ')
  .replace(/\\t/g, ' ')
  .replace(/\\\\/g, '\\');

const readTsStringField = (block, field) => {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const single = block.match(new RegExp(`${escapedField}\\s*:\\s*'((?:\\\\.|[^'])*)'`));
  if (single) return decodeTsString(single[1]);
  const double = block.match(new RegExp(`${escapedField}\\s*:\\s*"((?:\\\\.|[^"])*)"`));
  return double ? decodeTsString(double[1]) : '';
};

const humanizeSlug = (slug) => String(slug || '')
  .split('-')
  .filter(Boolean)
  .map((part, index) => index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part)
  .join(' ');

const replaceRoot = (html, rootContent) => {
  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf('</body>', rootStart);
  if (rootStart === -1 || bodyEnd === -1) {
    throw new Error('Structure dist/index.html inattendue : root ou body introuvable.');
  }

  // Vite peut déplacer le script module compilé dans <head>. Le dernier </div>
  // avant </body> reste donc la borne fiable du shell #root.
  const rootEnd = html.lastIndexOf('</div>', bodyEnd);
  if (rootEnd === -1 || rootEnd < rootStart) {
    throw new Error('Fermeture du root introuvable dans dist/index.html.');
  }

  return html.slice(0, rootStart) + rootContent + html.slice(rootEnd + 6);
};

const loadLocalArticleTemplates = () => {
  if (!fs.existsSync(articleTemplatesPath)) {
    throw new Error('src/data/articleTemplatesConfig.ts introuvable : impossible de certifier le hub articles.');
  }

  const source = fs.readFileSync(articleTemplatesPath, 'utf-8');
  const blocks = source.match(/\{\s*id:\s*\d+,[\s\S]*?\n\s*\},?/g) || [];
  const entries = blocks
    .filter((block) => !/indexable\s*:\s*false/.test(block))
    .map((block) => {
      const slug = readTsStringField(block, 'slug').replace(/^\/+|\/+$/g, '');
      if (!slug) return null;
      return {
        slug,
        title: readTsStringField(block, 'title') || humanizeSlug(slug),
        description: readTsStringField(block, 'metaDescription'),
        searchIntent: readTsStringField(block, 'searchIntent'),
        targetAudience: readTsStringField(block, 'targetAudience'),
      };
    })
    .filter(Boolean);

  const unique = new Map();
  for (const entry of entries) unique.set(entry.slug, entry);
  return [...unique.values()];
};

if (!fs.existsSync(appShellPath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder le hub articles.');
  process.exit(1);
}

fs.mkdirSync(articlesDir, { recursive: true });

const appShell = fs.readFileSync(appShellPath, 'utf-8');
const localTemplates = loadLocalArticleTemplates();
if (localTemplates.length < 20) {
  console.error(`❌ Seulement ${localTemplates.length} templates d'articles indexables détectés. Source locale probablement mal parsée.`);
  process.exit(1);
}

// En CI, le rendu Puppeteer complet est volontairement désactivé. Pour éviter que les
// URL /articles/* ne retombent sur une copie brute de la home, on génère ici un shell
// HTML déterministe pour chaque template absent. Le React de la route conserve ensuite
// le rendu interactif complet côté navigateur.
let generatedFallbackCount = 0;
for (const article of localTemplates) {
  const articleDir = path.join(articlesDir, article.slug);
  const articlePath = path.join(articleDir, 'index.html');
  if (fs.existsSync(articlePath)) continue;

  const canonical = `https://maximusscpi.com/articles/${article.slug}/`;
  const title = `${article.title} | MaximusSCPI`;
  const description = article.description || `Guide MaximusSCPI : ${article.title}.`;
  const contextParts = [
    article.searchIntent ? `Objectif : ${article.searchIntent}.` : '',
    article.targetAudience ? `Pour : ${article.targetAudience}.` : '',
  ].filter(Boolean).join(' ');

  const rootContent = `
<div id="root">
  <main class="article-seo-shell">
    <nav class="article-seo-nav" aria-label="Fil d'Ariane"><a href="/">Accueil</a><span>›</span><a href="/articles/">Articles</a></nav>
    <article>
      <p class="article-seo-kicker">Guide & analyse SCPI</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-seo-lead">${escapeHtml(description)}</p>
      ${contextParts ? `<p class="article-seo-context">${escapeHtml(contextParts)}</p>` : ''}
      <p class="article-seo-note">Analyse pédagogique MaximusSCPI. Le contenu complet et les outils interactifs se chargent sur cette page.</p>
    </article>
  </main>
  <style>
    .article-seo-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px 24px 72px}.article-seo-nav,.article-seo-shell article{max-width:920px;margin:0 auto}.article-seo-nav{display:flex;gap:10px;padding:8px 0 48px;color:#94a3b8;font-size:14px}.article-seo-nav a{color:#6ee7b7;text-decoration:none}.article-seo-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.article-seo-shell h1{margin:14px 0 24px;color:#fff;font-size:clamp(36px,5vw,60px);line-height:1.08;letter-spacing:-.03em}.article-seo-lead{font-size:20px;line-height:1.65;color:#cbd5e1}.article-seo-context{margin-top:24px;color:#cbd5e1;line-height:1.7}.article-seo-note{margin-top:32px;padding-top:20px;border-top:1px solid #263244;color:#94a3b8;font-size:14px;line-height:1.6}
  </style>
</div>`;

  let articleHtml = appShell;
  articleHtml = articleHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="article" />');
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(article.title)}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']twitter:url["'][^>]*>/i, `<meta property="twitter:url" content="${canonical}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${escapeHtml(article.title)}" />`);
  articleHtml = replaceOrInsertHeadTag(articleHtml, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
  articleHtml = replaceRoot(articleHtml, rootContent);

  fs.mkdirSync(articleDir, { recursive: true });
  fs.writeFileSync(articlePath, articleHtml, 'utf-8');
  generatedFallbackCount++;
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
      title: title || humanizeSlug(slug),
      description,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

const localTemplateSlugs = new Set(localTemplates.map((entry) => entry.slug));
const renderedLocalCount = articleEntries.filter((entry) => localTemplateSlugs.has(entry.slug)).length;
if (renderedLocalCount !== localTemplates.length) {
  console.error(`❌ Couverture HTML articles incomplète : ${renderedLocalCount}/${localTemplates.length} templates locaux.`);
  process.exit(1);
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

let html = appShell;
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
html = replaceRoot(html, rootContent);
fs.writeFileSync(outputPath, html, 'utf-8');

const verification = fs.readFileSync(outputPath, 'utf-8');
const linkCount = (verification.match(/href="\/articles\/[^"]+\/"/g) || []).length;
const missingLocalLinks = localTemplates.filter((entry) => !verification.includes(`href="/articles/${entry.slug}/"`));
if (!verification.includes('<h1>Comprendre les SCPI</h1>')
  || !verification.includes(`rel="canonical" href="${canonical}"`)
  || missingLocalLinks.length > 0
  || linkCount < localTemplates.length) {
  console.error(`❌ Vérification du hub articles échouée : ${linkCount} liens, ${missingLocalLinks.length} templates locaux absents.`);
  process.exit(1);
}

console.log(`✅ Hub /articles/ généré : ${articleEntries.length} articles, ${linkCount} liens HTML statiques.`);
console.log(`✅ Couverture templates : ${renderedLocalCount}/${localTemplates.length}. Shells SEO CI créés : ${generatedFallbackCount}.`);