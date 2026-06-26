import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Grid3x3, List, ChevronLeft, ChevronRight, Calculator, Link, Copy, ArrowLeft, ArrowRight, RotateCcw, Download, PlayCircle, FileText, User, Star, Award, TrendingUp, DollarSign, Sliders, PieChart as PieChartIcon, CheckCircle2, BarChart3 } from 'lucide-react';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { scpiData } from '../../data/scpiData';
import { AllocationProvider } from '../../contexts/AllocationContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import ProSCPICardDark from './ProSCPICardDark';
import SCPITableRow from './SCPITableRow';
import ProSelectionSidebar from './ProSelectionSidebar';
import MobileSelectionBar from './MobileSelectionBar';
import AnalysisDetailModal from './AnalysisDetailModal';
import { SimulationModal } from '../simulation';
import FilterPanel, { FilterState } from './FilterPanel';
import { sortSCPIByTaxOptimization } from '../../utils/taxOptimization';
import { matchesSectorFilter, calculateSectorRelevanceScore } from '../../utils/sectorQualification';
import { enrichScpiExtendedArray } from '../../utils/enrichScpiExtended';
import { getLatestScoresBatch } from '../../utils/scpiScoreService';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import { computeClientScores } from '../../utils/computeClientScores';
import ComparisonWarning from '../ComparisonWarning';
import ZScoreBar from '../ZScoreBar';
import Toast from '../Toast';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, Label } from 'recharts';
import { getInvestorProfile } from '../../utils/investorProfile';
import { getZScoreAttention } from '../../utils/zScoreAttention';
import { isVeryWellDiversified } from '../../config/diversificationDoctrine';
import { resolveDisplayedDiscount } from '../../utils/formatters';

type ViewMode = 'grid' | 'list';

const QUICK_FILTERS = [
  { id: 'high-yield', label: 'Rendement élevé' },
  { id: 'low-debt', label: 'Faible endettement' },
  { id: 'attractive-discount', label: 'Décote attractive' },
  { id: 'europe', label: 'Europe' },
  { id: 'sante', label: 'Santé' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'defensive', label: 'SCPI défensives' },
];

interface ProFintechComparatorContentProps {
  onCloseAnalysis?: () => void;
  onGuidedJourneyClick?: () => void;
  hideTitle?: boolean;
  zScoreVariant?: 'full' | 'compact';
}

const ProFintechComparatorContent: React.FC<ProFintechComparatorContentProps> = ({
  onCloseAnalysis,
  onGuidedJourneyClick,
  hideTitle = false,
  zScoreVariant = 'full'
}) => {
  const [selectedScpis, setSelectedScpis] = useState<SCPIExtended[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const clientLinkId = useMemo(() => Date.now().toString(36).toUpperCase(), []);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'yield' | 'price'>('yield');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [analysisScpi, setAnalysisScpi] = useState<SCPIExtended | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const [scoresBySlug, setScoresBySlug] = useState<Record<string, number>>({});
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tmi: null,
    minYield: 0,
    priceRange: 'all',
    geographies: [],
    sectors: [],
    sectorThreshold: '25', // Par défaut : exposition significative (≥25%)
    hasISR: null,
    noEntryFees: false,
    expertMode: false,
    discountRange: [-15, 10],
    minRanDays: 0,
    maxLtv: 100,
    noWaitingShares: false
  });

  // Enrichir les données SCPI avec les informations du fichier Excel
  const enrichedScpiData = useMemo(() => {
    const enriched = enrichScpiExtendedArray(scpiDataExtended, scpiData);
    // Debug: vérifier si Paref Evo est présent
    const parefEvo = enriched.find(s => s.name === 'Paref Evo');
    if (!parefEvo) {
      console.warn('[FintechComparator] Paref Evo non trouvé dans enrichedScpiData');
      console.log('[FintechComparator] SCPI disponibles:', enriched.map(s => s.name).filter(n => n.toLowerCase().includes('paref')));
    }
    return enriched;
  }, []);

  // Note MaximusSCPI calculée côté client sur l'ensemble de la cohorte (percentile cohérent).
  // Source de vérité de la note affichée ; Supabase reste une surcouche optionnelle.
  const clientScoresBySlug = useMemo(
    () => computeClientScores(enrichedScpiData).bySlug,
    [enrichedScpiData]
  );

  const handleQuickFilter = (id: string) => {
    setQuickFilters(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      // Appliquer les filtres rapides via le state filters existant
      const updates: Partial<FilterState> = {};
      // Réinitialiser les filtres avant d'appliquer les quick filters
      let geographies: string[] = [];
      let sectors: string[] = [];
      let minYield = 0;
      let maxLtv = 100;
      let discountRange: [number, number] = [-15, 10];

      if (next.includes('high-yield')) minYield = 5.5;
      if (next.includes('low-debt')) maxLtv = 50;
      if (next.includes('attractive-discount')) discountRange = [-25, -5];
      if (next.includes('europe')) geographies = ['Europe'];
      if (next.includes('sante')) sectors = ['Santé'];
      if (next.includes('commerce')) sectors = sectors.length > 0 ? [...sectors, 'Commerces'] : ['Commerces'];
      if (next.includes('defensive')) {
        sectors = ['Santé', 'Commerces'];
        geographies = geographies.length > 0 ? geographies : ['France'];
        maxLtv = Math.min(maxLtv, 60);
      }

      setFilters(prevFilters => ({
        ...prevFilters,
        minYield,
        maxLtv,
        discountRange,
        geographies,
        sectors,
        sectorThreshold: sectors.length > 0 ? '10' : '25',
      }));
      return next;
    });
  };

  const toggleSelect = (scpi: SCPIExtended) => {
    setSelectedScpis(prev => {
      const exists = prev.find(s => s.id === scpi.id);
      if (exists) {
        return prev.filter(s => s.id !== scpi.id);
      }
      if (prev.length >= 6) {
        if (typeof window !== 'undefined') {
          window.alert('Vous pouvez sélectionner jusqu’à 6 SCPI maximum dans votre portefeuille.');
        }
        return prev;
      }
      return [...prev, scpi];
    });
  };

  // Initialiser les allocations à répartition égale quand les SCPI sélectionnées changent
  const initAllocations = useMemo(() => {
    if (selectedScpis.length === 0) return {};
    const equal = Math.floor(100 / selectedScpis.length);
    const remainder = 100 - equal * selectedScpis.length;
    const allocs: Record<string, number> = {};
    selectedScpis.forEach((s, i) => {
      allocs[s.id] = i < remainder ? equal + 1 : equal;
    });
    return allocs;
  }, [selectedScpis.map(s => s.id).join(',')]);

  // Appliquer l'initialisation uniquement si aucun alloc n'existe OU si les SCPI ont changé
  useEffect(() => {
    const currentIds = selectedScpis.map(s => s.id).sort().join(',');
    const storedIds = Object.keys(allocations).sort().join(',');
    if (currentIds !== storedIds) {
      setAllocations(initAllocations);
    }
  }, [initAllocations]);

  // Scroll to top à chaque changement d'étape
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main') || document.getElementById('pro-layout');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, [currentStep]);

  const handleAllocationChange = (scpiId: string, newValue: number) => {
    setAllocations(prev => {
      const next = { ...prev, [scpiId]: Math.min(100, Math.max(0, newValue)) };
      // Ajuster les autres SCPI proportionnellement pour maintenir 100%
      const otherIds = Object.keys(next).filter(id => id !== scpiId);
      const totalOthers = otherIds.reduce((sum, id) => sum + next[id], 0);
      const newTotal = next[scpiId] + totalOthers;
      if (newTotal !== 100 && otherIds.length > 0 && totalOthers > 0) {
        const diff = 100 - next[scpiId];
        otherIds.forEach(id => {
          next[id] = Math.round((next[id] / totalOthers) * diff);
        });
        // Corriger l'arrondi
        const adjustedTotal = Object.values(next).reduce((sum, v) => sum + v, 0);
        if (adjustedTotal !== 100 && otherIds.length > 0) {
          next[otherIds[0]] += 100 - adjustedTotal;
        }
      }
      return next;
    });
  };

  // ── Pop-up public de résultats : helpers & calculs (injectés dans Step 2) ──
  const LEGEND_COLORS = {
    sectors: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c'],
    geography: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c']
  };
  const GRADIENT_IDS = {
    sectors: ['gradBlue', 'gradTeal', 'gradOrange', 'gradPink', 'gradPurple', 'gradCyan', 'gradLime', 'gradRed'],
    geography: ['gradBlue2', 'gradTeal2', 'gradOrange2', 'gradPink2', 'gradPurple2', 'gradCyan2', 'gradLime2', 'gradRed2']
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cleanName = (name: string) => name.replace(/^[\s,\.]+/, '').trim();
      return (
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-xl">
          <p className="text-white font-semibold text-sm">{cleanName(payload[0].name)}</p>
          <p className="text-emerald-400 font-bold text-lg">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  // State pour la configuration du portefeuille (pop-up public)
  const [totalAmount, setTotalAmount] = useState(100000);
  const [scpiPercentages, setScpiPercentages] = useState<Record<string, number>>({});
  const [investmentMode, setInvestmentMode] = useState<'cash' | 'credit' | 'demembrement'>('cash');
  const [demembrementDurationYears, setDemembrementDurationYears] = useState(8);

  // Initialiser les pourcentages à parts égales
  useEffect(() => {
    if (selectedScpis.length > 0) {
      const equalPercentage = 100 / selectedScpis.length;
      const initialPercentages: Record<string, number> = {};
      selectedScpis.forEach(scpi => { initialPercentages[scpi.id] = equalPercentage; });
      setScpiPercentages(initialPercentages);
    } else {
      setScpiPercentages({});
    }
  }, [selectedScpis.length]);

  const investorProfileLabel = useMemo(() => getInvestorProfile(), []);

  // cleanName / normalize helpers (issus du pop-up public)
  const cleanName = (name: string) => name.replace(/^[\s,\.]+/, '').trim();
  const normalizeSectorName = (name: string): string => {
    const cleaned = cleanName(name);
    const lower = cleaned.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes('hotel') || lower.includes('hotellerie') || lower.includes('tourisme') || lower.includes('loisir') || lower.includes('seminaire') || lower.includes('séminaire')) return 'Hôtels, tourisme, loisirs';
    if ((lower.includes('sante') || lower.includes('santé')) && (lower.includes('education') || lower.includes('éducation') || lower.includes('enseignement'))) return 'Santé et éducation';
    if (lower.includes('sante') || lower.includes('santé')) return 'Santé et éducation';
    if (lower.includes('education') || lower.includes('éducation') || lower.includes('enseignement')) return 'Santé et éducation';
    if (lower.includes('logistique') || lower.includes('entrepot') || lower.includes('entrepôt') || lower.includes('activite') || lower.includes('activité') || lower.includes('transport')) return "Logistique et locaux d'activités";
    if (lower.includes('commerce')) return 'Commerces';
    if (lower.includes('bureau') && !lower.includes('commerce')) return 'Bureaux';
    if (lower.includes('residentiel') || lower.includes('résidentiel') || lower.includes('logement') || lower.includes('habitation')) return 'Résidentiel';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };
  const geoKeywords = ['france','paris','région','europe','espagne','allemagne','italie','royaume','pays','belgique','portugal','étranger','international','idf','ile-de-france','atlantique','parisienne','dorsale','métropol','irlande','pologne','uk','pays-bas','netherlands','hollande','suisse','luxembourg','autriche','grèce','danemark','suède','norvège','finlande','tchéquie','hongrie','roumanie','bulgarie','croatie','slovénie'];
  const isGeographicName = (name: string) => geoKeywords.some(kw => name.toLowerCase().includes(kw));
  const normalizeGeographyName = (name: string): { key: string; label: string } => {
    const cleaned = cleanName(name);
    const normalized = cleaned.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g,' ').trim();
    const toKey = (v: string) => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'').trim();
    if (!normalized) return { key:'', label:'' };
    const exactMap: Record<string,string> = { 'france':'France','idf':'France','ile de france':'France','paris':'France','region':'France','regions':'France','europe':'Europe','ue':'Europe','union europeenne':'Europe','zone euro':'Europe','international':'International','autres':'Autres','royaume uni':'Royaume-Uni','uk':'Royaume-Uni','angleterre':'Royaume-Uni','etats unis':'États-Unis','usa':'États-Unis' };
    if (exactMap[normalized]) return { key:toKey(exactMap[normalized]), label:exactMap[normalized] };
    if (normalized.includes('france')) return { key:'france', label:'France' };
    if (normalized.includes('europe')) return { key:'europe', label:'Europe' };
    if (normalized.includes('international')) return { key:'international', label:'International' };
    return { key:toKey(cleaned), label:cleaned };
  };

  // Répartitions agrégées (calcul public)
  const calculateAggregatedSectors = () => {
    const sectorMap: Record<string,number> = {};
    const weightPerScpi = 100 / selectedScpis.length;
    selectedScpis.forEach(scpi => {
      if (scpi.sectors && scpi.sectors.length > 0) {
        scpi.sectors.forEach(sector => {
          if (isGeographicName(sector.name)) return;
          const n = normalizeSectorName(sector.name);
          if (!sectorMap[n]) sectorMap[n] = 0;
          sectorMap[n] += (sector.value * weightPerScpi) / 100;
        });
      }
    });
    return Object.entries(sectorMap).map(([name,value]) => ({ name, value: Math.round(value * 10) / 10 })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);
  };
  const calculateAggregatedGeography = () => {
    const geoMap: Record<string,{name:string;value:number}> = {};
    const weightPerScpi = 100 / selectedScpis.length;
    selectedScpis.forEach(scpi => {
      if (scpi.geography && scpi.geography.length > 0) {
        scpi.geography.forEach(geo => {
          const n = normalizeGeographyName(geo.name);
          if (!n.key) return;
          if (!geoMap[n.key]) geoMap[n.key] = { name:n.label, value:0 };
          geoMap[n.key].value += (geo.value * weightPerScpi) / 100;
        });
      }
    });
    return Object.values(geoMap).map(item => ({ name:item.name, value:Math.round(item.value * 10) / 10 })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);
  };

  const aggregatedSectors = calculateAggregatedSectors();
  const aggregatedGeography = calculateAggregatedGeography();
  const avgYield = selectedScpis.reduce((sum, s) => sum + s.yield, 0) / selectedScpis.length;
  const minInvestment = selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);

  const calculateMaximusAvis = () => {
    const sectorDiv = Math.min(aggregatedSectors.length / 1, 5);
    const geoDiv = Math.min(aggregatedGeography.length / 1, 5);
    let perf = 0;
    if (avgYield >= 6) perf = 5; else if (avgYield >= 5) perf = 4; else if (avgYield >= 4) perf = 3; else if (avgYield >= 3) perf = 2; else perf = 1;
    const avgTof = selectedScpis.reduce((sum,s) => sum + (s.tof||0), 0) / selectedScpis.length;
    let liq = 0; if (avgTof >= 95) liq = 5; else if (avgTof >= 92) liq = 4; else if (avgTof >= 90) liq = 3; else if (avgTof >= 85) liq = 2; else liq = 1;
    const div = Math.min(selectedScpis.length, 5);
    const maxSW = aggregatedSectors.length > 0 ? aggregatedSectors[0].value : 0;
    let risk = 5; if (maxSW > 60) risk = 2; else if (maxSW > 50) risk = 3; else if (maxSW > 40) risk = 4;
    const weightedSum = sectorDiv * 1.0 + geoDiv * 1.0 + perf * 1.0 + liq * 1.2 + div * 1.2 + risk * 1.3;
    const weightedMax = 5 * (1.0 + 1.0 + 1.0 + 1.2 + 1.2 + 1.3);
    const overall = Math.round((weightedSum / weightedMax) * 5);
    return { sectorDiversity: Math.round(sectorDiv), geoDiversity: Math.round(geoDiv), performance: perf, liquidity: Math.round(liq), diversification: div, risk, overall: Math.max(1, Math.min(5, overall)) };
  };
  const maximusAvis = calculateMaximusAvis();
  const coherenceZScore = Number((maximusAvis.overall - 3).toFixed(2));

  const analyzePortfolioProsCons = () => {
    const pros: string[] = [];
    const consGeneral: string[] = [];
    const consStructural: string[] = [];
    
    // ── Règle 1 : Diversification (nombre de SCPI) ──
    if (selectedScpis.length >= 4) pros.push('Diversification optimale avec plusieurs SCPI, réduisant significativement le risque de concentration');
    else if (selectedScpis.length >= 2) consGeneral.push('Diversification limitée : la sélection repose sur un nombre réduit de SCPI.');
    else consStructural.push("Concentration sur une seule SCPI : risque spécifique non diversifié, la sélection repose sur un seul support.");
    
    const isHD = isVeryWellDiversified(aggregatedSectors.length, aggregatedGeography.length);

    // ── Règle 2 : Concentration d'une SCPI dans l'allocation (>50%) ──
    const maxScpiWeight = Object.keys(scpiPercentages).length > 0
      ? Math.max(...Object.values(scpiPercentages))
      : selectedScpis.length > 0 ? (100 / selectedScpis.length) : 0;
    if (selectedScpis.length >= 2 && maxScpiWeight > 50) {
      consGeneral.push(`Concentration élevée : une SCPI représente ${maxScpiWeight.toFixed(0)}% de la sélection.`);
    }

    // Analyse sectorielle
    const maxSW = aggregatedSectors.length > 0 ? aggregatedSectors[0].value : 0;
    if (aggregatedSectors.length >= 4) pros.push("Excellente diversification sectorielle couvrant plusieurs segments de l'immobilier, résilience accrue face aux cycles économiques");
    else if (aggregatedSectors.length >= 2) pros.push('Diversification sectorielle correcte, mais pourrait être améliorée pour une meilleure résilience');
    else if (!isHD) consStructural.push('Concentration sectorielle importante : exposition accrue aux risques spécifiques du secteur, diversification recommandée');

    // ── Règle 3 : Concentration sectorielle (>60%) ──
    if (maxSW > 60) {
      const dominantSector = aggregatedSectors[0]?.name || 'dominant';
      consGeneral.push(`Concentration sectorielle : exposition dominante au secteur "${dominantSector}" (${maxSW.toFixed(0)}%).`);
    }

    // Analyse géographique
    const hasEurope = aggregatedGeography.some((g: any) => g.name.toLowerCase().includes('europe') || g.name.toLowerCase().includes('européen'));
    const hasFrance = aggregatedGeography.some((g: any) => g.name.toLowerCase().includes('france') || g.name.toLowerCase().includes('français'));
    if (aggregatedGeography.length >= 3) pros.push('Exposition géographique diversifiée, réduction du risque géopolitique et économique local');
    else if (hasEurope && hasFrance) pros.push('Répartition France/Europe équilibrée, bonne exposition aux marchés européens');
    else if (hasEurope && !isHD) pros.push('Exposition européenne intéressante pour la diversification géographique');
    else if (!isHD) consStructural.push('Concentration géographique sur la France : considérer une exposition européenne pour réduire le risque pays');

    // ── Règle 5 : Rendement élevé >8% ──
    if (avgYield > 8) {
      consGeneral.push(`Rendement moyen élevé (${avgYield.toFixed(2)}%) : vérifier la soutenabilité du taux de distribution.`);
    } else if (avgYield >= 6) pros.push(`Rendement moyen attractif (${avgYield.toFixed(2)}%), supérieur à la moyenne du marché SCPI`);
    else if (avgYield >= 5) pros.push(`Rendement moyen correct (${avgYield.toFixed(2)}%), aligné avec les standards du marché`);
    else if (avgYield >= 4) consGeneral.push(`Rendement moyen modéré (${avgYield.toFixed(2)}%) : envisager l'ajout de SCPI à rendement plus élevé pour optimiser la performance`);

    // ── Règle 6 : TOF individuel < 90% ──
    const lowTofScpis = selectedScpis.filter(s => (s.tof || 0) < 90 && (s.tof || 0) > 0);
    if (lowTofScpis.length > 0) {
      const names = lowTofScpis.map(s => s.name).slice(0, 2).join(', ');
      consGeneral.push(`Occupation à surveiller : ${names} présente${lowTofScpis.length > 1 ? 'nt' : ''} un TOF inférieur à 90%.`);
    }

    // ── Règle 4 : Concentration société de gestion (>50%) ──
    if (selectedScpis.length >= 2) {
      const mgmtCount: Record<string, number> = {};
      selectedScpis.forEach(s => {
        const m = s.managementCompany || 'Inconnue';
        mgmtCount[m] = (mgmtCount[m] || 0) + 1;
      });
      const dominant = Object.entries(mgmtCount).find(([, c]) => c / selectedScpis.length > 0.5);
      if (dominant) consGeneral.push(`Concentration société de gestion : plus de 50% de la sélection provient de ${dominant[0]}.`);
    }

    // Analyse de la concentration (complément)
    if (!isHD) {
      if (maxSW > 60) consStructural.push(`Concentration sectorielle élevée (${maxSW.toFixed(1)}% sur un seul secteur) : risque de corrélation élevée en cas de crise sectorielle`);
      else if (maxSW > 50) consStructural.push(`Concentration sectorielle modérée (${maxSW.toFixed(1)}%) : considérer une meilleure répartition pour réduire le risque`);
      else pros.push('Répartition sectorielle équilibrée, bonne diversification des risques');
    } else pros.push('Répartition sectorielle et géographique étendue, lecture globale robuste.');

    const hasRes = aggregatedSectors.some((s: any) => s.name.toLowerCase().includes('résidentiel') || s.name.toLowerCase().includes('residentiel'));
    const hasComm = aggregatedSectors.some((s: any) => s.name.toLowerCase().includes('commerce') || s.name.toLowerCase().includes('bureau'));
    if (hasRes && hasComm) pros.push('Mix résidentiel/commercial équilibré, optimisation fiscale et diversification des revenus locatifs');
    
    if (hasEurope && !hasFrance) consStructural.push('Exposition uniquement européenne : risque de change EUR présent, considérer une part française pour équilibrer');
    
    const hasLowTof = selectedScpis.some(s => (s.tof || 0) < 85);
    if (hasLowTof) consGeneral.push('Certaines SCPI présentent un TOF faible : risque de liquidité sur le marché secondaire, délais de revente potentiellement allongés');
    
    if (selectedScpis.length < 3) consStructural.push("Portefeuille sous-diversifié : envisager l'ajout de 2 à 4 SCPI supplémentaires pour optimiser le ratio risque/rendement");
    
    return { pros, consGeneral, consStructural };
  };
  const zScoreAttention = getZScoreAttention(coherenceZScore, aggregatedSectors.length, aggregatedGeography.length);
  const portfolioProsCons = analyzePortfolioProsCons();
  const allowStructural = zScoreAttention?.level === 'concentration' || zScoreAttention?.level === 'dispersion-excessive';
  const zScoreWarning = allowStructural ? `${zScoreAttention!.shortLabel} : ${zScoreAttention!.message}` : null;
  const consWithZScore = [...portfolioProsCons.consGeneral, ...(zScoreWarning ? [zScoreWarning] : [])];

  // Portfolio analysis (configuration du portefeuille)

  // Helpers pour la section Détail / Répartition
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diversifiée': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Résidentiel': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Santé': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bureaux': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Européenne': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Logistique': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getDiscountPremium = (scpi: SCPIExtended): { value: number; isDiscount: boolean } | null => {
    const value = resolveDisplayedDiscount(scpi).value;
    if (value == null) return null;
    return { value, isDiscount: value < 0 };
  };

  const updatePercentage = (scpiId: string, newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, newPercentage));
    setScpiPercentages(prev => ({ ...prev, [scpiId]: clamped }));
  };

  const normalizePercentages = () => {
    const total = Object.values(scpiPercentages).reduce((sum, p) => sum + p, 0);
    if (total === 0) return;
    const normalized: Record<string, number> = {};
    Object.keys(scpiPercentages).forEach(scpiId => {
      normalized[scpiId] = (scpiPercentages[scpiId] / total) * 100;
    });
    setScpiPercentages(normalized);
  };

  const portfolioAnalysis = useMemo(() => {
    if (selectedScpis.length === 0) return null;
    const scpiDataArr = selectedScpis.map(scpi => {
      const pct = scpiPercentages[scpi.id] || 0;
      const amount = (totalAmount * pct) / 100;
      const annual = (amount * scpi.yield) / 100;
      return { id: scpi.id, name: scpi.name, percentage: pct, amount, yield: scpi.yield, annualIncome: annual, monthlyIncome: annual / 12, price: scpi.price, minInvestment: scpi.minInvestment, parts: Math.floor(amount / scpi.price) };
    });
    const weightedYield = scpiDataArr.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0);
    const totalAnnual = scpiDataArr.reduce((sum, item) => sum + item.annualIncome, 0);
    return { scpiData: scpiDataArr, totalAmount, totalPercentage: Object.values(scpiPercentages).reduce((s,p) => s + p, 0), weightedYield, totalAnnualIncome: totalAnnual, totalMonthlyIncome: totalAnnual / 12 };
  }, [selectedScpis, scpiPercentages, totalAmount]);
  // ── Fin des helpers du pop-up public ──

  const applyFilters = (scpi: SCPIExtended): boolean => {
    if (scpi.yield < filters.minYield) return false;

    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'accessible' && scpi.price >= 300) return false;
      if (filters.priceRange === 'standard' && (scpi.price < 300 || scpi.price > 1000)) return false;
      if (filters.priceRange === 'premium' && scpi.price <= 1000) return false;
    }

    if (filters.geographies.length > 0) {
      const hasMatchingGeo = scpi.geography.some(geo => {
        const geoName = geo.name.toLowerCase();
        if (filters.geographies.includes('France') &&
            (geoName.includes('france') || geoName.includes('paris') || geoName.includes('région'))) {
          return true;
        }
        if (filters.geographies.includes('Europe') &&
            !geoName.includes('france') && !geoName.includes('paris') &&
            (geoName.includes('europe') || geoName.includes('allemagne') || geoName.includes('espagne') ||
             geoName.includes('italie') || geoName.includes('belgique') || geoName.includes('pays-bas') ||
             geoName.includes('irlande') || geoName.includes('portugal') || geoName.includes('pologne'))) {
          return true;
        }
        if (filters.geographies.includes('International') &&
            (geoName.includes('royaume') || geoName.includes('étranger') || geoName.includes('ocde'))) {
          return true;
        }
        return false;
      });
      if (!hasMatchingGeo) return false;
    }

    if (filters.sectors.length > 0) {
      // Utiliser la nouvelle logique de filtrage avec seuil
      if (!matchesSectorFilter(scpi, filters.sectors, filters.sectorThreshold)) {
        return false;
      }
    }

    if (filters.expertMode) {
      if (scpi.reconstitutionValue) {
        const discount = ((scpi.price - scpi.reconstitutionValue) / scpi.reconstitutionValue) * 100;
        if (discount < filters.discountRange[0] || discount > filters.discountRange[1]) {
          return false;
        }
      }

      if (scpi.ranDays !== undefined && scpi.ranDays < filters.minRanDays) {
        return false;
      }

      if (scpi.ltv !== undefined && scpi.ltv > filters.maxLtv) {
        return false;
      }

      if (filters.noWaitingShares && scpi.hasWaitingShares) {
        return false;
      }
    }

    return true;
  };

  // Créer une copie profonde pour éviter les mutations sur des tableaux gelés en production
  // Utiliser les données enrichies avec les informations du fichier Excel
  let filteredData = [...enrichedScpiData].filter(scpi =>
    (scpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scpi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scpi.managementCompany.toLowerCase().includes(searchQuery.toLowerCase())) &&
    applyFilters(scpi)
  );

  // Si un filtre sectoriel est actif, trier par score de pertinence sectorielle
  if (filters.sectors.length > 0) {
    filteredData = filteredData.map(scpi => ({
      scpi,
      sectorScore: calculateSectorRelevanceScore(scpi, filters.sectors, filters.sectorThreshold)
    })).sort((a, b) => {
      // Trier d'abord par score sectoriel (décroissant), puis par optimisation fiscale
      if (b.sectorScore !== a.sectorScore) {
        return b.sectorScore - a.sectorScore;
      }
      return 0; // On garde l'ordre original pour les scores égaux
    }).map(item => item.scpi);
  }

  // Appliquer le tri par optimisation fiscale
  filteredData = sortSCPIByTaxOptimization(filteredData, filters.tmi, sortBy);

  const itemsPerPage = viewMode === 'grid' ? 9 : 15;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, viewMode, filters]);

  const paginatedSlugsKey = useMemo(
    () => paginatedData.map(s => s.id).join(','),
    [currentPage, filteredData, itemsPerPage]
  );
  useEffect(() => {
    const slugs = paginatedData.map(s => createSlugFromName(s.name)).filter(Boolean);
    if (slugs.length === 0) return;
    getLatestScoresBatch(slugs).then(newScores => {
      if (Object.keys(newScores).length > 0) {
        setScoresBySlug(prev => ({ ...prev, ...newScores }));
      }
    });
  }, [paginatedSlugsKey]);


  const handleAnalyze = (scpi: SCPIExtended) => {
    // Sauvegarder la position de scroll avant d'ouvrir le modal
    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    setSavedScrollPosition(currentScrollY);
    setAnalysisScpi(scpi);
  };

  const activeFiltersCount =
    (filters.tmi !== null ? 1 : 0) +
    (filters.minYield > 0 ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    filters.geographies.length +
    (filters.sectors.length > 0 ? 1 : 0) + // Compter le filtre sectoriel comme 1 même si plusieurs secteurs
    (filters.sectorThreshold !== '25' ? 1 : 0) + // Compter si le seuil n'est pas le défaut
    (filters.hasISR !== null && filters.hasISR !== undefined ? 1 : 0) +
    (filters.noEntryFees ? 1 : 0) +
    (filters.expertMode ? (
      (filters.discountRange[0] !== -15 || filters.discountRange[1] !== 10 ? 1 : 0) +
      (filters.minRanDays > 0 ? 1 : 0) +
      (filters.maxLtv < 100 ? 1 : 0) +
      (filters.noWaitingShares ? 1 : 0)
    ) : 0);

  return (
    <div className="min-h-screen bg-slate-900" id="comparator-container">
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ── Onboarding (Étape 1 uniquement) ── */}
        {onboardingVisible && currentStep === 1 && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-800/40">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-emerald-300">
                  Filtrez et sélectionnez vos SCPI pour préparer un support client professionnel et structuré.
                </h2>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  Connexion Pro Active • <span className="text-emerald-400 font-semibold">{filteredData.length} SCPI</span> disponibles
                </span>
                <button
                  onClick={() => setOnboardingVisible(false)}
                  className="text-slate-600 hover:text-slate-400 transition shrink-0"
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ── Toolbar (Étape 1 uniquement) ── */}
        {currentStep === 1 && (
        <div className="mt-6 rounded-xl bg-slate-800/80 border border-slate-700 p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {filteredData.length} SCPI disponibles • Page {currentPage} sur {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filters.tmi !== null && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-lg">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-200">TMI</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                    {filters.tmi}%
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">Liste</span>
                </button>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden relative w-12 h-12 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center transition-all shrink-0"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, gestionnaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-3 bg-slate-950 border border-slate-600 text-white placeholder-slate-400 rounded-full shadow-md focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Filtres rapides :</span>
            {QUICK_FILTERS.map((qf) => {
              const active = quickFilters.includes(qf.id);
              return (
                <button
                  key={qf.id}
                  onClick={() => handleQuickFilter(qf.id)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium border transition whitespace-nowrap ${
                    active
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* ── Stepper / Fil d'Ariane ── */}
        <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
          <span
            onClick={() => selectedScpis.length > 0 && setCurrentStep(1)}
            className={`text-sm font-semibold cursor-pointer transition-colors ${
              currentStep >= 1 ? 'text-emerald-400' : 'text-slate-600'
            }`}
          >
            1. Sélection
          </span>
          <span className="text-slate-600">→</span>
          <span
            onClick={() => selectedScpis.length > 0 && setCurrentStep(2)}
            className={`text-sm font-semibold transition-colors ${
              currentStep >= 2 ? 'text-emerald-400' : 'text-slate-600'
            } ${selectedScpis.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            2. Analyse
          </span>
          <span className="text-slate-600">→</span>
          <span
            onClick={() => selectedScpis.length > 0 && setCurrentStep(3)}
            className={`text-sm font-semibold transition-colors ${
              currentStep >= 3 ? 'text-emerald-400' : 'text-slate-600'
            } ${selectedScpis.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            3. Vidéos
          </span>
          <span className="text-slate-600">→</span>
          <span className={`text-sm font-semibold transition-colors ${
            currentStep >= 4 ? 'text-emerald-400' : 'text-slate-600'
          }`}>
            4. Livrables
          </span>
        </div>

        {/* ══════════ ÉTAPE 1 : SÉLECTION ══════════ */}
        {currentStep === 1 && (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <main className="min-w-0 pb-24 lg:pb-6">
          <div>
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
                <p className="text-slate-400 mb-4">
                  Essayez de modifier votre recherche
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div id="scpi-grid" className="mt-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {paginatedData.map(scpi => (
                      <ProSCPICardDark
                        key={scpi.id}
                        scpi={scpi}
                        score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                        isSelected={selectedScpis.some(s => s.id === scpi.id)}
                        onToggleSelect={() => toggleSelect(scpi)}
                        onAnalyze={() => handleAnalyze(scpi)}
                        userTmi={filters.tmi}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/70">
                    <div className="min-w-[980px]">
                      <div className="grid grid-cols-[minmax(180px,1.4fr)_130px_120px_70px_80px_100px_72px_180px] items-center border-b border-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <div>SCPI</div>
                        <div>Catégorie</div>
                        <div>Rendement</div>
                        <div>TOF</div>
                        <div>Prix</div>
                        <div>Invest. Min.</div>
                        <div>Note</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {paginatedData.map(scpi => (
                        <SCPITableRow
                          key={scpi.id}
                          scpi={scpi}
                          score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                          isSelected={selectedScpis.some(s => s.id === scpi.id)}
                          onToggleSelect={() => toggleSelect(scpi)}
                          onAnalyze={() => handleAnalyze(scpi)}
                          userTmi={filters.tmi}
                          variant="pro"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="md:hidden mt-16 grid grid-cols-1 gap-6">
                    {paginatedData.map(scpi => (
                      <ProSCPICardDark
                        key={scpi.id}
                        scpi={scpi}
                        score={scoresBySlug[createSlugFromName(scpi.name)] ?? clientScoresBySlug[createSlugFromName(scpi.name)] ?? null}
                        isSelected={selectedScpis.some(s => s.id === scpi.id)}
                        onToggleSelect={() => toggleSelect(scpi)}
                        onAnalyze={() => handleAnalyze(scpi)}
                        userTmi={filters.tmi}
                      />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === 1
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        Page {currentPage} sur {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        currentPage === totalPages
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <span>Suivant</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {filteredData.length > 0 && (
                  <div className="mt-12 max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">Avertissement : </span>
                        Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Les simulations et projections affichées sont indicatives et ne constituent ni un engagement contractuel ni une promesse de rendement.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Sidebar Étape 1 — Mini-cartes SCPI sélectionnées uniquement */}
        <aside className="block xl:sticky xl:top-24 scroll-mt-20">
          <div className="hidden lg:block w-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-3">
            <div className="sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Ma Sélection</h3>
                  {selectedScpis.length > 0 && (
                    <button onClick={() => setSelectedScpis([])} className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                      Réinitialiser
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {selectedScpis.length} SCPI sélectionnée{selectedScpis.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Jusqu'à <span className="font-semibold text-slate-300">6 SCPI</span> maximum dans votre portefeuille.
                </p>
              </div>

              <div className="space-y-3 mb-6 max-h-[calc(100vh-450px)] overflow-y-auto">
                {selectedScpis.map(scpi => (
                  <div key={scpi.id} className="bg-slate-900 rounded-lg p-4 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{scpi.name}</h4>
                        <p className="text-xs text-slate-400">{scpi.managementCompany}</p>
                      </div>
                      <button onClick={() => toggleSelect(scpi)} className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Rendement</p>
                        <p className="text-lg font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Prix</p>
                        <p className="text-sm font-semibold text-white">{scpi.price}€</p>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedScpis.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">Aucune SCPI sélectionnée</p>
                    <p className="text-xs text-slate-600 mt-1">Cliquez sur "+ Ajouter" dans le tableau</p>
                  </div>
                )}
              </div>

              {/* CTA Étape 1 → 2 */}
              <button
                disabled={selectedScpis.length === 0}
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50"
              >
                Valider la sélection ➔
              </button>

              <p className="text-[10px] text-center text-slate-600 mt-3 px-1 leading-relaxed">
                Outil d'aide à l'analyse. Ne constitue pas une recommandation personnalisée.
              </p>
            </div>
          </div>
        </aside>
        </div>
        )}

        {/* ══════════ ÉTAPE 2 : ANALYSE DES RÉSULTATS ══════════ */}
        {currentStep === 2 && (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <main className="min-w-0 pb-24 lg:pb-6">
            {/* === CONTENU RÉORGANISÉ EN 3 SECTIONS D'ACCENT === */}
            <section className="space-y-8">

              {/* ▸▸▸ SECTION 1 : COHÉRENCE DU PORTEFEUILLE (emerald) */}
              <div className="rounded-2xl border border-emerald-500/25 border-l-4 border-l-emerald-400 bg-slate-900/60 p-4 sm:p-6 shadow-sm">
                <header className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-300">
                    <Award className="w-5 h-5" />
                    Cohérence du portefeuille
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Lecture structurelle de la sélection et identification des points de vigilance.
                  </p>
                </header>

                {/* Analyse de cohérence du portefeuille (User + titre interne supprimé → fusionné dans le header) */}
                {/* Score de cohérence */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <p className="text-[11px] text-slate-400 mb-1">Lecture de cohérence détectée</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-300">Score de cohérence</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < maximusAvis.overall ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">Indicateur de cohérence structurelle — pas une note de qualité ni de performance.</p>
                  <p className="text-xs text-slate-300 italic mb-1">Score de cohérence issu d'une analyse multicritères pondérée.</p>
                  <p className="text-xs text-slate-300">
                    {maximusAvis.overall >= 4
                      ? 'Structure globalement cohérente au regard des critères analysés.'
                      : maximusAvis.overall >= 3
                      ? 'Structure équilibrée à confirmer selon votre situation réelle.'
                      : "Aucune incohérence majeure détectée à ce stade, mais la diversification reste à renforcer."}
                  </p>
                </div>

                {/* Critères détaillés */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Répartition sectorielle</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < maximusAvis.sectorDiversity ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Répartition géographique</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < maximusAvis.geoDiversity ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">Potentiel de rendement</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < maximusAvis.performance ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-300 italic">Indicateur basé sur des données historiques, non garanti.</p>
                  </div>
                  <div className="flex items-center justify-between group relative">
                    <span className="text-xs text-slate-300 cursor-help">Liquidité<span className="ml-1 text-[10px] text-slate-300">ℹ️</span></span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < maximusAvis.liquidity ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                    <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-xs text-slate-300">
                      <p className="font-semibold mb-2 text-white">Évaluation de la liquidité</p>
                      <p className="mb-1">Basée sur le taux d'occupation financier (TOF) moyen.</p>
                      <p className="text-slate-300 italic">La liquidité SCPI dépend également de :</p>
                      <ul className="list-disc list-inside mt-1 text-slate-300 space-y-0.5">
                        <li>Délai de jouissance</li>
                        <li>Mutualisation locative</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Diversification</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < maximusAvis.diversification ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Maîtrise du risque</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < maximusAvis.risk ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Z-Score */}
                <div className="pt-4 border-t border-slate-700 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-300">Z-score de cohérence du portefeuille</span>
                      <span className="text-[11px] text-slate-400" title="Z-score de cohérence MaximusSCPI® — Indicateur propriétaire d'écart structurel — non prédictif de performance.">ⓘ</span>
                    </div>
                  </div>
                  <ZScoreBar zScore={coherenceZScore} profileLabel={investorProfileLabel} variant="full" />
                </div>

                {/* Analyse de cohérence */}
                <div className="pt-4 border-t border-slate-700 mb-4">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3">Lecture structurelle</h4>
                  {zScoreAttention && zScoreAttention.level === 'coherence-elevee' ? (
                    <div className="text-[11px] sm:text-xs text-slate-300 space-y-1">
                      <div className="font-semibold text-slate-200">{zScoreAttention.shortLabel}</div>
                      <div>{zScoreAttention.message}</div>
                    </div>
                  ) : (
                    <p className="text-[11px] sm:text-xs text-slate-300">Lecture structurelle neutre. Aucun signal structurel dominant n'est identifié.</p>
                  )}
                </div>

                {/* Avantages et Inconvénients */}
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4">Points forts & Vigilances</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-emerald-500/10 rounded-lg p-3 sm:p-4 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></div>
                        <h5 className="text-xs sm:text-sm font-bold text-emerald-400">Points forts</h5>
                      </div>
                      {portfolioProsCons.pros.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                          {portfolioProsCons.pros.map((pro, idx) => (
                            <li key={idx} className="text-[10px] sm:text-xs text-slate-300 flex items-start gap-1.5 sm:gap-2">
                              <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-slate-400 italic">Aucun point fort identifié</p>
                      )}
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 sm:p-4 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400"></div>
                        <h5 className="text-xs sm:text-sm font-bold text-amber-400">Vigilances structurelles</h5>
                      </div>
                      {consWithZScore.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                          {consWithZScore.map((con, idx) => (
                            <li key={idx} className="text-[10px] sm:text-xs text-slate-300 flex items-start gap-1.5 sm:gap-2">
                              <span className="text-slate-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-slate-400 italic">Aucun point de vigilance majeur détecté selon les critères disponibles.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 italic leading-relaxed">
                      <strong className="text-slate-300">Note :</strong> Cette analyse est basée sur les caractéristiques objectives du portefeuille sélectionné. Elle ne constitue pas un conseil personnalisé en investissement. Un conseiller certifié ORIAS analysera votre situation personnelle avant toute décision.
                    </p>
                  </div>
                </div>
              </div>

              {/* ▸▸▸ SECTION 2 : RÉPARTITION & DIVERSIFICATION (bleu) */}
              {aggregatedSectors.length > 0 && aggregatedGeography.length > 0 && (
              <div className="rounded-2xl border border-blue-500/25 border-l-4 border-l-blue-400 bg-slate-900/60 p-4 sm:p-6 shadow-sm">
                <header className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-300">
                    <PieChartIcon className="w-5 h-5" />
                    Répartition &amp; diversification
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Visualisation des expositions sectorielles et géographiques du portefeuille.
                  </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Sectoriel */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Répartition Sectorielle
                    </h3>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPie>
                          <defs>
                            {GRADIENT_IDS.sectors.map((id, i) => (
                              <linearGradient key={id} id={`${id}-pro`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#22d3ee','#a3e635','#fb923c'][i]} stopOpacity={1} />
                                <stop offset="100%" stopColor={LEGEND_COLORS.sectors[i]} stopOpacity={1} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie data={aggregatedSectors} cx="50%" cy="50%" innerRadius="50%" outerRadius="85%" paddingAngle={0} dataKey="value" animationBegin={0} animationDuration={800} animationEasing="ease-out">
                            {aggregatedSectors.map((entry, index) => (
                              <Cell key={`cell-sector-${index}`} fill={`url(#${GRADIENT_IDS.sectors[index % 8]}-pro)`} stroke="#1e293b" strokeWidth={2} style={{ outline: 'none' }} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-xl font-bold text-white">{aggregatedSectors.length}</div>
                        <div className="text-xs text-slate-300">secteurs</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
                      {aggregatedSectors.map((sector, index) => (
                        <div key={sector.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LEGEND_COLORS.sectors[index % LEGEND_COLORS.sectors.length] }}></div>
                            <span className="text-slate-300 truncate">{sector.name}</span>
                          </div>
                          <span className="font-semibold text-white">{sector.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Géographique */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Répartition Géographique
                    </h3>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPie>
                          <defs>
                            {GRADIENT_IDS.geography.map((id, i) => (
                              <linearGradient key={id} id={`${id}-pro`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#22d3ee','#a3e635','#fb923c'][i]} stopOpacity={1} />
                                <stop offset="100%" stopColor={LEGEND_COLORS.geography[i]} stopOpacity={1} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie data={aggregatedGeography} cx="50%" cy="50%" innerRadius="50%" outerRadius="85%" paddingAngle={0} dataKey="value" animationBegin={0} animationDuration={800} animationEasing="ease-out">
                            {aggregatedGeography.map((entry, index) => (
                              <Cell key={`cell-geo-${index}`} fill={`url(#${GRADIENT_IDS.geography[index % 8]}-pro)`} stroke="#1e293b" strokeWidth={2} style={{ outline: 'none' }} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-xl font-bold text-white">{aggregatedGeography.length}</div>
                        <div className="text-xs text-slate-300">zones</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
                      {aggregatedGeography.map((geo, index) => (
                        <div key={geo.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LEGEND_COLORS.geography[index % LEGEND_COLORS.geography.length] }}></div>
                            <span className="text-slate-300 truncate">{geo.name}</span>
                          </div>
                          <span className="font-semibold text-white">{geo.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* ▸▸▸ SECTION 3 : SIMULATION & PROJECTION (violet) */}
              <div className="rounded-2xl border border-violet-500/25 border-l-4 border-l-violet-400 bg-slate-900/60 p-4 sm:p-6 shadow-sm">
                <header className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-violet-300">
                    <Sliders className="w-5 h-5" />
                    Simulation &amp; projection
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Paramétrage du montant, du mode d'investissement et des revenus estimés.
                  </p>
                </header>

                {/* Récapitulatif sélection */}
                <p className="text-xs sm:text-sm text-slate-300 mb-4">
                  Vous avez sélectionné <span className="font-semibold text-white">{selectedScpis.length} SCPI</span>.
                  {portfolioAnalysis && <> Montant total : <span className="font-semibold text-violet-300">{totalAmount.toLocaleString('fr-FR')}€</span></>}
                </p>

                {/* KPIs rapides */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-violet-500/20">
                    <p className="text-[10px] text-slate-400 mb-0.5">Rendement moyen estimé</p>
                    <p className="text-lg font-bold text-violet-300">{avgYield.toFixed(2)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-violet-500/20">
                    <p className="text-[10px] text-slate-400 mb-0.5">Investissement minimal estimé</p>
                    <p className="text-lg font-bold text-violet-300">{minInvestment.toLocaleString('fr-FR')}€</p>
                  </div>
                </div>

                {/* Configuration du portefeuille */}
                {portfolioAnalysis && (
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-5 border border-slate-700">
                  <h4 className="text-sm font-bold text-white mb-4">Configuration du portefeuille</h4>
                  {/* Mode d'investissement */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Mode d'investissement</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cash','credit','demembrement'] as const).map(mode => (
                        <button key={mode} type="button" onClick={() => setInvestmentMode(mode)}
                          className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all ${investmentMode === mode ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/30' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>
                          {mode === 'cash' ? 'Comptant' : mode === 'credit' ? 'Crédit' : 'Démembrement'}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] sm:text-xs text-slate-400">Sélectionnez votre mode pour voir l'impact sur les revenus, le cash-flow ou la valeur future.</p>
                  </div>
                  {/* Montant total */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Montant total à investir</label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-violet-500" min="0" step="1000" />
                      <span className="text-slate-400 font-semibold text-sm">€</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[50000,100000,150000,200000,300000].map(amount => (
                        <button key={amount} type="button" onClick={() => setTotalAmount(amount)} className={`px-2 py-1 text-[10px] rounded-lg transition-colors ${totalAmount === amount ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                          {amount.toLocaleString('fr-FR')}€
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* ── Mode Comptant ── */}
                  {investmentMode === 'cash' && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400 mb-3">Simulation en pleine propriété avec perception immédiate des revenus potentiels.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                            <p className="text-[10px] text-slate-400">Rendement pondéré</p>
                          </div>
                          <p className="text-lg sm:text-xl font-bold text-violet-300">{portfolioAnalysis.weightedYield.toFixed(2)}%</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                            <p className="text-[10px] text-slate-400">Revenus / an</p>
                          </div>
                          <p className="text-lg sm:text-xl font-bold text-violet-300">{portfolioAnalysis.totalAnnualIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                            <p className="text-[10px] text-slate-400">Revenus / mois</p>
                          </div>
                          <p className="text-lg sm:text-xl font-bold text-violet-300">{portfolioAnalysis.totalMonthlyIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Mode Crédit ── */}
                  {investmentMode === 'credit' && (
                    <div className="bg-violet-500/5 rounded-lg p-4 border border-violet-500/20">
                      <h5 className="text-sm font-semibold text-violet-200 mb-3">Simulation à crédit</h5>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Montant financé</p>
                          <p className="text-lg font-bold text-white">{totalAmount.toLocaleString('fr-FR')}€</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Rendement pondéré</p>
                          <p className="text-lg font-bold text-violet-300">{portfolioAnalysis.weightedYield.toFixed(2)}%</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Revenus annuels potentiels</p>
                          <p className="text-lg font-bold text-violet-300">{portfolioAnalysis.totalAnnualIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Revenus mensuels potentiels</p>
                          <p className="text-lg font-bold text-violet-300">{portfolioAnalysis.totalMonthlyIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
                        Paramètres de crédit à compléter : taux, durée, apport et mensualité. Contactez votre conseiller pour une simulation personnalisée.
                      </p>
                    </div>
                  )}

                  {/* ── Mode Démembrement ── */}
                  {investmentMode === 'demembrement' && (
                    <div className="bg-violet-500/5 rounded-lg p-4 border border-violet-500/20">
                      <h5 className="text-sm font-semibold text-violet-200 mb-3">Simulation en nue-propriété</h5>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Montant investi</p>
                          <p className="text-lg font-bold text-white">{totalAmount.toLocaleString('fr-FR')}€</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Revenus / période</p>
                          <p className="text-lg font-bold text-slate-500">0 €</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Rendement distribué</p>
                          <p className="text-sm font-semibold text-slate-500">Non perçu par le nu-propriétaire</p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] text-slate-400 mb-0.5">Durée indicative</p>
                          <p className="text-lg font-bold text-violet-300">{demembrementDurationYears} ans</p>
                        </div>
                      </div>
                      {/* Sélecteur de durée */}
                      <div className="mb-3">
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Durée de démembrement</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[5, 8, 10].map(d => (
                            <button key={d} type="button"
                              onClick={() => setDemembrementDurationYears(d)}
                              className={`px-3 py-1 text-[10px] rounded-lg transition-colors ${demembrementDurationYears === d ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                              {d} ans
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
                        La simulation en démembrement suppose l'absence de revenus pendant la période de démembrement. La valorisation dépend de la clé de démembrement retenue.
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* ── Revenus annuels par SCPI (bar chart) ── */}
                {portfolioAnalysis && (
                  <div className="mt-8 pt-6 border-t border-slate-700/50 mb-5">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                      Revenus annuels par SCPI
                    </h4>
                    <div className="bg-slate-900 rounded-lg p-2 sm:p-4 border border-slate-700">
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={portfolioAnalysis.scpiData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, 'Revenus annuels']}
                          />
                          <Bar dataKey="annualIncome" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* ── Répartition modulable par SCPI ── */}
                {portfolioAnalysis && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
                        <PieChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                        Répartition du portefeuille (%)
                      </h4>
                      <button
                        type="button"
                        onClick={normalizePercentages}
                        className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors"
                      >
                        Normaliser
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {portfolioAnalysis.scpiData.map((item) => {
                        const scpi = selectedScpis.find(s => s.id === item.id);
                        if (!scpi) return null;
                        return (
                          <div key={item.id} className="bg-slate-900 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs sm:text-sm font-semibold text-white truncate">{scpi.name}</p>
                                <p className="text-[10px] sm:text-xs text-slate-400">
                                  {item.amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                                  {' • '}
                                  {item.parts} part{item.parts > 1 ? 's' : ''}
                                  {' • '}
                                  {item.yield.toFixed(2)}%
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-base sm:text-lg font-bold text-violet-400">{item.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={item.percentage}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value);
                                  updatePercentage(item.id, newValue);
                                }}
                                className="flex-1 h-1.5 sm:h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                              />
                              <input
                                type="number"
                                value={item.percentage.toFixed(1)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  updatePercentage(item.id, newValue);
                                }}
                                className="w-16 sm:w-20 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="text-slate-400 text-xs sm:text-sm w-4 sm:w-6">%</span>
                            </div>
                            <div className="mt-1.5 sm:mt-2 h-0.5 sm:h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-300"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {portfolioAnalysis.totalPercentage !== 100 && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-yellow-400">
                          Total: {portfolioAnalysis.totalPercentage.toFixed(1)}%
                          {portfolioAnalysis.totalPercentage < 100
                            ? ` (${(100 - portfolioAnalysis.totalPercentage).toFixed(1)}% non alloué)`
                            : ` (${(portfolioAnalysis.totalPercentage - 100).toFixed(1)}% en trop)`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Répartition visuelle du portefeuille (camembert) ── */}
                {portfolioAnalysis && (
                  <div className="mb-5">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <PieChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                      Répartition visuelle du portefeuille
                    </h4>
                    <div className="bg-slate-900 rounded-lg p-2 sm:p-4 border border-slate-700">
                      <div className="relative">
                        <ResponsiveContainer width="100%" height={220}>
                          <RechartsPie>
                            <defs>
                              {portfolioAnalysis.scpiData.map((_, index) => {
                                const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                                return (
                                  <linearGradient key={`grad-pro-${index}`} id={`gradScpiPro-${index}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9} />
                                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.7} />
                                  </linearGradient>
                                );
                              })}
                            </defs>
                            <Pie
                              data={portfolioAnalysis.scpiData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="percentage"
                              strokeWidth={0}
                            >
                              {portfolioAnalysis.scpiData.map((entry, index) => (
                                <Cell key={`cell-pro-${index}`} fill={`url(#gradScpiPro-${index})`} stroke="transparent" />
                              ))}
                              <Label
                                content={({ viewBox }: any) => {
                                  const { cx, cy } = viewBox;
                                  return (
                                    <g>
                                      <text x={cx} y={cy - 12} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight={500}>
                                        Total
                                      </text>
                                      <text x={cx} y={cy + 14} textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight={700}>
                                        {totalAmount.toLocaleString('fr-FR')}€
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                            </Pie>
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      {/* Légende */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {portfolioAnalysis.scpiData.map((item, index) => {
                          const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                          return (
                            <div key={item.id} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors[index % colors.length] }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-white truncate" title={item.name}>
                                  {item.name}
                                </p>
                                <p className="text-[9px] text-slate-400">
                                  {item.percentage.toFixed(1)}% — {item.amount.toLocaleString('fr-FR')}€
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Détail de votre sélection ── */}
                {selectedScpis.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-300 mb-3 font-semibold">Détail de votre sélection</p>
                    <div className="space-y-3">
                      {selectedScpis.map(scpi => (
                        <div key={scpi.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-semibold text-white">{scpi.name}</p>
                              <p className="text-xs text-slate-300">{scpi.managementCompany}</p>
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-semibold border ${getCategoryColor(scpi.category)}`}>
                              {scpi.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[11px] text-slate-300">
                            <div>
                              <p className="text-[10px] text-slate-300">Rendement</p>
                              <p className="font-semibold text-violet-400">{scpi.yield.toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-300">Prix de part</p>
                              <p className="font-semibold text-white">{scpi.price}€</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-300">Invest. min.</p>
                              <p className="font-semibold text-white">{scpi.minInvestment.toLocaleString('fr-FR')}€</p>
                            </div>
                            {scpi.capitalization && (
                              <div>
                                <p className="text-[10px] text-slate-300">Capitalisation</p>
                                <p className="font-semibold text-white">{scpi.capitalization}</p>
                              </div>
                            )}
                            {typeof scpi.tof === 'number' && (
                              <div>
                                <p className="text-[10px] text-slate-300">Taux d'occupation</p>
                                <p className="font-semibold text-white">{scpi.tof.toFixed(1)}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-slate-300">Horizon recommandé</p>
                              <p className="font-semibold text-white">10 ans</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-300">Distribution</p>
                              <p className="font-semibold text-white">Trimestriel</p>
                            </div>
                            {scpi.reconstitutionValue && (
                              <div>
                                <p className="text-[10px] text-slate-300">Valeur reconstitution</p>
                                <p className="font-semibold text-white">{scpi.reconstitutionValue}€</p>
                              </div>
                            )}
                            {typeof scpi.ltv === 'number' && (
                              <div>
                                <p className="text-[10px] text-slate-300">Endettement</p>
                                <p className="font-semibold text-white">{scpi.ltv}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-slate-300">Nombre d'immeubles</p>
                              <p className="font-semibold text-white">
                                {typeof scpi.assetsCount === 'number' ? scpi.assetsCount : 'N/A'}
                              </p>
                            </div>
                            {getDiscountPremium(scpi) && (
                              <div>
                                <p className="text-[10px] text-slate-300">Décote / Surcote</p>
                                {(() => {
                                  const info = getDiscountPremium(scpi);
                                  if (!info) return null;
                                  const label = info.isDiscount ? 'Décote' : 'Surcote';
                                  return (
                                    <p className={`font-semibold ${info.isDiscount ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {info.value > 0 ? '+' : ''}
                                      {info.value.toFixed(1)}%
                                      <span className="text-[10px] text-slate-300 ml-1">({label})</span>
                                    </p>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </section>

            {/* CTAs Étape 2 */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>← Retour au marché</span>
              </button>
              <button onClick={() => setCurrentStep(3)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-600 transition-all flex items-center justify-center gap-2">
                <span>Continuer vers les Vidéos ➔</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </main>

          {/* Sidebar Étape 2 — Z-Score de cohérence */}
          <aside className="block xl:sticky xl:top-24 scroll-mt-20">
            <div className="hidden lg:block w-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-3">
              <div className="sticky top-24">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Z-Score de Cohérence</h3>
                  <p className="text-sm text-slate-400">Analyse de diversification en temps réel</p>
                </div>

                <div className="bg-slate-900/70 rounded-lg p-4 mb-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-300">Z-score du portefeuille</span>
                    <span className="text-[11px] text-slate-400" title="Z-score de cohérence MaximusSCPI®">ⓘ</span>
                  </div>
                  <ZScoreBar zScore={coherenceZScore} profileLabel="CGP" variant="full" />
                  <p className="text-xs text-slate-500 mt-3">
                    {selectedScpis.length >= 4 ? 'Excellente diversification sectorielle et géographique.' :
                     selectedScpis.length >= 2 ? "Diversification correcte — envisagez d'élargir le portefeuille." :
                     "Ajoutez au moins 2 SCPI pour une analyse de cohérence."}
                  </p>
                </div>

                {selectedScpis.length > 0 && (
                  <>
                    <div className="bg-emerald-500/10 rounded-lg p-4 mb-3 border border-emerald-500/30">
                      <p className="text-xs text-emerald-400 font-medium mb-1">Rendement pondéré</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {portfolioAnalysis ? portfolioAnalysis.weightedYield.toFixed(2) : avgYield.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 mb-3 border border-slate-700">
                      <p className="text-xs text-slate-400 font-medium mb-1">Investissement min.</p>
                      <p className="text-xl font-bold text-white">
                        {minInvestment.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-center text-slate-600 mt-3 px-1 leading-relaxed">
                  Outil d'aide à l'analyse. Ne constitue pas une recommandation personnalisée.
                </p>
              </div>
            </div>
          </aside>
        </div>
        )}

        {/* ══════════ ÉTAPE 3 : RÉSULTATS + VIDÉOS ══════════ */}
        {currentStep === 3 && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Synthèse de l'Allocation</h2>
            <p className="text-sm text-slate-400 mb-4">Prévisualisez les indicateurs clés et les vidéos associées.</p>

            {/* KPIs récapitulatifs */}
            {selectedScpis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 font-medium mb-1">Rendement pondéré</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {selectedScpis.reduce((sum, s) => sum + s.yield * ((allocations[s.id] ?? 0) / 100), 0).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 font-medium mb-1">SCPI sélectionnées</p>
                  <p className="text-2xl font-bold text-white">{selectedScpis.length}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 font-medium mb-1">Investissement min.</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedScpis.reduce((min, s) => Math.min(min, s.minInvestment), Infinity).toLocaleString('fr-FR')}€
                  </p>
                </div>
              </div>
            )}

            {/* Hub Vidéo — une carte par SCPI */}
            <h3 className="text-lg font-bold text-white mb-4">Vidéos de présentation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedScpis.map((scpi) => {
                const primaryGeo = scpi.geography && scpi.geography.length > 0 ? scpi.geography[0].name : 'France';
                const geoNames = scpi.geography?.map(g => g.name).slice(0, 2).join(' · ') || 'France';
                return (
                <div key={scpi.id} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-emerald-500/40 transition-colors">
                  {/* Player vidéo placeholder */}
                  <div className="relative aspect-video bg-slate-800 flex items-center justify-center group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    <PlayCircle className="w-12 h-12 text-emerald-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-2 right-2 text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded">90s</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white text-sm">{scpi.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{scpi.managementCompany}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-emerald-400 font-semibold">{scpi.yield.toFixed(2)}%</span>
                      <span className="text-xs text-slate-500">TOF {scpi.tof}%</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">{geoNames}</span>
                    </div>
                  </div>
                </div>
                );
              })}
              {selectedScpis.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500 text-sm">
                  Aucune SCPI sélectionnée pour la prévisualisation vidéo.
                </div>
              )}
            </div>
          </div>

          {/* CTAs Étape 3 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modifier l'allocation</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <span>Générer les Livrables</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        )}

        {/* ══════════ ÉTAPE 4 : LIVRABLES & LIENS ══════════ */}
        {currentStep === 4 && (() => {
          const shareUrl = `https://maximusscpi.com/share/${clientLinkId}`;
          return (
          <div className="mt-8 max-w-2xl mx-auto text-center py-12 px-4">
            {/* Icône de succès + Titres */}
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Votre support client est prêt !
            </h2>
            <p className="text-slate-400 text-sm mb-10">
              Le dossier client a été packagé avec succès.
            </p>

            {/* ── Bloc 1 : Lien de partage sécurisé ── */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-slate-500 mb-2 font-medium tracking-wide uppercase">
                Lien de partage sécurisé
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-300 font-mono tracking-tight focus:outline-none cursor-default select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setCopied(true);
                      setToastMessage('Lien copié dans le presse-papier !');
                      setShowToast(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 shrink-0 ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
                </button>
              </div>
            </div>

            {/* ── Bloc 2 : Téléchargement Synthèse PDF ── */}
            <button
              onClick={() => {
                setToastMessage('Téléchargement de la synthèse graphique (PDF)...');
                setShowToast(true);
              }}
              className="w-full py-4 px-6 bg-transparent border border-slate-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-800/50 hover:border-slate-500 mb-10"
            >
              <FileText className="w-5 h-5 text-slate-300" />
              <span>Télécharger la Synthèse Graphique (PDF)</span>
            </button>

            {/* ── Bloc 3 : Nouveau dossier client ── */}
            <hr className="border-slate-700 mb-8" />
            <button
              onClick={() => {
                setSelectedScpis([]);
                setAllocations({});
                setCurrentStep(1);
                setOnboardingVisible(true);
              }}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold text-sm transition-all"
            >
              Nouveau dossier client
            </button>

            {/* Disclaimer réglementaire */}
            <p className="mt-10 text-[10px] text-slate-600 leading-relaxed max-w-md mx-auto">
              Les investissements en SCPI présentent un risque de perte en capital, une liquidité non garantie et un horizon de placement long. Les performances passées ne préjugent pas des performances futures. Ce document ne constitue pas une recommandation personnalisée.
            </p>
          </div>
          );
        })()}
      </section>

      {/* Avertissement de comparaison si mélange France/Europe */}
      {selectedScpis.length >= 2 && (
        <div id="selection-section" className="scroll-mt-20">
          <ComparisonWarning scpiList={selectedScpis} className="mx-4 mb-4" />
        </div>
      )}

      {/* Mobile Selection Bar */}
      <MobileSelectionBar
        count={selectedScpis.length}
        onOpen={() => setIsSimulationOpen(true)}
        selectedScpis={selectedScpis}
      />

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        selectedScpis={selectedScpis}
      />

      {/* Analysis Detail Modal */}
      {analysisScpi && (
        <AnalysisDetailModal
          key={analysisScpi.id}
          isOpen={!!analysisScpi}
          onClose={() => {
            // Fermer le modal
            setAnalysisScpi(null);
            // Restaurer la position de scroll exacte après fermeture du modal
            setTimeout(() => {
              window.scrollTo({
                top: savedScrollPosition,
                behavior: 'instant' // Utiliser 'instant' pour éviter tout effet de scroll visible
              });
            }, 50);
          }}
          scpi={analysisScpi}
          score={scoresBySlug[createSlugFromName(analysisScpi.name)] ?? clientScoresBySlug[createSlugFromName(analysisScpi.name)] ?? null}
          onAdd={() => {
            // Ajouter la SCPI à la sélection
            toggleSelect(analysisScpi);
            // Le modal se fermera automatiquement via onClose dans AnalysisDetailModal
            // et restaurera la position de scroll exacte
          }}
          isSelected={selectedScpis.some(s => s.id === analysisScpi.id)}
          onShowToast={(message) => {
            setToastMessage(message);
            setShowToast(true);
          }}
        />
      )}

      {/* Toast de confirmation */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={1000}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredData.length}
      />
    </div>
  );
};

interface ProFintechComparatorProps {
  onCloseAnalysis?: () => void;
  onGuidedJourneyClick?: () => void;
  hideTitle?: boolean;
  zScoreVariant?: 'full' | 'compact';
}

const ProFintechComparator: React.FC<ProFintechComparatorProps> = ({
  onCloseAnalysis,
  onGuidedJourneyClick,
  hideTitle = false,
  zScoreVariant = 'full'
}) => {
  return (
    <AllocationProvider>
      <SubscriptionProvider>
        <ProFintechComparatorContent
          onCloseAnalysis={onCloseAnalysis}
          onGuidedJourneyClick={onGuidedJourneyClick}
          hideTitle={hideTitle}
          zScoreVariant={zScoreVariant}
        />
      </SubscriptionProvider>
    </AllocationProvider>
  );
};

export default ProFintechComparator;
