import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Info, BookOpen, ChevronDown, Menu, X, TrendingUp, Search, HelpCircle, Calculator, FileText, ArrowRight, MapPin, User, BarChart2 } from 'lucide-react';
import { scpiDataExtended } from '../data/scpiDataExtended';
import { scpiData } from '../data/scpiData';
import { getDominantSector, groupScpisByDominantSector, SECTOR_DISPLAY_ORDER } from '../utils/dominantSector';
import { getDominantGeography, groupScpisByDominantGeography, GEOGRAPHY_DISPLAY_ORDER } from '../utils/dominantGeography';
import { createSlugFromName, findScpiSlug } from '../utils/scpiSlugMapper';
import { normalizeString } from '../utils/formatters';
import { enrichScpiExtendedArray } from '../utils/enrichScpiExtended';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onEducationClick?: (category: string, slug: string) => void;
  onArticlesClick?: () => void;
  onActualitesClick?: () => void;
  onLogoClick?: () => void;
  onScpiPageClick?: (slug: string) => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onFaqClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  onAboutNavigation?: (path: string) => void;
  onPrivateSpaceClick?: () => void;
  onProClick?: () => void;
  currentView?: string;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleTheme,
  onContactClick,
  onAboutClick,
  onEducationClick,
  onArticlesClick,
  onActualitesClick,
  onLogoClick,
  onScpiPageClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onFaqClick,
  onComparateurClick,
  onSimulateurClick,
  onAboutNavigation,
  onPrivateSpaceClick,
  onProClick,
  currentView
}) => {
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isEducationMobileOpen, setIsEducationMobileOpen] = useState(false);
  const [isScpiMenuOpen, setIsScpiMenuOpen] = useState(false);
  const [isSimulateurMenuOpen, setIsSimulateurMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [isAboutMobileOpen, setIsAboutMobileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [scpiSearch, setScpiSearch] = useState('');
  const { user, signOut } = useAuth();

  const handlePrivateSpaceNavigation = () => {
    if (onPrivateSpaceClick) {
      onPrivateSpaceClick();
    } else {
      window.location.href = '/app';
    }
  };
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scpiDropdownRef = useRef<HTMLDivElement>(null);
  const scpiMobileRef = useRef<HTMLDivElement>(null);
  const simulateurDropdownRef = useRef<HTMLDivElement>(null);
  const educationMobileRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const aboutMobileRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Fonction pour réinitialiser tous les états du header lors d'une navigation
  const resetAllHeaderStates = () => {
    setIsMobileMenuOpen(false);
    setIsScpiMenuOpen(false);
    setIsSimulateurMenuOpen(false);
    setIsEducationOpen(false);
    setIsEducationMobileOpen(false);
    setIsAboutMenuOpen(false);
    setIsAboutMobileOpen(false);
    setIsAccountMenuOpen(false);
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

      // Close about menu if click is outside
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setIsAboutMenuOpen(false);
      }

      // Close about mobile menu if click is outside
      if (aboutMobileRef.current && !aboutMobileRef.current.contains(event.target as Node)) {
        setIsAboutMobileOpen(false);
      }

      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isEducationOpen || isScpiMenuOpen || isSimulateurMenuOpen || isEducationMobileOpen || isAboutMenuOpen || isAboutMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEducationOpen, isScpiMenuOpen, isSimulateurMenuOpen, isEducationMobileOpen]);

  const scpiMenuItems = useMemo(() => {
    const enriched = enrichScpiExtendedArray(scpiDataExtended, scpiData);
    return enriched.map(scpi => {
      const landingSlug = findScpiSlug(scpi.name);
      // URL canonique sans préfixe (alignée sur les pages statiques + sitemap + canonical).
      // Évite la duplication /wemo-one ↔ /scpi-wemo-one.
      const slug = landingSlug ?? createSlugFromName(scpi.name);
      return {
        scpi,
        slug,
        scpiName: scpi.name,
        dominantSector: getDominantSector(scpi),
        dominantGeography: getDominantGeography(scpi)
      };
    });
  }, []);

  // Top 5 SCPI par rendement (indicateur isolé)
  const topScpis = useMemo(() => {
    return [...scpiMenuItems]
      .sort((a, b) => b.scpi.yield - a.scpi.yield)
      .slice(0, 5);
  }, [scpiMenuItems]);

  const filteredScpis = scpiSearch
    ? scpiMenuItems.filter(item =>
        normalizeString(item.scpiName).includes(normalizeString(scpiSearch))
      )
    : scpiMenuItems;

  const formatYield = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return 'N/A';
    }
    return `${value.toFixed(2)}%`;
  };

  // Grouper les SCPI par secteur dominant
  const scpisByDominantSector = useMemo(() => {
    return groupScpisByDominantSector(
      scpiMenuItems.map(item => ({
        scpi: item.scpi,
        slug: item.slug,
        scpiName: item.scpiName
      }))
    );
  }, [scpiMenuItems]);

  // Grouper les SCPI par géographie dominante
  const scpisByDominantGeography = useMemo(() => {
    return groupScpisByDominantGeography(
      scpiMenuItems.map(item => ({
        scpi: item.scpi,
        slug: item.slug,
        scpiName: item.scpiName
      }))
    );
  }, [scpiMenuItems]);


  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[9999] backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        <div className="flex items-center justify-between h-16 flex-nowrap">
          {/* Logo */}
          <div className="flex items-center shrink-0 max-w-[140px] lg:max-w-[180px] mr-4 lg:mr-6">
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
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-4 xl:gap-6 mx-auto hidden lg:flex" aria-label="Navigation principale">
            <ul className="flex items-center gap-2 lg:gap-3 text-sm font-medium list-none p-0 m-0 whitespace-nowrap">
            <li>
            <a
              href="/comparateur-scpi/"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                resetAllHeaderStates();
                if (onComparateurClick) onComparateurClick();
              }}
              className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
              aria-label="Comparateur"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Comparateur</span>
            </a>
            </li>
            <li>
              <a
                href="/simulateurs/"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  resetAllHeaderStates();
                  if (onSimulateurClick) {
                    onSimulateurClick('simulateurs');
                  }
                }}
                className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                aria-label="Simulateurs"
              >
                <Calculator className="w-4 h-4" />
                <span>Simulateurs</span>
              </a>
            </li>
            <li>
            <div className="relative" ref={scpiDropdownRef}>
              <button
                onClick={() => {
                  setIsScpiMenuOpen(!isScpiMenuOpen);
                  setIsEducationOpen(false);
                }}
                className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                aria-label="Nos SCPI"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Nos SCPI</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isScpiMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isScpiMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[32rem] max-w-[min(32rem,calc(100vw-4rem))] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[110] max-h-[36rem] overflow-hidden flex flex-col">
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
                      filteredScpis.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {filteredScpis.length} résultat{filteredScpis.length > 1 ? 's' : ''}
                          </div>
                          {filteredScpis.map((item) => (
                            <a
                              href={`/${item.slug}/`}
                              key={item.slug}
                              onClick={(e) => {
                                e.preventDefault();
                                resetAllHeaderStates();
                                setScpiSearch('');
                                if (onScpiPageClick) {
                                  onScpiPageClick(item.slug);
                                }
                              }}
                              className="block w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" translate="no">
                                {item.scpiName}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-3">
                                <span className="font-semibold text-green-600 dark:text-green-400">{formatYield(item.scpi.yield)}</span>
                                <span>•</span>
                                <span>{item.scpi.capitalization || 'N/A'}</span>
                              </div>
                            </a>
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
                        {/* Top 5 Rendements - Indicateur isolé */}
                        <div className="py-2">
                          <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 sticky top-0 border-b border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Top 5 par rendement
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              Classement basé uniquement sur le rendement 2024. Indicateur isolé, ne constitue pas une recommandation d'investissement.
                            </p>
                          </div>
                          {topScpis.map((item, index) => {
                            return (
                              <a
                                href={`/${item.slug}/`}
                                key={item.slug}
                                onClick={(e) => {
                                  e.preventDefault();
                                  resetAllHeaderStates();
                                  if (onScpiPageClick) {
                                    onScpiPageClick(item.slug);
                                  }
                                }}
                                className="block w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 w-6 flex-shrink-0">#{index + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" translate="no">
                                      {item.scpiName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-blue-600 dark:text-blue-400">{formatYield(item.scpi.yield)}</span>
                                      {item.dominantSector && (
                                        <>
                                          <span>•</span>
                                          <span className="text-gray-500 dark:text-gray-500">{item.dominantSector.label}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                        
                        {/* SCPI par secteur dominant */}
                        <div className="py-2 border-t-2 border-gray-200 dark:border-gray-700">
                          <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                              <Calculator className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Par secteur dominant
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              Classification selon le secteur représentant la plus forte pondération dans le patrimoine. Seuil de qualification : ≥40% pour "dominant", ≥80% pour "pure player".
                            </p>
                          </div>
                          {SECTOR_DISPLAY_ORDER.map((sector) => {
                            const pages = scpisByDominantSector[sector];
                            if (!pages || pages.length === 0) return null;

                            // Calculer le label de qualification pour ce secteur
                            const sampleScpi = pages[0]?.scpi;
                            const dominantInfo = sampleScpi ? getDominantSector(sampleScpi) : null;
                            const qualificationLabel = dominantInfo?.label || sector;

                            return (
                              <details key={sector} className="group/sector" open>
                                <summary className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors list-none flex items-center justify-between cursor-pointer">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                      {sector}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                                      ({pages.length})
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      resetAllHeaderStates();
                                      if (onComparateurClick) {
                                        onComparateurClick();
                                        // TODO: Filtrer le comparateur par secteur
                                        // On pourrait passer un paramètre pour pré-remplir le filtre
                                      }
                                    }}
                                    className="ml-2 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center gap-1 transition-colors flex-shrink-0"
                                    title="Voir dans le comparateur"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                  <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform ml-2 flex-shrink-0" />
                                </summary>
                                <div className="bg-gray-50 dark:bg-gray-900 max-h-64 overflow-y-auto">
                          {pages.map((item) => {
                            const dominantInfo = getDominantSector(item.scpi);
                            return (
                              <a
                                href={`/${item.slug}/`}
                                key={item.slug}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  resetAllHeaderStates();
                                  if (onScpiPageClick) {
                                    onScpiPageClick(item.slug);
                                  }
                                }}
                                className="block w-full px-6 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                              >
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" translate="no">
                                  {item.scpiName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                                  <span>{formatYield(item.scpi.yield)}</span>
                                  {dominantInfo.percentage > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-gray-400 dark:text-gray-600">{dominantInfo.label}</span>
                                    </>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                        
                        {/* SCPI par géographie dominante */}
                        <div className="py-2 border-t-2 border-gray-200 dark:border-gray-700">
                          <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Par géographie dominante
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              Classification selon la zone géographique représentant la plus forte pondération. Seuil de qualification : ≥50% pour "dominant", ≥80% pour "pure player".
                            </p>
                          </div>
                          {GEOGRAPHY_DISPLAY_ORDER.map((geography) => {
                            const pages = scpisByDominantGeography[geography];
                            if (!pages || pages.length === 0) return null;

                            // Calculer le label de qualification pour cette géographie
                            const sampleScpi = pages[0]?.scpi;
                            const dominantInfo = sampleScpi ? getDominantGeography(sampleScpi) : null;
                            const qualificationLabel = dominantInfo?.label || geography;

                            return (
                              <details key={geography} className="group/sector" open>
                                <summary className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors list-none flex items-center justify-between cursor-pointer">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                      {geography}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                                      ({pages.length})
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      resetAllHeaderStates();
                                      if (onComparateurClick) {
                                        onComparateurClick();
                                        // TODO: Filtrer le comparateur par géographie
                                      }
                                    }}
                                    className="ml-2 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center gap-1 transition-colors flex-shrink-0"
                                    title="Voir dans le comparateur"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                  <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform ml-2 flex-shrink-0" />
                                </summary>
                                <div className="bg-gray-50 dark:bg-gray-900 max-h-64 overflow-y-auto">
                          {pages.map((item) => {
                            const dominantInfo = getDominantGeography(item.scpi);
                            return (
                              <a
                                href={`/${item.slug}/`}
                                key={item.slug}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  resetAllHeaderStates();
                                  if (onScpiPageClick) {
                                    onScpiPageClick(item.slug);
                                  }
                                }}
                                className="block w-full px-6 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                              >
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" translate="no">
                                  {item.scpiName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                                  <span>{formatYield(item.scpi.yield)}</span>
                                  {dominantInfo.percentage > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-gray-400 dark:text-gray-600">{dominantInfo.label}</span>
                                    </>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {scpiMenuItems.length} SCPI disponibles
                      </div>
                      <a
                        href="/comparateur-scpi/"
                        onClick={(e) => {
                          e.preventDefault();
                          resetAllHeaderStates();
                          if (onComparateurClick) {
                            onComparateurClick();
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Voir toutes les SCPI
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </li>
            <li>
            <a
              href="/actualites/"
              onClick={(e) => {
                e.preventDefault();
                resetAllHeaderStates();
                if (onActualitesClick) onActualitesClick();
              }}
              className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
              aria-label="Actualités"
            >
              <FileText className="w-4 h-4" />
              <span>Actualités</span>
            </a>
            </li>
            <li>
            <a
              href="/articles/"
              onClick={resetAllHeaderStates}
              className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
              aria-label="Apprendre"
            >
              <BookOpen className="w-4 h-4" />
              <span>Apprendre</span>
            </a>
            </li>
            <li>
            <div className="relative" ref={aboutDropdownRef}>
              <button
                onClick={() => {
                  setIsAboutMenuOpen(!isAboutMenuOpen);
                  setIsScpiMenuOpen(false);
                  setIsSimulateurMenuOpen(false);
                  setIsEducationOpen(false);
                }}
                className="px-1.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                aria-label="Le cabinet"
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Le cabinet</span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isAboutMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAboutMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 max-w-[min(16rem,calc(100vw-4rem))] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[110]">
                  <a
                    href="/qui-sommes-nous/"
                    onClick={(e) => {
                      e.preventDefault();
                      resetAllHeaderStates();
                      if (onAboutClick) onAboutClick();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Le cabinet
                    </span>
                  </a>
                  <a
                    href="/expertise-orias-cif/"
                    onClick={(e) => {
                      e.preventDefault();
                      resetAllHeaderStates();
                      if (onAboutNavigation) {
                        onAboutNavigation('/expertise-orias-cif');
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <span className="text-sm">🏆</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Expertise ORIAS/CIF
                    </span>
                  </a>
                  <a
                    href="/methodologie-donnees-scpi/"
                    onClick={(e) => {
                      e.preventDefault();
                      resetAllHeaderStates();
                      if (onAboutNavigation) {
                        onAboutNavigation('/methodologie-donnees-scpi');
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <span className="text-sm">📊</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Méthodologie des données
                    </span>
                  </a>
                  <a
                    href="/avertissements-risques-scpi/"
                    onClick={(e) => {
                      e.preventDefault();
                      resetAllHeaderStates();
                      if (onAboutNavigation) {
                        onAboutNavigation('/avertissements-risques-scpi');
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <span className="text-sm">⚠️</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Avertissements et risques
                    </span>
                  </a>
                </div>
              )}
            </div>
            </li>
            </ul>
          </nav>
            {/* Right: Espace Pro (non connecté) ou Mon espace (connecté) */}
            <div className="hidden lg:flex items-center justify-end gap-4 shrink-0 whitespace-nowrap ml-2">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex px-1.5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium items-center gap-2 text-sm h-9 whitespace-nowrap"
                  aria-label="Mon espace"
                >
                  <User className="w-4 h-4" />
                  <span>Mon espace</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl py-2 z-[110]">
                      <button
                        onClick={() => {
                          resetAllHeaderStates();
                          handlePrivateSpaceNavigation();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Accéder à l’espace
                      </button>
                      <button
                        onClick={async () => {
                          await signOut();
                          resetAllHeaderStates();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    resetAllHeaderStates();
                    if (onProClick) onProClick();
                  }}
                  className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                  aria-label="Espace Pro"
                >
                  Espace Pro
                </button>
              )}
            </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 shadow-lg relative z-[9998] max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
            <div className="space-y-2">
              {user && (
              <div className="px-4">
                <button
                  onClick={() => {
                    resetAllHeaderStates();
                    handlePrivateSpaceNavigation();
                  }}
                  className="w-full flex items-center justify-between py-2 text-gray-700 dark:text-gray-200 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Mon espace</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              )}
              {/* Comparateur - 1er Mobile */}
              <div className="px-4">
                <a
                  href="/comparateur-scpi/"
                  onClick={(e) => {
                    e.preventDefault();
                    resetAllHeaderStates();
                    if (onComparateurClick) onComparateurClick();
                  }}
                  className="w-full flex items-center justify-between py-3 text-gray-700 dark:text-gray-200 font-medium touch-manipulation"
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Comparateur</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              {/* Simulateurs - 2e Mobile (lien direct vers /simulateurs) */}
              <div className="px-4">
                <a
                  href="/simulateurs/"
                  onClick={(e) => {
                    e.preventDefault();
                    resetAllHeaderStates();
                    if (onSimulateurClick) onSimulateurClick('simulateurs');
                  }}
                  className="w-full flex items-center justify-between py-3 text-gray-700 dark:text-gray-200 font-medium touch-manipulation"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span>Simulateurs</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              {/* SCPI Section - 3e Mobile */}
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
                    <span>Nos SCPI ({scpiMenuItems.length})</span>
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
                          filteredScpis.length > 0 ? (
                            <div className="space-y-1">
                              {filteredScpis.map((item) => (
                                <a
                                  href={`/${item.slug}/`}
                                  key={item.slug}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    resetAllHeaderStates();
                                    setScpiSearch('');
                                    if (onScpiPageClick) {
                                      onScpiPageClick(item.slug);
                                    }
                                  }}
                                  className="block w-full text-left py-2.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                >
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100" translate="no">
                                    {item.scpiName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatYield(item.scpi.yield)}
                                  </div>
                                </a>
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
                              <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Top 5 par rendement
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                  Indicateur isolé, ne constitue pas une recommandation.
                                </p>
                              </div>
                              <div className="mt-2 space-y-1">
                                {topScpis.map((item, index) => {
                                  return (
                                    <a
                                      href={`/${item.slug}/`}
                                      key={item.slug}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        resetAllHeaderStates();
                                        setScpiSearch('');
                                        if (onScpiPageClick) {
                                          onScpiPageClick(item.slug);
                                        }
                                      }}
                                      className="block w-full text-left py-2.5 px-3 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-[1.5rem]">#{index + 1}</span>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" translate="no">
                                            {item.scpiName}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{formatYield(item.scpi.yield)}</span>
                                            {item.dominantSector && (
                                              <>
                                                <span>•</span>
                                                <span className="text-gray-400 dark:text-gray-500">{item.dominantSector.label}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Par Secteur Dominant Mobile */}
                            <div>
                              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calculator className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Par secteur dominant
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                  Classification selon la plus forte pondération. Seuil : ≥40% "dominant", ≥80% "pure player".
                                </p>
                              </div>
                              <div className="space-y-1">
                                {SECTOR_DISPLAY_ORDER.map((sector) => {
                                  const pages = scpisByDominantSector[sector];
                                  if (!pages || pages.length === 0) return null;

                                  return (
                                    <details key={sector} className="group/sector" open>
                                      <summary className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 list-none flex items-center justify-between active:scale-[0.98] touch-manipulation">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {sector} <span className="text-xs text-gray-500">({pages.length})</span>
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform duration-200 flex-shrink-0" />
                                      </summary>
                                      <div className="mt-1 ml-3 space-y-1 pb-1">
                                        {pages.map((item) => {
                                          const dominantInfo = getDominantSector(item.scpi);
                                          return (
                                            <a
                                              href={`/${item.slug}/`}
                                              key={item.slug}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                resetAllHeaderStates();
                                                setScpiSearch('');
                                                if (onScpiPageClick) {
                                                  onScpiPageClick(item.slug);
                                                }
                                              }}
                                              className="block w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                            >
                                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" translate="no">
                                                {item.scpiName}
                                              </div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                                <span>{formatYield(item.scpi.yield)}</span>
                                                {dominantInfo.percentage > 0 && (
                                                  <>
                                                    <span>•</span>
                                                    <span className="text-gray-400 dark:text-gray-600">{dominantInfo.label}</span>
                                                  </>
                                                )}
                                              </div>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </details>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Par Géographie Dominante Mobile */}
                            <div>
                              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Par géographie dominante
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                  Classification selon la plus forte pondération géographique. Seuil : ≥50% "dominant", ≥80% "pure player".
                                </p>
                              </div>
                              <div className="space-y-1">
                                {GEOGRAPHY_DISPLAY_ORDER.map((geography) => {
                                  const pages = scpisByDominantGeography[geography];
                                  if (!pages || pages.length === 0) return null;

                                  return (
                                    <details key={geography} className="group/sector" open>
                                      <summary className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 list-none flex items-center justify-between active:scale-[0.98] touch-manipulation">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {geography} <span className="text-xs text-gray-500">({pages.length})</span>
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-open/sector:rotate-180 transition-transform duration-200 flex-shrink-0" />
                                      </summary>
                                      <div className="mt-1 ml-3 space-y-1 pb-1">
                                        {pages.map((item) => {
                                          const dominantInfo = getDominantGeography(item.scpi);
                                          return (
                                            <a
                                              href={`/${item.slug}/`}
                                              key={item.slug}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                resetAllHeaderStates();
                                                setScpiSearch('');
                                                if (onScpiPageClick) {
                                                  onScpiPageClick(item.slug);
                                                }
                                              }}
                                              className="block w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 active:scale-[0.98] touch-manipulation"
                                            >
                                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" translate="no">
                                                {item.scpiName}
                                              </div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                                <span>{formatYield(item.scpi.yield)}</span>
                                                {dominantInfo.percentage > 0 && (
                                                  <>
                                                    <span>•</span>
                                                    <span className="text-gray-400 dark:text-gray-600">{dominantInfo.label}</span>
                                                  </>
                                                )}
                                              </div>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </details>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Footer Mobile */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {scpiMenuItems.length} SCPI disponibles
                        </div>
                        <a
                          href="/comparateur-scpi/"
                          onClick={(e) => {
                            e.preventDefault();
                            resetAllHeaderStates();
                            if (onComparateurClick) {
                              onComparateurClick();
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Voir toutes les SCPI
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actualités */}
              <a
                href="/actualites/"
                onClick={(e) => {
                  e.preventDefault();
                  resetAllHeaderStates();
                  if (onActualitesClick) {
                    onActualitesClick();
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Actualités</span>
              </a>

              {/* Apprendre */}
              <a
                href="/articles/"
                onClick={resetAllHeaderStates}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                aria-label="Apprendre"
              >
                <BookOpen className="w-4 h-4" />
                <span>Apprendre</span>
              </a>

              {/* Le cabinet Section Mobile */}
              <div className="px-4" ref={aboutMobileRef}>
                <button
                  onClick={() => {
                    setIsAboutMobileOpen(!isAboutMobileOpen);
                  }}
                  className="w-full flex items-center justify-between py-2 text-gray-700 dark:text-gray-200 font-medium touch-manipulation"
                  aria-expanded={isAboutMobileOpen}
                  aria-label="Menu Le cabinet"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>Le cabinet</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAboutMobileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAboutMobileOpen && (
                  <div className="mt-2 ml-6 space-y-2 border-l-2 border-blue-500 dark:border-blue-400 pl-4">
                    <a
                      href="/qui-sommes-nous/"
                      onClick={(e) => {
                        e.preventDefault();
                        resetAllHeaderStates();
                        if (onAboutClick) onAboutClick();
                      }}
                      className="w-full flex items-center gap-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">Le cabinet</span>
                    </a>
                    <a
                      href="/expertise-orias-cif/"
                      onClick={(e) => {
                        e.preventDefault();
                        resetAllHeaderStates();
                        if (onAboutNavigation) {
                          onAboutNavigation('/expertise-orias-cif');
                        }
                      }}
                      className="w-full flex items-center gap-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium">Expertise ORIAS/CIF</span>
                    </a>
                    <a
                      href="/methodologie-donnees-scpi/"
                      onClick={(e) => {
                        e.preventDefault();
                        resetAllHeaderStates();
                        if (onAboutNavigation) {
                          onAboutNavigation('/methodologie-donnees-scpi');
                        }
                      }}
                      className="w-full flex items-center gap-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-medium">Méthodologie des données</span>
                    </a>
                    <a
                      href="/avertissements-risques-scpi/"
                      onClick={(e) => {
                        e.preventDefault();
                        resetAllHeaderStates();
                        if (onAboutNavigation) {
                          onAboutNavigation('/avertissements-risques-scpi');
                        }
                      }}
                      className="w-full flex items-center gap-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="text-lg">⚠️</span>
                      <span className="text-sm font-medium">Avertissements et risques</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Espace Pro Mobile */}
            <div className="px-4 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  resetAllHeaderStates();
                  if (onProClick) onProClick();
                }}
                className="w-full flex items-center justify-center py-3 border border-emerald-500 text-emerald-400 font-medium rounded-lg hover:bg-emerald-500/10 transition-all touch-manipulation"
              >
                Espace Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
