import React from 'react';
import { BookOpen, TrendingUp, Shield, Target, AlertTriangle, ArrowRight } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { articleTemplates, ArticleTemplate } from '../data/articleTemplatesConfig';

interface EducationArticlesIndexPageProps {
  onArticleClick: (slug: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onReviewsClick: () => void;
  onLogoClick?: () => void;
  onFaqClick?: () => void;
  onScpiPageClick?: (slug: string) => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  onArticlesClick?: () => void;
  onEducationClick?: (category: string, slug: string) => void;
}

const EducationArticlesIndexPage: React.FC<EducationArticlesIndexPageProps> = ({
  onArticleClick,
  isDarkMode,
  toggleTheme,
  onContactClick,
  onAboutClick,
  onReviewsClick,
  onLogoClick,
  onFaqClick,
  onScpiPageClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onComparateurClick,
  onSimulateurClick,
  onArticlesClick,
  onEducationClick
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comparatifs': return TrendingUp;
      case 'fiscalite': return Shield;
      case 'strategies': return Target;
      case 'guides': return BookOpen;
      case 'marche': return AlertTriangle;
      case 'analyse': return TrendingUp;
      default: return BookOpen;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'comparatifs': return {
        iconClass: 'text-blue-600',
        borderHoverClass: 'hover:border-blue-500',
        titleHoverClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        badgeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        arrowClass: 'text-blue-600'
      };
      case 'fiscalite': return {
        iconClass: 'text-green-600',
        borderHoverClass: 'hover:border-green-500',
        titleHoverClass: 'group-hover:text-green-600 dark:group-hover:text-green-400',
        badgeClass: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        arrowClass: 'text-green-600'
      };
      case 'strategies': return {
        iconClass: 'text-purple-600',
        borderHoverClass: 'hover:border-purple-500',
        titleHoverClass: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
        badgeClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        arrowClass: 'text-purple-600'
      };
      case 'guides': return {
        iconClass: 'text-orange-600',
        borderHoverClass: 'hover:border-orange-500',
        titleHoverClass: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
        badgeClass: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        arrowClass: 'text-orange-600'
      };
      case 'marche': return {
        iconClass: 'text-red-600',
        borderHoverClass: 'hover:border-red-500',
        titleHoverClass: 'group-hover:text-red-600 dark:group-hover:text-red-400',
        badgeClass: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        arrowClass: 'text-red-600'
      };
      case 'analyse': return {
        iconClass: 'text-indigo-600',
        borderHoverClass: 'hover:border-indigo-500',
        titleHoverClass: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
        badgeClass: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        arrowClass: 'text-indigo-600'
      };
      default: return {
        iconClass: 'text-gray-600',
        borderHoverClass: 'hover:border-gray-500',
        titleHoverClass: 'group-hover:text-gray-600 dark:group-hover:text-gray-400',
        badgeClass: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
        arrowClass: 'text-gray-600'
      };
    }
  };

  const groupedArticles = articleTemplates.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, ArticleTemplate[]>);

  const categoryLabels = {
    comparatifs: 'Comparatifs',
    fiscalite: 'Fiscalité',
    strategies: 'Stratégies',
    guides: 'Guides Pratiques',
    marche: 'Marché & Risques',
    analyse: 'Analyses & Comparaisons'
  };

  return (
    <>
      <SEOHead
        title="Articles Éducatifs SCPI | MaximusSCPI"
        description="30 articles experts pour tout comprendre sur les SCPI : comparatifs, fiscalité, stratégies d'investissement, guides pratiques et analyse de marché."
        keywords={['articles SCPI', 'guide SCPI', 'fiscalité SCPI', 'stratégie investissement', 'comparatif SCPI']}
        canonical="https://www.maximusscpi.com/articles"
      />

      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={onContactClick}
          onAboutClick={onAboutClick}
          onReviewsClick={onReviewsClick}
          onLogoClick={onLogoClick}
          onFaqClick={onFaqClick}
          onScpiPageClick={onScpiPageClick}
          onUnderstandingClick={onUnderstandingClick}
          onAboutSectionClick={onAboutSectionClick}
          onComparateurClick={onComparateurClick}
          onSimulateurClick={onSimulateurClick}
          onEducationClick={onEducationClick || ((category, slug) => {
            onArticleClick(slug);
          })}
          onArticlesClick={onArticlesClick || (() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          })}
          currentView="articles-list"
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Articles Éducatifs SCPI
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            30 articles experts pour maîtriser votre investissement en SCPI : comparatifs détaillés,
            optimisation fiscale, stratégies patrimoniales et guides pratiques.
          </p>
        </div>

        {/* Navigation rapide par catégorie */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Accès rapide par catégorie
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explorez nos {articleTemplates.length} articles classés par thématique
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(groupedArticles).map(([category, articles]) => {
                const Icon = getCategoryIcon(category);
                const styles = getCategoryStyles(category);

                return (
                  <button
                    key={category}
                    onClick={() => {
                      const element = document.getElementById(`category-${category}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${styles.borderHoverClass} bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600`}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full ${styles.badgeClass} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${styles.iconClass}`} />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-gray-900 dark:text-white block mb-1">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {articles.length} article{articles.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Articles par catégorie */}
        {Object.entries(groupedArticles).map(([category, articles]) => {
          const Icon = getCategoryIcon(category);
          const styles = getCategoryStyles(category);

          return (
            <div key={category} id={`category-${category}`} className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-8">
                <Icon className={`w-8 h-8 ${styles.iconClass}`} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({articles.length} articles)
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => onArticleClick(article.slug)}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent ${styles.borderHoverClass} group`}
                  >
                    {article.featured && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                          ⭐ Article Pilier
                        </span>
                      </div>
                    )}

                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.metaDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                        {article.mainKeyword}
                      </span>
                      <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin de conseils personnalisés ?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Échangez avec Éric Bellaiche, conseiller en gestion de patrimoine ORIAS
          </p>
          <button
            onClick={onContactClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Prendre rendez-vous
          </button>
        </div>
      </div>

      <LegalFooter
        isDarkMode={isDarkMode}
        onContactClick={onContactClick}
        onAboutClick={onAboutClick}
      />
      </div>
    </>
  );
};

export default EducationArticlesIndexPage;
