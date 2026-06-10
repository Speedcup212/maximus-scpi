import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Source locale fiable pour tous les slugs d'articles statiques
import { articleTemplates } from '../src/data/articleTemplatesConfig';

// Slugs des articles éducatifs dédiés (renderEducationalScpiPage) qui sont déjà dans articleTemplatesConfig.
// Les templates couvrent aujourd'hui ~141 articles dont les 6 nouveaux de la collection portefeuille.
// Liste manuelle des slugs supplémentaires (pages sans entrée template) :
const STATIC_COLLECTION_SLUGS = [
  'articles',                              // Index /articles
  'articles/construire-portefeuille-scpi',  // Hub collection
];

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

  let articles: Article[] = [];
  let scpiData: SCPI[] = [];

  // ── 1. Récupérer les slugs locaux depuis articleTemplatesConfig ──
  const localArticleSlugs: string[] = articleTemplates
    .map(t => t.slug)
    .filter(slug => !excludePatterns.some(p => p.test(slug)));

  // ── 2. Ajouter les slugs de collection supplémentaires ──
  const staticArticleRoutes: { path: string; priority: string; changefreq: string }[] = [
    ...localArticleSlugs.map(s => ({ path: s, priority: '0.7' as const, changefreq: 'monthly' as const })),
    { path: 'articles', priority: '0.8', changefreq: 'weekly' },
    { path: 'articles/construire-portefeuille-scpi', priority: '0.8', changefreq: 'weekly' },
  ];

  // ── 3. Tentative Supabase pour les articles (peut échouer → fallback local) ──
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

  // ── Construire la liste finale d'articles : fusion locale + Supabase ──
  const supabaseArticleMap = new Map<string, Article>();
  for (const a of articles.filter(a => !isExcluded(a.slug))) {
    supabaseArticleMap.set(a.slug, a);
  }

  // Les slugs locaux sont la source de vérité ; on surcharge les dates avec Supabase si dispo
  const mergedArticlePaths = staticArticleRoutes.map(entry => {
    const supabase = supabaseArticleMap.get(entry.path);
    return {
      path: entry.path,
      priority: entry.priority,
      changefreq: entry.changefreq,
      lastmod: supabase?.updated_at?.split('T')[0] || today,
    };
  });

  // Ajouter les articles Supabase qui n'existent PAS dans la source locale
  for (const a of articles) {
    if (isExcluded(a.slug)) continue;
    if (!staticArticleRoutes.some(r => r.path === a.slug)) {
      const lastmod = a.updated_at?.split('T')[0] || today;
      mergedArticlePaths.push({
        path: a.slug,
        priority: a.category === 'Légal' || a.category === 'À propos' ? '0.5' : '0.7',
        changefreq: 'monthly',
        lastmod,
      });
    }
  }

  const legalArticles = articles.filter(a => ['Légal', 'À propos'].includes(a.category || ''));
  const contentArticlesFromDb = articles.filter(a => !['Légal', 'À propos'].includes(a.category || ''));

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

  // ── Priority 0.7 / 0.8 / 0.5: Articles statiques + Supabase ──
  let staticArticleCount = 0;
  let supabaseOnlyCount = 0;
  for (const entry of mergedArticlePaths) {
    // Les articles de collection (articles/, articles/construire-portefeuille-scpi) ont priority 0.8
    // Les articles normaux ont 0.7 ; les légaux Supabase ont 0.5
    urls.push(urlEntry(
      `${siteUrl}/${entry.path}`,
      entry.priority,
      entry.changefreq,
      entry.lastmod,
    ));
    if (entry.priority === '0.8') staticArticleCount++;
    else if (!supabaseArticleMap.has(entry.path)) staticArticleCount++;
    else supabaseOnlyCount++;
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
  console.log(`   Articles statiques locaux: ${mergedArticlePaths.length} URLs (templates + collection)`);
  console.log(`     ↳ ${localArticleSlugs.length} slugs depuis articleTemplatesConfig`);
  console.log(`     ↳ ${STATIC_COLLECTION_SLUGS.length} pages de collection (/articles, hub)`);
  if (articles.length > 0) {
    console.log(`   Articles Supabase supplémentaires: ${supabaseOnlyCount} URLs`);
  }
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
