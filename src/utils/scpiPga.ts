import { OFFICIAL_PGA_2025, type OfficialPga2025 } from '../data/scpiPgaOfficial2025';
import { createSlugFromName } from './scpiSlugMapper';

/** Valeur volontairement absente tant que la PGA officielle n'est pas documentée. */
export function getVerifiedPga2025(name: string): Readonly<OfficialPga2025> | null {
  // Le catalogue contient des noms avec ligatures et chiffres romains
  // (Cœur d'Europe, Altixia Cadence XII). Ne pas modifier le routage global.
  const normalized = name.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae');
  const derived = createSlugFromName(normalized);
  const aliases: Readonly<Record<string, string>> = {
    'altixia-cadence-xii': 'altixia-cadence-12',
    'coeur-de-regions': 'coeur-de-region',
    'atream-hotels': 'atream-hotel',
    'atream-hotels-scpi': 'atream-hotel',
    'edmond-de-rothschild-europa': 'edr-europa',
    'edissimmo': 'edissimo',
  };
  const slug = aliases[derived] ?? derived;
  const result = OFFICIAL_PGA_2025[slug];
  if (!result || result.year !== 2025) return null;
  if (!Number.isFinite(result.pgaPct)) return null;
  if (result.distributionPct !== null && !Number.isFinite(result.distributionPct)) return null;
  if (!result.sourceUrl.startsWith('https://')) return null;
  return result;
}


/**
 * Tri par TD 2025 indissociable de sa PGA 2025 vérifiée.
 * Les SCPI sans couple documenté sont toujours à la fin.
 * N'utilise jamais un TD du bulletin courant pour départager une année 2025.
 */
export function compareVerified2025Distribution(aName: string, bName: string): number {
  const a = getVerifiedPga2025(aName)?.distributionPct;
  const b = getVerifiedPga2025(bName)?.distributionPct;
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return b - a;
}

export const formatPgaPercent = (value: number): string =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
