import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const redirectsPath = path.join(__dirname, '../dist/_redirects');

if (!fs.existsSync(redirectsPath)) {
  console.error('❌ dist/_redirects introuvable. Le build Vite doit précéder la correction SEO.');
  process.exit(1);
}

let content = fs.readFileSync(redirectsPath, 'utf-8');

// /articles/ dispose désormais de son propre index.html statique.
// Cette ancienne réécriture servait la home et annulait le bénéfice du pré-rendu.
content = content.replace(/^\/articles\s+\/index\.html\s+200\s*$/gm, '# /articles/ est servi par dist/articles/index.html (SSG)');

const legacyRules = `# Nettoyage SEO legacy vérifié
# Anciennes fiches ayant une cible actuelle exacte
/scpi-de-rendement-scpi-esg-pierre-capitale /esg-pierre-capital/ 301!
/scpi-de-rendement-scpi-esg-pierre-capitale/ /esg-pierre-capital/ 301!
/scpi-de-rendement-scpi-lf-europimmo /lf-europimmo/ 301!
/scpi-de-rendement-scpi-lf-europimmo/ /lf-europimmo/ 301!

# Anciennes pages sans équivalent actuel : vrai 404, jamais home 200
/scpi-de-rendement-scpi-primopierre /404.html 404!
/scpi-de-rendement-scpi-primopierre/ /404.html 404!
/scpi-de-rendement-scpi-placement-pierre /404.html 404!
/scpi-de-rendement-scpi-placement-pierre/ /404.html 404!
/les-actualites-des-scpi /404.html 404!
/les-actualites-des-scpi/ /404.html 404!
`;

if (!content.includes('# Nettoyage SEO legacy vérifié')) {
  const fallback = '# Fallback pour toutes les autres routes vers la SPA';
  if (!content.includes(fallback)) {
    console.error('❌ Fallback SPA introuvable dans dist/_redirects.');
    process.exit(1);
  }
  content = content.replace(fallback, `${legacyRules}\n${fallback}`);
}

fs.writeFileSync(redirectsPath, content, 'utf-8');

const verification = fs.readFileSync(redirectsPath, 'utf-8');
if (/^\/articles\s+\/index\.html\s+200\s*$/m.test(verification)) {
  console.error('❌ La réécriture /articles -> home est toujours présente.');
  process.exit(1);
}
if (!verification.includes('/scpi-de-rendement-scpi-primopierre/ /404.html 404!')) {
  console.error('❌ La protection 404 Primopierre est absente.');
  process.exit(1);
}
if (!verification.includes('/scpi-de-rendement-scpi-lf-europimmo/ /lf-europimmo/ 301!')) {
  console.error('❌ La redirection LF Europimmo est absente.');
  process.exit(1);
}

console.log('✅ Redirects SEO durcis : hub articles statique + 301 exactes + 404 legacy explicites.');
