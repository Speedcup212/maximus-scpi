import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');

// Read the main index.html as template
const mainIndexPath = path.join(distDir, 'index.html');
let htmlContent = fs.readFileSync(mainIndexPath, 'utf-8');

// Inject the route into the HTML
htmlContent = htmlContent.replace(
  '</head>',
  `  <script>
    // Pre-set the route for this page
    window.__INITIAL_ROUTE__ = '/scpi-iroko-zen-iroko';
  </script>
  </head>`
);

// Update meta tags for SEO
htmlContent = htmlContent.replace(
  /<title>.*?<\/title>/,
  '<title>Iroko Zen : Analyse Complète & Avis d\'Expert SCPI 2025 | MaximusSCPI</title>'
);

htmlContent = htmlContent.replace(
  /<meta name="description".*?>/,
  '<meta name="description" content="Découvrez notre analyse détaillée de la SCPI Iroko Zen : rendement 2025, frais, stratégie d\'investissement. Téléchargez votre guide comparatif gratuit.">'
);

// Update canonical URL
htmlContent = htmlContent.replace(
  /<link rel="canonical" href="[^"]*"[^>]*>/,
  '<link rel="canonical" href="https://www.maximusscpi.com/scpi-iroko-zen-iroko" />'
);

// Create output directory
const outputDir = path.join(distDir, 'scpi-iroko-zen-iroko');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
console.log('✅ Page statique scpi-iroko-zen-iroko générée avec succès');
