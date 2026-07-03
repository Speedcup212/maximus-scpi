/**
 * CRASH TEST SCENARIOS - Simulateur Holding IS Expert-Comptable
 *
 * Usage (dev uniquement) :
 *   import { runExpertCrashTests } from './expertCrashTestScenarios';
 *   runExpertCrashTests();
 *
 * Verifie qu'aucun resultat ne contient NaN, undefined, null.
 */

import type { HoldingISInputs, HoldingISResult } from './holdingSimulation';
import { calculateHoldingISProjection } from './holdingSimulation';

/* Base valide */

const BASE_INPUTS: HoldingISInputs = {
  dossierName: 'Test SAS',
  companyType: 'SAS',
  availableCash: 250_000,
  preTaxProfit: 100_000,
  reducedRateEligible: true,
  usufruitInvestment: 100_000,
  usufruitDuration: 10,
  usufruitKeyPercent: 35,
  grossYieldRate: 6.5,
  revalorizationRate: 0,
  feesEnabled: true,
  feesMode: 'fixed',
  feesFixedAmount: 3_000,
  feesPercentage: 3,
  feesTreatment: 'deductible-year1',
  feesVatMode: 'HT',
  feesVatRate: 20,
  feesVatRecoverable: true,
  holdingVatProfile: 'to-qualify',
  vatRecoveryRate: 100,
};

/* Scenarios */

interface CrashTestScenario {
  name: string;
  overrides: Partial<HoldingISInputs>;
}

const SCENARIOS: CrashTestScenario[] = [
  { name: 'Base valide', overrides: {} },
  { name: 'Tresorerie insuffisante', overrides: { availableCash: 50_000, usufruitInvestment: 100_000 } },
  { name: 'Resultat fiscal nul', overrides: { preTaxProfit: 0 } },
  { name: 'Resultat fiscal 42 500 EUR', overrides: { preTaxProfit: 42_500 } },
  { name: 'Cle usufruit 0 %', overrides: { usufruitKeyPercent: 0 } },
  { name: 'Cle usufruit 100 %', overrides: { usufruitKeyPercent: 100 } },
  { name: 'Taux distribution 0 %', overrides: { grossYieldRate: 0 } },
  { name: 'Frais eleves', overrides: { feesFixedAmount: 15_000 } },
  { name: 'TVA non recuperable', overrides: { feesVatRecoverable: false, holdingVatProfile: 'pure' } },
  { name: 'Comparaison alternative vide', overrides: { alternativeType: undefined, alternativeGrossRate: undefined } },
  { name: 'Comparaison 3.05 %', overrides: { alternativeType: 'compte_terme', alternativeGrossRate: 3.05, alternativeRateMode: 'brut' } },
  { name: 'Holding pure + TVA recuperable', overrides: { holdingVatProfile: 'pure', feesVatRecoverable: true } },
  { name: 'Frais non deductibles', overrides: { feesTreatment: 'non-deductible' } },
  { name: 'Frais amortis', overrides: { feesTreatment: 'amortized' } },
  { name: 'TRI non calculable (flux nul)', overrides: { grossYieldRate: 0, usufruitKeyPercent: 1, feesEnabled: false } },
];

/* Deep check */

function deepCheck(label: string, value: unknown, path: string = '', isInputs: boolean = false): string[] {
  const errors: string[] = [];
  // Dans l'objet inputs, les champs undefined sont normaux (optionnels)
  if (value === undefined) {
    if (!isInputs) {
      errors.push(`[${label}] ${path} -> undefined`);
    }
  } else if (typeof value === 'number' && Number.isNaN(value)) {
    errors.push(`[${label}] ${path} -> NaN`);
  } else if (typeof value === 'number' && !Number.isFinite(value)) {
    errors.push(`[${label}] ${path} -> Infinity`);
  } else if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const childPath = path ? `${path}.${k}` : k;
      // inputs est l'objet source, les champs undefined y sont normaux
      errors.push(...deepCheck(label, v, childPath, isInputs || k === 'inputs'));
    }
  }
  return errors;
}

/* Runner */

export function runExpertCrashTests(): { passed: boolean; results: { name: string; status: string; errors: string[] }[] } {
  const results: { name: string; status: string; errors: string[] }[] = [];

  for (const scenario of SCENARIOS) {
    const inputs: HoldingISInputs = { ...BASE_INPUTS, ...scenario.overrides };
    let result: HoldingISResult;
    try {
      result = calculateHoldingISProjection(inputs);
    } catch (err) {
      results.push({ name: scenario.name, status: 'CRASH', errors: [(err as Error).message] });
      continue;
    }

    const errors = deepCheck(scenario.name, result);
    if (errors.length > 0) {
      results.push({ name: scenario.name, status: `FAIL (${errors.length} NaN/undefined)`, errors });
    } else {
      results.push({ name: scenario.name, status: 'PASS', errors: [] });
    }
  }

  const passed = results.every(r => r.status === 'PASS');
  console.table(results.map(r => ({ Scenario: r.name, Statut: r.status, Erreurs: r.errors.join(', ') || '-' })));
  console.log(passed ? 'Tous les crash tests passent.' : 'Des crash tests ont echoue.');
  return { passed, results };
}
