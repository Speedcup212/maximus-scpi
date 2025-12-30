import React from 'react';
import { ShoppingBag, ArrowRight, Eye } from 'lucide-react';
import { usePortfolioContext } from '../../contexts/PortfolioContext';

interface StickySelectionFooterProps {
  onViewSelection: () => void;
}

const StickySelectionFooter: React.FC<StickySelectionFooterProps> = ({ onViewSelection }) => {
  const { portfolioCount } = usePortfolioContext();

  if (portfolioCount === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-orange-500 shadow-2xl shadow-orange-200/50 animate-in slide-in-from-bottom duration-300">
      <div className="px-4 py-4">
        <button
          onClick={onViewSelection}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Voir ma sélection ({portfolioCount})</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-center text-slate-500 mt-2">
          {portfolioCount} SCPI sélectionnée{portfolioCount > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default StickySelectionFooter;
