/**
 * assertFinalSitemap.js
 *
 * Valide dist/sitemap.xml par sa structure, un volume minimal d'URLs et la
 * présence d'URL stratégiques canoniques. La taille en octets n'est pas un
 * signal fiable : un sitemap sans faux <lastmod> peut être plus léger et meilleur.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = join(__dirname, '..', 'dist', 'sitemap.xml');

const REQUIRED_URLS = [
  'https://maximusscpi.com/articles/construire-portefeuille-scpi/',
  'https://maximusscpi.com/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/declaration-revenus-scpi-erreurs/',
  'https://maximusscpi.com/amf-scpi/',
  'https://maximusscpi.com/comparateur-scpi/',
];
const FORBIDDEN_ALIAS_URLS = [
  'https://maximusscpi.com/articles/amf-scpi/',
  'https://maximusscpi.com/articles/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/tof-scpi/',
];
const MIN_URL_COUNT = 200;

if (!existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml introuvable. Build arrêté.');
  process.exit(1);
}

const content = readFileSync(sitemapPath, 'utf-8');
const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const uniqueUrls = new Set(urls);

if (urls.length < MIN_URL_COUNT) {
  console.error(`❌ dist/sitemap.xml trop peu fourni : ${urls.length} URLs (< ${MIN_URL_COUNT}). Build arrêté.`);
  process.exit(1);
}

if (uniqueUrls.size !== urls.length) {
  console.error(`❌ dist/sitemap.xml contient ${urls.length - uniqueUrls.size} URL(s) dupliquée(s). Build arrêté.`);
  process.exit(1);
}

for (const url of REQUIRED_URLS) {
  if (!uniqueUrls.has(url)) {
    console.error(`❌ dist/sitemap.xml ne contient pas : ${url}`);
    process.exit(1);
  }
}

for (const url of FORBIDDEN_ALIAS_URLS) {
  if (uniqueUrls.has(url)) {
    console.error(`❌ Alias non canonique encore présent dans le sitemap : ${url}`);
    process.exit(1);
  }
}

console.log(`✅ DIST SITEMAP FINAL OK : ${urls.length} URLs uniques et politique canonique respectée.`);
