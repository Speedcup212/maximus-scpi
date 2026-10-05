import React, { useState, useMemo } from 'react';
import { Building2, Search, X, ChevronRight, ExternalLink, Shield, ArrowRight, Users, Building, BarChart3, FileText, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { managementCompanyConfigs } from '../data/managementCompanyArticlesConfig';

interface SocietesDeGestionScpiPageProps {
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
  onArticleClick?: (slug: string) => void;
}

/** Safe string normalization for search */
function normalizeText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const SocietesDeGestionScpiPage: React.FC<SocietesDeGestionScpiPageProps> = ({
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
  onArticleClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return managementCompanyConfigs;
    const nq = normalizeText(query);
    return managementCompanyConfigs.filter(c => {
      const searchFields = [
        c.name, c.displayName, c.slug,
        c.mainKeyword,
        ...c.keywords,
        ...c.managedScpis.map(s => s.name),
      ].map(normalizeText);
      return searchFields.some(f => f.includes(nq));
    });
  }, [searchQuery]);

  return (
    <>
      <SEOHead
        title="Sociétés de gestion SCPI : liste, rôle, SCPI gérées et points de vigilance"
        description="Retrouvez les principales sociétés de gestion de SCPI, leurs SCPI associées, leur rôle, les critères à analyser et les points de vigilance avant d'investir."
        keywords={['sociétés de gestion SCPI', 'gestionnaire SCPI', 'liste sociétés de gestion', 'comparer sociétés de gestion', 'SCPI gérées']}
        canonical="https://maximusscpi.com/societes-de-gestion-scpi/"
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
          onEducationClick={onEducationClick || ((_category, slug) => onArticleClick?.(slug))}
          onArticlesClick={onArticlesClick}
          onActualitesClick={onActualitesClick}
          currentView="articles-list"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <a href="/" className="hover:text-blue-600 transition-colors">Accueil</a>
            <ChevronRight className="w-4 h-4" />
            <a href="/articles/" className="hover:text-blue-600 transition-colors">Comprendre les SCPI</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">Sociétés de gestion SCPI</span>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Building2 className="w-20 h-20 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Sociétés de gestion SCPI : comparer les acteurs du marché
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Découvrez les principales sociétés de gestion de SCPI, leur rôle, les SCPI qu'elles gèrent,
              et les critères à analyser avant d'investir. Chaque société fait l'objet d'une fiche dédiée
              avec points de vigilance.
            </p>
          </div>

          {/* Barre de recherche */}
          <form onSubmit={(e) => e.preventDefault()} className="mb-8 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                placeholder="Rechercher une société de gestion : Arkéa, Iroko, Corum, Sofidy…"
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

          {/* Résultats count */}
          {searchQuery.trim() && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCompanies.length} société{filteredCompanies.length > 1 ? 's' : ''} de gestion trouvée{filteredCompanies.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Section pédagogique */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Qu'est-ce qu'une société de gestion SCPI ?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Une société de gestion SCPI est une entité agréée par l'AMF qui sélectionne les actifs immobiliers,
                assure la gestion locative, pilote les arbitrages et travaux, définit la politique de distribution
                et informe les associés. Chaque SCPI est gérée par une société de gestion spécifique, et la qualité
                de cette gestion est un critère clé d'analyse.
              </p>
            </div>
          </div>

          {/* Introduction: critères clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icone: Shield, label: 'Agrément AMF', desc: 'Toute société de gestion doit être agréée par l\'Autorité des Marchés Financiers.' },
              { icone: Building, label: 'Patrimoine géré', desc: 'La capitalisation des SCPI gérées reflète la confiance des investisseurs.' },
              { icone: BarChart3, label: 'Indicateurs', desc: 'TOF, rendement, endettement, frais sont à croiser pour chaque SCPI.' },
              { icone: FileText, label: 'Transparence', desc: 'La qualité du reporting (bulletins, rapports annuels) est un signal fort.' },
            ].map((item, idx) => {
              const Icon = item.icone;
              return (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille des sociétés de gestion */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Aucune société de gestion trouvée.
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Essayez un autre mot-clé : Arkéa, Iroko, Corum, Sofidy, Alderan…
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <X className="w-5 h-5" />
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <a
                  key={company.slug}
                  href={`/societe-gestion/${company.slug}/`}
                  className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {company.displayName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Société de gestion SCPI
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* SCPI gérées */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SCPI identifiées ({company.managedScpis.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.managedScpis.map((scpi) => (
                        <span
                          key={scpi.name}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            scpi.status === 'verified'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {scpi.name}
                          {scpi.status === 'verified' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {company.summary.length > 150
                      ? company.summary.substring(0, 150) + '…'
                      : company.summary}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {company.managedScpis.filter(s => s.status === 'verified').length} SCPI vérifiée{company.managedScpis.filter(s => s.status === 'verified').length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-blue-600 font-medium group-hover:underline">
                      Voir la fiche →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Section CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-3">
              Comparer les SCPI
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Utilisez notre comparateur pour analyser les SCPI toutes sociétés de gestion confondues.
            </p>
            <button
              type="button"
              onClick={onComparateurClick}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Accéder au comparateur
            </button>
          </div>

          {/* CTA Contact */}
          <div className="mt-10 mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Besoin d'analyser une société de gestion ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              Échangez avec Éric Bellaiche, conseiller en gestion de patrimoine ORIAS n°13001580.
            </p>
            <button
              type="button"
              onClick={onContactClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Prendre rendez-vous
            </button>
          </div>

          {/* Mention conformité */}
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil
                en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient
                d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et
                les documents réglementaires des SCPI. Les rendements cités sont des données historiques et ne
                préjugent pas des performances futures. Investir en SCPI comporte des risques : perte en capital,
                liquidité limitée, revenus non garantis.
              </p>
            </div>
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

export default SocietesDeGestionScpiPage;
