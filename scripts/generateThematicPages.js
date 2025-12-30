import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des pages thématiques à générer
const thematicPages = [
  'meilleures-scpi-rendement',
  'scpi-europeennes',
  'scpi-fiscales',
  'preparer-retraite-scpi',
  'revenu-complementaire-scpi',
  'comparateur-scpi',
  'scpi-bureaux-investissement',
  'scpi-commerces-investissement',
  'scpi-sante-investissement',
  'scpi-sans-frais',
  'scpi-france-investissement',
  'alderan-scpi',
  'arkea-reim-scpi',
  'la-francaise-rem-scpi',
  'atland-voisin-scpi',
  'recyclage-urbain-scpi',
  'aestiam-scpi',
  'altixia-reim-scpi',
  'amundi-immobilier-scpi',
  'atream-scpi',
  'consultim-asset-management-scpi',
  'fiducial-gerance-scpi',
  'greenman-arth-scpi',
  'inter-gestion-reim-scpi',
  'iroko-scpi',
  'kyaneos-asset-management-scpi',
  'magellim-reim-scpi',
  'norma-capital-scpi',
  'novaxia-investissement-scpi',
  'paref-gestion-scpi',
  'perial-asset-management-scpi',
  'praemia-reim-france-scpi',
  'remake-asset-management-scpi',
  'sofidy-scpi',
  'sogenial-immobilier-scpi',
  'swiss-life-am-france-scpi',
  'theoreim-scpi',
  'urban-premium-scpi'
];

// Générer les pages
const distDir = path.join(__dirname, '../dist');

// Lire le fichier index.html de base pour obtenir les vrais noms de fichiers
const baseIndexPath = path.join(distDir, 'index.html');
const baseIndexContent = fs.readFileSync(baseIndexPath, 'utf-8');

// Template HTML de base
const generateHTML = (slug) => {
  // Remplacer le contenu tout en gardant les vrais imports de fichiers
  return baseIndexContent.replace(
    '<div id="root"></div>',
    `<div id="root"></div>
  <script>
    // Set the page context for the React app
    window.__INITIAL_PATH__ = '/${slug}';
  </script>`
  );
};

console.log('🚀 Génération des pages thématiques statiques...');

let generatedCount = 0;

thematicPages.forEach(slug => {
  const pageDir = path.join(distDir, slug);

  // Créer le dossier si nécessaire
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Générer le fichier index.html
  const htmlContent = generateHTML(slug);
  fs.writeFileSync(path.join(pageDir, 'index.html'), htmlContent, 'utf-8');

  generatedCount++;
});

console.log(`✅ ${generatedCount} pages thématiques générées avec succès`);
