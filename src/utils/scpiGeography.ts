import { normalizeGeoLabel } from './labelNormalization';

/**
 * Public comparators display exposures by COUNTRY, not a mix of French
 * regions and foreign countries. Preserve issuer raw regions in data sources.
 * Never manufacture a balancing bucket if official data sums to 99.9%.
 */
export const aggregateCountryGeography = (
  input: Record<string, number | string> | null | undefined,
): Record<string, number> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const totals: Record<string, number> = {};
  for (const [name, raw] of Object.entries(input)) {
    const value = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(value) || value < 0 || value > 100) continue;
    const label = normalizeGeoLabel(name).label;
    if (!label) continue;
    totals[label] = (totals[label] ?? 0) + value;
  }
  return Object.fromEntries(
    Object.entries(totals)
      .map(([name, value]) => [name, Math.round(value * 1000) / 1000] as const)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]),
  );
};
