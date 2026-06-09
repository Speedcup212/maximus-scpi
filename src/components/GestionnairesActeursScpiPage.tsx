import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Shield,
  FileText,
  Search,
  ArrowRight,
  ChevronRight,
  BookOpen,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Building,
  Scale,
  TrendingUp,
  Target,
  PieChart,
  Globe,
  Lightbulb,
  HelpCircle,
  FileSearch,
  ShieldAlert
} from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { managementCompanyConfigs } from '../data/managementCompanyArticlesConfig';

interface GestionnairesActeursScpiPageProps {
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

interface ComprehensionArticle {
  title: string;
  slug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COMPREHENSION_ARTICLES: ComprehensionArticle[] = [
  {
    title: 'Société de gestion SCPI : rôle et analyse',
    slug: '/societe-gestion-scpi/',
    description: 'Comprenez le rôle de la société de gestion, ses obligations réglementaires et comment analyser sa qualité.',
    icon: Building
  },
  {
    title: 'Gestionnaire SCPI : asset manager, property manager',
    slug: '/gestionnaire-scpi/',
    description: 'Qui intervient dans la gestion d\'une SCPI : société de gestion, asset manager, property manager, distributeur.',
    icon: Users
  },
  {
    title: 'CGP-CIF SCPI : conseil et analyse patrimoniale',
    slug: '/cgp-cif-scpi/',
    description: 'Le rôle du CGP-CIF, l\'analyse patrimoniale et la distinction entre conseil et information générale.',
    icon: Shield
  },
  {
    title: 'PSI SCPI : Prestataires de Services d\'Investissement',
    slug: '/psi-scpi/',
    description: 'Le rôle des PSI dans la distribution de SCPI et les obligations réglementaires associées.',
    icon: FileText
  },
  {
    title: 'Rétrocessions SCPI : transparence et rémunération',
    slug: '/retrocommissions-scpi/',
    description: 'Comprenez les rétrocessions de commissions dans la distribution de SCPI et leur impact sur le conseil.',
    icon: BarChart3
  }
];

const GestionnairesActeursScpiPage: React.FC<GestionnairesActeursScpiPageProps> = ({
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

  // Trier les sociétés de gestion par ordre alphabétique
  const sortedCompanies = useMemo(() => {
    return [...managementCompanyConfigs].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'fr')
    );
  }, []);

  // Filtrer par recherche
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return sortedCompanies;
    const q = searchQuery.toLowerCase().trim();
    return sortedCompanies.filter(c =>
      c.displayName.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  }, [sortedCompanies, searchQuery]);

  return (
    <>
      <SEOHead
        title="Gestionnaires et acteurs SCPI : sociétés de gestion, CGP-CIF, PSI et distributeurs"
        description="Comprenez les principaux acteurs de l'univers SCPI : sociétés de gestion, gestionnaires, CGP-CIF, PSI, distributeurs, rétrocessions et points de vigilance."
        keywords={[
          'gestionnaires SCPI',
          'acteurs SCPI',
          'société de gestion',
          'CGP-CIF',
          'PSI',
          'distributeur',
          'rétrocessions',
          'AMF',
          'ORIAS'
        ]}
        canonical="https://maximusscpi.com/gestionnaires-acteurs-scpi/"
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
          onEducationClick={onEducationClick}
          onArticlesClick={onArticlesClick}
          onActualitesClick={onActualitesClick}
          currentView="education"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <a href="/" className="hover:text-blue-600 transition-colors">Accueil</a>
            <ChevronRight className="w-4 h-4" />
            <a href="/articles/" className="hover:text-blue-600 transition-colors">Comprendre les SCPI</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">Gestionnaires & acteurs SCPI</span>
          </nav>

          {/* ===== 1. INTRODUCTION ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Building2 className="w-12 h-12 text-amber-600" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Gestionnaires & acteurs SCPI
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Tous les acteurs de l'écosystème SCPI expliqués
                </p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-6 rounded-r-xl">
              <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                Avant d'analyser une SCPI, il faut comprendre qui intervient : société de gestion, gestionnaire,
                distributeur, CGP-CIF, PSI, documents réglementaires et rémunérations. Cette page centralise
                l'ensemble des ressources pédagogiques sur les acteurs de l'univers SCPI.
              </p>
            </div>
          </section>

          {/* ===== 2. ARTICLES DE COMPRÉHENSION ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Comprendre les acteurs SCPI
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPREHENSION_ARTICLES.map((article, idx) => {
                const Icon = article.icon;
                return (
                  <a
                    key={idx}
                    href={article.slug}
                    className="group flex items-start gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-500 hover:shadow-lg transition-all"
                  >
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </section>

          {/* ===== 3. HUB SOCIÉTÉS DE GESTION ===== */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <Building2 className="w-10 h-10 opacity-90" />
                <div>
                  <h2 className="text-2xl font-bold">
                    Sociétés de gestion SCPI
                  </h2>
                  <p className="text-amber-100 mt-1">
                    Annuaire des acteurs — {managementCompanyConfigs.length} sociétés référencées
                  </p>
                </div>
              </div>
              <p className="text-amber-50 mb-6 max-w-2xl">
                Accédez à l'annuaire complet des sociétés de gestion SCPI : société de gestion,
                stratégie d'investissement, SCPI gérées, points de vigilance et documents réglementaires.
              </p>
              <a
                href="/societes-de-gestion-scpi/"
                className="inline-flex items-center gap-2 bg-white text-amber-700 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
              >
                <Building2 className="w-5 h-5" />
                Accéder à l'annuaire des sociétés de gestion
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </section>

          {/* ===== 4. ANNUAIRE COMPACT ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Annuaire des sociétés de gestion
              </h2>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une société de gestion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Liste alphabétique */}
            <div className="space-y-2">
              {filteredCompanies.map((company) => (
                <a
                  key={company.slug}
                  href={`/societe-gestion/${company.slug}/`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {company.displayName}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        {company.managedScpis.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {company.managedScpis.length} SCPI identifiée{company.managedScpis.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3 h-3" />
                            SCPI à vérifier
                          </span>
                        )}
                        {company.dataConfidence && (
                          <span className={`inline-flex items-center gap-1 text-xs ${
                            company.dataConfidence === 'verified'
                              ? 'text-green-600 dark:text-green-400'
                              : company.dataConfidence === 'no_internal_scpi_found'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {company.dataConfidence === 'verified' && '✓ Vérifié'}
                            {company.dataConfidence === 'no_internal_scpi_found' && '⚡ Hors référentiel'}
                            {company.dataConfidence === 'to_verify' && '❓ À vérifier'}
                            {company.dataConfidence === 'probable' && '⚠️ Probable'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                </a>
              ))}
              {filteredCompanies.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Aucune société de gestion trouvée pour "{searchQuery}".
                </p>
              )}
            </div>
          </section>

          {/* ===== 5. POUR ALLER PLUS LOIN ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pour aller plus loin
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Comprendre les SCPI', url: '/articles/', icon: BookOpen },
                { label: 'Fiscalité SCPI', url: '/scpi-fiscalite/', icon: TrendingUp },
                { label: 'Risques SCPI', url: '/risques-scpi/', icon: ShieldAlert },
                { label: 'AMF SCPI', url: '/amf-scpi/', icon: Shield },
                { label: 'ORIAS SCPI', url: '/orias-scpi/', icon: FileSearch },
                { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/', icon: FileText },
                { label: 'Comparateur SCPI', url: '/comparateur-scpi/', icon: BarChart3 },
                { label: 'Rendement net SCPI', url: '/rendement-net-scpi/', icon: TrendingUp },
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a
                    key={idx}
                    href={link.url}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ===== 6. MENTION CONFORMITÉ ===== */}
          <section className="mb-8">
            <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">Information importante</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                    Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil
                    en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient
                    d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et
                    les documents réglementaires des SCPI. Investir en SCPI comporte des risques : perte en capital,
                    liquidité limitée, revenus non garantis.
                  </p>
                </div>
              </div>
            </div>
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

export default GestionnairesActeursScpiPage;
