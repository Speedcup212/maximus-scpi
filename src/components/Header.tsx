import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Phone, Info, Star, BookOpen, ChevronDown, Menu, X, TrendingUp, Search, HelpCircle, Calculator, FileText } from 'lucide-react';
import { scpiPages } from '../utils/landingPagesContent';
import Logo from './Logo';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onReviewsClick: () => void;
  onEducationClick?: (category: string, slug: string) => void;
  onArticlesClick?: () => void;
  onLogoClick?: () => void;
  onScpiPageClick?: (slug: string) => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onFaqClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  currentView?: string;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleTheme,
  onContactClick,
  onAboutClick,
  onReviewsClick,
  onEducationClick,
  onArticlesClick,
  onLogoClick,
  onScpiPageClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onFaqClick,
  onComparateurClick,
  onSimulateurClick,
  currentView
}) => {
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isEducationMobileOpen, setIsEducationMobileOpen] = useState(false);
  const [isScpiMenuOpen, setIsScpiMenuOpen] = useState(false);
  const [isSimulateurMenuOpen, setIsSimulateurMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scpiSearch, setScpiSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scpiDropdownRef = useRef<HTMLDivElement>(null);
  const scpiMobileRef = useRef<HTMLDivElement>(null);
  const simulateurDropdownRef = useRef<HTMLDivElement>(null);
  const educationMobileRef = useRef<HTMLDivElement>(null);

  // Fonction pour réinitialiser tous les états du header lors d'une navigation
  const resetAllHeaderStates = () => {
    setIsMobileMenuOpen(false);
    setIsScpiMenuOpen(false);
    setIsSimulateurMenuOpen(false);
    setIsEducationOpen(false);
    setIsEducationMobileOpen(false);
  };

  // Réinitialiser les états du header à chaque changement de vue
  useEffect(() => {
    resetAllHeaderStates();
  }, [currentView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEducationOpen(false);
      }

      // Check if click is inside any SCPI menu (desktop or mobile)
      const isInsideDesktop = scpiDropdownRef.current?.contains(event.target as Node);
      const isInsideMobile = scpiMobileRef.current?.contains(event.target as Node);

      // Close menu only if click is outside both
      if (!isInsideDesktop && !isInsideMobile) {
        setIsScpiMenuOpen(false);
        setScpiSearch('');
      }

      // Close simulateur menu if click is outside
      if (simulateurDropdownRef.current && !simulateurDropdownRef.current.contains(event.target as Node)) {
        setIsSimulateurMenuOpen(false);
      }

      // Close education mobile menu if click is outside
      if (educationMobileRef.current && !educationMobileRef.current.contains(event.target as Node)) {
        setIsEducationMobileOpen(false);
      }
    };

    if (isEducationOpen || isScpiMenuOpen || isSimulateurMenuOpen || isEducationMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEducationOpen, isScpiMenuOpen, isSimulateurMenuOpen, isEducationMobileOpen]);

  const topScpiPages = scpiPages
    .sort((a, b) => {
      const rendA = parseFloat(a.statistics?.find(s => s.label === 'Rendement 2024')?.value || '0');
      const rendB = parseFloat(b.statistics?.find(s => s.label === 'Rendement 2024')?.value || '0');
      return rendB - rendA;
    })
    .slice(0, 5);

  const filteredScpiPages = scpiSearch
    ? scpiPages.filter(page =>
        page.scpiName?.toLowerCase().includes(scpiSearch.toLowerCase())
      )
    : scpiPages;

  const scpisBySector: Record<string, typeof scpiPages> = {
    'Bureaux': scpiPages.filter(p => p.urlFilter?.sector === 'bureaux'),
    'Commerces': scpiPages.filter(p => p.urlFilter?.sector === 'commerces'),
    'Logistique': scpiPages.filter(p => p.urlFilter?.sector === 'logistique'),
    'Santé': scpiPages.filter(p => p.urlFilter?.sector === 'sante'),
    'Résidentiel': scpiPages.filter(p => p.urlFilter?.sector === 'residentiel'),
    'Hôtellerie': scpiPages.filter(p => p.urlFilter?.sector === 'hotellerie'),
    'Européennes': scpiPages.filter(p => p.urlFilter?.geo === 'europe')
  };

  const educationCategories = [
    { id: 'bases', label: 'Bases des SCPI', icon: '📚' },
    { id: 'fiscalite', label: 'Fiscalité', icon: '💰' },
    { id: 'performance', label: 'Performance & Risques', icon: '📈' },
    { id: 'pratique', label: 'Investissement pratique', icon: '🎯' },
    { id: 'comparatif', label: 'Comparatif placements', icon: '⚖️' }
  ];

  const simulateurs = [
    {
      id: 'fonds-euros-scpi',
      label: 'Fonds euros → SCPI',
      description: 'Comparez vos options de réallocation',
      icon: '💶'
    },
    {
      id: 'revenus-nets',
      label: 'Revenus nets après fiscalité',
      description: 'Calculez vos revenus nets SCPI',
      icon: '💰'
    },
    {
      id: 'credit',
      label: 'SCPI à crédit',
      description: 'Effet de levier & cash-flow',
      icon: '🏦'
    },
    {
      id: 'demembrement',
      label: 'Démembrement SCPI',
      description: 'Nue-propriété vs Usufruit',
      icon: '⚖️'
    },
    {
      id: 'comparateur-demembrement',
      label: 'Comparateur Démembrement',
      description: 'PP vs Nue-propriété vs Usufruit',
      icon: '🔄'
    },
    {
      id: 'enveloppes',
      label: 'Comparateur d\'enveloppes',
      description: 'Direct, Assurance-vie ou SCI IS',
      icon: '📊'
    },
    // Futurs simulateurs à ajouter
    // {
    //   id: 'diversification',
    //   label: 'Diversification de portefeuille',
    //   description: 'Optimisez votre diversification',
    //   icon: '🎯'
    // },
    // {
    //   id: 'rendement',
    //   label: 'Projection de rendement',
    //   description: 'Estimez vos revenus futurs',
    //   icon: '📈'
    // }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[9999] backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <button
              onClick={() => {
                resetAllHeaderStates();
                if (onLogoClick) onLogoClick();
              }}
              className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-transform hover:scale-105 group py-2 cursor-pointer"
              aria-label="Retour à l'accueil"
            >
              <Logo
                variant="full"
                isDarkMode={isDarkMode}
                iconVariant="gladiator"
                className="w-auto h-12 transition-all duration-300 group-hover:brightness-110 cursor-pointer"
              />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 lg:space-x-4 min-w-0 flex-shrink-0">
            {/* SCPI Dropdown - Desktop */}
            <div className="relative" ref={scpiDropdownRef}>
              <button
                onClick={() => {
                  setIsScpiMenuOpen(!isScpiMenuOpen);
                  setIsEducationOpen(false);
                }}
                className="hidden lg:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
                aria-label="Nos SCPI"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Nos SCPI</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isScpiMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isScpiMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-2rem)] max-w-[32rem] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[110] max-h-[36rem] overflow-hidden flex flex-col">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une SCPI (ex: Activimmo, Pierre 1)..."
                        value={scpiSearch}
                        onChange={(e) => setScpiSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {scpiSearch ? (
                      filteredScpiPages.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {filteredScpiPages.length} résultat{filteredScpiPages.length > 1 ? 's' : ''}
                          </div>
                          {filteredScpiPages.map((page) => (
                            <button
                              key={page.slug}
                              onClick={() => {
                                resetAllHeaderStates();
                                setScpiSearch('');
                                if (onScpiPageClick) {
                                  onScpiPageClick(page.slug);
                                }
                              }}
                              className="block w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" translate="no">
                                {page.scpiName}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-3">
                                <span className="font-semibold text-green-600 dark:text-green-400">{page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}</span>
                                <span>•</span>
                                <span>{page.statistics?.find(s => s.label === 'Capitalisation')?.value || 'N/A'}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-12 text-center">
                          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune SCPI trouvée pour "{scpiSearch}"
                          </p>
                        </div>
                      )
                    ) : (
                      <>
                        {/* Top 5 Rendements */}
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 sticky top-0 flex items-center gap-2">
                            <span>⭐</span> Top 5 Rendements 2024
                          </div>
                          {topScpiPages.map((page, index) => (
                            <button
                              key={page.slug}
                              onClick={() => {
                                resetAllHeaderStates();
                                if (onScpiPageClick) {
                                  onScpiPageClick(page.slug);
                                }
                              }}
                              className="block w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-green-600 dark:text-green-400 w-6">#{index + 1}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" translate="no">
                                    {page.scpiName}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-3">
                                    <span className="font-bold text-green-600 dark:text-green-400">{page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{page.statistics?.find(s => s.label === 'Capitalisation')?.value || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        {/* Par Secteur */}
                        <div className="py-2 border-t-2 border-gray-200 dark:border-gray-700">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                            Par Secteur
                          </div>
                          {Object.entries(scpisBySector).map(([sector, pages]) => (
                            pages.length > 0 && (
                              <details key={sector} className="group/sector" open>
                                <summary className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors list-none flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    {sector}
                                    <span className="text-xs text-gray-500 dark:text-gray-500">({pages.length})</span>
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform" />
                                </summary>
                                <div className="bg-gray-50 dark:bg-gray-900 max-h-64 overflow-y-auto">
                                  {pages.map((page) => (
                                    <button
                                      key={page.slug}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetAllHeaderStates();
                                        if (onScpiPageClick) {
                                          onScpiPageClick(page.slug);
                                        }
                                      }}
                                      className="block w-full px-6 py-2.5 text-left hover:bg-green-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                                    >
                                      <div className="font-medium text-gray-900 dark:text-gray-100 text-xs group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" translate="no">
                                        {page.scpiName}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                        {page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </details>
                            )
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {scpiPages.length} SCPI disponibles
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulateur Dropdown - Desktop */}
            <div className="relative pointer-events-auto" ref={simulateurDropdownRef}>
              <button
                onClick={() => {
                  setIsSimulateurMenuOpen(!isSimulateurMenuOpen);
                  setIsScpiMenuOpen(false);
                  setIsEducationOpen(false);
                }}
                className="hidden md:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
                aria-label="Simulateurs"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden lg:inline">Nos simulateurs</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSimulateurMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSimulateurMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[110] overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nos simulateurs
                    </div>
                  </div>

                  <div className="py-2">
                    {simulateurs.map((simulateur) => (
                      <button
                        key={simulateur.id}
                        onClick={(e) => {
                          e.preventDefault();
                          resetAllHeaderStates();
                          if (onSimulateurClick) {
                            onSimulateurClick(simulateur.id);
                          }
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          resetAllHeaderStates();
                          if (onSimulateurClick) {
                            onSimulateurClick(simulateur.id);
                          }
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 active:bg-green-100 dark:active:bg-green-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{simulateur.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {simulateur.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {simulateur.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      D'autres simulateurs arrivent bientôt
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Articles/Analyses & Actualités */}
            <button
              onClick={() => {
                resetAllHeaderStates();
                if (onArticlesClick) {
                  onArticlesClick();
                }
              }}
              className="hidden lg:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
              aria-label="Analyses & Actualités"
            >
              <FileText className="w-4 h-4" />
              <span>Analyses & Actualités</span>
            </button>

            {/* Comprendre les SCPI */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsEducationOpen(!isEducationOpen);
                  setIsScpiMenuOpen(false);
                  setIsSimulateurMenuOpen(false);
                }}
                className="hidden lg:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
                aria-label="Comprendre les SCPI"
              >
                <BookOpen className="w-4 h-4" />
                <span>Comprendre les SCPI</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isEducationOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEducationOpen && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[110]">
                  {educationCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        resetAllHeaderStates();
                        if (onEducationClick) {
                          onEducationClick(category.id, 'overview');
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onReviewsClick}
              className="hidden md:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
              aria-label="Consulter les avis clients"
            >
              <Star className="w-4 h-4" />
              <span className="hidden md:inline">Avis</span>
            </button>

            <button
              onClick={() => {
                resetAllHeaderStates();
                if (onFaqClick) {
                  onFaqClick();
                }
              }}
              className="hidden md:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
              aria-label="Foire aux questions"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">FAQ</span>
            </button>

            <button
              onClick={() => {
                resetAllHeaderStates();
                if (onAboutClick) onAboutClick();
              }}
              className="hidden md:flex px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm sm:text-base"
              aria-label="Qui sommes-nous"
            >
              <Info className="w-4 h-4" />
              <span className="hidden lg:inline">Qui sommes-nous</span>
            </button>

            <button
              onClick={onContactClick}
              className="px-2 sm:px-3 lg:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base flex-shrink-0"
              aria-label="Prendre rendez-vous avec un expert SCPI"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Prendre RDV</span>
              <span className="sm:hidden">RDV</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 shadow-lg relative z-[9998] max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-2">
              {/* SCPI Section Mobile */}
              <div className="px-4" ref={scpiMobileRef}>
                <button
                  onClick={() => {
                    setIsScpiMenuOpen(!isScpiMenuOpen);
                    if (isScpiMenuOpen) {
                      setScpiSearch('');
                    }
                  }}
                  className="w-full flex items-center justify-between py-2 text-gray-700 dark:text-gray-200 font-medium touch-manipulation"
                  aria-expanded={isScpiMenuOpen}
                  aria-label="Menu des SCPI"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Nos SCPI ({scpiPages.length})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isScpiMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isScpiMenuOpen && (
                  <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Rechercher une SCPI..."
                          value={scpiSearch}
                          onChange={(e) => setScpiSearch(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-shadow"
                          aria-label="Rechercher une SCPI"
                        />
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto overscroll-contain webkit-overflow-scrolling-touch">
                      <div className="p-3 space-y-3">
                        {scpiSearch ? (
                          filteredScpiPages.length > 0 ? (
                            <div className="space-y-1">
                              {filteredScpiPages.map((page) => (
                                <button
                                  key={page.slug}
                                  onClick={() => {
                                    resetAllHeaderStates();
                                    setScpiSearch('');
                                    if (onScpiPageClick) {
                                      onScpiPageClick(page.slug);
                                    }
                                  }}
                                  className="block w-full text-left py-2.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                >
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100" translate="no">
                                    {page.scpiName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                              Aucune SCPI trouvée pour "{scpiSearch}"
                            </div>
                          )
                        ) : (
                          <>
                            {/* Top 5 Mobile */}
                            <div>
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                ⭐ Top 5 Rendements 2024
                              </div>
                              <div className="mt-2 space-y-1">
                                {topScpiPages.map((page, index) => (
                                  <button
                                    key={page.slug}
                                    onClick={() => {
                                      resetAllHeaderStates();
                                      setScpiSearch('');
                                      if (onScpiPageClick) {
                                        onScpiPageClick(page.slug);
                                      }
                                    }}
                                    className="block w-full text-left py-2.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-green-600 dark:text-green-400 min-w-[1.5rem]">#{index + 1}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" translate="no">
                                          {page.scpiName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Par Secteur Mobile */}
                            <div>
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                                Par Secteur
                              </div>
                              <div className="space-y-1 mt-2">
                                {Object.entries(scpisBySector).map(([sector, pages]) => (
                                  pages.length > 0 && (
                                    <details key={sector} className="group/sector" open>
                                      <summary className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 list-none flex items-center justify-between active:scale-[0.98] touch-manipulation">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {sector} <span className="text-xs text-gray-500">({pages.length})</span>
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform duration-200 flex-shrink-0" />
                                      </summary>
                                      <div className="mt-1 ml-3 space-y-1 pb-1">
                                        {pages.map((page) => (
                                          <button
                                            key={page.slug}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              resetAllHeaderStates();
                                              setScpiSearch('');
                                              if (onScpiPageClick) {
                                                onScpiPageClick(page.slug);
                                              }
                                            }}
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                          >
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" translate="no">
                                              {page.scpiName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                              {page.statistics?.find(s => s.label === 'Rendement 2024')?.value || 'N/A'}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </details>
                                  )
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulateurs Section Mobile */}
              <div className="px-4">
                <button
                  onClick={() => setIsSimulateurMenuOpen(!isSimulateurMenuOpen)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setIsSimulateurMenuOpen(!isSimulateurMenuOpen);
                  }}
                  className="w-full flex items-center justify-between py-3 text-gray-700 dark:text-gray-200 font-medium touch-manipulation active:bg-gray-100 dark:active:bg-gray-800 rounded-lg transition-colors"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5" />
                    <span className="text-base">Nos simulateurs</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isSimulateurMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSimulateurMenuOpen && (
                  <div className="mt-2 space-y-1 pl-2">
                    {simulateurs.map((simulateur) => (
                      <button
                        key={simulateur.id}
                        onClick={(e) => {
                          e.preventDefault();
                          resetAllHeaderStates();
                          if (onSimulateurClick) {
                            onSimulateurClick(simulateur.id);
                          }
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          resetAllHeaderStates();
                          if (onSimulateurClick) {
                            onSimulateurClick(simulateur.id);
                          }
                        }}
                        className="w-full text-left py-3 px-3 active:bg-green-100 dark:active:bg-green-900/30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{simulateur.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {simulateur.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {simulateur.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analyses & Actualités */}
              <button
                onClick={() => {
                  resetAllHeaderStates();
                  if (onArticlesClick) {
                    onArticlesClick();
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Analyses & Actualités</span>
              </button>

              {/* Comprendre les SCPI */}
              <div className="px-4" ref={educationMobileRef}>
                <button
                  onClick={() => {
                    setIsEducationMobileOpen(!isEducationMobileOpen);
                  }}
                  className="w-full flex items-center justify-between py-2 text-gray-700 dark:text-gray-200 font-medium touch-manipulation"
                  aria-expanded={isEducationMobileOpen}
                  aria-label="Articles éducatifs SCPI"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Comprendre les SCPI</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isEducationMobileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isEducationMobileOpen && (
                  <div className="mt-2 ml-6 space-y-2 border-l-2 border-blue-500 dark:border-blue-400 pl-4">
                    {educationCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          resetAllHeaderStates();
                          if (onEducationClick) {
                            onEducationClick(category.id, 'overview');
                          }
                        }}
                        className="w-full flex items-center gap-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  resetAllHeaderStates();
                  onReviewsClick();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <Star className="w-4 h-4" />
                <span>Avis</span>
              </button>

              <button
                onClick={() => {
                  resetAllHeaderStates();
                  if (onFaqClick) {
                    onFaqClick();
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                <span>FAQ</span>
              </button>

              <button
                onClick={() => {
                  resetAllHeaderStates();
                  onAboutClick();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <Info className="w-4 h-4" />
                <span>Qui sommes-nous</span>
              </button>

              <button
                onClick={() => {
                  resetAllHeaderStates();
                  onContactClick();
                }}
                className="mx-4 mt-2 w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Prendre RDV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
