import React, { useEffect, useState, lazy, Suspense } from 'react';
import { PieChart, Calculator } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import LoadingSpinner from './LoadingSpinner';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateBreadcrumbSchema, generateArticleSchema } from '../utils/seoOptimizer';
import { supabase } from '../supabaseClient';
import { getArticleComponent } from '../utils/articleComponentsMap';

const DynamicArticlePage = lazy(() => import('./DynamicArticlePage'));

interface OptimizedArticlePageProps {
  slug: string;
  onArticleClick?: (slug: string) => void;
  onThematicClick?: (theme: string) => void;
}

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  keywords: string[];
  category: string;
  main_keyword: string;
  search_intent: string;
  target_audience: string;
  component_name: string;
  excerpt: string;
  word_count: number;
  read_time: number;
  featured: boolean;
  status: string;
  published_at: string;
  intro: string | null;
  content_html: string | null;
}

const OptimizedArticlePage: React.FC<OptimizedArticlePageProps> = ({ slug }) => {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);

        if (!supabase) {
          setError('Supabase non configuré');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('articles_seo')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (fetchError) {
          console.error('Erreur chargement article:', fetchError);
          setError('Erreur lors du chargement de l\'article');
          return;
        }

        if (!data) {
          setError('Article non trouvé');
          return;
        }

        setArticle(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Article non trouvé'}
          </h1>
          <a href="/" className="text-emerald-400 hover:text-emerald-300 hover:underline">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  // 1. Priorité : content_html Supabase
  // 2. Fallback : composant React (component_name)
  const hasContentHtml = article.content_html && article.content_html.trim().length > 0;
  const cleanedHtml = hasContentHtml ? cleanArticleHtml(article.content_html!) : '';

  // Schemas structurés pour SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://maximusscpi.com' },
    { name: 'Articles', url: 'https://maximusscpi.com/#articles' },
    { name: article.title, url: `https://maximusscpi.com/articles/${slug}` }
  ]);

  const articleSchema = generateArticleSchema({
    headline: article.title,
    description: article.meta_description,
    author: 'Éric Bellaiche',
    datePublished: article.published_at || '2026-01-20',
    dateModified: article.published_at || '2026-01-20',
    image: 'https://maximusscpi.com/images/eric-192.webp'
  });

  return (
    <>
      <SEOHead
        title={`${article.title} | MaximusSCPI`}
        description={article.meta_description}
        keywords={article.keywords}
        canonical={`https://maximusscpi.com/articles/${slug}/`}
        schemaData={[breadcrumbSchema, articleSchema]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasContentHtml ? (
          // Rendu du contenu HTML Supabase
          <article className="max-w-none">
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: cleanedHtml }}
            />
          </article>
        ) : getArticleComponent(article.component_name) ? (
          // Fallback : composant React existant
          <article className="max-w-none">
            {React.createElement(getArticleComponent(article.component_name)!)}
          </article>
        ) : (
          // Fallback : DynamicArticlePage (template config)
          <Suspense fallback={<LoadingSpinner />}>
            <DynamicArticlePage slug={slug} />
          </Suspense>
        )}

        {/* CTA Section */}
        <div className="my-16 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un conseil personnalisé ?</h2>
          <p className="text-xl mb-6 text-blue-100 max-w-2xl mx-auto">
            Nos conseillers certifiés ORIAS analysent votre situation et vous proposent une stratégie SCPI adaptée à votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparateur-scpi"
              className="bg-white text-blue-700 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <PieChart className="w-5 h-5" />
              Comparer 50+ SCPI
            </a>
            <a
              href="/simulateur-enveloppes"
              className="bg-blue-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-600 transition-all border-2 border-white/30 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Simuler mon allocation
            </a>
          </div>
        </div>

        {/* Semantic Links */}
        <SemanticLinks
          currentPage={`/articles/${slug}`}
          links={getSemanticLinks(`/articles/${slug}`)}
          title="Poursuivez votre découverte des SCPI"
        />
      </div>
    </>
  );
};

/** Nettoie les résidus Markdown présents dans le content_html Supabase
 *  (backticks ```, titres markdown #, etc.) */
function cleanArticleHtml(raw: string): string {
  return raw
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .trim();
}

export default OptimizedArticlePage;
