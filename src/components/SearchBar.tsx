import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Rechercher une SCPI..."
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-gray-700/50 border border-cyan-200/60 dark:border-cyan-500/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 dark:focus:ring-cyan-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-gray-700/70 backdrop-blur-sm transition-all shadow-sm focus:shadow-cyan-500/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-cyan-500 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
