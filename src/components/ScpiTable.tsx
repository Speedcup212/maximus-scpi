import React from 'react';
import { TrendingUp, Star, Award } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency, formatPercentage, getPerformanceColor, getDiscountColor } from '../utils/formatters';
import { findScpiSlug } from '../utils/scpiSlugMapper';

interface ScpiTableProps {
  scpiList: Scpi[];
  selectedScpi: Scpi[];
  onScpiToggle: (scpi: Scpi) => void;
  onAnalyzeClick: (scpi: Scpi) => void;
  onScpiClick?: (slug: string) => void;
  onRdvClick?: () => void;
}

const ScpiTable: React.FC<ScpiTableProps> = ({
  scpiList,
  selectedScpi,
  onScpiToggle,
  onAnalyzeClick,
  onScpiClick
}) => {
  const isSelected = (scpi: Scpi) => selectedScpi.some(s => s.id === scpi.id);

  const handleNameClick = (e: React.MouseEvent, scpi: Scpi) => {
    e.stopPropagation();
    if (!onScpiClick) return;

    const slug = findScpiSlug(scpi.name);
    if (slug) {
      onScpiClick(slug);
    } else {
      console.warn(`No landing page found for SCPI: ${scpi.name}`);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 w-full overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/80">
          <tr>
            <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-[140px] sm:w-auto">
              SCPI
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Sect.
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Cap.
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Rdt.
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              TOF
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Prix
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Décote
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">
              Min.
            </th>
            <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-[110px] sm:w-auto">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {scpiList.map((scpi) => (
            <tr
              key={scpi.id}
              className={`cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                isSelected(scpi)
                  ? 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400'
                  : ''
              }`}
              onClick={() => onScpiToggle(scpi)}
            >
              <td className="px-2 sm:px-3 py-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-0.5">
                    <div
                      className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm break-words leading-tight hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors underline decoration-transparent hover:decoration-current"
                      onClick={(e) => handleNameClick(e, scpi)}
                    >
                      {scpi.name}
                    </div>
                  </div>
                  {scpi.isRecommended && (
                    <div className="flex items-center gap-1 mb-1">
                      <Award className="w-3 h-3 text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400" />
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        Recommandé MaximusSCPI
                      </span>
                    </div>
                  )}
                  {scpi.rating && scpi.rating >= 4 && (
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(scpi.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-300 break-words leading-tight">
                    {scpi.company}
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {scpi.isr && (
                      <span className="inline-block px-1 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded">
                        ISR
                      </span>
                    )}
                    {scpi.fees === 0 && (
                      <span className="inline-block px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded">
                        0%
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 capitalize whitespace-nowrap">
                    {scpi.sector === 'bureaux' ? 'Bur.' :
                     scpi.sector === 'commerces' ? 'Com.' :
                     scpi.sector === 'residentiel' ? 'Rés.' :
                     scpi.sector === 'logistique' ? 'Log.' :
                     scpi.sector === 'hotellerie' ? 'Hôt.' :
                     scpi.sector === 'sante' ? 'San.' : 'Mix.'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium whitespace-nowrap">
                    {scpi.geography === 'france' ? 'FR' :
                     scpi.geography === 'europe' ? 'EU' : 'INT'}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">
                  {scpi.capitalization >= 1000000000 ?
                    `${(scpi.capitalization / 1000000000).toFixed(1)}Md€` :
                    `${Math.round(scpi.capitalization / 1000000)}M€`}
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`font-bold text-xs sm:text-sm whitespace-nowrap ${getPerformanceColor(scpi.yield)}`}>
                  {scpi.yield.toFixed(2)}%
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`font-bold text-xs whitespace-nowrap ${scpi.tof >= 95 ? 'text-green-500 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {scpi.tof}%
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">
                  {scpi.price}€
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`font-bold text-xs whitespace-nowrap ${getDiscountColor(scpi.discount)}`}>
                  {scpi.discount > 0 ? '+' : ''}{scpi.discount.toFixed(1)}%
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap">
                  {scpi.minInvest >= 1000 ? `${scpi.minInvest/1000}k€` : `${scpi.minInvest}€`}
                </span>
              </td>
              <td className="px-1 py-2">
                <div className="flex flex-col gap-1 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyzeClick(scpi);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors min-h-[32px] w-full"
                  >
                    <span className="text-xs">📊 Analyser</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScpiToggle(scpi);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs font-semibold rounded transition-colors min-h-[32px] w-full ${
                      isSelected(scpi)
                        ? 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
                        : 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600'
                    }`}
                  >
                    {isSelected(scpi) ? (
                      <>
                        <span className="text-xs">❌ Retirer</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs">✅ Sélectionner</span>
                      </>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScpiTable;