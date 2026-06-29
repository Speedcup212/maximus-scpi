import { useState, useEffect, useMemo } from 'react';
import {
  Star, TrendingUp, Building2, X, BarChart3,
  CheckSquare, Square, Search, Grid3x3, List,
  ChevronDown,
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

/* ── Helpers formatage ── */
function formatPercent(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v.toFixed(1)}%`;
}

function formatCurrency(v: number | null | undefined, suffix = '€'): string {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)} M${suffix}`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 0)} k${suffix}`;
  return `${v.toLocaleString('fr-FR')} ${suffix}`;
}

function getDominantGeography(scpi: SCPIExtended): { name: string; pct: number } | null {
  if (!scpi.geography || scpi.geography.length === 0) return null;
  const sorted = [...scpi.geography].sort((a, b) => b.value - a.value);
  return { name: sorted[0].name, pct: Math.round(sorted[0].value) };
}

/* ── Couleurs camemberts ── */
const PRO_PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

/* ── Signaux visuels ── */
type Signal = 'green' | 'amber' | 'red' | 'neutral';

function tofSignal(tof: number | null | undefined): Signal {
  if (tof == null || !Number.isFinite(tof)) return 'neutral';
  if (tof >= 95) return 'green';
  if (tof >= 90) return 'amber';
  return 'red';
}

function ltvSignal(ltv: number | null | undefined): Signal {
  if (ltv == null || !Number.isFinite(ltv)) return 'neutral';
  if (ltv <= 15) return 'green';
  if (ltv <= 30) return 'amber';
  return 'red';
}

function discountSignal(d: { displayValue?: number | null } | null): Signal {
  if (!d || d.displayValue == null || d.displayValue === 0) return 'neutral';
  return d.displayValue > 0 ? 'amber' : 'green';
}

function scoreSignal(s: number | null | undefined): Signal {
  if (s == null) return 'neutral';
  if (s >= 8.5) return 'green';
  if (s >= 7) return 'amber';
  return 'red';
}

function signalClass(signal: Signal): string {
  switch (signal) {
    case 'green': return 'text-emerald-400';
    case 'amber': return 'text-amber-400';
    case 'red': return 'text-red-400';
    default: return 'text-slate-300';
  }
}

/* ── Verdict simplifié ── */
function getVerdict(scpi: SCPIExtended): string {
  const d = resolveDisplayedDiscount(scpi);
  const hasHighSurcote = (d.displayValue ?? 0) > 5;
  const lowTof = (scpi.tof ?? 100) < 90;
  const highLtv = (scpi.ltv ?? 0) > 30;
  const highYield = scpi.yield >= 6;
  const sectorCount = scpi.sectors?.length ?? 0;
  const geoCount = scpi.geography?.length ?? 0;
  const diversified = sectorCount >= 4 || geoCount >= 3;

  if (lowTof || highLtv) return 'À surveiller';
  if (hasHighSurcote) return 'Profil opportuniste';
  if (highYield) return 'Profil rendement';
  if (diversified) return 'Profil diversifié';
  return 'Profil défensif';
}

function verdictStyle(v: string): string {
  if (v === 'Profil rendement') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (v === 'Profil diversifié') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (v === 'Profil défensif') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  if (v === 'Profil opportuniste') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-red-500/10 text-red-400 border-red-500/20';
}

/* ── Normalisation d'une distribution à 100 % ── */
function normalizeDistribution(entries: Array<{ name: string; value: number }>): Array<{ name: string; value: number }> {
  if (!entries || entries.length === 0) return [];
  const rawSum = entries.reduce((s, e) => s + e.value, 0);
  if (Math.abs(rawSum) < 0.001) return entries;
  const scaled = entries.map(e => ({ name: e.name, value: (e.value / rawSum) * 100 }));
  const rounded = scaled.map(e => ({ name: e.name, value: Math.round(e.value * 10) / 10 }));
  const roundedSum = rounded.reduce((s, e) => s + e.value, 0);
  if (rounded.length > 0 && Math.abs(roundedSum - 100) > 0.001) {
    const diff = +(100 - roundedSum).toFixed(1);
    let maxIdx = 0;
    for (let i = 1; i < rounded.length; i++) { if (rounded[i].value > rounded[maxIdx].value) maxIdx = i; }
    rounded[maxIdx].value = +((rounded[maxIdx].value as number) + diff).toFixed(1);
  }
  return rounded;
}

/* ── Labels courts pour les noms longs ── */
function normalizeLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")  // apostrophes typographiques → '
    .replace(/[\u0060\u00B4\u02B9\u02BB\u02BC]/g, "'")
    .replace(/\s{2,}/g, ' ')                                   // doubles espaces
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');                          // sans accents
}

const LABEL_SHORT_MAP: Record<string, string> = {
  "locaux d'activites et sites de production": "Locaux d'activité",
  "locaux d'activites": "Locaux d'activité",
  "locaux dactivites et sites de production": "Locaux d'activité",
  "locaux dactivites": "Locaux d'activité",
  'commerces en retail park': 'Retail park',
  'sante et education': 'Santé / éducation',
  'sante, hotellerie et loisirs': 'Santé / loisirs',
  'sante hotellerie et loisirs': 'Santé / loisirs',
  'hotellerie, tourisme, loisirs': 'Hôtellerie / loisirs',
  'hotellerie tourisme loisirs': 'Hôtellerie / loisirs',
  'bureaux et locaux professionnels': 'Bureaux',
  'logistique et locaux dactivite': 'Logistique',
  'residentiel et hebergement': 'Résidentiel',
  'alimentation / restauration': 'Alimentation',
  'alimentation restauration': 'Alimentation',
  'entrepot logistique': 'Logistique',
  'locaux commerciaux': 'Commerces',
  'pays-bas': 'NL',
  'royaume-uni': 'UK',
  'allemagne': 'DE',
  'espagne': 'ES',
  'zone euro': '€-Zone',
  'hors zone euro': 'Hors €',
};

/** Retourne un libellé court pour affichage, sans modifier la donnée source. */
function getShortDistributionLabel(original: string): string {
  const norm = normalizeLabel(original);
  if (LABEL_SHORT_MAP[norm]) return LABEL_SHORT_MAP[norm];
  // Si pas de mapping, tronquer seulement si > 28 caractères
  if (original.length > 28) return original.substring(0, 27) + '\u2026';
  return original;
}

/* ── Rendu distribution complète (donut + liste exhaustive) ── */
function renderDistributionFull(data: Array<{ name: string; value: number }>) {
  if (!data || data.length === 0) return <span className="text-slate-600">Donnée indisponible</span>;
  const normalized = normalizeDistribution(data);
  const sorted = [...normalized].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, e) => s + (e.value as number), 0);
  // Préparer les données pour Recharts avec les noms courts
  const chartData = sorted.map(s => ({ ...s, name: getShortDistributionLabel(s.name) }));
  return (
    <div className="flex flex-col items-center gap-1">
      <ResponsiveContainer width={100} height={85}>
        <RechartsPie>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={22}
            outerRadius={36}
            paddingAngle={1}
            stroke="none"
          >
            {sorted.map((_e, i) => (
              <Cell key={i} fill={PRO_PIE_COLORS[i % PRO_PIE_COLORS.length]} />
            ))}
          </Pie>
        </RechartsPie>
      </ResponsiveContainer>
      <div className="space-y-0.5 w-full">
        {sorted.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1 text-[9px] text-slate-400">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: PRO_PIE_COLORS[i % PRO_PIE_COLORS.length] }} />
            <span className="truncate max-w-[85px] flex-1" title={s.name}>{getShortDistributionLabel(s.name)}</span>
            <span className="tabular-nums shrink-0">{s.value} %</span>
          </div>
        ))}
        <div className="flex items-center gap-1 text-[8px] text-slate-600 pt-0.5 border-t border-slate-800/50 mt-0.5">
          <span className="flex-1 text-right">Total : {total.toFixed(1)} %</span>
        </div>
      </div>
    </div>
  );
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

  /* ── Agrégations équipondérées pour la synthèse moyenne (bloc repliable) ── */
  const comparisonSectorData = useMemo(() => {
    if (compareScpis.length === 0) return [] as Array<{ name: string; value: number }>;
    const acc: Record<string, number> = {};
    compareScpis.forEach(s => { if (s.sectors) s.sectors.forEach(d => { acc[d.name] = (acc[d.name] || 0) + d.value; }); });
    return Object.entries(acc).map(([n, v]) => ({ name: n, value: Math.round(v / compareScpis.length * 10) / 10 })).sort((a, b) => b.value - a.value);
  }, [compareScpis]);

  const comparisonGeoData = useMemo(() => {
    if (compareScpis.length === 0) return [] as Array<{ name: string; value: number }>;
    const acc: Record<string, number> = {};
    compareScpis.forEach(s => { if (s.geography) s.geography.forEach(d => { acc[d.name] = (acc[d.name] || 0) + d.value; }); });
    return Object.entries(acc).map(([n, v]) => ({ name: n, value: Math.round(v / compareScpis.length * 10) / 10 })).sort((a, b) => b.value - a.value);
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
    setFavorites(getFavoriteScpis());
    setFavoriteIds(getFavoriteScpiIds());
    setTab('mes-favorites');
  };

  /* ---------- Composants helpers pour le tableau comparatif ---------- */

  /** Vérifie si TOUTES les SCPI comparées ont une valeur vide pour un renderer donné. */
  const allEmpty = (render: (s: SCPIExtended) => React.ReactNode): boolean => {
    if (compareScpis.length === 0) return true;
    return compareScpis.every(s => {
      const res = render(s);
      if (res === '—') return true;
      if (res === null || res === undefined) return true;
      return false;
    });
  };

  /** Famille repliable dans la matrice détaillée */
  const CollapsibleFamily = ({ label, open, children }: { label: string; open: boolean; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(open);
    return (
      <>
        <tr
          className="bg-slate-800/60 cursor-pointer hover:bg-slate-700/60 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <td colSpan={compareScpis.length + 1} className="sticky left-0 py-1.5 px-3 border-r border-slate-800/50 bg-slate-800/60">
            <div className="flex items-center gap-2">
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
            </div>
          </td>
        </tr>
        {isOpen && children}
      </>
    );
  };

  /** Ligne de donnée qui se masque automatiquement si toutes les SCPI ont "—" */
  const DataRow = ({ label, render, highlight, signal: sigFn }: {
    label: string;
    render: (s: SCPIExtended) => React.ReactNode;
    highlight?: boolean;
    signal?: (s: SCPIExtended) => Signal;
  }) => {
    if (allEmpty(render)) return null;
    return (
      <tr className="hover:bg-slate-800/30 transition-colors">
        <td className={`sticky left-0 z-10 py-2 px-3 text-[10px] whitespace-nowrap border-r border-slate-800/50 ${highlight ? 'text-slate-200 font-medium bg-slate-900/90' : 'text-slate-500 bg-slate-900/80'}`}>
          {label}
        </td>
        {compareScpis.map(scpi => {
          const sig = sigFn?.(scpi) ?? 'neutral';
          return (
            <td key={scpi.id} className={`py-2 px-2 text-center text-[10px] tabular-nums ${highlight ? 'text-white font-semibold' : signalClass(sig)}`}>
              {render(scpi)}
            </td>
          );
        })}
      </tr>
    );
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
                            <td className="py-3 px-3">
                              <span className="text-white font-medium truncate block max-w-[130px]">{scpi.name}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-400 truncate max-w-[110px] hidden md:table-cell">
                              {scpi.managementCompany}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-white font-semibold tabular-nums whitespace-nowrap">
                              {scpi.price != null ? `${scpi.price}€` : '—'}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300 tabular-nums hidden md:table-cell whitespace-nowrap">
                              {scpi.minInvestment.toLocaleString('fr-FR')}€
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300 hidden md:table-cell whitespace-nowrap">
                              {scpi.capitalization}
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded border bg-slate-700/50 text-slate-300 border-slate-600/50 whitespace-nowrap">
                                {getSectorDisplay(scpi)}
                              </span>
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
            <div className="space-y-0">
              {/* ── SYNTHÈSE COMPARATIVE ── */}
              <div className="border-b border-slate-800">
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm font-bold text-white mb-3">Synthèse comparative</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                          <th className="text-left py-2 px-2 font-medium bg-slate-900/80 sticky left-0 z-10 border-r border-slate-800/50">SCPI</th>
                          {compareScpis.map(scpi => (
                            <th key={scpi.id} className="text-center py-2 px-2 font-medium min-w-[100px]">{scpi.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/20">
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Rendement</td>
                          {compareScpis.map(s => (<td key={s.id} className="py-2 px-2 text-center text-[10px] text-emerald-400 font-semibold">{s.yield.toFixed(2)}%</td>))}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">TOF</td>
                          {compareScpis.map(s => (<td key={s.id} className={`py-2 px-2 text-center text-[10px] font-semibold ${signalClass(tofSignal(s.tof))}`}>{typeof s.tof === 'number' ? `${s.tof.toFixed(1)}%` : '—'}</td>))}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Capitalisation</td>
                          {compareScpis.map(s => (<td key={s.id} className="py-2 px-2 text-center text-[10px] text-slate-300">{s.capitalization}</td>))}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Décote / Surcote</td>
                          {compareScpis.map(s => {
                            const di = resolveDisplayedDiscount(s);
                            const sig = discountSignal(di);
                            return (
                              <td key={s.id} className={`py-2 px-2 text-center text-[10px] font-semibold ${signalClass(sig)}`}>
                                {di.displayValue != null && di.displayValue !== 0 ? `${(di.displayValue > 0 ? '+' : '')}${di.displayValue.toFixed(1)}%` : '—'}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">LTV</td>
                          {compareScpis.map(s => (<td key={s.id} className={`py-2 px-2 text-center text-[10px] font-semibold ${signalClass(ltvSignal(s.ltv))}`}>{formatPercent(s.ltv)}</td>))}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Secteur dominant</td>
                          {compareScpis.map(s => {
                            const dom = getDominantSector(s);
                            return (<td key={s.id} className="py-2 px-2 text-center text-[10px] text-slate-300">{dom ? `${getShortDistributionLabel(dom.name)} ${dom.pct}%` : '—'}</td>);
                          })}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Zone dominante</td>
                          {compareScpis.map(s => {
                            const dom = getDominantGeography(s);
                            return (<td key={s.id} className="py-2 px-2 text-center text-[10px] text-slate-300">{dom ? `${getShortDistributionLabel(dom.name)} ${dom.pct}%` : '—'}</td>);
                          })}
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Note</td>
                          {compareScpis.map(s => {
                            const slug = createSlugFromName(s.name);
                            const score = comparisonScores[slug];
                            const sig = scoreSignal(score);
                            return (<td key={s.id} className={`py-2 px-2 text-center text-[10px] font-semibold ${signalClass(sig)}`}>{score != null ? `${score.toFixed(1)}/10` : '—'}</td>);
                          })}
                        </tr>
                        <tr>
                          <td className="sticky left-0 z-10 py-2 px-2 text-[10px] text-slate-500 whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80 font-medium">Verdict</td>
                          {compareScpis.map(s => {
                            const v = getVerdict(s);
                            return (<td key={s.id} className="py-2 px-2 text-center"><span className={`inline-block text-[9px] px-2 py-0.5 rounded-full border font-medium ${verdictStyle(v)}`}>{v}</span></td>);
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── MATRICE DÉTAILLÉE ── */}
              <div>
                <div className="p-3 sm:p-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Matrice détaillée</h3>
                </div>

                {/* Synthèse moyenne repliable */}
                <details className="border-b border-slate-800 group">
                  <summary className="p-3 sm:p-4 cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-300 select-none">Synthèse moyenne des SCPI comparées</summary>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    {(comparisonSectorData.length > 0 || comparisonGeoData.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {comparisonSectorData.length > 0 ? (
                          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-slate-300 mb-2 text-center">Répartition sectorielle moyenne</h4>
                            <div className="flex flex-col items-center">
                              <ResponsiveContainer width="100%" height={160}>
                                <RechartsPie>
                                  <Pie data={comparisonSectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} stroke="none">
                                    {comparisonSectorData.map((_e, i) => (<Cell key={i} fill={PRO_PIE_COLORS[i % PRO_PIE_COLORS.length]} />))}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }} formatter={(v: number) => `${v} %`} />
                                </RechartsPie>
                              </ResponsiveContainer>
                              <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-1">
                                {comparisonSectorData.slice(0, 5).map((s, i) => (<div key={s.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: PRO_PIE_COLORS[i % PRO_PIE_COLORS.length] }} /><span className="text-[9px] text-slate-400">{s.name} {s.value}%</span></div>))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex items-center justify-center"><p className="text-xs text-slate-500 py-8">Données sectorielles insuffisantes</p></div>
                        )}
                        {comparisonGeoData.length > 0 ? (
                          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-slate-300 mb-2 text-center">Répartition géographique moyenne</h4>
                            <div className="flex flex-col items-center">
                              <ResponsiveContainer width="100%" height={160}>
                                <RechartsPie>
                                  <Pie data={comparisonGeoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} stroke="none">
                                    {comparisonGeoData.map((_e, i) => (<Cell key={i} fill={PRO_PIE_COLORS[i % PRO_PIE_COLORS.length]} />))}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0' }} formatter={(v: number) => `${v} %`} />
                                </RechartsPie>
                              </ResponsiveContainer>
                              <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-1">
                                {comparisonGeoData.slice(0, 5).map((g, i) => (<div key={g.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: PRO_PIE_COLORS[i % PRO_PIE_COLORS.length] }} /><span className="text-[9px] text-slate-400">{g.name} {g.value}%</span></div>))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex items-center justify-center"><p className="text-xs text-slate-500 py-8">Données géographiques insuffisantes</p></div>
                        )}
                      </div>
                    ) : (<p className="text-xs text-slate-500 text-center py-4">Données insuffisantes</p>)}
                  </div>
                </details>

                {/* Tableau comparatif renversé (indicateurs en lignes, SCPI en colonnes) */}
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-xs">
                    <thead className="sticky top-0 z-20">
                      <tr className="border-b-2 border-slate-700 bg-slate-900/95">
                        <th className="sticky left-0 z-30 bg-slate-900/95 text-left py-2 px-3 font-medium text-slate-400 w-[180px] min-w-[140px] border-r border-slate-800/50">Indicateur</th>
                        {compareScpis.map(scpi => (
                          <th key={scpi.id} className="text-center py-2 px-2 font-medium min-w-[125px]">
                            <div className="text-white text-[11px] leading-tight font-semibold">{scpi.name}</div>
                            <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{scpi.managementCompany}</div>
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <button onClick={() => onAnalyzeScpi?.(scpi)} className="text-[8px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded transition-colors whitespace-nowrap">Analyser</button>
                              <button onClick={() => handleRemoveFromComparison(scpi.id)} className="text-[8px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition-colors whitespace-nowrap">Retirer</button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                      {/* Identité / stratégie (repliée par défaut) */}
                      <CollapsibleFamily label="Identité / stratégie" open={false}>
                        <DataRow label="Société de gestion" render={s => s.managementCompany} />
                        <DataRow label="Catégorie" render={s => s.category} />
                        <DataRow label="Stratégie" render={s => s.strategy} />
                        <DataRow label="Secteur dominant" render={s => getShortDistributionLabel(getDominantSector(s)?.name || '—')} />
                        <DataRow label="Capitalisation" render={s => s.capitalization} />
                        <DataRow label="Collecte nette trim." render={s => formatCurrency(s.collecteNetteTrimestre, '€')} />
                      </CollapsibleFamily>

                      {/* Performance (ouverte par défaut) */}
                      <CollapsibleFamily label="Performance" open={true}>
                        <DataRow label="Taux distribution brut" render={s => formatPercent(s.yield)} highlight />
                        <DataRow label="Distribution / part" render={s => s.distribution != null ? `${s.distribution.toFixed(2)} €` : '—'} />
                        <DataRow label="RAN (jours)" render={s => s.ranDays != null ? `${s.ranDays} j` : '—'} />
                        <DataRow label="Fréquence distribution" render={s => s.versementLoyers || '—'} />
                        <DataRow label="Durée détention rec." render={s => s.dureeDetentionRecommandee != null ? `${s.dureeDetentionRecommandee} ans` : '—'} />
                      </CollapsibleFamily>

                      {/* Prix / valorisation (ouverte par défaut) */}
                      <CollapsibleFamily label="Prix / valorisation" open={true}>
                        <DataRow label="Prix de souscription" render={s => `${s.price} €`} />
                        <DataRow label="Investissement minimum" render={s => `${s.minInvestment.toLocaleString('fr-FR')} €`} />
                        <DataRow label="Valeur de reconstitution" render={s => formatCurrency(s.reconstitutionValue, '€')} />
                        <DataRow label="Valeur de réalisation" render={s => formatCurrency(s.valeurRealisation, '€')} />
                        <DataRow label="Valeur de retrait" render={s => formatCurrency(s.valeurRetrait, '€')} />
                        <DataRow label="Décote / Surcote" render={s => { const di = resolveDisplayedDiscount(s); if (di.displayValue == null || di.displayValue === 0) return '—'; return <span className={di.displayValue > 0 ? 'text-amber-400' : 'text-emerald-400'}>{(di.displayValue > 0 ? '+' : '')}{di.displayValue.toFixed(1)}%</span>; }} signal={s => discountSignal(resolveDisplayedDiscount(s))} />
                        <DataRow label="Délai de jouissance" render={s => s.delaiJouissance != null ? `${s.delaiJouissance} mois` : '—'} />
                      </CollapsibleFamily>

                      {/* Liquidité (repliée par défaut) */}
                      <CollapsibleFamily label="Liquidité" open={false}>
                        <DataRow label="Parts en attente" render={s => s.hasWaitingShares === true ? 'Oui' : s.hasWaitingShares === false ? 'Non' : '—'} />
                        <DataRow label="Délai moyen retrait" render={s => s.withdrawalDelay || '—'} />
                        <DataRow label="Collecte nette trim." render={s => formatCurrency(s.collecteNetteTrimestre, '€')} />
                        <DataRow label="Nb cessions trim." render={s => s.nbCessionsTrimestre != null ? String(s.nbCessionsTrimestre) : '—'} />
                      </CollapsibleFamily>

                      {/* Patrimoine immobilier (repliée par défaut) */}
                      <CollapsibleFamily label="Patrimoine immobilier" open={false}>
                        <DataRow label="Nombre d'immeubles" render={s => s.assetsCount != null ? String(s.assetsCount) : '—'} />
                        <DataRow label="Nombre de locataires" render={s => s.nombreLocataires != null ? String(s.nombreLocataires) : '—'} />
                      </CollapsibleFamily>

                      {/* Occupation / exploitation (ouverte par défaut) */}
                      <CollapsibleFamily label="Occupation / exploitation" open={true}>
                        <DataRow label="TOF" render={s => formatPercent(s.tof)} highlight signal={s => tofSignal(s.tof)} />
                        <DataRow label="WALT (années)" render={s => s.walt != null ? `${s.walt.toFixed(1)}` : '—'} />
                        <DataRow label="WALB (années)" render={s => s.walb != null ? `${s.walb.toFixed(1)}` : '—'} />
                      </CollapsibleFamily>

                      {/* Exposition sectorielle (ouverte par défaut) */}
                      <CollapsibleFamily label="Exposition sectorielle" open={true}>
                        <DataRow label="Secteur dominant" render={s => { const dom = getDominantSector(s); return dom ? `${getShortDistributionLabel(dom.name)} ${dom.pct}%` : '—'; }} />
                        {!(compareScpis.every(s => !s.sectors || s.sectors.length === 0)) && (
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="sticky left-0 z-10 py-3 px-3 text-[10px] text-slate-400 font-medium whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Répartition sectorielle</td>
                            {compareScpis.map(scpi => (<td key={scpi.id} className="py-2 px-2 align-top">{renderDistributionFull(scpi.sectors)}</td>))}
                          </tr>
                        )}
                      </CollapsibleFamily>

                      {/* Exposition géographique (ouverte par défaut) */}
                      <CollapsibleFamily label="Exposition géographique" open={true}>
                        <DataRow label="Zone dominante" render={s => { const dom = getDominantGeography(s); return dom ? `${getShortDistributionLabel(dom.name)} ${dom.pct}%` : '—'; }} />
                        {!(compareScpis.every(s => !s.geography || s.geography.length === 0)) && (
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="sticky left-0 z-10 py-3 px-3 text-[10px] text-slate-400 font-medium whitespace-nowrap border-r border-slate-800/50 bg-slate-900/80">Répartition géographique</td>
                            {compareScpis.map(scpi => (<td key={scpi.id} className="py-2 px-2 align-top">{renderDistributionFull(scpi.geography)}</td>))}
                          </tr>
                        )}
                      </CollapsibleFamily>

                      {/* Dette / risque financier (ouverte par défaut) */}
                      <CollapsibleFamily label="Dette / risque financier" open={true}>
                        <DataRow label="LTV (endettement)" render={s => formatPercent(s.ltv)} highlight signal={s => ltvSignal(s.ltv)} />
                      </CollapsibleFamily>

                      {/* Frais / conditions (repliée par défaut) */}
                      <CollapsibleFamily label="Frais / conditions" open={false}>
                        <DataRow label="Frais de souscription" render={s => formatPercent(s.entryFees)} />
                        <DataRow label="Frais de gestion" render={s => formatPercent(s.managementFees)} />
                      </CollapsibleFamily>

                      {/* ESG / réglementation (repliée par défaut) */}
                      <CollapsibleFamily label="ESG / réglementation" open={false}>
                        <DataRow label="SFDR" render={s => s.sfdr || '—'} />
                        <DataRow label="Profil de risque" render={s => s.profilRisque != null ? `${s.profilRisque}/7` : '—'} />
                        <DataRow label="Profil cible" render={s => s.profilCible || '—'} />
                      </CollapsibleFamily>

                      {/* Notation MaximusSCPI (ouverte par défaut) */}
                      <CollapsibleFamily label="Notation MaximusSCPI" open={true}>
                        <DataRow label="Note MaximusSCPI" render={s => { const slug = createSlugFromName(s.name); const score = comparisonScores[slug]; if (score == null) return '—'; return `${score.toFixed(1)}/10`; }} highlight signal={s => { const slug = createSlugFromName(s.name); return scoreSignal(comparisonScores[slug]); }} />
                      </CollapsibleFamily>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB : Ajouter
          ══════════════════════════════════════════ */}
      {tab === 'ajouter' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une SCPI..." className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
            </div>
            <button onClick={handleBulkAdd} disabled={checkedIds.size === 0} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${checkedIds.size > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'}`}>
              <CheckSquare className="w-3.5 h-3.5" />Ajouter aux préférées{checkedIds.size > 0 && (<span className="bg-emerald-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{checkedIds.size}</span>)}
            </button>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="text-left py-2.5 px-3 font-medium w-10"><button onClick={() => { const selectableIds = allScpis.filter(s => !favoriteIds.has(s.id)).map(s => s.id); if (checkedIds.size === selectableIds.length && selectableIds.length > 0) { setCheckedIds(new Set()); } else { setCheckedIds(new Set(selectableIds)); } }} className="text-slate-500 hover:text-slate-300 transition-colors" title="Tout (dé)sélectionner"><Square className="w-3.5 h-3.5" /></button></th>
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
                      <tr key={scpi.id} className={`hover:bg-slate-800/40 transition-colors ${isAlreadyFav ? 'opacity-60' : ''}`}>
                        <td className="py-3 px-3">
                          <button onClick={() => !isAlreadyFav && toggleCheck(scpi.id)} disabled={isAlreadyFav} className={`transition-colors ${isAlreadyFav ? 'text-slate-700 cursor-not-allowed' : isChecked ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'}`} title={isAlreadyFav ? 'Déjà dans les préférées' : isChecked ? 'Décocher' : 'Cocher'}>
                            {isAlreadyFav ? (<Square className="w-3.5 h-3.5" />) : isChecked ? (<CheckSquare className="w-3.5 h-3.5" />) : (<Square className="w-3.5 h-3.5" />)}
                          </button>
                        </td>
                        <td className="py-3 px-1"><Star className={`w-3.5 h-3.5 ${isAlreadyFav ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} /></td>
                        <td className="py-3 px-3"><span className="text-white font-medium truncate block max-w-[140px]">{scpi.name}</span></td>
                        <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">{scpi.managementCompany}</td>
                        <td className="py-3 px-3 text-right"><span className="text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span></td>
                        <td className="py-3 px-3 text-right"><span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>{typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}</span></td>
                        <td className="py-3 px-3 text-right text-white font-semibold tabular-nums">{scpi.price != null ? `${scpi.price}€` : '—'}</td>
                        <td className="py-3 px-3 text-right text-slate-300 tabular-nums">{scpi.minInvestment.toLocaleString('fr-FR')}€</td>
                        <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">{scpi.capitalization}</td>
                        <td className="py-3 px-3 text-right">{discountInfo.displayValue != null && discountInfo.displayValue !== 0 ? (<span className={`font-semibold tabular-nums ${discountInfo.displayValue > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(discountInfo.displayValue > 0 ? '+' : '')}{discountInfo.displayValue.toFixed(1)}%</span>) : (<span className="text-slate-600">—</span>)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {allScpis.length === 0 && (<div className="p-8 text-center"><Search className="w-8 h-8 text-slate-600 mx-auto mb-2" /><p className="text-sm text-slate-400">Aucune SCPI trouvée pour &laquo; {search} &raquo;</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
