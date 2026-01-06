import React, { useEffect, useState } from 'react';
import { TrendingUp, Building, ShoppingCart, Heart, Box, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface RelatedSCPIProps {
  currentSlug: string;
  category?: string;
  maxResults?: number;
  className?: string;
}

interface SCPIPage {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  priority: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  bureaux: <Building className="h-5 w-5" />,
  commerces: <ShoppingCart className="h-5 w-5" />,
  sante: <Heart className="h-5 w-5" />,
  logistique: <Box className="h-5 w-5" />,
  default: <TrendingUp className="h-5 w-5" />
};

const getCategoryIcon = (category: string) => {
  return categoryIcons[category] || categoryIcons.default;
};

const RelatedSCPI: React.FC<RelatedSCPIProps> = ({
  currentSlug,
  category,
  maxResults = 3,
  className = ''
}) => {
  const [relatedPages, setRelatedPages] = useState<SCPIPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedSCPI = async () => {
      if (!currentSlug) return;

      try {
        let query = supabase
          .from('semantic_pages')
          .select('slug, title, category, tags, priority')
          .eq('active', true)
          .eq('page_type', 'scpi_page')
          .neq('slug', currentSlug);

        if (category) {
          query = query.eq('category', category);
        }

        query = query.order('priority', { ascending: false }).limit(maxResults);

        const { data, error } = await query;

        if (error) {
          console.error('Erreur récupération SCPI liées:', error);
          return;
        }

        setRelatedPages(data || []);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedSCPI();
  }, [currentSlug, category, maxResults]);

  if (loading || relatedPages.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        SCPI Similaires
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Ces SCPI appartiennent à la même catégorie et pourraient vous intéresser
      </p>

      <div className="space-y-4">
        {relatedPages.map((page) => (
          <a
            key={page.slug}
            href={page.slug}
            className="block bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                {getCategoryIcon(page.category)}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {page.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {page.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="/meilleures-scpi-rendement"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Voir toutes les meilleures SCPI
        </a>
      </div>
    </div>
  );
};

export default RelatedSCPI;
