import type { TMIValue } from './taxOptimization';
import type { SectorThreshold } from './sectorQualification';
import { getScpiDiscountPremium, type DiscountPremiumInput } from './scpiDiscountPremium';

export type { TMIValue, SectorThreshold };
export type FilterRange = [number | null, number | null];

export interface FilterState {
  tmi: TMIValue;
  minYield: number;
  priceRange: 'all' | 'accessible' | 'standard' | 'premium';
  geographies: string[];
  sectors: string[];
  sectorThreshold: SectorThreshold;
  hasISR: boolean | null;
  noEntryFees: boolean;
  expertMode: boolean;
  capitalizationRange: FilterRange; // M€, converted from the numeric catalog value in euros.
  discountRange: FilterRange; // Negative = discount, positive = premium.
  maxLtv: number | null;
  maxJouissanceMonths: number | null;
  minRanDays: number;
  noWaitingShares: boolean;
}

export const createDefaultComparatorFilters = (): FilterState => ({
  tmi: null,
  minYield: 0,
  priceRange: 'all',
  geographies: [],
  sectors: [],
  sectorThreshold: '25',
  hasISR: null,
  noEntryFees: false,
  expertMode: false,
  capitalizationRange: [null, null],
  discountRange: [null, null],
  maxLtv: null,
  maxJouissanceMonths: null,
  minRanDays: 0,
  noWaitingShares: false,
});

interface FinancialFilterData extends DiscountPremiumInput {
  capitalization?: number | null; // Euros, never a formatted M€/Md€ label.
  debt?: number | null;
  delaiJouissance?: number | null;
}

const hasBound = (range: FilterRange): boolean => range.some(bound => bound !== null);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const withinRange = (value: number, [min, max]: FilterRange): boolean =>
  // Preserve inclusive percentage boundaries despite floating point arithmetic.
  (min === null || value >= min - 1e-9) &&
  (max === null || value <= max + 1e-9);

/** All four filters use the same numeric public catalog as the current indicators.
 * Missing/invalid metrics exclude a fund only when their criterion is active.
 * No fallback to the old formatted extended-catalog labels or fabricated zeros.
 */
export function matchesComparatorFinancialFilters(
  scpi: FinancialFilterData | undefined,
  filters: FilterState,
): boolean {
  if (hasBound(filters.capitalizationRange)) {
    const capital = scpi?.capitalization;
    if (!isFiniteNumber(capital) || capital <= 0 ||
        !withinRange(capital / 1_000_000, filters.capitalizationRange)) return false;
  }

  if (hasBound(filters.discountRange)) {
    if (!scpi || scpi.discountQaStatus !== 'publishable') return false;
    const discount = getScpiDiscountPremium(scpi).value;
    if (discount === null || !withinRange(discount, filters.discountRange)) return false;
  }

  if (filters.maxLtv !== null) {
    const debt = scpi?.debt;
    if (!isFiniteNumber(debt) || debt < 0 || debt > filters.maxLtv) return false;
  }

  if (filters.maxJouissanceMonths !== null) {
    const delay = scpi?.delaiJouissance;
    if (!isFiniteNumber(delay) || delay < 0 || delay > filters.maxJouissanceMonths) return false;
  }

  return true;
}

export const countFinancialFilters = (filters: FilterState): number =>
  Number(hasBound(filters.capitalizationRange)) + Number(hasBound(filters.discountRange)) +
  Number(filters.maxLtv !== null) + Number(filters.maxJouissanceMonths !== null);

/** Updating a bound keeps a valid range, including when only one bound is set. */
export function updateFilterRange(range: FilterRange, index: 0 | 1, value: number | null): FilterRange {
  const next: FilterRange = [...range];
  next[index] = value;
  if (next[0] !== null && next[1] !== null && next[0] > next[1]) {
    next[index === 0 ? 1 : 0] = value;
  }
  return next;
}
