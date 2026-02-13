import { pdf } from '@react-pdf/renderer';
import { ImpactFiscalResult } from '../../../../domain/strategies/runScenario';
import { buildImpactFiscalReportModel } from './reportModel';
import { buildImpactFiscalPdf, ReportOptions } from './ImpactFiscalReport';

export const generateImpactFiscalPdfBlob = async (
  data: ImpactFiscalResult,
  options?: ReportOptions
): Promise<{ blob: Blob; fileName: string }> => {
  const model = buildImpactFiscalReportModel(data);
  const doc = buildImpactFiscalPdf(model, options);
  const blob = await pdf(doc).toBlob();
  const fileName = `MaximusSCPI_ImpactFiscal_${model.meta.simulationId}_${new Date().toISOString().slice(0, 10)}.pdf`;
  return { blob, fileName };
};
