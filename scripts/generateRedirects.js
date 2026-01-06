import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scpiData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/SCPI_comparateur_mistral_ready.json'), 'utf-8')
);

const sectorPages = [
  'scpi-bureaux',
  'scpi-commerces',
  'scpi-sante',
  'scpi-logistique',
  'scpi-residentiel',
  'scpi-hotellerie',
  'scpi-mixte'
];

const geoPages = [
  'scpi-france',
  'scpi-europeennes',
  'scpi-europe',
  'scpi-international'
];

const thematicPages = [
  'meilleures-scpi-rendement',
  'comparateur-scpi',
  'scpi-fiscales',
  'preparer-retraite-scpi',
  'revenu-complementaire-scpi',
  'scpi-bureaux-investissement',
  'scpi-commerces-investissement',
  'scpi-sante-investissement',
  'scpi-france-investissement'
];

const scpiPages = scpiData
  .map(scpi => {
    return `scpi-${scpi.nom_scpi.toLowerCase()
      .replace(/['\s]+/g, '-')
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ç]/g, 'c')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9-]/g, '')}`;
  });

const scpiLandingPages = [
  'scpi-comete-alderan',
  'scpi-transitions-europe-arkea-reim',
  'scpi-epargne-pierre-europe-atland-voisin',
  'scpi-optimale-la-francaise-rem',
  'scpi-iroko-zen-iroko',
  'scpi-remake-live-remake',
  'scpi-novaxia-neo-novaxia'
];

const redirects = `# Netlify redirects for SPA routing

# Pages statiques
/faq /index.html 200
/comprendre-les-scpi /index.html 200
/qui-sommes-nous /index.html 200
/reclamation /index.html 200
/conditions-utilisation /index.html 200

# Google Ads Landing Pages
/investir-scpi /index.html 200
/scpi-rentable /index.html 200

# Landing Pages - Secteurs
${sectorPages.map(page => `/${page} /index.html 200`).join('\n')}

# Landing Pages - Géographie
${geoPages.map(page => `/${page} /index.html 200`).join('\n')}

# Landing Pages - Thématiques
${thematicPages.map(page => `/${page} /index.html 200`).join('\n')}

# Landing Pages - SCPI individuelles (Google Ads)
${scpiLandingPages.map(page => `/${page} /index.html 200`).join('\n')}

# Pages détail SCPI (toutes les SCPI du comparateur)
${scpiPages.map(page => `/${page} /index.html 200`).join('\n')}

# Catch-all for other routes
/* /index.html 200
`;

fs.writeFileSync(path.join(__dirname, '../public/_redirects'), redirects);
console.log(`✅ Redirects generated with ${scpiPages.length} SCPI pages`);
