import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scpiData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/SCPI_comparateur_mistral_ready.json'), 'utf-8')
);

// Parse article templates for education articles
const parseArticleTemplates = (content) => {
  const articles = [];
  const regex = /\{\s*id:\s*\d+,\s*slug:\s*'([^']+)',/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const slug = match[1];
    // Skip the main pillar article that has its own dedicated page
    if (slug !== 'fonds-euros-ou-scpi') {
      articles.push(slug);
    }
  }
  return articles;
};

const templatesContent = fs.readFileSync(path.join(__dirname, '../src/data/articleTemplatesConfig.ts'), 'utf-8');
const educationArticles = parseArticleTemplates(templatesContent);

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
  'scpi-europeennes',
  'preparer-retraite-scpi',
  'revenu-complementaire-scpi',
  'scpi-bureaux-investissement',
  'scpi-commerces-investissement',
  'scpi-sante-investissement',
  'scpi-france-investissement',
  'scpi-sans-frais',
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

const scpiPages = scpiData.map(scpi => {
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

const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.maximusscpi.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Pages statiques -->
  <url>
    <loc>https://www.maximusscpi.com/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/comprendre-les-scpi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/qui-sommes-nous</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/reclamation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/conditions-utilisation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Google Ads Landing Pages -->
  <url>
    <loc>https://www.maximusscpi.com/investir-scpi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/scpi-rentable</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- SCPI Examples -->
  <url>
    <loc>https://www.maximusscpi.com/scpi-comete</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Landing Pages Optimisées SCPI -->
  <url>
    <loc>https://www.maximusscpi.com/scpi-iroko-zen-iroko</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/scpi-remake-live-remake</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.maximusscpi.com/scpi-novaxia-neo-novaxia</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Landing Pages Sectorielles -->
${sectorPages.map(page => `  <url>
    <loc>https://www.maximusscpi.com/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Landing Pages Géographiques -->
${geoPages.map(page => `  <url>
    <loc>https://www.maximusscpi.com/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Landing Pages Thématiques -->
${thematicPages.map(page => `  <url>
    <loc>https://www.maximusscpi.com/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Pages SCPI Individuelles -->
${scpiPages.map(page => `  <url>
    <loc>https://www.maximusscpi.com/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Articles Éducatifs (30 articles) -->
  <url>
    <loc>https://www.maximusscpi.com/fonds-euros-ou-scpi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${educationArticles.map(slug => `  <url>
    <loc>https://www.maximusscpi.com/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${scpiPages.length} SCPI pages + ${educationArticles.length + 1} articles éducatifs`);
