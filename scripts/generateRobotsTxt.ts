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

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1

# Interdire uniquement les ressources techniques critiques
Disallow: /api/
Disallow: /*.json$

# Autoriser explicitement les pages importantes
Allow: /scpi-*
Allow: /fonds-euros-*
Allow: /investir-*
Allow: /meilleures-*
Allow: /comparateur-*
Allow: /qui-sommes-nous
Allow: /faq
Allow: /comprendre-les-scpi
Allow: /articles/*
Allow: /education/*
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
