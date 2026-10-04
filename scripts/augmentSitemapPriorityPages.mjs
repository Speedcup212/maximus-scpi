import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const SITE = 'https://maximusscpi.com';

// Ces sujets disposent d'une route éditoriale racine déjà utilisée par l'application.
// On choisit UNE URL canonique courte /slug/ et on retire l'alias exact /articles/slug/
// du sitemap afin d'éviter la cannibalisation. Les variantes éditoriales plus longues
// restent intactes lorsqu'elles traitent un angle distinct.
const priorityPages = [
  'amf-scpi',
  'orias-scpi',
  'dic-scpi',
  'note-information-scpi',
  'tof-scpi',
  'capitalisation-scpi',
  'decote-valeur-reconstitution-scpi',
  'endettement-scpi',
  'rendement-net-scpi',
  'frais-scpi',
  'risques-scpi',
  'delai-jouissance-scpi',
  'scpi-demembrement',
  'scpi-ifi',
  'scpi-expatrie-fiscalite',
  'scpi-sci-is-fiscalite',
  'societes-de-gestion-scpi',
  'gestionnaire-scpi',
  'choisir-scpi',
  'combien-investir-scpi',
  'scpi-commerce',
  'scpi-hotellerie-tourisme',
  'scpi-revenus-etrangers'
];

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ public/sitemap.xml introuvable.');
  process.exit(1);
}

let xml = fs.readFileSync(sitemapPath, 'utf-8');
const today = new Date().toISOString().slice(0, 10);

// Le générateur historique utilisait la date du build comme lastmod pour de nombreuses
// pages, même sans modification éditoriale réelle. Google recommande un lastmod exact :
// lorsqu'il est artificiellement égal à la date du build, on l'omet plutôt que de mentir.
const fakeToday = new RegExp(`\\n\\s*<lastmod>${today}<\\/lastmod>`, 'g');
const fakeLastmodsRemoved = (xml.match(fakeToday) || []).length;
xml = xml.replace(fakeToday, '');

// Retirer uniquement les aliases EXACTS /articles/{slug}/ des pages racines retenues.
// Les articles à slug plus long (ex. /articles/scpi-ifi-calcul-declaration/) ne sont pas touchés.
let aliasesRemoved = 0;
for (const slug of priorityPages) {
  const aliasLoc = `${SITE}/articles/${slug}/`;
  const escaped = aliasLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = new RegExp(`\\s*<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
  const matches = xml.match(block) || [];
  aliasesRemoved += matches.length;
  xml = xml.replace(block, '');
}

const existing = new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim().replace(/\/$/, ''))
);

const additions = [];
for (const slug of priorityPages) {
  const loc = `${SITE}/${slug}/`;
  if (existing.has(loc.replace(/\/$/, ''))) continue;
  additions.push(`  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
}

if (additions.length) {
  if (!xml.includes('</urlset>')) {
    console.error('❌ sitemap invalide : </urlset> absent.');
    process.exit(1);
  }
  xml = xml.replace('</urlset>', `${additions.join('\n')}\n</urlset>`);
}

fs.writeFileSync(sitemapPath, xml, 'utf-8');
console.log(`✅ Sitemap renforcé : ${additions.length} URL(s) racine ajoutée(s), ${aliasesRemoved} alias article retiré(s), ${fakeLastmodsRemoved} lastmod artificiel(s) retiré(s).`);
