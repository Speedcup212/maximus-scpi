import jsPDF from 'jspdf';
import type { ISInputs, ISSimulationResult } from './calculsIS';

type PdfPayload = {
  inputs: ISInputs;
  result: ISSimulationResult;
};

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const formatPercent = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);

const formatPoints = (value: number) => {
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  return `${sign}${value.toFixed(2)} pts`;
};

export const generateISReportPDF = ({ inputs, result }: PdfPayload) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  let cursorY = 20;

  const addTitle = (text: string) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(text, 15, cursorY);
    cursorY += 8;
  };

  const addLine = (text: string) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(text, 15, cursorY);
    cursorY += 6;
  };

  addTitle('Trésorerie IS – SCPI');
  addLine(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
  cursorY += 4;

  addTitle('Hypothèses');
  addLine(`Montant investi : ${formatEuro(inputs.investedAmount)}`);
  addLine(`Rendement brut annuel : ${formatPercent(inputs.grossYieldRate)}`);
  addLine(`Taux IS : ${formatPercent(inputs.corporateTaxRate)}`);
  addLine(`Durée : ${inputs.years} an(s)`);
  addLine(`Capitalisation : ${inputs.capitalize ? 'Oui' : 'Non'}`);
  addLine(`Revalorisation : ${inputs.revalorizeCapital ? 'Oui' : 'Non'}`);
  if (inputs.revalorizeCapital) {
    addLine(`Taux revalorisation : ${formatPercent(inputs.revalorizationRate ?? 0)}`);
  }
  addLine(`Fiscalité sortie : ${inputs.exitTaxEnabled ? 'Oui' : 'Non'}`);
  if (inputs.exitTaxEnabled) {
    addLine(`Taux IS sortie : ${formatPercent(inputs.exitTaxRate ?? 25)}`);
  }
  addLine(`Amortissement : ${inputs.amortizationEnabled ? 'Oui' : 'Non'}`);
  if (inputs.amortizationEnabled) {
    addLine(`Durée amortissement : ${inputs.amortizationYears ?? 20} ans`);
    addLine(`Quote-part amortissable : ${formatPercent(inputs.amortizationShare ?? 80)}`);
  }
  cursorY += 4;

  addTitle('Résultats');
  addLine(`Revenus bruts annuels : ${formatEuro(result.summary.annualGrossIncome)}`);
  addLine(`IS annuel : ${formatEuro(result.summary.annualCorporateTax)}`);
  addLine(`Revenus nets annuels : ${formatEuro(result.summary.annualNetIncome)}`);
  addLine(`Cash net cumulé : ${formatEuro(result.summary.cumulativeNetCash)}`);
  addLine(`Capital final net : ${formatEuro(result.summary.capitalNetFinal)}`);
  addLine(`Valeur totale récupérée : ${formatEuro(result.summary.totalRecovered)}`);
  addLine(
    `TRI net IS : ${
      result.summary.simplifiedIrr === null ? 'Non calculable' : formatPercent(result.summary.simplifiedIrr * 100)
    }`
  );
  addLine(
    `TRI brut : ${
      result.summary.grossIrr === null ? 'Non calculable' : formatPercent(result.summary.grossIrr * 100)
    }`
  );
  addLine(
    `Impact fiscal (pts) : ${
      result.summary.irrImpact === null ? 'Non calculable' : formatPoints(result.summary.irrImpact * 100)
    }`
  );
  if (result.summary.netIrrWithRevalo !== null) {
    addLine(`TRI net IS + revalorisation : ${formatPercent(result.summary.netIrrWithRevalo * 100)}`);
  }
  if (result.summary.netIrrAfterExitTax !== null) {
    addLine(`TRI net IS après IS sortie : ${formatPercent(result.summary.netIrrAfterExitTax * 100)}`);
  }
  addLine(`Taux net IS annuel moyen : ${formatPercent(result.summary.netYieldRate * 100)}`);

  cursorY += 6;
  addTitle('Tableau synthétique');

  pdf.setFontSize(9);
  const startY = cursorY;
  const colWidths = [12, 35, 30, 30, 35];
  const headers = ['Année', 'Brut', 'IS', 'Net', 'Cash cumulé'];

  let x = 15;
  headers.forEach((header, index) => {
    pdf.text(header, x, startY);
    x += colWidths[index];
  });

  cursorY = startY + 5;
  result.projections.slice(0, 12).forEach(row => {
    let colX = 15;
    const values = [
      row.year.toString(),
      formatEuro(row.grossIncome),
      formatEuro(row.corporateTax),
      formatEuro(row.netIncome),
      formatEuro(row.cumulativeNetCash)
    ];
    values.forEach((value, idx) => {
      pdf.text(value, colX, cursorY);
      colX += colWidths[idx];
    });
    cursorY += 5;
  });

  if (result.projections.length > 12) {
    pdf.text('…', 15, cursorY + 2);
  }

  pdf.setFontSize(9);
  pdf.text(
    'Simulation pédagogique – ne constitue pas une recommandation.',
    15,
    pdf.internal.pageSize.getHeight() - 15
  );

  pdf.save(`tresorerie-is-scpi-${new Date().toISOString().split('T')[0]}.pdf`);
};
