import React, { useEffect, lazy, Suspense } from 'react';
import { ArrowLeft, TrendingUp, Shield, Users, CheckCircle, BarChart3, Target, Calendar, Star, Award } from 'lucide-react';
import Header from './Header';
import Logo from './Logo';
import SEOHead from './SEOHead';
import ScpiTable from './ScpiTable';
import QuickFilters from './QuickFilters';
import AdvancedFilters from './AdvancedFilters';
import ScpiDetailPage from './ScpiDetailPage';
import DisclaimerBox from './DisclaimerBox';
import { LandingPageContent } from '../utils/landingPagesContent';
import { useScpiFilters } from '../hooks/useScpiFilters';
import { usePortfolio } from '../hooks/usePortfolio';
import { scpiData } from '../data/scpiData';
import { Scpi } from '../types/scpi';

const RdvModal = lazy(() => import('./RdvModal'));
const AnalysisModal = lazy(() => import('./AnalysisModal'));
const PortfolioWidget = lazy(() => import('./PortfolioWidget'));
const PortfolioResultsModal = lazy(() => import('./PortfolioResultsModal'));
const FintechComparator = lazy(() => import('./fintech/FintechComparator'));

interface LandingPageProps {
  content: LandingPageContent;
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onAboutClick: () => void;
  onEducationClick: (categoryId: string) => void;
  onScpiPageClick?: (slug: string) => void;
  onContactClick?: () => void;
  onFaqClick?: () => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onArticlesClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  content,
  onBack,
  isDarkMode,
  toggleTheme,
  onAboutClick,
  onEducationClick,
  onScpiPageClick,
  onContactClick,
  onFaqClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onArticlesClick,
  onComparateurClick,
  onSimulateurClick
}) => {
  const [isRdvModalOpen, setIsRdvModalOpen] = React.useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);
  const [isPortfolioResultsOpen, setIsPortfolioResultsOpen] = React.useState(false);
  const [selectedScpiForAnalysis, setSelectedScpiForAnalysis] = React.useState<Scpi | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log('LandingPage rendered with content:', content.slug);
    console.log('Total SCPI loaded:', scpiData.length);
  }, [content]);

  const { filteredScpi, activeQuickFilter, setQuickFilter, filters, updateFilter } = useScpiFilters(scpiData);
  const { selectedScpi, investmentAmount, setInvestmentAmount, toggleScpiSelection, removeScpi } = usePortfolio();

  // SCPI à afficher dans le détail (pour les pages individuelles)
  const detailScpi = React.useMemo(() => {
    if (content.urlFilter.scpi) {
      return filteredScpi.find(scpi => scpi.name === content.urlFilter.scpi);
    }
    return null;
  }, [filteredScpi, content.urlFilter.scpi]);

  // Filtrer les SCPI pour le comparateur
  const displayScpi = React.useMemo(() => {
    // Si un filtre rapide est actif (autre que 'tous'), utiliser directement filteredScpi
    if (activeQuickFilter !== 'tous') {
      return filteredScpi;
    }

    // Pour le comparateur, toujours afficher TOUTES les SCPI, peu importe le secteur ou la géographie de la page
    // On utilise directement filteredScpi qui contient toutes les SCPI après application des filtres avancés
    return filteredScpi;
  }, [filteredScpi, activeQuickFilter]);

  useEffect(() => {
    setCurrentPage(1);
    console.log('Filtered SCPI count:', filteredScpi.length);
    console.log('Display SCPI count:', displayScpi.length);
    console.log('Active quick filter:', activeQuickFilter);
    console.log('Advanced filters:', filters);
  }, [displayScpi.length, filteredScpi.length, activeQuickFilter, filters]);

  const totalPages = Math.ceil(displayScpi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScpi = displayScpi.slice(startIndex, endIndex);

  const handleScpiAnalysis = (scpi: Scpi) => {
    setSelectedScpiForAnalysis(scpi);
    setIsAnalysisModalOpen(true);
  };

  // Ajout des données structurées pour le SEO
  useEffect(() => {
    if (content.type === 'scpi' && content.scpiName) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'scpi-structured-data';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": `SCPI ${content.scpiName}`,
        "description": content.metaDescription,
        "url": `https://www.maximusscpi.com/${content.slug}`,
        "feesAndCommissionsSpecification": content.introduction,
        "provider": {
          "@type": "Organization",
          "name": "MaximusSCPI",
          "url": "https://www.maximusscpi.com"
        },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "url": `https://www.maximusscpi.com/${content.slug}`
        }
      });
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById('scpi-structured-data');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [content]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title={content.title}
        description={content.metaDescription}
        keywords={[content.slug, content.type === 'sector' ? `scpi ${content.urlFilter.sector}` : content.type === 'geography' ? `scpi ${content.urlFilter.geo}` : content.scpiName || 'scpi', 'investissement SCPI', 'rendement SCPI 2025', 'meilleure SCPI', 'comparateur SCPI']}
        canonical={`https://maximusscpi.com/${content.slug}`}
      />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={onContactClick || (() => setIsRdvModalOpen(true))}
        onAboutClick={onAboutClick}
        onEducationClick={onEducationClick}
        onLogoClick={onBack}
        onScpiPageClick={onScpiPageClick}
        onFaqClick={onFaqClick}
        onUnderstandingClick={onUnderstandingClick}
        onAboutSectionClick={onAboutSectionClick || onAboutClick}
        onArticlesClick={onArticlesClick}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
        currentView="landing"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" role="main">
        {/* Navigation retour */}
        <nav aria-label="Navigation de retour">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-semibold transition-colors"
            aria-label="Retour à la page d'accueil"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </nav>

        {/* Section Hero - En-tête principal */}
        <section aria-labelledby="page-title" className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white rounded-2xl p-8 sm:p-12 lg:pr-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 max-w-4xl">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {content.type === 'sector' ? '🏢 Secteur' : content.type === 'scpi' ? '📊 SCPI' : '🌍 Géographie'}
                </div>

                {content.rating && content.rating >= 4 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-sm rounded-full shadow-lg">
                    {[...Array(content.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-white text-white" />
                    ))}
                  </div>
                )}

                {content.isRecommended && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-full text-sm font-bold">
                    <Award className="w-4 h-4" />
                    Recommandé par MaximusSCPI
                  </div>
                )}
              </div>

              <h1 id="page-title" className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4">
                {content.h1}
              </h1>

              <p className="text-xl sm:text-2xl text-blue-100 mb-8 font-medium">
                {content.subtitle}
              </p>

              {content.statistics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  {content.statistics.map((stat, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 break-words">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-200">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsRdvModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Obtenir un conseil personnalisé
              </button>
            </div>
          </div>
        </section>

        {/* Section Introduction - Pourquoi investir - Pleine largeur */}
        {!content.urlFilter.scpi && (
          <section aria-labelledby="why-invest-title" className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-600 mb-8">
            <h2 id="why-invest-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Target className="w-7 h-7 text-blue-600" aria-hidden="true" />
              Pourquoi investir ?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {content.introduction}
            </p>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Avantages clés
            </h3>
            <ul className="space-y-3 mb-6">
              {content.advantages.map((advantage, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{advantage}</span>
                </li>
              ))}
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Profil investisseur idéal
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                {content.targetProfile}
              </p>
            </div>

            {/* Blocs Avertissement et Expertise pour pages secteurs/géographie */}
            {(() => {
              const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
                ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
              
              if (isSecteurOuGeographie) {
                return (
                  <>
                    {/* Section Avertissement */}
                    <div className="mt-6">
                      <DisclaimerBox />
                    </div>

                    {/* Section Contact Expert */}
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        Expertise MaximusSCPI
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        15 ans d'expérience en conseil patrimonial et analyses approfondies pour vous guider.
                      </p>
                      <button
                        onClick={() => setIsRdvModalOpen(true)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Être rappelé par un expert
                      </button>
                    </div>
                  </>
                );
              }
              return null;
            })()}
          </section>
        )}

        {/* Section Contenu Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Colonne principale - Contenu */}
          <article className="lg:col-span-2" role="article">
            {/* Section SCPI individuelle */}
            {detailScpi && (
              <section aria-labelledby="scpi-detail-title" className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-600 mb-8">
                <ScpiDetailPage
                  scpi={detailScpi}
                  onAddToPortfolio={toggleScpiSelection}
                  onTakeAppointment={() => setIsRdvModalOpen(true)}
                />
              </section>
            )}

            {/* Section Comparateur - ScpiTable pour les pages non secteurs/géographie */}
            {(() => {
              // Détecter si c'est une page secteur ou géographie
              const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
                ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
              
              // Ne pas afficher ScpiTable pour les pages secteurs/géographie (le comparateur sera affiché après la grille)
              if (isSecteurOuGeographie) {
                return null;
              }
              
              // Utiliser ScpiTable pour les autres pages
              return (
                <section aria-labelledby="comparator-title" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 id="comparator-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {content.urlFilter.scpi ? 'Comparer avec d\'autres SCPI' : 'SCPI Disponibles'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {scpiData.length} SCPI disponibles • {filteredScpi.length} correspondent à vos critères
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <QuickFilters
                      activeFilter={activeQuickFilter}
                      onFilterChange={setQuickFilter}
                    />

                    <AdvancedFilters
                      filters={filters}
                      onFilterChange={updateFilter}
                    />
                  </div>

                  <ScpiTable
                    scpiList={paginatedScpi}
                    selectedScpi={selectedScpi}
                    onScpiToggle={toggleScpiSelection}
                    onAnalyzeClick={handleScpiAnalysis}
                    onRdvClick={() => setIsRdvModalOpen(true)}
                  />

                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, displayScpi.length)} sur {displayScpi.length} SCPI
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Précédent
                        </button>
                        <div className="text-gray-700 dark:text-gray-200 font-semibold">
                          {currentPage} / {totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })()}
          </article>

          {/* Colonne latérale - Widgets et informations complémentaires */}
          <aside className="lg:col-span-1" role="complementary" aria-label="Informations complémentaires">
            <div className="sticky top-24 space-y-6">
              {/* PortfolioWidget masqué pour les pages secteurs/géographie car FintechComparator a déjà SelectionSidebar */}
              {(() => {
                const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
                  ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
                
                if (!isSecteurOuGeographie) {
                  return (
                    <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse"><div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                      <PortfolioWidget
                        selectedScpi={selectedScpi}
                        investmentAmount={investmentAmount}
                        onInvestmentChange={setInvestmentAmount}
                        onRemoveScpi={removeScpi}
                        onExportClick={() => setIsPortfolioResultsOpen(true)}
                      />
                    </Suspense>
                  );
                }
                return null;
              })()}

              {/* Section Avertissement - Affiché uniquement pour les pages non secteurs/géographie */}
              {(() => {
                const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
                  ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
                
                if (!isSecteurOuGeographie) {
                  return (
                    <section aria-label="Avertissement légal">
                      <DisclaimerBox />
                    </section>
                  );
                }
                return null;
              })()}

              {/* Section Contact Expert - Affichée uniquement pour les pages non secteurs/géographie */}
              {(() => {
                const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
                  ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
                
                if (!isSecteurOuGeographie) {
                  return (
                    <section aria-labelledby="expert-section-title" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                      <h3 id="expert-section-title" className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        Expertise MaximusSCPI
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        15 ans d'expérience en conseil patrimonial et analyses approfondies pour vous guider.
                      </p>
                      <button
                        onClick={() => setIsRdvModalOpen(true)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Être rappelé par un expert
                      </button>
                    </section>
                  );
                }
                return null;
              })()}
            </div>
          </aside>
        </div>

        {/* Section Comparateur Fintech pour pages secteurs et géographie */}
        {(() => {
          const isSecteurOuGeographie = content.type === 'sector' || content.type === 'geography' || 
            ['scpi-bureaux', 'scpi-commerces', 'scpi-sante', 'scpi-logistique', 'scpi-residentiel', 'scpi-hotellerie', 'scpi-france', 'scpi-europe'].includes(content.slug);
          
          if (isSecteurOuGeographie) {
            return (
              <section id="comparator" data-comparator aria-labelledby="comparator-section-title" className="mt-12">
                <h2 id="comparator-section-title" className="sr-only">Comparateur de SCPI</h2>
                <Suspense fallback={<div className="h-64 bg-slate-800 rounded-lg animate-pulse"></div>}>
                  <FintechComparator onCloseAnalysis={onBack} />
                </Suspense>
              </section>
            );
          }
          return null;
        })()}
      </main>

      {/* Footer avec mentions légales */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-xl px-8 py-6 inline-flex">
              <Logo className="h-20 w-auto" isDarkMode={true} iconVariant="gladiator" />
            </div>
          </div>

          {/* Grille de blocs d'informations */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            {/* Bloc 1 : À propos */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                MaximusSCPI<span className="text-xs align-super">™</span>
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                Votre expert en investissement SCPI
              </p>
              <p className="text-xs text-gray-400">
                Marque déposée INPI
              </p>
            </div>

            {/* Bloc 2 : Conseiller */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                Conseiller en Investissements Financiers
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                <strong>Eric Bellaiche</strong>
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>ORIAS N° <strong>13001580</strong></p>
                <p>CNCEF Patrimoine N° <strong>D016571</strong></p>
                <p>Sous le contrôle de l'ACPR</p>
              </div>
            </div>

            {/* Bloc 3 : Risques */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">
                ⚠️ Risques
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                L'investissement en SCPI présente des risques de perte en capital et de liquidité.
                Les performances passées ne préjugent pas des performances futures.
                Le rendement n'est pas garanti et peut varier.
              </p>
            </div>

            {/* Bloc 4 : Durée et Frais */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                Durée et Frais
              </h3>
              <div className="text-xs text-gray-300 space-y-2">
                <p>
                  <strong>Durée recommandée :</strong> 8 à 10 ans minimum
                </p>
                <p>
                  <strong>Frais de souscription :</strong> 8% à 12% HT
                </p>
                <p>
                  <strong>Frais de gestion :</strong> 10% à 12% HT sur les loyers
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              Les informations présentées sur cette page sont fournies à titre indicatif et ne constituent pas un conseil en investissement personnalisé.
              Tout investissement doit faire l'objet d'une analyse approfondie de votre situation personnelle.
              Consultez la note d'information complète de chaque SCPI avant tout investissement.
            </p>
          </div>

          {/* Liens légaux et Copyright */}
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
              <a href="/mentions-legales" className="hover:text-blue-400 transition-colors">
                Mentions légales
              </a>
              <a href="/politique-confidentialite" className="hover:text-blue-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="/conditions-utilisation" className="hover:text-blue-400 transition-colors">
                Conditions d'utilisation
              </a>
              <a href="/reclamation" className="hover:text-blue-400 transition-colors">
                Réclamation
              </a>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MaximusSCPI. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        {isRdvModalOpen && (
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
            selectedScpi={selectedScpi}
          />
        )}

        {isAnalysisModalOpen && selectedScpiForAnalysis && (
          <AnalysisModal
            scpi={selectedScpiForAnalysis}
            isOpen={isAnalysisModalOpen}
            onClose={() => {
              setIsAnalysisModalOpen(false);
              setSelectedScpiForAnalysis(null);
            }}
            onAddToPortfolio={toggleScpiSelection}
          />
        )}

        {isPortfolioResultsOpen && selectedScpi.length > 0 && (
          <PortfolioResultsModal
            isOpen={isPortfolioResultsOpen}
            onClose={() => setIsPortfolioResultsOpen(false)}
            selectedScpi={selectedScpi}
            investmentAmount={investmentAmount}
            clientProfile={null}
            onExportPDF={() => {}}
            onScheduleCall={() => {
              setIsPortfolioResultsOpen(false);
              setIsRdvModalOpen(true);
            }}
            onOpenSimulator={() => {
              setIsPortfolioResultsOpen(false);
              setIsRdvModalOpen(true);
            }}
            onLogoClick={() => {
              setIsPortfolioResultsOpen(false);
              onBack();
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default LandingPage;
