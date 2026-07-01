import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, Building2, Euro, Clock, Percent,
  BarChart3, Shield, AlertTriangle, ChevronDown, ArrowRight,
  Landmark, FileText,
} from 'lucide-react';
import {
  HoldingISInputs,
  HoldingISResult,
  HoldingISYearProjection,
  calculateHoldingISProjection,
} from '../../utils/holdingSimulation';

/* ── Constantes ── */

const COMPANY_TYPES: HoldingISInputs['companyType'][] = ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre'];
const DURATION_OPTIONS = [3, 5, 7, 10];

const DEFAULT_INPUTS: HoldingISInputs = {
  dossierName: '',
  companyType: 'SAS',
  availableCash: 250_000,
  preTaxProfit: 100_000,
  reducedRateEligible: true,
  usufruitInvestment: 100_000,
  usufruitDuration: 5,
  usufruitKeyPercent: 22,
  grossYieldRate: 6.5,
  revalorizationRate: 0,
};

/* ── Helpers formatage ── */

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';

const fmtNumber = (v: number) =>
  new Intl.NumberFormat('fr-FR').format(v);

/* ── Composant ── */

const ExpertHoldingSimulator: React.FC = () => {
  const [inputs, setInputs] = useState<HoldingISInputs>({ ...DEFAULT_INPUTS });
  const [showProjection, setShowProjection] = useState(false);

  const result: HoldingISResult = useMemo(
    () => calculateHoldingISProjection(inputs),
    [inputs]
  );

  const updateInput = <K extends keyof HoldingISInputs>(key: K, value: HoldingISInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Rendu ── */
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Simulateur
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Simulateur Holding IS
        </h1>
        <p className="text-slate-400 max-w-3xl">
          Chiffrage société — trésorerie, usufruit temporaire SCPI et fiscalité IS.
          Simulez l'impact d'un investissement en usufruit temporaire via une société à l'IS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Panneau de saisie ── */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 sticky top-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Paramètres
            </h2>

            {/* Dossier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nom du dossier
              </label>
              <input
                type="text"
                value={inputs.dossierName ?? ''}
                onChange={(e) => updateInput('dossierName', e.target.value || undefined)}
                placeholder="Ex: SCI Dupont SCPI"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600/50 transition-colors"
              />
            </div>

            {/* Type société */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Type de société
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {COMPANY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => updateInput('companyType', t)}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${
                      inputs.companyType === t
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Trésorerie + Résultat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Trésorerie dispo.
                </label>
                <input
                  type="number"
                  value={inputs.availableCash}
                  onChange={(e) => updateInput('availableCash', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Résultat fiscal avant
                </label>
                <input
                  type="number"
                  value={inputs.preTaxProfit}
                  onChange={(e) => updateInput('preTaxProfit', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                />
              </div>
            </div>

            {/* Taux réduit IS */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.reducedRateEligible}
                  onChange={(e) => updateInput('reducedRateEligible', e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-xs text-slate-300">Éligible taux réduit IS (15% / 25%)</span>
              </label>
            </div>

            {/* Usufruit */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Usufruit temporaire</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Montant investi en usufruit (€)
                </label>
                <input
                  type="number"
                  value={inputs.usufruitInvestment}
                  onChange={(e) => updateInput('usufruitInvestment', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Durée (ans)
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateInput('usufruitDuration', d)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                          inputs.usufruitDuration === d
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Clé usufruit (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.usufruitKeyPercent}
                    onChange={(e) => updateInput('usufruitKeyPercent', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Taux distribution + Revalorisation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Taux distrib. brut (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.grossYieldRate}
                  onChange={(e) => updateInput('grossYieldRate', Math.min(20, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Revalo. revenus (%)
                </label>
                <input
                  type="number"
                  value={inputs.revalorizationRate}
                  onChange={(e) => updateInput('revalorizationRate', Math.min(10, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Résultats ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<Building2 className="w-4 h-4" />}
              label="Pleine propriété reconstituée"
              value={fmtEuro(result.reconstitutedFullProperty)}
              color="blue"
            />
            <KpiCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Revenus bruts annuels"
              value={fmtEuro(result.annualGrossIncome)}
              color="violet"
            />
            <KpiCard
              icon={<Clock className="w-4 h-4" />}
              label="Amortissement annuel"
              value={fmtEuro(result.annualAmortization)}
              color="amber"
            />
            <KpiCard
              icon={<Percent className="w-4 h-4" />}
              label="Rendement net société"
              value={fmtPercent(result.netCompanyYield)}
              color="emerald"
            />
          </div>

          {/* IS Impact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Résultat fiscal opération"
              value={fmtEuro(result.annualFiscalResultOperation)}
              color="orange"
            />
            <KpiCard
              icon={<Shield className="w-4 h-4" />}
              label="IS avant opération"
              value={fmtEuro(result.annualISBeforeOperation)}
              color="slate"
            />
            <KpiCard
              icon={<Shield className="w-4 h-4" />}
              label="IS après opération"
              value={fmtEuro(result.annualISAfterOperation)}
              color="red"
            />
            <KpiCard
              icon={<Calculator className="w-4 h-4" />}
              label="Impact IS annuel"
              value={'+' + fmtEuro(result.annualISImpact)}
              highlight={result.annualISImpact > 0}
            />
          </div>

          {/* Cash-flow */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              icon={<Euro className="w-4 h-4" />}
              label="Cash-flow net annuel"
              value={fmtEuro(result.annualNetCashFlow)}
              color="emerald"
              large
            />
            <KpiCard
              icon={<BarChart3 className="w-4 h-4" />}
              label="Cash-flow net cumulé (durée {inputs.usufruitDuration} ans)"
              value={fmtEuro(result.cumulativeNetCashFlow)}
              color="emerald"
              large
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Simulation indicative.</strong> Les hypothèses fiscales, comptables et financières
              doivent être validées par l'expert-comptable selon la situation réelle de la société.
              L'outil ne constitue ni un conseil fiscal, ni une recommandation d'investissement,
              ni une déclaration d'adéquation.
            </p>
          </div>

          {/* Projection annuelle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowProjection(!showProjection)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-white">
                  Projection annuelle
                </span>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({result.projections.length} ans)
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showProjection ? 'rotate-180' : ''}`}
              />
            </button>
            {showProjection && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50">
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Année</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Revenus bruts</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Amort.</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Résultat fiscal</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS avant</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS après</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Impact IS</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Cash-flow net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {result.projections.map((row, i) => (
                      <tr key={row.year} className={`${i % 2 === 0 ? 'bg-slate-900/30' : ''} hover:bg-slate-800/30 transition-colors`}>
                        <td className="py-2 px-3 font-semibold text-slate-200">Année {row.year}</td>
                        <td className="py-2 px-3 text-right text-violet-400 font-medium">{fmtNumber(row.grossIncome)} €</td>
                        <td className="py-2 px-3 text-right text-amber-400">{fmtNumber(row.amortization)} €</td>
                        <td className="py-2 px-3 text-right text-slate-200">{fmtNumber(row.fiscalResultOperation)} €</td>
                        <td className="py-2 px-3 text-right text-slate-500">{fmtNumber(row.isBeforeOperation)} €</td>
                        <td className="py-2 px-3 text-right text-red-400">{fmtNumber(row.isAfterOperation)} €</td>
                        <td className={`py-2 px-3 text-right font-semibold ${row.isImpact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>+{fmtNumber(row.isImpact)} €</td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-400">{fmtNumber(row.netCashFlow)} €</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-700 bg-slate-950/50 font-semibold">
                      <td className="py-2.5 px-3 text-slate-200">Cumul</td>
                      <td className="py-2.5 px-3 text-right text-slate-300" colSpan={6}></td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 text-sm">
                        {fmtEuro(result.cumulativeNetCashFlow)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sous-composant KPI Card ── */

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'emerald' | 'violet' | 'blue' | 'amber' | 'red' | 'orange' | 'slate';
  highlight?: boolean;
  large?: boolean;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-600/20' },
  violet: { bg: 'bg-violet-600/10', text: 'text-violet-400', border: 'border-violet-600/20' },
  blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/20' },
  amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', border: 'border-amber-600/20' },
  red: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-600/20' },
  orange: { bg: 'bg-orange-600/10', text: 'text-orange-400', border: 'border-orange-600/20' },
  slate: { bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700/50' },
};

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, color = 'emerald', highlight, large }) => {
  const c = colorMap[color] ?? colorMap.emerald;
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 ${large ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={c.text}>{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={`font-bold ${large ? 'text-xl' : 'text-lg'} ${highlight ? 'text-red-400' : c.text}`}>
        {value}
      </p>
    </div>
  );
};

export default ExpertHoldingSimulator;
