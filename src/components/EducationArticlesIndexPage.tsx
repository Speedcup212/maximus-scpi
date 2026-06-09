import React, { useMemo, useState } from 'react';
import { BookOpen, TrendingUp, Shield, Target, AlertTriangle, ArrowRight, BarChart3, Building2, ShieldCheck, PiggyBank, Search, X } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { articleTemplates, ArticleTemplate } from '../data/articleTemplatesConfig';

interface EducationArticlesIndexPageProps {
  onArticleClick: (slug: string) => void;
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

// Les 10 familles principales d'articles
type ArticleFamily = 
  | 'comprendre'
  | 'choix-comparatifs'
  | 'analyse-criteres'
  | 'fiscalite-detention'
  | 'risques-vigilance'
  | 'secteurs-immo'
  | 'gestionnaires-acteurs'
  | 'reglementation-transparence'
  | 'strategies';

// Mapping catégorie d'origine → famille
const CATEGORY_FAMILY_MAP: Record<string, ArticleFamily> = {
  comparatifs: 'choix-comparatifs',
  analyse: 'choix-comparatifs',
  'choix-comparatifs': 'choix-comparatifs',
  fiscalite: 'fiscalite-detention',
  'fiscalite-modes': 'fiscalite-detention',
  'fiscalite-avancee': 'fiscalite-detention',
  'analyse-criteres': 'analyse-criteres',
  'risques-vigilance': 'risques-vigilance',
  'secteurs-immo': 'secteurs-immo',
  strategies: 'strategies',
  'acteurs-reglementation': 'gestionnaires-acteurs',
  'gestionnaires-acteurs': 'gestionnaires-acteurs',
  'reglementation-transparence': 'reglementation-transparence',
  'strategies-patrimoniales': 'strategies',
};

// Mapping spécifique par slug pour les articles "guides" répartis dans plusieurs familles
const SLUG_FAMILY_MAP: Record<string, ArticleFamily> = {
  'scpi-europeennes-avantages-ps-0-rendement': 'fiscalite-detention',
  'scpi-sante-seniors-ehpad-cliniques-investissement': 'secteurs-immo',
  'scpi-bureaux-tertiaire-teletravail-2025': 'secteurs-immo',
  'scpi-commerces-retail-e-commerce-opportunites': 'secteurs-immo',
  'scpi-logistique-entrepots-e-commerce-2025': 'secteurs-immo',
  'scpi-residentielles-logement-locatif-scpi-habitation': 'secteurs-immo',
  'risques-scpi-vacance-locative-liquidite': 'risques-vigilance',
  'frais-scpi-souscription-gestion-performance': 'analyse-criteres',
  'revendre-parts-scpi-delais-marche-secondaire': 'risques-vigilance',
};

function getArticleFamily(article: ArticleTemplate): ArticleFamily {
  // D'abord vérifier le mapping par slug (pour les articles "guides")
  const slugMap = SLUG_FAMILY_MAP[article.slug];
  if (slugMap) return slugMap;
  // Ensuite utiliser le mapping par catégorie
  return CATEGORY_FAMILY_MAP[article.category] || 'comprendre';
}

/** Renvoie une string vide au lieu de null/undefined, puis lowercase + trim */
function safeStr(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.toLowerCase().trim();
}

/** Supprime les accents et caractères diacritiques */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Normalise un texte pour la recherche : safeStr + suppression des accents */
function normalizeText(val: unknown): string {
  return stripAccents(safeStr(val));
}

/** Calcule un score de pertinence pour le classement des résultats de recherche */
function calculateSearchScore(article: ArticleTemplate, query: string): number {
  const nq = normalizeText(query);
  const nTitle = normalizeText(article.title);
  const nSlug = normalizeText(article.slug).replace(/-/g, ' ');
  const nKeywords = (article.keywords || []).map(k => normalizeText(k));
  const nCategory = normalizeText(article.category);
  const nDesc = normalizeText(article.metaDescription);
  const nMainKw = normalizeText(article.mainKeyword);

  let score = 0;

  // Titre égal ou quasi exact
  if (nTitle === nq) score += 150;

  // Titre commence par la recherche
  if (nTitle.startsWith(nq)) score += 120;

  // Terme exact dans le titre (mot entier)
  if (nTitle.includes(` ${nq} `) || nTitle.startsWith(`${nq} `) || nTitle.endsWith(` ${nq}`)) score += 100;

  // Terme exact dans le slug
  if (nSlug.includes(` ${nq} `) || nSlug.startsWith(`${nq} `) || nSlug.endsWith(` ${nq}`) || nSlug === nq) score += 90;

  // Terme exact dans les tags / keywords
  if (nKeywords.some(k => k === nq)) score += 80;
  if (nKeywords.some(k => k.includes(` ${nq} `) || k.startsWith(`${nq} `) || k.endsWith(` ${nq}`) || k === nq)) score += 70;

  // Terme dans le mainKeyword
  if (nMainKw === nq) score += 80;
  if (nMainKw.includes(` ${nq} `) || nMainKw.startsWith(`${nq} `) || nMainKw.endsWith(` ${nq}`) || nMainKw === nq) score += 60;

  // Terme dans la catégorie
  if (nCategory.includes(nq)) score += 40;

  // Terme dans la description
  if (nDesc.includes(nq)) score += 20;

  // Article pilier (featured)
  if (article.featured) score += 10;

  // Match partiel faible dans le titre
  if (nTitle.includes(nq) && score < 5) score += 5;

  // Match partiel dans keywords (fallback)
  if (nKeywords.some(k => k.includes(nq)) && score < 5) score += 5;

  return score;
}

const FAMILY_CONFIG: Record<ArticleFamily, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  borderHoverClass: string;
  titleHoverClass: string;
  badgeClass: string;
  arrowClass: string;
  description: string;
}> = {
  comprendre: {
    label: 'Comprendre les SCPI',
    icon: BookOpen,
    iconClass: 'text-blue-600',
    borderHoverClass: 'hover:border-blue-500',
    titleHoverClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    badgeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    arrowClass: 'text-blue-600',
    description: 'Introduction et concepts fondamentaux pour débuter en SCPI',
  },
  'choix-comparatifs': {
    label: 'Choisir et comparer les SCPI',
    icon: TrendingUp,
    iconClass: 'text-indigo-600',
    borderHoverClass: 'hover:border-indigo-500',
    titleHoverClass: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    arrowClass: 'text-indigo-600',
    description: 'Comparatifs détaillés, méthodes de sélection et outils d\'analyse',
  },
  'analyse-criteres': {
    label: "Critères d'analyse SCPI",
    icon: BarChart3,
    iconClass: 'text-cyan-600',
    borderHoverClass: 'hover:border-cyan-500',
    titleHoverClass: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    badgeClass: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    arrowClass: 'text-cyan-600',
    description: 'TOF, capitalisation, endettement, rendement net, frais et décote',
  },
  'fiscalite-detention': {
    label: 'Fiscalité et modes de détention',
    icon: Shield,
    iconClass: 'text-green-600',
    borderHoverClass: 'hover:border-green-500',
    titleHoverClass: 'group-hover:text-green-600 dark:group-hover:text-green-400',
    badgeClass: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    arrowClass: 'text-green-600',
    description: 'Imposition, TMI, assurance-vie, démembrement, PER et SCI',
  },
  'risques-vigilance': {
    label: 'Risques, liquidité et vigilance',
    icon: AlertTriangle,
    iconClass: 'text-red-600',
    borderHoverClass: 'hover:border-red-500',
    titleHoverClass: 'group-hover:text-red-600 dark:group-hover:text-red-400',
    badgeClass: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    arrowClass: 'text-red-600',
    description: 'Perte en capital, liquidité, baisse du prix de part, vacance locative',
  },
  'secteurs-immo': {
    label: 'Secteurs immobiliers SCPI',
    icon: Target,
    iconClass: 'text-purple-600',
    borderHoverClass: 'hover:border-purple-500',
    titleHoverClass: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    badgeClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    arrowClass: 'text-purple-600',
    description: 'Santé, logistique, bureaux, commerce, diversifiées, résidentiel',
  },
  'gestionnaires-acteurs': {
    label: 'Gestionnaires & acteurs SCPI',
    icon: Building2,
    iconClass: 'text-amber-600',
    borderHoverClass: 'hover:border-amber-500',
    titleHoverClass: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    badgeClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    arrowClass: 'text-amber-600',
    description: 'Sociétés de gestion, CGP-CIF, PSI et acteurs du marché des SCPI',
  },
  'reglementation-transparence': {
    label: 'Réglementation & transparence',
    icon: ShieldCheck,
    iconClass: 'text-slate-600',
    borderHoverClass: 'hover:border-slate-500',
    titleHoverClass: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
    badgeClass: 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
    arrowClass: 'text-slate-600',
    description: 'AMF, ORIAS, DIC, note d\'information, frais, rétrocessions et cadre réglementaire',
  },
  strategies: {
    label: 'Stratégies patrimoniales SCPI',
    icon: PiggyBank,
    iconClass: 'text-orange-600',
    borderHoverClass: 'hover:border-orange-500',
    titleHoverClass: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    badgeClass: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    arrowClass: 'text-orange-600',
    description: 'Crédit, comptant, retraite, revenus complémentaires, transmission, PER, SCI',
  },
};

// Ordre d'affichage des familles
const FAMILY_ORDER: ArticleFamily[] = [
  'comprendre',
  'choix-comparatifs',
  'analyse-criteres',
  'fiscalite-detention',
  'risques-vigilance',
  'secteurs-immo',
  'gestionnaires-acteurs',
  'reglementation-transparence',
  'strategies',
];

// Slugs qui ont une page éducative dédiée (route directe) vs routage dynamique
const DIRECT_ROUTE_SLUGS = new Set([
  'tof-scpi', 'capitalisation-scpi', 'decote-valeur-reconstitution-scpi',
  'endettement-scpi', 'rendement-net-scpi', 'scpi-europeennes',
  'scpi-demembrement', 'scpi-assurance-vie', 'scpi-tmi-11', 'scpi-tmi-30',
  'frais-scpi',
  'risques-scpi', 'liquidite-scpi', 'baisse-prix-part-scpi',
  'delai-jouissance-scpi', 'report-a-nouveau-scpi',
  'choisir-scpi', 'meilleures-scpi-attention', 'comparateur-scpi-fiable',
  'allocation-scpi', 'combien-investir-scpi',
  'scpi-sante', 'scpi-logistique', 'scpi-bureaux', 'scpi-commerce', 'scpi-diversifiees',
  'scpi-fiscalite', 'scpi-tmi-41', 'scpi-tmi-45',
  'scpi-revenus-etrangers', 'scpi-revenus-fonciers', 'scpi-prelevements-sociaux',
  'scpi-credit-impot', 'scpi-taux-effectif', 'scpi-ifi', 'scpi-sci-is-fiscalite',
  'societe-gestion-scpi', 'gestionnaire-scpi', 'cgp-cif-scpi', 'psi-scpi', 'retrocommissions-scpi',
  'gestionnaires-acteurs-scpi',
  'amf-scpi', 'orias-scpi', 'documents-reglementaires-scpi', 'dic-scpi', 'note-information-scpi',
  'scpi-credit', 'scpi-comptant', 'scpi-retraite', 'scpi-revenus-complementaires', 'scpi-transmission',
  'scpi-france',
  'societes-de-gestion-scpi',
]);

// Slugs des articles "Contrôle & distribution" (AMF, ORIAS, CGP-CIF, PSI, rétrocessions)
const CONTROLE_DISTRIBUTION_SLUGS = new Set([
  'amf-scpi', 'orias-scpi', 'cgp-cif-scpi', 'psi-scpi', 'retrocommissions-scpi'
]);

const EducationArticlesIndexPage: React.FC<EducationArticlesIndexPageProps> = ({
  onArticleClick,
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
  onEducationClick
}) => {
  // Grouper les articles par famille
  const groupedByFamily = articleTemplates.reduce((acc, article) => {
    const family = getArticleFamily(article);
    if (!acc[family]) {
      acc[family] = [];
    }
    acc[family].push(article);
    return acc;
  }, {} as Record<ArticleFamily, ArticleTemplate[]>);

  // Ajouter une entrée vide pour les familles sans article (ex: comprendre)
  FAMILY_ORDER.forEach(f => {
    if (!groupedByFamily[f]) {
      groupedByFamily[f] = [];
    }
  });

  const totalArticles = articleTemplates.length;

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamily, setActiveFamily] = useState<ArticleFamily | null>(null);
  // Sous-onglet pour la catégorie Gestionnaires & acteurs SCPI
  const [actorsSubTab, setActorsSubTab] = useState<'gestionnaires' | 'controle-distribution'>('gestionnaires');

  // Filtered articles based on search + active family
  const filteredArticles = useMemo(() => {
    let filtered = articleTemplates;

    // Apply family filter
    if (activeFamily) {
      filtered = filtered.filter(a => getArticleFamily(a) === activeFamily);
    }

    // Apply search query
    const query = searchQuery.trim();
    if (query) {
      const normalizedQuery = normalizeText(query);
      filtered = filtered.filter(a =>
        normalizeText(a.title).includes(normalizedQuery) ||
        normalizeText(a.slug).includes(normalizedQuery) ||
        normalizeText(a.metaDescription).includes(normalizedQuery) ||
        normalizeText(a.category).includes(normalizedQuery) ||
        normalizeText(a.mainKeyword).includes(normalizedQuery) ||
        (a.keywords || []).some(k => normalizeText(k).includes(normalizedQuery))
      );
    }

    return filtered;
  }, [searchQuery, activeFamily]);

  const clearSearch = () => {
    setSearchQuery('');
    setActiveFamily(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || activeFamily !== null;

  // Ranked results for search mode (flat list sorted by relevance)
  const rankedResults = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];

    let candidates = articleTemplates;
    if (activeFamily) {
      candidates = candidates.filter(a => getArticleFamily(a) === activeFamily);
    }

    return candidates
      .map(article => ({
        article,
        score: calculateSearchScore(article, query),
        family: getArticleFamily(article),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [searchQuery, activeFamily]);

  return (
    <>
      <SEOHead
        title="Comprendre les SCPI | MaximusSCPI"
        description={"Guides, fiscalité, risques, critères d'analyse et stratégies pour analyser les SCPI avec méthode. " + totalArticles + " articles experts."}
        keywords={['comprendre les SCPI', 'guide SCPI', 'fiscalité SCPI', 'stratégie investissement', 'comparatif SCPI']}
        canonical="https://maximusscpi.com/articles/"
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
          onEducationClick={onEducationClick || ((category, slug) => {
            onArticleClick(slug);
          })}
          onArticlesClick={onArticlesClick || (() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          })}
          onActualitesClick={onActualitesClick}
          currentView="articles-list"
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Comprendre les SCPI
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Guides, fiscalité, risques, critères d'analyse et stratégies pour analyser les SCPI avec méthode.
          </p>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={(e) => e.preventDefault()} className="mb-10 max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="Rechercher un article : fiscalité, rendement, TOF, IFI, crédit, transmission…"
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Filtres par thématique */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFamily(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeFamily
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tous les articles
            </button>
            {FAMILY_ORDER.filter(f => groupedByFamily[f].length > 0).map((family) => {
              const config = FAMILY_CONFIG[family];
              return (
                <button
                  type="button"
                  key={family}
                  onClick={() => setActiveFamily(activeFamily === family ? null : family)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFamily === family
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Résultats de recherche */}
        {hasActiveFilters && (
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''}
              {activeFamily && ` dans "${FAMILY_CONFIG[activeFamily].label}"`}
              {searchQuery.trim() && ` pour "${searchQuery.trim()}"`}
              {' — '}
              <button type="button" onClick={clearSearch} className="text-blue-600 hover:underline font-medium">
                Réinitialiser les filtres
              </button>
            </p>
          </div>
        )}

        {/* État vide : aucun résultat */}
        {hasActiveFilters && filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Aucun article ne correspond à votre recherche.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Essayez un autre mot-clé comme fiscalité, rendement, TOF, IFI, crédit, ou transmission.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <X className="w-5 h-5" />
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {searchQuery.trim() ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Résultats les plus pertinents pour « {searchQuery.trim()} »
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {rankedResults.length} résultat{rankedResults.length > 1 ? 's' : ''} trouvé{rankedResults.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedResults.map(({ article, score, family }) => {
                const config = FAMILY_CONFIG[family];
                const Icon = config.icon;
                const styles = config;
                const articleUrl = `/${article.slug}/`;
                const isDirectRoute = DIRECT_ROUTE_SLUGS.has(article.slug);

                return isDirectRoute ? (
                  <a
                    key={article.slug}
                    href={articleUrl}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent ${styles.borderHoverClass} group`}
                  >
                    {article.featured && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                          ⭐ Article Pilier
                        </span>
                      </div>
                    )}
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.metaDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                        {article.mainKeyword}
                      </span>
                      <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </a>
                ) : (
                  <button
                    type="button"
                    key={article.slug}
                    onClick={() => onArticleClick(article.slug)}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent ${styles.borderHoverClass} group`}
                  >
                    {article.featured && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                          ⭐ Article Pilier
                        </span>
                      </div>
                    )}
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.metaDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                        {article.mainKeyword}
                      </span>
                      <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
        {/* Navigation rapide par famille (uniquement si aucun filtre actif) */}
        {!hasActiveFilters && (
        <div className="mb-16">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Accès rapide par thématique
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explorez nos {totalArticles} articles classés en 8 familles principales
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FAMILY_ORDER.filter(f => groupedByFamily[f].length > 0).map((family) => {
                const config = FAMILY_CONFIG[family];
                const Icon = config.icon;
                const styles = config;
                const articles = groupedByFamily[family];

                return (
                <button
                  type="button"
                  key={family}
                  onClick={() => {
                    const element = document.getElementById(`family-${family}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${styles.borderHoverClass} bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600`}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full ${styles.badgeClass} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${styles.iconClass}`} />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-gray-900 dark:text-white block mb-1">
                        {styles.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {articles.length} article{articles.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Articles par famille — afficher toutes les familles si aucun filtre, sinon seulement la famille active */}
        {(activeFamily ? [activeFamily] : FAMILY_ORDER).map((family) => {
          const config = FAMILY_CONFIG[family];
          const Icon = config.icon;
          const styles = config;
          const isGestionnairesFamily = family === 'gestionnaires-acteurs';
          const isSearchMode = searchQuery.trim() !== '';
          const shouldShowSubTabs = isGestionnairesFamily && !isSearchMode;

          let articles = hasActiveFilters
            ? filteredArticles.filter(a => getArticleFamily(a) === family)
            : groupedByFamily[family];

          // Filtrer par sous-onglet pour la catégorie Gestionnaires & acteurs SCPI (hors recherche)
          if (shouldShowSubTabs) {
            articles = articles.filter(a =>
              actorsSubTab === 'gestionnaires'
                ? !CONTROLE_DISTRIBUTION_SLUGS.has(a.slug)
                : CONTROLE_DISTRIBUTION_SLUGS.has(a.slug)
            );
          }

          if (articles.length === 0) return null;

          return (
            <div key={family} id={`family-${family}`} className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-8 h-8 ${styles.iconClass}`} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {styles.label}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({articles.length} article{articles.length > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8 ml-1">
                {styles.description}
              </p>

              {/* Sous-onglets Gestionnaires / Acteurs */}
              {shouldShowSubTabs && (
                <div className="flex items-center gap-2 mb-8 ml-1">
                  <button
                    type="button"
                    onClick={() => setActorsSubTab('gestionnaires')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      actorsSubTab === 'gestionnaires'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 inline-block mr-2" />
                    Gestionnaires
                  </button>
                  <button
                    type="button"
                    onClick={() => setActorsSubTab('controle-distribution')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      actorsSubTab === 'controle-distribution'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Shield className="w-4 h-4 inline-block mr-2" />
                    Contrôle & distribution
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carte spéciale : guide pilier fiscalité */}
                {family === 'fiscalite-detention' && (
                  <a
                    href="/fiscalite-scpi/"
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-green-200 dark:border-green-700 ${styles.borderHoverClass} group`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded">
                        📚 Guide pilier
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                      Fiscalité des SCPI : guide complet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Comprendre l'imposition des revenus fonciers, les prélèvements sociaux, les SCPI européennes, l'assurance-vie, le PER, le démembrement et les points de vigilance.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                        fiscalité SCPI
                      </span>
                      <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                    </div>
                    </a>
                )}

                {/* Carte spéciale : portail gestionnaires & acteurs */}
                {family === 'gestionnaires-acteurs' && (
                  <a
                    href="/gestionnaires-acteurs-scpi/"
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-amber-200 dark:border-amber-700 group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded">
                        🏛️ Portail dédié
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Gestionnaires & acteurs SCPI
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Société de gestion, CGP-CIF, PSI, distributeurs et rétrocessions — annuaire complet des acteurs
                      avec recherche par société, SCPI gérées et statut de vérification.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-medium">
                        gestionnaires & acteurs
                      </span>
                      <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    </a>
                )}

                {articles.map((article) => {
                  const articleUrl = `/${article.slug}/`;
                  const isDirectRoute = DIRECT_ROUTE_SLUGS.has(article.slug);

                  return isDirectRoute ? (
                    <a
                      key={article.slug}
                      href={articleUrl}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent ${styles.borderHoverClass} group`}
                    >
                      {article.featured && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                            ⭐ Article Pilier
                          </span>
                        </div>
                      )}
                      <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.metaDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                          {article.mainKeyword}
                        </span>
                        <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                      </div>
                    </a>
                  ) : (
                    <button
                      type="button"
                      key={article.slug}
                      onClick={() => onArticleClick(article.slug)}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent ${styles.borderHoverClass} group`}
                    >
                      {article.featured && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                            ⭐ Article Pilier
                          </span>
                        </div>
                      )}
                      <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 ${styles.titleHoverClass} transition-colors`}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.metaDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 ${styles.badgeClass} rounded font-medium`}>
                          {article.mainKeyword}
                        </span>
                        <ArrowRight className={`w-5 h-5 ${styles.arrowClass} group-hover:translate-x-1 transition-transform`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin de conseils personnalisés ?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Échangez avec Éric Bellaiche, conseiller en gestion de patrimoine ORIAS
          </p>
          <button
            type="button"
            onClick={onContactClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Prendre rendez-vous
          </button>
        </div>
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

export default EducationArticlesIndexPage;
