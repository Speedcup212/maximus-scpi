import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const card = readFileSync(new URL('../app/components/ClientScpiCard.tsx', import.meta.url), 'utf8');
const panel = readFileSync(new URL('../components/trajectory/ScpiTrajectoryPanel.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');

describe('réutilisation du module Trajectoire public dans l’espace client', () => {
  it('réutilise exactement le composant existant sans seconde implémentation', () => {
    expect(card).toContain("import ScpiTrajectoryPanel from '../../components/trajectory/ScpiTrajectoryPanel';");
    expect(card).toContain('<ScpiTrajectoryPanel scpiSlug={holding.slug} />');
    expect(card.match(/<ScpiTrajectoryPanel /g)).toHaveLength(1);
    expect(panel).toContain("from('scpi_trajectory_pilot_history')");
    expect(panel).toContain('CERTIFIED_HISTORY_SELECT');
  });

  it('affiche la trajectoire dès le haut du détail, sans toucher aux répartitions ni aux alertes', () => {
    const metricCardsEnd = card.indexOf('<div><p className="text-sm text-slate-300">TOF publié</p>');
    const expandedStart = card.indexOf("{expanded && (\n        <section id={'holding-trajectory-'");
    const trajectoryStart = card.indexOf('<ScpiTrajectoryPanel scpiSlug={holding.slug} />');
    const sectorSection = card.indexOf("aria-label={'Répartitions de ' + holding.name}");
    const regularDetails = card.indexOf("{expanded && <div id={'holding-details-'");
    expect(metricCardsEnd).toBeGreaterThan(0);
    expect(expandedStart).toBeGreaterThan(metricCardsEnd);
    expect(trajectoryStart).toBeGreaterThan(expandedStart);
    expect(trajectoryStart).toBeLessThan(sectorSection);
    expect(sectorSection).toBeLessThan(regularDetails);
    expect(card).toContain('Trajectoire historique détaillée');
    expect(card).toContain('Lecture patrimoniale');
    expect(card).toContain('Surveillance de cette SCPI');
  });

  it('conserve les cinq axes, le tableau et la source officielle déjà publiés', () => {
    for (const tab of ['TOF', 'Liquidité', 'Valorisation', 'Distribution', 'Dette']) {
      expect(panel).toContain("label: '" + tab + "'");
    }
    expect(panel).toContain('Historique vérifiable');
    for (const name of ['Période', 'TOF', 'Liquidité / base', 'Prix', 'Reconstitution', 'Réalisation', 'Dette', 'Source']) {
      expect(panel).toContain('>' + name + '</th>');
    }
    expect(panel).toContain('row.source_url');
  });

  it('ne modifie pas le tableau de bord global et son radar', () => {
    expect(dashboard).toContain('<ClientPortfolioRadarTrajectory');
    expect(dashboard).toContain('Répartition sectorielle du portefeuille');
    expect(dashboard).toContain('Répartition géographique du portefeuille');
  });
});
