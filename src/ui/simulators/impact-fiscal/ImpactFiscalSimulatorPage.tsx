import { useMemo, useState } from 'react';
import { z } from 'zod';
import { runImpactFiscalScenario } from '../../../domain/strategies/runScenario';
import { generateImpactFiscalPdfBlob } from './pdf/generateImpactFiscalPdf';
import { buildAnnualSeries, buildTaxesSeries, NetMetric } from './chartSeries';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const inputSchema = z.object({
  taxYear: z.number().int(),
  tmiRate: z.number().min(0).max(0.9),
  socialRate: z.number().min(0).max(0.5),
  pfuRate: z.number().min(0).max(0.6),
  allowReducedIS: z.boolean(),
  foreignTaxCreditRate: z.number().min(0).max(1),
  investedAmount: z.number().min(0),
  subscriptionFeeRate: z.number().min(0).max(0.2),
  exitFeeRate: z.number().min(0).max(0.1),
  annualYieldRate: z.number().min(0).max(0.2),
  annualRevaluationRate: z.number().min(-0.05).max(0.2),
  annualManagementFeeRate: z.number().min(0).max(0.05),
  annualIndexationRate: z.number().min(0).max(0.05),
  years: z.number().int().min(5).max(30),
  loanAmount: z.number().min(0),
  loanRate: z.number().min(0).max(0.2),
  loanYears: z.number().int().min(1).max(30),
  loanInsuranceRate: z.number().min(0).max(0.05),
  equity: z.number().min(0),
  distributionPolicy: z.union([
    z.object({ type: z.literal('rate'), rate: z.number().min(0).max(1) }),
    z.object({ type: z.literal('cover_annuity') }),
    z.object({ type: z.literal('cover_taxes') })
  ]),
  distributionTiming: z.union([z.literal('annual'), z.literal('end')]),
  accountingFeesAnnual: z.number().min(0).max(10000),
  exitPolicy: z.union([z.literal('HOLD'), z.literal('SELL_ASSETS_DISTRIBUTE'), z.literal('SELL_SHARES')]),
  exitDistributeAtEnd: z.boolean(),
  exitDistributionRateAtEnd: z.number().min(0).max(1).optional(),
  deficitMode: z.union([z.literal('simplified'), z.literal('strict')]),
  deficitGlobalCap: z.number().min(0).max(30000)
});

type Inputs = z.infer<typeof inputSchema>;

const formatEuro = (value: number) =>
  value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const formatPercent = (value: number) => `${(value * 100).toFixed(2)} %`;

const initialInputs: Inputs = {
  taxYear: 2024,
  tmiRate: 0.3,
  socialRate: 0.172,
  pfuRate: 0.314,
  allowReducedIS: true,
  foreignTaxCreditRate: 0,
  investedAmount: 100000,
  subscriptionFeeRate: 0.1,
  exitFeeRate: 0.03,
  annualYieldRate: 0.05,
  annualRevaluationRate: 0.01,
  annualManagementFeeRate: 0,
  annualIndexationRate: 0,
  years: 15,
  loanAmount: 80000,
  loanRate: 0.03,
  loanYears: 15,
  loanInsuranceRate: 0.003,
  equity: 20000,
  distributionPolicy: { type: 'rate', rate: 0 },
  distributionTiming: 'annual',
  accountingFeesAnnual: 1200,
  exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
  exitDistributeAtEnd: true,
  exitDistributionRateAtEnd: 1,
  deficitMode: 'simplified',
  deficitGlobalCap: 10700
};

export const ImpactFiscalSimulatorPage = () => {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const [mode, setMode] = useState<'simple' | 'expert'>('simple');
  const [activeTab, setActiveTab] = useState<'comparatif' | 'direct' | 'sciir' | 'sciis' | 'holding' | 'hypotheses'>(
    'comparatif'
  );
  const [netMetric, setNetMetric] = useState<NetMetric>('personal');
  const [tableView, setTableView] = useState<'essential' | 'fiscal' | 'credit' | 'valuation'>('essential');
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [includePdfDetails, setIncludePdfDetails] = useState(false);

  const exitPolicyLabels: Record<Inputs['exitPolicy'], string> = {
    SELL_ASSETS_DISTRIBUTE: 'Revente + distribution',
    HOLD: 'Conservation (pas de vente)',
    SELL_SHARES: 'Cession des titres'
  };

  const parsed = inputSchema.safeParse(inputs);
  const result = useMemo(() => {
    if (!parsed.success) return null;
    return runImpactFiscalScenario(parsed.data);
  }, [parsed.success, inputs]);

  const comparatifRows = useMemo(() => {
    if (!result) return [];
    return [
      result.directIR,
      result.sciIR,
      result.sciIS,
      result.holdingIS
    ].map(item => ({
      label: item.label,
      cashflowNetAvg: Number(item.cashflowNetAvg.toFixed(2)),
      taxesTotal: Number(item.taxesTotal.toFixed(2)),
      taxesPersonal: Number(item.taxesPersonalTotal.toFixed(2)),
      taxesCorporate: Number(item.taxesCorporateTotal.toFixed(2)),
      netWorthFinal: Number(item.netWorthFinal.toFixed(2)),
      irrNet: item.irrNet ? Number(item.irrNet.toFixed(4)) : null,
      exit: item.exit,
      lastYear: item.years[item.years.length - 1]
    }));
  }, [result]);

  const annualChart = useMemo(() => {
    if (!result) return [];
    return buildAnnualSeries(result, netMetric);
  }, [result, netMetric]);

  const taxesChart = useMemo(() => {
    if (!result) return [];
    return buildTaxesSeries(result);
  }, [result]);

  const checks = useMemo(() => {
    if (!result) return [];
    const sciISZeroNet =
      inputs.distributionPolicy.type === 'rate' &&
      inputs.distributionPolicy.rate === 0 &&
      inputs.distributionTiming === 'annual'
        ? result.sciIS.years.every(y => Number(y.netPersonal.toFixed(2)) === 0)
        : null;
    const holdNoPfu =
      inputs.exitPolicy === 'HOLD'
        ? Number(result.sciIS.exit.personalPFUOnExit.toFixed(2)) === 0
        : null;
    const sellWithPfu =
      inputs.exitPolicy === 'SELL_ASSETS_DISTRIBUTE' && inputs.exitDistributeAtEnd
        ? Number(result.sciIS.exit.personalPFUOnExit.toFixed(2)) > 0
        : null;
    return [
      {
        label: 'Distribution 0% → net perso IS nul',
        status: sciISZeroNet
      },
      {
        label: 'Exit HOLD → pas de PFU final',
        status: holdNoPfu
      },
      {
        label: 'Exit SELL_ASSETS_DISTRIBUTE → PFU final appliqué',
        status: sellWithPfu
      }
    ];
  }, [result, inputs]);

  const update = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleExportPdf = async () => {
    if (!result || isPdfGenerating) return;
    setIsPdfGenerating(true);
    try {
      const { blob, fileName } = await generateImpactFiscalPdfBlob(result, { includeDetails: includePdfDetails });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed', error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const renderDetailTable = (label: string, data: typeof result.directIR | null) => {
    if (!data) return null;
    const formatEuroSafe = (value: number) => formatEuro(Math.abs(value) < 0.5 ? 0 : value);
    const priceOfReturn = inputs.investedAmount * (1 + inputs.subscriptionFeeRate);
    const exitTaxEstimate =
      data.exit.policy === 'HOLD'
        ? 0
        : Number(
            data.exit.corporateISOnExit
              .plus(data.exit.personalPFUOnExit)
              .plus(data.exit.personalCapitalGainTax)
              .toFixed(2)
          );
    const columns = (() => {
      if (tableView === 'credit') {
        return [
          { key: 'year', label: 'Année' },
          { key: 'interest', label: 'Intérêts' },
          { key: 'principalPaid', label: 'Capital remboursé' },
          { key: 'remainingDebt', label: 'CRD' }
        ];
      }
      if (tableView === 'fiscal') {
        return [
          { key: 'year', label: 'Année' },
          { key: 'taxableBase', label: 'Base taxable' },
          { key: 'ir', label: 'IR' },
          { key: 'ps', label: 'PS' },
          { key: 'is', label: 'IS' },
          { key: 'pfu', label: 'PFU' },
          { key: 'personalTaxes', label: 'Impôts perso' },
          { key: 'corporateTaxes', label: 'Impôts société' }
        ];
      }
      if (tableView === 'valuation') {
        return [
          { key: 'year', label: 'Année' },
          { key: 'partValue', label: 'Valeur parts' },
          { key: 'latentPV', label: 'PV latente' },
          { key: 'exitTax', label: 'Impôt sortie estimé' }
        ];
      }
      return [
        { key: 'year', label: 'Année' },
        { key: 'revenues', label: 'Revenus' },
        { key: 'netPersonal', label: 'Net perso' },
        { key: 'cashCompany', label: 'Tréso société' },
        { key: 'remainingDebt', label: 'CRD' },
        { key: 'partValue', label: 'Valeur parts' },
        { key: 'netWorth', label: 'Valeur nette' }
      ];
    })();
    return (
      // Sticky header/column requirements
      <div className="relative max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-slate-300">
          {[
            ['essential', 'Essentiel'],
            ['fiscal', 'Fiscal'],
            ['credit', 'Crédit'],
            ['valuation', 'Valorisation']
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTableView(value as typeof tableView)}
              className={`rounded-full px-3 py-1 ${
                tableView === value ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <table className="min-w-max w-full text-sm text-slate-100 whitespace-nowrap">
          <thead className="sticky top-0 z-20 bg-slate-900 text-xs uppercase tracking-wider text-slate-200 shadow-sm">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left border-b border-white/10 ${
                    column.key === 'year'
                      ? 'sticky left-0 z-30 bg-slate-900'
                      : ''
                  }`}
                  title={
                    column.key === 'netWorth'
                      ? 'Valeur parts + trésorerie (perso + société) - dette. Hors impôt de sortie.'
                      : undefined
                  }
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.years.map(row => (
              <tr key={`${label}-${row.year}`} className="border-t border-white/5">
                {columns.map(column => {
                  if (column.key === 'year') {
                    return (
                      <td key={column.key} className="px-4 py-2 sticky left-0 z-10 bg-slate-950 text-left font-medium">
                        {row.year}
                      </td>
                    );
                  }
                  if (column.key === 'revenues') return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(row.revenues.toFixed(0)))}</td>;
                  if (column.key === 'interest') return <td key={column.key} className="px-4 py-2 text-right min-w-[110px]">{formatEuroSafe(Number(row.interest.toFixed(0)))}</td>;
                  if (column.key === 'principalPaid') return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(row.principalPaid.toFixed(0)))}</td>;
                  if (column.key === 'charges') return <td key={column.key} className="px-4 py-2 text-right min-w-[110px]">{formatEuroSafe(Number(row.charges.toFixed(0)))}</td>;
                  if (column.key === 'taxableBase') return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(row.taxableBase.toFixed(0)))}</td>;
                  if (column.key === 'ir') return <td key={column.key} className="px-4 py-2 text-right min-w-[90px]">{formatEuroSafe(Number(row.ir.toFixed(0)))}</td>;
                  if (column.key === 'ps') return <td key={column.key} className="px-4 py-2 text-right min-w-[90px]">{formatEuroSafe(Number(row.ps.toFixed(0)))}</td>;
                  if (column.key === 'is') return <td key={column.key} className="px-4 py-2 text-right min-w-[90px]">{formatEuroSafe(Number(row.is.toFixed(0)))}</td>;
                  if (column.key === 'pfu') return <td key={column.key} className="px-4 py-2 text-right min-w-[90px]">{formatEuroSafe(Number(row.pfu.toFixed(0)))}</td>;
                  if (column.key === 'netPersonal') return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(row.netPersonal.toFixed(0)))}</td>;
                  if (column.key === 'cashCompany') return <td key={column.key} className="px-4 py-2 text-right min-w-[140px]">{formatEuroSafe(Number(row.cashCompany.toFixed(0)))}</td>;
                  if (column.key === 'remainingDebt') return <td key={column.key} className="px-4 py-2 text-right min-w-[110px]">{formatEuroSafe(Number(row.remainingDebt.toFixed(0)))}</td>;
                  if (column.key === 'partValue') return <td key={column.key} className="px-4 py-2 text-right min-w-[130px]">{formatEuroSafe(Number(row.partValue.toFixed(0)))}</td>;
                  if (column.key === 'netWorth') return <td key={column.key} className="px-4 py-2 text-right min-w-[140px]">{formatEuroSafe(Number(row.netWorth.toFixed(0)))}</td>;
                  if (column.key === 'personalTaxes') {
                    const personalTaxes = row.taxBreakdown.personalIR
                      .plus(row.taxBreakdown.personalPS)
                      .plus(row.taxBreakdown.personalPFU);
                    return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(personalTaxes.toFixed(0)))}</td>;
                  }
                  if (column.key === 'corporateTaxes') {
                    const corporateTaxes = row.taxBreakdown.corporateIS.plus(row.taxBreakdown.corporateISOnCapitalGain);
                    return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(Number(corporateTaxes.toFixed(0)))}</td>;
                  }
                  if (column.key === 'latentPV') {
                    const latent = Number(row.partValue.toFixed(0)) - priceOfReturn;
                    return <td key={column.key} className="px-4 py-2 text-right min-w-[120px]">{formatEuroSafe(latent)}</td>;
                  }
                  if (column.key === 'exitTax') {
                    const value = row.year === data.years.length ? exitTaxEstimate : 0;
                    return <td key={column.key} className="px-4 py-2 text-right min-w-[130px]">{formatEuroSafe(value)}</td>;
                  }
                  return <td key={column.key} className="px-4 py-2">-</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="impact-fiscal-page min-h-screen bg-slate-950 text-white">
      <style>{`
        .impact-fiscal-page input[type="text"],
        .impact-fiscal-page input[type="search"] {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .impact-fiscal-page input[type="text"]::placeholder,
        .impact-fiscal-page input[type="search"]::placeholder {
          color: #94a3b8 !important;
        }
        .impact-fiscal-page header,
        .impact-fiscal-page header * {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .impact-fiscal-page .impact-header {
          position: static !important;
          top: auto !important;
        }
      `}</style>
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <header className="impact-header space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Impact fiscal SCPI</p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Direct IR vs SCI IR vs SCI IS vs Holding IS
          </h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Comparateur fiscal structuré : hypothèses explicites, calculs auditables, lecture pédagogique sans
            recommandation.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <button
            onClick={() => setMode('simple')}
            className={`rounded-full px-3 py-1 ${mode === 'simple' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5'}`}
          >
            Mode simple
          </button>
          <button
            onClick={() => setMode('expert')}
            className={`rounded-full px-3 py-1 ${mode === 'expert' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5'}`}
          >
            Mode expert
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-24">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">1. Hypothèses SCPI</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Montant investi (€)
                <input
                  type="number"
                  value={inputs.investedAmount}
                  onChange={event => update('investedAmount', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Rendement annuel brut (%)
                <input
                  type="number"
                  value={inputs.annualYieldRate * 100}
                  onChange={event => update('annualYieldRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Revalorisation annuelle (%)
                <input
                  type="number"
                  value={inputs.annualRevaluationRate * 100}
                  onChange={event => update('annualRevaluationRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              {mode === 'expert' && (
                <>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Frais de souscription (%)
                    <input
                      type="number"
                      value={inputs.subscriptionFeeRate * 100}
                      onChange={event => update('subscriptionFeeRate', Number(event.target.value || 0) / 100)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Frais de cession (%)
                    <input
                      type="number"
                      value={inputs.exitFeeRate * 100}
                      onChange={event => update('exitFeeRate', Number(event.target.value || 0) / 100)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Frais de gestion annuels (%)
                    <input
                      type="number"
                      value={inputs.annualManagementFeeRate * 100}
                      onChange={event => update('annualManagementFeeRate', Number(event.target.value || 0) / 100)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Indexation rendement (%)
                    <input
                      type="number"
                      value={inputs.annualIndexationRate * 100}
                      onChange={event => update('annualIndexationRate', Number(event.target.value || 0) / 100)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                </>
              )}
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Horizon (années)
                <input
                  type="number"
                  value={inputs.years}
                  onChange={event => update('years', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">2. Crédit</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Montant emprunté (€)
                <input
                  type="number"
                  value={inputs.loanAmount}
                  onChange={event => update('loanAmount', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Durée crédit (années)
                <input
                  type="number"
                  value={inputs.loanYears}
                  onChange={event => update('loanYears', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Taux crédit (%)
                <input
                  type="number"
                  value={inputs.loanRate * 100}
                  onChange={event => update('loanRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              {mode === 'expert' && (
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Assurance emprunteur (%)
                  <input
                    type="number"
                    value={inputs.loanInsuranceRate * 100}
                    onChange={event => update('loanInsuranceRate', Number(event.target.value || 0) / 100)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  />
                </label>
              )}
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Apport (€)
                <input
                  type="number"
                  value={inputs.equity}
                  onChange={event => update('equity', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">3. Profil fiscal</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                TMI (%)
                <input
                  type="number"
                  value={inputs.tmiRate * 100}
                  onChange={event => update('tmiRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Prélèvements sociaux (%)
                <input
                  type="number"
                  value={inputs.socialRate * 100}
                  onChange={event => update('socialRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                PFU (%)
                <input
                  type="number"
                  value={inputs.pfuRate * 100}
                  onChange={event => update('pfuRate', Number(event.target.value || 0) / 100)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
              {mode === 'expert' && (
                <>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Crédit d'impôt étranger (%)
                    <input
                      type="number"
                      value={inputs.foreignTaxCreditRate * 100}
                      onChange={event => update('foreignTaxCreditRate', Number(event.target.value || 0) / 100)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                    />
                  </label>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={inputs.allowReducedIS}
                      onChange={event => update('allowReducedIS', event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-slate-900"
                    />
                    Appliquer le taux IS réduit (conditions simplifiées)
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">4. Frais structure</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Frais compta annuels (€)
                <input
                  type="number"
                  value={inputs.accountingFeesAnnual}
                  onChange={event => update('accountingFeesAnnual', Number(event.target.value || 0))}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">5. Distribution</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Politique de distribution
                <select
                  value={inputs.distributionPolicy.type}
                  onChange={event => {
                    const value = event.target.value;
                    if (value === 'rate') {
                      update('distributionPolicy', { type: 'rate', rate: 0.5 });
                      return;
                    }
                    update('distributionPolicy', { type: value as 'cover_annuity' | 'cover_taxes' });
                  }}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="rate">Taux fixe</option>
                  <option value="cover_annuity">Couvrir l'annuité</option>
                  <option value="cover_taxes">Couvrir les impôts</option>
                </select>
              </label>
              {inputs.distributionPolicy.type === 'rate' && (
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Taux distribué (%)
                  <input
                    type="number"
                    value={inputs.distributionPolicy.rate * 100}
                    onChange={event =>
                      update('distributionPolicy', { type: 'rate', rate: Number(event.target.value || 0) / 100 })
                    }
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  />
                </label>
              )}
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Timing distribution
                <select
                  value={inputs.distributionTiming}
                  onChange={event => update('distributionTiming', event.target.value as 'annual' | 'end')}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="annual">Annuelle</option>
                  <option value="end">Uniquement à la fin</option>
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">6. Sortie (SCI IS & Holding IS)</p>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Stratégie de sortie
                <select
                  value={inputs.exitPolicy}
                  onChange={event => update('exitPolicy', event.target.value as Inputs['exitPolicy'])}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="HOLD">Conservation (pas de sortie)</option>
                  <option value="SELL_ASSETS_DISTRIBUTE">Vente + distribution du cash</option>
                  <option value="SELL_SHARES">Cession des titres (simplifié)</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={inputs.exitDistributeAtEnd}
                  onChange={event => update('exitDistributeAtEnd', event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900"
                />
                Distribution finale
              </label>
              {inputs.exitDistributeAtEnd && (
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Taux distribué en sortie (%)
                  <input
                    type="number"
                    value={(inputs.exitDistributionRateAtEnd ?? 1) * 100}
                    onChange={event =>
                      update('exitDistributionRateAtEnd', Number(event.target.value || 0) / 100)
                    }
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  />
                </label>
              )}
              {inputs.exitPolicy === 'SELL_SHARES' && (
                <p className="text-xs text-slate-400">
                  Hypothèse simplifiée : PFU sur la plus-value de cession.
                </p>
              )}
            </div>

            {mode === 'expert' && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">7. Déficits</p>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Mode déficit
                  <select
                    value={inputs.deficitMode}
                    onChange={event => update('deficitMode', event.target.value as 'simplified' | 'strict')}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  >
                    <option value="simplified">Simplifié</option>
                    <option value="strict">Strict</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Plafond déficit global (€)
                  <input
                    type="number"
                    value={inputs.deficitGlobalCap}
                    onChange={event => update('deficitGlobalCap', Number(event.target.value || 0))}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  />
                </label>
              </div>
            )}

            <button
              onClick={handleExportPdf}
              className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-60"
              disabled={isPdfGenerating}
            >
              {isPdfGenerating ? 'Génération PDF…' : 'Exporter PDF comparatif'}
            </button>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includePdfDetails}
                onChange={event => setIncludePdfDetails(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              Inclure détails par scénario (PDF détaillé)
            </label>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={leadCaptureEnabled}
                  onChange={event => setLeadCaptureEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900"
                />
                Recevoir le PDF par email (optionnel)
              </label>
              {leadCaptureEnabled && (
                <div className="mt-3 space-y-2">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={event => setLeadEmail(event.target.value)}
                    placeholder="email@exemple.fr"
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  />
                  <p className="text-xs text-slate-400">
                    Fonctionnalité optionnelle non connectée par défaut.
                  </p>
                </div>
              )}
            </div>

            {!parsed.success && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {parsed.error.issues[0]?.message}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
              <div className="flex flex-wrap gap-3">
                <span>Invest: {formatEuro(inputs.investedAmount)}</span>
                <span>Crédit: {formatEuro(inputs.loanAmount)}</span>
                <span>Horizon: {inputs.years} ans</span>
                <span>Rendement: {(inputs.annualYieldRate * 100).toFixed(2)}%</span>
                <span>Revalo: {(inputs.annualRevaluationRate * 100).toFixed(2)}%</span>
                <span>TMI: {(inputs.tmiRate * 100).toFixed(0)}%</span>
                <span>PS: {(inputs.socialRate * 100).toFixed(1)}%</span>
                <span>PFU: {(inputs.pfuRate * 100).toFixed(1)}%</span>
                <span>Sortie: {exitPolicyLabels[inputs.exitPolicy] ?? 'Sortie : option personnalisée'}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                ['comparatif', 'Comparatif'],
                ['direct', 'Direct IR'],
                ['sciir', 'SCI IR'],
                ['sciis', 'SCI IS'],
                ['holding', 'Holding IS'],
                ['hypotheses', 'Hypothèses']
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value as typeof activeTab)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeTab === value ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5 text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'comparatif' && result && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {comparatifRows.map(row => (
                    <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <h3 className="text-lg font-semibold text-white">{row.label}</h3>
                      <p
                        className="text-sm text-slate-300"
                        title="Moyenne annuelle des flux nets vers la personne physique. Exclut la valeur finale."
                      >
                        {row.label === 'SCI IS' || row.label === 'Holding IS'
                          ? 'Cash vers perso (dividendes)'
                          : 'Cash net perso moyen'}
                      </p>
                      <p className="text-2xl font-semibold text-emerald-300">
                        {formatEuro(row.cashflowNetAvg)}
                      </p>
                      {(row.label === 'SCI IS' || row.label === 'Holding IS') && (
                        <p className="mt-2 text-sm text-slate-200">
                          Trésorerie en société (cumulée):{' '}
                          {formatEuro(Number(row.lastYear?.cashCompany.toFixed(0) ?? 0))}
                        </p>
                      )}
                      {(row.label === 'SCI IS' || row.label === 'Holding IS') &&
                        inputs.distributionPolicy.type === 'rate' &&
                        inputs.distributionPolicy.rate === 0 && (
                          <p className="mt-1 text-xs text-slate-400">
                            Distribution=0% ⇒ cash perso=0 par construction
                          </p>
                        )}
                      <div className="mt-4 grid gap-2 text-sm text-slate-200">
                        <div className="flex justify-between">
                          <span>Impôts perso cumulés</span>
                          <span>{formatEuro(row.taxesPersonal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impôts société cumulés</span>
                          <span>{formatEuro(row.taxesCorporate)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Total impôts</span>
                          <span>{formatEuro(row.taxesTotal)}</span>
                        </div>
                        {(row.label === 'SCI IS' || row.label === 'Holding IS') && row.lastYear && (
                          <>
                            <div className="flex justify-between">
                              <span>Trésorerie société cumulée</span>
                              <span>{formatEuro(Number(row.lastYear.cashCompany.toFixed(0)))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valeur parts (avant sortie)</span>
                              <span>{formatEuro(Number(row.lastYear.partValue.toFixed(0)))}</span>
                            </div>
                            {row.exit.policy !== 'HOLD' && (
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Impôt de sortie estimé</span>
                                <span>
                                  {formatEuro(
                                    Number(
                                      row.exit.corporateISOnExit
                                        .plus(row.exit.personalPFUOnExit)
                                        .plus(row.exit.personalCapitalGainTax)
                                        .toFixed(0)
                                    )
                                  )}
                                </span>
                              </div>
                            )}
                            {row.exit.policy === 'HOLD' && (
                              <div className="text-xs text-slate-400">
                                Capitalisation en société (pas de PFU final).
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-between">
                          <span title="Valeur parts + trésorerie (perso + société) - dette. Hors impôt de sortie.">
                            Valeur nette finale (hors impôt de sortie)
                          </span>
                          <span>{formatEuro(row.netWorthFinal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span title="TRI basé sur l'apport initial, flux nets perso et valeur finale nette.">
                            TRI net
                          </span>
                          <span>{row.irrNet ? formatPercent(row.irrNet) : 'NC'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400">Net annuel</h4>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {[
                        ['personal', 'Net perso'],
                        ['company', 'Net société'],
                        ['total', 'Net total']
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => setNetMetric(value as typeof netMetric)}
                          className={`rounded-full px-3 py-1 ${
                            netMetric === value ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                      </div>
                    </div>
                    <div className="mt-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={annualChart}>
                          <XAxis dataKey="year" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="directIR" name="Direct IR" stroke="#22c55e" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="sciIR" name="SCI IR" stroke="#38bdf8" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="sciIS" name="SCI IS" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="holdingIS" name="Holding IS" stroke="#a855f7" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h4 className="text-sm uppercase tracking-[0.3em] text-slate-400">Impôts cumulés</h4>
                    <div className="mt-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taxesChart}>
                          <XAxis dataKey="label" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="personal" stackId="taxes" fill="#22c55e" name="Impôts perso" />
                          <Bar dataKey="corporate" stackId="taxes" fill="#0ea5e9" name="Impôts société" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                  <h4 className="text-sm uppercase tracking-[0.3em] text-slate-400">Contrôles de cohérence</h4>
                  <div className="mt-3 grid gap-2">
                    {checks.map((check, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{check.label}</span>
                        <span className={check.status === null ? 'text-slate-500' : check.status ? 'text-emerald-300' : 'text-amber-300'}>
                          {check.status === null ? 'n/a' : check.status ? 'OK' : 'À vérifier'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'direct' && result && renderDetailTable('direct', result.directIR)}
            {activeTab === 'sciir' && result && renderDetailTable('sciir', result.sciIR)}
            {activeTab === 'sciis' && result && renderDetailTable('sciis', result.sciIS)}
            {activeTab === 'holding' && result && renderDetailTable('holding', result.holdingIS)}

            {activeTab === 'hypotheses' && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                <h3 className="text-lg font-semibold text-white">Hypothèses & limites</h3>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Le Z-score n'intervient pas dans ce simulateur.</li>
                  <li>Le rendement et la revalorisation sont supposés constants sur la période.</li>
                  <li>Les frais de souscription sont capitalisés dans le prix de revient.</li>
                  <li>Les parts de SCPI ne sont pas amorties en SCI IS/Holding (actif financier).</li>
                  <li>Les barèmes d'abattement sur plus-value sont paramétrés par année fiscale.</li>
                  <li>Le calcul reste informatif, sans recommandation d'investissement.</li>
                </ul>
                <button
                  onClick={() => setShowAuditTrail(prev => !prev)}
                  className="rounded-lg border border-emerald-400/40 px-4 py-2 text-sm text-emerald-200"
                >
                  {showAuditTrail ? 'Masquer le détail du calcul' : 'Voir le détail du calcul'}
                </button>
                {showAuditTrail && (
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p>Revenus SCPI = Valeur parts × Rendement brut annuel</p>
                    <p>Revenus nets = Revenus SCPI – Charges – Intérêts – Assurance – Impôts</p>
                    <p>IS = Résultat fiscal × taux IS (taux réduit optionnel)</p>
                    <p>PFU = Dividendes distribués × taux PFU</p>
                    <p>Plus-value = Prix de vente – Prix de revient (incluant frais)</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
