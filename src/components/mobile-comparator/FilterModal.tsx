import React, { useState } from 'react';
import { X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { categories } from '../../data/mockScpiData';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    yieldRange: [number, number];
    selectedCategories: string[];
    sortBy: 'yield' | 'price' | 'tof' | 'capitalization';
    sortOrder: 'asc' | 'desc';
  };
  onApplyFilters: (filters: {
    yieldRange: [number, number];
    selectedCategories: string[];
    sortBy: 'yield' | 'price' | 'tof' | 'capitalization';
    sortOrder: 'asc' | 'desc';
  }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      yieldRange: [0, 15] as [number, number],
      selectedCategories: [],
      sortBy: 'yield' as const,
      sortOrder: 'desc' as const
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const toggleCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col md:w-full md:max-w-lg animate-in slide-in-from-bottom duration-300 md:slide-in-from-bottom-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Filtres & Tri</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Yield Range Slider */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Rendement (Taux de Distribution)
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={localFilters.yieldRange[1]}
                onChange={(e) =>
                  setLocalFilters(prev => ({
                    ...prev,
                    yieldRange: [prev.yieldRange[0], parseFloat(e.target.value)]
                  }))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="px-3 py-1 bg-slate-100 rounded-lg font-medium text-slate-700">
                  {localFilters.yieldRange[0]}%
                </span>
                <span className="text-slate-500">à</span>
                <span className="px-3 py-1 bg-emerald-100 rounded-lg font-bold text-emerald-700">
                  {localFilters.yieldRange[1]}%
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Catégories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    localFilters.selectedCategories.includes(category)
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown className="w-4 h-4 text-slate-600" />
              <label className="text-sm font-semibold text-slate-700">
                Trier par
              </label>
            </div>
            <div className="space-y-2">
              {[
                { value: 'yield', label: 'Rendement' },
                { value: 'price', label: 'Prix' },
                { value: 'tof', label: 'Taux d\'occupation' },
                { value: 'capitalization', label: 'Capitalisation' }
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    localFilters.sortBy === option.value
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={localFilters.sortBy === option.value}
                    onChange={(e) =>
                      setLocalFilters(prev => ({
                        ...prev,
                        sortBy: e.target.value as any
                      }))
                    }
                    className="w-5 h-5 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>

            {/* Sort Order Toggle */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setLocalFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  localFilters.sortOrder === 'desc'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Décroissant
              </button>
              <button
                onClick={() => setLocalFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  localFilters.sortOrder === 'asc'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Croissant
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors active:scale-95"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
