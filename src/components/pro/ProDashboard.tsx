import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Link, Download, CheckSquare, Square, X, FileArchive, ExternalLink } from 'lucide-react';

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

// ── Constantes ──
const CATEGORIES = ['Bureaux', 'Commerces', 'Santé', 'Logistique', 'Hôtellerie', 'Résidentiel', 'Multi-secteurs'];

const CATEGORY_COLORS: Record<string, string> = {
  Bureaux: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Commerces: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Santé: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Logistique: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Hôtellerie: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Résidentiel: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Multi-secteurs': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const getCategoryBadge = (cat: string) =>
  CATEGORY_COLORS[cat] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

const getInitials = (name: string): string =>
  name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

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
          Partagez ces liens avec vos clients. Aucun marquage MaximusSCPI.
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

// ── Composant principal ──
export default function ProDashboard() {
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

  // Modal
  const [linkResult, setLinkResult] = useState<{ scpiName: string; url: string }[] | null>(null);

  // ——— Data fetching ———
  const fetchData = useCallback(async () => {
    setLoadingList(true);
    try {
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

  // ——— Génération des liens (multi) ———
  const handleGenerateLinks = async () => {
    if (selectedCount === 0) return;
    setLoadingLink(true);
    setLinkResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const selectedScpis = scpiList.filter((s) => selected.has(s.id));
      const results: { scpiName: string; url: string }[] = [];

      for (const scpi of selectedScpis) {
        const { data, error } = await supabase
          .from('shared_links')
          .insert([{ scpi_id: scpi.id, cgp_id: session.user.id, script_type: 'technique' }])
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
      // Placeholder — sera remplacé par l'appel réel plus tard
      await new Promise((r) => setTimeout(r, 2000));
      alert('Pack ZIP en cours de préparation. Fonctionnalité à venir.');
    } finally {
      setLoadingZip(false);
    }
  };

  // ——— État de chargement ———
  if (loadingList && scpiList.length === 0) {
    return <div className="text-slate-400 text-sm">Chargement du catalogue...</div>;
  }

  // ── RENDU ──
  return (
    <div className="space-y-10 pb-32">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Catalogue des analyses trimestrielles</h1>
        <p className="text-slate-400 text-sm mt-1">
          {scpiList.length} SCPI disponibles. Sélectionnez, générez vos liens clients, ou téléchargez le pack.
        </p>
      </div>

      {/* ===================== BARRE DE FILTRES ===================== */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Recherche */}
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

        {/* Catégorie */}
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

        {/* Badge résultat */}
        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} / {scpiList.length} SCPI
        </span>
      </div>

      {/* ===================== DATATABLE ===================== */}
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
                <th className="py-3 px-4 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    Aucune SCPI ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((scpi) => {
                  const isSelected = selected.has(scpi.id);
                  return (
                    <tr
                      key={scpi.id}
                      className={`transition-colors duration-200 hover:bg-slate-800/50 ${
                        isSelected ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''
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
                          {/* Logo placeholder */}
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-slate-300">{getInitials(scpi.name)}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-100 truncate">{scpi.name}</span>
                            {(() => {
                              const clean = scpi.category.replace(/Diversifiée?\s?/gi, '').trim();
                              return clean ? (
                                <span className={`inline-block w-fit mt-0.5 px-2 py-0.5 text-[11px] rounded-full font-medium border ${getCategoryBadge(scpi.category)}`}>
                                  {clean}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={async () => {
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) return;
                              const { data } = await supabase
                                .from('shared_links')
                                .insert([{ scpi_id: scpi.id, cgp_id: session.user.id, script_type: 'technique' }])
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

      {/* ===================== BARRE FLOTTANTE STICKY ===================== */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 shadow-2xl px-6 py-3">
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

      {/* ===================== MODAL RÉSULTAT LIENS ===================== */}
      <LinkResultModal
        open={linkResult !== null}
        links={linkResult || []}
        onClose={() => setLinkResult(null)}
      />

      {/* ===================== SECTION 3 : SUIVI DES LIENS ===================== */}
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
                      <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 capitalize text-slate-300">{link.script_type}</span></td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{new Date(link.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${link.view_count > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-500'}`}>
                          {link.view_count} {link.view_count > 1 ? 'vues' : 'vue'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fullUrl);
                            // Simple feedback via data attr
                          }}
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
}
