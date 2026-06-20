import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import SCPI data
const scpiDataPath = path.join(__dirname, '../src/data/SCPI_complet_avec_SFDR_Profil.json');
const scpiDataJson = JSON.parse(fs.readFileSync(scpiDataPath, 'utf-8'));
const scpiData = scpiDataJson.Sheet1 || scpiDataJson;

// Liste COMPLÈTE des SCPI (64, inclut les SCPI récentes type Wemo One / Epsicap Nano
// absentes du fichier SFDR). Utilisée pour couvrir TOUTES les redirections /scpi-*.
const scpiCompletePath = path.join(__dirname, '../src/data/scpi_complet.json');
const scpiCompleteJson = JSON.parse(fs.readFileSync(scpiCompletePath, 'utf-8'));
const scpiComplete = Array.isArray(scpiCompleteJson) ? scpiCompleteJson : (scpiCompleteJson.Sheet1 || []);

const createSlug = (name) => {
  return 'scpi-' + name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Slug canonique sans préfixe (= URL des pages statiques + sitemap + canonical).
const createNoPrefixSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Redirections 301 des anciens slugs préfixés "scpi-" vers l'URL canonique sans préfixe.
// Empêche toute duplication SEO /scpi-wemo-one ↔ /wemo-one.
const buildScpiPrefixRedirects = () => {
  const seen = new Set();
  const lines = [];
  for (const scpi of scpiComplete) {
    const name = scpi['Nom SCPI'];
    if (!name) continue;
    const noPrefix = createNoPrefixSlug(name);
    if (!noPrefix || seen.has(noPrefix)) continue;
    seen.add(noPrefix);
    lines.push(`/scpi-${noPrefix} /${noPrefix} 301`);
    lines.push(`/scpi-${noPrefix}/ /${noPrefix} 301`);
  }
  return lines.join('\n');
};

// Generate redirects file with static pages
const generateRedirects = () => {
  let redirectsContent = `# Netlify/Vercel redirects for SPA routing with SSG

# Redirections 301 pour anciens slugs d'articles (PRIORITAIRES)
/fonds-euros-ou-scpi-2026 /fonds-euros-ou-scpi 301
/scpi-direct-ou-assurance-vie /scpi-en-direct-ou-assurance-vie 301
/scpi-credit-effet-levier-2026 /scpi-a-credit-effet-levier 301
/fiscalite-scpi-2026-guide-complet /fiscalite-scpi-guide-complet 301
/garder-fonds-euros-ou-tout-passer-scpi /garder-fonds-euros-ou-passer-scpi 301
/scpi-45-ans-150000-euros-strategie /scpi-strategie-45-ans-150000-euros 301
/scpi-tmi-11-ou-30-pourcent-rentabilite /scpi-tmi-11-ou-30-rentabilite 301
/scpi-credit-ou-cash-taux-3-4-pourcent /scpi-credit-ou-cash-taux-3-4 301
/risque-perte-scpi-scenarios-baisse /risques-scpi-scenarios-baisse 301
/portefeuille-scpi-100-pourcent-ligne-maximus /portefeuille-scpi-en-ligne 301

# Redirections 301 anti-cannibalisation SEO sectorielle (TASK-002C)
/scpi-bureaux-investissement /scpi-bureaux/ 301
/scpi-bureaux-investissement/ /scpi-bureaux/ 301
/scpi-commerces-investissement /scpi-commerces/ 301
/scpi-commerces-investissement/ /scpi-commerces/ 301
/scpi-sante-investissement /scpi-sante/ 301
/scpi-sante-investissement/ /scpi-sante/ 301
/scpi-france-investissement /scpi-france/ 301
/scpi-france-investissement/ /scpi-france/ 301
/scpi-europe /scpi-europeennes/ 301
/scpi-europe/ /scpi-europeennes/ 301
/scpi-fiscales /scpi-fiscalite/ 301
/scpi-fiscales/ /scpi-fiscalite/ 301
/preparer-retraite-scpi /scpi-retraite/ 301
/preparer-retraite-scpi/ /scpi-retraite/ 301

# Redirections 301 slash final pour les pages sectorielles (sans slash → avec slash)
/scpi-bureaux /scpi-bureaux/ 301
/scpi-sante /scpi-sante/ 301
/scpi-commerces /scpi-commerces/ 301
/scpi-diversifiees /scpi-diversifiees/ 301
/scpi-logistique /scpi-logistique/ 301
/scpi-residentiel /scpi-residentiel/ 301
/scpi-hotellerie /scpi-hotellerie/ 301
/scpi-france /scpi-france/ 301
/comprendre-les-scpi /comprendre-les-scpi/ 301

# Redirections 301 education/ → articles/ (avec slash → avec slash)
/education/:slug/ /articles/:slug/ 301
# Redirections 301 education/ → articles/ (sans slash → avec slash)
/education/:slug /articles/:slug/ 301

# Pages statiques générales
/faq /index.html 200
/comprendre-les-scpi /index.html 200
/qui-sommes-nous /index.html 200
/reclamation /index.html 200
/conditions-utilisation /index.html 200
/articles /index.html 200

# Articles éditoriaux — redirection 301 vers /articles/<slug>/ (page statique SSG)
/fonds-euros-ou-scpi /articles/fonds-euros-ou-scpi/ 301
/scpi-en-direct-ou-assurance-vie /articles/scpi-en-direct-ou-assurance-vie/ 301
/scpi-a-credit-effet-levier /articles/scpi-a-credit-effet-levier/ 301
/scpi-demembrement-strategie-retraite /articles/scpi-demembrement-strategie-retraite/ 301
/fiscalite-scpi-guide-complet /articles/fiscalite-scpi-guide-complet/ 301
/scpi-ifi-impact-patrimoine-immobilier /articles/scpi-ifi-impact-patrimoine-immobilier/ 301
/100000-euros-fonds-euros-cout-opportunite /articles/100000-euros-fonds-euros-cout-opportunite/ 301
/transferer-fonds-euros-vers-scpi-mode-emploi /articles/transferer-fonds-euros-vers-scpi-mode-emploi/ 301
/investir-50000-euros-scpi-etude-cas /articles/investir-50000-euros-scpi-etude-cas/ 301
/investir-200000-euros-scpi-portefeuille-diversifie /articles/investir-200000-euros-scpi-portefeuille-diversifie/ 301
/garder-fonds-euros-ou-passer-scpi /articles/garder-fonds-euros-ou-passer-scpi/ 301
/scpi-assurance-vie-alternative-fonds-euros /articles/scpi-assurance-vie-alternative-fonds-euros/ 301
/revenus-scpi-assurance-vie-fonctionnement /articles/revenus-scpi-assurance-vie-fonctionnement/ 301
/scpi-assurance-vie-apres-8-ans-rachats-optimises /articles/scpi-assurance-vie-apres-8-ans-rachats-optimises/ 301
/arbitrer-assurance-vie-vers-scpi-tutoriel /articles/arbitrer-assurance-vie-vers-scpi-tutoriel/ 301
/scpi-ou-immobilier-locatif-comparatif-20-ans /articles/scpi-ou-immobilier-locatif-comparatif-20-ans/ 301
/scpi-europeennes-optimisation-fiscale /articles/scpi-europeennes-optimisation-fiscale/ 301
/scpi-strategie-45-ans-150000-euros /articles/scpi-strategie-45-ans-150000-euros/ 301
/scpi-proche-retraite-revenus-ou-capitalisation /articles/scpi-proche-retraite-revenus-ou-capitalisation/ 301
/scpi-tmi-11-ou-30-rentabilite /articles/scpi-tmi-11-ou-30-rentabilite/ 301
/investir-scpi-apres-60-ans /articles/investir-scpi-apres-60-ans/ 301
/fonds-euros-et-immobilier-locatif-strategie /articles/fonds-euros-et-immobilier-locatif-strategie/ 301
/scpi-credit-ou-cash-taux-3-4 /articles/scpi-credit-ou-cash-taux-3-4/ 301
/demembrement-scpi-10-ans-retraite-complementaire /articles/demembrement-scpi-10-ans-retraite-complementaire/ 301
/scpi-ou-etf-diversification-patrimoine /articles/scpi-ou-etf-diversification-patrimoine/ 301
/risques-scpi-scenarios-baisse /articles/risques-scpi-scenarios-baisse/ 301
/revendre-scpi-delais-marche-secondaire /articles/revendre-scpi-delais-marche-secondaire/ 301
/combien-investir-scpi-100000-200000-500000 /articles/combien-investir-scpi-100000-200000-500000/ 301
/scpi-succession-transmission-assurance-vie /articles/scpi-succession-transmission-assurance-vie/ 301
/portefeuille-scpi-en-ligne /articles/portefeuille-scpi-en-ligne/ 301

# Google Ads Landing Pages
/investir-scpi /index.html 200
/scpi-rentable /index.html 200

# Pages secteurs SCPI : articles éducatifs servis via le SPA (pas de page statique)
/scpi-bureaux /index.html 200
/scpi-sante /index.html 200
/scpi-commerces /index.html 200
/scpi-diversifiees /index.html 200
/scpi-logistique /index.html 200
/scpi-residentiel /index.html 200
/scpi-hotellerie /index.html 200
/scpi-france /index.html 200

# Pages SCPI individuelles : servies via dist/{slug}/index.html (slug canonique sans préfixe)

# Redirections 301 des anciens slugs préfixés "scpi-" vers l'URL canonique sans préfixe
${buildScpiPrefixRedirects()}

# .html racine → dossier canonique (anti-duplication SEO)
/comprendre-les-scpi.html /comprendre-les-scpi/ 301

# Fallback pour toutes les autres routes vers la SPA
/* /index.html 200
`;

  const publicDir = path.join(__dirname, '../public');
  const redirectsPath = path.join(publicDir, '_redirects');

  fs.writeFileSync(redirectsPath, redirectsContent, 'utf-8');

  console.log(`✅ Redirects generated with ${scpiData.length} static SCPI pages`);
};

// Run the generator
generateRedirects();
