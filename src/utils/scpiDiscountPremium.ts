/**
 * UTILITAIRE CENTRAL UNIQUE — Décote / Surcote SCPI
 *
 * Toutes les surfaces du site (comparateur public, espace Pro, fiches SCPI,
 * modales d'analyse) doivent passer par ce module pour afficher la décote/surcote.
 */

import { isSubscriptionReconstitutionComparable } from './certifiedLiquidity';

/* ── Types ── */

export interface DiscountPremiumInput {
  price?: number | null;
  prixSouscription?: number | null;
  subscriptionPrice?: number | null;
  reconstitutionValue?: number | null;
  valeurReconstitution?: number | null;
  discountQaStatus?: 'publishable' | 'manual_review' | 'excluded_non_scpi' | string | null;
  capitalType?: string | null;
  liquidityBasis?: string | null;
  liquidityRegimeChanged?: boolean | null;
  reconstitutionGate?: string | null;
}

export interface DiscountPremiumResult {
  value: number | null;
  formatted: string;
  kind: 'decote' | 'surcote' | 'neutre' | 'absent';
}

export function parseFrenchNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  let cleaned = value.trim().replace(/[€$£]/g, '').trim();
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma) {
    cleaned = cleaned.replace(/\./g, '').replace(/\s/g, '');
    cleaned = cleaned.replace(',', '.');
  } else if (hasDot) {
    cleaned = cleaned.replace(/\s/g, '');
  } else {
    cleaned = cleaned.replace(/\s/g, '');
  }

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function calculateScpiDiscountPremium(
  subscriptionPrice: number | string | null | undefined,
  reconstitutionValue: number | string | null | undefined
): number | null {
  const price = parseFrenchNumber(subscriptionPrice);
  const vr = parseFrenchNumber(reconstitutionValue);

  if (price == null || vr == null) return null;
  if (price <= 0 || vr <= 0) return null;

  return (price / vr - 1) * 100;
}

export function formatScpiDiscountPremium(value: number | null): string {
  if (value == null) return 'N/D';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${value > 0 ? '+' : ''}${formatted}\u202f%`;
}

export function getDiscountPremiumKind(value: number | null): DiscountPremiumResult['kind'] {
  if (value == null) return 'absent';
  if (value < -0.005) return 'decote';
  if (value > 0.005) return 'surcote';
  return 'neutre';
}

export function getScpiDiscountPremiumClass(value: number | null): string {
  const kind = getDiscountPremiumKind(value);
  switch (kind) {
    case 'decote': return 'text-emerald-400 font-semibold';
    case 'surcote': return 'text-amber-400 font-semibold';
    case 'neutre': return 'text-slate-300 font-semibold';
    default: return 'text-slate-500';
  }
}

export function runDiscountPremiumTests(): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  function check(name: string, price: number, vr: number, expected: number, tolerance: number = 0.02) {
    const result = calculateScpiDiscountPremium(price, vr);
    if (result == null) {
      failures.push(`${name}: calcul a retourné null`);
      return;
    }
    if (Math.abs(result - expected) > tolerance) {
      failures.push(`${name}: attendu ${expected}%, obtenu ${result.toFixed(2)}%`);
    }
  }

  check('Cœur d\'Europe', 204, 219.47, -7.05);
  check('Comète', 210, 213.20, -1.50);
  check('Remake Live', 219, 207.12, 5.74);
  check('Transitions Europe', 202, 207.49, -2.65);
  check('Iroko Zen', 200, 203.67, -1.80);

  return { passed: failures.length === 0, failures };
}

const absentDiscount = (): DiscountPremiumResult => ({
  value: null,
  formatted: 'N/D',
  kind: 'absent',
});

/**
 * Source unique de décote/surcote affichable.
 * Le calcul brut reste disponible via calculateScpiDiscountPremium, mais l'affichage
 * est bloqué dès que le régime ou les gates rendent la comparaison non certifiée.
 */
export function getScpiDiscountPremium(scpi: DiscountPremiumInput): DiscountPremiumResult {
  if (scpi.discountQaStatus && scpi.discountQaStatus !== 'publishable') return absentDiscount();
  if (!isSubscriptionReconstitutionComparable(scpi)) return absentDiscount();

  const price = scpi.price ?? scpi.prixSouscription ?? scpi.subscriptionPrice;
  const vr = scpi.reconstitutionValue ?? scpi.valeurReconstitution;
  const value = calculateScpiDiscountPremium(price, vr);

  return {
    value,
    formatted: formatScpiDiscountPremium(value),
    kind: getDiscountPremiumKind(value),
  };
}
