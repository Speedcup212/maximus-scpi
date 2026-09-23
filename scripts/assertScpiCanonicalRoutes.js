import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const catalogPath = path.join(root, 'src/data/scpi_complet.json');
const redirectsPath = path.join(root, 'public/_redirects');
const sitemapPath = path.join(root, 'public/sitemap.xml');

for (const required of [catalogPath, redirectsPath, sitemapPath]) {
  if (!fs.existsSync(required)) {
    console.error('❌ Artefact SEO manquant: ' + required);
    process.exit(1);
  }
}

const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const catalog = Array.isArray(raw) ? raw : (raw.Sheet1 || []);
const redirects = fs.readFileSync(redirectsPath, 'utf-8').split(/\r?\n/).map((line) => line.trim());
const sitemap = fs.readFileSync(sitemapPath, 'utf-8');

const slugify = (name) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const names = catalog.map((row) => String(row['Nom SCPI'] || '').trim()).filter(Boolean);
const slugs = names.map(slugify);
const unique = new Set(slugs);
const errors = [];

if (unique.size !== names.length) {
  errors.push('Catalogue: ' + names.length + ' noms pour ' + unique.size + ' slugs uniques.');
}

for (const slug of unique) {
  const canonical = 'https://maximusscpi.com/' + slug + '/';
  const rules = [
    '/' + slug + ' /' + slug + '/ 301!',
    '/scpi-' + slug + ' /' + slug + '/ 301!',
    '/scpi-' + slug + '/ /' + slug + '/ 301!'
  ];

  for (const rule of rules) {
    if (!redirects.includes(rule)) errors.push('Redirection manquante: ' + rule);
  }

  if (!sitemap.includes('<loc>' + canonical + '</loc>')) {
    errors.push('Sitemap: canonical absente ' + canonical);
  }

  if (
    sitemap.includes('<loc>https://maximusscpi.com/scpi-' + slug + '</loc>') ||
    sitemap.includes('<loc>https://maximusscpi.com/scpi-' + slug + '/</loc>')
  ) {
    errors.push('Sitemap: ancienne URL préfixée présente pour ' + slug);
  }
}

for (const legacy of [
  '/scpi-iroko-zen-iroko /iroko-zen/ 301!',
  '/scpi-iroko-zen-iroko/ /iroko-zen/ 301!'
]) {
  if (!redirects.includes(legacy)) errors.push('Redirection legacy manquante: ' + legacy);
}

if (errors.length > 0) {
  console.error('❌ Audit routes SCPI: ' + errors.length + ' erreur(s).');
  for (const error of errors.slice(0, 50)) console.error(' - ' + error);
  process.exit(1);
}

console.log('✅ Audit routes SCPI: ' + unique.size + '/' + unique.size + ' canoniques /{slug}/ conformes.');
