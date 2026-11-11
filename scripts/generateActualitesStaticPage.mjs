/**
 * SEO statique du hub Actualités.
 * Le flux React/Supabase reste la source interactive; l'export JSON est
 * explicitement présenté comme un instantané, jamais comme une veille temps réel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { isNewsEditoriallyValid } from '../src/utils/scpiNewsEditorialGate.mjs';

const dist = path.resolve('dist');
const shellPath = path.join(dist, 'index.html');
const newsPath = path.resolve('data/news/scpi-investment-news-latest.json');
const outDir = path.join(dist, 'actualites');
const outPath = path.join(outDir, 'index.html');
const sitemapPath = path.join(dist, 'sitemap.xml');
const canonical = 'https://maximusscpi.com/actualites/';
const title = 'Actualités SCPI : acquisitions et veille documentée | MaximusSCPI';
const description = 'Suivez les acquisitions immobilières des SCPI, les sources officielles et les points de vigilance. Données datées, analyse et liens vers les fiches SCPI.';

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const replaceTag = (html, regex, tag) =>
  regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `  ${tag}\n</head>`);
const officialUrl = (url) => {
  try {
    const parsed = new URL(String(url || ''));
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      && !['localhost', '127.0.0.1'].includes(parsed.hostname)
      ? parsed.href : '';
  } catch { return ''; }
};
const eventDate = (item) =>
  /^\d{4}-\d{2}-\d{2}$/.test(item.date || '') ? item.date : '';
const readableDate = (date) => date
  ? new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  : '';
const replaceRoot = (html, body) => {
  const start = html.indexOf('<div id="root">');
  const endOfBody = html.indexOf('</body>', start);
  const end = html.lastIndexOf('</div>', endOfBody);
  if (start < 0 || end < start || endOfBody < 0) throw Error('Root Vite absent ou invalide');
  return html.slice(0, start) + `<div id="root">${body}</div>` + html.slice(end + 6);
};

if (!fs.existsSync(shellPath) || !fs.existsSync(newsPath)) {
  throw Error('Shell Vite ou export actualités manquant : publication impossible.');
}
const items = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
if (!Array.isArray(items)) throw Error('Export actualités non valide.');
const sorted = items.filter((item) =>
  item && item.sourceOfficial === true &&
  item.investmentRelated === true && isNewsEditoriallyValid(item) && item.dataQuality !== 'weak' &&
  Number(item.editorialPriority) > 0 &&
  typeof item.scpi === 'string' && item.scpi.trim() &&
  typeof item.title === 'string' && item.title.trim() &&
  officialUrl(item.sourceUrl)
).sort((a,b) =>
  (eventDate(b) || b.detectedAt || '').localeCompare(eventDate(a) || a.detectedAt || '')
).slice(0, 16);

const cards = sorted.map((item) => {
  const dated = eventDate(item);
  const dateLabel = dated
    ? `Publication datée du ${readableDate(dated)}`
    : 'Date de publication indisponible';
  return `<article class="actualites-card">
    <div class="actualites-small">${esc(item.scpi)} · ${esc(dateLabel)}</div>
    <h2>${esc(item.title)}</h2>
    <p>${esc((item.summary || '').slice(0, 320))}</p>
    <a href="${esc(officialUrl(item.sourceUrl))}" rel="noopener noreferrer nofollow" target="_blank">Consulter la source officielle</a>
  </article>`;
}).join('\n');
const page = `
<main class="actualites-root">
  <header class="actualites-header">
    <a href="/" aria-label="Accueil MaximusSCPI">MaximusSCPI</a>
    <nav aria-label="Navigation"><a href="/comparateur-scpi/">Comparateur</a><a href="/articles/">Guides</a><a href="/actualites/" aria-current="page">Actualités</a></nav>
  </header>
  <section class="actualites-hero">
    <p class="actualites-kicker">Veille des sources officielles</p>
    <h1>Actualités SCPI : acquisitions et opérations immobilières</h1>
    <p>Analysez les informations publiées par les sociétés de gestion. Chaque événement doit être replacé dans le contexte de la SCPI : patrimoine, locataires, dette, liquidité et horizon d'investissement.</p>
    <p class="actualites-warning">Aperçu documentaire issu du dernier export disponible. Le flux interactif peut contenir des informations plus récentes. Une date de détection n'est jamais assimilée à une date d'acquisition.</p>
    <a class="actualites-cta" href="/comparateur-scpi/">Comparer les SCPI</a>
  </section>
  <section class="actualites-list" aria-label="Acquisitions documentées">
    <h2>Acquisitions documentées dans l'export</h2>
    <div class="actualites-grid">${cards || '<p>La sélection documentaire est temporairement indisponible. Les fiches SCPI et le comparateur restent accessibles.</p>'}</div>
  </section>
  <footer class="actualites-footer">Informations générales non personnalisées. Les SCPI présentent un risque de perte en capital et de liquidité. Les informations sont à confirmer dans les documents officiels actualisés.</footer>
</main>
<style>
.actualites-root{min-height:100vh;background:#0d1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.actualites-header{min-height:66px;max-width:1200px;margin:auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #253044}
.actualites-header>a{font-size:20px;color:#fff;font-weight:800;text-decoration:none}
.actualites-header nav{display:flex;gap:20px}.actualites-root a{color:#6ee7b7}
.actualites-header nav a{font-size:14px;color:#d1d5db;text-decoration:none}
.actualites-hero{max-width:1100px;margin:auto;padding:68px 24px 44px}.actualites-kicker{color:#6ee7b7;text-transform:uppercase;font-weight:750;font-size:12px;letter-spacing:.08em}
.actualites-hero h1{max-width:900px;font-weight:800;font-size:clamp(35px,5vw,58px);color:#fff;line-height:1.12}
.actualites-hero>p{max-width:850px;color:#cbd5e1;line-height:1.7;font-size:18px}
.actualites-hero .actualites-warning{font-size:14px;color:#94a3b8;border-left:2px solid #6ee7b7;padding-left:16px;margin:28px 0}
.actualites-cta{display:inline-block;margin-top:12px;padding:12px 17px;border-radius:10px;background:#047857;color:#fff!important;text-decoration:none;font-weight:700}
.actualites-list{max-width:1200px;margin:auto;padding:12px 24px 64px}.actualites-list>h2{font-size:26px;color:#fff}
.actualites-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.actualites-card{border:1px solid #263244;background:#121a25;border-radius:16px;padding:20px}
.actualites-card h2{font-size:17px;color:#fff;line-height:1.4}.actualites-card p{font-size:14px;color:#cbd5e1;line-height:1.6}
.actualites-small{font-size:12px;color:#94a3b8}.actualites-card a{font-size:13px;font-weight:650}
.actualites-footer{max-width:1100px;margin:auto;padding:24px 24px 50px;font-size:13px;color:#94a3b8;border-top:1px solid #263244}
@media(max-width:850px){.actualites-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.actualites-header nav{gap:9px}.actualites-grid{grid-template-columns:1fr}.actualites-hero{padding:42px 20px 26px}}
</style>`;

let html = fs.readFileSync(shellPath, 'utf8');
html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
html = replaceTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(description)}" />`);
html = replaceTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
html = replaceTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
html = replaceTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`);
html = replaceTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`);
html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
const graph = { '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:canonical, inLanguage:'fr-FR' };
html = html.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(graph)}</script>\n</head>`);
html = replaceRoot(html, page);
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(outPath, html, 'utf8');
if (!fs.existsSync(sitemapPath)) throw Error('Sitemap final absent : ne pas publier un hub orphelin.');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
  if (!sitemap.includes('</urlset>')) throw Error('Sitemap XML invalide.');
  sitemap = sitemap.replace('</urlset>', `<url><loc>${canonical}</loc></url>\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}
console.log(`Hub /actualites/ généré : ${sorted.length} acquisitions sourcées, sitemap lié.`);
