import React from 'react';
import {
  Building2,
  Building,
  Shield,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  Search,
  BarChart3,
  Users,
  Target,
  Scale,
  FileSearch,
  ShieldAlert,
  Lightbulb,
  PieChart,
  Globe,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { ManagementCompanyConfig } from '../data/managementCompanyArticlesConfig';

interface ManagementCompanyArticlePageProps {
  config: ManagementCompanyConfig;
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

// Icons for internal links
const INTERNAL_LINK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Société de gestion SCPI': Building2,
  'Gestionnaire de SCPI': Users,
  'AMF SCPI': Shield,
  'ORIAS SCPI': ShieldCheck,
  'Documents réglementaires SCPI': FileText,
  'DIC SCPI': FileSearch,
  'Note d\'information SCPI': FileText,
  'Choisir une SCPI': Search,
  'Comparateur SCPI': BarChart3,
  'Risques SCPI': AlertTriangle,
  'Frais SCPI': TrendingUp,
  'Rendement net SCPI': TrendingUp,
  'TOF SCPI': Target,
  'Capitalisation SCPI': BarChart3,
  'Endettement SCPI': Scale,
  'SCPI européennes': Globe,
  'Fiscalité SCPI': BookOpen,
  'SCPI logistique': Target,
  'SCPI santé': Target,
  'Comprendre les SCPI': BookOpen,
};

function ShieldCheck(props: { className?: string }) {
  return React.createElement(Shield, { ...props, className: `${props.className || ''} text-green-600` });
}

const ManagementCompanyArticlePage: React.FC<ManagementCompanyArticlePageProps> = ({
  config,
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
  const {
    slug,
    name,
    displayName,
    title,
    seoTitle,
    metaDescription,
    mainKeyword,
    keywords: configKeywords,
    managedScpis,
    summary,
    keyPoints,
    vigilancePoints,
    casPratiques,
    faq,
    internalLinks,
  } = config;

  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const canonUrl = `https://maximusscpi.com/societe-gestion/${slug}/`;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={metaDescription}
        keywords={configKeywords}
        canonical={canonUrl}
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* ===== 1. INTRODUCTION / IA RESPONSE ===== */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-12 h-12 text-blue-600" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <a
                  href={canonUrl}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 block"
                >
                  {canonUrl.replace(/\/$/, '')}
                </a>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <a href="/" className="hover:text-blue-600 transition-colors">Accueil</a>
              <ChevronRight className="w-4 h-4" />
              <a href="/articles/" className="hover:text-blue-600 transition-colors">Comprendre les SCPI</a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">{displayName}</span>
            </nav>
          </div>

          {/* ===== 2. DÉFINITION / RÔLE ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Qu'est-ce que {displayName} ?
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {displayName} est une société de gestion immobilière agréée par l'AMF (Autorité des Marchés Financiers).
                En tant que société de gestion SCPI, son rôle est de sélectionner les actifs immobiliers, d'acquérir
                et de gérer le patrimoine locatif, d'effectuer les arbitrages nécessaires, de piloter les travaux,
                de définir la politique de distribution et d'informer les associés sur la vie de la SCPI.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Son équipe de gestion (asset managers, property managers, analystes financiers) travaille au quotidien
                pour optimiser la performance locative et patrimoniale des SCPI qu'elle gère. La qualité de cette
                équipe, son expérience et sa transparence sont des éléments clés à analyser avant d'investir.
              </p>
            </div>
          </section>

          {/* ===== 3. SCPI IDENTIFIÉES ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                SCPI gérées par {displayName}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Les SCPI identifiées comme étant gérées par cette société de gestion, issues du référentiel interne
              (données à vérifier dans les DIC, notes d'information et sites officiels).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">SCPI</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Secteur</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Statut de vérification</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Points à analyser</th>
                  </tr>
                </thead>
                <tbody>
                  {managedScpis.map((scpi, idx) => (
                    <tr key={scpi.name} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'} border-b dark:border-gray-700`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{scpi.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{scpi.sector || 'Donnée à vérifier'}</td>
                      <td className="px-4 py-3">
                        {scpi.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            À vérifier
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        Rendement, TOF, endettement, frais, capitalisation, liquidité
                      </td>
                    </tr>
                  ))}
                  {managedScpis.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                        Données à vérifier — consulter l'ASPIM, l'AMF/GECO et les DIC pour la liste exacte des SCPI gérées.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {managedScpis.some(s => s.status === 'to_verify') && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Certaines associations SCPI ↔ société de gestion sont à vérifier auprès des sources officielles.
              </p>
            )}
          </section>

          {/* ===== 4. POURQUOI ANALYSER LA SOCIÉTÉ DE GESTION ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pourquoi analyser {displayName} ?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icone: Target, label: 'Discipline d\'investissement', desc: 'La société de gestion définit et applique une stratégie d\'investissement cohérente dans la durée.' },
                { icone: FileText, label: 'Qualité du reporting', desc: 'La régularité et la transparence des bulletins trimestriels et rapports annuels sont un indicateur de qualité.' },
                { icone: CheckCircle2, label: 'Transparence', desc: 'Une société transparente publie des données complètes sur sa stratégie, ses actifs, ses risques et ses frais.' },
                { icone: Building, label: 'Historique', desc: 'L\'expérience de l\'équipe de gestion et sa capacité à traverser les cycles immobiliers sont des repères importants.' },
                { icone: PieChart, label: 'Gestion des cycles', desc: 'Capacité à adapter la stratégie en fonction du contexte économique et immobilier.' },
                { icone: TrendingUp, label: 'Collecte et revalorisation', desc: 'L\'évolution de la collecte et du prix de part reflète la confiance des investisseurs et la qualité de la gestion.' },
                { icone: Scale, label: 'Liquidité', desc: 'La politique de liquidité et le traitement des demandes de retrait sont des critères à ne pas négliger.' },
              ].map((item, idx) => {
                const Icon = item.icone;
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===== 5. TABLEAU DE VIGILANCE ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Points de vigilance — {displayName}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Critère</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Pourquoi c'est important</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Point de vigilance</th>
                  </tr>
                </thead>
                <tbody>
                  {vigilancePoints.map((vp, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'} border-b dark:border-gray-700`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{vp.critere}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{vp.importance}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{vp.vigilance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===== 6. KEY POINTS ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                À retenir sur {displayName}
              </h2>
            </div>
            <ul className="space-y-3">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== 7. CAS PRATIQUES ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cas pratiques
              </h2>
            </div>
            <div className="space-y-4">
              {casPratiques.map((cas, idx) => (
                <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-5 rounded-r-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {cas.titre}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {cas.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== 8. MÉTHODE MAXIMUSSCPI ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Méthode MaximusSCPI
              </h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                MaximusSCPI ne classe pas une société de gestion comme "bonne" ou "mauvaise". L'approche est
                méthodologique et pédagogique : chaque société de gestion est analysée à travers les SCPI qu'elle gère,
                leurs indicateurs de performance (rendement, TOF, endettement, frais, capitalisation), la qualité du
                reporting, la transparence documentaire et la cohérence avec un profil patrimonial donné.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                L'analyse doit également intégrer la fiscalité de l'investisseur, son horizon d'investissement, ses
                objectifs patrimoniaux et sa tolérance au risque. Une société de gestion adaptée à un profil peut ne
                pas l'être pour un autre.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Cette page est une pré-orientation pédagogique, pas une recommandation personnalisée.
              </p>
            </div>
          </section>

          {/* ===== 9. FAQ ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Questions fréquentes
              </h2>
            </div>
            <div className="space-y-3">
              {faq.map((item, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white pr-4">{item.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-4 bg-white dark:bg-gray-800">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.reponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ===== 10. SOURCES ET POINTS À VÉRIFIER ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sources et points à vérifier
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Les données présentées sur cette page sont issues des sources suivantes, à vérifier avant toute décision d'investissement :
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  DIC (Document d'Information Clé) de chaque SCPI
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  Note d'information de chaque SCPI, visée par l'AMF
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  Bulletin trimestriel de chaque SCPI
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  Rapport annuel de chaque SCPI
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  Site officiel de la société de gestion et rubrique "Nos SCPI"
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  Registre AMF / GECO pour vérifier l'agrément de la société de gestion
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  ASPIM (Association des Sociétés de Placement Immobilier) si la société est adhérente
                </li>
              </ul>
            </div>
          </section>

          {/* ===== 11. MAILLAGE INTERNE ===== */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pour aller plus loin
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {internalLinks.map((link, idx) => {
                const IconComponent = INTERNAL_LINK_ICONS[link.label] || ExternalLink;
                return (
                  <a
                    key={idx}
                    href={link.url}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ===== 12. CTA COMPARATEUR ===== */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-3">
                Comparer les SCPI
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Utilisez notre comparateur pour analyser les SCPI de {displayName} face au marché.
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
          </section>

          {/* ===== 13. CTA CONTACT / CALENDLY ===== */}
          <section className="mb-12">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Un conseil personnalisé ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                Échangez avec Éric Bellaiche, conseiller en gestion de patrimoine ORIAS n°13001580, pour analyser
                votre situation et vos objectifs.
              </p>
              <button
                type="button"
                onClick={onContactClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Prendre rendez-vous
              </button>
            </div>
          </section>

          {/* ===== 14. MENTION CONFORMITÉ ===== */}
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
                    les documents réglementaires des SCPI. Les rendements cités sont des données historiques et ne
                    préjugent pas des performances futures. Investir en SCPI comporte des risques : perte en capital,
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

export default ManagementCompanyArticlePage;
