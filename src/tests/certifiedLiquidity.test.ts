import { describe, expect, it } from 'vitest';
import {
  isSubscriptionReconstitutionComparable,
  resolveCertifiedLiquidity,
} from '../utils/certifiedLiquidity';
import { getScpiDiscountPremium } from '../utils/scpiDiscountPremium';

describe('certified liquidity guards', () => {
  const passGate = {
    data_gate: 'PASS',
    structural_gate: 'PASS',
    semantic_gate: 'PASS',
    liquidity_gate: 'PASS',
    liquidity_signal_eligible: true,
  };

  it('preserves a certified withdrawal queue', () => {
    const result = resolveCertifiedLiquidity({
      liquidity_basis: 'withdrawal_queue',
      retrait_attente_pct: 3.2,
      prev_pct: 2.4,
      parts_attente_retrait: 320,
      nombre_parts: 10000,
      regime_changed: false,
      signal_certification: 'trajectory_certified',
    }, passGate);

    expect(result.basis).toBe('withdrawal_queue');
    expect(result.currentPct).toBe(3.2);
    expect(result.previousPct).toBe(2.4);
    expect(result.deltaPct).toBeCloseTo(0.8);
    expect(result.comparableTrend).toBe(true);
  });

  it('never reuses withdrawal history after a secondary-market regime change', () => {
    const result = resolveCertifiedLiquidity({
      liquidity_basis: 'secondary_market_order_book',
      liquidity_pressure_pct: 10.1876,
      prev_pressure_pct: null,
      retrait_attente_pct: null,
      parts_attente_retrait: 499968,
      nombre_parts: 4907637,
      regime_changed: true,
      signal_certification: 'level_only',
    }, passGate);

    expect(result.basis).toBe('secondary_market_order_book');
    expect(result.currentPct).toBeCloseTo(10.1876);
    expect(result.withdrawalParts).toBeNull();
    expect(result.previousPct).toBeNull();
    expect(result.deltaPct).toBeNull();
    expect(result.comparableTrend).toBe(false);
  });

  it('masks liquidity when gates are not PASS', () => {
    const result = resolveCertifiedLiquidity({
      liquidity_basis: 'withdrawal_queue',
      retrait_attente_pct: 0,
      signal_certification: 'trajectory_certified',
    }, { ...passGate, semantic_gate: 'REVIEW' });

    expect(result.currentPct).toBeNull();
    expect(result.publishableLevel).toBe(false);
    expect(result.reason).toBe('gate_blocked');
  });
});

describe('subscription / reconstitution comparability', () => {
  it('allows a normal variable-capital comparison', () => {
    expect(isSubscriptionReconstitutionComparable({
      capitalType: 'variable',
      liquidityBasis: 'withdrawal_queue',
      reconstitutionGate: 'PASS',
    })).toBe(true);
  });

  it('blocks a secondary-market comparison', () => {
    expect(isSubscriptionReconstitutionComparable({
      capitalType: 'fixe',
      liquidityBasis: 'secondary_market_order_book',
      reconstitutionGate: 'PASS',
    })).toBe(false);
  });

  it('blocks display when QA marks the discount for review', () => {
    const result = getScpiDiscountPremium({
      price: 100,
      valeurReconstitution: 120,
      discountQaStatus: 'manual_review',
    });
    expect(result.value).toBeNull();
    expect(result.formatted).toBe('N/D');
  });

  it('blocks display after a regime change even with numeric inputs', () => {
    const result = getScpiDiscountPremium({
      price: 100,
      valeurReconstitution: 120,
      discountQaStatus: 'publishable',
      capitalType: 'variable',
      liquidityRegimeChanged: true,
    });
    expect(result.value).toBeNull();
  });
});
