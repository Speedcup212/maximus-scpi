import React from 'react';
import { Check, Plus, BarChart3, Sparkles, MapPin } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { TMIValue, isEuropeanSCPI, calculateNetYield, shouldOptimizeForTax } from '../../utils/taxOptimization';
import { getGeographyColorScheme, PERFORMANCE_COLORS, getSectorOutlineColor } from '../../utils/scpiColors';
import { getDominantGeography } from '../../utils/dominantGeography';

interface SCPITableRowProps {
  scpi: SCPIExtended;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAnalyze: () => void;
  userTmi?: TMIValue;
  onGuidedJourneyClick?: () => void;
}

const SCPITableRow: React.FC<SCPITableRowProps> = ({ scpi, isSelected, onToggleSelect, onAnalyze, userTmi = null, onGuidedJourneyClick }) => {
  const isEuropean = isEuropeanSCPI(scpi);
  const showTaxOptimization = shouldOptimizeForTax(userTmi) && isEuropean;
  const netYield = userTmi !== null ? calculateNetYield(scpi.yield, userTmi, isEuropean) : null;
  
  // Système de couleurs basé sur la géographie dominante
  const geoColors = getGeographyColorScheme(scpi);
  const dominantGeo = getDominantGeography(scpi);

  // Secteurs en mode discret (outline uniquement)
  const getSectorColor = (sectorName: string) => {
    const outline = getSectorOutlineColor(sectorName);
    return `${outline.border} ${outline.text} bg-transparent`;
  };

  // Get main sector (highest percentage)
  const mainSector = scpi.sectors && scpi.sectors.length > 0 
    ? [...scpi.sectors].sort((a, b) => b.value - a.value)[0]
    : null;

  return (
    <tr
      className={`border-b transition-colors relative ${
        isSelected
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
      }`}
      style={{
        borderLeft: `3px solid ${geoColors.primary}`
      }}
    >
      <td className="px-4 py-3">
        <div>
          <div className="font-bold text-white text-sm truncate">{scpi.name}</div>
          <div className="text-xs text-slate-400 truncate">{scpi.managementCompany}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          {/* Badge Géographie Dominante */}
          <span 
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${geoColors.badgeBg} ${geoColors.badgeText} ${geoColors.badgeBorder} w-fit`}
          >
            <MapPin className="w-3 h-3" />
            {dominantGeo.label}
          </span>
          
          {/* Secteur principal - Discret (outline) */}
          {mainSector && (
            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium border ${getSectorColor(mainSector.name)} w-fit`}>
              {mainSector.name} {mainSector.value.toFixed(0)}%
            </span>
          )}
          
          {showTaxOptimization && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit">
              <Sparkles className="w-3 h-3" />
              TMI {userTmi}%+
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className={`text-base font-bold ${PERFORMANCE_COLORS.text}`}>{scpi.yield.toFixed(2)}%</div>
          {netYield !== null && (
            <div className="text-xs text-slate-400">
              Net: <span className={`font-semibold ${PERFORMANCE_COLORS.textBold}`}>{netYield.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{scpi.tof}%</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{scpi.price}€</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white truncate">{scpi.minInvestment.toLocaleString('fr-FR')}€</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSelect}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : `bg-gradient-to-r ${PERFORMANCE_COLORS.bgGradient} hover:from-emerald-700 hover:to-emerald-600 text-white`
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Choisie</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
            <button
              onClick={onAnalyze}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analyser</span>
            </button>
          </div>
          {onGuidedJourneyClick && (
            <button
              onClick={onGuidedJourneyClick}
              className={`text-xs font-medium ${PERFORMANCE_COLORS.text} hover:text-emerald-300 transition-all flex items-center gap-1 whitespace-nowrap`}
            >
              <span>👉</span>
              <span>Je préfère être guidé</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SCPITableRow;
