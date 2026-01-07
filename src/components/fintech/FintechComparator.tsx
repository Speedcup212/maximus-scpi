import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Grid3x3, List, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { AllocationProvider } from '../../contexts/AllocationContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import SCPICardDark from './SCPICardDark';
import SCPITableRow from './SCPITableRow';
import SelectionSidebar from './SelectionSidebar';
import MobileSelectionBar from './MobileSelectionBar';
import AnalysisDetailModal from './AnalysisDetailModal';
import { SimulationModal } from '../simulation';
import FilterPanel, { FilterState } from './FilterPanel';
import { sortSCPIByTaxOptimization } from '../../utils/taxOptimization';

type ViewMode = 'grid' | 'list';

interface FintechComparatorContentProps {
  onCloseAnalysis?: () => void;
}

const FintechComparatorContent: React.FC<FintechComparatorContentProps> = ({ onCloseAnalysis }) => {
  const [selectedScpis, setSelectedScpis] = useState<SCPIExtended[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'yield' | 'price'>('yield');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [analysisScpi, setAnalysisScpi] = useState<SCPIExtended | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    tmi: null,
    minYield: 0,
    priceRange: 'all',
    geographies: [],
    sectors: [],
    hasISR: null,
    noEntryFees: false,
    expertMode: false,
    discountRange: [-15, 10],
    minRanDays: 0,
    maxLtv: 100,
    noWaitingShares: false
  });

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
      const categoryMatch = filters.sectors.some(sector =>
        scpi.category.toLowerCase().includes(sector.toLowerCase())
      );
      const sectorsMatch = scpi.sectors.some(sector =>
        filters.sectors.some(filterSector =>
          sector.name.toLowerCase().includes(filterSector.toLowerCase())
        )
      );
      if (!categoryMatch && !sectorsMatch) return false;
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
  const filteredData = sortSCPIByTaxOptimization(
    [...scpiDataExtended].filter(scpi =>
      (scpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scpi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scpi.managementCompany.toLowerCase().includes(searchQuery.toLowerCase())) &&
      applyFilters(scpi)
    ),
    filters.tmi,
    sortBy
  );

  const itemsPerPage = viewMode === 'grid' ? 9 : 15;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, viewMode, filters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleAnalyze = (scpi: SCPIExtended) => {
    setAnalysisScpi(scpi);
  };

  const activeFiltersCount =
    (filters.tmi !== null ? 1 : 0) +
    (filters.minYield > 0 ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    filters.geographies.length +
    filters.sectors.length +
    (filters.hasISR !== null && filters.hasISR !== undefined ? 1 : 0) +
    (filters.noEntryFees ? 1 : 0) +
    (filters.expertMode ? (
      (filters.discountRange[0] !== -15 || filters.discountRange[1] !== 10 ? 1 : 0) +
      (filters.minRanDays > 0 ? 1 : 0) +
      (filters.maxLtv < 100 ? 1 : 0) +
      (filters.noWaitingShares ? 1 : 0)
    ) : 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pr-[25rem] py-4">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Comparez nos 51 SCPI
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {filteredData.length} SCPI disponibles • Page {currentPage} sur {totalPages}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
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
              </div>
            </div>

            {/* Search Bar Wrapper */}
            <div className="w-full max-w-4xl mx-auto mb-12 relative z-20">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, catégorie, gestionnaire..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-12 py-4 bg-slate-950 border border-slate-600 text-white placeholder-slate-400 rounded-full shadow-md focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/20 transition-all"
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
                {filters.tmi !== null && (
                  <div className="md:hidden flex items-center gap-1 px-2 py-1 bg-emerald-600/20 border border-emerald-500/50 rounded-full">
                    <Calculator className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-200">{filters.tmi}%</span>
                  </div>
                )}
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
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Spacer between search bar and results */}
            <div className="w-full h-10 sm:h-12 my-4 shrink-0"></div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedData.map(scpi => (
                      <SCPICardDark
                        key={scpi.id}
                        scpi={scpi}
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
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-[18%]" />
                          <col className="w-[13%]" />
                          <col className="w-[13%]" />
                          <col className="w-[9%]" />
                          <col className="w-[10%]" />
                          <col className="w-[11%]" />
                          <col className="w-[26%]" />
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
                  <div className="md:hidden grid grid-cols-1 gap-6">
                    {paginatedData.map(scpi => (
                      <SCPICardDark
                        key={scpi.id}
                        scpi={scpi}
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

        {/* Desktop Sidebar */}
        <SelectionSidebar
          selectedScpis={selectedScpis}
          onRemove={(scpi) => toggleSelect(scpi)}
          onClear={() => setSelectedScpis([])}
          onVisualize={() => setIsSimulationOpen(true)}
        />
      </div>

      {/* Mobile Selection Bar */}
      <MobileSelectionBar
        count={selectedScpis.length}
        onOpen={() => setIsSimulationOpen(true)}
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
          isOpen={!!analysisScpi}
          onClose={() => {
            // Fermer le modal d'abord
            setAnalysisScpi(null);
            // Retourner à l'accueil après fermeture du modal
            // Utiliser un délai pour s'assurer que le state est bien mis à jour
            if (onCloseAnalysis) {
              setTimeout(() => {
                try {
                  onCloseAnalysis();
                } catch (error) {
                  console.error('Erreur lors du retour à l\'accueil:', error);
                  // Fallback: navigation directe si le callback échoue
                  window.location.href = '/';
                }
              }, 200);
            }
          }}
          scpi={analysisScpi}
        />
      )}

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

interface FintechComparatorProps {
  onCloseAnalysis?: () => void;
}

const FintechComparator: React.FC<FintechComparatorProps> = ({ onCloseAnalysis }) => {
  return (
    <AllocationProvider>
      <SubscriptionProvider>
        <FintechComparatorContent onCloseAnalysis={onCloseAnalysis} />
      </SubscriptionProvider>
    </AllocationProvider>
  );
};

export default FintechComparator;
