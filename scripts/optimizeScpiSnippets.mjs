import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const catalogPath = path.join(__dirname, '../src/data/scpi_complet.json');
const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const catalog = Array.isArray(raw) ? raw : (raw.Sheet1 || []);

const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const number = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const fr = (n, digits = 2) => new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: digits,
  minimumFractionDigits: 0
}).format(n);

const makeTitle = (name) => {
  const candidates = [
    `SCPI ${name} : rendement et analyse`,
    `SCPI ${name} : analyse et risques`,
    `SCPI ${name} : analyse`,
    `SCPI ${name}`
  ];
  const title = candidates.find((candidate) => candidate.length <= 60);
  if (title) return title;
  // Cas extrême : conserver le nom au maximum sans dépasser la zone d'affichage cible.
  return `SCPI ${name}`.slice(0, 59).trimEnd() + '…';
};

const makeDescription = (row, name) => {
  const yieldValue = number(row['Taux de distribution (%)']);
  const price = number(row['Prix de souscription (€)']);
  const cap = number(row['Capitalisation (M€)']);

  const metricParts = [
    yieldValue !== null ? `rendement ${fr(yieldValue)} %` : null,
    price !== null ? `prix ${fr(price)} €` : null,
    cap !== null ? `capitalisation ${fr(cap, 0)} M€` : null
  ].filter(Boolean);

  const candidates = [
    `SCPI ${name} : ${metricParts.join(', ')}. Analyse des frais, patrimoine, valorisation, liquidité et risques.`,
    `SCPI ${name} : ${metricParts.slice(0, 2).join(', ')}. Analyse des frais, patrimoine, valorisation, liquidité et risques.`,
    `SCPI ${name} : ${metricParts.slice(0, 1).join(', ')}. Analyse du patrimoine, des frais, de la liquidité et des risques.`,
    `SCPI ${name} : analyse du rendement, des frais, du patrimoine, de la valorisation, de la liquidité et des risques.`
  ].map((text) => text.replace(/:\s*\./, ':').replace(/:\s*,/, ':'));

  return candidates.find((candidate) => candidate.length <= 155) || candidates[candidates.length - 1].slice(0, 154).trimEnd() + '…';
};

const replaceTag = (html, pattern, replacement) => pattern.test(html)
  ? html.replace(pattern, replacement)
  : html.replace('</head>', `    ${replacement}\n  </head>`);

let changed = 0;
const failures = [];

for (const row of catalog) {
  const name = String(row['Nom SCPI'] || '').trim();
  if (!name) continue;
  const slug = slugify(name);
  const file = path.join(distDir, slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`${slug}: fichier statique absent`);
    continue;
  }

  const title = makeTitle(name);
  const description = makeDescription(row, name);
  let html = fs.readFileSync(file, 'utf-8');

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = replaceTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(description)}" />`);
  html = replaceTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`);
  html = replaceTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`);
  html = replaceTag(html, /<meta\s+property=["']twitter:title["'][^>]*>/i, `<meta property="twitter:title" content="${esc(title)}" />`);
  html = replaceTag(html, /<meta\s+property=["']twitter:description["'][^>]*>/i, `<meta property="twitter:description" content="${esc(description)}" />`);
  fs.writeFileSync(file, html, 'utf-8');
  changed++;

  if (title.length > 60) failures.push(`${slug}: title ${title.length} caractères`);
  if (description.length > 155) failures.push(`${slug}: meta ${description.length} caractères`);
  if (!title.toLowerCase().includes(name.toLowerCase().slice(0, Math.min(name.length, 24)))) {
    failures.push(`${slug}: nom SCPI insuffisamment identifiable dans le title`);
  }
}

const expected = catalog.filter((row) => String(row['Nom SCPI'] || '').trim()).length;
if (changed !== expected) failures.push(`couverture ${changed}/${expected}`);

if (failures.length) {
  console.error('❌ QA snippets SCPI :');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}
console.log(`✅ Snippets SCPI optimisés : ${changed}/${expected} ; title ≤ 60 ; meta ≤ 155.`);
