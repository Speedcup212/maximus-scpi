import { describe, expect, it } from 'vitest';
import {
  applyCertifiedLiquidity,
  CertifiedLiquiditySnapshot,
  currentCertifiedLiquidity,
  latestDelta,
  liquidityLabel,
  formatLiquidityPercent,
  normalizeAndDedupeHistory,
  ScpiHistoryRow,
  TrajectorySignalGate,
} from '../components/trajectory/trajectoryData';

const row = (period: string, overrides: Partial<ScpiHistoryRow> = {}): ScpiHistoryRow => ({
  scpi_slug: 'test', snapshot_at: '2026-07-01', source_period: period,
  source_url: 'https://example.com/bulletin.pdf', qa_status: 'verified', source_confidence: 1,
  tof: 95, td: null, capitalisation: null, prix_souscription: null, prix_reconstitution: null,
  prix_retrait: null, valeur_realisation: null, endettement: null, distribution_par_part: null,
  parts_attente_retrait: 0, nombre_parts: 100, capital_type: 'variable', liquidity_basis: 'withdrawal_queue',
  ...overrides,
});
const gate: TrajectorySignalGate = {
  scpi_slug: 'test', data_gate: 'PASS', structural_gate: 'PASS', semantic_gate: 'PASS',
  liquidity_gate: 'PASS_LIMITED', liquidity_signal_eligible: false,
};
const snapshot = (overrides: Partial<CertifiedLiquiditySnapshot> = {}): CertifiedLiquiditySnapshot => ({
  scpi_slug: 'test', source_period: '2026-T2', liquidity_basis: 'secondary_market_order_book',
  liquidity_pressure_pct: null, retrait_attente_pct: null, regime_changed: true,
  signal_certification: 'suppressed_regime_change_pending_data', ...overrides,
});

describe('liquidity regime regression cases from the certified views', () => {
  it('LF Grand Paris Patrimoine: secondary pressure 10.1876%, never a withdrawal queue', () => {
    const history = normalizeAndDedupeHistory([
      row('2025-T2', { parts_attente_retrait: 455489, nombre_parts: null }),
      row('2026-T2', { liquidity_basis: 'secondary_market_order_book', parts_attente_retrait: 499968, nombre_parts: 4907637 }),
    ]);
    const result = applyCertifiedLiquidity(history, snapshot({ liquidity_pressure_pct: '10.1876', signal_certification: 'level_only' }), gate);
    expect(result[1].retrait_attente_pct).toBeNull();
    expect(result[1].liquidity_pressure_pct).toBe(10.1876);
    expect(latestDelta(result, 'liquidity_pressure_pct')).toBeNull();
  });

  it.each([
    ['patrimmo-commerce', 3807739], ['primovie', 25575793],
  ])('%s: zero cancelled withdrawals do not become a zero secondary pressure', (slug, parts) => {
    const history = normalizeAndDedupeHistory([
      row('2025-T2', { scpi_slug: slug, parts_attente_retrait: 10 }),
      row('2026-T2', { scpi_slug: slug, capital_type: 'fixe', liquidity_basis: 'secondary_market_order_book', nombre_parts: parts }),
    ]);
    const result = applyCertifiedLiquidity(history, snapshot({ scpi_slug: slug }), { ...gate, scpi_slug: slug, liquidity_gate: 'PASS_PENDING_REGIME' });
    expect(result[1].retrait_attente_pct).toBeNull();
    expect(result[1].liquidity_pressure_pct).toBeNull();
    expect(latestDelta(result, 'retrait_attente_pct')).toBeNull();
  });

  it('keeps a documented zero for an unchanged variable capital queue', () => {
    const history = normalizeAndDedupeHistory([row('2025-T2', { parts_attente_retrait: 2 }), row('2026-T2')]);
    const result = applyCertifiedLiquidity(history, snapshot({
      liquidity_basis: 'withdrawal_queue', liquidity_pressure_pct: 0, retrait_attente_pct: 0,
      regime_changed: false, signal_certification: 'trajectory_certified',
    }), { ...gate, liquidity_gate: 'PASS', liquidity_signal_eligible: true });
    expect(result[1].retrait_attente_pct).toBe(0);
    expect(latestDelta(result, 'retrait_attente_pct')).toBe(-2);
  });

  it('keeps a certified NULL rather than recalculating a raw ratio', () => {
    const history = normalizeAndDedupeHistory([row('2026-T2', { retrait_attente_pct: null, parts_attente_retrait: 7 })]);
    expect(history[0].retrait_attente_pct).toBeNull();
  });

  it('masks liquidity when gates are absent or fail, without removing other metrics', () => {
    const history = normalizeAndDedupeHistory([row('2026-T2', { parts_attente_retrait: 7 })]);
    for (const context of [null, { ...gate, semantic_gate: 'FAIL' }]) {
      const result = applyCertifiedLiquidity(history, snapshot(), context);
      expect(result[0].retrait_attente_pct).toBeNull();
      expect(result[0].tof).toBe(95);
    }
  });

  it('does not infer a queue from parts when the regime is unknown or fixed', () => {
    for (const overrides of [{ liquidity_basis: null, capital_type: null }, { liquidity_basis: null, capital_type: 'fixe' }]) {
      expect(normalizeAndDedupeHistory([row('2026-T2', { ...overrides, parts_attente_retrait: 7 })])[0].retrait_attente_pct).toBeNull();
    }
  });

  it('rejects an annual comparison that crosses a regime and returns to a queue', () => {
    const history = normalizeAndDedupeHistory([
      row('2025-T2', { parts_attente_retrait: 7 }),
      row('2025-T4', { liquidity_basis: 'secondary_market_order_book' }),
      row('2026-T2'),
    ]);
    expect(latestDelta(history, 'retrait_attente_pct')).toBeNull();
  });

  it('market signals never backfill a cancelled current queue with an old numeric queue', () => {
    const history = normalizeAndDedupeHistory([
      row('2025-T2', { parts_attente_retrait: 15 }),
      row('2026-T2', { liquidity_basis: 'secondary_market_order_book', capital_type: 'fixe' }),
    ]);
    const result = currentCertifiedLiquidity(history, snapshot(), { ...gate, liquidity_gate: 'PASS_PENDING_REGIME' });
    expect(result.value).toBeNull();
    expect(result.delta).toBeNull();
    expect(result.basis).toBe('secondary_market_order_book');
  });

  it('market signals retain a valid current secondary level without importing an old withdrawal delta', () => {
    const history = normalizeAndDedupeHistory([
      row('2025-T2', { parts_attente_retrait: 15 }),
      row('2026-T2', { liquidity_basis: 'secondary_market_order_book' }),
    ]);
    expect(currentCertifiedLiquidity(history, snapshot({ signal_certification: 'level_only', liquidity_pressure_pct: 10.1876 }), gate))
      .toEqual({ basis: 'secondary_market_order_book', value: 10.1876, delta: null });
  });
});

describe('annual calendar comparison', () => {
  it('uses the exact same quarter of the prior year, not the fourth prior observation', () => {
    const history = normalizeAndDedupeHistory([
      row('2024-T4', { tof: 80 }), row('2025-T2', { tof: 90 }), row('2026-T2', { tof: 95 }),
    ]);
    expect(latestDelta(history, 'tof')).toBe(5);
  });

  it('returns NULL when the homologous quarter is missing', () => {
    const history = normalizeAndDedupeHistory([row('2025-T1'), row('2025-T3'), row('2025-T4'), row('2026-T1'), row('2026-T2')]);
    expect(latestDelta(history, 'tof')).toBeNull();
  });

  it('does not silently report an old annual variation when the current metric is missing', () => {
    const history = normalizeAndDedupeHistory([row('2025-T1'), row('2026-T1'), row('2026-T2', { tof: null })]);
    expect(latestDelta(history, 'tof')).toBeNull();
  });
});

describe('Historique client : sémantique des données et précision', () => {
  it('distingue base inconnue et liquidité effectivement incomparable', () => {
    expect(liquidityLabel(null)).toBe('Base non documentée');
    expect(liquidityLabel(undefined)).toBe('Base non documentée');
    expect(liquidityLabel('withdrawal_queue')).toBe('File de retraits');
    expect(liquidityLabel('secondary_market_order_book')).toBe('Pression du marché secondaire');
    expect(liquidityLabel('fixed_capital_market')).toContain('capital fixe');
  });

  it('ne confond pas un taux positif inférieur à 0,01 % avec un vrai zéro', () => {
    expect(formatLiquidityPercent(null)).toBe('N.D.');
    expect(formatLiquidityPercent(0)).toBe('0 %');
    expect(formatLiquidityPercent(0.0001)).toBe('< 0,01 %');
    expect(formatLiquidityPercent(0.0038)).toBe('< 0,01 %');
    expect(formatLiquidityPercent(0.01)).toBe('0,01 %');
    expect(formatLiquidityPercent(1.456)).toBe('1,46 %');
  });

  it('conserve les chiffres pour une SCPI variable explicitement documentée et n’infère pas les chiffres d’une base inconnue', () => {
    const documented = normalizeAndDedupeHistory([
      row('2025-T2', { parts_attente_retrait: 0, nombre_parts: 614582, endettement: null }),
      row('2025-T3', { parts_attente_retrait: 0, nombre_parts: 626190, endettement: 8.53 }),
      row('2025-T4', { parts_attente_retrait: 0, nombre_parts: 642199, endettement: 12.83 }),
      row('2026-T1', { parts_attente_retrait: 0, nombre_parts: 656071, endettement: 9.88 }),
    ]);
    expect(documented.map(x => x.retrait_attente_pct)).toEqual([0, 0, 0, 0]);
    expect(documented.map(x => x.endettement)).toEqual([null, 8.53, 12.83, 9.88]);
    const unknown = normalizeAndDedupeHistory([
      row('2025-T2', { capital_type: null, liquidity_basis: null, parts_attente_retrait: 25, nombre_parts: 656071 }),
    ]);
    expect(unknown[0].retrait_attente_pct).toBeNull();
  });
});
