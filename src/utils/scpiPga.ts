import { OFFICIAL_PGA_2025, type OfficialPga2025 } from '../data/scpiPgaOfficial2025';
import { createSlugFromName } from './scpiSlugMapper';

/** Valeur volontairement absente tant que la PGA officielle n'est pas documentée. */
export function getVerifiedPga2025(name: string): Readonly<OfficialPga2025> | null {
  const result = OFFICIAL_PGA_2025[createSlugFromName(name)];
  if (!result || result.year !== 2025) return null;
  if (![result.pgaPct, result.distributionPct].every(Number.isFinite)) return null;
  if (!result.sourceUrl.startsWith('https://')) return null;
  return result;
}

export const formatPgaPercent = (value: number): string =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
