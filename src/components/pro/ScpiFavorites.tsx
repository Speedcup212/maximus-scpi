import { Star, Eye } from 'lucide-react';

interface FavoriteScpi {
  name: string;
  status: 'Suivie' | 'Favori' | 'En watchlist';
}

const favorites: FavoriteScpi[] = [
  { name: 'Iroko Zen', status: 'Suivie' },
  { name: 'Remake Live', status: 'Favori' },
  { name: 'Corum Origin', status: 'Suivie' },
  { name: 'Transitions Europe', status: 'En watchlist' },
];

const statusColor = (status: FavoriteScpi['status']) => {
  switch (status) {
    case 'Favori':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Suivie':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'En watchlist':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  }
};

export default function ScpiFavorites() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          SCPI préférées
        </h3>
        <button className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
          Voir tout →
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {favorites.map((scpi) => (
          <div
            key={scpi.name}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5 sm:p-3 hover:border-slate-600/80 hover:bg-slate-800/80 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
              <span className="text-[11px] sm:text-xs text-white font-medium truncate">
                {scpi.name}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border ${statusColor(scpi.status)}`}>
              <Eye className="w-2.5 h-2.5" />
              {scpi.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
