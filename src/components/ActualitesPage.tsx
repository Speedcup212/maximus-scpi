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
import certifiedCohort from '../data/certified_scpi_cohort.json';
import { getScpiEditorialDossier, SCPI_EDITORIAL_COUNT, ScpiEditorialArticle } from './ScpiEditorialArticle';
import { supabase } from '../supabaseClient';
import { newsExcerpt, newsHeadline, pickFeaturedNews, sortNewsByPublication, withoutFeaturedNews } from '../utils/actualitesPresentation';

function publicOfficialSourceUrl(sourceUrl?: string): string | null {
  try {
    const url = new URL(sourceUrl || '');
    if (url.protocol !== 'https:' || url.username || url.password ||
        ['localhost', '127.0.0.1'].includes(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}

// Un événement n'est affiché comme vérifié que si une URL officielle HTTPS
// exploitable est présente. Les rejets restent disponibles pour diagnostic.
const isPublishableNews = (item: InvestmentNewsItem) =>
  item.sourceOfficial === true && item.investmentRelated === true &&
  item.dataQuality !== 'weak' && Number(item.editorialPriority) > 0 &&
  Boolean(publicOfficialSourceUrl(item.sourceUrl));

const ALL_NEWS: InvestmentNewsItem[] = Array.isArray(newsJson)
  ? (newsJson as InvestmentNewsItem[]).filter(isPublishableNews)
  : [];

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

/** Le journal éditorial concerne les 69 SCPI certifiées, pas les sources périphériques. */
const trackedEditorialSlugs = new Set(certifiedCohort.slugs);
const TRACKED_SCPIS: TrackedScpi[] = (() => {
  const seen = new Set<string>();
  const list: TrackedScpi[] = [];
  for (const entry of scpiCompletRaw as Array<{ [key: string]: unknown }>) {
    const name = (entry['Nom SCPI'] as string) || '';
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const company = (entry['Société de gestion'] as string) || '';
    const slug = createSlugFromName(name);
    if (!trackedEditorialSlugs.has(slug)) continue;
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
  if (!dateStr) return 'Date non précisée';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Date non précisée';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
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

function createNewsArticleSlug(item: InvestmentNewsItem): string {
  const base = createSlugFromName(item.title || 'actualite-scpi');
  return `${item.date || 'actualite'}-${base.slice(0, 90)}`;
}


function buildDefaultPortfolioContext(item: InvestmentNewsItem): string {
  const asset = ASSET_TYPE_LABELS[item.assetType]?.toLowerCase() || 'immobilier';
  const place = item.country ? ` en ${item.country}` : item.city ? ` à ${item.city}` : '';
  return `Cette acquisition ajoute au patrimoine de ${item.scpi} une exposition ${asset}${place}. Son impact réel sur la diversification dépend toutefois du poids de l'actif par rapport à la capitalisation et aux autres immeubles du portefeuille : le nombre d'actifs ne suffit pas, à lui seul, à mesurer la diversification économique de la SCPI.`;
}

function buildDefaultAnalysis(item: InvestmentNewsItem): string {
  const parts: string[] = [];
  if (item.yieldAem) {
    parts.push(`Le rendement AEM communiqué (${item.yieldAem}) mesure le rapport entre les loyers contractuels et le coût d'acquisition de l'actif ; il ne doit pas être confondu avec le taux de distribution futur de la SCPI.`);
  }
  if (item.leaseDuration) {
    parts.push(`La durée ferme résiduelle de ${item.leaseDuration} apporte une indication sur la visibilité contractuelle, sans supprimer le risque de défaut du locataire, de vacance future ou de renégociation du loyer.`);
  }
  if (item.tenant) {
    parts.push(`La qualité financière de ${item.tenant} et sa capacité à honorer le bail restent donc des éléments centraux de l'analyse.`);
  }
  if (!parts.length) {
    parts.push(`L'opération doit être appréciée au-delà du seul prix d'acquisition : emplacement, qualité du locataire, durée du bail, niveau de loyer et capacité de relocation sont les principaux déterminants de la résilience locative de l'actif.`);
  }
  return parts.join(' ');
}

function buildWatchPoints(item: InvestmentNewsItem): string[] {
  const common = [
    'la qualité financière du locataire et la régularité du paiement des loyers',
    'la durée ferme du bail et les prochaines échéances de sortie',
    'la liquidité et la profondeur du marché immobilier local',
  ];
  const byType: Partial<Record<AssetType, string[]>> = {
    hotellerie: ['le niveau d’activité de l’établissement et la structure fixe ou variable du loyer', 'la dépendance aux flux touristiques et professionnels'],
    logistique: ['l’adéquation technique de l’actif aux usages logistiques futurs', 'la qualité des accès routiers et du bassin de consommation'],
    commerce: ['la fréquentation de la zone de chalandise', 'la solidité de l’enseigne et le niveau du loyer par rapport au marché'],
    bureaux: ['le risque de vacance et l’adéquation du bâtiment aux nouveaux usages', 'la performance énergétique et le coût potentiel de remise à niveau'],
    sante: ['la solidité de l’exploitant', 'les contraintes réglementaires propres à l’activité de santé'],
    residentiel_gere: ['le taux d’occupation de l’exploitant', 'le niveau de loyer et les contraintes réglementaires locales'],
  };
  return [...common, ...(byType[item.assetType] || [])].slice(0, 5);
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
  const [showAllScpis, setShowAllScpis] = useState(false);
  const [visibleNewsCount, setVisibleNewsCount] = useState(8);
  const [selectedWatchSlug, setSelectedWatchSlug] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/actualites\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/actualites\/[^/?#]+\/([^/?#]+)/i);
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
            .eq('source_official', true)
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
            sourceOfficial: row.source_official === true,
            imageUrl: row.image_url || '',
            imageAlt: row.image_alt || '',
            imageCredit: row.image_credit || '',
            yieldAem: row.yield_aem || '',
            annualRent: row.annual_rent || '',
            rooms: row.rooms || '',
            locationContext: row.location_context || '',
            tenantContext: row.tenant_context || '',
            portfolioContext: row.portfolio_context || '',
            maximusAnalysis: row.maximus_analysis || '',
            sourceDocumentLabel: row.source_document_label || '',
            date: row.published_date || (row.detected_at ? row.detected_at.slice(0, 10) : ''),
            detectedAt: row.detected_at || '',
            investmentRelated: true,
            dataQuality: row.data_quality || 'standard',
            editorialPriority: row.editorial_priority || 2,
            confidence: Number(row.confidence || 0.85),
            disclaimer: "Information factuelle issue d'une source officielle. Ne constitue pas une recommandation d'investissement.",
          }));
          setNewsItems(mapped.filter(isPublishableNews));
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
      const watchMatch = window.location.pathname.match(/^\/actualites\/([^/?#]+)/i);
      const articleMatch = window.location.pathname.match(/^\/actualites\/[^/?#]+\/([^/?#]+)/i);
      setSelectedWatchSlug(watchMatch ? decodeURIComponent(watchMatch[1]) : null);
      setSelectedArticleSlug(articleMatch ? decodeURIComponent(articleMatch[1]) : null);
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
    if (!searchQuery.trim()) return sortNewsByPublication(filteredByAsset);
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

  const selectedWatchScpi = useMemo(
    () => enrichedScpis.find((scpi) => scpi.slug === selectedWatchSlug) || null,
    [enrichedScpis, selectedWatchSlug],
  );

  const selectedArticle = useMemo(
    () =>
      newsItems.find(
        (item) =>
          createSlugFromName(item.scpi) === selectedWatchSlug &&
          createNewsArticleSlug(item) === selectedArticleSlug,
      ) || null,
    [newsItems, selectedWatchSlug, selectedArticleSlug],
  );

  useEffect(() => {
    if (selectedWatchScpi) {
      setSearchQuery(selectedWatchScpi.name);
    }
  }, [selectedWatchScpi?.slug]);

  const openNewsArticle = (item: InvestmentNewsItem) => {
    const scpiSlug = createSlugFromName(item.scpi);
    const articleSlug = createNewsArticleSlug(item);
    setSelectedWatchSlug(scpiSlug);
    setSelectedArticleSlug(articleSlug);
    setSearchQuery(item.scpi);
    window.history.pushState(
      { scpiWatch: scpiSlug, newsArticle: articleSlug },
      '',
      `/actualites/${scpiSlug}/${articleSlug}`,
    );
    window.setTimeout(() => {
      document.getElementById('news-article-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const closeNewsArticle = () => {
    if (selectedWatchScpi) {
      setSelectedArticleSlug(null);
      window.history.pushState({ scpiWatch: selectedWatchScpi.slug }, '', `/actualites/${selectedWatchScpi.slug}`);
      window.setTimeout(() => {
        document.getElementById('scpi-watch-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 25);
      return;
    }
    setSelectedArticleSlug(null);
    window.history.pushState({}, '', '/actualites');
  };

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
    setSelectedArticleSlug(null);
    setSearchQuery('');
    window.history.pushState({}, '', '/actualites');
  };

  // La une privilégie trois SCPI différentes. Les articles déjà mis en avant ne
  // sont pas répétés dans la liste générale, mais restent visibles lors d'une recherche.
  const showFeatured = !searchQuery && activeFilter === 'all' && !selectedWatchSlug;
  const featured = useMemo(() => pickFeaturedNews(searchedDisplayable), [searchedDisplayable]);
  const listNews = useMemo(
    () => showFeatured ? withoutFeaturedNews(searchedDisplayable, featured) : searchedDisplayable,
    [showFeatured, searchedDisplayable, featured],
  );
  const visibleNews = listNews.slice(0, visibleNewsCount);
  useEffect(() => { setVisibleNewsCount(8); }, [searchQuery, activeFilter, selectedWatchSlug]);
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
          selectedArticle
            ? `${selectedArticle.title} | MaximusSCPI`
            : selectedWatchScpi
            ? `Actualités et acquisitions ${selectedWatchScpi.name} | MaximusSCPI`
            : 'Actualités des 69 SCPI : bulletins, acquisitions et analyses | MaximusSCPI'
        }
        description={
          selectedArticle
            ? selectedArticle.summary
            : selectedWatchScpi
            ? `Suivez la veille des acquisitions et investissements immobiliers de la SCPI ${selectedWatchScpi.name}, avec les sources officielles contrôlées par MaximusSCPI.`
            : 'Consultez 69 bilans SCPI documentés : derniers bulletins analysés, évolutions certifiées, acquisitions, risques et liquidité.'
        }
        keywords={['investissements SCPI', 'acquisitions SCPI', 'immeubles SCPI', 'actualité immobilière SCPI']}
        canonical={
          selectedArticle && selectedWatchScpi
            ? `https://maximusscpi.com/actualites/${selectedWatchScpi.slug}/${createNewsArticleSlug(selectedArticle)}/`
            : selectedWatchScpi
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
              {selectedArticle
                ? selectedArticle.title
                : selectedWatchScpi
                ? `Actualités et acquisitions de ${selectedWatchScpi.name}`
                : 'Actualités SCPI : bulletins, acquisitions et risques'}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              {selectedArticle
                ? `${selectedArticle.scpi} · ${formatDate(selectedArticle.date)} · article MaximusSCPI`
                : selectedWatchScpi
                ? `Veille immobilière mise à jour automatiquement à partir des sources officielles de ${selectedWatchScpi.managementCompany || 'la société de gestion'}.`
                : 'Découvrez les analyses documentées de 69 SCPI : indicateurs, évolutions certifiées, acquisitions et points de vigilance, avec leurs sources.'}
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

          <nav aria-label="Accès aux rubriques des actualités" className="mb-9 flex flex-wrap justify-center gap-3 text-sm">
            <a href="#actualites-liste"
              className="rounded-lg border border-emerald-500/40 px-4 py-2 font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10">
              Parcourir les acquisitions
            </a>
            <a href="#actualites-suivi-scpi"
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Suivi des SCPI
            </a>
          </nav>

          {/* ====== À LA UNE ====== */}
          {showFeatured && featured.length > 0 && (
            <section className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                À la une — dernières acquisitions documentées
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featured.map((item, idx) => (
                  <InvestmentCard key={item.id || idx} item={item} onOpen={() => openNewsArticle(item)} />
                ))}
              </div>
            </section>
          )}

          {selectedArticle && (
            <section id="news-article-detail" className="mb-12 scroll-mt-24">
              <article className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
                    <button
                      type="button"
                      onClick={closeNewsArticle}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      Actualités {selectedArticle.scpi}
                    </button>
                    <span>›</span>
                    <span>{formatDate(selectedArticle.date)}</span>
                    <span>›</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Analyse MaximusSCPI</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${ASSET_COLORS[selectedArticle.assetType] || ASSET_COLORS.autre_immobilier}`}>
                      {React.createElement(ASSET_TYPE_ICON_MAP[selectedArticle.assetType] || Building, { className: 'w-3.5 h-3.5' })}
                      {ASSET_TYPE_LABELS[selectedArticle.assetType]}
                    </span>
                    {!!selectedArticle.city && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {selectedArticle.city}{selectedArticle.country ? `, ${selectedArticle.country}` : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedArticle.date)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedArticle.title}
                  </h2>

                  {newsExcerpt(selectedArticle) && (
                    <p className="mt-5 text-base sm:text-lg leading-8 text-gray-700 dark:text-gray-300">
                      {newsExcerpt(selectedArticle)}
                    </p>
                  )}

                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {!!selectedArticle.amount && <DetailBadge label="Prix d'acquisition" value={selectedArticle.amount} />}
                    {!!selectedArticle.yieldAem && <DetailBadge label="Rendement AEM" value={selectedArticle.yieldAem} />}
                    {!!selectedArticle.surface && <DetailBadge label="Surface" value={selectedArticle.surface} />}
                    {!!selectedArticle.leaseDuration && <DetailBadge label="WALB / bail ferme" value={selectedArticle.leaseDuration} />}
                    {!!selectedArticle.annualRent && <DetailBadge label="Loyer annuel" value={selectedArticle.annualRent} />}
                    {!!selectedArticle.rooms && <DetailBadge label="Capacité" value={selectedArticle.rooms} />}
                    {!!selectedArticle.tenant && <DetailBadge label="Locataire / exploitant" value={selectedArticle.tenant} />}
                    {!!selectedArticle.city && <DetailBadge label="Localisation" value={selectedArticle.city} icon={MapPin} />}
                  </div>

                  <div className="mt-10 border-t border-gray-100 dark:border-gray-700 pt-9 space-y-9">
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">L'opération en détail</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-7">
                        {selectedArticle.scpi} a intégré un actif de type {ASSET_TYPE_LABELS[selectedArticle.assetType]?.toLowerCase() || 'immobilier'}
                        {selectedArticle.city ? ` situé à ${selectedArticle.city}` : ''}
                        {selectedArticle.country ? `, en ${selectedArticle.country}` : ''}.
                        {selectedArticle.amount ? ` L'investissement annoncé s'élève à ${selectedArticle.amount}.` : ''}
                        {selectedArticle.surface ? ` L'actif développe ${selectedArticle.surface}.` : ''}
                        {selectedArticle.tenant ? ` Il est exploité ou occupé par ${selectedArticle.tenant}.` : ''}
                        {selectedArticle.leaseDuration ? ` La durée ferme résiduelle communiquée est de ${selectedArticle.leaseDuration}.` : ''}
                      </p>
                    </section>

                    {!!selectedArticle.locationContext && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Emplacement et dynamique locale</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-7">{selectedArticle.locationContext}</p>
                      </section>
                    )}

                    {!!selectedArticle.tenantContext && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Locataire et visibilité locative</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-7">{selectedArticle.tenantContext}</p>
                        {!!selectedArticle.leaseDuration && (
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            La durée ferme du bail doit être lue avec les autres indicateurs locatifs. 
                            <a
                              href="/articles/walt-walb-scpi-duree-baux-risque-locatif/"
                              className="ml-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            >
                              Comprendre le WALT et le WALB d'une SCPI
                            </a>.
                          </p>
                        )}
                      </section>
                    )}

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ce que l'acquisition change dans le portefeuille</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-7">
                        {selectedArticle.portfolioContext || buildDefaultPortfolioContext(selectedArticle)}
                      </p>
                    </section>

                    <section className="rounded-xl border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 sm:p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lecture MaximusSCPI</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-7">
                        {selectedArticle.maximusAnalysis || buildDefaultAnalysis(selectedArticle)}
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Points à surveiller</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        {buildWatchPoints(selectedArticle).map((point) => (
                          <li key={point} className="flex items-start gap-2 leading-7">
                            <span className="mt-3 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Les chiffres à retenir</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">SCPI</p>
                          <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedArticle.scpi}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Société de gestion</p>
                          <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedArticle.managementCompany}</p>
                        </div>
                        {!!selectedArticle.yieldAem && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rendement AEM à l'acquisition</p>
                            <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedArticle.yieldAem}</p>
                          </div>
                        )}
                        {!!selectedArticle.leaseDuration && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Durée ferme résiduelle</p>
                            <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedArticle.leaseDuration}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {selectedArticle.sourceOfficial && publicOfficialSourceUrl(selectedArticle.sourceUrl) && (
                      <section className="pt-1">
                        <a href={publicOfficialSourceUrl(selectedArticle.sourceUrl) || '#'}
                          target="_blank" rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:underline">
                          Consulter la source officielle <ArrowUpRight className="h-4 w-4" />
                        </a>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Vérifie la date et la portée des chiffres dans le document d'origine.
                        </p>
                      </section>
                    )}
                    {!!selectedArticle.sourceDocumentLabel && (
                      <section className="pt-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Référence documentaire déclarée : {selectedArticle.sourceDocumentLabel}.
                        </p>
                      </section>
                    )}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-3">
                    {onScpiPageClick && (
                      <button
                        type="button"
                        onClick={() => onScpiPageClick(createSlugFromName(selectedArticle.scpi))}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                      >
                        <Building2 className="w-4 h-4" />
                        Voir la fiche {selectedArticle.scpi}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeNewsArticle}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                    >
                      Retour aux acquisitions
                    </button>
                  </div>

                  <p className="mt-7 text-xs italic text-gray-400 dark:text-gray-500">
                    Information datée issue d'une source officielle citée. Le rendement AEM est un indicateur immobilier à l'acquisition et ne constitue pas le rendement futur de la SCPI. Investir en SCPI comporte notamment un risque de perte en capital et de liquidité.
                  </p>
                </div>
              </article>
            </section>
          )}

          {/* ====== LISTE COMPLÈTE ====== */}
          <section id="actualites-liste" className="scroll-mt-28">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedWatchScpi
                  ? `Acquisitions de ${selectedWatchScpi.name}`
                  : searchQuery
                  ? `Résultats pour "${searchQuery}"`
                  : activeFilter !== 'all'
                  ? ASSET_TYPE_LABELS[activeFilter]
                  : 'Autres acquisitions documentées'}
              </h2>
              {!searchQuery && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {listNews.length} acquisition{listNews.length > 1 ? 's' : ''} dans cette liste
                </span>
              )}
            </div>

            {listNews.length === 0 ? (
              <div className="text-center py-16">
                <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedWatchScpi
                    ? `Aucune acquisition documentée disponible pour ${selectedWatchScpi.name}.`
                    : 'Aucune acquisition documentée pour ce filtre.'}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {selectedWatchScpi
                    ? 'L’absence de résultat ne signifie pas l’absence d’opération.'
                    : 'Essaie une autre catégorie ou une autre recherche.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {visibleNews.map((item, idx) => (
                    <InvestmentRow key={item.id || idx} item={item} onOpen={() => openNewsArticle(item)} />
                  ))}
                </div>
                {visibleNewsCount < listNews.length && (
                  <div className="mt-7 text-center">
                    <button type="button"
                      onClick={() => setVisibleNewsCount((count) => count + 8)}
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-500/50 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10">
                      Afficher 8 actualités supplémentaires ({Math.min(visibleNewsCount, listNews.length)} sur {listNews.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ====== INVESTISSEMENTS PAR SCPI — GRILLE COMPLÈTE ====== */}
          <section id="actualites-suivi-scpi" className="mt-14 mb-14 scroll-mt-28">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dossiers d'actualités des {SCPI_EDITORIAL_COUNT} SCPI
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Analyses documentaires : évolutions certifiées, patrimoine, valorisation et risques. Une absence d'événement nouveau n'est jamais remplacée par une information inventée.
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
              {(showAllScpis || searchQuery ? filteredScpis : filteredScpis.slice(0, 12)).map((scpi) => (
                <ScpiCard
                  key={scpi.slug}
                  scpi={scpi}
                  onClick={() => openWatchDetail(scpi)}
                />
              ))}
            </div>
            {!searchQuery && filteredScpis.length > 12 && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setShowAllScpis((open) => !open)}
                  aria-expanded={showAllScpis}
                  className="rounded-xl border border-emerald-500 px-5 py-3 font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  {showAllScpis ? 'Réduire la liste' : `Afficher les ${filteredScpis.length} SCPI suivies`}
                </button>
              </div>
            )}

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
                        Aucune acquisition suffisamment documentée n'est publiée pour {selectedWatchScpi.name} dans les données disponibles.
                        Le dernier contrôle enregistré est indiqué ci-dessus ; l'absence d'article ne prouve pas l'absence d'événement.
                      </p>
                    )}
                  </div>

                  {selectedWatchScpi.lastError && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-300">
                      {selectedWatchScpi.lastError}
                    </p>
                  )}

                  <ScpiEditorialArticle slug={selectedWatchScpi.slug} />

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

                  </div>
                </div>
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
  const report = getScpiEditorialDossier(scpi.slug);

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

      {report && (
        <div className="mt-4 rounded-lg border border-gray-700/30 bg-gray-900/25 p-3">
          <p className="text-xs font-semibold text-emerald-300">Point documentaire {report.period}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-300 line-clamp-3">{report.lead}</p>
          {!report.comparisonCertified && <p className="mt-1.5 text-[11px] text-amber-300">Historique sous réserves</p>}
        </div>
      )}
      {isAcquisition ? (
        <div className="mt-3 pt-2 border-t border-gray-700/30">
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
            Lire les acquisitions et le dossier
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-gray-700/30">
          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 group-hover:text-gray-400 transition-colors">
            Lire le dossier d'actualités
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

const InvestmentCard: React.FC<{ item: InvestmentNewsItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const AssetIcon = ASSET_TYPE_ICON_MAP[item.assetType] || Building;
  const colorClass = ASSET_COLORS[item.assetType] || ASSET_COLORS.autre_immobilier;
  const source = item.sourceOfficial ? publicOfficialSourceUrl(item.sourceUrl) : null;
  const excerpt = newsExcerpt(item);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${colorClass}`}>
          <AssetIcon className="h-3.5 w-3.5" />
          {ASSET_TYPE_LABELS[item.assetType]}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400" aria-label="Date de publication">
          {formatDate(item.date)}
        </span>
      </div>
      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">{item.scpi}</p>
      <h3 className="text-lg font-bold leading-snug text-gray-900 dark:text-white mb-3">
        <button type="button" onClick={onOpen} className="text-left hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
          {newsHeadline(item)}
        </button>
      </h3>
      {excerpt && (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
          {excerpt}
        </p>
      )}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        {(item.city || item.country) && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {[item.city, item.country].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Lire l'analyse <ArrowUpRight className="h-4 w-4" />
          </button>
          {source && (
            <a href={source} target="_blank" rel="noopener noreferrer nofollow"
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 underline underline-offset-2">
              Source officielle
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

const InvestmentRow: React.FC<{ item: InvestmentNewsItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const AssetIcon = ASSET_TYPE_ICON_MAP[item.assetType] || Building;
  const colorClass = ASSET_COLORS[item.assetType] || ASSET_COLORS.autre_immobilier;
  const source = item.sourceOfficial ? publicOfficialSourceUrl(item.sourceUrl) : null;
  const excerpt = newsExcerpt(item);

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:border-emerald-500/40 hover:shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}>
          <AssetIcon className="h-3.5 w-3.5" />
          {ASSET_TYPE_LABELS[item.assetType]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" aria-label="Date de publication">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(item.date)}
        </span>
      </div>
      <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-white mb-2">
        <button type="button" onClick={onOpen} className="text-left hover:text-emerald-600 dark:hover:text-emerald-300">
          {newsHeadline(item)}
        </button>
      </h3>
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
        {item.scpi}{item.managementCompany ? ` · ${item.managementCompany}` : ''}
      </p>
      {excerpt && (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
          {excerpt}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
        {(item.city || item.country) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[item.city, item.country].filter(Boolean).join(', ')}
          </span>
        )}
        {item.amount && item.amount !== 'Non communiqué' && (
          <span className="font-medium">{item.amount}</span>
        )}
        {item.surface && item.surface !== 'Non communiqué' && (
          <span>{item.surface}</span>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-3">
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Lire l'analyse <ArrowUpRight className="h-4 w-4" />
        </button>
        {source && (
          <a href={source} target="_blank" rel="noopener noreferrer nofollow"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 underline underline-offset-2">
            Vérifier la source
          </a>
        )}
      </div>
    </article>
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
