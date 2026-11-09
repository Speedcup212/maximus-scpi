import { OFFICIAL_PGA_2025, PGA_2025_DOCUMENTARY_EXCEPTIONS, type OfficialPga2025 } from '../data/scpiPgaOfficial2025';
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
    'esg-pierre-capitale': 'esg-pierre-capital',
    'grand-paris-residentiels': 'grand-paris-residentiel',
  };
  const slug = aliases[derived] ?? derived;
  const result = OFFICIAL_PGA_2025[slug];
  if (!result || result.year !== 2025) return null;
  if (!Number.isFinite(result.pgaPct)) return null;
  if (result.distributionPct !== null && !Number.isFinite(result.distributionPct)) return null;
  if (!result.sourceUrl.startsWith('https://')) return null;
  if (result.verificationMethod === 'calculated_from_official_indicators') {
    const proof = result.calculationEvidence;
    if (!proof || result.distributionPct === null || proof.startingSubscriptionPrice <= 0 ||
        ![proof.grossDividendPerShare, proof.startingSubscriptionPrice, proof.followingSubscriptionPrice].every(Number.isFinite)) return null;
    const pgaCalculated = 100 * (proof.grossDividendPerShare +
      proof.followingSubscriptionPrice - proof.startingSubscriptionPrice) / proof.startingSubscriptionPrice;
    const tdCalculated = 100 * proof.grossDividendPerShare / proof.startingSubscriptionPrice;
    if (Math.abs(pgaCalculated - result.pgaPct) > 0.005 ||
        Math.abs(tdCalculated - result.distributionPct) > 0.005) return null;
  }
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

export function getPgaDocumentaryException(name: string): { reason: string; sourceUrl: string } | null {
  const normalized = createSlugFromName(name.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'));
  const exception = PGA_2025_DOCUMENTARY_EXCEPTIONS[normalized as keyof typeof PGA_2025_DOCUMENTARY_EXCEPTIONS];
  return exception ?? null;
}

export const formatPgaPercent = (value: number): string =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
