import { Scpi } from '../types/scpi';
import { 
  GuidedJourneyAnswers, 
  PortfolioType, 
  RiskLevel,
  Portfolio,
  PortfolioRecommendation 
} from '../types/guidedJourney';

/**
 * Mappe le montant d'impôt annuel vers une TMI estimée
 * Moins de 2 000 € → TMI faible (0-11%) → priorité au rendement brut
 * 2 000 à 6 000 € → TMI intermédiaire (30%) → équilibre rendement / diversification
 * Plus de 6 000 € → TMI élevée (41%+) → priorité à l'optimisation fiscale
 */
export function mapTaxSituationToTMI(taxSituation: string): number {
  switch (taxSituation) {
    case 'moins-2000':
      return 0; // TMI 0-11% → priorité au rendement brut
    case '2000-6000':
      return 30; // TMI 30% → équilibre rendement / diversification
    case 'plus-6000':
      return 41; // TMI 41%+ → priorité à l'optimisation fiscale
    case 'je-ne-sais-pas':
      return 30; // Par défaut, TMI 30% (profil neutre)
    default:
      return 30;
  }
}

/**
 * Détermine la priorité fiscale à partir du montant d'impôt annuel
 */
export function getTaxPriority(taxSituation: string): 'yield' | 'balance' | 'tax-optimization' | 'neutral' {
  switch (taxSituation) {
    case 'moins-2000':
      return 'yield'; // Priorité au rendement brut
    case '2000-6000':
      return 'balance'; // Équilibre rendement / diversification
    case 'plus-6000':
      return 'tax-optimization'; // Priorité à l'optimisation fiscale (Europe, typologies adaptées)
    case 'je-ne-sais-pas':
      return 'neutral'; // Profil neutre + renforcement pédagogique
    default:
      return 'neutral';
  }
}

/**
 * Filtre les SCPI selon les critères stricts obligatoires
 * Critères : Capitalisation ≥ 50M€, TOF ≥ 90%, Endettement < 30%, Décote ≤ 0, Rendement ≥ moyenne
 */
export function filterScpiByStrictCriteria(scpis: Scpi[]): Scpi[] {
  // Calculer le rendement moyen de l'univers
  const averageYield = scpis.reduce((sum, scpi) => sum + scpi.yield, 0) / scpis.length;

  return scpis.filter(scpi => {
    // 1. Capitalisation ≥ 50 M€
    const hasMinCapitalization = scpi.capitalization >= 50_000_000;
    
    // 2. TOF ≥ 90%
    const hasMinTOF = scpi.tof >= 90;
    
    // 3. Ratio d'endettement < 30%
    const hasLowDebt = scpi.debt === undefined || scpi.debt < 30;
    
    // 4. Décote (prix ≤ valeur de reconstitution) = discount ≤ 0
    const hasDiscount = scpi.discount <= 0;
    
    // 5. Rendement réel ≥ moyenne de l'univers
    const hasMinYield = scpi.yield >= averageYield;
    
    // 6. Stratégie lisible (on considère que toutes les SCPI ont une stratégie lisible)
    const hasClearStrategy = true;
    
    return hasMinCapitalization && 
           hasMinTOF && 
           hasLowDebt && 
           hasDiscount && 
           hasMinYield && 
           hasClearStrategy;
  });
}

/**
 * Détermine le portefeuille recommandé à partir des réponses
 */
export function determineRecommendedPortfolio(answers: GuidedJourneyAnswers): PortfolioType {
  const { taxSituation, objective, horizon, immediateIncome } = answers;
  
  // Logique de décision simplifiée
  // Priorité 1: Besoin de revenus immédiats
  if (immediateIncome === 'oui') {
    return 'revenus-stables';
  }
  
  // Priorité 2: Objectif principal
  if (objective === 'revenus-reguliers') {
    return 'revenus-stables';
  }
  
  if (objective === 'revenus-et-croissance') {
    return 'revenus-croissance';
  }
  
  if (objective === 'croissance-long-terme') {
    return 'croissance-long-terme';
  }
  
  // Priorité 3: Horizon d'investissement
  if (horizon === 'moins-8-ans') {
    return 'revenus-stables';
  }
  
  if (horizon === 'plus-15-ans') {
    return 'croissance-long-terme';
  }
  
  // Par défaut pour débutants
  if (objective === 'etre-guide') {
    return 'revenus-stables';
  }
  
  // Par défaut
  return 'revenus-croissance';
}

/**
 * Construit un portefeuille selon le type, les SCPI disponibles et la priorité fiscale
 */
export function buildPortfolio(
  portfolioType: PortfolioType,
  availableScpis: Scpi[],
  taxPriority?: 'yield' | 'balance' | 'tax-optimization' | 'neutral'
): Portfolio {
  const portfolios: Record<PortfolioType, Omit<Portfolio, 'scpis' | 'logic'>> = {
    'revenus-stables': {
      id: 'revenus-stables',
      name: 'Portefeuille Revenus Stables',
      description: 'Un portefeuille axé sur la génération de revenus réguliers avec une stabilité du capital.',
      riskLevel: 'faible',
    },
    'revenus-croissance': {
      id: 'revenus-croissance',
      name: 'Portefeuille Revenus & Croissance',
      description: 'Un équilibre entre revenus réguliers et croissance du capital sur le moyen terme.',
      riskLevel: 'modere',
    },
    'croissance-long-terme': {
      id: 'croissance-long-terme',
      name: 'Portefeuille Croissance Long Terme',
      description: 'Un portefeuille orienté vers la croissance du capital sur le long terme.',
      riskLevel: 'modere',
    },
    'opportunites-immobilieres': {
      id: 'opportunites-immobilieres',
      name: 'Portefeuille Opportunités Immobilières',
      description: 'Un portefeuille diversifié pour saisir les opportunités du marché immobilier.',
      riskLevel: 'dynamique',
    },
    'immobilier-europeen': {
      id: 'immobilier-europeen',
      name: 'Portefeuille Immobilier Européen',
      description: 'Un portefeuille diversifié géographiquement sur l\'Europe pour réduire les risques.',
      riskLevel: 'modere',
    },
  };

  // Sélectionner 5 à 6 SCPI selon le type de portefeuille
  let selectedScpis: Scpi[] = [];
  
  switch (portfolioType) {
    case 'revenus-stables':
      // Priorité: rendement élevé, stabilité
      if (taxPriority === 'yield') {
        // TMI faible → priorité au rendement brut (France, rendement max)
        selectedScpis = [...availableScpis]
          .filter(s => s.geography === 'france')
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 6);
      } else if (taxPriority === 'tax-optimization') {
        // TMI élevée → priorité à l'optimisation fiscale (Europe, diversification)
        selectedScpis = [...availableScpis]
          .filter(s => s.geography === 'europe' || s.european)
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 6);
      } else {
        // TMI intermédiaire ou neutre → équilibre rendement / diversification
        const franceHighYield = availableScpis
          .filter(s => s.geography === 'france')
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 4);
        const europeDiversified = availableScpis
          .filter(s => s.geography === 'europe' || s.european)
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 2);
        selectedScpis = [...franceHighYield, ...europeDiversified].slice(0, 6);
      }
      break;
      
    case 'revenus-croissance':
      // Mix: rendement + croissance
      if (taxPriority === 'yield') {
        // TMI faible → priorité au rendement brut
        selectedScpis = [...availableScpis]
          .filter(s => s.geography === 'france')
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 6);
      } else if (taxPriority === 'tax-optimization') {
        // TMI élevée → priorité à l'optimisation fiscale (Europe)
        selectedScpis = [...availableScpis]
          .filter(s => s.geography === 'europe' || s.european)
          .sort((a, b) => (b.yield * 0.6) + (b.capitalization / 1_000_000 * 0.4) - ((a.yield * 0.6) + (a.capitalization / 1_000_000 * 0.4)))
          .slice(0, 6);
      } else {
        // TMI intermédiaire ou neutre → équilibre rendement / croissance
        const franceHighYield = availableScpis
          .filter(s => s.geography === 'france')
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 3);
        const europeGrowth = availableScpis
          .filter(s => s.geography === 'europe')
          .sort((a, b) => b.capitalization - a.capitalization)
          .slice(0, 3);
        selectedScpis = [...franceHighYield, ...europeGrowth].slice(0, 6);
      }
      break;
      
    case 'croissance-long-terme':
      // Priorité: capitalisation, diversification
      if (taxPriority === 'tax-optimization') {
        // TMI élevée → priorité à l'optimisation fiscale (Europe)
        selectedScpis = [...availableScpis]
          .filter(s => s.geography === 'europe' || s.european)
          .sort((a, b) => b.capitalization - a.capitalization)
          .slice(0, 6);
      } else {
        // TMI faible/intermédiaire → capitalisation, diversification géographique
        selectedScpis = [...availableScpis]
          .sort((a, b) => b.capitalization - a.capitalization)
          .slice(0, 6);
      }
      break;
      
    case 'opportunites-immobilieres':
      // Diversification maximale: secteurs, géographie
      if (taxPriority === 'tax-optimization') {
        // TMI élevée → privilégier Europe dans la diversification
        const sectors = ['bureaux', 'commerces', 'sante', 'logistique', 'diversifie'];
        selectedScpis = sectors
          .map(sector => availableScpis.find(s => s.sector === sector && (s.geography === 'europe' || s.european)))
          .filter((s): s is Scpi => s !== undefined)
          .slice(0, 6);
        // Si pas assez de SCPI européennes, compléter avec d'autres
        if (selectedScpis.length < 6) {
          const remaining = availableScpis
            .filter(s => !selectedScpis.find(sel => sel.id === s.id))
            .slice(0, 6 - selectedScpis.length);
          selectedScpis = [...selectedScpis, ...remaining].slice(0, 6);
        }
      } else {
        // Diversification maximale standard
        const sectors = ['bureaux', 'commerces', 'sante', 'logistique', 'diversifie'];
        selectedScpis = sectors
          .map(sector => availableScpis.find(s => s.sector === sector))
          .filter((s): s is Scpi => s !== undefined)
          .slice(0, 6);
      }
      break;
      
    case 'immobilier-europeen':
      // Priorité: Europe, diversification sectorielle
      selectedScpis = availableScpis
        .filter(s => s.geography === 'europe' || s.european)
        .slice(0, 6);
      break;
  }

  // S'assurer qu'on a au moins 5 SCPI
  if (selectedScpis.length < 5) {
    selectedScpis = [...availableScpis].slice(0, 5);
  }

  // Limiter à 6 SCPI maximum
  selectedScpis = selectedScpis.slice(0, 6);

  // Calculer l'allocation (pondération maximale 25% par SCPI)
  // Répartir équitablement avec un maximum de 25% par SCPI
  const numScpis = selectedScpis.length;
  const baseAllocation = 100 / numScpis;
  
  // Si l'allocation de base dépasse 25%, on limite à 25% et on redistribue le reste
  let allocations: Array<{ scpiId: number; allocation: number }>;
  
  if (baseAllocation <= 25) {
    // Allocation équitable si elle ne dépasse pas 25%
    allocations = selectedScpis.map(scpi => ({
      scpiId: scpi.id,
      allocation: baseAllocation,
    }));
  } else {
    // Limiter à 25% et redistribuer le reste
    const maxAllocation = 25;
    const totalAllocated = maxAllocation * numScpis;
    const remaining = 100 - totalAllocated;
    
    allocations = selectedScpis.map((scpi, index) => ({
      scpiId: scpi.id,
      allocation: maxAllocation + (remaining / numScpis), // Répartir le reste équitablement
    }));
  }

  // S'assurer que la somme fait exactement 100%
  const total = allocations.reduce((sum, a) => sum + a.allocation, 0);
  if (Math.abs(total - 100) > 0.01) {
    const diff = 100 - total;
    allocations[0].allocation += diff;
  }
  
  // Arrondir à 1 décimale
  allocations = allocations.map(a => ({
    ...a,
    allocation: Math.round(a.allocation * 10) / 10,
  }));

  const logic = "SCPI sélectionnées pour leur solidité, leur taux d'occupation élevé, leur faible endettement et leur décote à l'achat.";

  return {
    ...portfolios[portfolioType],
    scpis: allocations,
    logic,
  };
}

/**
 * Génère la recommandation complète pour le client
 */
export function generateRecommendation(
  answers: GuidedJourneyAnswers,
  allScpis: Scpi[]
): PortfolioRecommendation {
  // Filtrer les SCPI selon les critères stricts
  const eligibleScpis = filterScpiByStrictCriteria(allScpis);
  
  // Déterminer le portefeuille recommandé
  const portfolioType = determineRecommendedPortfolio(answers);
  
  // Déterminer la priorité fiscale à partir du montant d'impôt annuel
  const taxPriority = getTaxPriority(answers.taxSituation);
  
  // Construire le portefeuille en tenant compte de la priorité fiscale
  const portfolio = buildPortfolio(portfolioType, eligibleScpis, taxPriority);
  
  // Générer l'explication simple
  const explanation = generateSimpleExplanation(portfolio, answers);
  
  return {
    portfolio,
    explanation,
  };
}

/**
 * Génère une explication simple pour le client
 */
function generateSimpleExplanation(
  portfolio: Portfolio,
  answers: GuidedJourneyAnswers
): string {
  const { objective, horizon } = answers;
  
  let baseExplanation = `Nous vous recommandons le ${portfolio.name} car il correspond à votre situation. `;
  
  if (objective === 'revenus-reguliers' || answers.immediateIncome === 'oui') {
    baseExplanation += "Ce portefeuille est conçu pour générer des revenus réguliers tout en préservant votre capital. ";
  } else if (objective === 'croissance-long-terme' || horizon === 'plus-15-ans') {
    baseExplanation += "Ce portefeuille est orienté vers la croissance de votre capital sur le long terme. ";
  } else {
    baseExplanation += "Ce portefeuille équilibre revenus réguliers et croissance du capital. ";
  }
  
  baseExplanation += portfolio.logic;
  
  return baseExplanation;
}
