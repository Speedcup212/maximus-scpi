// RECOVERY-200 — aucun « sans frais » sans 0 % prouvé (régression vue en production le 10/11/2026 :
// Selectinvest 1 et Perial Grand Paris, souscription fermée, affichés « 0,00 % — Sans frais de souscription »).
import { describe, expect, it } from 'vitest';
import { feeStateOf, isProvenZeroFee, subscriptionFeeLabel, subscriptionFeeState } from '../utils/scpiFeeState';
import { scpiData } from '../data/scpiData';

const pct = (v: number) => `${v}%`;

describe('subscription fee state', () => {
  it('distinguishes value, proven zero, unknown and not applicable', () => {
    expect(subscriptionFeeState(11.4, {verification_status: 'verified'})).toBe('value');
    expect(subscriptionFeeState(0, {verification_status: 'verified'})).toBe('zero');
    expect(subscriptionFeeState(0, undefined)).toBe('unknown');
    expect(subscriptionFeeState(null, undefined)).toBe('unknown');
    expect(subscriptionFeeState(null, {value_state: 'not_applicable', verification_status: 'verified'})).toBe('not_applicable');
    expect(subscriptionFeeState(0, {value_state: 'not_applicable'})).toBe('not_applicable');
  });

  it('never labels an unknown or closed subscription as 0 %', () => {
    expect(subscriptionFeeLabel({fees: 0, feesState: 'not_applicable'}, pct)).toBe('Non applicable (souscription fermée)');
    expect(subscriptionFeeLabel({fees: 0, feesState: 'unknown'}, pct)).toBe('Non communiqué');
    expect(subscriptionFeeLabel({fees: 0, feesState: 'zero'}, pct)).toBe('0%');
    expect(subscriptionFeeLabel({fees: 9, feesState: 'value'}, pct)).toBe('9%');
    expect(isProvenZeroFee({fees: 0})).toBe(false);
  });

  it('applies to the published catalogue: closed subscriptions are not zeros, proven zeros stay zeros', () => {
    const byName = (name: string) => scpiData.find(s => s.name === name);
    for (const name of ['Selectinvest 1', 'Perial Grand Paris', 'Perial O2', 'Primovie', 'Crédit Mutuel Pierre 1', 'Patrimmo Commerce']) {
      const scpi = byName(name);
      expect(scpi, name).toBeDefined();
      expect(feeStateOf(scpi), name).toBe('not_applicable');
      expect(isProvenZeroFee(scpi), name).toBe(false);
    }
    for (const name of ['Iroko Zen', 'Iroko Atlas', 'Novaxia NEO', 'Remake Live']) {
      expect(isProvenZeroFee(byName(name)), name).toBe(true);
    }
    const zeroWithoutProof = scpiData.filter(s => s.fees === 0 && !isProvenZeroFee(s)).map(s => `${s.name}:${feeStateOf(s)}`);
    expect(zeroWithoutProof.every(item => !item.endsWith(':zero'))).toBe(true);
  });
});
