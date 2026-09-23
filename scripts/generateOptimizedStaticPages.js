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
  html = html.replace('</head>', '    <script id="scpi-static-schema" type="application/ld+json">' + schemaJson + '</script>\n  </head>');
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

  const html = setSeo(appShell, scpi, slug);
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
