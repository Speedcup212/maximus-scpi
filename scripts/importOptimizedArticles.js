/**
 * Script pour importer les articles optimisés dans Supabase
 * Lit les fichiers MD et les insère dans la table articles_optimized_seo
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Articles à importer
const articles = [
  {
    id: 1,
    slug: 'fonds-euros-ou-scpi',
    file: 'ARTICLE_01_FONDS_EUROS_OU_SCPI_OPTIMIZED.md',
    title: 'Fonds euros ou SCPI : que faire en 2025 ?',
    mainKeyword: 'fonds euros ou SCPI',
    category: 'comparatifs',
    metaDescription: 'Comparatif détaillé 2025 entre fonds euros (2%) et SCPI (5-6,5%). Rendements, fiscalité, risques et stratégies selon votre profil TMI. Guide complet pour arbitrer votre assurance-vie.',
    keywords: ['fonds euros ou SCPI', 'assurance-vie', 'rendement 2025', 'fiscalité', 'TMI', 'arbitrage', 'revenus locatifs', 'capital garanti']
  },
  {
    id: 2,
    slug: 'scpi-en-direct-ou-assurance-vie',
    file: 'ARTICLE_02_SCPI_DIRECT_OU_AV_OPTIMIZED.md',
    title: 'SCPI en direct ou en assurance-vie : quelles différences concrètes ?',
    mainKeyword: 'SCPI en direct ou assurance vie',
    category: 'comparatifs',
    metaDescription: 'SCPI en direct vs assurance-vie : comparatif complet fiscalité, frais, transmission, liquidité. Tableaux chiffrés et recommandations selon votre TMI et objectifs patrimoniaux.',
    keywords: ['SCPI direct', 'SCPI assurance-vie', 'fiscalité SCPI', 'flat tax', 'IR', 'frais souscription', 'transmission', 'liquidité']
  }
];

async function importArticles() {
  console.log('🚀 Importation des articles optimisés dans Supabase...\n');

  for (const article of articles) {
    try {
      console.log(`📄 Traitement de l'article: ${article.title}`);

      // Lire le fichier MD
      const filePath = path.join(__dirname, '..', article.file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Fichier non trouvé: ${article.file}`);
        continue;
      }

      const contentMarkdown = fs.readFileSync(filePath, 'utf-8');

      // Compter les mots
      const wordCount = contentMarkdown.split(/\s+/).length;

      // Convertir MD en HTML simplifié (garder le markdown pour l'instant)
      const contentHtml = contentMarkdown;

      // Vérifier si l'article existe déjà
      const { data: existing } = await supabase
        .from('articles_optimized_seo')
        .select('id')
        .eq('slug', article.slug)
        .maybeSingle();

      const articleData = {
        article_id: article.id,
        slug: article.slug,
        title: article.title,
        main_keyword: article.mainKeyword,
        category: article.category,
        content_html: contentHtml,
        content_markdown: contentMarkdown,
        word_count: wordCount,
        meta_description: article.metaDescription,
        keywords: article.keywords,
        has_faq: true,
        has_cta: true,
        has_figures: true,
        optimization_date: new Date().toISOString()
      };

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('articles_optimized_seo')
          .update(articleData)
          .eq('slug', article.slug);

        if (error) {
          console.error(`❌ Erreur mise à jour ${article.slug}:`, error.message);
        } else {
          console.log(`✅ Article mis à jour: ${article.slug} (${wordCount} mots)`);
        }
      } else {
        // Insérer
        const { error } = await supabase
          .from('articles_optimized_seo')
          .insert(articleData);

        if (error) {
          console.error(`❌ Erreur insertion ${article.slug}:`, error.message);
        } else {
          console.log(`✅ Article inséré: ${article.slug} (${wordCount} mots)`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Erreur traitement ${article.slug}:`, error.message);
    }
  }

  console.log('✅ Importation terminée !');
}

importArticles().catch(console.error);
