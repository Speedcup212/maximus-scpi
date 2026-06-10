import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Building, TrendingUp, PieChart, MapPin, Calendar,
  Download, User, Target, Award, Phone,
  Info, Star, Moon, Sun, ExternalLink, AlertTriangle
} from 'lucide-react';

// Force reload timestamp: 2024-12-19 10:13:00 - Table padding fix fintech comparator

// Core components loaded immediately for faster initial render
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
// MOVED_TO_PAGE — UnderstandingSCPI n'est plus monté sur la homepage (cf. <main>).
// Le composant reste utilisé par ComprendreSCPIPage (route /comprendre-les-scpi).
// import UnderstandingSCPI from './components/UnderstandingSCPI';
import DisclaimerBox from './components/DisclaimerBox';
import ExpertBanner from './components/ExpertBanner';
import { CookieConsent } from './components/CookieConsent';
import SemanticLinks from './components/SemanticLinks';
import { getSemanticLinks } from './data/semanticCocon';
import { simulatorSeoConfig, getSimulatorSchemaData } from './data/simulatorSeoConfig';
import ErrorBoundary from './components/ErrorBoundary';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import AuthGuard from './app/components/AuthGuard';
import RoleGuard from './app/components/RoleGuard';
import InvestorQuiz from './components/InvestorQuiz';
import PreuveSociale from './components/PreuveSociale';
import TeaserComparateur from './components/TeaserComparateur';
import type { QuizData } from './types/quiz';
import ScpiTable from './components/ScpiTable';
import QuickFilters from './components/QuickFilters';
import SearchBar from './components/SearchBar';

// Lazy loaded components (loaded on demand)
const DynamicHero = lazy(() => import('./components/DynamicHero'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const AdvancedFilters = lazy(() => import('./components/AdvancedFilters'));
const FloatingButton = lazy(() => import('./components/FloatingButton'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const ArticlePage = lazy(() => import('./components/ArticlePage'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const LandingPagesMenu = lazy(() => import('./components/LandingPagesMenu'));
const AnalysisModal = lazy(() => import('./components/AnalysisModal'));
const RdvModal = lazy(() => import('./components/RdvModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));
const ReviewsModal = lazy(() => import('./components/ReviewsModal'));
const ObjectiveModal = lazy(() => import('./components/ObjectiveModal'));
const PortfolioWidget = lazy(() => import('./components/PortfolioWidget'));
const ChartWidget = lazy(() => import('./components/ChartWidget'));
const UnifiedPortfolio = lazy(() => import('./components/UnifiedPortfolio'));
const PortfolioAnalytics = lazy(() => import('./components/PortfolioAnalytics'));
const RecommendationWidget = lazy(() => import('./components/RecommendationWidget'));
const PortfolioResultsModal = lazy(() => import('./components/PortfolioResultsModal'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const ComprendreSCPIPage = lazy(() => import('./components/ComprendreSCPIPage'));
const AboutUsPage = lazy(() => import('./components/AboutUsPage'));
const ReclamationPage = lazy(() => import('./components/ReclamationPage'));
const ConditionsUtilisationPage = lazy(() => import('./components/ConditionsUtilisationPage'));
const ScpiExamplePage = lazy(() => import('./components/ScpiExamplePage'));
const ScpiLandingPage = lazy(() => import('./components/ScpiLandingPage'));
const ScpiDetailPage = lazy(() => import('./components/ScpiDetailPage'));
const ThematicLandingPage = lazy(() => import('./components/ThematicLandingPage'));
const OptimizedScpiLandingPage = lazy(() => import('./components/OptimizedScpiLandingPage'));
const OptimizedThematicLandingPage = lazy(() => import('./components/OptimizedThematicLandingPage'));
const StaticScpiPage = lazy(() => import('./components/StaticScpiPage'));
const FintechComparator = lazy(() => import('./components/fintech/FintechComparator'));
const ComparisonTable = lazy(() => import('./components/ComparisonTable'));
const GuidedJourney = lazy(() => import('./components/guidedJourney/GuidedJourney'));
const SubscriptionFunnel = lazy(() => import('./components/subscription/SubscriptionFunnel'));
const TestSenderReact = lazy(() => import('./components/TestSenderReact'));
const LifeToScpiPage = lazy(() => import('./components/LifeToScpiPage'));
const ScpiNetIncomeSimulator = lazy(() => import('./components/ScpiNetIncomeSimulator'));
const ScpiCreditSimulator = lazy(() => import('./components/ScpiCreditSimulator'));
const ScpiDemembrementSimulator = lazy(() => import('./components/ScpiDemembrementSimulator'));
const ScpiEnvelopeComparator = lazy(() => import('./components/ScpiEnvelopeComparator'));
const InvestorProfileSimulator = lazy(() => import('./components/InvestorProfileSimulator'));
const ComparateurDemembrementScpi = lazy(() => import('./components/ComparateurDemembrementScpi'));
const SimulateurTresorerieIS = lazy(() => import('./pages/SimulateurTresorerieIS'));
const SimulateurImpactFiscal = lazy(() => import('./pages/SimulateurImpactFiscal'));
const SimulateursHub = lazy(() => import('./pages/SimulateursHub'));
const ScpiSecteursHubPage = lazy(() => import('./components/ScpiSecteursHubPage'));
const ScpiGestionnairesHubPage = lazy(() => import('./components/ScpiGestionnairesHubPage'));
const ScpiObjectifsHubPage = lazy(() => import('./components/ScpiObjectifsHubPage'));
const FondsEurosScpiArticle = lazy(() => import('./components/FondsEurosScpiArticle'));
const ArticleGeneratorPage = lazy(() => import('./components/ArticleGeneratorPage'));
const EducationArticlesIndexPage = lazy(() => import('./components/EducationArticlesIndexPage'));
const ActualitesPage = lazy(() => import('./components/ActualitesPage'));
const DynamicArticlePage = lazy(() => import('./components/DynamicArticlePage'));
const OptimizedArticlePage = lazy(() => import('./components/OptimizedArticlePage'));
const PartenaireCabinet = lazy(() => import('./pages/PartenaireCabinet'));
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners'));
const AppEntry = lazy(() => import('./app/pages/AppEntry'));
const AppLogin = lazy(() => import('./app/pages/AppLogin'));
const AppSignup = lazy(() => import('./app/pages/AppSignup'));
const AppOnboarding = lazy(() => import('./app/pages/AppOnboarding'));
const AppClaim = lazy(() => import('./app/pages/AppClaim'));
const SetPassword = lazy(() => import('./app/pages/SetPassword'));
const SetupPage = lazy(() => import('./app/pages/SetupPage'));
const ClientDashboard = lazy(() => import('./app/pages/ClientDashboard'));
const ClientCases = lazy(() => import('./app/pages/ClientCases'));
const ClientCaseDetail = lazy(() => import('./app/pages/ClientCaseDetail'));
const PartnerDashboard = lazy(() => import('./app/pages/PartnerDashboard'));
const PartnerClients = lazy(() => import('./app/pages/PartnerClients'));
const PartnerClientDetail = lazy(() => import('./app/pages/PartnerClientDetail'));
const PartnerCaseDetail = lazy(() => import('./app/pages/PartnerCaseDetail'));
const AdminDashboard = lazy(() => import('./app/pages/AdminDashboard'));
const AdminAccessRequests = lazy(() => import('./app/pages/AdminAccessRequests'));

// 30 Articles Éducation SCPI
const FondsEurosOuScpiArticle = lazy(() => import('./components/articles/FondsEurosOuScpiArticle').then(m => ({ default: m.FondsEurosOuScpiArticle || m.default })));
const ScpiDirectOuAssuranceVie = lazy(() => import('./components/articles/ScpiDirectOuAssuranceVie').then(m => ({ default: m.ScpiDirectOuAssuranceVieArticle || m.default })));
const CoutOpportunite100kEuros = lazy(() => import('./components/articles/100000EurosFondsEurosCoutOpportuniteArticle').then(module => ({ default: module.Cent000EurosFondsEurosCoutOpportuniteArticle || module.default })));
const Portfolio200kEurosScpi = lazy(() => import('./components/articles/Investir200000EurosScpiPortefeuilleDiversifieArticle').then(m => ({ default: m.Investir200000EurosScpiPortefeuilleDiversifieArticle || m.default })));
const ScpiOuImmobilierLocatif = lazy(() => import('./components/articles/ScpiOuImmobilierLocatifComparatif20AnsArticle').then(m => ({ default: m.ScpiOuImmobilierLocatifComparatif20AnsArticle || m.default })));
const ScpiACredit = lazy(() => import('./components/articles/AchatScpiCreditEffetLevierFiscaliteArticle').then(m => ({ default: m.AchatScpiCreditEffetLevierFiscaliteArticle || m.default })));
const DemembrementScpi = lazy(() => import('./components/articles/DemembrementScpiNueProprieteUsufruitArticle').then(m => ({ default: m.DemembrementScpiNueProprieteUsufruitArticle || m.default })));
const ScpiTmi11 = lazy(() => import('./components/articles/InvestirScpiTmi11PourcentFiscaliteOptimaleArticle').then(m => ({ default: m.InvestirScpiTmi11PourcentFiscaliteOptimaleArticle || m.default })));
const ScpiTmi30 = lazy(() => import('./components/articles/ScpiTmi30PourcentArbitrageAvDirectArticle').then(m => ({ default: m.ScpiTmi30PourcentArbitrageAvDirectArticle || m.default })));
const ScpiTmi41 = lazy(() => import('./components/articles/ForteImpositionTmi41ScpiAssuranceVieArticle').then(m => ({ default: m.ForteImpositionTmi41ScpiAssuranceVieArticle || m.default })));
const ScpiEuropeennes = lazy(() => import('./components/articles/ScpiEuropeennesAvantagesPs0RendementArticle').then(m => ({ default: m.ScpiEuropeennesAvantagesPs0RendementArticle || m.default })));
const ScpiFiscales = lazy(() => import('./components/articles/ScpiFiscalesMalrauxDeficitFoncier2025Article').then(m => ({ default: m.ScpiFiscalesMalrauxDeficitFoncier2025Article || m.default })));
const ScpiSante = lazy(() => import('./components/articles/ScpiSanteSeniorsEhpadCliniquesInvestissementArticle').then(m => ({ default: m.ScpiSanteSeniorsEhpadCliniquesInvestissementArticle || m.default })));
const ScpiBureaux = lazy(() => import('./components/articles/ScpiBureauxTertiaireTeletravail2025Article').then(m => ({ default: m.ScpiBureauxTertiaireTeletravail2025Article || m.default })));
const ScpiCommerces = lazy(() => import('./components/articles/ScpiCommercesRetailECommerceOpportunitesArticle').then(m => ({ default: m.ScpiCommercesRetailECommerceOpportunitesArticle || m.default })));
const ScpiLogistique = lazy(() => import('./components/articles/ScpiLogistiqueEntrepotsECommerce2025Article').then(m => ({ default: m.ScpiLogistiqueEntrepotsECommerce2025Article || m.default })));
const ScpiResidentielles = lazy(() => import('./components/articles/ScpiResidentiellesLogementLocatifScpiHabitationArticle').then(m => ({ default: m.ScpiResidentiellesLogementLocatifScpiHabitationArticle || m.default })));
const PerScpi = lazy(() => import('./components/articles/PerScpiRetraiteDeductionFiscaleArticle').then(m => ({ default: m.PerScpiRetraiteDeductionFiscaleArticle || m.default })));
const SciScpi = lazy(() => import('./components/articles/SciScpiSocieteCivileImmobilierePartsArticle').then(m => ({ default: m.SciScpiSocieteCivileImmobilierePartsArticle || m.default })));
const IfiScpi = lazy(() => import('./components/articles/IfiScpiImpotFortuneImmobiliereStrategiesArticle').then(m => ({ default: m.IfiScpiImpotFortuneImmobiliereStrategiesArticle || m.default })));
const SuccessionScpi = lazy(() => import('./components/articles/SuccessionScpiTransmissionDroitsHeritageArticle').then(m => ({ default: m.SuccessionScpiTransmissionDroitsHeritageArticle || m.default })));
const DiversificationScpi = lazy(() => import('./components/articles/DiversificationScpiCombienNombrePartsArticle').then(m => ({ default: m.DiversificationScpiCombienNombrePartsArticle || m.default })));
const RendementScpi2025 = lazy(() => import('./components/articles/RendementScpi2025TdvmTauxDistributionArticle').then(m => ({ default: m.RendementScpi2025TdvmTauxDistributionArticle || m.default })));
const RisquesScpi = lazy(() => import('./components/articles/RisquesScpiVacanceLocativeLiquiditeArticle').then(m => ({ default: m.RisquesScpiVacanceLocativeLiquiditeArticle || m.default })));
const FraisScpi = lazy(() => import('./components/articles/FraisScpiSouscriptionGestionPerformanceArticle').then(m => ({ default: m.FraisScpiSouscriptionGestionPerformanceArticle || m.default })));
const ReventeScpi = lazy(() => import('./components/articles/RevendrePartsScpiDelaisMarcheSecondaireArticle').then(m => ({ default: m.RevendrePartsScpiDelaisMarcheSecondaireArticle || m.default })));
const ScpiOuEtf = lazy(() => import('./components/articles/ScpiOuEtfImmobilierReitComparatifArticle').then(m => ({ default: m.ScpiOuEtfImmobilierReitComparatifArticle || m.default })));
const ScpiOuOpci = lazy(() => import('./components/articles/ScpiOuOpciDifferencesAvantagesArticle').then(m => ({ default: m.ScpiOuOpciDifferencesAvantagesArticle || m.default })));
const PremierInvestissementScpi = lazy(() => import('./components/articles/PremierInvestissementScpiDebutantGuideArticle').then(m => ({ default: m.PremierInvestissementScpiDebutantGuideArticle || m.default })));
const ScpiJeuneActif = lazy(() => import('./components/articles/InvestirScpiJeuneActif2535AnsArticle').then(m => ({ default: m.InvestirScpiJeuneActif2535AnsArticle || m.default })));

// Pages EEAT et Piliers
const ExpertiseOriasPage = lazy(() => import('./components/ExpertiseOriasPage'));
const MethodologieDonneesPage = lazy(() => import('./components/MethodologieDonneesPage'));
const AvertissementsRisquesPage = lazy(() => import('./components/AvertissementsRisquesPage'));
const FiscaliteScpiPage = lazy(() => import('./components/FiscaliteScpiPage'));
const TOFScpiPage = lazy(() => import('./components/TOFScpiPage'));
const CapitalisationScpiPage = lazy(() => import('./components/CapitalisationScpiPage'));
const DecoteValeurReconstitutionScpiPage = lazy(() => import('./components/DecoteValeurReconstitutionScpiPage'));
const EndettementScpiPage = lazy(() => import('./components/EndettementScpiPage'));
const RendementNetScpiPage = lazy(() => import('./components/RendementNetScpiPage'));
const ScpiEuropeennesPage = lazy(() => import('./components/ScpiEuropeennesPage'));
const DemembrementScpiPage = lazy(() => import('./components/DemembrementScpiPage'));
const AssuranceVieScpiPage = lazy(() => import('./components/AssuranceVieScpiPage'));
const Tmi11ScpiPage = lazy(() => import('./components/Tmi11ScpiPage'));
const Tmi30ScpiPage = lazy(() => import('./components/Tmi30ScpiPage'));
const FraisScpiPage = lazy(() => import('./components/FraisScpiPage'));
const RisquesScpiPage = lazy(() => import('./components/RisquesScpiPage'));
const LiquiditeScpiPage = lazy(() => import('./components/LiquiditeScpiPage'));
const BaissePrixPartScpiPage = lazy(() => import('./components/BaissePrixPartScpiPage'));
const DelaiJouissanceScpiPage = lazy(() => import('./components/DelaiJouissanceScpiPage'));
const ReportANouveauScpiPage = lazy(() => import('./components/ReportANouveauScpiPage'));
const ChoisirScpiPage = lazy(() => import('./components/ChoisirScpiPage'));
const MeilleuresScpiAttentionPage = lazy(() => import('./components/MeilleuresScpiAttentionPage'));
const ComparateurScpiFiablePage = lazy(() => import('./components/ComparateurScpiFiablePage'));
const AllocationScpiPage = lazy(() => import('./components/AllocationScpiPage'));
const CombienInvestirScpiPage = lazy(() => import('./components/CombienInvestirScpiPage'));
const ScpiSantePage = lazy(() => import('./components/ScpiSantePage'));
const ScpiLogistiquePage = lazy(() => import('./components/ScpiLogistiquePage'));
const ScpiBureauxPage = lazy(() => import('./components/ScpiBureauxPage'));
const ScpiCommercePage = lazy(() => import('./components/ScpiCommercePage'));
const ScpiDiversifieesPage = lazy(() => import('./components/ScpiDiversifieesPage'));
const SocieteGestionScpiPage = lazy(() => import('./components/SocieteGestionScpiPage'));
const SocietesDeGestionScpiPage = lazy(() => import('./components/SocietesDeGestionScpiPage'));
const ManagementCompanyArticlePage = lazy(() => import('./components/ManagementCompanyArticlePage'));
const GestionnaireScpiPage = lazy(() => import('./components/GestionnaireScpiPage'));
const GestionnairesActeursScpiPage = lazy(() => import('./components/GestionnairesActeursScpiPage'));
const CgpCifScpiPage = lazy(() => import('./components/CgpCifScpiPage'));
const PsiScpiPage = lazy(() => import('./components/PsiScpiPage'));
const RetrocommissionsScpiPage = lazy(() => import('./components/RetrocommissionsScpiPage'));
const FiscaliteAvanceeScpiPage = lazy(() => import('./components/FiscaliteAvanceeScpiPage'));
const Tmi41ScpiPage = lazy(() => import('./components/Tmi41ScpiPage'));
const Tmi45ScpiPage = lazy(() => import('./components/Tmi45ScpiPage'));
const RevenusEtrangersScpiPage = lazy(() => import('./components/RevenusEtrangersScpiPage'));
const RevenusFonciersScpiPage = lazy(() => import('./components/RevenusFonciersScpiPage'));
const PrelevementsSociauxScpiPage = lazy(() => import('./components/PrelevementsSociauxScpiPage'));
const CreditImpotScpiPage = lazy(() => import('./components/CreditImpotScpiPage'));
const TauxEffectifScpiPage = lazy(() => import('./components/TauxEffectifScpiPage'));
const IfiScpiPage = lazy(() => import('./components/IfiScpiPage'));
const SciIsFiscaliteScpiPage = lazy(() => import('./components/SciIsFiscaliteScpiPage'));
const ScpiAmfPage = lazy(() => import('./components/ScpiAmfPage'));
const ScpiOriasPage = lazy(() => import('./components/ScpiOriasPage'));
const ScpiDocumentsReglementairesPage = lazy(() => import('./components/ScpiDocumentsReglementairesPage'));
const ScpiDicPage = lazy(() => import('./components/ScpiDicPage'));
const ScpiNoteInformationPage = lazy(() => import('./components/ScpiNoteInformationPage'));
const ScpiCreditPage = lazy(() => import('./components/ScpiCreditPage'));
const ScpiComptantPage = lazy(() => import('./components/ScpiComptantPage'));
const ScpiRetraitePage = lazy(() => import('./components/ScpiRetraitePage'));
const ScpiRevenusComplementairesPage = lazy(() => import('./components/ScpiRevenusComplementairesPage'));
const ScpiTransmissionPage = lazy(() => import('./components/ScpiTransmissionPage'));
const ScpiFrancePage = lazy(() => import('./components/ScpiFrancePage'));

// Types and Data
import { Scpi, QuickFilterType, ObjectiveType } from './types/scpi';
// scpiData lazy loaded on demand (275 Ko)
import { educationArticles, getArticlesByCategory, getAllCategories, getArticleBySlug } from './data/educationArticles';
import { getTemplateBySlug } from './data/articleTemplatesConfig';
import { managementCompanyConfigs } from './data/managementCompanyArticlesConfig';
import type { Article } from './components/ArticlePage';
import { scpiLandingPages } from './data/landingPagesData';
import { buildScpiLandingData } from './utils/buildScpiLandingData';

// Hooks and Utils
import { useScpiFilters } from './hooks/useScpiFilters';
import { usePortfolio } from './hooks/usePortfolio';
import { formatCurrency, normalizeString } from './utils/formatters';
import { applyObjective } from './utils/objectiveSelector';
import { landingPages } from './utils/landingPageConfig';
import { getLandingPageBySlug, allLandingPages } from './utils/landingPagesContent';

const App: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasLandingParams = urlParams.has('filter') || urlParams.has('sector') || urlParams.has('geo');

  const currentLandingPage = landingPages.find(page => {
    const pageParams = new URLSearchParams(page.urlParams as Record<string, string>);
    return pageParams.toString() === urlParams.toString();
  });

  // Lazy load SCPI data (275 Ko) only when comparator is shown
  const [scpiData, setScpiData] = useState<Scpi[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Mode sombre par défaut si aucune préférence n'est sauvegardée
      return true;
    }
    return true;
  });

  // Modal states
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedScpiForSubscription, setSelectedScpiForSubscription] = useState<any[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isPortfolioResultsOpen, setIsPortfolioResultsOpen] = useState(false);
  const [isComparisonTableOpen, setIsComparisonTableOpen] = useState(false);
  const [selectedScpiForComparison, setSelectedScpiForComparison] = useState<Scpi[]>([]);

  // Data states
  const [selectedScpiForAnalysis, setSelectedScpiForAnalysis] = useState<Scpi | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Education/Article/Landing states
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'article' | 'landing' | 'faq' | 'comprendre' | 'about-us' | 'reclamation' | 'conditions' | 'scpi-example' | 'scpi-landing' | 'scpi-detail' | 'thematic' | 'scpi-optimized' | 'thematic-optimized' | 'scpi-static' | 'comparateur' | 'test-sender-react' | 'life-to-scpi' | 'simulateur-revenus-nets' | 'simulateur-credit' | 'simulateur-demembrement' | 'simulateur-enveloppes' | 'simulateur-profil-investisseur' | 'simulateur-tresorerie-is' | 'simulateur-impact-fiscal' | 'simulateurs' | 'comparateur-demembrement' | 'fonds-euros-ou-scpi' | 'article-generator' | 'articles-list' | 'actualites' | 'dynamic-article' | 'expertise-orias' | 'methodologie-donnees' | 'avertissements-risques' | 'investir-scpi' | 'rendement-scpi' | 'fiscalite-scpi' | 'tof-scpi' | 'capitalisation-scpi' | 'decote-valeur-reconstitution-scpi' | 'endettement-scpi' | 'rendement-net-scpi' | 'scpi-demembrement' | 'scpi-assurance-vie' | 'scpi-tmi-11' | 'scpi-tmi-30' | 'frais-scpi' | 'risques-scpi' | 'liquidite-scpi' | 'baisse-prix-part-scpi' | 'delai-jouissance-scpi' | 'report-a-nouveau-scpi' | 'choisir-scpi' | 'meilleures-scpi-attention' | 'comparateur-scpi-fiable' | 'allocation-scpi' | 'combien-investir-scpi' | 'scpi-sante' | 'scpi-logistique' | 'scpi-bureaux' | 'scpi-commerce' | 'scpi-diversifiees' | 'societe-gestion-scpi' | 'gestionnaire-scpi' | 'cgp-cif-scpi' | 'psi-scpi' | 'retrocommissions-scpi' | 'acheter-scpi' | 'guided-journey' | 'partenaire-cabinet' | 'admin-partners' | 'app-entry' | 'app-login' | 'app-request-access' | 'app-onboarding' | 'app-claim' | 'app-set-password' | 'app-setup' | 'app-client' | 'app-client-cases' | 'app-client-case' | 'app-partner' | 'app-partner-clients' | 'app-partner-client' | 'app-partner-case' | 'app-admin' | 'app-admin-requests' | 'scpi-fiscalite' | 'scpi-tmi-41' | 'scpi-tmi-45' | 'scpi-revenus-etrangers' | 'scpi-revenus-fonciers' | 'scpi-prelevements-sociaux' | 'scpi-credit-impot' | 'scpi-taux-effectif' | 'scpi-ifi' | 'scpi-sci-is-fiscalite' | 'amf-scpi' | 'orias-scpi' | 'documents-reglementaires-scpi' | 'dic-scpi' | 'note-information-scpi' | 'scpi-credit' | 'scpi-comptant' | 'scpi-retraite' | 'scpi-revenus-complementaires' | 'scpi-transmission' | 'scpi-france' | 'societe-gestion-article' | 'societes-de-gestion-scpi' | 'gestionnaires-acteurs-scpi'>('home');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string | null>(null);
  const [managementCompanySlug, setManagementCompanySlug] = useState<string | null>(null);
  const [selectedScpiKey, setSelectedScpiKey] = useState<string | null>(null);
  const [selectedThematicPage, setSelectedThematicPage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLandingPage, setSelectedLandingPage] = useState<string | null>(null);
  const [appCaseId, setAppCaseId] = useState<string | null>(null);
  const [appClientId, setAppClientId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    const thematicPage = (window as any).__THEMATIC_PAGE__;
    const initialPage = (window as any).__INITIAL_PAGE__;
    const initialRoute = (window as any).__INITIAL_ROUTE__;
    // Si la page est chargée depuis un fichier statique avec __INITIAL_ROUTE__
    if (initialRoute) {
      // Les routes SCPI individuelles sont maintenant gérées par le routing générique ci-dessous
    }

    // Si la page est chargée depuis un fichier statique avec __INITIAL_PAGE__
    if (initialPage) {
      setCurrentView(initialPage as any);
      return;
    }

    // Si la page est chargée depuis un fichier statique avec __THEMATIC_PAGE__
    if (thematicPage) {
      setSelectedThematicPage(thematicPage);
      setCurrentView('thematic-optimized');
      return;
    }

    if (path) {
      if (path.startsWith('app') || path.startsWith('espace')) {
        const segments = path.split('/');
        const base = segments[0];
        const section = segments[1];
        const sub = segments[2];
        const id = segments[3];
        if (segments.length === 1) {
          setCurrentView('app-entry');
          return;
        }
        if (section === 'login') {
          setCurrentView('app-login');
          return;
        }
        if (section === 'signup' || section === 'request-access') {
          setCurrentView('app-request-access');
          return;
        }
        if (section === 'onboarding') {
          setCurrentView('app-onboarding');
          return;
        }
        if (section === 'claim') {
          setCurrentView('app-claim');
          return;
        }
        if (section === 'set-password') {
          setCurrentView('app-set-password');
          return;
        }
        if (section === 'setup') {
          setCurrentView('app-setup');
          return;
        }
        if (section === 'client') {
          if (sub === 'dossiers' && id) {
            setAppCaseId(id);
            setCurrentView('app-client-case');
            return;
          }
          if (sub === 'dossiers') {
            setCurrentView('app-client-cases');
            return;
          }
          setCurrentView('app-client');
          return;
        }
        if (section === 'partner') {
          if (sub === 'clients' && id) {
            setAppClientId(id);
            setCurrentView('app-partner-client');
            return;
          }
          if (sub === 'clients') {
            setCurrentView('app-partner-clients');
            return;
          }
          if (sub === 'dossiers' && id) {
            setAppCaseId(id);
            setCurrentView('app-partner-case');
            return;
          }
          setCurrentView('app-partner');
          return;
        }
        if (section === 'admin') {
          if (sub === 'access-requests') {
            setCurrentView('app-admin-requests');
            return;
          }
          setCurrentView('app-admin');
          return;
        }
        if (base === 'espace') {
          setCurrentView('app-entry');
          return;
        }
      }
      if (path.startsWith('comparateur/scpi/')) {
        const scpiSlug = path.replace('comparateur/scpi/', '');
        if (scpiSlug) {
          setSelectedScpiKey(scpiSlug);
          setCurrentView('scpi-detail');
          return;
        }
      }
      if (path === 'simulateurs') {
        setCurrentView('simulateurs');
        return;
      }
      if (path === 'simulateur-revenus-nets-scpi') {
        setCurrentView('simulateur-revenus-nets');
        return;
      }
      if (path === 'simulateur-credit-scpi') {
        setCurrentView('simulateur-credit');
        return;
      }
      if (path === 'simulateur-demembrement-scpi') {
        setCurrentView('simulateur-demembrement');
        return;
      }
      if (path === 'simulateur-enveloppes-scpi') {
        setCurrentView('simulateur-enveloppes');
        return;
      }
      if (path === 'simulateur-tresorerie-is') {
        setCurrentView('simulateur-tresorerie-is');
        return;
      }
      if (path === 'simulateur-impact-fiscal-scpi') {
        setCurrentView('simulateur-impact-fiscal');
        return;
      }
      if (path === 'simulateur-profil-investisseur') {
        setCurrentView('simulateur-profil-investisseur');
        return;
      }
      if (path === 'comparateur-demembrement-scpi') {
        setCurrentView('comparateur-demembrement');
        return;
      }
      if (path === 'partenaire-cabinet') {
        setCurrentView('partenaire-cabinet');
        return;
      }
      if (path === 'admin/partners') {
        setCurrentView('admin-partners');
        return;
      }
      // Ne pas gérer /souscription dans le routing initial car c'est géré par le tunnel
      if (path === 'souscription') {
        return; // Ne pas changer la vue, laisser le tunnel s'ouvrir
      }
      if (path === 'faq') {
        setCurrentView('faq');
      } else if (path === 'comprendre-les-scpi') {
        setCurrentView('comprendre');
      } else if (path === 'qui-sommes-nous') {
        setCurrentView('about-us');
      } else if (path === 'reclamation') {
        setCurrentView('reclamation');
      } else if (path === 'conditions-utilisation') {
        setCurrentView('conditions');
      } else if (path === 'expertise-orias-cif') {
        setCurrentView('expertise-orias');
      } else if (path === 'methodologie-donnees-scpi') {
        setCurrentView('methodologie-donnees');
      } else if (path === 'avertissements-risques-scpi') {
        setCurrentView('avertissements-risques');
      } else if (path === 'investir-en-scpi') {
        setCurrentView('investir-scpi');
      } else if (path === 'rendement-scpi') {
        setCurrentView('rendement-scpi');
      } else if (path === 'fiscalite-scpi') {
        setCurrentView('fiscalite-scpi');
      } else if (path === 'tof-scpi') {
        setCurrentView('tof-scpi');
      } else if (path === 'capitalisation-scpi') {
        setCurrentView('capitalisation-scpi');
      } else if (path === 'decote-valeur-reconstitution-scpi') {
        setCurrentView('decote-valeur-reconstitution-scpi');
      } else if (path === 'endettement-scpi') {
        setCurrentView('endettement-scpi');
      } else if (path === 'rendement-net-scpi') {
        setCurrentView('rendement-net-scpi');
      } else if (path === 'acheter-scpi') {
        setCurrentView('acheter-scpi');
      } else if (path === 'test-sender-react') {
        setCurrentView('test-sender-react');
      } else if (path === 'admin/article-generator') {
        setCurrentView('article-generator');
      } else if (path === 'articles') {
        setCurrentView('articles-list');
      } else if (path === 'actualites') {
        setCurrentView('actualites');
      } else if (path === 'fonds-euros-ou-scpi') {
        setCurrentView('fonds-euros-ou-scpi');
      } else if (path === 'education/fonds-euros-ou-scpi') {
        setCurrentView('article-fonds-euros-ou-scpi');
      } else if (path === 'education/scpi-en-direct-ou-assurance-vie') {
        setCurrentView('article-scpi-direct-av');
      } else if (path === 'education/100000-euros-fonds-euros-cout-opportunite') {
        setCurrentView('article-cout-opportunite-100k');
      } else if (path === 'education/investir-200000-euros-scpi-portefeuille-diversifie') {
        setCurrentView('article-portfolio-200k');
      } else if (path === 'education/scpi-ou-immobilier-locatif-comparatif-20-ans') {
        setCurrentView('article-scpi-vs-locatif');
      } else if (path === 'education/achat-scpi-credit-effet-levier-fiscalite') {
        setCurrentView('article-scpi-credit');
      } else if (path === 'education/demembrement-scpi-nue-propriete-usufruit') {
        setCurrentView('article-demembrement');
      } else if (path === 'education/investir-scpi-tmi-11-pourcent-fiscalite-optimale') {
        setCurrentView('article-scpi-tmi-11');
      } else if (path === 'education/scpi-tmi-30-pourcent-arbitrage-av-direct') {
        setCurrentView('article-scpi-tmi-30');
      } else if (path === 'education/forte-imposition-tmi-41-scpi-assurance-vie') {
        setCurrentView('article-scpi-tmi-41');
      } else if (path === 'education/scpi-europeennes-avantages-ps-0-rendement') {
        setCurrentView('article-scpi-europeennes');
      } else if (path === 'education/scpi-fiscales-malraux-deficit-foncier-2025') {
        setCurrentView('article-scpi-fiscales');
      } else if (path === 'education/scpi-sante-seniors-ehpad-cliniques-investissement') {
        setCurrentView('article-scpi-sante');
      } else if (path === 'education/scpi-bureaux-tertiaire-teletravail-2025') {
        setCurrentView('article-scpi-bureaux');
      } else if (path === 'education/scpi-commerces-retail-e-commerce-opportunites') {
        setCurrentView('article-scpi-commerces');
      } else if (path === 'education/scpi-logistique-entrepots-e-commerce-2025') {
        setCurrentView('article-scpi-logistique');
      } else if (path === 'education/scpi-residentielles-logement-locatif-scpi-habitation') {
        setCurrentView('article-scpi-residentielles');
      } else if (path === 'education/per-scpi-retraite-deduction-fiscale') {
        setCurrentView('article-per-scpi');
      } else if (path === 'education/sci-scpi-societe-civile-immobiliere-parts') {
        setCurrentView('article-sci-scpi');
      } else if (path === 'education/ifi-scpi-impot-fortune-immobiliere-strategies') {
        setCurrentView('article-ifi-scpi');
      } else if (path === 'education/succession-scpi-transmission-droits-heritage') {
        setCurrentView('article-succession-scpi');
      } else if (path === 'education/diversification-scpi-combien-nombre-parts') {
        setCurrentView('article-diversification-scpi');
      } else if (path === 'education/rendement-scpi-2025-tdvm-taux-distribution') {
        setCurrentView('article-rendement-scpi-2025');
      } else if (path === 'education/risques-scpi-vacance-locative-liquidite') {
        setCurrentView('article-risques-scpi');
      } else if (path === 'education/frais-scpi-souscription-gestion-performance') {
        setCurrentView('article-frais-scpi');
      } else if (path === 'education/revendre-parts-scpi-delais-marche-secondaire') {
        setCurrentView('article-revente-scpi');
      } else if (path === 'education/scpi-ou-etf-immobilier-reit-comparatif') {
        setCurrentView('article-scpi-vs-etf');
      } else if (path === 'education/scpi-ou-opci-differences-avantages') {
        setCurrentView('article-scpi-vs-opci');
      } else if (path === 'education/premier-investissement-scpi-debutant-guide') {
        setCurrentView('article-premier-investissement');
      } else if (path === 'education/investir-scpi-jeune-actif-25-35-ans') {
        setCurrentView('article-scpi-jeune-actif');
      } else if (path === 'simulateur-fonds-euros-scpi') {
        setCurrentView('life-to-scpi');
      } else if (path === 'simulateur-profil-investisseur') {
        setCurrentView('simulateur-profil-investisseur');
      } else if (path === 'meilleures-scpi-rendement') {
        setSelectedThematicPage('meilleures-scpi-rendement');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-fiscales') {
        setSelectedThematicPage('scpi-fiscales');
        setCurrentView('thematic-optimized');
      } else if (path === 'preparer-retraite-scpi') {
        setSelectedThematicPage('preparer-retraite-scpi');
        setCurrentView('thematic-optimized');
      } else if (path === 'revenu-complementaire-scpi') {
        setSelectedThematicPage('revenu-complementaire-scpi');
        setCurrentView('thematic-optimized');
      } else if (path === 'comparateur-scpi') {
        setCurrentView('comparateur');
      } else if (path === 'scpi-bureaux-investissement') {
        setSelectedThematicPage('scpi-bureaux-investissement');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-commerces-investissement') {
        setSelectedThematicPage('scpi-commerces-investissement');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-sante-investissement') {
        setSelectedThematicPage('scpi-sante-investissement');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-france-investissement') {
        setSelectedThematicPage('scpi-france-investissement');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-sans-frais') {
        setSelectedThematicPage('scpi-sans-frais');
        setCurrentView('thematic-optimized');
      } else if (path === 'recyclage-urbain-scpi') {
        setSelectedThematicPage('recyclage-urbain-scpi');
        setCurrentView('thematic-optimized');
      } else if (path === 'scpi-secteurs') {
        setCurrentView('scpi-secteurs-hub');
      } else if (path === 'scpi-gestionnaires') {
        setCurrentView('scpi-gestionnaires-hub');
      } else if (path === 'scpi-objectifs') {
        setCurrentView('scpi-objectifs-hub');
      } else if (path === 'scpi-europeennes') {
        setCurrentView('scpi-europeennes-hub');
      } else if (path === 'scpi-demembrement') {
        setCurrentView('scpi-demembrement');
      } else if (path === 'scpi-assurance-vie') {
        setCurrentView('scpi-assurance-vie');
      } else if (path === 'scpi-tmi-11') {
        setCurrentView('scpi-tmi-11');
      } else if (path === 'scpi-tmi-30') {
        setCurrentView('scpi-tmi-30');
      } else if (path === 'frais-scpi') {
        setCurrentView('frais-scpi');
      } else if (path === 'risques-scpi') {
        setCurrentView('risques-scpi');
      } else if (path === 'liquidite-scpi') {
        setCurrentView('liquidite-scpi');
      } else if (path === 'baisse-prix-part-scpi') {
        setCurrentView('baisse-prix-part-scpi');
      } else if (path === 'delai-jouissance-scpi') {
        setCurrentView('delai-jouissance-scpi');
      } else if (path === 'report-a-nouveau-scpi') {
        setCurrentView('report-a-nouveau-scpi');
      } else if (path === 'choisir-scpi') {
        setCurrentView('choisir-scpi');
      } else if (path === 'meilleures-scpi-attention') {
        setCurrentView('meilleures-scpi-attention');
      } else if (path === 'comparateur-scpi-fiable') {
        setCurrentView('comparateur-scpi-fiable');
      } else if (path === 'allocation-scpi') {
        setCurrentView('allocation-scpi');
      } else if (path === 'combien-investir-scpi') {
        setCurrentView('combien-investir-scpi');
      } else if (path === 'scpi-sante') {
        setCurrentView('scpi-sante');
      } else if (path === 'scpi-logistique') {
        setCurrentView('scpi-logistique');
      } else if (path === 'scpi-bureaux') {
        setCurrentView('scpi-bureaux');
      } else if (path === 'scpi-commerce') {
        setCurrentView('scpi-commerce');
      } else if (path === 'scpi-diversifiees') {
        setCurrentView('scpi-diversifiees');
      } else if (path === 'societes-de-gestion-scpi') {
        setCurrentView('societes-de-gestion-scpi');
      } else if (path.startsWith('societe-gestion/') && !path.startsWith('societe-gestion-scpi')) {
        const mgmtSegments = path.split('/');
        const mgmtSlug = mgmtSegments[1];
        if (mgmtSlug && managementCompanyConfigs.find(c => c.slug === mgmtSlug)) {
          setManagementCompanySlug(mgmtSlug);
          setCurrentView('societe-gestion-article');
        } else {
          setCurrentView('societe-gestion-scpi');
        }
      } else if (path === 'societe-gestion-scpi') {
        setCurrentView('societe-gestion-scpi');
      } else if (path === 'gestionnaire-scpi') {
        setCurrentView('gestionnaire-scpi');
      } else if (path === 'gestionnaires-acteurs-scpi') {
        setCurrentView('gestionnaires-acteurs-scpi');
      } else if (path === 'cgp-cif-scpi') {
        setCurrentView('cgp-cif-scpi');
      } else if (path === 'psi-scpi') {
        setCurrentView('psi-scpi');
      } else if (path === 'retrocommissions-scpi') {
        setCurrentView('retrocommissions-scpi');
      } else if (path === 'scpi-fiscalite') {
        setCurrentView('scpi-fiscalite');
      } else if (path === 'scpi-tmi-41') {
        setCurrentView('scpi-tmi-41');
      } else if (path === 'scpi-tmi-45') {
        setCurrentView('scpi-tmi-45');
      } else if (path === 'scpi-revenus-etrangers') {
        setCurrentView('scpi-revenus-etrangers');
      } else if (path === 'scpi-revenus-fonciers') {
        setCurrentView('scpi-revenus-fonciers');
      } else if (path === 'scpi-prelevements-sociaux') {
        setCurrentView('scpi-prelevements-sociaux');
      } else if (path === 'scpi-credit-impot') {
        setCurrentView('scpi-credit-impot');
      } else if (path === 'scpi-taux-effectif') {
        setCurrentView('scpi-taux-effectif');
      } else if (path === 'scpi-ifi') {
        setCurrentView('scpi-ifi');
      } else if (path === 'scpi-sci-is-fiscalite') {
        setCurrentView('scpi-sci-is-fiscalite');
      } else if (path === 'amf-scpi') {
        setCurrentView('amf-scpi');
      } else if (path === 'orias-scpi') {
        setCurrentView('orias-scpi');
      } else if (path === 'documents-reglementaires-scpi') {
        setCurrentView('documents-reglementaires-scpi');
      } else if (path === 'dic-scpi') {
        setCurrentView('dic-scpi');
      } else if (path === 'note-information-scpi') {
        setCurrentView('note-information-scpi');
      } else if (path === 'scpi-credit') {
        setCurrentView('scpi-credit');
      } else if (path === 'scpi-comptant') {
        setCurrentView('scpi-comptant');
      } else if (path === 'scpi-retraite') {
        setCurrentView('scpi-retraite');
      } else if (path === 'scpi-revenus-complementaires') {
        setCurrentView('scpi-revenus-complementaires');
      } else if (path === 'scpi-transmission') {
        setCurrentView('scpi-transmission');
      } else if (path === 'scpi-france') {
        setCurrentView('scpi-france');
      } else if (path === 'parcours-guide' || path === 'guided-journey' || path.startsWith('parcours-guide/')) {
        setCurrentView('guided-journey');
      } else {
        // Check if it's a dynamic article from articleTemplatesConfig
        const articleTemplate = getTemplateBySlug(path);
        if (articleTemplate) {
          setCurrentArticleSlug(path);
          setCurrentView('dynamic-article');
          return;
        }

        // Check if it's a thematic landing page (TOUTES optimisées pour Google Ads)
        const allThematicPages = [
          'alderan-scpi', 'arkea-reim-scpi', 'la-francaise-rem-scpi', 'atland-voisin-scpi',
          'aestiam-scpi', 'altixia-reim-scpi', 'amundi-immobilier-scpi', 'atream-scpi',
          'consultim-asset-management-scpi', 'fiducial-gerance-scpi', 'greenman-arth-scpi',
          'inter-gestion-reim-scpi', 'iroko-scpi', 'kyaneos-asset-management-scpi',
          'magellim-reim-scpi', 'norma-capital-scpi', 'novaxia-investissement-scpi',
          'paref-gestion-scpi', 'perial-asset-management-scpi', 'praemia-reim-france-scpi',
          'remake-asset-management-scpi', 'sofidy-scpi', 'sogenial-immobilier-scpi',
          'swiss-life-am-france-scpi', 'theoreim-scpi', 'urban-premium-scpi'
        ];

        if (allThematicPages.includes(path)) {
          setSelectedThematicPage(path);
          setCurrentView('thematic-optimized');
        } else {
          // D'abord, chercher dans les landing pages SCPI optimisées
          const scpiKey = Object.keys(scpiLandingPages).find(key => {
            const slug = scpiLandingPages[key].slug;
            return slug === path || key === path;
          });
          if (scpiKey) {
            setSelectedScpiKey(scpiKey);
            setCurrentView('scpi-optimized');
          } else {
            // Vérifier si c'est une landing page générique (pas une SCPI)
            const landingPage = getLandingPageBySlug(path);
            if (landingPage && landingPage.type !== 'scpi') {
              // C'est une landing page sectorielle ou géographique, pas une SCPI
              setSelectedLandingPage(path);
              setCurrentView('landing');
            } else if (buildScpiLandingData(path)) {
              // SCPI sans fiche éditoriale : template riche généré (même structure que /sofiprime)
              setSelectedScpiKey(path);
              setCurrentView('scpi-optimized');
            } else {
              setSelectedScpiKey(path);
              setCurrentView('scpi-static');
            }
          }
        }
      }
    }
  }, []);

  // Hook useLocation personnalisé (sans React Router)
  const [location, setLocation] = React.useState({
    pathname: window.location.pathname,
    state: window.history.state
  });

  // Utiliser useRef pour stocker le wrapper original et éviter les re-installations
  const originalPushStateRef = React.useRef<typeof window.history.pushState | null>(null);
  const isWrapperInstalledRef = React.useRef(false);
  const updateLocationRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    // Éviter les installations multiples
    if (isWrapperInstalledRef.current) {
      return;
    }

    isWrapperInstalledRef.current = true;
    
    const updateLocation = () => {
      const currentState = window.history.state;
      setLocation({
        pathname: window.location.pathname,
        state: currentState
      });
    };
    updateLocationRef.current = updateLocation;

    window.addEventListener('popstate', updateLocation);
    // Écouter aussi les changements de pushState
    originalPushStateRef.current = window.history.pushState;
    window.history.pushState = function(state, title, url) {
      if (originalPushStateRef.current) {
        originalPushStateRef.current.apply(window.history, [state, title, url]);
      }
      // Utiliser directement le state passé en paramètre (plus fiable que window.history.state)
      // Normaliser l'URL pour correspondre à window.location.pathname
      const normalizedPath = typeof url === 'string' ? url : window.location.pathname;
      // Mettre à jour immédiatement le location state
      setLocation({
        pathname: normalizedPath,
        state: state
      });
      // Forcer un re-render en dispatchant un popstate event personnalisé
      // Cela garantit que tous les listeners sont notifiés
      setTimeout(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 0);
    };

    return () => {
      isWrapperInstalledRef.current = false;
      if (updateLocationRef.current) {
        window.removeEventListener('popstate', updateLocationRef.current);
      }
      if (originalPushStateRef.current) {
        window.history.pushState = originalPushStateRef.current;
      }
    };
  }, []);

  // Ouverture automatique du tunnel sur la route /souscription
  useEffect(() => {
    if (location.pathname === '/souscription') {
      // Essayer d'abord location.state, puis window.history.state en fallback
      const scpis = location.state?.scpis ?? window.history.state?.scpis ?? [];
      if (scpis.length > 0) {
        // Mettre à jour les SCPI et ouvrir le tunnel IMMÉDIATEMENT
        setSelectedScpiForSubscription(scpis);
        setIsSubscriptionOpen(true);
      } else {
        // Si on est sur /souscription mais sans SCPI, peut-être qu'on vient d'arriver
        // Attendre un peu pour voir si le state arrive (augmenter le délai pour laisser le temps au pushState)
        const timeoutId = setTimeout(() => {
          const delayedScpis = window.history.state?.scpis ?? [];
          if (delayedScpis.length > 0) {
            setSelectedScpiForSubscription(delayedScpis);
            setIsSubscriptionOpen(true);
          }
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    } else {
      // Si on quitte /souscription, fermer le tunnel (seulement si ouvert)
      if (isSubscriptionOpen) {
        setIsSubscriptionOpen(false);
        setSelectedScpiForSubscription([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  // Hooks - DOIT être appelé AVANT tous les retours conditionnels
  const { filteredScpi: filteredByFilters, activeQuickFilter, setQuickFilter, filters, updateFilter } = useScpiFilters(scpiData);
  const { selectedScpi, investmentAmount, setInvestmentAmount, toggleScpiSelection, removeScpi, portfolioStats } = usePortfolio();

  // Apply search filter on top of existing filters
  const filteredScpi = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByFilters;
    }

    const normalizedQuery = normalizeString(searchQuery);

    return filteredByFilters.filter(scpi => {
      const normalizedName = normalizeString(scpi.name);
      const normalizedCompany = normalizeString(scpi.company || '');
      const normalizedSector = normalizeString(scpi.sector || '');

      return normalizedName.includes(normalizedQuery) ||
             normalizedCompany.includes(normalizedQuery) ||
             normalizedSector.includes(normalizedQuery);
    });
  }, [filteredByFilters, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredScpi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScpi = filteredScpi.slice(startIndex, endIndex);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredScpi.length, activeQuickFilter, searchQuery]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Floating button visibility
  useEffect(() => {
    const handleScroll = () => {
      // Ne pas afficher le bouton flottant sur les pages thématiques optimisées
      const shouldHideOnCurrentView = currentView === 'thematic-optimized' || currentView === 'scpi-optimized';
      setShowFloatingButton(window.scrollY > 300 && selectedScpi.length === 0 && !shouldHideOnCurrentView);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedScpi.length, currentView]);

  // Global RDV modal function
  useEffect(() => {
    (window as any).openRdvModal = () => setIsRdvModalOpen(true);
    (window as any).openComparisonTable = (scpiList: Scpi[]) => {
      setSelectedScpiForComparison(scpiList);
      setIsComparisonTableOpen(true);
    };

    // Process queued comparison table calls
    const queue = (window as any).comparisonTableQueue || [];
    if (queue.length > 0) {
      const scpiList = queue[0];
      setSelectedScpiForComparison(scpiList);
      setIsComparisonTableOpen(true);
      (window as any).comparisonTableQueue = [];
    }

    return () => {
      delete (window as any).openRdvModal;
      delete (window as any).openComparisonTable;
    };
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Normaliser le pathname : enlever le slash initial et final
      const rawPath = window.location.pathname;
      const path = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

      // Route to the correct view based on URL
      if (!normalizedPath || normalizedPath === '') {
        setCurrentView('home');
        setSelectedCategory(null);
        setSelectedArticle(null);
        setSelectedLandingPage(null);
        setSelectedScpiKey(null);
        setSelectedThematicPage(null);
      } else if (normalizedPath.startsWith('app') || normalizedPath.startsWith('espace')) {
        const segments = normalizedPath.split('/');
        const base = segments[0];
        const section = segments[1];
        const sub = segments[2];
        const id = segments[3];
        if (segments.length === 1) {
          setCurrentView('app-entry');
          return;
        }
        if (section === 'login') {
          setCurrentView('app-login');
          return;
        }
        if (section === 'signup' || section === 'request-access') {
          setCurrentView('app-request-access');
          return;
        }
        if (section === 'onboarding') {
          setCurrentView('app-onboarding');
          return;
        }
        if (section === 'claim') {
          setCurrentView('app-claim');
          return;
        }
        if (section === 'set-password') {
          setCurrentView('app-set-password');
          return;
        }
        if (section === 'setup') {
          setCurrentView('app-setup');
          return;
        }
        if (section === 'client') {
          if (sub === 'dossiers' && id) {
            setAppCaseId(id);
            setCurrentView('app-client-case');
            return;
          }
          if (sub === 'dossiers') {
            setCurrentView('app-client-cases');
            return;
          }
          setCurrentView('app-client');
          return;
        }
        if (section === 'partner') {
          if (sub === 'clients' && id) {
            setAppClientId(id);
            setCurrentView('app-partner-client');
            return;
          }
          if (sub === 'clients') {
            setCurrentView('app-partner-clients');
            return;
          }
          if (sub === 'dossiers' && id) {
            setAppCaseId(id);
            setCurrentView('app-partner-case');
            return;
          }
          setCurrentView('app-partner');
          return;
        }
        if (section === 'admin') {
          if (sub === 'access-requests') {
            setCurrentView('app-admin-requests');
            return;
          }
          setCurrentView('app-admin');
          return;
        }
        if (base === 'espace') {
          setCurrentView('app-entry');
          return;
        }
      } else if (normalizedPath === 'partenaire-cabinet') {
        setCurrentView('partenaire-cabinet');
      } else if (normalizedPath === 'admin/partners') {
        setCurrentView('admin-partners');
      } else if (normalizedPath === 'articles') {
        setCurrentView('articles-list');
        setSelectedCategory(null);
        setSelectedArticle(null);
      } else if (normalizedPath === 'actualites') {
        setCurrentView('actualites');
      } else if (normalizedPath === 'faq') {
        setCurrentView('faq');
      } else if (normalizedPath === 'comprendre-les-scpi') {
        setCurrentView('comprendre');
      } else if (normalizedPath === 'qui-sommes-nous') {
        setCurrentView('about-us');
        setSelectedCategory(null);
        setSelectedArticle(null);
        setSelectedLandingPage(null);
        setSelectedScpiKey(null);
        setSelectedThematicPage(null);
      } else if (normalizedPath === 'reclamation') {
        setCurrentView('reclamation');
      } else if (normalizedPath === 'conditions-utilisation') {
        setCurrentView('conditions');
      } else if (normalizedPath === 'expertise-orias-cif') {
        setCurrentView('expertise-orias');
      } else if (normalizedPath === 'methodologie-donnees-scpi') {
        setCurrentView('methodologie-donnees');
      } else if (normalizedPath === 'avertissements-risques-scpi') {
        setCurrentView('avertissements-risques');
      } else if (normalizedPath === 'investir-en-scpi') {
        setCurrentView('investir-scpi');
      } else if (normalizedPath === 'rendement-scpi') {
        setCurrentView('rendement-scpi');
      } else if (normalizedPath === 'fiscalite-scpi') {
        setCurrentView('fiscalite-scpi');
      } else if (normalizedPath === 'tof-scpi') {
        setCurrentView('tof-scpi');
      } else if (normalizedPath === 'capitalisation-scpi') {
        setCurrentView('capitalisation-scpi');
      } else if (normalizedPath === 'decote-valeur-reconstitution-scpi') {
        setCurrentView('decote-valeur-reconstitution-scpi');
      } else if (normalizedPath === 'endettement-scpi') {
        setCurrentView('endettement-scpi');
      } else if (normalizedPath === 'rendement-net-scpi') {
        setCurrentView('rendement-net-scpi');
      } else if (normalizedPath === 'scpi-demembrement') {
        setCurrentView('scpi-demembrement');
      } else if (normalizedPath === 'scpi-assurance-vie') {
        setCurrentView('scpi-assurance-vie');
      } else if (normalizedPath === 'scpi-tmi-11') {
        setCurrentView('scpi-tmi-11');
      } else if (normalizedPath === 'scpi-tmi-30') {
        setCurrentView('scpi-tmi-30');
      } else if (normalizedPath === 'frais-scpi') {
        setCurrentView('frais-scpi');
      } else if (normalizedPath === 'risques-scpi') {
        setCurrentView('risques-scpi');
      } else if (normalizedPath === 'liquidite-scpi') {
        setCurrentView('liquidite-scpi');
      } else if (normalizedPath === 'baisse-prix-part-scpi') {
        setCurrentView('baisse-prix-part-scpi');
      } else if (normalizedPath === 'delai-jouissance-scpi') {
        setCurrentView('delai-jouissance-scpi');
      } else if (normalizedPath === 'report-a-nouveau-scpi') {
        setCurrentView('report-a-nouveau-scpi');
      } else if (normalizedPath === 'choisir-scpi') {
        setCurrentView('choisir-scpi');
      } else if (normalizedPath === 'meilleures-scpi-attention') {
        setCurrentView('meilleures-scpi-attention');
      } else if (normalizedPath === 'comparateur-scpi-fiable') {
        setCurrentView('comparateur-scpi-fiable');
      } else if (normalizedPath === 'allocation-scpi') {
        setCurrentView('allocation-scpi');
      } else if (normalizedPath === 'combien-investir-scpi') {
        setCurrentView('combien-investir-scpi');
      } else if (normalizedPath === 'scpi-sante') {
        setCurrentView('scpi-sante');
      } else if (normalizedPath === 'scpi-logistique') {
        setCurrentView('scpi-logistique');
      } else if (normalizedPath === 'scpi-bureaux') {
        setCurrentView('scpi-bureaux');
      } else if (normalizedPath === 'scpi-commerce') {
        setCurrentView('scpi-commerce');
      } else if (normalizedPath === 'scpi-diversifiees') {
        setCurrentView('scpi-diversifiees');
      } else if (normalizedPath === 'societes-de-gestion-scpi') {
        setCurrentView('societes-de-gestion-scpi');
      } else if (normalizedPath.startsWith('societe-gestion/') && !normalizedPath.startsWith('societe-gestion-scpi')) {
        const mgmtSegments = normalizedPath.split('/');
        const mgmtSlug = mgmtSegments[1];
        if (mgmtSlug && managementCompanyConfigs.find(c => c.slug === mgmtSlug)) {
          setManagementCompanySlug(mgmtSlug);
          setCurrentView('societe-gestion-article');
        } else {
          setCurrentView('societe-gestion-scpi');
        }
      } else if (normalizedPath === 'societe-gestion-scpi') {
        setCurrentView('societe-gestion-scpi');
      } else if (normalizedPath === 'gestionnaire-scpi') {
        setCurrentView('gestionnaire-scpi');
      } else if (normalizedPath === 'gestionnaires-acteurs-scpi') {
        setCurrentView('gestionnaires-acteurs-scpi');
      } else if (normalizedPath === 'cgp-cif-scpi') {
        setCurrentView('cgp-cif-scpi');
      } else if (normalizedPath === 'psi-scpi') {
        setCurrentView('psi-scpi');
      } else if (normalizedPath === 'retrocommissions-scpi') {
        setCurrentView('retrocommissions-scpi');
      } else if (normalizedPath === 'scpi-fiscalite') {
        setCurrentView('scpi-fiscalite');
      } else if (normalizedPath === 'scpi-tmi-41') {
        setCurrentView('scpi-tmi-41');
      } else if (normalizedPath === 'scpi-tmi-45') {
        setCurrentView('scpi-tmi-45');
      } else if (normalizedPath === 'scpi-revenus-etrangers') {
        setCurrentView('scpi-revenus-etrangers');
      } else if (normalizedPath === 'scpi-revenus-fonciers') {
        setCurrentView('scpi-revenus-fonciers');
      } else if (normalizedPath === 'scpi-prelevements-sociaux') {
        setCurrentView('scpi-prelevements-sociaux');
      } else if (normalizedPath === 'scpi-credit-impot') {
        setCurrentView('scpi-credit-impot');
      } else if (normalizedPath === 'scpi-taux-effectif') {
        setCurrentView('scpi-taux-effectif');
      } else if (normalizedPath === 'scpi-ifi') {
        setCurrentView('scpi-ifi');
      } else if (normalizedPath === 'scpi-sci-is-fiscalite') {
        setCurrentView('scpi-sci-is-fiscalite');
      } else if (normalizedPath === 'amf-scpi') {
        setCurrentView('amf-scpi');
      } else if (normalizedPath === 'orias-scpi') {
        setCurrentView('orias-scpi');
      } else if (normalizedPath === 'documents-reglementaires-scpi') {
        setCurrentView('documents-reglementaires-scpi');
      } else if (normalizedPath === 'dic-scpi') {
        setCurrentView('dic-scpi');
      } else if (normalizedPath === 'note-information-scpi') {
        setCurrentView('note-information-scpi');
      } else if (normalizedPath === 'scpi-credit') {
        setCurrentView('scpi-credit');
      } else if (normalizedPath === 'scpi-comptant') {
        setCurrentView('scpi-comptant');
      } else if (normalizedPath === 'scpi-retraite') {
        setCurrentView('scpi-retraite');
      } else if (normalizedPath === 'scpi-revenus-complementaires') {
        setCurrentView('scpi-revenus-complementaires');
      } else if (normalizedPath === 'scpi-transmission') {
        setCurrentView('scpi-transmission');
      } else if (normalizedPath === 'scpi-france') {
        setCurrentView('scpi-france');
      } else if (normalizedPath === 'acheter-scpi') {
        setCurrentView('acheter-scpi');
      } else if (normalizedPath.startsWith('comparateur/scpi/')) {
        const scpiSlug = normalizedPath.replace('comparateur/scpi/', '');
        if (scpiSlug) {
          setSelectedScpiKey(scpiSlug);
          setCurrentView('scpi-detail');
        }
      } else if (normalizedPath === 'parcours-guide' || normalizedPath === 'guided-journey' || normalizedPath.startsWith('parcours-guide/')) {
        setCurrentView('guided-journey');
      } else if (normalizedPath === 'simulateur-fonds-euros-scpi') {
        setCurrentView('life-to-scpi');
      } else if (normalizedPath === 'simulateur-revenus-nets-scpi') {
        setCurrentView('simulateur-revenus-nets');
      } else if (normalizedPath === 'simulateur-credit-scpi') {
        setCurrentView('simulateur-credit');
      } else if (normalizedPath === 'simulateur-demembrement-scpi') {
        setCurrentView('simulateur-demembrement');
      } else if (normalizedPath === 'simulateur-enveloppes-scpi') {
        setCurrentView('simulateur-enveloppes');
      } else if (normalizedPath === 'simulateur-tresorerie-is') {
        setCurrentView('simulateur-tresorerie-is');
      } else if (normalizedPath === 'simulateur-impact-fiscal-scpi') {
        setCurrentView('simulateur-impact-fiscal');
      } else if (normalizedPath === 'simulateurs') {
        setCurrentView('simulateurs');
      } else if (normalizedPath === 'simulateur-profil-investisseur') {
        setCurrentView('simulateur-profil-investisseur');
      } else if (normalizedPath === 'comparateur-demembrement-scpi') {
        setCurrentView('comparateur-demembrement');
      } else if (normalizedPath === 'actualites') {
        setCurrentView('actualites');
      } else if (normalizedPath === 'articles') {
        setCurrentView('articles-list');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Lazy load SCPI data (275 Ko) only when needed
  useEffect(() => {
    // Load data if user is on home page or comparator view
    if (currentView === 'home' || currentView === 'landing' || currentView === 'scpi-detail' || currentView === 'thematic' || currentView === 'thematic-optimized' || currentView === 'scpi-static') {
      import('./data/scpiData').then(module => {
        setScpiData(module.scpiData);
      });
    }
  }, [currentView]);


  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleScpiAnalysis = (scpi: Scpi) => {
    setSelectedScpiForAnalysis(scpi);
    setIsAnalysisModalOpen(true);
  };

  const handleObjectiveSelect = (objective: ObjectiveType, tmi: number) => {
    const result = applyObjective(objective, tmi, scpiData);

    // Clear current selection and add recommended SCPI
    result.selectedScpi.forEach(scpi => {
      if (!selectedScpi.find(s => s.id === scpi.id)) {
        toggleScpiSelection(scpi);
      }
    });

    alert(`✅ ${result.selectedScpi.length} SCPI recommandées ajoutées selon votre objectif "${objective}" et TMI ${tmi}%`);
  };

  // Helper function pour standardiser la navigation
  const navigateToView = (view: string, path: string, options?: {
    selectedCategory?: string | null;
    selectedArticle?: Article | null;
    selectedLandingPage?: string | null;
    selectedScpiKey?: string | null;
    selectedThematicPage?: string | null;
    currentArticleSlug?: string | null;
  }) => {
    console.log('[Navigation] navigateToView appelé:', { view, path, options });
    
    // Mettre à jour la vue immédiatement
    setCurrentView(view as any);
    
    // Nettoyer ou mettre à jour les états
    setSelectedCategory(options?.selectedCategory ?? null);
    setSelectedArticle(options?.selectedArticle ?? null);
    setSelectedLandingPage(options?.selectedLandingPage ?? null);
    setSelectedScpiKey(options?.selectedScpiKey ?? null);
    setSelectedThematicPage(options?.selectedThematicPage ?? null);
    if (options?.currentArticleSlug !== undefined) {
      setCurrentArticleSlug(options.currentArticleSlug);
    }
    
    // Mettre à jour l'URL
    window.history.pushState({}, '', path);
    console.log('[Navigation] pushState appelé, nouvelle URL:', window.location.pathname);
    
    // Déclencher le popstate event pour synchroniser avec le custom useLocation hook
    setTimeout(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
      console.log('[Navigation] popstate event dispatché');
    }, 0);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToApp = (path: string) => {
    const cleanPath = path.replace(/^\/|\/$/, '');
    const segments = cleanPath.split('/');
    if (segments[0] !== 'app' && segments[0] !== 'espace') {
      navigateToView('app-entry', '/app');
      return;
    }
    const section = segments[1];
    const sub = segments[2];
    const id = segments[3];
    if (!section) {
      navigateToView('app-entry', '/app');
      return;
    }
    if (section === 'login') {
      navigateToView('app-login', '/app/login');
      return;
    }
    if (section === 'signup' || section === 'request-access') {
      navigateToView('app-request-access', '/app/request-access');
      return;
    }
    if (section === 'onboarding') {
      navigateToView('app-onboarding', '/app/onboarding');
      return;
    }
    if (section === 'claim') {
      navigateToView('app-claim', '/app/claim');
      return;
    }
    if (section === 'set-password') {
      navigateToView('app-set-password', '/app/set-password');
      return;
    }
    if (section === 'setup') {
      navigateToView('app-setup', '/app/setup');
      return;
    }
    if (section === 'client') {
      if (sub === 'dossiers' && id) {
        setAppCaseId(id);
        navigateToView('app-client-case', `/app/client/dossiers/${id}`);
        return;
      }
      if (sub === 'dossiers') {
        navigateToView('app-client-cases', '/app/client/dossiers');
        return;
      }
      navigateToView('app-client', '/app/client');
      return;
    }
    if (section === 'partner') {
      if (sub === 'clients' && id) {
        setAppClientId(id);
        navigateToView('app-partner-client', `/app/partner/clients/${id}`);
        return;
      }
      if (sub === 'clients') {
        navigateToView('app-partner-clients', '/app/partner/clients');
        return;
      }
      if (sub === 'dossiers' && id) {
        setAppCaseId(id);
        navigateToView('app-partner-case', `/app/partner/dossiers/${id}`);
        return;
      }
      navigateToView('app-partner', '/app/partner');
      return;
    }
    if (section === 'admin') {
      if (sub === 'access-requests') {
        navigateToView('app-admin-requests', '/app/admin/access-requests');
        return;
      }
      navigateToView('app-admin', '/app/admin');
      return;
    }
    navigateToView('app-entry', '/app');
  };

  const handleEducationClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('category');
    window.scrollTo(0, 0);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    setSelectedArticle(null);
    setSelectedLandingPage(null);
    // Utiliser replaceState au lieu de pushState pour éviter les problèmes de mutation
    // et ne pas ajouter d'entrée à l'historique
    try {
      window.history.replaceState(null, '', '/');
    } catch (error) {
      // Fallback: utiliser window.location si replaceState échoue
      window.location.href = '/';
      return;
    }
    window.scrollTo(0, 0);
  };

  const handleArticlesClick = () => {
    console.log('[Navigation] handleArticlesClick appelé');
    navigateToView('articles-list', '/articles');
  };

  const handleActualitesClick = () => {
    navigateToView('actualites', '/actualites');
  };

  const handleDynamicArticleClick = (slug: string) => {
    navigateToView('dynamic-article', `/${slug}`, {
      currentArticleSlug: slug
    });
  };

  const handleArticleFromListClick = (slug: string) => {

    // Rediriger la page hub sociétés de gestion
    if (slug === 'societes-de-gestion-scpi') {
      window.location.href = '/societes-de-gestion-scpi/';
      return;
    }

    // Rediriger la page portail gestionnaires & acteurs
    if (slug === 'gestionnaires-acteurs-scpi') {
      window.location.href = '/gestionnaires-acteurs-scpi/';
      return;
    }

    // Rediriger les articles société de gestion vers /societe-gestion/slug/
    if (managementCompanyConfigs.find(c => c.slug === slug)) {
      window.location.href = `/societe-gestion/${slug}`;
      return;
    }

    // Redirige vers /education/slug pour tous les articles du template config
    const articleTemplate = getTemplateBySlug(slug);
    if (articleTemplate) {
      window.location.href = `/education/${slug}`;
      return;
    }

    // Fallback to legacy system for old articles
    const article = getArticleBySlug(slug);
    if (article) {
      setSelectedArticle(article);
      setCurrentView('article');
      window.history.pushState({}, '', `/article/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToCategory = () => {
    setCurrentView('category');
    setSelectedArticle(null);
    window.scrollTo(0, 0);
  };

  const handleLandingPageClick = (slug: string) => {
    navigateToView('landing', `/${slug}`, {
      selectedLandingPage: slug
    });
  };

  const handleFaqClick = () => {
    navigateToView('faq', '/faq');
  };

  const handleAboutUsClick = () => {
    console.log('[Navigation] handleAboutUsClick appelé');
    navigateToView('about-us', '/qui-sommes-nous');
  };

  const handleComprendreClick = () => {
    navigateToView('comprendre', '/comprendre-les-scpi');
  };

  const handleGenericNavigation = (path: string) => {

    // Remove leading/trailing slashes
    const cleanPath = path.replace(/^\/|\/$/, '');

    // Map paths to views
    const pathMapping: Record<string, any> = {
      'expertise-orias-cif': 'expertise-orias',
      'methodologie-donnees-scpi': 'methodologie-donnees',
      'avertissements-risques-scpi': 'avertissements-risques',
      'investir-en-scpi': 'investir-scpi',
      'comprendre-les-scpi': 'comprendre',
      'faq': 'faq',
      'qui-sommes-nous': 'about-us',
      '': 'home'
    };

    // Use the mapped view if it exists, otherwise fall back to the path itself
    // (educational pages and other routes use their path as the currentView)
    const targetView = pathMapping[cleanPath] || cleanPath || 'home';
    navigateToView(targetView, path);
  };


  const handleSimulateurClick = (simulateurId: string) => {
    console.log('[Navigation] handleSimulateurClick appelé avec:', simulateurId);

    // Map simulateur IDs to views and routes
    const simulateurMapping: Record<string, { view: string; route: string }> = {
      'simulateurs': { view: 'simulateurs', route: '/simulateurs' },
      'fonds-euros-scpi': { view: 'life-to-scpi', route: '/simulateur-fonds-euros-scpi' },
      'revenus-nets': { view: 'simulateur-revenus-nets', route: '/simulateur-revenus-nets-scpi' },
      'credit': { view: 'simulateur-credit', route: '/simulateur-credit-scpi' },
      'demembrement': { view: 'simulateur-demembrement', route: '/simulateur-demembrement-scpi' },
      'enveloppes': { view: 'simulateur-enveloppes', route: '/simulateur-enveloppes-scpi' },
      'profil-investisseur': { view: 'simulateur-profil-investisseur', route: '/simulateur-profil-investisseur' },
      'tresorerie-is': { view: 'simulateur-tresorerie-is', route: '/simulateur-tresorerie-is' },
      'impact-fiscal': { view: 'simulateur-impact-fiscal', route: '/simulateur-impact-fiscal-scpi' },
      'comparateur-demembrement': { view: 'comparateur-demembrement', route: '/comparateur-demembrement-scpi' },
      // Questionnaire profil investisseur COMPLET (32 questions) = parcours guidé
      'questionnaire-complet': { view: 'guided-journey', route: '/parcours-guide' },
      // Quiz / pré-sélection rapide (questionnaire court)
      'quiz-rapide': { view: 'simulateur-profil-investisseur', route: '/simulateur-profil-investisseur' },
      // Comparateur SCPI principal
      'comparateur-scpi': { view: 'comparateur', route: '/comparateur-scpi' },
      // Futurs simulateurs
      // 'diversification': { view: 'simulateur-diversification', route: '/simulateur-diversification' },
      // 'rendement': { view: 'simulateur-rendement', route: '/simulateur-rendement' }
    };

    const mapping = simulateurMapping[simulateurId];
    if (mapping) {
      console.log('[Navigation] Mapping trouvé:', mapping);
      navigateToView(mapping.view, mapping.route);
    } else {
      console.error('[Navigation] Aucun mapping trouvé pour simulateurId:', simulateurId);
    }
  };

  const handleComparateurClick = () => {
    navigateToView('comparateur', '/comparateur-scpi');
  };


  const handleAnalyseArticleClick = (slug: string) => {
    navigateToView('fonds-euros-ou-scpi', `/${slug}`);
  };

  const handleScpiClick = (slug: string) => {
    // Vérifier si la SCPI existe dans scpiLandingPages (OptimizedScpiLandingPage)
    const scpiKey = Object.keys(scpiLandingPages).find(key => 
      scpiLandingPages[key].slug === slug || key === slug
    );
    
    if (scpiKey) {
      // Utiliser OptimizedScpiLandingPage avec le comparateur FintechComparator
      setSelectedScpiKey(scpiKey);
      setCurrentView('scpi-optimized');
    } else if (buildScpiLandingData(slug)) {
      // SCPI sans fiche éditoriale : template riche généré (même structure que /sofiprime)
      setSelectedScpiKey(slug);
      setCurrentView('scpi-optimized');
    } else {
      // Fallback ultime vers StaticScpiPage si le slug ne correspond à aucune SCPI connue
      setSelectedScpiKey(slug);
      setCurrentView('scpi-static');
    }
    
    setSelectedCategory(null);
    setSelectedArticle(null);
    setSelectedLandingPage(null);
    setSelectedThematicPage(null);
    window.history.pushState({}, '', `/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThematicPageClick = (slug: string) => {
    navigateToView('thematic-optimized', `/${slug}`, {
      selectedThematicPage: slug
    });
  };

  const handleUnderstandingClick = () => {
    navigateToView('comprendre', '/comprendre-les-scpi');
  };

  // handleStartSubscription doit être défini AVANT tous les returns conditionnels
  const handleStartSubscription = useCallback(async (scpiIds: number[]) => {
    try {
      // Charger les données SCPI si nécessaire
      let dataToUse = scpiData;
      if (dataToUse.length === 0) {
        const { scpiData: loadedData } = await import('./data/scpiData');
        dataToUse = loadedData;
        setScpiData(loadedData);
      }
      
      // Convertir les IDs en objets SCPI complets
      const selectedScpis = scpiIds
        .map(id => dataToUse.find(scpi => scpi.id === id))
        .filter((scpi): scpi is Scpi => scpi !== undefined);
      
      if (selectedScpis.length === 0) {
        console.error('❌ [App.tsx] Aucune SCPI trouvée pour les IDs:', scpiIds);
        return;
      }
      
      // Convertir en SCPIExtended pour le tunnel
      const { scpiDataExtended } = await import('./data/scpiDataExtended');
      const extendedScpis = selectedScpis
        .map(scpi => scpiDataExtended.find(ext => ext.id === scpi.id))
        .filter((scpi): scpi is typeof scpiDataExtended[0] => scpi !== undefined);
      
      if (extendedScpis.length === 0) {
        console.error('❌ [App.tsx] Aucune SCPI étendue trouvée pour les IDs:', scpiIds);
        return;
      }
      
      // Navigation vers /souscription avec les SCPI dans le state
      window.history.pushState({ scpis: extendedScpis }, '', '/souscription');
      
      // Déclencher le popstate event pour que le custom useLocation hook détecte le changement
      setTimeout(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 0);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('❌ [App.tsx] Erreur lors de l\'ouverture du tunnel de souscription:', error);
    }
  }, [scpiData]);

  const handleExportPDF = async () => {
    if (selectedScpi.length === 0) {
      alert('Veuillez sélectionner au moins une SCPI pour générer le PDF');
      return;
    }

    const { generatePortfolioPDF } = await import('./utils/pdfGenerator');
    const success = await generatePortfolioPDF(
      selectedScpi,
      investmentAmount,
      portfolioStats
    );

    if (success) {
      alert('PDF généré avec succès !');
    } else {
      alert('Erreur lors de la génération du PDF');
    }
  };

  // Helper function to render global modals
  const renderGlobalModals = () => (
    <Suspense fallback={null}>
      {isRdvModalOpen && (
        <RdvModal
          isOpen={isRdvModalOpen}
          onClose={() => setIsRdvModalOpen(false)}
          selectedScpi={selectedScpi}
        />
      )}

      {isAboutModalOpen && (
        <AboutModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />
      )}

      {isReviewsModalOpen && (
        <ReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
        />
      )}
    </Suspense>
  );

  const renderEducationalScpiPage = (
    seo: { title: string; description: string; keywords: string[]; canonical: string },
    Page: React.ComponentType<{ onNavigate?: (path: string) => void; onComparateurClick?: () => void }>
  ) => (
    <div className="min-h-screen bg-slate-950 text-white transition-colors duration-300 dark">
      <SEOHead title={seo.title} description={seo.description} keywords={seo.keywords} canonical={seo.canonical} />
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={() => setIsRdvModalOpen(true)}
        onAboutClick={handleAboutUsClick}
        onEducationClick={handleEducationClick}
        onLogoClick={handleBackToHome}
        onScpiPageClick={handleScpiClick}
        onFaqClick={handleFaqClick}
        onUnderstandingClick={handleComprendreClick}
        onAboutSectionClick={handleAboutUsClick}
        onAboutNavigation={handleGenericNavigation}
        onComparateurClick={handleComparateurClick}
        onSimulateurClick={handleSimulateurClick}
        onArticlesClick={handleArticlesClick}
        onActualitesClick={handleActualitesClick}
        currentView={currentView}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Page onNavigate={handleGenericNavigation} onComparateurClick={handleComparateurClick} />
      </Suspense>
      <Footer />
      {renderGlobalModals()}
    </div>
  );

  if (currentView.startsWith('app-')) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SEOHead title="Espace privé | MaximusSCPI" description="Espace privé MaximusSCPI" noIndex />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>}>
          {currentView === 'app-entry' && <AppEntry onNavigate={navigateToApp} />}
          {currentView === 'app-login' && <AppLogin onNavigate={navigateToApp} />}
          {currentView === 'app-request-access' && <AppSignup onNavigate={navigateToApp} />}
          {currentView === 'app-claim' && <AppClaim onNavigate={navigateToApp} />}
          {currentView === 'app-set-password' && <SetPassword />}
          {currentView === 'app-setup' && <SetupPage />}
          {currentView === 'app-onboarding' && (
            <AuthGuard onRedirect={navigateToApp}>
              <AppOnboarding onNavigate={navigateToApp} />
            </AuthGuard>
          )}
          {currentView === 'app-client' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['client']} onRedirect={navigateToApp}>
                <ClientDashboard onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-client-cases' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['client']} onRedirect={navigateToApp}>
                <ClientCases onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-client-case' && appCaseId && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['client']} onRedirect={navigateToApp}>
                <ClientCaseDetail caseId={appCaseId} onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-partner' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['partner']} onRedirect={navigateToApp}>
                <PartnerDashboard onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-partner-clients' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['partner']} onRedirect={navigateToApp}>
                <PartnerClients onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-partner-client' && appClientId && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['partner']} onRedirect={navigateToApp}>
                <PartnerClientDetail clientId={appClientId} onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-partner-case' && appCaseId && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['partner']} onRedirect={navigateToApp}>
                <PartnerCaseDetail caseId={appCaseId} onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-admin' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['admin']} onRedirect={navigateToApp}>
                <AdminDashboard onNavigate={navigateToApp} />
              </RoleGuard>
            </AuthGuard>
          )}
          {currentView === 'app-admin-requests' && (
            <AuthGuard onRedirect={navigateToApp}>
              <RoleGuard roles={['admin']} onRedirect={navigateToApp}>
                <AdminAccessRequests />
              </RoleGuard>
            </AuthGuard>
          )}
        </Suspense>
      </div>
    );
  }

  if (currentView === 'partenaire-cabinet') {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <PartenaireCabinet />
        </Suspense>
        <Footer />
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'admin-partners') {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPartners />
        </Suspense>
      </div>
    );
  }

  // Render Test Sender React view
  if (currentView === 'test-sender-react') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <TestSenderReact />
        </Suspense>
      </div>
    );
  }

  // Render Life To SCPI Simulator
  if (currentView === 'life-to-scpi') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <LifeToScpiPage />
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Net Income Simulator
  if (currentView === 'simulateur-revenus-nets') {
    const seo = simulatorSeoConfig['simulateur-revenus-nets'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-revenus-nets')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiNetIncomeSimulator
            defaultAmount={50000}
            defaultYield={5}
            defaultTmi={30}
            onCtaClick={() => setIsRdvModalOpen(true)}
          />
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Credit Simulator
  if (currentView === 'simulateur-credit') {
    const seo = simulatorSeoConfig['simulateur-credit'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-credit')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiCreditSimulator
            defaultAmount={100000}
            defaultApport={20000}
            defaultRate={3.5}
            defaultDuration={20}
            onCtaClick={() => setIsRdvModalOpen(true)}
          />
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Demembrement Simulator
  if (currentView === 'simulateur-demembrement') {
    const seo = simulatorSeoConfig['simulateur-demembrement'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-demembrement')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>}>
          <ErrorBoundary>
            <ScpiDemembrementSimulator
              defaultMontant={0}
              defaultDuree={10}
              defaultRendement={5.0}
              onCtaClick={() => setIsRdvModalOpen(true)}
            />
          </ErrorBoundary>
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Envelope Comparator Simulator
  if (currentView === 'simulateur-enveloppes') {
    const seo = simulatorSeoConfig['simulateur-enveloppes'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-enveloppes')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>}>
          <ErrorBoundary>
            <ScpiEnvelopeComparator
              defaultAmount={100000}
              defaultYield={5}
              defaultDuration={15}
              onCtaClick={() => setIsRdvModalOpen(true)}
            />
          </ErrorBoundary>
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'simulateur-tresorerie-is') {
    const seo = simulatorSeoConfig['simulateur-tresorerie-is'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-tresorerie-is')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <SimulateurTresorerieIS />
        </Suspense>
        <Footer />
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'simulateur-impact-fiscal') {
    const seo = simulatorSeoConfig['simulateur-impact-fiscal'];
    return (
      <div className="min-h-screen bg-slate-950 transition-colors duration-300 dark">
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-impact-fiscal')} />
        <Header
          isDarkMode={true}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <SimulateurImpactFiscal />
        </Suspense>
        <Footer />
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'simulateurs') {
    const seo = simulatorSeoConfig['simulateurs'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateurs')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <SimulateursHub />
        </Suspense>
        <Footer />
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Profil Investisseur Simulator
  if (currentView === 'simulateur-profil-investisseur') {
    const seo = simulatorSeoConfig['simulateur-profil-investisseur'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('simulateur-profil-investisseur')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <InvestorProfileSimulator />
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Comparateur Démembrement SCPI
  if (currentView === 'comparateur-demembrement') {
    const seo = simulatorSeoConfig['comparateur-demembrement'];
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead title={seo.title} description={seo.description} canonical={seo.canonical} schemaData={getSimulatorSchemaData('comparateur-demembrement')} />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>}>
          <ErrorBoundary>
            <ComparateurDemembrementScpi />
          </ErrorBoundary>
        </Suspense>
        <Footer />
        <CookieConsent />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render FAQ view
  if (currentView === 'faq') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <FAQPage />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'expertise-orias') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ExpertiseOriasPage onNavigate={handleGenericNavigation} />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'methodologie-donnees') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <MethodologieDonneesPage onNavigate={handleGenericNavigation} />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'avertissements-risques') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <AvertissementsRisquesPage onNavigate={handleGenericNavigation} />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render SCPI Secteurs Hub
  if (currentView === 'scpi-secteurs-hub') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiSecteursHubPage />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render SCPI Gestionnaires Hub
  if (currentView === 'scpi-gestionnaires-hub') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiGestionnairesHubPage />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render SCPI Objectifs Hub
  if (currentView === 'scpi-objectifs-hub') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiObjectifsHubPage />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Page Pivot SCPI Européennes
  if (currentView === 'scpi-europeennes-hub') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI européennes : fiscalité, rendement net et diversification',
        description:
          'Comprenez les avantages et limites des SCPI européennes : fiscalité, rendement net, diversification géographique, TOF, capitalisation, endettement et risques à analyser.',
        keywords: ['SCPI européennes', 'fiscalité SCPI européennes', 'rendement net SCPI', 'diversification SCPI', 'SCPI Allemagne', 'SCPI internationale'],
        canonical: 'https://maximusscpi.com/scpi-europeennes/',
      },
      ScpiEuropeennesPage
    );
  }

  // Render About Us view
  if (currentView === 'about-us') {
    console.log('✅ [App.tsx] Rendu de la vue about-us');
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <AboutUsPage />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Reclamation view
  if (currentView === 'reclamation') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ReclamationPage />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Conditions Utilisation view
  if (currentView === 'conditions') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ConditionsUtilisationPage />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render Articles List Page
  if (currentView === 'articles-list') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Suspense fallback={<LoadingSpinner />}>
          <EducationArticlesIndexPage
            onArticleClick={handleArticleFromListClick}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onContactClick={() => setIsRdvModalOpen(true)}
            onAboutClick={handleAboutUsClick}
            onLogoClick={handleBackToHome}
            onFaqClick={handleFaqClick}
            onScpiPageClick={handleScpiClick}
            onUnderstandingClick={handleComprendreClick}
            onAboutSectionClick={handleAboutUsClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onEducationClick={handleEducationClick}
          />
        </Suspense>
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Actualites Page
  if (currentView === 'actualites') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Suspense fallback={<LoadingSpinner />}>
          <ActualitesPage
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onContactClick={() => setIsRdvModalOpen(true)}
            onAboutClick={handleAboutUsClick}
            onLogoClick={handleBackToHome}
            onFaqClick={handleFaqClick}
            onScpiPageClick={handleScpiClick}
            onUnderstandingClick={handleComprendreClick}
            onAboutSectionClick={handleAboutUsClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onEducationClick={handleEducationClick}
          />
        </Suspense>
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Article Generator (Admin)
  if (currentView === 'article-generator') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ArticleGeneratorPage
          onNavigateHome={handleBackToHome}
          onNavigateToFaq={handleFaqClick}
          onNavigateToAbout={handleAboutUsClick}
          onNavigateToUnderstanding={handleComprendreClick}
          onContactClick={() => setIsRdvModalOpen(true)}
          onSimulateurClick={handleSimulateurClick}
          onComparateurClick={handleComparateurClick}
        />
      </Suspense>
    );
  }


  // Render Dynamic Article (New System)
  if (currentView === 'dynamic-article' && currentArticleSlug) {
    // Articles optimisés chargés depuis Supabase
    const optimizedArticles = ['fonds-euros-ou-scpi', 'scpi-en-direct-ou-assurance-vie'];

    if (optimizedArticles.includes(currentArticleSlug)) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <OptimizedArticlePage slug={currentArticleSlug} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicArticlePage slug={currentArticleSlug} />
      </Suspense>
    );
  }

  // Render Fonds Euros ou SCPI Article (Legacy)
  if (currentView === 'fonds-euros-ou-scpi') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <FondsEurosScpiArticle
          onNavigateHome={handleBackToHome}
          onNavigateToFaq={handleFaqClick}
          onNavigateToAbout={handleAboutUsClick}
          onNavigateToUnderstanding={handleComprendreClick}
          onContactClick={() => setIsRdvModalOpen(true)}
          onSimulateurClick={handleSimulateurClick}
          onComparateurClick={handleComparateurClick}
        />
      </Suspense>
    );
  }

  // === RENDER 30 ARTICLES ÉDUCATION SCPI ===

  if (currentView === 'article-fonds-euros-ou-scpi') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <FondsEurosOuScpiArticle />
          </Suspense>
        </main>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'article-scpi-direct-av') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <ScpiDirectOuAssuranceVie />
          </Suspense>
        </main>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Template simplifié pour les 28 autres articles
  const articleViews: Record<string, any> = {
    'article-cout-opportunite-100k': CoutOpportunite100kEuros,
    'article-portfolio-200k': Portfolio200kEurosScpi,
    'article-scpi-vs-locatif': ScpiOuImmobilierLocatif,
    'article-scpi-credit': ScpiACredit,
    'article-demembrement': DemembrementScpi,
    'article-scpi-tmi-11': ScpiTmi11,
    'article-scpi-tmi-30': ScpiTmi30,
    'article-scpi-tmi-41': ScpiTmi41,
    'article-scpi-europeennes': ScpiEuropeennes,
    'article-scpi-fiscales': ScpiFiscales,
    'article-scpi-sante': ScpiSante,
    'article-scpi-bureaux': ScpiBureaux,
    'article-scpi-commerces': ScpiCommerces,
    'article-scpi-logistique': ScpiLogistique,
    'article-scpi-residentielles': ScpiResidentielles,
    'article-per-scpi': PerScpi,
    'article-sci-scpi': SciScpi,
    'article-ifi-scpi': IfiScpi,
    'article-succession-scpi': SuccessionScpi,
    'article-diversification-scpi': DiversificationScpi,
    'article-rendement-scpi-2025': RendementScpi2025,
    'article-risques-scpi': RisquesScpi,
    'article-frais-scpi': FraisScpi,
    'article-revente-scpi': ReventeScpi,
    'article-scpi-vs-etf': ScpiOuEtf,
    'article-scpi-vs-opci': ScpiOuOpci,
    'article-premier-investissement': PremierInvestissementScpi,
    'article-scpi-jeune-actif': ScpiJeuneActif
  };

  if (articleViews[currentView]) {
    const ArticleComponent = articleViews[currentView];
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <ArticleComponent />
          </Suspense>
        </main>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // === FIN RENDER 30 ARTICLES ===

  // Render Page Pivot Fiscalité SCPI
  if (currentView === 'fiscalite-scpi') {
    return (
      <div className="min-h-screen bg-slate-950 text-white transition-colors duration-300 dark">
        <SEOHead
          title="Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers | MaximusSCPI"
          description="Revenus fonciers, prélèvements sociaux (17,2 %), SCPI européennes, optimisation fiscale (assurance-vie, PER, démembrement) : tout comprendre sur la fiscalité des SCPI. Données pédagogiques, non personnalisées."
          keywords={['fiscalité SCPI', 'revenus fonciers SCPI', 'imposition SCPI', 'prélèvements sociaux SCPI', 'optimisation fiscale SCPI', 'SCPI européennes fiscalité', 'TMI SCPI']}
          canonical="https://maximusscpi.com/fiscalite-scpi/"
        />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <FiscaliteScpiPage
            onNavigate={handleGenericNavigation}
            onRdvClick={() => setIsRdvModalOpen(true)}
            onComparateurClick={handleComparateurClick}
          />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Page Pivot TOF SCPI
  if (currentView === 'tof-scpi') {
    return (
      <div className="min-h-screen bg-slate-950 text-white transition-colors duration-300 dark">
        <SEOHead
          title="TOF SCPI : définition, calcul et analyse avant d'investir"
          description="Comprenez le TOF d'une SCPI, ses limites et les critères à croiser : rendement, capitalisation, endettement, décote, frais et fiscalité."
          keywords={['TOF SCPI', 'taux occupation financier SCPI', 'occupation locative SCPI', 'analyse SCPI', 'comparateur SCPI TOF']}
          canonical="https://maximusscpi.com/tof-scpi/"
        />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <TOFScpiPage
            onNavigate={handleGenericNavigation}
            onComparateurClick={handleComparateurClick}
          />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'capitalisation-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Capitalisation SCPI : définition, seuils et analyse avant d\'investir',
        description:
          'Comprenez la capitalisation d\'une SCPI, ses seuils, ses limites et les critères à croiser : TOF, rendement, endettement, décote, frais et diversification.',
        keywords: ['capitalisation SCPI', 'taille SCPI', 'analyse SCPI', 'diversification SCPI', 'comparateur SCPI'],
        canonical: 'https://maximusscpi.com/capitalisation-scpi/',
      },
      CapitalisationScpiPage
    );
  }

  if (currentView === 'decote-valeur-reconstitution-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Décote SCPI et valeur de reconstitution : comprendre avant d\'investir',
        description:
          'Découvrez comment analyser la décote ou surcote d\'une SCPI par rapport à sa valeur de reconstitution, et pourquoi ce critère doit être croisé avec TOF, rendement, capitalisation et endettement.',
        keywords: ['décote SCPI', 'surcote SCPI', 'valeur de reconstitution', 'prix souscription SCPI', 'analyse SCPI'],
        canonical: 'https://maximusscpi.com/decote-valeur-reconstitution-scpi/',
      },
      DecoteValeurReconstitutionScpiPage
    );
  }

  if (currentView === 'endettement-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Endettement SCPI : seuils, risques et analyse avant d\'investir',
        description:
          'Comprenez l\'endettement d\'une SCPI, ses effets sur la performance, le risque de taux, la liquidité et les critères à croiser avant d\'investir.',
        keywords: ['endettement SCPI', 'dette SCPI', 'levier SCPI', 'risque taux SCPI', 'analyse SCPI'],
        canonical: 'https://maximusscpi.com/endettement-scpi/',
      },
      EndettementScpiPage
    );
  }

  if (currentView === 'rendement-net-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Rendement net SCPI : brut, net fiscal, frais et analyse avant d\'investir',
        description:
          'Comprenez la différence entre rendement brut et rendement net d\'une SCPI, l\'impact de la fiscalité, des frais, des SCPI européennes et du démembrement.',
        keywords: ['rendement net SCPI', 'TDVM SCPI', 'fiscalité SCPI', 'rendement brut SCPI', 'comparateur SCPI'],
        canonical: 'https://maximusscpi.com/rendement-net-scpi/',
      },
      RendementNetScpiPage
    );
  }

  if (currentView === 'scpi-demembrement') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI en démembrement : fiscalité, décote, durée et stratégie patrimoniale',
        description:
          'Comprenez le démembrement de SCPI : nue-propriété, usufruit, décote, fiscalité, durée, absence de revenus temporaires et critères à analyser avant d\'investir.',
        keywords: ['démembrement SCPI', 'nue-propriété SCPI', 'usufruit SCPI', 'décote SCPI', 'fiscalité SCPI'],
        canonical: 'https://maximusscpi.com/scpi-demembrement/',
      },
      DemembrementScpiPage
    );
  }

  if (currentView === 'scpi-assurance-vie') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI en assurance-vie : fiscalité, frais, rendement et limites',
        description:
          'Comprenez l\'intérêt des SCPI en assurance-vie : fiscalité, liquidité, frais du contrat, choix limité, rendement reversé et critères à comparer avant d\'investir.',
        keywords: ['SCPI assurance-vie', 'unité de compte SCPI', 'fiscalité assurance-vie', 'UC SCPI', 'frais gestion UC'],
        canonical: 'https://maximusscpi.com/scpi-assurance-vie/',
      },
      AssuranceVieScpiPage
    );
  }

  if (currentView === 'scpi-tmi-11') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI TMI 11 % : fiscalité, rendement net et SCPI européennes',
        description:
          'Comprenez comment analyser les SCPI avec une tranche marginale d\'imposition à 11 % : rendement net, SCPI européennes, fiscalité, frais et diversification.',
        keywords: ['SCPI TMI 11', 'fiscalité SCPI', 'rendement net SCPI', 'SCPI européennes', 'prélèvements sociaux'],
        canonical: 'https://maximusscpi.com/scpi-tmi-11/',
      },
      Tmi11ScpiPage
    );
  }

  if (currentView === 'scpi-tmi-30') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI TMI 30 % : rendement net, fiscalité et stratégies à analyser',
        description:
          'Comprenez les critères d\'analyse des SCPI avec une TMI à 30 % : fiscalité des revenus fonciers, SCPI européennes, démembrement, assurance-vie et rendement net.',
        keywords: ['SCPI TMI 30', 'fiscalité SCPI', 'rendement net', 'SCPI européennes', 'démembrement SCPI'],
        canonical: 'https://maximusscpi.com/scpi-tmi-30/',
      },
      Tmi30ScpiPage
    );
  }

  if (currentView === 'frais-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Frais SCPI : souscription, gestion, arbitrage et rendement net',
        description:
          'Comprenez les frais des SCPI : frais de souscription, gestion, cession, assurance-vie, frais indirects et impact sur le rendement net.',
        keywords: ['frais SCPI', 'frais souscription SCPI', 'frais gestion SCPI', 'rendement net SCPI', 'frais UC'],
        canonical: 'https://maximusscpi.com/frais-scpi/',
      },
      FraisScpiPage
    );
  }

  if (currentView === 'risques-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Risques SCPI : comprendre les risques avant d\'investir',
        description:
          'Comprenez les principaux risques des SCPI : perte en capital, liquidité limitée, revenus non garantis, baisse du prix de part, fiscalité, endettement et risque immobilier.',
        keywords: ['risques SCPI', 'perte en capital SCPI', 'liquidité SCPI', 'baisse prix de part SCPI', 'SCPI risque'],
        canonical: 'https://maximusscpi.com/risques-scpi/',
      },
      RisquesScpiPage
    );
  }

  if (currentView === 'liquidite-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Liquidité SCPI : revente, délais et risques à connaître',
        description:
          'Comprenez la liquidité des SCPI : revente des parts, délai de retrait, marché secondaire, capital variable, capital fixe et risques en cas de besoin rapide de trésorerie.',
        keywords: ['liquidité SCPI', 'revente parts SCPI', 'délai retrait SCPI', 'capital variable SCPI', 'marché secondaire SCPI'],
        canonical: 'https://maximusscpi.com/liquidite-scpi/',
      },
      LiquiditeScpiPage
    );
  }

  if (currentView === 'baisse-prix-part-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Baisse prix de part SCPI : causes, risques et analyse',
        description:
          'Comprenez pourquoi une SCPI peut baisser son prix de part : valeur du patrimoine, marché immobilier, taux, expertises, décote, surcote et conséquences pour l\'investisseur.',
        keywords: ['baisse prix de part SCPI', 'prix part SCPI', 'valeur reconstitution SCPI', 'surcote SCPI', 'expertise SCPI'],
        canonical: 'https://maximusscpi.com/baisse-prix-part-scpi/',
      },
      BaissePrixPartScpiPage
    );
  }

  if (currentView === 'delai-jouissance-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Délai de jouissance SCPI : comprendre son impact sur les revenus',
        description:
          'Comprenez le délai de jouissance d\'une SCPI, son effet sur les premiers revenus, le rendement réel la première année et les critères à comparer avant d\'investir.',
        keywords: ['délai jouissance SCPI', 'date jouissance SCPI', 'premiers revenus SCPI', 'rendement SCPI', 'souscription SCPI'],
        canonical: 'https://maximusscpi.com/delai-jouissance-scpi/',
      },
      DelaiJouissanceScpiPage
    );
  }

  if (currentView === 'report-a-nouveau-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Report à nouveau SCPI : définition, utilité et limites',
        description:
          'Comprenez le report à nouveau d\'une SCPI : réserve de distribution, capacité d\'amortissement, limites, rendement, TOF et critères à croiser avant d\'investir.',
        keywords: ['report à nouveau SCPI', 'RAN SCPI', 'réserve distribution SCPI', 'lissage distribution SCPI', 'analyse SCPI'],
        canonical: 'https://maximusscpi.com/report-a-nouveau-scpi/',
      },
      ReportANouveauScpiPage
    );
  }

  if (currentView === 'choisir-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Comment choisir une SCPI : critères, fiscalité, risques et rendement',
        description:
          'Découvrez comment choisir une SCPI avec une méthode structurée : rendement, TOF, capitalisation, frais, fiscalité, décote, endettement, liquidité et diversification.',
        keywords: ['choisir SCPI', 'méthode choix SCPI', 'critères SCPI', 'analyser SCPI', 'comparer SCPI'],
        canonical: 'https://maximusscpi.com/choisir-scpi/',
      },
      ChoisirScpiPage
    );
  }

  if (currentView === 'meilleures-scpi-attention') {
    return renderEducationalScpiPage(
      {
        title: 'Meilleures SCPI : limites des classements et critères à vérifier',
        description:
          'Comprenez pourquoi les classements des meilleures SCPI peuvent être trompeurs : rendement, frais, fiscalité, liquidité, risque, TOF, capitalisation et horizon.',
        keywords: ['meilleures SCPI', 'classement SCPI', 'top SCPI', 'limites classement SCPI', 'comparer SCPI'],
        canonical: 'https://maximusscpi.com/meilleures-scpi-attention/',
      },
      MeilleuresScpiAttentionPage
    );
  }

  if (currentView === 'comparateur-scpi-fiable') {
    return renderEducationalScpiPage(
      {
        title: 'Comparateur SCPI fiable : méthode, données et critères d\'analyse',
        description:
          'Découvrez comment reconnaître un comparateur SCPI fiable : données, frais, rendement, TOF, capitalisation, décote, endettement, fiscalité, limites et transparence.',
        keywords: ['comparateur SCPI', 'comparateur SCPI fiable', 'critères comparateur SCPI', 'analyse SCPI', 'outil comparaison SCPI'],
        canonical: 'https://maximusscpi.com/comparateur-scpi-fiable/',
      },
      ComparateurScpiFiablePage
    );
  }

  if (currentView === 'allocation-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Allocation SCPI : comment diversifier entre secteurs, pays et fiscalité',
        description:
          'Comprenez comment construire une allocation SCPI cohérente : diversification sectorielle, géographique, fiscalité, rendement net, risques, TOF et liquidité.',
        keywords: ['allocation SCPI', 'diversification SCPI', 'répartition SCPI', 'portefeuille SCPI', 'construction allocation SCPI'],
        canonical: 'https://maximusscpi.com/allocation-scpi/',
      },
      AllocationScpiPage
    );
  }

  if (currentView === 'combien-investir-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Combien investir en SCPI : montant, diversification, risque et fiscalité',
        description:
          'Comprenez combien investir en SCPI selon votre patrimoine, votre fiscalité, votre horizon, votre besoin de revenus, votre liquidité et votre tolérance au risque.',
        keywords: ['combien investir SCPI', 'montant SCPI', 'investir SCPI montant', 'calibrage SCPI', 'budget SCPI'],
        canonical: 'https://maximusscpi.com/combien-investir-scpi/',
      },
      CombienInvestirScpiPage
    );
  }

  if (currentView === 'scpi-sante') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI santé : avantages, risques, rendement et critères d\'analyse',
        description:
          'Comprenez les SCPI santé : cliniques, laboratoires, cabinets médicaux, EHPAD, rendement, stabilité locative, risques et critères à analyser.',
        keywords: ['SCPI santé', 'immobilier santé SCPI', 'SCPI cliniques', 'SCPI EHPAD', 'investir santé SCPI'],
        canonical: 'https://maximusscpi.com/scpi-sante/',
      },
      ScpiSantePage
    );
  }

  if (currentView === 'scpi-logistique') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI logistique : rendement, entrepôts, e-commerce et vigilance',
        description:
          'Comprenez les SCPI logistique : entrepôts, locaux d\'activité, e-commerce, rendement, occupation, risques sectoriels, localisation et critères d\'analyse.',
        keywords: ['SCPI logistique', 'entrepôts SCPI', 'SCPI e-commerce', 'immobilier logistique SCPI', 'investir logistique SCPI'],
        canonical: 'https://maximusscpi.com/scpi-logistique/',
      },
      ScpiLogistiquePage
    );
  }

  if (currentView === 'scpi-bureaux') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI bureaux : risques, rendement, valorisation et analyse',
        description:
          'Comprenez les SCPI bureaux : télétravail, vacance, baisse des valeurs, rendement, TOF, localisation, qualité des actifs et critères à analyser.',
        keywords: ['SCPI bureaux', 'immobilier bureaux SCPI', 'télétravail SCPI bureaux', 'investir bureaux SCPI', 'analyse SCPI bureaux'],
        canonical: 'https://maximusscpi.com/scpi-bureaux/',
      },
      ScpiBureauxPage
    );
  }

  if (currentView === 'scpi-commerce') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI commerce : avantages, risques, rendement et analyse',
        description:
          'Comprenez les SCPI commerce : murs de magasins, retail parks, commerces alimentaires, emplacement, rendement, vacance, e-commerce et critères d\'analyse.',
        keywords: ['SCPI commerce', 'immobilier commercial SCPI', 'retail parks SCPI', 'commerces SCPI', 'investir commerce SCPI'],
        canonical: 'https://maximusscpi.com/scpi-commerce/',
      },
      ScpiCommercePage
    );
  }

  if (currentView === 'scpi-diversifiees') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI diversifiées : secteurs, risques, rendement et analyse',
        description:
          'Comprenez les SCPI diversifiées : bureaux, commerces, santé, logistique, résidentiel, diversification sectorielle, rendement, risques et critères à analyser.',
        keywords: ['SCPI diversifiées', 'SCPI multi-secteurs', 'diversification SCPI', 'SCPI équilibrée', 'investir SCPI diversifiée'],
        canonical: 'https://maximusscpi.com/scpi-diversifiees/',
      },
      ScpiDiversifieesPage
    );
  }

  if (currentView === 'societes-de-gestion-scpi') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">Chargement...</div></div>}>
          <SocietesDeGestionScpiPage
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onContactClick={() => setIsRdvModalOpen(true)}
            onAboutClick={handleAboutUsClick}
            onLogoClick={handleBackToHome}
            onFaqClick={handleFaqClick}
            onScpiPageClick={handleScpiClick}
            onUnderstandingClick={handleComprendreClick}
            onAboutSectionClick={handleAboutUsClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onEducationClick={handleEducationClick}
            onArticleClick={handleArticleFromListClick}
          />
        </Suspense>
      </div>
    );
  }

  if (currentView === 'societe-gestion-article') {
    const mgmtConfig = managementCompanySlug
      ? managementCompanyConfigs.find(c => c.slug === managementCompanySlug)
      : undefined;
    if (!mgmtConfig) {
      setCurrentView('societe-gestion-scpi');
      return (
        <>
          {null}
        </>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center"><div className="animate-pulse text-gray-500">Chargement...</div></div>}>
        <ManagementCompanyArticlePage
          config={mgmtConfig}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onLogoClick={handleBackToHome}
          onFaqClick={handleFaqClick}
          onScpiPageClick={handleScpiClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          onEducationClick={handleEducationClick}
          onArticleClick={handleArticleFromListClick}
        />
      </Suspense>
    );
  }

  if (currentView === 'societe-gestion-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Société de gestion SCPI : rôle, agrément, gestion et critères d\'analyse',
        description:
          'Comprenez le rôle d\'une société de gestion de SCPI : sélection des actifs, gestion locative, politique de distribution, documents réglementaires, agrément AMF, transparence et points de vigilance.',
        keywords: ['société de gestion SCPI', 'agrément AMF', 'gestion SCPI', 'sélection actifs', 'distribution SCPI'],
        canonical: 'https://maximusscpi.com/societe-gestion-scpi/',
      },
      SocieteGestionScpiPage
    );
  }

  if (currentView === 'gestionnaire-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Gestionnaire SCPI : société de gestion, asset manager, property manager',
        description:
          'Comprenez qui intervient dans la gestion d\'une SCPI : société de gestion, asset manager, property manager, distributeur, CGP-CIF et rôle de chacun dans la chaîne de valeur.',
        keywords: ['gestionnaire SCPI', 'asset manager SCPI', 'property manager', 'société de gestion', 'conseiller'],
        canonical: 'https://maximusscpi.com/gestionnaire-scpi/',
      },
      GestionnaireScpiPage
    );
  }

  if (currentView === 'gestionnaires-acteurs-scpi') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Suspense fallback={<LoadingSpinner />}>
          <GestionnairesActeursScpiPage
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onContactClick={() => setIsRdvModalOpen(true)}
            onAboutClick={handleAboutUsClick}
            onLogoClick={handleBackToHome}
            onFaqClick={handleFaqClick}
            onScpiPageClick={handleScpiClick}
            onUnderstandingClick={handleComprendreClick}
            onAboutSectionClick={handleAboutUsClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onEducationClick={handleEducationClick}
          />
        </Suspense>
        <CookieConsent />
        {renderGlobalModals()}
      </div>
    );
  }

  if (currentView === 'cgp-cif-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'CGP-CIF SCPI : conseil, analyse patrimoniale, adéquation et limites',
        description:
          'Comprenez le rôle d\'un CGP-CIF dans l\'analyse SCPI : recueil d\'informations, fiscalité, horizon, risques, adéquation, rémunération, transparence et distinction avec un comparateur automatique.',
        keywords: ['CGP-CIF', 'conseil SCPI', 'analyse patrimoniale', 'déclaration adéquation', 'ORIAS'],
        canonical: 'https://maximusscpi.com/cgp-cif-scpi/',
      },
      CgpCifScpiPage
    );
  }

  if (currentView === 'psi-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'PSI SCPI : rôle, statut, distribution et cadre réglementaire',
        description:
          'Comprenez le rôle des PSI dans l\'univers des SCPI : services d\'investissement, distribution de parts, conseil, différence avec CIF, vérification ORIAS et points de vigilance.',
        keywords: ['PSI SCPI', 'prestataire services investissement', 'distribution SCPI', 'ORIAS', 'conseil investissement'],
        canonical: 'https://maximusscpi.com/psi-scpi/',
      },
      PsiScpiPage
    );
  }

  if (currentView === 'retrocommissions-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'Rétrocessions SCPI : frais, commissions et transparence',
        description:
          'Comprenez les rétrocessions SCPI : frais de souscription, commissions de distribution, rémunération du conseiller, frais de gestion, transparence des coûts, conflits d\'intérêts potentiels et points à vérifier avant d\'investir.',
        keywords: ['rétrocessions SCPI', 'frais souscription', 'commissions distribution', 'conflits intérêts', 'frais SCPI'],
        canonical: 'https://maximusscpi.com/retrocommissions-scpi/',
      },
      RetrocommissionsScpiPage
    );
  }

  if (currentView === 'scpi-fiscalite') {
    return renderEducationalScpiPage(
      {
        title: 'Fiscalité SCPI : revenus fonciers, Europe, IFI et rendement net',
        description:
          'Comprenez la fiscalité des SCPI : revenus fonciers, prélèvements sociaux, SCPI européennes, crédit d\'impôt, IFI, assurance-vie, démembrement et SCI à l\'IS.',
        keywords: ['fiscalité SCPI', 'imposition SCPI', 'revenus fonciers SCPI', 'IFI SCPI', 'crédit impôt SCPI'],
        canonical: 'https://maximusscpi.com/scpi-fiscalite/',
      },
      FiscaliteAvanceeScpiPage
    );
  }

  if (currentView === 'scpi-tmi-41') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI TMI 41 % : fiscalité, Europe, démembrement et rendement net',
        description:
          'Comprenez les critères d\'analyse des SCPI avec une TMI à 41 % : rendement net, fiscalité des revenus fonciers, SCPI européennes, démembrement, assurance-vie et SCI à l\'IS.',
        keywords: ['SCPI TMI 41', 'fiscalité 41%', 'rendement net SCPI', 'SCPI européennes', 'démembrement'],
        canonical: 'https://maximusscpi.com/scpi-tmi-41/',
      },
      Tmi41ScpiPage
    );
  }

  if (currentView === 'scpi-tmi-45') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI TMI 45 % : fiscalité, rendement net et stratégies à étudier',
        description:
          'Comprenez les points de vigilance des SCPI avec une TMI à 45 % : fiscalité élevée, rendement net, SCPI européennes, démembrement, assurance-vie, SCI à l\'IS et IFI.',
        keywords: ['SCPI TMI 45', 'fiscalité 45%', 'rendement net SCPI', 'SCPI européennes', 'IFI'],
        canonical: 'https://maximusscpi.com/scpi-tmi-45/',
      },
      Tmi45ScpiPage
    );
  }

  if (currentView === 'scpi-revenus-etrangers') {
    return renderEducationalScpiPage(
      {
        title: 'Revenus étrangers SCPI : fiscalité, crédit d\'impôt et taux effectif',
        description:
          'Comprenez la fiscalité des revenus étrangers de SCPI : pays d\'investissement, conventions fiscales, crédit d\'impôt, taux effectif, rendement net et déclaration.',
        keywords: ['revenus étrangers SCPI', 'crédit impôt SCPI', 'taux effectif SCPI', 'SCPI européennes', 'convention fiscale'],
        canonical: 'https://maximusscpi.com/scpi-revenus-etrangers/',
      },
      RevenusEtrangersScpiPage
    );
  }

  if (currentView === 'scpi-revenus-fonciers') {
    return renderEducationalScpiPage(
      {
        title: 'Revenus fonciers SCPI : fiscalité, prélèvements sociaux et déclaration',
        description:
          'Comprenez les revenus fonciers issus des SCPI : fiscalité française, prélèvements sociaux, TMI, rendement net, déduction des intérêts d\'emprunt et points de vigilance.',
        keywords: ['revenus fonciers SCPI', 'fiscalité SCPI', 'prélèvements sociaux', 'TMI', 'rendement net SCPI'],
        canonical: 'https://maximusscpi.com/scpi-revenus-fonciers/',
      },
      RevenusFonciersScpiPage
    );
  }

  if (currentView === 'scpi-prelevements-sociaux') {
    return renderEducationalScpiPage(
      {
        title: 'Prélèvements sociaux SCPI : revenus fonciers et rendement net',
        description:
          'Comprenez l\'impact des prélèvements sociaux sur les revenus de SCPI, leur effet sur le rendement net, les différences entre revenus français et étrangers et les points à vérifier.',
        keywords: ['prélèvements sociaux SCPI', 'CSG CRDS SCPI', 'rendement net', 'SCPI européennes PS'],
        canonical: 'https://maximusscpi.com/scpi-prelevements-sociaux/',
      },
      PrelevementsSociauxScpiPage
    );
  }

  if (currentView === 'scpi-credit-impot') {
    return renderEducationalScpiPage(
      {
        title: 'Crédit d\'impôt SCPI : fiscalité des SCPI européennes expliquée',
        description:
          'Comprenez le crédit d\'impôt applicable à certains revenus étrangers de SCPI : principe, limites, conventions fiscales, rendement net et points de vigilance.',
        keywords: ['crédit impôt SCPI', 'double imposition SCPI', 'fiscalité SCPI européennes', 'convention fiscale'],
        canonical: 'https://maximusscpi.com/scpi-credit-impot/',
      },
      CreditImpotScpiPage
    );
  }

  if (currentView === 'scpi-taux-effectif') {
    return renderEducationalScpiPage(
      {
        title: 'Taux effectif SCPI : fiscalité étrangère et rendement net',
        description:
          'Comprenez le taux effectif appliqué à certains revenus étrangers de SCPI : principe, fiscalité européenne, rendement net, déclaration et points de vigilance.',
        keywords: ['taux effectif SCPI', 'fiscalité étrangère SCPI', 'crédit impôt', 'SCPI européennes', 'déclaration revenus'],
        canonical: 'https://maximusscpi.com/scpi-taux-effectif/',
      },
      TauxEffectifScpiPage
    );
  }

  if (currentView === 'scpi-ifi') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI IFI : déclaration, valorisation et points de vigilance',
        description:
          'Comprenez le traitement des SCPI à l\'IFI : parts imposables, valeur à déclarer, détention en direct, assurance-vie, nue-propriété, SCI et points de vigilance.',
        keywords: ['IFI SCPI', 'impôt fortune immobilière SCPI', 'valeur IFI SCPI', 'assurance-vie IFI', 'déclaration IFI'],
        canonical: 'https://maximusscpi.com/scpi-ifi/',
      },
      IfiScpiPage
    );
  }

  if (currentView === 'scpi-sci-is-fiscalite') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI SCI à l\'IS : fiscalité, amortissement, trésorerie et risques',
        description:
          'Comprenez la détention de SCPI via une SCI à l\'IS : fiscalité société, trésorerie, capitalisation, distribution, plus-value, frais, limites et points de vigilance.',
        keywords: ['SCI IS SCPI', 'fiscalité SCI SCPI', 'amortissement SCPI', 'capitalisation SCPI', 'transmission SCPI'],
        canonical: 'https://maximusscpi.com/scpi-sci-is-fiscalite/',
      },
      SciIsFiscaliteScpiPage
    );
  }

  if (currentView === 'amf-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'AMF SCPI : contrôle, réglementation et documents à vérifier',
        description:
          "Comprenez le rôle de l'AMF dans l'univers des SCPI : agrément des sociétés de gestion, documents réglementaires, information des investisseurs et points à vérifier.",
        keywords: ['AMF SCPI', 'agrément AMF', 'réglementation SCPI', 'documents réglementaires SCPI'],
        canonical: 'https://maximusscpi.com/amf-scpi/',
      },
      ScpiAmfPage
    );
  }

  if (currentView === 'orias-scpi') {
    return renderEducationalScpiPage(
      {
        title: "ORIAS SCPI : vérifier le statut d'un conseiller ou distributeur",
        description:
          "Comprenez le rôle de l'ORIAS dans l'univers des SCPI : vérification des statuts professionnels, CGP-CIF, intermédiaires, distribution et points de vigilance.",
        keywords: ['ORIAS SCPI', 'registre ORIAS', 'CIF SCPI', 'vérification statut SCPI'],
        canonical: 'https://maximusscpi.com/orias-scpi/',
      },
      ScpiOriasPage
    );
  }

  if (currentView === 'documents-reglementaires-scpi') {
    return renderEducationalScpiPage(
      {
        title: "Documents réglementaires SCPI : DIC, note d'information, statuts et rapports",
        description:
          "Comprenez les documents réglementaires d'une SCPI : DIC, note d'information, statuts, rapport annuel, bulletin trimestriel, frais, risques et indicateurs clés.",
        keywords: ['documents réglementaires SCPI', 'DIC SCPI', 'note information SCPI', 'rapport annuel SCPI'],
        canonical: 'https://maximusscpi.com/documents-reglementaires-scpi/',
      },
      ScpiDocumentsReglementairesPage
    );
  }

  if (currentView === 'dic-scpi') {
    return renderEducationalScpiPage(
      {
        title: 'DIC SCPI : risques, frais et informations clés à lire',
        description:
          "Comprenez le DIC d'une SCPI : objectif, risques, frais, durée recommandée, scénarios, limites et points à vérifier avant d'investir.",
        keywords: ['DIC SCPI', 'document informations clés SCPI', 'risques SCPI', 'frais SCPI'],
        canonical: 'https://maximusscpi.com/dic-scpi/',
      },
      ScpiDicPage
    );
  }

  if (currentView === 'note-information-scpi') {
    return renderEducationalScpiPage(
      {
        title: "Note d'information SCPI : frais, risques et souscription",
        description:
          "Comprenez la note d'information d'une SCPI : fonctionnement, frais, risques, modalités de souscription, retrait, fiscalité, stratégie et points de vigilance.",
        keywords: ['note information SCPI', 'frais SCPI', 'risques SCPI', 'souscription SCPI'],
        canonical: 'https://maximusscpi.com/note-information-scpi/',
      },
      ScpiNoteInformationPage
    );
  }

  if (currentView === 'scpi-credit') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI à crédit : effet de levier, fiscalité et risques à analyser',
        description:
          "Comprenez l'investissement en SCPI à crédit : effet de levier, intérêts d'emprunt, fiscalité, cash-flow, risque de taux et revenus non garantis.",
        keywords: ['SCPI crédit', 'effet levier SCPI', 'financement SCPI', 'crédit immobilier SCPI'],
        canonical: 'https://maximusscpi.com/scpi-credit/',
      },
      ScpiCreditPage
    );
  }

  if (currentView === 'scpi-comptant') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI au comptant : avantages, limites et critères à vérifier',
        description:
          'Comprenez l\'achat de SCPI au comptant : revenus potentiels, fiscalité, liquidité, frais, diversification, rendement net et points de vigilance.',
        keywords: ['SCPI comptant', 'achat SCPI comptant', 'rendement net SCPI', 'fiscalité SCPI'],
        canonical: 'https://maximusscpi.com/scpi-comptant/',
      },
      ScpiComptantPage
    );
  }

  if (currentView === 'scpi-retraite') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI pour préparer sa retraite : revenus, fiscalité et horizon',
        description:
          'Comprenez comment analyser les SCPI pour préparer la retraite : revenus complémentaires, fiscalité, horizon long terme, démembrement, assurance-vie, liquidité et risques.',
        keywords: ['SCPI retraite', 'préparer retraite SCPI', 'revenus complémentaires SCPI', 'démembrement SCPI'],
        canonical: 'https://maximusscpi.com/scpi-retraite/',
      },
      ScpiRetraitePage
    );
  }

  if (currentView === 'scpi-revenus-complementaires') {
    return renderEducationalScpiPage(
      {
        title: "SCPI et revenus complémentaires : ce qu'il faut vérifier",
        description:
          'Comprenez les SCPI pour générer des revenus complémentaires : rendement potentiel, fiscalité, prélèvements sociaux, liquidité, risques et points de vigilance.',
        keywords: ['SCPI revenus complémentaires', 'SCPI revenus', 'distributions SCPI', 'rendement net SCPI'],
        canonical: 'https://maximusscpi.com/scpi-revenus-complementaires/',
      },
      ScpiRevenusComplementairesPage
    );
  }

  if (currentView === 'scpi-transmission') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI et transmission : donation, démembrement et succession',
        description:
          "Comprenez l'utilisation des SCPI dans une stratégie de transmission : donation, démembrement, nue-propriété, usufruit, assurance-vie, succession et points de vigilance.",
        keywords: ['SCPI transmission', 'donation SCPI', 'démembrement SCPI', 'succession SCPI', 'nue-propriété SCPI'],
        canonical: 'https://maximusscpi.com/scpi-transmission/',
      },
      ScpiTransmissionPage
    );
  }

  if (currentView === 'scpi-france') {
    return renderEducationalScpiPage(
      {
        title: 'SCPI France : fiscalité, rendement, risques et critères d\'analyse',
        description:
          "Comprenez les SCPI investies principalement en France : revenus fonciers, fiscalité, prélèvements sociaux, rendement net, secteurs, risques et critères à comparer.",
        keywords: ['SCPI France', 'fiscalité SCPI', 'revenus fonciers', 'rendement net SCPI', 'prélèvements sociaux'],
        canonical: 'https://maximusscpi.com/scpi-france/',
      },
      ScpiFrancePage
    );
  }

  // Render Comparateur SCPI (page dédiée — design identique à la section accueil)
  if (currentView === 'comparateur') {
    return (
      <div className="min-h-screen bg-slate-900">
        <SEOHead
          title="Comparateur SCPI 2026 : Comparez 63 SCPI (Rendement, Frais, Secteur)"
          description="Comparez les meilleures SCPI en temps réel : rendements, frais, capitalisation, secteur et géographie. Outil gratuit par un conseiller certifié ORIAS."
          keywords={['comparateur SCPI', 'comparatif SCPI', 'comparer SCPI', 'meilleure SCPI 2026', 'rendement SCPI']}
          canonical="https://maximusscpi.com/comparateur-scpi/"
        />
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <main>
          <div id="comparator" data-comparator className="pt-6 sm:pt-8 pb-16 sm:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Intro discrète — pas de hero marketing ni de formulaire sur /comparateur-scpi */}
              <div className="mb-5">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Comparateur SCPI
                </h1>
                <p className="mt-1 text-sm text-slate-400 max-w-3xl">
                  Comparez les SCPI selon leurs indicateurs clés : rendement, frais, TOF, capitalisation, secteurs et zones géographiques.
                </p>
              </div>

              <Suspense fallback={<LoadingSpinner />}>
                <FintechComparator
                  onCloseAnalysis={handleBackToHome}
                  onGuidedJourneyClick={() => {
                    setCurrentView('guided-journey');
                    window.history.pushState({}, '', '/parcours-guide');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  hideTitle={true}
                  zScoreVariant="compact"
                />
              </Suspense>
            </div>
          </div>
        </main>
        <Footer />
        {renderGlobalModals()}
      </div>
    );
  }

  // Render Parcours Guidé
  if (currentView === 'guided-journey') {
    return (
      <>
        {/* Rendre GuidedJourney seulement si le tunnel n'est pas ouvert */}
        {!isSubscriptionOpen && (
          <Suspense fallback={<LoadingSpinner />}>
            <GuidedJourney
              onClose={handleBackToHome}
              onStartSubscription={handleStartSubscription}
              onCalendlyClick={() => setIsRdvModalOpen(true)}
            />
          </Suspense>
        )}
        
        {/* Tunnel de souscription - Rendu ici pour être toujours accessible */}
        <SubscriptionProvider>
          <Suspense 
            fallback={
              isSubscriptionOpen && selectedScpiForSubscription.length > 0 ? (
                <div 
                  className="fixed inset-0 z-[10000] bg-slate-900 flex items-center justify-center"
                  style={{ zIndex: 10000 }}
                >
                  <LoadingSpinner fullScreen />
                </div>
              ) : null
            }
          >
            {(() => {
              console.log('📤 App.tsx - Props passées à SubscriptionFunnel (dans GuidedJourney):', {
                isSubscriptionOpen,
                selectedScpiCount: selectedScpiForSubscription.length,
                selectedScpiIds: selectedScpiForSubscription.map(s => s.id)
              });
              return (
                <SubscriptionFunnel
                  isOpen={isSubscriptionOpen}
                  initialScpis={selectedScpiForSubscription}
                  onClose={() => {
                    console.log('🔒 Fermeture du tunnel');
                    setIsSubscriptionOpen(false);
                    setSelectedScpiForSubscription([]);
                    window.history.pushState({}, '', '/');
                  }}
                />
              );
            })()}
          </Suspense>
        </SubscriptionProvider>
        
        {/* Modals globaux - Rendu ici pour être toujours accessible */}
        {renderGlobalModals()}
      </>
    );
  }

  // Render SCPI Example Page (Comète)
  if (currentView === 'scpi-example') {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiExamplePage
            onNavigateHome={handleBackToHome}
            onNavigateToFaq={handleFaqClick}
            onNavigateToAbout={handleAboutUsClick}
            onNavigateToUnderstanding={handleComprendreClick}
            onNavigateToScpi={handleScpiClick}
            onContactClick={() => setIsRdvModalOpen(true)}
          />
        </Suspense>
        {renderGlobalModals()}
      </>
    );
  }

  // Render Optimized SCPI Landing Page (toutes les SCPI)
  if (currentView === 'scpi-optimized' && selectedScpiKey) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <OptimizedScpiLandingPage
            scpiKey={selectedScpiKey}
            onNavigateHome={handleBackToHome}
            onNavigateToFaq={handleFaqClick}
            onNavigateToAbout={handleAboutUsClick}
            onNavigateToUnderstanding={handleComprendreClick}
            onNavigateToScpi={handleScpiClick}
            onContactClick={() => setIsRdvModalOpen(true)}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        </Suspense>
        {renderGlobalModals()}
      </>
    );
  }

  // Render Static SCPI Page (toutes les 63 SCPI automatiquement)
  if (currentView === 'scpi-static' && selectedScpiKey) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <StaticScpiPage
            slug={selectedScpiKey}
            onNavigateHome={handleBackToHome}
            onNavigateToFaq={handleFaqClick}
            onNavigateToAbout={handleAboutUsClick}
            onNavigateToUnderstanding={handleComprendreClick}
            onNavigateToScpi={handleScpiClick}
            onContactClick={() => setIsRdvModalOpen(true)}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        </Suspense>
        {renderGlobalModals()}
      </>
    );
  }

  // Render SCPI Landing Page (générique)
  if (currentView === 'scpi-landing' && selectedScpiKey) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiLandingPage
            scpiKey={selectedScpiKey}
            onNavigateHome={handleBackToHome}
            onNavigateToFaq={handleFaqClick}
            onNavigateToAbout={handleAboutUsClick}
            onNavigateToUnderstanding={handleComprendreClick}
            onNavigateToScpi={handleScpiClick}
            onContactClick={() => setIsRdvModalOpen(true)}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        </Suspense>
        {renderGlobalModals()}
      </>
    );
  }

  // Render SCPI Detail Page
  if (currentView === 'scpi-detail' && selectedScpiKey) {
    const normalizeString = (str: string) => str.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/\s+/g, '-');

    const selectedScpiData = scpiData.find(s =>
      normalizeString(s.name) === selectedScpiKey ||
      s.name.toLowerCase().replace(/\s+/g, '-') === selectedScpiKey ||
      s.name.toLowerCase() === selectedScpiKey.replace(/-/g, ' ')
    );

    if (selectedScpiData) {
      const searchParams = new URLSearchParams(window.location.search);
      const isParcoursLocked = searchParams.get('lock') === 'true';
      return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
          <Header
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onContactClick={() => setIsRdvModalOpen(true)}
            onAboutClick={handleAboutUsClick}
            onEducationClick={handleEducationClick}
            onLogoClick={handleBackToHome}
            onScpiPageClick={isParcoursLocked ? undefined : handleScpiClick}
            onFaqClick={handleFaqClick}
            onUnderstandingClick={handleComprendreClick}
            onAboutSectionClick={handleAboutUsClick}
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
            onActualitesClick={handleActualitesClick}
          currentView={currentView}
          />
          <Suspense fallback={<LoadingSpinner />}>
            <ScpiDetailPage
              scpi={selectedScpiData}
              onAddToPortfolio={isParcoursLocked ? undefined : (scpi) => toggleScpiSelection(scpi.name)}
              onTakeAppointment={isParcoursLocked ? undefined : () => setIsRdvModalOpen(true)}
            />
          </Suspense>
          <Footer isDarkMode={isDarkMode} />

          {renderGlobalModals()}
        </div>
      );
    }
  }

  // Render Optimized Thematic Landing Page (12 priority pages for Google Ads)
  if (currentView === 'thematic-optimized' && selectedThematicPage) {
    console.log('[DEBUG Render] Rendering OptimizedThematicLandingPage with pageKey:', selectedThematicPage);
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <OptimizedThematicLandingPage
          pageKey={selectedThematicPage}
          onNavigateHome={handleBackToHome}
          onNavigateToFaq={handleFaqClick}
          onNavigateToAbout={handleAboutUsClick}
          onNavigateToUnderstanding={handleUnderstandingClick}
          onNavigateToScpi={handleScpiClick}
          onContactClick={() => setIsRdvModalOpen(true)}
        />
      </Suspense>
    );
  }

  // Render Thematic Landing Page (legacy - kept for backward compatibility)
  // All thematic pages now use thematic-optimized for better Google Ads performance
  if (currentView === 'thematic' && selectedThematicPage) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <ThematicLandingPage
            pageKey={selectedThematicPage}
            onNavigateHome={handleBackToHome}
            onNavigateToFaq={handleFaqClick}
            onNavigateToAbout={handleAboutUsClick}
            onNavigateToUnderstanding={handleComprendreClick}
            onNavigateToScpi={handleScpiClick}
            onContactClick={() => setIsRdvModalOpen(true)}
          />
        </Suspense>
        {renderGlobalModals()}
      </>
    );
  }

  // Render Comprendre SCPI view
  if (currentView === 'comprendre') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onFaqClick={handleFaqClick}
          onUnderstandingClick={handleComprendreClick}
          onAboutSectionClick={handleAboutUsClick}
          onAboutNavigation={handleGenericNavigation}
          onComparateurClick={handleComparateurClick}
          onSimulateurClick={handleSimulateurClick}
          onArticlesClick={handleArticlesClick}
          onActualitesClick={handleActualitesClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ComprendreSCPIPage />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Prepare chart data
  const sectorChartData = Object.entries(portfolioStats.sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ][index % 10]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const geoChartData = Object.entries(portfolioStats.geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
        '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
      ][index % 10]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const performanceChartData = Object.entries(portfolioStats.performanceDistribution)
    .map(([name, value], index) => ({
      name,
      value,
      color: [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
      ][index % 4]
    }))
    .filter(item => item.value > 0);

  // Render landing page view
  if (currentView === 'landing' && selectedLandingPage) {
    const landingPageContent = getLandingPageBySlug(selectedLandingPage);
    if (landingPageContent) {
      return (
        <>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <LandingPage
              content={landingPageContent}
              onBack={handleBackToHome}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              onAboutClick={handleAboutUsClick}
              onEducationClick={handleEducationClick}
              onScpiPageClick={handleScpiClick}
              onContactClick={() => setIsRdvModalOpen(true)}
              onFaqClick={handleFaqClick}
              onUnderstandingClick={handleComprendreClick}
              onAboutSectionClick={handleAboutUsClick}
              onArticlesClick={handleArticlesClick}
              onActualitesClick={handleActualitesClick}
              onComparateurClick={handleComparateurClick}
              onSimulateurClick={handleSimulateurClick}
            />
          </Suspense>
          {renderGlobalModals()}
        </>
      );
    }
  }

  // Render article view
  if (currentView === 'article' && selectedArticle) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onUnderstandingClick={handleComprendreClick}
          onFaqClick={handleFaqClick}
          onAboutSectionClick={handleAboutUsClick}
          onSimulateurClick={handleSimulateurClick}
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ArticlePage
            article={selectedArticle}
            onBack={handleBackToCategory}
            onContactClick={() => setIsRdvModalOpen(true)}
            onNavigateToComparator={handleBackToHome}
          />
        </Suspense>
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Render category view
  if (currentView === 'category' && selectedCategory) {
    const category = getAllCategories().find(cat => cat.id === selectedCategory);
    const articles = getArticlesByCategory(selectedCategory);

    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onContactClick={() => setIsRdvModalOpen(true)}
          onAboutClick={handleAboutUsClick}
          onEducationClick={handleEducationClick}
          onLogoClick={handleBackToHome}
          onScpiPageClick={handleScpiClick}
          onUnderstandingClick={handleComprendreClick}
          onFaqClick={handleFaqClick}
          onAboutSectionClick={handleAboutUsClick}
          onSimulateurClick={handleSimulateurClick}
          currentView={currentView}
        />
        {category && (
          <CategoryPage
            category={category}
            articles={articles}
            onBack={handleBackToHome}
            onArticleClick={handleArticleClick}
          />
        )}
        <Footer />

        {renderGlobalModals()}
      </div>
    );
  }

  // Refonte homepage — capture du lead issu du quiz court de pré-orientation SCPI.
  // Le CTA Calendly (VITE_CALENDLY_URL) est porté par le composant InvestorQuiz.
  const handleLeadCapture = (data: QuizData): void => {
    // TODO: connecter à Supabase
    // Table cible : leads
    // Colonnes : montant, tmi, horizon, objectif, created_at
    // Utiliser le client Supabase existant si déjà configuré
    console.log('[MaximusSCPI] Lead quiz capturé :', data);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title={currentLandingPage?.title}
        description={currentLandingPage?.metaDescription}
        keywords={currentLandingPage?.keywords}
        canonical={currentLandingPage ? `https://maximusscpi.com/?${new URLSearchParams(currentLandingPage.urlParams as Record<string, string>).toString()}` : undefined}
      />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={() => setIsRdvModalOpen(true)}
        onAboutClick={handleAboutUsClick}
        onEducationClick={handleEducationClick}
        onLogoClick={handleBackToHome}
        onScpiPageClick={handleScpiClick}
        onFaqClick={handleFaqClick}
        onUnderstandingClick={handleComprendreClick}
        onAboutSectionClick={handleAboutUsClick}
        onAboutNavigation={handleGenericNavigation}
        onComparateurClick={handleComparateurClick}
        onSimulateurClick={handleSimulateurClick}
        onArticlesClick={handleArticlesClick}
        onActualitesClick={handleActualitesClick}
        currentView={currentView}
      />

      {/* Main Content — refonte homepage conversion (Hero → Quiz → Preuves → Teaser) */}
      <main>
        {/* Section 1 — Hero */}
        {hasLandingParams && currentLandingPage ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
              <DynamicHero
                onCalendlyClick={() => setIsRdvModalOpen(true)}
                h1={currentLandingPage.h1}
                description={currentLandingPage.description}
              />
            </Suspense>
          </div>
        ) : (
          <section className="relative overflow-hidden" style={{ backgroundColor: '#0D1117' }}>
            {/* Gradients radiaux subtils : vert, bleu, rose */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(55% 50% at 12% 8%, rgba(0,200,150,0.14) 0%, transparent 60%), radial-gradient(50% 50% at 92% 18%, rgba(0,86,179,0.20) 0%, transparent 60%), radial-gradient(45% 45% at 75% 95%, rgba(244,114,182,0.10) 0%, transparent 60%)',
              }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                {/* Colonne gauche — discours */}
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                    Analyse SCPI pédagogique • Fiscalité • Rendement net
                  </span>

                  <h1 className="mt-5 mb-4 pb-2 overflow-visible text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.18] bg-gradient-to-r from-pink-400 via-pink-300 to-rose-200 bg-clip-text text-transparent">
                    Obtenez une première lecture claire de votre projet SCPI
                  </h1>

                  <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl">
                    En 2 minutes, identifiez les grandes familles de SCPI à
                    étudier selon votre montant, votre fiscalité et votre horizon
                    d'investissement.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Bouton "Démarrer l'analyse" : utile uniquement < lg, où le quiz
                        passe sous le hero. Masqué sur desktop (lg+) car le quiz est
                        déjà visible dans la colonne de droite. */}
                    <button
                      type="button"
                      onClick={() =>
                        window.document
                          .getElementById('quiz-section')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="lg:hidden px-7 py-4 rounded-xl font-semibold text-[#0D1117] shadow-2xl shadow-emerald-500/20 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                      style={{ backgroundColor: '#00C896' }}
                    >
                      Démarrer l'analyse
                    </button>
                    {/* CTA secondaire : texte souligné uniquement, poids visuel
                        nettement inférieur au CTA primaire vert (cf. étape 3D). */}
                    <a
                      href="/comparateur-scpi"
                      className="text-center font-medium underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
                      style={{ color: '#00C896' }}
                    >
                      Voir le comparateur complet
                    </a>
                  </div>

                  {/* 3 micro-bullets */}
                  <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-6 sm:gap-y-2 text-sm text-slate-300">
                    {[
                      'Pré-orientation pédagogique',
                      'Comparateur 63 SCPI',
                      'En cas de projet de souscription, vous serez accompagné par le Cabinet Eric Bellaiche, CGP-CIF inscrit ORIAS n°13001580.',
                    ].map((item) => (
                      <li key={item} className="inline-flex items-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#00C896"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-sm sm:text-base font-semibold text-slate-200">
                    Plus de 4 650 situations patrimoniales étudiées — plus de 330 M€ de projets analysés
                  </p>

                  {/* Micro-indication desktop : le quiz est déjà affiché à droite. */}
                  <p className="hidden lg:block mt-4 text-sm text-slate-400">
                    Répondez aux 4 questions à droite pour obtenir une première orientation.
                  </p>
                </div>

                {/* Colonne droite — module quiz */}
                <div className="lg:pl-2">
                  <InvestorQuiz onComplete={handleLeadCapture} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* POSITION 2 — Bloc Éric Bellaiche + accréditations (déplacé sous le hero) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExpertBanner
            isDarkMode={isDarkMode}
            onContactClick={() => setIsRdvModalOpen(true)}
          />
        </div>

        {/* POSITION 3 — Témoignages clients + CTA RDV (déplacé) */}
        <Suspense fallback={<div className="py-12"><LoadingSpinner /></div>}>
          <Testimonials />
        </Suspense>

        {/* POSITION 4 — Preuve sociale (réassurance, non chiffrée) */}
        <PreuveSociale />

        {/* POSITION 5 — Teaser comparateur (statique, sans import de ScpiComparator) */}
        <TeaserComparateur />

      </main>

      {/* MOVED_TO_PAGE — Bloc pédagogique "Comprendre les SCPI" / "Comment ça fonctionne" /
          "Types d'actifs" / "Façons d'investir" / "Trois grandes familles".
          Déjà disponible sur la page dédiée /comprendre-les-scpi
          (currentView === 'comprendre' → ComprendreSCPIPage → UnderstandingSCPI).
          Retiré de la homepage pour alléger le tunnel de conversion. */}
      {/* <UnderstandingSCPI /> */}

      {/* Landing Pages Menu */}
      <Suspense fallback={<div className="py-12"><LoadingSpinner /></div>}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LandingPagesMenu onPageClick={handleLandingPageClick} />
        </div>
      </Suspense>

      {/* Cocon Sémantique - Maillage interne SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SemanticLinks
          currentPage="/"
          links={getSemanticLinks('/')}
          title="Poursuivez votre découverte des SCPI"
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Button */}
      <FloatingButton
        isVisible={showFloatingButton}
        onClick={() => setIsRdvModalOpen(true)}
      />

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        {isAnalysisModalOpen && (
          <AnalysisModal
            scpi={selectedScpiForAnalysis}
            isOpen={isAnalysisModalOpen}
            onClose={() => {
              setIsAnalysisModalOpen(false);
              setSelectedScpiForAnalysis(null);

              // Sur mobile, retourner à l'accueil
              if (window.innerWidth < 768) {
                handleBackToHome();
              }
            }}
            onAddToPortfolio={toggleScpiSelection}
          />
        )}

        {isRdvModalOpen && (
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
            selectedScpi={selectedScpi}
          />
        )}

        {isAboutModalOpen && (
          <AboutModal
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(false)}
          />
        )}

        {isReviewsModalOpen && (
          <ReviewsModal
            isOpen={isReviewsModalOpen}
            onClose={() => setIsReviewsModalOpen(false)}
          />
        )}

        {isObjectiveModalOpen && (
          <ObjectiveModal
            isOpen={isObjectiveModalOpen}
            onClose={() => setIsObjectiveModalOpen(false)}
            onObjectiveSelect={handleObjectiveSelect}
          />
        )}

        {isComparisonTableOpen && (
          <ComparisonTable
            selectedScpi={selectedScpiForComparison}
            onRemoveScpi={(scpiId) => {
              setSelectedScpiForComparison(prev => prev.filter(s => s.id !== scpiId));
            }}
            onClose={() => setIsComparisonTableOpen(false)}
            onOpenRdvModal={() => {
              setIsComparisonTableOpen(false);
              setIsRdvModalOpen(true);
            }}
          />
        )}

        {isPortfolioResultsOpen && (
          <PortfolioResultsModal
            isOpen={isPortfolioResultsOpen}
            onClose={() => setIsPortfolioResultsOpen(false)}
            selectedScpi={selectedScpi}
            investmentAmount={investmentAmount}
            clientProfile={null}
            onExportPDF={handleExportPDF}
            onScheduleCall={() => {
              setIsPortfolioResultsOpen(false);
              setIsRdvModalOpen(true);
            }}
            onOpenSimulator={() => {
              setIsPortfolioResultsOpen(false);
              setIsRdvModalOpen(true);
            }}
            onLogoClick={() => {
              console.log('🏠 onLogoClick appelé depuis App.tsx');
              setIsPortfolioResultsOpen(false);
              console.log('📊 Modal fermé, navigation dans 100ms');
              setTimeout(() => {
                console.log('⏰ Timeout terminé, appel handleBackToHome');
                handleBackToHome();
              }, 100);
            }}
          />
        )}
      </Suspense>

      {/* Tunnel de souscription global - Toujours monté, visible uniquement si isOpen */}
      <SubscriptionProvider>
        <Suspense 
          fallback={
            isSubscriptionOpen && selectedScpiForSubscription.length > 0 ? (
              <div 
                className="fixed inset-0 z-[10000] bg-slate-900 flex items-center justify-center"
                style={{ zIndex: 10000 }}
              >
                <LoadingSpinner fullScreen />
              </div>
            ) : null
          }
        >
          {(() => {
            return (
              <SubscriptionFunnel
                isOpen={isSubscriptionOpen}
                initialScpis={selectedScpiForSubscription}
                onClose={() => {
                  console.log('🔒 Fermeture du tunnel');
                  setIsSubscriptionOpen(false);
                  setSelectedScpiForSubscription([]);
                  window.history.pushState({}, '', '/');
                }}
              />
            );
          })()}
        </Suspense>
      </SubscriptionProvider>
      
      

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
};

export default App;