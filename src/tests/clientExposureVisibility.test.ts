import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ClientScpiCard from '../app/components/ClientScpiCard';

describe('affichage permanent des répartitions client', () => {
  it('affiche secteurs et pays sans ouvrir la fiche SCPI', () => {
    const html = renderToStaticMarkup(React.createElement(ClientScpiCard, {
      holding: {
        slug: 'scpi-test',
        name: 'SCPI test',
        units: 10,
        invested: 2000,
        currentValue: 1900,
        valuationBasis: 'withdrawal',
        averagePurchasePrice: 200,
        annualIncome: null,
        yieldOnCost: null,
        source: 'external',
      },
      sector: {
        source: 'catalog',
        items: [{ label: 'Logistique', value: 60 }, { label: 'Bureaux', value: 40 }],
      },
      geography: {
        source: 'catalog',
        items: [{ label: 'France', value: 70 }, { label: 'Espagne', value: 30 }],
      },
      alerts: [],
      radarLabel: 'À documenter',
      radarClass: '',
      surveillanceUnavailable: false,
      manageExpanded: false,
      expanded: false,
      onToggleExpanded: () => {},
      onManage: () => {},
    }));
    expect(html).toContain('Répartition sectorielle');
    expect(html).toContain('Répartition géographique');
    expect(html).toContain('Logistique');
    expect(html).toContain('France');
    expect(html).toContain('Données historiques non certifiées');
    expect(html).not.toContain('id="holding-details-scpi-test"');
  });
});
