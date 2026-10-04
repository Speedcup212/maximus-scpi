/**
 * copyFinalSitemapToDist.js
 *
 * Copie public/sitemap.xml vers dist/sitemap.xml après le build.
 * Valide des URLs stratégiques et un volume minimal d'URLs, sans dépendre
 * d'une taille de fichier artificielle (les <lastmod> peuvent légitimement être omis).
 */
import { readFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'public', 'sitemap.xml');
const destPath = join(__dirname, '..', 'dist', 'sitemap.xml');

const REQUIRED_URLS = [
  'https://maximusscpi.com/articles/construire-portefeuille-scpi/',
  'https://maximusscpi.com/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/declaration-revenus-scpi-erreurs/',
  'https://maximusscpi.com/amf-scpi/',
  'https://maximusscpi.com/comparateur-scpi/',
];
const MIN_URL_COUNT = 200;

if (!existsSync(srcPath)) {
  console.error('❌ public/sitemap.xml introuvable. Build arrêté.');
  process.exit(1);
}

const srcContent = readFileSync(srcPath, 'utf-8');
const sourceUrls = [...srcContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

for (const url of REQUIRED_URLS) {
  if (!sourceUrls.includes(url)) {
    console.error(`❌ public/sitemap.xml ne contient pas : ${url}`);
    process.exit(1);
  }
}

if (sourceUrls.length < MIN_URL_COUNT) {
  console.error(`❌ public/sitemap.xml trop peu fourni : ${sourceUrls.length} URLs (< ${MIN_URL_COUNT}). Build arrêté.`);
  process.exit(1);
}

copyFileSync(srcPath, destPath);

const destContent = readFileSync(destPath, 'utf-8');
const destUrls = [...destContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

if (destUrls.length !== sourceUrls.length) {
  console.error(`❌ Copie sitemap incohérente : ${sourceUrls.length} URLs source / ${destUrls.length} destination.`);
  process.exit(1);
}

console.log(`✅ public/sitemap.xml → dist/sitemap.xml : ${destUrls.length} URLs canoniques.`);
for (const url of REQUIRED_URLS) {
  console.log(`   ✓ ${url}`);
}
