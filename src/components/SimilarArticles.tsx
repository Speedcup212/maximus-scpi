import React, { useEffect, useState } from 'react';
import { FileText, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SimilarArticlesProps {
  currentSlug: string;
  category?: string;
  tags?: string[];
  maxResults?: number;
  className?: string;
}

interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  priority: number;
  readingTime?: number;
}

const SimilarArticles: React.FC<SimilarArticlesProps> = ({
  currentSlug,
  category,
  tags = [],
  maxResults = 4,
  className = ''
}) => {
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarArticles = async () => {
      if (!currentSlug) return;

      try {
        let query = supabase
          .from('semantic_pages')
          .select('slug, title, category, tags, priority')
          .eq('active', true)
          .eq('page_type', 'article')
          .neq('slug', currentSlug);

        if (category) {
          query = query.eq('category', category);
        }

        if (tags.length > 0) {
          query = query.overlaps('tags', tags);
        }

        query = query.order('priority', { ascending: false }).limit(maxResults);

        const { data, error } = await query;

        if (error) {
          console.error('Erreur récupération articles similaires:', error);
          return;
        }

        const articlesWithReadingTime = (data || []).map(article => ({
          ...article,
          readingTime: Math.floor(Math.random() * 5) + 3
        }));

        setSimilarArticles(articlesWithReadingTime);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarArticles();
  }, [currentSlug, category, tags, maxResults]);

  if (loading || similarArticles.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sur le même sujet
        </h2>
      </div>

      <div className="space-y-4">
        {similarArticles.map((article) => (
          <a
            key={article.slug}
            href={article.slug}
            className="block bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 border border-transparent hover:border-blue-300 dark:hover:border-blue-600 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {article.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readingTime} min</span>
                    </div>
                  )}
                  {article.category && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      {article.category}
                    </span>
                  )}
                </div>

                {article.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="/comprendre-scpi"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Tous nos guides et articles
        </a>
      </div>
    </div>
  );
};

export default SimilarArticles;
