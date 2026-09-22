import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingUp,
  Eye,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import type { InvestmentNewsItem, AssetType } from '../types/investmentNews';
import { ASSET_TYPE_LABELS } from '../types/investmentNews';
import { createSlugFromName } from '../utils/scpiSlugMapper';
import newsJson from '../../data/news/scpi-investment-news-latest.json';
import sourcesJson from '../../data/scpi-investment-news-sources.json';
// Liste complète de toutes les SCPI du projet (63+ entrées)
import scpiCompletRaw from '../data/scpi_complet.json';
import { supabase } from '../supabaseClient';

const ALL_NEWS: InvestmentNewsItem[] = Array.isArray(newsJson) ? (newsJson as InvestmentNewsItem[]) : [];

type ScpiStatus = 'acquisition' | 'active' | 'incomplete' | 'error';

interface TrackedScpi {
  slug: string;
  name: string;
  managementCompany: string;
  status: ScpiStatus;
  lastCheckedAt?: string | null;
  lastSuccessAt?: string | null;
  lastError?: string | null;
  sourceUrl?: string;
}

/** Construit l'index des sources par nom de SCPI */
const sourceByName = new Map<string, { slug: string; hasUrl: boolean; enabled: boolean; sourceUrl: string }>();
for (const s of sourcesJson as Array<{ slug: string; name: string; enabled: boolean; officialUrl: string; newsUrl: string; rssUrl: string }>) {
  if (!s.name) continue;
  sourceByName.set(s.name.toLowerCase(), {
    slug: s.slug,
    hasUrl: !!(s.officialUrl || s.newsUrl || s.rssUrl),
    enabled: s.enabled !== false,
    sourceUrl: s.newsUrl || s.officialUrl || s.rssUrl || '',
  });
}

/** Liste COMPLÈTE de toutes les SCPI du projet (63 unique) */
const TRACKED_SCPIS: TrackedScpi[] = (() => {
  const seen = new Set<string>();
  const list: TrackedScpi[] = [];
  for (const entry of scpiCompletRaw as Array<{ [key: string]: unknown }>) {
    const name = (entry['Nom SCPI'] as string) || '';
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const company = (entry['Société de gestion'] as string) || '';
    const slug = createSlugFromName(name);
    // Détermine le statut à partir du fichier sources
    const src = sourceByName.get(name.toLowerCase()) || sourceByName.get(company.toLowerCase());
    const hasSourceUrl = src?.hasUrl;
    const sourceActive = src ? src.enabled : false;
    const status: ScpiStatus = sourceActive && hasSourceUrl ? 'active' : 'incomplete';
    const sourceUrl = src?.sourceUrl || '';
    list.push({ slug, name, managementCompany: company, status, sourceUrl });
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

function formatWatchDate(dateStr?: string | null): string {
  if (!dateStr) return 'jamais';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return `aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
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
  const [newsItems, setNewsItems] = useState<InvestmentNewsItem[]>(ALL_NEWS);
  const [selectedWatchSlug, setSelectedWatchSlug] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/actualites\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [liveSources, setLiveSources] = useState<Record<string, {
    slug: string;
    name: string;
    status: 'active' | 'incomplete' | 'error';
    last_checked_at: string | null;
    last_success_at: string | null;
    last_error: string | null;
    news_url?: string | null;
    official_url?: string | null;
  }>>({});

  // La page lit désormais la veille directement dans Supabase.
  // Le JSON du dépôt reste uniquement un fallback si Supabase est temporairement indisponible.
  useEffect(() => {
    let cancelled = false;

    const loadLiveWatch = async () => {
      if (!supabase) return;

      try {
        const [newsResult, sourcesResult] = await Promise.all([
          supabase
            .from('scpi_news_items')
            .select('*')
            .eq('status', 'published')
            .gt('editorial_priority', 0)
            .neq('data_quality', 'weak')
            .order('published_date', { ascending: false })
            .order('detected_at', { ascending: false })
            .limit(500),
          supabase
            .from('scpi_news_sources')
            .select('slug,name,status,last_checked_at,last_success_at,last_error,news_url,official_url')
        ]);

        if (cancelled) return;

        if (!newsResult.error && newsResult.data) {
          const mapped = newsResult.data.map((row: any): InvestmentNewsItem => ({
            id: row.id,
            scpi: row.scpi_name,
            managementCompany: row.management_company || '',
            operationType: row.operation_type || 'acquisition',
            assetType: row.asset_type || 'autre_immobilier',
            country: row.country || '',
            city: row.city || '',
            area: row.area || '',
            address: row.address || '',
            tenant: row.tenant || '',
            amount: row.amount || '',
            surface: row.surface || '',
            leaseDuration: row.lease_duration || '',
            title: row.title,
            summary: row.summary || '',
            sourceUrl: row.source_url || '',
            sourceOfficial: row.source_official !== false,
            date: row.published_date || (row.detected_at ? row.detected_at.slice(0, 10) : ''),
            detectedAt: row.detected_at || '',
            investmentRelated: true,
            dataQuality: row.data_quality || 'standard',
            editorialPriority: row.editorial_priority || 2,
            confidence: Number(row.confidence || 0.85),
            disclaimer: "Information factuelle issue d'une source officielle. Ne constitue pas une recommandation d'investissement.",
          }));
          setNewsItems(mapped);
        }

        if (!sourcesResult.error && sourcesResult.data) {
          const bySlug: Record<string, any> = {};
          for (const row of sourcesResult.data) bySlug[row.slug] = row;
          setLiveSources(bySlug);
        }
      } catch (error) {
        console.warn('[ActualitesPage] Veille Supabase indisponible, fallback local conservé.', error);
      }
    };

    loadLiveWatch();
    return () => { cancelled = true; };
  }, []);

  // Synchronise le détail interne avec l'URL /actualites/<slug> et les boutons précédent/suivant.
  useEffect(() => {
    const syncWatchFromUrl = () => {
      const match = window.location.pathname.match(/^\/actualites\/([^/?#]+)/i);
      setSelectedWatchSlug(match ? decodeURIComponent(match[1]) : null);
    };
    window.addEventListener('popstate', syncWatchFromUrl);
    return () => window.removeEventListener('popstate', syncWatchFromUrl);
  }, []);

  // ── Investissements par type d'actif ──
  const filteredByAsset = useMemo(() => {
    if (activeFilter === 'all') return newsItems;
    return newsItems.filter((item) => item.assetType === activeFilter);
  }, [activeFilter, newsItems]);

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

  // ── Index des investissements par SCPI ──
  const scpiInvestments = useMemo(() => {
    const map: Record<string, InvestmentNewsItem[]> = {};
    for (const item of newsItems) {
      if (item.dataQuality === 'weak' || item.editorialPriority === 0) continue;
      const key = item.scpi.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [newsItems]);

  // ── Enrichit la liste complète avec les acquisitions détectées ──
  const enrichedScpis = useMemo(() => {
    return TRACKED_SCPIS.map((scpi) => {
      const key = scpi.name.toLowerCase();
      const investments = scpiInvestments[key] || [];
      // Recherche par correspondance partielle si aucune correspondance exacte
      const altMatches = !investments.length
        ? Object.entries(scpiInvestments)
            .filter(([k]) => k.includes(key) || key.includes(k))
            .flatMap(([, items]) => items)
        : [];
      const all = investments.length ? investments : altMatches;
      const latest = all.length > 0 ? all.sort((a, b) => b.date.localeCompare(a.date))[0] : null;
      const count = all.length;
      const live = liveSources[scpi.slug];
      const watchStatus: ScpiStatus = live?.status || scpi.status;
      const status: ScpiStatus =
        watchStatus === 'error'
          ? 'error'
          : count > 0
          ? 'acquisition'
          : watchStatus;
      return {
        ...scpi,
        count,
        latest,
        status,
        lastCheckedAt: live?.last_checked_at || null,
        lastSuccessAt: live?.last_success_at || null,
        lastError: live?.last_error || null,
        sourceUrl: live?.news_url || live?.official_url || scpi.sourceUrl || '',
      };
    });
  }, [scpiInvestments, liveSources]);

  // ── Filtrage des cartes SCPI par la recherche globale ──
  const filteredScpis = useMemo(() => {
    let list = enrichedScpis;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) => {
          // Recherche dans le nom SCPI
          if (s.name.toLowerCase().includes(q)) return true;
          // Recherche dans la société de gestion
          if ((s.managementCompany || '').toLowerCase().includes(q)) return true;
          // Recherche dans les acquisitions détectées (ville, pays, type, locataire)
          if (s.latest) {
            const fields = [
              s.latest.city,
              s.latest.country,
              s.latest.assetType,
              s.latest.tenant,
            ];
            if (fields.some((f) => (f || '').toLowerCase().includes(q))) return true;
          }
          return false;
        },
      );
    }
    // Tri : acquisitions d'abord, puis actif, puis alphabetique
    list = [...list].sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1;
      if (b.count > 0 && a.count === 0) return 1;
      if (a.status === 'active' && b.status === 'incomplete') return -1;
      if (b.status === 'active' && a.status === 'incomplete') return 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [enrichedScpis, searchQuery]);

  // ── Stats globales ──
  const totalAcquisitions = useMemo(() => filteredScpis.reduce((sum, s) => sum + s.count, 0), [filteredScpis]);
  const scpisWithAcquisitions = useMemo(() => filteredScpis.filter((s) => s.count > 0).length, [filteredScpis]);

  // ── Compteurs par type d'actif ──
  const assetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of newsItems) {
      if (item.dataQuality !== 'weak' && item.editorialPriority > 0) {
        counts[item.assetType] = (counts[item.assetType] || 0) + 1;
      }
    }
    return counts;
  }, [newsItems]);
  const hasAnyAcquisition = totalAcquisitions > 0;

  const selectedWatchScpi = useMemo(
    () => enrichedScpis.find((scpi) => scpi.slug === selectedWatchSlug) || null,
    [enrichedScpis, selectedWatchSlug],
  );

  useEffect(() => {
    if (selectedWatchScpi) {
      setSearchQuery(selectedWatchScpi.name);
    }
  }, [selectedWatchScpi?.slug]);

  const openWatchDetail = (scpi: TrackedScpi & { count: number; latest: InvestmentNewsItem | null; status: ScpiStatus }) => {
    setSelectedWatchSlug(scpi.slug);
    setSearchQuery(scpi.count > 0 ? scpi.name : '');
    window.history.pushState({ scpiWatch: scpi.slug }, '', `/actualites/${scpi.slug}`);
    window.setTimeout(() => {
      document.getElementById('scpi-watch-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const closeWatchDetail = () => {
    setSelectedWatchSlug(null);
    setSearchQuery('');
    window.history.pushState({}, '', '/actualites');
  };

  const featured = useMemo(() => searchedDisplayable.slice(0, 3), [searchedDisplayable]);
  const clearSearch = () => {
    setSearchQuery('');
    if (selectedWatchSlug) {
      setSelectedWatchSlug(null);
      window.history.pushState({}, '', '/actualites');
    }
  };

  return (
    <>
      <SEOHead
        title={
          selectedWatchScpi
            ? `Actualités et acquisitions ${selectedWatchScpi.name} | MaximusSCPI`
            : 'Derniers investissements immobiliers des SCPI | MaximusSCPI'
        }
        description={
          selectedWatchScpi
            ? `Suivez la veille des acquisitions et investissements immobiliers de la SCPI ${selectedWatchScpi.name}, avec les sources officielles contrôlées par MaximusSCPI.`
            : 'Suivez les immeubles, actifs et portefeuilles récemment acquis par les SCPI. Lecture claire par société, secteur et localisation.'
        }
        keywords={['investissements SCPI', 'acquisitions SCPI', 'immeubles SCPI', 'actualité immobilière SCPI']}
        canonical={
          selectedWatchScpi
            ? `https://maximusscpi.com/actualites/${selectedWatchScpi.slug}/`
            : 'https://maximusscpi.com/actualites/'
        }
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

        {/* ====== HERO ====== */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
                <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {selectedWatchScpi
                ? `Actualités et acquisitions de ${selectedWatchScpi.name}`
                : 'Derniers investissements immobiliers des SCPI'}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              {selectedWatchScpi
                ? `Veille immobilière mise à jour automatiquement à partir des sources officielles de ${selectedWatchScpi.managementCompany || 'la société de gestion'}.`
                : 'Suivez les immeubles, actifs et portefeuilles récemment acquis par les SCPI, avec une lecture claire par société, secteur et localisation.'}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* ====== BARRE DE RECHERCHE GLOBALE ====== */}
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
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* ====== FILTRES EN PILLS ====== */}
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

          {/* ====== INVESTISSEMENTS PAR SCPI — GRILLE COMPLÈTE ====== */}
          <section className="mb-14">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Investissements par SCPI
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Veille automatisée quotidienne des sources officielles. Le statut de chaque SCPI indique le dernier contrôle réellement effectué.
              </p>
            </div>

            {/* Compteurs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-semibold">{filteredScpis.length}</span> SCPI
                {searchQuery ? ' trouvée' : 's'} suivie{filteredScpis.length > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold">{totalAcquisitions}</span> acquisition{totalAcquisitions > 1 ? 's' : ''} détectée{totalAcquisitions > 1 ? 's' : ''}
              </span>
              {scpisWithAcquisitions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span className="font-semibold">{scpisWithAcquisitions}</span> SCPI concernée{scpisWithAcquisitions > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Phrase d'explication quand 0 acquisition détectée */}
            {!searchQuery && totalAcquisitions === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                Les acquisitions apparaîtront automatiquement dès qu'elles seront identifiées dans les sources officielles.
              </p>
            )}

            {/* État vide recherche */}
            {filteredScpis.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune SCPI ne correspond à votre recherche.
                </p>
              </div>
            )}

            {/* Grille premium des SCPI — TOUJOURS visible par défaut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredScpis.map((scpi) => (
                <ScpiCard
                  key={scpi.slug}
                  scpi={scpi}
                  onClick={() => openWatchDetail(scpi)}
                />
              ))}
            </div>

            {selectedWatchScpi && (
              <div
                id="scpi-watch-detail"
                className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-lg overflow-hidden scroll-mt-24"
              >
                <div className="p-5 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Veille MaximusSCPI
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedWatchScpi.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedWatchScpi.managementCompany}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeWatchDetail}
                      className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Fermer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Statut de la veille</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedWatchScpi.status === 'error'
                          ? 'Erreur de veille'
                          : selectedWatchScpi.status === 'incomplete'
                          ? 'Source à compléter'
                          : 'Veille opérationnelle'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dernier contrôle</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {formatWatchDate(selectedWatchScpi.lastCheckedAt)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Acquisitions détectées</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedWatchScpi.count}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-emerald-500/15 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
                    {selectedWatchScpi.count > 0 ? (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedWatchScpi.count} acquisition{selectedWatchScpi.count > 1 ? 's' : ''} officiellement identifiée{selectedWatchScpi.count > 1 ? 's' : ''}.
                        Les opérations correspondantes sont affichées plus bas sur cette page.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Aucune acquisition récente n'a été détectée pour {selectedWatchScpi.name}.
                        La veille automatique continue de contrôler les sources officielles et cette page sera mise à jour dès qu'une opération sera identifiée.
                      </p>
                    )}
                  </div>

                  {selectedWatchScpi.lastError && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-300">
                      {selectedWatchScpi.lastError}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6">
                    {onScpiPageClick && (
                      <button
                        type="button"
                        onClick={() => onScpiPageClick(selectedWatchScpi.slug)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                      >
                        <Building2 className="w-4 h-4" />
                        Voir la fiche {selectedWatchScpi.name}
                      </button>
                    )}
                    {selectedWatchScpi.sourceUrl && (
                      <a
                        href={selectedWatchScpi.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                      >
                        Voir la source officielle
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ====== ACCÈS RAPIDE PAR TYPE D'ACTIF ====== */}
          {!searchQuery && hasAnyAcquisition && (
            <section className="mb-14">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px flex-1 max-w-16 bg-gray-200 dark:bg-gray-700" />
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Accès rapide par type d'actif
                </h3>
                <div className="h-px flex-1 max-w-16 bg-gray-200 dark:bg-gray-700" />
              </div>
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

          {/* ====== À LA UNE ====== */}
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

          {/* ====== LISTE COMPLÈTE ====== */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedWatchScpi
                  ? `Acquisitions de ${selectedWatchScpi.name}`
                  : searchQuery
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
              <div className="text-center py-16">
                <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedWatchScpi
                    ? `Aucune acquisition récente n'a été détectée pour ${selectedWatchScpi.name}.`
                    : "Aucun investissement récent n'a encore été détecté dans les sources suivies."}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {selectedWatchScpi
                    ? 'La veille automatique continue de contrôler les sources officielles.'
                    : 'Les acquisitions officiellement identifiées apparaîtront ici avec la SCPI concernée, le type d’actif, la localisation et la source.'}
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

/* ================================================================== */
/*  Sous-composants                                                    */
/* ================================================================== */

const ScpiCard: React.FC<{
  scpi: TrackedScpi & { count: number; latest: InvestmentNewsItem | null; status: ScpiStatus };
  onClick: () => void;
}> = ({ scpi, onClick }) => {
  const isAcquisition = scpi.status === 'acquisition';
  const isActive = scpi.status === 'active';
  const isIncomplete = scpi.status === 'incomplete';
  const isError = scpi.status === 'error';
  const latest = scpi.latest;

  const AssetIcon = latest ? (ASSET_TYPE_ICON_MAP[latest.assetType] || Building) : Building;

  const cardBorder = isError
    ? 'border-red-500/30 hover:border-red-400/60'
    : isAcquisition
    ? 'border-emerald-500/25 hover:border-emerald-400/60'
    : isActive
    ? 'border-gray-600/30 hover:border-blue-400/50'
    : 'border-gray-600/20 hover:border-amber-400/40';

  const cardBg = isError
    ? 'bg-gradient-to-br from-red-950/25 via-gray-800/45 to-gray-800/25'
    : isAcquisition
    ? 'bg-gradient-to-br from-emerald-950/40 via-gray-800/50 to-gray-800/30'
    : isActive
    ? 'bg-gray-800/40'
    : 'bg-gray-800/20';

  const hoverGlow = isError
    ? 'hover:shadow-red-500/10'
    : isAcquisition
    ? 'hover:shadow-emerald-500/10'
    : isActive
    ? 'hover:shadow-blue-500/10'
    : 'hover:shadow-amber-500/05';

  const accentBar = isError
    ? 'bg-red-400/60'
    : isAcquisition
    ? 'bg-emerald-400/60'
    : isActive
    ? 'bg-blue-400/40'
    : 'bg-amber-400/20';

  const badgeBg = isError
    ? 'bg-red-500/15 text-red-300 border-red-500/25'
    : isAcquisition
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
    : isActive
    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/15';

  const badgeLabel = isError
    ? 'Erreur de veille'
    : isAcquisition
    ? 'Acquisition détectée'
    : isActive
    ? 'Veille opérationnelle'
    : 'Source à compléter';

  const BadgeIcon = isError ? AlertCircle : isAcquisition ? TrendingUp : isActive ? Eye : AlertCircle;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${hoverGlow}`}
    >
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${accentBar} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-2 mb-3 pt-1">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-100 text-sm leading-snug truncate">{scpi.name}</p>
          {scpi.managementCompany && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{scpi.managementCompany}</p>
          )}
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeBg}`}>
          <BadgeIcon className="w-3 h-3" />
          {badgeLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="text-gray-400">
          <span className={`font-bold ${isAcquisition ? 'text-emerald-300' : 'text-gray-300'}`}>
            {scpi.count}
          </span>{' '}
          acquisition{scpi.count > 1 ? 's' : ''} détectée{scpi.count > 1 ? 's' : ''}
        </span>
      </div>

      <div className="pt-3 border-t border-gray-700/50">
        {latest ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex-shrink-0 p-1 rounded-md bg-gray-700/40">
              <AssetIcon className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="min-w-0">
              <p className="text-gray-300 font-medium truncate text-[11px]">Dernier actif</p>
              <p className="text-gray-400 truncate text-[11px] flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
                {latest.city || '—'}{latest.country ? `, ${latest.country}` : ''}
                {latest.assetType && (
                  <span className="text-gray-500"> — {ASSET_TYPE_LABELS[latest.assetType]}</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className={`text-[11px] italic leading-relaxed ${isError ? 'text-red-300/80' : 'text-gray-500'}`}>
            {isError
              ? `Erreur au dernier contrôle · dernier succès ${formatWatchDate(scpi.lastSuccessAt)}`
              : isIncomplete
              ? 'Source officielle à compléter.'
              : `Dernier contrôle ${formatWatchDate(scpi.lastCheckedAt)}`}
          </p>
        )}
      </div>

      {isAcquisition ? (
        <div className="mt-3 pt-2 border-t border-gray-700/30">
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
            Voir les acquisitions
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-gray-700/30">
          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 group-hover:text-gray-400 transition-colors">
            Voir le suivi
            <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-60 transition-opacity" />
          </span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Cartes d'investissement (conservées)                               */
/* ------------------------------------------------------------------ */

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
              Voir la source officielle
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
        <DetailBadge label="SCPI" value={item.scpi} />
        <DetailBadge label="Société de gestion" value={item.managementCompany} />
        {!!item.city && <DetailBadge label="Ville" value={item.city} icon={MapPin} />}
        {!!item.country && <DetailBadge label="Pays" value={item.country} />}
        {!!item.amount && item.amount !== 'Non communiqué' && <DetailBadge label="Montant" value={item.amount} />}
        {!!item.surface && item.surface !== 'Non communiqué' && <DetailBadge label="Surface" value={item.surface} />}
        {!!item.tenant && item.tenant !== 'Non communiqué' && <DetailBadge label="Locataire" value={item.tenant} />}
        {!!item.leaseDuration && item.leaseDuration !== 'Non communiqué' && <DetailBadge label="Durée de bail" value={item.leaseDuration} />}
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
