import { describe, expect, it } from 'vitest';
import { aggregateGlobalPortfolioTrajectory } from '../utils/clientPortfolioTrajectory';
import type { SurveillanceDashboardRow } from '../utils/surveillanceSignals';

const certified = (overrides: Partial<SurveillanceDashboardRow> = {}): SurveillanceDashboardRow => ({
  scpi_slug: 'test-scpi',
  latest_period: '2026-T2',
  tof: 100,
  niveau_tof: 'eleve',
  trajectoire_tof: 'stable',
  delta_4obs: 0,
  niveau_liquidite: 'faible',
  trajectoire_liquidite: 'stable',
  liquidity_basis: 'withdrawal_queue',
  liquidity_pressure_pct: null,
  retrait_attente_pct: 0,
  liquidity_regime_changed: false,
  liquidity_signal_certification: 'trajectory_certified',
  endettement: 3,
  endettement_delta_last: 0,
  prix_souscription: 255,
  prix_reconstitution: 268,
  prix_souscription_delta_last: 0,
  tof_gate: 'PASS',
  tof_signal_eligible: true,
  liquidity_gate: 'PASS',
  liquidity_signal_eligible: true,
  reconstitution_gate: 'PASS',
  debt_gate: 'PASS',
  market_signal_gate: 'PASS',
  data_gate: 'PASS',
  ...overrides,
});
const holdings = [
  { slug: 'log-in', name: 'Log In', currentValue: 2295, trajectory: certified() },
  { slug: 'coeur-d-europe', name: "Cœur d'Europe", currentValue: 1795,
    trajectory: certified({
      scpi_slug: 'coeur-d-europe',
      tof: 94.31,
      trajectoire_tof: 'baisse_forte',
      delta_4obs: -3.65,
    }),
  },
];

describe('Radar et trajectoire globale du portefeuille client', () => {
  it('pondère les signaux par la valorisation sans compter les SCPI à parts égales', () => {
    const res = aggregateGlobalPortfolioTrajectory(holdings);
    expect(res.overallStatus).toBe('info');
    expect(res.riskExposurePercent).toBe(0);
    expect(res.weights.find(w => w.status === 'stable')?.count).toBe(1);
    expect(res.weights.find(w => w.status === 'info')?.percent).toBeCloseTo(1795 / 4090 * 100, 6);
    expect(res.monitoredPercent).toBe(100);
    expect(res.axes.find(axis => axis.kind === 'tof')?.vigilancePercent).toBe(0);
    expect(res.axes.find(axis => axis.kind === 'tof')?.informationPercent)
      .toBeCloseTo(1795 / 4090 * 100, 6);
    expect(res.axes.find(axis => axis.kind === 'liquidity')?.vigilancePercent).toBe(0);

    expect(res.unverifiedPercent).toBe(0);
  });
  it('calcule uniquement un TOF et une variation sur période comparable', () => {
    const res = aggregateGlobalPortfolioTrajectory(holdings);
    expect(res.referencePeriod).toBe('2026-T2');
    expect(res.tofWeighted).toBeCloseTo((2295 * 100 + 1795 * 94.31) / 4090, 6);
    expect(res.delta4Weighted).toBeCloseTo(-3.65 * 1795 / 4090, 6);
    expect(res.delta4CoveragePercent).toBe(100);
    expect(res.trends.find(t => t.trend === 'decline')?.percent).toBeCloseTo(1795 / 4090 * 100, 6);
  });
  it('ne produit aucun faux signal rassurant lorsque le service est hors ligne', () => {
    const res = aggregateGlobalPortfolioTrajectory(holdings, true);
    expect(res.overallStatus).toBe('unavailable');
    expect(res.unverifiedPercent).toBe(100);
    expect(res.monitoredPercent).toBe(0);
    expect(res.riskExposurePercent).toBe(0);
    expect(res.tofWeighted).toBeNull();
    expect(res.delta4Weighted).toBeNull();
    expect(res.rows.every(r => r.status === 'pending')).toBe(true);
  });
  it('n’agrège pas des trimestres incompatibles dans le TOF moyen', () => {
    const res = aggregateGlobalPortfolioTrajectory([
      holdings[0],
      { ...holdings[1], trajectory: certified({
        latest_period: '2025-T4',
        tof: 65,
        niveau_tof: 'faible',
        trajectoire_tof: 'baisse',
        delta_4obs: -20,
      }) },
    ]);
    expect(res.referencePeriod).toBe('2026-T2');
    expect(res.tofWeighted).toBe(100);
    expect(res.tofCoveragePercent).toBeCloseTo(2295 / 4090 * 100);
    expect(res.delta4Weighted).toBe(0);
    expect(res.trends.find(t => t.trend === 'unknown')?.percent).toBeCloseTo(1795 / 4090 * 100);
  });
  it('préserve les montants non certifiés sans les assimiler à la stabilité', () => {
    const res = aggregateGlobalPortfolioTrajectory([
      holdings[0],
      { slug: 'scpi-non-certifiee', name: 'SCPI', currentValue: 2000 },
    ]);
    expect(res.overallStatus).toBe('partial');
    expect(res.unverifiedPercent).toBeCloseTo(2000 / 4295 * 100);
    expect(res.tofCoveragePercent).toBeCloseTo(2295 / 4295 * 100);
    expect(res.rows.find(r => r.slug === 'scpi-non-certifiee')?.status).toBe('pending');
  });
  it('n’affiche aucun indicateur artificiel quand le portefeuille est vide', () => {
    const res = aggregateGlobalPortfolioTrajectory([]);
    expect(res.overallStatus).toBe('unavailable');
    expect(res.tofWeighted).toBeNull();
    expect(res.referencePeriod).toBeNull();
    expect(res.trends.every(t => t.percent === 0)).toBe(true);
  });
  it('ne calcule pas de variation si le signal TOF n’est pas éligible', () => {
    const res = aggregateGlobalPortfolioTrajectory([{
      ...holdings[0], trajectory: certified({ tof_signal_eligible: false, tof_gate: 'FAIL', delta_4obs: 0 }),
    }]);
    expect(res.tofWeighted).toBeNull();
    expect(res.delta4Weighted).toBeNull();
    expect(res.periodCoveragePercent).toBe(0);
  });
});
