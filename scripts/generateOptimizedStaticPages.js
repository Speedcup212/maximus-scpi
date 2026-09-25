import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const appShellPath = path.join(distDir, 'index.html');
const scpiDataPath = path.join(__dirname, '../src/data/scpi_complet.json');

if (!fs.existsSync(appShellPath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder la génération des fiches SCPI.');
  process.exit(1);
}

const rawCatalog = JSON.parse(fs.readFileSync(scpiDataPath, 'utf-8'));
const scpiData = Array.isArray(rawCatalog) ? rawCatalog : (rawCatalog.Sheet1 || []);
const appShell = fs.readFileSync(appShellPath, 'utf-8');

const createSlug = (name) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const replaceOrInsertHeadTag = (html, pattern, replacement) => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', '    ' + replacement + '\n  </head>');
};

const setScpiInitialShell = (baseHtml, scpi, slug) => {
  const name = String(scpi['Nom SCPI'] || '').trim();
  const company = String(scpi['Société de gestion'] || '').trim();
  const yieldValue = Number(scpi['Taux de distribution (%)']);
  const cap = Number(scpi['Capitalisation (M€)']);
  const price = Number(scpi['Prix de souscription (€)']);

  const metrics = [
    Number.isFinite(yieldValue)
      ? '<div class="scpi-shell-card"><span>Taux de distribution</span><strong>' + escapeHtml(yieldValue.toFixed(2).replace('.00', '') + '%') + '</strong></div>'
      : '',
    Number.isFinite(price)
      ? '<div class="scpi-shell-card"><span>Prix de la part</span><strong>' + escapeHtml(String(price) + ' €') + '</strong></div>'
      : '',
    Number.isFinite(cap)
      ? '<div class="scpi-shell-card"><span>Capitalisation</span><strong>' + escapeHtml(String(Math.round(cap)) + ' M€') + '</strong></div>'
      : ''
  ].filter(Boolean).join('');

  const shell =
    '<div id="root">' +
      '<div class="scpi-initial-shell">' +
        '<header class="scpi-shell-header">' +
          '<a href="/" aria-label="Accueil MaximusSCPI"><img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" fetchpriority="high" /></a>' +
          '<a href="/comparateur-scpi/">Comparer les SCPI</a>' +
        '</header>' +
        '<main class="scpi-shell-hero">' +
          '<div class="scpi-shell-inner">' +
            '<p class="scpi-shell-kicker">Fiche SCPI · Analyse MaximusSCPI</p>' +
            '<h1>SCPI ' + escapeHtml(name) + '</h1>' +
            (company ? '<p class="scpi-shell-company">Gérée par ' + escapeHtml(company) + '</p>' : '') +
            '<div class="scpi-shell-metrics">' + metrics + '</div>' +
            '<p class="scpi-shell-note">Analyse détaillée, patrimoine, valorisation et points de vigilance.</p>' +
          '</div>' +
        '</main>' +
      '</div>' +
      '<style>' +
        '.scpi-initial-shell{min-height:100vh;background:#0D1117;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
        '.scpi-shell-header{height:72px;max-width:1180px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;background:#fff}' +
        '.scpi-shell-header img{width:205px;height:auto}.scpi-shell-header>a:last-child{color:#047857;text-decoration:none;font-size:14px;font-weight:700}' +
        '.scpi-shell-hero{background:radial-gradient(55% 60% at 15% 5%,rgba(16,185,129,.18),transparent 65%),#0D1117;min-height:430px}' +
        '.scpi-shell-inner{max-width:1180px;margin:0 auto;padding:68px 24px 76px}' +
        '.scpi-shell-kicker{margin:0 0 14px;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:13px;font-weight:800}' +
        '.scpi-shell-inner h1{margin:0 0 10px;font-size:clamp(40px,5vw,64px);line-height:1.04;letter-spacing:-.035em;font-weight:800}' +
        '.scpi-shell-company{margin:0 0 32px;color:#cbd5e1;font-size:18px}' +
        '.scpi-shell-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;max-width:780px}' +
        '.scpi-shell-card{padding:18px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(30,41,59,.62)}' +
        '.scpi-shell-card span{display:block;color:#94a3b8;font-size:12px;margin-bottom:6px}.scpi-shell-card strong{font-size:23px}' +
        '.scpi-shell-note{margin:24px 0 0;color:#94a3b8;font-size:14px}' +
        '@media(max-width:700px){.scpi-shell-header{height:66px;padding:0 18px}.scpi-shell-header img{width:175px}.scpi-shell-header>a:last-child{display:none}.scpi-shell-inner{padding:48px 20px 58px}.scpi-shell-inner h1{font-size:40px}.scpi-shell-metrics{grid-template-columns:1fr}.scpi-shell-card{padding:15px}}' +
      '</style>' +
    '</div>';

  const rootStart = baseHtml.indexOf('<div id="root">');
  const moduleScriptStart = baseHtml.indexOf('<script type="module"', rootStart);
  if (rootStart === -1 || moduleScriptStart === -1) return baseHtml;

  const rootEnd = baseHtml.lastIndexOf('</div>', moduleScriptStart);
  if (rootEnd === -1 || rootEnd < rootStart) return baseHtml;

  return baseHtml.slice(0, rootStart) + shell + baseHtml.slice(rootEnd + 6);
};

const setSeo = (baseHtml, scpi, slug) => {
  const name = String(scpi['Nom SCPI'] || '').trim();
  const company = String(scpi['Société de gestion'] || '').trim();
  const yieldValue = scpi['Taux de distribution (%)'];
  const cap = scpi['Capitalisation (M€)'];
  const price = scpi['Prix de souscription (€)'];
  const canonical = 'https://maximusscpi.com/' + slug + '/';

  const title = 'SCPI ' + name + ' : analyse, rendement et avis | MaximusSCPI';
  const descriptionParts = [
    'Analyse de la SCPI ' + name,
    company ? 'gérée par ' + company : null,
    Number.isFinite(Number(yieldValue)) ? 'taux de distribution ' + Number(yieldValue).toFixed(2).replace('.00', '') + '%' : null,
    Number.isFinite(Number(cap)) ? 'capitalisation ' + Math.round(Number(cap)) + ' M€' : null,
    Number.isFinite(Number(price)) ? 'prix de souscription ' + Number(price) + ' €' : null,
    'données, frais, patrimoine et points de vigilance'
  ].filter(Boolean);
  const description = descriptionParts.join(' · ');

  let html = baseHtml;
  html = replaceOrInsertHeadTag(html, /<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtml(title) + '</title>');
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + escapeHtml(description) + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']keywords["'][^>]*>/i, '<meta name="keywords" content="' + escapeHtml('SCPI ' + name + ', rendement SCPI ' + name + ', avis SCPI ' + name + ', ' + company) + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  html = replaceOrInsertHeadTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + canonical + '" />');
  html = replaceOrInsertHeadTag(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, '<link rel="alternate" hreflang="fr" href="' + canonical + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, '<meta property="og:url" content="' + canonical + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, '<meta property="og:title" content="' + escapeHtml(title) + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, '<meta property="og:description" content="' + escapeHtml(description) + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:url["'][^>]*>/i, '<meta property="twitter:url" content="' + canonical + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, '<meta property="twitter:title" content="' + escapeHtml(title) + '" />');
  html = replaceOrInsertHeadTag(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, '<meta property="twitter:description" content="' + escapeHtml(description) + '" />');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'SCPI ' + name,
    description,
    url: canonical,
    provider: company ? { '@type': 'Organization', name: company } : undefined,
    offers: Number.isFinite(Number(price))
      ? { '@type': 'Offer', price: String(price), priceCurrency: 'EUR', url: canonical }
      : undefined
  };
  const schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');
  html = html.replace(
    '</head>',
    '    <script id="scpi-static-schema" type="application/ld+json">' + schemaJson + '</script>\\n' +
    '    <script>window.__SCPI_STATIC_SLUG__=' + JSON.stringify(slug) + ';</script>\\n  </head>'
  );
  return html;
};

const seen = new Set();
let generatedCount = 0;

for (const scpi of scpiData) {
  const name = String(scpi['Nom SCPI'] || '').trim();
  if (!name) continue;

  const slug = createSlug(name);
  if (!slug) {
    console.error('❌ Slug SCPI vide pour "' + name + '".');
    process.exit(1);
  }
  if (seen.has(slug)) {
    console.error('❌ Slug SCPI dupliqué: ' + slug + '.');
    process.exit(1);
  }
  seen.add(slug);

  const html = setScpiInitialShell(setSeo(appShell, scpi, slug), scpi, slug);
  const pageDir = path.join(distDir, slug);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8');
  generatedCount += 1;
}

const namedRows = scpiData.filter((row) => row['Nom SCPI']).length;
if (generatedCount !== seen.size || generatedCount !== namedRows) {
  console.error('❌ Génération SCPI incomplète: ' + generatedCount + ' pages pour ' + namedRows + ' SCPI nommées.');
  process.exit(1);
}

console.log('✅ ' + generatedCount + ' shells React SCPI générés: même application, même design, canonical /{slug}/.');
