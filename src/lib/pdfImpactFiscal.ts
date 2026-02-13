import jsPDF from 'jspdf';
import { ImpactFiscalResult } from '../domain/strategies/runScenario';
import { buildAnnualSeries, buildTaxesSeries } from '../ui/simulators/impact-fiscal/chartSeries';

const normalizeSpaces = (value: string) =>
  value.replace(/[\u202f\u00a0]/g, ' ');

export const formatInt = (value: number) =>
  normalizeSpaces(
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.abs(value) < 0.5 ? 0 : value)
  );

export const formatEUR = (value: number) =>
  `${formatInt(value)} €`;

export const formatPct = (value: number) =>
  normalizeSpaces(
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  ) + ' %';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);

const drawHeader = (doc: jsPDF, title: string, simulationId: string, dateLabel: string) => {
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('MaximusSCPI', 14, 14);
  doc.setFontSize(10);
  doc.text(title, 14, 20);
  doc.text(`Simulation: ${simulationId}`, 150, 14);
  doc.text(dateLabel, 150, 20);
  doc.setDrawColor(220);
  doc.line(14, 24, 196, 24);
};

const drawFooter = (doc: jsPDF, page: number, total: number) => {
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Simulation informative – pas une recommandation', 14, 288);
  doc.text(`Page ${page}/${total}`, 180, 288);
};

const drawSectionTitle = (doc: jsPDF, label: string, x: number, y: number) => {
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(label, x, y);
};

const drawLineChart = (
  doc: jsPDF,
  data: Array<{ year: number; directIR: number; sciIR: number; sciIS: number; holdingIS: number }>,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const keys = ['directIR', 'sciIR', 'sciIS', 'holdingIS'] as const;
  const colors: Record<(typeof keys)[number], [number, number, number]> = {
    directIR: [34, 197, 94],
    sciIR: [56, 189, 248],
    sciIS: [245, 158, 11],
    holdingIS: [168, 85, 247]
  };

  const values = data.flatMap(row => keys.map(key => row[key]));
  const maxVal = Math.max(1, ...values);
  const minVal = Math.min(0, ...values);
  const scaleY = height / (maxVal - minVal || 1);
  const scaleX = width / (data.length - 1 || 1);

  doc.setDrawColor(200);
  doc.rect(x, y, width, height);

  keys.forEach(key => {
    doc.setDrawColor(...colors[key]);
    data.forEach((row, idx) => {
      const px = x + idx * scaleX;
      const py = y + height - (row[key] - minVal) * scaleY;
      if (idx === 0) {
        doc.moveTo(px, py);
      } else {
        doc.lineTo(px, py);
      }
    });
    doc.stroke();
  });
};

const drawStackedBar = (
  doc: jsPDF,
  data: Array<{ label: string; personal: number; corporate: number }>,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const maxVal = Math.max(1, ...data.map(row => row.personal + row.corporate));
  const barWidth = width / data.length - 6;
  data.forEach((row, idx) => {
    const baseX = x + idx * (barWidth + 6);
    const personalHeight = (row.personal / maxVal) * height;
    const corporateHeight = (row.corporate / maxVal) * height;
    doc.setFillColor(34, 197, 94);
    doc.rect(baseX, y + height - personalHeight, barWidth, personalHeight, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(baseX, y + height - personalHeight - corporateHeight, barWidth, corporateHeight, 'F');
    doc.setTextColor(90);
    doc.setFontSize(7);
    doc.text(row.label, baseX, y + height + 5);
  });
};

export type ImpactFiscalPDFImages = {
  netPersonalChart?: string;
  taxesChart?: string;
};

export const generateImpactFiscalPDF = (result: ImpactFiscalResult, images?: ImpactFiscalPDFImages) => {
  const doc = new jsPDF();
  const simulationId = `IFSCPI-${Date.now().toString().slice(-6)}`;
  const dateLabel = formatDate(new Date());
  const totalPages = 4;
  const exitPolicyLabels: Record<ImpactFiscalResult['inputs']['exitPolicy'], string> = {
    SELL_ASSETS_DISTRIBUTE: 'Revente + distribution',
    HOLD: 'Conservation (pas de vente)',
    SELL_SHARES: 'Cession des titres'
  };

  // Page 1 - Executive summary
  drawHeader(doc, 'Impact fiscal SCPI – Comparatif', simulationId, dateLabel);
  drawFooter(doc, 1, totalPages);

  drawSectionTitle(doc, 'Executive summary', 14, 34);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Montant investi: ${formatEUR(result.inputs.investedAmount)}`, 14, 40);
  doc.text(`Rendement brut: ${formatPct(result.inputs.annualYieldRate * 100)}`, 14, 45);
  doc.text(`Horizon: ${result.inputs.years} ans`, 14, 50);
  doc.text(
    `TMI: ${formatPct(result.inputs.tmiRate * 100)} | PS: ${formatPct(result.inputs.socialRate * 100)} | PFU: ${formatPct(result.inputs.pfuRate * 100)}`,
    14,
    55
  );
  doc.text(`Distribution: ${result.inputs.distributionTiming} | Sortie: ${exitPolicyLabels[result.inputs.exitPolicy]}`, 14, 60);
  doc.text(`Version moteur: v1.0`, 14, 65);

  const rows = [
    result.directIR,
    result.sciIR,
    result.sciIS,
    result.holdingIS
  ];

  drawSectionTitle(doc, 'Comparatif des structures', 14, 72);
  let cardY = 74;
  rows.forEach(item => {
    doc.setDrawColor(220);
    doc.rect(14, cardY, 182, 28);
    doc.setFontSize(9);
    doc.setTextColor(20);
    doc.text(item.label, 16, cardY + 6);
    doc.setTextColor(80);
    doc.text(`Cash net moyen: ${formatEUR(Number(item.cashflowNetAvg.toFixed(0)))}`, 16, cardY + 12);
    const impotsPersoHorsSortie = item.taxesBreakdown.personalIR
      .plus(item.taxesBreakdown.personalPS)
      .plus(item.taxesBreakdown.personalPFU);
    doc.text(`Impôts perso (hors sortie): ${formatEUR(Number(impotsPersoHorsSortie.toFixed(0)))}`, 90, cardY + 12);
    doc.text(`Impôts société (hors sortie): ${formatEUR(Number(item.taxesBreakdown.corporateIS.toFixed(0)))}`, 140, cardY + 12);
    const exitTax = item.exit.corporateISOnExit
      .plus(item.exit.personalPFUOnExit)
      .plus(item.exit.personalCapitalGainTax);
    const netAfterExit = Number(item.netWorthFinal.minus(exitTax).toFixed(0));
    doc.text(`Valeur nette après sortie: ${formatEUR(netAfterExit)}`, 16, cardY + 20);
    doc.text(`Impôt de sortie estimé: ${formatEUR(Number(exitTax.toFixed(0)))}`, 90, cardY + 20);
    doc.text(`TRI net: ${item.irrNet ? formatPct(item.irrNet.toNumber() * 100) : 'NC'}`, 140, cardY + 20);
    cardY += 34;
  });

  // Page 2 - Graphs
  doc.addPage();
  drawHeader(doc, 'Impact fiscal SCPI – Graphiques', simulationId, dateLabel);
  drawFooter(doc, 2, totalPages);

  drawSectionTitle(doc, 'Net vers perso annuel', 14, 34);
  if (images?.netPersonalChart) {
    doc.addImage(images.netPersonalChart, 'PNG', 14, 40, 182, 70);
  } else {
    const annualSeries = buildAnnualSeries(result, 'personal');
    drawLineChart(doc, annualSeries, 14, 40, 182, 70);
  }

  drawSectionTitle(doc, 'Impôts cumulés (perso vs société)', 14, 122);
  if (images?.taxesChart) {
    doc.addImage(images.taxesChart, 'PNG', 14, 128, 182, 60);
  } else {
    const taxesSeries = buildTaxesSeries(result);
    drawStackedBar(doc, taxesSeries, 14, 128, 182, 60);
  }

  // Page 3 - Annual table
  doc.addPage();
  drawHeader(doc, 'Impact fiscal SCPI – Tableau annuel (Essentiel)', simulationId, dateLabel);
  drawFooter(doc, 3, totalPages);

  const tableY = 34;
  const headers = ['Année', 'Revenus', 'Net perso', 'Tréso société', 'CRD', 'Valeur parts', 'Valeur nette'];
  const colX = [14, 36, 62, 92, 125, 150, 176];
  doc.setFontSize(8);
  doc.setTextColor(60);
  headers.forEach((h, i) => doc.text(h, colX[i], tableY));
  let rowY = tableY + 6;
  const allRows = rows[0].years;
  const filteredRows =
    allRows.length <= 15
      ? allRows
      : allRows.filter((row, idx) => idx % 2 === 0 || idx === allRows.length - 1);
  filteredRows.forEach((row) => {
    if (rowY > 270) return;
    doc.setTextColor(30);
    doc.text(String(row.year), colX[0], rowY);
    doc.text(formatInt(Number(row.revenues.toFixed(0))), colX[1], rowY, { align: 'right' });
    doc.text(formatInt(Number(row.netPersonal.toFixed(0))), colX[2], rowY, { align: 'right' });
    doc.text(formatInt(Number(row.cashCompany.toFixed(0))), colX[3], rowY, { align: 'right' });
    doc.text(formatInt(Number(row.remainingDebt.toFixed(0))), colX[4], rowY, { align: 'right' });
    doc.text(formatInt(Number(row.partValue.toFixed(0))), colX[5], rowY, { align: 'right' });
    doc.text(formatInt(Number(row.netWorth.toFixed(0))), colX[6], rowY, { align: 'right' });
    rowY += 6;
  });

  // Page 4 - Hypotheses & glossary
  doc.addPage();
  drawHeader(doc, 'Impact fiscal SCPI – Hypothèses & limites', simulationId, dateLabel);
  drawFooter(doc, 4, totalPages);
  drawSectionTitle(doc, 'Hypothèses principales', 14, 34);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text('- Rendement et revalorisation constants sur la période.', 14, 42);
  doc.text('- Frais de souscription intégrés au prix de revient.', 14, 48);
  doc.text('- Parts de SCPI non amorties en IS (actif financier).', 14, 54);
  doc.text('- Fiscalité paramétrable et informative.', 14, 60);

  drawSectionTitle(doc, 'Glossaire', 14, 78);
  doc.text('Net perso: flux nets après impôts vers la personne physique.', 14, 86);
  doc.text('Tréso société: cash conservé en SCI/Holding après IS.', 14, 92);
  doc.text('Valeur nette: parts + trésorerie (perso + société) - dette.', 14, 98);

  doc.save('impact-fiscal-scpi.pdf');
};
