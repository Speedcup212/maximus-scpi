import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface MobileSelectionBarProps {
  count: number;
  onOpen: () => void;
}

const MobileSelectionBar: React.FC<MobileSelectionBarProps> = ({ count, onOpen }) => {
  if (count === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t-2 border-orange-500 shadow-2xl shadow-orange-500/20">
      <div className="px-4 py-4">
        <button
          onClick={onOpen}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Voir ma sélection ({count})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-center text-slate-400 mt-2">
          {count} SCPI sélectionnée{count > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default MobileSelectionBar;
