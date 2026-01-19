import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Building2, Plus, Check, BarChart3, Heart, Home, ShoppingCart, Package, Building, Briefcase, TreePine, Sparkles, MapPin } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { TMIValue, isEuropeanSCPI, calculateNetYield, shouldOptimizeForTax } from '../../utils/taxOptimization';
import { getGeographyColorScheme, PERFORMANCE_COLORS, getSectorOutlineColor } from '../../utils/scpiColors';
import { getDominantGeography } from '../../utils/dominantGeography';

interface SCPICardDarkProps {
  scpi: SCPIExtended;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAnalyze: () => void;
  userTmi?: TMIValue;
  onGuidedJourneyClick?: () => void;
}

const SCPICardDark: React.FC<SCPICardDarkProps> = ({ scpi, isSelected, onToggleSelect, onAnalyze, userTmi = null, onGuidedJourneyClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isEuropean = isEuropeanSCPI(scpi);
  const showTaxOptimization = shouldOptimizeForTax(userTmi) && isEuropean;
  const netYield = userTmi !== null ? calculateNetYield(scpi.yield, userTmi, isEuropean) : null;
  
  // Système de couleurs basé sur la géographie dominante
  const geoColors = getGeographyColorScheme(scpi);
  const dominantGeo = getDominantGeography(scpi);

  const getSectorIcon = (sectorName: string) => {
    const name = sectorName.toLowerCase();
    if (name.includes('santé') || name.includes('ehpad')) return Heart;
    if (name.includes('résidentiel') || name.includes('habitation')) return Home;
    if (name.includes('commerce') || name.includes('retail')) return ShoppingCart;
    if (name.includes('logistique') || name.includes('entrepôt')) return Package;
    if (name.includes('bureau')) return Briefcase;
    if (name.includes('hôtel') || name.includes('tourisme')) return Building;
    if (name.includes('éducation') || name.includes('école')) return Building2;
    return TreePine;
  };

  // Secteurs en mode discret (outline uniquement)
  const getSectorColor = (sectorName: string) => {
    const outline = getSectorOutlineColor(sectorName);
    return {
      bg: outline.bg,
      text: outline.text,
      border: outline.border,
      icon: outline.text
    };
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diversifiée': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Résidentiel': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Santé': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bureaux': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Européenne': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Logistique': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  // Sort sectors once by value (descending)
  const sortedSectors = scpi.sectors && scpi.sectors.length > 0
    ? [...scpi.sectors].sort((a, b) => b.value - a.value)
    : [];

  // Get top 3 sectors
  const topSectors = sortedSectors.slice(0, 3);

  // Get main sector (highest percentage)
  const mainSector = sortedSectors.length > 0 ? sortedSectors[0] : null;

  return (
    <div
      className={`bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
        isSelected ? 'border-orange-500 shadow-xl shadow-orange-500/20' : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Bandeau géographie dominante - Couleur principale */}
      <div 
        className="h-1.5"
        style={{ backgroundColor: geoColors.primary }}
      />

      {/* Header - Compact */}
      <div className={`p-3 border-b transition-colors ${
        isSelected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-900/50 border-slate-700'
      }`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${geoColors.primary}20` }}
            >
              <Building2 className="w-5 h-5" style={{ color: geoColors.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white leading-tight truncate">{scpi.name}</h3>
              <p className="text-xs text-slate-400 truncate">{scpi.managementCompany}</p>
            </div>
          </div>
          {isSelected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold flex-shrink-0">
              <Check className="w-3 h-3" />
              <span>Choisie</span>
            </div>
          )}
        </div>

        {/* Badge Géographie Dominante */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span 
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${geoColors.badgeBg} ${geoColors.badgeText} ${geoColors.badgeBorder}`}
          >
            <MapPin className="w-3 h-3" />
            {dominantGeo.label}
          </span>
          {showTaxOptimization && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              Optimisé TMI {userTmi}%+
            </span>
          )}
        </div>

        {/* Secteur principal - Discret (outline) */}
        {mainSector && (
          <div className="flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium border ${getSectorColor(mainSector.name).border} ${getSectorColor(mainSector.name).text} bg-transparent`}>
              {mainSector.name} {mainSector.value.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Hero Yield - Performance (Vert uniquement) */}
      <div className={`bg-gradient-to-br ${PERFORMANCE_COLORS.bgGradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide mb-0.5">
              Taux de Distribution
            </p>
            <p className="text-4xl font-bold">{scpi.yield.toFixed(2)}%</p>
            {netYield !== null && (
              <div className="mt-2 pt-2 border-t border-emerald-400/30">
                <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide mb-0.5">
                  Rendement Net Estimé (TMI {userTmi}%)
                </p>
                <p className="text-2xl font-bold text-emerald-50">
                  {netYield.toFixed(2)}%
                </p>
                {isEuropean && (
                  <p className="text-xs text-emerald-100 mt-1 opacity-90">
                    Fiscalité européenne favorable
                  </p>
                )}
              </div>
            )}
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200 opacity-40" />
        </div>
      </div>

      {/* Primary Metrics - Compact */}
      <div className="p-3 grid grid-cols-2 gap-3 bg-slate-900/30">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Prix de la part</p>
          <p className="text-lg font-bold text-white">{scpi.price}€</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Investissement min.</p>
          <p className="text-lg font-bold text-white">{scpi.minInvestment.toLocaleString('fr-FR')}€</p>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="p-3 bg-slate-900/50 border-t border-slate-700 space-y-3">
          {/* Top Sectors - Mini barres horizontales discrètes */}
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Répartition Sectorielle
            </p>
            <div className="space-y-2">
              {topSectors.map((sector) => {
                const Icon = getSectorIcon(sector.name);
                const colors = getSectorColor(sector.name);
                return (
                  <div
                    key={sector.name}
                    className="group relative"
                    title={`${sector.name}: ${sector.value.toFixed(1)}%`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${colors.icon} flex-shrink-0`} />
                      <span className={`text-xs font-medium ${colors.text} flex-1 truncate`}>
                        {sector.name}
                      </span>
                      <span className={`text-xs font-semibold ${colors.text} flex-shrink-0`}>
                        {sector.value.toFixed(0)}%
                      </span>
                    </div>
                    {/* Mini barre horizontale */}
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${sector.value}%`,
                          backgroundColor: `${geoColors.primary}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
              <p className="text-xs text-slate-400 mb-0.5">Taux d'occupation</p>
              <p className="text-base font-bold text-white">{scpi.tof}%</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
              <p className="text-xs text-slate-400 mb-0.5">Capitalisation</p>
              <p className="text-base font-bold text-white">{scpi.capitalization}</p>
            </div>
          </div>

          {/* All Sectors List - Mini barres */}
          {sortedSectors.length > 3 && (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Tous les Secteurs
              </p>
              <div className="space-y-1.5">
                {sortedSectors
                  .slice(3)
                  .map((sector) => {
                    const Icon = getSectorIcon(sector.name);
                    const colors = getSectorColor(sector.name);
                    return (
                      <div
                        key={sector.name}
                        className="group relative"
                        title={`${sector.name}: ${sector.value.toFixed(1)}%`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon className={`w-3 h-3 ${colors.icon} flex-shrink-0`} />
                          <span className="text-xs text-slate-400 flex-1 truncate">
                            {sector.name}
                          </span>
                          <span className={`text-xs font-semibold ${colors.text} flex-shrink-0`}>
                            {sector.value.toFixed(1)}%
                          </span>
                        </div>
                        {/* Mini barre horizontale */}
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${sector.value}%`,
                              backgroundColor: `${geoColors.primary}30`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Strategy */}
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">Stratégie</p>
            <p className="text-sm text-slate-300 leading-relaxed">{scpi.strategy}</p>
          </div>
        </div>
      )}

      {/* Expand Button - Compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-300 hover:bg-slate-700/50 transition-colors border-t border-slate-700"
      >
        {isExpanded ? (
          <>
            <span>Voir moins</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <span>Voir plus de détails</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* Action Buttons - Compact */}
      <div className="p-3 space-y-2 bg-slate-900/30">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleSelect}
            className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                : `${PERFORMANCE_COLORS.bgGradient} hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg ${PERFORMANCE_COLORS.shadow}`
            } active:scale-95`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                <span>Choisie</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </>
            )}
          </button>

          <button
            onClick={onAnalyze}
            className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyser</span>
          </button>
        </div>
        
        {/* Lien vers parcours guidé */}
        {onGuidedJourneyClick && (
          <button
            onClick={onGuidedJourneyClick}
            className={`w-full py-2 px-3 text-xs font-medium ${PERFORMANCE_COLORS.text} hover:text-emerald-300 hover:${PERFORMANCE_COLORS.bgLight} rounded-lg transition-all flex items-center justify-center gap-1.5 border ${PERFORMANCE_COLORS.border} hover:border-emerald-500/40`}
          >
            <span>👉</span>
            <span>Je préfère être guidé</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SCPICardDark;
