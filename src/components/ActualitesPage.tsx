import React from 'react';
import { Newspaper, BookOpen } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';

interface ActualitesPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onLogoClick?: () => void;
  onFaqClick?: () => void;
  onScpiPageClick?: (slug: string) => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  onArticlesClick?: () => void;
  onActualitesClick?: () => void;
  onEducationClick?: (category: string, slug: string) => void;
}

const ActualitesPage: React.FC<ActualitesPageProps> = ({
  isDarkMode,
  toggleTheme,
  onContactClick,
  onAboutClick,
  onLogoClick,
  onFaqClick,
  onScpiPageClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onComparateurClick,
  onSimulateurClick,
  onArticlesClick,
  onActualitesClick,
  onEducationClick
}) => {
  return (
    <>
      <SEOHead
        title="Actualités SCPI | MaximusSCPI"
        description="Actualités SCPI : marché, collecte, fiscalité, réglementation et évolutions des prix de parts. Restez informé des dernières tendances."
        keywords={['actualités SCPI', 'marché SCPI', 'collecte SCPI', 'prix de parts SCPI']}
        canonical="https://maximusscpi.com/actualites/"
      />

      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={onContactClick}
          onAboutClick={onAboutClick}
          onLogoClick={onLogoClick}
          onFaqClick={onFaqClick}
          onScpiPageClick={onScpiPageClick}
          onUnderstandingClick={onUnderstandingClick}
          onAboutSectionClick={onAboutSectionClick}
          onComparateurClick={onComparateurClick}
          onSimulateurClick={onSimulateurClick}
          onArticlesClick={onArticlesClick}
          onActualitesClick={onActualitesClick}
          onEducationClick={onEducationClick || ((category, slug) => {})}
          currentView="actualites"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Newspaper className="w-24 h-24 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Actualités SCPI
            </h1>
            <div className="max-w-2xl mx-auto mb-12">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Les actualités SCPI seront publiées prochainement&nbsp;: marché, collecte, fiscalité, réglementation et évolutions des prix de parts.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl p-8 border border-blue-100 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-4 justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  En attendant, explorez nos guides
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Découvrez dès maintenant notre bibliothèque pédagogique complète pour tout comprendre sur les SCPI.
              </p>
              <a
                href="/articles/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Comprendre les SCPI
              </a>
            </div>
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

export default ActualitesPage;
