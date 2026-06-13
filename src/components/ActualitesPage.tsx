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
} from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import type { InvestmentNewsItem, AssetType } from '../types/investmentNews';
import { ASSET_TYPE_LABELS } from '../types/investmentNews';
import newsJson from '../../data/news/scpi-investment-news-latest.json';

const ALL_NEWS: InvestmentNewsItem[] = Array.isArray(newsJson) ? (newsJson as InvestmentNewsItem[]) : [];

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

// Filtres principaux affichés en pill
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

// Catégories pour l'accès rapide
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

  // Investissements affichables (dataQuality != weak, editorialPriority > 0)
  const displayable = useMemo(() => searched.filter((i) => i.dataQuality !== 'weak' && i.editorialPriority > 0), [searched]);

  // Top 3 à la une
  const featured = useMemo(() => displayable.slice(0, 3), [displayable]);

  // Compteurs par catégorie pour l'accès rapide
  const assetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of ALL_NEWS) {
      if (item.dataQuality !== 'weak' && item.editorialPriority > 0) {
        counts[item.assetType] = (counts[item.assetType] || 0) + 1;
      }
    }
    return counts;
  }, []);

  const clearSearch = () => setSearchQuery('');
  const selectFilter = (f: 'all' | AssetType) => setActiveFilter(f);

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
              BARRE DE RECHERCHE
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
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {PILL_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => selectFilter(f.value)}
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
              ACCÈS RAPIDE PAR TYPE D'ACTIF (si pas de recherche)
          ============================================ */}
          {!searchQuery && activeFilter === 'all' && (
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Accès rapide par type d'actif
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {QUICK_ACCESS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => selectFilter(value)}
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
            <section className="mb-12">
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
                  {displayable.length} investissement{displayable.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {displayable.length === 0 ? (
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
                {displayable.map((item, idx) => (
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

const InvestmentCard: React.FC<{ item: InvestmentNewsItem }> = ({ item }) => {
  const AssetIcon = ASSET_TYPE_ICON_MAP[item.assetType] || Building;
  const colorClass = ASSET_COLORS[item.assetType] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      {/* Placeholder visuel */}
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
      {/* En-tête */}
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

      {/* Détails */}
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

      {/* Résumé */}
      {item.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{item.summary}</p>
      )}

      {/* Disclaimer */}
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
