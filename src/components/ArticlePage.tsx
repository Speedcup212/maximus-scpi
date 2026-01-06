import React from 'react';
import { ArrowLeft, Calendar, Clock, BookOpen, Target } from 'lucide-react';

export interface Article {
  id: string;
  slug: string;
  category: string;
  title: string;
  metaDescription: string;
  author: string;
  publishDate: string;
  readTime: string;
  content: {
    intro: string;
    sections: {
      title: string;
      content: string[];
    }[];
    conclusion: string;
  };
  relatedArticles?: string[];
}

interface ArticlePageProps {
  article: Article;
  onBack: () => void;
  onContactClick: () => void;
  onNavigateToComparator: () => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  onBack,
  onContactClick,
  onNavigateToComparator
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux articles
        </button>

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.publishDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} de lecture</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="capitalize">{article.category.replace('-', ' ')}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {article.metaDescription}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {article.content.intro}
            </div>

            {article.content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                En résumé
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.content.conclusion}
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Vous voulez aller plus loin ?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Constituez gratuitement votre sélection SCPI avec MaximusSCPI et échangez avec un expert.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onNavigateToComparator}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Constituer mon portefeuille
                </button>
                <button
                  onClick={onContactClick}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-500 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Parler à un expert
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticlePage;
