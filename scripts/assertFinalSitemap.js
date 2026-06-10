/**
 * assertFinalSitemap.js
 *
 * Valide que dist/sitemap.xml contient les URLs articles attendues
 * et que sa taille est cohérente. Bloque le build en cas d'échec.
 */
import { readFileSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = join(__dirname, '..', 'dist', 'sitemap.xml');

const REQUIRED_URLS = [
  'https://maximusscpi.com/articles/construire-portefeuille-scpi/',
  'https://maximusscpi.com/articles/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/declaration-revenus-scpi-erreurs/',
];

const MIN_SIZE = 30000;

if (!existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml introuvable. Build arrêté.');
  process.exit(1);
}

const { size } = statSync(sitemapPath);
if (size < MIN_SIZE) {
  console.error(`❌ dist/sitemap.xml trop petit : ${size} octets (< ${MIN_SIZE}). Build arrêté.`);
  process.exit(1);
}

const content = readFileSync(sitemapPath, 'utf-8');

for (const url of REQUIRED_URLS) {
  if (!content.includes(url)) {
    console.error(`❌ dist/sitemap.xml ne contient pas l'URL : ${url}`);
    console.error('   Build arrêté.');
    process.exit(1);
  }
}

console.log(`✅ Final sitemap validated with article URLs (${size} octets)`);
