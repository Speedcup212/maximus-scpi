import React from 'react';
import { BookOpen, TrendingUp, Shield, Target, AlertTriangle, ArrowRight, BarChart3, Users, PiggyBank } from 'lucide-react';
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
  onEducationClick?: (category: string, slug: string) => void;
}

// Les 8 familles principales d'articles
type ArticleFamily = 
  | 'comprendre'
  | 'choix-comparatifs'
  | 'analyse-criteres'
  | 'fiscalite-detention'
  | 'risques-vigilance'
  | 'secteurs-immo'
  | 'acteurs-reglementation'
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
  'acteurs-reglementation': {
    label: 'Acteurs, réglementation et transparence',
    icon: Users,
    iconClass: 'text-amber-600',
    borderHoverClass: 'hover:border-amber-500',
    titleHoverClass: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    badgeClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    arrowClass: 'text-amber-600',
    description: 'Sociétés de gestion, CGP-CIF, PSI, rétrocessions, conformité',
  },
  strategies: {
    label: 'Stratégies patrimoniales SCPI',
    icon: PiggyBank,
    iconClass: 'text-orange-600',
    borderHoverClass: 'hover:border-orange-500',
    titleHoverClass: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    badgeClass: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    arrowClass: 'text-orange-600',
    description: 'Crédit, retraite, transmission, diversification, PER, SCI',
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
  'acteurs-reglementation',
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

  return (
    <>
      <SEOHead
        title="Articles Éducatifs SCPI | MaximusSCPI"
        description={`${totalArticles} articles experts pour tout comprendre sur les SCPI : comparatifs, fiscalité, stratégies d'investissement, guides pratiques et analyse de marché.`}
        keywords={['articles SCPI', 'guide SCPI', 'fiscalité SCPI', 'stratégie investissement', 'comparatif SCPI']}
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
          currentView="articles-list"
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Articles Éducatifs SCPI
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {totalArticles} articles experts pour maîtriser votre investissement en SCPI : comparatifs détaillés,
            optimisation fiscale, stratégies patrimoniales et guides pratiques.
          </p>
        </div>

        {/* Navigation rapide par famille */}
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

        {/* Articles par famille */}
        {FAMILY_ORDER.map((family) => {
          const config = FAMILY_CONFIG[family];
          const Icon = config.icon;
          const styles = config;
          const articles = groupedByFamily[family];

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

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin de conseils personnalisés ?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Échangez avec Éric Bellaiche, conseiller en gestion de patrimoine ORIAS
          </p>
          <button
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
