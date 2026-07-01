export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'N/A';
  }
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'Md€';
  } else if (amount >= 1000000) {
    return Math.round(amount / 1000000) + 'M€';
  } else if (amount >= 1000) {
    return Math.round(amount / 1000) + 'k€';
  } else {
    return Math.round(amount).toLocaleString('fr-FR') + '€';
  }
};

import {
  calculateScpiDiscountPremium,
  getScpiDiscountPremium,
  type DiscountPremiumInput,
  type DiscountPremiumResult,
} from './scpiDiscountPremium';

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/D';
  }
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${value > 0 ? '+' : ''}${formatted}\u202f%`;
};

export const getPerformanceColor = (scpiYield: number | undefined | null): string => {
  if (scpiYield === undefined || scpiYield === null || isNaN(scpiYield)) {
    return 'text-gray-600 dark:text-gray-400';
  }
  if (scpiYield >= 7) return 'text-green-600 dark:text-green-400';
  if (scpiYield >= 5) return 'text-blue-600 dark:text-blue-400';
  if (scpiYield >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getDiscountColor = (discount: number | undefined | null): string => {
  if (discount === undefined || discount === null || isNaN(discount)) {
    return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-bold';
  }
  if (discount < -0.005) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded font-bold';
  if (discount > 0.005) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-1 rounded font-bold';
  return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-2 py-1 rounded font-bold';
};

/* ─────────────────────────────────────────
   Décote / Surcote — source unique
   ───────────────────────────────────────── */

/** @deprecated Conservé pour rétrocompatibilité. Toujours true. */
export const isDiscountReliable = (_qaStatus?: string): boolean => true;

/** @deprecated Conservé pour rétrocompatibilité. Plus utilisé. */
export const DISCOUNT_CONSISTENCY_TOLERANCE = 0.2;

/**
 * Décote/surcote calculée à partir du prix et de la VR.
 * Délègue à la source unique `calculateScpiDiscountPremium`.
 *
 * Formule : (prix / VR - 1) × 100
 */
export const computeDisplayedDiscount = (
  price: number | undefined | null,
  reconstitutionValue: number | undefined | null,
  _qaStatus?: string,
  _storedDiscount?: number | null
): number | null => {
  return calculateScpiDiscountPremium(price, reconstitutionValue);
};

/** Objet minimal accepté par le résolveur unique de décote/surcote. */
export interface DiscountResolvable extends DiscountPremiumInput {
  discountQaStatus?: string;
  discount?: number | null;
}

/** Résultat unique de la décote/surcote affichable. */
export interface ResolvedDiscount {
  value: number | null;
  reliable: boolean;
  formatted: string;
  colorClass: string;
}

const DISCOUNT_NEUTRAL_CLASS =
  'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-semibold';

/**
 * FONCTION UNIQUE de résolution de la décote/surcote affichable.
 * Délègue à `getScpiDiscountPremium` (source centrale incontestable).
 */
export const resolveDisplayedDiscount = (scpi: DiscountResolvable): ResolvedDiscount => {
  const result: DiscountPremiumResult = getScpiDiscountPremium(scpi);
  if (result.value == null) {
    return { value: null, reliable: false, formatted: 'N/D', colorClass: DISCOUNT_NEUTRAL_CLASS };
  }
  return {
    value: result.value,
    reliable: true,
    formatted: result.formatted,
    colorClass: getDiscountColor(result.value),
  };
};

/**
 * @deprecated Wrapper rétrocompatible. Utiliser resolveDisplayedDiscount.
 */
export const formatDiscountQa = (
  price: number | undefined | null,
  reconstitutionValue: number | undefined | null,
  _qaStatus?: string,
  _storedDiscount?: number | null
): string =>
  resolveDisplayedDiscount({
    price,
    valeurReconstitution: reconstitutionValue,
  }).formatted;

/**
 * @deprecated Wrapper rétrocompatible. Utiliser resolveDisplayedDiscount.
 */
export const getDiscountQaColor = (
  price: number | undefined | null,
  reconstitutionValue: number | undefined | null,
  _qaStatus?: string,
  _storedDiscount?: number | null
): string =>
  resolveDisplayedDiscount({
    price,
    valeurReconstitution: reconstitutionValue,
  }).colorClass;

/**
 * Normalise une chaîne de caractères en supprimant les accents et en la mettant en minuscules
 * Utilisé pour la recherche insensible aux accents
 */
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};