import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Scpi } from '../types/scpi';
import ScpiPublicationQualityNotice from '../components/ScpiPublicationQualityNotice';
import { canRecommendScpi, isFeatureDisabled } from '../utils/scpiPublicationQuality';

const scpi: Scpi = {
  id: 0,
  name: 'SCPI fixture documentaire',
  sector: 'diversifie',
  geography: 'europe',
  yield: 0,
  capitalization: 0,
  tof: 0,
  price: 0,
  discount: 0,
  fees: 0,
  isr: false,
  european: true,
  company: 'Gestionnaire de test',
  creation: 2026,
  minInvest: 0,
  maximusPublicationStatus: 'published_with_reserves',
  maximusSourcePeriode: '2026-T2',
  distributionReferencePeriod: '2025-RA',
  maximusPublicationReservations: [
    'LATEST_STATUTES_UNVERIFIED',
    'UNRECONCILED_SHARE_FLOW',
    'RISK_SFDR_TEXT_UNDER_REVIEW',
    'HISTORY_NOT_RECONCILED'
  ],
  maximusDisabledFeatures: ['suitability_recommendations', 'uncertified_history_comparison'],
  metricProvenance: {
    prix_reconstitution: { reference_date: '2025-12-31' },
    valeur_realisation: { reference_date: '2025-12-31' },
    capitalisation: {
      source_url: 'https://www.sofidy.com/app/uploads/2026/07/Bulletin_Trimestriel_-_Sofidynamic_OPTI.pdf'
    }
  }
};

const render = (item: Scpi = scpi) =>
  renderToStaticMarkup(React.createElement(ScpiPublicationQualityNotice, { scpi: item }));

describe('présentation documentaire SCPI côté client', () => {
  it('affiche les dates officielles et le lien documentaire sans divulguer les anomalies techniques', () => {
    const html = render();
    expect(html).toContain('Sources et actualisation des données');
    expect(html).toContain('Bulletin de référence');
    expect(html).toContain('2e trimestre 2026');
    expect(html).toContain('Valeur de reconstitution');
    expect(html).toContain('Valeur de réalisation');
    expect(html).toContain('31/12/2025');
    expect(html).toContain('Taux de distribution annuel');
    expect(html).toContain('2025');
    expect(html).toContain('Consulter le document officiel de référence');
    expect(html).toContain('Bulletin_Trimestriel_-_Sofidynamic_OPTI.pdf');
    expect(html).not.toContain('<details');
    for (const internalLabel of [
      'Fiche publiée avec réserves', 'certification complète en cours',
      'Statuts consultables', 'Mouvements de parts', 'rapprochement',
      'revue complémentaire', 'recommandations personnalisées'
    ]) {
      expect(html).not.toContain(internalLabel);
    }
  });

  it('utilise la même présentation pour une fiche certifiée : pas de signal stigmatisant', () => {
    expect(render({ ...scpi, maximusPublicationStatus: 'certified' }))
      .toContain('Sources et actualisation des données');
  });

  it('ne fabrique aucune date ni lien quand les références sont absentes', () => {
    expect(render({
      ...scpi, maximusSourcePeriode: undefined,
      distributionReferencePeriod: undefined, metricProvenance: undefined
    })).toBe('');
  });

  it('respecte les dates distinctes de reconstitution et de réalisation', () => {
    const html = render({ ...scpi, metricProvenance: {
      ...scpi.metricProvenance,
      valeur_realisation: { reference_date: '2024-12-31' }
    } });
    expect(html).toContain('31/12/2025');
    expect(html).toContain('31/12/2024');
  });

  it('maintient sans exception les restrictions de calcul et de recommandation', () => {
    expect(isFeatureDisabled(scpi, 'suitability_recommendations')).toBe(true);
    expect(isFeatureDisabled(scpi, 'uncertified_history_comparison')).toBe(true);
    expect(canRecommendScpi(scpi)).toBe(false);
    expect(canRecommendScpi({ ...scpi, maximusPublicationStatus: 'certified' })).toBe(true);
  });
});
