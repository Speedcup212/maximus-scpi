import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.VITE_PUBLIC_SITE_URL || 'https://maximusscpi.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  slug: string;
  updated_at?: string;
  category?: string;
}

interface SCPI {
  nom: string;
}

async function generateSitemap() {
  console.log('🚀 Génération du sitemap.xml depuis la base de données...');

  const today = new Date().toISOString().split('T')[0];

  let articles: Article[] = [];
  let scpiData: SCPI[] = [];

  // Tentative de récupération des articles avec gestion d'erreur
  try {
    const { data, error: articlesError } = await supabase
      .from('articles_seo')
      .select('slug, updated_at, category')
      .eq('status', 'published')
      .order('slug');

    if (articlesError) {
      console.warn('⚠️ Erreur lors de la récupération des articles:', articlesError.message);
      console.warn('⚠️ Génération d\'un sitemap minimal sans articles de la DB');
    } else {
      articles = data || [];
    }
  } catch (error: any) {
    console.warn('⚠️ Erreur de connexion lors de la récupération des articles:', error.message || error);
    console.warn('⚠️ Génération d\'un sitemap minimal sans articles de la DB');
  }

  // Tentative de récupération des SCPI avec gestion d'erreur
  try {
    const { data, error: scpiError } = await supabase
      .from('scpi')
      .select('nom')
      .order('nom');

    if (scpiError) {
      console.warn('⚠️ Erreur lors de la récupération des SCPI:', scpiError.message);
      console.warn('⚠️ Génération d\'un sitemap minimal sans SCPI de la DB');
    } else {
      scpiData = data || [];
    }
  } catch (error: any) {
    console.warn('⚠️ Erreur de connexion lors de la récupération des SCPI:', error.message || error);
    console.warn('⚠️ Génération d\'un sitemap minimal sans SCPI de la DB');
  }

  const scpiSlugs = scpiData?.map((scpi: SCPI) => {
    return `scpi-${scpi.nom.toLowerCase()
      .replace(/['\s]+/g, '-')
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ç]/g, 'c')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9-]/g, '')}`;
  }) || [];

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

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Pages statiques depuis DB -->
${articles?.filter((a: Article) => ['Légal', 'À propos'].includes(a.category || '')).map((article: Article) => `  <url>
    <loc>${siteUrl}/${article.slug}</loc>
    <lastmod>${article.updated_at?.split('T')[0] || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n') || ''}

  <!-- Google Ads Landing Pages -->
  <url>
    <loc>${siteUrl}/investir-scpi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/scpi-rentable</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- SCPI Examples -->
  <url>
    <loc>${siteUrl}/scpi-comete</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Landing Pages Optimisées SCPI -->
  <url>
    <loc>${siteUrl}/scpi-iroko-zen-iroko</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Landing Pages Sectorielles -->
${sectorPages.map(page => `  <url>
    <loc>${siteUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Landing Pages Géographiques -->
${geoPages.map(page => `  <url>
    <loc>${siteUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Landing Pages Thématiques (gestionnaires) -->
${thematicPages.map(page => `  <url>
    <loc>${siteUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Pages SCPI Individuelles -->
${scpiSlugs.map((slug: string) => `  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Articles Éducatifs depuis DB -->
${articles?.filter((a: Article) => !['Légal', 'À propos'].includes(a.category || '')).map((article: Article) => `  <url>
    <loc>${siteUrl}/${article.slug}</loc>
    <lastmod>${article.updated_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n') || ''}
</urlset>`;

  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap généré avec succès:`);
  console.log(`   - ${scpiSlugs.length} pages SCPI`);
  console.log(`   - ${articles?.length || 0} articles`);
  console.log(`   - ${thematicPages.length + sectorPages.length + geoPages.length} pages thématiques`);
  console.log(`   📄 Fichier: ${outputPath}`);
}

generateSitemap().catch((error) => {
  console.error('❌ Erreur fatale lors de la génération du sitemap:', error);
  // Ne pas faire échouer le build, générer un sitemap minimal
  const today = new Date().toISOString().split('T')[0];
  const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, minimalSitemap);
  console.log('⚠️ Sitemap minimal généré en fallback');
  process.exit(0); // Sortir avec succès pour ne pas bloquer le build
});
