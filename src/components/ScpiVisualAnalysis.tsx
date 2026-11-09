import React from 'react';
import type { Scpi } from '../types/scpi';
import type { ScpiLandingData } from '../data/landingPagesData';
import { buildScpiLandingData } from '../utils/buildScpiLandingData';
import ScpiPremiumAnalysis from './ScpiPremiumAnalysis';
import ScpiTrajectoryPanel from './trajectory/ScpiTrajectoryPanel';

interface ScpiVisualAnalysisProps {
  scpi?: Scpi | null;
  scpiSlug: string;
  landingData?: ScpiLandingData;
}

/**
 * Point de montage unique Radar + Trajectoire pour les fiches publiques et
 * les vues SCPI secondaires. Les deux visualisations utilisent les données
 * existantes : aucune valeur financière n'est synthétisée pour les compléter.
 */
const ScpiVisualAnalysis: React.FC<ScpiVisualAnalysisProps> = ({
  scpi,
  scpiSlug,
  landingData,
}) => {
  const resolvedLandingData = landingData ?? buildScpiLandingData(scpiSlug)?.data;

  return (
    <div data-testid="scpi-visual-analysis" data-scpi-slug={scpiSlug}>
      {scpi && resolvedLandingData ? (
        <ScpiPremiumAnalysis scpi={scpi} landingData={resolvedLandingData} />
      ) : (
        <section id="radar-scpi" data-testid="scpi-radar-unavailable" className="bg-slate-950 py-10 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold">Radar Maximus</h3>
            <p className="mt-2 text-sm text-slate-300">
              Données vérifiées insuffisantes pour construire le radar de cette SCPI.
              Aucun score de remplacement n'est calculé.
            </p>
          </div>
        </section>
      )}
      <ScpiTrajectoryPanel scpiSlug={scpiSlug} />
    </div>
  );
};

export default ScpiVisualAnalysis;
