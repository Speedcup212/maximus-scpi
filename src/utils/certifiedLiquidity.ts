export type LiquidityBasis =
  | 'withdrawal_queue'
  | 'secondary_market_order_book'
  | 'fixed_capital_market'
  | null;

export type CertifiedLiquiditySnapshot = {
  scpi_slug?: string;
  source_period?: string | null;
  parts_attente_retrait?: number | string | null;
  nombre_parts?: number | string | null;
  retrait_attente_pct?: number | string | null;
  prev_pct?: number | string | null;
  liquidity_basis?: string | null;
  liquidity_pressure_pct?: number | string | null;
  prev_pressure_pct?: number | string | null;
  liquidity_sell_orders?: number | string | null;
  liquidity_buy_orders?: number | string | null;
  regime_changed?: boolean | null;
  signal_certification?: string | null;
  niveau_liquidite?: string | null;
  trajectoire_liquidite?: string | null;
};

export type LiquiditySignalGate = {
  data_gate?: string | null;
  structural_gate?: string | null;
  semantic_gate?: string | null;
  liquidity_gate?: string | null;
  liquidity_signal_eligible?: boolean | null;
  reconstitution_gate?: string | null;
  market_signal_gate?: string | null;
};

export type ResolvedLiquidity = {
  basis: LiquidityBasis;
  currentPct: number | null;
  previousPct: number | null;
  deltaPct: number | null;
  withdrawalParts: number | null;
  totalParts: number | null;
  sellOrders: number | null;
  buyOrders: number | null;
  comparableTrend: boolean;
  publishableLevel: boolean;
  regimeChanged: boolean;
  certification: string | null;
  reason: 'certified' | 'regime_change' | 'gate_blocked' | 'not_certified' | 'unsupported_basis';
};

export const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const normalizeLiquidityBasis = (
  basis?: string | null,
  capitalType?: string | null,
): LiquidityBasis => {
  const normalizedBasis = (basis || '').trim().toLowerCase();
  const normalizedCapital = (capitalType || '').trim().toLowerCase();

  if (normalizedBasis.startsWith('secondary_market_order_book')) return 'secondary_market_order_book';
  if (normalizedBasis.startsWith('withdrawal_queue')) return 'withdrawal_queue';
  if (normalizedBasis.startsWith('fixed_capital')) return 'fixed_capital_market';
  if (normalizedBasis) return null;

  if (normalizedCapital.includes('secondaire') || normalizedCapital.includes('fix')) return 'fixed_capital_market';
  if (normalizedCapital.includes('variab') && !normalizedCapital.includes('suspend')) return 'withdrawal_queue';
  return null;
};

export const isLiquidityGateUsable = (gate?: LiquiditySignalGate | null): boolean => Boolean(
  gate &&
  gate.data_gate === 'PASS' &&
  gate.structural_gate === 'PASS' &&
  gate.semantic_gate === 'PASS' &&
  gate.liquidity_gate?.startsWith('PASS'),
);

const safePercent = (value: unknown): number | null => {
  const parsed = toFiniteNumber(value);
  return parsed !== null && parsed >= 0 && parsed <= 100 ? parsed : null;
};

export const resolveCertifiedLiquidity = (
  snapshot?: CertifiedLiquiditySnapshot | null,
  gate?: LiquiditySignalGate | null,
): ResolvedLiquidity => {
  const empty = (reason: ResolvedLiquidity['reason']): ResolvedLiquidity => ({
    basis: null,
    currentPct: null,
    previousPct: null,
    deltaPct: null,
    withdrawalParts: null,
    totalParts: null,
    sellOrders: null,
    buyOrders: null,
    comparableTrend: false,
    publishableLevel: false,
    regimeChanged: Boolean(snapshot?.regime_changed),
    certification: snapshot?.signal_certification || null,
    reason,
  });

  if (!snapshot || !isLiquidityGateUsable(gate)) return empty('gate_blocked');

  const basis = normalizeLiquidityBasis(snapshot.liquidity_basis);
  if (!basis) return empty('unsupported_basis');

  const certification = snapshot.signal_certification || null;
  const publishableLevel = ['trajectory_certified', 'level_only', 'stale_last_known'].includes(certification || '');
  if (!publishableLevel) return { ...empty('not_certified'), basis, certification };

  const regimeChanged = Boolean(snapshot.regime_changed);
  const currentPct = basis === 'withdrawal_queue'
    ? safePercent(snapshot.retrait_attente_pct)
    : basis === 'secondary_market_order_book'
      ? safePercent(snapshot.liquidity_pressure_pct)
      : null;
  const previousPct = basis === 'withdrawal_queue'
    ? safePercent(snapshot.prev_pct)
    : basis === 'secondary_market_order_book'
      ? safePercent(snapshot.prev_pressure_pct)
      : null;

  const comparableTrend = certification === 'trajectory_certified' && !regimeChanged && currentPct !== null && previousPct !== null;

  return {
    basis,
    currentPct,
    previousPct: comparableTrend ? previousPct : null,
    deltaPct: comparableTrend ? currentPct - previousPct : null,
    withdrawalParts: basis === 'withdrawal_queue' ? toFiniteNumber(snapshot.parts_attente_retrait) : null,
    totalParts: basis === 'withdrawal_queue' ? toFiniteNumber(snapshot.nombre_parts) : null,
    sellOrders: basis === 'secondary_market_order_book' ? toFiniteNumber(snapshot.liquidity_sell_orders) : null,
    buyOrders: basis === 'secondary_market_order_book' ? toFiniteNumber(snapshot.liquidity_buy_orders) : null,
    comparableTrend,
    publishableLevel,
    regimeChanged,
    certification,
    reason: regimeChanged ? 'regime_change' : 'certified',
  };
};

export const isSubscriptionReconstitutionComparable = (input: {
  capitalType?: string | null;
  liquidityBasis?: string | null;
  liquidityRegimeChanged?: boolean | null;
  reconstitutionGate?: string | null;
}): boolean => {
  const capital = (input.capitalType || '').trim().toLowerCase();
  const basis = normalizeLiquidityBasis(input.liquidityBasis, input.capitalType);

  if (input.liquidityRegimeChanged) return false;
  if (basis === 'secondary_market_order_book' || basis === 'fixed_capital_market') return false;
  if (capital.includes('suspend') || capital.includes('secondaire') || capital.includes('fix')) return false;
  if (input.reconstitutionGate && !input.reconstitutionGate.startsWith('PASS')) return false;
  return true;
};
