import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const siteUrl = process.env.VITE_PUBLIC_SITE_URL || 'https://maximusscpi.com';
const isProd = process.env.NODE_ENV === 'production';

function generateRobotsTxt() {
  console.log(`🤖 Génération du robots.txt (environnement: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})...`);

  let robotsContent: string;

  if (isProd) {
    robotsContent = `# MaximusSCPI - Production robots.txt
# Site: ${siteUrl}

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml

# Bloquer les pages parasites / test / merci / tracking
Disallow: /test-*
Disallow: /merci-*
Disallow: /qa-*
Disallow: /api/
Disallow: /app/

# Bloquer les ressources techniques
Disallow: /*.json$
`;
  } else {
    robotsContent = `# MaximusSCPI - Development/Preview robots.txt
# AUCUNE INDEXATION EN ENVIRONNEMENT DE DÉVELOPPEMENT

User-agent: *
Disallow: /

# Aucun sitemap en dev/preview
`;
  }

  const outputPath = join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(outputPath, robotsContent);

  console.log(`✅ robots.txt généré avec succès`);
  console.log(`   Mode: ${isProd ? '✓ PRODUCTION (indexable)' : '✗ DEV/PREVIEW (noindex)'}`);
  console.log(`   📄 Fichier: ${outputPath}`);
}

generateRobotsTxt();
