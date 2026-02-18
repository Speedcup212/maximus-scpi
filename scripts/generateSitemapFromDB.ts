import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = 'https://maximusscpi.com';

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

function ensureTrailingSlash(url: string): string {
  if (url.endsWith('/')) return url;
  return url + '/';
}

function urlEntry(loc: string, priority: string, changefreq: string, lastmod: string): string {
  return `  <url>
    <loc>${ensureTrailingSlash(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('🚀 Génération du sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];

  let articles: Article[] = [];
  let scpiData: SCPI[] = [];

  try {
    const { data, error } = await supabase
      .from('articles_seo')
      .select('slug, updated_at, category')
      .eq('status', 'published')
      .order('slug');
    if (!error && data) articles = data;
    else console.warn('⚠️ Articles:', error?.message);
  } catch (e: any) {
    console.warn('⚠️ Articles fetch error:', e.message);
  }

  try {
    const { data, error } = await supabase
      .from('scpi')
      .select('nom')
      .order('nom');
    if (!error && data) scpiData = data;
    else console.warn('⚠️ SCPI:', error?.message);
  } catch (e: any) {
    console.warn('⚠️ SCPI fetch error:', e.message);
  }

  // Slugs to EXCLUDE from sitemap (test, merci, debug, copy, qa, tracking)
  const excludePatterns = [
    /^test-/,
    /^merci-/,
    /^qa-/,
    /copy$/,
    /debug/,
    /tracking/,
    /^log-in$/,
  ];

  const isExcluded = (slug: string) => excludePatterns.some(p => p.test(slug));

  const scpiSlugs = scpiData
    .map(scpi => scpi.nom.toLowerCase()
      .replace(/['\s]+/g, '-')
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ç]/g, 'c')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9-]/g, ''))
    .filter(s => !isExcluded(s));

  const validArticles = articles.filter(a => !isExcluded(a.slug));
  const legalArticles = validArticles.filter(a => ['Légal', 'À propos'].includes(a.category || ''));
  const contentArticles = validArticles.filter(a => !['Légal', 'À propos'].includes(a.category || ''));

  const urls: string[] = [];

  // ── Priority 1.0: Homepage ──
  urls.push(urlEntry(`${siteUrl}/`, '1.0', 'daily', today));

  // ── Priority 0.9: Money pages ──
  const moneyPages = [
    'comparateur-scpi',
    'meilleures-scpi-rendement',
  ];
  for (const p of moneyPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.9', 'weekly', today));
  }

  // ── Priority 0.8: Thematic landing pages ──
  const thematicPages = [
    'scpi-fiscales',
    'scpi-europeennes',
    'preparer-retraite-scpi',
    'revenu-complementaire-scpi',
    'scpi-bureaux-investissement',
    'scpi-commerces-investissement',
    'scpi-sante-investissement',
    'scpi-france-investissement',
    'scpi-sans-frais',
    'comprendre-les-scpi',
    'faq',
    'investir-scpi',
  ];
  for (const p of thematicPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'weekly', today));
  }

  // ── Priority 0.8: Simulators ──
  const simulators = [
    'simulateurs',
    'simulateur-revenus-nets-scpi',
    'simulateur-credit-scpi',
    'simulateur-demembrement-scpi',
    'simulateur-enveloppes-scpi',
    'simulateur-tresorerie-is',
    'simulateur-impact-fiscal-scpi',
    'simulateur-profil-investisseur',
    'comparateur-demembrement-scpi',
  ];
  for (const p of simulators) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'monthly', today));
  }

  // ── Priority 0.8: Sector pages ──
  const sectorPages = [
    'scpi-bureaux', 'scpi-commerces', 'scpi-sante',
    'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-mixte',
  ];
  for (const p of sectorPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'weekly', today));
  }

  // ── Priority 0.8: Geo pages ──
  const geoPages = ['scpi-france', 'scpi-europe', 'scpi-international'];
  for (const p of geoPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'weekly', today));
  }

  // ── Priority 0.7: EEAT pages ──
  const eeatPages = [
    'expertise-orias-cif',
    'methodologie-donnees-scpi',
    'avertissements-risques-scpi',
    'qui-sommes-nous',
  ];
  for (const p of eeatPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.7', 'monthly', today));
  }

  // ── Priority 0.7: Manager pages ──
  const managerPages = [
    'alderan-scpi', 'arkea-reim-scpi', 'la-francaise-rem-scpi',
    'atland-voisin-scpi', 'aestiam-scpi', 'altixia-reim-scpi',
    'amundi-immobilier-scpi', 'atream-scpi', 'consultim-asset-management-scpi',
    'fiducial-gerance-scpi', 'greenman-arth-scpi', 'inter-gestion-reim-scpi',
    'iroko-scpi', 'kyaneos-asset-management-scpi', 'magellim-reim-scpi',
    'norma-capital-scpi', 'novaxia-investissement-scpi', 'paref-gestion-scpi',
    'perial-asset-management-scpi', 'praemia-reim-france-scpi',
    'remake-asset-management-scpi', 'sofidy-scpi', 'sogenial-immobilier-scpi',
    'swiss-life-am-france-scpi', 'theoreim-scpi', 'urban-premium-scpi',
  ];
  for (const p of managerPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.7', 'monthly', today));
  }

  // ── Priority 0.7: Individual SCPI pages (from DB) ──
  for (const slug of scpiSlugs) {
    urls.push(urlEntry(`${siteUrl}/${slug}`, '0.7', 'weekly', today));
  }

  // ── Priority 0.7: Educational articles (from DB) ──
  for (const a of contentArticles) {
    const lastmod = a.updated_at?.split('T')[0] || today;
    urls.push(urlEntry(`${siteUrl}/${a.slug}`, '0.7', 'monthly', lastmod));
  }

  // ── Priority 0.5: Legal pages (from DB) ──
  for (const a of legalArticles) {
    const lastmod = a.updated_at?.split('T')[0] || today;
    urls.push(urlEntry(`${siteUrl}/${a.slug}`, '0.5', 'monthly', lastmod));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap généré: ${urls.length} URLs`);
  console.log(`   Money pages: ${moneyPages.length}`);
  console.log(`   Thematic: ${thematicPages.length}`);
  console.log(`   Simulators: ${simulators.length}`);
  console.log(`   SCPI: ${scpiSlugs.length}`);
  console.log(`   Articles: ${contentArticles.length}`);
  console.log(`   📄 ${outputPath}`);
}

generateSitemap().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  const today = new Date().toISOString().split('T')[0];
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${siteUrl}/comparateur-scpi/</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${siteUrl}/meilleures-scpi-rendement/</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
</urlset>`;
  fs.writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), fallback);
  console.log('⚠️ Sitemap minimal généré en fallback');
  process.exit(0);
});
