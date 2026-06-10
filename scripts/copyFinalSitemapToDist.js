/**
 * copyFinalSitemapToDist.js
 *
 * Copie public/sitemap.xml vers dist/sitemap.xml après le build Vite.
 * Garantit que le sitemap fraîchement généré par generateSitemapFromDB (prebuild)
 * est bien présent dans dist/, même si Vite a copié une version antérieure.
 */
import { readFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'public', 'sitemap.xml');
const destPath = join(__dirname, '..', 'dist', 'sitemap.xml');

// URLs articles obligatoires à vérifier
const REQUIRED_URLS = [
  'https://maximusscpi.com/articles/construire-portefeuille-scpi/',
  'https://maximusscpi.com/articles/scpi-expatrie-fiscalite/',
  'https://maximusscpi.com/articles/declaration-revenus-scpi-erreurs/',
];

if (!existsSync(srcPath)) {
  console.error('❌ public/sitemap.xml introuvable. Build arrêté.');
  process.exit(1);
}

const content = readFileSync(srcPath, 'utf-8');

// Vérifier que le fichier source est valide
for (const url of REQUIRED_URLS) {
  if (!content.includes(url)) {
    console.error(`❌ public/sitemap.xml ne contient pas : ${url}`);
    console.error('   Le prebuild (generateSitemapFromDB) n\'a pas généré les articles. Build arrêté.');
    process.exit(1);
  }
}

copyFileSync(srcPath, destPath);
console.log(`✅ public/sitemap.xml (${content.length} octets) copié vers dist/sitemap.xml`);
