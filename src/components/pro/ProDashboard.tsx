import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProReportProvider } from '../../contexts/ProReportContext';
import ProComparator from './ProComparator';
import ProSimulator from './ProSimulator';
import {
  Search, Link, Download, CheckSquare, Square, X,
  FileArchive, ExternalLink, Play, LayoutDashboard, BarChart3,
  Calculator, FileText, Clipboard, Trash2, Eye, Loader2
} from 'lucide-react';

// ── Types ──
type ScpiCatalog = {
  id: string;
  name: string;
  category: string;
  rendement: string;
  tof: string;
  script_technique: string;
  script_vulgarisation: string;
  script_macro: string;
};

type SharedLink = {
  id: string;
  script_type: string;
  view_count: number;
  created_at: string;
  scpi_catalog: { name: string } | { name: string }[];
};

type ProReportRow = {
  id: string;
  cabinet_name: string;
  report_data: any;
  created_at: string;
  expires_at: string;
  view_count: number;
};


// ── Constantes ──
const CATEGORIES = ['Bureaux', 'Commerces', 'Santé', 'Logistique', 'Hôtellerie', 'Résidentiel', 'Multi-secteurs'];
const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'comparator', label: 'Comparateur', icon: BarChart3 },
  { id: 'simulator', label: 'Simulateur', icon: Calculator },
  { id: 'reports', label: 'Mes rapports', icon: FileText },
] as const;

type TabId = typeof TABS[number]['id'];

const getInitials = (name: string): string =>
  name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

// ── Modal vidéo ──
function VideoModal({
  open,
  title,
  type,
  onClose,
}: {
  open: boolean;
  title: string;
  type: 'pitch' | 'analyse';
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === 'pitch' ? '🎥 Pitch client (1m30)' : '📊 Analyse complète (12m)'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video bg-slate-950 flex items-center justify-center">
          <div className="text-center text-slate-500 space-y-2">
            <Play size={48} className="mx-auto text-emerald-500/50" />
            <p className="text-sm">Prévisualisation vidéo</p>
            <p className="text-xs text-slate-600">Intégration à venir</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal de résultat lien ──
function LinkResultModal({
  open,
  links,
  onClose,
}: {
  open: boolean;
  links: { scpiName: string; url: string }[];
  onClose: () => void;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!open) return null;

  const handleCopy = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100">
            {links.length} lien{links.length > 1 ? 's' : ''} généré{links.length > 1 ? 's' : ''}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Partagez ces liens avec vos clients. Pitch vidéo inclus. Aucun marquage MaximusSCPI.
        </p>
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={link.url} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-200 min-w-[140px] truncate">{link.scpiName}</span>
              <input
                readOnly
                value={link.url}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none truncate"
              />
              <button
                onClick={() => handleCopy(link.url, i)}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                {copiedIdx === i ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Onglet "Mes rapports" ──
function ReportsTab() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ProReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pro_reports')
        .select('id, cabinet_name, report_data, created_at, expires_at, view_count')
        .eq('cgp_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement rapports:', error);
        return;
      }
      setReports((data || []) as ProReportRow[]);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/pro/report/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce rapport ? Cette action est irréversible.')) return;
    try {
      await supabase.from('pro_reports').delete().eq('id', id);
      fetchReports();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const getScpiNames = (reportData: any): string => {
    try {
      const scpis = reportData?.selectedScpi;
      if (Array.isArray(scpis)) {
        return scpis.map((s: any) => s.scpiName).join(', ');
      }
      return '-';
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 size={20} className="animate-spin mx-auto text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">Chargement des rapports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <FileText size={32} className="mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300 mb-1">Aucun rapport généré</h3>
        <p className="text-sm text-slate-500">
          Utilisez le comparateur et le simulateur pour construire un rapport,
          puis générez-le via la barre en bas de l'écran.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">SCPI sélectionnées</th>
              <th className="py-3 px-4 text-center">Vues</th>
              <th className="py-3 px-4 text-center">Expire le</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 text-slate-400">
                  {new Date(report.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-200 truncate max-w-[250px] block">
                    {getScpiNames(report.report_data)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    report.view_count > 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-950 text-slate-500'
                  }`}>
                    <Eye size={12} />
                    {report.view_count}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-xs text-slate-500">
                  {new Date(report.expires_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleCopyLink(report.id)}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition font-medium px-2 py-1 rounded hover:bg-emerald-950/40"
                    >
                      {copiedId === report.id ? (
                        <>✓ Copié</>
                      ) : (
                        <>
                          <Clipboard size={12} />
                          Copier le lien
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded transition"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Composant principal ──
export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // ── État Vue d'ensemble ──
  const [scpiList, setScpiList] = useState<ScpiCatalog[]>([]);
  const [myLinks, setMyLinks] = useState<SharedLink[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLink, setLoadingLink] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);

  // Filtres
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Multi-sélection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals
  const [linkResult, setLinkResult] = useState<{ scpiName: string; url: string }[] | null>(null);
  const [videoModal, setVideoModal] = useState<{ title: string; type: 'pitch' | 'analyse' } | null>(null);

  // ——— Data fetching ———
  const fetchData = useCallback(async () => {
    setLoadingList(true);
    try {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data: scpiData }, { data: linksData }] = await Promise.all([
        supabase.from('scpi_catalog').select('*').order('name', { ascending: true }),
        supabase
          .from('shared_links')
          .select('id, script_type, view_count, created_at, scpi_catalog ( name )')
          .eq('cgp_id', session.user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (scpiData) setScpiList(scpiData as ScpiCatalog[]);
      if (linksData) setMyLinks(linksData as SharedLink[]);
    } catch (err) {
      console.error('Erreur de chargement :', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ——— Filtrage ———
  const filtered = useMemo(() => {
    let list = scpiList;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter((s) => s.category === category);
    }
    return list;
  }, [scpiList, search, category]);

  // ——— Sélection ———
  const allFilteredIds = useMemo(() => new Set(filtered.map((s) => s.id)), [filtered]);
  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someFilteredSelected = filtered.some((s) => selected.has(s.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());
  const selectedCount = selected.size;

  // ——— Génération des liens ———
  const handleGenerateLinks = async () => {
    if (selectedCount === 0) return;
    setLoadingLink(true);
    setLinkResult(null);

    try {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const selectedScpis = scpiList.filter((s) => selected.has(s.id));
      const results: { scpiName: string; url: string }[] = [];

      for (const scpi of selectedScpis) {
        const { data, error } = await supabase
          .from('shared_links')
          .insert([{ scpi_id: scpi.id, cgp_id: session.user.id, script_type: 'pitch' }])
          .select('id')
          .single();

        if (!error && data) {
          results.push({ scpiName: scpi.name, url: `https://my-financial-clarity.com/v/${data.id}` });
        }
      }

      setLinkResult(results);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération.');
    } finally {
      setLoadingLink(false);
    }
  };

  // ——— Téléchargement ZIP (simulé) ———
  const handleDownloadZip = async () => {
    setLoadingZip(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      alert('Pack ZIP en cours de préparation. Fonctionnalité à venir.');
    } finally {
      setLoadingZip(false);
    }
  };

  // ── RENDU ──
  const renderOverviewTab = () => {
    if (loadingList && scpiList.length === 0) {
      return <div className="text-slate-400 text-sm">Chargement du catalogue...</div>;
    }

    return (
      <div className="space-y-10">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Catalogue des analyses trimestrielles</h1>
          <p className="text-slate-400 text-sm mt-1">
            {scpiList.length} SCPI disponibles. Sélectionnez, générez vos liens clients, ou téléchargez le pack.
          </p>
        </div>

        {/* BARRE DE FILTRES */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une SCPI..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-auto">
            {filtered.length} / {scpiList.length} SCPI
          </span>
        </div>

        {/* DATATABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-200 transition"
                      aria-label={allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    >
                      {allFilteredSelected ? <CheckSquare size={16} /> : someFilteredSelected ? <CheckSquare size={16} className="opacity-50" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="py-3 px-4">SCPI</th>
                  <th className="py-3 px-4 text-center w-48">MÉDIAS</th>
                  <th className="py-3 px-4 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      Aucune SCPI ne correspond aux filtres.
                    </td>
                  </tr>
                ) : (
                  filtered.map((scpi) => {
                    const isSelected = selected.has(scpi.id);
                    return (
                      <tr
                        key={scpi.id}
                        className={`bg-slate-800/60 border border-slate-700/50 rounded-lg transition-all hover:bg-slate-700/80 hover:border-emerald-500/40 ${
                          isSelected ? 'bg-emerald-950/40 border-emerald-500' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleOne(scpi.id)}
                            className="text-slate-500 hover:text-slate-200 transition"
                            aria-label={isSelected ? `Désélectionner ${scpi.name}` : `Sélectionner ${scpi.name}`}
                          >
                            {isSelected ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="py-3 px-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-emerald-400 flex items-center justify-center shrink-0 mr-3">
                              <span className="text-[11px] font-black text-slate-950">{getInitials(scpi.name)}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-white font-bold text-base truncate">{scpi.name}</span>
                              {(() => {
                                const clean = scpi.category.replace(/Diversifiée?\s?/gi, '').trim();
                                return clean ? (
                                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-md font-medium inline-block mt-1">
                                    {clean}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 justify-center">
                            <button
                              onClick={() => setVideoModal({ title: scpi.name, type: 'pitch' })}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-950 hover:text-emerald-300 transition whitespace-nowrap"
                              title="Prévisualiser le pitch client"
                            >
                              🎥 Pitch (1m30)
                            </button>
                            <button
                              onClick={() => setVideoModal({ title: scpi.name, type: 'analyse' })}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200 transition whitespace-nowrap"
                              title="Prévisualiser l'analyse complète"
                            >
                              📊 Analyse (12m)
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={async () => {
                                if (!supabase) return;
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) return;
                                const { data } = await supabase
                                  .from('shared_links')
                                  .insert([{ scpi_id: scpi.id, cgp_id: session.user.id, script_type: 'pitch' }])
                                  .select('id')
                                  .single();
                                if (data) {
                                  setLinkResult([{ scpiName: scpi.name, url: `https://my-financial-clarity.com/v/${data.id}` }]);
                                  fetchData();
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition"
                              title="Générer un lien client"
                            >
                              <Link size={18} />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition"
                              title="Télécharger la fiche"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BARRE FLOTTANTE STICKY (sélection catalogue) */}
        {selectedCount > 0 && (
          <div className="fixed bottom-14 sm:bottom-16 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 shadow-2xl px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <CheckSquare size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">
                  {selectedCount} SCPI sélectionnée{selectedCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-slate-500 hover:text-slate-300 transition ml-2"
                >
                  <X size={14} className="inline mr-1" />
                  Tout désélectionner
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateLinks}
                  disabled={loadingLink}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold py-2 px-5 rounded-lg transition shadow-lg"
                >
                  <ExternalLink size={16} />
                  {loadingLink ? 'Génération...' : 'Générer le lien unique client'}
                </button>
                <button
                  onClick={handleDownloadZip}
                  disabled={loadingZip}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm font-semibold py-2 px-5 rounded-lg transition"
                >
                  {loadingZip ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full" />
                      Préparation du ZIP...
                    </>
                  ) : (
                    <>
                      <FileArchive size={16} />
                      Télécharger le Pack (ZIP)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALS */}
        <LinkResultModal
          open={linkResult !== null}
          links={linkResult || []}
          onClose={() => setLinkResult(null)}
        />
        <VideoModal
          open={videoModal !== null}
          title={videoModal?.title || ''}
          type={videoModal?.type || 'pitch'}
          onClose={() => setVideoModal(null)}
        />

        {/* SUIVI DES LIENS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-lg font-bold text-slate-100">Suivi de vos relances clients</h2>
            <p className="text-xs text-slate-400 mt-1">Consultez en temps réel l'intérêt de vos clients pour les rapports partagés.</p>
          </div>
          {myLinks.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">Aucun lien généré pour le moment. Vos statistiques apparaîtront ici.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/40">
                  <tr>
                    <th className="py-3 px-4">SCPI</th>
                    <th className="py-3 px-4">Angle de Relance</th>
                    <th className="py-3 px-4">Date de Création</th>
                    <th className="py-3 px-4 text-center">Vues Client</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myLinks.map((link) => {
                    const fullUrl = `https://my-financial-clarity.com/v/${link.id}`;
                    return (
                      <tr key={link.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {Array.isArray(link.scpi_catalog) ? (link.scpi_catalog[0] as any)?.name : (link.scpi_catalog as any)?.name || 'SCPI Supprimée'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 capitalize text-slate-300">
                            {link.script_type === 'pitch' ? '🎥 Pitch vidéo' : link.script_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">{new Date(link.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${link.view_count > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-500'}`}>
                            {link.view_count} {link.view_count > 1 ? 'vues' : 'vue'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigator.clipboard.writeText(fullUrl)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition font-medium"
                          >
                            Copier l'URL
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── RENDU PRINCIPAL AVEC ONGLETS ──
  return (
    <ProReportProvider>
      <div className="space-y-6 pb-20">
      {/* En-tête + Navigation par onglets */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-4">Espace Pro</h1>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === 'overview' && renderOverviewTab()}

      {activeTab === 'comparator' && (
        <Suspense fallback={<div className="text-slate-400 text-sm py-8 text-center">Chargement du comparateur...</div>}>
          <ProComparator />
        </Suspense>
      )}

      {activeTab === 'simulator' && (
        <Suspense fallback={<div className="text-slate-400 text-sm py-8 text-center">Chargement du simulateur...</div>}>
          <ProSimulator />
        </Suspense>
      )}

      {activeTab === 'reports' && <ReportsTab />}

      {/* Disclaimer général Pro */}
      <div className="mt-8 bg-slate-900/40 border border-slate-800/50 rounded-lg p-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Espace Professionnel MaximusSCPI — réservé aux CGP disposant d'un mandat ORIAS en cours de validité.
          Les outils mis à disposition constituent une aide à la décision et ne remplacent pas une analyse
          patrimoniale personnalisée. Les simulations sont fournies à titre indicatif.
        </p>
      </div>
    </div>
    </ProReportProvider>
  );
}
