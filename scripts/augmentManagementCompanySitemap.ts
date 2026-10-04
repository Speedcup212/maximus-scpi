import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { managementCompanyConfigs } from '../src/data/managementCompanyArticlesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const SITE = 'https://maximusscpi.com';

if (!fs.existsSync(sitemapPath)) throw new Error('public/sitemap.xml absent');
let xml = fs.readFileSync(sitemapPath, 'utf-8');
let added = 0;
for (const config of managementCompanyConfigs) {
  const loc = `${SITE}/societe-gestion/${config.slug}/`;
  if (xml.includes(`<loc>${loc}</loc>`)) continue;
  const block = `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.72</priority>\n  </url>\n`;
  xml = xml.replace('</urlset>', `${block}</urlset>`);
  added++;
}
fs.writeFileSync(sitemapPath, xml, 'utf-8');
const expected = managementCompanyConfigs.length;
const present = managementCompanyConfigs.filter((c) => xml.includes(`<loc>${SITE}/societe-gestion/${c.slug}/</loc>`)).length;
if (present !== expected) throw new Error(`Sitemap sociétés de gestion incomplet: ${present}/${expected}`);
console.log(`✅ Sitemap sociétés de gestion : ${present}/${expected} présentes ; ${added} ajoutée(s)`);
