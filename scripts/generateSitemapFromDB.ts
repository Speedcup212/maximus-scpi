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

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface Article {
  slug: string;
  updated_at?: string;
  category?: string;
}

function ensureTrailingSlash(url: string): string {
  if (url.endsWith('/')) return url;
  return url + '/';
}

/**
 * Normalise un slug d'article pour le placer sous /articles/.
 * - slug = "scpi-expatrie-fiscalite" → "articles/scpi-expatrie-fiscalite"
 * - slug = "articles/construire-portefeuille-scpi" → "articles/construire-portefeuille-scpi"
 * - slug = "articles" → "articles"  (page index)
 */
function toArticlePath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  if (clean === 'articles' || clean.startsWith('articles/')) return clean;
  return `articles/${clean}`;
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

  // Catalogue local = source de vérité des fiches SCPI.
  // Le sitemap ne dépend plus d'une table Supabase "scpi" inexistante.
  const scpiCatalogPath = join(__dirname, '..', 'src', 'data', 'scpi_complet.json');
  const scpiCatalogJson = JSON.parse(fs.readFileSync(scpiCatalogPath, 'utf-8'));
  const scpiCatalog = Array.isArray(scpiCatalogJson)
    ? scpiCatalogJson
    : (scpiCatalogJson.Sheet1 || []);

  const toScpiSlug = (name: string): string =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const scpiNames = scpiCatalog
    .map((row: Record<string, unknown>) => String(row['Nom SCPI'] || '').trim())
    .filter(Boolean);

  // Les slugs SCPI ne passent pas par les exclusions génériques d'articles/pages.
  // "Log In" est une SCPI réelle et son slug canonique est /log-in/.
  const scpiSlugs = [...new Set(scpiNames.map(toScpiSlug))];

  if (scpiSlugs.length !== scpiNames.length) {
    throw new Error(`Catalogue SCPI incohérent: ${scpiNames.length} noms pour ${scpiSlugs.length} slugs uniques.`);
  }

  // ── 1. Récupérer les slugs locaux depuis articleTemplatesConfig ──
  const localArticleSlugs: string[] = articleTemplates
    .filter(t => t.indexable !== false)
    .map(t => t.slug)
    .filter(slug => !excludePatterns.some(p => p.test(slug)));

  // ── 2. Ajouter les slugs de collection supplémentaires ──
  const resaleArticleSlugs = [
    'scpi-parts-en-attente-retrait-que-faire',
    'scpi-capital-fixe-marche-secondaire-prix-execution',
    'primovie-revente-parts-marche-secondaire-2026',
    'scpi-baisse-vendre-ou-attendre',
  ];

  const staticArticleRoutes: { path: string; priority: string; changefreq: string }[] = [
    ...localArticleSlugs.map(s => ({ path: s, priority: '0.7' as const, changefreq: 'monthly' as const })),
    ...resaleArticleSlugs.map(s => ({ path: s, priority: '0.7' as const, changefreq: 'weekly' as const })),
    { path: 'articles', priority: '0.8', changefreq: 'weekly' },
    { path: 'articles/construire-portefeuille-scpi', priority: '0.8', changefreq: 'weekly' },
  ];

  // ── 3. Supabase complète uniquement les articles.
  // Les fiches SCPI restent déterministes à partir du catalogue local.
  if (supabase) {
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
  } else {
    console.warn('⚠️ Supabase indisponible: sitemap articles généré depuis les sources locales.');
  }

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
  // Uniquement des URLs canoniques: aucune URL qui répond par 301.
  const thematicPages = [
    'scpi-europeennes',
    'revenu-complementaire-scpi',
    'scpi-sans-frais',
    'recyclage-urbain-scpi',
    'comprendre-les-scpi',
    'faq',
    'investir-scpi',
    'scpi-fiscalite',
    'scpi-retraite',
  ];
  for (const p of thematicPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'weekly', today));
  }

  // ── Priority 0.8: Simulators ──
  const simulators = [
    'simulateurs',
    'simulateur-revenus-nets-scpi',
    'simulateur-marche-secondaire-scpi',
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
  // ❌ scpi-mixte retiré (pas de route confirmée)
  const sectorPages = [
    'scpi-bureaux', 'scpi-commerces', 'scpi-sante',
    'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie',
  ];
  for (const p of sectorPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.8', 'weekly', today));
  }

  // ── Priority 0.8: Geo pages ──
  // ❌ scpi-europe retiré (301 → scpi-europeennes/), scpi-international retiré (pas de route confirmée)
  const geoPages = ['scpi-france'];
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
    'fiducial-gerance-scpi', 'inter-gestion-reim-scpi',
    'iroko-scpi', 'kyaneos-asset-management-scpi', 'magellim-reim-scpi',
    'norma-capital-scpi', 'novaxia-investissement-scpi', 'paref-gestion-scpi',
    'perial-asset-management-scpi', 'praemia-reim-france-scpi',
    'remake-asset-management-scpi', 'sofidy-scpi', 'sogenial-immobilier-scpi',
    'swiss-life-am-france-scpi', 'theoreim-scpi', 'urban-premium-scpi',
  ];
  for (const p of managerPages) {
    urls.push(urlEntry(`${siteUrl}/${p}`, '0.7', 'monthly', today));
  }

  // ── Priority 0.7: Individual SCPI pages (catalogue local, canonical /{slug}/) ──
  for (const slug of scpiSlugs) {
    urls.push(urlEntry(`${siteUrl}/${slug}`, '0.7', 'weekly', today));
  }

  // ── Priority 0.7 / 0.8 / 0.5: Articles statiques + Supabase (sous /articles/) ──
  let staticArticleCount = 0;
  let supabaseOnlyCount = 0;
  for (const entry of mergedArticlePaths) {
    // Les articles de collection (articles/, articles/construire-portefeuille-scpi) ont priority 0.8
    // Les articles normaux ont 0.7 ; les légaux Supabase ont 0.5
    // Tous les slugs articles sont normalisés sous /articles/ via toArticlePath()
    urls.push(urlEntry(
      `${siteUrl}/${toArticlePath(entry.path)}`,
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
  console.log(`   Articles statiques locaux: ${mergedArticlePaths.length} URLs sous /articles/ (templates + collection)`);
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
