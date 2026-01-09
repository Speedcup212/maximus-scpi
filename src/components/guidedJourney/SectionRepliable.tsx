import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SectionRepliableProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const SectionRepliable: React.FC<SectionRepliableProps> = ({
  title,
  subtitle,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isExpanded && (
        <div className="px-6 py-4 border-t border-slate-700 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionRepliable;
