import React, { useState, useMemo } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { scpiData, SCPIMock } from '../../data/mockScpiData';
import { PortfolioProvider, usePortfolioContext } from '../../contexts/PortfolioContext';
import SCPICard from './SCPICard';
import FilterModal from './FilterModal';
import StickySelectionFooter from './StickySelectionFooter';
import PortfolioSidebar from './PortfolioSidebar';
import MobileSelectionModal from './MobileSelectionModal';

const MobileComparatorContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSelectionOpen, setIsMobileSelectionOpen] = useState(false);
  const [filters, setFilters] = useState({
    yieldRange: [0, 15] as [number, number],
    selectedCategories: [] as string[],
    sortBy: 'yield' as 'yield' | 'price' | 'tof' | 'capitalization',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const { selectedScpi, portfolioCount } = usePortfolioContext();

  const filteredAndSortedData = useMemo(() => {
    let result = [...scpiData];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        scpi =>
          scpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scpi.managementCompany.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply yield range filter
    result = result.filter(
      scpi => scpi.yield >= filters.yieldRange[0] && scpi.yield <= filters.yieldRange[1]
    );

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter(scpi =>
        filters.selectedCategories.includes(scpi.category)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (filters.sortBy) {
        case 'yield':
          aValue = a.yield;
          bValue = b.yield;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'tof':
          aValue = a.tof;
          bValue = b.tof;
          break;
        case 'capitalization':
          aValue = parseFloat(a.capitalization.replace(/[^0-9.]/g, ''));
          bValue = parseFloat(b.capitalization.replace(/[^0-9.]/g, ''));
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [searchQuery, filters]);

  const handleVisualize = () => {
    setIsMobileSelectionOpen(false);
    alert(
      `Visualisation des résultats:\n\n${selectedScpi
        .map(s => `- ${s.name} (${s.yield}%)`)
        .join('\n')}\n\nRendement moyen: ${(selectedScpi.reduce((sum, s) => sum + s.yield, 0) / portfolioCount).toFixed(2)}%`
    );
  };

  const handleAnalyze = (scpi: SCPIMock) => {
    console.log('[Analyse] SCPI sélectionnée pour analyse:', scpi);
    alert(`Analyse de ${scpi.name}\n\nRendement: ${scpi.yield}%\nPrix: ${scpi.price}€\nTOF: ${scpi.tof}%\n\n(Ouverture de la fiche détaillée à venir)`);
  };

  const activeFiltersCount =
    (filters.yieldRange[1] < 15 ? 1 : 0) +
    filters.selectedCategories.length +
    (filters.sortBy !== 'yield' || filters.sortOrder !== 'desc' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="space-y-3">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Comparateur SCPI</h1>
              <p className="text-sm text-slate-600">
                {filteredAndSortedData.length} SCPI disponible{filteredAndSortedData.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Search & Filter Row */}
            <div className="flex gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une SCPI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="relative px-4 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-500 transition-colors flex items-center gap-2 font-medium text-slate-700"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.yieldRange[1] < 15 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Rendement ≤ {filters.yieldRange[1]}%
                  </span>
                )}
                {filters.selectedCategories.map(cat => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Layout with Sidebar */}
      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
          {/* Mobile Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedData.map(scpi => (
              <SCPICard
                key={scpi.id}
                scpi={scpi}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>

          {/* Disclaimer de conformité */}
          {filteredAndSortedData.length > 0 && (
            <div className="mt-8">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Avertissement : </span>
                  Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Les simulations et projections affichées sont indicatives et ne constituent ni un engagement contractuel ni une promesse de rendement.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun résultat</h3>
              <p className="text-slate-600 mb-4">
                Essayez de modifier vos critères de recherche ou filtres.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    yieldRange: [0, 15],
                    selectedCategories: [],
                    sortBy: 'yield',
                    sortOrder: 'desc'
                  });
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>

        {/* Portfolio Sidebar (Desktop only) */}
        <PortfolioSidebar onVisualize={handleVisualize} />
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />

      {/* Mobile Selection Modal */}
      <MobileSelectionModal
        isOpen={isMobileSelectionOpen}
        onClose={() => setIsMobileSelectionOpen(false)}
        onVisualize={handleVisualize}
      />

      {/* Sticky Selection Footer (Mobile only) */}
      <StickySelectionFooter
        onViewSelection={() => setIsMobileSelectionOpen(true)}
      />
    </div>
  );
};

const MobileComparator: React.FC = () => {
  return (
    <PortfolioProvider>
      <MobileComparatorContent />
    </PortfolioProvider>
  );
};

export default MobileComparator;
