/**
 * Trajectoire d'occupation du portefeuille, construite uniquement à partir de
 * périodes trimestrielles canoniques et d'historiques sourcés.
 * Pondération à poids ACTUELS constants : ce n'est ni le TOF réellement
 * consolidé aux dates passées, ni une série de rendement ou de valorisation.
 */
export type HistoricalTofRow = {
  scpi_slug: string;
  source_period: string | null;
  tof: number | string | null;
  qa_status: string | null;
  source_url: string | null;
  snapshot_at?: string | null;
};
export type HistoricalHolding = { slug: string; currentValue: number };
export type PortfolioTofPoint = {
  period: string;
  tof: number;
  coveragePercent: number;
  coveredCount: number;
  holdingCount: number;
};
const PERIOD_PATTERN = /^(20\d{2})-T([1-4])$/;
const numberOrNull = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const isAcceptedHistory = (row: HistoricalTofRow): boolean => {
  const n = numberOrNull(row.tof);
  return Boolean(
    row.source_period && PERIOD_PATTERN.test(row.source_period) &&
    row.qa_status && !/invalid|quarantin|unverified|reject|pending/i.test(row.qa_status) &&
    row.source_url && /^https:\/\//i.test(row.source_url) &&
    n !== null && n >= 0 && n <= 100,
  );
};
export const buildHistoricalPortfolioTof = (
  rows: HistoricalTofRow[],
  holdings: HistoricalHolding[],
  minCoveragePercent = 75,
): PortfolioTofPoint[] => {
  const cleanHoldings = new Map<string, number>();
  for (const holding of holdings) {
    if (!Number.isFinite(holding.currentValue) || holding.currentValue <= 0) continue;
    cleanHoldings.set(holding.slug, (cleanHoldings.get(holding.slug) || 0) + holding.currentValue);
  }
  const total = [...cleanHoldings.values()].reduce((sum, value) => sum + value, 0);
  if (!total) return [];
  const byPeriod = new Map<string, Map<string, number>>();
  const conflicts = new Set<string>();
  for (const row of rows) {
    if (!isAcceptedHistory(row) || !cleanHoldings.has(row.scpi_slug)) continue;
    const values = byPeriod.get(row.source_period!) || new Map<string, number>();
    // Un doublon source et période ambigus ne peut être compté deux fois.
    const tof = numberOrNull(row.tof)!;
    const identity = row.source_period + ':' + row.scpi_slug;
    if (conflicts.has(identity)) continue;
    if (!values.has(row.scpi_slug)) values.set(row.scpi_slug, tof);
    else if (Math.abs(values.get(row.scpi_slug)! - tof) > 0.001) {
      values.delete(row.scpi_slug);
      conflicts.add(identity); // ne jamais rétablir la valeur après un conflit
    }
    byPeriod.set(row.source_period!, values);
  }
  const results: PortfolioTofPoint[] = [];
  for (const [period, values] of [...byPeriod.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    let coveredValue = 0;
    let weighted = 0;
    for (const [slug, tof] of values) {
      const value = cleanHoldings.get(slug) || 0;
      weighted += tof * value;
      coveredValue += value;
    }
    const coveragePercent = coveredValue / total * 100;
    if (!coveredValue || coveragePercent < minCoveragePercent) continue;
    results.push({
      period,
      tof: weighted / coveredValue,
      coveragePercent,
      coveredCount: values.size,
      holdingCount: cleanHoldings.size,
    });
  }
  return results;
};
