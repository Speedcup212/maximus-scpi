import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Search,
  X,
  Building2,
  ShoppingBag,
  Warehouse,
  Heart,
  GraduationCap,
  Hotel,
  Home,
  Factory,
  Layers,
  Briefcase,
  Building,
  ExternalLink,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import type { InvestmentNewsItem, AssetType } from '../types/investmentNews';
import { ASSET_TYPE_LABELS } from '../types/investmentNews';
import newsJson from '../../data/news/scpi-investment-news-latest.json';
import sourcesJson from '../../data/scpi-investment-news-sources.json';

const ALL_NEWS: InvestmentNewsItem[] = Array.isArray(newsJson) ? (newsJson as InvestmentNewsItem[]) : [];

interface TrackedScpi {
  slug: string;
  name: string;
  managementCompany: string;
  enabled: boolean;
  officialUrl: string;
}

// Extraction des SCPI uniques suivies (dédupliquées par nom)
const TRACKED_SCPIS: TrackedScpi[] = (() => {
  const seen = new Set<string>();
  const list: TrackedScpi[] = [];
  for (const s of sourcesJson as Array<{ slug: string; name: string; managementCompany: string; enabled: boolean; officialUrl: string }>) {
    if (!s.name || seen.has(s.name)) continue;
    seen.add(s.name);
    list.push({
      slug: s.slug,
      name: s.name,
      managementCompany: s.managementCompany || '',
      enabled: s.enabled !== false,
      officialUrl: s.officialUrl || '',
    });
  }
  return list;
})();

const ASSET_TYPE_ICON_MAP: Record<AssetType, React.FC<{ className?: string }>> = {
  bureaux: Building2,
  commerce: ShoppingBag,
  logistique: Warehouse,
  sante: Heart,
  education: GraduationCap,
  hotellerie: Hotel,
  residentiel_gere: Home,
  locaux_activite: Factory,
  mixte: Layers,
  portefeuille_multi_actifs: Briefcase,
  autre_immobilier: Building,
};

const ASSET_COLORS: Record<AssetType, string> = {
  bureaux: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  commerce: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  logistique: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  sante: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  education: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  hotellerie: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  residentiel_gere: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  locaux_activite: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  mixte: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  portefeuille_multi_actifs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  autre_immobilier: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const PILL_FILTERS: { value: 'all' | AssetType; label: string }[] = [
  { value: 'all', label: 'Tous les investissements' },
  { value: 'bureaux', label: 'Bureaux' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'logistique', label: 'Logistique' },
  { value: 'sante', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'hotellerie', label: 'Hôtellerie' },
  { value: 'residentiel_gere', label: 'Résidentiel géré' },
  { value: 'portefeuille_multi_actifs', label: 'Portefeuilles multi-actifs' },
];

const QUICK_ACCESS: { value: AssetType; icon: React.FC<{ className?: string }> }[] = [
  { value: 'bureaux', icon: Building2 },
  { value: 'commerce', icon: ShoppingBag },
  { value: 'logistique', icon: Warehouse },
  { value: 'sante', icon: Heart },
  { value: 'education', icon: GraduationCap },
  { value: 'hotellerie', icon: Hotel },
  { value: 'residentiel_gere', icon: Home },
  { value: 'portefeuille_multi_actifs', icon: Briefcase },
];

function calculateInvestmentSearchScore(item: InvestmentNewsItem, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  const fields = [item.scpi, item.managementCompany, item.city, item.country, item.assetType, item.tenant, item.title, item.summary];
  for (const field of fields) {
    const f = (field || '').toLowerCase();
    if (f === q) score += 100;
    else if (f.startsWith(q)) score += 70;
    else if (f.includes(q)) score += 40;
  }
  return score;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

interface ActualitesPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onLogoClick?: () => void;
  onFaqClick?: () => void;
  onScpiPageClick?: (slug: string) => void;
  onUnderstandingClick?: () => void;
  onAboutSectionClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  onArticlesClick?: () => void;
  onActualitesClick?: () => void;
  onEducationClick?: (category: string, slug: string) => void;
}

const ActualitesPage: React.FC<ActualitesPageProps> = ({
  isDarkMode,
  toggleTheme,
  onContactClick,
  onAboutClick,
  onLogoClick,
  onFaqClick,
  onScpiPageClick,
  onUnderstandingClick,
  onAboutSectionClick,
  onComparateurClick,
  onSimulateurClick,
  onArticlesClick,
  onActualitesClick,
  onEducationClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | AssetType>('all');
  const [scpiSearchQuery, setScpiSearchQuery] = useState('');
  const [showAllScpis, setShowAllScpis] = useState(false);

  // ── Investissements affichables ──
  const displayable = useMemo(() => {
    const valid = ALL_NEWS.filter((i) => i.dataQuality !== 'weak' && i.editorialPriority > 0);
    if (activeFilter === 'all') return valid;
    return valid.filter((item) => item.assetType === activeFilter);
  }, [activeFilter]);

  const filteredByAsset = useMemo(() => {
    if (activeFilter === 'all') return ALL_NEWS;
    return ALL_NEWS.filter((item) => item.assetType === activeFilter);
  }, [activeFilter]);

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return filteredByAsset;
    const q = searchQuery.trim().toLowerCase();
    return filteredByAsset
      .filter((item) => {
        const fields = [item.scpi, item.managementCompany, item.city, item.country, item.assetType, item.tenant, item.title, item.summary];
        return fields.some((f) => (f || '').toLowerCase().includes(q));
      })
      .sort((a, b) => calculateInvestmentSearchScore(b, searchQuery) - calculateInvestmentSearchScore(a, searchQuery));
  }, [filteredByAsset, searchQuery]);

  const searchedDisplayable = useMemo(() => searched.filter((i) => i.dataQuality !== 'weak' && i.editorialPriority > 0), [searched]);
  const featured = useMemo(() => displayable.slice(0, 3), [displayable]);

  // ── Compteurs par type d'actif ──
  const assetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of ALL_NEWS) {
      if (item.dataQuality !== 'weak' && item.editorialPriority > 0) {
        counts[item.assetType] = (counts[item.assetType] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // ── Investissements par SCPI ──
  const scpiInvestments = useMemo(() => {
    const map: Record<string, InvestmentNewsItem[]> = {};
    for (const item of ALL_NEWS) {
      if (item.dataQuality === 'weak' || item.editorialPriority === 0) continue;
      const key = item.scpi;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, []);

  // Associe chaque SCPI suivie à ses investissements + dernier actif
  const trackedScpiData = useMemo(() => {
    return TRACKED_SCPIS.map((scpi) => {
      const investments = scpiInvestments[scpi.name] || [];
      // Cherche aussi par nom partiel (la SCPI peut apparaître comme sous-chaîne)
      const altMatches = !investments.length
        ? Object.entries(scpiInvestments).filter(([key]) =>
            key.toLowerCase().includes(scpi.name.toLowerCase()) || scpi.name.toLowerCase().includes(key.toLowerCase())
          ).flatMap(([, items]) => items)
        : [];
      const all = investments.length ? investments : altMatches;
      const latest = all.length > 0 ? all.sort((a, b) => b.date.localeCompare(a.date))[0] : null;
      return { ...scpi, count: all.length, latest };
    });
  }, [scpiInvestments]);

  // Filtrage des cartes SCPI
  const filteredScpis = useMemo(() => {
    let list = trackedScpiData;
    if (scpiSearchQuery.trim()) {
      const q = scpiSearchQuery.trim().toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) || (s.managementCompany || '').toLowerCase().includes(q)
      );
    }
    // Tri : SCPI avec investissements d'abord, puis alphabétique
    list = [...list].sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1;
      if (b.count > 0 && a.count === 0) return 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [trackedScpiData, scpiSearchQuery]);

  // Affichage progressif
  const scpisWithInvestments = useMemo(() => filteredScpis.filter((s) => s.count > 0), [filteredScpis]);
  const DEFAULT_VISIBLE = 12;
  const visibleScpis = useMemo(() => {
    if (showAllScpis) return filteredScpis;
    if (scpisWithInvestments.length > 0) return scpisWithInvestments;
    return filteredScpis.slice(0, DEFAULT_VISIBLE);
  }, [filteredScpis, scpisWithInvestments, showAllScpis]);
  const hasMore = filteredScpis.length > visibleScpis.length;

  const clearSearch = () => setSearchQuery('');

  return (
    <>
      <SEOHead
        title="Derniers investissements immobiliers des SCPI | MaximusSCPI"
        description="Suivez les immeubles, actifs et portefeuilles récemment acquis par les SCPI. Lecture claire par société, secteur et localisation."
        keywords={['investissements SCPI', 'acquisitions SCPI', 'immeubles SCPI', 'actualité immobilière SCPI']}
        canonical="https://maximusscpi.com/actualites/"
      />

      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={onContactClick}
          onAboutClick={onAboutClick}
          onLogoClick={onLogoClick}
          onFaqClick={onFaqClick}
          onScpiPageClick={onScpiPageClick}
          onUnderstandingClick={onUnderstandingClick}
          onAboutSectionClick={onAboutSectionClick}
          onComparateurClick={onComparateurClick}
          onSimulateurClick={onSimulateurClick}
          onArticlesClick={onArticlesClick}
          onActualitesClick={onActualitesClick}
          onEducationClick={onEducationClick || ((_, __) => {})}
          currentView="actualites"
        />

        {/* ============================================
            HERO
        ============================================ */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
                <Building2 className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Derniers investissements immobiliers des SCPI
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Suivez les immeubles, actifs et portefeuilles récemment acquis par les SCPI,
              avec une lecture claire par société, secteur et localisation.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* ============================================
              BARRE DE RECHERCHE INVESTISSEMENTS
          ============================================ */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher : SCPI, ville, pays, secteur, société de gestion…"
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* ============================================
              FILTRES EN PILLS
          ============================================ */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {PILL_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === f.value
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* ============================================
              INVESTISSEMENTS PAR SCPI
          ============================================ */}
          {!searchQuery && (
            <section className="mb-14">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Investissements par SCPI
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                  Recherchez une SCPI et consultez les derniers actifs acquis à partir des sources officielles suivies.
                </p>
              </div>

              {/* Barre de recherche SCPI */}
              <div className="max-w-lg mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={scpiSearchQuery}
                    onChange={(e) => setScpiSearchQuery(e.target.value)}
                    placeholder="Rechercher une SCPI : Iroko Zen, Remake Live, Épargne Pierre Europe…"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {scpiSearchQuery && (
                    <button onClick={() => setScpiSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grille des cartes SCPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleScpis.map((scpi) => (
                  <ScpiCard
                    key={scpi.slug}
                    scpi={scpi}
                    hasInvestments={scpi.count > 0}
                    onClick={() => {
                      setScpiSearchQuery(scpi.name);
                    }}
                  />
                ))}
              </div>

              {/* État vide recherche SCPI */}
              {filteredScpis.length === 0 && scpiSearchQuery && (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune SCPI ne correspond à "{scpiSearchQuery}".
                  </p>
                </div>
              )}

              {/* Bouton "Voir toutes les SCPI suivies" */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllScpis(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Voir toutes les SCPI suivies ({filteredScpis.length})
                  </button>
                </div>
              )}
              {showAllScpis && hasMore && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => setShowAllScpis(false)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    Réduire
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ============================================
              ACCÈS RAPIDE PAR TYPE D'ACTIF
          ============================================ */}
          {!searchQuery && (
            <section className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Accès rapide par type d'actif
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {QUICK_ACCESS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setActiveFilter(value)}
                    className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all text-left"
                  >
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 w-fit mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {ASSET_TYPE_LABELS[value]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {assetCounts[value] || 0} investissement{(assetCounts[value] || 0) > 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ============================================
              À LA UNE (top 3)
          ============================================ */}
          {!searchQuery && activeFilter === 'all' && featured.length > 0 && (
            <section className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Derniers investissements à la une
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featured.map((item, idx) => (
                  <InvestmentCard key={item.id || idx} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================
              LISTE COMPLÈTE
          ============================================ */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery
                  ? `Résultats pour "${searchQuery}"`
                  : activeFilter !== 'all'
                  ? ASSET_TYPE_LABELS[activeFilter]
                  : 'Tous les investissements détectés'}
              </h2>
              {!searchQuery && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {searchedDisplayable.length} investissement{searchedDisplayable.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {searchedDisplayable.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Aucun investissement récent n'a encore été détecté.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Les acquisitions immobilières des SCPI seront publiées ici dès leur détection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {searchedDisplayable.map((item, idx) => (
                  <InvestmentRow key={item.id || idx} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>

        <LegalFooter
          isDarkMode={isDarkMode}
          onContactClick={onContactClick}
          onAboutClick={onAboutClick}
        />
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Sous-composants internes                                          */
/* ------------------------------------------------------------------ */

/** Carte SCPI compacte pour la section "Investissements par SCPI" */
const ScpiCard: React.FC<{
  scpi: { name: string; managementCompany: string; slug: string; count: number; latest: InvestmentNewsItem | null };
  hasInvestments: boolean;
  onClick: () => void;
}> = ({ scpi, hasInvestments, onClick }) => {
  const latest = scpi.latest;
  const AssetIcon = latest ? (ASSET_TYPE_ICON_MAP[latest.assetType] || Building) : Building;
  const colorClass = latest ? (ASSET_COLORS[latest.assetType] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300') : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        hasInvestments
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{scpi.name}</p>
          {scpi.managementCompany && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{scpi.managementCompany}</p>
          )}
        </div>
        {hasInvestments ? (
          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="w-3 h-3" />
            {scpi.count}
          </span>
        ) : (
          <span className="flex-shrink-0 text-xs text-gray-300 dark:text-gray-600">—</span>
        )}
      </div>

      {latest && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>
            <AssetIcon className="w-3 h-3" />
            {ASSET_TYPE_LABELS[latest.assetType]}
          </span>
          <span className="truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {latest.city || '—'}, {latest.country || '—'}
          </span>
        </div>
      )}
      {!latest && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 pt-2 border-t border-gray-100 dark:border-gray-700 italic">
          Aucune acquisition récente détectée dans nos sources.
        </p>
      )}

      {scpi.count > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            Voir les investissements
            <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
};

const InvestmentCard: React.FC<{ item: InvestmentNewsItem }> = ({ item }) => {
  const AssetIcon = ASSET_TYPE_ICON_MAP[item.assetType] || Building;
  const colorClass = ASSET_COLORS[item.assetType] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
        <Building2 className="w-16 h-16 text-slate-400 dark:text-slate-500" />
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          <AssetIcon className="w-3.5 h-3.5" />
          {ASSET_TYPE_LABELS[item.assetType]}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium text-emerald-600 dark:text-emerald-400">{item.scpi}</span>
          {' — '}
          {item.city}, {item.country}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 flex-1">{item.summary}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.date)}
          </span>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const InvestmentRow: React.FC<{ item: InvestmentNewsItem }> = ({ item }) => {
  const AssetIcon = ASSET_TYPE_ICON_MAP[item.assetType] || Building;
  const colorClass = ASSET_COLORS[item.assetType] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <AssetIcon className="w-3.5 h-3.5" />
            {ASSET_TYPE_LABELS[item.assetType]}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.date)}
          </span>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Source officielle
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
        <DetailBadge label="SCPI" value={item.scpi} />
        <DetailBadge label="Société de gestion" value={item.managementCompany} />
        <DetailBadge label="Ville" value={item.city} icon={MapPin} />
        <DetailBadge label="Pays" value={item.country} />
        {item.amount !== 'Non communiqué' && <DetailBadge label="Montant" value={item.amount} />}
        {item.surface !== 'Non communiqué' && <DetailBadge label="Surface" value={item.surface} />}
        {item.tenant !== 'Non communiqué' && <DetailBadge label="Locataire" value={item.tenant} />}
        {item.leaseDuration !== 'Non communiqué' && <DetailBadge label="Durée de bail" value={item.leaseDuration} />}
      </div>

      {item.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{item.summary}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {item.disclaimer}
      </p>
    </div>
  );
};

const DetailBadge: React.FC<{ label: string; value: string; icon?: React.FC<{ className?: string }> }> = ({ label, value, icon: Icon }) => (
  <div className="text-xs">
    <span className="text-gray-400 dark:text-gray-500">{label}</span>
    <p className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 mt-0.5">
      {Icon && <Icon className="w-3 h-3" />}
      {value}
    </p>
  </div>
);

export default ActualitesPage;
