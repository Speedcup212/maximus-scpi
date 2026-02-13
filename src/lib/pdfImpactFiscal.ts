import jsPDF from 'jspdf';
import { ImpactFiscalResult } from '../domain/strategies/runScenario';

const formatEuro = (value: number) =>
  value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const generateImpactFiscalPDF = (result: ImpactFiscalResult) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Impact fiscal SCPI - Comparatif', 14, 18);

  doc.setFontSize(11);
  doc.text('Hypothèses principales', 14, 28);
  doc.text(`Montant investi : ${formatEuro(result.inputs.investedAmount)}`, 14, 36);
  doc.text(`Rendement brut : ${(result.inputs.annualYieldRate * 100).toFixed(2)} %`, 14, 42);
  doc.text(`Horizon : ${result.inputs.years} ans`, 14, 48);

  const rows = [
    result.directIR,
    result.sciIR,
    result.sciIS,
    result.holdingIS
  ];

  doc.setFontSize(11);
  doc.text('Résumé comparatif', 14, 62);

  let y = 70;
  rows.forEach(item => {
    doc.setFontSize(10);
    doc.text(`${item.label}`, 14, y);
    doc.text(`Cashflow net moyen : ${formatEuro(Number(item.cashflowNetAvg.toFixed(0)))}`, 14, y + 6);
    doc.text(`Impôts perso cumulés : ${formatEuro(Number(item.taxesPersonalTotal.toFixed(0)))}`, 14, y + 12);
    doc.text(`Impôts société cumulés : ${formatEuro(Number(item.taxesCorporateTotal.toFixed(0)))}`, 14, y + 18);
    doc.text(
      `Valeur nette finale (hors impôt de sortie) : ${formatEuro(Number(item.netWorthFinal.toFixed(0)))}`,
      14,
      y + 24
    );
    const exitTax = item.exit.corporateISOnExit
      .plus(item.exit.personalPFUOnExit)
      .plus(item.exit.personalCapitalGainTax);
    if (item.exit.policy !== 'HOLD') {
      doc.text(`Impôt de sortie estimé : ${formatEuro(Number(exitTax.toFixed(0)))}`, 14, y + 30);
      doc.text(`TRI net : ${item.irrNet ? (item.irrNet.toNumber() * 100).toFixed(2) + ' %' : 'NC'}`, 14, y + 36);
      y += 44;
    } else {
      doc.text(`TRI net : ${item.irrNet ? (item.irrNet.toNumber() * 100).toFixed(2) + ' %' : 'NC'}`, 14, y + 30);
      y += 38;
    }
  });

  doc.setFontSize(9);
  doc.text(
    'Simulation pédagogique et informative. Ce document ne constitue pas une recommandation d’investissement.',
    14,
    270
  );

  doc.save('impact-fiscal-scpi.pdf');
};
