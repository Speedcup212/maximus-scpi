/**
 * Publication freshness is relative to the dominant published quarter, not the
 * machine clock: a bulletin for the current quarter may not yet be available.
 */
const QUARTER = /^20\d{2}-T[1-4]$/;

export const canonicalQuarter = (value: string | null | undefined): string | null =>
  value && QUARTER.test(value) ? value : null;

export const dominantPublishedQuarter = (
  periods: ReadonlyArray<string | null | undefined>,
  coverage = 0.8,
): string | null => {
  if (periods.length === 0) return null;

  const counts = new Map<string, number>();
  periods.forEach((raw) => {
    const quarter = canonicalQuarter(raw);
    if (quarter) counts.set(quarter, (counts.get(quarter) ?? 0) + 1);
  });

  const minimum = Math.ceil(periods.length * coverage);
  return [...counts.entries()]
    .filter(([, count]) => count >= minimum)
    .sort(([a], [b]) => b.localeCompare(a))[0]?.[0] ?? null;
};

export const isOlderQuarter = (
  sourcePeriod: string | null | undefined,
  referencePeriod: string | null | undefined,
): boolean => {
  const current = canonicalQuarter(sourcePeriod);
  const reference = canonicalQuarter(referencePeriod);
  return Boolean(current && reference && current < reference);
};
