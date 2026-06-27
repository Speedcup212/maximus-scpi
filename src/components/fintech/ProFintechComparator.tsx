import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Grid3x3, List, ChevronLeft, ChevronRight, ChevronDown, Calculator, Link, Copy, ArrowLeft, ArrowRight, RotateCcw, Download, PlayCircle, FileText, User, Star, Award, TrendingUp, DollarSign, Sliders, PieChart as PieChartIcon, Shield, CheckCircle2, BarChart3 } from 'lucide-react';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { scpiData } from '../../data/scpiData';
import { AllocationProvider } from '../../contexts/AllocationContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import ProSCPICardDark from './ProSCPICardDark';
import SCPITableRow from './SCPITableRow';
import ProSelectionSidebar from './ProSelectionSidebar';
import MobileSelectionBar from './MobileSelectionBar';
import AnalysisDetailModal from './AnalysisDetailModal';
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
import { normalizeGeoLabel } from '../../utils/geoNormalization';

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
  const [expandedScpiIds, setExpandedScpiIds] = useState<Set<number>>(new Set());
  const [hoveredSlice, setHoveredSlice] = useState<any>(null);

  const toggleExpandScpi = (id: number) => {
    setExpandedScpiIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
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

  // Paramètres du mode Crédit
  const [creditApport, setCreditApport] = useState(0);
  const [creditDurationYears, setCreditDurationYears] = useState(20);
  const [creditRate, setCreditRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.3);
  const [creditDeferred, setCreditDeferred] = useState<'none' | 'partial' | 'total'>('none');
  const [creditDeferredMonths, setCreditDeferredMonths] = useState(0);
  const [creditRateInput, setCreditRateInput] = useState<string>('');
  const [insuranceRateInput, setInsuranceRateInput] = useState<string>('');

  // Paramètres du mode Démembrement
  const [demembrementType, setDemembrementType] = useState<'nue-propriete' | 'usufruit'>('nue-propriete');
  const [demembrementCleNp, setDemembrementCleNp] = useState(65);
  const [demembrementRevalo, setDemembrementRevalo] = useState(1.0);

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
    const geoNorm = normalizeGeoLabel(cleaned);
    if (geoNorm) return geoNorm;
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
    const consStructural: string[] = [];

    const sectorCount = aggregatedSectors.length;
    const geoCount = aggregatedGeography.length;
    const maxSW = sectorCount > 0 ? aggregatedSectors[0].value : 0;
    const maxGeoW = geoCount > 0 ? aggregatedGeography[0].value : 0;
    const maxScpiWeight = Object.keys(scpiPercentages).length > 0
      ? Math.max(...Object.values(scpiPercentages))
      : selectedScpis.length > 0 ? (100 / selectedScpis.length) : 0;
    const averageTOF = selectedScpis.length > 0
      ? selectedScpis.reduce((sum, s) => sum + (s.tof || 0), 0) / selectedScpis.length
      : 0;

    // Rendement pondéré inline (portfolioAnalysis n'est défini qu'après)
    let wy = 0, totalPctW = 0;
    selectedScpis.forEach(s => {
      const pct = scpiPercentages[s.id] || (100 / selectedScpis.length || 0);
      wy += s.yield * pct;
      totalPctW += pct;
    });
    const weightedYield = totalPctW > 0 ? wy / totalPctW : avgYield;

    // ── Vérifications complémentaires ──
    const hasDiscount = selectedScpis.some(s => {
      const v = resolveDisplayedDiscount(s).value;
      return v != null && v < 0;
    });
    const hasSmallCap = selectedScpis.some(s => {
      const cap = (s as any).capitalization;
      if (!cap) return false;
      const num = parseFloat(String(cap).replace(/[^0-9.]/g, ''));
      return !isNaN(num) && num < 100;
    });
    const hasLowTofBelow85 = selectedScpis.some(s => (s.tof || 0) < 85 && (s.tof || 0) > 0);

    const hasSatisfactoryDiversification =
      selectedScpis.length >= 2 &&
      sectorCount >= 5 &&
      geoCount >= 5 &&
      maxSW < 60 &&
      maxScpiWeight <= 50;

    // ═══════════ POINTS FORTS (max 6) ═══════════
    // Priorité 1 : diversification globale
    if (hasSatisfactoryDiversification) {
      pros.push('Diversification sectorielle et géographique satisfaisante.');
    } else if (selectedScpis.length >= 4) {
      pros.push('Diversification optimale avec plusieurs SCPI, réduisant la concentration.');
    }

    // Priorité 2 : allocation équilibrée
    if (maxScpiWeight <= 40) {
      pros.push('Répartition équilibrée entre les supports sélectionnés.');
    } else if (maxScpiWeight <= 50) {
      pros.push('Absence de concentration excessive sur une seule SCPI.');
    }

    // Priorité 3a : diversification sectorielle
    if (sectorCount >= 7) pros.push('Exposition sectorielle large, couvrant plusieurs segments immobiliers.');
    else if (sectorCount >= 5) pros.push('Diversification sectorielle correcte.');

    // Priorité 3b : diversification géographique
    if (geoCount >= 7) pros.push('Diversification géographique étendue sur plusieurs zones.');
    else if (geoCount >= 5) pros.push('Diversification géographique satisfaisante.');

    // Priorité 4 : rendement
    if (weightedYield >= 5 && weightedYield <= 8.5) {
      pros.push('Rendement moyen cohérent avec une approche patrimoniale équilibrée.');
    } else if (weightedYield > 8.5) {
      pros.push('Rendement moyen attractif, à analyser au regard de sa soutenabilité.');
    } else if (weightedYield >= 4) {
      pros.push('Rendement moyen modéré, aligné avec les standards conservateurs du marché.');
    }

    // Priorité 5 : TOF
    if (averageTOF >= 95) pros.push("Taux d'occupation financier globalement solide.");

    // Priorité 6 : ticket d'entrée
    const minInvest = selectedScpis.reduce((min, s) => Math.min(min, s.minInvestment), Infinity);
    if (minInvest <= 5000 && selectedScpis.length > 0) {
      pros.push("Ticket d'entrée accessible pour une construction progressive.");
    }

    // Priorité 7 : décote
    if (hasDiscount) pros.push('Décote moyenne favorable par rapport aux valeurs de reconstitution disponibles.');

    // Limiter à 6 points forts max
    const trimmedPros = pros.slice(0, 6);

    // ═══════════ VIGILANCES (max 5) ═══════════
    // Priorité 1 : concentration SCPI
    if (selectedScpis.length >= 2 && maxScpiWeight > 50) {
      consStructural.push(`Concentration élevée : une SCPI représente ${maxScpiWeight.toFixed(0)} % de la sélection.`);
    }

    // Priorité 2 : concentration sectorielle
    if (maxSW >= 60 && sectorCount > 0) {
      const dominantSector = aggregatedSectors[0]?.name || 'dominant';
      consStructural.push(`Concentration sectorielle : exposition dominante au secteur « ${dominantSector} » (${maxSW.toFixed(0)} %).`);
    }

    // Priorité 3 : concentration géographique
    if (maxGeoW >= 60 && geoCount > 0) {
      const dominantGeo = aggregatedGeography[0]?.name || 'dominante';
      consStructural.push(`Concentration géographique : exposition dominante sur la zone « ${dominantGeo} » (${maxGeoW.toFixed(0)} %).`);
    }

    // Priorité 4 : rendement élevé
    if (weightedYield > 10) {
      consStructural.push(`Rendement très élevé (${weightedYield.toFixed(1)} %) : contrôler l'origine de la performance et sa récurrence.`);
    } else if (weightedYield > 8.5) {
      consStructural.push(`Rendement moyen élevé (${weightedYield.toFixed(1)} %) : vérifier la soutenabilité du taux de distribution.`);
    }

    // Priorité 5 : TOF faible
    if (averageTOF < 90 && averageTOF > 0) {
      consStructural.push("Taux d'occupation financier à surveiller sur une ou plusieurs SCPI.");
    } else if (averageTOF < 95 && averageTOF > 0) {
      consStructural.push("Taux d'occupation financier correct mais à suivre.");
    }

    // Priorité 6 : capitalisation faible
    if (hasSmallCap) {
      consStructural.push('Présence de SCPI de taille réduite : surveiller la profondeur de marché et la liquidité.');
    }

    // Priorité 7 : nombre de supports (SEULEMENT si diversification insatisfaisante)
    if (!hasSatisfactoryDiversification) {
      if (selectedScpis.length < 2) {
        consStructural.push('Nombre de supports très limité : la sélection repose sur un seul véhicule.');
      } else if (!hasSatisfactoryDiversification && sectorCount < 5) {
        consStructural.push('Diversification sectorielle à renforcer.');
      }
      if (!hasSatisfactoryDiversification && geoCount < 5) {
        consStructural.push('Diversification géographique à renforcer.');
      }
    }

    // Priorité 8 : liquidité
    if (hasLowTofBelow85) {
      consStructural.push('Liquidité SCPI à surveiller : les délais de retrait peuvent varier selon le marché secondaire.');
    }

    // Limiter à 5 vigilances max
    const dedupedCons = consStructural.filter((v, i, a) => a.indexOf(v) === i);
    const trimmedCons = dedupedCons.slice(0, 5);

    return { pros: trimmedPros, consGeneral: trimmedCons, consStructural: [] };
  };
  const zScoreAttention = getZScoreAttention(coherenceZScore, aggregatedSectors.length, aggregatedGeography.length);
  const portfolioProsCons = analyzePortfolioProsCons();
  const allowStructural = zScoreAttention?.level === 'concentration' || zScoreAttention?.level === 'dispersion-excessive';
  const zScoreWarning = allowStructural ? `${zScoreAttention!.shortLabel} : ${zScoreAttention!.message}` : null;
  const consWithZScore = [...portfolioProsCons.consGeneral, ...(zScoreWarning ? [zScoreWarning] : [])];

  // Portfolio analysis (configuration du portefeuille)

  // Helpers pour la section Détail / Répartition
  const formatCurrency = (value: number): string =>
    value.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  const formatPercent = (value: number): string =>
    value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

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

  // Profil de risque global du portefeuille (échelle 1-7)
  const portfolioRiskScore = useMemo(() => {
    if (selectedScpis.length === 0) return 0;
    // Calcul basé sur le rendement pondéré, le nombre de SCPI et le TOF moyen
    const wy = portfolioAnalysis?.weightedYield ?? (selectedScpis.reduce((sum, s) => sum + s.yield, 0) / selectedScpis.length);
    const tof = selectedScpis.reduce((sum, s) => sum + (s.tof || 0), 0) / selectedScpis.length;
    let score = 3; // Défaut modéré
    if (selectedScpis.length < 2) {
      if (wy < 5) score = 1; else if (wy < 6.5) score = 2; else if (wy < 8) score = 3; else score = 4;
    } else {
      if (wy < 7) score = 2; else if (wy < 8.5) score = 3; else score = 4;
    }
    // Ajustement TOF : -1 si TOF faible, +1 si excellent
    if (tof < 85) score = Math.max(1, score - 1);
    else if (tof >= 98) score = Math.min(7, score + 1);
    return score;
  }, [selectedScpis, portfolioAnalysis]);

  // Calculs spécifiques au mode Crédit
  const creditMetrics = useMemo(() => {
    if (!portfolioAnalysis || investmentMode !== 'credit') return null;
    const financedAmount = Math.max(0, portfolioAnalysis.totalAmount - creditApport);
    const years = Math.max(1, creditDurationYears);
    const n = years * 12;
    const monthlyRate = creditRate > 0 ? (creditRate / 100) / 12 : 0;
    const monthlyInsuranceRate = (insuranceRate / 100) / 12;
    let monthlyCreditPayment = 0;
    if (monthlyRate > 0 && financedAmount > 0) {
      const factor = Math.pow(1 + monthlyRate, -n);
      monthlyCreditPayment = (financedAmount * monthlyRate) / (1 - factor);
    } else if (financedAmount > 0) {
      monthlyCreditPayment = financedAmount / n;
    }
    const monthlyInsurance = financedAmount * monthlyInsuranceRate;
    const monthlyTotal = monthlyCreditPayment + monthlyInsurance;
    const monthlyScpiIncome = portfolioAnalysis.totalMonthlyIncome;
    const monthlyEffort = monthlyTotal - monthlyScpiIncome;
    const monthlyCashflow = monthlyScpiIncome - monthlyTotal;
    const monthlyInterest = financedAmount * monthlyRate;
    const monthlyDeferredCost = creditDeferred === 'partial'
      ? monthlyInterest + monthlyInsurance
      : creditDeferred === 'total'
      ? monthlyInsurance
      : 0;
    const annualInterestApprox = financedAmount * (creditRate / 100);
    const annualCreditPaid = monthlyCreditPayment * 12;
    const annualPrincipalRepaid = Math.max(0, annualCreditPaid - annualInterestApprox);
    const annualCashflow = monthlyCashflow * 12;
    const equity = Math.max(creditApport, 0.0001);
    const realReturnOnEquity = ((annualCashflow + annualPrincipalRepaid) / equity) * 100;
    return { financedAmount, monthlyCreditPayment, monthlyInsurance, monthlyTotal, monthlyScpiIncome, monthlyEffort, monthlyCashflow, monthlyDeferredCost, annualPrincipalRepaid, realReturnOnEquity };
  }, [portfolioAnalysis, investmentMode, creditApport, creditDurationYears, creditRate, insuranceRate, creditDeferred]);

  // Calculs spécifiques au mode Démembrement
  const demembrementMetrics = useMemo(() => {
    if (!portfolioAnalysis || investmentMode !== 'demembrement') return null;
    const cleNp = Math.max(10, Math.min(90, demembrementCleNp));
    const cleUs = 100 - cleNp;
    const duree = Math.max(1, demembrementDurationYears);
    const revalo = demembrementRevalo / 100;
    const fullPropertyValueToday = portfolioAnalysis.totalAmount;
    const priceNuePro = (fullPropertyValueToday * cleNp) / 100;
    const priceUsufruit = (fullPropertyValueToday * cleUs) / 100;
    const futureFullPropertyValue = fullPropertyValueToday * Math.pow(1 + revalo, duree);
    const annualGrossIncome = portfolioAnalysis.totalAnnualIncome;
    const totalIncomeUsufruit = annualGrossIncome * duree;
    const rendementImpliciteNp = priceNuePro > 0 ? (Math.pow(futureFullPropertyValue / priceNuePro, 1 / duree) - 1) * 100 : 0;
    const rendementGlobalUsufruit = priceUsufruit > 0 ? ((totalIncomeUsufruit / priceUsufruit) / duree) * 100 : 0;
    return { cleNp, cleUs, duree, fullPropertyValueToday, priceNuePro, priceUsufruit, futureFullPropertyValue, totalIncomeUsufruit, rendementImpliciteNp, rendementGlobalUsufruit };
  }, [portfolioAnalysis, investmentMode, demembrementCleNp, demembrementDurationYears, demembrementRevalo]);

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

  // Tooltip custom pour le donut de répartition
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    if (!item) return null;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl shadow-black/40">
        <p className="text-xs font-semibold text-white whitespace-nowrap">{item.name}</p>
        <p className="text-[11px] text-violet-400 font-medium whitespace-nowrap">{formatPercent(item.percentage)}</p>
        <p className="text-[11px] text-slate-300 whitespace-nowrap">{formatCurrency(item.amount)}</p>
        {typeof item.yield === 'number' && (
          <p className="text-[10px] text-slate-400 whitespace-nowrap">Rendement : {item.yield.toFixed(2)}%</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900" id="comparator-container">
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* ── Onboarding (Étape 1 uniquement) ── */}
        {onboardingVisible && currentStep === 1 && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-800/40">
          <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-sm sm:text-lg font-bold text-emerald-300">
                  Filtrez et sélectionnez vos SCPI pour préparer un support client professionnel et structuré.
                </h2>
              </div>
              <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              {filters.tmi !== null && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-lg">
                  <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-200">TMI</span>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                    {filters.tmi}%
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all flex items-center gap-1.5 sm:gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all flex items-center gap-1.5 sm:gap-2 ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Liste</span>
                </button>
              </div>
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
            onClick={() => setCurrentStep(1)}
            className={`text-sm font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded ${
              currentStep === 1 ? 'text-emerald-400 bg-emerald-500/10' : currentStep > 1 ? 'text-emerald-400/60 hover:text-emerald-300' : 'text-slate-500'
            }`}
          >
            1. Sélection
          </span>
          <span className="text-slate-600">→</span>
          <span
            onClick={() => { if (selectedScpis.length > 0) setCurrentStep(2); }}
            className={`text-sm font-semibold transition-colors px-1.5 py-0.5 rounded ${
              currentStep === 2 ? 'text-emerald-400 bg-emerald-500/10' : currentStep > 2 ? 'text-emerald-400/60 hover:text-emerald-300' : 'text-slate-500'
            } ${selectedScpis.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
          >
            2. Analyse
          </span>
          <span className="text-slate-600">→</span>
          <span
            onClick={() => { if (selectedScpis.length > 0) setCurrentStep(3); }}
            className={`text-sm font-semibold transition-colors px-1.5 py-0.5 rounded ${
              currentStep === 3 ? 'text-emerald-400 bg-emerald-500/10' : currentStep > 3 ? 'text-emerald-400/60 hover:text-emerald-300' : 'text-slate-500'
            } ${selectedScpis.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
          >
            3. Vidéos
          </span>
          <span className="text-slate-600">→</span>
          <span
            onClick={() => { if (selectedScpis.length > 0) setCurrentStep(4); }}
            className={`text-sm font-semibold transition-colors px-1.5 py-0.5 rounded ${
              currentStep === 4 ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
            } ${selectedScpis.length > 0 ? 'cursor-pointer hover:text-emerald-300' : 'cursor-not-allowed opacity-40'}`}
          >
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
                  <div id="scpi-grid" className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
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
                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/70">
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
          <div className="block w-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-3">
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
        <div className="mt-6 sm:mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 sm:gap-6 items-start">
          <main className="min-w-0 pb-24 lg:pb-6">
            {/* === CONTENU RÉORGANISÉ EN 3 SECTIONS D'ACCENT === */}
            <section className="space-y-6 sm:space-y-8">

              {/* ▸▸▸ SECTION 1 : COHÉRENCE DU PORTEFEUILLE (emerald) */}
              <div className="rounded-2xl border border-emerald-500/25 border-l-4 border-l-emerald-400 bg-slate-900/60 p-3 sm:p-6 shadow-sm">
                <header className="mb-4 sm:mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 sm:px-5 py-3 sm:py-4">
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
                  <ZScoreBar zScore={coherenceZScore} profileLabel={investorProfileLabel} variant="full"
                    customZoneLabel="Lecture professionnelle indicative, fondée sur les données disponibles de la sélection."
                    customContextLine="Lecture professionnelle indicative, fondée sur les données disponibles de la sélection. Cette lecture peut être contextualisée selon les paramètres du dossier client, sans constituer une recommandation personnalisée."
                    customCtaText="Paramétrer le dossier client"
                    customFooterNote="Le Z-score décrit la structure globale de la sélection. Il n'indique ni un niveau de risque, ni une recommandation d'investissement."
                  />
                </div>

                {/* Profil de risque global du portefeuille (échelle 1→7) */}
                <div className="pt-4 border-t border-slate-700 mb-4">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    Profil de risque de la sélection
                  </h4>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    {/* Barres de risque 1-7 */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 flex gap-0.5 sm:gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                          const isActive = level <= portfolioRiskScore;
                          let barColor = 'bg-slate-600';
                          if (isActive) {
                            if (level <= 2) barColor = 'bg-emerald-500';
                            else if (level <= 4) barColor = 'bg-amber-400';
                            else if (level <= 6) barColor = 'bg-orange-500';
                            else barColor = 'bg-red-500';
                          }
                          return (
                            <div
                              key={level}
                              className={`flex-1 h-3 sm:h-4 rounded-sm transition-all duration-300 ${barColor} ${isActive ? 'opacity-100' : 'opacity-30'}`}
                              title={`Niveau ${level}/7`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-white min-w-[2rem] text-right">{portfolioRiskScore}/7</span>
                    </div>
                    {/* Légende */}
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] sm:text-[10px] text-slate-500">Prudent</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500">Équilibré</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500">Dynamique</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 italic leading-relaxed">
                      Indicateur basé sur le rendement pondéré, le nombre de SCPI et le taux d'occupation financier de la sélection.
                      Ne constitue pas une recommandation personnalisée.
                    </p>
                  </div>
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
                <header className="mb-4 sm:mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 sm:px-5 py-3 sm:py-4">
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
                    <div className="mt-3 space-y-1 max-h-[520px] overflow-y-auto">
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
                    <div className="mt-3 space-y-1 max-h-[520px] overflow-y-auto">
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
                <header className="mb-4 sm:mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 sm:px-5 py-3 sm:py-4">
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
                    <p className="text-[10px] text-slate-400 mb-0.5">Invest. min. estimé</p>
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
                  {/* Performance financière du portefeuille (mode-dépendant) */}
                  <div className={`grid grid-cols-1 ${investmentMode === 'credit' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2 sm:gap-3 mb-4 sm:mb-5`}>
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                        <p className="text-[10px] text-slate-400">Rendement moyen pondéré</p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-violet-300">{portfolioAnalysis.weightedYield.toFixed(2)}%</p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-[10px] text-slate-400">
                          {investmentMode === 'credit'
                            ? 'Mensualité totale (crédit + assurance)'
                            : investmentMode === 'demembrement'
                            ? demembrementType === 'nue-propriete'
                              ? 'Capital investi réel (nue-propriété)'
                              : 'Capital investi réel (usufruit)'
                            : 'Revenus annuels estimés'}
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-400">
                        {investmentMode === 'credit' && creditMetrics
                          ? `${formatCurrency(creditMetrics.monthlyTotal)} / mois`
                          : investmentMode === 'demembrement' && demembrementMetrics
                          ? formatCurrency(demembrementType === 'nue-propriete' ? demembrementMetrics.priceNuePro : demembrementMetrics.priceUsufruit)
                          : formatCurrency(portfolioAnalysis.totalAnnualIncome)}
                      </p>
                    </div>
                    {investmentMode === 'credit' && (
                      <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <p className="text-[10px] text-slate-400">Revenus mensuels estimés</p>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-emerald-400">{formatCurrency(portfolioAnalysis.totalMonthlyIncome)}</p>
                      </div>
                    )}
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 border border-violet-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                        <p className="text-[10px] text-slate-400">
                          {investmentMode === 'credit'
                            ? "Effort d'épargne mensuel"
                            : investmentMode === 'demembrement'
                            ? demembrementType === 'nue-propriete'
                              ? 'Valeur future estimée (pleine propriété)'
                              : 'Revenus totaux sur la durée'
                            : 'Revenus mensuels estimés'}
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-purple-400">
                        {investmentMode === 'credit' && creditMetrics
                          ? formatCurrency(creditMetrics.monthlyEffort)
                          : investmentMode === 'demembrement' && demembrementMetrics
                          ? demembrementType === 'nue-propriete'
                            ? formatCurrency(demembrementMetrics.futureFullPropertyValue)
                            : formatCurrency(demembrementMetrics.totalIncomeUsufruit)
                          : formatCurrency(portfolioAnalysis.totalMonthlyIncome)}
                      </p>
                    </div>
                  </div>

                  {/* Paramètres Crédit */}
                  {investmentMode === 'credit' && (
                    <div className="mb-4 sm:mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Apport (optionnel)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" value={creditApport || ''}
                            onChange={(e) => { const val = e.target.value; if (val === '' || val === '-') { setCreditApport(0); } else { const numVal = parseInt(val, 10); if (!isNaN(numVal) && numVal >= 0) { setCreditApport(numVal); } } }}
                            onBlur={(e) => { const val = parseInt(e.target.value, 10); if (isNaN(val) || val < 0) { setCreditApport(0); } }}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" min={0} step={1000} />
                          <span className="text-slate-400 text-xs sm:text-sm">€</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Durée du crédit (années)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" value={creditDurationYears}
                            onChange={(e) => setCreditDurationYears(Math.min(30, Math.max(5, parseInt(e.target.value) || 0)))}
                            className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" min={5} max={30} />
                          <div className="flex flex-wrap gap-1.5">
                            {[10, 15, 20, 25].map((d) => (
                              <button key={d} type="button" onClick={() => setCreditDurationYears(d)}
                                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs ${creditDurationYears === d ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                {d} ans
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Taux d'intérêt (%) <span className="text-slate-500 font-normal">(défaut: 3.5%)</span></label>
                        <input type="number" value={creditRateInput !== '' ? creditRateInput : creditRate}
                          onChange={(e) => { const val = e.target.value; setCreditRateInput(val); const numVal = parseFloat(val); if (!isNaN(numVal) && val !== '') { if (numVal < 0.5) setCreditRate(0.5); else if (numVal > 6) setCreditRate(6); else setCreditRate(numVal); } }}
                          onFocus={() => { setCreditRateInput(creditRate.toString()); }}
                          onBlur={(e) => { const val = e.target.value; const numVal = parseFloat(val); setCreditRateInput(''); if (val === '' || isNaN(numVal) || numVal < 0.5) setCreditRate(3.5); else if (numVal > 6) setCreditRate(6); else setCreditRate(numVal); }}
                          placeholder="3.5" className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500" min={0.5} max={6} step={0.05} />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Taux d'assurance (% annuel) <span className="text-slate-500 font-normal">(défaut: 0.3%)</span></label>
                        <input type="number" value={insuranceRateInput !== '' ? insuranceRateInput : insuranceRate}
                          onChange={(e) => { const val = e.target.value; setInsuranceRateInput(val); const numVal = parseFloat(val); if (!isNaN(numVal) && val !== '') { if (numVal < 0) setInsuranceRate(0); else if (numVal > 1.5) setInsuranceRate(1.5); else setInsuranceRate(numVal); } }}
                          onFocus={() => { setInsuranceRateInput(insuranceRate.toString()); }}
                          onBlur={(e) => { const val = e.target.value; const numVal = parseFloat(val); setInsuranceRateInput(''); if (val === '' || isNaN(numVal) || numVal < 0) setInsuranceRate(0.3); else if (numVal > 1.5) setInsuranceRate(1.5); else setInsuranceRate(numVal); }}
                          placeholder="0.3" className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500" min={0} max={1.5} step={0.05} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Différé</label>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setCreditDeferred('none')}
                            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs border ${creditDeferred === 'none' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-900 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>Aucun</button>
                          <button type="button" onClick={() => setCreditDeferred('partial')}
                            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs border ${creditDeferred === 'partial' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-900 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>Différé partiel</button>
                          <button type="button" onClick={() => setCreditDeferred('total')}
                            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs border ${creditDeferred === 'total' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-900 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>Différé total</button>
                        </div>
                        {creditDeferred !== 'none' && (
                          <div className="mt-3">
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Durée du différé (1 à 24 mois)</label>
                            <div className="flex items-center gap-3">
                              <input type="range" min={1} max={24} value={creditDeferredMonths || 1}
                                onChange={(e) => setCreditDeferredMonths(parseInt(e.target.value) || 1)} className="flex-1 accent-violet-500" />
                              <input type="number" min={1} max={24} value={creditDeferredMonths || 1}
                                onChange={(e) => setCreditDeferredMonths(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                              <span className="text-slate-400 text-xs sm:text-sm">mois</span>
                            </div>
                            {creditMetrics && creditMetrics.monthlyDeferredCost > 0 && (
                              <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] sm:text-xs text-slate-300 font-semibold">Coût mensuel estimé pendant le différé :</span>
                                  <span className="text-sm sm:text-base font-bold text-amber-400">{formatCurrency(creditMetrics.monthlyDeferredCost)} / mois</span>
                                </div>
                                <p className="mt-1.5 text-[9px] sm:text-[10px] text-slate-400">
                                  {creditDeferred === 'partial' ? 'Intérêts + assurance (capital non remboursé)' : 'Assurance uniquement (intérêts capitalisés)'}
                                </p>
                              </div>
                            )}
                            <p className="mt-2 text-[10px] sm:text-xs text-slate-500">
                              {creditDeferred === 'partial'
                                ? "Pendant le différé partiel, vous ne remboursez que les intérêts et l'assurance. Le capital est remboursé après la période de différé."
                                : creditDeferred === 'total'
                                ? "Pendant le différé total, vous ne remboursez ni le capital ni les intérêts. Seule l'assurance est due. Les intérêts sont capitalisés et ajoutés au capital restant dû."
                                : 'Le différé permet de décaler une partie ou la totalité de vos remboursements pendant les premiers mois.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Paramètres Démembrement */}
                  {investmentMode === 'demembrement' && (
                    <div className="mb-4 sm:mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Type de démembrement</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setDemembrementType('nue-propriete')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border ${demembrementType === 'nue-propriete' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-900 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>Nue-propriété</button>
                          <button type="button" onClick={() => setDemembrementType('usufruit')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border ${demembrementType === 'usufruit' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-900 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>Usufruit</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Clé de démembrement (nue-propriété %)</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min={40} max={90} step={1} value={demembrementCleNp}
                            onChange={(e) => setDemembrementCleNp(parseInt(e.target.value) || 0)} className="flex-1 accent-violet-500" />
                          <input type="number" min={40} max={90} value={demembrementCleNp}
                            onChange={(e) => setDemembrementCleNp(Math.min(90, Math.max(40, parseInt(e.target.value) || 0)))}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                          <span className="text-slate-400 text-xs sm:text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Durée du démembrement (années)</label>
                        <input type="number" min={5} max={30} value={demembrementDurationYears}
                          onChange={(e) => setDemembrementDurationYears(Math.min(30, Math.max(5, parseInt(e.target.value) || 0)))}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-300 mb-1.5">Hypothèse de revalorisation annuelle (%)</label>
                        <input type="number" min={-1} max={2} step={0.1} value={demembrementRevalo}
                          onChange={(e) => setDemembrementRevalo(Math.min(2, Math.max(-1, parseFloat(e.target.value) || 0)))}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
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
                            <Tooltip content={<CustomDonutTooltip />} />
                            <Pie
                              data={portfolioAnalysis.scpiData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="percentage"
                              strokeWidth={0}
                              onMouseEnter={(_, index) => {
                                if (index >= 0 && index < portfolioAnalysis.scpiData.length) {
                                  setHoveredSlice(portfolioAnalysis.scpiData[index]);
                                }
                              }}
                              onMouseLeave={() => setHoveredSlice(null)}
                            >
                              {portfolioAnalysis.scpiData.map((entry, index) => (
                                <Cell key={`cell-pro-${index}`} fill={`url(#gradScpiPro-${index})`} stroke="transparent" />
                              ))}
                              <Label
                                content={({ viewBox }: any) => {
                                  const { cx, cy } = viewBox;
                                  if (hoveredSlice) {
                                    return (
                                      <g>
                                        <text x={cx} y={cy - 12} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight={700}>
                                          {hoveredSlice.name.length > 16 ? hoveredSlice.name.slice(0, 16) + '…' : hoveredSlice.name}
                                        </text>
                                        <text x={cx} y={cy + 8} textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight={600}>
                                          {formatPercent(hoveredSlice.percentage)}
                                        </text>
                                        <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight={400}>
                                          {formatCurrency(hoveredSlice.amount)}
                                        </text>
                                      </g>
                                    );
                                  }
                                  return (
                                    <g>
                                      <text x={cx} y={cy - 12} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight={500}>
                                        Total
                                      </text>
                                      <text x={cx} y={cy + 14} textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight={700}>
                                        {formatCurrency(totalAmount)}
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
                      <div className="mt-4 space-y-2">
                        {portfolioAnalysis.scpiData.map((item, index) => {
                          const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                          const color = colors[index % colors.length];
                          return (
                            <div key={item.id} className="flex items-center gap-2.5">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <div className="min-w-0 flex-1 flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-[11px] sm:text-xs text-white truncate font-medium" title={item.name}>
                                  {item.name}
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-400 flex-shrink-0">
                                  {formatPercent(item.percentage)} · {formatCurrency(item.amount)}
                                </span>
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
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                    <p className="text-xs text-slate-300 px-4 pt-4 pb-3 font-semibold">Détail de votre sélection</p>

                    {/* ─── TABLE ─── */}
                    <div className="overflow-x-auto">
                      <table className="min-w-[980px] w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 text-[10px] uppercase tracking-wider text-slate-400">
                            <th className="text-left py-2.5 px-4 w-[240px]">SCPI</th>
                            <th className="text-right py-2.5 px-3 w-[80px]">Rendement</th>
                            <th className="text-right py-2.5 px-3 w-[70px]">TOF</th>
                            <th className="text-right py-2.5 px-3 w-[90px]">Prix part</th>
                            <th className="text-right py-2.5 px-3 w-[90px]">Invest. min.</th>
                            <th className="text-right py-2.5 px-3 w-[110px]">Capitalisation</th>
                            <th className="text-right py-2.5 px-3 w-[100px]">Décote/Surcote</th>
                            <th className="text-center py-2.5 px-3 w-[95px]">Détails</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {selectedScpis.map(scpi => {
                            const discountInfo = getDiscountPremium(scpi);
                            const isExpanded = expandedScpiIds.has(scpi.id);
                            return (
                              <React.Fragment key={scpi.id}>
                                <tr
                                  className="group hover:bg-slate-700/30 transition-colors cursor-pointer"
                                  onClick={() => toggleExpandScpi(scpi.id)}
                                >
                                  {/* SCPI name + category */}
                                  <td className="py-2.5 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-white truncate">{scpi.name}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{scpi.managementCompany}</p>
                                      </div>
                                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold border flex-shrink-0 ${getCategoryColor(scpi.category)}`}>
                                        {scpi.category}
                                      </span>
                                    </div>
                                  </td>
                                  {/* Rendement */}
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="font-semibold text-violet-400">{scpi.yield.toFixed(2)}%</span>
                                  </td>
                                  {/* TOF */}
                                  <td className="py-2.5 px-3 text-right">
                                    <span className={`font-semibold ${(scpi.tof ?? 0) >= 95 ? 'text-emerald-400' : (scpi.tof ?? 0) >= 90 ? 'text-amber-400' : (scpi.tof ?? 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                      {typeof scpi.tof === 'number' ? `${scpi.tof.toFixed(1)}%` : '—'}
                                    </span>
                                  </td>
                                  {/* Prix part */}
                                  <td className="py-2.5 px-3 text-right text-white font-semibold tabular-nums">{scpi.price}€</td>
                                  {/* Invest. min. */}
                                  <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                                    {scpi.minInvestment >= 1000
                                      ? `${(scpi.minInvestment / 1000).toFixed(0)}k€`
                                      : `${scpi.minInvestment}€`}
                                  </td>
                                  {/* Capitalisation */}
                                  <td className="py-2.5 px-3 text-right text-slate-300">
                                    {scpi.capitalization || '—'}
                                  </td>
                                  {/* Décote / Surcote */}
                                  <td className="py-2.5 px-3 text-right">
                                    {discountInfo ? (
                                      <span className={`font-semibold ${discountInfo.isDiscount ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {discountInfo.isDiscount ? '' : '+'}{discountInfo.value.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">—</span>
                                    )}
                                  </td>
                                  {/* Détails toggle */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleExpandScpi(scpi.id); }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium text-slate-400 hover:text-white hover:bg-slate-600/50 transition-colors"
                                    >
                                      {isExpanded ? 'Masquer' : 'Voir détails'}
                                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  </td>
                                </tr>
                                {/* Ligne dépliée — détails complets */}
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={8} className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50">
                                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-2 text-[11px]">
                                        <div>
                                          <p className="text-[10px] text-slate-500">Société de gestion</p>
                                          <p className="text-slate-300">{scpi.managementCompany}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-slate-500">Horizon recommandé</p>
                                          <p className="text-slate-300">
                                            {scpi.dureeDetentionRecommandee ? `${scpi.dureeDetentionRecommandee} ans` : '≥ 8 ans'}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-slate-500">Distribution</p>
                                          <p className="text-slate-300">
                                            {scpi.versementLoyers || (scpi.distribution ? `${scpi.distribution}€/part` : 'Trimestrielle')}
                                          </p>
                                        </div>
                                        {typeof scpi.ltv === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Endettement</p>
                                            <p className="text-slate-300">{scpi.ltv}%</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-[10px] text-slate-500">Nombre d'immeubles</p>
                                          <p className="text-slate-300">
                                            {typeof scpi.assetsCount === 'number' ? scpi.assetsCount : 'N/A'}
                                          </p>
                                        </div>
                                        {scpi.reconstitutionValue && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Valeur reconstitution</p>
                                            <p className="text-slate-300">{scpi.reconstitutionValue}€</p>
                                          </div>
                                        )}
                                        {scpi.valeurRetrait != null && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Valeur de retrait</p>
                                            <p className="text-slate-300">{scpi.valeurRetrait}€</p>
                                          </div>
                                        )}
                                        {scpi.valeurRealisation != null && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Valeur réalisation</p>
                                            <p className="text-slate-300">{scpi.valeurRealisation}€</p>
                                          </div>
                                        )}
                                        {typeof scpi.delaiJouissance === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Délai de jouissance</p>
                                            <p className="text-slate-300">{scpi.delaiJouissance} mois</p>
                                          </div>
                                        )}
                                        {scpi.sfdr && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">SFDR</p>
                                            <p className="text-slate-300">{scpi.sfdr}</p>
                                          </div>
                                        )}
                                        {typeof scpi.profilRisque === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Profil de risque</p>
                                            <p className="text-slate-300">{scpi.profilRisque}/7</p>
                                          </div>
                                        )}
                                        {scpi.profilCible && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Profil cible</p>
                                            <p className="text-slate-300">{scpi.profilCible}</p>
                                          </div>
                                        )}
                                        {typeof scpi.entryFees === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Frais d'entrée</p>
                                            <p className="text-slate-300">{scpi.entryFees}%</p>
                                          </div>
                                        )}
                                        {typeof scpi.managementFees === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Frais de gestion</p>
                                            <p className="text-slate-300">{scpi.managementFees}%</p>
                                          </div>
                                        )}
                                        {typeof scpi.nombreLocataires === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Nombre de locataires</p>
                                            <p className="text-slate-300">{scpi.nombreLocataires}</p>
                                          </div>
                                        )}
                                        {typeof scpi.walt === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">WALT (durée ferme)</p>
                                            <p className="text-slate-300">{scpi.walt} ans</p>
                                          </div>
                                        )}
                                        {typeof scpi.walb === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">WALB (durée break)</p>
                                            <p className="text-slate-300">{scpi.walb} ans</p>
                                          </div>
                                        )}
                                        {scpi.withdrawalDelay && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Délai de retrait</p>
                                            <p className="text-slate-300">{scpi.withdrawalDelay}</p>
                                          </div>
                                        )}
                                        {typeof scpi.collecteNetteTrimestre === 'number' && (
                                          <div>
                                            <p className="text-[10px] text-slate-500">Collecte nette T</p>
                                            <p className="text-slate-300">{(scpi.collecteNetteTrimestre / 1_000_000).toFixed(1)} M€</p>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
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
            <div className="block w-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-3">
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
                  <ZScoreBar zScore={coherenceZScore} profileLabel="CGP" variant="full"
                    customZoneLabel="Lecture professionnelle indicative, fondée sur les données disponibles de la sélection."
                    customContextLine="Lecture professionnelle indicative, fondée sur les données disponibles de la sélection. Cette lecture peut être contextualisée selon les paramètres du dossier client, sans constituer une recommandation personnalisée."
                    customCtaText="Paramétrer le dossier client"
                    customFooterNote="Le Z-score décrit la structure globale de la sélection. Il n'indique ni un niveau de risque, ni une recommandation d'investissement."
                  />
                  <p className="text-xs text-slate-500 mt-3">
                    {selectedScpis.length >= 4 ? 'Diversification sectorielle et géographique large selon les données disponibles.' :
                     selectedScpis.length >= 2 ? 'Lecture de diversification à contextualiser selon les paramètres du dossier client.' :
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
            <h2 className="text-xl font-bold text-white mb-2">Synthèse de la sélection</h2>
            <p className="text-sm text-slate-400 mb-4">Vérifiez le montant total investi, les SCPI retenues et les vidéos associées.</p>

            {/* KPIs récapitulatifs */}
            {selectedScpis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-500/30">
                  <p className="text-xs text-violet-400 font-medium mb-1">Montant total investi</p>
                  <p className="text-2xl font-bold text-violet-300">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 font-medium mb-1">Rendement pondéré</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {portfolioAnalysis ? portfolioAnalysis.weightedYield.toFixed(2) : selectedScpis.reduce((sum, s) => sum + s.yield, 0).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 font-medium mb-1">SCPI sélectionnées</p>
                  <p className="text-2xl font-bold text-white">{selectedScpis.length}</p>
                </div>
              </div>
            )}

            {/* Bloc compact : SCPI sélectionnées avec allocation */}
            {portfolioAnalysis && (
              <div className="mb-6 bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                <h3 className="text-sm font-bold text-white mb-3">SCPI sélectionnées</h3>
                <div className="space-y-2">
                  {portfolioAnalysis.scpiData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-semibold truncate block">{item.name}</span>
                        {selectedScpis.find(s => s.id === item.id)?.managementCompany && (
                          <span className="text-slate-500 hidden sm:inline">
                            {selectedScpis.find(s => s.id === item.id)!.managementCompany}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="text-slate-300">{formatPercent(item.percentage)}</span>
                        <span className="text-violet-300 text-right tabular-nums min-w-[65px] sm:min-w-[80px]">{formatCurrency(item.amount)}</span>
                        <span className="text-emerald-400 font-semibold text-right tabular-nums min-w-[55px] sm:min-w-[64px]">{item.yield.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
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

      {/* Mobile Selection Bar — Étape 1 uniquement */}
      {currentStep === 1 && (
        <MobileSelectionBar
          count={selectedScpis.length}
          onOpen={() => setCurrentStep(2)}
        />
      )}

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
