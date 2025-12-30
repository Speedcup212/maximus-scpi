import React from 'react';
import { Filters } from '../types/scpi';

interface AdvancedFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | number) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="flex flex-col">
        <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Secteur
        </label>
        <select
          value={filters.sector}
          onChange={(e) => onFilterChange('sector', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm"
        >
          <option value="">Tous secteurs</option>
          <option value="bureaux">Bureaux</option>
          <option value="commerces">Commerces</option>
          <option value="residentiel">Résidentiel</option>
          <option value="sante">Santé</option>
          <option value="logistique">Logistique</option>
          <option value="hotellerie">Hôtellerie</option>
          <option value="diversifie">Diversifié</option>
        </select>
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Zone géographique
        </label>
        <select
          value={filters.geography}
          onChange={(e) => onFilterChange('geography', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm"
        >
          <option value="">Toutes zones</option>
          <option value="france">France</option>
          <option value="europe">Europe</option>
          <option value="international">International</option>
        </select>
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Rendement minimum (%)
        </label>
        <input
          type="number"
          value={filters.minYield || ''}
          onChange={(e) => onFilterChange('minYield', parseFloat(e.target.value) || 0)}
          placeholder="Ex: 4.5"
          step="0.1"
          className="px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Capitalisation minimum
        </label>
        <select
          value={filters.minCapitalization}
          onChange={(e) => onFilterChange('minCapitalization', parseInt(e.target.value) || 0)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm"
        >
          <option value="">Toutes tailles</option>
          <option value="100000000">100M€ et plus</option>
          <option value="500000000">500M€ et plus</option>
          <option value="1000000000">1Md€ et plus</option>
        </select>
      </div>
    </div>
  );
};

export default AdvancedFilters;