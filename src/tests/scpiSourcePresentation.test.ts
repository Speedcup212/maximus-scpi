import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Scpi } from '../types/scpi';
import ScpiPublicationQualityNotice from '../components/ScpiPublicationQualityNotice';
import { isFeatureDisabled } from '../utils/scpiPublicationQuality';

const scpi = {
  maximusPublicationStatus:'published_with_reserves',
  maximusSourcePeriode:'2026-T2',
  distributionReferencePeriod:'2025-RA',
  maximusPublicationReservations:[
    'LATEST_STATUTES_UNVERIFIED',
    'UNRECONCILED_SHARE_FLOW',
    'RISK_SFDR_TEXT_UNDER_REVIEW'
  ],
  maximusDisabledFeatures:['suitability_recommendations','uncertified_history_comparison'],
  metricProvenance:{
    prix_reconstitution:{reference_date:'2025-12-31'},
    capitalisation:{source_url:'https://www.sofidy.com/app/uploads/2026/07/Bulletin_Trimestriel_-_Sofidynamic_OPTI.pdf'}
  }
} as Scpi;

describe('présentation documentaire SCPI côté client',()=>{
  it('affiche les dates utiles et conserve le détail technique replié',()=>{
    const html=renderToStaticMarkup(React.createElement(ScpiPublicationQualityNotice,{scpi}));
    expect(html).toContain('Références documentaires');
    expect(html).toContain('Bulletin : ');
    expect(html).toContain('2026-T2');
    expect(html).toContain('Valorisation : ');
    expect(html).toContain('31/12/2025');
    expect(html).toContain('<details');
    expect(html).toContain('Sources et méthodologie');
    expect(html).toContain('Statuts consultables');
    expect(html).not.toContain('Fiche publiée avec réserves');
    expect(html).not.toContain('certification complète en cours');
    expect(html).not.toContain('<details open');
  });
  it('maintient les limitations de calcul et de recommandation',()=>{
    expect(isFeatureDisabled(scpi,'suitability_recommendations')).toBe(true);
    expect(isFeatureDisabled(scpi,'uncertified_history_comparison')).toBe(true);
  });
  it('ne montre aucun encadré de réserves sur une SCPI certifiée',()=>{
    const markup=renderToStaticMarkup(React.createElement(ScpiPublicationQualityNotice,{
      scpi:{...scpi,maximusPublicationStatus:'certified'}
    }));
    expect(markup).toBe('');
  });
});
