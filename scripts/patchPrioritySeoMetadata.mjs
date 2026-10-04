import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const SITE = 'https://maximusscpi.com';

const targets = [
  {
    path: 'scpi-europeennes',
    title: 'SCPI européennes 2026 : fiscalité, rendement et risques',
    description: 'Compare les SCPI européennes : rendement, fiscalité des revenus étrangers, diversification, TOF, frais et risques avant d’investir.'
  },
  {
    path: 'articles',
    title: 'Guides SCPI : fiscalité, risques et stratégies | MaximusSCPI',
    description: 'Guides MaximusSCPI sur la fiscalité, les risques, la liquidité, le rendement, le démembrement et les stratégies d’investissement en SCPI.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Guides SCPI MaximusSCPI',
      url: `${SITE}/articles/`,
      description: 'Guides pédagogiques MaximusSCPI sur les SCPI, leur fiscalité, leurs risques et leurs stratégies.'
    }
  },
  {
    path: 'comparateur-demembrement-scpi',
    title: 'Comparateur démembrement SCPI 2026 | MaximusSCPI',
    description: 'Compare les clés de démembrement des SCPI par durée : nue-propriété, décote, horizon et critères de sélection avant investissement.'
  },
  {
    path: 'faq',
    title: 'FAQ SCPI 2026 : rendement, fiscalité et risques',
    description: 'Réponses aux questions fréquentes sur les SCPI : rendement, fiscalité, frais, risques, revente, liquidité, démembrement et délai de jouissance.'
  },
  {
    path: 'scpi-retraite',
    title: 'SCPI et retraite : revenus complémentaires et risques',
    description: 'Comprendre l’usage des SCPI pour préparer la retraite : revenus potentiels, horizon, diversification, fiscalité, liquidité et risques.'
  }
];

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const replaceOrInsert = (html, pattern, replacement) => pattern.test(html)
  ? html.replace(pattern, replacement)
  : html.replace('</head>', `    ${replacement}\n  </head>`);

let changed = 0;
let missing = 0;

for (const target of targets) {
  const file = path.join(distDir, ...target.path.split('/'), 'index.html');
  if (!fs.existsSync(file)) {
    console.warn(`⚠️ Page prioritaire absente : /${target.path}/`);
    missing++;
    continue;
  }

  const canonical = `${SITE}/${target.path}/`;
  let html = fs.readFileSync(file, 'utf-8');
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(target.title)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(target.description)}" />`);
  html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(target.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(target.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${esc(target.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${esc(target.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']twitter:url["'][^>]*>/i, `<meta property="twitter:url" content="${canonical}" />`);

  if (target.schema && !html.includes('id="priority-page-schema"')) {
    const json = JSON.stringify(target.schema).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script id="priority-page-schema" type="application/ld+json">${json}</script>\n  </head>`);
  }

  fs.writeFileSync(file, html, 'utf-8');
  changed++;
}

if (missing) {
  console.error(`❌ Métadonnées prioritaires : ${missing} page(s) absente(s).`);
  process.exit(1);
}
console.log(`✅ Métadonnées prioritaires optimisées : ${changed}/${targets.length} pages.`);
