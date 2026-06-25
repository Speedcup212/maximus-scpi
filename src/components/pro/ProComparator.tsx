import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProReport } from '../../contexts/ProReportContext';
import { supabase } from '../../lib/supabase';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { Play, Star, Filter, Plus, Check, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import FintechComparator from '../fintech/FintechComparator';
import ErrorBoundary from '../ErrorBoundary';

// ── Types étendus pour le Pro ──
interface SCPIPremiumMeta {
  scpiId: number;
  hasVideo: boolean;
  premiumData: boolean;
  updatedAt?: string;
  videoUrl?: string;
  bulletinUrl?: string;
}

// ── Cache des métadonnées premium ──
let premiumMetaCache: SCPIPremiumMeta[] | null = null;

async function loadPremiumMeta(): Promise<SCPIPremiumMeta[]> {
  if (premiumMetaCache) return premiumMetaCache;
  try {
    // Depuis Supabase scpi_catalog pour les données enrichies
    const { data } = await supabase
      .from('scpi_catalog')
      .select('id, name, updated_at');
    if (data) {
      premiumMetaCache = data.map((row: any) => ({
        scpiId: Number(row.id),
        hasVideo: (row as any).has_video === true,
        premiumData: (row as any).premium_data === true,
        updatedAt: (row as any).updated_at || undefined,
        videoUrl: (row as any).video_url || undefined,
        bulletinUrl: (row as any).bulletin_url || undefined,
      }));
    } else {
      premiumMetaCache = [];
    }
  } catch {
    premiumMetaCache = [];
  }
  return premiumMetaCache;
}

// ── Composant ──
export default function ProComparator() {
  const { user } = useAuth();
  const { addScpi, scpiCount } = useProReport();

  const [monUnivers, setMonUnivers] = useState(() => {
    if (!user) return false;
    return localStorage.getItem(`pro_universe_filter_${user.id}`) === 'true';
  });

  const [premiumMeta, setPremiumMeta] = useState<SCPIPremiumMeta[]>([]);
  const [premiumExpanded, setPremiumExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [addedFeedback, setAddedFeedback] = useState<number | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Charger les métadonnées premium
  const fetchMeta = useCallback(async () => {
    if (loadingMeta || premiumMeta.length > 0) return;
    setLoadingMeta(true);
    const meta = await loadPremiumMeta();
    setPremiumMeta(meta);
    setLoadingMeta(false);
  }, [loadingMeta, premiumMeta.length]);

  // Récupérer la liste des SCPI autorisées pour le CGP
  const [allowedScpi, setAllowedScpi] = useState<number[] | null>(null);
  const [allowedLoaded, setAllowedLoaded] = useState(false);

  const loadAllowedScpi = useCallback(async () => {
    if (!user || allowedLoaded) return;
    try {
      const { data } = await supabase
        .from('cgp_profiles')
        .select('allowed_scpi')
        .eq('id', user.id)
        .single();
      if (data?.allowed_scpi && Array.isArray(data.allowed_scpi)) {
        setAllowedScpi(data.allowed_scpi.map(Number));
      } else {
        setAllowedScpi(null);
      }
    } catch {
      setAllowedScpi(null);
    }
    setAllowedLoaded(true);
  }, [user, allowedLoaded]);

  // Activer les chargements
  useEffect(() => {
    fetchMeta();
    loadAllowedScpi();
  }, [fetchMeta, loadAllowedScpi]);

  // Toggle Mon Univers
  const toggleMonUnivers = () => {
    const next = !monUnivers;
    setMonUnivers(next);
    if (user) {
      localStorage.setItem(`pro_universe_filter_${user.id}`, String(next));
    }
  };

  // SCPI premium
  const premiumScpis = useMemo(() => {
    const premiumIds = new Set(premiumMeta.filter((m) => m.hasVideo).map((m) => m.scpiId));
    return scpiDataExtended.filter((s) => premiumIds.has(s.id));
  }, [premiumMeta]);

  // Données à jour
  const updatedScpis = useMemo(() => {
    const updated = new Map(
      premiumMeta.filter((m) => m.premiumData && m.updatedAt).map((m) => [m.scpiId, m.updatedAt!])
    );
    return updated;
  }, [premiumMeta]);

  // Liste pour le picker (filtrée par Mon Univers si activé)
  const pickerScpis = useMemo(() => {
    let list = scpiDataExtended;
    if (monUnivers && allowedScpi !== null) {
      const allowedSet = new Set(allowedScpi);
      list = list.filter((s) => allowedSet.has(s.id));
    }
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [monUnivers, allowedScpi, pickerSearch]);

  // Ajouter au rapport
  const handleAddToReport = (scpi: SCPIExtended) => {
    const meta = premiumMeta.find((m) => m.scpiId === scpi.id);
    addScpi({
      scpiId: scpi.id,
      scpiName: scpi.name,
      amount: 0,
      hasVideo: meta?.hasVideo || false,
      videoUrl: meta?.videoUrl,
      bulletinUrl: meta?.bulletinUrl,
    });
    setAddedFeedback(scpi.id);
    setTimeout(() => setAddedFeedback(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Barre d'outils Pro ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Mon Univers */}
          <button
            onClick={toggleMonUnivers}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
              monUnivers
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Filter size={15} />
            {monUnivers ? 'Mon Univers (actif)' : 'Mon Univers'}
          </button>

          {/* Premium indicator */}
          {premiumScpis.length > 0 && (
            <button
              onClick={() => setPremiumExpanded(!premiumExpanded)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-950/40 border border-amber-700/30 text-amber-300 hover:bg-amber-950/60 transition"
            >
              <Star size={15} className="text-amber-400" />
              {premiumScpis.length} SCPI Premium
              {premiumExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {/* Bouton Ajouter au rapport */}
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ml-auto ${
              pickerOpen
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300'
            }`}
          >
            <Plus size={15} />
            Ajouter au rapport
            {scpiCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {scpiCount}
              </span>
            )}
          </button>
        </div>

        {/* Panneau premium expandé */}
        {premiumExpanded && (
          <div className="border-t border-slate-800 pt-3 mt-2">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
              SCPI Premium — Contenu vidéo disponible
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {premiumScpis.map((scpi) => (
                <div
                  key={scpi.id}
                  className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5 group hover:border-amber-500/30 transition"
                >
                  <Play size={14} className="text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{scpi.name}</span>
                  <button
                    onClick={() => handleAddToReport(scpi)}
                    className="ml-auto shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-emerald-400"
                    title="Ajouter au rapport"
                  >
                    {addedFeedback === scpi.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Plus size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Picker SCPI pour le rapport */}
        {pickerOpen && (
          <div className="border-t border-slate-800 pt-3 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Rechercher une SCPI..."
                  className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-300 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {pickerScpis.slice(0, 30).map((scpi) => {
                const meta = premiumMeta.find((m) => m.scpiId === scpi.id);
                const isPremium = meta?.hasVideo;
                const updatedDate = updatedScpis.get(scpi.id);

                return (
                  <div
                    key={scpi.id}
                    className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5 hover:border-emerald-500/30 transition group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-200 font-medium truncate">{scpi.name}</span>
                        {isPremium && (
                          <span className="shrink-0 text-[10px] bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded border border-amber-700/30 flex items-center gap-0.5">
                            <Play size={9} />
                            Premium
                          </span>
                        )}
                        {updatedDate && (
                          <span className="shrink-0 text-[10px] bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700/30">
                            MAJ {new Date(updatedDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToReport(scpi)}
                      className={`shrink-0 p-1.5 rounded-lg transition ${
                        addedFeedback === scpi.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                      title="Ajouter au rapport"
                    >
                      {addedFeedback === scpi.id ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {pickerScpis.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Aucune SCPI trouvée.
                {monUnivers && ' Essayez de désactiver le filtre Mon Univers.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Comparateur public intégré ── */}
      <div
        className="relative"
        style={{
          marginLeft: 'calc(-1 * (16rem + 2.5rem))',
          width: '100vw',
        }}
      >
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center bg-red-950/30 p-6">
              <p className="text-red-400 text-sm">Erreur de chargement du comparateur.</p>
            </div>
          }
        >
          <FintechComparator />
        </ErrorBoundary>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Les données présentées sont issues des documents officiels des sociétés de gestion (DIC, bulletins trimestriels, rapports annuels).
          Les performances passées ne préjugent pas des performances futures. Le capital investi n'est pas garanti.
          Les revenus distribués sont variables et peuvent évoluer à la hausse comme à la baisse.
        </p>
      </div>
    </div>
  );
}
