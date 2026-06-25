import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Grid3x3, List, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { scpiData } from '../../data/scpiData';
import { AllocationProvider } from '../../contexts/AllocationContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import ProSCPICardDark from './ProSCPICardDark';
import SCPITableRow from './SCPITableRow';
import ProSelectionSidebar from './ProSelectionSidebar';
import MobileSelectionBar from './MobileSelectionBar';
import AnalysisDetailModal from './AnalysisDetailModal';
import { SimulationModal } from '../simulation';
import FilterPanel, { FilterState } from './FilterPanel';
import { sortSCPIByTaxOptimization } from '../../utils/taxOptimization';
import { matchesSectorFilter, calculateSectorRelevanceScore } from '../../utils/sectorQualification';
import { enrichScpiExtendedArray } from '../../utils/enrichScpiExtended';
import { getLatestScoresBatch } from '../../utils/scpiScoreService';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import { computeClientScores } from '../../utils/computeClientScores';
import ComparisonWarning from '../ComparisonWarning';
import Toast from '../Toast';

type ViewMode = 'grid' | 'list';

const QUICK_FILTERS = [
  { id: 'high-yield', label: 'Rendement élevé' },
  { id: 'low-debt', label: 'Faible endettement' },
  { id: 'attractive-discount', label: 'Décote attractive' },
  { id: 'europe', label: 'Europe' },
  { id: 'sante', label: 'Santé' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'defensive', label: 'SCPI défensives' },
];

interface ProFintechComparatorContentProps {
  onCloseAnalysis?: () => void;
  onGuidedJourneyClick?: () => void;
  hideTitle?: boolean;
  zScoreVariant?: 'full' | 'compact';
}

const ProFintechComparatorContent: React.FC<ProFintechComparatorContentProps> = ({
  onCloseAnalysis,
  onGuidedJourneyClick,
  hideTitle = false,
  zScoreVariant = 'full'
}) => {
  const [selectedScpis, setSelectedScpis] = useState<SCPIExtended[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'yield' | 'price'>('yield');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [analysisScpi, setAnalysisScpi] = useState<SCPIExtended | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const [scoresBySlug, setScoresBySlug] = useState<Record<string, number>>({});
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tmi: null,
    minYield: 0,
    priceRange: 'all',
    geographies: [],
    sectors: [],
    sectorThreshold: '25', // Par défaut : exposition significative (≥25%)
    hasISR: null,
    noEntryFees: false,
    expertMode: false,
    discountRange: [-15, 10],
    minRanDays: 0,
    maxLtv: 100,
    noWaitingShares: false
  });

  // Enrichir les données SCPI avec les informations du fichier Excel
  const enrichedScpiData = useMemo(() => {
    const enriched = enrichScpiExtendedArray(scpiDataExtended, scpiData);
    // Debug: vérifier si Paref Evo est présent
    const parefEvo = enriched.find(s => s.name === 'Paref Evo');
    if (!parefEvo) {
      console.warn('[FintechComparator] Paref Evo non trouvé dans enrichedScpiData');
      console.log('[FintechComparator] SCPI disponibles:', enriched.map(s => s.name).filter(n => n.toLowerCase().includes('paref')));
    }
    return enriched;
  }, []);

  // Note MaximusSCPI calculée côté client sur l'ensemble de la cohorte (percentile cohérent).
  // Source de vérité de la note affichée ; Supabase reste une surcouche optionnelle.
  const clientScoresBySlug = useMemo(
    () => computeClientScores(enrichedScpiData).bySlug,
    [enrichedScpiData]
  );

  const handleQuickFilter = (id: string) => {
    setQuickFilters(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      // Appliquer les filtres rapides via le state filters existant
      const updates: Partial<FilterState> = {};
      // Réinitialiser les filtres avant d'appliquer les quick filters
      let geographies: string[] = [];
      let sectors: string[] = [];
      let minYield = 0;
      let maxLtv = 100;
      let discountRange: [number, number] = [-15, 10];

      if (next.includes('high-yield')) minYield = 5.5;
      if (next.includes('low-debt')) maxLtv = 50;
      if (next.includes('attractive-discount')) discountRange = [-25, -5];
      if (next.includes('europe')) geographies = ['Europe'];
      if (next.includes('sante')) sectors = ['Santé'];
      if (next.includes('commerce')) sectors = sectors.length > 0 ? [...sectors, 'Commerces'] : ['Commerces'];
      if (next.includes('defensive')) {
        sectors = ['Santé', 'Commerces'];
        geographies = geographies.length > 0 ? geographies : ['France'];
        maxLtv = Math.min(maxLtv, 60);
      }

      setFilters(prevFilters => ({
        ...prevFilters,
        minYield,
        maxLtv,
        discountRange,
        geographies,
        sectors,
        sectorThreshold: sectors.length > 0 ? '10' : '25',
      }));
      return next;
    });
  };

  const toggleSelect = (scpi: SCPIExtended) => {
    setSelectedScpis(prev => {
      const exists = prev.find(s => s.id === scpi.id);
      if (exists) {
        return prev.filter(s => s.id !== scpi.id);
      }
      if (prev.length >= 6) {
        if (typeof window !== 'undefined') {
          window.alert('Vous pouvez sélectionner jusqu’à 6 SCPI maximum dans votre portefeuille.');
        }
        return prev;
      }
      return [...prev, scpi];
    });
  };

  const applyFilters = (scpi: SCPIExtended): boolean => {
    if (scpi.yield < filters.minYield) return false;

    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'accessible' && scpi.price >= 300) return false;
      if (filters.priceRange === 'standard' && (scpi.price < 300 || scpi.price > 1000)) return false;
      if (filters.priceRange === 'premium' && scpi.price <= 1000) return false;
    }

    if (filters.geographies.length > 0) {
      const hasMatchingGeo = scpi.geography.some(geo => {
        const geoName = geo.name.toLowerCase();
        if (filters.geographies.includes('France') &&
            (geoName.includes('france') || geoName.includes('paris') || geoName.includes('région'))) {
          return true;
        }
        if (filters.geographies.includes('Europe') &&
            !geoName.includes('france') && !geoName.includes('paris') &&
            (geoName.includes('europe') || geoName.includes('allemagne') || geoName.includes('espagne') ||
             geoName.includes('italie') || geoName.includes('belgique') || geoName.includes('pays-bas') ||
             geoName.includes('irlande') || geoName.includes('portugal') || geoName.includes('pologne'))) {
          return true;
        }
        if (filters.geographies.includes('International') &&
            (geoName.includes('royaume') || geoName.includes('étranger') || geoName.includes('ocde'))) {
          return true;
        }
        return false;
      });
      if (!hasMatchingGeo) return false;
    }

    if (filters.sectors.length > 0) {
      // Utiliser la nouvelle logique de filtrage avec seuil
      if (!matchesSectorFilter(scpi, filters.sectors, filters.sectorThreshold)) {
        return false;
      }
    }

    if (filters.expertMode) {
      if (scpi.reconstitutionValue) {
        const discount = ((scpi.price - scpi.reconstitutionValue) / scpi.reconstitutionValue) * 100;
        if (discount < filters.discountRange[0] || discount > filters.discountRange[1]) {
          return false;
        }
      }

      if (scpi.ranDays !== undefined && scpi.ranDays < filters.minRanDays) {
        return false;
      }

      if (scpi.ltv !== undefined && scpi.ltv > filters.maxLtv) {
        return false;
      }

      if (filters.noWaitingShares && scpi.hasWaitingShares) {
        return false;
      }
    }

    return true;
  };

  // Créer une copie profonde pour éviter les mutations sur des tableaux gelés en production
  // Utiliser les données enrichies avec les informations du fichier Excel
  let filteredData = [...enrichedScpiData].filter(scpi =>
    (scpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scpi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scpi.managementCompany.toLowerCase().includes(searchQuery.toLowerCase())) &&
    applyFilters(scpi)
  );

  // Si un filtre sectoriel est actif, trier par score de pertinence sectorielle
  if (filters.sectors.length > 0) {
    filteredData = filteredData.map(scpi => ({
      scpi,
      sectorScore: calculateSectorRelevanceScore(scpi, filters.sectors, filters.sectorThreshold)
    })).sort((a, b) => {
      // Trier d'abord par score sectoriel (décroissant), puis par optimisation fiscale
      if (b.sectorScore !== a.sectorScore) {
        return b.sectorScore - a.sectorScore;
      }
      return 0; // On garde l'ordre original pour les scores égaux
    }).map(item => item.scpi);
  }

  // Appliquer le tri par optimisation fiscale
  filteredData = sortSCPIByTaxOptimization(filteredData, filters.tmi, sortBy);

  const itemsPerPage = viewMode === 'grid' ? 9 : 15;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, viewMode, filters]);

  const paginatedSlugsKey = useMemo(
    () => paginatedData.map(s => s.id).join(','),
    [currentPage, filteredData, itemsPerPage]
  );
  useEffect(() => {
    const slugs = paginatedData.map(s => createSlugFromName(s.name)).filter(Boolean);
    if (slugs.length === 0) return;
    getLatestScoresBatch(slugs).then(newScores => {
      if (Object.keys(newScores).length > 0) {
        setScoresBySlug(prev => ({ ...prev, ...newScores }));
      }
    });
  }, [paginatedSlugsKey]);


  const handleAnalyze = (scpi: SCPIExtended) => {
    // Sauvegarder la position de scroll avant d'ouvrir le modal
    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    setSavedScrollPosition(currentScrollY);
    setAnalysisScpi(scpi);
  };

  const activeFiltersCount =
    (filters.tmi !== null ? 1 : 0) +
    (filters.minYield > 0 ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    filters.geographies.length +
    (filters.sectors.length > 0 ? 1 : 0) + // Compter le filtre sectoriel comme 1 même si plusieurs secteurs
    (filters.sectorThreshold !== '25' ? 1 : 0) + // Compter si le seuil n'est pas le défaut
    (filters.hasISR !== null && filters.hasISR !== undefined ? 1 : 0) +
    (filters.noEntryFees ? 1 : 0) +
    (filters.expertMode ? (
      (filters.discountRange[0] !== -15 || filters.discountRange[1] !== 10 ? 1 : 0) +
      (filters.minRanDays > 0 ? 1 : 0) +
      (filters.maxLtv < 100 ? 1 : 0) +
      (filters.noWaitingShares ? 1 : 0)
    ) : 0);

  return (
    <div className="min-h-screen bg-slate-900" id="comparator-container">
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ── Onboarding ── */}
        {onboardingVisible && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-800/40">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-300 mb-2">
                  Construisez une sélection SCPI exploitable en rendez-vous
                </h2>
                <p className="text-sm text-slate-400 mb-5">
                  Filtrez, comparez et sélectionnez jusqu'à 6 SCPI pour préparer une analyse claire, pédagogique et conforme.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="flex items-start gap-2.5 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-xs font-semibold text-white">Filtrer</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">Stratégie, secteur, rendement ou société de gestion.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-xs font-semibold text-white">Sélectionner</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">Ajoutez jusqu'à 6 SCPI à votre panier d'analyse.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-xs font-semibold text-white">Analyser</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">Visualisez rendement moyen, diversification et cohérence.</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOnboardingVisible(false)}
                className="text-slate-600 hover:text-slate-400 transition shrink-0"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ── Toolbar ── */}
        <div className="mt-6 rounded-xl bg-slate-800/80 border border-slate-700 p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {filteredData.length} SCPI disponibles • Page {currentPage} sur {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filters.tmi !== null && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-lg">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-200">TMI</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                    {filters.tmi}%
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">Liste</span>
                </button>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden relative w-12 h-12 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center transition-all shrink-0"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, gestionnaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-3 bg-slate-950 border border-slate-600 text-white placeholder-slate-400 rounded-full shadow-md focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            )}
          </div>
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Filtres rapides :</span>
            {QUICK_FILTERS.map((qf) => {
              const active = quickFilters.includes(qf.id);
              return (
                <button
                  key={qf.id}
                  onClick={() => handleQuickFilter(qf.id)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium border transition whitespace-nowrap ${
                    active
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === 'grid' ? (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <main className="min-w-0 pb-24 lg:pb-6">
            <div>
              {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
                <p className="text-slate-400 mb-4">
                  Essayez de modifier votre recherche
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div id="scpi-grid" className="mt-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {paginatedData.map(scpi => (
                      <ProSCPICardDark
                        key={scpi.id}
                        scpi={scpi}
                        score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                        isSelected={selectedScpis.some(s => s.id === scpi.id)}
                        onToggleSelect={() => toggleSelect(scpi)}
                        onAnalyze={() => handleAnalyze(scpi)}
                        userTmi={filters.tmi}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <colgroup>
                          <col className="w-[18%]" />
                          <col className="w-[11%]" />
                          <col className="w-[10%]" />
                          <col className="w-[7%]" />
                          <col className="w-[8%]" />
                          <col className="w-[9%]" />
                          <col className="w-[10%]" />
                          <col style={{ minWidth: '200px' }} />
                        </colgroup>
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              SCPI
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Catégorie
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Rendement
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              TOF
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Prix
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Invest. Min.
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Note
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map(scpi => (
                            <SCPITableRow
                              key={scpi.id}
                              scpi={scpi}
                              score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                              isSelected={selectedScpis.some(s => s.id === scpi.id)}
                              onToggleSelect={() => toggleSelect(scpi)}
                              onAnalyze={() => handleAnalyze(scpi)}
                              userTmi={filters.tmi}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="md:hidden mt-16 grid grid-cols-1 gap-6">
                    {paginatedData.map(scpi => (
                      <ProSCPICardDark
                        key={scpi.id}
                        scpi={scpi}
                        score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                        isSelected={selectedScpis.some(s => s.id === scpi.id)}
                        onToggleSelect={() => toggleSelect(scpi)}
                        onAnalyze={() => handleAnalyze(scpi)}
                        userTmi={filters.tmi}
                      />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === 1
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        Page {currentPage} sur {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === totalPages
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <span>Suivant</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Disclaimer de conformité */}
                {filteredData.length > 0 && (
                  <div className="mt-12 max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">Avertissement : </span>
                        Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Les simulations et projections affichées sont indicatives et ne constituent ni un engagement contractuel ni une promesse de rendement.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <aside id="selection-sidebar" className="block xl:sticky xl:top-24 scroll-mt-20">
          <ProSelectionSidebar
            selectedScpis={selectedScpis}
            onRemove={(scpi) => toggleSelect(scpi)}
            onClear={() => setSelectedScpis([])}
            onVisualize={() => setIsSimulationOpen(true)}
            zScoreVariant={zScoreVariant}
          />
        </aside>
      </div>
        ) : (
      <div className="mt-8">
        <main className="min-w-0 pb-24 lg:pb-6">
          <div>
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
                <p className="text-slate-400 mb-4">
                  Essayez de modifier votre recherche
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <colgroup>
                        <col className="w-[18%]" />
                        <col className="w-[11%]" />
                        <col className="w-[10%]" />
                        <col className="w-[7%]" />
                        <col className="w-[8%]" />
                        <col className="w-[9%]" />
                        <col className="w-[10%]" />
                        <col style={{ minWidth: '190px' }} />
                      </colgroup>
                      <thead className="bg-slate-900/50 border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">SCPI</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Catégorie</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendement</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">TOF</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Prix</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Invest. Min.</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Note</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map(scpi => (
                          <SCPITableRow
                            key={scpi.id}
                            scpi={scpi}
                            score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                            isSelected={selectedScpis.some(s => s.id === scpi.id)}
                            onToggleSelect={() => toggleSelect(scpi)}
                            onAnalyze={() => handleAnalyze(scpi)}
                            userTmi={filters.tmi}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {viewMode === 'list' && (
                  <div className="md:hidden mt-16 grid grid-cols-1 gap-6">
                    {paginatedData.map(scpi => (
                      <ProSCPICardDark
                        key={scpi.id}
                        scpi={scpi}
                        score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                        isSelected={selectedScpis.some(s => s.id === scpi.id)}
                        onToggleSelect={() => toggleSelect(scpi)}
                        onAnalyze={() => handleAnalyze(scpi)}
                        userTmi={filters.tmi}
                      />
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === 1
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        Page {currentPage} sur {totalPages}
                      </span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === totalPages
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <span>Suivant</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {filteredData.length > 0 && (
                  <div className="mt-12 max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">Avertissement : </span>
                        Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Les simulations et projections affichées sont indicatives et ne constituent ni un engagement contractuel ni une promesse de rendement.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <div className="mt-8">
          <ProSelectionSidebar
            selectedScpis={selectedScpis}
            onRemove={(scpi) => toggleSelect(scpi)}
            onClear={() => setSelectedScpis([])}
            onVisualize={() => setIsSimulationOpen(true)}
            zScoreVariant={zScoreVariant}
          />
        </div>
      </div>
        )}
      </section>

      {/* Avertissement de comparaison si mélange France/Europe */}
      {selectedScpis.length >= 2 && (
        <div id="selection-section" className="scroll-mt-20">
          <ComparisonWarning scpiList={selectedScpis} className="mx-4 mb-4" />
        </div>
      )}

      {/* Mobile Selection Bar */}
      <MobileSelectionBar
        count={selectedScpis.length}
        onOpen={() => setIsSimulationOpen(true)}
        selectedScpis={selectedScpis}
      />

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        selectedScpis={selectedScpis}
      />

      {/* Analysis Detail Modal */}
      {analysisScpi && (
        <AnalysisDetailModal
          key={analysisScpi.id}
          isOpen={!!analysisScpi}
          onClose={() => {
            // Fermer le modal
            setAnalysisScpi(null);
            // Restaurer la position de scroll exacte après fermeture du modal
            setTimeout(() => {
              window.scrollTo({
                top: savedScrollPosition,
                behavior: 'instant' // Utiliser 'instant' pour éviter tout effet de scroll visible
              });
            }, 50);
          }}
          scpi={analysisScpi}
          score={scoresBySlug[createSlugFromName(analysisScpi.name)] ?? clientScoresBySlug[createSlugFromName(analysisScpi.name)] ?? null}
          onAdd={() => {
            // Ajouter la SCPI à la sélection
            toggleSelect(analysisScpi);
            // Le modal se fermera automatiquement via onClose dans AnalysisDetailModal
            // et restaurera la position de scroll exacte
          }}
          isSelected={selectedScpis.some(s => s.id === analysisScpi.id)}
          onShowToast={(message) => {
            setToastMessage(message);
            setShowToast(true);
          }}
        />
      )}

      {/* Toast de confirmation */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={1000}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredData.length}
      />
    </div>
  );
};

interface ProFintechComparatorProps {
  onCloseAnalysis?: () => void;
  onGuidedJourneyClick?: () => void;
  hideTitle?: boolean;
  zScoreVariant?: 'full' | 'compact';
}

const ProFintechComparator: React.FC<ProFintechComparatorProps> = ({
  onCloseAnalysis,
  onGuidedJourneyClick,
  hideTitle = false,
  zScoreVariant = 'full'
}) => {
  return (
    <AllocationProvider>
      <SubscriptionProvider>
        <ProFintechComparatorContent
          onCloseAnalysis={onCloseAnalysis}
          onGuidedJourneyClick={onGuidedJourneyClick}
          hideTitle={hideTitle}
          zScoreVariant={zScoreVariant}
        />
      </SubscriptionProvider>
    </AllocationProvider>
  );
};

export default ProFintechComparator;
