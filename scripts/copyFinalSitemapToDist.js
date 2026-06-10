/**
 * copyFinalSitemapToDist.js
 *
 * Copie public/sitemap.xml vers dist/sitemap.xml après le build.
 * Vérifie la taille et les URLs articles. Bloque le build si invalide.
 */
import { readFileSync, copyFileSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'public', 'sitemap.xml');
const destPath = join(__dirname, '..', 'dist', 'sitemap.xml');

const REQUIRED_URLS = [
  'https://maximusscpi.com/articles/construire-portefeuille-scpi/',
  'https://maximusscpi.com/articles/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/declaration-revenus-scpi-erreurs/',
];
const MIN_SIZE = 30000;

// Vérifier source
if (!existsSync(srcPath)) {
  console.error('❌ public/sitemap.xml introuvable. Build arrêté.');
  process.exit(1);
}

const srcSize = statSync(srcPath).size;
const srcContent = readFileSync(srcPath, 'utf-8');

for (const url of REQUIRED_URLS) {
  if (!srcContent.includes(url)) {
    console.error(`❌ public/sitemap.xml ne contient pas : ${url}`);
    process.exit(1);
  }
}

// Copier
copyFileSync(srcPath, destPath);

// Lire la destination après copie
const destContent = readFileSync(destPath, 'utf-8');
const destSize = destContent.length;

if (destSize < MIN_SIZE) {
  console.error(`❌ dist/sitemap.xml trop petit : ${destSize} octets (< ${MIN_SIZE}). Build arrêté.`);
  process.exit(1);
}

console.log(`✅ public/sitemap.xml (${srcSize} octets) → dist/sitemap.xml (${destSize} octets)`);
for (const url of REQUIRED_URLS) {
  const ok = destContent.includes(url);
  console.log(`   ${ok ? '✓' : '✗'} ${url}`);
}
