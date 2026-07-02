/**
 * UTILITAIRE PARTAGÉ — Simulation Holding IS / Usufruit temporaire SCPI
 *
 * Fonctions pures, sans dépendance React.
 */

/* ── Types ── */

export type FeesMode = 'fixed' | 'percentage';
export type FeesTreatment = 'not-integrated' | 'deductible-year1' | 'amortized' | 'non-deductible';
export type FeesVatMode = 'HT' | 'TTC';
export type HoldingVatProfile = 'to-qualify' | 'animator' | 'pure' | 'mixed';

export interface HoldingISInputs {
  dossierName?: string;
  companyType: 'SAS' | 'SARL' | 'SCI IS' | 'Holding' | 'Autre';
  availableCash: number;
  preTaxProfit: number;
  reducedRateEligible: boolean;
  usufruitInvestment: number;
  usufruitDuration: number;
  usufruitKeyPercent: number;
  grossYieldRate: number;
  revalorizationRate: number;
  reducedRateThreshold?: number;
  reducedTaxRate?: number;
  standardTaxRate?: number;

  // Honoraires
  feesEnabled: boolean;
  feesMode: FeesMode;
  feesFixedAmount: number;
  feesPercentage: number;
  feesTreatment: FeesTreatment;

  // TVA honoraires
  feesVatMode: FeesVatMode;
  feesVatRate: number;
  feesVatRecoverable: boolean;

  // Profil TVA holding
  holdingVatProfile: HoldingVatProfile;
  vatRecoveryRate: number; // 0 à 100, utilisé si holdingVatProfile === 'mixed'
}

export interface HoldingISYearProjection {
  year: number;
  grossIncome: number;
  amortization: number;
  amortizableBase: number;
  /** Honoraires imputés fiscalement cette année (HT si TVA récup., TTC sinon) */
  feesFiscal: number;
  /** Honoraires décaissés cette année (TTC) */
  feesCash: number;
  fiscalResultOperationOnly: number;
  fiscalResultAfterOperation: number;
  isBeforeOperation: number;
  isAfterOperation: number;
  isImpact: number;
  netCashFlow: number;
  netCashFlowAfterFees: number;
  cumulativeNetCashFlow: number;
  cumulativeNetCashFlowAfterFees: number;
}

export interface HoldingISResult {
  inputs: HoldingISInputs;
  reconstitutedFullProperty: number;
  annualGrossIncome: number;
  annualAmortization: number;
  amortizableBase: number;

  // Honoraires HT/TTC
  feesHT: number;
  feesVAT: number;
  feesTTC: number;
  /** Montant fiscalement déductible (HT si TVA récup., TTC sinon) */
  feesDeductible: number;
  /** Honoraires imputés fiscalement année 1 */
  feesFiscalYear1: number;
  /** Effort économique (usufruit + honoraires HT si TVA récup., TTC sinon) */
  effortEconomique: number;
  /** Effort de trésorerie réel (usufruit + honoraires TTC) */
  effortTresorerie: number;

  annualFiscalResultOperationOnly: number;
  annualFiscalResultAfterOperation: number;
  annualISBeforeOperation: number;
  annualISAfterOperation: number;
  annualISImpact: number;
  annualNetCashFlow: number;
  annualNetCashFlowAfterFees: number;
  cumulativeNetCashFlow: number;
  cumulativeNetCashFlowAfterFees: number;

  /** Rendement net année 1 après honoraires (%) */
  netCompanyYieldYear1: number;
  /** Rendement cash-flow moyen annuel sur la durée (%) — flux net moyen / effort initial */
  netCompanyYieldAvgAnnual: number;
  /** Rendement net total sur la durée (%) */
  netCompanyYieldTotal: number;
  /** Rendement net avant honoraires (%) */
  netCompanyYield: number;

  // ── Lecture économique après extinction ──
  /** Effort économique initial ajusté (usufruit + honoraires nets selon TVA) */
  economicInitialEffort: number;
  /** Gain net économique après extinction de l'usufruit : cumul flux nets - effort initial */
  gainNetAfterUsufructExtinction: number;
  /** Rendement simple après extinction (%) */
  netEconomicReturnAfterExtinction: number;
  /** Rendement simple annualisé après extinction (% / an) */
  annualizedSimpleReturnAfterExtinction: number;
  /** Rendement cash-flow moyen annuel : (cumul / durée) / effort */
  cashFlowAverageReturn: number;

  // ── TVA détaillée ──
  /** TVA récupérable (€) */
  recoverableVatAmount: number;
  /** TVA non récupérable (€) */
  nonRecoverableVatAmount: number;

  projections: HoldingISYearProjection[];
}

/* ── Constantes ── */

const DEFAULT_REDUCED_THRESHOLD = 42_500;
const DEFAULT_REDUCED_RATE = 15;
const DEFAULT_STANDARD_RATE = 25;

/* ── TRI indicatif (Newton-Raphson) ── */

const IRR_MAX_ITERATIONS = 100;
const IRR_TOLERANCE = 1e-7;

function npv(rate: number, cashFlows: number[]): number {
  let result = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    result += cashFlows[t] / Math.pow(1 + rate, t);
  }
  return result;
}

function npvDerivative(rate: number, cashFlows: number[]): number {
  let result = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    result -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
  }
  return result;
}

export function calculateIrr(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  // Vérifier qu'il y a au moins un flux négatif et un positif
  const hasNegative = cashFlows.some(cf => cf < 0);
  const hasPositive = cashFlows.some(cf => cf > 0);
  if (!hasNegative || !hasPositive) return null;

  let guess = 0.1;
  for (let i = 0; i < IRR_MAX_ITERATIONS; i++) {
    const f = npv(guess, cashFlows);
    const fPrime = npvDerivative(guess, cashFlows);
    if (Math.abs(fPrime) < 1e-12) break;
    const newGuess = guess - f / fPrime;
    if (Math.abs(newGuess - guess) < IRR_TOLERANCE) {
      return Math.round(newGuess * 10000) / 100; // en %
    }
    guess = newGuess;
  }
  return null;
}

/* ── Calculs ── */

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

export function calculateUsufruitAmortization(investment: number, duration: number): number {
  if (duration <= 0) return 0;
  return investment / duration;
}

/** Calcule le montant brut saisi des honoraires (base HT ou TTC selon mode). */
export function calculateFeesInputAmount(
  feesEnabled: boolean, mode: FeesMode, fixedAmount: number,
  percentage: number, usufruitInvestment: number
): number {
  if (!feesEnabled) return 0;
  if (mode === 'fixed') return fixedAmount;
  return Math.round(usufruitInvestment * (percentage / 100));
}

/** Calcule les montants HT, TTC et TVA des honoraires. */
export function calculateFeesBreakdown(
  feesEnabled: boolean, mode: FeesMode, fixedAmount: number,
  percentage: number, usufruitInvestment: number,
  vatMode: FeesVatMode, vatRate: number
): { feesHT: number; feesVAT: number; feesTTC: number } {
  const inputAmount = calculateFeesInputAmount(feesEnabled, mode, fixedAmount, percentage, usufruitInvestment);
  if (!feesEnabled || inputAmount <= 0) return { feesHT: 0, feesVAT: 0, feesTTC: 0 };

  if (vatMode === 'HT') {
    const ht = inputAmount;
    const vat = Math.round(ht * (vatRate / 100));
    const ttc = ht + vat;
    return { feesHT: ht, feesVAT: vat, feesTTC: ttc };
  } else {
    const ttc = inputAmount;
    const ht = Math.round(ttc / (1 + vatRate / 100));
    const vat = ttc - ht;
    return { feesHT: ht, feesVAT: vat, feesTTC: ttc };
  }
}

export function calculateHoldingISProjection(inputs: HoldingISInputs): HoldingISResult {
  const {
    preTaxProfit, reducedRateEligible,
    usufruitInvestment, usufruitDuration,
    usufruitKeyPercent, grossYieldRate, revalorizationRate,
    feesEnabled, feesMode, feesFixedAmount, feesPercentage, feesTreatment,
    feesVatMode, feesVatRate, feesVatRecoverable,
    holdingVatProfile = 'to-qualify',
    vatRecoveryRate = 100,
    reducedRateThreshold = DEFAULT_REDUCED_THRESHOLD,
    reducedTaxRate = DEFAULT_REDUCED_RATE,
    standardTaxRate = DEFAULT_STANDARD_RATE,
  } = inputs;

  const isOpts = { reducedRateEligible, reducedRateThreshold, reducedTaxRate, standardTaxRate };

  // ── Honoraires HT/TTC ──
  const { feesHT, feesVAT, feesTTC } = calculateFeesBreakdown(
    feesEnabled, feesMode, feesFixedAmount, feesPercentage, usufruitInvestment,
    feesVatMode, feesVatRate
  );

  // Montant fiscalement déductible : HT si TVA récupérable, TTC sinon
  const feesDeductible = feesVatRecoverable ? feesHT : feesTTC;

  // ── TVA détaillée selon le profil de la holding ──
  let effectiveVatRecoverable: boolean;
  let recoverableVatAmount: number;
  let nonRecoverableVatAmount: number;
  let economicInitialEffort: number;

  if (holdingVatProfile === 'pure') {
    effectiveVatRecoverable = false;
    recoverableVatAmount = 0;
    nonRecoverableVatAmount = feesVAT;
  } else if (holdingVatProfile === 'animator') {
    effectiveVatRecoverable = true;
    recoverableVatAmount = feesVAT;
    nonRecoverableVatAmount = 0;
  } else if (holdingVatProfile === 'mixed') {
    const rate = Math.min(100, Math.max(0, vatRecoveryRate)) / 100;
    recoverableVatAmount = Math.round(feesVAT * rate);
    nonRecoverableVatAmount = feesVAT - recoverableVatAmount;
    effectiveVatRecoverable = true;
  } else {
    // to-qualify: suit la saisie utilisateur
    effectiveVatRecoverable = feesVatRecoverable;
    recoverableVatAmount = feesVatRecoverable ? feesVAT : 0;
    nonRecoverableVatAmount = feesVatRecoverable ? 0 : feesVAT;
  }

  // Effort économique ajusté : usufruit + HT + TVA non récupérable
  economicInitialEffort = usufruitInvestment + feesHT + nonRecoverableVatAmount;

  // Efforts (pour la retrocompatibilité, on garde les champs existants)
  const effortEconomique = economicInitialEffort;
  const effortTresorerie = usufruitInvestment + feesTTC;

  // ── Base amortissable selon traitement ──
  const amortizableBase =
    feesEnabled && feesTreatment === 'amortized' ? usufruitInvestment + feesDeductible : usufruitInvestment;

  // 1. Pleine propriété reconstituée
  const reconstitutedFullProperty =
    usufruitKeyPercent > 0 ? usufruitInvestment / (usufruitKeyPercent / 100) : 0;

  // 2. Revenus bruts annuels (année 1)
  const annualGrossIncomeBase = reconstitutedFullProperty * (grossYieldRate / 100);

  // 3. Amortissement annuel
  const annualAmortization = calculateUsufruitAmortization(amortizableBase, usufruitDuration);

  // 4. IS AVANT opération
  const isBeforeOperationBase = calculateCorporateTax(preTaxProfit, isOpts);

  // 5. Projection annuelle
  const projections: HoldingISYearProjection[] = [];
  let cumulativeNetCashFlow = 0;
  let cumulativeNetCashFlowAfterFees = 0;

  for (let year = 1; year <= usufruitDuration; year++) {
    const yearMultiplier = Math.pow(1 + revalorizationRate / 100, year - 1);
    const grossIncome = annualGrossIncomeBase * yearMultiplier;
    const amortization = year <= usufruitDuration ? annualAmortization : 0;

    let feesFiscal = 0;
    if (feesEnabled && year === 1 && feesTreatment === 'deductible-year1') {
      feesFiscal = feesDeductible;
    }
    // amortized: déjà dans la base amortissable, not-integrated / non-deductible: pas d'imputation

    // Cash décaissé net : HT si TVA récupérable (TVA remboursée dans l'année), TTC sinon
    // Pour le profil mixte, le cash décaissé = HT + TVA non récupérable
    const feesCash = (feesEnabled && year === 1)
      ? (effectiveVatRecoverable ? feesHT + nonRecoverableVatAmount : feesTTC)
      : 0;

    const fiscalResultOperationOnly = grossIncome - amortization - feesFiscal;
    const fiscalResultAfterOperation = preTaxProfit + fiscalResultOperationOnly;

    // IS sans opération recalculé chaque année (identique car résultat fiscal constant)
    const isBeforeOperation = isBeforeOperationBase;
    const isAfterOperation = calculateCorporateTax(fiscalResultAfterOperation, isOpts);
    const isImpact = isAfterOperation - isBeforeOperation;

    const netCashFlow = grossIncome - Math.max(0, isImpact);
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

  const y1 = projections[0];
  const annualISImpact = y1?.isImpact ?? 0;
  const annualNetCashFlow = Math.round(annualGrossIncomeBase - Math.max(0, annualISImpact));
  const annualNetCashFlowAfterFees = y1?.netCashFlowAfterFees ?? annualNetCashFlow - feesTTC;

  // Rendements
  const netCompanyYield = usufruitInvestment > 0 ? (annualNetCashFlow / usufruitInvestment) * 100 : 0;
  const netCompanyYieldYear1 = effortEconomique > 0 ? (annualNetCashFlowAfterFees / effortEconomique) * 100 : 0;
  const cumulAfterFees = y1 ? cumulativeNetCashFlowAfterFees : 0;
  const netCompanyYieldAvgAnnual = effortEconomique > 0 && usufruitDuration > 0
    ? ((cumulAfterFees / usufruitDuration) / effortEconomique) * 100 : 0;
  const netCompanyYieldTotal = effortEconomique > 0 ? (cumulAfterFees / effortEconomique) * 100 : 0;

  // ── Lecture économique après extinction de l'usufruit ──
  const gainNetAfterUsufructExtinction = cumulativeNetCashFlowAfterFees - effortEconomique;
  const netEconomicReturnAfterExtinction = effortEconomique > 0
    ? (gainNetAfterUsufructExtinction / effortEconomique) * 100 : 0;
  const annualizedSimpleReturnAfterExtinction = effortEconomique > 0 && usufruitDuration > 0
    ? (gainNetAfterUsufructExtinction / effortEconomique / usufruitDuration) * 100 : 0;
  const cashFlowAverageReturn = netCompanyYieldAvgAnnual; // même formule, nouveau nom

  // ── TRI indicatif ──
  const irrCashFlows: number[] = [-effortEconomique];
  for (const p of projections) {
    irrCashFlows.push(p.netCashFlowAfterFees);
  }
  const irr = calculateIrr(irrCashFlows);

  return {
    inputs,
    reconstitutedFullProperty: Math.round(reconstitutedFullProperty),
    annualGrossIncome: Math.round(annualGrossIncomeBase),
    annualAmortization: Math.round(annualAmortization),
    amortizableBase: Math.round(amortizableBase),
    feesHT,
    feesVAT,
    feesTTC,
    feesDeductible,
    feesFiscalYear1: y1 ? y1.feesFiscal : 0,
    effortEconomique: Math.round(effortEconomique),
    effortTresorerie: Math.round(effortTresorerie),
    annualFiscalResultOperationOnly: y1 ? y1.fiscalResultOperationOnly : 0,
    annualFiscalResultAfterOperation: y1 ? y1.fiscalResultAfterOperation : 0,
    annualISBeforeOperation: y1 ? y1.isBeforeOperation : 0,
    annualISAfterOperation: y1 ? y1.isAfterOperation : 0,
    annualISImpact,
    annualNetCashFlow,
    annualNetCashFlowAfterFees,
    cumulativeNetCashFlow: Math.round(cumulativeNetCashFlow),
    cumulativeNetCashFlowAfterFees: Math.round(cumulativeNetCashFlowAfterFees),
    netCompanyYieldYear1: Math.round(netCompanyYieldYear1 * 100) / 100,
    netCompanyYieldAvgAnnual: Math.round(netCompanyYieldAvgAnnual * 100) / 100,
    netCompanyYieldTotal: Math.round(netCompanyYieldTotal * 100) / 100,
    netCompanyYield: Math.round(netCompanyYield * 100) / 100,
    economicInitialEffort: Math.round(economicInitialEffort),
    gainNetAfterUsufructExtinction: Math.round(gainNetAfterUsufructExtinction),
    netEconomicReturnAfterExtinction: Math.round(netEconomicReturnAfterExtinction * 100) / 100,
    annualizedSimpleReturnAfterExtinction: Math.round(annualizedSimpleReturnAfterExtinction * 100) / 100,
    cashFlowAverageReturn: Math.round(cashFlowAverageReturn * 100) / 100,
    recoverableVatAmount: Math.round(recoverableVatAmount),
    nonRecoverableVatAmount: Math.round(nonRecoverableVatAmount),
    projections,
  };
}
