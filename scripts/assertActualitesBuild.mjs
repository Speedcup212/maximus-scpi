import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const htmlPath = path.join(dist, 'actualites', 'index.html');
const redirectsPath = path.join(dist, '_redirects');
const sitemapPath = path.join(dist, 'sitemap.xml');
const canonical = 'https://maximusscpi.com/actualites/';

for (const file of [htmlPath, redirectsPath, sitemapPath]) {
  if (!fs.existsSync(file)) throw Error(`Fichier requis absent : ${file}`);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const redirects = fs.readFileSync(redirectsPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const checks = [
  ['canonical', html.includes(`rel="canonical" href="${canonical}"`)],
  ['H1 réel', /<h1>Actualités SCPI : acquisitions et opérations immobilières<\/h1>/.test(html)],
  ['documentation de source', html.includes('Consulter la source officielle')],
  ['sitemap', sitemap.includes(`<loc>${canonical}</loc>`)],
  ['suppression du blocage des routes Actualités', !/^\s*\/actualites\/\*\s+\/404\.html\s+404\s*$/m.test(redirects)],
  ['SPA fallback', /^\s*\/\*\s+\/index\.html\s+200\s*$/m.test(redirects)],
];
for (const [label,ok] of checks) {
  if (!ok) throw Error(`QA Actualités KO : ${label}`);
}
console.log('QA Actualités OK : route, HTML, provenance, sitemap, fallback.');
