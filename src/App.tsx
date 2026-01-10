import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Building, TrendingUp, PieChart, BarChart3, MapPin, Calendar,
  Download, User, Target, Award, Shield, DollarSign, Phone,
  Info, Star, Moon, Sun, ExternalLink, AlertTriangle
} from 'lucide-react';

// Force reload timestamp: 2024-12-19 10:13:00 - Table padding fix fintech comparator

// Core components loaded immediately for faster initial render
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import UnderstandingSCPI from './components/UnderstandingSCPI';
import DisclaimerBox from './components/DisclaimerBox';
import ExpertBanner from './components/ExpertBanner';
import { CookieConsent } from './components/CookieConsent';
import SemanticLinks from './components/SemanticLinks';
import { getSemanticLinks } from './data/semanticCocon';
import ErrorBoundary from './components/ErrorBoundary';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Hero from './components/Hero';
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
const ComparateurDemembrementScpi = lazy(() => import('./components/ComparateurDemembrementScpi'));
const ScpiSecteursHubPage = lazy(() => import('./components/ScpiSecteursHubPage'));
const ScpiGestionnairesHubPage = lazy(() => import('./components/ScpiGestionnairesHubPage'));
const ScpiObjectifsHubPage = lazy(() => import('./components/ScpiObjectifsHubPage'));
const ScpiEuropeennesHubPage = lazy(() => import('./components/ScpiEuropeennesHubPage'));
const FondsEurosScpiArticle = lazy(() => import('./components/FondsEurosScpiArticle'));
const ArticleGeneratorPage = lazy(() => import('./components/ArticleGeneratorPage'));
const EducationArticlesIndexPage = lazy(() => import('./components/EducationArticlesIndexPage'));
const DynamicArticlePage = lazy(() => import('./components/DynamicArticlePage'));
const OptimizedArticlePage = lazy(() => import('./components/OptimizedArticlePage'));

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

// Types and Data
import { Scpi, QuickFilterType, ObjectiveType } from './types/scpi';
// scpiData lazy loaded on demand (275 Ko)
import { educationArticles, getArticlesByCategory, getAllCategories, getArticleBySlug } from './data/educationArticles';
import { getTemplateBySlug } from './data/articleTemplatesConfig';
import type { Article } from './components/ArticlePage';
import { scpiLandingPages } from './data/landingPagesData';

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
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'article' | 'landing' | 'faq' | 'comprendre' | 'about-us' | 'reclamation' | 'conditions' | 'scpi-example' | 'scpi-landing' | 'scpi-detail' | 'thematic' | 'scpi-optimized' | 'thematic-optimized' | 'scpi-static' | 'comparateur' | 'test-sender-react' | 'life-to-scpi' | 'simulateur-revenus-nets' | 'simulateur-credit' | 'simulateur-demembrement' | 'simulateur-enveloppes' | 'comparateur-demembrement' | 'fonds-euros-ou-scpi' | 'article-generator' | 'articles-list' | 'dynamic-article' | 'expertise-orias' | 'methodologie-donnees' | 'avertissements-risques' | 'investir-scpi' | 'rendement-scpi' | 'fiscalite-scpi' | 'acheter-scpi' | 'guided-journey'>('home');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string | null>(null);
  const [selectedScpiKey, setSelectedScpiKey] = useState<string | null>(null);
  const [selectedThematicPage, setSelectedThematicPage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLandingPage, setSelectedLandingPage] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/|\/$/, '');
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
      } else if (path === 'acheter-scpi') {
        setCurrentView('acheter-scpi');
      } else if (path === 'test-sender-react') {
        setCurrentView('test-sender-react');
      } else if (path === 'admin/article-generator') {
        setCurrentView('article-generator');
      } else if (path === 'articles') {
        setCurrentView('articles-list');
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
        setSelectedThematicPage('comparateur-scpi');
        setCurrentView('thematic-optimized');
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
      } else if (normalizedPath === 'articles') {
        setCurrentView('articles-list');
        setSelectedCategory(null);
        setSelectedArticle(null);
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
      } else if (normalizedPath === 'acheter-scpi') {
        setCurrentView('acheter-scpi');
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
      } else if (normalizedPath === 'comparateur-demembrement-scpi') {
        setCurrentView('comparateur-demembrement');
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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

  const handleDynamicArticleClick = (slug: string) => {
    navigateToView('dynamic-article', `/${slug}`, {
      currentArticleSlug: slug
    });
  };

  const handleArticleFromListClick = (slug: string) => {

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

    const targetView = pathMapping[cleanPath] || 'home';
    navigateToView(targetView, path);
  };

  const handleSimulateurClick = (simulateurId: string) => {
    console.log('[Navigation] handleSimulateurClick appelé avec:', simulateurId);

    // Map simulateur IDs to views and routes
    const simulateurMapping: Record<string, { view: string; route: string }> = {
      'fonds-euros-scpi': { view: 'life-to-scpi', route: '/simulateur-fonds-euros-scpi' },
      'revenus-nets': { view: 'simulateur-revenus-nets', route: '/simulateur-revenus-nets-scpi' },
      'credit': { view: 'simulateur-credit', route: '/simulateur-credit-scpi' },
      'demembrement': { view: 'simulateur-demembrement', route: '/simulateur-demembrement-scpi' },
      'enveloppes': { view: 'simulateur-enveloppes', route: '/simulateur-enveloppes-scpi' },
      'comparateur-demembrement': { view: 'comparateur-demembrement', route: '/comparateur-demembrement-scpi' },
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
    } else {
      // Fallback vers StaticScpiPage si la SCPI n'est pas dans scpiLandingPages
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
    console.log('[App] Rendering simulateur-demembrement view');
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
          currentView={currentView}
        />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>}>
          <ErrorBoundary>
            <ScpiDemembrementSimulator
              defaultMontant={100000}
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
    console.log('[App] Rendering simulateur-enveloppes view');
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

  // Render Comparateur Démembrement SCPI
  if (currentView === 'comparateur-demembrement') {
    console.log('[App] Rendering comparateur-demembrement view');
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

  // Render SCPI Européennes Hub
  if (currentView === 'scpi-europeennes-hub') {
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
          currentView={currentView}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <ScpiEuropeennesHubPage />
        </Suspense>
        <Footer />
        {renderGlobalModals()}
      </div>
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

  // Render Comparateur SCPI
  if (currentView === 'comparateur') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <SEOHead
          title="Portefeuille SCPI : outil d’analyse & construction | MaximusSCPI"
          description="Un outil pour analyser l’équilibre de votre portefeuille SCPI : diversification, risque, répartition et horizon, au‑delà du simple rendement."
          canonical="https://www.maximusscpi.com/comparateur-scpi"
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
          currentView={currentView}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <FintechComparator onCloseAnalysis={handleBackToHome} />
          </Suspense>
        </div>
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

  // Render Static SCPI Page (toutes les 51 SCPI automatiquement)
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
            onComparateurClick={handleComparateurClick}
            onSimulateurClick={handleSimulateurClick}
            onArticlesClick={handleArticlesClick}
          currentView={currentView}
          />
          <Suspense fallback={<LoadingSpinner />}>
            <ScpiDetailPage
              scpi={selectedScpiData}
              onAddToPortfolio={(scpi) => toggleScpiSelection(scpi.name)}
              onTakeAppointment={() => setIsRdvModalOpen(true)}
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
        currentView={currentView}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="mb-12 sm:mb-12">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
            {hasLandingParams && currentLandingPage ? (
              <DynamicHero
                onCalendlyClick={() => setIsRdvModalOpen(true)}
                h1={currentLandingPage.h1}
                description={currentLandingPage.description}
              />
            ) : (
              <Hero 
                onCalendlyClick={() => setIsRdvModalOpen(true)}
                onGuidedJourneyClick={() => {
                  setCurrentView('guided-journey');
                  window.history.pushState({}, '', '/parcours-guide');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </Suspense>
        </div>

        {/* Product Spotlight - Dashboard Portfolio */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          {/* Style CSS pour perspective desktop uniquement */}
          <style>{`
            @media (min-width: 1024px) {
              .product-spotlight-container {
                transform: perspective(1200px) rotateX(3deg);
                transform-style: preserve-3d;
              }
            }
          `}</style>
          
          {/* Container principal avec fond gradient sombre */}
          <div className="relative w-full flex justify-center px-2 sm:px-3 lg:px-4 py-4 sm:py-6 lg:py-8">
            {/* Fond gradient sombre pour détachement net */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.2) 50%, transparent 100%)',
              }}
            ></div>
            
            {/* Spotlight Halo - Effet lumineux emerald (identité MaximusSCPI) */}
            {/* Blur large (120px) pour effet spotlight discret et premium */}
            <div 
              className="absolute inset-0 flex justify-center items-center pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 30%, transparent 70%)',
                filter: 'blur(120px)',
              }}
            ></div>
            
            {/* Container image avec perspective desktop uniquement */}
            <div className="relative w-full sm:w-[95%] lg:w-[90%] max-w-[1400px] product-spotlight-container">
              {/* Image produit avec profondeur premium */}
              {/* Border-radius élégant (rounded-3xl), bordure fine semi-transparente, ombre produit marquée */}
              <img 
                src="/images/image%20home.webp" 
                alt="Dashboard d'analyse de portefeuille SCPI - Rendement, revenus mensuels, répartition sectorielle et géographique, projection sur 15 ans, avis expert"
                className="w-full h-auto max-h-[700px] sm:max-h-[800px] lg:max-h-[1000px] object-contain rounded-3xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.4),0_0_60px_-15px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-white/10 dark:border-white/5 backdrop-blur-sm"
                loading="lazy"
                style={{
                  transform: 'translateZ(0)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Encart Parcours Recommandé */}
        <div className="mb-8 sm:mb-8">
          <div className="relative bg-slate-900 rounded-lg p-6 sm:p-8 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="max-w-2xl mx-auto">
              {/* Badge "Recommandé pour débuter" */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Recommandé pour débuter
                </span>
              </div>
              
              {/* Contenu principal */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
                  Vous débutez en SCPI ?
                </h2>
                <p className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed">
                  Vous ne savez pas par où commencer, ni quoi comparer ?<br />
                  Ce parcours guidé a été conçu pour les personnes qui découvrent les SCPI.
                </p>
                
                {/* CTA */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView('guided-journey');
                      window.history.pushState({}, '', '/parcours-guide');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Être guidé pour investir en SCPI
                  </button>
                  <p className="text-xs text-slate-400">
                    Sans engagement – Aucune connaissance requise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Comparateur avec titre intégré */}
        <div id="comparator" data-comparator className="mt-16 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Titre rattaché au comparateur */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Construisez votre portefeuille SCPI
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Accédez à l'ensemble des SCPI et analysez-les librement.
              </p>
            </div>
            
            {/* Comparateur */}
            <Suspense fallback={<LoadingSpinner />}>
              <FintechComparator 
                onCloseAnalysis={handleBackToHome}
                onGuidedJourneyClick={() => {
                  setCurrentView('guided-journey');
                  window.history.pushState({}, '', '/parcours-guide');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                hideTitle={true}
              />
            </Suspense>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Analyse IA Avancée
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Une sélection de SCPI adaptée à vos objectifs patrimoniaux
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Optimisation Fiscale
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Des stratégies concrètes pour réduire l'impôt et améliorer vos revenus nets
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Expertise & Sécurité
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              15+ ans d'expérience pour investir en SCPI avec confiance et sérénité
            </p>
          </div>
        </div>

      </main>

      {/* Expert Banner - Eric Bellaiche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExpertBanner
          isDarkMode={isDarkMode}
          onContactClick={() => setIsRdvModalOpen(true)}
        />
      </div>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="py-12"><LoadingSpinner /></div>}>
        <Testimonials />
      </Suspense>

      {/* Understanding SCPI Section */}
      <UnderstandingSCPI />

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