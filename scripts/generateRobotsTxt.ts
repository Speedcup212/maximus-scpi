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

Disallow: /app/
Disallow: /api/
Disallow: /*.json$
Disallow: /merci-*
Disallow: /test-*
Disallow: /qa-*
Disallow: /admin/
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
