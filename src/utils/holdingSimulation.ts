/**
 * UTILITAIRE PARTAGÉ — Simulation Holding IS / Usufruit temporaire SCPI
 *
 * Fonctions pures, sans dépendance React.
 * Utilisables depuis le simulateur Expert-Comptable ET depuis ProSimulator.
 */

/* ── Types ── */

export interface HoldingISInputs {
  /** Nom du dossier (pour affichage) */
  dossierName?: string;
  /** Type de société */
  companyType: 'SAS' | 'SARL' | 'SCI IS' | 'Holding' | 'Autre';
  /** Trésorerie disponible (€) */
  availableCash: number;
  /** Résultat fiscal estimé avant opération (€) */
  preTaxProfit: number;
  /** Éligible taux réduit IS */
  reducedRateEligible: boolean;
  /** Montant investi en usufruit temporaire (€) */
  usufruitInvestment: number;
  /** Durée usufruit (années) */
  usufruitDuration: number;
  /** Clé usufruit (%, ex: 22) */
  usufruitKeyPercent: number;
  /** Taux de distribution brut SCPI (%) */
  grossYieldRate: number;
  /** Revalorisation annuelle des revenus (%) */
  revalorizationRate: number;
  /** Plafond taux réduit IS (€) */
  reducedRateThreshold?: number;
  /** Taux réduit IS (%) */
  reducedTaxRate?: number;
  /** Taux normal IS (%) */
  standardTaxRate?: number;
}

export interface HoldingISYearProjection {
  year: number;
  grossIncome: number;
  amortization: number;
  fiscalResultOperation: number;
  isBeforeOperation: number;
  isAfterOperation: number;
  isImpact: number;
  netCashFlow: number;
  cumulativeNetCashFlow: number;
}

export interface HoldingISResult {
  inputs: HoldingISInputs;
  reconstitutedFullProperty: number;
  annualGrossIncome: number;
  annualAmortization: number;
  annualFiscalResultOperation: number;
  annualISBeforeOperation: number;
  annualISAfterOperation: number;
  annualISImpact: number;
  annualNetCashFlow: number;
  cumulativeNetCashFlow: number;
  netCompanyYield: number;
  projections: HoldingISYearProjection[];
}

/* ── Calculs ── */

const DEFAULT_REDUCED_THRESHOLD = 42_500;
const DEFAULT_REDUCED_RATE = 15;
const DEFAULT_STANDARD_RATE = 25;

/**
 * Calcule l'IS dû sur un résultat fiscal.
 *
 * Règles :
 * - Si profit <= 0 : IS = 0
 * - Si taux réduit activé :
 *   - partie ≤ plafond : taux réduit
 *   - partie > plafond : taux normal
 * - Sinon : taux normal sur tout
 */
export function calculateCorporateTax(
  profit: number,
  options?: {
    reducedRateEligible?: boolean;
    reducedRateThreshold?: number;
    reducedTaxRate?: number;
    standardTaxRate?: number;
  }
): number {
  if (profit <= 0) return 0;

  const eligible = options?.reducedRateEligible ?? false;
  const threshold = options?.reducedRateThreshold ?? DEFAULT_REDUCED_THRESHOLD;
  const reducedRate = (options?.reducedTaxRate ?? DEFAULT_REDUCED_RATE) / 100;
  const standardRate = (options?.standardTaxRate ?? DEFAULT_STANDARD_RATE) / 100;

  if (eligible) {
    const reducedPart = Math.min(profit, threshold);
    const standardPart = Math.max(0, profit - threshold);
    return reducedPart * reducedRate + standardPart * standardRate;
  }

  return profit * standardRate;
}

/**
 * Calcule l'amortissement annuel de l'usufruit temporaire.
 *
 * Formule : montant investi / durée (linéaire comptable).
 */
export function calculateUsufruitAmortization(
  usufruitInvestment: number,
  usufruitDuration: number
): number {
  if (usufruitDuration <= 0) return 0;
  return usufruitInvestment / usufruitDuration;
}

/**
 * Calcule la projection complète Holding IS sur la durée de l'usufruit.
 */
export function calculateHoldingISProjection(inputs: HoldingISInputs): HoldingISResult {
  const {
    preTaxProfit,
    reducedRateEligible,
    usufruitInvestment,
    usufruitDuration,
    usufruitKeyPercent,
    grossYieldRate,
    revalorizationRate,
    reducedRateThreshold = DEFAULT_REDUCED_THRESHOLD,
    reducedTaxRate = DEFAULT_REDUCED_RATE,
    standardTaxRate = DEFAULT_STANDARD_RATE,
  } = inputs;

  // 1. Pleine propriété reconstituée
  const reconstitutedFullProperty =
    usufruitKeyPercent > 0 ? usufruitInvestment / (usufruitKeyPercent / 100) : 0;

  // 2. Revenus bruts annuels (année 1)
  const annualGrossIncomeBase = reconstitutedFullProperty * (grossYieldRate / 100);

  // 3. Amortissement annuel
  const annualAmortization = calculateUsufruitAmortization(usufruitInvestment, usufruitDuration);

  // 4. IS AVANT opération (sur résultat existant seul)
  const isBeforeOperationBase = calculateCorporateTax(preTaxProfit, {
    reducedRateEligible,
    reducedRateThreshold,
    reducedTaxRate,
    standardTaxRate,
  });

  // 5. Projection annuelle
  const projections: HoldingISYearProjection[] = [];
  let cumulativeNetCashFlow = 0;

  for (let year = 1; year <= usufruitDuration; year++) {
    // Revalorisation des revenus
    const yearMultiplier = Math.pow(1 + revalorizationRate / 100, year - 1);
    const grossIncome = annualGrossIncomeBase * yearMultiplier;

    // Amortissement constant
    const amortization = year <= usufruitDuration ? annualAmortization : 0;

    // Résultat fiscal : résultat existant + (revenus - amortissement)
    const fiscalResultOperation = preTaxProfit + grossIncome - amortization;

    // IS avec et sans opération
    const isBeforeOperation = year === 1 ? isBeforeOperationBase : 0; // simplifié : on ne montre l'IS avant que pour comparaison
    const isAfterOperation = calculateCorporateTax(fiscalResultOperation, {
      reducedRateEligible,
      reducedRateThreshold,
      reducedTaxRate,
      standardTaxRate,
    });

    // IS sur le résultat existant seul (pour l'impact)
    const isOnPreTaxOnly = calculateCorporateTax(preTaxProfit, {
      reducedRateEligible,
      reducedRateThreshold,
      reducedTaxRate,
      standardTaxRate,
    });

    // Impact IS = IS total - IS sur résultat existant seul
    const isImpact = isAfterOperation - isOnPreTaxOnly;

    // Cash-flow net = revenus bruts - IS additionnel
    const netCashFlow = grossIncome - Math.max(0, isImpact);

    cumulativeNetCashFlow += netCashFlow;

    projections.push({
      year,
      grossIncome: Math.round(grossIncome),
      amortization: Math.round(amortization),
      fiscalResultOperation: Math.round(fiscalResultOperation),
      isBeforeOperation: Math.round(isBeforeOperation),
      isAfterOperation: Math.round(isAfterOperation),
      isImpact: Math.round(isImpact),
      netCashFlow: Math.round(netCashFlow),
      cumulativeNetCashFlow: Math.round(cumulativeNetCashFlow),
    });
  }

  // Synthèse
  const year1 = projections[0];
  const annualISImpact = year1?.isImpact ?? Math.round(calculateCorporateTax(preTaxProfit + annualGrossIncomeBase - annualAmortization, {
    reducedRateEligible,
    reducedRateThreshold,
    reducedTaxRate,
    standardTaxRate,
  }) - isBeforeOperationBase);

  const annualNetCashFlow = Math.round(annualGrossIncomeBase - Math.max(0, annualISImpact));
  const netCompanyYield = usufruitInvestment > 0 ? (annualNetCashFlow / usufruitInvestment) * 100 : 0;

  return {
    inputs,
    reconstitutedFullProperty: Math.round(reconstitutedFullProperty),
    annualGrossIncome: Math.round(annualGrossIncomeBase),
    annualAmortization: Math.round(annualAmortization),
    annualFiscalResultOperation: year1 ? year1.fiscalResultOperation : 0,
    annualISBeforeOperation: year1 ? year1.isBeforeOperation : 0,
    annualISAfterOperation: year1 ? year1.isAfterOperation : 0,
    annualISImpact,
    annualNetCashFlow,
    cumulativeNetCashFlow: Math.round(cumulativeNetCashFlow),
    netCompanyYield: Math.round(netCompanyYield * 100) / 100,
    projections,
  };
}
