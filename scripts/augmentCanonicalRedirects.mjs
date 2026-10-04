import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const redirectsPath = path.join(__dirname, '../public/_redirects');

const canonicalRootSlugs = [
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

if (!fs.existsSync(redirectsPath)) {
  console.error('❌ public/_redirects introuvable. Exécuter generateRedirectsSSG.js avant ce script.');
  process.exit(1);
}

let redirects = fs.readFileSync(redirectsPath, 'utf-8');
const marker = '# Redirections 301 aliases pédagogiques → URL racine canonique';
const rules = canonicalRootSlugs.flatMap((slug) => [
  `/articles/${slug} /${slug}/ 301!`,
  `/articles/${slug}/ /${slug}/ 301!`
]);
const block = `\n${marker}\n${rules.join('\n')}\n`;

// Idempotence pour les builds locaux successifs.
if (!redirects.includes(marker)) {
  const fallbackMarker = '# Fallback pour toutes les autres routes vers la SPA';
  if (redirects.includes(fallbackMarker)) {
    redirects = redirects.replace(fallbackMarker, `${block}\n${fallbackMarker}`);
  } else {
    redirects += block;
  }
  fs.writeFileSync(redirectsPath, redirects, 'utf-8');
}

console.log(`✅ Redirections canoniques pédagogiques : ${rules.length} règles actives vers ${canonicalRootSlugs.length} URL(s) racine.`);
