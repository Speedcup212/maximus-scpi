import React, { useState } from 'react';
import { Search, Calendar, Clock, TrendingUp, BookOpen, ArrowRight, Filter } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import Footer from './Footer';
import { CookieConsent } from './CookieConsent';
import {
  articles,
  articleCategories,
  getFeaturedArticles,
  getLatestArticles,
  getArticlesByCategory,
  type Article
} from '../data/articlesData';

interface AnalyseActuPageProps {
  onNavigateHome: () => void;
  onNavigateToFaq: () => void;
  onNavigateToAbout: () => void;
  onNavigateToUnderstanding: () => void;
  onContactClick: () => void;
  onSimulateurClick: (simulateurId: string) => void;
  onComparateurClick: () => void;
  onArticleClick: (slug: string) => void;
}

const AnalyseActuPage: React.FC<AnalyseActuPageProps> = ({
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onContactClick,
  onSimulateurClick,
  onComparateurClick,
  onArticleClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = getFeaturedArticles();
  const latestArticles = getLatestArticles(3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryData = (categoryId: string) => {
    return articleCategories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Analyse & Actu SCPI : Guides, Comparatifs et Stratégies 2025"
        description="Tous nos articles sur les SCPI : comparatifs (fonds euros, SCI, locatif), fiscalité (TMI 11-45%), stratégies retraite et revenus complémentaires."
        keywords="SCPI, articles, guides, comparatifs, fiscalité, stratégies, investissement, analyse, actualité"
        canonical="https://www.maximusscpi.com/analyse-actu"
      />

      <Header
        isDarkMode={false}
        toggleTheme={() => {}}
        onContactClick={onContactClick}
        onAboutClick={onNavigateToAbout}
        onEducationClick={() => {}}
        onLogoClick={onNavigateHome}
        onScpiPageClick={() => {}}
        onFaqClick={onNavigateToFaq}
        onUnderstandingClick={onNavigateToUnderstanding}
        onAboutSectionClick={onNavigateToAbout}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              📊 Centre de Connaissances SCPI
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              Analyse & Actualités SCPI
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Guides complets, comparatifs détaillés et stratégies d'optimisation pour investir en SCPI en 2025
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article (ex: fiscalité, fonds euros, retraite...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 text-base focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{articles.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Articles publiés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{articleCategories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comparatifs détaillés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gratuit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filtrer par catégorie</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tous les articles ({articles.length})
            </button>
            {articleCategories.map(category => {
              const count = getArticlesByCategory(category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Articles */}
        {!searchQuery && !selectedCategory && featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              Articles à la Une
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredArticles.map(article => {
                const categoryData = getCategoryData(article.category);
                return (
                  <article
                    key={article.id}
                    className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => onArticleClick(article.slug)}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                        ⭐ À LA UNE
                      </span>
                      {categoryData && (
                        <span className="text-sm text-orange-700 dark:text-orange-400 font-semibold">
                          {categoryData.icon} {categoryData.label}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 transition-all">
                        Lire l'article
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            {searchQuery ? `Résultats de recherche (${filteredArticles.length})` :
             selectedCategory ? `${getCategoryData(selectedCategory)?.label} (${filteredArticles.length})` :
             'Tous les articles'}
          </h2>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Aucun article trouvé pour "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => {
                const categoryData = getCategoryData(article.category);
                return (
                  <article
                    key={article.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => onArticleClick(article.slug)}
                  >
                    {categoryData && (
                      <div className="mb-3">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                          {categoryData.icon} {categoryData.label}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-2 transition-all">
                        Lire
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Besoin de conseils personnalisés ?
            </h2>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              Échangez gratuitement avec un conseiller en gestion de patrimoine spécialisé en SCPI
            </p>
            <button
              onClick={onContactClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6" />
              Prendre rendez-vous (30 min)
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      </div>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default AnalyseActuPage;
