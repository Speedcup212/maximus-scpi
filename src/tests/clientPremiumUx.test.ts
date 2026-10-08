import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AppLayout from '../app/components/AppLayout';

const page = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');
const radar = readFileSync(new URL('../app/components/ClientPortfolioRadarTrajectory.tsx', import.meta.url), 'utf8');
const scpi = readFileSync(new URL('../app/components/ClientScpiCard.tsx', import.meta.url), 'utf8');

describe('ergonomie espace client premium', () => {
  it('place les alertes avant la répartition et les fiches SCPI', () => {
    const alertIndex = page.indexOf('Alertes Maximus');
    const compositionIndex = page.indexOf('Composition de votre portefeuille');
    const exposuresIndex = page.indexOf('Répartitions du portefeuille');
    const radarIndex = page.indexOf('<ClientPortfolioRadarTrajectory');
    const holdingsIndex = page.indexOf('Mes SCPI — analyses détaillées');
    expect(alertIndex).toBeGreaterThan(0);
    expect(alertIndex).toBeLessThan(compositionIndex);
    expect(compositionIndex).toBeLessThan(exposuresIndex);
    expect(exposuresIndex).toBeLessThan(radarIndex);
    expect(radarIndex).toBeLessThan(holdingsIndex);
  });
  it('préserve le détail des sources et limite les alertes initiales', () => {
    expect(page).toContain('Répartition sectorielle du portefeuille');
    expect(page).toContain('Répartition géographique du portefeuille');
    expect(page).toContain('Estimation historique non certifiée');
    expect(page).toContain('alerts.slice(0, 2)');
    expect(page).toContain('Voir les {alerts.length - 2} autres alertes');
    expect(page).toContain('Comprendre les revenus théoriques et leurs limites');
  });
  it('affiche la courbe et les conclusions avant les détails facultatifs', () => {
    expect(radar).toContain('À retenir :');
    expect(radar).toContain('Comprendre le radar');
    expect(radar).toContain('Comprendre les quatre axes de surveillance');
    expect(radar.indexOf('<ClientHistoricalTofChart')).toBeLessThan(radar.indexOf('Comprendre la trajectoire et voir le détail des calculs'));
    expect(scpi).toContain('Répartition sectorielle');
    expect(scpi).toContain('Répartition géographique');
    expect(scpi).toContain('Voir les détails');
  });
  it('utilise un conteneur client élargi sans modifier les espaces pro', () => {
    const html = renderToStaticMarkup(React.createElement(AppLayout, {
      role: 'client',
      title: 'Mon portefeuille',
      onNavigate: () => undefined,
      onSignOut: () => undefined,
      children: React.createElement('div', null, 'Test'),
    }));
    const pro = renderToStaticMarkup(React.createElement(AppLayout, {
      role: 'partner',
      title: 'Espace pro',
      onNavigate: () => undefined,
      onSignOut: () => undefined,
      children: React.createElement('div', null, 'Test'),
    }));
    expect(html).toContain('max-w-[1480px]');
    expect(pro).not.toContain('max-w-[1480px]');
  });
});
