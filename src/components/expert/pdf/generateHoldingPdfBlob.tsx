import { pdf } from '@react-pdf/renderer';
import { isHoldingPdfSnapshot } from '../../../utils/holdingPdfValidation';

export async function generatePdfBlob(
  sim: { inputs: Record<string, unknown>; results: Record<string, unknown> },
  opts?: {
    /** Nom réel du dossier client (depuis Supabase). Prioritaire pour l'affichage et le nom de fichier. */
    dossierName?: string;
    /** Affiche le badge "Mode admin — document de test" uniquement si explicitement demandé. */
    includeAdminTestBadge?: boolean;
  },
): Promise<{ pdfBlob: Blob; fileName: string }> {
  if (!isHoldingPdfSnapshot(sim)) {
    throw new Error('Rapport Holding IS refusé : données financières ou hypothèses incomplètes/incohérentes.');
  }

  // Dynamic import pour éviter de charger le PDF dans le bundle principal.
  const { default: ExpertHoldingReportPdf } = await import('./ExpertHoldingReportPdf');
  const blob = await pdf(
    <ExpertHoldingReportPdf
      inputs={sim.inputs}
      result={sim.results}
      isSansOperation={sim.results.annualISBeforeOperation}
      dossierName={opts?.dossierName}
      includeAdminTestBadge={opts?.includeAdminTestBadge ?? false}
    />
  ).toBlob();

  const filenameDossier = (opts?.dossierName || sim.inputs.dossierName || 'simulation-holding-is')
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  const date = new Date().toISOString().slice(0, 10);
  return { pdfBlob: blob, fileName: `rapport-holding-is-${filenameDossier}-${date}.pdf` };
}
