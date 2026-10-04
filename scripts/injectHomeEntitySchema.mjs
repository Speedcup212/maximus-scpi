import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '../dist/index.html');
const SITE = 'https://maximusscpi.com';

if (!fs.existsSync(file)) throw new Error('dist/index.html absent');
let html = fs.readFileSync(file, 'utf-8');
html = html.replace(/\s*<script[^>]+id=["']maximus-home-entity-schema["'][^>]*>[\s\S]*?<\/script>/gi, '');

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'MaximusSCPI',
      url: `${SITE}/`,
      description: 'Site français d’information, de comparaison et d’analyse des SCPI.',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/Maximus%20logo%20250x50%204.svg`
      }
    },
    {
      '@type': 'Person',
      '@id': `${SITE}/#eric-bellaiche`,
      name: 'Eric Bellaiche',
      jobTitle: 'Conseiller en investissements financiers',
      url: `${SITE}/qui-sommes-nous/`,
      worksFor: { '@id': `${SITE}/#organization` }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'MaximusSCPI',
      inLanguage: 'fr-FR',
      publisher: { '@id': `${SITE}/#organization` }
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE}/#webpage`,
      url: `${SITE}/`,
      name: 'MaximusSCPI — Comparateur et analyse de SCPI',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
      contributor: { '@id': `${SITE}/#eric-bellaiche` }
    }
  ]
};

const json = JSON.stringify(schema).replace(/</g, '\\u003c');
html = html.replace('</head>', `    <script id="maximus-home-entity-schema" type="application/ld+json">${json}</script>\n  </head>`);
fs.writeFileSync(file, html, 'utf-8');

const updated = fs.readFileSync(file, 'utf-8');
const match = updated.match(/<script[^>]+id=["']maximus-home-entity-schema["'][^>]*>([\s\S]*?)<\/script>/i);
if (!match) throw new Error('Schema entité home absent après injection');
const parsed = JSON.parse(match[1]);
const graph = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [];
const types = new Set(graph.map((node) => node['@type']));
for (const required of ['Organization', 'Person', 'WebSite', 'WebPage']) {
  if (!types.has(required)) throw new Error(`Type schema manquant sur la home : ${required}`);
}
const organization = graph.find((node) => node['@type'] === 'Organization');
if (!organization?.logo?.url?.includes('Maximus%20logo%20250x50%204.svg')) {
  throw new Error('Logo Organization invalide ou absent');
}
console.log('✅ Graphe GEO home injecté : Organization + Person + WebSite + WebPage');
