import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const SITE = 'https://maximusscpi.com';

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
const before = (xml.match(fakeToday) || []).length;
xml = xml.replace(fakeToday, '');

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
console.log(`✅ Sitemap renforcé : ${additions.length} URL(s) prioritaire(s) ajoutée(s), ${before} lastmod artificiel(s) retiré(s).`);
