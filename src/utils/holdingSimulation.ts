/**
 * UTILITAIRE PARTAGÉ — Simulation Holding IS / Usufruit temporaire SCPI
 *
 * Fonctions pures, sans dépendance React.
 *
 * Convention économique des frais :
 * - Les frais de mission sont dans l'effort initial économique (année 0).
 * - Ils ne sont jamais déduits une seconde fois dans le cash-flow opérationnel
 *   utilisé pour le TRI, le gain économique net ou la comparaison alternative.
 * - Le flux net année 1 après frais de lancement reste disponible à titre indicatif.
 */

/* ── Types ── */

export type FeesMode = 'fixed' | 'percentage';
export type FeesTreatment = 'not-integrated' | 'deductible-year1' | 'amortized' | 'non-deductible';
export type FeesVatMode = 'HT' | 'TTC';
export type HoldingVatProfile = 'to-qualify' | 'animator' | 'pure' | 'mixed';
export type AlternativeType = 'compte_terme' | 'fonds_monetaire' | 'personnalise';
export type AlternativeRateMode = 'brut' | 'net';

export interface CabinetCheck {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  category: 'fiscal' | 'tva' | 'economic' | 'scpi' | 'fees' | 'data';
}

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

  // Comparaison trésorerie alternative
  alternativeType?: AlternativeType;
  alternativeGrossRate?: number;
  alternativeRateMode?: AlternativeRateMode;
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
  /** Flux net opérationnel (pas de déduction des frais, déjà en année 0) */
  annualOperationalNetCashFlow: number;
  /** Flux net après frais de lancement (année 1 seulement) */
  yearOneLaunchNetCashFlow: number;
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
  /** Sortie de trésorerie liée aux frais (HT + TVA non récup) */
  feesEconomicOutflow: number;

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
  /** Gain net économique après extinction : cumul flux opérationnels - effort initial */
  economicGainAfterExtinction: number;
  /** Rendement simple après extinction (%) */
  netEconomicReturnAfterExtinction: number;
  /** Rendement simple annualisé après extinction (% / an) */
  annualizedSimpleReturnAfterExtinction: number;
  /** Rendement cash-flow moyen annuel : (cumul / durée) / effort */
  cashFlowAverageReturn: number;

  // ── Lecture économique corrigée (flux opérationnels, frais en année 0) ──
  /** Gain net après extinction (ancien nom, même sens que economicGainAfterExtinction) */
  gainNetAfterUsufructExtinction: number;
  /** Flux net opérationnel cumulé (sans double-comptage des frais) */
  economicCumulativeNetCashFlow: number;
  /** Flux net année 1 après frais de lancement (indicateur secondaire) */
  yearOneLaunchNetCashFlow: number;

  // ── TVA détaillée ──
  /** TVA récupérable (€) */
  recoverableVatAmount: number;
  /** TVA non récupérable (€) */
  nonRecoverableVatAmount: number;

  // ── TRI indicatif ──
  indicativeIrr: number | null;
  irrCashFlows: number[];
  irrMethod: string;

  // ── Comparaison alternative ──
  alternativeAnnualNetYield: number;
  alternativeCumulativeNetIncome: number;
  alternativeEndingCapital: number;
  alternativeTotalValue: number;
  alternativeComparisonSpread: number;

  // ── Contrôles cabinet ──
  cabinetChecks: CabinetCheck[];

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
  try {
    if (!cashFlows || cashFlows.length < 2) return null;
    const hasNegative = cashFlows.some(cf => cf < 0);
    const hasPositive = cashFlows.some(cf => cf > 0);
    if (!hasNegative || !hasPositive) return null;

    let guess = 0.1;
    for (let i = 0; i < IRR_MAX_ITERATIONS; i++) {
      const f = npv(guess, cashFlows);
      const fPrime = npvDerivative(guess, cashFlows);
      if (!Number.isFinite(f) || !Number.isFinite(fPrime)) return null;
      if (Math.abs(fPrime) < 1e-12) break;
      const newGuess = guess - f / fPrime;
      if (!Number.isFinite(newGuess)) return null;
      if (Math.abs(newGuess - guess) < IRR_TOLERANCE) {
        const irr = Math.round(newGuess * 10000) / 100;
        return Number.isFinite(irr) ? irr : null;
      }
      guess = newGuess;
    }
  } catch {
    // silencieux — pas de crash
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

/* ── Contrôles cabinet ── */

export function buildCabinetChecks(inputs: HoldingISInputs, results: HoldingISResult): CabinetCheck[] {
  try {
    if (!inputs || !results) return [];
    const checks: CabinetCheck[] = [];

  // ── TVA ──
  if (inputs.feesEnabled) {
    if (inputs.holdingVatProfile === 'pure' && inputs.feesVatRecoverable) {
      checks.push({
        id: 'tva-pure-recoverable',
        level: 'critical',
        title: 'Incohérence probable TVA',
        message: 'Une holding pure ne permet généralement pas la récupération de TVA. TVA non récupérable retenue par prudence.',
        category: 'tva',
      });
    }
    if (inputs.holdingVatProfile === 'to-qualify' && inputs.feesVatRecoverable) {
      checks.push({
        id: 'tva-to-qualify-recoverable',
        level: 'warning',
        title: 'TVA récupérable en hypothèse',
        message: 'TVA récupérable retenue à titre d\'hypothèse alors que le profil TVA reste à qualifier.',
        category: 'tva',
      });
    }
    if (inputs.holdingVatProfile === 'mixed') {
      const rate = Number(inputs.vatRecoveryRate);
      if (!Number.isFinite(rate) || rate <= 0) {
        checks.push({
          id: 'tva-mixed-no-rate',
          level: 'warning',
          title: 'Taux de récupération TVA manquant',
          message: 'Holding mixte : le taux de récupération TVA doit être documenté.',
          category: 'tva',
        });
      }
    }
  }

  // ── IS ──
  if (inputs.preTaxProfit > DEFAULT_REDUCED_THRESHOLD) {
    checks.push({
      id: 'is-threshold-consumed',
      level: 'info',
      title: 'Tranche IS à taux réduit consommée',
      message: `La tranche d'IS à taux réduit (${DEFAULT_REDUCED_THRESHOLD.toLocaleString('fr-FR')} €) est déjà consommée par le résultat fiscal initial. Le résultat additionnel est imposé au taux marginal applicable.`,
      category: 'fiscal',
    });
  } else if (inputs.preTaxProfit < DEFAULT_REDUCED_THRESHOLD) {
    checks.push({
      id: 'is-threshold-available',
      level: 'info',
      title: 'Taux réduit partiellement disponible',
      message: 'Une partie du résultat additionnel peut encore bénéficier du taux réduit sous réserve d\'éligibilité.',
      category: 'fiscal',
    });
  }
  if (inputs.reducedRateEligible) {
    checks.push({
      id: 'is-reduced-conditions',
      level: 'warning',
      title: 'Conditions taux réduit PME',
      message: 'Conditions du taux réduit à vérifier : chiffre d\'affaires, capital libéré, détention du capital.',
      category: 'fiscal',
    });
  }

  // ── Économie ──
  if (results.economicGainAfterExtinction < 0) {
    checks.push({
      id: 'eco-negative-gain',
      level: 'critical',
      title: 'Gain économique négatif',
      message: 'Gain économique négatif après extinction de l\'usufruit.',
      category: 'economic',
    });
  }
  if (results.indicativeIrr !== null && results.alternativeAnnualNetYield > 0
      && results.indicativeIrr < results.alternativeAnnualNetYield) {
    checks.push({
      id: 'eco-irr-below-alternative',
      level: 'warning',
      title: 'TRI inférieur à l\'alternative',
      message: 'Le TRI indicatif ressort inférieur à l\'alternative de trésorerie saisie.',
      category: 'economic',
    });
  }
  if (results.yearOneLaunchNetCashFlow < 0) {
    checks.push({
      id: 'eco-negative-year1',
      level: 'warning',
      title: 'Flux net année 1 négatif',
      message: 'Flux net année 1 négatif.',
      category: 'economic',
    });
  }
  if (results.cashFlowAverageReturn > 20) {
    checks.push({
      id: 'eco-high-yield',
      level: 'warning',
      title: 'Rendement de flux élevé',
      message: 'Rendement de flux élevé : vérifier les hypothèses de distribution, de clé d\'usufruit et de fiscalité.',
      category: 'economic',
    });
  }

  // ── Frais ──
  if (inputs.feesEnabled && results.feesHT > 0 && inputs.usufruitInvestment > 0) {
    const feesRatio = (results.feesHT / inputs.usufruitInvestment) * 100;
    if (feesRatio > 10) {
      checks.push({
        id: 'fees-high',
        level: 'warning',
        title: 'Frais de mission élevés',
        message: `Frais de mission élevés par rapport au montant d'usufruit investi (${Math.round(feesRatio)} %).`,
        category: 'fees',
      });
    }
  }

  // ── SCPI / usufruit ──
  if (inputs.usufruitKeyPercent <= 0 || inputs.usufruitKeyPercent > 100) {
    checks.push({
      id: 'scpi-invalid-key',
      level: 'critical',
      title: 'Clé d\'usufruit invalide',
      message: 'Clé d\'usufruit invalide.',
      category: 'scpi',
    });
  }
  if (inputs.usufruitDuration <= 0) {
    checks.push({
      id: 'scpi-invalid-duration',
      level: 'critical',
      title: 'Durée d\'usufruit invalide',
      message: 'Durée d\'usufruit invalide.',
      category: 'scpi',
    });
  }
  if (inputs.grossYieldRate <= 0) {
    checks.push({
      id: 'scpi-zero-yield',
      level: 'warning',
      title: 'Taux de distribution nul ou négatif',
      message: 'Taux de distribution nul ou négatif.',
      category: 'scpi',
    });
  }
  checks.push({
    id: 'scpi-fees-included',
    level: 'info',
    title: 'Frais SCPI réputés intégrés',
    message: 'Le montant investi en usufruit est réputé correspondre au prix d\'acquisition total de l\'usufruit selon la clé de démembrement. Les frais de souscription SCPI sont réputés intégrés dans ce prix, sauf modalité spécifique de la société de gestion.',
    category: 'scpi',
  });

  return checks;
  } catch (e) {
    console.error('[buildCabinetChecks]', e);
    return [];
  }
}

/* ── Calcul principal ── */

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
    alternativeType,
    alternativeGrossRate = 0,
    alternativeRateMode = 'brut',
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
    effectiveVatRecoverable = feesVatRecoverable;
    recoverableVatAmount = feesVatRecoverable ? feesVAT : 0;
    nonRecoverableVatAmount = feesVatRecoverable ? 0 : feesVAT;
  }

  // Sortie de trésorerie liée aux frais : HT + TVA non récupérable
  const feesEconomicOutflow = feesHT + nonRecoverableVatAmount;

  // ═══ Convention économique : les frais sont en année 0 ═══
  // Effort économique initial = usufruit + frais (HT + TVA non récupérable)
  const economicInitialEffort = usufruitInvestment + feesEconomicOutflow;

  // Efforts (rétrocompatibilité)
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

  // Taux marginal d'IS pour la comparaison alternative
  const marginalCorporateTaxRate = reducedRateEligible && preTaxProfit < DEFAULT_REDUCED_THRESHOLD
    ? DEFAULT_REDUCED_RATE / 100
    : DEFAULT_STANDARD_RATE / 100;

  // 5. Projection annuelle
  const projections: HoldingISYearProjection[] = [];
  let cumulativeNetCashFlow = 0;
  let cumulativeNetCashFlowAfterFees = 0;
  let economicCumulativeNetCashFlow = 0;
  const annualOperationalNetCashFlows: number[] = [];

  for (let year = 1; year <= usufruitDuration; year++) {
    const yearMultiplier = Math.pow(1 + revalorizationRate / 100, year - 1);
    const grossIncome = annualGrossIncomeBase * yearMultiplier;
    const amortization = year <= usufruitDuration ? annualAmortization : 0;

    let feesFiscal = 0;
    if (feesEnabled && year === 1 && feesTreatment === 'deductible-year1') {
      feesFiscal = feesDeductible;
    }

    // Cash décaissé net : HT si TVA récupérable (TVA remboursée), TTC sinon
    const feesCash = (feesEnabled && year === 1)
      ? (effectiveVatRecoverable ? feesHT + nonRecoverableVatAmount : feesTTC)
      : 0;

    const fiscalResultOperationOnly = grossIncome - amortization - feesFiscal;
    const fiscalResultAfterOperation = preTaxProfit + fiscalResultOperationOnly;

    const isBeforeOperation = isBeforeOperationBase;
    const isAfterOperation = calculateCorporateTax(fiscalResultAfterOperation, isOpts);
    const isImpact = isAfterOperation - isBeforeOperation;

    const netCashFlow = grossIncome - Math.max(0, isImpact);
    const netCashFlowAfterFees = netCashFlow - feesCash;

    cumulativeNetCashFlow += netCashFlow;
    cumulativeNetCashFlowAfterFees += netCashFlowAfterFees;

    // ═══ Flux opérationnel : PAS de déduction des frais (déjà en année 0) ═══
    const annualOperationalNetCashFlow = grossIncome - Math.max(0, isImpact);
    economicCumulativeNetCashFlow += annualOperationalNetCashFlow;
    annualOperationalNetCashFlows.push(Math.round(annualOperationalNetCashFlow));

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
      annualOperationalNetCashFlow: Math.round(annualOperationalNetCashFlow),
      yearOneLaunchNetCashFlow: year === 1 ? Math.round(netCashFlow - feesEconomicOutflow) : Math.round(annualOperationalNetCashFlow),
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

  // Flux net lancement année 1 (indicateur secondaire)
  const yearOneLaunchNetCashFlow = y1?.yearOneLaunchNetCashFlow ?? annualNetCashFlow - feesEconomicOutflow;

  // Rendements
  const netCompanyYield = usufruitInvestment > 0 ? (annualNetCashFlow / usufruitInvestment) * 100 : 0;
  const netCompanyYieldYear1 = effortEconomique > 0 ? (annualNetCashFlowAfterFees / effortEconomique) * 100 : 0;
  const cumulAfterFees = y1 ? cumulativeNetCashFlowAfterFees : 0;
  const netCompanyYieldAvgAnnual = effortEconomique > 0 && usufruitDuration > 0
    ? ((cumulAfterFees / usufruitDuration) / effortEconomique) * 100 : 0;
  const netCompanyYieldTotal = effortEconomique > 0 ? (cumulAfterFees / effortEconomique) * 100 : 0;

  // ═══ Lecture économique après extinction (flux opérationnels, frais en année 0) ═══
  const economicCumulativeNetCashFlowRounded = Math.round(economicCumulativeNetCashFlow);
  const economicGainAfterExtinction = economicCumulativeNetCashFlowRounded - economicInitialEffort;
  const gainNetAfterUsufructExtinction = economicGainAfterExtinction; // ancien nom, même sens
  const netEconomicReturnAfterExtinction = economicInitialEffort > 0
    ? (economicGainAfterExtinction / economicInitialEffort) * 100 : 0;
  const annualizedSimpleReturnAfterExtinction = economicInitialEffort > 0 && usufruitDuration > 0
    ? (economicGainAfterExtinction / economicInitialEffort / usufruitDuration) * 100 : 0;
  const cashFlowAverageReturn = netCompanyYieldAvgAnnual;

  // ═══ TRI indicatif (flux opérationnels, frais en année 0) ═══
  const irrCashFlows: number[] = [-economicInitialEffort, ...annualOperationalNetCashFlows];
  const indicativeIrr = calculateIrr(irrCashFlows);

  // ═══ Comparaison trésorerie alternative ═══
  let alternativeAnnualNetYield = 0;
  let alternativeCumulativeNetIncome = 0;
  let alternativeEndingCapital = economicInitialEffort;
  let alternativeTotalValue = economicInitialEffort;
  let alternativeComparisonSpread = -economicGainAfterExtinction; // par défaut

  if (alternativeType && alternativeGrossRate > 0 && economicInitialEffort > 0) {
    if (alternativeRateMode === 'brut') {
      alternativeAnnualNetYield = alternativeGrossRate * (1 - marginalCorporateTaxRate);
    } else {
      alternativeAnnualNetYield = alternativeGrossRate;
    }
    alternativeCumulativeNetIncome = Math.round(economicInitialEffort * (alternativeAnnualNetYield / 100) * usufruitDuration);
    alternativeTotalValue = Math.round(economicInitialEffort + alternativeCumulativeNetIncome);
    alternativeComparisonSpread = economicGainAfterExtinction - alternativeCumulativeNetIncome;
  }

  // ═══ Contrôles cabinet ═══
  // On construit d'abord le résultat sans cabinetChecks, puis on les ajoute après.
  // (buildCabinetChecks doit recevoir le result complet, pas un objet en cours de construction.)

  const result: HoldingISResult = {
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
    feesEconomicOutflow: Math.round(feesEconomicOutflow),
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
    economicGainAfterExtinction: Math.round(economicGainAfterExtinction),
    gainNetAfterUsufructExtinction: Math.round(gainNetAfterUsufructExtinction),
    economicCumulativeNetCashFlow: economicCumulativeNetCashFlowRounded,
    yearOneLaunchNetCashFlow: Math.round(yearOneLaunchNetCashFlow),
    netEconomicReturnAfterExtinction: Math.round(netEconomicReturnAfterExtinction * 100) / 100,
    annualizedSimpleReturnAfterExtinction: Math.round(annualizedSimpleReturnAfterExtinction * 100) / 100,
    cashFlowAverageReturn: Math.round(cashFlowAverageReturn * 100) / 100,
    recoverableVatAmount: Math.round(recoverableVatAmount),
    nonRecoverableVatAmount: Math.round(nonRecoverableVatAmount),
    indicativeIrr,
    irrCashFlows,
    irrMethod: 'annual_net_cash_flows_no_residual',
    alternativeAnnualNetYield,
    alternativeCumulativeNetIncome,
    alternativeEndingCapital,
    alternativeTotalValue,
    alternativeComparisonSpread,
    cabinetChecks: [], // sera rempli ci-dessous après construction de result
    projections,
  };

  // ═══ Contrôles cabinet (après construction de result pour éviter la circularité) ═══
  result.cabinetChecks = buildCabinetChecks(inputs, result);

  return result;
}
