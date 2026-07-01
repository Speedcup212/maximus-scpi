/**
 * UTILITAIRE PARTAGÉ — Simulation Holding IS / Usufruit temporaire SCPI
 *
 * Fonctions pures, sans dépendance React.
 * Utilisables depuis le simulateur Expert-Comptable ET depuis ProSimulator.
 */

/* ── Types ── */

export type FeesMode = 'fixed' | 'percentage';
export type FeesTreatment = 'not-integrated' | 'deductible-year1' | 'amortized' | 'non-deductible';

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

  // ── Honoraires ──
  /** Activer la prise en compte des honoraires */
  feesEnabled: boolean;
  /** Mode de calcul des honoraires */
  feesMode: FeesMode;
  /** Montant fixe des honoraires (€) */
  feesFixedAmount: number;
  /** Pourcentage des honoraires sur le montant investi (%) */
  feesPercentage: number;
  /** Traitement fiscal/comptable des honoraires */
  feesTreatment: FeesTreatment;
}

export interface HoldingISYearProjection {
  year: number;
  grossIncome: number;
  /** Amortissement annuel (base usufruit ou usufruit + honoraires selon traitement) */
  amortization: number;
  /** Base amortissable retenue pour l'année */
  amortizableBase: number;
  /** Honoraires imputés fiscalement sur l'année */
  feesFiscal: number;
  /** Honoraires décaissés sur l'année (cash) */
  feesCash: number;
  /** Résultat fiscal de l'opération seule (revenus − amort − honoraires fiscaux) */
  fiscalResultOperationOnly: number;
  /** Résultat fiscal après opération (résultat existant + opération) */
  fiscalResultAfterOperation: number;
  isBeforeOperation: number;
  isAfterOperation: number;
  isImpact: number;
  /** Cash-flow net avant honoraires */
  netCashFlow: number;
  /** Cash-flow net après décaissement des honoraires */
  netCashFlowAfterFees: number;
  cumulativeNetCashFlow: number;
  cumulativeNetCashFlowAfterFees: number;
}

export interface HoldingISResult {
  inputs: HoldingISInputs;
  reconstitutedFullProperty: number;
  annualGrossIncome: number;
  annualAmortization: number;
  /** Base amortissable (usufruit ou usufruit + honoraires) */
  amortizableBase: number;
  /** Montant des honoraires calculé */
  feesAmount: number;
  /** Effort de trésorerie total = usufruitInvestment + feesAmount */
  totalInvestment: number;
  /** Résultat fiscal de l'opération seule, année 1 */
  annualFiscalResultOperationOnly: number;
  /** Résultat fiscal après opération, année 1 */
  annualFiscalResultAfterOperation: number;
  annualISBeforeOperation: number;
  annualISAfterOperation: number;
  annualISImpact: number;
  /** Cash-flow net annuel avant honoraires, année 1 */
  annualNetCashFlow: number;
  /** Cash-flow net annuel après honoraires, année 1 */
  annualNetCashFlowAfterFees: number;
  cumulativeNetCashFlow: number;
  cumulativeNetCashFlowAfterFees: number;
  /** Rendement net hors honoraires (%) */
  netCompanyYield: number;
  /** Rendement net après honoraires (%) */
  netCompanyYieldAfterFees: number;
  projections: HoldingISYearProjection[];
}

/* ── Calculs ── */

const DEFAULT_REDUCED_THRESHOLD = 42_500;
const DEFAULT_REDUCED_RATE = 15;
const DEFAULT_STANDARD_RATE = 25;

/**
 * Calcule l'IS dû sur un résultat fiscal.
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
 * Formule : montant / durée (linéaire comptable).
 */
export function calculateUsufruitAmortization(
  investment: number,
  duration: number
): number {
  if (duration <= 0) return 0;
  return investment / duration;
}

/**
 * Calcule le montant des honoraires selon le mode choisi.
 */
export function calculateFeesAmount(
  feesEnabled: boolean,
  mode: FeesMode,
  fixedAmount: number,
  percentage: number,
  usufruitInvestment: number
): number {
  if (!feesEnabled) return 0;
  if (mode === 'fixed') return fixedAmount;
  return Math.round(usufruitInvestment * (percentage / 100));
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
    feesEnabled,
    feesMode,
    feesFixedAmount,
    feesPercentage,
    feesTreatment,
    reducedRateThreshold = DEFAULT_REDUCED_THRESHOLD,
    reducedTaxRate = DEFAULT_REDUCED_RATE,
    standardTaxRate = DEFAULT_STANDARD_RATE,
  } = inputs;

  const isOpts = { reducedRateEligible, reducedRateThreshold, reducedTaxRate, standardTaxRate };

  // ── Honoraires ──
  const feesAmount = calculateFeesAmount(feesEnabled, feesMode, feesFixedAmount, feesPercentage, usufruitInvestment);
  const totalInvestment = usufruitInvestment + feesAmount;

  // ── Base amortissable selon traitement ──
  const amortizableBase =
    feesEnabled && feesTreatment === 'amortized' ? usufruitInvestment + feesAmount : usufruitInvestment;

  // 1. Pleine propriété reconstituée
  const reconstitutedFullProperty =
    usufruitKeyPercent > 0 ? usufruitInvestment / (usufruitKeyPercent / 100) : 0;

  // 2. Revenus bruts annuels (année 1)
  const annualGrossIncomeBase = reconstitutedFullProperty * (grossYieldRate / 100);

  // 3. Amortissement annuel
  const annualAmortization = calculateUsufruitAmortization(amortizableBase, usufruitDuration);

  // 4. IS AVANT opération (sur résultat existant seul)
  const isBeforeOperationBase = calculateCorporateTax(preTaxProfit, isOpts);

  // 5. Projection annuelle
  const projections: HoldingISYearProjection[] = [];
  let cumulativeNetCashFlow = 0;
  let cumulativeNetCashFlowAfterFees = 0;

  for (let year = 1; year <= usufruitDuration; year++) {
    const yearMultiplier = Math.pow(1 + revalorizationRate / 100, year - 1);
    const grossIncome = annualGrossIncomeBase * yearMultiplier;
    const amortization = year <= usufruitDuration ? annualAmortization : 0;

    // Honoraires imputés fiscalement cette année
    let feesFiscal = 0;
    if (feesEnabled && year === 1 && feesTreatment === 'deductible-year1') {
      feesFiscal = feesAmount;
    }
    // Pour "amortized", les honoraires sont déjà dans la base amortissable, pas de charge séparée
    // Pour "not-integrated" et "non-deductible", pas d'imputation fiscale

    // Honoraires décaissés cette année (toujours en année 1 par défaut)
    const feesCash = (feesEnabled && year === 1) ? feesAmount : 0;

    // Résultat fiscal opération
    const fiscalResultOperationOnly = grossIncome - amortization - feesFiscal;
    const fiscalResultAfterOperation = preTaxProfit + fiscalResultOperationOnly;

    // IS
    const isBeforeOperation = year === 1 ? isBeforeOperationBase : 0;
    const isAfterOperation = calculateCorporateTax(fiscalResultAfterOperation, isOpts);
    const isOnPreTaxOnly = calculateCorporateTax(preTaxProfit, isOpts);
    const isImpact = isAfterOperation - isOnPreTaxOnly;

    // Cash-flow net (avant décaissement honoraires)
    const netCashFlow = grossIncome - Math.max(0, isImpact);

    // Cash-flow net après décaissement honoraires
    const netCashFlowAfterFees = netCashFlow - feesCash;

    cumulativeNetCashFlow += netCashFlow;
    cumulativeNetCashFlowAfterFees += netCashFlowAfterFees;

    projections.push({
      year,
      grossIncome: Math.round(grossIncome),
      amortization: Math.round(amortization),
      amortizableBase: Math.round(amortizableBase),
      feesFiscal: Math.round(feesFiscal),
      feesCash: Math.round(feesCash),
      fiscalResultOperationOnly: Math.round(fiscalResultOperationOnly),
      fiscalResultAfterOperation: Math.round(fiscalResultAfterOperation),
      isBeforeOperation: Math.round(isBeforeOperation),
      isAfterOperation: Math.round(isAfterOperation),
      isImpact: Math.round(isImpact),
      netCashFlow: Math.round(netCashFlow),
      netCashFlowAfterFees: Math.round(netCashFlowAfterFees),
      cumulativeNetCashFlow: Math.round(cumulativeNetCashFlow),
      cumulativeNetCashFlowAfterFees: Math.round(cumulativeNetCashFlowAfterFees),
    });
  }

  // ── Synthèse année 1 ──
  const y1 = projections[0];
  const annualISImpact = y1?.isImpact ?? 0;
  const annualNetCashFlow = Math.round(annualGrossIncomeBase - Math.max(0, annualISImpact));
  const annualNetCashFlowAfterFees = y1?.netCashFlowAfterFees ?? annualNetCashFlow - feesAmount;

  const netCompanyYield = usufruitInvestment > 0 ? (annualNetCashFlow / usufruitInvestment) * 100 : 0;
  const netCompanyYieldAfterFees = totalInvestment > 0 ? (annualNetCashFlowAfterFees / totalInvestment) * 100 : 0;

  return {
    inputs,
    reconstitutedFullProperty: Math.round(reconstitutedFullProperty),
    annualGrossIncome: Math.round(annualGrossIncomeBase),
    annualAmortization: Math.round(annualAmortization),
    amortizableBase: Math.round(amortizableBase),
    feesAmount,
    totalInvestment: Math.round(totalInvestment),
    annualFiscalResultOperationOnly: y1 ? y1.fiscalResultOperationOnly : 0,
    annualFiscalResultAfterOperation: y1 ? y1.fiscalResultAfterOperation : 0,
    annualISBeforeOperation: y1 ? y1.isBeforeOperation : 0,
    annualISAfterOperation: y1 ? y1.isAfterOperation : 0,
    annualISImpact,
    annualNetCashFlow,
    annualNetCashFlowAfterFees,
    cumulativeNetCashFlow: Math.round(cumulativeNetCashFlow),
    cumulativeNetCashFlowAfterFees: Math.round(cumulativeNetCashFlowAfterFees),
    netCompanyYield: Math.round(netCompanyYield * 100) / 100,
    netCompanyYieldAfterFees: Math.round(netCompanyYieldAfterFees * 100) / 100,
    projections,
  };
}
