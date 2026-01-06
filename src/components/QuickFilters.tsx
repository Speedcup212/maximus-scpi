import React from 'react';
import { QuickFilterType } from '../types/scpi';

interface QuickFiltersProps {
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters: { key: QuickFilterType; label: string }[] = [
    { key: 'tous', label: 'Toutes les SCPI' },
    { key: 'europeennes', label: 'Européennes' },
    { key: 'francaises', label: 'Françaises' },
    { key: 'isr', label: 'Label ISR' },
    { key: 'high-yield', label: 'Haut rendement' }
  ];

  const mobileFilters: { key: QuickFilterType; label: string }[] = [
    { key: 'tous', label: 'Toutes' },
    { key: 'europeennes', label: 'Européennes' },
    { key: 'isr', label: 'Label ISR' },
    { key: 'high-yield', label: 'Haut rdt' }
  ];

  return (
    <div className="mb-4 sm:mb-6">
      {/* Desktop filters */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === key
                ? 'bg-green-600 dark:bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Mobile filters */}
      <div className="flex sm:hidden overflow-x-auto gap-2 pb-2 -mx-2 px-2">
        {mobileFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === key
                ? 'bg-green-600 dark:bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickFilters;