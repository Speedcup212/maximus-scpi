import { useState, useEffect, useMemo } from 'react';
import {
  Star, TrendingUp, Building2, X, BarChart3,
  CheckSquare, Square, Search, Grid3x3, List,
} from 'lucide-react';
import { SCPIExtended, scpiDataExtended } from '../../data/scpiDataExtended';
import { getFavoriteScpis, getFavoriteScpiIds, removeFavoriteScpi, addFavoriteScpi } from '../../utils/proFavorites';
import { resolveDisplayedDiscount } from '../../utils/formatters';
import { computeClientScores } from '../../utils/computeClientScores';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

interface ScpiFavoritesProps {
  onNavigateToComparator?: () => void;
  onAnalyzeScpi?: (scpi: SCPIExtended) => void;
}

type TabMode = 'mes-favorites' | 'ajouter';

/* ──────────────────────────────────────────
   Helper : secteur dominant
   ────────────────────────────────────────── */

function getDominantSector(scpi: SCPIExtended): { name: string; pct: number } | null {
  if (!scpi.sectors || scpi.sectors.length === 0) return null;
  const sorted = [...scpi.sectors].sort((a, b) => b.value - a.value);
  return { name: sorted[0].name, pct: Math.round(sorted[0].value) };
}

function getSectorDisplay(scpi: SCPIExtended): string {
  const dominant = getDominantSector(scpi);
  if (dominant) return `${dominant.name} ${dominant.pct}%`;
  return `Profil : ${scpi.category}`;
}

/* ──────────────────────────────────────────
   Sous-composant : carte d'une favorite
   ────────────────────────────────────────── */

function FavoriteCard({ scpi, onRemove, onNavigateToComparator, onOpenDetail, onToggleCompare, isInComparison }: {
  scpi: SCPIExtended;
  onRemove: (id: number) => void;
  onNavigateToComparator?: () => void;
  onOpenDetail?: (scpi: SCPIExtended) => void;
  onToggleCompare?: (scpi: SCPIExtended) => void;
  isInComparison?: boolean;
}) {
  const discountInfo = resolveDisplayedDiscount(scpi);
  const hasDiscount = discountInfo.displayValue != null && discountInfo.displayValue !== 0;
  const isPositive = (discountInfo.displayValue ?? 0) > 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-800/30 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white truncate">{scpi.name}</h3>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">{scpi.managementCompany}</p>
        </div>
        <button
          onClick={() => onRemove(scpi.id)}
          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
          title="Retirer des préférées"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Métriques */}
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] sm:text-xs text-slate-400">Rendement</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</span>
        </div>

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

        {hasDiscount && (
          <div className={`rounded-lg px-3 py-2 text-[10px] sm:text-xs font-medium ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {discountInfo.label} : {discountInfo.displayValue != null ? `${discountInfo.displayValue.toFixed(1)}%` : '—'}
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <Building2 className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">Secteur dominant</span>
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
            {getSectorDisplay(scpi)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 sm:p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => onOpenDetail?.(scpi)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 text-[10px] sm:text-xs rounded-lg transition-colors"
          title="Analyser cette SCPI"
        >
          <BarChart3 className="w-3 h-3" />
          Analyser
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggleCompare?.(scpi)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] sm:text-xs font-medium rounded-lg transition-colors ${
              isInComparison
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            {isInComparison ? 'Comparée' : 'Comparer'}
          </button>
          <button
            onClick={() => onRemove(scpi.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[10px] sm:text-xs rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            Retirer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Composant principal
   ────────────────────────────────────────── */

export default function ScpiFavorites({ onNavigateToComparator, onAnalyzeScpi }: ScpiFavoritesProps = {}) {
  const [tab, setTab] = useState<TabMode>('mes-favorites');
  const [favorites, setFavorites] = useState<SCPIExtended[]>(getFavoriteScpis);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => getFavoriteScpiIds());

  /* ---------- Onglet Ajouter ---------- */
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  /* ---------- Mode d'affichage (Mes préférées) ---------- */
  const VIEW_MODE_KEY = 'maximus_pro_favorites_view_mode';
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_KEY);
      if (stored === 'cards' || stored === 'list') return stored;
    } catch { /* localStorage indisponible */ }
    return 'list';
  });

  /* ---------- Comparaison SCPI (local, max 6) ---------- */
  const [compareScpis, setCompareScpis] = useState<SCPIExtended[]>([]);
  const comparisonIds = useMemo(() => new Set(compareScpis.map(s => s.id)), [compareScpis]);

  // Scores MaximusSCPI pour le tableau comparatif
  const comparisonScores = useMemo(() => {
    if (compareScpis.length === 0) return {};
    const { bySlug } = computeClientScores(scpiDataExtended);
    return bySlug;
  }, [compareScpis]);

  /* ── Couleurs pour les camemberts ── */
  const PRO_PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  /* ── Agrégation sectorielle équipondérée ── */
  const comparisonSectorData = useMemo(() => {
    if (compareScpis.length === 0) return [] as Array<{ name: string; value: number }>;
    const acc: Record<string, number> = {};
    compareScpis.forEach(scpi => {
      if (scpi.sectors && scpi.sectors.length > 0) {
        scpi.sectors.forEach(s => { acc[s.name] = (acc[s.name] || 0) + s.value; });
      }
    });
    const entries = Object.entries(acc).map(([name, total]) => ({ name, value: Math.round(total / compareScpis.length * 10) / 10 }));
    entries.sort((a, b) => b.value - a.value);
    return entries.length > 0 ? entries : [];
  }, [compareScpis]);

  /* ── Agrégation géographique équipondérée ── */
  const comparisonGeoData = useMemo(() => {
    if (compareScpis.length === 0) return [] as Array<{ name: string; value: number }>;
    const acc: Record<string, number> = {};
    compareScpis.forEach(scpi => {
      if (scpi.geography && scpi.geography.length > 0) {
        scpi.geography.forEach(g => { acc[g.name] = (acc[g.name] || 0) + g.value; });
      }
    });
    const entries = Object.entries(acc).map(([name, total]) => ({ name, value: Math.round(total / compareScpis.length * 10) / 10 }));
    entries.sort((a, b) => b.value - a.value);
    return entries.length > 0 ? entries : [];
  }, [compareScpis]);

  const toggleCompare = (scpi: SCPIExtended) => {
    setCompareScpis(prev => {
      const exists = prev.find(s => s.id === scpi.id);
      if (exists) return prev.filter(s => s.id !== scpi.id);
      if (prev.length >= 6) {
        if (typeof window !== 'undefined') {
          window.alert('Maximum 6 SCPI en comparaison.');
        }
        return prev;
      }
      return [...prev, scpi];
    });
  };

  const handleRemoveFromComparison = (id: number) => {
    setCompareScpis(prev => prev.filter(s => s.id !== id));
  };

  // Toutes les SCPI triées par nom
  const allScpis = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return scpiDataExtended
      .filter(s => !searchLower || s.name.toLowerCase().includes(searchLower))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search]);

  /* ---------- Sync ---------- */
  useEffect(() => {
    const handler = () => {
      setFavorites(getFavoriteScpis());
      setFavoriteIds(getFavoriteScpiIds());
    };
    window.addEventListener('maximus-pro-favorites-updated', handler);
    return () => window.removeEventListener('maximus-pro-favorites-updated', handler);
  }, []);

  // Persister le mode d'affichage dans localStorage
  useEffect(() => {
    try { localStorage.setItem(VIEW_MODE_KEY, viewMode); } catch { /* ignore */ }
  }, [viewMode]);

  const handleRemove = (id: number) => {
    removeFavoriteScpi(id);
    setFavorites(prev => prev.filter(favorite => favorite.id !== id));
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  /* ---------- Ajout multiple ---------- */
  const toggleCheck = (id: number) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAdd = () => {
    if (checkedIds.size === 0) return;
    checkedIds.forEach(id => addFavoriteScpi(id));
    setCheckedIds(new Set());
    // Mise à jour immédiate de l'état local + bascule sur l'onglet "Mes SCPI préférées"
    setFavorites(getFavoriteScpis());
    setFavoriteIds(getFavoriteScpiIds());
    setTab('mes-favorites');
  };

  /* ---------- Rendu onglets ---------- */

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + Onglets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">SCPI préférées</h1>
          <p className="text-xs text-slate-400">
            {favorites.length} SCPI{favorites.length > 1 ? 's' : ''} dans votre bibliothèque cabinet
          </p>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setTab('mes-favorites')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'mes-favorites'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Star className="w-3 h-3 inline mr-1.5" />
            Mes SCPI préférées
            {favorites.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('ajouter')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'ajouter'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CheckSquare className="w-3 h-3 inline mr-1.5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAB : Mes SCPI préférées
          ══════════════════════════════════════════ */}
      {tab === 'mes-favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 sm:p-12 text-center">
              <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Aucune SCPI préférée</h2>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                Ajoutez des SCPI à vos préférées depuis l&rsquo;onglet &laquo; Ajouter &raquo; ou depuis le comparateur Pro.
              </p>
              <button
                onClick={() => setTab('ajouter')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Ajouter des SCPI
              </button>
            </div>
          ) : (
            <>
              {/* Toggle Carte / Liste */}
              <div className="flex items-center justify-end mb-3">
                <div className="flex gap-0.5 bg-slate-800/50 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Vue en cartes"
                  >
                    <Grid3x3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      viewMode === 'list'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Vue en liste"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode Cartes */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {favorites.map(scpi => (
                    <FavoriteCard
                      key={scpi.id}
                      scpi={scpi}
                      onRemove={handleRemove}
                      onNavigateToComparator={onNavigateToComparator}
                      onOpenDetail={onAnalyzeScpi}
                      onToggleCompare={toggleCompare}
                      isInComparison={comparisonIds.has(scpi.id)}
                    />
                  ))}
                </div>
              )}

              {/* Mode Liste */}
              {viewMode === 'list' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                          <th className="text-left py-2.5 px-3 font-medium">SCPI</th>
                          <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">Société de gestion</th>
                          <th className="text-right py-2.5 px-3 font-medium">Rendement</th>
                          <th className="text-right py-2.5 px-3 font-medium">TOF</th>
                          <th className="text-right py-2.5 px-3 font-medium">Prix part</th>
                          <th className="text-right py-2.5 px-3 font-medium hidden md:table-cell">Invest. min.</th>
                          <th className="text-right py-2.5 px-3 font-medium hidden md:table-cell">Capitalisation</th>
                          <th className="text-left py-2.5 px-3 font-medium">Secteur dominant</th>
                          <th className="text-left py-2.5 px-3 font-medium w-[180px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {favorites.map(scpi => (
                          <tr key={scpi.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* SCPI */}
                            <td className="py-3 px-3">
                              <span className="text-white font-medium truncate block max-w-[130px]">{scpi.name}</span>
                            </td>
                            {/* Société de gestion */}
                            <td className="py-3 px-3 text-slate-400 truncate max-w-[110px] hidden md:table-cell">
                              {scpi.managementCompany}
                            </td>
                            {/* Rendement */}
                            <td className="py-3 px-3 text-right">
                              <span className="text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span>
                            </td>
                            {/* TOF */}
                            <td className="py-3 px-3 text-right">
                              <span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                              </span>
                            </td>
                            {/* Prix part */}
                            <td className="py-3 px-3 text-right text-white font-semibold tabular-nums whitespace-nowrap">
                              {scpi.price != null ? `${scpi.price}€` : '—'}
                            </td>
                            {/* Invest. min. */}
                            <td className="py-3 px-3 text-right text-slate-300 tabular-nums hidden md:table-cell whitespace-nowrap">
                              {scpi.minInvestment.toLocaleString('fr-FR')}€
                            </td>
                            {/* Capitalisation */}
                            <td className="py-3 px-3 text-right text-slate-300 hidden md:table-cell whitespace-nowrap">
                              {scpi.capitalization}
                            </td>
                            {/* Secteur dominant */}
                            <td className="py-3 px-3">
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded border bg-slate-700/50 text-slate-300 border-slate-600/50 whitespace-nowrap">
                                {getSectorDisplay(scpi)}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onAnalyzeScpi?.(scpi)}
                                  className="flex items-center gap-1 py-1 px-2 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 text-[9px] rounded transition-colors whitespace-nowrap"
                                  title="Analyser cette SCPI"
                                >
                                  <BarChart3 className="w-3 h-3" />
                                  Analyser
                                </button>
                                <button
                                  onClick={() => toggleCompare(scpi)}
                                  className={`flex items-center gap-1 py-1 px-2 text-[9px] rounded transition-colors whitespace-nowrap ${
                                    comparisonIds.has(scpi.id)
                                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  }`}
                                >
                                  <BarChart3 className="w-3 h-3" />
                                  {comparisonIds.has(scpi.id) ? 'Comparée' : 'Comparer'}
                                </button>
                                <button
                                  onClick={() => handleRemove(scpi.id)}
                                  className="flex items-center gap-1 py-1 px-2 bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[9px] rounded transition-colors whitespace-nowrap"
                                  title="Retirer des préférées"
                                >
                                  <X className="w-3 h-3" />
                                  Retirer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          COMPARAISON SCPI (onglet Mes préférées)
          ══════════════════════════════════════════ */}
      {tab === 'mes-favorites' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white">Comparaison SCPI</h2>
            <p className="text-xs text-slate-400 mt-0.5">{compareScpis.length}/6 SCPI sélectionnées</p>
          </div>

          {compareScpis.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Sélectionnez jusqu'à 6 SCPI avec le bouton Comparer.</p>
            </div>
          ) : (
            <>
              {/* ── Camemberts sectoriel & géographique ── */}
              {comparisonSectorData.length > 0 || comparisonGeoData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 sm:p-4 border-b border-slate-800">
                  {/* Répartition sectorielle moyenne */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-slate-300 mb-2 text-center">Répartition sectorielle moyenne</h3>
                    {comparisonSectorData.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPie>
                            <Pie
                              data={comparisonSectorData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {comparisonSectorData.map((_entry, index) => (
                                <Cell key={index} fill={PRO_PIE_COLORS[index % PRO_PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }}
                              formatter={(value: number) => `${value} %`}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                          {comparisonSectorData.slice(0, 6).map((s, i) => (
                            <div key={s.name} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PRO_PIE_COLORS[i % PRO_PIE_COLORS.length] }} />
                              <span className="text-[10px] text-slate-400">{s.name} {s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-8">Données insuffisantes</p>
                    )}
                  </div>

                  {/* Répartition géographique moyenne */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-slate-300 mb-2 text-center">Répartition géographique moyenne</h3>
                    {comparisonGeoData.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPie>
                            <Pie
                              data={comparisonGeoData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {comparisonGeoData.map((_entry, index) => (
                                <Cell key={index} fill={PRO_PIE_COLORS[index % PRO_PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }}
                              formatter={(value: number) => `${value} %`}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                          {comparisonGeoData.slice(0, 6).map((g, i) => (
                            <div key={g.name} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PRO_PIE_COLORS[i % PRO_PIE_COLORS.length] }} />
                              <span className="text-[10px] text-slate-400">{g.name} {g.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-8">Données insuffisantes</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-slate-800 text-center">
                  <p className="text-xs text-slate-500">Données insuffisantes</p>
                </div>
              )}

              {/* ── Tableau comparatif ── */}
              <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="text-left py-2.5 px-3 font-medium">SCPI</th>
                    <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">Société de gestion</th>
                    <th className="text-right py-2.5 px-3 font-medium">Rendement</th>
                    <th className="text-right py-2.5 px-3 font-medium">TOF</th>
                    <th className="text-right py-2.5 px-3 font-medium">Prix part</th>
                    <th className="text-right py-2.5 px-3 font-medium hidden md:table-cell">Invest. min.</th>
                    <th className="text-right py-2.5 px-3 font-medium hidden md:table-cell">Capitalisation</th>
                    <th className="text-right py-2.5 px-3 font-medium">Décote / Surcote</th>
                    <th className="text-left py-2.5 px-3 font-medium">Secteur dominant</th>
                    <th className="text-right py-2.5 px-3 font-medium">Note</th>
                    <th className="text-left py-2.5 px-3 font-medium w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {compareScpis.map(scpi => {
                    const discountInfo = resolveDisplayedDiscount(scpi);
                    const slug = createSlugFromName(scpi.name);
                    const score = comparisonScores[slug];
                    return (
                      <tr key={scpi.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="text-white font-medium truncate block max-w-[130px]">{scpi.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 truncate max-w-[110px] hidden md:table-cell">
                          {scpi.managementCompany}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-white font-semibold tabular-nums whitespace-nowrap">
                          {scpi.price != null ? `${scpi.price}€` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 hidden md:table-cell whitespace-nowrap">
                          {scpi.minInvestment.toLocaleString('fr-FR')}€
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 hidden md:table-cell whitespace-nowrap">
                          {scpi.capitalization}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {discountInfo.displayValue != null && discountInfo.displayValue !== 0 ? (
                            <span className={`font-semibold tabular-nums ${discountInfo.displayValue > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {(discountInfo.displayValue > 0 ? '+' : '')}{discountInfo.displayValue.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded border bg-slate-700/50 text-slate-300 border-slate-600/50 whitespace-nowrap">
                            {getSectorDisplay(scpi)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {score != null ? (
                            <span className={`font-semibold tabular-nums ${score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                              {score.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAnalyzeScpi?.(scpi)}
                              className="flex items-center gap-1 py-1 px-2 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 text-[9px] rounded transition-colors whitespace-nowrap"
                              title="Analyser cette SCPI"
                            >
                              <BarChart3 className="w-3 h-3" />
                              Analyser
                            </button>
                            <button
                              onClick={() => handleRemoveFromComparison(scpi.id)}
                              className="flex items-center gap-1 py-1 px-2 bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[9px] rounded transition-colors whitespace-nowrap"
                              title="Retirer de la comparaison"
                            >
                              <X className="w-3 h-3" />
                              Retirer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB : Ajouter
          ══════════════════════════════════════════ */}
      {tab === 'ajouter' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Barre de recherche + bouton ajouter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une SCPI..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <button
              onClick={handleBulkAdd}
              disabled={checkedIds.size === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                checkedIds.size > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Ajouter aux préférées
              {checkedIds.size > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                  {checkedIds.size}
                </span>
              )}
            </button>
          </div>

          {/* Tableau */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="text-left py-2.5 px-3 font-medium w-10">
                      <button
                        onClick={() => {
                          const selectableIds = allScpis.filter(s => !favoriteIds.has(s.id)).map(s => s.id);
                          if (checkedIds.size === selectableIds.length && selectableIds.length > 0) {
                            setCheckedIds(new Set());
                          } else {
                            setCheckedIds(new Set(selectableIds));
                          }
                        }}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title="Tout (dé)sélectionner"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left py-2.5 px-3 font-medium"></th>
                    <th className="text-left py-2.5 px-3 font-medium">SCPI</th>
                    <th className="text-left py-2.5 px-3 font-medium">Société de gestion</th>
                    <th className="text-right py-2.5 px-3 font-medium">Rendement</th>
                    <th className="text-right py-2.5 px-3 font-medium">TOF</th>
                    <th className="text-right py-2.5 px-3 font-medium">Prix part</th>
                    <th className="text-right py-2.5 px-3 font-medium">Invest. min.</th>
                    <th className="text-right py-2.5 px-3 font-medium">Capitalisation</th>
                    <th className="text-right py-2.5 px-3 font-medium">Décote / Surcote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allScpis.map(scpi => {
                    const isAlreadyFav = favoriteIds.has(scpi.id);
                    const isChecked = checkedIds.has(scpi.id);
                    const discountInfo = resolveDisplayedDiscount(scpi);

                    return (
                      <tr
                        key={scpi.id}
                        className={`hover:bg-slate-800/40 transition-colors ${isAlreadyFav ? 'opacity-60' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => !isAlreadyFav && toggleCheck(scpi.id)}
                            disabled={isAlreadyFav}
                            className={`transition-colors ${
                              isAlreadyFav
                                ? 'text-slate-700 cursor-not-allowed'
                                : isChecked
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title={isAlreadyFav ? 'Déjà dans les préférées' : isChecked ? 'Décocher' : 'Cocher'}
                          >
                            {isAlreadyFav ? (
                              <Square className="w-3.5 h-3.5" />
                            ) : isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        {/* Étoile */}
                        <td className="py-3 px-1">
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isAlreadyFav
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </td>
                        {/* Nom */}
                        <td className="py-3 px-3">
                          <span className="text-white font-medium truncate block max-w-[140px]">{scpi.name}</span>
                        </td>
                        {/* Société de gestion */}
                        <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">{scpi.managementCompany}</td>
                        {/* Rendement */}
                        <td className="py-3 px-3 text-right">
                          <span className="text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span>
                        </td>
                        {/* TOF */}
                        <td className="py-3 px-3 text-right">
                          <span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        {/* Prix part */}
                        <td className="py-3 px-3 text-right text-white font-semibold tabular-nums">
                          {scpi.price != null ? `${scpi.price}€` : '—'}
                        </td>
                        {/* Invest. min. */}
                        <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                          {scpi.minInvestment.toLocaleString('fr-FR')}€
                        </td>
                        {/* Capitalisation */}
                        <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
                          {scpi.capitalization}
                        </td>
                        {/* Décote / Surcote */}
                        <td className="py-3 px-3 text-right">
                          {discountInfo.displayValue != null && discountInfo.displayValue !== 0 ? (
                            <span className={`font-semibold tabular-nums ${discountInfo.displayValue > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {(discountInfo.displayValue > 0 ? '+' : '')}{discountInfo.displayValue.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {allScpis.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucune SCPI trouvée pour &laquo; {search} &raquo;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
