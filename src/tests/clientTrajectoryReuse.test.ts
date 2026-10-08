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

  it('ne charge le module que lorsque la fiche détenue est dépliée', () => {
    const expandedStart = card.indexOf("{expanded && <div id={'holding-details-'");
    const trajectoryStart = card.indexOf('<ScpiTrajectoryPanel scpiSlug={holding.slug} />');
    const expandedEnd = card.indexOf('      </div>}', expandedStart);
    expect(expandedStart).toBeGreaterThan(0);
    expect(trajectoryStart).toBeGreaterThan(expandedStart);
    expect(trajectoryStart).toBeLessThan(expandedEnd);
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
