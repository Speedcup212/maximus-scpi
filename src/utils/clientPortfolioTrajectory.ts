import {
  getSurveillanceStatus,
  surveillanceGatePass,
  toSurveillanceNumber,
  type SurveillanceDashboardRow,
} from './surveillanceSignals';

/**
 * Aggregation en valeur indicative des SCPI détenues (jamais une notation de risque).
 * Les parts acquises à plusieurs dates sont déjà consolidées par SCPI en amont.
 * Pas de courbe historique inventée : la "trajectoire" est basée sur les
 * observations et variations publiées pour UNE période comparable.
 */
export type GlobalRadarLevel = 'stable' | 'info' | 'watch' | 'critical' | 'pending';
export type GlobalTrendLevel = 'rise' | 'stable' | 'decline' | 'unknown';
export type GlobalRadarPosition = {
  slug: string;
  name: string;
  currentValue: number;
  trajectory?: SurveillanceDashboardRow;
};
export type WeightedStatus = { status: GlobalRadarLevel; value: number; percent: number; count: number };
export type WeightedTrend = { trend: GlobalTrendLevel; percent: number; value: number };
export type GlobalPortfolioTrajectory = {
  totalValue: number;
  weights: WeightedStatus[];
  overallStatus: 'critical' | 'watch' | 'partial' | 'info' | 'clear' | 'unavailable';
  monitoredPercent: number;
  riskExposurePercent: number;
  unverifiedPercent: number;
  referencePeriod: string | null;
  periodCoveragePercent: number;
  tofWeighted: number | null;
  tofCoveragePercent: number;
  delta4Weighted: number | null;
  delta4CoveragePercent: number;
  trends: WeightedTrend[];
  rows: Array<{
    slug: string;
    name: string;
    status: GlobalRadarLevel;
    percent: number;
    latestPeriod: string | null;
    trend: GlobalTrendLevel;
  }>;
};
const STATUS_ORDER: GlobalRadarLevel[] = ['critical', 'watch', 'info', 'stable', 'pending'];
const TREND_ORDER: GlobalTrendLevel[] = ['decline', 'stable', 'rise', 'unknown'];
const ROUND_LIMIT = (value: number) => Math.max(0, Math.min(100, value));
const percent = (value: number, total: number) => total > 0 ? ROUND_LIMIT(value / total * 100) : 0;
const validPositiveValue = (value: number) => Number.isFinite(value) && value > 0 ? value : 0;
const getStatus = (row?: SurveillanceDashboardRow): GlobalRadarLevel => {
  const value = getSurveillanceStatus(row);
  return value === 'clear' ? 'stable' : value;
};
const eligibleTOF = (row?: SurveillanceDashboardRow): number | null => {
  if (!row || !surveillanceGatePass(row.data_gate) ||
      !row.tof_signal_eligible || !surveillanceGatePass(row.tof_gate) ||
      !row.latest_period) return null;
  const tof = toSurveillanceNumber(row.tof);
  return tof !== null && tof >= 0 && tof <= 100 ? tof : null;
};
const getTrend = (row?: SurveillanceDashboardRow): GlobalTrendLevel => {
  if (eligibleTOF(row) === null) return 'unknown';
  const value = row?.trajectoire_tof;
  if (value === 'baisse' || value === 'baisse_forte') return 'decline';
  if (value === 'hausse' || value === 'hausse_forte') return 'rise';
  if (value === 'stable') return 'stable';
  return 'unknown';
};

export const aggregateGlobalPortfolioTrajectory = (
  positions: GlobalRadarPosition[],
  isSurveillanceOffline = false,
): GlobalPortfolioTrajectory => {
  const valid = positions.map(position => ({
    ...position,
    currentValue: validPositiveValue(position.currentValue),
    trajectory: isSurveillanceOffline ? undefined : position.trajectory,
  }));
  const totalValue = valid.reduce((sum, item) => sum + item.currentValue, 0);
  const values = new Map<GlobalRadarLevel, number>(STATUS_ORDER.map(key => [key, 0]));
  const counts = new Map<GlobalRadarLevel, number>(STATUS_ORDER.map(key => [key, 0]));
  const rows = valid.map((holding) => {
    const status = getStatus(holding.trajectory);
    values.set(status, (values.get(status) ?? 0) + holding.currentValue);
    counts.set(status, (counts.get(status) ?? 0) + 1);
    return {
      slug: holding.slug,
      name: holding.name,
      status,
      percent: percent(holding.currentValue, totalValue),
      latestPeriod: holding.trajectory?.latest_period ?? null,
      trend: getTrend(holding.trajectory),
    };
  });
  const weights: WeightedStatus[] = STATUS_ORDER.map(status => ({
    status, value: values.get(status) ?? 0, count: counts.get(status) ?? 0,
    percent: percent(values.get(status) ?? 0, totalValue),
  }));
  const getWeight = (level: GlobalRadarLevel) => values.get(level) ?? 0;
  const unverifiedPercent = totalValue ? percent(getWeight('pending'), totalValue) : 100;
  const monitoredPercent = totalValue ? 100 - unverifiedPercent : 0;
  const riskExposurePercent = percent(getWeight('watch') + getWeight('critical'), totalValue);
  const overallStatus = getWeight('critical') > 0 ? 'critical'
    : getWeight('watch') > 0 ? 'watch'
      : totalValue === 0 || isSurveillanceOffline || monitoredPercent === 0 ? 'unavailable'
        : unverifiedPercent > 0 ? 'partial'
          : getWeight('info') > 0 ? 'info' : 'clear';

  // Ne retenir que la période représentant la plus forte valeur éligible
  // et ne JAMAIS moyenner des trimestres ou années non comparables.
  const periodValues = new Map<string, number>();
  for (const holding of valid) {
    if (holding.currentValue <= 0 || eligibleTOF(holding.trajectory) === null) continue;
    const period = holding.trajectory?.latest_period;
    if (period) periodValues.set(period, (periodValues.get(period) ?? 0) + holding.currentValue);
  }
  const periodOrder = [...periodValues.entries()].sort((a, b) =>
    b[1] - a[1] || b[0].localeCompare(a[0])
  );
  const referencePeriod = periodOrder[0]?.[0] ?? null;
  const comparable = valid.filter(position =>
    referencePeriod !== null && position.trajectory?.latest_period === referencePeriod &&
    eligibleTOF(position.trajectory) !== null && position.currentValue > 0
  );
  const comparableAmount = comparable.reduce((sum, p) => sum + p.currentValue, 0);
  const tofWeighted = comparableAmount > 0
    ? comparable.reduce((sum, p) => sum + (eligibleTOF(p.trajectory) ?? 0) * p.currentValue, 0) / comparableAmount
    : null;
  const withDelta = comparable.filter(p => {
    const delta = toSurveillanceNumber(p.trajectory?.delta_4obs);
    return delta !== null && delta >= -100 && delta <= 100;
  });
  const deltaAmount = withDelta.reduce((sum, p) => sum + p.currentValue, 0);
  const delta4Weighted = deltaAmount > 0
    ? withDelta.reduce((sum, p) => sum +
      (toSurveillanceNumber(p.trajectory?.delta_4obs) ?? 0) * p.currentValue, 0) / deltaAmount
    : null;

  const trendValue = new Map<GlobalTrendLevel, number>(TREND_ORDER.map(key => [key, 0]));
  for (const holding of valid) {
    const samePeriod = referencePeriod !== null && holding.trajectory?.latest_period === referencePeriod;
    const trend = samePeriod ? getTrend(holding.trajectory) : 'unknown';
    trendValue.set(trend, (trendValue.get(trend) ?? 0) + holding.currentValue);
  }

  return {
    totalValue,
    weights,
    overallStatus,
    monitoredPercent,
    riskExposurePercent,
    unverifiedPercent,
    referencePeriod,
    periodCoveragePercent: percent(comparableAmount, totalValue),
    tofWeighted,
    tofCoveragePercent: percent(comparableAmount, totalValue),
    delta4Weighted,
    delta4CoveragePercent: percent(deltaAmount, totalValue),
    trends: TREND_ORDER.map(trend => ({
      trend, percent: percent(trendValue.get(trend) ?? 0, totalValue),
      value: trendValue.get(trend) ?? 0,
    })),
    rows,
  };
};
