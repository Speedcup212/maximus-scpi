import { describe, expect, it } from 'vitest';
import {
  buildSurveillanceSignals,
  getSurveillanceStatus,
  type SurveillanceDashboardRow,
} from '../utils/surveillanceSignals';

const row = (
  overrides: Partial<SurveillanceDashboardRow> = {},
): SurveillanceDashboardRow => ({
  scpi_slug: 'test-scpi',
  latest_period: '2026-T2',
  tof: 95,
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
  endettement: 10,
  endettement_delta_last: 0,
  prix_souscription: 200,
  prix_reconstitution: 205,
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

describe('shared surveillance signal engine', () => {
  it('neutralizes liquidity after a regime change instead of inventing a withdrawal signal', () => {
    const signals = buildSurveillanceSignals(row({
      liquidity_basis: 'secondary_market_order_book',
      liquidity_regime_changed: true,
      liquidity_signal_certification: 'suppressed_regime_change_pending_data',
      niveau_liquidite: 'non_calculable',
      trajectoire_liquidite: 'regime_change_data_pending',
      retrait_attente_pct: 12.5,
      liquidity_pressure_pct: null,
      liquidity_signal_eligible: false,
      liquidity_gate: 'PASS_PENDING_REGIME',
    }));

    expect(signals).toEqual([
      expect.objectContaining({
        kind: 'structure',
        level: 'info',
        title: 'Changement de régime de liquidité',
      }),
    ]);
    expect(signals.some((signal) => signal.kind === 'liquidity')).toBe(false);
  });

  it('uses secondary-market pressure and never labels it as a withdrawal queue', () => {
    const signals = buildSurveillanceSignals(row({
      liquidity_basis: 'secondary_market_order_book',
      niveau_liquidite: 'tension_forte_secondaire',
      trajectoire_liquidite: 'stable',
      liquidity_pressure_pct: 10.1876,
      retrait_attente_pct: null,
      liquidity_signal_certification: 'trajectory_certified',
    }));

    const liquidity = signals.find((signal) => signal.kind === 'liquidity');
    expect(liquidity).toEqual(expect.objectContaining({
      title: 'Pression sur le marché secondaire',
      level: 'watch',
    }));
    expect(liquidity?.detail).toContain('Pression secondaire');
    expect(liquidity?.detail).not.toContain('File de retraits');
  });

  it('raises strong vigilance only for an extreme or concordant deterioration', () => {
    const signals = buildSurveillanceSignals(row({
      tof: 83.7,
      niveau_tof: 'faible',
      trajectoire_tof: 'baisse_forte',
      delta_4obs: -5.7,
    }));

    expect(signals.find((signal) => signal.kind === 'tof')).toEqual(
      expect.objectContaining({ level: 'critical' }),
    );
    expect(getSurveillanceStatus(row({
      tof: 83.7,
      niveau_tof: 'faible',
      trajectoire_tof: 'baisse_forte',
      delta_4obs: -5.7,
    }))).toBe('critical');
  });

  it('suppresses valuation-gap alerts on a secondary-market regime', () => {
    const signals = buildSurveillanceSignals(row({
      liquidity_basis: 'secondary_market_order_book',
      prix_souscription: 250,
      prix_reconstitution: 200,
    }));

    expect(signals.some((signal) => signal.kind === 'valuation')).toBe(false);
  });

  it('returns pending when the global data gate does not pass', () => {
    expect(getSurveillanceStatus(row({ data_gate: 'FAIL' }))).toBe('pending');
  });
});
