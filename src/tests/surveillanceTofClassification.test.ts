import { describe, expect, it } from 'vitest';
import {
  buildSurveillanceSignals, getSurveillanceStatus,
  type SurveillanceDashboardRow,
} from '../utils/surveillanceSignals';
import { aggregateGlobalPortfolioTrajectory } from '../utils/clientPortfolioTrajectory';

const row = (overrides: Partial<SurveillanceDashboardRow> = {}): SurveillanceDashboardRow => ({
  scpi_slug: 'coeur-d-europe', latest_period: '2026-T2',
  tof: 94.31, niveau_tof: 'satisfaisant',
  trajectoire_tof: 'baisse_forte', delta_4obs: -3.65,
  niveau_liquidite: 'faible', trajectoire_liquidite: 'stable',
  liquidity_basis: 'withdrawal_queue', liquidity_pressure_pct: null,
  retrait_attente_pct: 0, liquidity_regime_changed: false,
  liquidity_signal_certification: 'trajectory_certified',
  endettement: 3.62, endettement_delta_last: 0,
  prix_souscription: 204, prix_reconstitution: 219.47,
  tof_gate: 'PASS', tof_signal_eligible: true,
  liquidity_gate: 'PASS', liquidity_signal_eligible: true,
  reconstitution_gate: 'PASS', debt_gate: 'PASS',
  market_signal_gate: 'PASS', data_gate: 'PASS',
  ...overrides,
});
const tofSignal = (value: SurveillanceDashboardRow) =>
  buildSurveillanceSignals(value).find(signal => signal.kind === 'tof');

describe('Surveillance SCPI : niveau de TOF et évolution sont distincts', () => {
  it('Cœur d’Europe 94,31 % : information de tendance, sans vigilance orange', () => {
    const scpi = row();
    expect(tofSignal(scpi)).toMatchObject({ level: 'info', title: 'Occupation satisfaisante — tendance en baisse' });
    expect(tofSignal(scpi)?.detail).toContain('TOF 94,31 %');
    expect(tofSignal(scpi)?.detail).toContain('-3,65 pt');
    expect(getSurveillanceStatus(scpi)).toBe('info');
    const portfolio = aggregateGlobalPortfolioTrajectory([
      { slug: 'log-in', name: 'Log In', currentValue: 2295, trajectory: row({
        scpi_slug: 'log-in', tof: 100, niveau_tof: 'eleve',
        trajectoire_tof: 'stable', delta_4obs: 0, prix_souscription: 255, prix_reconstitution: 268,
      }) },
      { slug: 'coeur-d-europe', name: 'Cœur d’Europe', currentValue: 1795, trajectory: scpi },
    ]);
    expect(portfolio.riskExposurePercent).toBe(0);
    expect(portfolio.overallStatus).toBe('info');
    expect(portfolio.weights.find(weight => weight.status === 'info')?.percent)
      .toBeCloseTo(1795 / 4090 * 100);
    expect(portfolio.trends.find(trend => trend.trend === 'decline')?.percent)
      .toBeCloseTo(1795 / 4090 * 100);
  });

  it.each([90, 90.1, 94.31, 95.94, 99])(
    'une baisse certifiée à TOF %s >=90 reste une information',
    tof => {
      expect(tofSignal(row({ tof, trajectoire_tof: 'baisse_forte' }))?.level).toBe('info');
    },
  );

  it('n’invente pas d’alerte quand un TOF satisfaisant est stable', () => {
    const r = row({ tof: 94, trajectoire_tof: 'stable', delta_4obs: 0, prix_reconstitution: 210 });
    expect(tofSignal(r)).toBeUndefined();
    expect(getSurveillanceStatus(r)).toBe('clear');
  });

  it('TOF entre 85 et 90 % : vigilance même si la trajectoire est stable', () => {
    const signal = tofSignal(row({ tof: 88.9, niveau_tof: 'fragile', trajectoire_tof: 'stable' }));
    expect(signal?.level).toBe('watch');
  });
  it('TOF sous 85 % et forte baisse : vigilance forte maintenue', () => {
    expect(tofSignal(row({ tof: 84.6, niveau_tof: 'faible', trajectoire_tof: 'baisse_forte' }))?.level).toBe('critical');
  });
  it('TOF faible avec pente stable : vigilance, sans surclassement automatique', () => {
    expect(tofSignal(row({ tof: 82, niveau_tof: 'faible', trajectoire_tof: 'stable' }))?.level).toBe('watch');
  });
  it('TOF inférieur à 80 % : vigilance forte quel que soit le sens de la trajectoire', () => {
    expect(tofSignal(row({ tof: 79, trajectoire_tof: 'hausse' }))?.level).toBe('critical');
  });

  it('une tension de liquidité indépendante reste une vraie vigilance à 94 % de TOF', () => {
    const signals = buildSurveillanceSignals(row({
      niveau_liquidite: 'tension_forte', trajectoire_liquidite: 'deterioration',
      retrait_attente_pct: 4.5,
    }));
    expect(signals.find(signal => signal.kind === 'tof')?.level).toBe('info');
    expect(signals.find(signal => signal.kind === 'liquidity')?.level).toBe('watch');
    expect(getSurveillanceStatus(row({
      niveau_liquidite: 'tension_forte', trajectoire_liquidite: 'deterioration',
    }))).toBe('watch');
  });

  it('une baisse de TOF de bon niveau ne fait pas artificiellement passer la liquidité en critique', () => {
    const signals = buildSurveillanceSignals(row({
      niveau_liquidite: 'tension_forte', trajectoire_liquidite: 'deterioration_forte',
    }));
    expect(signals.find(signal => signal.kind === 'liquidity')?.level).toBe('watch');
  });

  it('refuse le TOF lorsque le gate échoue ou la donnée est invalide', () => {
    expect(tofSignal(row({ tof_gate: 'FAIL' }))).toBeUndefined();
    expect(tofSignal(row({ tof_signal_eligible: false }))).toBeUndefined();
    expect(tofSignal(row({ tof: 110 }))).toBeUndefined();
    expect(tofSignal(row({ tof: null }))).toBeUndefined();
  });
  it('le chiffre certifié prévaut sur une étiquette legacy discordante', () => {
    expect(tofSignal(row({ tof: 94.31, niveau_tof: 'faible' }))?.level).toBe('info');
  });
});
