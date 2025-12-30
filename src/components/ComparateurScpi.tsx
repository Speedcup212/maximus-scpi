import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { findScpiSlug } from '../utils/scpiSlugMapper';

interface ScpiItem {
  id: number;
  name: string;
  company: string;
  yield: number;
  tof: number;
  sector: string;
  price: number;
  fees: number;
  capitalization: number;
}

interface ComparateurScpiProps {
  onScpiClick?: (slug: string) => void;
}

export default function ComparateurScpi({ onScpiClick }: ComparateurScpiProps = {}) {
  const [scpiList, setScpiList] = useState<ScpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof ScpiItem>('yield');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAllColumns, setShowAllColumns] = useState(false);

  useEffect(() => {
    console.log('[DEBUG ComparateurScpi] Component mounted, loading data...');
    import('../data/scpiData').then(module => {
      console.log('[DEBUG ComparateurScpi] Data loaded, scpiData length:', module.scpiData?.length);
      const data = module.scpiData.map((scpi: any) => ({
        id: scpi.id,
        name: scpi.name,
        company: scpi.company,
        yield: scpi.yield || 0,
        tof: scpi.tof || 0,
        sector: scpi.sector || 'diversifie',
        price: scpi.price || 0,
        fees: scpi.fees || 0,
        capitalization: scpi.capitalization || 0
      }));
      console.log('[DEBUG ComparateurScpi] Data processed, list length:', data.length);
      setScpiList(data);
      setLoading(false);
    }).catch(error => {
      console.error('[DEBUG ComparateurScpi] Error loading data:', error);
      setLoading(false);
    });
  }, []);

  const handleScpiClick = (scpiName: string) => {
    if (!onScpiClick) return;

    const slug = findScpiSlug(scpiName);
    if (slug) {
      onScpiClick(slug);
    } else {
      console.warn(`No landing page found for SCPI: ${scpiName}`);
    }
  };

  const handleSort = (key: keyof ScpiItem) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toFixed(2);
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' Md€';
    } else if (amount >= 1000000) {
      return Math.round(amount / 1000000) + ' M€';
    }
    return Math.round(amount) + ' €';
  };

  const getSectorLabel = (sector: string): string => {
    const labels: Record<string, string> = {
      bureaux: 'Bureaux',
      commerces: 'Commerces',
      residentiel: 'Résidentiel',
      sante: 'Santé',
      logistique: 'Logistique',
      hotellerie: 'Hôtellerie',
      diversifie: 'Diversifié'
    };
    return labels[sector] || 'Diversifié';
  };

  const filteredAndSorted = scpiList
    .filter(scpi =>
      scpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scpi.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  console.log('[DEBUG ComparateurScpi] Rendering, loading:', loading, 'scpiList length:', scpiList.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8 pb-32 bg-gradient-to-r from-blue-600 to-blue-700 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Comparateur SCPI
          </h2>
          <p className="text-blue-100 text-lg">
            {scpiList.length} SCPI analysées - Données officielles 2024
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Rechercher par nom de SCPI ou société de gestion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-4 focus:ring-blue-300 shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {searchTerm && (
            <div className="mt-3 text-blue-100 text-sm text-center">
              {filteredAndSorted.length} résultat{filteredAndSorted.length > 1 ? 's' : ''} trouvé{filteredAndSorted.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de scroll mobile */}
      <div className="md:hidden bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-blue-700 font-medium">↔️ Faites défiler pour plus d'infos</span>
        <button
          onClick={() => setShowAllColumns(!showAllColumns)}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
        >
          {showAllColumns ? 'Masquer colonnes' : 'Afficher tout'}
        </button>
      </div>

      <div className="overflow-x-auto relative pt-4">
        {/* Gradient fade sur les bords pour indiquer le scroll */}
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              {/* Colonne SCPI - Sticky sur mobile */}
              <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left shadow-sm">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  SCPI
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort('yield')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  Rendement
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort('sector')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  Secteur
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              {/* Colonnes masquables sur mobile */}
              <th className={`px-4 py-3 text-center ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                <button
                  onClick={() => handleSort('tof')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  TOF
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort('capitalization')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  <span className="hidden md:inline">Capitalisation</span>
                  <span className="md:hidden">Capital.</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className={`px-4 py-3 text-center ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  Prix
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className={`px-4 py-3 text-center ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                <button
                  onClick={() => handleSort('fees')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 mx-auto"
                >
                  Frais
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSorted.map((scpi, index) => (
              <tr
                key={scpi.id}
                className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}
              >
                {/* Colonne SCPI - Sticky sur mobile */}
                <td className="sticky left-0 z-10 bg-inherit px-6 py-4 shadow-sm">
                  <div
                    className={`font-bold text-gray-900 text-sm md:text-base ${
                      onScpiClick ? 'hover:text-blue-600 cursor-pointer transition-colors underline decoration-transparent hover:decoration-current' : ''
                    }`}
                    onClick={() => handleScpiClick(scpi.name)}
                  >
                    {scpi.name}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">{scpi.company}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-green-600 text-sm md:text-base">{formatNumber(scpi.yield)}%</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getSectorLabel(scpi.sector)}
                  </span>
                </td>
                {/* Colonnes masquables sur mobile */}
                <td className={`px-4 py-4 text-center ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                  <span className="font-semibold text-gray-900 text-sm md:text-base">{formatNumber(scpi.tof)}%</span>
                </td>
                <td className="px-4 py-4 text-center text-gray-900 text-sm md:text-base">
                  {formatCurrency(scpi.capitalization)}
                </td>
                <td className={`px-4 py-4 text-center text-gray-900 text-sm md:text-base ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                  {formatCurrency(scpi.price)}
                </td>
                <td className={`px-4 py-4 text-center text-gray-900 text-sm md:text-base ${!showAllColumns ? 'hidden md:table-cell' : ''}`}>
                  {formatNumber(scpi.fees)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-xl text-gray-600 font-semibold mb-2">
            Aucune SCPI ne correspond à votre recherche
          </p>
          <p className="text-gray-500">
            Essayez avec un autre nom de SCPI ou de société de gestion
          </p>
        </div>
      )}

      {/* Disclaimer de conformité */}
      {filteredAndSorted.length > 0 && (
        <div className="px-6 py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-800">Avertissement : </span>
              Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Les simulations et projections affichées sont indicatives et ne constituent ni un engagement contractuel ni une promesse de rendement.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-700">
              {filteredAndSorted.length} SCPI affichée{filteredAndSorted.length > 1 ? 's' : ''} sur {scpiList.length} au total
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cliquez sur les en-têtes pour trier les colonnes
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            Données officielles 2024
          </div>
        </div>
      </div>
    </div>
  );
}
