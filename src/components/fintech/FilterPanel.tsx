import React, { useState } from 'react';
import { X, SlidersHorizontal, MapPin, Building2, Award, TrendingUp, Euro, Crown, Shield, AlertCircle, TrendingDown, Lightbulb, Sparkles } from 'lucide-react';

export type TMIValue = 0 | 11 | 30 | 41 | 45 | null;

export interface FilterState {
  tmi: TMIValue;
  minYield: number;
  priceRange: 'all' | 'accessible' | 'standard' | 'premium';
  geographies: string[];
  sectors: string[];
  hasISR: boolean | null;
  noEntryFees: boolean;
  expertMode: boolean;
  discountRange: [number, number];
  minRanDays: number;
  maxLtv: number;
  noWaitingShares: boolean;
}

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
    onFiltersChange({
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
  };

  const getTMIAdvice = (tmi: TMIValue) => {
    if (tmi === null) {
      return {
        icon: Lightbulb,
        color: 'slate',
        text: 'Sélectionnez votre TMI pour recevoir des recommandations fiscales personnalisées.'
      };
    }
    if (tmi <= 11) {
      return {
        icon: Lightbulb,
        color: 'emerald',
        text: 'La fiscalité impacte peu votre rendement. Les SCPI françaises à haut rendement sont excellentes pour vous.'
      };
    }
    return {
      icon: Sparkles,
      color: 'amber',
      text: 'Conseil Expert : Avec votre imposition, privilégiez les SCPI Européennes (Allemagne, Espagne...) pour éviter la lourde fiscalité française.'
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

  const getDiscountColor = (value: number) => {
    if (value >= -15 && value <= -5) return 'text-emerald-400';
    if (value < -5) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
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
          </div>

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
                    Secteurs
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
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
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Décote vs Valeur de Reconstitution
                  </label>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] h-2 bg-emerald-500/20 rounded-l-lg" />
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="10"
                      step="0.5"
                      value={filters.discountRange[0]}
                      onChange={(e) => updateFilters({
                        discountRange: [parseFloat(e.target.value), filters.discountRange[1]] as [number, number]
                      })}
                      className="relative w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col items-start">
                      <span className="text-slate-400">Min</span>
                      <span className={`px-2 py-1 bg-slate-700 rounded-lg font-bold ${getDiscountColor(filters.discountRange[0])}`}>
                        {filters.discountRange[0]}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-600/20 rounded-lg border border-emerald-500/30">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium text-[10px]">Zone Opportunité: -15% à -5%</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-400">Max</span>
                      <span className={`px-2 py-1 bg-slate-700 rounded-lg font-bold ${getDiscountColor(filters.discountRange[1])}`}>
                        {filters.discountRange[1]}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Sécurité du Rendement (RAN)
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
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">
                    Endettement Maximum (LTV)
                  </label>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={filters.maxLtv}
                    onChange={(e) => updateFilters({ maxLtv: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">0%</span>
                    <span className={`px-3 py-1 rounded-lg font-bold text-white text-sm ${
                      filters.maxLtv <= 30 ? 'bg-emerald-600' : filters.maxLtv <= 40 ? 'bg-amber-600' : 'bg-red-600'
                    }`}>
                      Max {filters.maxLtv}%
                    </span>
                    <span className="text-xs text-slate-400">50%</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">Loan-to-Value : ratio d'endettement</p>
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
                      <span className="text-xs text-slate-400">Critère de sécurité liquidité</span>
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
