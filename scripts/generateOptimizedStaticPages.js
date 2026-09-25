import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const appShellPath = path.join(distDir, 'index.html');
const scpiDataPath = path.join(__dirname, '../src/data/scpi_complet.json');
const scpiHistoryPath = path.join(__dirname, '../src/data/scpiIndicatorHistory.json');

if (!fs.existsSync(appShellPath)) {
  console.error('❌ dist/index.html introuvable. Le build Vite doit précéder la génération des fiches SCPI.');
  process.exit(1);
}

const rawCatalog = JSON.parse(fs.readFileSync(scpiDataPath, 'utf-8'));
const scpiData = Array.isArray(rawCatalog) ? rawCatalog : (rawCatalog.Sheet1 || []);
const rawHistory = fs.existsSync(scpiHistoryPath)
  ? JSON.parse(fs.readFileSync(scpiHistoryPath, 'utf-8'))
  : { rows: [] };
const scpiHistory = Array.isArray(rawHistory) ? rawHistory : (rawHistory.rows || []);
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

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const periodSortKey = (period) => {
  const p = String(period || '').trim();
  let match = p.match(/^T([1-4])\s+(\d{4})$/i);
  if (match) return Number(match[2]) * 10 + Number(match[1]);
  match = p.match(/^S([12])\s+(\d{4})$/i);
  if (match) return Number(match[2]) * 10 + (match[1] === '1' ? 2 : 4);
  match = p.match(/^(\d{4})-[TQ]([1-4])$/i);
  if (match) return Number(match[1]) * 10 + Number(match[2]);
  return 0;
};

const historyBySlug = new Map();
for (const row of scpiHistory) {
  const slug = String(row.scpi_slug || '');
  if (!slug) continue;
  if (!historyBySlug.has(slug)) historyBySlug.set(slug, []);
  historyBySlug.get(slug).push(row);
}
for (const rows of historyBySlug.values()) {
  rows.sort((a, b) => periodSortKey(a.source_period) - periodSortKey(b.source_period));
}

const formatHistoryNumber = (value, type) => {
  const n = toNumber(value);
  if (n === null) return null;
  if (type === 'pct') return n.toFixed(2).replace(/\.00$/, '').replace('.', ',') + ' %';
  if (type === 'eur') return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n) + ' €';
  if (type === 'm') return n >= 1000
    ? (n / 1000).toFixed(2).replace('.', ',') + ' Md€'
    : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n) + ' M€';
  if (type === 'parts') return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' parts';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n);
};

const buildStaticHistory = (slug, name) => {
  const rows = historyBySlug.get(slug) || [];
  if (rows.length < 2) return '';

  const previous = rows[rows.length - 2];
  const current = rows[rows.length - 1];
  const candidates = [
    ['Parts en attente', 'parts_attente_retrait', 'parts'],
    ['TOF', 'tof', 'pct'],
    ['Endettement', 'endettement', 'pct'],
    ['Capitalisation', 'capitalisation', 'm'],
    ['Prix de la part', 'prix_souscription', 'eur'],
    ['Valeur de reconstitution', 'prix_reconstitution', 'eur'],
    ['Prix de retrait', 'prix_retrait', 'eur']
  ];

  const metrics = candidates
    .map(([label, key, type]) => {
      const before = toNumber(previous[key]);
      const after = toNumber(current[key]);
      if (before === null || after === null) return null;
      const delta = after - before;
      return {
        label,
        type,
        before,
        after,
        delta,
        changed: Math.abs(delta) > 0.000001
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.changed) - Number(a.changed))
    .slice(0, 5);

  if (metrics.length === 0) return '';

  const metricHtml = metrics.map((metric) => {
    const sign = metric.delta > 0 ? '+' : '';
    const deltaType = metric.type === 'pct' ? 'pt' : metric.type;
    const deltaValue = metric.type === 'pct'
      ? sign + metric.delta.toFixed(2).replace(/\.00$/, '').replace('.', ',') + ' pt'
      : metric.type === 'parts'
        ? sign + new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(metric.delta) + ' parts'
        : metric.type === 'm'
          ? sign + new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(metric.delta) + ' M€'
          : sign + new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(metric.delta) + ' €';

    return '<div class="scpi-history-card">' +
      '<span>' + escapeHtml(metric.label) + '</span>' +
      '<div><strong>' + escapeHtml(formatHistoryNumber(metric.before, metric.type)) + '</strong>' +
      '<b aria-hidden="true">→</b>' +
      '<strong>' + escapeHtml(formatHistoryNumber(metric.after, metric.type)) + '</strong></div>' +
      '<small>Variation ' + escapeHtml(deltaValue) + '</small>' +
    '</div>';
  }).join('');

  const sourceParts = [
    previous.source_document ? String(previous.source_document) : null,
    current.source_document ? String(current.source_document) : null
  ].filter(Boolean);

  return '<section class="scpi-shell-history" aria-label="Évolution documentée des indicateurs">' +
    '<div class="scpi-history-inner">' +
      '<p class="scpi-history-kicker">Évolution documentée</p>' +
      '<h2>Ce qui a changé sur ' + escapeHtml(name) + '</h2>' +
      '<p class="scpi-history-periods">' + escapeHtml(previous.source_period) + ' → ' + escapeHtml(current.source_period) + '</p>' +
      '<div class="scpi-history-grid">' + metricHtml + '</div>' +
      (sourceParts.length
        ? '<p class="scpi-history-source">Sources : ' + sourceParts.map(escapeHtml).join(' · ') + '</p>'
        : '') +
      '<p class="scpi-history-disclaimer">Les variations sont factuelles et ne constituent pas, à elles seules, un signal d’achat ou de vente.</p>' +
    '</div>' +
  '</section>';
};

const setScpiInitialShell = (baseHtml, scpi, slug) => {
  const name = String(scpi['Nom SCPI'] || '').trim();
  const company = String(scpi['Société de gestion'] || '').trim();
  const yieldValue = Number(scpi['Taux de distribution (%)']);
  const cap = Number(scpi['Capitalisation (M€)']);
  const price = Number(scpi['Prix de souscription (€)']);

  const historyHtml = buildStaticHistory(slug, name);

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
        historyHtml +
      '</div>' +
      '<style>' +
        '.scpi-initial-shell{min-height:100vh;background:#0D1117;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
        '.scpi-shell-header{height:64px;max-width:1180px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;background:#fff}' +
        'html.dark .scpi-shell-header{background:#111827;border-bottom:1px solid #1f2937}' +
        '.scpi-shell-header img{width:205px;height:auto}.scpi-shell-header>a:last-child{color:#047857;text-decoration:none;font-size:14px;font-weight:700}' +
        'html.dark .scpi-shell-header>a:last-child{color:#6ee7b7}' +
        '.scpi-shell-hero{background:radial-gradient(55% 60% at 15% 5%,rgba(16,185,129,.18),transparent 65%),#0D1117;min-height:430px}' +
        '.scpi-shell-inner{max-width:1180px;margin:0 auto;padding:68px 24px 76px}' +
        '.scpi-shell-kicker{margin:0 0 14px;color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:13px;font-weight:800}' +
        '.scpi-shell-inner h1{margin:0 0 10px;font-size:clamp(40px,5vw,64px);line-height:1.04;letter-spacing:-.035em;font-weight:800}' +
        '.scpi-shell-company{margin:0 0 32px;color:#cbd5e1;font-size:18px}' +
        '.scpi-shell-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;max-width:780px}' +
        '.scpi-shell-card{padding:18px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(30,41,59,.62)}' +
        '.scpi-shell-card span{display:block;color:#94a3b8;font-size:12px;margin-bottom:6px}.scpi-shell-card strong{font-size:23px}' +
        '.scpi-shell-note{margin:24px 0 0;color:#94a3b8;font-size:14px}' +
        '.scpi-shell-history{background:#f8fafc;color:#0f172a;padding:44px 24px}.scpi-history-inner{max-width:1180px;margin:0 auto}.scpi-history-kicker{margin:0;color:#047857;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.scpi-shell-history h2{margin:8px 0 4px;font-size:30px;line-height:1.15}.scpi-history-periods{margin:0 0 22px;color:#64748b}.scpi-history-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.scpi-history-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px}.scpi-history-card>span{display:block;color:#475569;font-size:12px;font-weight:700;margin-bottom:10px}.scpi-history-card>div{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.scpi-history-card strong{font-size:15px}.scpi-history-card b{color:#94a3b8}.scpi-history-card small{display:block;margin-top:9px;color:#64748b;font-size:11px}.scpi-history-source,.scpi-history-disclaimer{margin:14px 0 0;color:#64748b;font-size:11px;line-height:1.5}.scpi-history-disclaimer{margin-top:4px}' +
        '@media(max-width:900px){.scpi-history-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
        '@media(max-width:700px){.scpi-shell-header{height:66px;padding:0 18px}.scpi-shell-header img{width:175px}.scpi-shell-header>a:last-child{display:none}.scpi-shell-inner{padding:48px 20px 58px}.scpi-shell-inner h1{font-size:40px}.scpi-shell-metrics{grid-template-columns:1fr}.scpi-shell-card{padding:15px}.scpi-shell-history{padding:32px 20px}.scpi-history-grid{grid-template-columns:1fr}.scpi-shell-history h2{font-size:25px}}' +
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
