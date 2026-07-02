import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { HoldingISInputs, HoldingISResult } from '../../../utils/holdingSimulation';

export async function generatePdfBlob(sim: {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}): Promise<{ pdfBlob: Blob; fileName: string }> {

  // Dynamic import pour éviter de charger le PDF dans le bundle principal
  const { default: ExpertHoldingReportPdf } = await import('./ExpertHoldingReportPdf');

  const r = sim.results as Record<string, unknown>;
  const isSansOp = (typeof r.annualISBeforeOperation === 'number' ? r.annualISBeforeOperation : 0) as number;

  const blob = await pdf(
    React.createElement(ExpertHoldingReportPdf, {
      inputs: sim.inputs as HoldingISInputs,
      result: sim.results as HoldingISResult,
      isSansOperation: isSansOp,
    })
  ).toBlob();

  const dossierName = ((sim.inputs as Record<string, unknown>)?.dossierName as string || 'maximusscpi')
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .substring(0, 50);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `rapport-holding-is-${dossierName}-${date}.pdf`;

  return { pdfBlob: blob, fileName };
}
