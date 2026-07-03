import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { HoldingISInputs, HoldingISResult } from '../../../utils/holdingSimulation';

export async function generatePdfBlob(
  sim: {
    inputs: Record<string, unknown>;
    results: Record<string, unknown>;
  },
  opts?: {
    /** Nom réel du dossier client (depuis Supabase). Prioritaire pour l'affichage et le nom de fichier. */
    dossierName?: string;
    /** Affiche le badge "Mode admin — document de test" uniquement si explicitement demandé. */
    includeAdminTestBadge?: boolean;
  },
): Promise<{ pdfBlob: Blob; fileName: string }> {

  // Dynamic import pour éviter de charger le PDF dans le bundle principal
  const { default: ExpertHoldingReportPdf } = await import('./ExpertHoldingReportPdf');

  const r = sim.results as Record<string, unknown>;
  const isSansOp = (typeof r.annualISBeforeOperation === 'number' ? r.annualISBeforeOperation : 0) as number;

  const blob = await pdf(
    React.createElement(ExpertHoldingReportPdf, {
      inputs: sim.inputs as HoldingISInputs,
      result: sim.results as HoldingISResult,
      isSansOperation: isSansOp,
      dossierName: opts?.dossierName,
      includeAdminTestBadge: opts?.includeAdminTestBadge ?? false,
    })
  ).toBlob();

  const inputsCast = sim.inputs as Record<string, unknown>;

  /* Résolution du nom pour le fichier :
     1. opts.dossierName (depuis Supabase)
     2. inputs.dossierName (saisi dans le simulateur)
     3. Fallback "simulation-holding-is"
  */
  const filenameDossier = (opts?.dossierName || inputsCast?.dossierName || 'simulation-holding-is')
    .toString()
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `rapport-holding-is-${filenameDossier}-${date}.pdf`;

  return { pdfBlob: blob, fileName };
}
