import React from 'react';
import { X, SlidersHorizontal, MapPin, Building2, Award, TrendingUp, Euro, Crown, Shield, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
import {
  createDefaultComparatorFilters,
  updateFilterRange,
  type FilterRange,
  type FilterState,
  type TMIValue,
} from '../../utils/comparatorFilters';

export type { FilterState, TMIValue, SectorThreshold } from '../../utils/comparatorFilters';

const readNumber = (value: string): number | null =>
  value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

const numericInputClass = 'w-full min-w-0 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500';

const RangeInputs: React.FC<{
  label: string;
  id: string;
  value: FilterRange;
  onChange: (range: FilterRange) => void;
  min?: number;
  helperText?: string;
}> = ({ label, id, value, onChange, min, helperText }) => (
  <fieldset>
    <legend className="text-sm font-semibold text-slate-200 mb-3">{label}</legend>
    <div className="grid grid-cols-2 gap-3">
      {(['Minimum', 'Maximum'] as const).map((bound, index) => (
        <div key={bound}>
          <label htmlFor={`${id}-${index}`} className="block text-xs text-slate-400 mb-1.5">
            {bound}
          </label>
          <input
            id={`${id}-${index}`}
            aria-label={`${label} — ${bound.toLowerCase()}`}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            type="number"
            inputMode="decimal"
            min={min}
            step="any"
            value={value[index] ?? ''}
            placeholder={index === 0 ? 'Sans minimum' : 'Sans maximum'}
            onChange={e => {
              const parsed = readNumber(e.target.value);
              const next = parsed !== null && min !== undefined ? Math.max(min, parsed) : parsed;
              onChange(updateFilterRange(value, index as 0 | 1, next));
            }}
            className={numericInputClass}
          />
        </div>
      ))}
    </div>
    {helperText && <p id={`${id}-helper`} className="mt-2 text-xs leading-relaxed text-slate-400">{helperText}</p>}
  </fieldset>
);

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
}

const GEOGRAPHY_OPTIONS = ['France', 'Europe', 'International'];

// Secteurs principaux avec leurs variantes de noms
const SECTOR_OPTIONS = [
  { label: 'Bureaux', keywords: ['bureau', 'tertiaire'] },
  { label: 'Commerces', keywords: ['commerce', 'retail', 'alimentaire', 'galerie'] },
  { label: 'Logistique', keywords: ['logistique', 'entrepôt', 'entrepot', 'activité', 'activite', 'transport', 'messagerie'] },
  { label: 'Santé', keywords: ['santé', 'sante', 'ehpad', 'clinique', 'hôpital', 'hopital', 'médical', 'medical'] },
  { label: 'Résidentiel', keywords: ['résidentiel', 'residentiel', 'logement', 'habitation', 'résidence', 'residence'] },
  { label: 'Hôtellerie', keywords: ['hôtel', 'hotel', 'hotellerie', 'tourisme', 'loisir', 'séminaire', 'seminaire'] },
  { label: 'Éducation', keywords: ['éducation', 'education', 'enseignement', 'école', 'ecole', 'université', 'universite'] }
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultCount
}) => {
  if (!isOpen) return null;

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleGeography = (geo: string) => {
    const newGeographies = filters.geographies.includes(geo)
      ? filters.geographies.filter(g => g !== geo)
      : [...filters.geographies, geo];
    updateFilters({ geographies: newGeographies });
  };

  const toggleSector = (sectorLabel: string) => {
    const newSectors = filters.sectors.includes(sectorLabel)
      ? filters.sectors.filter(s => s !== sectorLabel)
      : [...filters.sectors, sectorLabel];
    updateFilters({ sectors: newSectors });
  };

  const handleReset = () => {
    onFiltersChange(createDefaultComparatorFilters());
  };

  const getTMIAdvice = (tmi: TMIValue) => {
    if (tmi === null) {
      return {
        icon: Lightbulb,
        color: 'slate',
        text: 'Sélectionnez votre TMI pour afficher des repères fiscaux généraux. La TMI seule ne suffit pas à déterminer une allocation.'
      };
    }
    if (tmi <= 11) {
      return {
        icon: Lightbulb,
        color: 'emerald',
        text: 'À TMI faible, la fiscalité des revenus fonciers français pèse généralement moins fortement. Rendement, frais, liquidité et diversification restent à analyser.'
      };
    }
    return {
      icon: Sparkles,
      color: 'amber',
      text: 'À TMI élevée, les SCPI investies hors de France peuvent présenter un traitement fiscal différent selon les pays et les conventions fiscales. Comparez le résultat net au cas par cas.'
    };
  };

  const tmiOptions: { value: TMIValue; label: string }[] = [
    { value: 0, label: '0%' },
    { value: 11, label: '11%' },
    { value: 30, label: '30%' },
    { value: 41, label: '41%' },
    { value: 45, label: '45%' }
  ];

  const advice = getTMIAdvice(filters.tmi);

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[480px] bg-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300 max-h-screen">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Filtres Avancés</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 border-2 border-emerald-500/30 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Votre Tranche Marginale d'Imposition</h3>
                <p className="text-xs text-slate-400">Optimisation fiscale personnalisée</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {tmiOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ tmi: option.value })}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    filters.tmi === option.value
                      ? 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
              advice.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30' :
              advice.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-slate-700/50 border-slate-600'
            }`}>
              <advice.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                advice.color === 'emerald' ? 'text-emerald-400' :
                advice.color === 'amber' ? 'text-amber-400' :
                'text-slate-400'
              }`} />
              <p className={`text-sm leading-relaxed ${
                advice.color === 'emerald' ? 'text-emerald-200' :
                advice.color === 'amber' ? 'text-amber-200' :
                'text-slate-300'
              }`}>
                {advice.text}
              </p>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Résultats trouvés</span>
              <span className="text-2xl font-bold text-emerald-400">{resultCount}</span>
            </div>
            {resultCount === 0 && (
              <p role="status" className="mt-3 text-xs leading-relaxed text-amber-200">
                Aucune SCPI ne correspond à ces critères. Réduisez le seuil de capitalisation ou réinitialisez les filtres.
              </p>
            )}
          </div>

          <section aria-labelledby="financial-filters-title" className="rounded-xl border border-slate-600 bg-slate-800/50 p-4 space-y-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <h3 id="financial-filters-title" className="text-lg font-bold text-white">Capital, valorisation & revenus</h3>
            </div>

            <RangeInputs
              label="Capitalisation (M€)"
              id="capitalization"
              helperText="Valeurs en millions d’euros : 100 = 100 millions € ; 1 000 = 1 milliard € ; 10 000 = 10 milliards €."
              min={0}
              value={filters.capitalizationRange}
              onChange={capitalizationRange => updateFilters({ capitalizationRange })}
            />

            <div className="space-y-2">
              <RangeInputs
                label="Décote / surcote (%)"
                id="discount"
                value={filters.discountRange}
                onChange={discountRange => updateFilters({ discountRange })}
              />
              <p className="text-xs text-slate-400">Écart à la valeur de reconstitution : négatif = décote, positif = surcote.</p>
            </div>

            <div>
              <label htmlFor="max-ltv" className="block text-sm font-semibold text-slate-200 mb-3">
                Endettement maximal (%)
              </label>
              <input
                id="max-ltv"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="any"
                value={filters.maxLtv ?? ''}
                placeholder="Sans limite"
                onChange={e => {
                  const value = readNumber(e.target.value);
                  updateFilters({ maxLtv: value === null ? null : Math.max(0, Math.min(100, value)) });
                }}
                className={numericInputClass}
              />
            </div>

            <div>
              <label htmlFor="max-jouissance" className="block text-sm font-semibold text-slate-200 mb-3">
                Délai de jouissance maximal (mois)
              </label>
              <input
                id="max-jouissance"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={filters.maxJouissanceMonths ?? ''}
                placeholder="Sans limite"
                onChange={e => {
                  const value = readNumber(e.target.value);
                  updateFilters({ maxJouissanceMonths: value === null ? null : Math.max(0, value) });
                }}
                className={numericInputClass}
              />
              <p className="mt-2 text-xs text-slate-400">Délai avant le début des droits aux revenus.</p>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Un champ vide laisse le critère libre. Lorsqu'un critère est renseigné, les SCPI sans donnée exploitable pour ce critère sont exclues des résultats.
            </p>
          </section>

          <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-xl p-4 border border-amber-700/50">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-sm font-bold text-amber-200 block">Mode Expert (CGP)</span>
                  <span className="text-xs text-amber-400/70">Critères avancés professionnels</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateFilters({ expertMode: !filters.expertMode });
                }}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  filters.expertMode ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    filters.expertMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-white">Performance & Budget</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Rendement Minimum
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.minYield}
                    onChange={(e) => updateFilters({ minYield: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">0%</span>
                    <span className="px-3 py-1 bg-emerald-600 rounded-lg font-bold text-white">
                      Min {filters.minYield}%
                    </span>
                    <span className="text-sm text-slate-400">10%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Prix de la Part
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Tout', icon: Euro },
                    { value: 'accessible', label: 'Accessible (< 300€)', icon: Euro },
                    { value: 'standard', label: 'Standard (300€ - 1000€)', icon: Euro },
                    { value: 'premium', label: 'Premium (> 1000€)', icon: Euro }
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        filters.priceRange === option.value
                          ? 'border-emerald-500 bg-emerald-600/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={filters.priceRange === option.value}
                        onChange={(e) => updateFilters({ priceRange: e.target.value as any })}
                        className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-emerald-500 bg-slate-600 border-slate-500"
                      />
                      <option.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-white flex-1">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-white">Stratégie</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Géographie
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GEOGRAPHY_OPTIONS.map(geo => (
                    <button
                      key={geo}
                      onClick={() => toggleGeography(geo)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.geographies.includes(geo)
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {geo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Secteurs d'activité
                  </label>
                </div>
                
                {/* Sélecteur de seuil de pondération */}
                {filters.sectors.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Seuil minimum d'exposition
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'any' as const, label: 'Toute exposition', desc: '≥0%' },
                        { value: '10' as const, label: 'Modérée', desc: '≥10%' },
                        { value: '25' as const, label: 'Significative', desc: '≥25%' },
                        { value: '50' as const, label: 'Dominante', desc: '≥50%' },
                        { value: '80' as const, label: 'Pure player', desc: '≥80%' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateFilters({ sectorThreshold: option.value })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            filters.sectorThreshold === option.value
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                              : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-[10px] opacity-80">{option.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boutons de sélection des secteurs */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {SECTOR_OPTIONS.map(sector => (
                    <button
                      key={sector.label}
                      onClick={() => toggleSector(sector.label)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.sectors.includes(sector.label)
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {sector.label}
                    </button>
                  ))}
                </div>

                {/* Texte pédagogique */}
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-200 leading-relaxed">
                      <p className="font-semibold mb-1">Allocation sectorielle intelligente</p>
                      <p>
                        Ce filtre vous permet de cibler les SCPI selon leur exposition réelle à un secteur. 
                        Plus le seuil est élevé, plus la SCPI est spécialisée dans le secteur choisi. 
                        Les résultats sont triés par pertinence pour faciliter votre analyse patrimoniale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-white">Avancé</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-white block">Label ISR</span>
                    <span className="text-xs text-slate-400">Investissement Socialement Responsable</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateFilters({ hasISR: filters.hasISR === true ? null : true });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    filters.hasISR === true ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      filters.hasISR === true ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-white block">Sans frais d'entrée</span>
                    <span className="text-xs text-slate-400">0% de frais de souscription</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.noEntryFees}
                  onChange={(e) => updateFilters({ noEntryFees: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-2 focus:ring-emerald-500 bg-slate-600 border-slate-500"
                />
              </label>
            </div>
          </div>

          {filters.expertMode && (
            <div className="bg-slate-800/50 rounded-xl p-6 border-2 border-amber-700/30 space-y-6 animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-700/30">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-200">Critères Professionnels</h3>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Réserves de distribution (RAN)
                  </label>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={filters.minRanDays}
                    onChange={(e) => updateFilters({ minRanDays: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">0 jours</span>
                    <span className="px-3 py-1 bg-amber-600 rounded-lg font-bold text-white text-sm">
                      Min {filters.minRanDays} jours
                    </span>
                    <span className="text-xs text-slate-400">120 jours</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">Report à Nouveau : réserves de distribution</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Liquidité
                  </label>
                </div>
                <label className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-sm font-medium text-white block">Aucune part en attente de retrait</span>
                      <span className="text-xs text-slate-400">Indicateur de marché des parts</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.noWaitingShares}
                    onChange={(e) => updateFilters({ noWaitingShares: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-2 focus:ring-amber-500 bg-slate-600 border-slate-500"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 transition-all"
          >
            Voir les {resultCount} SCPI
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
