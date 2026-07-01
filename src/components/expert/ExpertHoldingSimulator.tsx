import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, Building2, Euro, Percent,
  BarChart3, Shield, AlertTriangle, ChevronDown,
  Landmark, FileText, Info, ArrowRight, Table2, Receipt, Wallet,
} from 'lucide-react';
import {
  HoldingISInputs,
  HoldingISResult,
  FeesMode,
  FeesTreatment,
  calculateHoldingISProjection,
  calculateCorporateTax,
} from '../../utils/holdingSimulation';

/* ── Constantes ── */

const COMPANY_TYPES: HoldingISInputs['companyType'][] = ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre'];
const DURATION_OPTIONS = [3, 5, 7, 10, 12, 15];
const FEES_MODES: FeesMode[] = ['fixed', 'percentage'];
const FEES_TREATMENTS: FeesTreatment[] = ['not-integrated', 'deductible-year1', 'amortized', 'non-deductible'];

const FEES_TREATMENT_LABELS: Record<FeesTreatment, string> = {
  'not-integrated': 'Non intégré à la simulation',
  'deductible-year1': 'Charge déductible immédiate année 1',
  'amortized': 'Intégré au coût de l\'usufruit et amorti',
  'non-deductible': 'Non déductible / prudence',
};

const FEES_TREATMENT_SHORT: Record<FeesTreatment, string> = {
  'not-integrated': 'Non intégré',
  'deductible-year1': 'Déductible année 1',
  'amortized': 'Amorti sur la durée',
  'non-deductible': 'Non déductible',
};

const DEFAULT_INPUTS: HoldingISInputs = {
  dossierName: '',
  companyType: 'SAS',
  availableCash: 250_000,
  preTaxProfit: 100_000,
  reducedRateEligible: true,
  usufruitInvestment: 100_000,
  usufruitDuration: 10,
  usufruitKeyPercent: 35,
  grossYieldRate: 6.5,
  revalorizationRate: 0,
  feesEnabled: true,
  feesMode: 'fixed',
  feesFixedAmount: 3_000,
  feesPercentage: 3,
  feesTreatment: 'deductible-year1',
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
  const [showHypotheses, setShowHypotheses] = useState(false);

  const result: HoldingISResult = useMemo(
    () => calculateHoldingISProjection(inputs),
    [inputs]
  );

  const isSansOperation = useMemo(
    () => calculateCorporateTax(inputs.preTaxProfit, {
      reducedRateEligible: inputs.reducedRateEligible,
    }),
    [inputs.preTaxProfit, inputs.reducedRateEligible]
  );

  const updateInput = <K extends keyof HoldingISInputs>(key: K, value: HoldingISInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Simulateur</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Simulateur Holding IS</h1>
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
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors"
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
                        ? 'bg-blue-600 text-white'
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Rés. fiscal avant opér.
                </label>
                <input
                  type="number"
                  value={inputs.preTaxProfit}
                  onChange={(e) => updateInput('preTaxProfit', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
                />
              </div>
            </div>

            {/* Taux réduit IS */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Taux réduit IS PME</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.reducedRateEligible}
                  onChange={(e) => updateInput('reducedRateEligible', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-300">Appliquer le taux réduit IS PME</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                15 % jusqu'à 42 500 € de bénéfice, puis 25 %, sous conditions.
              </p>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Conditions à vérifier : CA HT ≤ 10 M€, capital entièrement libéré,
                    détention du capital conforme aux règles du taux réduit (détenu à 75 %
                    par des personnes physiques ou sociétés répondant à ces critères).
                    L'expert-comptable reste responsable de la validation.
                  </p>
                </div>
              </div>
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Durée (ans)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateInput('usufruitDuration', d)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                          inputs.usufruitDuration === d
                            ? 'bg-blue-600 text-white'
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors"
                />
              </div>
            </div>

            {/* ── Honoraires et frais de structuration ── */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-violet-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  Honoraires et frais de structuration
                </span>
              </div>

              {/* Activer */}
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.feesEnabled}
                  onChange={(e) => updateInput('feesEnabled', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-violet-600 focus:ring-violet-600"
                />
                <span className="text-xs text-slate-300">Activer les honoraires</span>
              </label>

              {inputs.feesEnabled && (
                <>
                  {/* Mode de calcul */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Mode de calcul
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FEES_MODES.map((m) => (
                        <button
                          key={m}
                          onClick={() => updateInput('feesMode', m)}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${
                            inputs.feesMode === m
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m === 'fixed' ? 'Montant fixe' : 'Pourcentage'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valeur */}
                  <div className={inputs.feesMode === 'fixed' ? '' : 'hidden'}>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Montant fixe (€)
                    </label>
                    <input
                      type="number"
                      value={inputs.feesFixedAmount}
                      onChange={(e) => updateInput('feesFixedAmount', Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors"
                    />
                  </div>
                  <div className={inputs.feesMode === 'percentage' ? '' : 'hidden'}>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Pourcentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.feesPercentage}
                      onChange={(e) => updateInput('feesPercentage', Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors"
                    />
                  </div>

                  {/* Traitement fiscal/comptable */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Traitement fiscal/comptable
                    </label>
                    <div className="space-y-1">
                      {FEES_TREATMENTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => updateInput('feesTreatment', t)}
                          className={`w-full text-left px-3 py-2 rounded text-[11px] transition ${
                            inputs.feesTreatment === t
                              ? 'bg-violet-600/20 border border-violet-600/30 text-violet-300'
                              : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {FEES_TREATMENT_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Résultats ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPIs - Ligne 1 : Structure */}
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
              icon={<Landmark className="w-4 h-4" />}
              label="Amortissement annuel"
              value={fmtEuro(result.annualAmortization)}
              color="amber"
              sublabel={result.amortizableBase !== inputs.usufruitInvestment ? `Base : ${fmtEuro(result.amortizableBase)}` : undefined}
            />
            <KpiCard
              icon={<Receipt className="w-4 h-4" />}
              label="Honoraires estimés"
              value={fmtEuro(result.feesAmount)}
              color={result.feesAmount > 0 ? 'violet' : 'slate'}
            />
          </div>

          {/* KPIs - Résultat fiscal */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <KpiCard
              icon={<Calculator className="w-4 h-4" />}
              label="Résultat fiscal de l'opération"
              value={fmtEuro(result.annualFiscalResultOperationOnly)}
              color="orange"
              sublabel={inputs.feesEnabled && inputs.feesTreatment === 'deductible-year1' ? 'Net des honoraires année 1' : 'Revenus − amortissement'}
            />
            <KpiCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Résultat fiscal avant opération"
              value={fmtEuro(inputs.preTaxProfit)}
              color="slate"
            />
            <KpiCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Résultat fiscal après opération"
              value={fmtEuro(result.annualFiscalResultAfterOperation)}
              color="orange"
              sublabel="Avant + opération"
            />
          </div>

          {/* KPIs - IS Impact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<Shield className="w-4 h-4" />}
              label="IS sans opération"
              value={fmtEuro(isSansOperation)}
              color="slate"
            />
            <KpiCard
              icon={<Shield className="w-4 h-4" />}
              label="IS avec opération"
              value={fmtEuro(result.annualISAfterOperation)}
              color="red"
            />
            <KpiCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Impact IS annuel"
              value={'+ ' + fmtEuro(result.annualISImpact)}
              highlight
            />
            <KpiCard
              icon={<Euro className="w-4 h-4" />}
              label="Cash-flow net annuel"
              value={fmtEuro(result.annualNetCashFlowAfterFees)}
              color="emerald"
              sublabel="Après honoraires"
            />
          </div>

          {/* Cash-flow + Rendement comparé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <KpiCard
              icon={<Wallet className="w-4 h-4" />}
              label="Effort de trésorerie total"
              value={fmtEuro(result.totalInvestment)}
              color="blue"
              sublabel="Usufruit + honoraires"
            />
            <KpiCard
              icon={<Percent className="w-4 h-4" />}
              label="Rendement net hors honoraires"
              value={fmtPercent(result.netCompanyYield)}
              color="emerald"
              sublabel={`Sur ${fmtEuro(inputs.usufruitInvestment)}`}
            />
            <KpiCard
              icon={<Percent className="w-4 h-4" />}
              label="Rendement net après honoraires"
              value={fmtPercent(result.netCompanyYieldAfterFees)}
              color="violet"
              sublabel={`Sur ${fmtEuro(result.totalInvestment)}`}
            />
          </div>

          {/* Cash-flow cumulé */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              icon={<BarChart3 className="w-4 h-4" />}
              label={`Cash-flow net cumulé (${inputs.usufruitDuration} ans)`}
              value={fmtEuro(result.cumulativeNetCashFlowAfterFees)}
              color="emerald"
              large
            />
            <KpiCard
              icon={<BarChart3 className="w-4 h-4" />}
              label={`Cash-flow cumulé hors honoraires`}
              value={fmtEuro(result.cumulativeNetCashFlow)}
              color="slate"
              large
            />
          </div>

          {/* ── Comparatif Avant / Après ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Table2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Comparatif avant / après opération</span>
              <span className="text-[10px] text-slate-500 ml-1">(année 1)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Indicateur</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Sans opération</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Avec opération</th>
                    <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Écart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <ComparatifRow
                    label="Résultat fiscal société"
                    before={inputs.preTaxProfit}
                    after={result.annualFiscalResultAfterOperation}
                    delta={result.annualFiscalResultAfterOperation - inputs.preTaxProfit}
                  />
                  <ComparatifRow
                    label="IS estimé"
                    before={isSansOperation}
                    after={result.annualISAfterOperation}
                    delta={result.annualISImpact}
                    deltaNeg
                  />
                  <ComparatifRow
                    label="Revenus bruts SCPI"
                    before={0}
                    after={result.annualGrossIncome}
                    delta={result.annualGrossIncome}
                  />
                  <ComparatifRow
                    label="Amortissement usufruit"
                    before={0}
                    after={result.annualAmortization}
                    delta={result.annualAmortization}
                    deltaNeg
                  />
                  {inputs.feesEnabled && (
                    <ComparatifRow
                      label={`Honoraires (${FEES_TREATMENT_SHORT[inputs.feesTreatment]})`}
                      before={0}
                      after={result.feesAmount}
                      delta={result.feesAmount}
                      deltaNeg
                    />
                  )}
                  <ComparatifRow
                    label="Cash-flow net société"
                    before={0}
                    after={result.annualNetCashFlowAfterFees}
                    delta={result.annualNetCashFlowAfterFees}
                    highlight
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Lecture expert-comptable ── */}
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Lecture expert-comptable</span>
            </div>
            <ul className="space-y-2 text-xs text-blue-100/80 leading-relaxed">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                L'opération génère un résultat fiscal additionnel de <strong>{fmtEuro(result.annualFiscalResultOperationOnly)}</strong> par an.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                L'impact IS estimé est de <strong>+{fmtEuro(result.annualISImpact)}</strong> par an.
              </li>
              {inputs.feesEnabled && result.feesAmount > 0 && (
                <>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    Les honoraires retenus dans la simulation représentent <strong>{fmtEuro(result.feesAmount)}</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    L'effort de trésorerie total ressort à <strong>{fmtEuro(result.totalInvestment)}</strong>.
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                Le cash-flow net société ressort à <strong>{fmtEuro(result.annualNetCashFlowAfterFees)}</strong> par an,
                soit <strong>{fmtPercent(result.netCompanyYieldAfterFees)}</strong> de l'effort total.
              </li>
              {inputs.feesEnabled && (
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                  Le traitement fiscal des honoraires (<em>{FEES_TREATMENT_SHORT[inputs.feesTreatment]}</em>) doit être validé
                  par le cabinet selon la nature exacte de la mission et les justificatifs disponibles.
                </li>
              )}
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                La validation comptable et fiscale reste nécessaire avant toute présentation client.
              </li>
            </ul>
          </div>

          {/* ── Hypothèses comptables ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHypotheses(!showHypotheses)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-white">Hypothèses comptables et fiscales</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showHypotheses ? 'rotate-180' : ''}`}
              />
            </button>
            {showHypotheses && (
              <div className="px-5 py-4 border-t border-slate-800">
                <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Usufruit temporaire amorti linéairement sur la durée retenue.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Aucune valeur résiduelle retenue à l'échéance de l'usufruit.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Revenus SCPI supposés constants sur la durée, sauf revalorisation renseignée.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Simulation hors frais spécifiques (frais de souscription, commission de gestion,
                    frais de tenue de compte), hors délais de jouissance et hors fiscalité étrangère,
                    sauf paramétrage ultérieur.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Taux d'IS : taux réduit PME (15 % / 25 %) ou taux normal (25 %) selon éligibilité déclarée.
                  </li>
                  {inputs.feesEnabled && (
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span className="text-violet-300/70">
                        Honoraires : {FEES_TREATMENT_LABELS[inputs.feesTreatment].toLowerCase()}.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* ── Projection annuelle ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowProjection(!showProjection)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-white">Projection annuelle</span>
                <span className="text-[10px] text-slate-500 ml-1">({result.projections.length} ans)</span>
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
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Année</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Revenus</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Amort.</th>
                      {inputs.feesEnabled && (
                        <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-violet-500 font-semibold text-right">Honor.</th>
                      )}
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rés. fiscal op.</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS sans</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS avec</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Impact IS</th>
                      <th className="py-2.5 px-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Cash-flow net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {result.projections.map((row, i) => (
                      <tr key={row.year} className={`${i % 2 === 0 ? 'bg-slate-900/30' : ''} hover:bg-slate-800/30 transition-colors`}>
                        <td className="py-2 px-2.5 font-semibold text-slate-200">A{row.year}</td>
                        <td className="py-2 px-2.5 text-right text-violet-400 font-medium">{fmtNumber(row.grossIncome)} €</td>
                        <td className="py-2 px-2.5 text-right text-amber-400">{fmtNumber(row.amortization)} €</td>
                        {inputs.feesEnabled && (
                          <td className={`py-2 px-2.5 text-right ${row.feesFiscal > 0 ? 'text-violet-400 font-medium' : 'text-slate-600'}`}>
                            {row.feesFiscal > 0 ? fmtNumber(row.feesFiscal) + ' €' : '—'}
                          </td>
                        )}
                        <td className="py-2 px-2.5 text-right text-orange-400">{fmtNumber(row.fiscalResultOperationOnly)} €</td>
                        <td className="py-2 px-2.5 text-right text-slate-500">{fmtNumber(row.isBeforeOperation)} €</td>
                        <td className="py-2 px-2.5 text-right text-red-400">{fmtNumber(row.isAfterOperation)} €</td>
                        <td className={`py-2 px-2.5 text-right font-semibold ${row.isImpact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          +{fmtNumber(row.isImpact)} €
                        </td>
                        <td className="py-2 px-2.5 text-right font-semibold text-emerald-400">
                          {fmtNumber(inputs.feesEnabled ? row.netCashFlowAfterFees : row.netCashFlow)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-700 bg-slate-950/50 font-semibold">
                      <td className="py-2.5 px-2.5 text-slate-200">Cumul</td>
                      <td className="py-2.5 px-2.5 text-right text-slate-300" colSpan={inputs.feesEnabled ? 7 : 6}></td>
                      <td className="py-2.5 px-2.5 text-right text-emerald-400 text-sm">
                        {fmtEuro(inputs.feesEnabled ? result.cumulativeNetCashFlowAfterFees : result.cumulativeNetCashFlow)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <strong>Simulation indicative.</strong> Les hypothèses fiscales, comptables et financières
                doivent être validées par l'expert-comptable selon la situation réelle de la société.
                L'outil ne constitue ni un conseil fiscal, ni une recommandation d'investissement,
                ni une déclaration d'adéquation.
              </p>
            </div>
            {inputs.feesEnabled && (
              <div className="flex items-start gap-3 border-t border-amber-900/30 pt-3">
                <Receipt className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  <strong>Honoraires.</strong> Le traitement des honoraires dépend de leur nature,
                  de leur justification, de leur rattachement à l'opération et de leur comptabilisation.
                  Le simulateur laisse ce paramétrage sous la responsabilité de l'expert-comptable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sous-composants ── */

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'emerald' | 'violet' | 'blue' | 'amber' | 'red' | 'orange' | 'slate';
  highlight?: boolean;
  large?: boolean;
  sublabel?: string;
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

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, color = 'emerald', highlight, large, sublabel }) => {
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
      {sublabel && (
        <p className="text-[10px] text-slate-600 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
};

interface ComparatifRowProps {
  label: string;
  before: number;
  after: number;
  delta: number;
  deltaNeg?: boolean;
  highlight?: boolean;
}

const ComparatifRow: React.FC<ComparatifRowProps> = ({ label, before, after, delta, deltaNeg, highlight }) => {
  const deltaPrefix = deltaNeg ? '−' : (delta >= 0 ? '+' : '');
  const deltaAbs = deltaNeg ? Math.abs(delta) : delta;
  const deltaFormatted = `${deltaPrefix}${fmtNumber(deltaAbs)} €`;
  const deltaColor = highlight ? 'text-emerald-400' : (delta >= 0 && !deltaNeg ? 'text-orange-400' : 'text-emerald-400');
  return (
    <tr className={highlight ? 'bg-emerald-950/20' : ''}>
      <td className={`py-2.5 px-4 ${highlight ? 'font-semibold text-white' : 'text-slate-300'}`}>{label}</td>
      <td className="py-2.5 px-4 text-right text-slate-500">{before > 0 ? fmtNumber(before) + ' €' : '0 €'}</td>
      <td className="py-2.5 px-4 text-right text-slate-200">{after > 0 ? fmtNumber(after) + ' €' : '0 €'}</td>
      <td className={`py-2.5 px-4 text-right font-semibold ${deltaColor}`}>{deltaFormatted}</td>
    </tr>
  );
};

export default ExpertHoldingSimulator;
