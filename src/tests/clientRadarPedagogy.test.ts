import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ClientPortfolioRadarTrajectory from '../app/components/ClientPortfolioRadarTrajectory';
import type { GlobalPortfolioTrajectory } from '../utils/clientPortfolioTrajectory';

const example: GlobalPortfolioTrajectory = {
  totalValue: 4090,
  weights: [
    { status: 'critical', value: 0, percent: 0, count: 0 },
    { status: 'watch', value: 1795, percent: 43.8875305623, count: 1 },
    { status: 'info', value: 0, percent: 0, count: 0 },
    { status: 'stable', value: 2295, percent: 56.1124694377, count: 1 },
    { status: 'pending', value: 0, percent: 0, count: 0 },
  ],
  axes: [
    { kind: 'tof', label: 'Occupation', vigilancePercent: 43.8875305623, informationPercent: 0, scpiCount: 1 },
    { kind: 'liquidity', label: 'Liquidité', vigilancePercent: 0, informationPercent: 0, scpiCount: 0 },
    { kind: 'valuation', label: 'Valorisation', vigilancePercent: 0, informationPercent: 43.8875305623, scpiCount: 1 },
    { kind: 'debt', label: 'Endettement', vigilancePercent: 0, informationPercent: 0, scpiCount: 0 },
  ],
  overallStatus: 'watch',
  monitoredPercent: 100,
  riskExposurePercent: 43.8875305623,
  unverifiedPercent: 0,
  referencePeriod: '2026-T2',
  periodCoveragePercent: 100,
  tofWeighted: 97.502445,
  tofCoveragePercent: 100,
  delta4Weighted: -1.60195,
  delta4CoveragePercent: 100,
  trends: [
    { trend: 'decline', percent: 43.8875305623, value: 1795 },
    { trend: 'stable', percent: 56.1124694377, value: 2295 },
    { trend: 'rise', percent: 0, value: 0 },
    { trend: 'unknown', percent: 0, value: 0 },
  ],
  rows: [
    { slug: 'log-in', name: 'Log In', status: 'stable', percent: 56.1124694377, latestPeriod: '2026-T2', trend: 'stable' },
    { slug: 'coeur-d-europe', name: "Cœur d'Europe", status: 'watch', percent: 43.8875305623, latestPeriod: '2026-T2', trend: 'decline' },
  ],
};
const render = (summary: GlobalPortfolioTrajectory, surveillanceUnavailable = false) =>
  renderToStaticMarkup(React.createElement(ClientPortfolioRadarTrajectory, {
    summary,
    surveillanceUnavailable,
    history: [],
    historyUnavailable: false,
  }));

describe('pédagogie de surveillance du portefeuille', () => {
  it('définit le radar, les quatre axes et le TOF en français accessible', () => {
    const markup = render(example);
    expect(markup).toContain('Radar : quelles SCPI surveiller ?');
    expect(markup).toContain('À quoi sert cette analyse ?');
    expect(markup).toContain('TOF = taux d&#x27;occupation financier');
    expect(markup).toContain('Liquidité : éventuelles difficultés à revendre les parts');
    expect(markup).toContain('Valorisation : écart entre le prix de la part');
    expect(markup).toContain('Endettement : niveau de dette');
  });
  it('personnalise l’explication des pourcentages et interdit la confusion avec une perte en capital', () => {
    const markup = render(example);
    expect(markup).toContain('43,9');
    expect(markup).toContain('Cœur d&#x27;Europe');
    expect(markup).toContain('97,5');
    expect(markup).toContain('1,6 point(s)');
    expect(markup).toContain('pas d&#x27;une perte constatée');
    expect(markup).toContain('Cela n&#x27;indique pas une variation de la valeur de vos parts');
    expect(markup).not.toContain('recule de +1,6');
  });
  it('ne prétend pas qu’un service hors ligne conclut à une absence de risque', () => {
    const markup = render({ ...example, monitoredPercent: 0, overallStatus: 'unavailable', tofWeighted: null, delta4Weighted: null }, true);
    expect(markup).toContain('La surveillance ne permet pas actuellement de conclure');
    expect(markup).toContain('Les données disponibles ne suffisent pas');
    expect(markup).not.toContain('Aucun signal de vigilance n&#x27;a été détecté sur les');
  });
});
