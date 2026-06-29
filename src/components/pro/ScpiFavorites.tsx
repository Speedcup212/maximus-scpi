import { useState, useEffect } from 'react';
import { Star, TrendingUp, Building2, X, ArrowRight, BarChart3, Plus } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { getFavoriteScpis, removeFavoriteScpi } from '../../utils/proFavorites';
import { resolveDisplayedDiscount } from '../../utils/formatters';

interface ScpiFavoritesProps {
  onNavigateToComparator?: () => void;
}

export default function ScpiFavorites({ onNavigateToComparator }: ScpiFavoritesProps = {}) {
  const [favorites, setFavorites] = useState<SCPIExtended[]>(getFavoriteScpis);

  useEffect(() => {
    const handler = () => setFavorites(getFavoriteScpis());
    window.addEventListener('maximus-pro-favorites-updated', handler);
    return () => window.removeEventListener('maximus-pro-favorites-updated', handler);
  }, []);

  const handleRemove = (id: number) => {
    removeFavoriteScpi(id);
    setFavorites(getFavoriteScpis());
  };

  // ── État vide ──
  if (favorites.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 sm:p-12 text-center">
        <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Aucune SCPI préférée</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Ajoutez des SCPI à vos préférées depuis le comparateur Pro pour les retrouver ici rapidement.
        </p>
        <button
          onClick={onNavigateToComparator}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Accéder au comparateur
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Grille de favoris ──
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">SCPI préférées</h1>
          <p className="text-xs text-slate-400">
            {favorites.length} SCPI{favorites.length > 1 ? 's' : ''} dans votre bibliothèque cabinet
          </p>
        </div>
        <button
          onClick={onNavigateToComparator}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {favorites.map((scpi) => {
          const discountInfo = resolveDisplayedDiscount(scpi);
          const hasDiscount = discountInfo.displayValue != null && discountInfo.displayValue !== 0;
          const isPositive = (discountInfo.displayValue ?? 0) > 0;

          return (
            <div
              key={scpi.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-800/30 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{scpi.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">{scpi.managementCompany}</p>
                </div>
                <button
                  onClick={() => handleRemove(scpi.id)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                  title="Retirer des préférées"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Métriques */}
              <div className="p-3 sm:p-4 space-y-3">
                {/* Rendement — mis en avant */}
                <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] sm:text-xs text-slate-400">Rendement</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</span>
                </div>

                {/* Grille 2 colonnes */}
                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                  <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                    <p className="text-slate-500 mb-0.5">Prix part</p>
                    <p className="font-semibold text-white">{scpi.price}€</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                    <p className="text-slate-500 mb-0.5">Invest. min.</p>
                    <p className="font-semibold text-white">{scpi.minInvestment.toLocaleString('fr-FR')}€</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                    <p className="text-slate-500 mb-0.5">TOF</p>
                    <p className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : 'text-red-400'}`}>
                      {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                    <p className="text-slate-500 mb-0.5">Capitalisation</p>
                    <p className="font-semibold text-white truncate">{scpi.capitalization}</p>
                  </div>
                </div>

                {/* Décote / Surcote */}
                {hasDiscount && (
                  <div className={`rounded-lg px-3 py-2 text-[10px] sm:text-xs font-medium ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {discountInfo.label} : {discountInfo.displayValue != null ? `${discountInfo.displayValue.toFixed(1)}%` : '—'}
                  </div>
                )}

                {/* Catégorie */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400">{scpi.category}</span>
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    scpi.category === 'Européenne' ? 'bg-yellow-500/20 text-yellow-400' :
                    scpi.category === 'Diversifiée' ? 'bg-blue-500/20 text-blue-400' :
                    scpi.category === 'Santé' ? 'bg-pink-500/20 text-pink-400' :
                    scpi.category === 'Bureaux' ? 'bg-indigo-500/20 text-indigo-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {scpi.category}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 sm:p-4 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onNavigateToComparator}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs font-medium rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Comparer
                  </button>
                  <button
                    onClick={() => handleRemove(scpi.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[10px] sm:text-xs rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
