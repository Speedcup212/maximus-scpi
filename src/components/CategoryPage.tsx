import React from 'react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { Article } from './ArticlePage';

interface CategoryPageProps {
  category: {
    id: string;
    label: string;
    icon: string;
  };
  articles: Article[];
  onBack: () => void;
  onArticleClick: (article: Article) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  articles,
  onBack,
  onArticleClick
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux catégories
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{category.icon}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {category.label}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {articles.length} article{articles.length > 1 ? 's' : ''} disponible{articles.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                  {article.metaDescription}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {article.publishDate}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Lire l'article →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun article disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les articles de cette catégorie seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
