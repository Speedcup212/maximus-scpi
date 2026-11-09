import { OFFICIAL_PGA_2025, type OfficialPga2025 } from '../data/scpiPgaOfficial2025';
import { createSlugFromName } from './scpiSlugMapper';

/** Valeur volontairement absente tant que la PGA officielle n'est pas documentée. */
export function getVerifiedPga2025(name: string): Readonly<OfficialPga2025> | null {
  // Le catalogue contient des noms avec ligatures et chiffres romains
  // (Cœur d'Europe, Altixia Cadence XII). Ne pas modifier le routage global.
  const normalized = name.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae');
  const derived = createSlugFromName(normalized);
  const slug = derived === 'altixia-cadence-xii' ? 'altixia-cadence-12' : derived;
  const result = OFFICIAL_PGA_2025[slug];
  if (!result || result.year !== 2025) return null;
  if (![result.pgaPct, result.distributionPct].every(Number.isFinite)) return null;
  if (!result.sourceUrl.startsWith('https://')) return null;
  return result;
}

export const formatPgaPercent = (value: number): string =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
