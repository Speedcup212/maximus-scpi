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

# Redirections 301 education/ → articles/ (standardisation SEO — 30 articles éducatifs)
/education/fonds-euros-ou-scpi /articles/fonds-euros-ou-scpi/ 301
/education/scpi-en-direct-ou-assurance-vie /articles/scpi-en-direct-ou-assurance-vie/ 301
/education/100000-euros-fonds-euros-cout-opportunite /articles/100000-euros-fonds-euros-cout-opportunite/ 301
/education/investir-200000-euros-scpi-portefeuille-diversifie /articles/investir-200000-euros-scpi-portefeuille-diversifie/ 301
/education/scpi-ou-immobilier-locatif-comparatif-20-ans /articles/scpi-ou-immobilier-locatif-comparatif-20-ans/ 301
/education/achat-scpi-credit-effet-levier-fiscalite /articles/achat-scpi-credit-effet-levier-fiscalite/ 301
/education/demembrement-scpi-nue-propriete-usufruit /articles/demembrement-scpi-nue-propriete-usufruit/ 301
/education/investir-scpi-tmi-11-pourcent-fiscalite-optimale /articles/investir-scpi-tmi-11-pourcent-fiscalite-optimale/ 301
/education/scpi-tmi-30-pourcent-arbitrage-av-direct /articles/scpi-tmi-30-pourcent-arbitrage-av-direct/ 301
/education/forte-imposition-tmi-41-scpi-assurance-vie /articles/forte-imposition-tmi-41-scpi-assurance-vie/ 301
/education/scpi-europeennes-avantages-ps-0-rendement /articles/scpi-europeennes-avantages-ps-0-rendement/ 301
/education/scpi-fiscales-malraux-deficit-foncier-2025 /articles/scpi-fiscales-malraux-deficit-foncier-2025/ 301
/education/scpi-sante-seniors-ehpad-cliniques-investissement /articles/scpi-sante-seniors-ehpad-cliniques-investissement/ 301
/education/scpi-bureaux-tertiaire-teletravail-2025 /articles/scpi-bureaux-tertiaire-teletravail-2025/ 301
/education/scpi-commerces-retail-e-commerce-opportunites /articles/scpi-commerces-retail-e-commerce-opportunites/ 301
/education/scpi-logistique-entrepots-e-commerce-2025 /articles/scpi-logistique-entrepots-e-commerce-2025/ 301
/education/scpi-residentielles-logement-locatif-scpi-habitation /articles/scpi-residentielles-logement-locatif-scpi-habitation/ 301
/education/per-scpi-retraite-deduction-fiscale /articles/per-scpi-retraite-deduction-fiscale/ 301
/education/sci-scpi-societe-civile-immobiliere-parts /articles/sci-scpi-societe-civile-immobiliere-parts/ 301
/education/ifi-scpi-impot-fortune-immobiliere-strategies /articles/ifi-scpi-impot-fortune-immobiliere-strategies/ 301
/education/succession-scpi-transmission-droits-heritage /articles/succession-scpi-transmission-droits-heritage/ 301
/education/diversification-scpi-combien-nombre-parts /articles/diversification-scpi-combien-nombre-parts/ 301
/education/rendement-scpi-2025-tdvm-taux-distribution /articles/rendement-scpi-2025-tdvm-taux-distribution/ 301
/education/risques-scpi-vacance-locative-liquidite /articles/risques-scpi-vacance-locative-liquidite/ 301
/education/frais-scpi-souscription-gestion-performance /articles/frais-scpi-souscription-gestion-performance/ 301
/education/revendre-parts-scpi-delais-marche-secondaire /articles/revendre-parts-scpi-delais-marche-secondaire/ 301
/education/scpi-ou-etf-immobilier-reit-comparatif /articles/scpi-ou-etf-immobilier-reit-comparatif/ 301
/education/scpi-ou-opci-differences-avantages /articles/scpi-ou-opci-differences-avantages/ 301
/education/premier-investissement-scpi-debutant-guide /articles/premier-investissement-scpi-debutant-guide/ 301
/education/investir-scpi-jeune-actif-25-35-ans /articles/investir-scpi-jeune-actif-25-35-ans/ 301

# Redirection 301 générique education/ → articles/ (catch-all pour tout article non listé)
/education/* /articles/:splat/ 301

# Pages statiques générales
/faq /index.html 200
/comprendre-les-scpi /index.html 200
/qui-sommes-nous /index.html 200
/reclamation /index.html 200
/conditions-utilisation /index.html 200
/articles /index.html 200

# Articles dynamiques (30 articles système)
/fonds-euros-ou-scpi /index.html 200
/scpi-en-direct-ou-assurance-vie /index.html 200
/scpi-a-credit-effet-levier /index.html 200
/scpi-demembrement-strategie-retraite /index.html 200
/fiscalite-scpi-guide-complet /index.html 200
/scpi-ifi-impact-patrimoine-immobilier /index.html 200
/100000-euros-fonds-euros-cout-opportunite /index.html 200
/transferer-fonds-euros-vers-scpi-mode-emploi /index.html 200
/investir-50000-euros-scpi-etude-cas /index.html 200
/investir-200000-euros-scpi-portefeuille-diversifie /index.html 200
/garder-fonds-euros-ou-passer-scpi /index.html 200
/scpi-assurance-vie-alternative-fonds-euros /index.html 200
/revenus-scpi-assurance-vie-fonctionnement /index.html 200
/scpi-assurance-vie-apres-8-ans-rachats-optimises /index.html 200
/arbitrer-assurance-vie-vers-scpi-tutoriel /index.html 200
/scpi-ou-immobilier-locatif-comparatif-20-ans /index.html 200
/scpi-europeennes-optimisation-fiscale /index.html 200
/scpi-strategie-45-ans-150000-euros /index.html 200
/scpi-proche-retraite-revenus-ou-capitalisation /index.html 200
/scpi-tmi-11-ou-30-rentabilite /index.html 200
/investir-scpi-apres-60-ans /index.html 200
/fonds-euros-et-immobilier-locatif-strategie /index.html 200
/scpi-credit-ou-cash-taux-3-4 /index.html 200
/demembrement-scpi-10-ans-retraite-complementaire /index.html 200
/scpi-ou-etf-diversification-patrimoine /index.html 200
/risques-scpi-scenarios-baisse /index.html 200
/revendre-scpi-delais-marche-secondaire /index.html 200
/combien-investir-scpi-100000-200000-500000 /index.html 200
/scpi-succession-transmission-assurance-vie /index.html 200
/portefeuille-scpi-en-ligne /index.html 200

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
