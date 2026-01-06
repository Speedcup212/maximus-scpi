import React, { useState } from 'react';
import { Filter, Search, TrendingUp, Building, MapPin, Award, DollarSign, Calendar, Target, Zap } from 'lucide-react';
import { Filters } from '../types/scpi';

interface PremiumFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | number) => void;
  scpiCount: number;
}

const PremiumFilters: React.FC<PremiumFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  scpiCount 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Ici on pourrait implémenter une recherche textuelle
  };

  const clearAllFilters = () => {
    onFilterChange('sector', '');
    onFilterChange('geography', '');
    onFilterChange('minYield', 0);
    onFilterChange('minCapitalization', 0);
    setSearchTerm('');
  };

  const hasActiveFilters = filters.sector || filters.geography || filters.minYield > 0 || filters.minCapitalization > 0 || searchTerm;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 mb-6">
      {/* Header des filtres */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Filtres Premium</h3>
            <p className="text-sm text-gray-300">
              {scpiCount} SCPI trouvée{scpiCount > 1 ? 's' : ''}
              {hasActiveFilters && ' (filtrées)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Effacer tout
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            {isExpanded ? 'Réduire' : 'Étendre'}
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher une SCPI par nom ou société..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => onFilterChange('minYield', filters.minYield === 6 ? 0 : 6)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.minYield === 6
              ? 'bg-green-600 border-green-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Haut rendement</span>
        </button>

        <button
          onClick={() => onFilterChange('sector', filters.sector === 'sante' ? '' : 'sante')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.sector === 'sante'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span className="text-sm font-medium">Santé</span>
        </button>

        <button
          onClick={() => onFilterChange('geography', filters.geography === 'europe' ? '' : 'europe')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.geography === 'europe'
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Europe</span>
        </button>

        <button
          onClick={() => onFilterChange('minCapitalization', filters.minCapitalization === 1000000000 ? 0 : 1000000000)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.minCapitalization === 1000000000
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span className="text-sm font-medium">Grande cap.</span>
        </button>

        <button
          onClick={() => onFilterChange('sector', filters.sector === 'bureaux' ? '' : 'bureaux')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.sector === 'bureaux'
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span className="text-sm font-medium">Bureaux</span>
        </button>

        <button
          onClick={() => onFilterChange('geography', filters.geography === 'france' ? '' : 'france')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
            filters.geography === 'france'
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">France</span>
        </button>
      </div>

      {/* Filtres avancés (extensibles) */}
      {isExpanded && (
        <div className="space-y-6 pt-6 border-t border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Secteur */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Secteur d'activité
              </label>
              <select
                value={filters.sector}
                onChange={(e) => onFilterChange('sector', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous secteurs</option>
                <option value="bureaux">🏢 Bureaux</option>
                <option value="commerces">🏬 Commerces</option>
                <option value="residentiel">🏠 Résidentiel</option>
                <option value="sante">🏥 Santé</option>
                <option value="logistique">📦 Logistique</option>
                <option value="hotellerie">🏨 Hôtellerie</option>
                <option value="diversifie">🎯 Diversifié</option>
              </select>
            </div>

            {/* Géographie */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Zone géographique
              </label>
              <select
                value={filters.geography}
                onChange={(e) => onFilterChange('geography', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes zones</option>
                <option value="france">🇫🇷 France</option>
                <option value="europe">🇪🇺 Europe</option>
                <option value="international">🌍 International</option>
              </select>
            </div>

            {/* Rendement minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Rendement minimum (%)
              </label>
              <select
                value={filters.minYield}
                onChange={(e) => onFilterChange('minYield', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Tous rendements</option>
                <option value="3">≥ 3%</option>
                <option value="4">≥ 4%</option>
                <option value="5">≥ 5%</option>
                <option value="6">≥ 6% (Haut rendement)</option>
                <option value="7">≥ 7% (Très haut)</option>
              </select>
            </div>

            {/* Capitalisation minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Capitalisation minimum
              </label>
              <select
                value={filters.minCapitalization}
                onChange={(e) => onFilterChange('minCapitalization', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Toutes tailles</option>
                <option value="50000000">≥ 50M€</option>
                <option value="100000000">≥ 100M€</option>
                <option value="500000000">≥ 500M€</option>
                <option value="1000000000">≥ 1Md€ (Grandes cap.)</option>
              </select>
            </div>
          </div>

          {/* Filtres avancés supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TOF minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                TOF minimum (%)
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous TOF</option>
                <option value="90">≥ 90%</option>
                <option value="95">≥ 95% (Excellent)</option>
                <option value="98">≥ 98% (Exceptionnel)</option>
              </select>
            </div>

            {/* Année de création */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ancienneté
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes années</option>
                <option value="recent">Récentes (2020+)</option>
                <option value="etablies">Établies (2010-2019)</option>
                <option value="historiques">Historiques (avant 2010)</option>
              </select>
            </div>

            {/* Labels et certifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Award className="w-4 h-4 inline mr-1" />
                Labels & Certifications
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous labels</option>
                <option value="isr">Label ISR uniquement</option>
                <option value="no-fees">Sans frais d'entrée</option>
                <option value="european">SCPI européennes</option>
              </select>
            </div>
          </div>

          {/* Tri avancé */}
          <div className="pt-4 border-t border-gray-600">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Trier par
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Rendement ↓', value: 'yield-desc' },
                { label: 'Capitalisation ↓', value: 'cap-desc' },
                { label: 'TOF ↓', value: 'tof-desc' },
                { label: 'Création ↓', value: 'creation-desc' },
                { label: 'Nom A-Z', value: 'name-asc' },
                { label: 'Prix ↑', value: 'price-asc' }
              ].map((sort) => (
                <button
                  key={sort.value}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.sector && (
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
              Secteur: {filters.sector}
            </span>
          )}
          {filters.geography && (
            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
              Zone: {filters.geography}
            </span>
          )}
          {filters.minYield > 0 && (
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
              Rendement ≥ {filters.minYield}%
            </span>
          )}
          {filters.minCapitalization > 0 && (
            <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium">
              Cap. ≥ {filters.minCapitalization >= 1000000000 ? '1Md€' : `${filters.minCapitalization / 1000000}M€`}
            </span>
          )}
          {searchTerm && (
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
              Recherche: "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumFilters;