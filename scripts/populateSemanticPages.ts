import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SCPI {
  nom: string;
  secteur: string;
  zone_geo: string;
}

interface Article {
  slug: string;
  title: string;
  category: string;
  content?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/['\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractTags(text: string): string[] {
  const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'avec', 'pour', 'dans', 'sur', 'par'];
  const words = text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëîïôöùûüç-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));

  return [...new Set(words)].slice(0, 5);
}

async function importSCPI() {
  console.log('📦 Import des SCPI...');

  const { data: scpiData, error } = await supabase
    .from('scpi')
    .select('nom, secteur, zone_geo');

  if (error) {
    console.error('❌ Erreur récupération SCPI:', error);
    return;
  }

  const secteurMapping: Record<string, string> = {
    'Bureaux': 'bureaux',
    'Commerces': 'commerces',
    'Santé': 'sante',
    'Logistique': 'logistique',
    'Résidentiel': 'residentiel',
    'Diversifié': 'diversifie',
    'Mixte': 'mixte'
  };

  const geoMapping: Record<string, string> = {
    'France': 'france',
    'Europe': 'europe',
    'International': 'international'
  };

  const pages = scpiData?.map((scpi: SCPI) => {
    const slug = `scpi-${slugify(scpi.nom)}`;
    const secteurSlug = secteurMapping[scpi.secteur] || 'diversifie';
    const geoSlug = geoMapping[scpi.zone_geo] || 'france';

    return {
      slug: `/${slug}`,
      title: `SCPI ${scpi.nom}`,
      page_type: 'scpi_page',
      category: secteurSlug,
      subcategory: geoSlug,
      tags: [scpi.nom.toLowerCase(), secteurSlug, geoSlug, 'scpi'],
      priority: 6,
      parent_slug: `/scpi-${secteurSlug}`,
      active: true
    };
  }) || [];

  if (pages.length > 0) {
    const { error: insertError } = await supabase
      .from('semantic_pages')
      .upsert(pages, { onConflict: 'slug' });

    if (insertError) {
      console.error('❌ Erreur insertion SCPI:', insertError);
    } else {
      console.log(`✅ ${pages.length} SCPI importées`);
    }
  }
}

async function importArticles() {
  console.log('📝 Import des articles...');

  const { data: articles, error } = await supabase
    .from('articles_seo')
    .select('slug, title, category')
    .eq('status', 'published');

  if (error) {
    console.error('❌ Erreur récupération articles:', error);
    return;
  }

  const categoryMapping: Record<string, { parent: string; priority: number }> = {
    'Fiscalité': { parent: '/comprendre-scpi', priority: 6 },
    'Retraite': { parent: '/preparer-retraite-scpi', priority: 6 },
    'Investissement': { parent: '/meilleures-scpi-rendement', priority: 5 },
    'Guide': { parent: '/comprendre-scpi', priority: 6 },
    'Comparaison': { parent: '/comparateur-scpi', priority: 5 },
    'Secteur': { parent: '/meilleures-scpi-rendement', priority: 5 },
    'Légal': { parent: '/', priority: 2 },
    'À propos': { parent: '/', priority: 2 }
  };

  const pages = articles?.map((article: Article) => {
    const categoryInfo = categoryMapping[article.category || 'Guide'] || {
      parent: '/comprendre-scpi',
      priority: 5
    };

    const tags = extractTags(article.title);

    return {
      slug: `/${article.slug}`,
      title: article.title,
      page_type: 'article',
      category: article.category?.toLowerCase() || 'guide',
      tags: tags,
      priority: categoryInfo.priority,
      parent_slug: categoryInfo.parent,
      active: true
    };
  }) || [];

  if (pages.length > 0) {
    const { error: insertError } = await supabase
      .from('semantic_pages')
      .upsert(pages, { onConflict: 'slug' });

    if (insertError) {
      console.error('❌ Erreur insertion articles:', insertError);
    } else {
      console.log(`✅ ${pages.length} articles importés`);
    }
  }
}

async function importLandingPages() {
  console.log('🎯 Import des landing pages...');

  const landingPages = [
    // Sectorielles
    {
      slug: '/scpi-bureaux-investissement',
      title: 'SCPI Bureaux : Investissement Tertiaire 2025',
      page_type: 'landing_page',
      category: 'bureaux',
      tags: ['bureaux', 'tertiaire', 'immobilier', 'investissement'],
      priority: 8,
      parent_slug: '/meilleures-scpi-rendement'
    },
    {
      slug: '/scpi-commerces-investissement',
      title: 'SCPI Commerces : Retail & Distribution 2025',
      page_type: 'landing_page',
      category: 'commerces',
      tags: ['commerces', 'retail', 'distribution', 'investissement'],
      priority: 8,
      parent_slug: '/meilleures-scpi-rendement'
    },
    {
      slug: '/scpi-sante-investissement',
      title: 'SCPI Santé : EHPAD & Cliniques 2025',
      page_type: 'landing_page',
      category: 'sante',
      tags: ['sante', 'ehpad', 'cliniques', 'medical', 'investissement'],
      priority: 8,
      parent_slug: '/meilleures-scpi-rendement'
    },
    {
      slug: '/scpi-logistique-investissement',
      title: 'SCPI Logistique : Entrepôts E-Commerce 2025',
      page_type: 'landing_page',
      category: 'logistique',
      tags: ['logistique', 'entrepots', 'ecommerce', 'investissement'],
      priority: 8,
      parent_slug: '/meilleures-scpi-rendement'
    },
    // Géographiques
    {
      slug: '/scpi-france-investissement',
      title: 'SCPI France : Immobilier National 2025',
      page_type: 'landing_page',
      category: 'geographie',
      tags: ['france', 'national', 'francais', 'immobilier'],
      priority: 8,
      parent_slug: '/meilleures-scpi-rendement'
    },
    // Objectifs
    {
      slug: '/revenu-complementaire-scpi',
      title: 'Revenu Complémentaire avec les SCPI',
      page_type: 'landing_page',
      category: 'objectif',
      tags: ['revenu', 'complementaire', 'passif', 'mensuel'],
      priority: 8,
      parent_slug: '/'
    },
    // Fiscales
    {
      slug: '/scpi-fiscales',
      title: 'SCPI Fiscales : Défiscalisation Immobilière',
      page_type: 'landing_page',
      category: 'fiscalite',
      tags: ['fiscalite', 'defiscalisation', 'impot', 'reduction'],
      priority: 8,
      parent_slug: '/comprendre-scpi'
    },
    {
      slug: '/scpi-sans-frais',
      title: 'SCPI Sans Frais d\'Entrée 2025',
      page_type: 'landing_page',
      category: 'frais',
      tags: ['sans-frais', 'zero-frais', 'optimisation', 'capital'],
      priority: 8,
      parent_slug: '/comprendre-scpi'
    }
  ];

  const { error } = await supabase
    .from('semantic_pages')
    .upsert(landingPages, { onConflict: 'slug' });

  if (error) {
    console.error('❌ Erreur insertion landing pages:', error);
  } else {
    console.log(`✅ ${landingPages.length} landing pages importées`);
  }
}

async function populateSemanticPages() {
  console.log('🚀 Population de semantic_pages...\n');

  await importSCPI();
  await importArticles();
  await importLandingPages();

  const { count } = await supabase
    .from('semantic_pages')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  console.log(`\n✅ Total : ${count} pages dans semantic_pages`);
}

populateSemanticPages().catch(console.error);
