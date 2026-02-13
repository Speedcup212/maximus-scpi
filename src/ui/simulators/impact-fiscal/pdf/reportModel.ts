import { ImpactFiscalResult } from '../../../../domain/strategies/runScenario';
import { buildAnnualSeries, buildTaxesSeries } from '../chartSeries';
import { formatDate, formatEUR, formatPct } from './utils';

export type ReportMeta = {
  simulationId: string;
  dateLabel: string;
  version: string;
};

export type ReportScenario = {
  label: string;
  cashNetAvg: string;
  taxesPersonal: string;
  taxesPersonalLabel: string;
  taxesCorporate: string;
  netWorthAfterExit: string;
  netWorthAfterExitValue: number;
  exitTax: string;
  exitTaxValue: number;
  irrNet: string;
  cashNetAvgValue: number;
  isBestCash: boolean;
  isBestNet: boolean;
  quickNotes: string[];
  tableRows: Array<{
    year: number;
    revenues: string;
    netPersonal: string;
    cashCompany: string;
    remainingDebt: string;
    partValue: string;
    netWorth: string;
  }>;
};

export type ImpactFiscalReportModel = {
  meta: ReportMeta;
  title: string;
  assumptions: string[];
  distributionLine: string;
  disclaimer: string;
  glossary: string[];
  scenarios: ReportScenario[];
  annualSeries: ReturnType<typeof buildAnnualSeries>;
  taxesSeries: ReturnType<typeof buildTaxesSeries>;
  quickRead: string[];
  coherenceWarnings: string[];
};

const exitLabels: Record<ImpactFiscalResult['inputs']['exitPolicy'], string> = {
  SELL_ASSETS_DISTRIBUTE: 'Revente + distribution',
  HOLD: 'Conservation (pas de vente)',
  SELL_SHARES: 'Cession des titres'
};

const buildQuickNotes = (scenario: ImpactFiscalResult['directIR']) => {
  const notes: string[] = [];
  if (scenario.cashflowNetAvg.isZero()) {
    notes.push('Distribution nulle ⇒ cash perso nul par construction.');
  }
  if (scenario.taxesCorporateTotal.gt(0)) {
    notes.push('Fiscalité société présente (IS).');
  }
  if (scenario.exit.policy === 'HOLD') {
    notes.push('Capitalisation en société (pas de PFU final).');
  }
  return notes.slice(0, 3);
};

export const buildImpactFiscalReportModel = (
  data: ImpactFiscalResult,
  meta?: Partial<ReportMeta>
): ImpactFiscalReportModel => {
  const simulationId = meta?.simulationId ?? `IFSCPI-${Date.now().toString().slice(-6)}`;
  const dateLabel = meta?.dateLabel ?? formatDate(new Date());
  const version = meta?.version ?? 'v1.0';

  const scenariosRaw = [data.directIR, data.sciIR, data.sciIS, data.holdingIS];
  const isHoldingDuplicate = [
    data.holdingIS.cashflowNetAvg.eq(data.sciIS.cashflowNetAvg),
    data.holdingIS.taxesTotal.eq(data.sciIS.taxesTotal),
    data.holdingIS.taxesPersonalTotal.eq(data.sciIS.taxesPersonalTotal),
    data.holdingIS.taxesCorporateTotal.eq(data.sciIS.taxesCorporateTotal),
    data.holdingIS.netWorthFinal.eq(data.sciIS.netWorthFinal),
    data.holdingIS.exit.corporateISOnExit.eq(data.sciIS.exit.corporateISOnExit),
    data.holdingIS.exit.personalPFUOnExit.eq(data.sciIS.exit.personalPFUOnExit),
    data.holdingIS.exit.personalCapitalGainTax.eq(data.sciIS.exit.personalCapitalGainTax)
  ].every(Boolean);
  const scenarios = isHoldingDuplicate
    ? scenariosRaw.filter(item => item.label !== 'Holding IS')
    : scenariosRaw;

  const reportScenarios: ReportScenario[] = scenarios.map(item => {
    const impotsPerso = item.taxesBreakdown.personalIR
      .plus(item.taxesBreakdown.personalPS)
      .plus(item.taxesBreakdown.personalPFU);
    const impotsSociete = item.taxesBreakdown.corporateIS;
    const exitTax = item.exit.corporateISOnExit
      .plus(item.exit.personalPFUOnExit)
      .plus(item.exit.personalCapitalGainTax);
    const netAfterExit = item.netWorthFinal.minus(exitTax);
    const cashValue = Number(item.cashflowNetAvg.toFixed(2));
    const netAfterExitValue = Number(netAfterExit.toFixed(2));
    const exitTaxValue = Number(exitTax.toFixed(2));
    const isIR = item.label === 'Direct IR' || item.label === 'SCI IR';
    const hasAnnualDistributions =
      data.inputs.distributionTiming === 'annual' &&
      !(
        data.inputs.distributionPolicy.type === 'rate' &&
        data.inputs.distributionPolicy.rate === 0
      );
    const taxesPersonalLabel = isIR
      ? 'IR + PS (hors sortie)'
      : hasAnnualDistributions
        ? 'PFU sur distributions (hors sortie)'
        : 'Impôt perso (hors sortie)';
    const rows = item.years.filter((row, idx, arr) =>
      arr.length <= 15 ? true : idx % 2 === 0 || idx === arr.length - 1
    );
    return {
      label: item.label,
      cashNetAvg: formatEUR(Number(item.cashflowNetAvg.toFixed(0))),
      cashNetAvgValue: cashValue,
      taxesPersonal: formatEUR(Number(impotsPerso.toFixed(0))),
      taxesPersonalLabel,
      taxesCorporate: formatEUR(Number(impotsSociete.toFixed(0))),
      netWorthAfterExit: formatEUR(Number(netAfterExit.toFixed(0))),
      netWorthAfterExitValue: netAfterExitValue,
      exitTax: formatEUR(Number(exitTax.toFixed(0))),
      exitTaxValue,
      irrNet: item.irrNet ? formatPct(item.irrNet.toNumber() * 100) : 'NC',
      isBestCash: false,
      isBestNet: false,
      quickNotes: buildQuickNotes(item),
      tableRows: rows.map(row => ({
        year: row.year,
        revenues: formatEUR(Number(row.revenues.toFixed(0))),
        netPersonal: formatEUR(Number(row.netPersonal.toFixed(0))),
        cashCompany: formatEUR(Number(row.cashCompany.toFixed(0))),
        remainingDebt: formatEUR(Number(row.remainingDebt.toFixed(0))),
        partValue: formatEUR(Number(row.partValue.toFixed(0))),
        netWorth: formatEUR(Number(row.netWorth.toFixed(0)))
      }))
    };
  });

  const distributionLine =
    data.inputs.distributionTiming === 'annual' ? 'Distribution annuelle' : 'Capitalisation (distribution en fin)';

  const assumptions = [
    `Montant investi: ${formatEUR(data.inputs.investedAmount)}`,
    `Montant emprunté: ${formatEUR(data.inputs.loanAmount)} | Durée crédit: ${data.inputs.loanYears} ans | Taux: ${formatPct(data.inputs.loanRate * 100)}`,
    `Rendement brut: ${formatPct(data.inputs.annualYieldRate * 100)}`,
    `Horizon: ${data.inputs.years} ans`,
    `TMI/PS/PFU: ${formatPct(data.inputs.tmiRate * 100)} / ${formatPct(data.inputs.socialRate * 100)} / ${formatPct(data.inputs.pfuRate * 100)}`,
    `Frais souscription: ${formatPct(data.inputs.subscriptionFeeRate * 100)} | Frais cession: ${formatPct(data.inputs.exitFeeRate * 100)}`,
    `Frais compta annuels: ${formatEUR(data.inputs.accountingFeesAnnual)}`,
    `Distribution: ${distributionLine}`,
    `Sortie: ${exitLabels[data.inputs.exitPolicy]}`
  ];

  const maxCash = Math.max(...reportScenarios.map(s => s.cashNetAvgValue));
  const maxNet = Math.max(...reportScenarios.map(s => s.netWorthAfterExitValue));
  const bestCashCandidates = reportScenarios.filter(s => s.cashNetAvgValue === maxCash);
  const bestNetCandidates = reportScenarios.filter(s => s.netWorthAfterExitValue === maxNet);
  const bestCashLabel = bestCashCandidates.length === 1 ? bestCashCandidates[0].label : null;
  const bestNetLabel = bestNetCandidates.length === 1 ? bestNetCandidates[0].label : null;

  const reportScenariosWithBadges = reportScenarios.map(s => ({
    ...s,
    isBestCash: bestCashLabel ? s.label === bestCashLabel : false,
    isBestNet: bestNetLabel ? s.label === bestNetLabel : false
  }));

  const quickRead = [
    bestCashLabel ? `Cash net moyen le plus élevé: ${bestCashLabel}.` : 'Cash net moyen: aucun écart marqué.',
    bestNetLabel ? `Valeur nette après sortie la plus élevée: ${bestNetLabel}.` : 'Valeur nette: écarts proches.'
  ];

  const coherenceWarnings: string[] = [];
  if (isHoldingDuplicate) {
    coherenceWarnings.push('Holding IS identique à SCI IS sur tous les KPIs → ligne masquée.');
  }
  if (!bestNetLabel) {
    coherenceWarnings.push('Net+ non attribué (égalité ou incohérence sur la valeur nette).');
  }

  const filteredAnnualSeries = isHoldingDuplicate
    ? buildAnnualSeries(data, 'personal').map(row => {
        const { holdingIS, ...rest } = row;
        return rest;
      })
    : buildAnnualSeries(data, 'personal');
  const filteredTaxesSeries = isHoldingDuplicate
    ? buildTaxesSeries(data).filter(row => row.label !== 'Holding IS')
    : buildTaxesSeries(data);

  return {
    meta: { simulationId, dateLabel, version },
    title: 'Impact fiscal SCPI : Direct vs SCI (IR/IS) vs Holding IS',
    assumptions,
    distributionLine,
    disclaimer: 'Simulation informative — pas une recommandation d’investissement.',
    glossary: [
      'IR: Impôt sur le revenu.',
      'PS: Prélèvements sociaux.',
      'PFU: Prélèvement forfaitaire unique.',
      'IS: Impôt sur les sociétés.',
      'CRD: Capital restant dû.',
      'Valeur nette: parts (brut, hors frais de cession) + trésorerie nette perçue - dette - impôt de sortie.'
    ],
    scenarios: reportScenariosWithBadges,
    annualSeries: filteredAnnualSeries,
    taxesSeries: filteredTaxesSeries,
    quickRead,
    coherenceWarnings
  };
};
